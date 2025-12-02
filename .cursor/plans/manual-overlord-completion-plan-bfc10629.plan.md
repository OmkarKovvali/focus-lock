<!-- bfc10629-d19f-477f-a137-49871118cf3c 79948982-4d10-4cf0-a033-6e5fe1f20d16 -->
# Manual Overlord Completion Plan

This plan breaks down the remaining work into three distinct phases: The "Eye" (Vision), The "Jail" (Lockout), and The "Judge" (Poke/MCP).

## Phase 1: Core Loop & Window Management (Immediate)

- [x] **Finalize Timer Logic**: Fix `useEffect` imports in `App.tsx` and ensure the timer ticks correctly.
- [x] **Window Restoration**: Implement `end-focus-mode` IPC in `main/index.ts` to restore the window to center/full size when the timer ends or the user clicks "Stop".

## Phase 2: The "Eye" (Vision Monitoring)

- [x] **Screen Capture**: Use Electron's `desktopCapturer` in the Main process to take a snapshot of the screen every 60 seconds.
- [x] **OpenAI Integration**: Send the snapshot + the user's `task` string to GPT-4o.
- *Prompt:* "The user said they would do '{task}'. Is this screen content consistent with that task? Reply YES or NO."
- [x] **Off-Task Trigger**: If GPT-4o says "NO", trigger the Lockout phase.
- [x] **Fix Env Vars**: Ensure `.env` is properly loaded and ignored.

## Phase 3: The "Jail" & The "Judge" (Lockout & Poke)

### 3.1 Local Lockout (The "Jail")

- [ ] **Strict Window Mode**: In `main/index.ts`, when OpenAI says "NO":
- `win.setKiosk(true)` (Fullscreen, no exit).
- `win.setAlwaysOnTop(true, "screen-saver")` (Hard to cover).
- `win.webContents.send('lock-screen-trigger')`.
- [ ] **Lockout UI**: In `App.tsx`, render a terrifying "LOCKED" screen when triggered.

### 3.2 The Intermediary (MCP Server on Render)

- [ ] **Build Server**: Create a simple Python/FastAPI server.
- **Database**: Simple in-memory or SQLite to store `{ user_id, locked_status, offense_count }`.
- **Endpoints**:
  - `POST /report_offense`: Called by Electron when user is bad. Increments `offense_count`, sets `locked=true`.
  - `GET /status`: Called by Electron to check if allowed to unlock.
  - `POST /unlock`: Called by Poke (via MCP tool) to set `locked=false`.
- [ ] **Deploy**: Deploy to Render (free tier).

### 3.3 Social Accountability (The "Judge")

- [ ] **Poke Interaction**:
- Configure Poke with the MCP Tool `unlock_user`.
- System Prompt: "You are a strict strict judge. When a user is reported locked, text them. Do not unlock until they provide a satisfactory excuse or complete a penalty task."
- [ ] **Security Hardening**:
- Ensure app launches on startup (to prevent restart-bypass).
- (Optional) Add persistence context to offenses.

## Required Config

- `OPENAI_API_KEY` (Local .env)
- `POKE_API_KEY` (For webhook, if needed)
- `MCP_SERVER_URL` (Once deployed)

### To-dos

- [ ] Implement Lockout UI & Kiosk Mode (Local)
- [ ] Build & Deploy Python MCP Server
- [ ] Connect Poke to MCP Server
- [ ] Implement Polling in Electron