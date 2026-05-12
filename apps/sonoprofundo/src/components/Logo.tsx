export default function Logo({ size = 18, mark = true }: { size?: number; mark?: boolean }) {
  const markSize = size * 1.1;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: size * 0.45,
      fontFamily: 'var(--font-sans)', fontWeight: 500,
      fontSize: size, letterSpacing: -0.2, color: 'var(--text-moon)',
    }}>
      {mark && (
        <svg width={markSize} height={markSize} viewBox="0 0 200 200" fill="none">
          <line x1="40" y1="60" x2="120" y2="60" stroke="currentColor" strokeWidth="14" strokeLinecap="round"/>
          <line x1="30" y1="90" x2="150" y2="90" stroke="currentColor" strokeWidth="14" strokeLinecap="round"/>
          <line x1="50" y1="120" x2="170" y2="120" stroke="currentColor" strokeWidth="14" strokeLinecap="round"/>
          <line x1="80" y1="150" x2="160" y2="150" stroke="currentColor" strokeWidth="14" strokeLinecap="round"/>
        </svg>
      )}
      <span>sono<span style={{ color: 'var(--amber-glow)' }}>profundo</span></span>
    </span>
  );
}
