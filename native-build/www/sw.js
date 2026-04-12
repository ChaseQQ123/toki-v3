// TOKI V3 Service Worker - PWA离线支持

const CACHE_NAME = 'toki-v3-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/video-call.html',
    '/video-call-spark.html',
    '/manifest.json'
];

// 安装Service Worker
self.addEventListener('install', (event) => {
    console.log('✅ Service Worker 安装中...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 缓存文件');
                return cache.addAll(urlsToCache);
            })
    );
});

// 激活Service Worker
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker 已激活');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ 删除旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 拦截请求
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 缓存命中，返回缓存
                if (response) {
                    return response;
                }
                
                // 没有缓存，从网络获取
                return fetch(event.request).then((response) => {
                    // 检查是否是有效响应
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // 克隆响应
                    const responseToCache = response.clone();
                    
                    // 添加到缓存
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    
                    return response;
                });
            })
    );
});

// 处理推送通知
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'TOKI有新消息',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🤖</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🤖</text></svg>',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('TOKI', options)
    );
});

console.log('🚀 TOKI V3 Service Worker 已加载');
