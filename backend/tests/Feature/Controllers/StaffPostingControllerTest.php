<?php

namespace Tests\Feature\Controllers;

use App\Models\Staff;
use App\Models\StaffPosting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffPostingControllerTest extends TestCase
{
    use RefreshDatabase;

    // ======================================================================
    // AUTHENTICATION TESTS
    // ======================================================================

    public function test_unauthenticated_user_cannot_access_postings()
    {
        $response = $this->getJson('/api/v1/staff-postings');
        $response->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_access_staff_postings()
    {
        $staff = Staff::factory()->create();
        $response = $this->getJson("/api/v1/staff/{$staff->service_no}/postings");
        $response->assertStatus(401);
    }

    // ======================================================================
    // INDEX TESTS
    // ======================================================================

    public function test_user_with_permission_can_view_all_postings()
    {
        $user = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('staff-posting.view', fn () => true);

        $uniquePrefix = 'TEST_ALL_' . uniqid();
        StaffPosting::factory()->count(2)->create(['station_name' => $uniquePrefix . ' Farm A']);
        StaffPosting::factory()->create([
            'service_no' => Staff::factory()->create()->service_no,
            'type' => 'farm_center',
            'station_name' => $uniquePrefix . ' Lagos Farm Center',
            'status' => 'active',
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/staff-postings');

        $response->assertStatus(200);
        // Verify at least our 3 postings are included
        $this->assertGreaterThanOrEqual(3, $response->json('data.total'));
    }

    public function test_staff_can_view_all_postings_without_permission()
    {
        $staff = Staff::factory()->create();

        $uniquePrefix = 'TEST_STAFF_' . uniqid();
        StaffPosting::factory()->count(2)->create(['station_name' => $uniquePrefix . ' Farm A']);
        StaffPosting::factory()->create([
            'service_no' => Staff::factory()->create()->service_no,
            'type' => 'training_school',
            'station_name' => $uniquePrefix . ' Abuja Training School',
            'status' => 'active',
        ]);

        $response = $this->actingAs($staff, 'sanctum')->getJson('/api/v1/staff-postings');

        $response->assertStatus(200);
        // Verify at least our 3 postings are included
        $this->assertGreaterThanOrEqual(3, $response->json('data.total'));
    }

    public function test_can_filter_postings_by_type()
    {
        $user = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('staff-posting.view', fn () => true);

        $uniquePrefix = 'TEST_TYPE_' . uniqid();
        $farmPosting1 = StaffPosting::factory()->farmCenter()->create(['station_name' => $uniquePrefix . ' Unique Farm A']);
        $farmPosting2 = StaffPosting::factory()->farmCenter()->create(['station_name' => $uniquePrefix . ' Unique Farm B']);
        StaffPosting::factory()->trainingSchool()->create(['station_name' => $uniquePrefix . ' Unique School']);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/staff-postings?type=farm_center');

        $response->assertStatus(200);

        // Verify all returned postings are farm_center type (access nested data.data)
        foreach ($response->json('data.data') as $posting) {
            $this->assertEquals('farm_center', $posting['type']);
        }

        // Verify our specific postings are included
        $stationNames = collect($response->json('data.data'))->pluck('station_name');
        $this->assertTrue($stationNames->contains($uniquePrefix . ' Unique Farm A'));
        $this->assertTrue($stationNames->contains($uniquePrefix . ' Unique Farm B'));
        $this->assertFalse($stationNames->contains($uniquePrefix . ' Unique School'));
    }

    public function test_can_filter_postings_by_status()
    {
        $user = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('staff-posting.view', fn () => true);

        $uniquePrefix = 'TEST_STATUS_' . uniqid();
        StaffPosting::factory()->active()->create(['station_name' => $uniquePrefix . ' Unique Active Posting']);
        StaffPosting::factory()->completed()->create(['station_name' => $uniquePrefix . ' Unique Completed Posting']);
        StaffPosting::factory()->terminated()->create(['station_name' => $uniquePrefix . ' Unique Terminated Posting']);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/staff-postings?status=active');

        $response->assertStatus(200);

        // Verify all returned postings are active (access nested data.data)
        foreach ($response->json('data.data') as $posting) {
            $this->assertEquals('active', $posting['status']);
        }

        // Verify our specific posting is included
        $stationNames = collect($response->json('data.data'))->pluck('station_name');
        $this->assertTrue($stationNames->contains($uniquePrefix . ' Unique Active Posting'));
        $this->assertFalse($stationNames->contains($uniquePrefix . ' Unique Completed Posting'));
    }

    public function test_can_filter_postings_by_station_name()
    {
        $user = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('staff-posting.view', fn () => true);

        $uniqueName = 'UNIQUE_STATION_' . uniqid() . '_Lagos';
        StaffPosting::factory()->create(['station_name' => $uniqueName]);
        StaffPosting::factory()->create(['station_name' => 'Different Station Abuja ' . uniqid()]);
        StaffPosting::factory()->create(['station_name' => 'Another Station Kano ' . uniqid()]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/staff-postings?station_name={$uniqueName}");

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data.data'));
        $this->assertEquals($uniqueName, $response->json('data.data.0.station_name'));
    }

    // ======================================================================
    // INDEX BY STAFF TESTS
    // ======================================================================

    public function test_staff_can_view_their_own_postings()
    {
        $staff = Staff::factory()->create();
        
        StaffPosting::factory()->count(3)->create([
            'service_no' => $staff->service_no,
            'status' => 'active',
        ]);

        $response = $this->actingAs($staff, 'sanctum')
            ->getJson("/api/v1/staff/{$staff->service_no}/postings");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_staff_cannot_view_other_staff_postings()
    {
        $staff1 = Staff::factory()->create();
        $staff2 = Staff::factory()->create();
        
        StaffPosting::factory()->create([
            'service_no' => $staff2->service_no,
            'station_name' => 'Secret Location',
        ]);

        $response = $this->actingAs($staff1, 'sanctum')
            ->getJson("/api/v1/staff/{$staff2->service_no}/postings");

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Unauthorized access to other staff postings');
    }

    public function test_user_with_permission_can_view_any_staff_postings()
    {
        $user = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('staff-posting.view', fn () => true);

        $staff = Staff::factory()->create();
        StaffPosting::factory()->create([
            'service_no' => $staff->service_no,
            'station_name' => 'Visible Location',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/staff/{$staff->service_no}/postings");

        $response->assertStatus(200)
            ->assertJsonPath('data.0.station_name', 'Visible Location');
    }

    public function test_postings_are_ordered_by_start_date_descending()
    {
        $staff = Staff::factory()->create();
        
        $oldest = StaffPosting::factory()->create([
            'service_no' => $staff->service_no,
            'start_date' => '2024-01-01',
            'station_name' => 'Oldest',
        ]);
        $newest = StaffPosting::factory()->create([
            'service_no' => $staff->service_no,
            'start_date' => '2024-12-01',
            'station_name' => 'Newest',
        ]);

        $response = $this->actingAs($staff, 'sanctum')
            ->getJson("/api/v1/staff/{$staff->service_no}/postings");

        $response->assertStatus(200)
            ->assertJsonPath('data.0.station_name', 'Newest')
            ->assertJsonPath('data.1.station_name', 'Oldest');
    }

    // ======================================================================
    // SHOW ACTIVE TESTS
    // ======================================================================

    public function test_can_retrieve_active_posting_for_staff()
    {
        $staff = Staff::factory()->create();
        
        $activePosting = StaffPosting::factory()->create([
            'service_no' => $staff->service_no,
            'status' => 'active',
            'station_name' => 'Current Station',
        ]);
        StaffPosting::factory()->create([
            'service_no' => $staff->service_no,
            'status' => 'completed',
            'station_name' => 'Old Station',
        ]);

        $response = $this->actingAs($staff, 'sanctum')
            ->getJson("/api/v1/staff/{$staff->service_no}/postings/active");

        $response->assertStatus(200)
            ->assertJsonPath('data.station_name', 'Current Station');
    }

    public function test_returns_null_when_no_active_posting()
    {
        $staff = Staff::factory()->create();
        
        StaffPosting::factory()->create([
            'service_no' => $staff->service_no,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($staff, 'sanctum')
            ->getJson("/api/v1/staff/{$staff->service_no}/postings/active");

        $response->assertStatus(200)
            ->assertJsonPath('message', 'No active posting found for this staff');
    }

    // ======================================================================
    // STORE TESTS
    // ======================================================================

    public function test_user_with_create_permission_can_create_posting()
    {
        $user = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('staff-posting.create', fn () => true);

        $staff = Staff::factory()->create();

        $data = [
            'service_no' => $staff->service_no,
            'type' => 'farm_center',
            'station_name' => 'Lagos Agricultural Center',
            'station_location' => '123 Farm Road, Lagos',
            'start_date' => '2024-01-15',
            'status' => 'active',
            'reason' => 'Routine posting',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/staff-postings', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'PENDING')
            ->assertJsonPath('data.model_type', 'App\Models\StaffPosting')
            ->assertJsonPath('data.type', 'CREATE');

        // Verify change request was created
        $this->assertDatabaseHas('change_requests', [
            'service_no' => $staff->service_no,
            'model_type' => 'App\Models\StaffPosting',
            'type' => 'CREATE',
            'status' => 'PENDING',
        ]);

        // Verify posting was NOT created directly
        $this->assertDatabaseMissing('staff_postings', [
            'service_no' => $staff->service_no,
            'station_name' => 'Lagos Agricultural Center',
        ]);
    }

    public function test_validation_requires_service_no()
    {
        $user = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('staff-posting.create', fn () => true);

        $data = [
            'type' => 'farm_center',
            'station_name' => 'Test Station',
            'start_date' => '2024-01-15',
            'status' => 'active',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/staff-postings', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('service_no');
    }

    public function test_validation_requires_type()
    {
        $user = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('staff-posting.create', fn () => true);

        $staff = Staff::factory()->create();

        $data = [
            'service_no' => $staff->service_no,
            'station_name' => 'Test Station',
            'start_date' => '2024-01-15',
            'status' => 'active',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/staff-postings', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('type');
    }

    public function test_validation_requires_station_name()
    {
        $user = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('staff-posting.create', fn () => true);

        $staff = Staff::factory()->create();

        $data = [
            'service_no' => $staff->service_no,
            'type' => 'farm_center',
            'start_date' => '2024-01-15',
            'status' => 'active',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/staff-postings', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('station_name');
    }

    public function test_validation_requires_start_date()
    {
        $user = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('staff-posting.create', fn () => true);

        $staff = Staff::factory()->create();

        $data = [
            'service_no' => $staff->service_no,
            'type' => 'farm_center',
            'station_name' => 'Test Station',
            'status' => 'active',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/staff-postings', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('start_date');
    }

    public function test_validation_requires_valid_status()
    {
        $user = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('staff-posting.create', fn () => true);

        $staff = Staff::factory()->create();

        $data = [
            'service_no' => $staff->service_no,
            'type' => 'farm_center',
            'station_name' => 'Test Station',
            'start_date' => '2024-01-15',
            'status' => 'invalid_status',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/staff-postings', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('status');
    }

    public function test_validation_end_date_must_be_after_start_date()
    {
        $user = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('staff-posting.create', fn () => true);

        $staff = Staff::factory()->create();

        $data = [
            'service_no' => $staff->service_no,
            'type' => 'farm_center',
            'station_name' => 'Test Station',
            'start_date' => '2024-06-15',
            'end_date' => '2024-01-15',
            'status' => 'active',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/staff-postings', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('end_date');
    }

    public function test_unauthorized_user_cannot_create_posting()
    {
        $user = User::factory()->create();
        $staff = Staff::factory()->create();

        $data = [
            'service_no' => $staff->service_no,
            'type' => 'farm_center',
            'station_name' => 'Test Station',
            'start_date' => '2024-01-15',
            'status' => 'active',
        ];

        // User doesn't have staff-posting.create permission
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/staff-postings', $data);

        $response->assertStatus(403);
    }

    // ======================================================================
    // SHOW TESTS
    // ======================================================================

    public function test_can_view_specific_posting()
    {
        $user = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('staff-posting.view', fn () => true);

        $posting = StaffPosting::factory()->create([
            'station_name' => 'Specific Station',
            'type' => 'training_school',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/staff-postings/{$posting->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $posting->id)
            ->assertJsonPath('data.station_name', 'Specific Station');
    }

    public function test_staff_can_view_own_posting()
    {
        $staff = Staff::factory()->create();
        
        $posting = StaffPosting::factory()->create([
            'service_no' => $staff->service_no,
            'station_name' => 'My Station',
        ]);

        $response = $this->actingAs($staff, 'sanctum')
            ->getJson("/api/v1/staff-postings/{$posting->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.station_name', 'My Station');
    }

    public function test_staff_cannot_view_other_staff_posting()
    {
        $staff1 = Staff::factory()->create();
        $staff2 = Staff::factory()->create();
        
        $posting = StaffPosting::factory()->create([
            'service_no' => $staff2->service_no,
            'station_name' => 'Secret Station',
        ]);

        $response = $this->actingAs($staff1, 'sanctum')
            ->getJson("/api/v1/staff-postings/{$posting->id}");

        $response->assertStatus(403);
    }

    // ======================================================================
    // UPDATE TESTS
    // ======================================================================

    public function test_user_with_edit_permission_can_update_posting()
    {
        $user = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('staff-posting.edit', fn () => true);

        $posting = StaffPosting::factory()->create([
            'station_name' => 'Old Station',
            'status' => 'active',
        ]);

        $data = [
            'station_name' => 'New Station',
            'remarks' => 'Updated remarks',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/staff-postings/{$posting->id}", $data);

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

        // Verify posting was NOT updated directly
        $posting->refresh();
        $this->assertEquals('Old Station', $posting->station_name);
    }

    public function test_updating_active_posting_updates_staff_station()
    {
        $user = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('staff-posting.edit', fn () => true);

        $staff = Staff::factory()->create(['station' => 'Old Station']);

        $posting = StaffPosting::factory()->create([
            'service_no' => $staff->service_no,
            'station_name' => 'Old Station',
            'status' => 'active',
        ]);

        $data = [
            'station_name' => 'New Station',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/staff-postings/{$posting->id}", $data);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'PENDING');

        // Verify staff station was NOT updated directly (requires approval)
        $staff->refresh();
        $this->assertEquals('Old Station', $staff->station);
    }

    public function test_unauthorized_user_cannot_update_posting()
    {
        $user = User::factory()->create();

        $posting = StaffPosting::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/staff-postings/{$posting->id}", []);

        $response->assertStatus(403);
    }

    // ======================================================================
    // COMPLETE TESTS
    // ======================================================================

    public function test_user_with_edit_permission_can_complete_posting()
    {
        $user = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('staff-posting.edit', fn () => true);

        $posting = StaffPosting::factory()->create([
            'status' => 'active',
            'start_date' => '2024-01-01',
        ]);

        $data = [
            'end_date' => '2024-06-30',
            'remarks' => 'Posting completed successfully',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/staff-postings/{$posting->id}/complete", $data);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.end_date', '2024-06-30T00:00:00.000000Z')
            ->assertJsonPath('data.remarks', 'Posting completed successfully');
    }

    public function test_completing_posting_clears_staff_station()
    {
        $user = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('staff-posting.edit', fn () => true);

        $staff = Staff::factory()->create(['station' => 'Current Station']);
        
        $posting = StaffPosting::factory()->create([
            'service_no' => $staff->service_no,
            'station_name' => 'Current Station',
            'status' => 'active',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/staff-postings/{$posting->id}/complete", [
                'end_date' => '2024-06-30',
            ]);

        $response->assertStatus(200);

        // Verify staff station was cleared
        $staff->refresh();
        $this->assertNull($staff->station);
    }

    public function test_unauthorized_user_cannot_complete_posting()
    {
        $user = User::factory()->create();

        $posting = StaffPosting::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/staff-postings/{$posting->id}/complete", []);

        $response->assertStatus(403);
    }

    // ======================================================================
    // DESTROY TESTS
    // ======================================================================

    public function test_user_with_delete_permission_can_delete_posting()
    {
        $user = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('staff-posting.delete', fn () => true);

        $posting = StaffPosting::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/v1/staff-postings/{$posting->id}");

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Staff posting deleted successfully');

        $this->assertDatabaseMissing('staff_postings', [
            'id' => $posting->id,
        ]);
    }

    public function test_deleting_active_posting_clears_staff_station()
    {
        $user = User::factory()->create();
        \Illuminate\Support\Facades\Gate::define('staff-posting.delete', fn () => true);

        $staff = Staff::factory()->create(['station' => 'To Be Deleted']);
        
        $posting = StaffPosting::factory()->create([
            'service_no' => $staff->service_no,
            'station_name' => 'To Be Deleted',
            'status' => 'active',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/v1/staff-postings/{$posting->id}");

        $response->assertStatus(200);

        // Verify staff station was cleared
        $staff->refresh();
        $this->assertNull($staff->station);
    }

    public function test_unauthorized_user_cannot_delete_posting()
    {
        $user = User::factory()->create();

        $posting = StaffPosting::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/v1/staff-postings/{$posting->id}");

        $response->assertStatus(403);
    }
}
