<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prison extends Model
{
    use HasFactory;

    protected $fillable = [
        'state_id',
        'prison_name',
        'address',
        'capacity',
        'active',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'status' => 'boolean',
        ];
    }

    public function state()
    {
        return $this->belongsTo(State::class);
    }
}
