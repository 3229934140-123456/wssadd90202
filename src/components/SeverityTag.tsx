import { cn } from '@/lib/utils'

type Severity = 'high' | 'medium' | 'low'

const severityConfig: Record<Severity, string> = {
  high: 'bg-red-50 text-red-700',
  medium: 'bg-orange-50 text-orange-700',
  low: 'bg-yellow-50 text-yellow-700',
}

interface SeverityTagProps {
  severity: Severity
  label: string
}

export default function SeverityTag({ severity, label }: SeverityTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        severityConfig[severity]
      )}
    >
      {label}
    </span>
  )
}

export type { Severity }
