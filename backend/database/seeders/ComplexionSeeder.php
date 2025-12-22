<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ComplexionSeeder extends Seeder
{
    public function run(): void
    {
        $complexions = [
            'Very Fair',
            'Fair',
            'Light Brown',
            'Brown',
            'Dark Brown',
            'Very Dark',
            'Olive',
            'Albino',
        ];

        foreach ($complexions as $complexion) {
            \App\Models\Complexion::firstOrCreate(
                ['title' => $complexion],
                ['status' => true]
            );
        }
    }
}
