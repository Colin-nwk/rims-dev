<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Prison;
use App\Models\Role;
use App\Models\Staff;
use App\Models\State;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class StaffReportTest extends TestCase
{
    use RefreshDatabase;

    private User $actor;

    protected function setUp(): void
    {
        parent::setUp();

        Gate::define('report.view', fn (): bool => true);
        $permission = Permission::create([
            'name' => 'report.view',
            'description' => 'View reports',
            'group' => 'report',
        ]);
        $role = Role::create([
            'name' => 'Report administrator',
            'slug' => 'report-administrator',
            'scopeless' => true,
        ]);
        $role->permissions()->attach($permission);
        $this->actor = User::factory()->create();
        $this->actor->roles()->attach($role);
    }

    public function test_summary_and_details_use_the_same_filtered_population(): void
    {
        Staff::factory()->create(['sex' => 'Female', 'status' => 1, 'department' => 'Operations']);
        Staff::factory()->create(['sex' => 'Female', 'status' => 0, 'department' => 'Operations']);
        Staff::factory()->create(['sex' => 'Male', 'status' => 1, 'department' => 'Operations']);

        $response = $this->actingAs($this->actor)->postJson('/api/v1/staff-reports/query', [
            'criteria' => ['sex' => ['Female'], 'departments' => ['Operations']],
            'include' => ['summary', 'details'],
            'page' => ['number' => 1, 'size' => 25],
        ]);

        $response->assertOk()
            ->assertJsonPath('data.summary.total_staff', 2)
            ->assertJsonPath('data.details.pagination.total', 2)
            ->assertJsonCount(2, 'data.details.rows')
            ->assertJsonMissingPath('data.details.rows.0.password');
    }

    public function test_unknown_filter_is_rejected(): void
    {
        $this->actingAs($this->actor)->postJson('/api/v1/staff-reports/query', [
            'criteria' => ['bank_account' => 'secret'],
        ])->assertUnprocessable()->assertJsonValidationErrors('criteria.bank_account');
    }

    public function test_scoped_role_only_reports_staff_in_its_prison(): void
    {
        $zone = Zone::factory()->create();
        $state = State::factory()->create(['zone_id' => $zone->id]);
        $allowedPrison = Prison::factory()->create(['state_id' => $state->id]);
        $otherPrison = Prison::factory()->create(['state_id' => $state->id]);
        $allowed = Staff::factory()->create(['prison' => $allowedPrison->id]);
        Staff::factory()->create(['prison' => $otherPrison->id]);
        $this->actor->roles()->update(['scopeless' => false, 'prison_id' => $allowedPrison->id]);

        $response = $this->actingAs($this->actor)->postJson('/api/v1/staff-reports/query', []);

        $response->assertOk()
            ->assertJsonPath('data.summary.total_staff', 1)
            ->assertJsonPath('data.details.rows.0.id', $allowed->service_no);
    }

    public function test_detail_endpoint_respects_report_scope(): void
    {
        $zone = Zone::factory()->create();
        $state = State::factory()->create(['zone_id' => $zone->id]);
        $allowedPrison = Prison::factory()->create(['state_id' => $state->id]);
        $otherPrison = Prison::factory()->create(['state_id' => $state->id]);
        $allowed = Staff::factory()->create(['prison' => $allowedPrison->id]);
        $denied = Staff::factory()->create(['prison' => $otherPrison->id]);
        $this->actor->roles()->update(['scopeless' => false, 'prison_id' => $allowedPrison->id]);

        $this->actingAs($this->actor)->getJson("/api/v1/staff-reports/{$allowed->service_no}")->assertOk();
        $this->actingAs($this->actor)->getJson("/api/v1/staff-reports/{$denied->service_no}")->assertNotFound();
    }

    public function test_csv_export_uses_selected_columns_and_neutralizes_formulas(): void
    {
        Staff::factory()->create(['service_no' => '=DANGEROUS', 'surname' => 'Doe', 'first_name' => 'Jane']);

        $response = $this->actingAs($this->actor)->postJson('/api/v1/staff-reports/export', [
            'format' => 'csv',
            'columns' => ['service_no', 'full_name'],
        ]);

        $response->assertOk();
        $content = $response->streamedContent();
        $this->assertStringContainsString('"Service Number","Full Name"', $content);
        $this->assertStringContainsString("'=DANGEROUS", $content);
    }
}
