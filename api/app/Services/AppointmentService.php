<?php

namespace App\Services;

use App\DTO\AppointmentDto;
use App\Models\Appointment;
use App\Repositories\AppointmentRepository;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AppointmentService
{
    public function __construct(
        private readonly AppointmentRepository $repository,
    ) {}

    public function getAll(): Collection
    {
        return $this->repository->all();
    }

    public function find(int $id): Appointment
    {
        $appointment = $this->repository->find($id);

        abort_if(! $appointment, 404, 'Consulta não encontrada.');

        return $appointment;
    }

    public function create(AppointmentDto $dto): Appointment
    {
        $attributes = $dto->toArray();
        $this->validateCpf($attributes['patient_cpf']);
        $attributes['appointment_at'] = $this->validateFutureDate($attributes['appointment_at']);
        $this->validateNoOpenAppointment($attributes['patient_cpf']);

        $attributes['tenant_id'] = Auth::user()->tenant_id;
        $attributes['status'] = Appointment::STATUS_SCHEDULED;

        return $this->repository->create($attributes);
    }

    public function update(int $id, AppointmentDto $dto): Appointment
    {
        $appointment = $this->find($id);
        $this->ensureScheduled($appointment);

        $attributes = $dto->toArray();
        $cpf = $attributes['patient_cpf'] ?? $appointment->patient_cpf;
        $this->validateCpf($cpf);

        if (array_key_exists('appointment_at', $attributes)) {
            $attributes['appointment_at'] = $this->validateFutureDate($attributes['appointment_at']);
        }

        $this->validateNoOpenAppointment($cpf, $appointment->id);

        $appointment->update($attributes);

        return $appointment->refresh();
    }

    public function changeStatus(int $id, string $status): Appointment
    {
        $appointment = $this->find($id);
        $this->ensureScheduled($appointment);

        if ($status === Appointment::STATUS_COMPLETED && ! $appointment->appointment_at->isToday()) {
            throw ValidationException::withMessages([
                'status' => 'A consulta só pode ser marcada como realizada no dia agendado.',
            ]);
        }

        $appointment->update(['status' => $status]);

        return $appointment->refresh();
    }

    public function delete(int $id): void
    {
        $appointment = $this->find($id);
        $appointment->delete();
    }

    private function validateCpf(string $cpf): void
    {
        if (! preg_match('/^\d{3}\.\d{3}\.\d{3}-\d{2}$/', $cpf)) {
            throw ValidationException::withMessages([
                'patient_cpf' => 'O CPF deve estar no formato 000.000.000-00.',
            ]);
        }
    }

    private function validateFutureDate(string $appointmentAt): string
    {
        $date = Carbon::parse($appointmentAt)->setTimezone(config('app.timezone'));

        if ($date->isPast()) {
            throw ValidationException::withMessages([
                'appointment_at' => 'A data e hora da consulta não podem estar no passado.',
            ]);
        }

        return $date->format('Y-m-d H:i:s');
    }

    private function validateNoOpenAppointment(string $cpf, ?int $exceptId = null): void
    {
        if ($this->repository->hasScheduledAppointmentForCpf($cpf, $exceptId)) {
            throw ValidationException::withMessages([
                'patient_cpf' => 'Já existe uma consulta agendada para este CPF.',
            ]);
        }
    }

    private function ensureScheduled(Appointment $appointment): void
    {
        if ($appointment->status !== Appointment::STATUS_SCHEDULED) {
            throw ValidationException::withMessages([
                'status' => 'Consultas realizadas ou canceladas não podem ser alteradas.',
            ]);
        }
    }
}
