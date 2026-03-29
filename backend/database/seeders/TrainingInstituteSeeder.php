<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class TrainingInstituteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $trainingInstitutes = [
            'Correctional academy Ijebu Igbo',
            'Correctional staff college Barnawi Kaduna',
            'Correctional training college Kirikiri Lagos',
            'Correctional training college Enugu',
            'Arm squad training school Owerri',
            'Correctional training school Kaduna',
            'Correctional training college Kebbi',
            'Borstal Kaduna',
            'Borstal Kwara',
            'Borstal Enugu',
            'Borstal Gwagwalada',
            'Borstal Igomu Abeokuta',
        ];

        foreach ($trainingInstitutes as $trainingInstitute) {
            \App\Models\TrainingInstitute::firstOrCreate(
                ['name' => $trainingInstitute],
                ['status' => 1]
            );
        }
    }
}
