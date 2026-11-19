<?php

namespace App\Console\Commands;

use App\Services\StaffImportService;
use Illuminate\Console\Command;

class ImportStaffCommand extends Command
{
    protected $signature = 'staff:import 
        {--file= : Path to the file (Excel/CSV) to import}
        {--dry-run : Preview changes without saving}
        {--skip-existing : Skip records that already exist}';

    protected $description = 'Import staff data from an Excel or CSV file';

    public function __construct(protected StaffImportService $importService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $filePath = $this->option('file');
        $dryRun = $this->option('dry-run');
        $skipExisting = $this->option('skip-existing');

        if (! $filePath) {
            $this->error('Please provide a file path using --file option');

            return Command::FAILURE;
        }

        if (! str_starts_with($filePath, '/') && ! str_starts_with($filePath, 'C:')) {
            $filePath = storage_path('app/'.$filePath);
        }

        if (! file_exists($filePath)) {
            $this->error("File not found: {$filePath}");

            return Command::FAILURE;
        }

        $this->info('Starting staff import...');
        $this->info("File: {$filePath}");

        if ($dryRun) {
            $this->warn('DRY RUN - No changes will be saved');
        }

        try {
            $rows = $this->importService->parseFile($filePath);
            $this->info('Found '.count($rows).' rows to process');

            $progressBar = $this->output->createProgressBar(count($rows));
            $progressBar->start();

            $stats = $this->importService->import($rows, $dryRun, $skipExisting);

            $progressBar->finish();
            $this->newLine(2);

            $this->displayStats($stats);

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Import failed: '.$e->getMessage());

            return Command::FAILURE;
        }
    }

    protected function displayStats(array $stats): void
    {
        $this->info('Import Summary:');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Imported', $stats['imported']],
                ['Skipped', $stats['skipped']],
                ['Failed', $stats['failed']],
            ]
        );

        if (! empty($stats['errors'])) {
            $this->warn('Errors:');
            foreach (array_slice($stats['errors'], 0, 10) as $error) {
                $this->line("  - {$error}");
            }

            if (count($stats['errors']) > 10) {
                $this->line('  ... and '.(count($stats['errors']) - 10).' more errors');
            }
        }
    }
}
