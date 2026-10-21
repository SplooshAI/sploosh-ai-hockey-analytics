import { Globe } from 'lucide-react'

interface SpecialGameBadgeProps {
  label: string
  className?: string
  /** Event colors; amber when omitted. */
  theme?: { accent: string; text: string }
}

/**
 * SpecialGameBadge - call-out for a special-event or neutral-site game (Global Series, Winter Classic,
 * a preseason game at a neutral arena). Amber so it stands apart from the live and final game states.
 */
export function SpecialGameBadge({ label, className = '', theme }: SpecialGameBadgeProps) {
  return (
    <span
      data-testid="special-game-badge"
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${theme ? '' : 'bg-amber-500 text-slate-900'} ${className}`}
      style={theme ? { backgroundColor: theme.accent, color: theme.text } : undefined}
    >
      <Globe className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  )
}
