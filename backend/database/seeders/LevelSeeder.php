<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class LevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed levels 1 to 17 for staff
        for ($i = 1; $i <= 17; $i++) {
            \App\Models\Level::firstOrCreate(
                ['level_number' => $i],
                [
                    'level' => "GL $i",
                    'status' => 1,
                ]
            );
        }
    }
}
