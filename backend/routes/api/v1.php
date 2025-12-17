<?php

use App\Http\Controllers\V1\AuthController;
use App\Http\Controllers\V1\ChangeRequestController;
use App\Http\Controllers\V1\ComplaintController;
use App\Http\Controllers\V1\DashboardController;
use App\Http\Controllers\V1\GenericController;
use App\Http\Controllers\V1\StaffAuthController;
use App\Http\Controllers\V1\StaffController;
use App\Http\Controllers\V1\UserAuthController;
use App\Http\Controllers\V1\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API V1 Routes
|--------------------------------------------------------------------------
*/

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Unified Logout
Route::middleware('auth:sanctum')->post('logout', [AuthController::class, 'logout']);

// Staff Authentication
Route::prefix('staff')->group(function () {
    Route::post('login', [StaffAuthController::class, 'login']);
    Route::post('state/login', [StaffAuthController::class, 'stateLogin']);
    Route::post('register', [StaffAuthController::class, 'register']);
    Route::post('set-password', [StaffAuthController::class, 'setPassword']);
    
    // Public ID Card lookup (for QR code generation)
    Route::get('id-card/{serviceNo}', [StaffController::class, 'idCard']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('user', function (Request $request) {
            return $request->user();
        });
    });
});

// Admin / Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('staff', StaffController::class);
});

// User Authentication
Route::prefix('user')->group(function () {
    Route::post('login', [UserAuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', function (Request $request) {
            return $request->user();
        });
        
        // User CRUD
        Route::apiResource('users', UserController::class);
    });
});

// Change Requests / Approvals (Protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('change-requests', [ChangeRequestController::class, 'index']);
    Route::post('change-requests/{id}/approve', [ChangeRequestController::class, 'approve']);
    Route::post('change-requests/{id}/reject', [ChangeRequestController::class, 'reject']);
    
    // Dashboard Stats
    Route::get('dashboard', [DashboardController::class, 'index']);
    
    // Complaints / Ticketing System
    Route::apiResource('complaints', ComplaintController::class)->except(['update']);
    Route::patch('complaints/{complaint}/status', [ComplaintController::class, 'updateStatus']);
    Route::post('complaints/{complaint}/messages', [ComplaintController::class, 'addMessage']);
});

// Generic CRUD for lookup tables (Zones, States, Prisons)
// Public routes (no auth required for reading)
Route::get('{model}', [GenericController::class, 'index'])->where('model', 'zones|states|prisons');
Route::get('{model}/{id}', [GenericController::class, 'show'])->where('model', 'zones|states|prisons');

// Protected routes (auth required for writing)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('{model}', [GenericController::class, 'store'])->where('model', 'zones|states|prisons');
    Route::put('{model}/{id}', [GenericController::class, 'update'])->where('model', 'zones|states|prisons');
    Route::delete('{model}/{id}', [GenericController::class, 'destroy'])->where('model', 'zones|states|prisons');
});
