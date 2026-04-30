<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait FilterableTrait
{
    /**
     * Scope a query to filter results.
     *
     * @return Builder
     */
    public function scopeFilter(Builder $query, array $filters)
    {
        // 1. Search
        if (isset($filters['search']) && ! empty($filters['search'])) {
            $search = $filters['search'];
            $searchable = $this->searchable ?? [];

            $query->where(function ($q) use ($search, $searchable) {
                foreach ($searchable as $field) {
                    if (str_contains($field, '.')) {
                        // Handle relation search (e.g. 'details.pfa_name')
                        [$relation, $col] = explode('.', $field);
                        $q->orWhereHas($relation, function ($relQ) use ($col, $search) {
                            $relQ->where($col, 'like', "%{$search}%");
                        });
                    } else {
                        $q->orWhere($field, 'like', "%{$search}%");
                    }
                }
            });
        }

        // 2. Exact Filters & Custom Methods
        // Define allowable filters in $filterable property on model
        $filterable = $this->filterable ?? [];
        foreach ($filters as $key => $value) {
            // Check for custom filter method: filterKeyName($query, $value)
            $method = 'filter'.\Illuminate\Support\Str::studly($key);
            if (method_exists($this, $method)) {
                $this->{$method}($query, $value);

                continue;
            }

            if (in_array($key, $filterable) && ! is_null($value) && $value !== '') {
                $query->where($key, $value);
            }
        }

        // 3. Sorting (e.g. ?sort=created_at&sort_dir=desc)
        if (isset($filters['sort'])) {
            $sortDir = $filters['sort_dir'] ?? 'asc';
            $query->orderBy($filters['sort'], $sortDir);
        } else {
            // Default sort constraint if not present
            $query->latest();
        }

        return $query;
    }
}
