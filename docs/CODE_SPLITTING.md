# Code Splitting Guide

This document outlines code splitting strategies implemented in the Remedi application to improve performance and reduce initial bundle size.

## Overview

Code splitting is a technique that splits your code into smaller chunks that can be loaded on demand, improving initial page load times and overall application performance.

## Implementation

### 1. Route-Based Code Splitting

Next.js automatically code-splits at the route level. Each page in the `app` directory is a separate chunk.

**Benefits**:
- Automatic with Next.js App Router
- Users only download code for routes they visit
- Optimal for large applications

**Example**:
```
app/
  page.tsx         → Home chunk
  remedy/
    [id]/
      page.tsx     → Remedy detail chunk
  auth/
    signin/
      page.tsx     → Auth chunk
```

### 2. Component-Level Code Splitting

Heavy or rarely-used components are loaded dynamically using Next.js `dynamic()`.

**Implementation**:

```typescript
import dynamic from 'next/dynamic';

// Basic dynamic import
const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <LoadingSkeleton />,
  ssr: false, // Disable server-side rendering if not needed
});

// With named export
const SearchComponent = dynamic(
  () => import('@/components/ui/search').then((mod) => ({ default: mod.SearchComponent })),
  {
    loading: () => <SearchLoadingSkeleton />,
    ssr: false,
  }
);
```

**Current Implementations**:
- **Homepage** ([app/page.tsx](../app/page.tsx:9-19))
  - `SearchComponent`: Lazy-loaded search interface

- **Remedy Detail** ([components/remedy/](../components/remedy/))
  - `RemedyScientificSection`: Scientific information (collapsed by default)
  - `RelatedRemediesSection`: Related remedies sidebar

### 3. Webpack Chunk Splitting

Advanced chunk splitting configuration in [next.config.ts](../next.config.ts:31-73):

```typescript
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          priority: 20,
        },
        components: {
          test: /[\\/]components[\\/]/,
          name: 'components',
          priority: 15,
          minChunks: 2,
        },
      },
    };
  }
  return config;
};
```

**Chunk Strategy**:
1. **React chunk** (priority 20): React and React-DOM
2. **Components chunk** (priority 15): Shared UI components
3. **Vendors chunk** (priority 10): Third-party libraries
4. **Common chunk** (priority 5): Shared application code

### 4. Package Optimization

Optimize imports for better tree-shaking:

```typescript
experimental: {
  optimizePackageImports: ['lucide-react', 'framer-motion'],
}
```

This reduces bundle size for packages with many exports by only including used components.

## Utilities

### Code Splitting Helper ([lib/code-splitting.ts](../lib/code-splitting.ts))

Provides reusable utilities for consistent code splitting:

```typescript
import { createDynamicComponent, prefetchComponent } from '@/lib/code-splitting';

// Create dynamic component with type safety
const MyComponent = createDynamicComponent(
  () => import('@/components/MyComponent'),
  'MyComponent',
  'clientOnly'
);

// Prefetch on user interaction
<button
  onMouseEnter={() => prefetchComponent(() => import('@/components/heavy'))}
  onClick={handleClick}
>
  Click me
</button>
```

**Available Utilities**:
- `createDynamicComponent`: Type-safe dynamic imports
- `prefetchComponent`: Prefetch components on hover
- `lazyLoadImage`: Lazy load images
- `createIntersectionObserver`: Lazy load on scroll
- Pre-configured loading skeletons

## Best Practices

### 1. When to Use Code Splitting

✅ **Good candidates for code splitting**:
- Large third-party libraries (charts, editors)
- Admin-only features
- Modal/dialog content
- Below-the-fold components
- Scientific/technical information
- Mobile-specific features

❌ **Avoid splitting**:
- Small components (< 50KB)
- Critical UI elements above the fold
- Frequently used components
- Core navigation

### 2. Loading States

Always provide loading states to prevent layout shift:

```typescript
const Component = dynamic(() => import('./Component'), {
  loading: () => <Skeleton />,
});
```

### 3. SSR Considerations

