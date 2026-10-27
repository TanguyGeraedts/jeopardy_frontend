# Third-party notices

Jeopardy's own code is MIT-licensed (see `LICENSE`). It ships these third-party assets:

| What | Used for | Licence |
|---|---|---|
| [Geist, Geist Mono](https://github.com/vercel/geist-font) (Vercel) | Interface text | SIL Open Font License 1.1 |
| [League Gothic](https://github.com/theleagueof/league-gothic) (The League of Moveable Type) | Values and category names | SIL Open Font License 1.1 |
| [Domine](https://github.com/googlefonts/domine) (Impallari Type) | Clue text | SIL Open Font License 1.1 |
| [Phosphor Icons](https://github.com/phosphor-icons/react) | Icons | MIT |

Fonts are downloaded at build time by `next/font/google` and served from this site, so visitors' browsers never contact
Google.

Everything else is made for this project:

- `public/lobby/banner.svg` and `public/lobby/background.svg`: the lobby's banner and background.
- Buzzer sounds: generated in the browser with the Web Audio API (`src/lib/buzzer-sounds.ts`), no audio files.

Images, videos and sounds inside quizzes are linked by quiz makers from other sites. They aren't part of this project,
and the terms of use make quiz makers responsible for having the right to use them.

"Jeopardy!" is a trademark of its owner. This project is not affiliated with or endorsed by the TV show.
