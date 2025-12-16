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
        $response = $this->getJson('/api/staff');
        $response->assertStatus(401);

        $response = $this->postJson('/api/staff', []);
        $response->assertStatus(401);
    }

    public function test_validation_fails_for_incomplete_data()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/staff', [
            'first_name' => 'John' 
            // Missing required fields: surname, service_no, etc.
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['surname', 'service_no', 'status']);
    }
}
