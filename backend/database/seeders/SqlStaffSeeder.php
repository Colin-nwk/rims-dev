<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class SqlStaffSeeder extends Seeder
{
    /**
     * The SQL file containing staff data.
     */
    protected string $sqlFile = 'rims_2.sql';

    /**
     * Run the database seeds.
     *
     * Seeds staff, staff_details, and staff_education tables
     * from the rims_2.sql file.
     */
    public function run(): void
    {
        $sqlPath = base_path($this->sqlFile);

        if (! File::exists($sqlPath)) {
            $this->command->error("❌ SQL file not found: {$sqlPath}");
            $this->command->info('   Make sure rims_2.sql exists in the backend directory.');

            return;
        }

        // Show which database we're connecting to
        $this->command->info('🚀 Starting fresh staff data migration from SQL file...');
        $this->command->newLine();
        $this->command->warn('📊 Database Connection Info:');
        $this->command->info('   Host:     '.config('database.connections.mysql.host'));
        $this->command->info('   Port:     '.config('database.connections.mysql.port'));
        $this->command->info('   Database: '.config('database.connections.mysql.database'));
        $this->command->info('   Environment: '.app()->environment());
        $this->command->newLine();

        // Disable foreign key checks
        $this->command->info('🔄 Disabling foreign key checks...');
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // Truncate tables in correct order
        $this->truncateTables();

        // Import SQL file
        $this->importSqlFile($sqlPath);

        // Re-enable foreign key checks
        $this->command->info('🔄 Re-enabling foreign key checks...');
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // Display summary
        $this->displaySummary();

        $this->command->newLine();
        $this->command->info('✅ Fresh staff data migration completed successfully!');
    }

    /**
     * Truncate all staff-related tables.
     */
    protected function truncateTables(): void
    {
        $tables = ['staff_education', 'staff_details', 'staff'];

        foreach ($tables as $table) {
            $this->command->info("🗑️  Truncating {$table} table...");
            DB::table($table)->truncate();
        }

        $this->command->newLine();
    }

    /**
     * Import the SQL file contents.
     */
    protected function importSqlFile(string $sqlPath): void
    {
        $this->command->info('📥 Importing data from SQL file...');
        $this->command->info('   This may take a few minutes for large files...');

        $sql = File::get($sqlPath);

        // Split SQL into individual statements
        // We need to handle multi-line INSERT statements properly
        $statements = $this->parseSqlStatements($sql);

        $progressBar = $this->command->getOutput()->createProgressBar(count($statements));
        $progressBar->start();

        $errors = [];

        foreach ($statements as $statement) {
            $statement = trim($statement);

            if (empty($statement)) {
                $progressBar->advance();

                continue;
            }

            // Skip CREATE TABLE and ALTER TABLE statements (tables already exist)
            if ($this->shouldSkipStatement($statement)) {
                $progressBar->advance();

                continue;
            }

            // Fix empty strings that should be NULL for integer columns
            $statement = $this->fixEmptyStringsForIntegerColumns($statement);

            try {
                DB::unprepared($statement);
            } catch (\Exception $e) {
                // Log error but continue with other statements
                $errors[] = [
                    'statement' => substr($statement, 0, 100).'...',
                    'error' => $e->getMessage(),
                ];
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->command->newLine(2);

        if (! empty($errors)) {
            $this->command->warn('⚠️  Some statements failed:');
            foreach (array_slice($errors, 0, 5) as $error) {
                $this->command->error("   - {$error['error']}");
            }
            if (count($errors) > 5) {
                $this->command->warn('   ... and '.(count($errors) - 5).' more errors.');
            }
            $this->command->newLine();
        }
    }

    /**
     * Fix invalid values that should be NULL for integer columns in INSERT statements.
     *
     * This handles legacy SQL data where integer columns may contain empty strings
     * or invalid placeholder strings instead of NULL values.
     */
    protected function fixEmptyStringsForIntegerColumns(string $statement): string
    {
        // Only process INSERT statements for staff-related tables
        if (! preg_match('/INSERT\s+INTO\s+`?(staff|staff_details|staff_education)`?/i', $statement)) {
            return $statement;
        }

        // Replace invalid placeholder tokens like '? string:37 ?' or '? object:null ?' with NULL
        $statement = preg_replace(
            "/'\?\s*(?:string|object|undefine|undefined)[^']*'/i",
            'NULL',
            $statement
        );
        $statement = preg_replace(
            "/\?\s*(?:string|object|undefine|undefined)[^,)]*(?=,|\))/i",
            'NULL',
            $statement
        );

        // Run replacements multiple times to handle consecutive empty strings
        // and overlapping patterns
        $maxIterations = 10;
        $iteration = 0;
        $previousStatement = '';

        while ($previousStatement !== $statement && $iteration < $maxIterations) {
            $previousStatement = $statement;
            $iteration++;

            // Replace empty strings in various positions with NULL
            // Pattern: , '', (empty string between commas)
            $statement = preg_replace("/,\s*''\s*,/", ', NULL,', $statement);

            // Pattern: ('', (empty string at start of values)
            $statement = preg_replace("/\(\s*''\s*,/", '(NULL,', $statement);

            // Pattern: , '') (empty string at end of values)
            $statement = preg_replace("/,\s*''\s*\)/", ', NULL)', $statement);

            // Pattern: ('') (single empty string value - rare but possible)
            $statement = preg_replace("/\(\s*''\s*\)/", '(NULL)', $statement);

            // Handle cases where empty string follows NULL: NULL, '',
            $statement = preg_replace("/NULL,\s*''\s*,/", 'NULL, NULL,', $statement);

            // Handle cases where empty string precedes NULL: '', NULL
            $statement = preg_replace("/,\s*''\s*,\s*NULL/", ', NULL, NULL', $statement);
        }

        return $statement;
    }

    /**
     * Parse SQL file into individual statements.
     */
    protected function parseSqlStatements(string $sql): array
    {
        // Remove SQL comments
        $sql = preg_replace('/--.*$/m', '', $sql);
        $sql = preg_replace('/\/\*.*?\*\//s', '', $sql);

        // Split by semicolon, but handle multi-line statements
        $statements = [];
        $currentStatement = '';
        $inString = false;
        $stringChar = '';

        $length = strlen($sql);
        for ($i = 0; $i < $length; $i++) {
            $char = $sql[$i];

            // Handle string literals
            if (($char === "'" || $char === '"') && ($i === 0 || $sql[$i - 1] !== '\\')) {
                if (! $inString) {
                    $inString = true;
                    $stringChar = $char;
                } elseif ($char === $stringChar) {
                    $inString = false;
                }
            }

            // Check for statement terminator
            if ($char === ';' && ! $inString) {
                $currentStatement = trim($currentStatement);
                if (! empty($currentStatement)) {
                    $statements[] = $currentStatement;
                }
                $currentStatement = '';
            } else {
                $currentStatement .= $char;
            }
        }

        // Add any remaining statement
        $currentStatement = trim($currentStatement);
        if (! empty($currentStatement)) {
            $statements[] = $currentStatement;
        }

        return $statements;
    }

    /**
     * Check if a SQL statement should be skipped.
     */
    protected function shouldSkipStatement(string $statement): bool
    {
        $upperStatement = strtoupper(trim($statement));

        // Skip DDL statements - we only want INSERT statements
        $skipPatterns = [
            'CREATE TABLE',
            'ALTER TABLE',
            'DROP TABLE',
            'CREATE INDEX',
            'DROP INDEX',
            'SET SQL_MODE',
            'SET TIME_ZONE',
            'SET NAMES',
            'START TRANSACTION',
            'COMMIT',
            '/*!',  // MySQL version-specific comments
        ];

        foreach ($skipPatterns as $pattern) {
            if (str_starts_with($upperStatement, $pattern)) {
                return true;
            }
        }

        // Only allow INSERT statements for staff-related tables
        if (str_starts_with($upperStatement, 'INSERT')) {
            // Check if this is a staff-related table
            $allowedTables = ['staff', 'staff_details', 'staff_education'];
            foreach ($allowedTables as $table) {
                if (preg_match('/INSERT\s+INTO\s+`?' . $table . '`?/i', $statement)) {
                    return false; // Don't skip - this is a staff table
                }
            }
            return true; // Skip all other INSERT statements
        }

        return false;
    }

    /**
     * Display migration summary with record counts.
     */
    protected function displaySummary(): void
    {
        $this->command->newLine();
        $this->command->info('📊 Migration Summary:');
        $this->command->newLine();

        $counts = [
            'staff' => DB::table('staff')->count(),
            'staff_details' => DB::table('staff_details')->count(),
            'staff_education' => DB::table('staff_education')->count(),
        ];

        $this->command->table(
            ['Table', 'Records'],
            [
                ['staff', number_format($counts['staff'])],
                ['staff_details', number_format($counts['staff_details'])],
                ['staff_education', number_format($counts['staff_education'])],
            ]
        );
    }
}
