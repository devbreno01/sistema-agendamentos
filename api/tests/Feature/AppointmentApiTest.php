<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AppointmentApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-09-02 10:00:00');
        Sanctum::actingAs(User::factory()->create());
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_it_creates_an_appointment_for_the_authenticated_tenant(): void
    {
        $response = $this->postJson('/api/appointments', $this->validPayload());

        $response
            ->assertCreated()
            ->assertJsonPath('data.status', Appointment::STATUS_SCHEDULED)
            ->assertJsonPath('data.patient_cpf', '000.000.000-00');

        $this->assertDatabaseHas('appointments', [
            'tenant_id' => auth()->user()->tenant_id,
            'patient_cpf' => '000.000.000-00',
        ]);
    }

    public function test_it_rejects_invalid_cpf_past_dates_and_duplicate_schedules(): void
    {
        $this->postJson('/api/appointments', $this->validPayload(['patient_cpf' => '00000000000']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('patient_cpf');

        $this->postJson('/api/appointments', $this->validPayload(['appointment_at' => '2026-09-01 09:00:00']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('appointment_at');

        $this->postJson('/api/appointments', $this->validPayload())->assertCreated();

        $this->postJson('/api/appointments', $this->validPayload())
            ->assertUnprocessable()
            ->assertJsonValidationErrors('appointment_at');
    }

    public function test_it_only_completes_an_appointment_on_its_scheduled_day(): void
    {
        $appointment = $this->createAppointment();

        $this->patchJson("/api/appointments/{$appointment->id}/status", ['status' => 'completed'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');

        $appointment->update(['appointment_at' => '2026-09-02 18:00:00']);

        $this->patchJson("/api/appointments/{$appointment->id}/status", ['status' => 'completed'])
            ->assertOk()
            ->assertJsonPath('data.status', Appointment::STATUS_COMPLETED);
    }

    public function test_terminal_status_cannot_be_changed_or_edited(): void
    {
        $appointment = $this->createAppointment([
            'appointment_at' => '2026-09-02 18:00:00',
        ]);

        $this->patchJson("/api/appointments/{$appointment->id}/status", ['status' => 'cancelled'])
            ->assertOk();

        $this->patchJson("/api/appointments/{$appointment->id}", ['patient_name' => 'Outro nome'])
            ->assertUnprocessable();

        $this->patchJson("/api/appointments/{$appointment->id}/status", ['status' => 'completed'])
            ->assertUnprocessable();
    }

    public function test_it_permanently_deletes_an_appointment(): void
    {
        $appointment = $this->createAppointment();

        $this->deleteJson("/api/appointments/{$appointment->id}")->assertNoContent();

        $this->assertDatabaseMissing('appointments', ['id' => $appointment->id]);
    }

    private function createAppointment(array $overrides = []): Appointment
    {
        $response = $this->postJson('/api/appointments', $this->validPayload($overrides));
        $response->assertCreated();

        return Appointment::query()->findOrFail($response->json('data.id'));
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'patient_name' => 'Maria da Silva',
            'patient_cpf' => '000.000.000-00',
            'appointment_at' => '2026-09-03 14:00:00',
            'specialty_or_reason' => 'Cardiologia',
            'notes' => 'Primeira consulta',
        ], $overrides);
    }
}
