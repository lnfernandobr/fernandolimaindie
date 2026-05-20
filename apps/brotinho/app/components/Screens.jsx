// Screens.jsx — app screens for brotinho.
// Each screen returns the content *inside* a phone frame.

import Plant from './Plant';

function StreakChip({ days = 47, names = 'Ana & Léo' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: '#FFFFFF', borderRadius: 999,
      padding: '8px 14px 8px 8px',
      boxShadow: '0 4px 14px rgba(184,85,57,0.12)',
      border: '2px solid #FCE2C2',
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 15,
        background: 'linear-gradient(135deg, #FF89A8, #FF5E84)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, color: 'white',
      }}>💚</div>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontSize: 10, color: '#8E6B4F', fontWeight: 700, letterSpacing: 0.3 }}>VOCÊS JUNTOS</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#2E1A0F', fontWeight: 800, marginTop: 1 }}>{days} dias 🔥</span>
      </div>
    </div>
  );
}

function StatBar({ icon, label, value, color = '#76C079' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#5A3826' }}>{icon} {label}</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#5A3826', fontVariantNumeric: 'tabular-nums' }}>{value}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: '#FCE2C2', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 4 }} />
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, color = '#FF89A8', text = '#fff' }) {
  return (
    <button style={{
      flex: 1, flexDirection: 'column', display: 'flex', alignItems: 'center', gap: 4,
      background: color, color: text, border: 'none',
      padding: '12px 4px', borderRadius: 18,
      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
      boxShadow: '0 3px 0 rgba(46,26,15,0.12)', cursor: 'pointer',
    }}>
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      {label}
    </button>
  );
}

export function HomeScreen({ plantName = 'Verdinho', mood = 'happy', stage = 'kid', bubble = 'Tô com sede 🥺' }) {
  return (
    <div className="brotou" style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #FFF1DA 0%, #FFE3CC 60%, #FCE2C2 100%)',
      display: 'flex', flexDirection: 'column', padding: '12px 16px 20px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -40, right: -30, width: 180, height: 180, borderRadius: '50%', background: '#FFD3B5', opacity: 0.5 }} />
      <div style={{ position: 'absolute', bottom: 60, left: -40, width: 130, height: 130, borderRadius: '50%', background: '#FFB8C8', opacity: 0.35 }} />
      <div style={{ position: 'absolute', top: 100, left: 24, fontSize: 18, opacity: 0.5 }}>✿</div>
      <div style={{ position: 'absolute', top: 70, right: 30, fontSize: 14, opacity: 0.4 }}>✦</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
        <StreakChip days={47} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, border: '2px solid #FCE2C2' }}>🔔</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex' }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: '#FF89A8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 13, border: '2px solid #fff' }}>A</div>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: '#76C079', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 13, border: '2px solid #fff', marginLeft: -10 }}>L</div>
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#5A3826' }}>Ana & Léo</span>
        <span style={{ fontSize: 10, color: '#8E6B4F', fontWeight: 700 }}>· Léo regou às 14h 💧</span>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#8E6B4F', letterSpacing: 1.4 }}>NOSSA PLANTINHA</div>
        <div style={{ fontFamily: 'var(--font-brand)', fontSize: 30, color: '#B85539', marginTop: 2, letterSpacing: 0.3 }}>{plantName}</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <div className="bubble" style={{ marginBottom: 22 }}>{bubble}</div>
        <Plant stage={stage} mood={mood} size={210} wobble={true} hearts={mood === 'inLove'} />
      </div>

      <div style={{ background: '#FFFFFFAA', backdropFilter: 'blur(4px)', borderRadius: 18, padding: '10px 14px', display: 'flex', gap: 12, marginTop: 10, position: 'relative', zIndex: 2, border: '2px solid #FFFFFF' }}>
        <StatBar icon="💧" label="Água" value={mood === 'thirsty' ? 22 : 78} color="#7BB8FF" />
        <StatBar icon="☀️" label="Sol" value={64} color="#FFC861" />
        <StatBar icon="❤️" label="Amor" value={92} color="#FF5E84" />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 10, position: 'relative', zIndex: 2 }}>
        <ActionBtn icon="💧" label="Regar" color="#7BB8FF" />
        <ActionBtn icon="☀️" label="Sol" color="#FFC861" text="#5A3826" />
        <ActionBtn icon="💬" label="Falar" color="#FF89A8" />
        <ActionBtn icon="✂️" label="Podar" color="#76C079" />
      </div>
    </div>
  );
}

