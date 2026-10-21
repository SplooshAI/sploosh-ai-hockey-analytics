interface SpecialGameInfo {
  neutralSite?: boolean | null
  specialEvent?: { name?: { default?: string } } | null
}

/**
 * Call-out text for a game that is not an ordinary home game. Special events (Global Series, Stadium Series,
 * Winter Classic) carry their name in the NHL feed; other neutral-site games, such as some preseason games,
 * only have the neutralSite flag. Returns '' for an ordinary game.
 */
export function specialGameBadge(game?: SpecialGameInfo | null): string {
  const name = game?.specialEvent?.name?.default
  if (name) return name
  return game?.neutralSite ? 'Neutral site' : ''
}
