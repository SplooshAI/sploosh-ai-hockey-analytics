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
const GLASS_HEIGHT = 8
const ICE_LEVEL = 0

const KRAKEN_DEEP = '#001628'
const KRAKEN_ICE = '#99D9D9'

interface ArenaSceneProps {
  shots: ShotEvent[]
  homeTeamId?: number
  awayTeamId?: number
  homeColor: string
  awayColor: string
  onShotClick?: (shot: ShotEvent, clientX: number, clientY: number) => void
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

function GlassRing() {
  const geometry = useMemo(() => {
    const shape = boardsShape(0.2)
    return new THREE.ExtrudeGeometry(shape, {
      depth: GLASS_HEIGHT,
      bevelEnabled: false,
      curveSegments: 24,
    })
  }, [])

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, ICE_LEVEL + BOARDS_HEIGHT, 0]}
    >
      <meshPhysicalMaterial
        color="#cce8ff"
        transparent
        opacity={0.18}
        roughness={0.05}
        metalness={0}
        transmission={0.85}
        ior={1.45}
        thickness={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

interface SeatingBowlProps {
  innerRadiusX: number
  innerRadiusZ: number
}

function SeatingBowl({ innerRadiusX, innerRadiusZ }: SeatingBowlProps) {
  const tiers = useMemo(() => {
    const result: Array<{
      radiusX: number
      radiusZ: number
      height: number
      color: string
      ringHeight: number
    }> = []
    const tierCount = 18
    const baseHeight = BOARDS_HEIGHT + GLASS_HEIGHT + 2
    const tierDepth = 4
    const tierRise = 2.2
    for (let i = 0; i < tierCount; i++) {
      const offset = i * tierDepth
      result.push({
        radiusX: innerRadiusX + offset,
        radiusZ: innerRadiusZ + offset,
        height: baseHeight + i * tierRise,
        color: i % 2 === 0 ? '#0a0a0e' : '#15171c',
        ringHeight: tierRise,
      })
    }
    return result
  }, [innerRadiusX, innerRadiusZ])

  return (
    <group>
      {tiers.map((tier, i) => (
        <mesh
          key={i}
          position={[0, tier.height, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[tier.radiusX, tier.radiusX + 4, 96]} />
          <meshStandardMaterial
            color={tier.color}
            roughness={0.95}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      {tiers.map((tier, i) => (
        <mesh key={`riser-${i}`} position={[0, tier.height - tier.ringHeight / 2, 0]}>
          <cylinderGeometry
            args={[tier.radiusX, tier.radiusX, tier.ringHeight, 96, 1, true]}
          />
          <meshStandardMaterial
            color="#05060a"
            side={THREE.DoubleSide}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  )
}

function LedRing({ radius, height }: { radius: number; height: number }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    if (matRef.current) {
      const t = clock.getElapsedTime()
      const pulse = 0.6 + Math.sin(t * 1.5) * 0.2
      matRef.current.emissiveIntensity = pulse
    }
  })
  return (
    <mesh position={[0, height, 0]}>
      <cylinderGeometry args={[radius, radius, 2.5, 96, 1, true]} />
      <meshStandardMaterial
        ref={matRef}
        color={KRAKEN_DEEP}
        emissive={KRAKEN_ICE}
        emissiveIntensity={0.7}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function ArenaRoof({ radius, height }: { radius: number; height: number }) {
  const domeY = height
  const domeRadius = radius * 0.95
  return (
    <mesh position={[0, domeY, 0]}>
      <sphereGeometry args={[domeRadius, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2.4]} />
      <meshStandardMaterial color="#04050b" side={THREE.BackSide} roughness={1} />
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
}

function nhlToWorld(x: number, y: number): [number, number] {
  return [x, -y]
}

function ShotMarker({ shot, color, onClick, isSelected }: ShotMarkerProps) {
  const [wx, wz] = nhlToWorld(shot.xCoord, shot.yCoord)
  const goalRef = useRef<THREE.Group>(null)
  const isGoal = shot.result === 'goal'
  const isMissBlock = shot.result === 'missed-shot' || shot.result === 'blocked-shot'

  useFrame(({ clock }) => {
    if (isGoal && goalRef.current) {
      const t = clock.getElapsedTime() + shot.eventId * 0.13
      goalRef.current.scale.y = 1 + Math.sin(t * 2) * 0.06
    }
  })

  const handleClick = (e: { stopPropagation: () => void; nativeEvent: MouseEvent }) => {
    e.stopPropagation()
    onClick?.(shot, e.nativeEvent.clientX, e.nativeEvent.clientY)
  }

  if (isGoal) {
    return (
      <group position={[wx, ICE_LEVEL + 0.05, wz]} ref={goalRef} onClick={handleClick}>
        <mesh position={[0, 6, 0]}>
          <cylinderGeometry args={[0.6, 0.9, 12, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 2.2 : 1.4}
            transparent
            opacity={0.85}
          />
        </mesh>
        <mesh position={[0, 13, 0]}>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={isSelected ? 2.5 : 1.6}
          />
        </mesh>
        <pointLight position={[0, 6, 0]} color={color} intensity={isSelected ? 30 : 18} distance={20} decay={2} />
      </group>
    )
  }

  if (isMissBlock) {
    return (
      <group position={[wx, ICE_LEVEL + 0.05, wz]} onClick={handleClick}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 1.1, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 1.5 : 0.5}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    )
  }

  return (
    <group position={[wx, ICE_LEVEL + 0.05, wz]} onClick={handleClick}>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.7, 0.9, 2, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 1.8 : 0.7}
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
  selectedShotEventId,
  centerIceLogo,
  centerIceLogoWidthFt,
  centerIceLogoHeightFt,
}: ArenaSceneProps) {
  const innerRadiusX = RINK_LENGTH / 2 + 12
  const innerRadiusZ = RINK_WIDTH / 2 + 18
  const bowlOuterRadius = innerRadiusX + 18 * 4

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
      <GlassRing />
      <SeatingBowl innerRadiusX={innerRadiusX} innerRadiusZ={innerRadiusZ} />
      <LedRing radius={innerRadiusX - 4} height={BOARDS_HEIGHT + GLASS_HEIGHT + 1} />
      <ArenaRoof radius={bowlOuterRadius} height={BOARDS_HEIGHT + GLASS_HEIGHT + 60} />
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
            isSelected={selectedShotEventId === shot.eventId}
          />
        )
      })}
    </>
  )
}
