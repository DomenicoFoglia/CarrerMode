<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class AiController extends Controller
{
    private string $apiKey;
    private string $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key');
    }

    public function analyzeOffer(Request $request)
    {
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

        $response = $this->callGemini($prompt, $cvData);

        if (!$response) {
            return response()->json(['message' => 'Errore nella chiamata a Gemini.'], 500);
        }

        return response()->json($this->extractJson($response));
    }

    public function generateCoverLetter(Request $request)
    {
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

        $response = $this->callGemini($prompt, $cvData);

        if (!$response) {
            return response()->json(['message' => 'Errore nella chiamata a Gemini.'], 500);
        }

        return response()->json(['cover_letter' => $response]);
    }

    private function getCvData($user): ?array
    {
        // Prima cerca un CV allegato alla candidatura corrente
        // Poi cerca l'ultimo CV caricato dall'utente
        $attachment = \App\Models\Attachment::whereHas('application', function($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        ->where('type', 'cv')
        ->latest()
        ->first();

        if (!$attachment) {
            return null;
        }

        $fullPath = Storage::disk('local')->path($attachment->path);
        $extension = strtolower(pathinfo($attachment->filename, PATHINFO_EXTENSION));

        if ($extension === 'pdf') {
            return [
                'type' => 'pdf',
                'data' => base64_encode(file_get_contents($fullPath)),
                'mime' => 'application/pdf'
            ];
        }

        if ($extension === 'docx') {
            return [
                'type' => 'text',
                'data' => $this->extractDocxText($fullPath)
            ];
        }

        if ($extension === 'odt') {
            return [
                'type' => 'text',
                'data' => $this->extractOdtText($fullPath)
            ];
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
        // ODT è uno ZIP — estraiamo content.xml
        $zip = new \ZipArchive();
        if ($zip->open($path) === true) {
            $content = $zip->getFromName('content.xml');
            $zip->close();
            // Rimuoviamo i tag XML e teniamo solo il testo
            return strip_tags($content);
        }
        return '';
    }

    private function callGemini(string $prompt, ?array $cvData = null): ?string
    {
        $parts = [];

        // Se il CV è un PDF lo passiamo come file inline
        if ($cvData && $cvData['type'] === 'pdf') {
            $parts[] = [
                'inline_data' => [
                    'mime_type' => $cvData['mime'],
                    'data'      => $cvData['data']
                ]
            ];
        }

        // Se il CV è testo (DOCX/ODT) lo aggiungiamo come testo
        if ($cvData && $cvData['type'] === 'text') {
            $parts[] = ['text' => "CV DEL CANDIDATO:\n" . $cvData['data'] . "\n\n"];
        }

        $parts[] = ['text' => $prompt];

        $response = Http::post("{$this->apiUrl}?key={$this->apiKey}", [
            'contents' => [
                ['parts' => $parts]
            ]
        ]);

        if (!$response->successful()) {
            \Log::error('Gemini error: ' . $response->body());
            return null;
        }

        return $response->json('candidates.0.content.parts.0.text');
    }

    private function extractJson(string $text): array
    {
        $text = preg_replace('/```json|```/', '', $text);
        $text = trim($text);
        $decoded = json_decode($text, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return ['error' => 'Risposta non valida da Gemini'];
        }
        return $decoded;
    }
}