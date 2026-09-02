import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface AppointmentSummaryProps {
  icon: ReactNode
  label: string
  value: number
  iconClassName: string
}

export function AppointmentSummary({ icon, label, value, iconClassName }: AppointmentSummaryProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className={`grid size-10 place-items-center rounded-lg ${iconClassName}`}>{icon}</span>
        <div>
          <p className="text-2xl font-semibold leading-none">{value}</p>
          <p className="mt-1.5 text-sm text-black/50">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
