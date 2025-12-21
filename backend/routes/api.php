<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Legacy API routes file. All active routes are now in routes/api/v1.php
| and accessible via /api/v1 prefix.
|
*/

// Redirect root to V1 info
Route::get('/', function () {
    return response()->json([
        'message' => 'Welcome to RIMS API',
        'version' => 'v1',
        'documentation' => '/api/v1',
    ]);
});
