# afori-test Tooling Overview

This repository provides a TypeScript-friendly Node.js workspace for agent development, complete with unit testing (Jest), API testing helpers (Supertest), Cypress end-to-end scaffolding, and Socket.IO WebSocket connectivity checks.

## Prerequisites
- Node.js 18 or later (recommended)
- npm 9+ (or a compatible package manager such as pnpm)

## Install dependencies
```bash
npm install
```

## Available scripts
| Script | Description |
| --- | --- |
| `npm run test` | Shortcut for `npm run test:unit`. |
| `npm run test:unit` | Runs Jest against TypeScript sources under `agent/` and `agent/steps/`. |
| `npm run test:api` | Runs Jest focusing on API-oriented tests (matching `*.api.test.ts` or `*.http.test.ts`). |
| `npm run test:cypress` | Executes the Cypress end-to-end suite in headless mode. |
| `npm run test:cypress:open` | Opens the Cypress app for interactive test development. |
| `npm run ws:check` | Runs the Socket.IO connectivity check script in `scripts/ws-check.ts`. |

All scripts rely on TypeScript support powered by `ts-node`/`ts-jest`, so TypeScript files inside the `agent/` tree are picked up automatically.

## Jest configuration
- `jest.config.ts` targets unit tests within `agent/` and `agent/steps/`.
- TypeScript compilation for tests is handled by `ts-jest`, using `tsconfig.jest.json`.
- Add tests in `agent/**/*.test.ts` (or `.api.test.ts` / `.http.test.ts` for API coverage).

## Cypress setup
The Cypress workspace is organized as follows:
- `cypress.config.ts` — Cypress 15.x configuration using the TypeScript runner.
- `cypress/tsconfig.json` — TypeScript configuration for Cypress specs and support files.
- `cypress/e2e/` — Place your end-to-end specs here.
- `cypress/support/` — Customize commands (`commands.ts`) and test hooks (`e2e.ts`).

Run Cypress from the CLI using the scripts above, or import the project in the Cypress app.

## WebSocket utilities
`scripts/ws-check.ts` is a minimal Socket.IO client that verifies a connection to a WebSocket endpoint. Update the placeholder URL and handlers as needed for your project before running `npm run ws:check`.

## TypeScript configuration
- `tsconfig.json` contains the base compiler settings for the workspace.
- `tsconfig.jest.json` inherits from the base config and tunes module resolution for Jest.

## Next steps
From here you can:
1. Flesh out the `agent/` and `agent/steps/` modules.
2. Add unit/API tests alongside the code you create.
3. Build out Cypress specs in `cypress/e2e/` for end-to-end coverage.
4. Configure the WebSocket check to point at your real-time services.

Feel free to adapt the tooling to match your project's architecture.
