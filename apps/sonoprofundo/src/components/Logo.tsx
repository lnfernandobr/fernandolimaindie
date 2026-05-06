export default function Logo({ size = 18, mark = true }: { size?: number; mark?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: size * 0.45,
      fontFamily: 'var(--font-sans)', fontWeight: 500,
      fontSize: size, letterSpacing: -0.2, color: 'var(--text-moon)',
    }}>
      {mark && (
        <svg width={size * 1.1} height={size * 1.1} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" opacity="0.4"/>
          <path d="M12 3a9 9 0 0 0 0 18 7 7 0 0 1 0-18z" fill="currentColor"/>
        </svg>
      )}
      <span>sono<span style={{ color: 'var(--amber-glow)' }}>profundo</span></span>
    </span>
  );
}
