<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStaffEducationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'service_no' => ['sometimes', 'string', 'exists:staff,service_no'],
            'institution' => ['sometimes', 'string', 'max:255'],
            'course' => ['nullable', 'string', 'max:255'],
            'type' => ['sometimes', 'string', 'max:255'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'url' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'], // 5MB max
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'service_no.exists' => 'The specified service number does not exist',
            'end_date.after_or_equal' => 'End date must be on or after the start date',
            'url.mimes' => 'Certificate must be a PDF, JPG, JPEG, or PNG file',
            'url.max' => 'Certificate file size must not exceed 5MB',
        ];
    }
}
