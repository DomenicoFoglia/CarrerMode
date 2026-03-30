<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Reminder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReminderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Recuperiamo i promemoria delle candidature che appartengono all'utente loggato
        $reminders = Reminder::whereHas('application', function ($query) {
            $query->where('user_id', Auth::id());
        })
        ->with('application:id,company') // Carichiamo solo l'id e il nome dell'azienda
        ->orderBy('remind_at', 'asc')
        ->get();

        return response()->json($reminders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Application $application)
    {
        if($application->user_id !== Auth::id()){
            return response()->json(['message' => 'Non autorizzato'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'remind_at' => 'required|date',
            'sent' => 'boolean'
        ]);

        $reminder = $application->reminders()->create($validated);

        return response()->json([
            'message' => 'Reminder creato con successo',
            'reminder' => $reminder
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $reminder = Reminder::findOrFail($id);

        if($reminder->application->user_id !== Auth::id()){
            return response()->json(['message' => 'Non autorizzato'], 403);
        }

        $validated = $request->validate([
            'application_id' => 'required|exists:applications,id',
            'title' => 'sometimes|required|string|max:255',
            'notes' => 'nullable|string',
            'remind_at' => 'sometimes|required|date',
            'sent' => 'boolean'
        ]);

        $reminder->update($validated);

        return response()->json([
            'message' => 'Reminder aggiornato con successo',
            'reminder' => $reminder->load('application')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $reminder = Reminder::findOrFail($id);
    
        if($reminder->application->user_id !== Auth::id()){
            return response()->json(['message' => 'Non autorizzato'], 403);
        }

        $reminder->delete();

        return response()->json([
            'message' => 'Reminder eliminato con successo'
        ], 200);
    }
}
