import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Adium — How Good Are Your Ads?'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const interBold = await fetch(
    new URL('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf')
  ).then((res) => res.arrayBuffer())

  const interBlack = await fetch(
    new URL('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuBWYMZhrib2Bg-4.ttf')
  ).then((res) => res.arrayBuffer())
  // "You" line — volatile, moving around
  const youLine = [
    { x: 0, y: 320 }, { x: 46, y: 305 }, { x: 92, y: 270 },
    { x: 138, y: 240 }, { x: 184, y: 280 }, { x: 230, y: 310 },
    { x: 276, y: 290 }, { x: 322, y: 330 }, { x: 368, y: 300 },
    { x: 414, y: 260 }, { x: 460, y: 290 }, { x: 506, y: 310 },
    { x: 552, y: 280 }, { x: 598, y: 300 }, { x: 644, y: 270 },
    { x: 690, y: 290 }, { x: 736, y: 310 }, { x: 782, y: 280 },
    { x: 828, y: 260 }, { x: 874, y: 290 }, { x: 920, y: 310 },
    { x: 966, y: 285 }, { x: 1012, y: 270 }, { x: 1058, y: 295 },
    { x: 1104, y: 280 }, { x: 1150, y: 290 }, { x: 1200, y: 275 },
  ]

  // Benchmark line — smoother, steadier trend
  const benchLine = [
    { x: 0, y: 340 }, { x: 46, y: 335 }, { x: 92, y: 328 },
    { x: 138, y: 322 }, { x: 184, y: 318 }, { x: 230, y: 315 },
    { x: 276, y: 312 }, { x: 322, y: 310 }, { x: 368, y: 308 },
    { x: 414, y: 310 }, { x: 460, y: 312 }, { x: 506, y: 308 },
    { x: 552, y: 305 }, { x: 598, y: 308 }, { x: 644, y: 310 },
    { x: 690, y: 308 }, { x: 736, y: 305 }, { x: 782, y: 308 },
    { x: 828, y: 310 }, { x: 874, y: 308 }, { x: 920, y: 305 },
    { x: 966, y: 308 }, { x: 1012, y: 310 }, { x: 1058, y: 308 },
    { x: 1104, y: 305 }, { x: 1150, y: 308 }, { x: 1200, y: 310 },
  ]

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  const youPath = toPath(youLine)
  const benchPath = toPath(benchLine)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#0a0a0a',
          fontFamily: 'Inter',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Chart layer — full bleed behind everything */}
        <svg
          width="1200"
          height="630"
          viewBox="0 0 1200 630"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {/* Subtle grid */}
          <line x1="0" y1="240" x2="1200" y2="240" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <line x1="0" y1="310" x2="1200" y2="310" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <line x1="0" y1="380" x2="1200" y2="380" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

          {/* Benchmark line — dashed, visible */}
          <path d={benchPath} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeDasharray="10,6" />

          {/* You line — solid peach with glow */}
          <path d={youPath} fill="none" stroke="#f4c6a5" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.1" />
          <path d={youPath} fill="none" stroke="#f4c6a5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Content layer */}
        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', width: '100%', height: '100%', padding: '60px 72px' }}>
          {/* ADIUM — large, top */}
          <div style={{ display: 'flex', fontSize: '64px', fontWeight: 900, letterSpacing: '12px', color: '#ffffff' }}>
            ADIUM
          </div>

          {/* Spacer — chart shows through here */}
          <div style={{ flex: 1 }} />

          {/* Tagline — large, bottom */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '42px', fontWeight: 900, color: '#ffffff', letterSpacing: '-1px', lineHeight: 1.1 }}>
              <span>How good are</span>
              <span>your ads?</span>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '28px', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '3px', background: '#f4c6a5', borderRadius: '2px' }} />
                <div style={{ fontSize: '12px', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>YOU</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '2px', background: 'rgba(255,255,255,0.45)', borderRadius: '2px' }} />
                <div style={{ fontSize: '12px', letterSpacing: '2px', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>BENCHMARK</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Inter', data: interBold, weight: 600 as const, style: 'normal' as const },
        { name: 'Inter', data: interBlack, weight: 900 as const, style: 'normal' as const },
      ],
    }
  )
}
