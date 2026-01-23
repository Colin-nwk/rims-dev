<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    use ApiResponseTrait;

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        // Flush role cache as requested
        if (method_exists($request->user(), 'flushRoleCache')) {
            $request->user()->flushRoleCache();
        }

        return $this->successResponse(null, 'Logged out successfully', 204);
    }
}
