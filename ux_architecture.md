# Generative Creature Lab 3.0 — Game-First UX Architecture

## Product Position

> **A competitive creature game powered by recoverable mathematics.**

The 3.0 experience makes the first ten seconds about wonder and agency, not configuration. Deterministic DNA, families, mutation, crossover, scoring, archive, and lineage remain the technical substrate. The player first encounters them as an organism to improve, beat a target with, and send to a friend.

| Principle | Design consequence |
| --- | --- |
| The creature is the hero | The Rift is full-screen and the default entry point contains only the organism, current target, and three primary actions. |
| The loop is competitive | Every generated creature has a visible deterministic score, personal-best comparison, and one immediate route into Mutation Duel. |
| Math is progressively revealed | Beginner controls use visual language; Create and Lab views disclose derived and raw genes only when requested. |
| Sharing is an invitation | “Challenge a friend” produces a vertical creature card, target score, challenge rule, recoverable DNA, and a direct-play link payload. |
| Social data is honest | Local duel scores are explicitly labelled as practice until a real remote opponent or community vote exists. |

## 1. New Player Flow

`WELCOME TO THE RIFT → tap the lifeform → shift one visual control → MUTATE → NEW SPECIES → BATTLE → CHALLENGE A FRIEND`

The optional 20–30 second overlay has five interactive beats: **Field detected**, **Shape the field**, **Mutate an offspring**, **Score the result**, and **Challenge someone**. It may be skipped and is remembered locally. The player never sees raw amplitude or frequency unless they open the Lab.

## 2. Core Play Loop

`DISCOVER → CREATE → MUTATE → LOCK → BATTLE → SHARE → REMIX`

Discovery samples a deterministic genome; Create adjusts Flow, Twist, Chaos, Gravity, Glow, and Density; Mutate creates a descendant; Lock preserves it; Battle compares it with a practice target or friend challenge; Share turns the result into an invitation; Remix begins a visible ancestry branch.

## 3. Challenge Loop — Mutation Duel

| Moment | Player sees | System behavior |
| --- | --- | --- |
| Start duel | A shared base creature, target score, 30-second clock, and clear rule | Both sides use the same base genome and declared deterministic scoring weights. |
| Make moves | Five beginner controls plus Mutate | All changes remain serializable and visibly alter the field. |
| Lock entry | “Lock creature” followed by a short reveal | Score calculates from complexity, coherence, originality, stability, controlled variation, and challenge fit. |
| Result | `YOU 92.4 / TARGET 89.0`, a near-miss or personal-best message, and a next action | No fake opponent result is shown; the default first release is a transparent practice target. |
| Rematch | “One more mutation” | Preserves the ancestry record and the achievement state. |

## 4. Sharing Loop

`LOCK → CHALLENGE A FRIEND → GENERATE CHALLENGE CARD → COPY / SHARE → RECIPIENT OPENS CREATURE → ACCEPT CHALLENGE`

The vertical card contains the creature preview, specimen ID, discovery class, genome score, generation, target score, and **CAN YOU BEAT THIS?**. The encoded payload includes the base DNA and duel constraint so recipients can experience the organism before authentication.

## 5. Remix Loop

`OPEN SHARED CREATURE → REMIX THIS → MUTATE → LOCK → REMIX #N → SHARE`

The ancestry view identifies an **Original**, named remixes, generation number, and parent specimen ID. A remix never overwrites its source; the lineage is the collectible object.

## 6. Progression Loop

Progression emphasizes measurable creative records, not a generic XP treadmill. The profile presents: Best score, discovery class, highest complexity, longest lineage, mutation record, challenge wins, and family map. Combo states reward behavior with a concrete explanation: **Stable Evolution** for three same-family descendants, **Field Cartographer** for five family discoveries, and **Hybrid Master** for crossover plus a locked challenge entry.

## 7. Main-Screen Hierarchy

1. **Rift creature and current battle target** — 70%+ of visual attention.
2. **Three primary actions** — `MUTATE`, `BATTLE`, `CHALLENGE A FRIEND`.
3. **Score and discovery class** — a compact, legible specimen card.
4. **Create sheet** — beginner controls, opened with a single unobtrusive gesture.
5. **Lab** — advanced DNA only after deliberate expansion.

Navigation changes from static product tabs to game destinations: **Rift**, **Duel**, **Archive**, **Records**, and **Signals**.

## 8. Beginner vs. Advanced Controls

| Level | Player language | Underlying genome effects |
| --- | --- | --- |
| Play | Mutate, Battle, Challenge | Deterministic child creation, score comparison, share payload |
| Create | Flow, Twist, Chaos, Gravity, Glow, Density | Normalized groups of radial, phase, frequency, warp, noise, gravity, bloom, and particle-count genes |
| Lab | Amplitude, Frequency, Radial, Phase, Vertical, Distortion, Warp, Noise, and renderer settings | Direct serializable GCL1 DNA control |

## Score Contract

The displayed **Genome Score** is deterministic and broken into visible components: Complexity (30%), Coherence (25%), Stability (15%), Controlled Variation (15%), and Challenge Fit (15%). Discovery class is separate from the score and derives from parameter-distribution distance. Community votes, if activated later, remain a distinct community outcome.

## First Release Boundary

**Ship Mutation Duel + Challenge a Friend as the polished core.** Genome Golf, Chaos Run, Color Field, daily community voting, and persistent remote matchmaking remain clearly scoped follow-ons. No synthetic opponents, votes, rankings, testimonials, or player activity are presented as real.
