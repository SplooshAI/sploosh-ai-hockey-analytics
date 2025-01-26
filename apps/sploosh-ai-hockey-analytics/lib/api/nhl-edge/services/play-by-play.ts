import type { NHLEdgePlayByPlay } from '@/lib/api/nhl-edge/types/nhl-edge'

export async function getPlayByPlay(gameId: string): Promise<NHLEdgePlayByPlay> {
    const response = await fetch(`/api/nhl/play-by-play?gameId=${gameId}`)

    if (!response.ok) {
        throw new Error('Failed to fetch play-by-play data')
    }

    return response.json()
} 