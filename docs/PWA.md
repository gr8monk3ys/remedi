# Progressive Web App (PWA) Guide

Remedi is configured as a Progressive Web App, providing app-like functionality including offline support, installability, and push notifications.

## Features

### 1. Installable
Users can install Remedi on their devices from supported browsers:
- **Desktop**: Chrome, Edge, Safari 16.4+
- **Mobile**: Chrome (Android), Safari (iOS 16.4+)

### 2. Offline Support
The service worker caches assets and pages for offline access:
- Static assets (JS, CSS, images)
- Previously visited pages
- API responses (with fallback)
- Custom offline page

### 3. Background Sync
Favorites and user actions sync when connection is restored.

### 4. Push Notifications
(Optional) Receive notifications about new remedies and updates.

## Architecture

### Manifest ([public/manifest.json](../public/manifest.json))

Defines the app's appearance and behavior when installed:

```json
{
  "name": "Remedi - Natural Health Alternatives",
  "short_name": "Remedi",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [...]
}
```

**Key Properties**:
- `display: standalone`: Full-screen app experience
- `start_url`: Landing page when app opens
- `theme_color`: Browser UI color
- `icons`: Multiple sizes for different devices

### Service Worker ([public/sw.js](../public/sw.js))

Handles caching strategies and offline functionality:

#### Caching Strategies

**1. Network First** (API requests, pages):
```javascript
try {
  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
} catch {
  return caches.match(request) || caches.match('/offline.html');
}
```

**2. Cache First** (static assets):
```javascript
const cached = await caches.match(request);
if (cached) return cached;

const response = await fetch(request);
cache.put(request, response.clone());
return response;
```

#### Cache Management

**Precache Assets**:
- `/` (homepage)
- `/manifest.json`
- `/offline.html`

**Runtime Cache**:
- Pages visited by user
- API responses
- Static assets

**Cache Invalidation**:
- Old caches deleted on activation
- Version-based cache names

### PWA Registration ([components/PWARegister.tsx](../components/PWARegister.tsx))

Client-side component that:
- Registers the service worker
- Shows install prompt
- Handles updates
- Manages notifications

## Installation

### For Users

#### Desktop (Chrome/Edge)
1. Visit Remedi
2. Click install icon in address bar
3. Or: Menu → Install Remedi

#### iOS (Safari 16.4+)
1. Visit Remedi
2. Tap Share button
3. Select "Add to Home Screen"

#### Android (Chrome)
1. Visit Remedi
2. Tap "Install" prompt
3. Or: Menu → Install app

### For Developers

PWA is automatically configured. No additional setup needed.

**Build for production**:
```bash
npm run build
npm start
```

Service worker only runs in production mode.

## Testing

### Local Testing

1. Build production version:
```bash
npm run build
npm start
```

2. Open Chrome DevTools
3. Go to **Application** tab
4. Check sections:
   - **Manifest**: Verify manifest.json
   - **Service Workers**: Check registration
   - **Cache Storage**: View cached assets
   - **Offline**: Test offline functionality

### Lighthouse Audit

