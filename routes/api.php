<?php

use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TagController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

//Rotte per le candidature
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