<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class WorkDistributionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $workDistributions = [
            'General duty',        // 1
            'Medical',             // 2
            'Works',               // 3
            'Industry',            // 4
            'Non custodial',       // 5
            'Arm squad',           // 6
            'Intelligence',        // 7
            'Derad',               // 8
            'Canine',              // 9
            'Store',               // 10
            'Chaplain',            // 11
            'Radio',               // 12
            'Legal',               // 13
            'Sport',               // 14
            'Welfare',             // 15
            'ICT',                 // 16
            'Account',             // 17
            'Imam',                // 18
        ];

        foreach ($workDistributions as $workDistribution) {
            \App\Models\WorkDistribution::firstOrCreate(
                ['name' => $workDistribution],
                ['status' => 1]
            );
        }
    }
}
