<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class AiController extends Controller
{
    private string $geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    private string $groqUrl   = 'https://api.groq.com/openai/v1/chat/completions';
    private string $groqModel = 'llama-3.3-70b-versatile';

    private function getUser()
    {
        return \App\Models\User::find(Auth::id());
    }

    private function getProvider(): string
    {
        return $this->getUser()->ai_provider ?? 'gemini';
    }

    private function getApiKey(?string $providerOverride = null): ?string
    {
        $user = $this->getUser();
        $provider = $providerOverride ?: ($user->ai_provider ?? 'gemini');

        $field = $provider === 'groq' ? 'groq_api_key' : 'gemini_api_key';

        if (!$user || !$user->$field) {
            return null;
        }

        try {
            return decrypt($user->$field);
        } catch (\Exception $e) {
            \Log::error("Decrypt {$provider} key failed: " . $e->getMessage());
            return null;
        }
    }

    public function analyzeOffer(Request $request)
    {
        $providerOverride = $request->input('provider_override');
        $provider = $providerOverride ?: $this->getProvider();
        $apiKey = $this->getApiKey($providerOverride);

        if (!$apiKey) {
            return response()->json([
                'message' => "Chiave API {$provider} non configurata. Aggiungila nelle impostazioni."
            ], 422);
        }

        $validated = $request->validate([
            'offer_text' => 'required|string|min:50',
        ]);

        $user = Auth::user();
        $cvData = $this->getCvData($user);

        if (!$cvData) {
            return response()->json([
                'message' => 'Nessun CV trovato. Carica un CV come allegato in almeno una candidatura.'
            ], 422);
        }

        $prompt = <<<PROMPT
Sei un esperto recruiter italiano. Analizza questa offerta di lavoro e confrontala con il CV del candidato.

OFFERTA DI LAVORO:
{$validated['offer_text']}

Rispondi SOLO con un oggetto JSON valido con questa struttura esatta, senza markdown e senza backtick:
{
    "match_score": numero da 0 a 100,
    "summary": "breve sintesi dell'offerta in 2-3 frasi",
    "strengths": ["punto di forza 1", "punto di forza 2", "punto di forza 3"],
    "gaps": ["lacuna 1", "lacuna 2"],
    "verdict": "breve giudizio finale di 1-2 frasi"
}
PROMPT;

        try {
            $response = $this->callAi($prompt, $cvData, $apiKey, $provider);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 503);
        }

        if (!$response) {
            return response()->json(['message' => 'Errore nella chiamata al provider AI.'], 500);
        }

        return response()->json($this->extractJson($response));
    }

    public function generateCoverLetter(Request $request)
    {
        $providerOverride = $request->input('provider_override');
        $provider = $providerOverride ?: $this->getProvider();
        $apiKey = $this->getApiKey($providerOverride);

        if (!$apiKey) {
            return response()->json([
                'message' => "Chiave API {$provider} non configurata. Aggiungila nelle impostazioni."
            ], 422);
    }

        $validated = $request->validate([
            'offer_text' => 'required|string|min:50',
            'company'    => 'required|string',
            'role'       => 'required|string',
        ]);

        $user = Auth::user();
        $cvData = $this->getCvData($user);

        if (!$cvData) {
            return response()->json([
                'message' => 'Nessun CV trovato. Carica un CV come allegato in almeno una candidatura.'
            ], 422);
        }

        $prompt = <<<PROMPT
Sei un esperto nella scrittura di lettere di presentazione per candidature di lavoro in Italia.

OFFERTA DI LAVORO:
Azienda: {$validated['company']}
Ruolo: {$validated['role']}
Descrizione: {$validated['offer_text']}

Scrivi una lettera di presentazione professionale in italiano, in prima persona, di circa 250-300 parole.
La lettera deve essere personalizzata per questa specifica offerta, evidenziare i punti di forza del candidato
rispetto ai requisiti richiesti, e avere un tono professionale ma non eccessivamente formale.
Non usare frasi banali come "sono lieto di candidarmi". Sii diretto e concreto.
Rispondi SOLO con il testo della lettera, senza intestazioni, senza oggetto e senza firma.
PROMPT;

        try {
            $response = $this->callAi($prompt, $cvData, $apiKey, $provider);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 503);
        }

        if (!$response) {
            return response()->json(['message' => 'Errore nella chiamata al provider AI.'], 500);
        }

        return response()->json(['cover_letter' => $response]);
    }

    private function callAi(string $prompt, ?array $cvData, string $apiKey, string $provider): ?string
    {
        if ($provider === 'groq') {
            return $this->callGroq($prompt, $cvData, $apiKey);
        }

        return $this->callGemini($prompt, $cvData, $apiKey);
    }

    private function callGemini(string $prompt, ?array $cvData, string $apiKey): ?string
    {
        $parts = [];

        if ($cvData && $cvData['type'] === 'pdf') {
            $parts[] = [
                'inline_data' => [
                    'mime_type' => $cvData['mime'],
                    'data'      => $cvData['data']
                ]
            ];
        }

        if ($cvData && $cvData['type'] === 'text') {
            $parts[] = ['text' => "CV DEL CANDIDATO:\n" . $cvData['data'] . "\n\n"];
        }

        $parts[] = ['text' => $prompt];

        $response = Http::post("{$this->geminiUrl}?key={$apiKey}", [
            'contents' => [['parts' => $parts]]
        ]);

        if (!$response->successful()) {
            $code    = $response->json('error.code') ?? 500;
            $message = $response->json('error.message') ?? 'Errore sconosciuto';

            if ($code === 503) {
                \Log::warning('Gemini sovraccarico (503)');
                throw new \Exception('Gemini è temporaneamente sovraccarico. Riprova tra qualche minuto.');
            }

            \Log::error('Gemini error: ' . $response->body());
            throw new \Exception('Errore Gemini: ' . $message);
        }

        return $response->json('candidates.0.content.parts.0.text');
    }

    private function callGroq(string $prompt, ?array $cvData, string $apiKey): ?string
    {
        $messages = [];

        if ($cvData) {
            if ($cvData['type'] === 'text') {
                $cvText = $cvData['data'];
            } elseif ($cvData['type'] === 'pdf') {
                // Estrae il testo dal PDF con smalot/pdfparser
                try {
                    $parser  = new \Smalot\PdfParser\Parser();
                    $user    = \App\Models\User::find(Auth::id());
                    $attachment = \App\Models\Attachment::whereHas('application', function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    })->where('type', 'cv')->latest()->first();

                    $fullPath = \Illuminate\Support\Facades\Storage::disk('local')->path($attachment->path);
                    $pdf     = $parser->parseFile($fullPath);
                    $cvText  = $pdf->getText();
                } catch (\Exception $e) {
                    \Log::warning('Groq PDF parse failed: ' . $e->getMessage());
                    $cvText = 'CV allegato in formato PDF (estrazione testo non riuscita).';
                    \Log::info('CV text passed to Groq: ' . substr($cvText, 0, 500));
                }
            } else {
                $cvText = '';
            }

            $messages[] = [
                'role'    => 'user',
                'content' => "CV DEL CANDIDATO:\n" . $cvText
            ];
        }

        $messages[] = [
            'role'    => 'user',
            'content' => $prompt
        ];

        $response = Http::withToken($apiKey)->post($this->groqUrl, [
            'model'       => $this->groqModel,
            'messages'    => $messages,
            'temperature' => 0.3,
        ]);

        if (!$response->successful()) {
            $message = $response->json('error.message') ?? 'Errore sconosciuto';
            \Log::error('Groq error: ' . $response->body());
            throw new \Exception('Errore Groq: ' . $message);
        }

        return $response->json('choices.0.message.content');
    }

    private function getCvData($user): ?array
    {
        // Prima cerca un CV allegato alla candidatura corrente
        // Poi cerca l'ultimo CV caricato dall'utente
        $attachment = \App\Models\Attachment::whereHas('application', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        ->where('type', 'cv')
        ->latest()
        ->first();

        if (!$attachment) {
            return null;
        }

        $fullPath  = Storage::disk('local')->path($attachment->path);
        $extension = strtolower(pathinfo($attachment->filename, PATHINFO_EXTENSION));

        if ($extension === 'pdf') {
            return [
                'type' => 'pdf',
                'data' => base64_encode(file_get_contents($fullPath)),
                'mime' => 'application/pdf'
            ];
        }

        if ($extension === 'docx') {
            return ['type' => 'text', 'data' => $this->extractDocxText($fullPath)];
        }

        if ($extension === 'odt') {
            return ['type' => 'text', 'data' => $this->extractOdtText($fullPath)];
        }

        return null;
    }

    private function extractDocxText(string $path): string
    {
        $phpWord = \PhpOffice\PhpWord\IOFactory::load($path);
        $text = '';
        foreach ($phpWord->getSections() as $section) {
            foreach ($section->getElements() as $element) {
                if (method_exists($element, 'getText')) {
                    $text .= $element->getText() . "\n";
                } elseif (method_exists($element, 'getElements')) {
                    foreach ($element->getElements() as $child) {
                        if (method_exists($child, 'getText')) {
                            $text .= $child->getText() . "\n";
                        }
                    }
                }
            }
        }
        return $text;
    }

    private function extractOdtText(string $path): string
    {
        // ODT è uno ZIP, estraiamo content.xml
        $zip = new \ZipArchive();
        if ($zip->open($path) === true) {
            $content = $zip->getFromName('content.xml');
            $zip->close();
            // Rimuoviamo i tag XML e teniamo solo il testo
            return strip_tags($content);
        }
        return '';
    }

    private function extractJson(string $text): array
    {
        $text    = preg_replace('/```json|```/', '', $text);
        $text    = trim($text);
        $decoded = json_decode($text, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return ['error' => 'Risposta non valida dal provider AI'];
        }
        return $decoded;
    }
}