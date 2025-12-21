<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffRoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_assign_role_to_staff()
    {
        $admin = User::factory()->create();
        $staff = Staff::factory()->create();
        $role = Role::create(['name' => 'Staff Role', 'slug' => 'staff-role']);

        \Illuminate\Support\Facades\Gate::define('staff.delete', fn() => true);

        $response = $this->actingAs($admin)->postJson("/api/v1/staff/{$staff->service_no}/roles", [
            'role_id' => $role->id,
        ]);

        $response->assertStatus(200);
        $this->assertTrue($staff->roles()->where('slug', 'staff-role')->exists());
    }

    public function test_can_remove_role_from_staff()
    {
        $admin = User::factory()->create();
        $staff = Staff::factory()->create();
        $role = Role::create(['name' => 'Staff Role', 'slug' => 'staff-role']);
        $staff->roles()->attach($role);

        \Illuminate\Support\Facades\Gate::define('staff.delete', fn() => true);

        $response = $this->actingAs($admin)->deleteJson("/api/v1/staff/{$staff->service_no}/roles/{$role->id}");

        $response->assertStatus(200);
        $this->assertFalse($staff->roles()->where('slug', 'staff-role')->exists());
    }
}
