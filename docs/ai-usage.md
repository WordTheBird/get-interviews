# AI Usage Documentation

## Statement

This document details how generative AI was used during the development of
*Get Interviews*, in compliance with the CSC3100 Final Project AI policy.

---

## 1. AI Tools Used

### Development Assistance

- **Anthropic Claude** — Primary assistant throughout the project. 
- Used for architectural guidance, some code generation,
- debugging, refactoring, and documentation drafting.

### Runtime Feature

- **Google Gemini** (`gemini-2.5-flash` via the `@google/genai` Node SDK) —
  Powers the in-app "Get AI Suggestion" feature, which rewrites user-provided
  job responsibilities and award descriptions with stronger phrasing.

### Tools NOT Used

- No MCP (Model Context Protocol) servers were configured.
- No autonomous coding agents (e.g., Cursor agents, Devin) were used.
- All AI interaction was through standard chat interfaces — copy/paste, not
  IDE integration.

---

## 2. Workflow

I followed a **chat-based, phase-by-phase iterative workflow** rather than
single large prompts. The development cycle for each feature was:

1. **Plan** — Discuss the feature requirements with the assistant.
2. **Write** — Research and implement code for one cohesive piece (a route, a view, a
   component class).
3. **Verify** — Test the code and ask clarifying questions on anything
   unfamiliar.
4. **Debug** — When errors occurred, paste the exact error output back to the
   assistant for diagnosis.
5. **Refine** — After getting basic functionality, iterate on UX,
   accessibility, and code organization.

This kept the AI as a *collaborator of sorts* rather than a black-box code
generator. I committed code only after I understood it well enough to explain
it.

---

## 3. Notable Debugging Moments

These are real issues I encountered during development. Each one taught me
something I can explain in my own words:

### Express 5 Wildcard Routes
Initially used `app.get('*', ...)` for the SPA fallback route. Got the cryptic
error: `PathError: Missing parameter name at index 1: *`. Diagnosed via the
stack trace and learned that Express 5 uses `path-to-regexp` v8, which removed unnamed wildcard support.
Fixed by using `app.use()` middleware as a catchall, which also handles all
HTTP methods (not just GET).

### Deprecated Gemini SDK
Started development with the `@google/generative-ai` package, but hit a 404
when calling `gemini-2.0-flash` — the model returned "no longer available to
new users." Investigated and migrated to the new `@google/genai` SDK and the
`gemini-2.5-flash` model. The new SDK has a unified API surface
(`ai.models.generateContent({ model, contents })`) that replaces the older
two-step "get model, then call generate on it" pattern.

### API Returning HTML Instead of JSON
While testing the Profile save, I got the cryptic error
`Unexpected token '<', "<!DOCTYPE "...`. The server was returning my SPA
fallback (`index.html`) because the `/api/profile` route hadn't been
registered yet — Express was falling through to the catchall. Fixed by
registering the route, and *also* added a JSON-only 404 handler before the
SPA fallback so future unmatched API requests fail with a structured error
rather than HTML.

### Gemini "Thinking Tokens"
While inspecting token usage, I noticed that a single AI suggestion call used
~2,000 thinking tokens for a ~165-token answer — Gemini 2.5 does internal
reasoning before responding. Learned this is configurable via
`thinkingConfig.thinkingBudget`. For the resume-phrasing use case the heavy
reasoning isn't necessary, so this is a meaningful cost-optimization knob if
the app were ever moved off the free tier.

### Native Module ABI Mismatch with Electron
After installing Electron and trying to run, hit a crash:
`NODE_MODULE_VERSION 137 vs 145`. Learned that `better-sqlite3` is a native
C++ module compiled against a specific Node ABI, and Electron bundles its own
Node runtime with a different ABI. Fixed by running `electron-rebuild` to
recompile the module. Later replaced this with electron-builder's
`install-app-deps` command, which is the maintained equivalent.

