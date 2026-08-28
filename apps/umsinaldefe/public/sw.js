/**
 * Estratégia:
 *   /_next/static/  → cache primeiro (o nome do arquivo tem hash, nunca muda)
 *   resto           → rede primeiro, cache só como reserva offline
 *
 * A versão anterior usava cache primeiro pra TUDO, com um nome de cache fixo.
 * Como o nome nunca mudava, a limpeza do "activate" nunca rodava e o visitante
 * que já tinha o site em cache continuava vendo HTML, CSS e ícones antigos pra
 * sempre. Trocar a identidade visual não apareceria pra quem já visitou.
 *
 * Ao mexer nos assets, suba o número de CACHE_NAME: é isso que apaga o cache
 * velho de quem já tem o site instalado.
 */
const CACHE_NAME = 'umsinaldefe-v2';
const PRECACHE = ['/'];

const isImmutable = (url) => url.pathname.startsWith('/_next/static/');

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  const save = (res) => {
    if (res && res.status === 200 && res.type === 'basic') {
      const clone = res.clone();
      caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
    }
    return res;
  };

  // Assets com hash no nome: servir do cache é seguro e instantâneo.
  if (isImmutable(url)) {
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then(save)));
    return;
  }

  // Todo o resto: a rede manda, o cache só cobre a falta de conexão.
  e.respondWith(
    fetch(e.request)
      .then(save)
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match('/'))),
  );
});
