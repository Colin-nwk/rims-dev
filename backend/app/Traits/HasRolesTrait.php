<?php

namespace App\Traits;

use App\Models\Role;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

trait HasRolesTrait
{
    /**
     * The roles that belong to the user/staff.
     */
    public function roles(): MorphToMany
    {
        return $this->morphToMany(Role::class, 'model', 'model_has_roles');
    }

    /**
     * Check if the user has a specific role.
     */
    public function hasRole(string $slug): bool
    {
        return $this->roles->contains('slug', $slug);
    }

    /**
     * Check if the user has any of the given roles.
     */
    public function hasAnyRole(array $slugs): bool
    {
        return $this->roles->whereIn('slug', $slugs)->isNotEmpty();
    }

    /**
     * Get all permissions as a flat array of strings.
     */
    public function getAllPermissionsAttribute(): array
    {
        return $this->roles->load('permissions')
            ->pluck('permissions')
            ->flatten()
            ->pluck('name')
            ->unique()
            ->values()
            ->toArray();
    }

    /**
     * Get cached role IDs for the user.
     * Use this instead of $user->roles to avoid DB hits.
     */
    public function getCachedRoleIds(): array
    {
        $key = "user_roles_{$this->id}_".get_class($this);

        return \Illuminate\Support\Facades\Cache::rememberForever($key, function () {
            // Reload relation to be safe, or just use $this->roles if loaded
            return $this->roles()->pluck('id')->toArray();
        });
    }

    /**
     * Flush the user's role cache.
     */
    public function flushRoleCache(): void
    {
        $key = "user_roles_{$this->id}_".get_class($this);
        \Illuminate\Support\Facades\Cache::forget($key);
    }
}
