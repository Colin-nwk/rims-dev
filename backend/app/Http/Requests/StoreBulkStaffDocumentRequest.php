<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBulkStaffDocumentRequest extends FormRequest
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
            'documents' => ['required', 'array', 'min:1', 'max:10'], // Limit to 10 files per upload for now
            'documents.*.document_type' => ['required', 'string', 'in:birth_certificate,confirmation_certificate,national_id,passport,appointment_letter,promotion_letter,transfer_letter,other'],
            'documents.*.document_name' => ['required', 'string', 'max:255'],
            'documents.*.file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'], // 10MB
            'documents.*.notes' => ['nullable', 'string', 'max:1000'],
            'documents.*.expires_at' => ['nullable', 'date', 'after:today'],
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
            'documents.required' => 'Documents are required',
            'documents.min' => 'At least one document is required',
            'documents.max' => 'You can upload a maximum of 10 documents at once',

            'documents.*.document_type.required' => 'Document type is required for all documents',
            'documents.*.document_type.in' => 'Invalid document type selected',
            'documents.*.document_name.required' => 'Document name is required for all documents',
            'documents.*.file.required' => 'File is required for all documents',
            'documents.*.file.mimes' => 'Document must be a PDF, JPG, JPEG, or PNG file',
            'documents.*.file.max' => 'Document file size must not exceed 10MB',
            'documents.*.expires_at.after' => 'Expiry date must be in the future',
        ];
    }
}
