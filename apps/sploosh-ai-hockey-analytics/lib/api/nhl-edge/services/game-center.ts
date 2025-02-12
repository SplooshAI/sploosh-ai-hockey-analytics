import type { NHLEdgeGame } from '../types/nhl-edge'

export async function getGameCenter(gameId: string): Promise<NHLEdgeGame> {
    const response = await fetch(`/api/nhl/game-center?gameId=${gameId}`)

    if (!response.ok) {
        throw new Error('Failed to fetch game center data')
    }

    return response.json()
} 