export function PairScreen() {
  return (
    <div className="brotou" style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #FFE9F0 0%, #FFF1DA 100%)',
      display: 'flex', flexDirection: 'column', padding: '20px 22px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 60, left: 30, fontSize: 22, opacity: 0.5 }}>💕</div>
      <div style={{ position: 'absolute', top: 180, right: 30, fontSize: 18, opacity: 0.5 }} className="floaty">💗</div>
      <div style={{ position: 'absolute', bottom: 200, left: 50, fontSize: 16, opacity: 0.5 }} className="floaty">✿</div>
      <div style={{ position: 'absolute', bottom: 140, right: 40, fontSize: 14, opacity: 0.6 }}>✦</div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ fontFamily: 'var(--font-brand)', fontSize: 26, color: '#B85539' }}>brotinho</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: '#2E1A0F', marginTop: 24, lineHeight: 1.1, fontWeight: 800 }}>
          Quem é<br/>seu par?
        </div>
        <div style={{ fontSize: 14, color: '#5A3826', marginTop: 8, fontWeight: 600, lineHeight: 1.4 }}>
          Pra plantar, precisa de duas pessoas 💚
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ marginTop: -20 }}>
          <Plant stage="sprout" mood="happy" size={160} hearts={true} />
        </div>
        <div style={{
          marginTop: 16, background: 'white', borderRadius: 22, padding: '20px 26px',
          boxShadow: '0 8px 24px rgba(255,94,132,0.18)', border: '3px dashed #FF89A8',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, letterSpacing: 1.5, color: '#8E6B4F', fontWeight: 800 }}>SEU CÓDIGO DE CASAL</div>
          <div style={{ fontFamily: 'var(--font-brand)', fontSize: 34, color: '#B85539', letterSpacing: 6, marginTop: 6 }}>AMOR-247</div>
          <div style={{ fontSize: 12, color: '#8E6B4F', fontWeight: 600, marginTop: 6 }}>Mande pro seu amor 💌</div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn-cute btn-pink" style={{ width: '100%', fontSize: 16, padding: '16px' }}>
          📤 Convidar pelo WhatsApp
        </button>
        <button style={{
          width: '100%', background: 'transparent', border: 'none', color: '#5A3826',
          fontWeight: 700, fontFamily: 'var(--font-body)', fontSize: 14, padding: 10, cursor: 'pointer',
        }}>
          Tenho um código →
        </button>
      </div>
    </div>
  );
}

function PlantMsg({ children, mood }) {
  return (
    <div style={{
      alignSelf: 'flex-start',
      background: mood === 'love' ? 'linear-gradient(135deg, #FF89A8, #FF5E84)' : 'white',
      color: mood === 'love' ? 'white' : '#2E1A0F',
      borderRadius: '18px 18px 18px 4px',
      padding: '10px 14px',
      maxWidth: '78%',
      fontSize: 14,
      fontWeight: 600,
      lineHeight: 1.35,
      boxShadow: '0 2px 8px rgba(184,85,57,0.10)',
      border: mood === 'love' ? 'none' : '1.5px solid #FCE2C2',
    }}>{children}</div>
  );
}

function CoupleMsg({ from, color, children }) {
  return (
    <div style={{ alignSelf: 'flex-end', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, maxWidth: '78%' }}>
      <span style={{ fontSize: 10, color: color, fontWeight: 800, paddingRight: 8 }}>{from}</span>
      <div style={{
        background: color, color: 'white',
        borderRadius: '18px 18px 4px 18px',
        padding: '10px 14px',
        fontSize: 14, fontWeight: 600, lineHeight: 1.35,
      }}>{children}</div>
    </div>
  );
}

