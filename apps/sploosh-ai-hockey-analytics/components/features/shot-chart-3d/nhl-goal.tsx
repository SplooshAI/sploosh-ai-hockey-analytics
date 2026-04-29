'use client'

import * as React from 'react'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const GOAL_WIDTH_FT = 6
const GOAL_HEIGHT_FT = 4
const GOAL_DEPTH_FT = 4
const POST_RADIUS_FT = 0.078125 // 1.875 inches = 0.078125 feet
const CROSSBAR_RADIUS_FT = 0.078125 // 1.875 inches = 0.078125 feet
const NET_THICKNESS = 0.02

const POST_COLOR = '#ff3333'
const NET_COLOR = '#ffffff'
const NET_OPACITY = 0.35

interface NHLGoalProps {
  position: [number, number, number]
  rotation?: [number, number, number]
}

export function NHLGoal({ position, rotation = [0, 0, 0] }: NHLGoalProps) {
  const meshRef = useRef<THREE.Group>(null)
  
  const goalGeometry = useMemo(() => {
    const group = new THREE.Group()

    // Goal posts (vertical)
    const postGeometry = new THREE.CylinderGeometry(POST_RADIUS_FT, POST_RADIUS_FT, GOAL_HEIGHT_FT, 12)
    const postMaterial = new THREE.MeshStandardMaterial({
      color: POST_COLOR,
      roughness: 0.3,
      metalness: 0.7
    })

    // Left post
    const leftPost = new THREE.Mesh(postGeometry, postMaterial)
    leftPost.position.set(-GOAL_WIDTH_FT / 2, GOAL_HEIGHT_FT / 2, 0)
    group.add(leftPost)

    // Right post
    const rightPost = new THREE.Mesh(postGeometry, postMaterial)
    rightPost.position.set(GOAL_WIDTH_FT / 2, GOAL_HEIGHT_FT / 2, 0)
    group.add(rightPost)

    // Crossbar (horizontal)
    const crossbarGeometry = new THREE.CylinderGeometry(CROSSBAR_RADIUS_FT, CROSSBAR_RADIUS_FT, GOAL_WIDTH_FT, 12)
    const crossbar = new THREE.Mesh(crossbarGeometry, postMaterial)
    crossbar.rotation.z = Math.PI / 2
    crossbar.position.set(0, GOAL_HEIGHT_FT, 0)
    group.add(crossbar)

    // Net backing
    const netBackingGeometry = new THREE.BoxGeometry(GOAL_WIDTH_FT, GOAL_HEIGHT_FT, NET_THICKNESS)
    const netMaterial = new THREE.MeshStandardMaterial({
      color: NET_COLOR,
      transparent: true,
      opacity: NET_OPACITY,
      roughness: 0.8,
      metalness: 0.1
    })
    const netBacking = new THREE.Mesh(netBackingGeometry, netMaterial)
    netBacking.position.set(0, GOAL_HEIGHT_FT / 2, -GOAL_DEPTH_FT / 2)
    group.add(netBacking)

    // Net top
    const netTopGeometry = new THREE.BoxGeometry(GOAL_WIDTH_FT, NET_THICKNESS, GOAL_DEPTH_FT)
    const netTop = new THREE.Mesh(netTopGeometry, netMaterial)
    netTop.position.set(0, GOAL_HEIGHT_FT, -GOAL_DEPTH_FT / 2)
    group.add(netTop)

    // Net bottom
    const netBottomGeometry = new THREE.BoxGeometry(GOAL_WIDTH_FT, NET_THICKNESS, GOAL_DEPTH_FT)
    const netBottom = new THREE.Mesh(netBottomGeometry, netMaterial)
    netBottom.position.set(0, 0, -GOAL_DEPTH_FT / 2)
    group.add(netBottom)

    // Net left side
    const netLeftGeometry = new THREE.BoxGeometry(NET_THICKNESS, GOAL_HEIGHT_FT, GOAL_DEPTH_FT)
    const netLeft = new THREE.Mesh(netLeftGeometry, netMaterial)
    netLeft.position.set(-GOAL_WIDTH_FT / 2, GOAL_HEIGHT_FT / 2, -GOAL_DEPTH_FT / 2)
    group.add(netLeft)

    // Net right side
    const netRightGeometry = new THREE.BoxGeometry(NET_THICKNESS, GOAL_HEIGHT_FT, GOAL_DEPTH_FT)
    const netRight = new THREE.Mesh(netRightGeometry, netMaterial)
    netRight.position.set(GOAL_WIDTH_FT / 2, GOAL_HEIGHT_FT / 2, -GOAL_DEPTH_FT / 2)
    group.add(netRight)

    // Create net mesh pattern using lines
    const netLineMaterial = new THREE.LineBasicMaterial({
      color: NET_COLOR,
      transparent: true,
      opacity: 0.6
    })

    // Vertical net lines
    const vLineCount = 8
    const hLineCount = 6
    const dLineCount = 4

    for (let i = 0; i <= vLineCount; i++) {
      const x = -GOAL_WIDTH_FT / 2 + (GOAL_WIDTH_FT / vLineCount) * i
      for (let j = 0; j <= hLineCount; j++) {
        const y = (GOAL_HEIGHT_FT / hLineCount) * j
        
        // Front to back lines
        const points = []
        points.push(new THREE.Vector3(x, y, 0))
        points.push(new THREE.Vector3(x, y, -GOAL_DEPTH_FT))
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
        const line = new THREE.Line(lineGeometry, netLineMaterial)
        group.add(line)
      }
    }

    // Horizontal net lines
    for (let i = 0; i <= hLineCount; i++) {
      const y = (GOAL_HEIGHT_FT / hLineCount) * i
      for (let j = 0; j <= vLineCount; j++) {
        const x = -GOAL_WIDTH_FT / 2 + (GOAL_WIDTH_FT / vLineCount) * j
        
        // Front to back lines
        const points = []
        points.push(new THREE.Vector3(x, y, 0))
        points.push(new THREE.Vector3(x, y, -GOAL_DEPTH_FT))
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
        const line = new THREE.Line(lineGeometry, netLineMaterial)
        group.add(line)
      }
    }

    // Diagonal net lines for depth
    for (let i = 0; i <= dLineCount; i++) {
      const x = -GOAL_WIDTH_FT / 2 + (GOAL_WIDTH_FT / dLineCount) * i
      
      // Top diagonal
      const topPoints = []
      topPoints.push(new THREE.Vector3(x, GOAL_HEIGHT_FT, 0))
      topPoints.push(new THREE.Vector3(x, GOAL_HEIGHT_FT / 2, -GOAL_DEPTH_FT))
      const topLineGeometry = new THREE.BufferGeometry().setFromPoints(topPoints)
      const topLine = new THREE.Line(topLineGeometry, netLineMaterial)
      group.add(topLine)

      // Bottom diagonal
      const bottomPoints = []
      bottomPoints.push(new THREE.Vector3(x, 0, 0))
      bottomPoints.push(new THREE.Vector3(x, GOAL_HEIGHT_FT / 2, -GOAL_DEPTH_FT))
      const bottomLineGeometry = new THREE.BufferGeometry().setFromPoints(bottomPoints)
      const bottomLine = new THREE.Line(bottomLineGeometry, netLineMaterial)
      group.add(bottomLine)
    }

    return group
  }, [])

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle animation for net movement
      const time = state.clock.getElapsedTime()
      const sway = Math.sin(time * 0.5) * 0.002
      meshRef.current.rotation.z = sway
    }
  })

  return (
    <group ref={meshRef} position={position} rotation={rotation}>
      <primitive object={goalGeometry} />
    </group>
  )
}
