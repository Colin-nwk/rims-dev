<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserAuthController extends Controller
{
    use ApiResponseTrait;

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return $this->errorResponse('Invalid login details', 401);
        }

        $deviceName = $request->userAgent() ?? 'Unknown Device';
        $tokenInstance = $user->createToken($deviceName);
        $token = $tokenInstance->plainTextToken;
        
        $tokenInstance->accessToken->forceFill([
            'ip_address' => $request->ip()
        ])->save();

        return $this->successResponse([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('roles'),
            'roles' => $user->roles->pluck('slug'), // Simple array of role slugs
            'permissions' => $user->all_permissions, // Flattened array from trait
        ]);
    }
}
