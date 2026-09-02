import { type FormEvent, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { maskCpf, toDateTimeLocal } from './formatters'
import type { Appointment, AppointmentFormData } from './types'

interface AppointmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Appointment | null
  form: AppointmentFormData
  setForm: React.Dispatch<React.SetStateAction<AppointmentFormData>>
  errors: Record<string, string[]>
  saving: boolean
  onSubmit: (event: FormEvent) => void
}

export function AppointmentFormDialog({ open, onOpenChange, editing, form, setForm, errors, saving, onSubmit }: AppointmentFormDialogProps) {
  const set = (field: keyof AppointmentFormData, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar consulta' : 'Nova consulta'}</DialogTitle>
          <DialogDescription>
            {editing ? 'Altere os dados da consulta.' : 'Preencha os dados do agendamento.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {errors.general && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errors.general[0]}</p>}
          <Field id="patient-name" label="Nome do paciente" error={errors.patient_name?.[0]}>
            <Input id="patient-name" value={form.patient_name} onChange={(event) => set('patient_name', event.target.value)} required />
          </Field>
          <Field id="patient-cpf" label="CPF" error={errors.patient_cpf?.[0]}>
            <Input id="patient-cpf" value={form.patient_cpf} onChange={(event) => set('patient_cpf', maskCpf(event.target.value))} placeholder="000.000.000-00" inputMode="numeric" required />
          </Field>
          <Field id="appointment-at" label="Data e hora" error={errors.appointment_at?.[0]}>
            <Input id="appointment-at" type="datetime-local" value={form.appointment_at} min={toDateTimeLocal(new Date().toISOString())} onChange={(event) => set('appointment_at', event.target.value)} required />
          </Field>
          <Field id="specialty" label="Especialidade ou motivo" error={errors.specialty_or_reason?.[0]}>
            <Input id="specialty" value={form.specialty_or_reason} onChange={(event) => set('specialty_or_reason', event.target.value)} required />
          </Field>
          <Field id="notes" label="Observações" error={errors.notes?.[0]}>
            <Textarea id="notes" value={form.notes} onChange={(event) => set('notes', event.target.value)} />
          </Field>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
            <Button type="submit" variant="yellow" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}{error && <p className="text-xs text-red-600">{error}</p>}</div>
}