### Native Prompt/Alert Disabled in Electron
The Skills "+ Category" button used `window.prompt()` to collect a category
name. This worked in the browser but silently did nothing in Electron, since
Electron disables `prompt()` by default for security and process-isolation
reasons. Built a custom `customPrompt()` utility using the native `<dialog>`
element. This works consistently across browser and Electron, supports
keyboard navigation (Enter to submit, Escape to cancel), integrates with the
dark mode theme, and is more accessible than the OS-level prompt.

### Browser Cache Hiding Code Changes
Even after saving JS file changes, the browser kept running the old version.
Diagnosed via the Network tab in DevTools. Solved short-term with hard
refresh (Ctrl+Shift+R) and longer-term by adding `?v=2` query strings to
script src attributes — a manual cache-busting technique.

### Windows Symlink Permissions for electron-builder
The `electron-builder` Windows packager downloads `winCodeSign`, which
contains macOS files with symlinks. Windows blocked symlink creation by
default. Fixed by enabling Windows Developer Mode, which grants the
SeCreateSymbolicLinkPrivilege to standard user accounts.

---

## 4. Where AI Was Used and How

AI assistance was used throughout this project, consistent with the
assignment's allowance. My role was to direct the architecture, validate
every suggestion, request changes when AI's first answer didn't fit my
needs, and integrate everything into a cohesive whole. Specifically:

### Areas where AI provided initial scaffolding
After deciding the structure I wanted, AI helped generate boilerplate that
I then reviewed and modified:

- **REST endpoints** in `routes/*.js` — I designed the schema and decided on
  the resource model; AI scaffolded the CRUD handlers, which I reviewed for
  correctness (e.g., adding transactions for atomic writes in `jobs.js` and
  `resumes.js`).
- **View rendering logic** in `public/js/views/*.js` — I sketched the UI
  flow per view; AI generated initial templates which I refined for
  consistency, dark mode support, and accessibility.
- **Print stylesheet** in `public/css/custom.css` — AI was particularly
  helpful here.

### Areas where I directed and AI assisted with details
- **`electron-main.js`** — I knew I wanted Electron; AI helped with the
  specific patterns for booting Express in-process and handling the userData
  path correctly.
- **`routes/ai.js`** — I designed the prompt and the JSON-response contract;
  AI helped with SDK invocation and edge-case handling (markdown fence
  stripping, fallback when JSON parsing fails).

### Areas where I actively rejected or rewrote AI suggestions
- AI initially recommended the legacy `@google/generative-ai` SDK; I
  identified it was deprecated when I hit a 404 on `gemini-2.0-flash` and
  migrated to `@google/genai` myself.
- AI's first attempt at the SPA fallback used Express 4 syntax
  (`app.get('*', ...)`); I diagnosed the Express 5 routing change and
  switched to `app.use()` middleware as a catchall.
- AI used `window.prompt()` for the category-add dialog. I caught that
  Electron disables this and built a custom `<dialog>`-based replacement.

### Code I wrote without significant AI input
- Schema design in `db/schema.sql` (table relationships, foreign-key cascade
  policies)
- Project organization decisions
- All architectural decisions (SPA approach, REST conventions,
  separation of concerns between builder.js and preview.js)
- Documentation files (`README.md`, this file, `rules.md`)

Comments in source code mark notable AI-assisted sections.

---

## 5. Concepts I Verified I Understand

I am prepared to discuss any of the following during the verbal review:

- Express middleware ordering and SPA fallback patterns
- The Express 5 → `path-to-regexp` v8 routing change
- Database transactions (`db.transaction()`) and atomicity guarantees
- ON DELETE CASCADE vs. ON DELETE SET NULL foreign-key behavior
- Legacy `@google/generative-ai` vs. modern `@google/genai` SDK differences
- Gemini 2.5 thinking tokens and `thinkingBudget` configuration
- Electron's main vs. renderer process model
- Why native modules need recompilation for Electron (NODE_MODULE_VERSION ABI)
- `Promise.all` for parallel data loading
- The native `<dialog>` element with `showModal()` for accessible modals

---

## 6. Rules File

See `rules.md` for the standing instructions used to constrain the AI
assistant's recommendations across all sessions.