<?php

namespace App\Repositories;

use App\Models\Appointment;

class AppointmentRepository extends AbstractRepository
{
    protected static $model = Appointment::class;

    public function hasScheduledAppointmentForCpf(string $cpf, ?int $exceptId = null): bool
    {
        return Appointment::query()
            ->where('patient_cpf', $cpf)
            ->where('status', Appointment::STATUS_SCHEDULED)
            ->when($exceptId, fn ($query) => $query->whereKeyNot($exceptId))
            ->exists();
    }
}
