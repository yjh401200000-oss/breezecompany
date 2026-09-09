# Breeze AI server

GitHub Pages serves the existing website; the separate Cloudflare Worker handles image analysis.

- Worker: `breeze-ai`
- Endpoint: `https://breeze-ai.yjh401200000.workers.dev`
- Secrets, stored only in Cloudflare: `GROQ_API_KEY`, `TURNSTILE_SECRET_KEY`
- Browser configuration: `ai-config.js` contains only the public endpoint and Turnstile sitekey.
- No photos, prompt text, extracted names or addresses are stored by this application. Groq and Cloudflare handle the request; their own processing policies apply.
- Durable storage contains only one date/count record for the daily budget, not image or customer data.
- Public requests require validated Turnstile hostname/action. Origin checks alone are not authentication.
- Burst limit: 5 attempts/minute/IP at Cloudflare's rate limiter. Shared networks can share this limit.
- Global daily allowance: 100 provider attempts/day, measured in Korea time by one Durable Object. Provider failures consume allowance as well.
- Maximum upload: 8MB in the browser; resized JPEG request under 2.1MB on the server. No arbitrary remote URL fetching.
- Model output is schema-filtered and previewed. Existing nonempty order fields are not overwritten. Past dates are not applied.
- Worker logs/traces disabled. Errors do not include provider payloads, credentials or image contents.

## Deployment

Run `node ai-server/test.mjs`, `node tests/regression.cjs`, and `node --check ai-client.js` before deployment.
Run `npx --yes wrangler@4 deploy --config ai-server/wrangler.json` using the existing Cloudflare authorization.
Never add API keys to Wrangler vars, ai-config.js, repository files, chat messages, or command arguments.
Use the Cloudflare dashboard Secret field or the interactive `wrangler secret put GROQ_API_KEY` prompt to register a new key.
`GET /health` reports readiness only, not secret contents or provider key validity.

## Activation / verification

1. Create the server-only Groq key and enter it into the Worker as an encrypted Secret.
2. Confirm `/health` returns `configured: true`.
3. Open the website, expand photo analysis, confirm consent, complete any Turnstile challenge directly, and test with a non-sensitive product photo.
4. Confirm result preview, applying empty fields, and ordinary manual entry when AI is unavailable.
5. Verify Groq model permission/billing separately if upstream returns an error. Do not expose raw provider errors to the browser.

## Rotation / incident response

Replace the Worker secret with a newly generated key; revoke the old key in Groq. Never re-use the previously revoked BREEZE key.
The Groq model and rate budget can be changed in Wrangler vars. Increasing the allowance can increase usage charges.
The prior AI URL scraping feature is intentionally not restored; images avoid sending invitation URLs through public proxy services.
