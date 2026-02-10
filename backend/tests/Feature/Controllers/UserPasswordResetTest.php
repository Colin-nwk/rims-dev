<?php

namespace Tests\Feature\Controllers;

use App\Models\User;
use App\Notifications\PasswordResetNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Internal\Notification; // Use Notification facade, not Internal
use Illuminate\Support\Facades\Notification as NotificationFacade;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class UserPasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_sends_notification_with_valid_email()
    {
        NotificationFacade::fake();

        $user = User::factory()->create([
            'email' => 'admin@test.com',
        ]);

        $response = $this->postJson('/api/v1/user/forgot-password', [
            'email' => 'admin@test.com',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'Success');

        NotificationFacade::assertSentTo(
            [$user],
            PasswordResetNotification::class,
            function ($notification) {
                return $notification->toMail(new User())->subject === 'Reset Your Password';
            }
        );
    }

    public function test_forgot_password_returns_success_for_non_existent_email()
    {
        NotificationFacade::fake();

        $response = $this->postJson('/api/v1/user/forgot-password', [
            'email' => 'nonexistent@test.com',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'Success');

        NotificationFacade::assertNothingSent();
    }

    public function test_reset_password_works_with_valid_token()
    {
        $user = User::factory()->create([
            'email' => 'admin@test.com',
            'password' => Hash::make('oldpassword'),
        ]);

        $token = Password::broker('users')->createToken($user);

        $response = $this->postJson('/api/v1/user/reset-password', [
            'email' => 'admin@test.com',
            'token' => $token,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'Success');

        $user->refresh();
        $this->assertTrue(Hash::check('newpassword123', $user->password));
    }

    public function test_reset_password_fails_with_invalid_token()
    {
        $user = User::factory()->create([
            'email' => 'admin@test.com',
            'password' => Hash::make('oldpassword'),
        ]);

        $response = $this->postJson('/api/v1/user/reset-password', [
            'email' => 'admin@test.com',
            'token' => 'invalid-token',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('status', 'Error');

        $user->refresh();
        $this->assertTrue(Hash::check('oldpassword', $user->password));
    }
}
