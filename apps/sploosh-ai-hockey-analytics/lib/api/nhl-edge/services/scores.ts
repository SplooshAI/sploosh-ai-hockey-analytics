import type { NHLEdgeScheduleResponse } from '@/lib/api/nhl-edge/types/nhl-edge'

export async function getScores(date: string): Promise<NHLEdgeScheduleResponse> {
    const response = await fetch(`/api/nhl/scores?date=${date}`)

    if (!response.ok) {
        throw new Error('Failed to fetch scores')
    }

    return response.json()
} 