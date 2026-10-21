'use client'
import { getGameCenterUrl, getGameShareUrl } from '@/lib/share-url'
import { QrCode } from './qr-code'

interface GameQrCodesProps {
  gameId?: number
  gameCenterLink?: string
  className?: string
}

/**
 * GameQrCodes - captioned QR codes for the NHL Game Center page and this game's share URL.
 * Used underneath the shot chart; the header footer renders the same codes under its links.
 */
export const GameQrCodes: React.FC<GameQrCodesProps> = ({ gameId, gameCenterLink, className = '' }) => {
  const gameCenterUrl = gameCenterLink ? getGameCenterUrl(gameCenterLink) : null
  const shareUrl = gameId !== undefined ? getGameShareUrl(gameId) : null
  if (!gameCenterUrl && !shareUrl) return null

  return (
    <div className={`flex flex-wrap items-start justify-center gap-6 ${className}`}>
      {gameCenterUrl && (
        <figure className="flex flex-col items-center gap-2">
          <QrCode url={gameCenterUrl} label="QR code for NHL Game Center" testId="qr-game-center" />
          <figcaption className="text-xs text-muted-foreground">NHL® Game Center</figcaption>
        </figure>
      )}
      {shareUrl && (
        <figure className="flex flex-col items-center gap-2">
          <QrCode url={shareUrl} label="QR code to share this game" testId="qr-share" />
          <figcaption className="text-xs text-muted-foreground">Share</figcaption>
        </figure>
      )}
    </div>
  )
}
