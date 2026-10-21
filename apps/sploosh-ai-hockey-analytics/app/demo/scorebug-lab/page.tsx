'use client'

import { useEffect, useState } from 'react'
import { Scorebug, type ScorebugVariant } from '@/components/features/game-header/scorebug'
import { GameCard } from '@/components/features/games/card/game-card'
import type { NHLEdgeGame } from '@/lib/api/nhl-edge/types/nhl-edge'

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

// Dates with special-event or neutral-site games this season, fetched live so the cards show real data
const SPECIAL_DATES = ['2026-10-25', '2026-11-12', '2026-11-14', '2027-02-20']

// A pair of red teams on the same night, to check the similar-color fallback
const SIMILAR_COLOR_GAMES = [
  { away: 'FLA', home: 'OTT' },
  { away: 'DET', home: 'TOR' },
  { away: 'CAR', home: 'NJD' },
]

function SpecialCards() {
  const [games, setGames] = useState<NHLEdgeGame[]>([])
  useEffect(() => {
    let cancelled = false
    Promise.all(
      SPECIAL_DATES.map((d) =>
        fetch(`/api/nhl/scores?date=${d}`)
          .then((r) => (r.ok ? r.json() : { games: [] }))
          .then((j) => (j.games ?? []).filter((g: NHLEdgeGame) => g.specialEvent || g.neutralSite))
          .catch(() => [])
      )
    ).then((lists) => {
      if (!cancelled) setGames(lists.flat())
    })
    return () => {
      cancelled = true
    }
  }, [])
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Sidebar cards: special and neutral-site games</h2>
        <p className="text-sm text-muted-foreground">Real games from the NHL feed, shown at sidebar width</p>
      </div>
      <div className="flex flex-wrap gap-6">
        {games.length === 0 && <p className="text-sm text-muted-foreground">Loading...</p>}
        {games.map((g) => (
          <div key={g.id} className="w-[272px]">
            <GameCard game={g} />
          </div>
        ))}
      </div>
    </section>
  )
}

export default function ScorebugLabPage() {
  return (
    <main className="mx-auto max-w-[1600px] space-y-10 p-6">
      <h1 className="text-2xl font-bold">Scorebug lab</h1>
      <SpecialCards />
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Similar team colors</h2>
          <p className="text-sm text-muted-foreground">When two primaries are too close, the home side switches to its secondary color</p>
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          {SIMILAR_COLOR_GAMES.map((m) => (
            <Scorebug
              key={m.away + m.home}
              variant="split"
              awayTeam={{ abbrev: m.away, logo: logo(m.away), score: 2, sog: 18, record: '3-2-1' }}
              homeTeam={{ abbrev: m.home, logo: logo(m.home), score: 1, sog: 22, record: '4-1-0' }}
              status="Final"
              statusClass="text-muted-foreground"
              showSog
              venue="Sample Arena · Sample City"
            />
          ))}
        </div>
      </section>
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
