<?php

use App\Http\Controllers\V1\AuthController;
use App\Http\Controllers\V1\ChangeRequestController;
use App\Http\Controllers\V1\ComplaintController;
use App\Http\Controllers\V1\DashboardController;
use App\Http\Controllers\V1\GenericController;
use App\Http\Controllers\V1\PermissionController;
use App\Http\Controllers\V1\RoleController;
use App\Http\Controllers\V1\StaffAuthController;
use App\Http\Controllers\V1\StaffController;
use App\Http\Controllers\V1\StatisticsController;
use App\Http\Controllers\V1\UserAuthController;
use App\Http\Controllers\V1\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API V1 Routes
|--------------------------------------------------------------------------
*/

// ==============================================================================
// PUBLIC ROUTES
// ==============================================================================

// Staff Authentication & Registration
Route::prefix('staff')->group(function () {
    Route::post('login', [StaffAuthController::class, 'login'])->middleware('throttle:auth');
    Route::post('state/login', [StaffAuthController::class, 'stateLogin'])->middleware('throttle:auth');
    Route::post('register', [StaffAuthController::class, 'register'])->middleware('throttle:auth');
    Route::post('set-password', [StaffAuthController::class, 'setPassword'])->middleware('throttle:auth');

    // Public Staff Resources
    Route::get('id-card/{serviceNo}', [StaffController::class, 'idCard']);
});

// User Authentication
Route::prefix('user')->group(function () {
    Route::post('login', [UserAuthController::class, 'login'])->middleware('throttle:auth');
});

// Generic Read-Only Resources (Zones, States, Prisons, Degree Types, Rankings)
Route::get('{model}', [GenericController::class, 'index'])->where('model', 'zones|states|prisons|degree_types|rankings');
Route::get('{model}/{id}', [GenericController::class, 'show'])->where('model', 'zones|states|prisons|degree_types|rankings');

// ==============================================================================
// PROTECTED ROUTES (Sanctum Auth)
// ==============================================================================

Route::middleware('auth:sanctum')->group(function () {

    // --- Authentication & Profile ---
    Route::post('logout', [AuthController::class, 'logout']);

    // User Context
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Legacy Staff Profile Endpoint (kept for compatibility)
    Route::prefix('staff')->group(function () {
        Route::get('user', fn (Request $request) => $request->user());
    });

    // User Profile Endpoint
    Route::prefix('user')->group(function () {
        Route::get('me', fn (Request $request) => $request->user());
    });

    // --- Dashboard ---
    Route::get('dashboard', [DashboardController::class, 'index']);

    // --- Statistics ---
    Route::prefix('statistics')->group(function () {
        Route::get('/', [StatisticsController::class, 'index']);
        Route::get('gender', [StatisticsController::class, 'gender']);
        Route::get('marital-status', [StatisticsController::class, 'maritalStatus']);
        Route::get('state-of-origin', [StatisticsController::class, 'stateOfOrigin']);
        Route::get('assigned-state', [StatisticsController::class, 'assignedState']);
        Route::get('rank', [StatisticsController::class, 'rank']);
        Route::get('education-type', [StatisticsController::class, 'educationType']);
        Route::get('appointment-trends', [StatisticsController::class, 'appointmentTrends']);
    });

    // --- Staff Management ---
    Route::apiResource('staff', StaffController::class);
    // Staff Role Management
    Route::post('staff/{staff}/roles', [StaffController::class, 'assignRole']);
    Route::delete('staff/{staff}/roles/{role}', [StaffController::class, 'removeRole']);

    // --- User Management ---
    Route::prefix('user')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::post('users/{user}/roles', [UserController::class, 'assignRole']);
        Route::delete('users/{user}/roles/{role}', [UserController::class, 'removeRole']);
    });

    // --- Role & Permission Management (RBAC) ---
    Route::apiResource('roles', RoleController::class);
    Route::post('roles/{role}/permissions/sync', [RoleController::class, 'syncPermissions']);
    Route::post('roles/{role}/permissions/attach', [RoleController::class, 'attachPermission']);
    Route::post('roles/{role}/permissions/detach', [RoleController::class, 'detachPermission']);
    Route::get('permissions', [PermissionController::class, 'index']);

    // --- Change Request Management ---
    Route::get('change-requests', [ChangeRequestController::class, 'index']);
    Route::post('change-requests/{id}/approve', [ChangeRequestController::class, 'approve']);
    Route::post('change-requests/{id}/reject', [ChangeRequestController::class, 'reject']);

    // --- Complaint / Ticketing System ---
    Route::apiResource('complaints', ComplaintController::class)->except(['update']);
    Route::patch('complaints/{complaint}/status', [ComplaintController::class, 'updateStatus']);
    Route::post('complaints/{complaint}/messages', [ComplaintController::class, 'addMessage']);

    // --- Generic Resources (Write) ---
    Route::post('{model}', [GenericController::class, 'store'])->where('model', 'zones|states|prisons|degree_types|rankings');
    Route::put('{model}/{id}', [GenericController::class, 'update'])->where('model', 'zones|states|prisons|degree_types|rankings');
    Route::delete('{model}/{id}', [GenericController::class, 'destroy'])->where('model', 'zones|states|prisons|degree_types|rankings');

});
