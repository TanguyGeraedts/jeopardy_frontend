# Jeopardy (frontend)

Build Jeopardy boards, find other people's, and host them live: the board on a shared screen, buzzers on players' phones.
Live at [jeopardy.geraedts.dev](https://jeopardy.geraedts.dev).

Next.js app with Clerk sign-in. It talks to the Spring Boot backend (`jeopardy_backend`) through the `/api` proxy in
`next.config.ts`; players join through the separate lobby service.

## Running it

```bash
cp .env.local.example .env.local   # fill in the Clerk keys
npm install
npm run dev                        # http://localhost:3000, backend expected on :8080
```

`npm run lint` and `npm run build` are what CI runs. The Docker image (`Dockerfile`) is deployed to the VPS by
`.github/workflows/docker.yml`.

## Legal and privacy

The privacy notice, terms, cookie policy and legal notice live under `src/app/(site)/` and are built from the facts in
`src/lib/legal.ts`. If what the app stores, how long it keeps it or who processes it changes, update that file and its
`lastUpdated` date. Third-party fonts and icons are listed in `THIRD_PARTY_NOTICES.md`.

## Releases

Bump `version` in `package.json` and add an entry to `CHANGELOG.md`; the site shows it at `/changelog`.
