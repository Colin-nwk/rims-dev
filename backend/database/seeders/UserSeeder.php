<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'John Doe',
                'email' => 'john.doe@example.com',
                'status' => 'active',
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane.smith@example.com',
                'status' => 'active',
            ],
            [
                'name' => 'Michael Johnson',
                'email' => 'michael.johnson@example.com',
                'status' => 'active',
            ],
            [
                'name' => 'Sarah Williams',
                'email' => 'sarah.williams@example.com',
                'status' => 'inactive',
            ],
            [
                'name' => 'David Brown',
                'email' => 'david.brown@example.com',
                'status' => 'active',
            ],
        ];

        foreach ($users as $userData) {
            User::factory()->create($userData);
        }
    }
}
