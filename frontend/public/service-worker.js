// Service Worker para PWA - Service Desk App
const CACHE_NAME = 'servicedesk-v1';
const OFFLINE_URL = '/offline.html';

// Assets estáticos para cachear
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
];

// Install event - cachear assets estáticos
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.error('[ServiceWorker] Cache addAll error:', error);
        // Continue even if some assets fail to cache
      });
    })
  );
  
  // Force waiting service worker to become active
  self.skipWaiting();
});

// Activate event - limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim clients immediately
  self.clients.claim();
});

// Fetch event - estrategia de caché
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests que no sean HTTP(S)
  if (!request.url.startsWith('http')) {
    return;
  }

  // Estrategia para assets estáticos: Cache First
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Estrategia para API calls: Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Estrategia para navegación: Network First con fallback a offline
  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request));
    return;
  }

  // Por defecto: Network First
  event.respondWith(networkFirst(request));
});

// Estrategia: Cache First (para assets estáticos)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    console.log('[ServiceWorker] Cache hit:', request.url);
    return cachedResponse;
  }

  console.log('[ServiceWorker] Fetching:', request.url);
  
  try {
    const networkResponse = await fetch(request);
    
    // Solo cachear respuestas exitosas
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[ServiceWorker] Fetch error:', error);
    // Intentar devolver algo del caché
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Fallback genérico
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Estrategia: Network First (para contenido dinámico)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cachear respuestas exitosas
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si es API, devolver error JSON
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Sin conexión. Los datos no están disponibles offline.' 
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
  }
}

// Handler especial para navegación
async function navigationHandler(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Navigation offline, showing offline page');
    
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(OFFLINE_URL);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback HTML si no hay offline.html
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sin conexión - Service Desk</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-align: center;
              padding: 2rem;
            }
            .container {
              max-width: 500px;
            }
            h1 {
              font-size: 3rem;
              margin: 0 0 1rem;
            }
            p {
              font-size: 1.2rem;
              margin: 0 0 2rem;
              opacity: 0.9;
            }
            button {
              background: white;
              color: #667eea;
              border: none;
              padding: 1rem 2rem;
              font-size: 1rem;
              font-weight: 600;
              border-radius: 8px;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📡 Sin conexión</h1>
            <p>No hay conexión a Internet. Por favor, verifica tu conexión e intenta nuevamente.</p>
            <button onclick="window.location.reload()">Reintentar</button>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Background Sync (opcional - para reportes offline)
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Sync event:', event.tag);
  
  if (event.tag === 'sync-reports') {
    event.waitUntil(syncReports());
  }
});

async function syncReports() {
  // TODO: Implementar sincronización de reportes offline
  console.log('[ServiceWorker] Syncing offline reports...');
}

// Push Notifications (opcional)
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Service Desk';
  const options = {
    body: data.body || 'Nueva notificación',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [200, 100, 200],
    data: data.url || '/',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
