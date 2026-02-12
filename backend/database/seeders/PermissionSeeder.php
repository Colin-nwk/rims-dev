<?php

namespace Database\Seeders;

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
            ['name' => 'staff.view', 'description' => 'View staff details', 'group' => 'staff'],
            ['name' => 'staff.create', 'description' => 'Create new staff records', 'group' => 'staff'],
            ['name' => 'staff.edit', 'description' => 'Edit existing staff records', 'group' => 'staff'],
            ['name' => 'staff.delete', 'description' => 'Delete staff records', 'group' => 'staff'],

            // Staff Education Management
            ['name' => 'staff-education.view', 'description' => 'View education records', 'group' => 'staff-education'],
            ['name' => 'staff-education.create', 'description' => 'Create education records', 'group' => 'staff-education'],
            ['name' => 'staff-education.edit', 'description' => 'Edit education records', 'group' => 'staff-education'],
            ['name' => 'staff-education.delete', 'description' => 'Delete education records', 'group' => 'staff-education'],

            // User Management
            ['name' => 'user.view', 'description' => 'View system users', 'group' => 'user'],
            ['name' => 'user.create', 'description' => 'Create new system users', 'group' => 'user'],
            ['name' => 'user.edit', 'description' => 'Edit system users', 'group' => 'user'],
            ['name' => 'user.delete', 'description' => 'Delete system users', 'group' => 'user'],

            // Complaint Management
            ['name' => 'complaint.view', 'description' => 'View complaints', 'group' => 'complaint'],
            ['name' => 'complaint.create', 'description' => 'Create complaints', 'group' => 'complaint'],
            ['name' => 'complaint.reply', 'description' => 'Reply to complaints', 'group' => 'complaint'],
            ['name' => 'complaint.resolve', 'description' => 'Resolve complaints', 'group' => 'complaint'],
            ['name' => 'complaint.delete', 'description' => 'Delete complaints', 'group' => 'complaint'],

            // Change Requests
            ['name' => 'change_request.view', 'description' => 'View change requests', 'group' => 'change_request'],
            ['name' => 'change_request.view_all', 'description' => 'View all change requests', 'group' => 'change_request'],
            ['name' => 'change_request.approve', 'description' => 'Approve change requests', 'group' => 'change_request'],
            ['name' => 'change_request.reject', 'description' => 'Reject change requests', 'group' => 'change_request'],

            // Access Control (Roles & Permissions)
            ['name' => 'role.view', 'description' => 'View roles', 'group' => 'role'],
            ['name' => 'role.create', 'description' => 'Create roles', 'group' => 'role'],
            ['name' => 'role.edit', 'description' => 'Edit roles', 'group' => 'role'],
            ['name' => 'role.delete', 'description' => 'Delete roles', 'group' => 'role'],

            // Reports
            ['name' => 'report.view', 'description' => 'View system reports', 'group' => 'report'],

             // GENERIC CRUD like states, zones, ranks, etc
            ['name' => 'generic.create', 'description' => 'Create generic data (states, zones, ranks, etc)', 'group' => 'generic'],
            ['name' => 'generic.edit', 'description' => 'Edit generic data (states, zones, ranks, etc)', 'group' => 'generic'],
            ['name' => 'generic.delete', 'description' => 'Delete generic data (states, zones, ranks, etc)', 'group' => 'generic'],

            // Rep
        ];

        foreach ($permissions as $permission) {
            \App\Models\Permission::updateOrCreate(
                ['name' => $permission['name']],
                [
                    'description' => $permission['description'],
                    'group' => $permission['group'],
                ]
            );
        }
    }
}
