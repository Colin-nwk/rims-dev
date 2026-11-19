<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class StaffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Staff::factory(10)
            ->has(\App\Models\StaffDetail::factory()->state(function (array $attributes, \App\Models\Staff $staff) {
                return ['service_no' => $staff->service_no];
            }), 'details')
            ->has(\App\Models\StaffEducation::factory()->count(3)->state(function (array $attributes, \App\Models\Staff $staff) {
                return ['service_no' => $staff->service_no];
            }), 'education')
            ->create();
    }
}
