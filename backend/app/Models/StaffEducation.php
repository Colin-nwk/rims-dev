<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffEducation extends Model
{
    /** @use HasFactory<\Database\Factories\StaffEducationFactory> */
    use HasFactory;

    protected $fillable = [
        'service_no',
        'institution',
        'course',
        'type',
        'start_date',
        'end_date',
        'url',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class, 'service_no', 'service_no');
    }
}
