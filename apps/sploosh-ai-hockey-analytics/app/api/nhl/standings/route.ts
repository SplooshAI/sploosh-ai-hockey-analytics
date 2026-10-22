import { NextResponse } from 'next/server'
import { fetchNHLEdge, ApiError } from '@/lib/api/nhl-edge/server/client'
import { NHL_EDGE_ENDPOINTS } from '@/lib/api/nhl-edge/endpoints'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json({ error: 'Date parameter (YYYY-MM-DD) is required' }, { status: 400 })
    }

    try {
        const data = await fetchNHLEdge(NHL_EDGE_ENDPOINTS.standings(date))
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
            { error: 'Failed to fetch standings from the NHL Edge API' },
            { status: 500 }
        )
    }
}
