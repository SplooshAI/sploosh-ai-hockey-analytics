export const NHL_EDGE_ENDPOINTS = {
    scores: (date: string) => `/score/${date}`,
    playByPlay: (gameId: string) => `/gamecenter/${gameId}/play-by-play`,
} as const 