import { useEffect, useState } from 'react'
import { standingsByTeam, previousDate, type TeamStanding } from '@/lib/utils/standings'

export type StandingsMap = Record<string, TeamStanding>

export async function fetchStandings(date: string, signal?: AbortSignal): Promise<StandingsMap> {
  const data = await fetch(`/api/nhl/standings?date=${date}`, { signal })
    .then((response) => (response.ok ? response.json() : null))
    .catch(() => null)
  return standingsByTeam(data)
}

/**
 * Standings going into a game day (the day before) and, when needed, standings including that day's results.
 * Both are optional: a failed feed yields empty maps and callers fall back to the scores-feed record.
 */
export function useGameStandings(date: string | undefined, needsAfter: boolean) {
  const [state, setState] = useState<{ date: string; before: StandingsMap; after: StandingsMap; afterLoaded: boolean } | null>(null)

  useEffect(() => {
    if (!date) return
    const controller = new AbortController()
    const run = async () => {
      const [before, after] = await Promise.all([
        fetchStandings(previousDate(date), controller.signal),
        needsAfter ? fetchStandings(date, controller.signal) : Promise.resolve({}),
      ])
      if (!controller.signal.aborted) setState({ date, before, after, afterLoaded: needsAfter })
    }
    run()
    return () => controller.abort()
  }, [date, needsAfter])

  return state && state.date === date ? state : null
}
