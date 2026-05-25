const CACHE_NAME = 'cantina-da-ro-v8';
const urlsToCache = [
  '/cantina_da_ro/',
  '/cantina_da_ro/index.html',
  '/cantina_da_ro/novo-pedido-mobile.html',
  '/cantina_da_ro/relatorios-mobile.html',
  '/cantina_da_ro/validador.html',
  '/cantina_da_ro/assets/css/index.css',
  '/cantina_da_ro/assets/css/novo-pedido-mobile.css',
  '/cantina_da_ro/assets/css/relatorios-mobile.css',
  '/cantina_da_ro/assets/css/validador.css',
  '/cantina_da_ro/assets/js/index.js',
  '/cantina_da_ro/assets/js/novo-pedido-mobile.js',
  '/cantina_da_ro/assets/js/relatorios-mobile.js',
  '/cantina_da_ro/assets/js/validador.js',
  '/cantina_da_ro/manifest.json',
  '/cantina_da_ro/assets/img/logo.png',
  '/cantina_da_ro/assets/img/caldo_costela.png',
  '/cantina_da_ro/assets/img/caldo_feijao.png',
  '/cantina_da_ro/assets/img/caldo_frango.png',
  '/cantina_da_ro/assets/icons/icon-180.png',
  '/cantina_da_ro/assets/icons/icon-192.png',
  '/cantina_da_ro/assets/icons/icon-512.png',
  'https://unpkg.com/lucide@latest/dist/umd/lucide.js',
  'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retorna resposta do cache
        if (response) {
          return response;
        }

        // Clone da requisição
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Verifica se é uma resposta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone da resposta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});
