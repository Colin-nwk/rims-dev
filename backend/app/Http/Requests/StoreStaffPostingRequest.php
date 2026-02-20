<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStaffPostingRequest extends FormRequest
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
            'service_no' => ['required', 'string', 'exists:staff,service_no'],
            'type' => ['required', 'string', 'max:255'],
            'station_name' => ['required', 'string', 'max:255'],
            'station_location' => ['nullable', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['required', 'string', 'in:active,completed,terminated'],
            'reason' => ['nullable', 'string', 'max:500'],
            'remarks' => ['nullable', 'string'],
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
            'service_no.required' => 'Service number is required',
            'service_no.exists' => 'The specified service number does not exist',
            'type.required' => 'Posting type is required',
            'station_name.required' => 'Station name is required',
            'start_date.required' => 'Start date is required',
            'end_date.after_or_equal' => 'End date must be on or after the start date',
            'status.in' => 'Status must be one of: active, completed, terminated',
        ];
    }
}
