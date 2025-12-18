<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        try {
            // Eager load roles to avoid N+1 queries during gate registration loop
            // NOTE: In production with many permissions, cache this query.
            $permissions = \App\Models\Permission::with('roles')->get();

            foreach ($permissions as $permission) {
                \Illuminate\Support\Facades\Gate::define($permission->name, function ($user, $target = null) use ($permission) {
                    // 1. Get user's roles that have this permission.
                    // We assume $user has the HasRolesTrait and relationship loaded/accessible.
                    // We filter the permission's roles to see which ones the user possesses.
                    $userRoleIds = $user->roles->pluck('id')->toArray();
                    
                    // Use fresh roles to handle test/runtime changes
                    $authorizedRoles = $permission->roles()->get()->filter(function ($role) use ($userRoleIds) {
                        return in_array($role->id, $userRoleIds);
                    });

                    if ($authorizedRoles->isEmpty()) {
                        return false;
                    }

                    // 2. Check scoping for authorized roles
                    foreach ($authorizedRoles as $role) {
                        // If role is scopeless, it grants access anywhere
                        if ($role->scopeless) {
                            return true;
                        }

                        // If there is a target resource, check scope match
                        if ($target) {
                            // Helper to get ID safely
                            $getScopeId = fn($obj, $method) => method_exists($obj, $method) ? $obj->$method() : null;
                            
                            // Prison Scope
                            if ($role->prison_id) {
                                $targetPrisonId = $getScopeId($target, 'getPrisonId');
                                if ($targetPrisonId && $role->prison_id == $targetPrisonId) {
                                    return true;
                                }
                            }

                            // State Scope
                            if ($role->state_id) {
                                $targetStateId = $getScopeId($target, 'getStateId');
                                if ($targetStateId && $role->state_id == $targetStateId) {
                                    return true;
                                }
                            }

                            // Zone Scope
                            if ($role->zone_id) {
                                $targetZoneId = $getScopeId($target, 'getZoneId');
                                if ($targetZoneId && $role->zone_id == $targetZoneId) {
                                    return true;
                                }
                            }
                        } else {
                            // No target passed.
                            // If the role is scoped, strictly speaking it implies constraints.
                            // However, general permission checks (e.g. "view-dashboard") often don't pass a target.
                            // Strategy: If no target is provided, we assume the controller/query will filter data.
                            // So we allow access, but the user will only see what their scope allows in queries.
                            return true;
                        }
                    }

                    return false;
                });
            }
        } catch (\Exception $e) {
            // Migration might not have run yet, ignore db errors during boot
        }
    }
}
