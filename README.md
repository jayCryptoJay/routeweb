# FibStein — Generative Creature Lab: Duel Rift

> **A competitive creature game powered by recoverable mathematics.**

FibStein Duel Rift turns deterministic generative art into a playable loop: discover a mathematical lifeform, shape it with visual controls, mutate a descendant, lock the result, beat a declared target, and send the creature to a friend as a playable challenge.

The project is a React, TypeScript, Canvas 2D, Express, tRPC, and Drizzle application. It retains the deterministic GCL genome engine from earlier iterations while placing game ritual—not raw configuration—at the center of the experience.

## Core Gameplay

`DISCOVER → CREATE → MUTATE → LOCK → BATTLE → SHARE → REMIX`

The primary Rift presents one organism, a declared target, and three primary actions: **Mutate**, **Battle**, and **Challenge a Friend**. Beginner controls translate player intent into genome values, while the advanced Lab preserves direct access to serializable DNA parameters.

| Experience | What it does | State in this release |
| --- | --- | --- |
| Duel Rift | Full-screen generative creature arena with a declared target and command dock | Implemented |
| Create | Player-language controls for Flow, Twist, Chaos, Gravity, Glow, and Density | Implemented |
| Lab | Direct controls for recoverable, deterministic genome parameters | Implemented |
| Mutation Duel | Timed 30-second practice duel against a transparent mathematical target | Implemented |
| Genome score | Complexity, coherence, stability, controlled variation, and challenge-fit components | Implemented |
| Archive and lineage | Local creature preservation, specimen previews, and visible ancestry | Implemented |
| Challenge a Friend | Copyable direct-play payload plus vertical PNG challenge-card export | Implemented |
| Personal records | Best score, unusualness, longest lineage, and evolution combo | Implemented |
| Remote multiplayer and voting | Authenticated peer battles, community entries, and reactions | Data foundation exists; gameplay surface is intentionally not fabricated |

## How the Game Stays Honest

The creature genome is deterministic: the same compatible engine, seed, genome, and version recreate the same artifact. Mutation and crossover produce new serializable descendants rather than overwriting their source.

The visible **Genome Score** uses the following deterministic weighting:

| Component | Weight | Interpretation |
| --- | ---: | --- |
| Complexity | 30% | Frequency, warp, distortion, and turbulence contribution |
| Coherence | 25% | Family-compatible structural stability |
| Stability | 15% | Resistance to excessive volatility in the active field |
| Controlled variation | 15% | Deliberate difference from the source distribution |
| Challenge fit | 15% | Fitness for the declared practice-duel condition |

Discovery class is separate from score and derives from parameter-distribution distance. The app does **not** manufacture opponent scores, community ranks, votes, reviews, or player activity. The first release uses an explicitly labelled practice target until authenticated multiplayer is activated.

## Shareable Challenges

The Challenge a Friend flow produces a portable payload with the starting DNA, declared target score, source specimen ID, and duel rule. It also exports a vertical share card that includes the creature preview, discovery class, generation, genome score, and challenge prompt.

Recipients can open the payload and experience the shared creature before any account prompt. The source creature can be locked into the local archive to begin a remix lineage.

## Project Structure

```text
client/
  src/
    components/CreatureCanvas.tsx    # Adaptive Canvas 2D renderer
    lib/creatureEngine.ts            # Genome, DNA, scoring, challenge utilities
    lib/creatureEngine.test.ts       # Deterministic engine tests
    pages/Home.tsx                   # Duel Rift game experience
    index.css                         # FibStein Duel Rift visual system
server/
  routers.ts                          # tRPC player and creature contracts
  db.ts                               # Database helpers
drizzle/
  schema.ts                           # Player, creature, field-trial, submission models
ux_architecture.md                    # 3.0 game-first UX architecture
gcl3_validation.md                   # Manual cross-flow validation record
```

## Local Development

### Prerequisites

Use Node.js 22+ and pnpm. The full-stack template provides the local development server, authentication scaffolding, and database configuration.

### Commands

```bash
pnpm install
pnpm dev
```

The local application runs through the project’s Express/Vite development entry point. The following verification commands are available:

```bash
pnpm check   # TypeScript validation
pnpm test    # Vitest suite, including deterministic creature-engine tests
pnpm build   # Production client and server build
```

## Validation Completed

The current release was verified through deterministic tests, TypeScript checks, and a production build. Live interaction checks covered tutorial dismissal, creature mutation, practice-duel start and lock, near-miss and personal-score feedback, archive preservation, score-contract visibility, challenge-link copy, source locking, and vertical challenge-card export.

## Current Boundaries and Next Steps

The release prioritizes a polished single-player and shareable challenge loop. It intentionally keeps remote player-versus-player matching, public leaderboards, community voting, Genome Golf, Chaos Run, and Daily Specimen as future features rather than simulating activity that does not exist.

Recommended next increments are authenticated friend challenge acceptance, cloud-hosted creature previews for shared archive cards, and short animated WebM challenge exports.

## License

Private project. All rights reserved unless the repository owner specifies otherwise.
