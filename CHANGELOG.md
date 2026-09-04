# Changelog

## [1.2.0](https://github.com/gr8monk3ys/remedi/compare/v1.1.0...v1.2.0) (2026-09-04)

### Features

- **safety:** make a Replacement Type unforgeable and a refusal explicit ([#96](https://github.com/gr8monk3ys/remedi/issues/96)) ([e5f61f0](https://github.com/gr8monk3ys/remedi/commit/e5f61f0f40b09a29e29b2043800598cbe4a6def5))

### Bug Fixes

- **safety:** key the remedy policy on substance identity, not the label's name ([#94](https://github.com/gr8monk3ys/remedi/issues/94)) ([7d9e79b](https://github.com/gr8monk3ys/remedi/commit/7d9e79b097ab61347f27b90f527f83d2c9f43f2b))

## [1.1.0](https://github.com/gr8monk3ys/remedi/compare/v1.0.0...v1.1.0) (2026-09-03)

### Features

- **ui:** redesign the interface around hairlines, mono labels and one accent ([#81](https://github.com/gr8monk3ys/remedi/issues/81)) ([9d05558](https://github.com/gr8monk3ys/remedi/commit/9d05558f7b24957fdbd1ca4c09a7ba020b0b2406))

### Bug Fixes

- **api:** surface the kit's auth primitives and stop the 401/403 contradiction ([#92](https://github.com/gr8monk3ys/remedi/issues/92)) ([772a4ce](https://github.com/gr8monk3ys/remedi/commit/772a4ce197ff8260bc482b35348c3eced10cb722))
- **db:** scope per-user reads and writes by owner in the query layer ([#90](https://github.com/gr8monk3ys/remedi/issues/90)) ([2b4469f](https://github.com/gr8monk3ys/remedi/commit/2b4469fd277ec74f07a0731d4ec64bbd0ba77a8a))
- **interactions:** make a failed interaction check impossible to read as an all-clear ([#86](https://github.com/gr8monk3ys/remedi/issues/86)) ([add6c26](https://github.com/gr8monk3ys/remedi/commit/add6c26041217df17dc131ba64fd71a43756daa6))
- **remedies:** make the mapping safety rules a rule, not a coincidence ([#87](https://github.com/gr8monk3ys/remedi/issues/87)) ([0abdfcc](https://github.com/gr8monk3ys/remedi/commit/0abdfcc2e503de7e9a492f4fe401f4a2b6a6bb80))
- **search:** stop reporting an outage as "no remedies found" ([#89](https://github.com/gr8monk3ys/remedi/issues/89)) ([6ac75d1](https://github.com/gr8monk3ys/remedi/commit/6ac75d13802ee60cb6ffc7e44065637ffd78dde8))
- **security:** stop trusting a client-supplied cf-connecting-ip for rate limiting ([#82](https://github.com/gr8monk3ys/remedi/issues/82)) ([32a8d47](https://github.com/gr8monk3ys/remedi/commit/32a8d47c4de8f5ff01238ab4f428c7f7ea127956))
- **ui:** load the Tailwind theme for real, and guard the built CSS ([#79](https://github.com/gr8monk3ys/remedi/issues/79)) ([e0c75d3](https://github.com/gr8monk3ys/remedi/commit/e0c75d37db1a04acd36ac0227a154c72686667b0))
- **ui:** make the Tailwind theme actually load and guard the built CSS ([e0c75d3](https://github.com/gr8monk3ys/remedi/commit/e0c75d37db1a04acd36ac0227a154c72686667b0))

## 1.0.0 (2026-08-19)

### Features

- add test coverage for the weekly-digest cron route ([#68](https://github.com/gr8monk3ys/remedi/issues/68)) ([e0e80cf](https://github.com/gr8monk3ys/remedi/commit/e0e80cfb6d2124afc021362e7a9f1422bcc6125d))
- **admin:** add admin console ([63b4c6a](https://github.com/gr8monk3ys/remedi/commit/63b4c6a18cc6f4621cb7223b0d5e3d2f870b0b57))
- **api:** add REST API routes ([1ac7eee](https://github.com/gr8monk3ys/remedi/commit/1ac7eeec7b1daf1c779333548ff3584dfd843af4))
- **app:** add marketing pages for pricing, comparison, and legal ([ee3a29c](https://github.com/gr8monk3ys/remedi/commit/ee3a29cfb692e5b7e14ecc58f8091d8d9ed809ac))
- **app:** add remedy tracking and user dashboard ([848881c](https://github.com/gr8monk3ys/remedi/commit/848881c7985d8d416f109be987ffa9d7c48eebfb))
- **app:** add root layout, landing page, and global styles ([9ca91c2](https://github.com/gr8monk3ys/remedi/commit/9ca91c28d1e8bfc0b3a9b1f790322169874b6993))
- **components:** add reusable UI component library ([e20dfe9](https://github.com/gr8monk3ys/remedi/commit/e20dfe9ebbbe6d9908e0ac12417480d036b9a14f))
- **data:** curate remedy mappings for the 26 drugs that had none ([#73](https://github.com/gr8monk3ys/remedi/issues/73)) ([8e4d051](https://github.com/gr8monk3ys/remedi/commit/8e4d05179d2635f295ca4e29ac545d2b40fafba3))
- **db:** add Prisma schema, migrations, and client config ([f467c85](https://github.com/gr8monk3ys/remedi/commit/f467c8548c5ddc0483cd43e07a9ed1c3ac800458))
- **hooks:** add shared React hooks ([ca980a6](https://github.com/gr8monk3ys/remedi/commit/ca980a66da42388637af56dbfe51c45f8f33ded9))
- **lib:** add core domain logic, auth, and utilities ([654ce0f](https://github.com/gr8monk3ys/remedi/commit/654ce0fc4fd7509fac5a034b229b31e2f3750c04))
- **observability:** add Sentry error monitoring ([e141bc7](https://github.com/gr8monk3ys/remedi/commit/e141bc727e82c0f5d253091b7fdac79d5e34568c))
- **types:** add shared type definitions and request proxy ([82e4916](https://github.com/gr8monk3ys/remedi/commit/82e4916458fa4ab1ec6cf2253a27d6b70003ec70))

### Bug Fixes

- repair safety-critical defects found by a repository audit ([#69](https://github.com/gr8monk3ys/remedi/issues/69)) ([94338f6](https://github.com/gr8monk3ys/remedi/commit/94338f695ade5200357af1eb66256b39c7f72daa))
