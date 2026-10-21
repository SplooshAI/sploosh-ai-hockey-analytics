'use client'
import { getGameCenterUrl, getGameShareUrl } from '@/lib/share-url'
import { QrCard, QrDivider } from './qr-code'

interface GameQrCodesProps {
  gameId?: number
  gameCenterLink?: string
  className?: string
}

/**
 * GameQrCodes - labelled QR cards for this game's Sploosh.AI page and its NHL Game Center page.
 * Stacked with a divider so only one code is in a camera's view at a time.
 * Used underneath the shot chart; the header footer renders the same cards under its links.
 */
export const GameQrCodes: React.FC<GameQrCodesProps> = ({ gameId, gameCenterLink, className = '' }) => {
  const gameCenterUrl = gameCenterLink ? getGameCenterUrl(gameCenterLink) : null
  const shareUrl = gameId !== undefined ? getGameShareUrl(gameId) : null
  if (!gameCenterUrl && !shareUrl) return null

  return (
    <div className={`flex flex-col items-center gap-10 ${className}`}>
      {shareUrl && (
        <QrCard url={shareUrl} variant="sploosh" label="QR code for Sploosh.AI Hockey Analytics" testId="qr-share" />
      )}
      {shareUrl && gameCenterUrl && <QrDivider />}
      {gameCenterUrl && (
        <QrCard url={gameCenterUrl} variant="nhl" label="QR code for NHL Game Center" testId="qr-game-center" />
      )}
    </div>
  )
}
