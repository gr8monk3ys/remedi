# Changelog

## [1.3.0](https://github.com/gr8monk3ys/remedi/compare/v1.2.3...v1.3.0) (2026-09-12)


### Features

* **billing:** reconcile subscriptions against Stripe on a schedule ([#136](https://github.com/gr8monk3ys/remedi/issues/136)) ([6c6ba9a](https://github.com/gr8monk3ys/remedi/commit/6c6ba9af1478d8fa69545041d393ed57573cf5ac))
* **ops:** poll production, and open an issue when it stops answering ([#158](https://github.com/gr8monk3ys/remedi/issues/158)) ([3943c38](https://github.com/gr8monk3ys/remedi/commit/3943c386abe9caff5308406d3326af9fce68c4fc))


### Bug Fixes

* **ai:** consult the recorded forbidden pairs on the AI path too ([#124](https://github.com/gr8monk3ys/remedi/issues/124)) ([747b0f2](https://github.com/gr8monk3ys/remedi/commit/747b0f282081ce1e638bc52f0c5e0475b3615eda))
* **ai:** let AI results carry the label the policy already certified ([#150](https://github.com/gr8monk3ys/remedi/issues/150)) ([ff3dc3c](https://github.com/gr8monk3ys/remedi/commit/ff3dc3c9c0e7b4fe0d5b560b195f8c252462e2f7))
* **ai:** report an unconfigured AI search honestly, and stop latching it off ([#153](https://github.com/gr8monk3ys/remedi/issues/153)) ([802d423](https://github.com/gr8monk3ys/remedi/commit/802d423ce6d22b0bc3faa85bcea1c17d60e6bc45))
* **ai:** stop the AI subsystem reporting an outage as an answer ([#128](https://github.com/gr8monk3ys/remedi/issues/128)) ([7f2f9e0](https://github.com/gr8monk3ys/remedi/commit/7f2f9e027e604b58f1bb1328072df435f147a264))
* **api:** rate-limit the three endpoints an anonymous caller can reach ([#127](https://github.com/gr8monk3ys/remedi/issues/127)) ([eaf1f74](https://github.com/gr8monk3ys/remedi/commit/eaf1f74d15dc8349c8b2981d87c739e39b1d9e3c))
* **auth:** allow the Clerk domain this deployment actually uses ([#137](https://github.com/gr8monk3ys/remedi/issues/137)) ([d407337](https://github.com/gr8monk3ys/remedi/commit/d407337e0642afe704f405a6ca3383501f2aa451))
* **billing:** an outage is not a denial of entitlement ([#152](https://github.com/gr8monk3ys/remedi/issues/152)) ([871fcf7](https://github.com/gr8monk3ys/remedi/commit/871fcf7874a9004ab9b64d42e60b4b75f8370928))
* **billing:** cancel the Stripe subscription when an account is erased ([#151](https://github.com/gr8monk3ys/remedi/issues/151)) ([5428424](https://github.com/gr8monk3ys/remedi/commit/5428424c2a39f805889323d7a35d124139d2a015))
* **billing:** derive subscription status from Stripe, and stop trials being free forever ([#133](https://github.com/gr8monk3ys/remedi/issues/133)) ([1480e9f](https://github.com/gr8monk3ys/remedi/commit/1480e9fed0e9bb2795c1d3f9503cbf65b91a2390))
* **billing:** stop asserting a subscription is active from a query parameter ([#154](https://github.com/gr8monk3ys/remedi/issues/154)) ([5c07ba4](https://github.com/gr8monk3ys/remedi/commit/5c07ba4051a30509194bc871d6a3797aa0b0d0e4))
* **compare:** keep the claim-limiting label, and stop calling a score a "match" ([#147](https://github.com/gr8monk3ys/remedi/issues/147)) ([382a220](https://github.com/gr8monk3ys/remedi/commit/382a220dbd65971d4c57c572f29baa70e811b27c))
* **db:** stop every build from migrating whatever database it can reach ([#159](https://github.com/gr8monk3ys/remedi/issues/159)) ([d7c9e3e](https://github.com/gr8monk3ys/remedi/commit/d7c9e3ec82c35ee94824d06c0643c1c9570143ef))
* **interactions:** say an unrecognised severity is unknown, not mild ([#146](https://github.com/gr8monk3ys/remedi/issues/146)) ([eb79cdb](https://github.com/gr8monk3ys/remedi/commit/eb79cdbf2de34c1febb1821d03406b55c38a4702))
* **observability:** let Sentry report, and stop it recording health data ([#156](https://github.com/gr8monk3ys/remedi/issues/156)) ([08d3063](https://github.com/gr8monk3ys/remedi/commit/08d30637739849d979920637cff151a67f3e07cf))
* **observability:** make Sentry actually initialise ([#142](https://github.com/gr8monk3ys/remedi/issues/142)) ([5df46a2](https://github.com/gr8monk3ys/remedi/commit/5df46a2265b7b2a89adb593e904652338a64b3bd))
* **ops:** notice when production stops matching main ([#155](https://github.com/gr8monk3ys/remedi/issues/155)) ([e624dc7](https://github.com/gr8monk3ys/remedi/commit/e624dc75766d734648f869958f39c6ef79faa445))
* **pwa:** serve the web app manifest without auth, and fix two Lighthouse audits ([#135](https://github.com/gr8monk3ys/remedi/issues/135)) ([d351d21](https://github.com/gr8monk3ys/remedi/commit/d351d213e10ee90230143185cada4e5d8cd0e7b0))
* **quota:** make usage limits atomic ([#139](https://github.com/gr8monk3ys/remedi/issues/139)) ([7f53a17](https://github.com/gr8monk3ys/remedi/commit/7f53a17d8283c019bbf77043cef661dc41183117))
* **quota:** make usage limits atomic, and stop a crash on the first request of the day ([7f53a17](https://github.com/gr8monk3ys/remedi/commit/7f53a17d8283c019bbf77043cef661dc41183117))
* **remedy:** a database outage is not a missing page ([#148](https://github.com/gr8monk3ys/remedi/issues/148)) ([ceafe45](https://github.com/gr8monk3ys/remedi/commit/ceafe45e9a56540f71089ef29e3bd1f818f76cce))
* **search:** let an OpenFDA outage state itself instead of returning [] ([#119](https://github.com/gr8monk3ys/remedi/issues/119)) ([9b1fb31](https://github.com/gr8monk3ys/remedi/commit/9b1fb3102691955e57d9e6a12fb5a0fd4606faab))
* **search:** make the empty state unreachable from a refusal or an outage ([#123](https://github.com/gr8monk3ys/remedi/issues/123)) ([ec29170](https://github.com/gr8monk3ys/remedi/commit/ec291709920e82f7cf1885936f34285cb7716725))
* **search:** put the disclaimer where the recommendations are ([#149](https://github.com/gr8monk3ys/remedi/issues/149)) ([da6f3e0](https://github.com/gr8monk3ys/remedi/commit/da6f3e01afefddafa1c2c86e93bfb097180cedb2))
* **security:** make the public-route allowlist precise, and testable ([#134](https://github.com/gr8monk3ys/remedi/issues/134)) ([f86f0b6](https://github.com/gr8monk3ys/remedi/commit/f86f0b6272168b95ad2b282b982b994009e7cb3d))
* **security:** stop Session Replay recording users' health data ([#130](https://github.com/gr8monk3ys/remedi/issues/130)) ([d3a88f6](https://github.com/gr8monk3ys/remedi/commit/d3a88f67d5238bee156457f6b58d79e0ea354a82))


### Performance Improvements

* let the hero be eligible for LCP, and keep the onboarding wizard out of the initial bundle ([04e3a32](https://github.com/gr8monk3ys/remedi/commit/04e3a323d1a17dfc502edc7a7534bd389e67414e))
* let the hero be eligible for LCP, and lazy-load the onboarding wizard ([#140](https://github.com/gr8monk3ys/remedi/issues/140)) ([04e3a32](https://github.com/gr8monk3ys/remedi/commit/04e3a323d1a17dfc502edc7a7534bd389e67414e))

## [1.2.3](https://github.com/gr8monk3ys/remedi/compare/v1.2.2...v1.2.3) (2026-09-07)

### Bug Fixes

- **search:** answer from the record that has mappings, not the first hit ([#117](https://github.com/gr8monk3ys/remedi/issues/117)) ([1567905](https://github.com/gr8monk3ys/remedi/commit/156790536229121a46b1d9b04ae06eb2043ac30a))

## [1.2.2](https://github.com/gr8monk3ys/remedi/compare/v1.2.1...v1.2.2) (2026-09-07)

### Bug Fixes

- **search:** let the primary search path state a policy refusal ([#114](https://github.com/gr8monk3ys/remedi/issues/114)) ([3959fd7](https://github.com/gr8monk3ys/remedi/commit/3959fd72a93e58e5d1b5a2528f422c219f95403c))
- **seed:** report the catalogue it actually has, and name what it drops ([#115](https://github.com/gr8monk3ys/remedi/issues/115)) ([ef1c151](https://github.com/gr8monk3ys/remedi/commit/ef1c1513758042d2da3fb9b0461834b4f91237ce))
- **seed:** separate the catalogue from the demo fixtures ([#112](https://github.com/gr8monk3ys/remedi/issues/112)) ([9c02157](https://github.com/gr8monk3ys/remedi/commit/9c02157824d786e1c9ea78ac884151d8a95791e3)), closes [#111](https://github.com/gr8monk3ys/remedi/issues/111)

## [1.2.1](https://github.com/gr8monk3ys/remedi/compare/v1.2.0...v1.2.1) (2026-09-04)

### Bug Fixes

- **safety:** match a recorded interaction by phrase, not by loose words ([#106](https://github.com/gr8monk3ys/remedi/issues/106)) ([3a98471](https://github.com/gr8monk3ys/remedi/commit/3a984715e22fd0ef740e14aa4b4bda3a16cdb83e))
- **safety:** route every write path through the policy gate ([#99](https://github.com/gr8monk3ys/remedi/issues/99)) ([785be9f](https://github.com/gr8monk3ys/remedi/commit/785be9f6ffa53fb403c3764a0ed7bb53276c3a69))
- **safety:** source forbidden pairs from the recorded Drug Interactions ([#98](https://github.com/gr8monk3ys/remedi/issues/98)) ([06c2975](https://github.com/gr8monk3ys/remedi/commit/06c2975caaa5702f1b6e58c35d408474698305fb))
- **safety:** unmap the SSRI class, not just the one pair we recorded ([#110](https://github.com/gr8monk3ys/remedi/issues/110)) ([97dd647](https://github.com/gr8monk3ys/remedi/commit/97dd64743734b910918586e23aa05e2998de2f3e))

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
