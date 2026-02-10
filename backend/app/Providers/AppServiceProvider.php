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
            // Register global 'safe_url' validation rule
            \Illuminate\Support\Facades\Validator::extend('safe_url', function ($attribute, $value, $parameters, $validator) {
                $rule = new \App\Rules\SafeUrl;
                $passes = true;
                $fail = function ($message) use (&$passes) {
                    $passes = false;
                };

                $rule->validate($attribute, $value, $fail);

                return $passes;
            }, 'The :attribute must be a safe URL (publicly accessible).');

            // Global API Rate Limiter
            \Illuminate\Support\Facades\RateLimiter::for('api', function (\Illuminate\Http\Request $request) {
                return \Illuminate\Cache\RateLimiting\Limit::perMinute(60)
                    ->by($request->user()?->id ?: $request->ip())
                    ->response(function () {
                        return response()->json([
                            'status' => 'Error',
                            'message' => 'Too many requests. Please try again later.',
                        ], 429);
                    });
            });

            // Strict Auth Rate Limiter (Login/Register/Reset)
            \Illuminate\Support\Facades\RateLimiter::for('auth', function (\Illuminate\Http\Request $request) {
                return \Illuminate\Cache\RateLimiting\Limit::perMinute(5)
                    ->by($request->ip())
                    ->response(function () {
                        return response()->json([
                            'status' => 'Error',
                            'message' => 'Too many authentication attempts. Please try again later.',
                        ], 429);
                    });
            });
            
            // Enhanced rate limiter for sensitive endpoints
            \Illuminate\Support\Facades\RateLimiter::for('sensitive', function (\Illuminate\Http\Request $request) {
                return \Illuminate\Cache\RateLimiting\Limit::perMinute(30)
                    ->by($request->user()?->id ?: $request->ip())
                    ->response(function () {
                        return response()->json([
                            'status' => 'Error',
                            'message' => 'Too many requests to sensitive endpoint. Please try again later.',
                        ], 429);
                    });
            });

            // Cache permissions indefinitely to handle high scale
            $permissions = \Illuminate\Support\Facades\Cache::rememberForever('app.permissions', function () {
                return \App\Models\Permission::with('roles')->get();
            });

            foreach ($permissions as $permission) {
                // We bind the permission NAME to the closure, but fetch the LATEST object from cache/memory
                \Illuminate\Support\Facades\Gate::define($permission->name, function ($user, $target = null) use ($permission) {
                    try {
                        // Reload the permission from the (potentially refreshed) cache to handle runtime updates (like in tests)
                        $cachedPermissions = \Illuminate\Support\Facades\Cache::rememberForever('app.permissions', function () {
                            return \App\Models\Permission::with('roles')->get();
                        });

                        // Find the specific permission object in the fresh collection
                        $currentPermission = $cachedPermissions->firstWhere('id', $permission->id);

                        if (! $currentPermission) {
                            \Log::warning('Permission not found in cache', ['permission_id' => $permission->id]);
                            return false;
                        }

                        // 1. Get user's roles CACHED to avoid per-request DB query.
                        // We assume $user has the HasRolesTrait.
                        $userRoleIds = method_exists($user, 'getCachedRoleIds')
                            ? $user->getCachedRoleIds()
                            : $user->roles->pluck('id')->toArray();

                        // Use the CACHED relationship
                        $authorizedRoles = $currentPermission->roles->filter(function ($role) use ($userRoleIds) {
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
                                $getScopeId = function ($obj, $method) {
                                    if (!method_exists($obj, $method)) {
                                        return null;
                                    }
                                    
                                    try {
                                        $result = $obj->$method();
                                        return is_numeric($result) ? (int)$result : $result;
                                    } catch (\Exception $e) {
                                        \Log::error('Error getting scope ID', [
                                            'object' => get_class($obj),
                                            'method' => $method,
                                            'error' => $e->getMessage()
                                        ]);
                                        return null;
                                    }
                                };

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
                    } catch (\Exception $e) {
                        \Log::error('Authorization error', [
                            'user_id' => $user->id ?? 'unknown',
                            'permission' => $permission->name ?? 'unknown',
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                        
                        // Fail securely - deny access on error
                        return false;
                    }
                });
            }
        } catch (\Exception $e) {
            // Migration might not have run yet, ignore db errors during boot
        }
    }
}
