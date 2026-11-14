// 서비스 워커 (04 T1-8): 처음 열 때 모든 파일을 미리 받아 두어 오프라인에서도 열리게 함.
// 빌드할 때 vite.config.ts의 serviceWorker 플러그인이 미리 받을 파일 목록과 버전을 채워 dist/sw.js로 내보냅니다.
const PRECACHE = __PRECACHE__;
const CACHE = 'blue-card-' + __VERSION__;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  // 옛 버전 캐시를 지움
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // 페이지: 네트워크가 되면 새것, 안 되면 저장해 둔 index.html
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('./index.html').then((cached) => cached ?? Response.error()),
      ),
    );
    return;
  }

  // 그 밖의 파일: 저장해 둔 것을 먼저, 없으면 받아서 저장
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            void caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
