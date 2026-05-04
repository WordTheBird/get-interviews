# AI Assistant Rules File

These standing instructions guided the AI assistant throughout this project's
development.

## Technology Constraints

- Frontend: HTML, CSS, vanilla JavaScript only — no React, Vue, or other
  frameworks.
- Styling: Tailwind CSS (v3, locally installed). Custom CSS only when Tailwind
  cannot easily express the desired effect (e.g., `@media print`).
- Backend: Node.js with Express; RESTful endpoints under `/api/*`.
- Database: SQLite via `better-sqlite3` (synchronous prepared statements).
- No CDN-loaded libraries — all dependencies installed locally via npm.
- No MVC frameworks, no SSR — keep architecture minimal and explicit.
- AI SDK: `@google/genai` (modern), not the deprecated `@google/generative-ai`.

## Architecture Rules

- Single-page application — one `index.html`, JavaScript-driven view swapping.
- Modular file structure — one route file per resource, one view file per page.
- Always include error handling on API endpoints; return JSON `{ error: "..." }`.
- Use database transactions for any multi-statement write operation.
- Validate required fields on the server, not just the client.
- API routes always return JSON, never HTML — even for errors.

## UX Rules

- Accessibility-first: semantic HTML, proper ARIA labels, keyboard navigability.
- Target Lighthouse Accessibility score of 93+ (achieved 96).
- Keep tone professional throughout the UI.
- Dark mode support with system-preference detection and an explicit toggle.
- No browser `alert`/`confirm`/`prompt` dialogs in user-facing flows. Use
  custom toasts and modals — works consistently in both browser and Electron.
- Loading states on async actions (button disable + label change).
- Toast feedback for success and error states.

## Security Rules

- Never expose API keys to the browser. AI requests are proxied through the
  backend, which reads the key from the database (or `.env` in dev).
- Always escape user-supplied content before injecting via `innerHTML`. Use
  the shared `escapeHtml()` helper.
- Use parameterized SQL queries, never string concatenation.
- `.env` file must remain in `.gitignore` — never commit secrets.

## Code Style

- Comment non-obvious logic and mark significant AI-assisted sections.
- Prefer async/await over callback chains.
- Group related routes in a single file (one file per resource).
- Use Tailwind component classes (`@layer components`) for repeated patterns
  like `.btn-primary`, `.input`, `.label`. Centralize dark-mode variants there.

## Honesty Rules

- Ask before assuming a major architectural choice.
- Suggest deprecation/migration paths when relevant.
- When the human reports a bug, gather diagnostic info before guessing a fix.

## Workflow Rules

- One phase at a time — generate code in cohesive chunks, test, then proceed.
- Commit after each successful phase to preserve recoverable checkpoints.
- Re-read the assignment specification before declaring a phase complete.