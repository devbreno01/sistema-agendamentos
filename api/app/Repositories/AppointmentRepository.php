<?php

namespace App\Repositories;

use App\Models\Appointment;

class AppointmentRepository extends AbstractRepository
{
    protected static $model = Appointment::class;

    public function duplicateExists(string $cpf, string $appointmentAt, ?int $exceptId = null): bool
    {
        return Appointment::query()
            ->where('patient_cpf', $cpf)
            ->where('appointment_at', $appointmentAt)
            ->when($exceptId, fn ($query) => $query->whereKeyNot($exceptId))
            ->exists();
    }
}
