'use client'

import * as React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import {
  parseShotsFromEdge,
  filterShotsByTeam,
  filterShotsByPeriod,
  filterShotsByResult,
  getTeamRinkColorWithContrast,
  getPlayerName,
  type ShotEvent,
} from '@/lib/utils/shot-chart-utils'
import { formatTeamFullName, formatPeriodLabel } from '@/lib/utils/formatters'

import { ShotTooltip } from '../shot-chart/shot-tooltip'
import { VideoOverlay } from '../shot-chart/video-overlay'
import { ShotStatistics } from '../shot-chart/shot-statistics'
import { ArenaScene } from './arena-scene'

interface ShotChart3DProps {
  /** Complete NHL EDGE game data */

  gameData: any
  className?: string
  /** Center ice logo URL — drawn into the rink texture at center ice */
  centerIceLogo?: string
  /** Logo width in feet (default 33) */
  centerIceLogoWidthFt?: number
  /** Logo height in feet (default 30) */
  centerIceLogoHeightFt?: number
}

type CameraPreset = 'broadcast' | 'overhead' | 'home-bench' | 'corner'

const CAMERA_PRESETS: Record<CameraPreset, { position: [number, number, number]; target: [number, number, number]; label: string }> = {
  broadcast: {
    position: [0, 70, 130],
    target: [0, 0, 0],
    label: 'Broadcast',
  },
  overhead: {
    position: [0, 140, 60],
    target: [0, 0, 0],
    label: 'Overhead',
  },
  'home-bench': {
    position: [-40, 35, 95],
    target: [0, 0, 0],
    label: 'Home Bench',
  },
  corner: {
    position: [115, 40, 75],
    target: [40, 0, 0],
    label: 'Corner',
  },
}

