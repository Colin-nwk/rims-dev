<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ClearStorageCommand extends Command
{
    protected $signature = 'storage:clear
        {--public : Clear only public storage}
        {--private : Clear only private storage}
        {--all : Clear both public and private storage}
        {--force : Skip confirmation prompt}';

    protected $description = 'Clear uploaded files from storage directories';

    public function handle(): int
    {
        $clearPublic = $this->option('public') || $this->option('all');
        $clearPrivate = $this->option('private') || $this->option('all');

        // Default to clearing all if no specific option provided
        if (! $clearPublic && ! $clearPrivate) {
            $clearPublic = true;
            $clearPrivate = true;
        }

        $directories = [];

        if ($clearPublic) {
            $directories['public'] = storage_path('app/public');
        }

        if ($clearPrivate) {
            $directories['private'] = storage_path('app/private');
        }

        // Show what will be cleared
        $this->info('The following storage directories will be cleared:');
        foreach ($directories as $name => $path) {
            $fileCount = $this->countFiles($path);
            $this->line("  - {$name}: {$path} ({$fileCount} files)");
        }

        // Confirm unless --force is used
        if (! $this->option('force')) {
            if (! $this->confirm('Are you sure you want to delete these files?')) {
                $this->info('Operation cancelled.');

                return Command::SUCCESS;
            }
        }

        $totalDeleted = 0;

        foreach ($directories as $name => $path) {
            if (File::isDirectory($path)) {
                $deleted = $this->clearDirectory($path);
                $totalDeleted += $deleted;
                $this->info("Cleared {$deleted} files from {$name} storage.");
            } else {
                $this->warn("Directory not found: {$path}");
            }
        }

        $this->newLine();
        $this->info("Total files deleted: {$totalDeleted}");

        // Recreate storage link (unlink first, then link)
        if ($clearPublic) {
            $publicStorageLink = public_path('storage');
            if (File::exists($publicStorageLink) || is_link($publicStorageLink)) {
                if (PHP_OS_FAMILY === 'Windows') {
                    @rmdir($publicStorageLink);
                } else {
                    File::delete($publicStorageLink);
                }
                $this->info('Storage link removed.');
            }
            $this->call('storage:link');
        }

        return Command::SUCCESS;
    }

    protected function countFiles(string $path): int
    {
        if (! File::isDirectory($path)) {
            return 0;
        }

        $count = 0;
        $files = File::allFiles($path);

        foreach ($files as $file) {
            if ($file->getFilename() !== '.gitignore') {
                $count++;
            }
        }

        return $count;
    }

    protected function clearDirectory(string $path): int
    {
        $deleted = 0;

        // Delete all files except .gitignore
        $files = File::allFiles($path);
        foreach ($files as $file) {
            if ($file->getFilename() !== '.gitignore') {
                File::delete($file->getPathname());
                $deleted++;
            }
        }

        // Delete all subdirectories
        $directories = File::directories($path);
        foreach ($directories as $directory) {
            File::deleteDirectory($directory);
        }

        return $deleted;
    }
}
