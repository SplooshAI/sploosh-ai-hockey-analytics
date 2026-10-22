export interface TeamStanding {
  /** W-L-OTL */
  record: string
  gamesPlayed: number
  divisionName: string
  conferenceAbbrev: string
  divisionSequence: number
  conferenceSequence: number
  /** 1 or 2 when the team holds a wild card spot, 3 and up when it is outside the race, 0 when it holds a divisional spot. */
  wildcardSequence: number
  /** Points behind the second wild card team; set only for teams outside the race. */
  pointsBehindWildCard?: number
}

interface StandingsRow {
  teamAbbrev?: { default?: string }
  divisionName?: string
  conferenceAbbrev?: string
  conferenceName?: string
  divisionSequence?: number
  conferenceSequence?: number
  wildcardSequence?: number
  points?: number
  wins?: number
  losses?: number
  otLosses?: number
  gamesPlayed?: number
}

const CONFERENCE_LABEL: Record<string, string> = { E: 'East', W: 'West' }

export const ordinal = (n: number): string => {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`
  switch (n % 10) {
    case 1: return `${n}st`
    case 2: return `${n}nd`
    case 3: return `${n}rd`
    default: return `${n}th`
  }
}

/** Index the NHL standings response by team abbreviation, skipping rows without complete rank data. */
export function standingsByTeam(response: { standings?: StandingsRow[] } | null | undefined): Record<string, TeamStanding> {
  const byTeam: Record<string, TeamStanding> = {}
  for (const row of response?.standings ?? []) {
    const abbrev = row.teamAbbrev?.default
    if (!abbrev || !row.divisionName || !row.conferenceAbbrev || !row.divisionSequence || !row.conferenceSequence) continue
    byTeam[abbrev] = {
      record: `${row.wins ?? 0}-${row.losses ?? 0}-${row.otLosses ?? 0}`,
      gamesPlayed: row.gamesPlayed ?? 0,
      divisionName: row.divisionName,
      conferenceAbbrev: row.conferenceAbbrev,
      divisionSequence: row.divisionSequence,
      conferenceSequence: row.conferenceSequence,
      wildcardSequence: row.wildcardSequence ?? 0,
    }
  }
  // Points of the last wild card team in each conference, for teams still chasing it
  const lastWildCardPoints: Record<string, number> = {}
  for (const row of response?.standings ?? []) {
    if (row.wildcardSequence === 2 && row.conferenceAbbrev && typeof row.points === 'number') lastWildCardPoints[row.conferenceAbbrev] = row.points
  }
  for (const row of response?.standings ?? []) {
    const abbrev = row.teamAbbrev?.default
    const standing = abbrev ? byTeam[abbrev] : undefined
    const cutoff = row.conferenceAbbrev ? lastWildCardPoints[row.conferenceAbbrev] : undefined
    if (standing && standing.wildcardSequence >= 3 && cutoff !== undefined && typeof row.points === 'number') {
      standing.pointsBehindWildCard = Math.max(cutoff - row.points, 0)
    }
  }
  return byTeam
}

/** For example "3rd in Pacific, 5th in West"; undefined when the standings have no entry for the team. */
export function formatRank(standing?: TeamStanding): string | undefined {
  // Before a team's first game every team is 0-0-0 and the order is an arbitrary tiebreak
  if (!standing || standing.gamesPlayed === 0) return undefined
  const conference = CONFERENCE_LABEL[standing.conferenceAbbrev] ?? standing.conferenceAbbrev
  const base = `${ordinal(standing.divisionSequence)} in ${standing.divisionName}, ${ordinal(standing.conferenceSequence)} in ${conference}`
  return `${base}${wildCardNote(standing)}`
}

/** " (WC1)" for a wild card spot; " (2 spots, 3 pts behind WC2)" for a team outside the race; nothing otherwise. */
function wildCardNote(standing: TeamStanding): string {
  if (standing.wildcardSequence === 1 || standing.wildcardSequence === 2) return ` (WC${standing.wildcardSequence})`
  if (standing.wildcardSequence < 3) return ''
  const spots = standing.wildcardSequence - 2
  const spotText = `${spots} ${spots === 1 ? 'spot' : 'spots'}`
  const behind = standing.pointsBehindWildCard
  if (behind === undefined) return ` (${spotText} behind WC2)`
  if (behind === 0) return ` (${spotText} behind WC2, level on points)`
  return ` (${spotText}, ${behind} ${behind === 1 ? 'pt' : 'pts'} behind WC2)`
}

/** The day before a YYYY-MM-DD date: the standings that day show where teams stood going into the game. */
export function previousDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}
