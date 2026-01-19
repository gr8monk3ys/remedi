# Bundle Analysis Report

Generated: January 2026

## Summary

| Metric | Value |
|--------|-------|
| Total First Load JS (shared) | 198 kB |
| Vendors Chunk | 196 kB |
| React Chunk | ~44 kB (gzipped) |
| Middleware | 33.7 kB |
| Home Page | 199 kB total |

## Chunk Breakdown

### Shared Chunks (Loaded on Every Page)

| Chunk | Raw Size | Notes |
|-------|----------|-------|
| `vendors-*.js` | 652 KB | Third-party libraries (minified) |
| `react-*.js` | 136 KB | React + React DOM |
| `polyfills-*.js` | 112 KB | Browser polyfills |
| `webpack-*.js` | 4 KB | Webpack runtime |
| `main-app-*.js` | 4 KB | Next.js app router runtime |
| `main-*.js` | 4 KB | Next.js main runtime |

### Page-Specific Chunks

| Page | Size | Total with Shared |
|------|------|-------------------|
| `/` (Home) | 1.23 KB | 199 KB |
| `/remedy/[id]` | 3.46 KB | 201 KB |
| `/legal/*` | 1.58 KB | 200 KB |
| `/_not-found` | 192 B | 198 KB |

### API Routes

All API routes add minimal JavaScript (157 B each) since they run server-side.

## Optimization Status

### Already Implemented

1. **Code Splitting**: Custom webpack splitChunks configuration separating:
   - React into its own chunk
   - Vendors in dedicated chunk
   - Components shared chunk

2. **Package Optimization**:
   - `optimizePackageImports` enabled for `lucide-react` and `framer-motion`
   - Tree-shaking working correctly

3. **Image Optimization**:
   - AVIF/WebP formats enabled
   - Optimized device sizes configured

4. **Dynamic Imports**:
   - SearchComponent lazy-loaded
   - Remedy sections lazy-loaded

### Recommendations

#### High Impact (Do Now)

1. **Consider lighter alternatives to framer-motion** (~50KB)
   - For simple animations, CSS transitions/animations may suffice
   - Header animations could use CSS-only

2. **Audit `lucide-react` imports**
   - Currently optimized but verify only needed icons are imported
   - Consider icon tree-shaking verification

#### Medium Impact (Future)

1. **Add route-based code splitting** for admin section
   - Admin pages should be completely separate chunks
   - Will naturally happen when admin routes are created

2. **Consider lazy-loading authentication components**
   - UserMenu and auth components could be dynamic imports
   - Only load when user interacts with auth

#### Low Impact (Nice to Have)

1. **Investigate vendors chunk composition**
   - 196 KB shared vendors is reasonable for a full-featured app
   - May contain unused code from libraries

## How to Run Analysis

```bash
# Generate bundle analysis reports
ANALYZE=true npm run build

# Reports generated at:
# - .next/analyze/client.html (client-side bundles)
# - .next/analyze/nodejs.html (server-side bundles)
# - .next/analyze/edge.html (edge runtime bundles)

# Open in browser
open .next/analyze/client.html
```

## Performance Metrics

Based on build output:

- **Static Pages**: 15 pages pre-rendered
- **Dynamic Pages**: 8 routes rendered on demand
- **Middleware**: 33.7 KB (reasonable for security features)

## Conclusion

The bundle is well-optimized:
- First load JS of ~200 KB is reasonable for a full-featured Next.js app
- Code splitting is working correctly
- Package imports are optimized
- Main improvement opportunity: Consider CSS-only animations for header
