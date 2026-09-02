export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled'

export interface Appointment {
  id: number
  patient_name: string
  patient_cpf: string
  appointment_at: string
  specialty_or_reason: string
  notes: string | null
  status: AppointmentStatus
  available_actions: string[]
}

export interface AppointmentFormData {
  patient_name: string
  patient_cpf: string
  appointment_at: string
  specialty_or_reason: string
  notes: string
}

export interface AppointmentItemProps {
  appointment: Appointment
  onEdit: (appointment: Appointment) => void
  onStatus: (appointment: Appointment, status: 'completed' | 'cancelled') => void
  onDelete: (appointment: Appointment) => void
}

export const emptyAppointmentForm: AppointmentFormData = {
  patient_name: '',
  patient_cpf: '',
  appointment_at: '',
  specialty_or_reason: '',
  notes: '',
}
