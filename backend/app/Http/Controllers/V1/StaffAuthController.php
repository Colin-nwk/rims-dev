<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StaffForgotPasswordRequest;
use App\Http\Requests\StaffResetPasswordRequest;
use App\Models\Staff;
use App\Notifications\PasswordResetNotification;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class StaffAuthController extends Controller
{
    use ApiResponseTrait;

    public function login(Request $request)
    {
        $request->validate([
            'service_no' => 'required|string',
            'password' => 'required|string',
        ]);

        $staff = Staff::where('service_no', $request->service_no)->first();

        if (! $staff || ! Hash::check($request->password, $staff->password)) {
            // Add a small delay to prevent timing attacks
            usleep(random_int(100000, 300000)); // 100-300ms delay

            return $this->errorResponse('Invalid login details', 422);
        }

        if ($staff->status != 1) {
            return $this->errorResponse('Account is deactivated', 403);
        }

        // Update last login timestamp
        $staff->update(['last_login' => now()]);

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

        $staff = Staff::where('service_no', $request->service_no)->first();

        if (! $staff || ! Hash::check($request->password, $staff->password)) {
            return $this->errorResponse('Invalid login details', 422);
        }

        if ($staff->status != 1) {
            return $this->errorResponse('Account is deactivated', 403);
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

    public function confirmServiceNumber(Request $request)
    {
        $request->validate([
            'service_no' => 'required|string',
            'file_no' => 'required|string',
            'ippis' => 'required|string',
        ]);

        $staff = Staff::where('service_no', $request->service_no)
            ->where('file_no', $request->file_no)
            ->where('ippis', $request->ippis)
            ->first();

        if (! $staff) {
            return $this->errorResponse('Service number, IPPIS and name do not match.', 404);
        }

        return $this->successResponse([
            'first_name' => $staff->first_name,
            'surname' => $staff->surname,
            'service_no' => $staff->service_no,
        ], 'Staff identity confirmed');
    }

    public function setPassword(Request $request)
    {
        $request->validate([
            'service_no' => 'required|string|exists:staff,service_no',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $staff = Staff::where('service_no', $request->service_no)->first();

        if ($staff->password) {
            return $this->errorResponse('Password already set. Please use login or reset password.', 400);
        }

        $staff->update([
            'password' => Hash::make($request->password),
            'status' => 1,
        ]);

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
            'roles' => [],
            'permissions' => [],
        ], 'Password set successfully');
    }

    public function forgotPassword(StaffForgotPasswordRequest $request): JsonResponse
    {
        $staff = Staff::where('service_no', $request->service_no)
            ->where('email', $request->email)
            ->first();

        if ($staff) {
            /** @var \Illuminate\Auth\Passwords\PasswordBroker $broker */
            $broker = Password::broker('staff');
            $token = $broker->createToken($staff);
            $resetUrl = config('app.frontend_url').'/staff/reset-password';
            $staff->notify(new PasswordResetNotification($token, $resetUrl, 'staff'));
        }

        return $this->successResponse(null, 'If an account with those details exists, a password reset link has been sent.');
    }

    public function resetPassword(StaffResetPasswordRequest $request): JsonResponse
    {
        $staff = Staff::where('service_no', $request->service_no)->first();

        if (! $staff) {
            return $this->errorResponse('Invalid credentials.', 422);
        }

        /** @var \Illuminate\Auth\Passwords\PasswordBroker $broker */
        $broker = Password::broker('staff');
        $tokenValid = $broker->tokenExists($staff, $request->token);

        if (! $tokenValid) {
            return $this->errorResponse('This password reset token is invalid or has expired.', 422);
        }

        $staff->forceFill([
            'password' => Hash::make($request->password),
        ])->save();

        $broker->deleteToken($staff);

        return $this->successResponse(null, 'Password has been reset successfully.');
    }

    /**
     * Change password for authenticated staff
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $staff = $request->user();

        if (! $staff instanceof \App\Models\Staff) {
            return $this->errorResponse('Unauthorized', 401);
        }

        if (! Hash::check($request->current_password, $staff->password)) {
            return $this->errorResponse('Current password is incorrect', 422);
        }

        $staff->update([
            'password' => Hash::make($request->password),
        ]);

        return $this->successResponse(null, 'Password changed successfully');
    }
}
