<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TagController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();

        $tags = $user->tags()->orderBy('name')->get();
        // $tags = $user->tags()->latest()->get();
        return response()->json([
            'message' => 'Elenco dei tag',
            'tags' => $tags
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:25|unique:tags,name,NULL,id,user_id,' . Auth::id(),
            'color' => 'sometimes|nullable|string|max:7'
        ]);

        $user = Auth::user();

        $tag = $user->tags()->create($validated);

        return response()->json([
            'message' => 'Tag creato con successo',
            'tag' => $tag
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // $user = Auth::user();

        // $tag= $user->tags()->findOrFail($id);

        Auth::user()->tags()->findOrFail($id)->delete();

        return response()->json([
            'message' => 'Tag eliminato con successo'
        ], 200);

    }
}
