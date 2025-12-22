<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class BloodGenotypeSeeder extends Seeder
{
    public function run(): void
    {
        $genotypes = [
            'AA',
            'AS',
            'AC',
            'SS',
            'SC',
            'CC',
        ];

        foreach ($genotypes as $genotype) {
            \App\Models\BloodGenotype::firstOrCreate(
                ['title' => $genotype],
                ['status' => true]
            );
        }
    }
}
