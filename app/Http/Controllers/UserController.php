<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function updateTheme(Request $request){
        // $user = Auth::user();
        // Auth::user() restituisce un oggetto che a volte non ha il metodo update
        //Lo sostituiamo con:
        $user = \App\Models\User::find(Auth::id());

        $validated = $request->validate([
            'theme' => 'required|in:midnight,forest,ember,steel,crimson,violet,light,light-warm,light-green,royale'
        ]);

        $user->update(['theme' => $validated['theme']]);

        return response()->json(['theme' => $user->theme]);
    }

    public function updatePassword(Request $request){
        $user = \App\Models\User::find(Auth::id());

        //Avremmo potuto usare anche la pipeline | ma con l'array possiamo mescolare piu facilmente stringhe e oggetti
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::min(12)->mixedCase()->numbers()->symbols()],
        ]);

        if(!Hash::check($validated['current_password'], $user->password)){
            return response()->json([
                'message' => 'La password attuale non è corretta'
            ], 422);
        }

        $user->update([
            'password' => Hash::make($validated['password'])
        ]);

        return response()->json([
            'message' => 'Password aggiornata con successo!'
        ]);
    }

    public function updateGeminiKey(Request $request){
        $user = \App\Models\User::find(Auth::id());

        $validated = $request->validate([
            'gemini_api_key' => 'nullable|string|max:100',
        ]);

        //Cifratura
        $user->update([
            'gemini_api_key' => $validated['gemini_api_key'] ? encrypt($validated['gemini_api_key']) : null
        ]);

        return response()->json([
            'message' => 'Chiave API aggiornata con successo',
            'has_gemini_key' => !is_null($user->gemini_api_key)
        ]);
    }

    public function getGeminiKeyStatus()
    {
        $user = \App\Models\User::find(Auth::id());
        return response()->json([
            'has_gemini_key' => !is_null($user->gemini_api_key)
        ]);
    }

    public function updateName(Request $request)
    {
        $user = \App\Models\User::find(Auth::id());

        $validated = $request->validate([
            'name' => 'required|string|min:2|max:100',
        ]);

        $user->update(['name' => $validated['name']]);

        return response()->json([
            'message' => 'Nome aggiornato con successo',
            'user'    => $user
        ]);
    }

    public function completeOnboarding()
    {
        $user = \App\Models\User::find(Auth::id());
        $user->update(['onboarding_completed' => true]);
        return response()->json(['message' => 'Onboarding completato']);
    }

    public function resetOnboarding()
    {
        $user = \App\Models\User::find(Auth::id());
        $user->update(['onboarding_completed' => false]);
        return response()->json(['message' => 'Onboarding resettato']);
    }
}
