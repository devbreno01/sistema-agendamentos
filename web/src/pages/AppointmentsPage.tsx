import { CalendarClock, CalendarDays, Check, CheckCircle2, ChevronDown, CircleX, Clock3, Edit3, Plus, Search, Stethoscope, Trash2, XCircle } from 'lucide-react'
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { api, ApiError } from '@/lib/api'

type Status = 'scheduled' | 'completed' | 'cancelled'

interface Appointment {
  id: number
  patient_name: string
  patient_cpf: string
  appointment_at: string
  specialty_or_reason: string
  notes: string | null
  status: Status
  available_actions: string[]
}

interface AppointmentForm {
  patient_name: string
  patient_cpf: string
  appointment_at: string
  specialty_or_reason: string
  notes: string
}

const emptyForm: AppointmentForm = { patient_name: '', patient_cpf: '', appointment_at: '', specialty_or_reason: '', notes: '' }
const statusInfo: Record<Status, { label: string; className: string }> = {
  scheduled: { label: 'Agendada', className: 'bg-[#FBE509]/25 text-[#6c6200]' },
  completed: { label: 'Realizada', className: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelada', className: 'bg-red-100 text-red-700' },
}

function dateTimeLocal(value: string) {
  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)).replace('.', '')
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function maskCpf(value: string) {
  return value.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [deleting, setDeleting] = useState<Appointment | null>(null)
  const [form, setForm] = useState<AppointmentForm>(emptyForm)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all')
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
    } finally { setLoading(false) }
  }, [navigate])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAppointments(), 0)
    return () => window.clearTimeout(timer)
  }, [loadAppointments])

  const filtered = useMemo(() => appointments.filter((appointment) => {
    const query = search.toLowerCase()
    const matchesSearch = appointment.patient_name.toLowerCase().includes(query) || appointment.patient_cpf.includes(query) || appointment.specialty_or_reason.toLowerCase().includes(query)
    return matchesSearch && (statusFilter === 'all' || appointment.status === statusFilter)
  }), [appointments, search, statusFilter])

  const totals = useMemo(() => ({
    scheduled: appointments.filter(({ status }) => status === 'scheduled').length,
    completed: appointments.filter(({ status }) => status === 'completed').length,
    cancelled: appointments.filter(({ status }) => status === 'cancelled').length,
  }), [appointments])

  function openCreate() { setEditing(null); setForm(emptyForm); setFormErrors({}); setFormOpen(true) }
  function openEdit(appointment: Appointment) {
    setEditing(appointment)
    setForm({ patient_name: appointment.patient_name, patient_cpf: appointment.patient_cpf, appointment_at: dateTimeLocal(appointment.appointment_at), specialty_or_reason: appointment.specialty_or_reason, notes: appointment.notes ?? '' })
    setFormErrors({}); setFormOpen(true)
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setFormErrors({})
    try {
      const path = editing ? `/appointments/${editing.id}` : '/appointments'
      await api(path, { method: editing ? 'PATCH' : 'POST', body: JSON.stringify({ ...form, appointment_at: form.appointment_at.replace('T', ' ') + ':00', notes: form.notes || null }) })
      setFormOpen(false); await loadAppointments()
    } catch (exception) {
      if (exception instanceof ApiError) setFormErrors(Object.keys(exception.errors).length ? exception.errors : { general: [exception.message] })
    } finally { setSaving(false) }
  }

  async function changeStatus(appointment: Appointment, status: 'completed' | 'cancelled') {
    setError('')
    try {
      await api(`/appointments/${appointment.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
      await loadAppointments()
    } catch (exception) { setError(exception instanceof Error ? exception.message : 'Não foi possível alterar o status.') }
  }

  async function remove() {
    if (!deleting) return
    setSaving(true)
    try { await api(`/appointments/${deleting.id}`, { method: 'DELETE' }); setDeleting(null); await loadAppointments() }
    catch (exception) { setError(exception instanceof Error ? exception.message : 'Não foi possível excluir a consulta.') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <Button variant="yellow" onClick={openCreate}><Plus className="size-4" /> Nova consulta</Button>
      </div>

      {error && <div role="alert" className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button onClick={() => setError('')}><CircleX className="size-4" /></button></div>}

      <div className="mb-7 grid gap-4 sm:grid-cols-3">
        <SummaryCard icon={<Clock3 />} label="Agendadas" value={totals.scheduled} color="bg-[#FBE509]" />
        <SummaryCard icon={<CheckCircle2 />} label="Realizadas" value={totals.completed} color="bg-emerald-100 text-emerald-700" />
        <SummaryCard icon={<XCircle />} label="Canceladas" value={totals.cancelled} color="bg-red-100 text-red-700" />
      </div>

      <section className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-3 border-b border-black/[0.06] p-4 sm:flex-row sm:p-5">
          <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-black/35" /><Input className="pl-10" placeholder="Buscar por paciente, CPF ou especialidade..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
          <div className="relative"><select className="h-11 min-w-44 appearance-none rounded-xl border border-black/10 bg-white pl-3.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#FBE509]/50" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}><option value="all">Todos os status</option><option value="scheduled">Agendadas</option><option value="completed">Realizadas</option><option value="cancelled">Canceladas</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-black/40" /></div>
        </div>

        {loading ? <LoadingRows /> : filtered.length === 0 ? <EmptyState onCreate={openCreate} /> : <>
          <div className="hidden overflow-x-auto md:block"><table className="w-full text-left"><thead><tr className="border-b border-black/[0.06] bg-[#F7F7F7]/70 text-[11px] uppercase tracking-wider text-black/40"><th className="px-6 py-4 font-semibold">Paciente</th><th className="px-6 py-4 font-semibold">Data e hora</th><th className="px-6 py-4 font-semibold">Especialidade / motivo</th><th className="px-6 py-4 font-semibold">Status</th><th className="px-6 py-4 text-right font-semibold">Ações</th></tr></thead><tbody>{filtered.map((appointment) => <AppointmentRow key={appointment.id} appointment={appointment} onEdit={openEdit} onStatus={changeStatus} onDelete={setDeleting} />)}</tbody></table></div>
          <div className="divide-y divide-black/[0.06] md:hidden">{filtered.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} onEdit={openEdit} onStatus={changeStatus} onDelete={setDeleting} />)}</div>
        </>}
      </section>

      <AppointmentDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} form={form} setForm={setForm} errors={formErrors} saving={saving} onSubmit={submit} />

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Excluir consulta?</DialogTitle><DialogDescription>A consulta de {deleting?.patient_name} será excluída definitivamente. Essa ação não pode ser desfeita.</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button variant="outline">Voltar</Button></DialogClose><Button variant="danger" onClick={remove} disabled={saving}>{saving ? 'Excluindo...' : 'Excluir definitivamente'}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}

function SummaryCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return <div className="flex items-center gap-4 rounded-2xl border border-black/[0.06] bg-white p-5"><span className={`grid size-11 place-items-center rounded-xl ${color}`}>{icon}</span><div><p className="text-2xl font-semibold leading-none">{value}</p><p className="mt-1.5 text-xs text-black/45">{label}</p></div></div>
}

function StatusBadge({ status }: { status: Status }) { const info = statusInfo[status]; return <Badge className={info.className}>{info.label}</Badge> }

interface ItemProps { appointment: Appointment; onEdit: (item: Appointment) => void; onStatus: (item: Appointment, status: 'completed' | 'cancelled') => void; onDelete: (item: Appointment) => void }

function Actions({ appointment, onEdit, onStatus, onDelete }: ItemProps) {
  return <div className="flex flex-wrap justify-end gap-1">
    {appointment.available_actions.includes('complete') && <Button size="sm" variant="ghost" className="text-emerald-700 hover:bg-emerald-50" onClick={() => onStatus(appointment, 'completed')} title="Marcar como realizada"><Check className="size-4" /><span className="hidden xl:inline">Realizar</span></Button>}
    {appointment.available_actions.includes('cancel') && <Button size="sm" variant="ghost" className="text-amber-700 hover:bg-amber-50" onClick={() => onStatus(appointment, 'cancelled')} title="Cancelar"><XCircle className="size-4" /><span className="hidden xl:inline">Cancelar</span></Button>}
    {appointment.available_actions.includes('edit') && <Button size="sm" variant="ghost" onClick={() => onEdit(appointment)} title="Editar"><Edit3 className="size-4" /></Button>}
    <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => onDelete(appointment)} title="Excluir"><Trash2 className="size-4" /></Button>
  </div>
}

function AppointmentRow(props: ItemProps) { const { appointment } = props; return <tr className="border-b border-black/[0.05] last:border-0 hover:bg-[#F7F7F7]/55"><td className="px-6 py-5"><p className="text-sm font-semibold">{appointment.patient_name}</p><p className="mt-1 text-xs text-black/40">{appointment.patient_cpf}</p></td><td className="px-6 py-5"><p className="text-sm font-medium">{formatDate(appointment.appointment_at)}</p><p className="mt-1 text-xs text-black/40">às {formatTime(appointment.appointment_at)}</p></td><td className="max-w-xs px-6 py-5"><p className="truncate text-sm">{appointment.specialty_or_reason}</p>{appointment.notes && <p className="mt-1 truncate text-xs text-black/40">{appointment.notes}</p>}</td><td className="px-6 py-5"><StatusBadge status={appointment.status} /></td><td className="px-6 py-5"><Actions {...props} /></td></tr> }

function AppointmentCard(props: ItemProps) { const { appointment } = props; return <article className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{appointment.patient_name}</p><p className="mt-1 text-xs text-black/40">{appointment.patient_cpf}</p></div><StatusBadge status={appointment.status} /></div><div className="mt-4 grid gap-2 text-sm text-black/60"><p className="flex items-center gap-2"><CalendarClock className="size-4" /> {formatDate(appointment.appointment_at)} às {formatTime(appointment.appointment_at)}</p><p className="flex items-center gap-2"><Stethoscope className="size-4" /> {appointment.specialty_or_reason}</p></div><div className="mt-4 border-t border-black/[0.06] pt-3"><Actions {...props} /></div></article> }

function LoadingRows() { return <div className="space-y-3 p-6">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-black/5" />)}</div> }
function EmptyState({ onCreate }: { onCreate: () => void }) { return <div className="flex flex-col items-center px-6 py-20 text-center"><span className="grid size-16 place-items-center rounded-2xl bg-[#FBE509]/25"><CalendarDays className="size-7" /></span><h3 className="mt-5 font-semibold">Nenhuma consulta encontrada</h3><p className="mt-2 max-w-sm text-sm leading-6 text-black/45">Ajuste sua busca ou cadastre uma nova consulta para começar.</p><Button className="mt-5" onClick={onCreate}><Plus className="size-4" /> Nova consulta</Button></div> }

function AppointmentDialog({ open, onOpenChange, editing, form, setForm, errors, saving, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; editing: Appointment | null; form: AppointmentForm; setForm: React.Dispatch<React.SetStateAction<AppointmentForm>>; errors: Record<string, string[]>; saving: boolean; onSubmit: (event: FormEvent) => void }) {
  const set = (field: keyof AppointmentForm, value: string) => setForm((current) => ({ ...current, [field]: value }))
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>{editing ? 'Editar consulta' : 'Nova consulta'}</DialogTitle><DialogDescription>{editing ? 'Altere os dados ou escolha uma nova data e hora.' : 'Preencha os dados para adicionar um agendamento.'}</DialogDescription></DialogHeader><form onSubmit={onSubmit} className="space-y-4">
    {errors.general && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{errors.general[0]}</p>}
    <Field label="Nome do paciente" error={errors.patient_name?.[0]}><Input value={form.patient_name} onChange={(event) => set('patient_name', event.target.value)} placeholder="Nome completo" required /></Field>
    <Field label="CPF" error={errors.patient_cpf?.[0]}><Input value={form.patient_cpf} onChange={(event) => set('patient_cpf', maskCpf(event.target.value))} placeholder="000.000.000-00" inputMode="numeric" required /></Field>
    <Field label="Data e hora" error={errors.appointment_at?.[0]}><Input type="datetime-local" value={form.appointment_at} min={dateTimeLocal(new Date().toISOString())} onChange={(event) => set('appointment_at', event.target.value)} required /></Field>
    <Field label="Especialidade ou motivo" error={errors.specialty_or_reason?.[0]}><Input value={form.specialty_or_reason} onChange={(event) => set('specialty_or_reason', event.target.value)} placeholder="Ex.: Cardiologia" required /></Field>
    <Field label="Observações" error={errors.notes?.[0]}><Textarea value={form.notes} onChange={(event) => set('notes', event.target.value)} placeholder="Informações adicionais (opcional)" /></Field>
    <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose><Button type="submit" variant="yellow" disabled={saving}>{saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Agendar consulta'}</Button></DialogFooter>
  </form></DialogContent></Dialog>
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs text-red-600">{error}</p>}</div> }
