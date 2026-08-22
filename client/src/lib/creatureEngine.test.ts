/** Deterministic GCL DNA and derived-trait tests. */
import { describe, expect, it } from "vitest";
import { applyPlayControl, createGenome, createPracticeDuel, decodeChallengePayload, decodeDNA, deriveGenomeScore, encodeChallengePayload, encodeDNA, mutateGenome } from "./creatureEngine";

describe("Generative Creature Lab genome", () => {
  it("recreates the same initial genome from the same seed", () => {
    const first = createGenome(482193, "tentacle");
    const second = createGenome(482193, "tentacle");
    expect(first.genes).toEqual(second.genes);
    expect(first.id).toBe(second.id);
  });

  it("round-trips compact DNA without losing reproducibility", () => {
    const genome = createGenome(842193, "orbital");
    const recovered = decodeDNA(encodeDNA(genome));
    expect(recovered).toEqual(genome);
  });

  it("makes a mutation record the source specimen as its parent", () => {
    const parent = createGenome(73122, "bloom");
    const child = mutateGenome(parent, "medium");
    expect(child.parentIds).toContain(parent.id);
    expect(child.generation).toBe(parent.generation + 1);
  });

  it("maps beginner controls to meaningful deterministic genome changes", () => {
    const genome = createGenome(912531, "plasma");
    const shaped = applyPlayControl(genome, "chaos", 82);
    expect(shaped.genes.noise).toBeGreaterThan(genome.genes.noise);
    expect(shaped.genes.distortion).toBeGreaterThan(genome.genes.distortion);
    expect(shaped.id).toBe(genome.id);
  });

  it("returns a bounded transparent score for the same genome", () => {
    const genome = createGenome(109332, "spiral");
    const first = deriveGenomeScore(genome, "Keep the field stable while improving its score.");
    const second = deriveGenomeScore(genome, "Keep the field stable while improving its score.");
    expect(first).toEqual(second);
    expect(first.total).toBeGreaterThanOrEqual(1);
    expect(first.total).toBeLessThanOrEqual(99);
  });

  it("creates a practice duel with a declared deterministic target", () => {
    const duel = createPracticeDuel(createGenome(535513, "orbital"));
    expect(duel.targetScore).toBeGreaterThan(0);
    expect(duel.target.id).not.toBe(duel.base.id);
    expect(duel.durationSeconds).toBe(30);
  });

  it("round-trips an invitation payload without changing its challenge rule", () => {
    const baseDNA = encodeDNA(createGenome(25362, "bloom"));
    const payload = { version: "GCL-DUEL-1" as const, baseDNA, targetScore: 91.4, rule: "Beat the source score with controlled mutation.", sourceId: "CR-TEST" };
    expect(decodeChallengePayload(encodeChallengePayload(payload))).toEqual(payload);
  });
});
