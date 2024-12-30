export const NHL_EDGE_API_BASE_URL = 'https://api-web.nhle.com/v1'

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: any
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

export async function fetchNHLEdge<T>(endpoint: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${NHL_EDGE_API_BASE_URL}${endpoint}`, {
        ...init,
        headers: {
            'Accept': 'application/json',
            ...init?.headers,
        },
    })

    if (!response.ok) {
        throw new ApiError(
            `NHL Edge API responded with status: ${response.status}`,
            response.status,
            await response.json().catch(() => null)
        )
    }

    return response.json()
} 