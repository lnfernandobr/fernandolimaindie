const paths = {
  wave:    <><path d="M3 13c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 3 2"/><path d="M3 17c2 0 2-1.4 4-1.4s2 1.4 4 1.4 2-1.4 4-1.4S20 17 21 17" opacity=".5"/></>,
  moon:    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>,
  shield:  <path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3Z"/>,
  sun:     <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/></>,
  wing:    <path d="M3 16c4-1 6-3 8-7 1.6 2.4 4.4 3.4 9 3-2.6 3.4-7 6-12 6-2 0-4-.6-5-2Z"/>,
  flame:   <path d="M12 3c1 3 5 4 5 8a5 5 0 0 1-10 0c0-2 1.2-3 2-4 .4 1 1 1.4 1.6 1.4C12 8 11 5 12 3Z"/>,
  dawn:    <><path d="M3 18h18"/><path d="M7 18a5 5 0 0 1 10 0"/><path d="M12 4v3M5 9l1.5 1.4M19 9l-1.5 1.4"/></>,
  home:    <><path d="M4 11l8-6 8 6"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/></>,
  grain:   <><path d="M12 21V8"/><path d="M12 9c-2.4 0-4-1.6-4-4 2.4 0 4 1.6 4 4Z"/><path d="M12 9c2.4 0 4-1.6 4-4-2.4 0-4 1.6-4 4Z"/><path d="M12 14c-2.4 0-4-1.6-4-4 2.4 0 4 1.6 4 4Z"/><path d="M12 14c2.4 0 4-1.6 4-4-2.4 0-4 1.6-4 4Z" opacity=".6"/></>,
  leaf:    <><path d="M19 5c0 8-4 12-11 13C8 11 12 6 19 5Z"/><path d="M8 18c2-3 4-5 7-7" opacity=".5"/></>,
  sunrise: <><path d="M3 19h18"/><path d="M8 19a4 4 0 0 1 8 0"/><path d="M12 4v4M5.5 10.5 7 12M18.5 10.5 17 12"/><path d="M3 15h3M18 15h3" opacity=".6"/></>,
  stars:   <><path d="M12 4l1.4 3.4L17 8.6l-2.6 2.4.7 3.6L12 12.8 8.9 14.6l.7-3.6L7 8.6l3.6-1.2L12 4Z"/><path d="M18.5 14.5l.6 1.4 1.4.5-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.5.6-1.4Z" opacity=".6"/></>,
  heart:   <path d="M12 20s-7-4.4-9-9.2C1.6 7 4 4 7 4c2 0 3.4 1.2 5 3 1.6-1.8 3-3 5-3 3 0 5.4 3 4 6.8C19 15.6 12 20 12 20Z"/>,
  dove:    <path d="M4 14c4 0 6-2 8-6 1 4 4 6 8 5-1 3-4 5-8 5-2 0-4-.6-5-1.6L4 18l1-2-1-2Z"/>,
  play:    <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" stroke="none"/>,
  pause:   <><rect x="7" y="5.5" width="3.4" height="13" rx="1" fill="currentColor" stroke="none"/><rect x="13.6" y="5.5" width="3.4" height="13" rx="1" fill="currentColor" stroke="none"/></>,
  arrow:   <path d="M5 12h14M13 6l6 6-6 6"/>,
  arrowUp: <path d="M12 19V5M6 11l6-6 6 6"/>,
  search:  <><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-3.6-3.6"/></>,
  share:   <><path d="M12 16V4"/><path d="M8 8l4-4 4 4"/><path d="M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6"/></>,
  close:   <path d="M6 6l12 12M18 6L6 18"/>,
  sunUi:   <><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M5 19l1.4-1.4"/></>,
  moonUi:  <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>,
  headphones: <><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13" width="4" height="7" rx="1.6"/><rect x="17" y="13" width="4" height="7" rx="1.6"/></>,
  mail:    <><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 6 8-6"/></>,
  check:   <path d="M5 12.5l4.5 4.5L19 7"/>,
  youtube:   <><rect x="2.5" y="6" width="19" height="12" rx="3.6"/><path d="M10.5 9.3l5 2.7-5 2.7Z" fill="currentColor" stroke="none"/></>,
  book:      <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5Z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5A2.5 2.5 0 0 1 4 20.5Z" opacity=".5"/><path d="M11.5 6.5v6M9 9h5" opacity=".7"/></>,
  scroll:    <><path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6"/><path d="M6 4a2 2 0 0 0-2 2v1h4"/><path d="M6 20a2 2 0 0 0 2-2V7"/><path d="M11 9h5M11 13h5" opacity=".6"/></>,
  people:    <><circle cx="9" cy="8.5" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 6.2a3 3 0 0 1 0 5.6"/><path d="M17 14.4a5.5 5.5 0 0 1 3.5 4.6" opacity=".6"/></>,
  bookmark:  <><path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.6L6 20V5a1 1 0 0 1 1-1Z"/><path d="M9.5 9.5h5" opacity=".6"/></>,
  quote:     <><path d="M9.5 6.5C7 7.6 5.5 9.8 5.5 12.5v5h5v-6h-3c0-1.8.8-3.2 2.6-4Z"/><path d="M18 6.5c-2.5 1.1-4 3.3-4 6v5h5v-6h-3c0-1.8.8-3.2 2.6-4Z"/></>,
  grid:      <><rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6" opacity=".55"/></>,
  chevron:   <path d="M8.5 5l7 7-7 7"/>,
  chevronDown: <path d="M5 8.5l7 7 7-7"/>,
  clock:     <><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></>,
};

export function Glyph({ name, size = 24, stroke = 1.5, style, className, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {paths[name] || null}
    </svg>
  );
}
