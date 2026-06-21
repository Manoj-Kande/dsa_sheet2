# InterviewOS

A DSA interview-prep platform: 386 curated problems across 17 topics, with real
user accounts, progress tracking, bookmarks, and notes that sync across devices.

Built with Next.js 16, Neon Postgres, Prisma, and Clerk.

## Architecture at a glance

- **Problems/Topics/Companies/Sheets** — static data, bundled as JSON (`data/dataset.json`).
  These never change per-user, so they don't touch the database at all.
- **User accounts, progress, bookmarks, notes** — live in Postgres (Neon), accessed
  through API routes backed by a thin service layer (`lib/services/`).
- **Auth** — Clerk handles sign-up/sign-in; a webhook syncs new users into our own
  `User` table so we can join progress/bookmarks/notes against them.

## One-time setup

### 1. Create a Neon database (free)
1. Go to https://console.neon.tech and create a project.
2. From the connection details panel, copy:
   - The **pooled** connection string (hostname contains `-pooler`) → `DATABASE_URL`
   - The **direct** connection string (no `-pooler`) → `DIRECT_URL`

### 2. Create a Clerk application (free)
1. Go to https://dashboard.clerk.com and create an application.
2. Copy the **Publishable key** and **Secret key** from the API Keys page.
3. Under **Webhooks**, add an endpoint pointing to `https://<your-domain>/api/webhooks/clerk`
   (for local dev, use the Clerk CLI or a tunnel like ngrok — see Clerk's webhook docs).
   Subscribe to: `user.created`, `user.updated`, `user.deleted`.
   Copy the **Signing secret** → `CLERK_WEBHOOK_SECRET`.

### 3. Configure environment variables
```bash
cp .env.example .env.local
# then fill in the values from steps 1 and 2
```

### 4. Install dependencies and generate the Prisma client
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Run the dev server
```bash
npm run dev
```
Visit http://localhost:3000.

## Project structure

```
app/
  page.tsx                  Dashboard / homepage
  topics/                   Roadmap list + per-topic detail
  problems/                 Global searchable problem list
  companies/                Company list + per-company detail
  sheets/                   Sheet list + per-sheet detail
  bookmarks/                User's saved problems
  sign-in/ sign-up/         Clerk auth pages
  api/
    progress/                GET/POST problem status
    bookmarks/                GET/POST bookmark toggle
    notes/                    GET/POST notes
    webhooks/clerk/            Syncs Clerk users into our DB

components/
  shared/                  TopNav, command palette, problem modal, app shell
  ui/                      Badge, status icon, bookmark button

lib/
  data/dataset.ts          Typed access to the static problem dataset
  hooks/use-user-data.tsx  Client-side state synced with the API routes
  services/                Server-side business logic (progress, bookmarks, notes)
  prisma.ts                Prisma client (Neon serverless adapter — required for
                            connection pooling in serverless deployments)

prisma/schema.prisma       Database schema (User, UserProgress, Bookmark, Note, UserStreak)
data/dataset.json          The full 386-problem dataset
```

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the same environment variables from `.env.local` in the Vercel project settings.
4. Update your Clerk webhook endpoint and `NEXT_PUBLIC_CLERK_*` redirect URLs to your
   production domain once deployed.
5. Run `npx prisma migrate deploy` against your production database (or wire it into
   your CI pipeline) before the first deploy that depends on the new schema.

## Notes on what's intentionally *not* here

This app deliberately skips the heavier infrastructure (Redis, Typesense, background
job runners, Cloudflare Bot Management, etc.) that a 100k-user SaaS platform would
eventually need. At this dataset size (386 problems, ~10MB) and expected scale,
Postgres + indexes is fast enough on its own, and added infrastructure would mean
slower iteration for no real benefit right now. If usage grows substantially, revisit
caching and search infrastructure then — not before.
