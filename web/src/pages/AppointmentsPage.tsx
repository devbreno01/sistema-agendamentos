import { CheckCircle2, ChevronDown, CircleX, Clock3, Plus, Search, XCircle } from 'lucide-react'
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppointmentFormDialog } from '@/components/appointments/AppointmentFormDialog'
import { toDateTimeLocal } from '@/components/appointments/formatters'
import { AppointmentList } from '@/components/appointments/AppointmentList'
import { AppointmentSummary } from '@/components/appointments/AppointmentSummary'
import { emptyAppointmentForm, type Appointment, type AppointmentFormData, type AppointmentStatus } from '@/components/appointments/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { api, ApiError } from '@/lib/api'

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [deleting, setDeleting] = useState<Appointment | null>(null)
  const [form, setForm] = useState<AppointmentFormData>(emptyAppointmentForm)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all')
  const [error, setError] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})
  const navigate = useNavigate()

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api<{ data: Appointment[] }>('/appointments')
      setAppointments(response.data)
    } catch (exception) {
      if (exception instanceof ApiError && exception.status === 401) navigate('/login', { replace: true })
      else setError(exception instanceof Error ? exception.message : 'Não foi possível carregar as consultas.')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAppointments(), 0)
    return () => window.clearTimeout(timer)
  }, [loadAppointments])

  const filteredAppointments = useMemo(() => appointments.filter((appointment) => {
    const query = search.toLowerCase()
    const matchesSearch = appointment.patient_name.toLowerCase().includes(query)
      || appointment.patient_cpf.includes(query)
      || appointment.specialty_or_reason.toLowerCase().includes(query)

    return matchesSearch && (statusFilter === 'all' || appointment.status === statusFilter)
  }), [appointments, search, statusFilter])

  const totals = useMemo(() => ({
    scheduled: appointments.filter(({ status }) => status === 'scheduled').length,
    completed: appointments.filter(({ status }) => status === 'completed').length,
    cancelled: appointments.filter(({ status }) => status === 'cancelled').length,
  }), [appointments])

  function openCreate() {
    setEditing(null)
    setForm(emptyAppointmentForm)
    setFormErrors({})
    setFormOpen(true)
  }

  function openEdit(appointment: Appointment) {
    setEditing(appointment)
    setForm({
      patient_name: appointment.patient_name,
      patient_cpf: appointment.patient_cpf,
      appointment_at: toDateTimeLocal(appointment.appointment_at),
      specialty_or_reason: appointment.specialty_or_reason,
      notes: appointment.notes ?? '',
    })
    setFormErrors({})
    setFormOpen(true)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setFormErrors({})

    try {
      await api(editing ? `/appointments/${editing.id}` : '/appointments', {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify({
          ...form,
          appointment_at: `${form.appointment_at.replace('T', ' ')}:00`,
          notes: form.notes || null,
        }),
      })
      setFormOpen(false)
      await loadAppointments()
    } catch (exception) {
      if (exception instanceof ApiError) {
        setFormErrors(Object.keys(exception.errors).length ? exception.errors : { general: [exception.message] })
      }
    } finally {
      setSaving(false)
    }
  }

  async function changeStatus(appointment: Appointment, status: 'completed' | 'cancelled') {
    try {
      await api(`/appointments/${appointment.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      await loadAppointments()
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Não foi possível alterar o status.')
    }
  }

  async function remove() {
    if (!deleting) return
    setSaving(true)
    try {
      await api(`/appointments/${deleting.id}`, { method: 'DELETE' })
      setDeleting(null)
      await loadAppointments()
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Não foi possível excluir a consulta.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button variant="yellow" onClick={openCreate}><Plus className="size-4" /> Nova consulta</Button>
      </div>

      {error && <div role="alert" className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button onClick={() => setError('')}><CircleX className="size-4" /></button></div>}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <AppointmentSummary icon={<Clock3 className="size-5" />} label="Agendadas" value={totals.scheduled} iconClassName="bg-[#FBE509]" />
        <AppointmentSummary icon={<CheckCircle2 className="size-5" />} label="Realizadas" value={totals.completed} iconClassName="bg-emerald-100 text-emerald-700" />
        <AppointmentSummary icon={<XCircle className="size-5" />} label="Canceladas" value={totals.cancelled} iconClassName="bg-red-100 text-red-700" />
      </div>

      <Card className="overflow-hidden">
        <CardContent className="flex flex-col gap-3 border-b border-black/10 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-black/35" />
            <Input className="pl-10" placeholder="Buscar por paciente, CPF ou especialidade" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <div className="relative">
            <select className="h-11 min-w-44 appearance-none rounded-lg border border-black/10 bg-white pl-3.5 pr-10 text-sm outline-none" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
              <option value="all">Todos os status</option>
              <option value="scheduled">Agendadas</option>
              <option value="completed">Realizadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-black/40" />
          </div>
        </CardContent>

        <AppointmentList appointments={filteredAppointments} loading={loading} onCreate={openCreate} onEdit={openEdit} onStatus={changeStatus} onDelete={setDeleting} />
      </Card>

      <AppointmentFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} form={form} setForm={setForm} errors={formErrors} saving={saving} onSubmit={submit} />

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Excluir consulta?</DialogTitle><DialogDescription>A consulta de {deleting?.patient_name} será excluída definitivamente.</DialogDescription></DialogHeader>
          <DialogFooter><DialogClose asChild><Button variant="outline">Voltar</Button></DialogClose><Button variant="danger" onClick={remove} disabled={saving}>{saving ? 'Excluindo...' : 'Excluir'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
