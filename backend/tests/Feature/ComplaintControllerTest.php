<?php

namespace Tests\Feature;

use App\Models\Complaint;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Staff;
use App\Models\State;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ComplaintControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Permission::firstOrCreate(['name' => 'complaint.view']);
        Permission::firstOrCreate(['name' => 'complaint.create']);
        Permission::firstOrCreate(['name' => 'complaint.resolve']);
        Permission::firstOrCreate(['name' => 'complaint.delete']);
        (new \App\Providers\AppServiceProvider($this->app))->boot(); // Reboot gates
    }

    public function test_user_without_permission_sees_only_own_complaints()
    {
        $me = Staff::factory()->create(['password' => Hash::make('password')]);
        $other = Staff::factory()->create();

        Complaint::create(['subject' => 'My Complaint', 'category' => 'IT', 'created_by' => $me->id, 'created_by_type' => Staff::class]);
        Complaint::create(['subject' => 'Other Complaint', 'category' => 'IT', 'created_by' => $other->id, 'created_by_type' => Staff::class]);

        $response = $this->actingAs($me)->getJson('/api/v1/complaints');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.subject', 'My Complaint');
    }

    public function test_scopeless_admin_sees_all_complaints()
    {
        $admin = Staff::factory()->create();
        $role = Role::create(['name' => 'Admin', 'slug' => 'admin', 'scopeless' => true]);
        $role->permissions()->attach(Permission::where('name', 'complaint.view')->first());
        $admin->roles()->attach($role);

        Complaint::create(['subject' => 'C1', 'category' => 'IT', 'created_by' => $admin->id, 'created_by_type' => Staff::class]);
        Complaint::create(['subject' => 'C2', 'category' => 'IT', 'created_by' => Staff::factory()->create()->id, 'created_by_type' => Staff::class]);

        $response = $this->actingAs($admin)->getJson('/api/v1/complaints');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data.data');
    }

    public function test_state_scoped_admin_sees_only_state_complaints()
    {
        $state1 = State::factory()->create();
        $state2 = State::factory()->create();

        $admin = Staff::factory()->create(['assigned_state' => $state1->id]);
        // Role is NOT scopeless
        $role = Role::create(['name' => 'State Admin', 'slug' => 'state-admin', 'scopeless' => false]);
        $role->permissions()->attach(Permission::where('name', 'complaint.view')->first());
        $admin->roles()->attach($role);

        $staffInState1 = Staff::factory()->create(['assigned_state' => $state1->id]);
        $staffInState2 = Staff::factory()->create(['assigned_state' => $state2->id]);

        Complaint::create(['subject' => 'State 1 Complaint', 'category' => 'IT', 'created_by' => $staffInState1->id, 'created_by_type' => Staff::class]);
        Complaint::create(['subject' => 'State 2 Complaint', 'category' => 'IT', 'created_by' => $staffInState2->id, 'created_by_type' => Staff::class]);

        $response = $this->actingAs($admin)->getJson('/api/v1/complaints');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.subject', 'State 1 Complaint');
    }

    public function test_admin_can_view_own_complaints_explicitly()
    {
        $admin = Staff::factory()->create();
        $role = Role::create(['name' => 'Admin', 'slug' => 'admin', 'scopeless' => true]);
        $role->permissions()->attach(Permission::where('name', 'complaint.view')->first());
        $admin->roles()->attach($role);

        Complaint::create(['subject' => 'Admin Complaint', 'category' => 'IT', 'created_by' => $admin->id, 'created_by_type' => Staff::class]);
        Complaint::create(['subject' => 'Other Complaint', 'category' => 'IT', 'created_by' => Staff::factory()->create()->id, 'created_by_type' => Staff::class]);

        $response = $this->actingAs($admin)->getJson('/api/v1/complaints?mine=true');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.subject', 'Admin Complaint');
    }

    public function test_unauthorized_user_cannot_update_status()
    {
        $user = Staff::factory()->create();
        $complaint = Complaint::create([
            'subject' => 'Test',
            'category' => 'IT',
            'created_by' => $user->id,
            'created_by_type' => Staff::class,
            'status' => 'open',
        ]);

        // User does not have complaint.resolve permission
        $response = $this->actingAs($user)->patchJson("/api/v1/complaints/{$complaint->id}/status", [
            'status' => 'resolved',
        ]);

        // Should be forbidden (403)
        $response->assertStatus(403);
    }

    public function test_authorized_admin_can_update_status()
    {
        $admin = Staff::factory()->create();
        $role = Role::create(['name' => 'Resolver', 'slug' => 'resolver', 'scopeless' => true]);
        $role->permissions()->attach(Permission::firstOrCreate(['name' => 'complaint.resolve']));
        $admin->roles()->attach($role);

        $complaint = Complaint::create(['subject' => 'Test', 'category' => 'IT', 'created_by' => Staff::factory()->create()->id, 'created_by_type' => Staff::class]);

        $response = $this->actingAs($admin)->patchJson("/api/v1/complaints/{$complaint->id}/status", [
            'status' => 'resolved',
        ]);

        $response->assertStatus(200);
        $this->assertEquals('resolved', $complaint->fresh()->status);
    }

    public function test_scoped_admin_cannot_update_out_of_scope_complaint()
    {
        $state1 = State::factory()->create();
        $state2 = State::factory()->create();

        $admin = Staff::factory()->create(['assigned_state' => $state1->id]);
        $role = Role::create(['name' => 'State Resolver', 'slug' => 'state-resolver', 'state_id' => $state1->id, 'scopeless' => false]);
        $role->permissions()->attach(Permission::firstOrCreate(['name' => 'complaint.resolve']));
        $admin->roles()->attach($role);

        // Complaint created by staff in State 2
        $targetStaff = Staff::factory()->create(['assigned_state' => $state2->id]);
        $complaint = Complaint::create(['subject' => 'Out of Scope', 'category' => 'IT', 'created_by' => $targetStaff->id, 'created_by_type' => Staff::class]);

        $response = $this->actingAs($admin)->patchJson("/api/v1/complaints/{$complaint->id}/status", [
            'status' => 'resolved',
        ]);

        $response->assertStatus(403);
    }

    public function test_unauthorized_user_cannot_delete_complaint()
    {
        $user = Staff::factory()->create();
        $complaint = Complaint::create(['subject' => 'To Delete', 'category' => 'IT', 'created_by' => $user->id, 'created_by_type' => Staff::class]);

        $response = $this->actingAs($user)->deleteJson("/api/v1/complaints/{$complaint->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('complaints', ['id' => $complaint->id]);
    }

    public function test_authorized_admin_can_delete_complaint()
    {
        $admin = Staff::factory()->create();
        $role = Role::create(['name' => 'Deleter', 'slug' => 'deleter', 'scopeless' => true]);
        $role->permissions()->attach(Permission::firstOrCreate(['name' => 'complaint.delete']));
        $admin->roles()->attach($role);

        $complaint = Complaint::create(['subject' => 'To Delete', 'category' => 'IT', 'created_by' => Staff::factory()->create()->id, 'created_by_type' => Staff::class]);

        $response = $this->actingAs($admin)->deleteJson("/api/v1/complaints/{$complaint->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('complaints', ['id' => $complaint->id]);
    }
}
