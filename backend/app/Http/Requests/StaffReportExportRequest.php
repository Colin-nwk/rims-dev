<?php

namespace App\Http\Requests;

class StaffReportExportRequest extends StaffReportRequest
{
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'format' => ['required', 'string', 'in:pdf,word,document'],
            'columns' => ['required', 'array', 'min:1', 'max:20'],
            'columns.*' => ['required', 'string', 'distinct'],
            'file_name' => ['nullable', 'string', 'max:80', 'regex:/^[A-Za-z0-9 _-]+$/'],
        ]);
    }
}
