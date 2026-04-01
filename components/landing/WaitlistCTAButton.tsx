'use client'

export function WaitlistCTAButton({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('open-waitlist-modal'))}
      className={className}
    >
      {children}
    </button>
  )
}
