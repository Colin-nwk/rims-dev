<?php

namespace Tests\Feature\Controllers;

use App\Models\Staff;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class StaffAuthControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_can_login_with_valid_credentials()
    {
        $staff = Staff::factory()->create([
            'service_no' => 'SVC001',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/v1/staff/login', [
            'service_no' => 'SVC001',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'Success')
            ->assertJsonStructure([
                'data' => [
                    'access_token',
                    'token_type',
                    'user',
                ],
            ]);
    }

    public function test_staff_cannot_login_with_invalid_credentials()
    {
        $staff = Staff::factory()->create([
            'service_no' => 'SVC002',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/v1/staff/login', [
            'service_no' => 'SVC002',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('status', 'Error');
    }

    public function test_staff_can_register()
    {
        $response = $this->postJson('/api/v1/staff/register', [
            'service_no' => 'NEW001',
            'file_no' => 'FILE001',
            'ippis' => 'IPPIS001',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'Success')
            ->assertJsonPath('data.service_no', 'NEW001');

        $this->assertDatabaseHas('staff', [
            'service_no' => 'NEW001',
            'file_no' => 'FILE001',
            'status' => 0,
        ]);

        $this->assertDatabaseHas('staff_details', [
            'ippis' => 'IPPIS001',
        ]);
    }

    public function test_register_fails_with_duplicate_service_no()
    {
        Staff::factory()->create(['service_no' => 'DUP001']);

        $response = $this->postJson('/api/v1/staff/register', [
            'service_no' => 'DUP001',
            'file_no' => 'FILE002',
            'ippis' => 'IPPIS002',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['service_no']);
    }

    public function test_register_fails_with_duplicate_file_no()
    {
        Staff::factory()->create(['file_no' => 'DUPFILE']);

        $response = $this->postJson('/api/v1/staff/register', [
            'service_no' => 'NEW002',
            'file_no' => 'DUPFILE',
            'ippis' => 'IPPIS003',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file_no']);
    }

    public function test_staff_can_set_password()
    {
        Staff::factory()->create([
            'service_no' => 'SETPWD001',
            'password' => null,
            'status' => 0,
        ]);

        $response = $this->postJson('/api/v1/staff/set-password', [
            'service_no' => 'SETPWD001',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'Success')
            ->assertJsonStructure([
                'data' => ['access_token', 'token_type', 'user'],
            ]);

        $this->assertDatabaseHas('staff', [
            'service_no' => 'SETPWD001',
            'status' => 1,
        ]);
    }

    public function test_set_password_fails_if_already_set()
    {
        Staff::factory()->create([
            'service_no' => 'HASPASS001',
            'password' => Hash::make('existingpassword'),
        ]);

        $response = $this->postJson('/api/v1/staff/set-password', [
            'service_no' => 'HASPASS001',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(400)
            ->assertJsonPath('status', 'Error');
    }

    public function test_set_password_requires_confirmation()
    {
        Staff::factory()->create([
            'service_no' => 'CONFIRM001',
            'password' => null,
        ]);

        $response = $this->postJson('/api/v1/staff/set-password', [
            'service_no' => 'CONFIRM001',
            'password' => 'newpassword123',
            'password_confirmation' => 'mismatch',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }
    public function test_staff_login_with_no_roles_returns_empty_arrays()
    {
        $staff = Staff::factory()->create([
            'password' => Hash::make('password'),
            'status' => 1,
        ]);

        $response = $this->postJson('/api/v1/staff/login', [
            'service_no' => $staff->service_no,
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'Success',
                'data' => [
                    'roles' => [],
                    'permissions' => [],
                ]
            ]);
    }
    public function test_staff_can_logout()
    {
        $staff = Staff::factory()->create([
            'password' => Hash::make('password'),
            'status' => 1,
        ]);

        $token = $staff->createToken('test')->plainTextToken;

        // Mock cache interaction if possible, or just verify successful logout response
        // Since we can't easily assert Cache::forget was called without mocking Cache facade
        // We will focus on the successful response and token deletion.
        
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/logout');

        // 204 No Content response
        $response->assertStatus(204);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $staff->id,
            'tokenable_type' => get_class($staff),
        ]);
    }
}
