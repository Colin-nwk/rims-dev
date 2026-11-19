<?php

namespace Tests\Feature;

use App\Models\Staff;
use App\Models\StaffEducation;
use App\Models\User;
use App\Services\ChangeRequestService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StaffEducationApprovalTest extends TestCase
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
        $staff = Staff::factory()->create(['service_no' => 'EDU_TEST_01']);
        $this->actingAs($user);

        Gate::define('staff-education.create', fn () => true);

        $data = [
            'service_no' => 'EDU_TEST_01',
            'institution' => 'Test University',
            'course' => 'Computer Science',
            'type' => 'Bachelors',
            'start_date' => '2020-01-01',
            'end_date' => '2024-01-01',
        ];

        $response = $this->postJson('/api/v1/staff-education', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'PENDING')
            ->assertJsonPath('data.model_type', 'App\Models\StaffEducation')
            ->assertJsonPath('data.type', 'CREATE');

        // Verify change request was created
        $this->assertDatabaseHas('change_requests', [
            'service_no' => 'EDU_TEST_01',
            'model_type' => 'App\Models\StaffEducation',
            'type' => 'CREATE',
            'status' => 'PENDING',
        ]);

        // Verify education record was NOT created yet
        $this->assertDatabaseMissing('staff_education', [
            'service_no' => 'EDU_TEST_01',
            'institution' => 'Test University',
        ]);
    }

    public function test_update_creates_change_request_instead_of_direct_update(): void
    {
        $user = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'EDU_TEST_02']);
        $education = StaffEducation::factory()->create([
            'service_no' => 'EDU_TEST_02',
            'institution' => 'Old University',
            'type' => 'Bachelors',
        ]);
        $this->actingAs($user);

        Gate::define('staff-education.edit', fn () => true);

        $data = [
            'institution' => 'New University',
            'course' => 'New Course',
            'type' => 'Masters',
            'start_date' => '2024-01-01',
        ];

        $response = $this->putJson("/api/v1/staff-education/{$education->id}", $data);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'PENDING')
            ->assertJsonPath('data.model_type', 'App\Models\StaffEducation')
            ->assertJsonPath('data.type', 'UPDATE');

        // Verify change request was created
        $this->assertDatabaseHas('change_requests', [
            'model_id' => $education->id,
            'model_type' => 'App\Models\StaffEducation',
            'type' => 'UPDATE',
            'status' => 'PENDING',
        ]);

        // Verify education record was NOT updated yet
        $education->refresh();
        $this->assertEquals('Old University', $education->institution);
    }

    public function test_delete_does_not_require_approval(): void
    {
        $user = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'EDU_TEST_03']);
        $education = StaffEducation::factory()->create([
            'service_no' => 'EDU_TEST_03',
            'institution' => 'Delete Test University',
        ]);
        $this->actingAs($user);

        Gate::define('staff-education.delete', fn () => true);

        $response = $this->deleteJson("/api/v1/staff-education/{$education->id}");

        $response->assertStatus(200);

        // Verify education was deleted directly (no change request)
        $this->assertDatabaseMissing('staff_education', ['id' => $education->id]);
        $this->assertDatabaseMissing('change_requests', [
            'model_id' => $education->id,
            'model_type' => 'App\Models\StaffEducation',
            'type' => 'DELETE',
        ]);
    }

    public function test_delete_clears_change_request_file_path(): void
    {
        $user = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'EDU_CLR_01']);

        Storage::fake('public');
        $file = UploadedFile::fake()->create('certificate.pdf', 100);
        $path = $file->store('staff/education', 'public');

        $education = StaffEducation::factory()->create([
            'service_no' => 'EDU_CLR_01',
            'url' => $path,
        ]);

        $changeRequest = $this->changeRequestService->submit(
            StaffEducation::class,
            'UPDATE',
            ['url' => $path],
            $user,
            $education->service_no,
            $education->id
        );

        $this->actingAs($user);
        Gate::define('staff-education.delete', fn () => true);

        $response = $this->deleteJson("/api/v1/staff-education/{$education->id}");

        $response->assertStatus(200);

        $changeRequest->refresh();
        $this->assertNull($changeRequest->data['url'] ?? null);
    }

    public function test_approve_create_request_creates_education_record(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'EDU_APPROVE_01']);

        $data = [
            'service_no' => 'EDU_APPROVE_01',
            'institution' => 'Approved University',
            'course' => 'Approved Course',
            'type' => 'Bachelors',
            'start_date' => '2020-01-01',
            'end_date' => '2024-01-01',
        ];

        // Submit change request
        $request = $this->changeRequestService->submit(
            'App\Models\StaffEducation',
            'CREATE',
            $data,
            $user,
            'EDU_APPROVE_01'
        );

        // Approve the request
        $this->changeRequestService->approve($request->id, $admin);

        // Verify request status changed
        $request->refresh();
        $this->assertEquals('APPROVED', $request->status);
        $this->assertEquals($admin->id, $request->approved_by);

        // Verify education record was created
        $this->assertDatabaseHas('staff_education', [
            'service_no' => 'EDU_APPROVE_01',
            'institution' => 'Approved University',
            'course' => 'Approved Course',
        ]);
    }

    public function test_approve_update_request_updates_education_record(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'EDU_APPROVE_02']);
        $education = StaffEducation::factory()->create([
            'service_no' => 'EDU_APPROVE_02',
            'institution' => 'Old Institution',
            'course' => 'Old Course',
        ]);

        $data = [
            'institution' => 'Updated Institution',
            'course' => 'Updated Course',
        ];

        // Submit change request
        $request = $this->changeRequestService->submit(
            'App\Models\StaffEducation',
            'UPDATE',
            $data,
            $user,
            'EDU_APPROVE_02',
            $education->id
        );

        // Approve the request
        $this->changeRequestService->approve($request->id, $admin);

        // Verify request status changed
        $request->refresh();
        $this->assertEquals('APPROVED', $request->status);

        // Verify education record was updated
        $education->refresh();
        $this->assertEquals('Updated Institution', $education->institution);
        $this->assertEquals('Updated Course', $education->course);
    }

    public function test_reject_request_does_not_create_or_update_record(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'EDU_REJECT_01']);

        $data = [
            'service_no' => 'EDU_REJECT_01',
            'institution' => 'Rejected University',
            'course' => 'Rejected Course',
            'type' => 'Bachelors',
            'start_date' => '2020-01-01',
        ];

        // Submit change request
        $request = $this->changeRequestService->submit(
            'App\Models\StaffEducation',
            'CREATE',
            $data,
            $user,
            'EDU_REJECT_01'
        );

        // Reject the request
        $this->changeRequestService->reject($request->id, $admin, 'Invalid data provided');

        // Verify request status changed
        $request->refresh();
        $this->assertEquals('REJECTED', $request->status);
        $this->assertEquals('Invalid data provided', $request->rejection_reason);

        // Verify education record was NOT created
        $this->assertDatabaseMissing('staff_education', [
            'service_no' => 'EDU_REJECT_01',
            'institution' => 'Rejected University',
        ]);
    }

    public function test_staff_user_can_create_own_education_request(): void
    {
        $staff = Staff::factory()->create(['service_no' => 'STAFF_SELF_01']);
        $this->actingAs($staff, 'sanctum');

        $data = [
            'service_no' => 'STAFF_SELF_01',
            'institution' => 'Self Service University',
            'course' => 'Self Course',
            'type' => 'Bachelors',
            'start_date' => '2020-01-01',
        ];

        $response = $this->postJson('/api/v1/staff-education', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'PENDING');

        // Verify change request was created with staff's service_no
        $this->assertDatabaseHas('change_requests', [
            'service_no' => 'STAFF_SELF_01',
            'model_type' => 'App\Models\StaffEducation',
            'type' => 'CREATE',
            'status' => 'PENDING',
        ]);
    }

    public function test_staff_user_can_update_own_education_request(): void
    {
        $staff = Staff::factory()->create(['service_no' => 'STAFF_SELF_02']);
        $education = StaffEducation::factory()->create([
            'service_no' => 'STAFF_SELF_02',
            'institution' => 'Original University',
        ]);
        $this->actingAs($staff, 'sanctum');

        $data = [
            'institution' => 'Updated Self Service University',
            'course' => 'Updated Course',
            'type' => 'Masters',
            'start_date' => '2024-01-01',
        ];

        $response = $this->putJson("/api/v1/staff-education/{$education->id}", $data);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'PENDING');

        // Verify change request was created
        $this->assertDatabaseHas('change_requests', [
            'model_id' => $education->id,
            'model_type' => 'App\Models\StaffEducation',
            'type' => 'UPDATE',
            'status' => 'PENDING',
        ]);

        // Verify original record unchanged
        $education->refresh();
        $this->assertEquals('Original University', $education->institution);
    }

    public function test_staff_user_cannot_update_other_staff_education(): void
    {
        $staff = Staff::factory()->create(['service_no' => 'STAFF_OWN_01']);
        $otherStaff = Staff::factory()->create(['service_no' => 'STAFF_OTHER_01']);
        $education = StaffEducation::factory()->create([
            'service_no' => 'STAFF_OTHER_01',
            'institution' => 'Other Staff University',
        ]);
        $this->actingAs($staff, 'sanctum');

        $response = $this->putJson("/api/v1/staff-education/{$education->id}", [
            'institution' => 'Hacked University',
        ]);

        $response->assertStatus(403);
    }
}
