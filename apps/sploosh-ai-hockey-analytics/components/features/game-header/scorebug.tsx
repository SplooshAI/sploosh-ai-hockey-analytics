'use client'
import Image from 'next/image'
import { useState } from 'react'

interface ScorebugTeam {
  abbrev: string
  logo?: string
  score?: number
  sog?: number
  record?: string
}

export type ScorebugVariant = 'keeper' | 'split' | 'marquee' | 'poster' | 'neon' | 'jumbotron' | 'frost' | 'ticker'

interface ScorebugProps {
  variant?: ScorebugVariant
  awayTeam?: ScorebugTeam
  homeTeam?: ScorebugTeam
  status: string
  statusClass: string
  showSog: boolean
  /** Arena and city line shown along the bottom of the panel. */
  venue?: string
  /** Compact card for the sidebar: no Sploosh.AI badge, ribbon or arena line, fixed small sizes. */
  compact?: boolean
  /** Ring for special-event and neutral-site games: true for amber, or a color for an event theme. */
  highlight?: boolean | string
}

// Official NHL primary colors keyed by abbreviation; the panel background blends the two teams
const TEAM_COLORS: Record<string, string> = {
  ANA: '#F47A38', BOS: '#FFB81C', BUF: '#003087', CGY: '#C8102E', CAR: '#CC0000', CHI: '#CF0A2C',
  COL: '#6F263D', CBJ: '#002654', DAL: '#006847', DET: '#CE1126', EDM: '#FF4C00', FLA: '#C8102E',
  LAK: '#A2AAAD', MIN: '#154734', MTL: '#AF1E2D', NSH: '#FFB81C', NJD: '#CE1126', NYI: '#00539B',
  NYR: '#0038A8', OTT: '#C52032', PHI: '#F74902', PIT: '#FFB81C', SEA: '#68A2B9', SJS: '#006D75',
  STL: '#002F87', TBL: '#002868', TOR: '#00205B', UTA: '#6CACE4', VAN: '#00843D', VGK: '#B4975A',
  WSH: '#C8102E', WPG: '#041E42',
}

// Secondary colors, used when the two primaries are too close to tell apart
const TEAM_ALT_COLORS: Record<string, string> = {
  ANA: '#B09862', BOS: '#2b2b2b', BUF: '#FCB514', CGY: '#F1BE48', CAR: '#1c1c1c', CHI: '#1c1c1c',
  COL: '#236192', CBJ: '#CE1126', DAL: '#8F8F8C', DET: '#7a0a18', EDM: '#041E42', FLA: '#041E42',
  LAK: '#1c1c1c', MIN: '#A6192E', MTL: '#192168', NSH: '#041E42', NJD: '#1c1c1c', NYI: '#F47D30',
  NYR: '#CE1126', OTT: '#1c1c1c', PHI: '#1c1c1c', PIT: '#1c1c1c', SEA: '#001628', SJS: '#1c1c1c',
  STL: '#FCB514', TBL: '#001a45', TOR: '#001a45', UTA: '#1c1c1c', VAN: '#041C2C', VGK: '#333F42',
  WSH: '#041E42', WPG: '#004C97',
}

const teamColor = (abbrev?: string) => (abbrev && TEAM_COLORS[abbrev]) || '#475569'

const rgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

