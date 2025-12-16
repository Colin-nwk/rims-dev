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
    
    // Public ID Card lookup (for QR code generation)
    Route::get('id-card/{serviceNo}', [\App\Http\Controllers\StaffController::class, 'idCard']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('user', function (Request $request) {
            return $request->user();
        });
    });
});

// Admin / Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('staff', \App\Http\Controllers\StaffController::class);
});

// User Authentication
Route::prefix('user')->group(function () {
    Route::post('login', [\App\Http\Controllers\UserAuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', function (Request $request) {
            return $request->user();
        });
        
        // User CRUD
        Route::apiResource('users', \App\Http\Controllers\UserController::class);

    });
});

// Change Requests / Approvals (Protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('change-requests', [\App\Http\Controllers\ChangeRequestController::class, 'index']);
    Route::post('change-requests/{id}/approve', [\App\Http\Controllers\ChangeRequestController::class, 'approve']);
    Route::post('change-requests/{id}/reject', [\App\Http\Controllers\ChangeRequestController::class, 'reject']);
    
    // Dashboard Stats
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index']);
});

// Generic CRUD for lookup tables (Zones, States, Prisons)
// Public routes (no auth required for reading)
Route::get('{model}', [\App\Http\Controllers\GenericController::class, 'index'])->where('model', 'zones|states|prisons');
Route::get('{model}/{id}', [\App\Http\Controllers\GenericController::class, 'show'])->where('model', 'zones|states|prisons');

// Protected routes (auth required for writing)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('{model}', [\App\Http\Controllers\GenericController::class, 'store'])->where('model', 'zones|states|prisons');
    Route::put('{model}/{id}', [\App\Http\Controllers\GenericController::class, 'update'])->where('model', 'zones|states|prisons');
    Route::delete('{model}/{id}', [\App\Http\Controllers\GenericController::class, 'destroy'])->where('model', 'zones|states|prisons');
});
