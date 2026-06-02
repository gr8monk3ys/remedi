# Project Rules

This file defines project-specific rules that Claude should follow when working
in this repository. These rules are intended to match the conventions the
codebase actually follows (ESLint, Prettier, and tsconfig are the source of
truth; this file documents them).

## How to Use

These rules are already active for this repository. Update them when the
underlying ESLint / Prettier / tsconfig configuration changes so the two stay
in sync.

---

## Code Style Rules

### TypeScript

```yaml
typescript:
  strict: true # tsconfig.json: strict + all strict* flags
  no_any: warn # @typescript-eslint/no-explicit-any is "warn", not error
  explicit_return_types: false # not enforced; inference is fine
  prefer_const: true
  no_unused_vars: warn # warn, with ^_ ignore pattern for args/vars
```

### Formatting (Prettier 3 defaults — no custom .prettierrc)

```yaml
formatting:
  indent: 2 spaces
  quotes: double
  semicolons: true
  trailing_comma: all
  max_line_length: 80
```

### Naming Conventions

```yaml
naming:
  components: PascalCase
  functions: camelCase
  constants: SCREAMING_SNAKE_CASE
  files:
    components: PascalCase.tsx
    utilities: camelCase.ts
    tests: *.test.ts (unit/Vitest) or *.spec.ts (E2E/Playwright)
```

## Architecture Rules

### File Organization

```yaml
# This project keeps source at the repository root (no src/ directory).
# The "@/*" path alias resolves to "./*" (see tsconfig.json).
structure:
  components: components/
  hooks: hooks/
  utils: lib/
  types: types/
  api: app/api/
  pages: app/
```

### Component Rules

```yaml
components:
  max_lines: 200
  single_responsibility: true
  props_interface: required
  default_exports: false
  memo_threshold: 50_lines
```

### API Rules

```yaml
# Standardized ApiResponse<T> from lib/api/response.ts.
api:
  validation: zod_required
  error_format: "{ success: false, error: { code, message, statusCode } }"
  success_format: "{ success: true, data: T, metadata?: {...} }"
  auth_middleware: required_for_protected # Clerk via proxy.ts
```

## Framework-Specific Rules

### Next.js

```yaml
nextjs:
  version: 16
  router: app
  prefer_server_components: true
  use_server_actions: true
  image_component: next/image
```

### React

```yaml
react:
  hooks_only: true
  no_class_components: true
  use_memo_when: expensive_computation
  use_callback_when: passed_to_memoized_child
```

## Testing Rules

### Unit Tests

```yaml
testing:
  framework: vitest
  coverage_minimum: 80%
  test_file_location: adjacent
  mock_external_deps: true
```

### Test Structure

```yaml
test_structure:
  describe_component: true
  group_by_behavior: true
  use_testing_library: true
  no_implementation_details: true
```

## Security Rules

### General

```yaml
security:
  no_secrets_in_code: true
  validate_all_inputs: true
  sanitize_outputs: true
  use_https_only: true
```

### Authentication

```yaml
auth:
  jwt_in_httponly_cookies: true
  refresh_token_rotation: true
  password_hashing: bcrypt_or_argon2
```

## Documentation Rules

### Code Comments

```yaml
comments:
  when: non_obvious_logic_only
  format: jsdoc_for_public_apis
  no_commented_out_code: true
  no_todo_without_issue: true
```

### README

```yaml
readme:
  required_sections:
    - installation
    - usage
    - configuration
    - contributing
```

## Git Rules

### Commits

```yaml
commits:
  conventional_commits: true
  max_subject_length: 72
  require_body_for_features: true
  sign_commits: preferred
```

### Branches

```yaml
branches:
  main: protected
  naming: feature/*, bugfix/*, hotfix/*
  delete_after_merge: true
```

## Performance Rules

### General

```yaml
performance:
  lazy_load_routes: true
  optimize_images: true
  minimize_bundle: true
  cache_static_assets: true
```

### Database

```yaml
database:
  no_n_plus_one: true
  use_indexes: true
  paginate_lists: true
  connection_pooling: true
```

---

## Rule Priorities

When rules conflict, follow this priority:

1. Security rules (highest)
2. Correctness rules
3. Performance rules
4. Style rules (lowest)

## Exceptions

Document any exceptions to rules here:

```yaml
exceptions:
  - file: legacy/old-component.tsx
    rules_ignored: [max_lines, memo_threshold]
    reason: Legacy code, scheduled for refactor
```

---

## Custom Rules

Add project-specific rules here:

```yaml
custom:
  # Example:
  # always_use_feature_flags: true
  # require_analytics_events: true
```
