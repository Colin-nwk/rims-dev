<?php

namespace Tests\Feature;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_search_and_filter()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        // Create mixed staff
        Staff::factory()->create(['service_no' => 'SVC001', 'surname' => 'Smith', 'status' => 1]);
        Staff::factory()->create(['service_no' => 'SVC002', 'surname' => 'Johnson', 'status' => 2]);
        Staff::factory()->create(['service_no' => 'SVC003', 'surname' => 'Smith', 'status' => 1]);

        // Test Search
        \Illuminate\Support\Facades\Gate::define('staff.view', fn () => true);
        $response = $this->getJson('/api/v1/staff?search=Smith');
        $response->assertStatus(200)
            ->assertJsonCount(2, 'data.data'); // Should find SVC001 and SVC003

        // Test Filter
        $response = $this->getJson('/api/v1/staff?status=2');
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.service_no', 'SVC002');

        // Test Sort
        $response = $this->getJson('/api/v1/staff?sort=service_no&sort_dir=desc');
        $response->assertStatus(200)
            ->assertJsonPath('data.data.0.service_no', 'SVC003');
    }

    public function test_user_search()
    {
        $admin = User::factory()->create(['name' => 'Admin User', 'email' => 'admin@test.com']);
        $this->actingAs($admin);

        User::factory()->create(['name' => 'Bob User', 'email' => 'bob@test.com']);
        User::factory()->create(['name' => 'Charlie', 'email' => 'charlie@test.com']);

        // Test Search
        $response = $this->getJson('/api/v1/user/users?search=User');
        // Should find Admin User and Bob User
        $response->assertStatus(200)
            ->assertJsonCount(2, 'data.data');
    }
}
