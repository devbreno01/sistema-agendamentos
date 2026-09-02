import { CalendarClock, CalendarDays, Check, Edit3, Plus, Stethoscope, Trash2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { formatDate, formatTime } from './formatters'
import type { Appointment, AppointmentItemProps, AppointmentStatus } from './types'

const statusInfo: Record<AppointmentStatus, { label: string; className: string }> = {
  scheduled: { label: 'Agendada', className: 'bg-[#FBE509]/25 text-[#6c6200]' },
  completed: { label: 'Realizada', className: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelada', className: 'bg-red-100 text-red-700' },
}

interface AppointmentListProps {
  appointments: Appointment[]
  loading: boolean
  onCreate: () => void
  onEdit: AppointmentItemProps['onEdit']
  onStatus: AppointmentItemProps['onStatus']
  onDelete: AppointmentItemProps['onDelete']
}

export function AppointmentList({ appointments, loading, onCreate, onEdit, onStatus, onDelete }: AppointmentListProps) {
  if (loading) return <LoadingRows />
  if (appointments.length === 0) return <EmptyState onCreate={onCreate} />

  const handlers = { onEdit, onStatus, onDelete }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-black/10 bg-[#F7F7F7] text-xs text-black/50">
              <th className="px-6 py-4 font-medium">Paciente</th>
              <th className="px-6 py-4 font-medium">Data e hora</th>
              <th className="px-6 py-4 font-medium">Especialidade / motivo</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>{appointments.map((appointment) => <AppointmentRow key={appointment.id} appointment={appointment} {...handlers} />)}</tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 md:hidden">
        {appointments.map((appointment) => <AppointmentMobileCard key={appointment.id} appointment={appointment} {...handlers} />)}
      </div>
    </>
  )
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const info = statusInfo[status]
  return <Badge className={info.className}>{info.label}</Badge>
}

function AppointmentActions({ appointment, onEdit, onStatus, onDelete }: AppointmentItemProps) {
  return (
    <div className="flex flex-wrap justify-end gap-1">
      {appointment.available_actions.includes('complete') && <Button size="sm" variant="ghost" className="text-emerald-700" onClick={() => onStatus(appointment, 'completed')}><Check className="size-4" /><span className="hidden xl:inline">Realizar</span></Button>}
      {appointment.available_actions.includes('cancel') && <Button size="sm" variant="ghost" className="text-amber-700" onClick={() => onStatus(appointment, 'cancelled')}><XCircle className="size-4" /><span className="hidden xl:inline">Cancelar</span></Button>}
      {appointment.available_actions.includes('edit') && <Button size="sm" variant="ghost" onClick={() => onEdit(appointment)} aria-label="Editar"><Edit3 className="size-4" /></Button>}
      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => onDelete(appointment)} aria-label="Excluir"><Trash2 className="size-4" /></Button>
    </div>
  )
}

function AppointmentRow(props: AppointmentItemProps) {
  const { appointment } = props
  return (
    <tr className="border-b border-black/[0.06] last:border-0 hover:bg-black/[0.02]">
      <td className="px-6 py-5"><p className="text-sm font-medium">{appointment.patient_name}</p><p className="mt-1 text-xs text-black/45">{appointment.patient_cpf}</p></td>
      <td className="px-6 py-5"><p className="text-sm">{formatDate(appointment.appointment_at)}</p><p className="mt-1 text-xs text-black/45">às {formatTime(appointment.appointment_at)}</p></td>
      <td className="max-w-xs px-6 py-5"><p className="truncate text-sm">{appointment.specialty_or_reason}</p>{appointment.notes && <p className="mt-1 truncate text-xs text-black/45">{appointment.notes}</p>}</td>
      <td className="px-6 py-5"><StatusBadge status={appointment.status} /></td>
      <td className="px-6 py-5"><AppointmentActions {...props} /></td>
    </tr>
  )
}

function AppointmentMobileCard(props: AppointmentItemProps) {
  const { appointment } = props
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 p-4 pb-0">
        <div><p className="font-medium">{appointment.patient_name}</p><p className="mt-1 text-xs text-black/45">{appointment.patient_cpf}</p></div>
        <StatusBadge status={appointment.status} />
      </CardHeader>
      <CardContent className="grid gap-2 p-4 text-sm text-black/60">
        <p className="flex items-center gap-2"><CalendarClock className="size-4" /> {formatDate(appointment.appointment_at)} às {formatTime(appointment.appointment_at)}</p>
        <p className="flex items-center gap-2"><Stethoscope className="size-4" /> {appointment.specialty_or_reason}</p>
      </CardContent>
      <CardFooter className="justify-end border-t border-black/[0.06] p-2"><AppointmentActions {...props} /></CardFooter>
    </Card>
  )
}

function LoadingRows() {
  return <div className="space-y-3 p-6">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-lg bg-black/5" />)}</div>
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return <div className="flex flex-col items-center px-6 py-16 text-center"><CalendarDays className="size-8 text-black/40" /><h3 className="mt-4 font-medium">Nenhuma consulta encontrada</h3><p className="mt-2 text-sm text-black/50">Ajuste a busca ou cadastre uma consulta.</p><Button className="mt-5" onClick={onCreate}><Plus className="size-4" /> Nova consulta</Button></div>
}
