<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        $deviceName = $request->userAgent() ?? 'Unknown Device';
        $tokenInstance = $user->createToken($deviceName);
        $token = $tokenInstance->plainTextToken;
        
        // Save IP address
        $tokenInstance->accessToken->forceFill([
            'ip_address' => $request->ip()
        ])->save();

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }


}
