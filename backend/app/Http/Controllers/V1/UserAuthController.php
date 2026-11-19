<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Models\User;
use App\Notifications\PasswordResetNotification;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

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
            // Add a small delay to prevent timing attacks
            usleep(random_int(100000, 300000)); // 100-300ms delay

            return $this->errorResponse('Invalid login details', 422);
        }

        if ($user->status !== 'active') {
            return $this->errorResponse('Account is deactivated', 403);
        }

        // Update last login timestamp
        $user->update(['last_login' => now()]);

        $deviceName = $request->userAgent() ?? 'Unknown Device';
        $tokenInstance = $user->createToken($deviceName);
        $token = $tokenInstance->plainTextToken;

        $tokenInstance->accessToken->forceFill([
            'ip_address' => $request->ip(),
        ])->save();

        return $this->successResponse([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('roles'),
            'roles' => $user->roles->pluck('slug'),
            'permissions' => $user->all_permissions,
        ]);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if ($user) {
            $token = Password::broker('users')->createToken($user);
            $resetUrl = config('app.frontend_url').'/reset-password';
            $user->notify(new PasswordResetNotification($token, $resetUrl, 'user'));
        }

        // Always return success to prevent email enumeration
        return $this->successResponse(null, 'If an account with that email exists, a password reset link has been sent.');
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::broker('users')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return $this->successResponse(null, 'Password has been reset successfully.');
        }

        return $this->errorResponse(__($status), 422);
    }
}
