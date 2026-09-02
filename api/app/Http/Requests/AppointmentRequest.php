<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $presenceRules = $this->isMethod('post')
            ? ['required']
            : ['sometimes', 'required'];

        return [
            'patient_name' => [...$presenceRules, 'string', 'max:255'],
            'patient_cpf' => [...$presenceRules, 'string', 'regex:/^\d{3}\.\d{3}\.\d{3}-\d{2}$/'],
            'appointment_at' => [...$presenceRules, 'date'],
            'specialty_or_reason' => [...$presenceRules, 'string', 'max:255'],
            'notes' => ['sometimes', 'nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'patient_cpf.regex' => 'O CPF deve estar no formato 000.000.000-00.',
        ];
    }
}
