<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Prison;
use App\Models\Role;
use App\Models\Staff;
use App\Models\State;
use App\Models\Zone;
use App\Providers\AppServiceProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class ScopedAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_scopeless_role_can_access_any_resource()
    {
        // Setup Geography
        $zone = Zone::create(['zone' => 'Zone A', 'status' => true]);
        $state = State::create(['state' => 'State A', 'capital' => 'City A', 'zone_id' => $zone->id, 'status' => true]);
        $prison = Prison::create(['prison_name' => 'Prison A', 'address' => 'addr', 'capacity' => 100, 'state_id' => $state->id, 'active' => true]);

        // Setup Permission
        $permission = Permission::create(['name' => 'view-staff']);

        // Setup Role (Scopeless)
        $role = Role::create(['name' => 'Global Admin', 'slug' => 'global-admin', 'scopeless' => true]);
        $role->permissions()->attach($permission);

        // Setup User
        $user = Staff::factory()->create();
        $user->roles()->attach($role);

        // Setup Target Resource
        $target = Staff::factory()->create(['prison' => $prison->id, 'assigned_state' => $state->id, 'zone_id' => $zone->id]);

        // Re-boot gates
        (new AppServiceProvider($this->app))->boot();

        // Act & Assert
        $this->actingAs($user);
        $this->assertTrue(Gate::allows('view-staff', $target));
    }

    public function test_prison_scoped_role_can_only_access_same_prison()
    {
        // Setup Geography
        $zone = Zone::create(['zone' => 'Zone A', 'status' => true]);
        $state = State::create(['state' => 'State A', 'capital' => 'City A', 'zone_id' => $zone->id, 'status' => true]);
        $prisonA = Prison::create(['prison_name' => 'Prison A', 'address' => 'addr A', 'capacity' => 100, 'state_id' => $state->id, 'active' => true]);
        $prisonB = Prison::create(['prison_name' => 'Prison B', 'address' => 'addr B', 'capacity' => 100, 'state_id' => $state->id, 'active' => true]);

        // Setup Permission
        $permission = Permission::create(['name' => 'view-staff']);

        // Setup Role (Scoped to Prison A)
        $role = Role::create([
            'name' => 'Prison Admin',
            'slug' => 'prison-admin',
            'prison_id' => $prisonA->id,
            'scopeless' => false,
        ]);
        $role->permissions()->attach($permission);

        // Setup User
        $user = Staff::factory()->create();
        $user->roles()->attach($role);

        // Target In Prison A (Should Allow)
        $targetA = Staff::factory()->create(['prison' => $prisonA->id]);

        // Target In Prison B (Should Deny)
        $targetB = Staff::factory()->create(['prison' => $prisonB->id]);

        // Act & Assert
        $this->actingAs($user);

        // We need to re-boot or simulate provider logic since permissions created in test might not be loaded in Gate
        // But AppServiceProvider boot runs at start.
        // We need to force a reboot of the authorization logic?
        // Actually, Gate definitions are loaded once. creating permissions afterwards won't register them.
        // We must manually trigger the gate registration or move the logic to a place where we can refresh it.
        // Or simply iterate permissions in the test and define the gate manually using the same logic for testing purposes,
        // BUT we want to test the AppServiceProvider logic.

        // Hack: Invoke the boot logic again or extract it.
        // Better: Use a dedicated Service Provider for Permissions and manually boot it in tests,
        // OR simply refresh application?
        // $this->refreshApplication(); // Heavy.

        // Let's call the boot logic manually within the test environment context if possible.
        // Or just redefine the specific gate using the logic we want to test? No, that defeats the purpose of integration test.

        // Since `boot` is run when the app starts, for features tests, the app is booted.
        // New permissions created effectively won't have Gates defined.

        // Workaround: Define the gate manually in the test matching the logic,
        // OR make the PermissionGateServiceProvider logic dynamic (using `Gate::before` to look up DB)?
        // NOTE: Dynamic lookup is standard for this. `Gate::before` is called on every check.
        // My implementation in AppServiceProvider loops strictly once. This is "Cached Permissions" pattern.
        // It requires cache clearing when permissions change.

        // For testing, I'll extract the registration logic to a trait or method I can call.
        // Or I can just manually define the gate in the test to verify the LOGIC, assuming the iteration works.
        // But let's try to verify the actual ServiceProvider.
        // I will restart the app boot cycle?

        // Re-executing the boot method:
        (new \App\Providers\AppServiceProvider($this->app))->boot();

        $this->assertTrue(Gate::allows('view-staff', $targetA), 'Should allow access to same prison');
        $this->assertFalse(Gate::allows('view-staff', $targetB), 'Should deny access to different prison');
    }

    public function test_state_scoped_role_can_access_any_prison_in_state()
    {
        // Setup Geography
        $zone = Zone::create(['zone' => 'Zone A', 'status' => true]);
        $stateA = State::create(['state' => 'State A', 'capital' => 'City A', 'zone_id' => $zone->id, 'status' => true]);
        $stateB = State::create(['state' => 'State B', 'capital' => 'City B', 'zone_id' => $zone->id, 'status' => true]);

        $prisonInStateA = Prison::create(['prison_name' => 'Prison A1', 'address' => 'addr A1', 'capacity' => 100, 'state_id' => $stateA->id, 'active' => true]);
        $prisonInStateB = Prison::create(['prison_name' => 'Prison B1', 'address' => 'addr B1', 'capacity' => 100, 'state_id' => $stateB->id, 'active' => true]);

        // Setup Permission
        $permission = Permission::create(['name' => 'view-staff']);

        // Setup Role (Scoped to State A)
        $role = Role::create([
            'name' => 'State Admin',
            'slug' => 'state-admin',
            'state_id' => $stateA->id,
            'scopeless' => false,
        ]);
        $role->permissions()->attach($permission);

        // Setup User
        $user = Staff::factory()->create();
        $user->roles()->attach($role);

        // Targets
        $targetInStateA = Staff::factory()->create(['assigned_state' => $stateA->id, 'prison' => $prisonInStateA->id]);
        $targetInStateB = Staff::factory()->create(['assigned_state' => $stateB->id, 'prison' => $prisonInStateB->id]);

        // Re-boot gates
        (new \App\Providers\AppServiceProvider($this->app))->boot();

        $this->actingAs($user);
        $this->assertTrue(Gate::allows('view-staff', $targetInStateA), 'Should allow access to same state');
        $this->assertFalse(Gate::allows('view-staff', $targetInStateB), 'Should deny access to different state');
    }

    public function test_user_without_permission_is_denied()
    {
        // Setup Permission
        $permission = Permission::create(['name' => 'view-staff']);

        // Setup Role (Scopeless)
        $role = Role::create(['name' => 'Other Role', 'slug' => 'other', 'scopeless' => true]);
        // Do NOT attach permission

        // Setup User
        $user = Staff::factory()->create();
        $user->roles()->attach($role);
        $target = Staff::factory()->create();

        // Re-boot gates
        (new \App\Providers\AppServiceProvider($this->app))->boot();

        $this->actingAs($user);
        $this->assertFalse(Gate::allows('view-staff', $target));
    }
}
