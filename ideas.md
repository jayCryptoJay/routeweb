# Generative Creature Lab 3.0 — FibStein Product Direction

## 3.0 Direction: The Duel Rift

**The Duel Rift** replaces the instrument-first model with a discovery-and-competition ritual. The Rift is the product’s dramatic room: one creature, a declared target, three verbs, and a visible next move. FibStein’s spectrum turns into a score voltage and challenge signal—cyan indicates control, ultraviolet marks lineage, magenta carries the opponent target, and the full spectrum appears only at mutation, discovery, and victory.

### Game Feel

The user should first feel **wonder**, then **agency**, then **tension**, and finally **payoff**. The rest of the interface exists to support these moments. Outcome language is direct and earned: `TARGET BEATEN`, `2.7 POINTS SHORT`, `NEW SPECIES`, `GENETIC BREAKTHROUGH`, and `REMIX #03 LOCKED`.

### Key Visual Change

The first Rift contains no persistent technical inspector. A thin bottom Create sheet exposes player-language controls; the full genome inspector is a deliberate Lab expansion. A vertical score card plus prismatic target arc creates the sense of a playable arena without becoming a generic game HUD.

## Three possible directions

### Theme Name: Living Archive
**Very Brief Intro:** A collector-focused archive where every organism earns a physical-feeling dossier, traceable lineage, and a quiet place in a growing mathematical museum.
**Probability:** 0.06

### Theme Name: The Prismatic Rift
**Very Brief Intro:** A cinematic discovery game in which mathematical organisms form through unstable fields, then pass into a personal collection, challenge arena, and social lineage graph.
**Probability:** 0.02

### Theme Name: Genome Atelier
**Very Brief Intro:** A sophisticated creation suite where expert controls and constrained exercises progressively reveal how mathematics influences form.
**Probability:** 0.07

## Chosen Approach: The Prismatic Rift

### Product Thesis
**Generative Creature Lab is a discovery game where a mathematical artifact can become a creature, a collection item, a challenge entry, a remix source, and a social object without ever ceasing to be defined by reproducible DNA.** The core loop is compressed into a single visible product journey: discover an unknown field, form an organism, choose a mutation, name the result, preserve it, and decide whether it belongs in a daily challenge or personal archive.

### First Integrated Release

| Surface | User value | 2.0 implementation boundary |
| --- | --- | --- |
| Rift / creation field | Discover and manipulate mathematical organisms in real time | Existing deterministic Canvas engine becomes the hero stage with a cinematic formation sequence, DNA controls, score derivation, and mutation relationship states |
| Unknown discovery | Turns random generation into an act of exploration | A deterministic date/seed-driven reveal reveals one unusual organism at a time, then shows its derived trait rationale |
| Creature dossier | Gives each artifact a lasting identity | Creature ID, family, DNA, generation, rarity rationale, gene-derived scores, and owner/creation state become visible in a dedicated panel |
| Daily field trial | Creates a creative prompt without a grind loop | A deterministic daily constraint derived from the UTC date, a local submission state, and a visible transparent evaluation rubric; no invented community votes or rankings |
| Collection and lineage | Turns experiments into a body of work | Persistent local archive today, with database-ready creature, creator, submission, and reaction models for authenticated multi-user sharing |
| Profile and progression | Rewards creative mastery with expanded possibility | Locally tracked XP and level that unlocks familiar capabilities based on real actions: saving, evolving, discovering families, and completing a field trial |
| Social layer | Prepares organisms to move between people | Dossier-level remix/share actions and an honest empty community state until real authenticated submissions exist; no fabricated players, likes, or reviews |

### Design Movement
**Cinematic scientific play**: deep black voids, instrument-like type, prismatic emissions, carefully bounded panels, and focal content that appears to have been discovered rather than assembled. It moves away from an inspector-first tool toward an immersive world that nevertheless preserves professional creative controls.

