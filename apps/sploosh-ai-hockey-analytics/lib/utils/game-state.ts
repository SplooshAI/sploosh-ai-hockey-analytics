import type { NHLEdgeGame } from '@/types/nhl-edge'

export function shouldEnableAutoRefresh(games: NHLEdgeGame[]): boolean {
    if (!games.length) return false;

    const now = new Date();

    return games.some(game => {
        // Check for active games
        if (game.gameState === 'LIVE' || game.gameState === 'CRIT') {
            return true;
        }

        // Check for upcoming games within 15 minutes
        if (game.gameState === 'FUT' || game.gameState === 'PRE') {
            const gameStartTime = new Date(game.startTimeUTC);
            const timeDiffMinutes = (gameStartTime.getTime() - now.getTime()) / (1000 * 60);
            return timeDiffMinutes <= 15;
        }

        return false;
    });
} 