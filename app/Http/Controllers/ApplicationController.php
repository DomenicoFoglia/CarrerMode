<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApplicationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //Recuperiamo l'utente
        $user = Auth::user();
        //Recuperiamo le candidature e carichiamo anche i tag
        $applications = $user->applications()->with('tags')->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $applications
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'offer_text' => 'nullable|string',
            'url' => 'nullable|url|max:500',
            'source' => 'nullable|string|max:100',
            'contract_type' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'salary_range' => 'nullable|string|max:100',
            'status' => 'required|in:sent,interview,waiting,rejected,draft',
            'interest_rating' => 'nullable|integer|min:1|max:5',
            'match_score' => 'nullable|integer|min:0|max:100',
            'notes' => 'nullable|string',
            'applied_at' => 'required|date',
            'tags' => 'nullable|array',
            'tags.*' => 'integer|exists:tags,id,user_id,' . Auth::id()
        ]);

        $user = Auth::user();

        $application = Auth::user()->applications()->create(
            collect($validated)->except('tags')->toArray()
        );

        // Se sono stati inviati dei tag, li colleghiamo nella tabella pivot
        if ($request->has('tags')) {
            $application->tags()->sync($validated['tags']);
        }

        return response()->json([
            'message' => 'Candidatura salvata con successo',
            'application' => $application->load('tags')
        ], 201); //201 -> creato
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = Auth::user();

        //Cerca la candidatura tra quelle dell'utente, se la trova la ritorna altrimenti, con 
        //la funzione findOrFail(), ritorna direttamente 404
        $application = $user->applications()->with('tags')->findOrFail($id);

        return response()->json([
            'message' => 'Candidatura trovata',
            'application' => $application
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = Auth::user();

        $application = $user->applications()->findOrFail($id);

        $validated = $request->validate([
            'company' => 'sometimes|required|string|max:255',
            'role' => 'sometimes|required|string|max:255',
            'offer_text' => 'nullable|string',
            'url' => 'nullable|url|max:500',
            'source' => 'nullable|string|max:100',
            'contract_type' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'salary_range' => 'nullable|string|max:100',
            'status' => 'sometimes|required|in:sent,interview,waiting,rejected,draft',
            'interest_rating' => 'nullable|integer|min:1|max:5',
            'match_score' => 'nullable|integer|min:0|max:100',
            'notes' => 'nullable|string',
            'applied_at' => 'sometimes|required|date',
            'tags' => 'nullable|array',
            'tags.*' => 'integer|exists:tags,id,user_id,' . Auth::id()
        ]);

        //Aggiorniamo
        $application->update(collect($validated)->except('tags')->toArray());

        //Sincronizziamo i tag. Usiamo un ternario perche' e' possibile che l'utente non inserisca i tag
        if ($request->has('tags')) {
            $application->tags()->sync($validated['tags'] ?? []);
        }

        return response()->json([
            'message' => 'Candidatura aggiornata con successo',
            'application' => $application->load('tags')
        ]);

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = Auth::user();

        $application = $user->applications()->findOrFail($id);

        $application->delete();

        return response()->json([
            'message' => 'Candidatura eliminata con successo'
        ], 200);
    }
}
