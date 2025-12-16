<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
// Unified Logout (Works for both Staff and User)
Route::middleware('auth:sanctum')->post('logout', [\App\Http\Controllers\AuthController::class, 'logout']);

// Staff Authentication
Route::prefix('staff')->group(function () {
    Route::post('login', [\App\Http\Controllers\StaffAuthController::class, 'login']);
    Route::post('state/login', [\App\Http\Controllers\StaffAuthController::class, 'stateLogin']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('user', function (Request $request) {
            return $request->user();
        });
    });
});

// User Authentication
Route::prefix('user')->group(function () {
    Route::post('login', [\App\Http\Controllers\UserAuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', function (Request $request) {
            return $request->user();
        });
    });
});
