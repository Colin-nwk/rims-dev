<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStaffRequest extends FormRequest
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
            'service_no' => 'sometimes|required|string|unique:staff,service_no,' . $this->staff->id,
            'surname' => 'sometimes|required|string',
            'first_name' => 'sometimes|required|string',
            'status' => 'sometimes|required|integer',
            'email' => 'nullable|email',
        ];
    }
}
