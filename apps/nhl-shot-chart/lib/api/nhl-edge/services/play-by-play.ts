export async function getPlayByPlay(gameId: string): Promise<any> {
    const response = await fetch(`/api/nhl/play-by-play?gameId=${gameId}`)

    if (!response.ok) {
        throw new Error('Failed to fetch play-by-play data')
    }

    return response.json()
} 