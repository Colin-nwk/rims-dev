<?php

namespace Tests\Feature;

use App\Models\Staff;
use App\Models\StaffPosting;
use App\Models\User;
use App\Services\ChangeRequestService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class StaffPostingApprovalTest extends TestCase
{
    use RefreshDatabase;

    protected ChangeRequestService $changeRequestService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->changeRequestService = app(ChangeRequestService::class);
    }

    public function test_store_creates_change_request_instead_of_direct_creation(): void
    {
        $user = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'POST_TEST_01']);
        $this->actingAs($user);

        Gate::define('staff-posting.create', fn () => true);

        $data = [
            'service_no' => 'POST_TEST_01',
            'type' => 'farm_center',
            'station_name' => 'Test Farm Center',
            'station_location' => '123 Test Road',
            'start_date' => '2024-01-15',
            'status' => 'active',
            'reason' => 'Routine posting',
        ];

        $response = $this->postJson('/api/v1/staff-postings', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'PENDING')
            ->assertJsonPath('data.model_type', 'App\Models\StaffPosting')
            ->assertJsonPath('data.type', 'CREATE');

        // Verify change request was created
        $this->assertDatabaseHas('change_requests', [
            'service_no' => 'POST_TEST_01',
            'model_type' => 'App\Models\StaffPosting',
            'type' => 'CREATE',
            'status' => 'PENDING',
        ]);

        // Verify posting record was NOT created yet
        $this->assertDatabaseMissing('staff_postings', [
            'service_no' => 'POST_TEST_01',
            'station_name' => 'Test Farm Center',
        ]);
    }

    public function test_update_creates_change_request_instead_of_direct_update(): void
    {
        $user = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'POST_TEST_02']);
        $posting = StaffPosting::factory()->create([
            'service_no' => 'POST_TEST_02',
            'station_name' => 'Old Station',
            'type' => 'farm_center',
            'status' => 'active',
        ]);
        $this->actingAs($user);

        Gate::define('staff-posting.edit', fn () => true);

        $data = [
            'station_name' => 'New Station',
            'remarks' => 'Updated remarks',
        ];

        $response = $this->putJson("/api/v1/staff-postings/{$posting->id}", $data);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'PENDING')
            ->assertJsonPath('data.model_type', 'App\Models\StaffPosting')
            ->assertJsonPath('data.type', 'UPDATE');

        // Verify change request was created
        $this->assertDatabaseHas('change_requests', [
            'model_id' => $posting->id,
            'model_type' => 'App\Models\StaffPosting',
            'type' => 'UPDATE',
            'status' => 'PENDING',
        ]);

        // Verify posting record was NOT updated yet
        $posting->refresh();
        $this->assertEquals('Old Station', $posting->station_name);
    }

    public function test_delete_does_not_require_approval(): void
    {
        $user = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'POST_TEST_03']);
        $posting = StaffPosting::factory()->create([
            'service_no' => 'POST_TEST_03',
            'station_name' => 'Delete Test Station',
        ]);
        $this->actingAs($user);

        Gate::define('staff-posting.delete', fn () => true);

        $response = $this->deleteJson("/api/v1/staff-postings/{$posting->id}");

        $response->assertStatus(200);

        // Verify posting was deleted directly (no change request)
        $this->assertDatabaseMissing('staff_postings', ['id' => $posting->id]);
        $this->assertDatabaseMissing('change_requests', [
            'model_id' => $posting->id,
            'model_type' => 'App\Models\StaffPosting',
            'type' => 'DELETE',
        ]);
    }

    public function test_approve_create_request_creates_posting_record(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'POST_APPROVE_01']);

        $data = [
            'service_no' => 'POST_APPROVE_01',
            'type' => 'farm_center',
            'station_name' => 'Approved Farm Center',
            'station_location' => '456 Approved Road',
            'start_date' => '2024-01-15',
            'status' => 'active',
            'reason' => 'Routine posting',
        ];

        // Submit change request
        $request = $this->changeRequestService->submit(
            'App\Models\StaffPosting',
            'CREATE',
            $data,
            $user,
            'POST_APPROVE_01'
        );

        // Approve the request
        $this->changeRequestService->approve($request->id, $admin);

        // Verify request status changed
        $request->refresh();
        $this->assertEquals('APPROVED', $request->status);
        $this->assertEquals($admin->id, $request->approved_by);

        // Verify posting record was created
        $this->assertDatabaseHas('staff_postings', [
            'service_no' => 'POST_APPROVE_01',
            'station_name' => 'Approved Farm Center',
            'type' => 'farm_center',
        ]);

        // Verify staff station was updated (since posting is active)
        $this->assertDatabaseHas('staff', [
            'service_no' => 'POST_APPROVE_01',
            'station' => 'Approved Farm Center',
        ]);
    }

    public function test_approve_update_request_updates_posting_record(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'POST_APPROVE_02']);
        $posting = StaffPosting::factory()->create([
            'service_no' => 'POST_APPROVE_02',
            'station_name' => 'Old Station',
            'remarks' => 'Old remarks',
            'status' => 'active',
        ]);

        $data = [
            'station_name' => 'Updated Station',
            'remarks' => 'Updated remarks',
        ];

        // Submit change request
        $request = $this->changeRequestService->submit(
            'App\Models\StaffPosting',
            'UPDATE',
            $data,
            $user,
            'POST_APPROVE_02',
            $posting->id
        );

        // Approve the request
        $this->changeRequestService->approve($request->id, $admin);

        // Verify request status changed
        $request->refresh();
        $this->assertEquals('APPROVED', $request->status);

        // Verify posting record was updated
        $posting->refresh();
        $this->assertEquals('Updated Station', $posting->station_name);
        $this->assertEquals('Updated remarks', $posting->remarks);
    }

    public function test_approve_update_request_with_status_change_updates_staff_station(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'POST_APPROVE_03', 'station' => 'Old Station']);
        $posting = StaffPosting::factory()->create([
            'service_no' => 'POST_APPROVE_03',
            'station_name' => 'Old Station',
            'status' => 'completed',
        ]);

        $data = [
            'status' => 'active',
        ];

        // Submit change request
        $request = $this->changeRequestService->submit(
            'App\Models\StaffPosting',
            'UPDATE',
            $data,
            $user,
            'POST_APPROVE_03',
            $posting->id
        );

        // Approve the request
        $this->changeRequestService->approve($request->id, $admin);

        // Verify posting record was updated
        $posting->refresh();
        $this->assertEquals('active', $posting->status);

        // Verify staff station was updated
        $staff->refresh();
        $this->assertEquals('Old Station', $staff->station);
    }

    public function test_reject_request_does_not_create_or_update_record(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'POST_REJECT_01']);

        $data = [
            'service_no' => 'POST_REJECT_01',
            'type' => 'farm_center',
            'station_name' => 'Rejected Station',
            'station_location' => '789 Rejected Road',
            'start_date' => '2024-01-15',
            'status' => 'active',
            'reason' => 'Routine posting',
        ];

        // Submit change request
        $request = $this->changeRequestService->submit(
            'App\Models\StaffPosting',
            'CREATE',
            $data,
            $user,
            'POST_REJECT_01'
        );

        // Reject the request
        $this->changeRequestService->reject($request->id, $admin, 'Invalid posting details');

        // Verify request status changed
        $request->refresh();
        $this->assertEquals('REJECTED', $request->status);
        $this->assertEquals('Invalid posting details', $request->rejection_reason);

        // Verify posting record was NOT created
        $this->assertDatabaseMissing('staff_postings', [
            'service_no' => 'POST_REJECT_01',
            'station_name' => 'Rejected Station',
        ]);
    }

    public function test_reject_update_request_does_not_update_record(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'POST_REJECT_02']);
        $posting = StaffPosting::factory()->create([
            'service_no' => 'POST_REJECT_02',
            'station_name' => 'Original Station',
            'remarks' => 'Original remarks',
        ]);

        $data = [
            'station_name' => 'Hacked Station',
            'remarks' => 'Hacked remarks',
        ];

        // Submit change request
        $request = $this->changeRequestService->submit(
            'App\Models\StaffPosting',
            'UPDATE',
            $data,
            $user,
            'POST_REJECT_02',
            $posting->id
        );

        // Reject the request
        $this->changeRequestService->reject($request->id, $admin, 'Unauthorized changes');

        // Verify posting record was NOT updated
        $posting->refresh();
        $this->assertEquals('Original Station', $posting->station_name);
        $this->assertEquals('Original remarks', $posting->remarks);
    }

    public function test_staff_user_cannot_create_posting_without_permission(): void
    {
        $staff = Staff::factory()->create(['service_no' => 'STAFF_POST_01']);
        $this->actingAs($staff, 'sanctum');

        $data = [
            'service_no' => 'STAFF_POST_01',
            'type' => 'farm_center',
            'station_name' => 'Self Service Station',
            'start_date' => '2024-01-15',
            'status' => 'active',
        ];

        // Staff users don't have create permission by default
        $response = $this->postJson('/api/v1/staff-postings', $data);

        $response->assertStatus(403);
    }

    public function test_staff_user_cannot_update_other_staff_posting(): void
    {
        $staff = Staff::factory()->create(['service_no' => 'STAFF_OWN_01']);
        $otherStaff = Staff::factory()->create(['service_no' => 'STAFF_OTHER_02']);
        $posting = StaffPosting::factory()->create([
            'service_no' => 'STAFF_OTHER_02',
            'station_name' => 'Other Staff Station',
        ]);
        $this->actingAs($staff, 'sanctum');

        $response = $this->putJson("/api/v1/staff-postings/{$posting->id}", [
            'station_name' => 'Hacked Station',
        ]);

        $response->assertStatus(403);
    }

    public function test_change_request_preserves_all_posting_data(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'POST_DATA_01']);

        $data = [
            'service_no' => 'POST_DATA_01',
            'type' => 'training_school',
            'station_name' => 'Training School Center',
            'station_location' => '100 Education Lane',
            'start_date' => '2024-03-01',
            'end_date' => '2025-03-01',
            'status' => 'active',
            'reason' => 'Special assignment',
            'remarks' => 'Head of training department',
        ];

        // Submit change request
        $request = $this->changeRequestService->submit(
            'App\Models\StaffPosting',
            'CREATE',
            $data,
            $user,
            'POST_DATA_01'
        );

        // Verify all data is preserved in change request
        $this->assertEquals($data, $request->data);

        // Approve the request
        $this->changeRequestService->approve($request->id, $admin);

        // Verify posting was created with all data
        $this->assertDatabaseHas('staff_postings', [
            'service_no' => 'POST_DATA_01',
            'type' => 'training_school',
            'station_name' => 'Training School Center',
            'station_location' => '100 Education Lane',
            'status' => 'active',
        ]);
    }

    public function test_multiple_change_requests_can_exist_for_same_posting(): void
    {
        $user = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'POST_MULTI_01']);
        $posting = StaffPosting::factory()->create([
            'service_no' => 'POST_MULTI_01',
            'station_name' => 'Original Station',
        ]);
        $this->actingAs($user);

        Gate::define('staff-posting.edit', fn () => true);

        // Submit first update request
        $this->putJson("/api/v1/staff-postings/{$posting->id}", [
            'station_name' => 'First Update Station',
        ]);

        // Submit second update request
        $this->putJson("/api/v1/staff-postings/{$posting->id}", [
            'station_name' => 'Second Update Station',
        ]);

        // Verify both change requests exist
        $this->assertDatabaseHas('change_requests', [
            'model_id' => $posting->id,
            'model_type' => 'App\Models\StaffPosting',
            'type' => 'UPDATE',
            'status' => 'PENDING',
        ]);

        $pendingRequests = \App\Models\ChangeRequest::where('model_id', $posting->id)
            ->where('status', 'PENDING')
            ->count();

        $this->assertEquals(2, $pendingRequests);
    }
}
