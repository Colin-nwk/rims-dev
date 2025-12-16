<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
// Staff Authentication
Route::prefix('staff')->group(function () {
    Route::post('login', [\App\Http\Controllers\StaffAuthController::class, 'login']);
    Route::post('state/login', [\App\Http\Controllers\StaffAuthController::class, 'stateLogin']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [\App\Http\Controllers\StaffAuthController::class, 'logout']);
        Route::get('user', function (Request $request) {
            return $request->user();
        });
    });
});
