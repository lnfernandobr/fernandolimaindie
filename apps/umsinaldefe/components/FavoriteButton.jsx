'use client';
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'soulsignal:favorites';

const readFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const writeFavorites = (slugs) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {}
};

export function FavoriteButton({ slug }) {
  const [isFav, setIsFav] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsFav(readFavorites().includes(slug));
  }, [slug]);

  const toggle = () => {
    const current = readFavorites();
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    writeFavorites(next);
    setIsFav(next.includes(slug));
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className={`fav-btn${isFav ? ' fav-btn--active' : ''}`}
      aria-label={isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      aria-pressed={isFav}
    >
      <span aria-hidden="true">{isFav ? '♥' : '♡'}</span>
      {isFav ? 'Salvo' : 'Salvar'}
    </button>
  );
}
