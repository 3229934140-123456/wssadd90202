import { cn } from '@/lib/utils'

type Status = 'draft' | 'published' | 'archived' | 'pending' | 'active' | 'expired' | 'approved' | 'rejected'

const statusConfig: Record<Status, { className: string; label: string }> = {
  draft: { className: 'bg-gray-100 text-gray-600', label: '草稿' },
  published: { className: 'bg-teal-50 text-teal', label: '已发布' },
  archived: { className: 'bg-gray-100 text-gray-400', label: '已归档' },
  pending: { className: 'bg-yellow-50 text-yellow-700', label: '待审核' },
  active: { className: 'bg-teal-50 text-teal', label: '生效中' },
  expired: { className: 'bg-red-50 text-red-600', label: '已过期' },
  approved: { className: 'bg-green-50 text-green-700', label: '已通过' },
  rejected: { className: 'bg-red-50 text-red-600', label: '已驳回' },
}

interface StatusBadgeProps {
  status: Status
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  )
}

export type { Status }
