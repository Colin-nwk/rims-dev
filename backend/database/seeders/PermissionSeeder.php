<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Staff Management
            ['name' => 'staff.view', 'description' => 'View staff details'],
            ['name' => 'staff.create', 'description' => 'Create new staff records'],
            ['name' => 'staff.edit', 'description' => 'Edit existing staff records'],
            ['name' => 'staff.delete', 'description' => 'Delete staff records'],
            
            // User Management
            ['name' => 'user.view', 'description' => 'View system users'],
            ['name' => 'user.create', 'description' => 'Create new system users'],
            ['name' => 'user.edit', 'description' => 'Edit system users'],
            ['name' => 'user.delete', 'description' => 'Delete system users'],

            // Complaint Management
            ['name' => 'complaint.view', 'description' => 'View complaints'],
            ['name' => 'complaint.create', 'description' => 'Create complaints'],
            ['name' => 'complaint.reply', 'description' => 'Reply to complaints'],
            ['name' => 'complaint.resolve', 'description' => 'Resolve complaints'],
            ['name' => 'complaint.delete', 'description' => 'Delete complaints'],

            // Change Requests
            ['name' => 'change_request.view', 'description' => 'View change requests'],
            ['name' => 'change_request.approve', 'description' => 'Approve change requests'],
            ['name' => 'change_request.reject', 'description' => 'Reject change requests'],

            // Access Control (Roles & Permissions)
            ['name' => 'role.view', 'description' => 'View roles'],
            ['name' => 'role.create', 'description' => 'Create roles'],
            ['name' => 'role.edit', 'description' => 'Edit roles'],
            ['name' => 'role.delete', 'description' => 'Delete roles'],
            
            // Reports
            ['name' => 'report.view', 'description' => 'View system reports'],
        ];

        foreach ($permissions as $permission) {
            \App\Models\Permission::firstOrCreate(
                ['name' => $permission['name']],
                ['description' => $permission['description']]
            );
        }
    }
}