const colorDistance = (a: string, b: string) => {
  const [r1, g1, b1] = rgb(a)
  const [r2, g2, b2] = rgb(b)
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

/**
 * Colors for the two sides of the scorebug. Uses each team's primary color; when the primaries are too
 * close to tell apart (for example FLA and OTT, both red), the home side switches to its secondary color.
 */
export function scorebugColors(awayAbbrev?: string, homeAbbrev?: string): { away: string; home: string } {
  const away = teamColor(awayAbbrev)
  const home = teamColor(homeAbbrev)
  if (colorDistance(away, home) >= 110) return { away, home }
  const alt = (homeAbbrev && TEAM_ALT_COLORS[homeAbbrev]) || '#1c1c1c'
  return { away, home: colorDistance(away, alt) >= 110 ? alt : '#1c1c1c' }
}

const TeamEnd: React.FC<{ team?: ScorebugTeam; fallback: string; showSog: boolean; compact?: boolean }> = ({ team, fallback, showSog, compact }) => {
  const [logoError, setLogoError] = useState(false)
  const abbrev = team?.abbrev || fallback
  return (
    <div className="flex min-w-0 flex-col items-center gap-1">
      <div className={`relative rounded-full bg-white p-1.5 shadow-md ${compact ? 'h-10 w-10' : 'h-10 w-10 min-[360px]:h-12 min-[360px]:w-12 sm:h-16 sm:w-16'}`}>
        {team?.logo && !logoError ? (
          <Image src={team.logo} alt={abbrev} fill className="object-contain p-1.5" onError={() => setLogoError(true)} />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-700">{abbrev}</span>
        )}
      </div>
      <span className={`text-sm font-bold tracking-wide ${compact ? '' : 'sm:text-base'}`}>{abbrev}</span>
      <span className="flex flex-col items-center gap-0 whitespace-nowrap text-[11px] leading-tight opacity-70 sm:flex-row sm:gap-1">
        {showSog && <span>{team?.sog ?? 0} SOG</span>}
        {showSog && team?.record && <span aria-hidden className="hidden sm:inline">·</span>}
        {team?.record && <span>{team.record}</span>}
      </span>
    </div>
  )
}

/**
 * Broadcast-style scorebug with several looks. 'keeper' is the chosen direction: a panel tinted
 * with both teams' colors, a Sploosh.AI badge at top center, bold scores and a status plate.
 * The other variants are explorations shown on the scorebug lab page.
 */
export const Scorebug: React.FC<ScorebugProps> = ({ variant = 'keeper', awayTeam, homeTeam, status, statusClass, showSog, venue, compact, highlight }) => {
  const { away, home } = scorebugColors(awayTeam?.abbrev, homeTeam?.abbrev)
  const stripes = 'repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 28px)'
  const isFinal = status.toLowerCase().startsWith('final')
  const isLive = statusClass.includes('text-green-500')
  const awayScore = awayTeam?.score ?? 0
  const homeScore = homeTeam?.score ?? 0
  const dim = (mine: number, theirs: number) => (isFinal && mine < theirs ? 'opacity-55' : '')
  const plateClass = (extra: string) => `${extra} ${statusClass.replace('text-muted-foreground', 'text-white')}`

  if (variant === 'ticker') {
    return (
      <div
        data-testid="scorebug"
        data-variant="ticker"
        className="flex w-full items-center justify-between gap-2 rounded-full border border-white/15 px-4 py-1.5 text-white shadow"
        style={{ background: `linear-gradient(90deg, ${away}cc, #0b1220 50%, ${home}cc)` }}
      >
        <span className="text-sm font-black">{awayTeam?.abbrev}</span>
        <span className="text-2xl font-black tabular-nums">{awayTeam?.score ?? 0}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">{status}</span>
        <span className="text-2xl font-black tabular-nums">{homeTeam?.score ?? 0}</span>
        <span className="text-sm font-black">{homeTeam?.abbrev}</span>
      </div>
    )
  }

  const looks: Record<Exclude<ScorebugVariant, 'ticker'>, { box: string; style: React.CSSProperties; num: string; plate: string; badge: boolean | 'ribbon'; watermark: boolean; logoWatermark?: boolean; cream?: boolean }> = {
    keeper: {
      box: 'border border-white/15 text-white shadow-lg',
      style: { background: `${stripes}, linear-gradient(105deg, ${away}cc 0%, #0b1220 48%, #0b1220 52%, ${home}cc 100%)` },
      num: 'text-5xl font-black sm:text-6xl drop-shadow',
      plate: plateClass('rounded-md border border-white/30 bg-black/50'),
      badge: true,
      watermark: false,
    },
    jumbotron: {
      box: 'border-2 border-zinc-700 bg-black text-amber-300 shadow-lg',
      style: { backgroundImage: 'radial-gradient(rgba(251,191,36,0.18) 1px, transparent 1px)', backgroundSize: '6px 6px' },
      num: 'font-mono text-5xl font-black sm:text-6xl [text-shadow:0_0_14px_rgba(251,191,36,0.85)]',
      plate: 'rounded border border-amber-400/60 bg-black px-2 py-1 font-mono text-amber-300',
      badge: true,
      watermark: false,
    },
    frost: {
      box: 'border border-sky-200 bg-gradient-to-b from-white to-sky-100 text-slate-900 shadow-md',
      style: { boxShadow: `inset 8px 0 0 ${away}, inset -8px 0 0 ${home}` },
      num: 'text-5xl font-black text-slate-900 sm:text-6xl',
      plate: 'rounded-full border border-sky-300 bg-white font-semibold text-slate-700',
      badge: true,
      watermark: false,
    },
    split: {
      // Straight seam on narrow screens so the slash never cuts through the scores; diagonal from sm up
      box: 'border border-white/20 text-white shadow-lg bg-[linear-gradient(90deg,var(--away)_0%,var(--away)_49.5%,#f8fafc_49.5%,#f8fafc_50.5%,var(--home)_50.5%,var(--home)_100%)] sm:bg-[linear-gradient(115deg,var(--away)_0%,var(--away)_49.5%,#f8fafc_49.5%,#f8fafc_50.5%,var(--home)_50.5%,var(--home)_100%)]',
      style: { '--away': away, '--home': home } as React.CSSProperties,
      num: 'text-4xl font-black min-[360px]:text-5xl sm:text-6xl drop-shadow-lg',
      plate: plateClass('rounded-md border border-white/40 bg-black/60'),
      badge: 'ribbon',
      watermark: true,
    },
    marquee: {
      box: 'border-4 border-dotted border-amber-300 text-amber-50 shadow-[0_0_24px_rgba(251,191,36,0.35)]',
      style: { background: 'radial-gradient(ellipse at center, #5b1220 0%, #2a0a12 75%)' },
      num: 'font-serif text-5xl font-black text-amber-300 sm:text-6xl [text-shadow:0_2px_0_#7c2d12]',
      plate: 'rounded-sm border-y-2 border-amber-300 bg-amber-300/10 font-serif text-amber-200',
      badge: true,
      watermark: false,
    },
    poster: {
      box: 'border border-white/20 text-white shadow-xl',
      style: { background: `linear-gradient(180deg, rgba(11,18,32,0.35), rgba(11,18,32,0.9)), linear-gradient(105deg, ${away} 0%, ${home} 100%)` },
      num: 'text-6xl font-black sm:text-7xl drop-shadow-lg',
      plate: plateClass('rounded-full border border-white/40 bg-black/50'),
      badge: true,
      watermark: false,
      logoWatermark: true,
    },
    neon: {
      box: 'border border-white/10 bg-slate-950 text-white',
      style: { boxShadow: `-10px 0 28px -8px ${away}, 10px 0 28px -8px ${home}, inset 0 0 0 1px rgba(255,255,255,0.08)` },
      num: 'text-5xl font-black sm:text-6xl [text-shadow:0_0_16px_rgba(255,255,255,0.7)]',
      plate: plateClass('rounded-md border border-white/30 bg-white/5'),
      badge: true,
      watermark: false,
    },
  }
  if (compact) {
    return (
      <div
        data-testid="scorebug"
        data-variant="card"
        className={`relative w-full rounded-xl border border-white/20 px-2 py-2.5 text-white shadow ${highlight === true ? 'ring-2 ring-amber-500' : highlight ? 'ring-2' : ''}`}
        style={{ ...(typeof highlight === 'string' ? ({ '--tw-ring-color': highlight } as React.CSSProperties) : {}), background: `linear-gradient(90deg, ${away} 0%, ${away} 49.5%, #f8fafc 49.5%, #f8fafc 50.5%, ${home} 50.5%, ${home} 100%)` }}
      >
        <div className="grid grid-cols-2 items-center gap-x-4 gap-y-2">
          <div className="flex items-start justify-end gap-2">
            <TeamEnd team={awayTeam} fallback="Away" showSog={showSog} compact />
            <span className={`flex h-10 items-center text-4xl font-black leading-none tabular-nums drop-shadow-lg ${dim(awayScore, homeScore)}`}>{awayScore}</span>
          </div>
          <div className="flex items-start justify-start gap-2">
            <span className={`flex h-10 items-center text-4xl font-black leading-none tabular-nums drop-shadow-lg ${dim(homeScore, awayScore)}`}>{homeScore}</span>
            <TeamEnd team={homeTeam} fallback="Home" showSog={showSog} compact />
          </div>
          <div className={`col-span-2 justify-self-center whitespace-nowrap rounded-md border border-white/30 bg-black/50 px-3 py-1 text-center text-[11px] font-bold uppercase tracking-widest ${statusClass.replace('text-muted-foreground', 'text-white')}`}>
            {isLive && <span aria-hidden className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-green-400 align-middle" />}
            {status}
          </div>
        </div>
      </div>
    )
  }

  const look = looks[variant]

  return (
    <div
      data-testid="scorebug"
      data-variant={variant}
      className={`relative w-full overflow-visible rounded-2xl px-3 sm:px-6 ${look.badge === 'ribbon' ? 'mt-2 pb-12 pt-5' : 'mt-9 pb-3 pt-14'} ${look.box}`}
      style={look.style}
    >
      {look.watermark && (
        <>
          <span className="pointer-events-none absolute bottom-0 left-3 select-none text-7xl font-black text-white/10 sm:text-8xl">{awayTeam?.abbrev}</span>
          <span className="pointer-events-none absolute bottom-0 right-3 select-none text-7xl font-black text-white/10 sm:text-8xl">{homeTeam?.abbrev}</span>
        </>
      )}
      {look.logoWatermark && (
        <>
          {awayTeam?.logo && <Image src={awayTeam.logo} alt="" width={180} height={180} className="pointer-events-none absolute -left-4 top-1/2 -translate-y-1/2 opacity-20" />}
          {homeTeam?.logo && <Image src={homeTeam.logo} alt="" width={180} height={180} className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 opacity-20" />}
        </>
      )}
      {look.badge === 'ribbon' && (
        <div
          data-testid="scorebug-badge"
          className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 rounded-b-2xl bg-black/75 py-2"
        >
          <Image src="/sploosh.ai/sploosh-ai-character-transparent.png" alt="" width={24} height={22} />
          <span className="whitespace-nowrap text-center text-[clamp(7px,2.8vw,11px)] font-extrabold uppercase leading-tight tracking-[0.1em] text-white sm:text-xs sm:tracking-[0.2em]">Sploosh.AI Hockey Analytics</span>
        </div>
      )}
      {look.badge === true && (
        <div data-testid="scorebug-badge" className="absolute -top-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-0.5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/80 bg-slate-900 shadow-lg sm:h-[72px] sm:w-[72px]">
            <Image src="/sploosh.ai/sploosh-ai-character-transparent.png" alt="Sploosh.AI" width={44} height={40} />
          </div>
          <span className={`text-[11px] font-extrabold uppercase tracking-[0.2em] drop-shadow sm:text-xs ${variant === 'frost' ? 'text-slate-700' : 'text-white'}`}>Sploosh.AI</span>
        </div>
      )}
      <div className="relative grid grid-cols-2 items-center gap-x-6 gap-y-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-4">
        <div className="flex items-start justify-end gap-2 sm:gap-5">
          <TeamEnd team={awayTeam} fallback="Away" showSog={showSog} />
          <span className={`flex h-10 items-center leading-none tabular-nums min-[360px]:h-12 sm:h-16 ${look.num} ${dim(awayScore, homeScore)}`}>{awayScore}</span>
        </div>
        <div className={`col-span-2 row-start-2 justify-self-center whitespace-nowrap px-3 py-1 text-center text-[11px] font-bold uppercase tracking-widest sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:text-sm ${look.plate}`}>{isLive && <span aria-hidden className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-green-400 align-middle" />}{status}</div>
        <div className="flex items-start justify-start gap-2 sm:gap-5">
          <span className={`flex h-10 items-center leading-none tabular-nums min-[360px]:h-12 sm:h-16 ${look.num} ${dim(homeScore, awayScore)}`}>{homeScore}</span>
          <TeamEnd team={homeTeam} fallback="Home" showSog={showSog} />
        </div>
      </div>
      {venue && (
        <div data-testid="scorebug-venue" className="relative mt-3 whitespace-nowrap text-center text-[clamp(6px,2.6vw,10px)] font-semibold uppercase tracking-[0.08em] opacity-75 sm:text-xs sm:tracking-[0.25em]">{venue}</div>
      )}
    </div>
  )
}
