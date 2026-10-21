interface SpecialEventBannerProps {
  name: string
  theme: { accent: string; text: string }
  className?: string
}

/**
 * SpecialEventBanner - stand-in for the event artwork when the NHL feed has a special event but no banner
 * image for it yet. Shows the event name in the event's colors so the game never looks unmarked.
 */
export function SpecialEventBanner({ name, theme, className = '' }: SpecialEventBannerProps) {
  return (
    <div
      data-testid="special-event-banner"
      className={`flex h-16 w-full items-center justify-center px-4 text-center text-sm font-black uppercase leading-tight tracking-[0.15em] ${className}`}
      style={{ background: `linear-gradient(105deg, ${theme.accent} 0%, #0b1220 100%)`, color: theme.text }}
    >
      {name}
    </div>
  )
}
