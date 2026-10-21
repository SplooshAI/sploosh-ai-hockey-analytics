/**
 * Shootout handling.
 *
 * Every shootout attempt (shot, miss, or goal) appears in the play-by-play feed, but
 * none of them are game shots or goals: the official score credits the winner with a
 * single goal, the one that wins the game. The rest must not be counted as goals,
 * shots, or plotted on the shot chart, or a 4-3 game shows 9 goals.
 */

const isFinal = (gameData: any) => gameData?.gameState === 'FINAL' || gameData?.gameState === 'OFF'

export const isShootoutPlay = (play: any): boolean => play?.periodDescriptor?.periodType === 'SO'

/**
 * The event id of the shootout goal that wins the game: the winner's goal that puts them
 * one ahead of the other team's total shootout goals. Undefined when there was no
 * shootout, or the game is not final (the shootout is still being decided).
 */
export function getShootoutWinningGoalEventId(gameData: any): number | undefined {
  if (!isFinal(gameData)) return undefined

  const goals = (gameData?.plays || []).filter((p: any) => isShootoutPlay(p) && p.typeDescKey === 'goal')
  if (goals.length === 0) return undefined

  const tally = new Map<number, number>()
  for (const goal of goals) {
    const team = goal.details?.eventOwnerTeamId
    tally.set(team, (tally.get(team) || 0) + 1)
  }

  const [first, second] = [...tally.entries()].sort((a, b) => b[1] - a[1])
  const winner = first[0]
  const loserGoals = second ? second[1] : 0
  if (first[1] === loserGoals) return undefined

  const winnerGoals = goals.filter((g: any) => g.details?.eventOwnerTeamId === winner)
  return winnerGoals[loserGoals]?.eventId
}

/**
 * Game data with the shootout attempts removed, except the game-winning goal.
 * Returns a copy; the original data is left alone.
 */
export function excludeShootoutAttempts<T extends { plays?: any[] }>(gameData: T): T {
  const plays = gameData?.plays || []
  if (!plays.some(isShootoutPlay)) return gameData

  const winningGoalId = getShootoutWinningGoalEventId(gameData)
  return {
    ...gameData,
    plays: plays.filter((p: any) => !isShootoutPlay(p) || (winningGoalId !== undefined && p.eventId === winningGoalId)),
  }
}
