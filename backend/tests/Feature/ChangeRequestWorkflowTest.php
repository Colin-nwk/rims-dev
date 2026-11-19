<?php

namespace Tests\Feature;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChangeRequestWorkflowTest extends TestCase
{
    // use RefreshDatabase; // Enable if we want fresh DB, but might wipe data I want to keep?
    // Usually Feature tests use RefreshDatabase. I'll use it to be safe and clean.

    use RefreshDatabase;

    public function test_staff_creation_workflow()
    {
        // Seed required reference data
        $zone = \App\Models\Zone::create(['zone' => 'Test Zone']);
        $state = \App\Models\State::create(['state' => 'Test State', 'capital' => 'Test Capital', 'zone_id' => $zone->id]);
        $prison = \App\Models\Prison::create(['prison_name' => 'Test Prison', 'address' => 'Test Address', 'capacity' => '100', 'state_id' => $state->id]);

        $user = User::factory()->create();
        $this->actingAs($user);

        // Create required states and prisons
        $state = \App\Models\State::factory()->create();
        $prison = \App\Models\Prison::factory()->create(['state_id' => $state->id]);
        $zone = \App\Models\Zone::factory()->create();
        $rank = \App\Models\Ranking::factory()->create(['title' => 'Cpl']);

        // Grant Permissions
        \Illuminate\Support\Facades\Gate::define('staff.create', fn () => true);
        \Illuminate\Support\Facades\Gate::define('change_request.approve', fn () => true);

        $staffData = [
            'service_no' => 'SVC_TEST_01',
            'surname' => 'Test',
            'first_name' => 'Staff',
            'password' => 'password',
            'assigned_state' => $state->id,
            'prison' => $prison->id,
            'zone_id' => $zone->id,
            'sex' => 'M',
            'initial_rank' => $rank->id,
            'present_rank' => $rank->id,
            'level' => 8,
            'dob' => '1990-01-01',
            'date_of_first_appointment' => '2010-01-01',
            'date_of_first_appointment' => '2010-01-01',
            'state_of_origin' => 'Lagos',
            'lga' => 'Ikeja',
            'department' => 'Ops',
            'file_no' => 'F123',
            'duty' => 'Guard',
            'description' => 'Test',
            'status' => 1,
            'details' => [
                'pfa_name' => 'Test PFA',
                'pension_pin' => '12345',
            ],
            'education' => [
                [
                    'institution' => 'Test Uni',
                    'type' => 'BSc',
                    'start_date' => '2008-01-01',
                    'url' => \Illuminate\Http\UploadedFile::fake()->create('degree.pdf', 100),
                ],
            ],
            'photo' => \Illuminate\Http\UploadedFile::fake()->image('photo.jpg'),
        ];

        // 1. Store (Submit Request)
        $response = $this->postJson('/api/v1/staff', $staffData);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'PENDING');

        // Additional Check: Verify request data contains a path string, not a file object (implicit by JSON structure)
        $responseData = $response->json('data.data');
        $this->assertTrue(is_string($responseData['education'][0]['url']), 'URL should be converted to a file path string.');
        $this->assertStringContainsString('SVC_TEST_01_BSc_', $responseData['education'][0]['url']);

        $this->assertTrue(is_string($responseData['photo']), 'Photo should be converted to a file path string.');
        $this->assertStringContainsString('SVC_TEST_01_photo_', $responseData['photo']);

        $requestId = $response->json('data.id');

        $this->assertDatabaseHas('change_requests', [
            'id' => $requestId,
            'status' => 'PENDING',
            'model_type' => 'App\Models\Staff',
            'type' => 'CREATE',
        ]);

        $this->assertDatabaseMissing('staff', ['service_no' => 'SVC_TEST_01']);

        // 2. Approve Request
        // Assuming current user can approve
        $approveResponse = $this->postJson("/api/v1/change-requests/{$requestId}/approve");

        $approveResponse->assertStatus(200)
            ->assertJsonPath('data.service_no', 'SVC_TEST_01');

        $this->assertDatabaseHas('change_requests', [
            'id' => $requestId,
            'status' => 'APPROVED',
        ]);

