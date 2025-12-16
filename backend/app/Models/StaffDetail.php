<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffDetail extends Model
{
    /** @use HasFactory<\Database\Factories\StaffDetailFactory> */
    use HasFactory;

    protected $fillable = [
        'service_no',
        'pfa_name',
        'pension_pin',
        'ippis_number',
        'next_of_kin_name',
        'next_of_kin_phone',
        'next_of_kin_relationship',
        'next_of_kin_address',
        'marital_status',
        'spouse_name',
        'spouse_phone',
        'number_of_children',
        'bank_name',
        'account_number',
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class, 'service_no', 'service_no');
    }
}
