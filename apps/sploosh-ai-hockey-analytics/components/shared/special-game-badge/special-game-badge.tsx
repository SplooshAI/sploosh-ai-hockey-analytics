import { Globe } from 'lucide-react'

interface SpecialGameBadgeProps {
  label: string
  className?: string
}

/**
 * SpecialGameBadge - call-out for a special-event or neutral-site game (Global Series, Winter Classic,
 * a preseason game at a neutral arena). Amber so it stands apart from the live and final game states.
 */
export function SpecialGameBadge({ label, className = '' }: SpecialGameBadgeProps) {
  return (
    <span
      data-testid="special-game-badge"
      className={`inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-slate-900 ${className}`}
    >
      <Globe className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  )
}
