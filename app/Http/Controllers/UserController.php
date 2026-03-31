<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function updateTheme(Request $request){
        $user = Auth::user();

        $validated = $request->validate([
            'theme' => 'required|in:midnight,forest,ember,steel,crimson,violet'
        ]);

        $user->update(['theme' => $validated['theme']]);

        return response()->json(['theme' => $user->theme]);
    }

    public function updatePassword(Request $request){
        $user = Auth::user();

        //Avremmo potuto usare anche la pipeline | ma con l'array possiamo mescolare piu facilmente stringhe e oggetti
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::min(8)],
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
}