Run PWA audit:

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --view
```

**Target Scores**:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90
- PWA: 100

### Offline Testing

**Chrome DevTools**:
1. Application → Service Workers
2. Check "Offline"
3. Reload page
4. Should show cached content

**Network Throttling**:
1. Network tab → Throttling
2. Select "Offline"
3. Navigate app

## Manifest Properties

### Required

- `name`: Full app name
- `short_name`: Name for home screen (< 12 chars)
- `start_url`: Launch URL
- `display`: Display mode
- `icons`: Array of icon objects

### Recommended

- `background_color`: Splash screen color
- `theme_color`: Browser UI color
- `description`: App description
- `orientation`: Preferred orientation
- `scope`: Navigation scope

### Advanced

- `screenshots`: App Store screenshots
- `shortcuts`: Quick actions
- `categories`: App categories
- `prefer_related_applications`: Native app preference

## Service Worker Events

### Install
Triggered when service worker is first installed:
```javascript
self.addEventListener('install', (event) => {
  // Precache assets
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(PRECACHE_ASSETS)
    )
  );
});
```

### Activate
Triggered when service worker becomes active:
```javascript
self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key =>
          key !== CACHE_NAME && caches.delete(key)
        )
      )
    )
  );
});
```

### Fetch
Intercepts network requests:
```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // Return cached or fetched response
  );
});
```

### Sync
Background synchronization:
```javascript
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});
```

### Push
Push notifications:
```javascript
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
  };
  event.waitUntil(
    self.registration.showNotification('Remedi', options)
  );
});
```

## Caching Strategies Explained

### 1. Network First (Dynamic Content)
**Use for**: API data, user-specific content

**Pros**: Always fresh data when online
**Cons**: Slower when network is poor

**Best for**: Search results, user profiles

### 2. Cache First (Static Assets)
**Use for**: Images, CSS, JS, fonts

**Pros**: Fast loading, works offline
**Cons**: May serve stale content

**Best for**: Logos, stylesheets, libraries

### 3. Stale While Revalidate
**Use for**: Frequently updated content

**Pros**: Fast + fresh
**Cons**: Complex to implement

**Best for**: News feeds, remedy data

### 4. Network Only
**Use for**: Real-time data, analytics

**Pros**: Always fresh
**Cons**: Fails offline

**Best for**: Analytics, live chat

### 5. Cache Only
**Use for**: App shell

**Pros**: Instant loading
**Cons**: Never updates

**Best for**: App skeleton, core UI

## Debugging

### Common Issues

**Issue**: Service worker not registering

**Solution**:
- Check HTTPS (required for SW)
- Verify `/sw.js` is accessible
- Check browser console for errors
- Ensure production build

**Issue**: Cache not updating

**Solution**:
- Increment cache version
- Clear cache manually
- Check update logic in `activate` event

**Issue**: Offline page not showing

**Solution**:
- Verify `/offline.html` in precache
- Check fetch event logic
- Test with DevTools offline mode

### DevTools Tips

**Application Tab**:
- **Clear Storage**: Reset all PWA data
- **Update on Reload**: Test updates easily
- **Bypass for Network**: Ignore cache
- **Unregister**: Remove service worker

**Console Filters**:
```javascript
// Show only SW logs
[SW]

// Show only cache operations
Cache
```

## Best Practices

### 1. Cache Management
- Use versioned cache names
- Delete old caches on activate
- Limit cache size (< 50MB recommended)
- Cache essential assets only

### 2. Update Strategy
- Check for updates periodically
- Notify users of updates
- Use `skipWaiting()` for critical fixes
- Test update flow thoroughly

### 3. Offline Experience
- Provide custom offline page
- Cache user's recent activity
- Show offline indicator
- Queue actions for sync

### 4. Performance
- Minimize service worker code
- Use efficient caching strategies
- Prefetch critical resources
- Monitor cache hit rates

### 5. Security
- Only cache HTTPS resources
- Validate cached responses
- Use CSP headers
- Sanitize user data before caching

## Advanced Features

### Background Sync

Queue actions when offline:

```javascript
// Register sync
navigator.serviceWorker.ready.then(registration => {
  registration.sync.register('sync-favorites');
});

// Handle in service worker
self.addEventListener('sync', async (event) => {
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});
```

### Push Notifications

Request permission and subscribe:

```javascript
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    // Subscribe to push
    navigator.serviceWorker.ready.then(registration => {
      registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: PUBLIC_KEY
      });
    });
  }
});
```

### Periodic Background Sync

Update data in background:

```javascript
// Register periodic sync
navigator.serviceWorker.ready.then(registration => {
  registration.periodicSync.register('update-remedies', {
    minInterval: 24 * 60 * 60 * 1000 // 24 hours
  });
});
```

## Monitoring

### Key Metrics

1. **Install Rate**: % of users installing
2. **Retention**: Active users after install
3. **Offline Usage**: Offline page views
4. **Cache Hit Rate**: Cached vs network requests
5. **Service Worker Errors**: Registration/fetch failures

### Analytics Integration

Track PWA-specific events:

```javascript
// Track install
window.addEventListener('appinstalled', () => {
  gtag('event', 'pwa_install');
});

// Track offline usage
if (!navigator.onLine) {
  gtag('event', 'offline_usage');
}
```

## Resources

- [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web.dev: PWA](https://web.dev/progressive-web-apps/)
- [Google: Workbox](https://developers.google.com/web/tools/workbox)
- [PWA Builder](https://www.pwabuilder.com/)
- [Can I Use: Service Workers](https://caniuse.com/serviceworkers)

## Checklist

Before deploying PWA:

- [ ] Manifest.json configured
- [ ] Service worker registered
- [ ] HTTPS enabled
- [ ] Icons generated (all sizes)
- [ ] Offline page created
- [ ] Install prompt implemented
- [ ] Update notification added
- [ ] Cache strategy tested
- [ ] Lighthouse audit passed
- [ ] Cross-browser testing complete
- [ ] Analytics tracking configured
