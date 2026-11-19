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
            'Correctional academy Ijebu Igbo',                  // 1
            'Correctional staff college Barnawi Kaduna',        // 2
            'Correctional training college Kirikiri Lagos',     // 3
            'Correctional training college Enugu',              // 4
            'Arm squad training school Owerri',                 // 5
            'Correctional training school Kaduna',              // 6
            'Correctional training college Kebbi',              // 7
            'Borstal Kaduna',                                   // 8
            'Borstal Kwara',                                    // 9
            'Borstal Enugu',                                    // 10
            'Borstal Gwagwalada',                               // 11
            'Borstal Igomu Abeokuta',                           // 12
            'Borstal Kurmawa Kano',                             // 13
        ];

        foreach ($trainingInstitutes as $trainingInstitute) {
            \App\Models\TrainingInstitute::firstOrCreate(
                ['name' => $trainingInstitute],
                ['status' => 1]
            );
        }
    }
}
