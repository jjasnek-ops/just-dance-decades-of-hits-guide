# Just Dance: Decades of Hits Guide

An independent English guide to the game, with a searchable 35-song catalogue, platform dates, Adventure Mode, multiplayer, controls and library guides.

Website: https://justdancedecadesofhitsguide.wiki/

## Development

Requires Node.js 22.13+ and pnpm 11.1.1.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm lint
pnpm test
pnpm build
pnpm check-content
pnpm check-config
pnpm check-links
pnpm template-audit
```

The static build is in `dist/`. Pagefind search is generated after the build. Cloudflare Pages project: `just-dance-decades-of-hits-guide`. This project uses direct uploads; a GitHub push alone does not deploy it.

Game-specific settings belong in `src/config/`, English interface copy in `src/locales/en.json`, and articles in `src/content/wiki/en/`. Sources and verification dates appear in the articles. `src/data/song-catalogue.json` records the launch tracklist and source scope. Update these when official information changes.

Articles distinguish confirmed details from information that has not been verified. Local reports and research captures are excluded from Git. Never commit API credentials or environment files. Credentials used by the domain scripts are read from the process or user environment.

Google Analytics 4 (`G-Y3REG5HWGK`) loads only after visitor consent. The direct-upload build reads its public measurement ID from `wrangler.toml`. Ads, Cloudflare Web Analytics and comments are disabled. Search Console domain ownership is verified by an additional DNS TXT record. This site uses original abstract artwork and does not distribute game files, recordings or lyrics. It is not affiliated with or endorsed by Ubisoft or the Just Dance rightsholders.

## Template and license

Built from [PNGTRID/AnvilWiki](https://github.com/PNGTRID/AnvilWiki), version 2.37.0, upstream commit `2e13d6a3d1e177942f1853e1cdeffd1558e0af9f`. The original MIT license is retained in `LICENSE`. Framework documentation remains in `docs/`.

Applicable tests run through `pnpm test`. Demo-only template acceptance suites remain in `tests/` but are excluded from the configured site's default suite because they assert removed demo pages and locales. No performance score or search ranking is guaranteed.
