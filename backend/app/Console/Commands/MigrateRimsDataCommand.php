<?php

namespace App\Console\Commands;

use App\Services\RimsMigrationService;
use Illuminate\Console\Command;

class MigrateRimsDataCommand extends Command
{
    protected $signature = 'app:migrate-rims-data-command
                            {--limit= : Maximum number of source records to scan}
                            {--offset=0 : Starting source offset}
                            {--batch-size=1000 : Number of records to process per keyset batch}
                            {--active-only : Only migrate legacy rows where deleted = 0}
                            {--education-only : Import only staff education from the SQL dump}
                            {--education-sql=rims-staff.sql : SQL dump containing the staff_education data}
                            {--skip-education : Skip staff education import}
                            {--dry-run : Validate and map records without writing data}
                            {--stats : Show migration statistics only}';

    protected $description = 'Migrate staff data from old RIMS database to new structure';

    protected RimsMigrationService $migrationService;

    public function handle(RimsMigrationService $migrationService): int
    {
        $this->migrationService = $migrationService;

        if ($this->option('stats')) {
            $this->showStatistics();

            return self::SUCCESS;
        }

        $limit = $this->option('limit');
        $offset = (int) $this->option('offset');
        $requestedBatchSize = (int) $this->option('batch-size');
        $includeDeleted = ! $this->option('active-only');

        if ($requestedBatchSize < 1 || $offset < 0 || ($limit !== null && (int) $limit < 1)) {
            $this->error('Batch size and limit must be positive, and offset cannot be negative.');

            return self::FAILURE;
        }

        $batchSize = min($requestedBatchSize, 1000);
        if ($requestedBatchSize > $batchSize) {
            $this->warn('Batch size capped at 1,000 to stay below the database placeholder limit.');
        }

        if ($this->option('dry-run')) {
            $this->warn('DRY RUN MODE - records will be read and mapped, but no data will be written.');
            $this->newLine();
        }

        $this->info('Starting RIMS data migration');
        $this->newLine();
        $this->showStatistics($includeDeleted);
        $this->newLine();

        if (! $this->option('no-interaction') && ! $this->confirm('Do you want to proceed with the migration?', true)) {
            $this->warn('Migration cancelled.');

            return self::SUCCESS;
        }

        if (! $this->option('education-only')) {
            if ($limit !== null) {
                $this->process((int) $limit, $offset, $batchSize, $includeDeleted);
            } else {
                $stats = $this->migrationService->getStatistics($includeDeleted);
                if ($stats['pending_migration'] === 0) {
                    $this->info('No staff records to migrate. Staff data is up to date.');
                } else {
                    $this->process(null, $offset, $batchSize, $includeDeleted, $stats);
                }
            }
        }

        if (! $this->option('skip-education') && ($limit === null || $this->option('education-only'))) {
            return $this->processEducation();
        }

        return self::SUCCESS;
    }

    protected function processEducation(): int
    {
        $sqlPath = base_path((string) $this->option('education-sql'));

        try {
            $result = $this->migrationService->migrateStaffEducationFromSqlDump(
                $sqlPath,
                (bool) $this->option('dry-run'),
            );
        } catch (\Throwable $throwable) {
            $this->error('Staff education migration failed: '.$throwable->getMessage());

            return self::FAILURE;
        }

        $this->newLine();
        $this->info($this->option('dry-run') ? 'Staff education dry-run results:' : 'Staff education migration results:');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Source education rows', $result['source']],
                [$this->option('dry-run') ? 'Would migrate' : 'Successfully migrated', $result['migrated']],
                ['Skipped (already exists)', $result['skipped']],
            ],
        );

        return self::SUCCESS;
    }

    /** @param array{old_database_total: int, new_database_total: int, pending_migration: int}|null $stats */
    protected function process(?int $limit, int $offset, int $batchSize, bool $includeDeleted, ?array $stats = null): void
    {
        $totalRecords = $limit ?? max(0, ($stats ?? $this->migrationService->getStatistics($includeDeleted))['old_database_total'] - $offset);
        $this->info("Scanning up to {$totalRecords} source records in keyset batches of {$batchSize}...");

        $progressBar = $this->output->createProgressBar($totalRecords);
        $progressBar->start();

        $result = $this->migrationService->migrateStaff(
            limit: $limit,
            offset: $offset,
            batchSize: $batchSize,
            dryRun: (bool) $this->option('dry-run'),
            onProgress: fn (int $processed) => $progressBar->advance(min($processed, $progressBar->getMaxSteps() - $progressBar->getProgress())),
            includeDeleted: $includeDeleted,
        );

        $progressBar->finish();
        $this->newLine(2);
        $this->displayResults($result, (bool) $this->option('dry-run'));
    }

    /** @param array{migrated: int, failed: int, skipped: int, errors: array<int, array{service_no: string, error: string}>} $result */
    protected function displayResults(array $result, bool $dryRun): void
    {
        $this->info($dryRun ? 'Dry-run results:' : 'Migration results:');
        $this->newLine();

        $this->table(
            ['Metric', 'Count'],
            [
                [$dryRun ? 'Would migrate' : 'Successfully migrated', $result['migrated']],
                ['Skipped (already exists)', $result['skipped']],
                ['Failed', $result['failed']],
            ]
        );

        if ($result['failed'] > 0 && $result['errors'] !== []) {
            $this->newLine();
            $this->error('Errors encountered:');
            $errorTable = array_slice($result['errors'], 0, 10);
            $this->table(
                ['Service No', 'Error'],
                array_map(fn (array $error) => [
                    $error['service_no'],
                    str($error['error'])->limit(100)->toString(),
                ], $errorTable)
            );

            if (count($result['errors']) > 10) {
                $this->warn('... and '.(count($result['errors']) - 10).' more errors. Check the logs for details.');
            }
        }

        $this->newLine();
        $this->info($dryRun ? 'Dry run completed. No data was written.' : 'Migration completed.');

        if (! $dryRun) {
            $this->newLine();
            $this->showStatistics(! $this->option('active-only'));
        }
    }

    protected function showStatistics(bool $includeDeleted = true): void
    {
        $stats = $this->migrationService->getStatistics($includeDeleted);

        $this->info('Migration statistics:');
        $this->newLine();
        $this->table(
            ['Database', 'Count'],
            [
                [
                    $includeDeleted ? 'Old Database (All Staff Rows)' : 'Old Database (deleted = 0)',
                    number_format($stats['old_database_total']),
                ],
                ['New Database (Migrated)', number_format($stats['new_database_total'])],
                ['Pending Migration', number_format($stats['pending_migration'])],
            ]
        );
    }
}
