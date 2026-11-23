# lib

Each folder under `lib/` is a deep module. Its public surface is its root files; anything in a subfolder (for example `lib/email/templates/`) is private.

Import only through a package's root files. Do not add barrel files that re-export a subtree; expose several small root files instead.

`bun run lint:boundaries` enforces this with dependency-cruiser (config in `.dependency-cruiser.cjs`):

- Code outside a package may import only its root files, never its subfolders.
- A package's own files import each other freely.
- No dependency cycles.

Existing violations are baselined in `.dependency-cruiser-known-violations.json`. Do not add to it; fix the import instead.
