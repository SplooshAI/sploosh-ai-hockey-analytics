'use client'

import * as React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import type { ShotEvent } from '@/lib/utils/shot-chart-utils'
import { createRinkTexture } from './ice-rink-texture'

const RINK_LENGTH = 200
const RINK_WIDTH = 85
const CORNER_RADIUS = 28
const BOARDS_HEIGHT = 3.5
const ICE_LEVEL = 0

const KRAKEN_DEEP = '#001628'

interface ArenaSceneProps {
  shots: ShotEvent[]
  homeTeamId?: number
  awayTeamId?: number
  homeColor: string
  awayColor: string
  onShotClick?: (shot: ShotEvent, clientX: number, clientY: number) => void
  onShotHover?: (shot: ShotEvent, clientX: number, clientY: number) => void
  selectedShotEventId?: number
  centerIceLogo?: string
  centerIceLogoWidthFt?: number
  centerIceLogoHeightFt?: number
}

function rinkShape(): THREE.Shape {
  const r = CORNER_RADIUS
  const halfL = RINK_LENGTH / 2
  const halfW = RINK_WIDTH / 2
  const s = new THREE.Shape()
  s.moveTo(-halfL + r, -halfW)
  s.lineTo(halfL - r, -halfW)
  s.quadraticCurveTo(halfL, -halfW, halfL, -halfW + r)
  s.lineTo(halfL, halfW - r)
  s.quadraticCurveTo(halfL, halfW, halfL - r, halfW)
  s.lineTo(-halfL + r, halfW)
  s.quadraticCurveTo(-halfL, halfW, -halfL, halfW - r)
  s.lineTo(-halfL, -halfW + r)
  s.quadraticCurveTo(-halfL, -halfW, -halfL + r, -halfW)
  return s
}

function boardsShape(thickness: number): THREE.Shape {
  const r = CORNER_RADIUS
  const halfL = RINK_LENGTH / 2 + thickness
  const halfW = RINK_WIDTH / 2 + thickness
  const ir = r
  const ihalfL = RINK_LENGTH / 2
  const ihalfW = RINK_WIDTH / 2

  const outer = new THREE.Shape()
  outer.moveTo(-halfL + r, -halfW)
  outer.lineTo(halfL - r, -halfW)
  outer.quadraticCurveTo(halfL, -halfW, halfL, -halfW + r)
  outer.lineTo(halfL, halfW - r)
  outer.quadraticCurveTo(halfL, halfW, halfL - r, halfW)
  outer.lineTo(-halfL + r, halfW)
  outer.quadraticCurveTo(-halfL, halfW, -halfL, halfW - r)
  outer.lineTo(-halfL, -halfW + r)
  outer.quadraticCurveTo(-halfL, -halfW, -halfL + r, -halfW)

  const hole = new THREE.Path()
  hole.moveTo(-ihalfL + ir, -ihalfW)
  hole.lineTo(ihalfL - ir, -ihalfW)
  hole.quadraticCurveTo(ihalfL, -ihalfW, ihalfL, -ihalfW + ir)
  hole.lineTo(ihalfL, ihalfW - ir)
  hole.quadraticCurveTo(ihalfL, ihalfW, ihalfL - ir, ihalfW)
  hole.lineTo(-ihalfL + ir, ihalfW)
  hole.quadraticCurveTo(-ihalfL, ihalfW, -ihalfL, ihalfW - ir)
  hole.lineTo(-ihalfL, -ihalfW + ir)
  hole.quadraticCurveTo(-ihalfL, -ihalfW, -ihalfL + ir, -ihalfW)
  outer.holes.push(hole)
  return outer
}

interface IceSurfaceProps {
  centerIceLogo?: string
  centerIceLogoWidthFt?: number
  centerIceLogoHeightFt?: number
}

function IceSurface({ centerIceLogo, centerIceLogoWidthFt, centerIceLogoHeightFt }: IceSurfaceProps) {
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!centerIceLogo) {
      setLogoImage(null)
      return
    }
    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (!cancelled) setLogoImage(img)
    }
    img.onerror = () => {
      if (!cancelled) setLogoImage(null)
    }
    img.src = centerIceLogo
    return () => {
      cancelled = true
    }
  }, [centerIceLogo])

  const texture = useMemo(
    () =>
      createRinkTexture({
        centerLogo: logoImage,
        centerLogoWidthFt: centerIceLogoWidthFt,
        centerLogoHeightFt: centerIceLogoHeightFt,
      }),
    [logoImage, centerIceLogoWidthFt, centerIceLogoHeightFt]
  )

  useEffect(() => {
    return () => {
      texture.dispose()
    }
  }, [texture])

  const shape = useMemo(() => rinkShape(), [])
  const geometry = useMemo(() => {
    const g = new THREE.ShapeGeometry(shape)
    const pos = g.attributes.position
    const halfL = RINK_LENGTH / 2
    const halfW = RINK_WIDTH / 2
    const uvs = new Float32Array(pos.count * 2)
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      uvs[i * 2] = (x + halfL) / RINK_LENGTH
      uvs[i * 2 + 1] = (y + halfW) / RINK_WIDTH
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    return g
  }, [shape])

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, ICE_LEVEL, 0]}
      receiveShadow
    >
      <meshStandardMaterial
        map={texture}
        roughness={0.18}
        metalness={0.1}
        envMapIntensity={0.6}
      />
    </mesh>
  )
}

