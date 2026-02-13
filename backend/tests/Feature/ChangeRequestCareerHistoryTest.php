<?php

namespace Tests\Feature;

use App\Models\ChangeRequest;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChangeRequestCareerHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_change_request_approval_creates_career_history()
    {
        $admin = User::factory()->create();
        $corporal = \App\Models\Ranking::factory()->create(['title' => 'Corporal']);
        $sergeant = \App\Models\Ranking::factory()->create(['title' => 'Sergeant']);

        $staff = Staff::factory()->create([
            'present_rank' => $corporal->id,
        ]);

        // Grant permission
        \Illuminate\Support\Facades\Gate::define('staff.edit', fn () => true);

        $data = [
            'present_rank' => $sergeant->id,
        ];

        // Submit the change request
        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/staff/{$staff->service_no}", $data);

        $response->assertStatus(200);

        // Check that a change request was created
        $this->assertDatabaseHas('change_requests', [
            'model_type' => 'App\Models\Staff',
            'model_id' => $staff->id,
            'type' => 'UPDATE',
            'status' => 'PENDING',
        ]);

        // Get the change request
        $changeRequest = ChangeRequest::where([
            'model_type' => 'App\Models\Staff',
            'model_id' => $staff->id,
        ])->first();

        // Approve the change request - need appropriate permissions
        $approver = User::factory()->create();
        // Grant permission to approve change requests
        \Illuminate\Support\Facades\Gate::define('change_request.approve', fn () => true);

        $this->actingAs($approver, 'sanctum')
            ->postJson("/api/v1/change-requests/{$changeRequest->id}/approve")
            ->assertStatus(200);

        // Check that the staff rank was updated
        $staff->refresh();
        $this->assertEquals($sergeant->id, $staff->present_rank);

        // Check that a career history record was created
        $this->assertDatabaseHas('staff_careers', [
            'service_no' => $staff->service_no,
            'field_changed' => 'present_rank',
            'old_value' => 'Corporal',
            'new_value' => 'Sergeant',
        ]);
    }
}
