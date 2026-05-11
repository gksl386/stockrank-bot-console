// public/sw.js — Service Worker (PWA installability + 오프라인 캐시).
// 정적 자산 precache + 페이지 network-first(실패 시 cache). API 호출은 캐시 우회.

const CACHE_NAME = 'stockrank-botconsole-v2';
const PRECACHE = [
  '/',
  '/bots',
  '/schedules',
  '/budget',
  '/queue',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE).catch(() => {})),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // API / 백엔드 호출은 캐시 우회 (항상 네트워크).
  if (url.pathname.startsWith('/api/') || url.hostname.includes('stockrank-bot-api') || url.hostname.endsWith('run.app')) {
    return;
  }
  // 페이지/정적 자산: network-first, 실패 시 cache fallback.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/'))),
  );
});
