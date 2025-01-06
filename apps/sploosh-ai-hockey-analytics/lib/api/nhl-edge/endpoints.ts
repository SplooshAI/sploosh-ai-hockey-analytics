export const NHL_EDGE_ENDPOINTS = {
    scores: (date: string) => `/score/${date}`,
    playByPlay: (gameId: string) => `/gamecenter/${gameId}/play-by-play`,
    gameCenter: (gameId: string) => `/gamecenter/${gameId}/landing`,
} as const 