export function ChatScreen({ plantName = 'Verdinho' }) {
  return (
    <div className="brotou" style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #FFF1DA 0%, #FFE9F0 100%)',
      display: 'flex', flexDirection: 'column', position: 'relative',
    }}>
      <div style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(6px)', borderBottom: '1px solid #FCE2C2' }}>
        <div style={{ fontSize: 20, color: '#5A3826', fontWeight: 800 }}>←</div>
        <div style={{ width: 38, height: 38, borderRadius: 19, background: '#A8D9A6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ marginTop: 4, transform: 'scale(0.5)', transformOrigin: 'center' }}>
            <Plant stage="bloom" mood="happy" size={68} wobble={false} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: '#2E1A0F' }}>{plantName}</span>
          <span style={{ fontSize: 11, color: '#76C079', fontWeight: 700 }}>● online · feliz hoje</span>
        </div>
      </div>

      <div style={{ flex: 1, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
        <div style={{ alignSelf: 'center', fontSize: 11, color: '#8E6B4F', fontWeight: 700, margin: '4px 0 8px' }}>HOJE · 14:32</div>

        <PlantMsg>Oiiii 🌱<br/>Acordei pensando em vocês ✨</PlantMsg>
        <PlantMsg>Léo me deu água hoje cedo, ele é tão fofo 💧</PlantMsg>
        <CoupleMsg from="Ana" color="#FF89A8">Aaaah que fofuraaa 😭</CoupleMsg>
        <PlantMsg>Ana, você sumiu hoje! Cadê meu sol? ☀️🥺</PlantMsg>
        <CoupleMsg from="Ana" color="#FF89A8">Desculpaaa, indo te dar agora!</CoupleMsg>
        <PlantMsg mood="love">Te amo 💚 vocês são a melhor dupla</PlantMsg>

        <div style={{ alignSelf: 'flex-end', fontSize: 10, color: '#8E6B4F', marginTop: 2 }}>visto pelo Léo 👁</div>
      </div>

      <div style={{ padding: '10px 14px 16px', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.7)', borderTop: '1px solid #FCE2C2' }}>
        <div style={{
          flex: 1, height: 40, borderRadius: 20, background: 'white', padding: '0 14px',
          display: 'flex', alignItems: 'center', fontSize: 13, color: '#8E6B4F',
          border: '2px solid #FCE2C2',
        }}>Conversa com a plantinha...</div>
        <button style={{ width: 40, height: 40, borderRadius: 20, background: '#FF5E84', border: 'none', color: 'white', fontSize: 16, cursor: 'pointer', boxShadow: '0 3px 0 rgba(46,26,15,0.12)' }}>↑</button>
      </div>
    </div>
  );
}

function DiaryEvent({ who, color, time, children, plant = false }) {
  return (
    <div style={{
      background: plant ? 'linear-gradient(135deg, #FFF1DA, #FFE3CC)' : 'white',
      borderRadius: 16, padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 2px 8px rgba(184,85,57,0.08)',
      border: plant ? '2px solid #FFC861' : '1.5px solid #FCE2C2',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 19, background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 800, fontSize: 14, flexShrink: 0,
      }}>{who.length > 2 ? who : who[0]}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#2E1A0F', lineHeight: 1.3 }}>
          <b style={{ color: color, fontWeight: 800 }}>{who}</b> {children}
        </div>
        <div style={{ fontSize: 10, color: '#8E6B4F', fontWeight: 700, marginTop: 2 }}>{time}</div>
      </div>
    </div>
  );
}

export function DiaryScreen() {
  return (
    <div className="brotou" style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #FFF8EE 0%, #FFE9F0 100%)',
      display: 'flex', flexDirection: 'column', padding: '18px 18px 12px', overflow: 'hidden', position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#2E1A0F' }}>Diário 📖</div>
          <div style={{ fontSize: 12, color: '#8E6B4F', fontWeight: 600, marginTop: 2 }}>Tudo que vocês fizeram pelo Verdinho</div>
        </div>
        <div style={{ fontSize: 11, color: '#B85539', fontWeight: 800 }}>MAIO</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 14, overflow: 'hidden' }}>
        {['DOM','SEG','TER','QUA','QUI','SEX','SÁB'].map((d,i) => (
          <div key={d} style={{
            flex: 1, padding: '8px 0', borderRadius: 12, textAlign: 'center',
            background: i === 4 ? '#FF5E84' : '#FFFFFF',
            color: i === 4 ? 'white' : '#5A3826',
            fontWeight: 800, fontSize: 11,
            border: i === 4 ? 'none' : '1.5px solid #FCE2C2',
          }}>
            <div style={{ fontSize: 9, opacity: 0.7 }}>{d}</div>
            <div style={{ fontSize: 15, marginTop: 2 }}>{8 + i}</div>
            {i < 5 && <div style={{ fontSize: 8, marginTop: 2 }}>{i === 4 ? '🔥' : '💧'}</div>}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
        <DiaryEvent who="Ana" color="#FF89A8" time="agora">deu sol pro Verdinho 🌞 +5 humor</DiaryEvent>
        <DiaryEvent who="Léo" color="#76C079" time="2h atrás">conversou com Verdinho por 4 min 💬</DiaryEvent>
        <DiaryEvent who="Ana" color="#FF89A8" time="ontem 22:14">regou antes de dormir 💧</DiaryEvent>
        <DiaryEvent who="✨" color="#FFC861" time="ontem 18:00" plant={true}>
          Verdinho subiu pra <b>fase Bebê</b> 🌱→🌿
        </DiaryEvent>
        <DiaryEvent who="Léo" color="#76C079" time="ontem 12:30">deixou um bilhete: &quot;saudade do meu mato 💚&quot;</DiaryEvent>
      </div>
    </div>
  );
}

export function StagesScreen() {
  const stages = [
    { key: 'seed', name: 'Sementinha', day: 'dia 1', mood: 'sleepy' },
    { key: 'sprout', name: 'Brotinho', day: 'dia 7', mood: 'happy' },
    { key: 'kid', name: 'Bebê', day: 'dia 30', mood: 'happy' },
    { key: 'adult', name: 'Adulta', day: 'dia 90', mood: 'content' },
    { key: 'bloom', name: 'Florida 🌸', day: 'dia 180', mood: 'inLove', special: true },
  ];
  return (
    <div className="brotou" style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #FFF8EE 0%, #FFE3CC 100%)',
      padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#2E1A0F', lineHeight: 1.1 }}>Como ela cresce 🌱</div>
      <div style={{ fontSize: 12, color: '#8E6B4F', fontWeight: 600 }}>Cuidando todo dia, ela passa por 5 fases</div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
        {stages.map((s, i) => (
          <div key={s.key} style={{
            background: s.special ? 'linear-gradient(135deg, #FFE9F0, #FFF1DA)' : '#FFFFFF',
            borderRadius: 16, padding: '6px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
            border: s.special ? '2px solid #FF89A8' : '1.5px solid #FCE2C2',
            boxShadow: '0 2px 8px rgba(184,85,57,0.08)',
          }}>
            <div style={{ width: 70, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ transform: 'scale(0.55)', transformOrigin: 'center' }}>
                <Plant stage={s.key} mood={s.mood} size={120} wobble={false} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: '#2E1A0F' }}>{s.name}</div>
              <div style={{ fontSize: 11, color: '#8E6B4F', fontWeight: 700 }}>{s.day}</div>
            </div>
            <div style={{
              fontSize: 11, fontWeight: 800, color: s.special ? '#E83768' : '#B85539',
              background: s.special ? '#FFE9F0' : '#FFF1DA', padding: '4px 10px', borderRadius: 999,
            }}>{i === 0 ? '✓' : `+${(i+1) * 20}xp`}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MemoryCard({ rotate = 0, bg = '#FFD37A', date, caption, big = false, photo = null }) {
  return (
    <div style={{
      background: 'white', borderRadius: 12, padding: 6, boxShadow: '0 4px 12px rgba(184,85,57,0.15)',
      transform: `rotate(${rotate}deg)`,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        flex: 1, background: bg, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: big ? 100 : 80, position: 'relative',
        overflow: 'hidden',
      }}>
        {photo ? (
          <img
            src={photo}
            alt={caption}
            draggable={false}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              userSelect: 'none',
            }}
          />
        ) : (
          <div style={{ transform: 'scale(0.45)' }}>
            <Plant
              stage={big ? 'bloom' : 'seed'}
              mood={big ? 'inLove' : 'happy'}
              size={120}
              wobble={false}
            />
          </div>
        )}
        <div style={{ position: 'absolute', top: 6, right: 6, fontSize: 9, color: '#5A3826', fontWeight: 800, background: 'rgba(255,255,255,0.85)', padding: '2px 6px', borderRadius: 6 }}>{date}</div>
      </div>
      <div style={{ fontSize: 11, color: '#5A3826', fontWeight: 700, padding: '6px 4px 2px', textAlign: 'center', fontFamily: 'var(--font-display)' }}>{caption}</div>
    </div>
  );
}

// Unsplash photos — free for commercial use under the Unsplash License.
const PHOTO_GARDEN = 'https://images.unsplash.com/photo-1758524053092-45f6e830ac9c?w=400&q=80&auto=format&fit=crop';
const PHOTO_PARK   = 'https://images.unsplash.com/photo-1776266101010-f64582647381?w=400&q=80&auto=format&fit=crop';
const PHOTO_SELFIE = 'https://images.unsplash.com/photo-1758613171601-64ebfbc928ed?w=400&q=80&auto=format&fit=crop';
const PHOTO_WATER  = 'https://images.unsplash.com/photo-1758524053238-38b1cb9115dc?w=400&q=80&auto=format&fit=crop';

export function MemoriesScreen() {
  return (
    <div className="brotou" style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #FFF1DA 0%, #FFE9F0 100%)',
      padding: '18px 18px 14px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#2E1A0F' }}>Memórias 💌</div>
          <div style={{ fontSize: 12, color: '#8E6B4F', fontWeight: 600 }}>12 momentos guardados</div>
        </div>
        <button style={{ background: '#FF5E84', color: 'white', border: 'none', borderRadius: 999, padding: '8px 14px', fontWeight: 800, fontSize: 12, fontFamily: 'var(--font-display)', boxShadow: '0 3px 0 rgba(46,26,15,0.12)' }}>+ Nova</button>
      </div>

      <div style={{ flex: 1, marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, overflow: 'hidden' }}>
        <MemoryCard rotate={-2} bg="#FFC9D4" date="06/06" caption="Verdinho floresceu 🌸" big={true} />
        <MemoryCard rotate={1.5} bg="#A8D9A6" date="22/05" caption="primeira folha!" photo={PHOTO_GARDEN} />
        <MemoryCard rotate={-1} bg="#FFD37A" date="14/05" caption="dia de sol no parque" photo={PHOTO_PARK} />
        <MemoryCard rotate={2} bg="#FFB8C8" date="01/05" caption="Léo deu um bilhete 💌" />
        <MemoryCard rotate={-2.5} bg="#FFE3CC" date="28/04" caption="aniversário do brotinho" photo={PHOTO_SELFIE} />
        <MemoryCard rotate={1} bg="#A8D9A6" date="20/04" caption="plantamos juntos 💚" photo={PHOTO_WATER} />
      </div>
    </div>
  );
}

function NotifCard({ app, time, title, body }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(20px)',
      borderRadius: 16, padding: '12px 14px',
      border: '1px solid rgba(255,255,255,0.15)',
      color: 'white',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, opacity: 0.85 }}>
        <div style={{ width: 18, height: 18, borderRadius: 5, background: '#FF5E84', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>🌱</div>
        <span>{app.toUpperCase()}</span>
        <span style={{ opacity: 0.6, marginLeft: 'auto' }}>{time}</span>
      </div>
      <div style={{ fontWeight: 800, fontSize: 14, marginTop: 6 }}>{title}</div>
      <div style={{ fontSize: 13, opacity: 0.9, fontWeight: 500, marginTop: 2, lineHeight: 1.3 }}>{body}</div>
    </div>
  );
}

export function NotificationScreen() {
  return (
    <div className="brotou" style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #2A1810 0%, #4A2418 50%, #6B2C1C 100%)',
      padding: '60px 16px 20px', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative',
    }}>
      <div style={{ textAlign: 'center', color: 'white', marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 72, fontWeight: 400, letterSpacing: -2, lineHeight: 1 }}>14:32</div>
        <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginTop: 4 }}>quinta, 12 de junho</div>
      </div>

      <NotifCard app="brotinho" time="agora" title="O Léo regou a Verdinha 💧" body="Sua vez de dar sol? Ela tá te esperando ☀️" />
      <NotifCard app="brotinho" time="2h" title="Verdinha quer falar com você 🌱" body={'"Saudade da Ana... cadê ela?"'} />
      <NotifCard app="brotinho" time="ontem" title="🎉 47 dias de streak!" body="Vocês são a melhor dupla. Verdinha tá orgulhosa." />
    </div>
  );
}
