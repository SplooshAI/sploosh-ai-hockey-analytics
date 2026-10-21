'use client'
import Image from 'next/image'
import { QRCodeSVG } from 'qrcode.react'

type QrVariant = 'sploosh' | 'nhl'

interface QrCardProps {
  url: string
  variant: QrVariant
  /** Accessible name for the QR code itself */
  label: string
  testId: string
}

const VARIANTS: Record<QrVariant, { title: string; hint: string; card: string; fgColor: string }> = {
  sploosh: {
    title: 'Sploosh.AI Hockey Analytics',
    hint: 'Scan to open this game',
    card: 'border-blue-600 bg-blue-50 dark:bg-blue-950/40',
    fgColor: '#1e3a8a',
  },
  nhl: {
    title: 'NHL® Game Center',
    hint: 'Scan to open on NHL.com',
    card: 'border-border bg-muted/40',
    fgColor: '#000000',
  },
}

/**
 * QrCard - one QR code in its own labelled card.
 * The label sits directly above the code and each variant has its own colors,
 * so the Sploosh.AI code and the NHL code are not mistaken for each other.
 * Codes are always dark on a white tile so they scan in both light and dark themes.
 */
export const QrCard: React.FC<QrCardProps> = ({ url, variant, label, testId }) => {
  const { title, hint, card, fgColor } = VARIANTS[variant]
  return (
    <figure data-variant={variant} className={`flex w-72 max-w-full flex-col items-center gap-3 rounded-xl border-2 p-4 ${card}`}>
      <figcaption className="flex flex-col items-center gap-0.5 text-center">
        <span className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-foreground">
          {variant === 'sploosh' && (
            <Image src="/sploosh.ai/sploosh-ai-character-transparent.png" alt="" width={20} height={18} />
          )}
          {title}
        </span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </figcaption>
      <div
        role="img"
        aria-label={label}
        data-testid={testId}
        data-url={url}
        className="rounded-md bg-white p-2 shadow-sm"
      >
        <QRCodeSVG value={url} size={128} level="M" bgColor="#ffffff" fgColor={fgColor} aria-hidden="true" />
      </div>
    </figure>
  )
}

/** Gap and divider that keep two codes from being in a phone camera's view together. */
export const QrDivider: React.FC = () => <hr className="w-40 border-t-2 border-dashed border-border" />
