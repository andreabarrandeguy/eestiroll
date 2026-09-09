# Backend spec: account-aware AI check quota

This describes changes needed on the Django API (`eestiroll.eu.pythonanywhere.com`,
not in this repo) to support the new client behavior: telling a signed-in
request apart from an anonymous one.

**Signing in does not currently raise the daily quota.** Each AI check calls
OpenAI and costs real money, so both anonymous and signed-in users share the
same cap for now: **1/day**, down from the current 5/day. Accounts are
expected to unlock a paid subscription for more checks later — not implemented
yet, no need to build it now, just don't assume signing in alone raises the
cap.

## Don't let this change break the live web app

This same Django API is still serving the **current live web version**
(`andreabarrandeguy.github.io/eestiroll/`), which has no accounts, sends no
`Authorization` header, and isn't being touched while the mobile/accounts
work happens on a separate branch (`mobile-launch` in this repo — see git
history for why). If the anonymous limit just drops to 1/day server-side
today, the live web app's users drop from 5/day to 1/day immediately too —
probably not the intent yet.

**Recommendation: one backend, not two.** A second Django deployment means
two codebases, two quota tables, and two things that can drift out of sync
for no real benefit — the only thing that actually differs is which limit
applies. Instead, have the client identify itself with one new header:

```
X-Client-Platform: ios | android | web
```

Already added in this repo's client (`services/aiService.ts`, sent on every
request, value is just `Platform.OS`). The **current live web client doesn't
send this header and isn't being redeployed**, so on the server, presence of
the header is what matters, not its exact value:

- No `X-Client-Platform` header → legacy web client → keep today's behavior
  exactly as-is (5/day by IP, no JWT handling). Zero risk to current users.
- `X-Client-Platform` present (any value) → new behavior described below
  (1/day, JWT-aware, ready for a future paid tier). This covers native and
  the eventual web rebuild identically — the quota logic doesn't need to
  differ by platform, only old-deployment vs new.

When the web app eventually gets rebuilt from this same codebase and
redeployed, it'll start sending the same header automatically and can be
switched over to the new path — no separate migration needed then.

## What the client sends

Request body is unchanged: `{words, sentence, language}`.

Two new headers. `X-Client-Platform` (`ios`/`android`/`web`) is sent on
**every** request from this codebase's client (see above — that's the whole
switch between old and new behavior). `Authorization` is sent **only when
the user has an active session**:

```
X-Client-Platform: ios
Authorization: Bearer <supabase_access_token>
```

The token is a short-lived (1h default) Supabase JWT. The client re-reads it
fresh before every request and refreshes it automatically, so treat an
expired token as an ordinary 401 — not something to alarm on.

**The client never sends a user ID directly.** Anything identifying the user
must be derived from the verified token.

## Server behavior

This only applies when `X-Client-Platform: mobile` is present — otherwise,
leave the existing anonymous-by-IP behavior untouched (see above).

- **No `Authorization` header** → anonymous path. Quota **1/day**, keyed by
  request IP.
- **`Authorization: Bearer <jwt>` present** → verify it.
  - Valid → same quota (1/day for now), keyed by the token's `sub` claim
    instead of IP. Still worth doing even with no quota bonus: it correctly
    shares one cap across a user's devices instead of one per IP, and moving
    to a per-user key now avoids a second migration later if the quota does
    diverge.
  - Invalid/expired/malformed → return **401** (not 429), so the client can
    tell "your session is bad" apart from "you're out of checks" and fall
    back to the anonymous path on retry.

## Verifying the JWT

Check Supabase dashboard → Settings → API → JWT Keys to see which signing
scheme this project uses:

- **Legacy HS256** — verify with `PyJWT`, `algorithms=["HS256"]`, secret =
  the project's JWT Secret from that page. This is **not** the anon key —
  keep it server-side only, never send it to the client.
- **Asymmetric (ES256/RS256), recommended** — fetch the JWKS from
  `https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`, cache
  it in memory keyed by `kid` (refetch on an unknown `kid`, at most once a
  minute), verify with `algorithms=["ES256", "RS256"]`. Preferred because a
  leaked verification key is harmless and keys can rotate without a
  redeploy.

Always also check, beyond the signature:
- `exp` — don't disable PyJWT's default expiration check.
- `aud == "authenticated"`
- `iss == "https://<project-ref>.supabase.co/auth/v1"`
- **Pin `algorithms=[...]` explicitly.** Never read the algorithm off the
  token itself — that's the classic `alg: none` / HS-vs-RS confusion bug.

**The claim that identifies the user is `sub`** — a stable UUID equal to
`auth.users.id`. Use only this for keying quota. `email` is present on the
token but mutable; don't key anything on it.

If you'd rather skip local JWT verification entirely: `GET
https://<project-ref>.supabase.co/auth/v1/user` with
`Authorization: Bearer <jwt>` and `apikey: <anon key>` returns 200 + the
user (with `id`) if the token is valid. Simpler, but adds a network
round-trip per check and a dependency on Supabase's uptime for every
request — local verification (`pip install pyjwt`) is one dependency and
no round-trip.

## Quota keying and storage

- Use a **separate table (or a platform-prefixed key) from the existing web
  quota**, not the same IP-keyed rows. Otherwise someone hitting the API from
  both the web app and the mobile app on the same wifi would share one
  counter between two different intended limits (5/day legacy vs 1/day new),
  which makes neither number correct.
- Key: `sha256("mobile:" + sub)` for signed-in, `sha256("mobile:" + ip)` for
  anonymous. Hashing keeps the quota table free of raw identifiers.
- Day boundary: pick one timezone and stick to it — the client's copy says
  "come back tomorrow," so the reset should land on a human day, not
  UTC-at-3am-local. Suggest `Europe/Tallinn`.
- Storage: `(key_hash, day, count)` with a unique index on
  `(key_hash, day)`, incremented atomically —
  `INSERT ... ON CONFLICT (key_hash, day) DO UPDATE SET count = count + 1
  RETURNING count`. Not read-then-write, which races under concurrent taps.
- **Purge rows older than 7 days on a daily cron.** Nothing personal is
  retained past a week — this is what lets in-app account deletion (on the
  Supabase/client side) skip having to reach into Django at all. Mention
  this retention window in the privacy policy.

## Response contract

Keep the existing `remaining` field on both 200 and 429. **Add two new
fields to both:**

```json
{ "remaining": 0, "limit": 1, "is_authenticated": false }
```

The client already has a fallback if these are missing (guesses 1 either
way), so this can ship whenever — no coordinated release with the client is
required. But without `limit`/`is_authenticated` the client can't render "1
of 1 used" accurately, and the two sides' numbers can silently drift.

## Open decision

**The daily limit (1, same for anonymous and signed-in) is assumed
throughout the client and this spec.** Change it here if you land on a
different number, and update the client's `DAILY_LIMIT_FALLBACK` constant in
`services/aiService.ts` and the `dailyLimitReachedAnon` / `dailyLimitReachedAuth`
copy in `utils/translations.ts` (all 3 languages) to match. Once the paid
subscription tier for more corrections is designed, this doc and those same
spots need a second pass.
