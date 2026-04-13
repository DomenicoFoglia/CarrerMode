<?php

use App\Http\Controllers\AiController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

//Esporta dati
Route::get('/applications/export',[ApplicationController::class, 'export'])->middleware('auth:sanctum');

//Rotte per le candidature
Route::get('/applications/stats', [ApplicationController::class, 'stats'])->middleware('auth:sanctum');
Route::apiResource('applications', ApplicationController::class)->middleware('auth:sanctum');

//Registrazione
Route::post('/auth/register', [AuthController::class, 'register']);

//Login
Route::post('/auth/login', [AuthController::class, 'login']);

//Logout
//Usiamo il middleware perche' solo chi e' autenticato puo' vededre il logout
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

//Tags
Route::apiResource('tags', TagController::class)->only(['index', 'store', 'destroy'])->middleware('auth:sanctum');

//Reminders
Route::post('/applications/{application}/reminders', [ReminderController::class, 'store'])->middleware('auth:sanctum');
Route::put('/reminders/{reminder}', [ReminderController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/reminders/{reminder}', [ReminderController::class, 'destroy'])->middleware('auth:sanctum');
Route::get('/reminders', [ReminderController::class, 'index'])->middleware('auth:sanctum');

//Attachments
Route::post('/applications/{application}/attachments', [AttachmentController::class, 'store'])->middleware('auth:sanctum');
Route::get('/attachments/{attachment}', [AttachmentController::class, 'show'])->middleware('auth:sanctum');
Route::delete('/attachments/{attachment}', [AttachmentController::class, 'destroy'])->middleware('auth:sanctum');

//Opzioni Utente
Route::put('/user/theme', [UserController::class, 'updateTheme'])->middleware('auth:sanctum');
Route::put('/user/password', [UserController::class, 'updatePassword'])->middleware('auth:sanctum');

//Chiave Gemini
Route::put('/user/gemini-key',[UserController::class, 'updateGeminiKey'])->middleware('auth:sanctum');
Route::get('/user/gemini-key-status',[UserController::class, 'getGeminiKeyStatus'])->middleware('auth:sanctum');

//Chiamte Gemini
Route::post('/ai/analyze-offer',       [AiController::class, 'analyzeOffer'])->middleware(['auth:sanctum', 'throttle:10,1']);
Route::post('/ai/generate-cover-letter', [AiController::class, 'generateCoverLetter'])->middleware(['auth:sanctum', 'throttle:10,1']);

//Aggiorna nome utente
Route::put('/user/name', [UserController::class, 'updateName'])->middleware('auth:sanctum');

//Tutorial
Route::post('/user/onboarding-complete', [UserController::class, 'completeOnboarding'])->middleware('auth:sanctum');
Route::post('/user/onboarding-reset', [UserController::class, 'resetOnboarding'])->middleware('auth:sanctum');

// Provider AI e chiave Groq
Route::put('/user/ai-provider', [UserController::class, 'updateAiProvider'])->middleware('auth:sanctum');
Route::put('/user/groq-key', [UserController::class, 'updateGroqKey'])->middleware('auth:sanctum');
Route::get('/user/groq-key-status', [UserController::class, 'getGroqKeyStatus'])->middleware('auth:sanctum');