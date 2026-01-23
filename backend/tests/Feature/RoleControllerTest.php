<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();

        // Create necessary permissions for role management
        $permissions = [
            'role.view', 'role.create', 'role.edit', 'role.delete',
        ];

        $rolePermissions = [];
        foreach ($permissions as $name) {
            $rolePermissions[] = Permission::create(['name' => $name]);
        }

        // Create Super Admin role
        $role = Role::create(['name' => 'Super Admin', 'slug' => 'super-admin', 'scopeless' => true]);
        $role->permissions()->saveMany($rolePermissions); // Attach all permissions

        // Setup an authenticated user (acting as admin)
        $this->admin = User::factory()->create();
        $this->admin->roles()->attach($role); // Assign role to user

        // Re-boot gates to pick up new permissions
        (new \App\Providers\AppServiceProvider($this->app))->boot();
    }

    public function test_cannot_access_without_permission()
    {
        $user = User::factory()->create(); // User without roles

        $response = $this->actingAs($user)->getJson('/api/v1/roles');
        $response->assertStatus(403);

        // Provide valid data so validation passes and we hit the controller's authorization check.
        $response = $this->actingAs($user)->postJson('/api/v1/roles', ['name' => 'Fail', 'slug' => 'fail']);
        $response->assertStatus(403);
    }

    public function test_can_list_roles()
    {
        Role::create(['name' => 'Admin', 'slug' => 'admin']);
        Role::create(['name' => 'Editor', 'slug' => 'editor']);

        $response = $this->actingAs($this->admin)->getJson('/api/v1/roles');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data'); // 2 created + 1 Super Admin from setUp
    }

    public function test_can_create_role_with_permissions()
    {
        $permission = Permission::create(['name' => 'view-dashboard']);

        $payload = [
            'name' => 'Manager',
            'slug' => 'manager',
            'permissions' => [$permission->id],
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/v1/roles', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Manager');

        $this->assertDatabaseHas('roles', ['slug' => 'manager']);
        $this->assertDatabaseHas('permission_role', ['permission_id' => $permission->id]);
    }

    public function test_can_update_role()
    {
        $role = Role::create(['name' => 'Old Name', 'slug' => 'old']);

        $payload = ['name' => 'New Name'];

        $response = $this->actingAs($this->admin)->putJson("/api/v1/roles/{$role->id}", $payload);

        $response->assertStatus(200);
        $this->assertDatabaseHas('roles', ['id' => $role->id, 'name' => 'New Name']);
    }

    public function test_can_delete_role()
    {
        $role = Role::create(['name' => 'To Delete', 'slug' => 'delete']);

        $response = $this->actingAs($this->admin)->deleteJson("/api/v1/roles/{$role->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }

    public function test_can_sync_permissions()
    {
        $role = Role::create(['name' => 'Role', 'slug' => 'role']);
        $p1 = Permission::create(['name' => 'p1']);
        $p2 = Permission::create(['name' => 'p2']);

        $response = $this->actingAs($this->admin)->postJson("/api/v1/roles/{$role->id}/permissions/sync", [
            'permissions' => [$p1->id, $p2->id],
        ]);

        $response->assertStatus(200);
        $this->assertTrue($role->permissions()->where('permission_id', $p1->id)->exists());
        $this->assertTrue($role->permissions()->where('permission_id', $p2->id)->exists());
    }
}
