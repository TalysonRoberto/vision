export function LogoVision({ className = "h-10" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        fill="none"
        className="h-full w-auto"
        aria-hidden="true"
      >
        <rect width="100" height="100" rx="24" fill="currentColor" className="text-[#0f0f11] dark:text-white" />
        <path
          d="M33 28C33 28 45 64 50 72C55 64 67 28 67 28L78 28C78 28 62 72 50 88C38 72 22 28 22 28H33Z"
          fill="url(#vision-gradient)"
        />
        <defs>
          <linearGradient id="vision-gradient" x1="22" y1="28" x2="78" y2="88" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-2xl font-semibold tracking-tight text-foreground">vision</span>
    </div>
  )
}
