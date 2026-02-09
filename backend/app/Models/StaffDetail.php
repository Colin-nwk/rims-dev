<?php

namespace App\Models;

use App\Casts\Encrypted;
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
        'ippis',
        'nin',
        'bvn',
        'place_of_birth',
        'contact_address',
        'permanent_home_address',
        'height',
        'blood_group',
        'genotype',
        'complexion',
        'hair_colour',
        'is_deformed',
        'deformity',
        'is_convicted',
        'previous_convictions',
        'next_of_kin_name',
        'next_of_kin_phone',
        'next_of_kin_relationship',
        'next_of_kin_address',
        'next_of_kin2_name',
        'next_of_kin2_phone',
        'next_of_kin2_relationship',
        'next_of_kin2_address',
        'marital_status',
        'spouse_name',
        'spouse_phone',
        'number_of_children',
        'bank_name',
        'account_number',
        'account_name',
    ];

    protected $casts = [
        // Encrypt sensitive personal information
        'nin' => Encrypted::class,
        'bvn' => Encrypted::class,
        'contact_address' => Encrypted::class,
        'permanent_home_address' => Encrypted::class,
        'next_of_kin_phone' => Encrypted::class,
        'next_of_kin2_phone' => Encrypted::class,
        'spouse_phone' => Encrypted::class,
        'bank_name' => Encrypted::class,
        'account_number' => Encrypted::class,
        'account_name' => Encrypted::class,
        'pension_pin' => Encrypted::class,
        'ippis' => Encrypted::class,
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class, 'service_no', 'service_no');
    }
}
