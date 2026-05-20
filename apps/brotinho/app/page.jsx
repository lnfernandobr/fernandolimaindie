'use client';

import { useEffect, useState } from 'react';
import Plant from './components/Plant';
import {
  HomeScreen,
  ChatScreen,
  StagesScreen,
  MemoriesScreen,
} from './components/Screens';

function BrandLogo({ size = 48, color = '#B85539', sprout = true }) {
  return (
    <span style={{
      fontFamily: 'var(--font-brand)', fontSize: size, color, letterSpacing: 0.5,
      lineHeight: 1, display: 'inline-flex', alignItems: 'baseline', gap: size * 0.08,
    }}>
      brotinho
      {sprout && <span style={{ fontSize: size * 0.55, transform: 'translateY(-15%)' }}>🌱</span>}
    </span>
  );
}

function MiniPhone({ width = 252, height = 520, children, rotate = 0 }) {
  return (
    <div style={{
      width, height, transform: `rotate(${rotate}deg)`,
      borderRadius: 28, padding: 6, background: '#2E1A0F',
      boxShadow: '0 24px 60px rgba(46,26,15,0.30), 0 4px 0 rgba(46,26,15,0.5)',
      flexShrink: 0,
    }}>
      <div style={{ width: '100%', height: '100%', borderRadius: 22, overflow: 'hidden', background: 'white', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', width: 14, height: 14, borderRadius: '50%', background: '#2E1A0F', zIndex: 10 }} />
        {children}
      </div>
    </div>
  );
}

const WAITLIST_KEY = 'brotinho_waitlist';
const BASE_COUNT = 1847;

function readWaitlist() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(WAITLIST_KEY) || '[]');
  } catch {
    return [];
  }
}

function formatPhone(raw) {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function PhoneSignup({ buttonText = 'Avisem quando lançar 💌', primary = '#FF3C77', onSubmit }) {
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handle = (e) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) return;
    const all = readWaitlist();
    if (!all.includes(digits)) {
      all.push(digits);
      try {
        localStorage.setItem(WAITLIST_KEY, JSON.stringify(all));
      } catch {}
      if (typeof window.gtag === 'function') window.gtag('event', 'waitlist_signup');
      if (typeof window.fbq === 'function') window.fbq('track', 'Lead');
    }
    setSubmitted(true);
    onSubmit?.(digits);
  };

  if (submitted) {
    return (
      <div style={{
        width: '100%', background: '#2E1A0F', borderRadius: 18, padding: '22px 20px',
        color: '#FFE3CC', textAlign: 'center',
        boxShadow: '0 6px 0 #1a0e07',
        border: '2px solid #2E1A0F',
      }}>
        <div style={{ fontSize: 36 }}>💚</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, marginTop: 6, color: '#fff' }}>
          Tá na lista!
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6, opacity: 0.85, lineHeight: 1.4 }}>
          A gente manda um WhatsApp no <b style={{ color: '#FFB8C8' }}>{formatPhone(phone)}</b><br/>
          quando o brotinho lançar 🌱
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handle} style={{ width: '100%' }}>
      <div style={{
        background: 'white', borderRadius: 18, padding: 6,
        display: 'flex', boxShadow: '0 6px 0 rgba(46,26,15,0.18), 0 12px 32px rgba(255,60,119,0.18)',
        border: '2px solid #2E1A0F',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px 0 12px',
          borderRight: '1.5px solid #FCE2C2',
        }}>
          <span style={{ fontSize: 16 }}>🇧🇷</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#5A3826', fontSize: 14 }}>+55</span>
        </div>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required
          placeholder="(11) 99999-9999"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          style={{
            flex: 1, border: 'none', padding: '14px 10px', fontFamily: 'inherit', fontSize: 15,
            fontWeight: 700, color: '#2E1A0F', outline: 'none', background: 'transparent', minWidth: 0,
          }}
        />
      </div>
      <button type="submit" style={{
        width: '100%', marginTop: 10, background: primary, color: 'white',
        border: 'none', borderRadius: 18, padding: '20px',
        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19,
        boxShadow: '0 6px 0 #B82456, 0 14px 30px rgba(255,60,119,0.35)',
        cursor: 'pointer', letterSpacing: 0.2,
      }}>{buttonText}</button>
    </form>
  );
}

