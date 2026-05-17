# Peblo Notes — Collaborative AI Workspace

Full-stack take-home submission for **PEBLO**: a collaborative, AI-powered notes workspace with authentication, tagging, search, public sharing, and productivity insights.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | Neon Postgres + Prisma ORM 7 |
| Auth | JWT (httpOnly cookies) + bcrypt |
| AI | Gemini API via OpenAI-compatible SDK (optional — demo mode without key) |

## Features

- **Authentication** — Signup, login, protected routes, persistent sessions
- **Notes workspace** — Create/edit notes, auto-save, tags, categories, archive
- **AI integration** — Summaries, action items, suggested titles
- **Search & filtering** — Keyword search, tag filter, category filter, sort by updated
- **Public sharing** — Shareable links at `/shared/[shareId]` (no login required)
- **Productivity dashboard** — Total notes, recent edits, top tags, AI usage, weekly activity

## Quick start

### Prerequisites

- Node.js 20+
- npm

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon Postgres connection string, e.g. `postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require` |
| `JWT_SECRET` | Secret for signing session tokens |
| `LLM_API_KEY` | Gemini API key (optional — app works in demo mode without it) |
| `LLM_MODEL` | Model name, default `gemini-2.5-flash` |
| `LLM_BASE_URL` | OpenAI-compatible Gemini endpoint |

### 3. Set up database

```bash
npm run db:push
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional: seed demo data

```bash
npm run db:seed
```

Demo account: `demo@peblo.app` / `demo1234`  
Public share example: `/shared/demo-share-01`

### 5. Production build

```bash
npm run build
npm start
```

## Project structure

```
peblo/
├── prisma/schema.prisma      # Database schema
├── src/
│   ├── app/
│   │   ├── api/              # REST API routes
│   │   ├── (app)/            # Protected pages (workspace, dashboard)
│   │   ├── shared/           # Public share pages
│   │   ├── login|signup/     # Auth pages
│   │   └── page.tsx          # Landing page
│   ├── components/           # React UI components
│   └── lib/                  # Auth, DB, AI, utilities
├── docs/                     # Sample API responses & schema
└── README.md
```

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Current user |
| GET | `/api/notes` | List notes (search, tag, category filters) |
| POST | `/api/notes` | Create note |
| GET | `/api/notes/:id` | Get note detail |
| PATCH | `/api/notes/:id` | Update note (auto-save) |
| DELETE | `/api/notes/:id` | Delete note |
| POST | `/api/notes/:id/generate-summary` | Generate AI insights |
| GET | `/api/shared/:shareId` | Public shared note (JSON) |
| GET | `/api/insights` | Productivity dashboard data |

## Architecture decisions

1. **Monorepo with Next.js** — Single deployable app; API routes colocated with UI for fast iteration.
2. **Neon Postgres** — Online Postgres database so notes persist outside the local machine.
3. **JWT in httpOnly cookies** — Secure, stateless sessions without exposing tokens to JavaScript.
4. **AI with graceful fallback** — Without `LLM_API_KEY`, the app returns sensible mock AI output so all flows are testable.
5. **Auto-save debounce** — 800ms debounce on editor changes reduces API load while feeling instant.

## Testing the application

1. **Auth** — Sign up at `/signup`, sign out, sign in at `/login`
2. **Notes** — Create a note, edit title/content, add tags, change category
3. **AI** — Click "AI Insights" on a note with content
4. **Search** — Use sidebar search and tag filters
5. **Share** — Toggle "Share" on a note, copy link, open `/shared/[id]` in incognito
6. **Dashboard** — Visit `/dashboard` for insights

## Nice-to-have features included

- **Dark mode toggle** — Manual theme switch (persists in localStorage)
- **Markdown preview** — Write/Preview tabs in the note editor
- **Keyboard shortcut** — `Ctrl/Cmd + N` to create a new note
- **Deep linking** — Dashboard links open notes via `/workspace?note=<id>`
- **Demo seed script** — `npm run db:seed` for instant sample data

## Demo video checklist

Record a 5–10 minute walkthrough covering:

- [ ] Authentication flow
- [ ] Notes workflow (create, edit, auto-save, tags)
- [ ] AI summary generation
- [ ] Search and filtering
- [ ] Public sharing flow
- [ ] Dashboard insights

## Sample outputs

See [`docs/sample-outputs.md`](docs/sample-outputs.md) for example API responses, AI output, and database schema.

## License

Built for the PEBLO Full Stack Developer Challenge.
