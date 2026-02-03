<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StateSeeder extends Seeder
{
    public function run()
    {
        // Clear existing data to avoid duplicates
        DB::table('states')->truncate();

        DB::table('states')->insert([
            // Zone A - Lagos (Lagos, Ogun)
            ['id' => 24, 'state' => 'Lagos', 'capital' => 'Ikeja', 'zone' => 'South West', 'zone_id' => 1, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 27, 'state' => 'Ogun', 'capital' => 'Abeokuta', 'zone' => 'South West', 'zone_id' => 1, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],

            // Zone B - Kaduna (Kaduna, Katsina, Kano, Jigawa, + other NW states)
            ['id' => 18, 'state' => 'Kaduna', 'capital' => 'Kaduna', 'zone' => 'North West', 'zone_id' => 2, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 20, 'state' => 'Katsina', 'capital' => 'Katsina', 'zone' => 'North West', 'zone_id' => 2, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 19, 'state' => 'Kano', 'capital' => 'Kano', 'zone' => 'North West', 'zone_id' => 2, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 17, 'state' => 'Jigawa', 'capital' => 'Dutse', 'zone' => 'North West', 'zone_id' => 2, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 21, 'state' => 'Kebbi', 'capital' => 'Birnin Kebbi', 'zone' => 'North West', 'zone_id' => 2, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 33, 'state' => 'Sokoto', 'capital' => 'Sokoto', 'zone' => 'North West', 'zone_id' => 2, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 36, 'state' => 'Zamfara', 'capital' => 'Gusau', 'zone' => 'North West', 'zone_id' => 2, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],

            // Zone C - Enugu (Enugu, Anambra, Abia, Ebonyi, Imo)
            ['id' => 14, 'state' => 'Enugu', 'capital' => 'Enugu', 'zone' => 'South East', 'zone_id' => 3, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'state' => 'Anambra', 'capital' => 'Awka', 'zone' => 'South East', 'zone_id' => 3, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 1, 'state' => 'Abia', 'capital' => 'Umuahia', 'zone' => 'South East', 'zone_id' => 3, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 11, 'state' => 'Ebonyi', 'capital' => 'Abakaliki', 'zone' => 'South East', 'zone_id' => 3, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 16, 'state' => 'Imo', 'capital' => 'Owerri', 'zone' => 'South East', 'zone_id' => 3, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],

            // Zone D - Minna (Niger, Kwara, Kogi, + other NC states, FCT)
            ['id' => 26, 'state' => 'Niger', 'capital' => 'Minna', 'zone' => 'North Central', 'zone_id' => 4, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 23, 'state' => 'Kwara', 'capital' => 'Ilorin', 'zone' => 'North Central', 'zone_id' => 4, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 22, 'state' => 'Kogi', 'capital' => 'Lokoja', 'zone' => 'North Central', 'zone_id' => 4, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'state' => 'Benue', 'capital' => 'Makurdi', 'zone' => 'North Central', 'zone_id' => 4, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 25, 'state' => 'Nasarawa', 'capital' => 'Lafia', 'zone' => 'North Central', 'zone_id' => 4, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 31, 'state' => 'Plateau', 'capital' => 'Jos', 'zone' => 'North Central', 'zone_id' => 4, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 37, 'state' => 'FCT', 'capital' => 'Abuja', 'zone' => 'North Central', 'zone_id' => 4, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],

            // Zone E - Owerri (South-East and parts of South-South)
            ['id' => 3, 'state' => 'Akwa Ibom', 'capital' => 'Uyo', 'zone' => 'South South', 'zone_id' => 5, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'state' => 'Bayelsa', 'capital' => 'Yenagoa', 'zone' => 'South South', 'zone_id' => 5, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 9, 'state' => 'Cross River', 'capital' => 'Calabar', 'zone' => 'South South', 'zone_id' => 5, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 32, 'state' => 'Rivers', 'capital' => 'Port Harcourt', 'zone' => 'South South', 'zone_id' => 5, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],

            // Zone F - Ibadan (Oyo, Osun, Ondo, Ekiti)
            ['id' => 30, 'state' => 'Oyo', 'capital' => 'Ibadan', 'zone' => 'South West', 'zone_id' => 6, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 29, 'state' => 'Osun', 'capital' => 'Osogbo', 'zone' => 'South West', 'zone_id' => 6, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 28, 'state' => 'Ondo', 'capital' => 'Akure', 'zone' => 'South West', 'zone_id' => 6, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 13, 'state' => 'Ekiti', 'capital' => 'Ado-Ekiti', 'zone' => 'South West', 'zone_id' => 6, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],

            // Zone G - Benin (Edo, Delta)
            ['id' => 12, 'state' => 'Edo', 'capital' => 'Benin City', 'zone' => 'South South', 'zone_id' => 7, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 10, 'state' => 'Delta', 'capital' => 'Asaba', 'zone' => 'South South', 'zone_id' => 7, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],

            // Zone H - Yola (Adamawa, Taraba, Gombe, Bauchi, + other NE states)
            ['id' => 2, 'state' => 'Adamawa', 'capital' => 'Yola', 'zone' => 'North East', 'zone_id' => 8, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 34, 'state' => 'Taraba', 'capital' => 'Jalingo', 'zone' => 'North East', 'zone_id' => 8, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 15, 'state' => 'Gombe', 'capital' => 'Gombe', 'zone' => 'North East', 'zone_id' => 8, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'state' => 'Bauchi', 'capital' => 'Bauchi', 'zone' => 'North East', 'zone_id' => 8, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8, 'state' => 'Borno', 'capital' => 'Maiduguri', 'zone' => 'North East', 'zone_id' => 8, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 35, 'state' => 'Yobe', 'capital' => 'Damaturu', 'zone' => 'North East', 'zone_id' => 8, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