Disable SSR for client-only features:

```typescript
const ClientComponent = dynamic(() => import('./ClientComponent'), {
  ssr: false, // Disable for localStorage, window, etc.
});
```

### 4. Prefetching

Improve UX by prefetching on user interaction:

```typescript
import { prefetchComponent } from '@/lib/code-splitting';

<Link
  href="/heavy-page"
  onMouseEnter={() => prefetchComponent(() => import('./HeavyComponent'))}
>
  Hover to prefetch
</Link>
```

### 5. Bundle Analysis

Analyze bundle size to identify optimization opportunities:

```bash
# Install webpack bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Update next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true npm run build
```

## Performance Metrics

Track these metrics to measure code splitting effectiveness:

### 1. Bundle Sizes
- **First Load JS**: Target < 150KB
- **Route chunks**: Target < 50KB per route
- **Vendor chunk**: Target < 200KB

### 2. Loading Performance
- **FCP** (First Contentful Paint): Target < 1.8s
- **LCP** (Largest Contentful Paint): Target < 2.5s
- **TTI** (Time to Interactive): Target < 3.8s

### 3. Monitoring Tools
- **Lighthouse**: Built into Chrome DevTools
- **WebPageTest**: https://www.webpagetest.org
- **Next.js Analytics**: Vercel deployment metrics

## Testing

### 1. Production Build Testing

Always test in production mode:

```bash
npm run build
npm start
```

Development mode bundles all code together, so testing must be done in production.

### 2. Network Throttling

Test with slow connections:
1. Open Chrome DevTools
2. Network tab → Throttling → Slow 3G
3. Navigate through application

### 3. Code Coverage

Ensure split chunks are actually needed:

```bash
# Run coverage analysis
npm run test:coverage

# Check which code paths are unused
```

## Migration Guide

### Converting Existing Components

**Before**:
```typescript
import { HeavyComponent } from '@/components/HeavyComponent';

export default function Page() {
  return <HeavyComponent />;
}
```

**After**:
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <LoadingSkeleton />,
});

export default function Page() {
  return <HeavyComponent />;
}
```

### Handling Named Exports

```typescript
// Component with named export
const { SearchComponent } = dynamic(
  () => import('@/components/ui/search').then(mod => ({ default: mod.SearchComponent })),
  { loading: () => <SearchLoadingSkeleton /> }
);
```

## Troubleshooting

### Issue: "Cannot access 'X' before initialization"

**Cause**: Circular dependencies between chunks

**Solution**: Review import structure, break circular dependencies

### Issue: Chunk loading failure

**Cause**: Stale cache or network issues

**Solution**:
```typescript
const Component = dynamic(() => import('./Component'), {
  loading: () => <LoadingSkeleton />,
  // Add error boundary
  ssr: false,
});
```

### Issue: Large vendor chunk

**Cause**: Too many third-party dependencies

**Solution**:
1. Review dependencies with `npm ls`
2. Use lighter alternatives
3. Split vendor chunk further in webpack config

## Resources

- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Webpack Code Splitting](https://webpack.js.org/guides/code-splitting/)
- [Web.dev: Code Splitting](https://web.dev/code-splitting-suspense/)
- [React.lazy()](https://react.dev/reference/react/lazy)

## Maintenance

### Regular Reviews

Review bundle sizes monthly:

```bash
# Generate bundle analysis
ANALYZE=true npm run build

# Check for:
# 1. Unexpectedly large chunks
# 2. Duplicate code across chunks
# 3. Opportunities for further splitting
```

### Version Updates

When updating dependencies, check impact on bundle size:

```bash
# Before update
npm run build
# Note bundle sizes

# After update
npm install package@latest
npm run build
# Compare bundle sizes
```

## Future Improvements

Potential enhancements for code splitting:

1. **React Server Components**: Further reduce client JavaScript
2. **Streaming SSR**: Improve perceived performance
3. **Suspense Boundaries**: More granular loading states
4. **Module Federation**: Share code between micro-frontends
5. **Selective Hydration**: Only hydrate interactive components
