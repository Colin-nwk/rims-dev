<?php

namespace App\Helpers;

use Carbon\Carbon;

class FilterHelper
{
    /**
     * Apply Age Range Filter to a query.
     * Supported formats: "18-20", "less 18", "18+", "above 18"
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $value
     * @return void
     */
    public static function applyAgeRangeFilter($query, $value)
    {
        if (empty($value)) {
            return;
        }

        $param = strtolower(trim($value));

        // Format: "18-20" (Range)
        if (preg_match('/^(\d+)-(\d+)$/', $param, $matches)) {
            $min = (int) $matches[1];
            $max = (int) $matches[2];
            
            // Logic: Age >= Min AND Age <= Max
            // dob <= now - min (born before or on min years ago)
            // dob > now - (max + 1) (born after max+1 years ago)
            $query->where('dob', '<=', now()->subYears($min)->format('Y-m-d'))
                  ->where('dob', '>', now()->subYears($max + 1)->format('Y-m-d'));
            return;
        }

        // Format: "less 18", "under 18", "< 18"
        if (preg_match('/^(less|under|<)\s*(\d+)$/', $param, $matches)) {
            $maxAge = (int) $matches[2];
            
            // Logic: Age < MaxAge
            // dob > now - MaxAge
            $query->where('dob', '>', now()->subYears($maxAge)->format('Y-m-d'));
            return;
        }

        // Format: "18+", "above 18", "> 18"
        if (preg_match('/^(\d+)\+$/', $param, $matches) || preg_match('/^(above|>)\s*(\d+)$/', $param, $matches)) {
            // For "18+", matches[1] is 18
            // For "above 18", matches[2] is 18
            $minAge = isset($matches[2]) ? (int) $matches[2] : (int) $matches[1];

            // Logic: Age >= MinAge
            // dob <= now - MinAge
            $query->where('dob', '<=', now()->subYears($minAge)->format('Y-m-d'));
            return;
        }
    }
}
