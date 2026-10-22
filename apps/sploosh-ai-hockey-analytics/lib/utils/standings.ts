export interface TeamStanding {
  divisionName: string
  conferenceAbbrev: string
  divisionSequence: number
  conferenceSequence: number
}

interface StandingsRow {
  teamAbbrev?: { default?: string }
  divisionName?: string
  conferenceAbbrev?: string
  conferenceName?: string
  divisionSequence?: number
  conferenceSequence?: number
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
      divisionName: row.divisionName,
      conferenceAbbrev: row.conferenceAbbrev,
      divisionSequence: row.divisionSequence,
      conferenceSequence: row.conferenceSequence,
    }
  }
  return byTeam
}

/** For example "3rd in Pacific, 5th in West"; undefined when the standings have no entry for the team. */
export function formatRank(standing?: TeamStanding): string | undefined {
  if (!standing) return undefined
  const conference = CONFERENCE_LABEL[standing.conferenceAbbrev] ?? standing.conferenceAbbrev
  return `${ordinal(standing.divisionSequence)} in ${standing.divisionName}, ${ordinal(standing.conferenceSequence)} in ${conference}`
}