function Step({ n, title, desc, color }) {
  return (
    <div style={{
      display: 'flex', gap: 14, alignItems: 'flex-start',
      background: 'white', padding: '16px 16px', borderRadius: 20,
      border: '2px solid #FCE2C2',
      boxShadow: '0 4px 0 rgba(46,26,15,0.08)',
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 21, background: color,
        color: 'white', fontFamily: 'var(--font-brand)', fontSize: 22,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, boxShadow: '0 3px 0 rgba(46,26,15,0.2)',
      }}>{n}</div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: '#2E1A0F' }}>{title}</div>
        <div style={{ fontSize: 13, color: '#5A3826', fontWeight: 600, marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [count, setCount] = useState(BASE_COUNT);

  useEffect(() => {
    setCount(BASE_COUNT + readWaitlist().length);
  }, []);

  return (
    <div className="brotou landing-root" style={{
      width: '100%', overflow: 'hidden',
      background: 'var(--cream-100)', fontFamily: 'var(--font-body)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 18px', background: '#FFF8EE', borderBottom: '2px solid #FCE2C2',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <BrandLogo size={26} />
        <div style={{
          fontWeight: 800, fontSize: 11, color: '#E83768',
          background: '#FFE9F0', padding: '6px 12px', borderRadius: 999,
          border: '1.5px solid #FFB8C8',
        }}>🚀 LANÇA 05.06</div>
      </div>

      <section style={{
        position: 'relative', padding: '24px 20px 30px',
        background: 'linear-gradient(180deg, #FFF1DA 0%, #FFE3CC 60%, #FFE9F0 100%)',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 20, right: 24, fontSize: 22, opacity: 0.55 }} className="floaty">💕</div>
        <div style={{ position: 'absolute', top: 90, left: 14, fontSize: 18, opacity: 0.5 }}>✿</div>
        <div style={{ position: 'absolute', top: 200, right: 14, fontSize: 12, opacity: 0.5 }}>✦</div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#2E1A0F', color: '#FFE3CC',
            padding: '7px 14px', borderRadius: 999,
            fontSize: 11, fontWeight: 800, letterSpacing: 0.5,
          }}>
            💕 PRA O DIA DOS NAMORADOS
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 800,
            color: '#2E1A0F', marginTop: 16, lineHeight: 0.96, letterSpacing: -1.5,
          }}>
            Cuidem juntos<br/>
            de um <span style={{ color: '#B85539', fontFamily: 'var(--font-brand)', fontWeight: 400 }}>brotinho.</span>
          </h1>

          <p style={{
            fontSize: 16, fontWeight: 600, color: '#5A3826',
            marginTop: 14, lineHeight: 1.4,
          }}>
            Um pet-plantinha pro casal regar, conversar e ver crescer.
            <b style={{ color: '#2E1A0F' }}> 3 minutos por dia, juntos.</b>
          </p>

          <div style={{ marginTop: 22 }}>
            <PhoneSignup buttonText="Avisem quando lançar 💌" />
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, marginTop: 14, fontSize: 12, fontWeight: 700, color: '#5A3826',
          }}>
            <div style={{ display: 'flex' }}>
              {['#FF89A8', '#76C079', '#FFC861', '#7BB8FF'].map((c, i) => (
                <div key={i} style={{ width: 22, height: 22, borderRadius: 11, background: c, border: '2px solid #FFF1DA', marginLeft: i > 0 ? -8 : 0 }}/>
              ))}
            </div>
            <span><b style={{ color: '#E83768' }}>{count.toLocaleString('pt-BR')} casais</b> já na fila</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, position: 'relative', zIndex: 2 }}>
          <MiniPhone width={252} height={520}>
            <HomeScreen plantName="Verdinha" stage="bloom" mood="happy" bubble="Bom dia gente! 🥰" />
          </MiniPhone>
        </div>
      </section>

      <section style={{
        padding: '40px 20px 30px',
        background: '#2E1A0F',
        color: 'white',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 24, right: 28, fontSize: 30, opacity: 0.3 }} className="floaty">💗</div>
        <div style={{ position: 'absolute', bottom: 30, left: -10, fontSize: 80, opacity: 0.07 }}>🌱</div>

        <div style={{ fontSize: 11, letterSpacing: 1.8, color: '#FFB8C8', fontWeight: 800 }}>
          NÃO É UMA PLANTA QUALQUER
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800,
          marginTop: 6, lineHeight: 1.0, letterSpacing: -0.5,
        }}>
          Ela tem humor,<br/>
          tem voz,<br/>
          tem <span style={{ fontFamily: 'var(--font-brand)', color: '#FFB8C8', fontWeight: 400 }}>saudade.</span>
        </h2>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#FFE3CC', marginTop: 12, lineHeight: 1.45 }}>
          Sua plantinha conta quando o outro regou. Manda recado.
          Pede sol. Fica chateada se vocês esqueceram dela.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28, position: 'relative', zIndex: 2 }}>
          <MiniPhone width={236} height={460} rotate={-3}>
            <ChatScreen plantName="Verdinha" />
          </MiniPhone>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <Plant stage="bloom" mood="inLove" size={140} hearts={true} />
        </div>
        <div style={{
          textAlign: 'center', marginTop: 8, fontFamily: 'var(--font-display)',
          fontWeight: 800, fontSize: 18, color: '#FFB8C8',
        }}>
          &quot;Léo, cadê você? Tô com saudade 🥺&quot;
        </div>
      </section>

      <section style={{ padding: '40px 20px 24px' }}>
        <div style={{ fontSize: 11, letterSpacing: 1.8, color: '#B85539', fontWeight: 800 }}>
          EM 30 SEGUNDOS
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800,
          color: '#2E1A0F', marginTop: 4, lineHeight: 1.05, letterSpacing: -0.5,
        }}>
          Como vocês começam.
        </h2>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Step n="1" title="Convide seu par" desc="Um código bobinho tipo AMOR-247. Vocês entram no mesmo broto." color="#FF89A8" />
          <Step n="2" title="Plantem a sementinha" desc="Escolham um nome — pronto, ela é de vocês dois." color="#FFC861" />
          <Step n="3" title="Cuidem todo dia" desc="Um rega, o outro dá sol, os dois conversam. Streak 🔥" color="#76C079" />
          <Step n="4" title="Vejam ela florescer" desc="6 meses pra chegar na fase Florida. Igual vocês." color="#FF5E84" />
        </div>
      </section>

      <section style={{
        margin: '0 14px', borderRadius: 28, padding: '32px 20px',
        background: 'linear-gradient(160deg, #FFF1DA, #FFE3CC)',
        border: '2px solid #FCE2C2', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ fontSize: 11, letterSpacing: 1.8, color: '#2F7A47', fontWeight: 800 }}>5 FASES</div>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
          color: '#2E1A0F', marginTop: 4, lineHeight: 1.0, letterSpacing: -0.5,
        }}>
          Crescem juntos —<br/>vocês e ela.
        </h2>

        <div style={{
          display: 'flex', gap: 4, alignItems: 'flex-end', marginTop: 22,
          background: 'white', borderRadius: 18, padding: 12,
          border: '2px solid #FCE2C2', overflow: 'hidden',
        }}>
          {[
            { s: 'seed',   l: 'dia 1' },
            { s: 'sprout', l: 'dia 7' },
            { s: 'kid',    l: 'dia 30' },
            { s: 'adult',  l: 'dia 90' },
            { s: 'bloom',  l: '180 🌸' },
          ].map((it) => (
            <div key={it.s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
              <div style={{ width: 60, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plant stage={it.s} mood={it.s === 'bloom' ? 'inLove' : 'happy'} size={64} wobble={false}/>
              </div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#8E6B4F', marginTop: 6 }}>{it.l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <MiniPhone width={230} height={470} rotate={2}>
            <StagesScreen />
          </MiniPhone>
        </div>
      </section>

      <section style={{ padding: '40px 20px 24px' }}>
        <div style={{ fontSize: 11, letterSpacing: 1.8, color: '#E83768', fontWeight: 800 }}>
          MEMÓRIAS DE VOCÊS
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
          color: '#2E1A0F', marginTop: 4, lineHeight: 1.0, letterSpacing: -0.5,
        }}>
          Cada momento<br/>vira um postcard.
        </h2>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#5A3826', marginTop: 10, lineHeight: 1.45 }}>
          A primeira folha. O dia que floresceu. O bilhete do Léo.
          Tudo guardado num álbum só de vocês 💌
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}>
          <MiniPhone width={232} height={460} rotate={-2}>
            <MemoriesScreen />
          </MiniPhone>
        </div>
      </section>

      <section style={{ padding: '20px 20px 36px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #FF5E84, #FF3C77)',
          borderRadius: 24, padding: 26, color: 'white', position: 'relative', overflow: 'hidden',
          boxShadow: '0 8px 0 #B82456',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 100, opacity: 0.2 }}>🔥</div>
          <div style={{ fontSize: 11, letterSpacing: 1.8, color: '#FFE3CC', fontWeight: 800 }}>STREAK DO AMOR</div>
          <div style={{
            fontFamily: 'var(--font-brand)', fontSize: 88, color: 'white',
            lineHeight: 0.9, marginTop: 6,
          }}>
            47<span style={{ fontSize: 32 }}> dias</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#FFE3CC', marginTop: 4 }}>
            que vocês não falham com a Verdinha.<br/>
            <span style={{ color: 'white' }}>Não dá pra quebrar agora.</span>
          </div>
        </div>
      </section>

      <section style={{
        padding: '40px 22px 30px', textAlign: 'center',
        background: 'linear-gradient(180deg, #FFE9F0 0%, #FFB8C8 60%, #FF89A8 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 30, left: 30, fontSize: 28, opacity: 0.5 }} className="floaty">💕</div>
        <div style={{ position: 'absolute', top: 60, right: 24, fontSize: 22, opacity: 0.55 }} className="floaty">💗</div>

        <div style={{ display: 'inline-block', marginBottom: 8 }}>
          <Plant stage="bloom" mood="inLove" size={140} hearts={true}/>
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800,
          color: '#2E1A0F', lineHeight: 1.0, letterSpacing: -0.8,
        }}>
          Plantem algo juntos<br/>
          em <span style={{ fontFamily: 'var(--font-brand)', color: '#B82456', fontWeight: 400 }}>05.06.</span>
        </h2>
        <p style={{ fontSize: 14, color: '#2E1A0F', fontWeight: 700, marginTop: 10, opacity: 0.85 }}>
          Lançamento 05 de junho · Android · grátis
        </p>

        <div style={{ marginTop: 24, position: 'relative', zIndex: 2 }}>
          <PhoneSignup buttonText="Quero plantar 🌱" />
        </div>

        <div style={{ marginTop: 16, fontSize: 12, fontWeight: 700, color: '#5A3826' }}>
          a gente avisa por WhatsApp — sem spam, prometemos 💚
        </div>
      </section>

      <footer style={{
        padding: '24px 20px 28px', background: '#2E1A0F', color: '#FFE3CC',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <BrandLogo size={28} color="#FFB8C8" />
        <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <a href="https://instagram.com/brotinhogame" style={{ color: 'inherit' }}>@brotinhogame</a>
          <span>·</span>
          <a href="mailto:oi@brotinho.app" style={{ color: 'inherit' }}>oi@brotinho.app</a>
        </div>
      </footer>
    </div>
  );
}
