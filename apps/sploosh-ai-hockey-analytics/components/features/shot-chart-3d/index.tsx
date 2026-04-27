'use client'

import dynamic from 'next/dynamic'

const Loading = () => (
  <div
    className="flex items-center justify-center w-full bg-[#02030a] rounded-lg text-white/60 text-sm"
    style={{ aspectRatio: '16 / 9', minHeight: 380 }}
  >
    Loading 3D arena…
  </div>
)

export const ShotChart3D = dynamic(
  () => import('./shot-chart-3d').then((m) => m.ShotChart3D),
  { ssr: false, loading: Loading }
)
