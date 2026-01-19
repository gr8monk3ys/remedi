/**
 * Service Worker for Remedi PWA
 *
 * Provides offline functionality and caching strategies for improved performance.
 * Uses Cache API for asset caching and offline support.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 */

const CACHE_NAME = 'remedi-v1';
const RUNTIME_CACHE = 'remedi-runtime-v1';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Network first, fall back to cache
  networkFirst: async (request) => {
    try {
      const response = await fetch(request);
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
      return response;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      return cachedResponse || caches.match('/offline.html');
    }
  },

  // Cache first, fall back to network
  cacheFirst: async (request) => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const response = await fetch(request);
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
      return response;
    } catch (error) {
      return caches.match('/offline.html');
    }
  },
};

// Install event - cache precache assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with appropriate caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip Chrome extensions and non-http(s) requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Determine caching strategy based on request type
  if (request.method !== 'GET') {
    // Don't cache non-GET requests
    return;
  }

  // API requests: Network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(CACHE_STRATEGIES.networkFirst(request));
    return;
  }

  // Static assets: Cache first
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|avif|woff|woff2)$/)
  ) {
    event.respondWith(CACHE_STRATEGIES.cacheFirst(request));
    return;
  }

  // Pages: Network first
  event.respondWith(CACHE_STRATEGIES.networkFirst(request));
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

// Sync favorites when back online
async function syncFavorites() {
  try {
    // Get pending favorites from IndexedDB or localStorage
    const db = await openDB();
    const pendingSync = await db.getAll('pendingSync');

    for (const item of pendingSync) {
      try {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });

        // Remove from pending after successful sync
        await db.delete('pendingSync', item.id);
      } catch (error) {
        console.error('[SW] Failed to sync item:', item, error);
      }
    }

    console.log('[SW] Favorites synced successfully');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
    throw error; // Retry sync
  }
}

// Helper to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('remedi-db', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingSync')) {
        db.createObjectStore('pendingSync', { keyPath: 'id' });
      }
    };
  });
}

// Push notifications (optional)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);

  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icons/checkmark.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification('Remedi', options));
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event.action);

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[SW] Service worker loaded');
