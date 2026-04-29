import * as THREE from 'three'

const TEXTURE_PX_PER_FOOT = 16
const RINK_LENGTH_FT = 200
const RINK_WIDTH_FT = 85

const RED = '#cc3333'
const BLUE = '#3366cc'
const ICE = '#f4faff'
const CREASE_FILL = 'rgba(150, 200, 255, 0.55)'
const LINE_THIN = 2 / 12

interface RinkTextureOptions {
  centerLogo?: HTMLImageElement | null
  centerLogoWidthFt?: number
  centerLogoHeightFt?: number
}

export function createRinkTexture(opts: RinkTextureOptions = {}): THREE.CanvasTexture {
  const w = RINK_LENGTH_FT * TEXTURE_PX_PER_FOOT
  const h = RINK_WIDTH_FT * TEXTURE_PX_PER_FOOT
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  const ftToPx = (ft: number) => ft * TEXTURE_PX_PER_FOOT
  const x = (nhlX: number) => ftToPx(nhlX + 100)
  const y = (nhlY: number) => ftToPx(42.5 - nhlY)

  ctx.fillStyle = ICE
  ctx.fillRect(0, 0, w, h)

  const grad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w / 2)
  grad.addColorStop(0, 'rgba(255,255,255,0.55)')
  grad.addColorStop(1, 'rgba(200,225,245,0.2)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  drawGoalTrapezoids(ctx, x, y, ftToPx)

  if (opts.centerLogo) {
    const logoW = ftToPx(opts.centerLogoWidthFt ?? 33)
    const logoH = ftToPx(opts.centerLogoHeightFt ?? 30)
    ctx.save()
    ctx.globalAlpha = 0.85
    ctx.drawImage(opts.centerLogo, x(0) - logoW / 2, y(0) - logoH / 2, logoW, logoH)
    ctx.restore()
  }

  drawCenterLine(ctx, x, y, ftToPx)

  ctx.strokeStyle = BLUE
  ctx.lineWidth = ftToPx(1)
  line(ctx, x(-25), y(42.5), x(-25), y(-42.5))
  line(ctx, x(25), y(42.5), x(25), y(-42.5))

  ctx.strokeStyle = RED
  ctx.lineWidth = ftToPx(LINE_THIN)
  line(ctx, x(-89), y(42.5), x(-89), y(-42.5))
  line(ctx, x(89), y(42.5), x(89), y(-42.5))

  drawCenterIceCircle(ctx, x, y, ftToPx)
  drawRefereeCrease(ctx, x, y, ftToPx)

  drawEndFaceoffCircle(ctx, x, y, ftToPx, -69, 22)
  drawEndFaceoffCircle(ctx, x, y, ftToPx, -69, -22)
  drawEndFaceoffCircle(ctx, x, y, ftToPx, 69, 22)
  drawEndFaceoffCircle(ctx, x, y, ftToPx, 69, -22)

  drawNeutralFaceoffSpot(ctx, x, y, ftToPx, -20, 22)
  drawNeutralFaceoffSpot(ctx, x, y, ftToPx, -20, -22)
  drawNeutralFaceoffSpot(ctx, x, y, ftToPx, 20, 22)
  drawNeutralFaceoffSpot(ctx, x, y, ftToPx, 20, -22)

  drawGoalieCrease(ctx, x, y, ftToPx, 89)
  drawGoalieCrease(ctx, x, y, ftToPx, -89)

  // 3D goals are now rendered separately, so we don't need the 2D goal drawing

  ctx.strokeStyle = 'rgba(0,0,0,0.25)'
  ctx.lineWidth = ftToPx(0.6)
  drawRinkBoundary(ctx, x, y, ftToPx)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function drawCenterLine(
  ctx: CanvasRenderingContext2D,
  x: (n: number) => number,
  y: (n: number) => number,
  ftToPx: (n: number) => number
) {
  const barWidthFt = 1
  const barX = x(0) - ftToPx(barWidthFt) / 2
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(barX, y(42.5), ftToPx(barWidthFt), y(-42.5) - y(42.5))

  ctx.fillStyle = '#ffffff'
  const dashHeightFt = 1.34
  const periodFt = 3.7
  const startNhlY = 42.5 - 0.6
  for (let yPos = startNhlY; yPos > -42.5; yPos -= periodFt) {
    const yPx = y(yPos) - ftToPx(dashHeightFt) / 2
    ctx.fillRect(barX, yPx, ftToPx(barWidthFt), ftToPx(dashHeightFt))
  }
}

function drawCenterIceCircle(
  ctx: CanvasRenderingContext2D,
  x: (n: number) => number,
  y: (n: number) => number,
  ftToPx: (n: number) => number
) {
  ctx.strokeStyle = BLUE
  ctx.lineWidth = ftToPx(LINE_THIN)
  ctx.beginPath()
  ctx.arc(x(0), y(0), ftToPx(15), 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = BLUE
  ctx.beginPath()
  ctx.arc(x(0), y(0), ftToPx(0.5), 0, Math.PI * 2)
  ctx.fill()
}

function drawRefereeCrease(
  ctx: CanvasRenderingContext2D,
  x: (n: number) => number,
  y: (n: number) => number,
  ftToPx: (n: number) => number
) {
  ctx.strokeStyle = RED
  ctx.lineWidth = ftToPx(LINE_THIN)
  ctx.beginPath()
  ctx.arc(x(0), y(-42.5), ftToPx(10), Math.PI, Math.PI * 2)
  ctx.stroke()
}

function drawEndFaceoffCircle(
  ctx: CanvasRenderingContext2D,
  x: (n: number) => number,
  y: (n: number) => number,
  ftToPx: (n: number) => number,
  cx: number,
  cy: number
) {
  ctx.strokeStyle = RED
  ctx.lineWidth = ftToPx(LINE_THIN)
  ctx.beginPath()
  ctx.arc(x(cx), y(cy), ftToPx(15), 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = RED
  ctx.beginPath()
  ctx.arc(x(cx), y(cy), ftToPx(1), 0, Math.PI * 2)
  ctx.fill()

  drawFaceoffLMarks(ctx, x, y, ftToPx, cx, cy)
  drawFaceoffHashMarks(ctx, x, y, ftToPx, cx, cy)
}

function drawFaceoffLMarks(
  ctx: CanvasRenderingContext2D,
  x: (n: number) => number,
  y: (n: number) => number,
  ftToPx: (n: number) => number,
  cx: number,
  cy: number
) {
  ctx.strokeStyle = RED
  ctx.lineWidth = ftToPx(LINE_THIN)

  const cornerOffX = 25 / 12
  const cornerOffY = 10 / 12
  const horizLen = 48 / 12
  const vertLen = 36 / 12

  const corners: Array<{ sx: 1 | -1; sy: 1 | -1 }> = [
    { sx: -1, sy: 1 },
    { sx: 1, sy: 1 },
    { sx: -1, sy: -1 },
    { sx: 1, sy: -1 },
  ]

  corners.forEach(({ sx, sy }) => {
    const cornerX = cx + sx * cornerOffX
    const cornerY = cy + sy * cornerOffY
    line(ctx, x(cornerX), y(cornerY), x(cornerX + sx * horizLen), y(cornerY))
    line(ctx, x(cornerX), y(cornerY), x(cornerX), y(cornerY + sy * vertLen))
  })
}

function drawFaceoffHashMarks(
  ctx: CanvasRenderingContext2D,
  x: (n: number) => number,
  y: (n: number) => number,
  ftToPx: (n: number) => number,
  cx: number,
  cy: number
) {
  ctx.strokeStyle = RED
  ctx.lineWidth = ftToPx(LINE_THIN)
  const r = 15
  const hashLen = 2
  const halfSpan = (5 + 7 / 12) / 2

  ;[1, -1].forEach((side) => {
    const hx = cx + side * halfSpan
    const topInner = cy + r - 0.3
    line(ctx, x(hx), y(topInner), x(hx), y(topInner + hashLen))
    const bottomInner = cy - r + 0.3
    line(ctx, x(hx), y(bottomInner), x(hx), y(bottomInner - hashLen))
  })
}

function drawNeutralFaceoffSpot(
  ctx: CanvasRenderingContext2D,
  x: (n: number) => number,
  y: (n: number) => number,
  ftToPx: (n: number) => number,
  cx: number,
  cy: number
) {
  ctx.fillStyle = RED
  ctx.beginPath()
  ctx.arc(x(cx), y(cy), ftToPx(1), 0, Math.PI * 2)
  ctx.fill()
}

function drawGoalieCrease(
  ctx: CanvasRenderingContext2D,
  x: (n: number) => number,
  y: (n: number) => number,
  ftToPx: (n: number) => number,
  goalX: number
) {
  const dir = goalX > 0 ? -1 : 1
  const sideLen = 1.5
  const arcDepth = 6

  ctx.fillStyle = CREASE_FILL
  ctx.strokeStyle = RED
  ctx.lineWidth = ftToPx(LINE_THIN)

  ctx.beginPath()
  ctx.moveTo(x(goalX), y(4))
  ctx.lineTo(x(goalX + dir * sideLen), y(4))
  ctx.quadraticCurveTo(
    x(goalX + dir * arcDepth),
    y(0),
    x(goalX + dir * sideLen),
    y(-4)
  )
  ctx.lineTo(x(goalX), y(-4))
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  ctx.strokeStyle = RED
  ctx.lineWidth = ftToPx(LINE_THIN)
  ;[1, -1].forEach((sign) => {
    const innerX = goalX + dir * 4
    const innerY = sign * (4 - 5 / 12)
    line(ctx, x(innerX), y(innerY), x(innerX), y(innerY + sign * (5 / 12)))
    line(ctx, x(innerX), y(innerY), x(innerX - dir * (5 / 12)), y(innerY))
  })
}

function drawGoalTrapezoids(
  ctx: CanvasRenderingContext2D,
  x: (n: number) => number,
  y: (n: number) => number,
  ftToPx: (n: number) => number
) {
  ctx.strokeStyle = RED
  ctx.lineWidth = ftToPx(LINE_THIN)
  ;[1, -1].forEach((dir) => {
    const goalLineX = dir * 89
    const endX = dir * 100
    ctx.beginPath()
    ctx.moveTo(x(goalLineX), y(-5.5))
    ctx.lineTo(x(endX), y(-14))
    ctx.moveTo(x(goalLineX), y(5.5))
    ctx.lineTo(x(endX), y(14))
    ctx.stroke()
  })
}


function drawRinkBoundary(
  ctx: CanvasRenderingContext2D,
  x: (n: number) => number,
  y: (n: number) => number,
  ftToPx: (n: number) => number
) {
  const r = ftToPx(28)
  ctx.beginPath()
  ctx.moveTo(x(-72), y(42.5))
  ctx.lineTo(x(72), y(42.5))
  ctx.arcTo(x(100), y(42.5), x(100), y(14.5), r)
  ctx.arcTo(x(100), y(-42.5), x(72), y(-42.5), r)
  ctx.lineTo(x(-72), y(-42.5))
  ctx.arcTo(x(-100), y(-42.5), x(-100), y(-14.5), r)
  ctx.arcTo(x(-100), y(42.5), x(-72), y(42.5), r)
  ctx.closePath()
  ctx.stroke()
}
