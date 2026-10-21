import { SITE } from '@/lib/constants'

/** Canonical, shareable URL for a game page. */
export const getGameShareUrl = (gameId: number | string): string =>
  `${SITE.url}/?gameId=${encodeURIComponent(String(gameId))}`
