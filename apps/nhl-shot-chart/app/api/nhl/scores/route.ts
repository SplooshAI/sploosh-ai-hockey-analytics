import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
        return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 })
    }

    try {
        const response = await fetch(`https://api-web.nhle.com/v1/score/${date}`, {
            headers: {
                'Accept': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error(`NHL Edge API responded with status: ${response.status}`)
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('NHL Edge API Error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch data from the NHL Edge API' },
            { status: 500 }
        )
    }
} 