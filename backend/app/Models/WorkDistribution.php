<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkDistribution extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
        ];
    }
}
