<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class StatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            'Death',                                      // 1
            'Suspension',                                 // 2
            'Study leave',                                // 3
            'Foreign mission',                            // 4
            'Retirement',                                 // 5
            'Dismissal',                                  // 6
            'Warning',                                    // 7
            'Interdiction',                               // 8
            'Compulsory retirement',                      // 9
            'Reduction in rank',                          // 10
            'Deserter',                                   // 11
        ];

        foreach ($statuses as $status) {
            \App\Models\Status::firstOrCreate(
                ['name' => $status],
                ['status' => 1]
            );
        }
    }
}
