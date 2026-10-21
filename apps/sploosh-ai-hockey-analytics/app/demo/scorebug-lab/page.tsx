'use client'

import { Scorebug, type ScorebugVariant } from '@/components/features/game-header/scorebug'

// Contact sheet of scorebug looks across game states. Development only; not linked from the app.
const VARIANTS: { id: ScorebugVariant; name: string; note: string }[] = [
  { id: 'keeper', name: 'Keeper', note: 'Team-color gradient, rink stripes, Sploosh.AI badge, winner emphasis, arena line, live pulse' },
  { id: 'split', name: 'Split', note: 'Solid team halves, giant watermark abbreviations, winner emphasis, arena line' },
  { id: 'marquee', name: 'Marquee', note: 'Theater marquee: bulb border, cream serif, gold numerals' },
  { id: 'poster', name: 'Poster', note: 'Game-day poster: giant faded logos behind a team-color wash' },
  { id: 'neon', name: 'Neon', note: 'Dark panel with team-color glow on each side' },
  { id: 'jumbotron', name: 'Jumbotron', note: 'Amber LED digits on a dot-matrix board' },
  { id: 'frost', name: 'Frost', note: 'Light ice panel with team-color edge bars' },
  { id: 'ticker', name: 'Ticker', note: 'Compact single row for sidebar cards' },
]

const logo = (abbrev: string) => `https://assets.nhle.com/logos/nhl/svg/${abbrev}_light.svg`

const STATES = [
  {
    label: 'Final (SO)',
    status: 'Final (SO)',
    statusClass: 'text-muted-foreground',
    showSog: true,
    venue: 'Climate Pledge Arena · Seattle, WA',
    away: { abbrev: 'DET', logo: logo('DET'), score: 3, sog: 24, record: '2-3-1' },
    home: { abbrev: 'SEA', logo: logo('SEA'), score: 4, sog: 27, record: '3-2-1' },
  },
  {
    label: 'Live',
    status: '2nd Period - 07:12',
    statusClass: 'text-green-500',
    showSog: true,
    venue: 'KeyBank Center · Buffalo, NY',
    away: { abbrev: 'PHI', logo: logo('PHI'), score: 1, sog: 14, record: '2-6-3' },
    home: { abbrev: 'BUF', logo: logo('BUF'), score: 2, sog: 11, record: '4-3-2' },
  },
  {
    label: 'Upcoming',
    status: '7:30 PM EDT',
    statusClass: 'text-muted-foreground',
    showSog: false,
    venue: 'Canadian Tire Centre · Ottawa, ON',
    away: { abbrev: 'FLA', logo: logo('FLA'), score: 0, record: '5-2-0' },
    home: { abbrev: 'OTT', logo: logo('OTT'), score: 0, record: '6-3-0' },
  },
]

export default function ScorebugLabPage() {
  return (
    <main className="mx-auto max-w-[1600px] space-y-10 p-6">
      <h1 className="text-2xl font-bold">Scorebug lab</h1>
      {VARIANTS.map((v) => (
        <section key={v.id} className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">{v.name}</h2>
            <p className="text-sm text-muted-foreground">{v.note}</p>
          </div>
          <div className="grid gap-6 xl:grid-cols-3">
            {STATES.map((s) => (
              <div key={s.label} className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
                <Scorebug variant={v.id} awayTeam={s.away} homeTeam={s.home} status={s.status} statusClass={s.statusClass} showSog={s.showSog} venue={s.venue} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
