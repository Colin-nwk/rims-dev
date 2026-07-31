<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StaffReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('report.view') ?? false;
    }

    public function rules(): array
    {
        return [
            'criteria' => ['sometimes', 'array'],
            'criteria.search' => ['nullable', 'string', 'max:100'],
            'criteria.statuses' => ['sometimes', 'array', 'max:10'],
            'criteria.statuses.*' => ['integer', 'in:0,1,2'],
            'criteria.staff_status_ids' => ['sometimes', 'array', 'max:100'],
            'criteria.staff_status_ids.*' => ['integer', 'distinct', 'exists:statuses,id'],
            'criteria.sex' => ['sometimes', 'array', 'max:10'],
            'criteria.sex.*' => ['string', 'max:30'],
            'criteria.directorate_ids' => ['sometimes', 'array', 'max:100'],
            'criteria.directorate_ids.*' => ['integer', 'distinct', 'exists:directorates,id'],
            'criteria.work_distribution_ids' => ['sometimes', 'array', 'max:100'],
            'criteria.work_distribution_ids.*' => ['integer', 'distinct', 'exists:work_distributions,id'],
            'criteria.training_institute_ids' => ['sometimes', 'array', 'max:100'],
            'criteria.training_institute_ids.*' => ['integer', 'distinct', 'exists:training_institutes,id'],
            'criteria.rank_ids' => ['sometimes', 'array', 'max:100'],
            'criteria.rank_ids.*' => ['integer', 'distinct', 'exists:rankings,id'],
            'criteria.levels' => ['sometimes', 'array', 'max:30'],
            'criteria.levels.*' => ['integer', 'distinct', 'between:1,30'],
            'criteria.zone_ids' => ['sometimes', 'array', 'max:20'],
            'criteria.zone_ids.*' => ['integer', 'distinct', 'exists:zones,id'],
            'criteria.state_ids' => ['sometimes', 'array', 'max:50'],
            'criteria.state_ids.*' => ['integer', 'distinct', 'exists:states,id'],
            'criteria.prison_ids' => ['sometimes', 'array', 'max:200'],
            'criteria.prison_ids.*' => ['integer', 'distinct', 'exists:prisons,id'],
            'criteria.departments' => ['sometimes', 'array', 'max:100'],
            'criteria.departments.*' => ['string', 'max:100', 'distinct'],
            'criteria.blood_groups' => ['sometimes', 'array', 'max:20'],
            'criteria.blood_groups.*' => ['string', 'max:20', 'distinct'],
            'criteria.genotypes' => ['sometimes', 'array', 'max:20'],
            'criteria.genotypes.*' => ['string', 'max:20', 'distinct'],
            'criteria.marital_statuses' => ['sometimes', 'array', 'max:20'],
            'criteria.marital_statuses.*' => ['string', 'max:50', 'distinct'],
            'criteria.age' => ['sometimes', 'array'],
            'criteria.age.min' => ['nullable', 'integer', 'between:15,100'],
            'criteria.age.max' => ['nullable', 'integer', 'between:15,100'],
            'criteria.missing_fields' => ['sometimes', 'array', 'max:20'],
            'criteria.missing_fields.*' => ['string', 'distinct', 'in:email,phone_number,photo,date_of_birth,rank,department,directorate,work_distribution,training_institute,zone,custodial_centre,staff_status,last_login,blood_group,genotype,nin,bvn,pension_pin,bank_account,education'],
            'criteria.appointment_date' => ['sometimes', 'array'],
            'criteria.appointment_date.from' => ['nullable', 'date_format:Y-m-d'],
            'criteria.appointment_date.to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:criteria.appointment_date.from'],
            'criteria.date_of_birth' => ['sometimes', 'array'],
            'criteria.date_of_birth.from' => ['nullable', 'date_format:Y-m-d'],
            'criteria.date_of_birth.to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:criteria.date_of_birth.from'],
            'criteria.record_created' => ['sometimes', 'array'],
            'criteria.record_created.from' => ['nullable', 'date_format:Y-m-d'],
            'criteria.record_created.to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:criteria.record_created.from'],
            'criteria.last_login' => ['sometimes', 'array'],
            'criteria.last_login.from' => ['nullable', 'date'],
            'criteria.last_login.to' => ['nullable', 'date', 'after_or_equal:criteria.last_login.from'],
            'criteria.has_email' => ['nullable', 'boolean'],
            'criteria.has_photo' => ['nullable', 'boolean'],
            'criteria.never_logged_in' => ['nullable', 'boolean'],
            'criteria.verified' => ['nullable', 'boolean'],
            'criteria.has_education' => ['nullable', 'boolean'],
            'include' => ['sometimes', 'array', 'min:1', 'max:2'],
            'include.*' => ['string', 'distinct', 'in:summary,details'],
            'page' => ['sometimes', 'array'],
            'page.number' => ['sometimes', 'integer', 'min:1'],
            'page.size' => ['sometimes', 'integer', 'between:1,100'],
            'sort' => ['sometimes', 'array', 'max:1'],
            'sort.*.field' => ['required_with:sort', 'string', 'in:service_no,full_name,date_of_first_appointment,level,last_login,status'],
            'sort.*.direction' => ['required_with:sort', 'string', 'in:asc,desc'],
        ];
    }

    /** @return array<int, callable(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            $allowed = [
                'search', 'statuses', 'staff_status_ids', 'sex', 'directorate_ids',
                'work_distribution_ids', 'training_institute_ids', 'rank_ids',
                'levels', 'zone_ids', 'state_ids', 'prison_ids', 'departments',
                'blood_groups', 'genotypes', 'marital_statuses', 'age', 'missing_fields',
                'appointment_date', 'date_of_birth', 'record_created', 'last_login',
                'has_email', 'has_photo', 'never_logged_in', 'verified', 'has_education',
            ];

            foreach (array_keys((array) $this->input('criteria', [])) as $key) {
                if (! in_array($key, $allowed, true)) {
                    $validator->errors()->add("criteria.{$key}", 'This report filter is not supported.');
                }
            }

            $minimumAge = $this->input('criteria.age.min');
            $maximumAge = $this->input('criteria.age.max');
            if ($minimumAge !== null && $maximumAge !== null && (int) $maximumAge < (int) $minimumAge) {
                $validator->errors()->add('criteria.age.max', 'The maximum age must be greater than or equal to the minimum age.');
            }
        }];
    }
}
