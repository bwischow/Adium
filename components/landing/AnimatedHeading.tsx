'use client'

import { useRef, useState, useEffect } from 'react'
import { prepare, prepareWithSegments, layout, layoutWithLines } from '@chenglou/pretext'

interface AnimatedHeadingProps {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'h3'
  animateOnScroll?: boolean
  balance?: boolean
}

export function AnimatedHeading({
  text,
  className,
  as: Tag = 'h1',
  animateOnScroll = false,
  balance = false,
}: AnimatedHeadingProps) {
  const containerRef = useRef<HTMLHeadingElement>(null)
  const [lines, setLines] = useState<string[] | null>(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [isInView, setIsInView] = useState(!animateOnScroll)
  const [balancedMaxWidth, setBalancedMaxWidth] = useState<number | undefined>(undefined)

  // IntersectionObserver for scroll-triggered animation
  useEffect(() => {
    if (!animateOnScroll) return
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [animateOnScroll])

  // Measure text and compute lines
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const measure = () => {
      const computed = getComputedStyle(el)
      const font = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`
      const width = el.clientWidth
      const lineHeightPx = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 0.95
      const upperText = text.toUpperCase()

      let effectiveWidth = width

      // Text balancing: find narrowest width that keeps the same line count
      if (balance) {
        const prepared = prepare(upperText, font)
        const baseResult = layout(prepared, width, lineHeightPx)
        const targetLineCount = baseResult.lineCount

        if (targetLineCount > 1) {
          let lo = width / targetLineCount
          let hi = width

          while (hi - lo > 1) {
            const mid = (lo + hi) / 2
            const result = layout(prepared, mid, lineHeightPx)
            if (result.lineCount <= targetLineCount) {
              hi = mid
            } else {
              lo = mid
            }
          }

          effectiveWidth = Math.ceil(hi)
          setBalancedMaxWidth(effectiveWidth)
        }
      }

      // Compute line-by-line layout for animation
      const preparedSeg = prepareWithSegments(upperText, font)
      const result = layoutWithLines(preparedSeg, effectiveWidth, lineHeightPx)
      setLines(result.lines.map((line) => line.text))
    }

    document.fonts.ready.then(measure)

    const observer = new ResizeObserver(() => {
      if (!hasAnimated) {
        setBalancedMaxWidth(undefined)
        document.fonts.ready.then(measure)
      }
    })
    observer.observe(el)

    return () => observer.disconnect()
  }, [text, hasAnimated, balance])

  // After animation completes, show as plain text to handle resize naturally
  if (hasAnimated) {
    return (
      <Tag className={className} style={balancedMaxWidth ? { maxWidth: balancedMaxWidth } : undefined}>
        {text}
      </Tag>
    )
  }

  const showAnimation = isInView && lines

  return (
    <Tag
      className={className}
      ref={containerRef}
      style={balancedMaxWidth ? { maxWidth: balancedMaxWidth } : undefined}
    >
      {/* SSR fallback — visible until pretext computes lines and element is in view */}
      {!showAnimation && <span>{text}</span>}

      {/* Animated lines */}
      {showAnimation && (
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
    </Tag>
  )
}
