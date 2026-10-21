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

const VARIANTS: Record<QrVariant, { title: string; hint: string }> = {
  sploosh: { title: 'Sploosh.AI Hockey Analytics', hint: 'Scan to open this game' },
  nhl: { title: 'NHL® Game Center', hint: 'Scan to open on NHL.com' },
}

/**
 * QrCard - one QR code in its own labelled card.
 * The label sits directly above the code and each variant has its own colors,
 * so the Sploosh.AI code and the NHL code are not mistaken for each other.
 * Both variants share one plain style: black modules on white with a quiet zone, so they scan
 * the same in light and dark themes. Only the label tells them apart.
 */
export const QrCard: React.FC<QrCardProps> = ({ url, variant, label, testId }) => {
  const { title, hint } = VARIANTS[variant]
  return (
    <figure data-variant={variant} className="flex w-56 max-w-full flex-col items-center gap-2 rounded-xl border border-border bg-card p-3">
      <figcaption className="flex flex-col items-center gap-0.5 text-center">
        <span className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-foreground">
          {variant === 'sploosh' && (
            <Image src="/sploosh.ai/sploosh-ai-character-transparent.png" alt="" width={18} height={16} />
          )}
          {title}
        </span>
        <span className="text-[11px] text-muted-foreground">{hint}</span>
      </figcaption>
      <div
        role="img"
        aria-label={label}
        data-testid={testId}
        data-url={url}
        className="rounded-md bg-white"
      >
        <QRCodeSVG value={url} size={136} level="M" marginSize={4} bgColor="#ffffff" fgColor="#000000" aria-hidden="true" />
      </div>
    </figure>
  )
}

/** Divider between the two codes: horizontal when stacked, vertical when side by side. */
export const QrDivider: React.FC = () => (
  <hr className="h-0 w-32 border-t-2 border-dashed border-border sm:h-24 sm:w-0 sm:border-l-2 sm:border-t-0" />
)