        $this->assertDatabaseHas('staff', ['service_no' => 'SVC_TEST_01']);
        $this->assertDatabaseHas('staff_details', ['service_no' => 'SVC_TEST_01', 'pfa_name' => 'Test PFA']);
        // Education check needs referencing the staff, simpler to check count
        $staff = Staff::where('service_no', 'SVC_TEST_01')->first();
        $this->assertEquals(1, $staff->education()->count());
    }

    public function test_user_creation_workflow()
    {
        $admin = User::factory()->create();
        $this->actingAs($admin);

        \Illuminate\Support\Facades\Gate::define('change_request.approve', fn () => true);

        $userData = [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ];

        // 1. Store
        $response = $this->postJson('/api/v1/user/users', $userData);

        $response->assertStatus(201);
        $requestId = $response->json('data.id');

        $this->assertDatabaseMissing('users', ['email' => 'newuser@example.com']);

        // 2. Approve
        $this->postJson("/api/v1/change-requests/{$requestId}/approve")
            ->assertStatus(200);

        $this->assertDatabaseHas('change_requests', [
            'id' => $requestId,
            'status' => 'APPROVED',
        ]);

        $this->assertDatabaseHas('users', ['email' => 'newuser@example.com']);
    }

    public function test_update_splits_sensitive_and_standard_fields()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        // Mock the gate to allow access (bypassing AppServiceProvider boot order issues in tests)
        \Illuminate\Support\Facades\Gate::define('staff.edit', fn () => true);

        // Create initial staff
        $staffData = [
            'service_no' => 'SVC123456',
            'surname' => 'Original',
            'first_name' => 'Staff',
            'status' => 1,
            'email' => 'original@example.com',
            'dob' => '1990-01-01',
        ];

        // Manually create staff to bypass CR flow for setup
        $staff = \App\Models\Staff::create($staffData);

        // Update with mixed fields
        $updateData = [
            'surname' => 'Updated', // Standard
            'email' => 'updated@example.com', // Sensitive
            'dob' => '1995-01-01', // Sensitive
        ];

        $response = $this->putJson("/api/v1/staff/{$staff->service_no}", $updateData);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'sensitive',
                'standard',
            ],
        ]);

        // Verify Sensitive CR
        $this->assertDatabaseHas('change_requests', [
            'service_no' => 'SVC123456',
            'type' => 'SENSITIVE',
            'status' => 'PENDING',
        ]);

        // Verify Standard CR
        $this->assertDatabaseHas('change_requests', [
            'service_no' => 'SVC123456',
            'type' => 'UPDATE',
            'status' => 'PENDING',
        ]);

        // Verify database NOT updated yet
        $this->assertDatabaseHas('staff', [
            'surname' => 'Original',
            'email' => 'original@example.com',
        ]);
    }

    public function test_approve_sensitive_update_executes_changes()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        \Illuminate\Support\Facades\Gate::define('change_request.approve', fn () => true);

        // Create staff
        $staff = \App\Models\Staff::create([
            'service_no' => 'SVC_SENSITIVE',
            'email' => 'old@example.com',
            'status' => 1,
        ]);

        // Create SENSITIVE Change Request
        $cr = \App\Models\ChangeRequest::create([
            'model_type' => 'App\Models\Staff',
            'model_id' => $staff->id,
            'service_no' => $staff->service_no,
            'type' => 'SENSITIVE',
            'data' => ['email' => 'new@example.com'],
            'status' => 'PENDING',
            'requested_by_type' => get_class($user),
            'requested_by_id' => $user->id,
        ]);

        // Approve
        $response = $this->postJson("/api/v1/change-requests/{$cr->id}/approve");

        $response->assertStatus(200);

        // Verify DB updated
        $this->assertDatabaseHas('staff', [
            'service_no' => 'SVC_SENSITIVE',
            'email' => 'new@example.com',
        ]);

        // Verify CR status
        $this->assertDatabaseHas('change_requests', [
            'id' => $cr->id,
            'status' => 'APPROVED',
        ]);
    }

    public function test_staff_can_update_own_record_without_permission()
    {
        // 1. Create a User who IS a Staff member
        $staff = \App\Models\Staff::create([
            'service_no' => 'SVC_SELF_01',
            'surname' => 'Self',
            'first_name' => 'Service',
            'email' => 'self@example.com',
            'status' => 1,
        ]);

        // Act as this Staff member
        $this->actingAs($staff);

        // Ensure Staff has NO permissions
        $this->assertTrue($staff->roles->isEmpty());

        $updateData = ['surname' => 'Updated Self'];

        // 2. Attempt update
        $response = $this->putJson("/api/v1/staff/{$staff->service_no}", $updateData);

        // 3. Verify success (200 OK -> means it passed authorization)
        $response->assertStatus(200);

        // Verify Change Request created (Standard flow)
        $response->assertJsonPath('data.standard.type', 'UPDATE');
    }
}
