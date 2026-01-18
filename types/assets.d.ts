/**
 * Ambient declarations for non-code side-effect imports.
 *
 * TypeScript 6 (TS2882) errors on side-effect imports of modules it cannot
 * resolve to a type, including stylesheet imports such as
 * `import "./globals.css"`. These declarations tell TypeScript to treat such
 * imports as side-effect-only modules. The bundler (Turbopack/webpack) handles
 * the actual asset loading at build time.
 */

declare module "*.css";
