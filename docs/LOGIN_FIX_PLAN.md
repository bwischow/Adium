# Plan: Fix login (sign-in succeeds but user never reaches dashboard)

## What’s happening

1. User submits email/password on `/login`.
2. `signInWithPassword` succeeds (no error, no hang).
3. Page does `window.location.href = '/dashboard'`.
4. User ends up back on login or the screen “refreshes” — i.e. they never see the dashboard.

So the **session is not visible to the server** on the first request to `/dashboard`. Either cookies aren’t sent, or the server/middleware doesn’t see them, or `getUser()` fails.

---

## Auth flow (current)

```
[Browser]  POST /login (form) → signInWithPassword() → Supabase sets session in cookies
           → 200ms delay → window.location.href = '/dashboard'

[Browser]  GET /dashboard  (with Cookie header)

[Edge]     middleware.ts
           - createServerClient(SUPABASE_URL, ANON_KEY, { cookies: request.cookies })
           - supabase.auth.getUser()
           - if !user → redirect to /login  ← likely happening here
           - else → NextResponse.next()

[Node]     app/dashboard/page.tsx (if middleware passed)
           - createClient() from lib/supabase/server (uses cookies() from next/headers)
           - supabase.auth.getUser()
           - if !user → redirect('/login')
           - else → render dashboard
```

If either middleware or the dashboard page sees `user === null`, the user is sent back to login.

---

## Likely causes

| # | Cause | Why |
|---|--------|-----|
| 1 | **Server Supabase client has no URL/key** | `lib/supabase/server.ts` uses `process.env.NEXT_PUBLIC_*`. If those are undefined in Node (e.g. env not loaded), `createServerClient` can throw or behave badly; dashboard or RSC might then fail and redirect. |
| 2 | **Old @supabase/ssr (0.1.0)** | We're on `@supabase/ssr@0.1.0`; current is 0.6.x. Cookie names, storage, or API may differ so client-set cookies aren’t what the server expects. |
| 3 | **Cookies not sent or not read** | Client might set cookies the server doesn’t read (e.g. path/domain), or middleware/server might not receive the same cookie header. |
| 4 | **Middleware redirect overwrites response** | When middleware redirects to `/login`, we copy cookies to the redirect response; when we `NextResponse.next()`, we rely on `setAll` in middleware. Need to ensure any refreshed tokens are on the response. |

---

## Fix plan (in order)

### Step 1: Ensure Supabase URL and anon key are never missing on the server

- **Goal:** No silent failure in server components or route handlers because env is undefined.
- **Action:** In `lib/supabase/server.ts`, use the same fallback URL and anon key as in `middleware.ts` when `process.env.NEXT_PUBLIC_SUPABASE_URL` / `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing (only for development; production should set env).
- **Check:** Restart dev server, sign in, and see if behavior changes. If the server was throwing before, you might now get further or get a different error.

### Step 2: Upgrade @supabase/ssr and align with current docs

- **Goal:** Use the same cookie/session behavior as the official Next.js + Supabase setup.
- **Action:**
  - Upgrade: `npm install @supabase/ssr@latest` (or `^0.6.x`).
  - Skim the [Supabase Next.js SSR docs](https://supabase.com/docs/guides/auth/server-side/nextjs) and the [with-supabase](https://github.com/supabase/examples/tree/main/auth/nextjs) example.
  - Update `lib/supabase/client.ts` and `lib/supabase/server.ts` (and middleware if the example uses a different pattern) to match the example’s cookie handling and client creation.
- **Check:** Build passes (`npm run build`) and login still runs without errors.

### Step 3: Add a small debug endpoint (temporary)

- **Goal:** See whether the server receives auth-related cookies and what `getUser()` returns.
- **Action:** Add `app/api/auth/debug/route.ts` that:
  - Reads `cookies()` (or request cookies in a Route Handler).
  - Creates the server Supabase client and calls `getUser()`.
  - Returns JSON like: `{ hasCookies: boolean, cookieNames: string[], user: null | { id } }` (no secrets).
- **Check:** After signing in, in another tab (or after redirect) open `/api/auth/debug`. If `user` is null but you see cookie names that look like Supabase auth (e.g. `sb-...-auth-token`), the server sees cookies but something is wrong with session parsing. If there are no auth cookie names, the client isn’t setting them or they’re not being sent.

### Step 4: Align middleware with official “update session” pattern

- **Goal:** Middleware is the single place that refreshes the session and sets cookies on the response; ensure we don’t drop refreshed tokens.
- **Action:** Compare `middleware.ts` to the Supabase Next.js example (e.g. `updateSession`-style middleware). Ensure we:
  - Call the equivalent of “refresh session” (e.g. `getUser()` or whatever the example uses) so tokens are refreshed.
  - Always attach the cookies from the Supabase client to the response we return (both for `NextResponse.next()` and for redirects).
- **Check:** Login → dashboard once; if it still fails, check `/api/auth/debug` again.

### Step 5: Optional — use auth callback for password login

- **Goal:** If the client-set cookies are still not reliable, let the server set them once.
- **Action:** After `signInWithPassword` succeeds, redirect to something like `/auth/callback?next=/dashboard` and in the callback use the session from the client (e.g. read from request or from a short-lived token in the query). This is a fallback; prefer fixing cookie flow first (Steps 1–4).

---

## Quick reference: files to touch

| File | Purpose |
|------|--------|
| `lib/supabase/server.ts` | Add URL/anon key fallbacks; after upgrade, match example. |
| `lib/supabase/client.ts` | After upgrade, match example. |
| `middleware.ts` | Already has fallbacks; after upgrade, ensure session refresh + cookie forwarding match example. |
| `app/(auth)/login/page.tsx` | Keep current “success → delay → window.location.href = '/dashboard'”; no change unless we add callback flow. |
| `app/api/auth/debug/route.ts` | New; temporary debug. |

---

## Success criteria

- User can sign in with email/password and land on `/dashboard` (or `/companies/new` if no companies) without being sent back to `/login` or seeing a refresh loop.
