<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class StaffAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'service_no' => 'required|string',
            'password' => 'required|string',
        ]);

        $staff = \App\Models\Staff::where('service_no', $request->service_no)->first();

        if (! $staff || ! \Illuminate\Support\Facades\Hash::check($request->password, $staff->password)) {
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        $deviceName = $request->userAgent() ?? 'Unknown Device';
        $tokenInstance = $staff->createToken($deviceName);
        $token = $tokenInstance->plainTextToken;
        
        // Save IP address
        $tokenInstance->accessToken->forceFill([
            'ip_address' => $request->ip(),
        ])->save();

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $staff,
        ]);
    }

    public function stateLogin(Request $request)
    {
        $request->validate([
            'service_no' => 'required|string',
            'password' => 'required|string',
            'state' => 'required|string', 
        ]);

        $staff = \App\Models\Staff::where('service_no', $request->service_no)->first();

        if (! $staff || ! \Illuminate\Support\Facades\Hash::check($request->password, $staff->password)) {
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        // Verify State
        if ($staff->assigned_state != $request->state) {
            return response()->json([
                'message' => 'You are not assigned to this state'
            ], 403);
        }

        $deviceName = $request->userAgent() ?? 'Unknown Device';
        $tokenInstance = $staff->createToken($deviceName);
        $token = $tokenInstance->plainTextToken;
        
        // Save IP address
        $tokenInstance->accessToken->forceFill([
            'ip_address' => $request->ip(),
        ])->save();

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $staff,
        ]);
    }


}
