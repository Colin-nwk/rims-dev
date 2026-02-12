<?php

namespace Tests\Feature\Controllers;

use App\Models\Staff;
use App\Models\StaffCareer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffCareerControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_career_history()
    {
        $staff = Staff::factory()->create();

        $response = $this->getJson("/api/v1/staff/{$staff->service_no}/career-history");
        $response->assertStatus(401);
    }

    public function test_staff_can_view_their_own_career_history()
    {
        $staff = Staff::factory()->create();
        $staffCareer = StaffCareer::factory()->create([
            'service_no' => $staff->service_no,
            'field_changed' => 'present_rank',
            'old_value' => 'Corporal',
            'new_value' => 'Sergeant',
        ]);

        $response = $this->actingAs($staff, 'sanctum')->getJson("/api/v1/staff/{$staff->service_no}/career-history");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.old_value', 'Corporal')
            ->assertJsonPath('data.0.new_value', 'Sergeant');
    }

    public function test_authenticated_user_with_permission_can_view_any_career_history()
    {
        $user = User::factory()->create();
        $staff = Staff::factory()->create();
        $staffCareer = StaffCareer::factory()->create([
            'service_no' => $staff->service_no,
            'field_changed' => 'present_rank',
            'old_value' => 'Corporal',
            'new_value' => 'Sergeant',
        ]);

        // Grant permission
        \Illuminate\Support\Facades\Gate::define('staff.view', fn () => true);

        $response = $this->actingAs($user, 'sanctum')->getJson("/api/v1/staff/{$staff->service_no}/career-history");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.old_value', 'Corporal')
            ->assertJsonPath('data.0.new_value', 'Sergeant');
    }

    public function test_unauthorized_user_cannot_view_other_staff_career_history()
    {
        $user = User::factory()->create();
        $otherStaff = Staff::factory()->create();
        $staffCareer = StaffCareer::factory()->create([
            'service_no' => $otherStaff->service_no,
            'field_changed' => 'present_rank',
            'old_value' => 'Corporal',
            'new_value' => 'Sergeant',
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson("/api/v1/staff/{$otherStaff->service_no}/career-history");
        $response->assertStatus(403);
    }

    public function test_can_retrieve_specific_career_record()
    {
        $staff = Staff::factory()->create();
        $staffCareer = StaffCareer::factory()->create([
            'service_no' => $staff->service_no,
            'field_changed' => 'present_rank',
            'old_value' => 'Corporal',
            'new_value' => 'Sergeant',
        ]);

        // Grant permission
        \Illuminate\Support\Facades\Gate::define('staff.view', fn () => true);

        $user = User::factory()->create();
        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/staff/{$staff->service_no}/career-history/{$staffCareer->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $staffCareer->id)
            ->assertJsonPath('data.old_value', 'Corporal')
            ->assertJsonPath('data.new_value', 'Sergeant');
    }

    public function test_can_create_manual_career_record()
    {
        $user = User::factory()->create();
        $staff = Staff::factory()->create();

        // Grant permission
        \Illuminate\Support\Facades\Gate::define('staff.edit', fn () => true);

        $data = [
            'field_changed' => 'present_rank',
            'old_value' => 'Corporal',
            'new_value' => 'Sergeant',
            'reason' => 'Promotion',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/staff/{$staff->service_no}/career-history", $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.field_changed', 'present_rank')
            ->assertJsonPath('data.old_value', 'Corporal')
            ->assertJsonPath('data.new_value', 'Sergeant')
            ->assertJsonPath('data.reason', 'Promotion');

        $this->assertDatabaseHas('staff_careers', [
            'service_no' => $staff->service_no,
            'field_changed' => 'present_rank',
            'old_value' => 'Corporal',
            'new_value' => 'Sergeant',
            'reason' => 'Promotion',
        ]);
    }

    public function test_validation_fails_for_invalid_field_changed()
    {
        $user = User::factory()->create();
        $staff = Staff::factory()->create();

        // Grant permission
        \Illuminate\Support\Facades\Gate::define('staff.edit', fn () => true);

        $data = [
            'field_changed' => 'invalid_field',
            'old_value' => 'Old Value',
            'new_value' => 'New Value',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/staff/{$staff->service_no}/career-history", $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['field_changed']);
    }

    public function test_automatic_career_history_created_when_rank_changes()
    {
        $admin = User::factory()->create();
        $staff = Staff::factory()->create([
            'present_rank' => 'Corporal',
        ]);

        // Grant permission
        \Illuminate\Support\Facades\Gate::define('staff.edit', fn () => true);

        $data = [
            'present_rank' => 'Sergeant',
        ];

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/staff/{$staff->service_no}", $data);

        $response->assertStatus(200);

        // Get the change request that was created for this staff
        $changeRequest = \App\Models\ChangeRequest::where([
            'model_type' => 'App\Models\Staff',
            'model_id' => $staff->id,
        ])->first();
        
        // Approve the change request - need appropriate permissions
        $approver = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('change_request.approve', fn () => true);
        
        $this->actingAs($approver, 'sanctum')
            ->postJson("/api/v1/change-requests/{$changeRequest->id}/approve");

        // Now check that a career history record was created after approval
        $this->assertDatabaseHas('staff_careers', [
            'service_no' => $staff->service_no,
            'field_changed' => 'present_rank',
            'old_value' => 'Corporal',
            'new_value' => 'Sergeant',
        ]);
    }

    public function test_automatic_career_history_created_when_command_changes()
    {
        // Create states for testing
        $state1 = \App\Models\State::factory()->create(['state' => 'Lagos State']);
        $state2 = \App\Models\State::factory()->create(['state' => 'Abuja FCT']);

        $admin = User::factory()->create();
        $staff = Staff::factory()->create([
            'present_command' => $state1->id, // Using a valid state ID
        ]);

        // Grant permission
        \Illuminate\Support\Facades\Gate::define('staff.edit', fn () => true);

        $data = [
            'present_command' => $state2->id, // Different state ID
        ];

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/staff/{$staff->service_no}", $data);

        $response->assertStatus(200);

        // Get the change request that was created for this staff
        $changeRequest = \App\Models\ChangeRequest::where([
            'model_type' => 'App\Models\Staff',
            'model_id' => $staff->id,
        ])->first();
        
        // Approve the change request - need appropriate permissions
        $approver = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('change_request.approve', fn () => true);
        
        $this->actingAs($approver, 'sanctum')
            ->postJson("/api/v1/change-requests/{$changeRequest->id}/approve");

        // Check that a career history record was created after approval
        $this->assertDatabaseHas('staff_careers', [
            'service_no' => $staff->service_no,
            'field_changed' => 'present_command',
        ]);
    }

    public function test_multiple_changes_create_multiple_career_records()
    {
        // Create states for testing
        $state1 = \App\Models\State::factory()->create(['state' => 'Lagos State']);
        $state2 = \App\Models\State::factory()->create(['state' => 'Abuja FCT']);

        $admin = User::factory()->create();
        $staff = Staff::factory()->create([
            'present_rank' => 'Corporal',
            'present_command' => $state1->id,
        ]);

        // Grant permission
        \Illuminate\Support\Facades\Gate::define('staff.edit', fn () => true);

        $data = [
            'present_rank' => 'Sergeant',
            'present_command' => $state2->id,
        ];

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/staff/{$staff->service_no}", $data);

        $response->assertStatus(200);

        // Get the change request that was created for this staff
        $changeRequest = \App\Models\ChangeRequest::where([
            'model_type' => 'App\Models\Staff',
            'model_id' => $staff->id,
        ])->first();
        
        // Approve the change request - need appropriate permissions
        $approver = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('change_request.approve', fn () => true);
        
        $this->actingAs($approver, 'sanctum')
            ->postJson("/api/v1/change-requests/{$changeRequest->id}/approve");

        // Check that two career history records were created after approval
        $this->assertDatabaseHas('staff_careers', [
            'service_no' => $staff->service_no,
            'field_changed' => 'present_rank',
            'old_value' => 'Corporal',
            'new_value' => 'Sergeant',
        ]);

        $this->assertDatabaseHas('staff_careers', [
            'service_no' => $staff->service_no,
            'field_changed' => 'present_command',
        ]);

        // Total count should be 2
        $this->assertEquals(2, StaffCareer::where('service_no', $staff->service_no)->count());
    }
}