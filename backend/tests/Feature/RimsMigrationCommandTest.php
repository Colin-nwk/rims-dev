<?php

namespace Tests\Feature;

use App\Services\RimsMigrationService;
use Closure;
use Mockery;
use Tests\TestCase;

class RimsMigrationCommandTest extends TestCase
{
    public function test_command_runs_one_streamed_service_call_and_caps_unsafe_batch_size(): void
    {
        $service = Mockery::mock(RimsMigrationService::class);
        $service->shouldReceive('getStatistics')->once()->with(true)->andReturn([
            'old_database_total' => 50_000,
            'new_database_total' => 0,
            'pending_migration' => 50_000,
        ]);
        $service->shouldReceive('migrateStaff')
            ->once()
            ->with(250, 0, 1000, true, Mockery::type(Closure::class), true)
            ->andReturnUsing(function (?int $limit, int $offset, int $batchSize, bool $dryRun, Closure $onProgress, bool $includeDeleted): array {
                $onProgress(250);

                return [
                    'migrated' => 250,
                    'failed' => 0,
                    'skipped' => 0,
                    'errors' => [],
                ];
            });
        $this->app->instance(RimsMigrationService::class, $service);

        $this->artisan('app:migrate-rims-data-command', [
            '--dry-run' => true,
            '--limit' => 250,
            '--batch-size' => 5000,
            '--no-interaction' => true,
        ])->expectsOutput('Batch size capped at 1,000 to stay below the database placeholder limit.')
            ->expectsOutput('Dry run completed. No data was written.')
            ->assertSuccessful();
    }

    public function test_active_only_option_restores_the_legacy_deleted_zero_filter(): void
    {
        $service = Mockery::mock(RimsMigrationService::class);
        $service->shouldReceive('getStatistics')->once()->with(false)->andReturn([
            'old_database_total' => 100,
            'new_database_total' => 0,
            'pending_migration' => 100,
        ]);
        $service->shouldReceive('migrateStaff')
            ->once()
            ->with(10, 0, 1000, true, Mockery::type(Closure::class), false)
            ->andReturnUsing(function (?int $limit, int $offset, int $batchSize, bool $dryRun, Closure $onProgress): array {
                $onProgress(10);

                return ['migrated' => 10, 'failed' => 0, 'skipped' => 0, 'errors' => []];
            });
        $this->app->instance(RimsMigrationService::class, $service);

        $this->artisan('app:migrate-rims-data-command', [
            '--active-only' => true,
            '--dry-run' => true,
            '--limit' => 10,
            '--no-interaction' => true,
        ])->assertSuccessful();
    }

    public function test_command_rejects_invalid_batch_size_before_querying_databases(): void
    {
        $service = Mockery::mock(RimsMigrationService::class);
        $service->shouldNotReceive('getStatistics');
        $service->shouldNotReceive('migrateStaff');
        $this->app->instance(RimsMigrationService::class, $service);

        $this->artisan('app:migrate-rims-data-command', [
            '--batch-size' => 0,
            '--no-interaction' => true,
        ])->expectsOutput('Batch size and limit must be positive, and offset cannot be negative.')
            ->assertFailed();
    }

    public function test_command_imports_education_when_staff_migration_is_already_complete(): void
    {
        $service = Mockery::mock(RimsMigrationService::class);
        $service->shouldReceive('getStatistics')->twice()->with(true)->andReturn([
            'old_database_total' => 33_267,
            'new_database_total' => 33_267,
            'pending_migration' => 0,
        ]);
        $service->shouldNotReceive('migrateStaff');
        $service->shouldReceive('migrateStaffEducationFromSqlDump')
            ->once()
            ->with(base_path('rims-staff.sql'), false)
            ->andReturn(['source' => 223, 'migrated' => 223, 'skipped' => 0]);
        $this->app->instance(RimsMigrationService::class, $service);

        $this->artisan('app:migrate-rims-data-command', [
            '--no-interaction' => true,
        ])->expectsOutput('No staff records to migrate. Staff data is up to date.')
            ->expectsOutput('Staff education migration results:')
            ->assertSuccessful();
    }
}
