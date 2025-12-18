<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $fillable = ['name', 'description'];

    protected static function booted()
    {
        static::saved(function ($permission) {
            \Illuminate\Support\Facades\Cache::forget('app.permissions');
        });

        static::deleted(function ($permission) {
            \Illuminate\Support\Facades\Cache::forget('app.permissions');
        });
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }
}
