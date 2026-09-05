# Content Editor CMS

Content Editor CMS is a collaborative document editor built with Next.js 16, React 19, Tiptap, Supabase, and TanStack Query. It provides authenticated users with a workspace for creating, editing, uploading assets to, and managing versioned documents.

The application uses Supabase as its backend platform rather than a separate Express/Nest server. Supabase provides authentication, PostgreSQL persistence, object storage, and Realtime presence channels; the Next.js application contains the UI, client data layer, authentication middleware, and the server-side OAuth callback.

## Implemented functionality

- Email/password registration, login, logout, and Supabase session persistence.
- Protected application routes with auth-cookie refresh in `src/proxy.ts`.
- Document dashboard with create, list, open, and delete operations.
- Rich-text editing with Tiptap, including:
  - headings and standard formatting;
  - links, underline, highlight, and text alignment;
  - images with resize support;
  - tables;
  - task lists and nested task items;
  - slash commands and placeholder text.
- Automatic saving after a short debounce and explicit manual saving.
- Optimistic concurrency control using a document `version` value. A save only succeeds when the client version still matches the database version, allowing conflicts to be reported instead of silently overwriting another user’s changes.
- Save status and conflict feedback in the editor UI.
- Document version history and version restoration.
- Image uploads to the Supabase Storage `document-assets` bucket with a 5 MB size limit and image MIME-type validation.
- Realtime document presence with online collaborator avatars and stable user colors.
- React Query caching, invalidation, loading states, retry states, and developer tools.
- Responsive UI built from reusable local UI primitives and Tailwind CSS.

## Technology and dependencies

### Runtime dependencies

- **Next.js 16.3.4** and **React 19.2.8** — App Router, layouts, pages, middleware-style request proxy, and rendering.
- **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`) — authentication, database access, Storage, Realtime, and SSR-compatible cookies.
- **Tiptap 3** — the editor core, React bindings, starter kit, tables, links, images, tasks, highlighting, underline, alignment, placeholder, and custom slash commands.
- **TanStack React Query 5** — server-state fetching, caching, mutations, and invalidation.
- **Tailwind CSS 4** with `tw-animate-css` — styling and animations.
- **Base UI, local UI primitives, `class-variance-authority`, `clsx`, and `tailwind-merge`** — accessible component composition and class-name management.
- **Lucide React** and **Tippy.js** — icons and editor popovers/tooltips.

### Development dependencies

TypeScript 5, ESLint 9, `eslint-config-next`, Tailwind PostCSS integration, and React/Node type definitions.

The lockfile is managed with pnpm, so pnpm is the recommended package manager.

## Prerequisites

- Node.js 20 or newer.
- pnpm 9 or newer (or a compatible pnpm version supported by your team).
- A Supabase project.
- A configured Supabase Auth email provider for registration and email confirmation.

## Local project setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create `.env.local` in the project root:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
   ```

   The URL may be copied from Supabase Project Settings → API. The anon key is safe to expose to the browser only when Row Level Security (RLS) and Storage policies are correctly configured. Never put a Supabase service-role key in a `NEXT_PUBLIC_*` variable or client-side code.

