<?php

namespace Tests\Feature\Controllers;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_user_routes()
    {
        $response = $this->postJson('/api/v1/user/users', []);
        $response->assertStatus(401);
    }

    public function test_validation_fails_for_incomplete_data()
    {
        $admin = User::factory()->create();

        $response = $this->actingAs($admin)->postJson('/api/v1/user/users', [
            'name' => 'John' 
            // Missing email, password
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_store_creates_change_request()
    {
        $admin = User::factory()->create();
        $this->actingAs($admin);

        $data = [
            'name' => 'New User',
            'email' => 'new@test.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ];

        $response = $this->postJson('/api/v1/user/users', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'PENDING')
            ->assertJsonPath('data.model_type', 'App\Models\User')
            ->assertJsonPath('data.type', 'CREATE');
        
        $this->assertDatabaseHas('change_requests', [
            'type' => 'CREATE',
            'model_type' => 'App\Models\User',
            'status' => 'PENDING'
        ]);
        
        $this->assertDatabaseMissing('users', ['email' => 'new@test.com']);
    }

    public function test_update_creates_change_request()
    {
        $admin = User::factory()->create();
        $this->actingAs($admin);

        $user = User::factory()->create(['email' => 'old@test.com', 'name' => 'Old Name']);

        $data = [
            'name' => 'Updated Name'
        ];

        $response = $this->putJson("/api/v1/user/users/{$user->id}", $data);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'PENDING')
            ->assertJsonPath('data.type', 'UPDATE');

        $this->assertDatabaseHas('change_requests', [
            'model_id' => $user->id,
            'type' => 'UPDATE',
            'status' => 'PENDING'
        ]);
        
        // Ensure user is NOT updated yet
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Old Name']);
    }
}
