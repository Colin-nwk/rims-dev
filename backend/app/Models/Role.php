<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'prison_id',
        'state_id',
        'zone_id',
        'scopeless',
    ];

    protected $casts = [
        'scopeless' => 'boolean',
    ];

    protected static function booted()
    {
        static::saved(function ($role) {
            \Illuminate\Support\Facades\Cache::forget('app.permissions');
        });

        static::deleted(function ($role) {
            \Illuminate\Support\Facades\Cache::forget('app.permissions');
        });
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class);
    }

    public function prison()
    {
        return $this->belongsTo(Prison::class);
    }

    public function state()
    {
        return $this->belongsTo(State::class);
    }

    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }
}
