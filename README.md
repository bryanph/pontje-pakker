## Requirements

- Node.js (for `npx tsx`) + `npm install`

## Running

- Import GTFS data: `npx tsx src/import.ts`
- Extract site data (`site/output.json`): `npx tsx src/extract-data.ts`
- Run both on a daily loop (6:00 UTC): `./scripts/run-daily.sh`

## Serving

`site/index.html` is served directly by Caddy — no app server needed.
Caddy handles TLS certificates automatically via Let's Encrypt.

See `Caddyfile.example` for a drop-in config. To use it (all server-side
steps need `sudo`; the systemd `caddy` service takes care of binding to
443):

1. Copy the site to the server: `rsync -a site/ user@host:/var/www/pontje-pakker/site/`
   (use `sudo rsync` on the receiving end, or pre-create the dir owned by your user).
2. Copy `Caddyfile.example` to `/etc/caddy/Caddyfile` and replace
   `pontjepakker.example.com` with your domain.
3. Point the domain's DNS at the server (A/AAAA record) so Caddy can
   complete the ACME HTTP-01 challenge.
4. `sudo systemctl reload caddy`

Caveat: aggressive caching means updates to `output.json` don't show up
without a cache-buster. We work around this by appending a timestamp query
param when the page fetches `output.json`.

## Useful references

- https://towardsdatascience.com/where-is-the-bus-gtfs-will-tell-us-f8adc18a2f8e/
