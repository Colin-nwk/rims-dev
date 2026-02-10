<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StaffResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_no' => 'required|string',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ];
    }
}
