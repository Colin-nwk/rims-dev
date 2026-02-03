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
            'service_no' => 'sometimes|required|string|unique:staff,service_no,'.$this->staff->id,
            'surname' => 'sometimes|required|string',
            'first_name' => 'sometimes|required|string',
            'other_names' => 'nullable|string',
            'status' => 'sometimes|required|integer',
            'email' => 'nullable|email',
            'phone_number' => 'nullable|string',
            'sex' => 'nullable|string',
            'initial_rank' => 'nullable|string',
            'present_rank' => 'nullable|string',
            'level' => 'nullable|integer',
            'step' => 'nullable|string',
            'dob' => 'nullable|date',
            'date_of_first_appointment' => 'nullable|date',
            'present_appointment_date' => 'nullable|date',
            'command_post_date' => 'nullable|date',
            'initial_command' => 'nullable|string',
            'present_command' => 'nullable|string',
            'state_of_origin' => 'nullable|string',
            'lga' => 'nullable|string',
            'assigned_state' => 'nullable|integer|exists:states,id',
            'prison' => 'nullable|integer|exists:prisons,id',
            'department' => 'nullable|string',
            'file_no' => 'nullable|string',
            'ippis' => 'nullable|string|unique:staff,ippis,'.$this->staff->id,
            'duty' => 'nullable|string',
            'description' => 'nullable|string',
            'is_verified' => 'boolean',

            // Details
            'details' => 'nullable|array',
            'details.nin' => 'nullable|string',
            'details.bvn' => 'nullable|string',
            'details.place_of_birth' => 'nullable|string',
            'details.contact_address' => 'nullable|string',
            'details.permanent_home_address' => 'nullable|string',
            'details.height' => 'nullable|string',
            'details.blood_group' => 'nullable|string',
            'details.genotype' => 'nullable|string',
            'details.complexion' => 'nullable|string',
            'details.hair_colour' => 'nullable|string',
            'details.is_deformed' => 'boolean',
            'details.deformity' => 'nullable|string|required_if:details.is_deformed,true',
            'details.is_convicted' => 'boolean',
            'details.previous_convictions' => 'nullable|string|required_if:details.is_convicted,true',
            'details.pfa_name' => 'nullable|string',
            'details.pension_pin' => 'nullable|string',
            'details.ippis' => 'nullable|string',
            'details.next_of_kin_name' => 'nullable|string',
            'details.next_of_kin_phone' => 'nullable|string',
            'details.next_of_kin_relationship' => 'nullable|string',
            'details.next_of_kin_address' => 'nullable|string',
            'details.marital_status' => 'nullable|string',
            'details.spouse_name' => 'nullable|string',
            'details.spouse_phone' => 'nullable|string',
            'details.number_of_children' => 'nullable|integer',
            'details.bank_name' => 'nullable|string',
            'details.account_number' => 'nullable|string',
            'details.account_name' => 'nullable|string',

            // Education
            'education' => 'nullable|array',
            'education.*.institution' => 'required|string',
            'education.*.course' => 'nullable|string',
            'education.*.type' => 'required|string',
            'education.*.start_date' => 'required|date',
            'education.*.end_date' => 'nullable|date|after_or_equal:education.*.start_date',
            'education.*.url' => 'nullable',

            'photo' => 'nullable|image|max:2048',
        ];
    }
}
