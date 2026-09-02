<?php

namespace App\DTO;

use App\Http\Requests\AppointmentRequest;

class AppointmentDto
{
    public function __construct(
        public ?string $patientName = null,
        public ?string $patientCpf = null,
        public ?string $appointmentAt = null,
        public ?string $specialtyOrReason = null,
        public ?string $notes = null,
        public bool $hasNotes = false,
    ) {}

    public static function fromRequest(AppointmentRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            patientName: $validated['patient_name'] ?? null,
            patientCpf: $validated['patient_cpf'] ?? null,
            appointmentAt: $validated['appointment_at'] ?? null,
            specialtyOrReason: $validated['specialty_or_reason'] ?? null,
            notes: $validated['notes'] ?? null,
            hasNotes: array_key_exists('notes', $validated),
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'patient_name' => $this->patientName,
            'patient_cpf' => $this->patientCpf,
            'appointment_at' => $this->appointmentAt,
            'specialty_or_reason' => $this->specialtyOrReason,
            'notes' => $this->notes,
        ], fn (mixed $value, string $key): bool => $value !== null || ($key === 'notes' && $this->hasNotes), ARRAY_FILTER_USE_BOTH);
    }
}
