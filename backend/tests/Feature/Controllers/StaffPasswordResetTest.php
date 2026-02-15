<?php

namespace Tests\Feature\Controllers;

use App\Models\Staff;
use App\Notifications\PasswordResetNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification as NotificationFacade;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class StaffPasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_sends_notification_with_valid_service_no_and_email()
    {
        NotificationFacade::fake();

        $staff = Staff::factory()->create([
            'service_no' => 'SVC001',
            'email' => 'staff@test.com',
        ]);

        $response = $this->postJson('/api/v1/staff/forgot-password', [
            'service_no' => 'SVC001',
            'email' => 'staff@test.com',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'Success');

        NotificationFacade::assertSentTo(
            [$staff],
            PasswordResetNotification::class
        );
    }

    public function test_forgot_password_fails_if_service_no_and_email_mismatch()
    {
        NotificationFacade::fake();

        $staff = Staff::factory()->create([
            'service_no' => 'SVC001',
            'email' => 'staff@test.com',
        ]);

        $response = $this->postJson('/api/v1/staff/forgot-password', [
            'service_no' => 'SVC001',
            'email' => 'wrong@test.com',
        ]);

        // Controller returns success to prevent enumeration, but sends nothing
        $response->assertStatus(200);

        NotificationFacade::assertNothingSent();
    }

    public function test_reset_password_works_with_valid_token()
    {
        $staff = Staff::factory()->create([
            'service_no' => 'SVC001',
            'password' => Hash::make('oldpassword'),
        ]);

        // Manually create token in new table
        $token = Password::broker('staff')->createToken($staff);

        $response = $this->postJson('/api/v1/staff/reset-password', [
            'service_no' => 'SVC001',
            'token' => $token,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'Success');

        $staff->refresh();
        $this->assertTrue(Hash::check('newpassword123', $staff->password));
    }

    public function test_reset_password_fails_with_invalid_token()
    {
        $staff = Staff::factory()->create([
            'service_no' => 'SVC001',
            'password' => Hash::make('oldpassword'),
        ]);

        $response = $this->postJson('/api/v1/staff/reset-password', [
            'service_no' => 'SVC001',
            'token' => 'invalid-token',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('status', 'Error');

        $staff->refresh();
        $this->assertTrue(Hash::check('oldpassword', $staff->password));
    }
}
