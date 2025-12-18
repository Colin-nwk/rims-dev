<?php

namespace App\Traits;

trait AuthorizesScopedAccess
{
    /**
     * Get the prison ID for the model.
     */
    public function getPrisonId(): ?int
    {
        return $this->prison_id ?? $this->prison ?? null; // Adjust based on column name
    }

    /**
     * Get the state ID for the model.
     */
    public function getStateId(): ?int
    {
        return $this->state_id ?? $this->assigned_state ?? null; // Adjust based on column name
    }

    /**
     * Get the zone ID for the model.
     */
    public function getZoneId(): ?int
    {
        return $this->zone_id ?? null;
    }
}
