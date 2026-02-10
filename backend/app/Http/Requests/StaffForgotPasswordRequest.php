<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StaffForgotPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_no' => 'required|string',
            'email' => 'required|email',
        ];
    }
}
