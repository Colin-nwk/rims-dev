<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superAdminRole = Role::where('slug', 'super-admin')->first();

        $users = [
            [
                'name' => 'John Doe',
                'email' => 'john.doe@example.com',
                'status' => 'active',
                'is_admin' => true,
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane.smith@example.com',
                'status' => 'active',
                'is_admin' => true,
            ],
            [
                'name' => 'Michael Johnson',
                'email' => 'michael.johnson@example.com',
                'status' => 'active',
                'is_admin' => false,
            ],
            [
                'name' => 'Sarah Williams',
                'email' => 'sarah.williams@example.com',
                'status' => 'inactive',
                'is_admin' => false,
            ],
            [
                'name' => 'David Brown',
                'email' => 'david.brown@example.com',
                'status' => 'active',
                'is_admin' => false,
            ],
        ];

        foreach ($users as $userData) {
            $isAdmin = $userData['is_admin'];
            unset($userData['is_admin']);

            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                array_merge($userData, [
                    'password' => bcrypt('password'),
                    'email_verified_at' => now(),
                ])
            );

            if ($isAdmin && $superAdminRole) {
                $user->roles()->syncWithoutDetaching([$superAdminRole->id]);
            }
        }
    }
}
