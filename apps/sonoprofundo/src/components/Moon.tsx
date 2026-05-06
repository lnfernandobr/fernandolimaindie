export default function Moon({ size = 80, phase = 0.7, color = 'var(--amber-glow)' }: { size?: number; phase?: number; color?: string }) {
  const id = `m-${size}-${Math.round(phase * 100)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <mask id={id}>
          <rect width="100" height="100" fill="#fff"/>
          <circle cx={50 + 50 * phase} cy="50" r="42" fill="#000"/>
        </mask>
      </defs>
      <circle cx="50" cy="50" r="42" fill={color} mask={`url(#${id})`}/>
    </svg>
  );
}
