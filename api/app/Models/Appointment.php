<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'tenant_id',
    'patient_name',
    'patient_cpf',
    'appointment_at',
    'specialty_or_reason',
    'notes',
    'status',
])]
class Appointment extends BaseModel
{
    public const STATUS_SCHEDULED = 'scheduled';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_CANCELLED = 'cancelled';

    protected $appends = ['available_actions'];

    protected function casts(): array
    {
        return [
            'appointment_at' => 'datetime',
        ];
    }

    protected function availableActions(): Attribute
    {
        return Attribute::get(function (): array {
            if ($this->status !== self::STATUS_SCHEDULED) {
                return ['delete'];
            }

            $actions = ['edit', 'reschedule', 'cancel', 'delete'];

            if ($this->appointment_at?->isToday()) {
                $actions[] = 'complete';
            }

            return $actions;
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
