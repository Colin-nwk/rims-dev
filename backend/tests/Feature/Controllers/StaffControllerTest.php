<?php

namespace Tests\Feature\Controllers;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_staff_routes()
    {
        $response = $this->getJson('/api/v1/staff');
        $response->assertStatus(401);

        $response = $this->postJson('/api/v1/staff', []);
        $response->assertStatus(401);
    }

    public function test_validation_fails_for_incomplete_data()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/staff', [
            'first_name' => 'John',
            // Missing required fields: surname, service_no, etc.
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['surname', 'service_no', 'status']);
    }

    public function test_store_creates_change_request()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $data = [
            'service_no' => 'SVC_CONT_01',
            'surname' => 'Controller',
            'first_name' => 'Test',
            'status' => 1,
        ];

        $response = $this->postJson('/api/v1/staff', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'PENDING')
            ->assertJsonPath('data.model_type', 'App\Models\Staff')
            ->assertJsonPath('data.type', 'CREATE');

        $this->assertDatabaseHas('change_requests', [
            'service_no' => 'SVC_CONT_01',
            'type' => 'CREATE',
            'status' => 'PENDING',
        ]);
    }

    public function test_update_creates_change_request()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $staff = \App\Models\Staff::factory()->create(['service_no' => 'SVC_CONT_02']);

        $data = [
            'surname' => 'Updated Name',
        ];

        $response = $this->putJson("/api/v1/staff/{$staff->service_no}", $data);

        $response->assertStatus(200)
            ->assertJsonPath('data.standard.status', 'PENDING')
            ->assertJsonPath('data.standard.type', 'UPDATE');

        $this->assertDatabaseHas('change_requests', [
            'model_id' => $staff->id,
            'type' => 'UPDATE',
            'status' => 'PENDING',
        ]);

        // Ensure staff is NOT updated yet
        $this->assertDatabaseHas('staff', ['id' => $staff->id, 'surname' => $staff->surname]);
    }
}