3. Start the development server:

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3001](http://localhost:3001). The port is `3001` because it is defined by the `dev` script.

4. Validate the project before committing:

   ```bash
   pnpm lint
   pnpm build
   ```

## Backend implementation and preparation

### 1. Create the database schema

Create the following tables in Supabase (preferably through versioned Supabase migrations):

```sql
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version integer not null,
  title text not null,
  content jsonb not null,
  created_at timestamptz not null default now(),
  unique (document_id, version)
);
```

The TypeScript database contract is maintained in `src/shared/types/database.ts`. If the schema changes, regenerate or update that type contract so Supabase queries remain type-safe.

### 2. Enable Row Level Security

Because the browser uses the Supabase anon key, RLS must be enabled before the application is used outside a trusted local database. A minimal owner-only policy set is:

```sql
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;

create policy "users can read their documents"
  on public.documents for select using (auth.uid() = user_id);
create policy "users can create their documents"
  on public.documents for insert with check (auth.uid() = user_id);
create policy "users can update their documents"
  on public.documents for update using (auth.uid() = user_id);
create policy "users can delete their documents"
  on public.documents for delete using (auth.uid() = user_id);

create policy "users can read versions of their documents"
  on public.document_versions for select
  using (exists (
    select 1 from public.documents d
    where d.id = document_versions.document_id and d.user_id = auth.uid()
  ));
```

The insert/update policies for `document_versions` should be restricted to a trusted database trigger or a server-side operation. This prevents clients from fabricating history. Do not rely on the frontend for authorization.

### 3. Preserve document history on every successful save

The client updates `documents` with an optimistic version match (`id` + expected `version`) and increments the version on success. For production, add a PostgreSQL trigger or a server-side transaction that copies the previous title/content into `document_versions` before each document update. Keep only the most recent 10 versions if that is the product limit (`MAX_VERSIONS_PER_DOCUMENT` is currently 10).

A trigger/transaction should also update `updated_at` and guarantee that a version snapshot and the document update succeed or fail together. This is safer than asking the browser to write both records independently.

### 4. Configure Storage

Create a public or signed-access bucket named `document-assets`. The current client upload service writes files under `<user-id>/<random-uuid>` and accepts JPEG, PNG, GIF, WebP, and SVG files up to 5 MB.

For production, add Storage policies that restrict object insertion and deletion to the authenticated user’s folder. If documents can contain private content, use signed URLs instead of a public bucket and return URLs through a trusted server operation.

### 5. Configure authentication and OAuth callback URLs

In Supabase Auth, configure:

- Site URL for the deployed application.
- Redirect URL for `/auth/callback` (and the local URL used during development).
- Email confirmation behavior and SMTP provider.

`src/app/auth/callback/route.ts` exchanges the authorization code for a session and redirects the user to the requested destination. `src/shared/api/supabase-server.ts` manages SSR auth cookies, while `src/shared/api/supabase.ts` creates the browser client.

### 6. Enable Realtime

The editor subscribes to `document:<document-id>` Supabase channels and tracks presence only; it does not yet broadcast document content changes. Enable Realtime for the project and ensure the client is allowed to connect. If live content synchronization is added later, define a conflict-resolution strategy before broadcasting edits.

### Recommended production backend boundary

The current implementation intentionally keeps CRUD calls in client-side services (`src/entities/document/api`), protected by Supabase RLS. For a larger production system, move privileged workflows behind Next.js Route Handlers or Server Actions:

1. Authenticate with the server Supabase client.
2. Validate payloads (title length, Tiptap JSON shape, file metadata, and IDs).
3. Perform optimistic-locking updates and version snapshots in one transaction or RPC.
4. Return typed, normalized errors for conflicts, authorization failures, and validation failures.
5. Keep the service-role key server-only.

## Frontend architecture

The frontend follows a feature-sliced structure under `src/`:

```text
src/
├── app/                    # Next.js routes, layouts, auth callback, global CSS
├── components/ui/          # Reusable presentational primitives
├── entities/
│   ├── document/           # Document model, services, hooks, and cards/dialogs
│   ├── document-version/   # Version queries, types, and API service
│   └── session/            # Current-user model, query, and user menu
├── features/
│   ├── auth/               # Login, registration, sign-out, and auth service
│   ├── restore-version/    # Version restoration mutation
│   └── save-document/      # Autosave queue, dirty state, statuses, and errors
├── shared/
│   ├── api/                # Browser/server Supabase clients
│   ├── providers/          # React Query provider and devtools
│   └── types/              # Generated/manual database types
└── widget/
    ├── editor/             # Tiptap canvas, toolbar, bubble menu, uploads, presence
    └── version-history/    # Version history panel
```

The main data flow is:

1. A page in `src/app` composes a feature or widget.
2. A React Query hook in an entity/feature calls a typed service.
3. The service uses the appropriate Supabase browser or server client.
4. Mutation success invalidates or updates relevant query keys.
5. The editor keeps local dirty state and submits saves through `SaveQueue`, using the current database version for conflict detection.

Keep route composition in `src/app`, domain logic in `entities`/`features`, reusable UI in `components/ui`, and editor-specific composition in `widget`. Avoid importing UI concerns into API services.

## Important project files

- `src/proxy.ts` — protected-route handling and Supabase session refresh.
- `src/shared/api/supabase.ts` — browser client and environment validation.
- `src/shared/api/supabase-server.ts` — server client, cookie handling, and `requireUser`.
- `src/entities/document/api/document-service.ts` — document CRUD and optimistic locking.
- `src/entities/document-version/api/document-version-service.ts` — version history queries.
- `src/entities/document/api/document-assets-service.ts` — image validation and Storage uploads.
- `src/widget/editor/ui/editor-canvas.tsx` — editor state, autosave, manual save, and conflict UI.
- `src/widget/editor/lib/tiptap/extensions.ts` — enabled Tiptap extensions.
- `src/shared/types/database.ts` — database row/insert/update types.

## Deployment checklist

- Configure production Supabase URL, anon key, Auth redirect URLs, SMTP, RLS, Storage policies, and Realtime.
- Apply database migrations and verify the `documents`/`document_versions` relationship.
- Add a trusted version-snapshot trigger or transaction before enabling production writes.
- Run `pnpm lint` and `pnpm build` in CI.
- Set the deployment platform’s Node.js version to 20+.
- Confirm that no service-role secret is exposed to the browser bundle.
- Test two simultaneous editors against the same document to verify conflict handling and authorization.

## Available scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the development server on port 3001 |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |

## License

This project is private by default (`private: true` in `package.json`). Add the project’s chosen license and contribution policy before publishing it as an open-source package.
