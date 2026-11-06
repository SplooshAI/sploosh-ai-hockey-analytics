import { SITE } from '@/lib/constants'

/** Canonical, shareable URL for a game page. */
export const getGameShareUrl = (gameId: number | string): string =>
  `${SITE.url}/?gameId=${encodeURIComponent(String(gameId))}`

/** Canonical, shareable URL for the app itself (no game selected). */
export const getAppShareUrl = (): string => `${SITE.url}/`

/** Absolute NHL.com URL for a game center path such as `/gamecenter/123/recap`. */
export const getGameCenterUrl = (gameCenterLink: string): string =>
  `https://www.nhl.com${gameCenterLink}`