function Boards() {
  const geometry = useMemo(() => {
    const shape = boardsShape(0.5)
    return new THREE.ExtrudeGeometry(shape, {
      depth: BOARDS_HEIGHT,
      bevelEnabled: false,
      curveSegments: 24,
    })
  }, [])

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, ICE_LEVEL, 0]}
      castShadow
    >
      <meshStandardMaterial color="#ffffff" roughness={0.6} metalness={0.05} />
    </mesh>
  )
}

function ArenaLighting() {
  return (
    <>
      <ambientLight intensity={1.4} color="#ffffff" />
      <hemisphereLight args={['#ffffff', KRAKEN_DEEP, 0.6]} />
      <directionalLight
        position={[0, 100, 40]}
        intensity={0.55}
        color="#ffffff"
        target-position={[0, 0, 0]}
      />
    </>
  )
}

interface ShotMarkerProps {
  shot: ShotEvent
  color: string
  isHome: boolean
  onClick?: (shot: ShotEvent, clientX: number, clientY: number) => void
  isSelected: boolean
  onHover?: (shot: ShotEvent, clientX: number, clientY: number) => void
}

function nhlToWorld(x: number, y: number): [number, number] {
  return [x, -y]
}

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '')
  if (c.length !== 6) return false
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luminance > 0.6
}

const GOAL_LIGHT_RED = '#ff1a1a'

