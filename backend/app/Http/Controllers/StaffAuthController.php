<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StaffAuthController extends Controller
{
    use ApiResponseTrait;

    public function login(Request $request)
    {
        $request->validate([
            'service_no' => 'required|string',
            'password' => 'required|string',
        ]);

        $staff = \App\Models\Staff::where('service_no', $request->service_no)->first();

        if (! $staff || ! Hash::check($request->password, $staff->password)) {
            return $this->errorResponse('Invalid login details', 401);
        }

        $deviceName = $request->userAgent() ?? 'Unknown Device';
        $tokenInstance = $staff->createToken($deviceName);
        $token = $tokenInstance->plainTextToken;
        
        // Save IP address
        $tokenInstance->accessToken->forceFill([
            'ip_address' => $request->ip(),
        ])->save();

        return $this->successResponse([
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
            'state' => 'required|exists:states,id', 
        ]);

        $staff = \App\Models\Staff::where('service_no', $request->service_no)->first();

        if (! $staff || ! Hash::check($request->password, $staff->password)) {
            return $this->errorResponse('Invalid login details', 401);
        }

        // Verify State
        if ($staff->assigned_state != $request->state) {
            return $this->errorResponse('You are not assigned to this state', 403);
        }

        $deviceName = $request->userAgent() ?? 'Unknown Device';
        $tokenInstance = $staff->createToken($deviceName);
        $token = $tokenInstance->plainTextToken;
        
        // Save IP address
        $tokenInstance->accessToken->forceFill([
            'ip_address' => $request->ip(),
        ])->save();

        return $this->successResponse([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $staff,
        ]);
    }
}
