<?php

namespace Tests\Feature\Controllers;

use App\Models\Staff;
use App\Notifications\PasswordResetNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification as NotificationFacade;
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

        $this->assertDatabaseHas('staff_password_reset_tokens', [
            'email' => 'SVC001',
        ]);
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

        $this->assertDatabaseMissing('staff_password_reset_tokens', [
            'email' => 'SVC001',
        ]);
    }

    public function test_reset_password_works_with_valid_token()
    {
        $staff = Staff::factory()->create([
            'service_no' => 'SVC001',
            'password' => Hash::make('oldpassword'),
        ]);

        $token = 'valid-reset-token';
        DB::table('staff_password_reset_tokens')->insert([
            'email' => $staff->service_no,
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

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
        $this->assertDatabaseMissing('staff_password_reset_tokens', [
            'email' => 'SVC001',
        ]);
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

    public function test_reset_password_token_is_bound_to_service_number_not_shared_email()
    {
        $staff = Staff::factory()->create([
            'service_no' => 'SVC001',
            'email' => 'shared@test.com',
            'password' => Hash::make('oldpassword'),
        ]);

        $otherStaff = Staff::factory()->create([
            'service_no' => 'SVC002',
            'email' => 'shared@test.com',
            'password' => Hash::make('otherpassword'),
        ]);

        $token = 'service-one-token';
        DB::table('staff_password_reset_tokens')->insert([
            'email' => $staff->service_no,
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/staff/reset-password', [
            'service_no' => 'SVC002',
            'token' => $token,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('status', 'Error');

        $otherStaff->refresh();
        $this->assertTrue(Hash::check('otherpassword', $otherStaff->password));
    }
}
