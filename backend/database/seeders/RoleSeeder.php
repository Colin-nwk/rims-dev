<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Super Admin Role (Scopeless)
        $superAdmin = \App\Models\Role::firstOrCreate(
            ['slug' => 'super-admin'],
            [
                'name' => 'Super Administrator',
                'scopeless' => true,
            ]
        );

        // 2. Assign ALL permissions to Super Admin
        $permissions = \App\Models\Permission::all();
        $superAdmin->permissions()->sync($permissions);

        // 3. Create Basic Staff Role (Example of a base role without administrative powers)
        // This role might have limited permissions like viewing own profile or creating complaints
        $staffRole = \App\Models\Role::firstOrCreate(
            ['slug' => 'staff'],
            [
                'name' => 'Staff Member',
                'scopeless' => false, // Will depend on user's assignment scope logic if we want strict enforcement
            ]
        );

        $staffPermissions = \App\Models\Permission::whereIn('name', [
            'complaint.create',
            'complaint.view',
            'staff.view',
        ])->get();

        $staffRole->permissions()->sync($staffPermissions);
    }
}
