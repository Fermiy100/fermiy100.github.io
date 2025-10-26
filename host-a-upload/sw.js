// Service Worker for School Meals App
// Version: 2.0 - Production Ready

const CACHE_NAME = 'school-meals-v2.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/index.php',
    '/assets/index-a7cac036.js',
    '/assets/index-924301c3.css',
    '/assets/logo-bf48ba68-4d32ac02-4d32ac02.svg',
    '/api/health.php',
    '/api/menu.php'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.log('Cache install failed:', error);
            })
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                
                return fetch(event.request).then(response => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
            .catch(error => {
                console.log('Fetch failed:', error);
                // Return offline page or fallback
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

function doBackgroundSync() {
    // Handle background sync for offline orders
    return Promise.resolve();
}

// Push notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Новое уведомление от системы школьного питания',
        icon: '/assets/logo-bf48ba68-4d32ac02-4d32ac02.svg',
        badge: '/assets/logo-bf48ba68-4d32ac02-4d32ac02.svg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Открыть приложение',
                icon: '/assets/logo-bf48ba68-4d32ac02-4d32ac02.svg'
            },
            {
                action: 'close',
                title: 'Закрыть',
                icon: '/assets/logo-bf48ba68-4d32ac02-4d32ac02.svg'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Школьное питание', options)
    );
});

// Notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
