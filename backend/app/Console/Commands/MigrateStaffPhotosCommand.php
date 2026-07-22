<?php

namespace App\Console\Commands;

use App\Models\Staff;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class MigrateStaffPhotosCommand extends Command
{
    protected $signature = 'staff:migrate-photos
                            {--dry-run : Preview changes without copying files or updating database}
                            {--batch-size=500 : Number of records to process per batch}
                            {--limit= : Total number of records to process}
                            {--offset=0 : Starting offset}
                            {--stats : Show migration statistics only}
                            {--force : Skip confirmation prompt}';

    protected $description = 'Migrate staff photos from backend/pictures/ to storage system';

    protected string $sourceDirectory;
    protected string $targetDirectory = 'photos';
    protected string $disk = 'public';

    protected int $migratedCount = 0;
    protected int $skippedCount = 0;
    protected int $notFoundCount = 0;
    protected int $failedCount = 0;
    protected array $errors = [];
    protected array $notFoundServiceNos = [];

    public function handle(): int
    {
        $this->sourceDirectory = base_path('pictures');

        if (!File::isDirectory($this->sourceDirectory)) {
            $this->error("Source directory not found: {$this->sourceDirectory}");
            return self::FAILURE;
        }

        if ($this->option('stats')) {
            $this->showStatistics();
            return self::SUCCESS;
        }

        $this->info('Staff Photo Migration');
        $this->newLine();
        $this->showStatistics();
        $this->newLine();

        if ($this->option('dry-run')) {
            $this->warn('DRY RUN MODE - No files will be copied or database updated');
            $this->newLine();
        }

        if (!$this->option('force') && !$this->option('no-interaction')) {
            if (!$this->confirm('Do you want to proceed with the migration?', true)) {
                $this->warn('Migration cancelled.');
                return self::SUCCESS;
            }
        }

        $this->processInBatches();

        return self::SUCCESS;
    }

    protected function showStatistics(): void
    {
        $totalStaff = Staff::count();

        $staffWithPhotos = Staff::whereNotNull('photo')
            ->where('photo', '!=', '')
            ->where('photo', 'like', 'photos/%')
            ->count();

        $sourceFiles = File::glob($this->sourceDirectory . DIRECTORY_SEPARATOR . '*.jpg');
        $sourceFileCount = count($sourceFiles);

        $sourceIndex = $this->buildSourceFileIndex($sourceFiles);

        $staffNeedingPhotos = Staff::where(function ($q) {
            $q->whereNull('photo')
                ->orWhere('photo', '')
                ->orWhere('photo', 'not like', 'photos/%');
        })->pluck('service_no')->toArray();

        $matchCount = 0;
        foreach ($staffNeedingPhotos as $serviceNo) {
            if ($this->findSourceFile($serviceNo, $sourceIndex)) {
                $matchCount++;
            }
        }

        $this->info('Migration Statistics:');
        $this->newLine();

        $this->table(
            ['Metric', 'Count'],
            [
                ['Total Staff Records', number_format($totalStaff)],
                ['Staff Already With Photos', number_format($staffWithPhotos)],
                ['Staff Needing Photos', number_format(count($staffNeedingPhotos))],
                ['Source Photos Available', number_format($sourceFileCount)],
                ['Unique Service Numbers in Source', number_format(count($sourceIndex))],
                ['Potential Matches Found', number_format($matchCount)],
            ]
        );
    }

    protected function buildSourceFileIndex(array $files = null): array
    {
        if ($files === null) {
            $files = File::glob($this->sourceDirectory . DIRECTORY_SEPARATOR . '*.jpg');
        }

        $index = [];

        foreach ($files as $filePath) {
            $filename = pathinfo($filePath, PATHINFO_FILENAME);

            $serviceNo = $filename;

            if (preg_match('/^(.+?)b$/i', $filename, $matches)) {
                $serviceNo = $matches[1];
            }

            if (!isset($index[$serviceNo])) {
                $index[$serviceNo] = $filePath;
            } elseif (!preg_match('/b\.(jpg|jpeg)$/i', basename($filePath))) {
                $index[$serviceNo] = $filePath;
            }
        }

        return $index;
    }

    protected function findSourceFile(string $serviceNo, array $sourceIndex): ?string
    {
        return $sourceIndex[$serviceNo]
            ?? $sourceIndex[strtoupper($serviceNo)]
            ?? $sourceIndex[strtolower($serviceNo)]
            ?? null;
    }

    protected function processInBatches(): void
    {
        $batchSize = (int) $this->option('batch-size');
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;
        $offset = (int) $this->option('offset');

        $this->info('Building source file index...');
        $sourceIndex = $this->buildSourceFileIndex();
        $this->info('Found ' . count($sourceIndex) . ' unique service numbers in source directory.');
        $this->newLine();

        // Get IDs of staff needing photos upfront to avoid chunk() offset issues
        // when records are modified during iteration
        $this->info('Fetching staff IDs needing photo migration...');
        $query = Staff::where(function ($q) {
                $q->whereNull('photo')
                    ->orWhere('photo', '')
                    ->orWhere('photo', 'not like', 'photos/%');
            })
            ->orderBy('id');

        if ($offset > 0) {
            $query->offset($offset);
        }

        if ($limit) {
            $query->limit($limit);
        }

        $staffIds = $query->pluck('id')->toArray();

        $totalToProcess = count($staffIds);

        if ($totalToProcess === 0) {
            $this->info('No staff records need photo migration.');
            return;
        }

        $this->info("Processing {$totalToProcess} staff records...");
        $progressBar = $this->output->createProgressBar($totalToProcess);
        $progressBar->start();

        // Process in batches using the pre-fetched IDs
        $idChunks = array_chunk($staffIds, $batchSize);

        foreach ($idChunks as $idChunk) {
            $staffBatch = Staff::whereIn('id', $idChunk)->get();

            foreach ($staffBatch as $staff) {
                $this->processStaffPhoto($staff, $sourceIndex);
                $progressBar->advance();
            }
        }

        $progressBar->finish();
        $this->newLine(2);

        $this->displayResults();
    }

    protected function processStaffPhoto(Staff $staff, array $sourceIndex): void
    {
        $serviceNo = $staff->service_no;

        $sourceFile = $this->findSourceFile($serviceNo, $sourceIndex);

        if (!$sourceFile) {
            $this->notFoundCount++;
            $this->notFoundServiceNos[] = $serviceNo;
            return;
        }

        $timestamp = now()->timestamp;
        $extension = strtolower(pathinfo($sourceFile, PATHINFO_EXTENSION));
        $newFilename = "{$serviceNo}_photo_{$timestamp}.{$extension}";
        $targetPath = "{$this->targetDirectory}/{$newFilename}";

        if ($this->option('dry-run')) {
            $this->migratedCount++;
            return;
        }

        try {
            $contents = File::get($sourceFile);

            $success = Storage::disk($this->disk)->put($targetPath, $contents);

            if (!$success) {
                throw new \Exception("Failed to write file to storage");
            }

            $staff->photo = $targetPath;
            $staff->timestamps = false;
            $staff->saveQuietly();

            $this->migratedCount++;

        } catch (\Exception $e) {
            $this->failedCount++;
            $this->errors[] = [
                'service_no' => $serviceNo,
                'error' => $e->getMessage(),
            ];
        }
    }

    protected function displayResults(): void
    {
        $this->info('Migration Results:');
        $this->newLine();

        $this->table(
            ['Metric', 'Count'],
            [
                ['Successfully Migrated', $this->migratedCount],
                ['Skipped (Already Has Photo)', $this->skippedCount],
                ['No Source Photo Found', $this->notFoundCount],
                ['Failed', $this->failedCount],
            ]
        );

        if ($this->failedCount > 0 && !empty($this->errors)) {
            $this->newLine();
            $this->error('Errors encountered:');

            $errorTable = array_slice($this->errors, 0, 10);
            $this->table(
                ['Service No', 'Error'],
                array_map(fn($e) => [
                    $e['service_no'],
                    substr($e['error'], 0, 80) . (strlen($e['error']) > 80 ? '...' : '')
                ], $errorTable)
            );

            if (count($this->errors) > 10) {
                $this->warn('... and ' . (count($this->errors) - 10) . ' more errors.');
            }
        }

        if ($this->notFoundCount > 0 && $this->output->isVerbose()) {
            $this->newLine();
            $this->warn("Staff without matching photos (first 20):");
            foreach (array_slice($this->notFoundServiceNos, 0, 20) as $sn) {
                $this->line("  - {$sn}");
            }
            if ($this->notFoundCount > 20) {
                $this->line("  ... and " . ($this->notFoundCount - 20) . " more.");
            }
        }

        $this->newLine();

        if ($this->option('dry-run')) {
            $this->warn('DRY RUN COMPLETE - No actual changes were made.');
        } else {
            $this->info('Migration completed!');
        }
    }
}
