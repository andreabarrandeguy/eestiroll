# Backend spec: account-aware AI check quota

This describes changes needed on the Django API (`eestiroll.eu.pythonanywhere.com`,
not in this repo) to support the new client behavior: signed-in users get a
higher daily quota than anonymous ones.

## What the client sends

Request body is unchanged: `{words, sentence, language}`.

One new header, sent **only when the user has an active session**:

```
Authorization: Bearer <supabase_access_token>
```

The token is a short-lived (1h default) Supabase JWT. The client re-reads it
fresh before every request and refreshes it automatically, so treat an
expired token as an ordinary 401 — not something to alarm on.

**The client never sends a user ID directly.** Anything identifying the user
must be derived from the verified token.

## Server behavior

- **No `Authorization` header** → anonymous path. Unchanged: quota 5/day,
  keyed by request IP.
- **`Authorization: Bearer <jwt>` present** → verify it.
  - Valid → quota 20/day, keyed by the token's `sub` claim.
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

- Key: `sha256(sub)` for signed-in, `sha256(ip)` for anonymous. Hashing
  keeps the quota table free of raw identifiers.
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
{ "remaining": 0, "limit": 5, "is_authenticated": false }
```

The client already has a fallback if these are missing (guesses 5/20 based
on whether it sent a token), so this can ship whenever — no coordinated
release with the client is required. But without `limit`/`is_authenticated`
the client can't render "5 of 5 used — sign in for 20 a day" accurately, and
the two sides' numbers can silently drift.

## Open decision

**The signed-in daily limit (20) is assumed throughout the client and this
spec.** Change it here if you land on a different number, and update the
client's `AUTH_LIMIT_FALLBACK` constant in `services/aiService.ts` and the
`signInBenefit` / `dailyLimitReachedAuth` copy in `utils/translations.ts`
(all 3 languages) to match.
