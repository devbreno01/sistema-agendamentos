<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

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
        } else {
            Schema::table('appointments', function (Blueprint $table) {
                $table->dropUnique('appointments_tenant_id_patient_cpf_appointment_at_unique');
            });
        }

        Schema::table('appointments', function (Blueprint $table) {
            $table->string('patient_cpf', 14)->change();
            $table->unique(['tenant_id', 'patient_cpf', 'appointment_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropUnique(['tenant_id', 'patient_cpf', 'appointment_at']);
            $table->string('patient_cpf', 11)->change();
            $table->unique(['tenant_id', 'patient_cpf']);
        });
    }
};
