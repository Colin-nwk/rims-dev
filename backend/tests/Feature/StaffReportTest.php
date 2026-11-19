<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Prison;
use App\Models\Role;
use App\Models\Staff;
use App\Models\StaffDetail;
use App\Models\StaffEducation;
use App\Models\State;
use App\Models\User;
use App\Models\Zone;
use Carbon\Carbon;
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

    public function test_options_expose_only_supported_document_formats_and_hide_assigned_state_column(): void
    {
        $zone = Zone::factory()->create(['zone' => 'Zone A']);
        $staff = Staff::factory()->create();
        StaffDetail::factory()->create([
            'service_no' => $staff->service_no,
            'blood_group' => 'O+',
            'genotype' => 'AA',
            'marital_status' => 'Married',
        ]);

        $response = $this->actingAs($this->actor)->getJson('/api/v1/staff-report-options');

        $response->assertOk()
            ->assertJsonPath('data.formats.0.id', 'pdf')
            ->assertJsonPath('data.formats.1.id', 'word')
            ->assertJsonPath('data.formats.2.id', 'image')
            ->assertJsonPath('data.formats.3.id', 'document')
            ->assertJsonPath('data.zones.0.id', $zone->id)
            ->assertJsonPath('data.blood_groups.0.id', 'O+')
            ->assertJsonPath('data.genotypes.0.id', 'AA')
            ->assertJsonPath('data.marital_statuses.0.id', 'Married')
            ->assertJsonPath('data.missing_fields.0.id', 'email');

        $columnKeys = collect($response->json('data.columns'))->pluck('key');
        $this->assertNotContains('assigned_state', $columnKeys);
    }

    public function test_additional_quality_and_date_filters_use_the_same_population(): void
    {
        $matching = Staff::factory()->create([
            'dob' => '1985-06-15',
            'is_verified' => true,
            'created_at' => '2026-01-15 12:00:00',
        ]);
        StaffEducation::factory()->create(['service_no' => $matching->service_no]);
        Staff::factory()->create([
            'dob' => '1995-06-15',
            'is_verified' => false,
            'created_at' => '2025-01-15 12:00:00',
        ]);

        $response = $this->actingAs($this->actor)->postJson('/api/v1/staff-reports/query', [
            'criteria' => [
                'date_of_birth' => ['from' => '1980-01-01', 'to' => '1989-12-31'],
                'record_created' => ['from' => '2026-01-01', 'to' => '2026-12-31'],
                'verified' => true,
                'has_education' => true,
            ],
            'include' => ['details'],
        ]);

        $response->assertOk()
            ->assertJsonPath('data.summary', null)
            ->assertJsonPath('data.details.pagination.total', 1)
            ->assertJsonPath('data.details.rows.0.id', $matching->service_no);
    }

    public function test_age_and_personal_detail_filters_use_exact_birthdays(): void
    {
        Carbon::setTestNow('2026-07-31 12:00:00');

        try {
            $matching = Staff::factory()->create(['dob' => '1986-08-01']);
            StaffDetail::factory()->create([
                'service_no' => $matching->service_no,
                'blood_group' => 'O+',
                'genotype' => 'AA',
                'marital_status' => 'Married',
            ]);

            $tooOld = Staff::factory()->create(['dob' => '1985-07-31']);
            StaffDetail::factory()->create([
                'service_no' => $tooOld->service_no,
                'blood_group' => 'O+',
                'genotype' => 'AA',
                'marital_status' => 'Married',
            ]);

            $wrongBloodGroup = Staff::factory()->create(['dob' => '1986-08-01']);
            StaffDetail::factory()->create([
                'service_no' => $wrongBloodGroup->service_no,
                'blood_group' => 'A+',
                'genotype' => 'AA',
                'marital_status' => 'Married',
            ]);

            $response = $this->actingAs($this->actor)->postJson('/api/v1/staff-reports/query', [
                'criteria' => [
                    'age' => ['min' => 39, 'max' => 40],
                    'blood_groups' => ['O+'],
                    'genotypes' => ['AA'],
                    'marital_statuses' => ['Married'],
                ],
                'include' => ['details'],
            ]);

            $response->assertOk()
                ->assertJsonPath('data.details.pagination.total', 1)
                ->assertJsonPath('data.details.rows.0.id', $matching->service_no);
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_missing_information_filter_includes_absent_detail_records(): void
    {
        $missing = Staff::factory()->create();
        $complete = Staff::factory()->create();
        StaffDetail::factory()->create([
            'service_no' => $complete->service_no,
            'blood_group' => 'AB+',
        ]);

        $response = $this->actingAs($this->actor)->postJson('/api/v1/staff-reports/query', [
            'criteria' => ['missing_fields' => ['blood_group']],
            'include' => ['details'],
        ]);

        $response->assertOk()
            ->assertJsonPath('data.details.pagination.total', 1)
            ->assertJsonPath('data.details.rows.0.id', $missing->service_no);
    }

    public function test_zone_filter_resolves_zone_through_assigned_state_when_staff_zone_is_missing(): void
    {
        $matchingZone = Zone::factory()->create();
        $otherZone = Zone::factory()->create();
        $matchingState = State::factory()->create(['zone_id' => $matchingZone->id]);
        $otherState = State::factory()->create(['zone_id' => $otherZone->id]);
        $matching = Staff::factory()->create(['zone_id' => null, 'assigned_state' => $matchingState->id]);
        Staff::factory()->create(['zone_id' => null, 'assigned_state' => $otherState->id]);

        $response = $this->actingAs($this->actor)->postJson('/api/v1/staff-reports/query', [
            'criteria' => ['zone_ids' => [$matchingZone->id]],
            'include' => ['details'],
        ]);

        $response->assertOk()
            ->assertJsonPath('data.details.pagination.total', 1)
            ->assertJsonPath('data.details.rows.0.id', $matching->service_no);
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

    public function test_pdf_export_uses_selected_columns(): void
    {
        Staff::factory()->create(['service_no' => 'NCS-100', 'surname' => 'Doe', 'first_name' => 'Jane']);

        $response = $this->actingAs($this->actor)->postJson('/api/v1/staff-reports/export', [
            'format' => 'pdf',
            'columns' => ['service_no', 'full_name'],
        ]);

        $response->assertOk();
        $content = $response->streamedContent();
        $this->assertStringStartsWith('%PDF-1.4', $content);
        $this->assertStringContainsString('Service Number', $content);
        $this->assertStringContainsString('Doe Jane', $content);
    }

    public function test_word_and_document_exports_are_downloadable_html_documents(): void
    {
        Staff::factory()->create(['service_no' => 'NCS-101', 'surname' => 'Doe', 'first_name' => 'John']);

        foreach (['word' => 'application/msword', 'document' => 'text/html; charset=UTF-8'] as $format => $contentType) {
            $response = $this->actingAs($this->actor)->postJson('/api/v1/staff-reports/export', [
                'format' => $format,
                'columns' => ['service_no', 'full_name'],
            ]);

            $response->assertOk()->assertHeader('content-type', $contentType);
            $content = $response->streamedContent();
            $this->assertStringContainsString('<table>', $content);
            $this->assertStringContainsString('Doe John', $content);
        }
    }
}
