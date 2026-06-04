<?php

namespace Tests\Feature;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class AccountStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_cannot_login_if_status_is_inactive()
    {
        $staff = Staff::create([
            'service_no' => '123456',
            'file_no' => 'FILE123',
            'password' => Hash::make('password'),
            'status' => 0, // Inactive
        ]);

        $response = $this->postJson('/api/v1/staff/login', [
            'service_no' => '123456',
            'password' => 'password',
        ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'Account is deactivated']);
    }

    public function test_staff_can_login_if_status_is_active()
    {
        RateLimiter::clear('auth:'.request()->ip());

        $staff = Staff::create([
            'service_no' => 'active_staff',
            'file_no' => 'FILE_ACT',
            'password' => Hash::make('password'),
            'status' => 1, // Active
        ]);

        $response = $this->postJson('/api/v1/staff/login', [
            'service_no' => 'active_staff',
            'password' => 'password',
        ]);

        $response->assertStatus(200);
    }

    public function test_user_cannot_login_if_status_is_inactive()
    {
        // Status defaults to 1 in migration, so we explicitly set to 0
        $user = User::factory()->create([
            'password' => Hash::make('password'),
            'status' => 0,
        ]);

        $response = $this->postJson('/api/v1/user/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'Account is deactivated']);
    }

    public function test_user_can_login_if_status_is_active()
    {
        RateLimiter::clear('auth:'.request()->ip());

        $user = User::factory()->create([
            'password' => Hash::make('password'),
            'status' => 1,
        ]);

        $response = $this->postJson('/api/v1/user/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertStatus(200);
    }

    public function test_deactivated_staff_existing_token_is_blocked()
    {
        $staff = Staff::factory()->create([
            'password' => Hash::make('password'),
            'status' => 1,
        ]);
        $token = $staff->createToken('test')->plainTextToken;

        $staff->update(['status' => 0]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/user');

        $response->assertStatus(403)
            ->assertJson(['message' => 'Account is deactivated']);
    }

    public function test_deactivated_user_existing_token_is_blocked()
    {
        $user = User::factory()->create([
            'password' => Hash::make('password'),
            'status' => 1,
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $user->update(['status' => 0]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/user');

        $response->assertStatus(403)
            ->assertJson(['message' => 'Account is deactivated']);
    }
}
