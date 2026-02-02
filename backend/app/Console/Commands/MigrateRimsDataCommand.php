<?php

namespace App\Console\Commands;

use App\Services\RimsMigrationService;
use Illuminate\Console\Command;

class MigrateRimsDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:migrate-rims-data-command 
                            {--limit= : Number of records to migrate per batch}
                            {--offset=0 : Starting offset for migration}
                            {--batch-size=1000 : Number of records to process in each batch}
                            {--dry-run : Run without actually migrating data}
                            {--stats : Show migration statistics only}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate staff data from old RIMS database to new structure';

    protected $migrationService;

    /**
     * Execute the console command.
     */
    public function handle(RimsMigrationService $migrationService)
    {
        $this->migrationService = $migrationService;

        if ($this->option('stats')) {
            $this->showStatistics();

            return self::SUCCESS;
        }

        if ($this->option('dry-run')) {
            $this->warn('🔍 DRY RUN MODE - No data will be migrated');
            $this->newLine();
        }

        $this->info('🚀 Starting RIMS Data Migration');
        $this->newLine();

        if (! $this->option('stats')) {
            $this->showStatistics();
            $this->newLine();

            if (! $this->option('no-interaction') && ! $this->confirm('Do you want to proceed with the migration?', true)) {
                $this->warn('Migration cancelled.');

                return self::SUCCESS;
            }
        } else {
            return self::SUCCESS;
        }

        $this->newLine();

        $limit = $this->option('limit');
        $offset = (int) $this->option('offset');
        $batchSize = (int) $this->option('batch-size');

        if ($limit) {
            $this->processBatch($offset, (int) $limit);
        } else {
            $this->processInBatches($batchSize, $offset);
        }

        return self::SUCCESS;
    }

    protected function processBatch($offset, $limit)
    {
        $this->info("Processing {$limit} records starting from offset {$offset}...");

        $progressBar = $this->output->createProgressBar($limit);
        $progressBar->start();

        if (! $this->option('dry-run')) {
            $result = $this->migrationService->migrateStaff($limit, $offset);
            $progressBar->advance($result['migrated'] + $result['failed'] + $result['skipped']);
        } else {
            $progressBar->advance($limit);
        }

        $progressBar->finish();
        $this->newLine(2);

        if (! $this->option('dry-run')) {
            $this->displayResults($result);
        }
    }

    protected function processInBatches($batchSize, $startOffset)
    {
        $stats = $this->migrationService->getStatistics();
        $totalRecords = $stats['pending_migration'];

        if ($totalRecords === 0) {
            $this->info('✅ No records to migrate. All data is up to date!');

            return;
        }

        $this->info("Processing {$totalRecords} records in batches of {$batchSize}...");
        $this->newLine();

        $progressBar = $this->output->createProgressBar($totalRecords);
        $progressBar->start();

        $offset = $startOffset;
        $totalMigrated = 0;
        $totalFailed = 0;
        $totalSkipped = 0;
        $allErrors = [];

        while ($offset < $totalRecords + $startOffset) {
            if (! $this->option('dry-run')) {
                $this->migrationService->resetCounters();
                $result = $this->migrationService->migrateStaff($batchSize, $offset);

                $totalMigrated += $result['migrated'];
                $totalFailed += $result['failed'];
                $totalSkipped += $result['skipped'];
                $allErrors = array_merge($allErrors, $result['errors']);

                $progressBar->advance($result['migrated'] + $result['failed'] + $result['skipped']);
            } else {
                $progressBar->advance(min($batchSize, $totalRecords - $offset));
            }

            $offset += $batchSize;
        }

        $progressBar->finish();
        $this->newLine(2);

        if (! $this->option('dry-run')) {
            $this->displayResults([
                'migrated' => $totalMigrated,
                'failed' => $totalFailed,
                'skipped' => $totalSkipped,
                'errors' => $allErrors,
            ]);
        }
    }

    protected function displayResults($result)
    {
        $this->info('📊 Migration Results:');
        $this->newLine();

        $this->table(
            ['Metric', 'Count'],
            [
                ['✅ Successfully Migrated', $result['migrated']],
                ['⏭️  Skipped (Already Exists)', $result['skipped']],
                ['❌ Failed', $result['failed']],
            ]
        );

        if ($result['failed'] > 0 && count($result['errors']) > 0) {
            $this->newLine();
            $this->error('❌ Errors encountered:');
            $this->newLine();

            $errorTable = array_slice($result['errors'], 0, 10); // Show first 10 errors
            $this->table(
                ['Service No', 'Error'],
                array_map(function ($error) {
                    return [
                        $error['service_no'],
                        substr($error['error'], 0, 100).(strlen($error['error']) > 100 ? '...' : ''),
                    ];
                }, $errorTable)
            );

            if (count($result['errors']) > 10) {
                $this->warn('... and '.(count($result['errors']) - 10).' more errors. Check the logs for details.');
            }
        }

        $this->newLine();
        $this->info('✅ Migration completed!');
        $this->newLine();

        // Show updated statistics
        $this->showStatistics();
    }

    protected function showStatistics()
    {
        $stats = $this->migrationService->getStatistics();

        $this->info('📈 Migration Statistics:');
        $this->newLine();

        $this->table(
            ['Database', 'Count'],
            [
                ['Old Database (Total Records)', number_format($stats['old_database_total'])],
                ['New Database (Migrated)', number_format($stats['new_database_total'])],
                ['Pending Migration', number_format($stats['pending_migration'])],
            ]
        );
    }
}
