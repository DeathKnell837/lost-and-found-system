const CACHE_NAME = 'lost-found-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Static assets to cache (only files that exist)
const STATIC_ASSETS = [
    '/',
    '/offline',
    '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[Service Worker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch((err) => {
                console.log('[Service Worker] Cache failed:', err);
            })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                    .map((name) => {
                        console.log('[Service Worker] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip Chrome extensions and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // API requests - network first, then cache
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/comments/') || url.pathname.startsWith('/claims/')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // HTML pages - network first with offline fallback
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request.clone())
                .then((response) => {
                    // Clone before caching
                    if (response && response.ok) {
                        const responseToCache = response.clone();
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Try cache first
                    return caches.match(request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // Fallback to offline page
                            return caches.match('/offline');
                        });
                })
        );
        return;
    }

    // Static assets - cache first
    if (isStaticAsset(url.pathname)) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // Default - stale while revalidate
    event.respondWith(staleWhileRevalidate(request));
});

// Network first strategy
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        // Return error response for API calls
        return new Response(JSON.stringify({ error: 'Offline', success: false }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Cache first strategy
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        return new Response('Offline', { status: 503 });
    }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request)
        .then((response) => {
            if (response.ok) {
                const cache = caches.open(DYNAMIC_CACHE);
                cache.then(c => c.put(request, response.clone()));
            }
            return response;
        })
        .catch(() => cachedResponse);

    return cachedResponse || fetchPromise;
}

// Check if URL is a static asset
function isStaticAsset(pathname) {
    const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
    return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Sync event:', event.tag);
    if (event.tag === 'sync-reports') {
        event.waitUntil(syncReports());
    }
});

// Sync pending reports when back online
async function syncReports() {
    try {
        // Get pending reports from IndexedDB
        // This would be implemented with actual IndexedDB logic
        console.log('[Service Worker] Syncing pending reports...');
    } catch (error) {
        console.error('[Service Worker] Sync failed:', error);
    }
}

// Push notifications
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push received:', event);
    
    let data = { title: 'Lost & Found', body: 'You have a new notification' };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: '/images/icons/icon-192x192.png',
        badge: '/images/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        },
        actions: [
            { action: 'view', title: 'View' },
            { action: 'close', title: 'Close' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked:', event.action);
    event.notification.close();

    if (event.action === 'view' || !event.action) {
        const url = event.notification.data?.url || '/';
        event.waitUntil(
            clients.matchAll({ type: 'window' })
                .then((clientList) => {
                    // Focus existing window if open
                    for (const client of clientList) {
                        if (client.url === url && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    // Open new window
                    if (clients.openWindow) {
                        return clients.openWindow(url);
                    }
                })
        );
    }
});

console.log('[Service Worker] Loaded');
