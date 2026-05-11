// public/sw.js — minimal Service Worker (PWA installability).
// BotConsole은 online 필수이므로 offline cache는 의도적으로 비활성.

const VERSION = 'v0.1.0';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 모든 요청은 네트워크로 (cache 없음).
// 향후 v18-E2에서 오프라인 토스트 또는 stale-while-revalidate 검토.
self.addEventListener('fetch', (event) => {
  // pass-through
});
