<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'string|max:255',
            'slug' => 'string|max:255|unique:roles,slug,' . $this->route('role')->id,
            'prison_id' => 'nullable|exists:prisons,id',
            'state_id' => 'nullable|exists:states,id',
            'zone_id' => 'nullable|exists:zones,id',
            'scopeless' => 'boolean',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ];
    }
}
