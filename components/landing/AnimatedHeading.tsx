'use client'

import { useRef, useState, useEffect } from 'react'
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

interface AnimatedHeadingProps {
  text: string
  className?: string
}

export function AnimatedHeading({ text, className }: AnimatedHeadingProps) {
  const containerRef = useRef<HTMLHeadingElement>(null)
  const [lines, setLines] = useState<string[] | null>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const measure = () => {
      const computed = getComputedStyle(el)
      const font = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`
      const width = el.clientWidth
      const lineHeightPx = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 0.95

      // Must uppercase to match CSS text-transform: uppercase on headings
      const prepared = prepareWithSegments(text.toUpperCase(), font)
      const result = layoutWithLines(prepared, width, lineHeightPx)

      setLines(result.lines.map((line) => line.text))
    }

    // Wait for fonts to load before measuring
    document.fonts.ready.then(measure)

    const observer = new ResizeObserver(() => {
      if (!hasAnimated) {
        document.fonts.ready.then(measure)
      }
    })
    observer.observe(el)

    return () => observer.disconnect()
  }, [text, hasAnimated])

  // After animation completes, show as plain text to handle resize naturally
  if (hasAnimated) {
    return (
      <h1 className={className}>
        {text}
      </h1>
    )
  }

  return (
    <h1 className={className} ref={containerRef}>
      {/* SSR fallback — visible until pretext computes lines */}
      {!lines && <span>{text}</span>}

      {/* Animated lines */}
      {lines && (
        <>
          <span className="sr-only">{text}</span>
          <span aria-hidden="true" className="block">
            {lines.map((line, i) => (
              <span key={`${i}-${line}`} className="block overflow-hidden">
                <span
                  className="block animate-line-reveal"
                  style={{
                    animationDelay: `${i * 150}ms`,
                    animationFillMode: 'both',
                  }}
                  onAnimationEnd={
                    i === lines.length - 1
                      ? () => setHasAnimated(true)
                      : undefined
                  }
                >
                  {line}
                </span>
              </span>
            ))}
          </span>
        </>
      )}
    </h1>
  )
}
