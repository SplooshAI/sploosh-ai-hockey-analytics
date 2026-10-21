import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { SITE } from '@/lib/constants'

export const alt = SITE.name
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const logo = await readFile(
    path.join(process.cwd(), 'public/sploosh.ai/sploosh-ai-character-transparent.png')
  )
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 80px',
          background: 'linear-gradient(135deg, #0b1d33 0%, #123a5c 60%, #1d6f8f 100%)',
          color: 'white',
        }}
      >
        <img src={logoSrc} width={300} height={300} alt="" />
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 64, width: 700 }}>
          <div style={{ fontSize: 40, color: '#99d9d9', letterSpacing: 2 }}>Sploosh.AI</div>
          <div style={{ fontSize: 100, fontWeight: 700, lineHeight: 1.05, marginTop: 8 }}>Hockey</div>
          <div style={{ fontSize: 100, fontWeight: 700, lineHeight: 1.05 }}>Analytics</div>
          <div style={{ fontSize: 34, marginTop: 28, color: '#cfe8f3' }}>
            Shot charts and game timelines
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
