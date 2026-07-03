## Requirements

- Node.js (for `npx tsx`) + `npm install`
- Rust / Cargo (for the server)

## Running

- Import GTFS data: `npx tsx src/import.ts`
- Extract site data (`site/output.json`): `npx tsx src/extract-data.ts`
- Run both on a daily loop (6:00 UTC): `./scripts/run-daily.sh`
- Serve the site: `cd server && cargo run` (serves `site/`)

## Useful references

- https://towardsdatascience.com/where-is-the-bus-gtfs-will-tell-us-f8adc18a2f8e/
