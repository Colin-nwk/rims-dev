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
            // Complaint self-service permissions
            'complaint.create',
            'complaint.view',
            // Staff self-service permissions
            'staff.view',
            'staff.edit',
            // Staff education self-service permissions
            'staff-education.view',
            'staff-education.create',
            'staff-education.edit',
            'staff-education.delete',
            // Staff document self-service permissions
            'staff-document.view',
            'staff-document.create',
            'staff-document.edit',
            'staff-document.delete',
        ])->get();

        $staffRole->permissions()->sync($staffPermissions);
    }
}
