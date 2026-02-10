<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStaffDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'service_no' => ['required', 'string', 'exists:staff,service_no'],
            'document_type' => ['required', 'string', 'in:birth_certificate,confirmation_certificate,national_id,passport,appointment_letter,promotion_letter,transfer_letter,other'],
            'document_name' => ['required', 'string', 'max:255'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'], // 10MB max
            'notes' => ['nullable', 'string', 'max:1000'],
            'expires_at' => ['nullable', 'date', 'after:today'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'service_no.required' => 'Service number is required',
            'service_no.exists' => 'The specified service number does not exist',
            'document_type.required' => 'Document type is required',
            'document_type.in' => 'Invalid document type selected',
            'document_name.required' => 'Document name is required',
            'file.required' => 'Document file is required',
            'file.mimes' => 'Document must be a PDF, JPG, JPEG, or PNG file',
            'file.max' => 'Document file size must not exceed 10MB',
            'expires_at.after' => 'Expiry date must be in the future',
        ];
    }
}
