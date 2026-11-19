<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class Encrypted implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @param  mixed  $value
     * @return mixed
     */
    public function get($model, string $key, $value, array $attributes)
    {
        if ($value === null) {
            return null;
        }

        try {
            return decrypt($value);
        } catch (\Exception $e) {
            // Log the error but don't expose it to the user
            \Log::error('Decryption failed: '.$e->getMessage());

            return null;
        }
    }

    /**
     * Prepare the given value for storage.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @param  mixed  $value
     * @return mixed
     */
    public function set($model, string $key, $value, array $attributes)
    {
        if ($value === null) {
            return null;
        }

        return encrypt($value);
    }
}
