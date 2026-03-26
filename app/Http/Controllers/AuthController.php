<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|min:3|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password']
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Utente registrato con successo',
            'user' =>$user,
            'token' => $token
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if(!Auth::attempt($credentials)){
            return response()->json([
                'message' => 'Utente non presente o password errata'
            ], 401);
        }

        
        $user = Auth::user();
        // Invece di Auth::user(), recuperiamo l'utente direttamente dal database
        //usando l'email che abbiamo appena validato
        // $user = \App\Models\User::where('email', $credentials['email'])->first();
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'message' => 'Benvenuto',
            'user' => Auth::user(),
            'token' => $token
        ]);
    }

    public function logout(Request $request){
        $user = $request->user();
        $user->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout effettuato'
        ], 200);

    }
}
