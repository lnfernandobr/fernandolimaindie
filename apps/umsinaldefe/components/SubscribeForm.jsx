'use client';
import { useState } from 'react';
import { Glyph } from './Glyph.jsx';

export function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [when, setWhen] = useState('manha');
  const [done, setDone] = useState(false);
  const ok = /\S+@\S+\.\S+/.test(email);

  return (
    <section className="section subscribe" id="receber">
      <div className="wrap subscribe-in">
        <div className="subscribe-mark reveal" aria-hidden="true">✦</div>
        <p className="eyebrow reveal"><span className="star">✦</span> Todo dia, de manhã</p>
        <h2 className="display subscribe-title reveal">Um sinal de fé na sua caixa de entrada</h2>
        <p className="subscribe-lead t-soft reveal">
          Um versículo, uma reflexão curta e uma oração. Três minutos pra começar o dia com
          o coração mais leve. Sem barulho, sem cobrança. Quando quiser, é só sair.
        </p>

        {!done ? (
          <form
            className="subscribe-form reveal"
            onSubmit={(e) => { e.preventDefault(); if (ok) setDone(true); }}
          >
            <div className="sub-field">
              <Glyph name="mail" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                aria-label="Seu e-mail"
                required
              />
            </div>
            <div className="sub-when" role="radiogroup" aria-label="Quando receber">
              {[{ k: 'manha', l: 'De manhã' }, { k: 'noite', l: 'À noite' }].map((o) => (
                <button
                  key={o.k}
                  type="button"
                  className={`sub-chip ${when === o.k ? 'on' : ''}`}
                  onClick={() => setWhen(o.k)}
                  role="radio"
                  aria-checked={when === o.k}
                >
                  <Glyph name={o.k === 'manha' ? 'sunrise' : 'stars'} size={16} /> {o.l}
                </button>
              ))}
            </div>
            <button className="btn btn-primary sub-submit" type="submit" disabled={!ok}>
              Quero receber
            </button>
          </form>
        ) : (
          <div className="subscribe-done reveal">
            <span className="sub-check">
              <Glyph name="check" size={22} />
            </span>
            <p className="display">Pronto. Que esses minutos te façam bem.</p>
            <p className="t-soft">
              A partir de amanhã, {when === 'manha' ? 'de manhã' : 'à noite'}, um sinal chega pra você.
            </p>
          </div>
        )}

        <p className="subscribe-note t-faint reveal">Gratuito · interconfessional · sem spam</p>
      </div>
    </section>
  );
}
