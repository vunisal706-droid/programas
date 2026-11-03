// Service Worker de Programas del cole: funciona sin conexión.
const VERSION = 'v2-b2611032119';
const SHELL = 'programas-shell-' + VERSION, LIBS = 'programas-libs-' + VERSION;
const APP = ['./', './index.html', './app.js', './app2.js', './app3.js', './app4.js', './app5.js', './app6.js', './app7.js', './app8.js', './app9.js', './app10.js', './img/logo-colegio.jpg', './sala.html', './plazos.js', './palancas.js', './manifest.json', './img/junta.jpg', './img/colegio.png', './img/logos-fse-proa.png', './icon-192.png', './icon-512.png'];
const EXT = ['https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js'];
self.addEventListener('install', e => e.waitUntil((async () => {
  const s = await caches.open(SHELL); await Promise.all(APP.map(u => s.add(u).catch(() => {})));
  const l = await caches.open(LIBS); await Promise.all(EXT.map(u => fetch(u).then(r => r.ok && l.put(u, r)).catch(() => {})));
  await self.skipWaiting();
})()));
self.addEventListener('activate', e => e.waitUntil((async () => {
  const ks = await caches.keys(); await Promise.all(ks.filter(k => k.startsWith('programas-') && k !== SHELL && k !== LIBS).map(k => caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (/firebasedatabase\.app$|firebaseio\.com$|googleapis\.com$/.test(u.hostname)) return;
  if (u.origin === location.origin && !/\/img\//.test(u.pathname) && !/\.png$/.test(u.pathname)) {
    e.respondWith(fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(SHELL).then(x => x.put(r, c)); } return res; })
      .catch(() => caches.match(r).then(x => x || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then(x => x || fetch(r).then(res => { if (res.ok || res.type === 'opaque') { const c = res.clone(); caches.open(LIBS).then(k => k.put(r, c)); } return res; })));
});
