import { NextResponse } from 'next/server'
import { fetchNHLEdge, ApiError } from '@/lib/api/nhl-edge/server/client'
import { NHL_EDGE_ENDPOINTS } from '@/lib/api/nhl-edge/endpoints'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')

    if (!gameId) {
        return NextResponse.json({ error: 'GameId parameter is required' }, { status: 400 })
    }

    try {
        const data = await fetchNHLEdge(NHL_EDGE_ENDPOINTS.playByPlay(gameId))
        return NextResponse.json(data)
    } catch (error) {
        console.error('NHL Edge API Error:', error)

        if (error instanceof ApiError) {
            return NextResponse.json(
                { error: error.message },
                { status: error.status }
            )
        }

        return NextResponse.json(
            { error: 'Failed to fetch play-by-play data from the NHL Edge API' },
            { status: 500 }
        )
    }
} 