function ShotMarker({ shot, color, isHome, onClick, onHover, isSelected }: ShotMarkerProps) {
  const [wx, wz] = nhlToWorld(shot.xCoord, shot.yCoord)
  const isGoal = shot.result === 'goal'
  const isMiss = shot.result === 'missed-shot'
  const isBlock = shot.result === 'blocked-shot'
  const needsContrast = isLightColor(color)
  const contrastColor = '#0b1220'
  const beamRef = useRef<THREE.MeshStandardMaterial>(null)

  const lightDomeRef = useRef<THREE.MeshStandardMaterial>(null)
  const lightHaloRef = useRef<THREE.MeshBasicMaterial>(null)
  const lightSourceRef = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    if (isGoal) {
      const t = clock.getElapsedTime() + shot.eventId * 0.41
      const pulse = Math.pow(Math.max(0, Math.sin(t * 4)), 2)
      const base = isSelected ? 1.6 : 1.0
      const peak = isSelected ? 5.5 : 4.0
      const intensity = base + (peak - base) * pulse

      if (lightDomeRef.current) lightDomeRef.current.emissiveIntensity = intensity
      if (lightHaloRef.current) lightHaloRef.current.opacity = 0.15 + 0.5 * pulse
      if (lightSourceRef.current) lightSourceRef.current.intensity = (isSelected ? 12 : 6) + 24 * pulse
      return
    }
    if (beamRef.current) {
      const t = clock.getElapsedTime() + shot.eventId * 0.27
      const breathe = 0.5 + 0.5 * Math.sin(t * 1.4)
      const base = isSelected ? 1.4 : 0.9
      beamRef.current.emissiveIntensity = base + 0.5 * breathe
    }
  })

  const handleClick = (e: { stopPropagation: () => void; nativeEvent: MouseEvent }) => {
    e.stopPropagation()
    onClick?.(shot, e.nativeEvent.clientX, e.nativeEvent.clientY)
  }

  const handlePointerOver = (e: { stopPropagation: () => void; nativeEvent: MouseEvent }) => {
    e.stopPropagation()
    onHover?.(shot, e.nativeEvent.clientX, e.nativeEvent.clientY)
  }

  if (isGoal) {
    return (
      <group position={[wx, ICE_LEVEL + 0.05, wz]} onClick={handleClick} onPointerOver={handlePointerOver}>
        {/* dark ice base + team-colored identification ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[1.0, 1.7, 24]} />
          <meshBasicMaterial color={contrastColor} transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[1.15, 1.55, isHome ? 24 : 4]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 1.6 : 0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* mounting post */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.18, 0.22, 2.4, 10]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* base plate where the lamp sits */}
        <mesh position={[0, 2.55, 0]}>
          <cylinderGeometry args={[0.85, 0.85, 0.3, 16]} />
          <meshStandardMaterial color="#2b2b2b" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* glowing red dome — the goal light */}
        <mesh position={[0, 3.4, 0]}>
          <sphereGeometry args={[0.95, 24, 18]} />
          <meshStandardMaterial
            ref={lightDomeRef}
            color={GOAL_LIGHT_RED}
            emissive={GOAL_LIGHT_RED}
            emissiveIntensity={isSelected ? 3.0 : 2.0}
            transparent
            opacity={0.92}
          />
        </mesh>
        {/* outer halo that fades with the pulse */}
        <mesh position={[0, 3.4, 0]}>
          <sphereGeometry args={[1.45, 16, 12]} />
          <meshBasicMaterial
            ref={lightHaloRef}
            color={GOAL_LIGHT_RED}
            transparent
            opacity={0.25}
            depthWrite={false}
          />
        </mesh>
        <pointLight
          ref={lightSourceRef}
          position={[0, 3.4, 0]}
          color={GOAL_LIGHT_RED}
          intensity={isSelected ? 24 : 16}
          distance={28}
          decay={2}
        />
      </group>
    )
  }

  if (isMiss) {
    return (
      <group position={[wx, ICE_LEVEL + 0.05, wz]} onClick={handleClick} onPointerOver={handlePointerOver}>
        {/* dark contrast ring on ice */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.55, 1.4, 24]} />
          <meshBasicMaterial color={contrastColor} transparent opacity={0.55} side={THREE.DoubleSide} />
        </mesh>
        {/* open team-color ring (no fill — the play didn't connect) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[0.85, 1.15, isHome ? 24 : 4]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 1.3 : 0.45}
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    )
  }

  if (isBlock) {
    return (
      <group position={[wx, ICE_LEVEL + 0.05, wz]} onClick={handleClick} onPointerOver={handlePointerOver}>
        {/* dark contrast disc */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.6, 1.3, 24]} />
          <meshBasicMaterial color={contrastColor} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
        {/* upright shield-slab — a defender wall */}
        <mesh position={[0, 0.85, 0]} rotation={[0, isHome ? 0 : Math.PI / 4, 0]}>
          <boxGeometry args={[2.0, 1.7, 0.25]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 1.5 : 0.6}
            transparent
            opacity={0.92}
          />
        </mesh>
        {/* dark cross-bar through the shield */}
        <mesh position={[0, 0.85, 0]} rotation={[0, isHome ? 0 : Math.PI / 4, 0]}>
          <boxGeometry args={[2.1, 0.32, 0.27]} />
          <meshStandardMaterial color={contrastColor} roughness={0.5} />
        </mesh>
        {/* small contrast band where the shield meets the ice */}
        {needsContrast && (
          <mesh position={[0, 0.06, 0]} rotation={[0, isHome ? 0 : Math.PI / 4, 0]}>
            <boxGeometry args={[2.05, 0.12, 0.32]} />
            <meshBasicMaterial color={contrastColor} />
          </mesh>
        )}
      </group>
    )
  }

  // shot-on-goal: glowing team-color beam rising from a small puck-disc
  return (
    <group position={[wx, ICE_LEVEL + 0.05, wz]} onClick={handleClick} onPointerOver={handlePointerOver}>
      {/* dark contrast disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.7, 1.3, 24]} />
        <meshBasicMaterial color={contrastColor} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* puck base — small dark disc at ice level */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.32, 18]} />
        <meshStandardMaterial color="#101218" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* glowing team-color beam — cylinder for home, square for away */}
      {isHome ? (
        <mesh position={[0, 1.7, 0]}>
          <cylinderGeometry args={[0.35, 0.45, 2.6, 16]} />
          <meshStandardMaterial
            ref={beamRef}
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 1.6 : 1.0}
            transparent
            opacity={0.9}
          />
        </mesh>
      ) : (
        <mesh position={[0, 1.7, 0]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.75, 2.6, 0.75]} />
          <meshStandardMaterial
            ref={beamRef}
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 1.6 : 1.0}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}
      {/* small bright cap at the top of the beam */}
      <mesh position={[0, 3.05, 0]}>
        <sphereGeometry args={[0.35, 12, 10]} />
        <meshStandardMaterial
          color={needsContrast ? contrastColor : color}
          emissive={needsContrast ? contrastColor : color}
          emissiveIntensity={isSelected ? 2.0 : 1.4}
        />
      </mesh>
    </group>
  )
}

export function ArenaScene({
  shots,
  homeTeamId,
  homeColor,
  awayColor,
  onShotClick,
  onShotHover,
  selectedShotEventId,
  centerIceLogo,
  centerIceLogoWidthFt,
  centerIceLogoHeightFt,
}: ArenaSceneProps) {
  
  return (
    <>
      <color attach="background" args={['#02030a']} />
      <fog attach="fog" args={['#02030a', 220, 520]} />
      <ArenaLighting />
      <IceSurface
        centerIceLogo={centerIceLogo}
        centerIceLogoWidthFt={centerIceLogoWidthFt}
        centerIceLogoHeightFt={centerIceLogoHeightFt}
      />
      <Boards />
      {shots.map((shot) => {
        const isHome = shot.teamId === homeTeamId
        const color = isHome ? homeColor : awayColor
        return (
          <ShotMarker
            key={shot.eventId}
            shot={shot}
            color={color}
            isHome={isHome}
            onClick={onShotClick}
            onHover={onShotHover}
            isSelected={selectedShotEventId === shot.eventId}
          />
        )
      })}
    </>
  )
}
