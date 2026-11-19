<?php

namespace Tests\Feature\Controllers;

use App\Models\ChangeRequest;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChangeRequestControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_pending_requests()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        // Grant View All permission
        \Illuminate\Support\Facades\Gate::define('change_request.view_all', fn () => true);

        // Assign Scopeless Role so filters don't hide everything
        $role = \App\Models\Role::create(['name' => 'Admin', 'slug' => 'admin', 'scopeless' => true]);
        $user->roles()->attach($role);

        ChangeRequest::factory()->count(3)->create(['status' => 'PENDING', 'requested_by_id' => null, 'requested_by_type' => null, 'approved_by' => null]);
        ChangeRequest::factory()->create(['status' => 'APPROVED', 'requested_by_id' => null, 'requested_by_type' => null, 'approved_by' => null]);

        $response = $this->getJson('/api/v1/change-requests');

        $response->assertStatus(200)
            ->assertJsonCount(4, 'data.data');
    }

    public function test_can_approve_request()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        // Grant permission
        \Illuminate\Support\Facades\Gate::define('change_request.approve', fn () => true);

        $cr = ChangeRequest::factory()->create([
            'status' => 'PENDING',
            'model_type' => Staff::class,
            'type' => 'CREATE',
            'data' => [
                'service_no' => 'SVC_APP_CONT',
                'surname' => 'ControllerApprove',
                'first_name' => 'Test',
                'status' => 1,
            ],
            'requested_by_id' => null,
            'requested_by_type' => null,
            'approved_by' => null,
        ]);

        $response = $this->postJson("/api/v1/change-requests/{$cr->id}/approve");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'Success');

        $this->assertDatabaseHas('change_requests', ['id' => $cr->id, 'status' => 'APPROVED']);
        $this->assertDatabaseHas('staff', ['service_no' => 'SVC_APP_CONT']);
    }

    public function test_can_reject_request()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        // Grant permission
        \Illuminate\Support\Facades\Gate::define('change_request.reject', fn () => true);

        $cr = ChangeRequest::factory()->create([
            'status' => 'PENDING',
            'requested_by_id' => null,
            'requested_by_type' => null,
            'approved_by' => null,
        ]);

        $response = $this->postJson("/api/v1/change-requests/{$cr->id}/reject", [
            'reason' => 'Bad Data',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('change_requests', [
            'id' => $cr->id,
            'status' => 'REJECTED',
            'rejection_reason' => 'Bad Data',
        ]);
    }

    public function test_list_includes_ui_labels_for_foreign_key_payload_fields(): void
    {
        $user = User::factory()->create();

        \Illuminate\Support\Facades\Gate::define('change_request.view_all', fn () => true);

        $role = \App\Models\Role::create(['name' => 'AdminUi', 'slug' => 'admin-ui', 'scopeless' => true]);
        $user->roles()->attach($role);

        $this->actingAs($user);

        $state = \App\Models\State::factory()->create([
            'state' => 'UI Test State Display',
        ]);

        ChangeRequest::factory()->create([
            'status' => 'PENDING',
            'requested_by_id' => null,
            'requested_by_type' => null,
            'approved_by' => null,
            'model_type' => Staff::class,
            'model_id' => null,
            'type' => 'UPDATE',
            'data' => [
                'assigned_state' => $state->id,
            ],
            'service_no' => 'SVC_UI_001',
        ]);

        $response = $this->getJson('/api/v1/change-requests');

        $response->assertStatus(200);

        $records = collect($response->json('data.data'));
        $matching = $records->first(fn (mixed $item) => is_array($item) && ($item['service_no'] ?? null) === 'SVC_UI_001');

        $this->assertIsArray($matching);
        $this->assertSame($state->state, $matching['data_ui']['assigned_state'] ?? null);
    }
}
