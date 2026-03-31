'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

interface KineticHeroProps {
  text: string
  className?: string
}

interface LineData {
  text: string
  width: number
  x: number
  y: number
}

interface LinePhysics {
  y: number
  velocity: number
  settled: boolean
}

export function KineticHero({ text, className }: KineticHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const linesRef = useRef<LineData[]>([])
  const physicsRef = useRef<LinePhysics[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const parallaxRef = useRef<number[]>([])
  const animFrameRef = useRef<number>(0)
  const [phase, setPhase] = useState<'idle' | 'dropping' | 'parallax' | 'settled'>('idle')
  const prefersReducedMotion = useRef(false)

  const getFontString = useCallback((el: HTMLElement) => {
    const computed = getComputedStyle(el)
    return {
      font: `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`,
      fontSize: parseFloat(computed.fontSize),
      lineHeight: parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 0.95,
    }
  }, [])

  const measureLines = useCallback((container: HTMLElement): LineData[] => {
    const { font, fontSize, lineHeight } = getFontString(container)
    const width = container.clientWidth
    const upperText = text.toUpperCase()

    const prepared = prepareWithSegments(upperText, font)
    const result = layoutWithLines(prepared, width, lineHeight)

    return result.lines.map((line, i) => ({
      text: line.text,
      width: line.width,
      x: (width - line.width) / 2,
      y: i * lineHeight,
    }))
  }, [text, getFontString])

  const drawLines = useCallback((
    ctx: CanvasRenderingContext2D,
    lines: LineData[],
    offsets: { y: number; x: number }[],
    dpr: number,
  ) => {
    const canvas = ctx.canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.scale(dpr, dpr)

    const container = containerRef.current
    if (!container) return
    const { font, lineHeight } = getFontString(container)

    ctx.font = font
    ctx.fillStyle = '#000000'
    ctx.textBaseline = 'top'

    lines.forEach((line, i) => {
      const offset = offsets[i] || { y: 0, x: 0 }
      ctx.fillText(line.text, line.x + offset.x, line.y + offset.y)
    })

    ctx.restore()
  }, [getFontString])

  // Main setup and animation
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const setup = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const lines = measureLines(container)
      linesRef.current = lines

      if (prefersReducedMotion.current) {
        // No animation — draw immediately and settle
        drawLines(ctx, lines, lines.map(() => ({ y: 0, x: 0 })), dpr)
        setPhase('settled')
        return
      }

      // Initialize physics — each line starts above the canvas
      physicsRef.current = lines.map((_, i) => ({
        y: -(rect.height + i * 60 + 100), // stagger start positions
        velocity: 0,
        settled: false,
      }))
      parallaxRef.current = lines.map(() => 0)

      setPhase('dropping')

      // Gravity drop animation
      const gravity = 1.8
      const damping = 0.35
      const settleThreshold = 0.5

      const animate = () => {
        const physics = physicsRef.current
        let allSettled = true

        physics.forEach((p) => {
          if (p.settled) return
          allSettled = false

          p.velocity += gravity
          p.y += p.velocity

          // Bounce when hitting target (y=0 is the rest position)
          if (p.y >= 0) {
            p.y = 0
            p.velocity = -p.velocity * damping

            if (Math.abs(p.velocity) < settleThreshold) {
              p.y = 0
              p.velocity = 0
              p.settled = true
            }
          }
        })

        const offsets = physics.map((p) => ({ y: p.y, x: 0 }))
        drawLines(ctx, lines, offsets, dpr)

        if (allSettled) {
          setPhase('parallax')
          return
        }

        animFrameRef.current = requestAnimationFrame(animate)
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    document.fonts.ready.then(setup)

    // Resize handling
    const resizeObserver = new ResizeObserver(() => {
      document.fonts.ready.then(() => {
        const dpr = window.devicePixelRatio || 1
        const rect = container.getBoundingClientRect()
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        canvas.style.width = `${rect.width}px`
        canvas.style.height = `${rect.height}px`

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const lines = measureLines(container)
        linesRef.current = lines
        drawLines(ctx, lines, lines.map(() => ({ y: 0, x: 0 })), dpr)
      })
    })
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      resizeObserver.disconnect()
    }
  }, [text, measureLines, drawLines])

  // Mouse parallax effect
  useEffect(() => {
    if (phase !== 'parallax') return

    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const lerpFactor = 0.08
    const maxShift = 8
    const currentOffsets = linesRef.current.map(() => 0)

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      mouseRef.current.x = (e.clientX - centerX) / (rect.width / 2) // -1 to 1
    }

    const animateParallax = () => {
      const lines = linesRef.current
      let needsUpdate = false

      lines.forEach((_, i) => {
        const depth = (i + 1) / lines.length
        const target = mouseRef.current.x * maxShift * depth
        const diff = target - currentOffsets[i]

        if (Math.abs(diff) > 0.01) {
          currentOffsets[i] += diff * lerpFactor
          needsUpdate = true
        }
      })

      if (needsUpdate) {
        const offsets = lines.map((_, i) => ({ y: 0, x: currentOffsets[i] }))
        drawLines(ctx, lines, offsets, dpr)
      }

      animFrameRef.current = requestAnimationFrame(animateParallax)
    }

    window.addEventListener('mousemove', onMouseMove)
    animFrameRef.current = requestAnimationFrame(animateParallax)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [phase, drawLines])

  return (
    <div className={`relative ${className || ''}`} ref={containerRef}>
      {/* SEO fallback — always in DOM for crawlers */}
      <h1
        className={`${className || ''} ${phase !== 'idle' ? 'invisible' : ''}`}
        aria-hidden={phase !== 'idle'}
      >
        {text}
      </h1>

      {/* Canvas overlay */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 ${phase === 'idle' ? 'invisible' : ''}`}
        aria-hidden="true"
      />

      {/* Screen reader text */}
      {phase !== 'idle' && (
        <span className="sr-only" role="heading" aria-level={1}>
          {text}
        </span>
      )}
    </div>
  )
}
