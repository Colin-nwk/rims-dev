<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingInstitute extends Model
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
