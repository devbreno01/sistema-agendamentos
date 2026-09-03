<?php

namespace Database\Seeders;

use App\Models\Appointment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AppointmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenantIds = DB::table('tenants')->pluck('id');

        if ($tenantIds->isEmpty()) {
            $this->command?->warn('Nenhum tenant encontrado. Cadastre um usuário antes de executar o AppointmentSeeder.');

            return;
        }

        foreach ($tenantIds as $tenantId) {
            $this->seedAppointments((int) $tenantId);
        }
    }

    private function seedAppointments(int $tenantId): void
    {
        $appointments = [
            [
                'patient_name' => 'Ana Carolina Souza',
                'patient_cpf' => '123.456.789-00',
                'appointment_at' => now()->addDay()->setTime(9, 0),
                'specialty_or_reason' => 'Cardiologia',
                'notes' => 'Primeira consulta.',
                'status' => Appointment::STATUS_SCHEDULED,
            ],
            [
                'patient_name' => 'Bruno Oliveira Lima',
                'patient_cpf' => '234.567.890-11',
                'appointment_at' => now()->addDays(2)->setTime(14, 30),
                'specialty_or_reason' => 'Dermatologia',
                'notes' => null,
                'status' => Appointment::STATUS_SCHEDULED,
            ],
            [
                'patient_name' => 'Carla Mendes Santos',
                'patient_cpf' => '345.678.901-22',
                'appointment_at' => now()->subDay()->setTime(10, 0),
                'specialty_or_reason' => 'Clínica geral',
                'notes' => 'Consulta de rotina.',
                'status' => Appointment::STATUS_COMPLETED,
            ],
            [
                'patient_name' => 'Daniel Ferreira Alves',
                'patient_cpf' => '456.789.012-33',
                'appointment_at' => now()->addDays(3)->setTime(16, 0),
                'specialty_or_reason' => 'Ortopedia',
                'notes' => 'Consulta cancelada pelo paciente.',
                'status' => Appointment::STATUS_CANCELLED,
            ],
        ];

        foreach ($appointments as $appointment) {
            DB::table('appointments')->updateOrInsert(
                [
                    'tenant_id' => $tenantId,
                    'patient_cpf' => $appointment['patient_cpf'],
                    'status' => $appointment['status'],
                ],
                [
                    ...$appointment,
                    'tenant_id' => $tenantId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            );
        }
    }
}