export const ShotChart3D: React.FC<ShotChart3DProps> = ({
  gameData,
  className = '',
  centerIceLogo,
  centerIceLogoWidthFt,
  centerIceLogoHeightFt,
}) => {
  const allShots = useMemo(() => parseShotsFromEdge(gameData), [gameData])

  const [selectedTeam, setSelectedTeam] = useState<number | undefined>(undefined)
  const [selectedPeriod, setSelectedPeriod] = useState<number | undefined>(undefined)
  const [selectedResults, setSelectedResults] = useState<Array<'goal' | 'shot-on-goal' | 'missed-shot' | 'blocked-shot'>>([
    'goal',
    'shot-on-goal',
    'missed-shot',
    'blocked-shot',
  ])
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('broadcast')
  const [autoRotate, setAutoRotate] = useState(false)
  const [resetSignal, setResetSignal] = useState(0)
  const [showHelp, setShowHelp] = useState(false)

  const [hoveredShot, setHoveredShot] = useState<{
    shot: ShotEvent
    x: number
    y: number
    playerName: string
    teamLogo?: string
    teamName?: string
    teamAbbrev?: string
    teamColor?: string
    playerHeadshot?: string
    assistNames?: string[]
    goalieInNetName?: string
  } | null>(null)
  const [videoOverlay, setVideoOverlay] = useState<{ url: string; playerName: string; teamAbbrev?: string } | null>(null)

  const handleShotClick = (shot: ShotEvent, clientX: number, clientY: number) => {
    const playerName = shot.playerId ? getPlayerName(shot.playerId, gameData.rosterSpots || []) : 'Unknown'
    const team = shot.teamId === gameData.awayTeam?.id ? gameData.awayTeam : gameData.homeTeam
    const teamLogo = team?.logo || team?.darkLogo
    const teamName = team?.name?.default || team?.commonName?.default
    const teamAbbrev = team?.abbrev
    const teamColor = getTeamRinkColorWithContrast(
      gameData.homeTeam?.id,
      gameData.awayTeam?.id,
      shot.teamId
    )
    const player = (gameData.rosterSpots || []).find((spot: { playerId: number }) => spot.playerId === shot.playerId)
    const playerHeadshot = player?.headshot
    const assistNames = shot.assists
      ?.map((a) => getPlayerName(a.playerId, gameData.rosterSpots || []))
      .filter((n) => n !== 'Unknown')
    const goalieInNetName = shot.goalieInNetId ? getPlayerName(shot.goalieInNetId, gameData.rosterSpots || []) : undefined

    setHoveredShot({
      shot,
      x: clientX,
      y: clientY,
      playerName,
      teamLogo,
      teamName,
      teamAbbrev,
      teamColor,
      playerHeadshot,
      assistNames,
      goalieInNetName,
    })
  }

  const filteredShots = useMemo(() => {
    let s = allShots
    s = filterShotsByTeam(s, selectedTeam)
    s = filterShotsByPeriod(s, selectedPeriod)
    s = filterShotsByResult(s, selectedResults)
    return s
  }, [allShots, selectedTeam, selectedPeriod, selectedResults])

  const homeColor = getTeamRinkColorWithContrast(
    gameData.homeTeam?.id,
    gameData.awayTeam?.id,
    gameData.homeTeam?.id
  )
  const awayColor = getTeamRinkColorWithContrast(
    gameData.homeTeam?.id,
    gameData.awayTeam?.id,
    gameData.awayTeam?.id
  )
  const awayTeamName = gameData.awayTeam ? formatTeamFullName(gameData.awayTeam) : 'Away'
  const homeTeamName = gameData.homeTeam ? formatTeamFullName(gameData.homeTeam) : 'Home'

  const periods = useMemo(() => Array.from(new Set(allShots.map((s) => s.period))).sort((a, b) => a - b), [allShots])

  // Calculate statistics from all shot types (not filtered by result)
  const shotsForStats = useMemo(() => {
    return allShots.filter((shot) => {
      const teamMatch = selectedTeam === undefined || shot.teamId === selectedTeam
      const periodMatch = selectedPeriod === undefined || shot.period === selectedPeriod
      return teamMatch && periodMatch
    })
  }, [allShots, selectedTeam, selectedPeriod])

  // Check if any filters are active that affect stats (team or period filters)
  const hasActiveFilters = selectedTeam !== undefined || selectedPeriod !== undefined

  
  const preset = CAMERA_PRESETS[cameraPreset]
  const orbitRef = useRef<OrbitControlsImpl | null>(null)
  const initialCamera = useMemo(
    () => ({ position: CAMERA_PRESETS.broadcast.position, fov: 45, near: 0.5, far: 1000 }),
    []
  )

  const zoomBy = (delta: number) => {
    const controls = orbitRef.current
    if (!controls) return
    const distance = controls.getDistance()
    const next = Math.min(320, Math.max(40, distance + delta))
    const direction = new THREE.Vector3()
      .subVectors(controls.object.position, controls.target)
      .normalize()
    controls.object.position.copy(controls.target).add(direction.multiplyScalar(next))
    controls.update()
  }

  const orbitBy = (deltaTheta: number, deltaPhi: number) => {
    const controls = orbitRef.current
    if (!controls) return
    const offset = new THREE.Vector3().subVectors(controls.object.position, controls.target)
    const sph = new THREE.Spherical().setFromVector3(offset)
    sph.theta += deltaTheta
    sph.phi = Math.max(0.08, Math.min(Math.PI / 2 - 0.05, sph.phi + deltaPhi))
    offset.setFromSpherical(sph)
    controls.object.position.copy(controls.target).add(offset)
    controls.update()
  }

  const resetView = () => setResetSignal((n) => n + 1)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return
      }
      switch (e.key) {
        case 'r':
        case 'R':
          resetView()
          break
        case 'ArrowLeft':
          orbitBy(-Math.PI / 18, 0)
          e.preventDefault()
          break
        case 'ArrowRight':
          orbitBy(Math.PI / 18, 0)
          e.preventDefault()
          break
        case 'ArrowUp':
          orbitBy(0, -Math.PI / 36)
          e.preventDefault()
          break
        case 'ArrowDown':
          orbitBy(0, Math.PI / 36)
          e.preventDefault()
          break
        case '+':
        case '=':
          zoomBy(-20)
          break
        case '-':
        case '_':
          zoomBy(20)
          break
        case '?':
          setShowHelp((v) => !v)
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex flex-wrap gap-2 items-center text-sm">
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium whitespace-nowrap">Team:</label>
                <select
                  value={selectedTeam || ''}
                  onChange={(e) => setSelectedTeam(e.target.value ? Number(e.target.value) : undefined)}
                  className="px-3 py-1.5 rounded-md border bg-background text-sm cursor-pointer"
                >
                  <option value="">Both Teams</option>
                  <option value={gameData.awayTeam?.id}>{awayTeamName}</option>
                  <option value={gameData.homeTeam?.id}>{homeTeamName}</option>
                </select>
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium whitespace-nowrap">Period:</label>
                <select
                  value={selectedPeriod || ''}
                  onChange={(e) => setSelectedPeriod(e.target.value ? Number(e.target.value) : undefined)}
                  className="px-3 py-1.5 rounded-md border bg-background text-sm cursor-pointer"
                >
                  <option value="">All Periods</option>
                  {periods.map((p) => (
                    <option key={p} value={p}>
                      {formatPeriodLabel(p)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center text-sm">
              <label className="text-sm font-medium whitespace-nowrap">Show:</label>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedResults.includes('goal')}
                  onChange={(e) =>
                    setSelectedResults((r) => (e.target.checked ? [...r, 'goal'] : r.filter((x) => x !== 'goal')))
                  }
                  className="rounded w-4 h-4 cursor-pointer"
                />
                Goals
              </label>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedResults.includes('shot-on-goal')}
                  onChange={(e) =>
                    setSelectedResults((r) =>
                      e.target.checked ? [...r, 'shot-on-goal'] : r.filter((x) => x !== 'shot-on-goal')
                    )
                  }
                  className="rounded w-4 h-4 cursor-pointer"
                />
                Shots
              </label>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedResults.includes('missed-shot') || selectedResults.includes('blocked-shot')}
                  onChange={(e) =>
                    setSelectedResults((r) =>
                      e.target.checked
                        ? [...r, 'missed-shot', 'blocked-shot']
                        : r.filter((x) => x !== 'missed-shot' && x !== 'blocked-shot')
                    )
                  }
                  className="rounded w-4 h-4 cursor-pointer"
                />
                Miss/Block
              </label>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 items-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block w-3 h-3 border border-foreground/30"
                  style={{ backgroundColor: awayColor, transform: 'rotate(45deg)' }}
                  aria-hidden
                />
                {awayTeamName} (Away)
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block w-3 h-3 rounded-full border border-foreground/30"
                  style={{ backgroundColor: homeColor }}
                  aria-hidden
                />
                {homeTeamName} (Home)
              </span>
            </div>

            <div className="flex flex-wrap gap-2 items-center text-sm">
              <label className="text-sm font-medium whitespace-nowrap">Camera:</label>
              {(Object.keys(CAMERA_PRESETS) as CameraPreset[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setCameraPreset(key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                    cameraPreset === key
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {CAMERA_PRESETS[key].label}
                </button>
              ))}
            </div>
          </div>

                  </div>
      </div>

      <div className="relative w-full aspect-[16/9] portrait:min-h-[150px] landscape:min-h-[220px]">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={initialCamera}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          onPointerMissed={() => setHoveredShot(null)}
        >
          <OrbitControls
            ref={orbitRef}
            enableDamping
            dampingFactor={0.08}
            minDistance={40}
            maxDistance={320}
            maxPolarAngle={Math.PI / 2 - 0.05}
            autoRotate={autoRotate}
            autoRotateSpeed={0.4}
            makeDefault
          />
          <CameraRig preset={preset} controlsRef={orbitRef} resetSignal={resetSignal} />
          <ArenaScene
            shots={filteredShots}
            homeTeamId={gameData.homeTeam?.id}
            awayTeamId={gameData.awayTeam?.id}
            homeColor={homeColor}
            awayColor={awayColor}
            onShotClick={handleShotClick}
            selectedShotEventId={hoveredShot?.shot.eventId}
            centerIceLogo={centerIceLogo}
            centerIceLogoWidthFt={centerIceLogoWidthFt}
            centerIceLogoHeightFt={centerIceLogoHeightFt}
          />
        </Canvas>

        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs font-semibold pointer-events-none">
          Sploosh.AI Arena
          <span className="block text-[10px] font-normal opacity-70">Drag to orbit · scroll to zoom · ? for help</span>
        </div>
        
        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10">
          {/* Mobile: Compact layout */}
          <div className="sm:hidden flex items-center gap-1">
            <button onClick={resetView} className="w-7 h-7 flex items-center justify-center rounded border border-white/15 bg-black/55 text-white text-xs hover:bg-black/80 active:scale-95 transition" title="Reset view (R)" aria-label="Reset view">
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 8a6 6 0 1 0 1.76-4.24" />
                <path d="M2 2v4h4" />
              </svg>
            </button>
            <button onClick={() => orbitBy(-Math.PI / 18, 0)} className="w-7 h-7 flex items-center justify-center rounded border border-white/15 bg-black/55 text-white text-xs hover:bg-black/80 active:scale-95 transition" title="Orbit left (←)" aria-label="Orbit left">
              <span className="text-xs">←</span>
            </button>
            <button onClick={() => orbitBy(0, -Math.PI / 36)} className="w-7 h-7 flex items-center justify-center rounded border border-white/15 bg-black/55 text-white text-xs hover:bg-black/80 active:scale-95 transition" title="Tilt up (↑)" aria-label="Tilt up">
              <span className="text-xs">↑</span>
            </button>
            <button onClick={() => orbitBy(0, Math.PI / 36)} className="w-7 h-7 flex items-center justify-center rounded border border-white/15 bg-black/55 text-white text-xs hover:bg-black/80 active:scale-95 transition" title="Tilt down (↓)" aria-label="Tilt down">
              <span className="text-xs">↓</span>
            </button>
            <button onClick={() => orbitBy(Math.PI / 18, 0)} className="w-7 h-7 flex items-center justify-center rounded border border-white/15 bg-black/55 text-white text-xs hover:bg-black/80 active:scale-95 transition" title="Orbit right (→)" aria-label="Orbit right">
              <span className="text-xs">→</span>
            </button>
            <button onClick={() => zoomBy(-20)} className="w-7 h-7 flex items-center justify-center rounded border border-white/15 bg-black/55 text-white text-xs hover:bg-black/80 active:scale-95 transition" title="Zoom in (+)" aria-label="Zoom in">
              <span className="text-xs">+</span>
            </button>
            <button onClick={() => zoomBy(20)} className="w-7 h-7 flex items-center justify-center rounded border border-white/15 bg-black/55 text-white text-xs hover:bg-black/80 active:scale-95 transition" title="Zoom out (−)" aria-label="Zoom out">
              <span className="text-xs">−</span>
            </button>
            <button
              onClick={() => setAutoRotate((v) => !v)}
              className={`w-7 h-7 flex items-center justify-center rounded border ${autoRotate ? 'border-primary bg-primary text-primary-foreground' : 'border-white/15 bg-black/55 text-white'} text-xs hover:bg-black/80 active:scale-95 transition`}
              title={autoRotate ? 'Stop auto-rotate' : 'Start auto-rotate'}
              aria-label={autoRotate ? 'Stop auto-rotate' : 'Start auto-rotate'}
              aria-pressed={autoRotate}
            >
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 8a5.5 5.5 0 0 1 9.5-3.8" />
                <path d="M13.5 8a5.5 5.5 0 0 1-9.5 3.8" />
                <path d="M12 1.5v3h-3" />
                <path d="M4 14.5v-3h3" />
              </svg>
            </button>
            <button onClick={() => setShowHelp((v) => !v)} className="w-7 h-7 flex items-center justify-center rounded border border-white/15 bg-black/55 text-white text-xs hover:bg-black/80 active:scale-95 transition" title="Show help (?)" aria-label="Show help">
              <span className="text-xs">?</span>
            </button>
          </div>

          {/* Desktop: Horizontal layout */}
          <div className="hidden sm:flex items-center gap-1">
            <button onClick={resetView} className="w-8 h-8 flex items-center justify-center rounded-md border border-white/15 bg-black/55 text-white text-sm hover:bg-black/80 active:scale-95 transition" title="Reset view (R)" aria-label="Reset view">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 8a6 6 0 1 0 1.76-4.24" />
                <path d="M2 2v4h4" />
              </svg>
            </button>
            <div className="w-px h-5 bg-white/15 mx-0.5" aria-hidden />
            <button onClick={() => orbitBy(-Math.PI / 18, 0)} className="w-8 h-8 flex items-center justify-center rounded-md border border-white/15 bg-black/55 text-white text-sm hover:bg-black/80 active:scale-95 transition" title="Orbit left (←)" aria-label="Orbit left">
              <span>←</span>
            </button>
            <button onClick={() => orbitBy(0, -Math.PI / 36)} className="w-8 h-8 flex items-center justify-center rounded-md border border-white/15 bg-black/55 text-white text-sm hover:bg-black/80 active:scale-95 transition" title="Tilt up (↑)" aria-label="Tilt up">
              <span>↑</span>
            </button>
            <button onClick={() => orbitBy(0, Math.PI / 36)} className="w-8 h-8 flex items-center justify-center rounded-md border border-white/15 bg-black/55 text-white text-sm hover:bg-black/80 active:scale-95 transition" title="Tilt down (↓)" aria-label="Tilt down">
              <span>↓</span>
            </button>
            <button onClick={() => orbitBy(Math.PI / 18, 0)} className="w-8 h-8 flex items-center justify-center rounded-md border border-white/15 bg-black/55 text-white text-sm hover:bg-black/80 active:scale-95 transition" title="Orbit right (→)" aria-label="Orbit right">
              <span>→</span>
            </button>
            <div className="w-px h-5 bg-white/15 mx-0.5" aria-hidden />
            <button onClick={() => zoomBy(-20)} className="w-8 h-8 flex items-center justify-center rounded-md border border-white/15 bg-black/55 text-white text-sm hover:bg-black/80 active:scale-95 transition" title="Zoom in (+)" aria-label="Zoom in">
              <span>+</span>
            </button>
            <button onClick={() => zoomBy(20)} className="w-8 h-8 flex items-center justify-center rounded-md border border-white/15 bg-black/55 text-white text-sm hover:bg-black/80 active:scale-95 transition" title="Zoom out (−)" aria-label="Zoom out">
              <span>−</span>
            </button>
            <div className="w-px h-5 bg-white/15 mx-0.5" aria-hidden />
            <button
              onClick={() => setAutoRotate((v) => !v)}
              className={`w-8 h-8 flex items-center justify-center rounded-md border ${autoRotate ? 'border-primary bg-primary text-primary-foreground' : 'border-white/15 bg-black/55 text-white'} text-sm hover:bg-black/80 active:scale-95 transition`}
              title={autoRotate ? 'Stop auto-rotate' : 'Start auto-rotate'}
              aria-label={autoRotate ? 'Stop auto-rotate' : 'Start auto-rotate'}
              aria-pressed={autoRotate}
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 8a5.5 5.5 0 0 1 9.5-3.8" />
                <path d="M13.5 8a5.5 5.5 0 0 1-9.5 3.8" />
                <path d="M12 1.5v3h-3" />
                <path d="M4 14.5v-3h3" />
              </svg>
            </button>
            <button onClick={() => setShowHelp((v) => !v)} className="w-8 h-8 flex items-center justify-center rounded-md border border-white/15 bg-black/55 text-white text-sm hover:bg-black/80 active:scale-95 transition" title="Show help (?)" aria-label="Show help">
              <span>?</span>
            </button>
          </div>
        </div>

        {showHelp && (
          <div
            className="absolute bottom-16 right-3 max-w-xs px-4 py-3 rounded-lg bg-black/85 backdrop-blur-sm text-white text-xs shadow-lg border border-white/10"
            role="dialog"
            aria-label="3D arena controls help"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="font-semibold text-sm">Controls</div>
              <button
                onClick={() => setShowHelp(false)}
                className="text-white/60 hover:text-white text-base leading-none"
                aria-label="Close help"
              >
                ×
              </button>
            </div>
            <ul className="space-y-1 text-white/80">
              <li><span className="font-medium text-white">Drag</span> to orbit</li>
              <li><span className="font-medium text-white">Scroll / pinch</span> to zoom</li>
              <li><span className="font-medium text-white">Right-drag</span> to pan</li>
              <li><span className="font-medium text-white">Arrow keys</span> orbit / tilt</li>
              <li><span className="font-medium text-white">+ / −</span> zoom in / out</li>
              <li><span className="font-medium text-white">R</span> reset view</li>
              <li><span className="font-medium text-white">?</span> toggle this help</li>
            </ul>
          </div>
        )}

        {hoveredShot && (
          <ShotTooltip
            shot={hoveredShot.shot}
            playerName={hoveredShot.playerName}
            teamLogo={hoveredShot.teamLogo}
            teamName={hoveredShot.teamName}
            teamAbbrev={hoveredShot.teamAbbrev}
            teamColor={hoveredShot.teamColor}
            playerHeadshot={hoveredShot.playerHeadshot}
            assistNames={hoveredShot.assistNames}
            goalieInNetName={hoveredShot.goalieInNetName}
            gameData={gameData}
            onWatchReplay={() => {
              if (hoveredShot.shot.highlightClipId) {
                const embedUrl = `https://players.brightcove.net/6415718365001/EXtG1xJ7H_default/index.html?videoId=${hoveredShot.shot.highlightClipId}`
                setVideoOverlay({ url: embedUrl, playerName: hoveredShot.playerName, teamAbbrev: hoveredShot.teamAbbrev })
              }
            }}
            visible={true}
            x={hoveredShot.x}
            y={hoveredShot.y}
            onMouseEnter={() => {}}
            onMouseLeave={() => {}}
            onDismiss={() => setHoveredShot(null)}
          />
        )}

        {videoOverlay && (
          <VideoOverlay
            videoUrl={videoOverlay.url}
            playerName={videoOverlay.playerName}
            teamAbbrev={videoOverlay.teamAbbrev}
            onClose={() => setVideoOverlay(null)}
          />
        )}
      </div>

      {/* Statistics - Shared component */}
      <ShotStatistics 
        gameData={gameData}
        shotsForStats={shotsForStats}
        hasActiveFilters={hasActiveFilters}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4"
      />
    </div>
  )
}

interface CameraRigProps {
  preset: { position: [number, number, number]; target: [number, number, number] }
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  resetSignal?: number
}

function CameraRig({ preset, controlsRef, resetSignal }: CameraRigProps) {
  const camera = useThree((s) => s.camera)
  const invalidate = useThree((s) => s.invalidate)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    const fromPos = camera.position.clone()
    const toPos = new THREE.Vector3(...preset.position)
    const fromTarget = controls.target.clone()
    const toTarget = new THREE.Vector3(...preset.target)
    const start = performance.now()
    const duration = 600

    camera.up.set(0, 1, 0)

    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      camera.position.lerpVectors(fromPos, toPos, eased)
      controls.target.lerpVectors(fromTarget, toTarget, eased)
      controls.update()
      invalidate()
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = null
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [preset, resetSignal, camera, controlsRef, invalidate])

  return null
}
