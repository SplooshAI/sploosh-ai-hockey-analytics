// Call-out text for games that are not an ordinary home game: Global Series, Stadium Series,
// Winter Classic and the like carry a `specialEvent` name in the NHL feed; other neutral-site games
// (some preseason games, for example) only have the `neutralSite` flag.

/** The event name for a special-event game, "Neutral site" for other neutral-site games, '' otherwise. */
export function specialGameBadge(game) {
  const name = game?.specialEvent?.name?.default
  if (name) return name
  return game?.neutralSite ? 'Neutral site' : ''
}
