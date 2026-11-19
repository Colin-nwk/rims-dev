<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DirectorateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $directorates = [
            'Human resource',
            'Operation',
            'Works & Logistics',
            'Health & Social welfare',
            'Finance & budget',
            'Inmate training & productivity',
            'Training',
            'Non custodial',
        ];

        foreach ($directorates as $directorate) {
            \App\Models\Directorate::firstOrCreate(
                ['name' => $directorate],
                ['status' => 1]
            );
        }
    }
}
