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

export interface SpecialEventTheme {
  /** Background for the badge, the generated banner, and the ring around a game card. */
  accent: string
  /** Text color that reads on the accent. */
  text: string
}

const DEFAULT_THEME: SpecialEventTheme = { accent: '#f59e0b', text: '#0f172a' }

const EVENT_THEMES: Array<[RegExp, SpecialEventTheme]> = [
  [/global series/i, { accent: '#0b3a8f', text: '#ffffff' }],
  [/heritage classic/i, { accent: '#b01e2f', text: '#ffffff' }],
  [/stadium series/i, { accent: '#1e6fd9', text: '#ffffff' }],
  [/winter classic/i, { accent: '#2a4b8d', text: '#ffffff' }],
]

/** Colors for a special event, matched by name. Other events and plain neutral-site games stay amber. */
export function specialEventTheme(game?: SpecialGameInfo | null): SpecialEventTheme {
  const name = game?.specialEvent?.name?.default ?? ''
  return EVENT_THEMES.find(([pattern]) => pattern.test(name))?.[1] ?? DEFAULT_THEME
}

/** True when the event has a name but the feed has no banner artwork for it yet. */
export function needsGeneratedBanner(game?: (SpecialGameInfo & { specialEvent?: { lightLogoUrl?: { default?: string } } | null }) | null): boolean {
  return Boolean(game?.specialEvent?.name?.default) && !game?.specialEvent?.lightLogoUrl?.default
}
