# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Finsweet Developer Starter template for Webflow projects using TypeScript/JavaScript. It's configured for both client projects and internal development with a focus on building and bundling code that runs in Webflow sites.

## Package Manager

**IMPORTANT**: This project requires `pnpm` (version 10+). Never use `npm` or `yarn`.

```bash
# Install dependencies
pnpm install

# First time with Playwright
pnpm playwright install
```

## Development Commands

### Building & Development
- `pnpm dev` - Start development mode with live reload server on http://localhost:3000
- `pnpm build` - Build for production (output to `dist/`)
- `pnpm check` - Type-check TypeScript without emitting files
- `pnpm lint` - Run ESLint and Prettier checks
- `pnpm lint:fix` - Auto-fix ESLint issues
- `pnpm format` - Format all files with Prettier

### Testing
- `pnpm test` - Run Playwright tests (automatically starts dev server)
- `pnpm test:ui` - Run tests with Playwright UI mode

### Other
- `pnpm changeset` - Create a changeset for version management
- `pnpm update` - Interactive dependency update UI

## Architecture

### Build System
The build configuration is in `bin/build.js` using **esbuild** as the bundler.

- **Entry points** are defined in the `ENTRY_POINTS` array in `bin/build.js`
- Currently configured entry points: `src/index.ts` and `src/homepage-animations.js`
- The bundler supports both TypeScript and JavaScript files
- CSS files can be imported in JS/TS files or added as entry points directly
- Dev mode enables live reloading and serves files at http://localhost:3000
- Production builds are minified and output to `dist/`

**Adding new entry points**: Edit the `ENTRY_POINTS` array in `bin/build.js`:
```javascript
const ENTRY_POINTS = [
  'src/index.ts',
  'src/homepage-animations.js',
  'src/new-feature.ts'  // Add here
];
```

### Webflow Integration Pattern
The main entry point (`src/index.ts`) follows the Webflow integration pattern:
```typescript
window.Webflow ||= [];
window.Webflow.push(() => {
  // Your code runs after Webflow is ready
});
```

### Path Aliases
Path aliases are configured in `tsconfig.json`:
- `$utils/*` maps to `src/utils/*`

When adding new aliases:
1. Update `tsconfig.json` `paths` configuration
2. The bundler automatically resolves these aliases

### Project Structure
```
src/
  index.ts              # Main Webflow entry point
  homepage-animations.js # Homepage-specific animations (GSAP/ScrollTrigger)
  utils/               # Shared utilities (use $utils/* alias)
    greet.ts          # Example utility

bin/
  build.js            # esbuild configuration
  live-reload.js      # Dev server live reload script

tests/
  *.spec.ts          # Playwright test files
```

### Testing Setup
- Tests are in `/tests` directory
- Playwright is configured to test across Chromium, Firefox, and WebKit
- Dev server automatically starts when running tests (configured in `playwright.config.ts`)
- Default test example should be replaced with real tests

### TypeScript Configuration
- Extends `@finsweet/tsconfig`
- Uses `@finsweet/ts-utils` for Webflow-specific utilities (e.g., `getPublishDate()`)
- Root directory is project root (not just `src/`)

### Linting & Formatting
- ESLint uses `@finsweet/eslint-config` (imported in `eslint.config.js`)
- Prettier is configured via `.prettierrc`
- Runs automatically in CI on pull requests

## CI/CD Workflow

### Continuous Integration
On pull requests, GitHub Actions runs:
1. Lint & type checking (`pnpm lint` and `pnpm check`)
2. Playwright tests (`pnpm test`)

Workflows are in `.github/workflows/`:
- `ci.yml` - Linting and testing
- `release.yml` - Changesets release automation
- `pages.yml` - GitHub Pages deployment

### Changesets Workflow
1. Create feature branch and make changes
2. Run `pnpm changeset` to document changes
3. Open PR - CI will run automatically
4. After merging, Changesets bot opens a version bump PR
5. Merge the version bump PR to publish (if `NPM_TOKEN` is configured)

## Important Notes

- Always use path aliases (e.g., `$utils/*`) for cleaner imports
- Development server serves files from http://localhost:3000 - use this URL in Webflow during development
- Live reload is enabled by default in dev mode
- Production builds target ES2020, dev builds target ESNext
- The repository uses Finsweet's shared configurations for TypeScript, ESLint, and Changesets