### Core Principles
1. **A creature forms before it is explained.** The reveal sequence makes mathematical emergence emotional; detailed genes remain accessible after curiosity is established.
2. **Identity is verifiable.** Rarity, score, and progression derive from genome properties and recorded actions, never inflated social proof.
3. **Play becomes provenance.** Mutation and crossover produce descendants, and every saved result remains reachable as an artifact with a traceable origin.
4. **Social is an invitation, not imitation.** The product provides remix-ready sharing and a challenge layer without inventing community activity before real submissions exist.

### Visual Language
Near-black graphite stays dominant. The creature is the primary source of colour; electric cyan, ultraviolet, magenta, and the supplied FibStein spectrum appear only as calibrated emitted energy, a DNA strand, an active navigation state, or a major reveal. Transparent surfaces are smoky rather than glassy, corners are modest (8–14px), and rules/dot matrices substitute for generic card decoration.

### Layout Paradigm
The central **Rift** is a full-screen living environment. A low command dock carries the most expressive actions—discover, mutate, archive, enter trial—while a controllable side sheet contains advanced DNA. Other worlds, such as Collection, Field Trial, and Profile, appear as a spatial navigation layer rather than a conventional dashboard sidebar.

### Signature Elements
1. The **Prism Rift**: an expanding fine-line spectrum ring that appears during formation, mutation, and discovery.
2. The **Specimen Dossier**: a compact ID card with family, generation, rarity rationale, DNA state, and only measurable scores.
3. The **Field Trial**: a daily constraint sheet that communicates its rule as an equation-inspired condition rather than a generic quest.

### Motion System
The formation sequence progresses through `CALCULATING GENOME`, `BUILDING FIELD`, `FORMING STRUCTURE`, and `LIFEFORM DETECTED`, then dissolves to reveal the Canvas organism. Mutation uses a short spectral drift transition. Navigation panels slide along a single depth plane; score and XP changes tick rather than explode. All UI animation is 120–280ms and respects reduced-motion preferences.

### Progression Model

| Level | Unlock | Earned through |
| --- | --- | --- |
| 1 | Core Rift + archive | First discovery and first preserved specimen |
| 5 | Directed mutation | Five saved descendants or two distinct mathematical families |
| 10 | DNA fusion | A real multi-parent archive, not an arbitrary timer |
| 15 | Advanced operator controls | Completing challenge constraints and using varied render modes |
| 20 | Experimental rift | Discovering all base families and preserving unusual genome traits |

### Transparent Score Methodology
The interface distinguishes **genome metrics** from community outcomes. Mathematical complexity is computed from normalized frequency, warp, distortion, and noise; symmetry/coherence comes from family-compatible gene ranges; chromatic range comes from hue, saturation, brightness, and render mode; and rarity is a deterministic distance from expected parameter distributions. No `likes`, global rank, or popularity values are created until real user data exists.

### Data Model Foundation

| Entity | Essential fields | Purpose |
| --- | --- | --- |
| Player profile | user link, handle, XP, level, family discoveries, specialty | Supports ownership and creative capability unlocks |
| Creature | DNA, renderer version, family, seed, name, derived traits, score breakdown, rarity rationale, parent IDs, preview reference | Represents the immutable social unit |
| Field trial | UTC date, constraint type, base seed/family, permitted parameters | Makes a daily challenge deterministic without a background scheduler |
| Submission | player, creature, trial, creation timestamp | Establishes a future voting and ranking connection without inventing results |
| Reaction / remix | creator, target creature, kind, timestamp | Supports actual social feedback and ancestry when authenticated users participate |

### Brand Voice
Use terse field observations and permissionless invitations, never gamey hype or biological claims.

> `UNKNOWN FIELD DETECTED.`
>
> `The organism is a mathematical artifact. Its DNA is recoverable.`
>
> `Enter the field trial.`

## Implementation Notes

- The existing generator, renderer, DNA encoding, mutation, crossover, local gallery, and mobile field interactions are reusable core infrastructure.
- The existing dense DNA inspector becomes a second-level control surface; the new first view starts from wonder and discovery.
- A real multi-user community requires authenticated, persisted creature records. The 2.0 UI must label non-authenticated or local-only content accurately rather than manufacturing activity.
