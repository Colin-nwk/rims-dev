<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    use ApiResponseTrait;

    public function logout(Request $request)
    {
        // Revoke and delete the current access token
        $token = $request->user()->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        // Flush role cache as requested
        if (method_exists($request->user(), 'flushRoleCache')) {
            $request->user()->flushRoleCache();
        }

        // Clear any related cookies
        Cookie::queue(Cookie::forget('remember_token'));

        return $this->successResponse(null, 'Logged out successfully', 204);
    }
}
