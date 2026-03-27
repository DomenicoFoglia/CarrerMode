<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
            'type' => 'required|in:cv,cover_letter',
            'file' => 'required|file|mimes:pdf,docx|max:5120'
        ]);

        $path = $request->file('file')->store('attachments/' . $application->id, 'local');

        $filename = $request->file('file')->getClientOriginalName();

        $size = $request->file('file')->getSize();

        $attachment = $application->attachments()->create([
            'type' => $validated['type'],
            'filename' => $filename,
            'path' => $path,
            'size' => $size
        ]);

        return response()->json([
            'message' => 'File caricato con successo',
            'attachment' => $attachment
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Attachment $attachment)
    {
        if($attachment->application->user_id !== Auth::id()){
            return response()->json(['message' => 'Non autorizzato'], 403);
        }

        return Storage::disk('local')->download($attachment->path, $attachment->filename);
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
    public function destroy(Attachment $attachment)
    {
        if($attachment->application->user_id !== Auth::id()){
            return response()->json(['message' => 'Non autorizzato'], 403);
        }

        Storage::disk('local')->delete($attachment->path);

        $attachment->delete();

        return response()->json(['message' => 'Allegato eliminato correttamente']);
    }
}
