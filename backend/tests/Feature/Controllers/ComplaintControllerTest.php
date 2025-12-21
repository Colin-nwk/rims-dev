<?php

namespace Tests\Feature\Controllers;

use App\Models\Complaint;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Staff;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

    public function test_unauthenticated_user_cannot_access_complaints()
    {
        $response = $this->getJson('/api/v1/complaints');
        $response->assertStatus(401);
    }

    public function test_staff_can_list_own_complaints()
    {
        $staff = Staff::factory()->create();
        $this->actingAs($staff, 'sanctum');

        Complaint::factory()->count(3)->create(['created_by' => $staff->id]);
        Complaint::factory()->create(); // Another staff's complaint

        $response = $this->getJson('/api/v1/complaints');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'Success')
            ->assertJsonCount(3, 'data.data');
    }

    public function test_staff_can_create_complaint()
    {
        $staff = Staff::factory()->create();
        $this->actingAs($staff, 'sanctum');

        $data = [
            'subject' => 'Test Complaint',
            'category' => 'IT',
            'priority' => 'high',
        ];

        $response = $this->postJson('/api/v1/complaints', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.subject', 'Test Complaint')
            ->assertJsonPath('data.category', 'IT')
            ->assertJsonPath('data.priority', 'high')
            ->assertJsonPath('data.status', 'open');

        $this->assertDatabaseHas('complaints', [
            'subject' => 'Test Complaint',
            'created_by' => $staff->id,
        ]);
    }

    public function test_staff_can_view_complaint()
    {
        $staff = Staff::factory()->create();
        $this->actingAs($staff, 'sanctum');

        $complaint = Complaint::factory()->create(['created_by' => $staff->id]);

        $response = $this->getJson("/api/v1/complaints/{$complaint->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $complaint->id)
            ->assertJsonPath('data.subject', $complaint->subject);
    }

    public function test_staff_can_add_message_to_complaint()
    {
        $staff = Staff::factory()->create();
        $this->actingAs($staff, 'sanctum');

        $complaint = Complaint::factory()->create(['created_by' => $staff->id]);

        $response = $this->postJson("/api/v1/complaints/{$complaint->id}/messages", [
            'content' => 'This is a test message',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'Success');

        $this->assertDatabaseHas('complaint_messages', [
            'complaint_id' => $complaint->id,
            'content' => 'This is a test message',
        ]);
    }

    public function test_staff_can_update_complaint_status()
    {
        $staff = Staff::factory()->create();

        // Assign resolve permission
        $role = Role::create(['name' => 'Resolver', 'slug' => 'resolver', 'scopeless' => true]);
        $role->permissions()->attach(Permission::firstOrCreate(['name' => 'complaint.resolve']));
        $staff->roles()->attach($role);

        $this->actingAs($staff, 'sanctum');

        $complaint = Complaint::factory()->create([
            'created_by' => $staff->id,
            'status' => 'open',
        ]);

        $response = $this->patchJson("/api/v1/complaints/{$complaint->id}/status", [
            'status' => 'resolved',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'resolved');

        $this->assertDatabaseHas('complaints', [
            'id' => $complaint->id,
            'status' => 'resolved',
        ]);
    }

    public function test_adding_message_reopens_resolved_complaint()
    {
        $staff = Staff::factory()->create();
        $this->actingAs($staff, 'sanctum');

        $complaint = Complaint::factory()->create([
            'created_by' => $staff->id,
            'status' => 'resolved',
        ]);

        $this->postJson("/api/v1/complaints/{$complaint->id}/messages", [
            'content' => 'Follow up message',
        ]);

        $this->assertDatabaseHas('complaints', [
            'id' => $complaint->id,
            'status' => 'in-progress',
        ]);
    }

    public function test_staff_can_delete_complaint()
    {
        $staff = Staff::factory()->create();

        // Assign delete permission
        $role = Role::create(['name' => 'Deleter', 'slug' => 'deleter', 'scopeless' => true]);
        $role->permissions()->attach(Permission::firstOrCreate(['name' => 'complaint.delete']));
        $staff->roles()->attach($role);

        $this->actingAs($staff, 'sanctum');

        $complaint = Complaint::factory()->create(['created_by' => $staff->id]);

        $response = $this->deleteJson("/api/v1/complaints/{$complaint->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('complaints', [
            'id' => $complaint->id,
        ]);
    }

    public function test_validation_fails_for_invalid_data()
    {
        $staff = Staff::factory()->create();
        $this->actingAs($staff, 'sanctum');

        $response = $this->postJson('/api/v1/complaints', [
            'subject' => '', // Empty subject
            'category' => 'InvalidCategory',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['subject', 'category']);
    }
}
