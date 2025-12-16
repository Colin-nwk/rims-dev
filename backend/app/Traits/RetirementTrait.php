<?php

namespace App\Traits;

use Carbon\Carbon;

trait RetirementTrait
{
    /**
     * Calculate retirement date based on:
     * - Date of first appointment + 35 years, OR
     * - Age 65 (DOB + 65 years)
     * Whichever comes first.
     */
    public function getRetirementDateAttribute(): ?Carbon
    {
        if (!$this->dob || !$this->date_of_first_appointment) {
            return null;
        }

        $retirementByService = Carbon::parse($this->date_of_first_appointment)->addYears(35);
        $retirementByAge = Carbon::parse($this->dob)->addYears(65);

        return $retirementByService->lt($retirementByAge) ? $retirementByService : $retirementByAge;
    }

    /**
     * Get formatted retirement date string
     */
    public function getRetirementDateFormattedAttribute(): ?string
    {
        return $this->retirement_date?->format('Y-m-d');
    }

    /**
     * Check if staff is retired
     */
    public function getIsRetiredAttribute(): bool
    {
        if (!$this->retirement_date) {
            return false;
        }
        return Carbon::now()->gte($this->retirement_date);
    }

    /**
     * Get time remaining until retirement (or since retirement)
     */
    public function getRetirementTimeRemainingAttribute(): ?array
    {
        if (!$this->retirement_date) {
            return null;
        }

        $now = Carbon::now();
        $retirementDate = $this->retirement_date;

        if ($now->gte($retirementDate)) {
            return [
                'status' => 'retired',
                'years' => 0,
                'months' => 0,
                'days' => 0,
                'human_readable' => 'Already retired',
            ];
        }

        $diff = $now->diff($retirementDate);

        return [
            'status' => 'active',
            'years' => $diff->y,
            'months' => $diff->m,
            'days' => $diff->d,
            'human_readable' => $diff->y . ' years, ' . $diff->m . ' months, ' . $diff->d . ' days remaining',
        ];
    }
}
