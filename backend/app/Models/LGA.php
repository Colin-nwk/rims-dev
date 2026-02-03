<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LGA extends Model
{
    use HasFactory;

    protected $table = 'lga';

    protected $fillable = [
        'state_id',
        'lga',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'integer',
        ];
    }

    public function state()
    {
        return $this->belongsTo(State::class);
    }
}
