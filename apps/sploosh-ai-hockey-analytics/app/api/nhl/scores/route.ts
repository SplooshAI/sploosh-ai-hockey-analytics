import { NextResponse } from 'next/server'
import { fetchNHLEdge, ApiError } from '@/lib/api/nhl-edge/server/client'
import { NHL_EDGE_ENDPOINTS } from '@/lib/api/nhl-edge/endpoints'
import type { NHLEdgeScheduleResponse } from '@/types/nhl-edge'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
        return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 })
    }

    try {
        const data = await fetchNHLEdge<NHLEdgeScheduleResponse>(NHL_EDGE_ENDPOINTS.scores(date))
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
            { error: 'Failed to fetch data from the NHL Edge API' },
            { status: 500 }
        )
    }
} 