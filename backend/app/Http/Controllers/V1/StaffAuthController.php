<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
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
        
        $tokenInstance->accessToken->forceFill([
            'ip_address' => $request->ip(),
        ])->save();

        return $this->successResponse([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $staff->load('roles'),
            'roles' => $staff->roles->pluck('slug'),
            'permissions' => $staff->all_permissions,
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

        if ($staff->assigned_state != $request->state) {
            return $this->errorResponse('You are not assigned to this state', 403);
        }

        $deviceName = $request->userAgent() ?? 'Unknown Device';
        $tokenInstance = $staff->createToken($deviceName);
        $token = $tokenInstance->plainTextToken;
        
        $tokenInstance->accessToken->forceFill([
            'ip_address' => $request->ip(),
        ])->save();

        return $this->successResponse([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $staff->load('roles'),
            'roles' => $staff->roles->pluck('slug'),
            'permissions' => $staff->all_permissions,
        ]);
    }

    /**
     * Register new staff - creates initial record with service_no, file_no, ippis
     */
    public function register(Request $request)
    {
        $request->validate([
            'service_no' => 'required|string|unique:staff,service_no',
            'file_no' => 'required|string|unique:staff,file_no',
            'ippis' => 'required|string|unique:staff_details,ippis',
        ]);

        $staff = \App\Models\Staff::create([
            'service_no' => $request->service_no,
            'file_no' => $request->file_no,
            'status' => 0, // Inactive until password is set
        ]);

        // Store ippis in staff_details
        $staff->details()->create([
            'ippis' => $request->ippis,
        ]);

        return $this->successResponse([
            'message' => 'Registration initiated. Please set your password to complete.',
            'service_no' => $staff->service_no,
        ], 'Staff registered successfully', 201);
    }

    /**
     * Set password for newly registered staff
     */
    public function setPassword(Request $request)
    {
        $request->validate([
            'service_no' => 'required|string|exists:staff,service_no',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $staff = \App\Models\Staff::where('service_no', $request->service_no)->first();

        if ($staff->password) {
            return $this->errorResponse('Password already set. Please use login or reset password.', 400);
        }

        $staff->update([
            'password' => Hash::make($request->password),
            'status' => 1, // Activate staff
        ]);

        // Auto-login after setting password
        $deviceName = $request->userAgent() ?? 'Unknown Device';
        $tokenInstance = $staff->createToken($deviceName);
        $token = $tokenInstance->plainTextToken;

        $tokenInstance->accessToken->forceFill([
            'ip_address' => $request->ip(),
        ])->save();

        return $this->successResponse([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $staff,
        ], 'Password set successfully');
    }
}
