'use client'
import { QRCodeSVG } from 'qrcode.react'

interface QrCodeProps {
  url: string
  label: string
  testId: string
}

/**
 * QrCode - small scannable QR code for a URL.
 * Always dark modules on a white tile so it scans in both light and dark themes.
 */
export const QrCode: React.FC<QrCodeProps> = ({ url, label, testId }) => (
  <div
    role="img"
    aria-label={label}
    data-testid={testId}
    data-url={url}
    className="rounded-md bg-white p-1.5 shadow-sm ring-1 ring-border"
  >
    <QRCodeSVG value={url} size={96} level="M" bgColor="#ffffff" fgColor="#000000" aria-hidden="true" />
  </div>
)
