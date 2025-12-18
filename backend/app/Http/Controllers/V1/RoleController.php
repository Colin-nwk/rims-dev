<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Models\Role;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    use ApiResponseTrait;

    public function index()
    {
        $roles = Role::with('permissions', 'prison', 'state', 'zone')->get();
        return $this->successResponse($roles, 'Roles retrieved successfully');
    }

    public function store(StoreRoleRequest $request)
    {
        $validated = $request->validated();
        
        $role = Role::create($validated);
        
        if (isset($validated['permissions'])) {
            $role->permissions()->sync($validated['permissions']);
        }
        
        $role->load('permissions', 'prison', 'state', 'zone');
        
        return $this->successResponse($role, 'Role created successfully', 201);
    }

    public function show(Role $role)
    {
        $role->load('permissions', 'prison', 'state', 'zone');
        return $this->successResponse($role, 'Role retrieved successfully');
    }

    public function update(UpdateRoleRequest $request, Role $role)
    {
        $validated = $request->validated();
        
        $role->update($validated);

        if (isset($validated['permissions'])) {
            $role->permissions()->sync($validated['permissions']);
        }
        
        $role->load('permissions', 'prison', 'state', 'zone');

        return $this->successResponse($role, 'Role updated successfully');
    }

    public function destroy(Role $role)
    {
        $role->delete();
        return $this->successResponse(null, 'Role deleted successfully');
    }

    public function syncPermissions(Request $request, Role $role)
    {
        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id'
        ]);

        $role->permissions()->sync($request->permissions);
        
        return $this->successResponse($role->load('permissions'), 'Permissions synced successfully');
    }

    public function attachPermission(Request $request, Role $role)
    {
        $request->validate([
            'permission_id' => 'required|exists:permissions,id'
        ]);

        $role->permissions()->syncWithoutDetaching([$request->permission_id]);
        
        return $this->successResponse($role->load('permissions'), 'Permission attached successfully');
    }

    public function detachPermission(Request $request, Role $role)
    {
        $request->validate([
            'permission_id' => 'required|exists:permissions,id'
        ]);

        $role->permissions()->detach($request->permission_id);
        
        return $this->successResponse($role->load('permissions'), 'Permission detached successfully');
    }
}
