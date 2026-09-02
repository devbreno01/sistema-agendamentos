<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_patient_cpf_unique');
            DB::statement('ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_tenant_id_patient_cpf_unique');
            DB::statement('ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_tenant_id_patient_cpf_appointment_at_unique');

            return;
        }

        if (DB::getDriverName() === 'sqlite') {
            DB::statement('DROP INDEX IF EXISTS appointments_patient_cpf_unique');
            DB::statement('DROP INDEX IF EXISTS appointments_tenant_id_patient_cpf_unique');
            DB::statement('DROP INDEX IF EXISTS appointments_tenant_id_patient_cpf_appointment_at_unique');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // A regra depende do status e é aplicada pelo service/repository.
    }
};
