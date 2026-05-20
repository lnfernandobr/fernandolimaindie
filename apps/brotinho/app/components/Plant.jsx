// Plant.jsx — usa a arte do casal: sementinha + plantinha brotada.
// Fases intermediárias mostram um "?" estilizado — a evolução vai sendo
// revelada conforme o casal cuida.
// Moods preserved for API compatibility but the artwork doesn't react to them.

const SEED_ART  = '/using-the-exact-same-soft-hand-drawn-digital-illus.png';
const PLANT_ART = '/cute-round-mascot-character--a-potted-houseplant-f.png';

function PlantArt({ src, size, wobble, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={wobble ? 'wobble' : ''}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
        userSelect: 'none',
        filter: 'drop-shadow(0 6px 10px rgba(46,26,15,0.14))',
      }}
    />
  );
}

function MysteryStage({ size, wobble }) {
  const ring = Math.max(2, size * 0.022);
  const qFont = size * 0.5;

  return (
    <div style={{
      width: size,
      height: size,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div
        className={wobble ? 'wobble' : ''}
        style={{
          width: size * 0.72,
          height: size * 0.72,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 32% 28%, #FFF8EE 0%, #FFE3CC 60%, #FFC9D4 100%)',
          border: `${ring}px dashed #B85539`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 8px 18px rgba(184,85,57,0.10), 0 8px 18px rgba(46,26,15,0.10)',
          filter: 'drop-shadow(0 6px 10px rgba(46,26,15,0.10))',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-brand)',
          fontSize: qFont,
          color: '#B85539',
          lineHeight: 1,
          transform: 'translateY(-6%) rotate(-6deg)',
          textShadow: '2px 2px 0 rgba(184,85,57,0.18)',
        }}>?</span>
      </div>

      <div className="floaty" style={{
        position: 'absolute', top: '4%', right: '10%',
        fontSize: size * 0.16, pointerEvents: 'none',
      }}>✨</div>
      <div className="floaty" style={{
        position: 'absolute', bottom: '18%', left: '4%',
        fontSize: size * 0.12, animationDelay: '0.6s', pointerEvents: 'none',
      }}>✦</div>
      <div className="floaty" style={{
        position: 'absolute', top: '22%', left: '12%',
        fontSize: size * 0.09, animationDelay: '1.1s', pointerEvents: 'none',
      }}>✦</div>
    </div>
  );
}

export default function Plant({ stage = 'kid', mood = 'happy', size = 200, wobble = true, hearts = false }) {
  const isSeed  = stage === 'seed';
  const isBloom = stage === 'bloom';
  const isArt   = isSeed || isBloom;

  return (
    <div style={{ width: size, height: size, position: 'relative', display: 'inline-block' }}>
      {hearts && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
          <div className="floaty" style={{ position: 'absolute', top: '4%', left: '14%', fontSize: size * 0.09 }}>💗</div>
          <div className="floaty" style={{ position: 'absolute', top: '14%', right: '10%', fontSize: size * 0.08, animationDelay: '0.6s' }}>💕</div>
          <div className="floaty" style={{ position: 'absolute', top: '0%', right: '32%', fontSize: size * 0.06, animationDelay: '1.1s' }}>💗</div>
          <div className="floaty" style={{ position: 'absolute', top: '20%', left: '2%', fontSize: size * 0.05, animationDelay: '1.6s' }}>✨</div>
        </div>
      )}

      {isArt ? (
        <PlantArt
          src={isSeed ? SEED_ART : PLANT_ART}
          size={size}
          wobble={wobble}
          alt={isSeed ? 'sementinha' : 'brotinho'}
        />
      ) : (
        <MysteryStage size={size} wobble={wobble} />
      )}

      {isBloom && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
          <div className="floaty" style={{ position: 'absolute', top: '2%', left: '12%', fontSize: size * 0.18 }}>🌸</div>
          <div className="floaty" style={{ position: 'absolute', top: '-4%', right: '18%', fontSize: size * 0.16, animationDelay: '0.7s' }}>🌷</div>
          <div className="floaty" style={{ position: 'absolute', top: '18%', right: '2%', fontSize: size * 0.13, animationDelay: '1.2s' }}>🌼</div>
          <div className="floaty" style={{ position: 'absolute', top: '26%', left: '-2%', fontSize: size * 0.11, animationDelay: '0.4s' }}>🌸</div>
        </div>
      )}
    </div>
  );
}
