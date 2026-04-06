<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Log;

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

        $user   = Auth::user();
        $cvText = $user->cv_text;

        if (!$cvText) {
            return response()->json([
                'message' => 'Inserisci il testo del tuo CV nelle impostazioni prima di usare questa funzione.'
            ], 422);
        }

        $prompt = <<<PROMPT
Sei un esperto recruiter italiano. Analizza questa offerta di lavoro e confrontala con il CV del candidato.

CV DEL CANDIDATO:
{$cvText}

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

        $response = $this->callGemini($prompt);

        if (!$response) {
            return response()->json(['message' => 'Errore nella chiamata a Gemini.'], 500);
        }

        $json = $this->extractJson($response);

        return response()->json($json);
    }

    public function generateCoverLetter(Request $request)
    {
        $validated = $request->validate([
            'offer_text' => 'required|string|min:50',
            'company'    => 'required|string',
            'role'       => 'required|string',
        ]);

        $user   = Auth::user();
        $cvText = $user->cv_text;

        if (!$cvText) {
            return response()->json([
                'message' => 'Inserisci il testo del tuo CV nelle impostazioni prima di usare questa funzione.'
            ], 422);
        }

        $prompt = <<<PROMPT
Sei un esperto nella scrittura di lettere di presentazione per candidature di lavoro in Italia.

CV DEL CANDIDATO:
{$cvText}

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

        $response = $this->callGemini($prompt);

        if (!$response) {
            return response()->json(['message' => 'Errore nella chiamata a Gemini.'], 500);
        }

        return response()->json(['cover_letter' => $response]);
    }

    private function callGemini(string $prompt): ?string
    {
        $response = Http::post("{$this->apiUrl}?key={$this->apiKey}", [
            'contents' => [
                ['parts' => [['text' => $prompt]]]
            ]
        ]);

        // Temporaneo per debug
        if (!$response->successful()) {
            Log::error('Gemini error: ' . $response->body());
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