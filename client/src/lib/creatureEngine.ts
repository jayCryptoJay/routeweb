/**
 * Generative Creature Lab engine — deterministic, browser-native procedural art.
 * The generator layer is intentionally independent from the React interface so that
 * a seed + genome + renderer version can be serialized and reproduced.
 */
export type CreatureFamily = "tentacle" | "bloom" | "orbital" | "plasma" | "spiral";
export type RenderMode = "points" | "trails" | "lines";
export type MutationIntensity = "tiny" | "low" | "medium" | "high" | "chaotic";

export type CreatureGenes = {
  amplitude: number;
  frequency: number;
  radial: number;
  phase: number;
  vertical: number;
  distortion: number;
  gravity: number;
  warp: number;
  twist: number;
  noise: number;
  bloom: number;
  speed: number;
  particleCount: number;
  scale: number;
  hue: number;
  saturation: number;
  brightness: number;
};

export type CreatureGenome = {
  id: string;
  version: "GCL-1.0";
  seed: number;
  family: CreatureFamily;
  renderMode: RenderMode;
  paletteIndex: number;
  name: string;
  createdAt: string;
  parentIds: string[];
  generation: number;
  genes: CreatureGenes;
};

export type StoredCreature = {
  id: string;
  genome: CreatureGenome;
  preview: string;
  savedAt: string;
};

export const families: { value: CreatureFamily; label: string; description: string }[] = [
  { value: "tentacle", label: "Tentacle", description: "Oscillating radial appendages" },
  { value: "bloom", label: "Bloom", description: "Petaled harmonic deformation" },
  { value: "orbital", label: "Orbital", description: "Nested rotational bodies" },
  { value: "plasma", label: "Plasma", description: "Nonlinear field turbulence" },
  { value: "spiral", label: "Spiral", description: "Expanding polar field" },
];

export const renderModes: { value: RenderMode; label: string }[] = [
  { value: "points", label: "Points" },
  { value: "trails", label: "Trails" },
  { value: "lines", label: "Lines" },
];

const mutationWeights: Record<MutationIntensity, number> = { tiny: 0.025, low: 0.07, medium: 0.16, high: 0.32, chaotic: 0.68 };
const familiesByIndex: CreatureFamily[] = ["tentacle", "bloom", "orbital", "plasma", "spiral"];

export function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSeed() {
  const values = new Uint32Array(1);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(values);
    return values[0];
  }
  return (Date.now() ^ ((performance?.now?.() ?? 0) * 1000)) >>> 0;
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function numberCode(value: number) {
  return Number(value.toFixed(3));
}

function specimenId(seed: number) {
  return `CR-${seed.toString(36).toUpperCase().slice(-6).padStart(6, "0")}`;
}

function defaultGenes(seed: number): CreatureGenes {
  const random = seededRandom(seed);
  return {
    amplitude: numberCode(3.6 + random() * 5.8),
    frequency: numberCode(17 + random() * 43),
    radial: numberCode(48 + random() * 66),
    phase: numberCode(1.1 + random() * 5.4),
    vertical: numberCode(56 + random() * 84),
    distortion: numberCode(3 + random() * 14),
    gravity: numberCode(0.35 + random() * 1.75),
    warp: numberCode(0.45 + random() * 1.75),
    twist: numberCode(0.1 + random() * 2.2),
    noise: numberCode(0.04 + random() * 0.85),
    bloom: numberCode(0.15 + random() * 0.75),
    speed: numberCode(0.45 + random() * 1.25),
    particleCount: Math.round(4200 + random() * 4000),
    scale: numberCode(0.72 + random() * 0.48),
    hue: Math.round(148 + random() * 165),
    saturation: Math.round(62 + random() * 28),
    brightness: Math.round(73 + random() * 23),
  };
}

export function createGenome(seed = createSeed(), family?: CreatureFamily): CreatureGenome {
  const random = seededRandom(seed);
  const selectedFamily = family ?? familiesByIndex[Math.floor(random() * familiesByIndex.length)];
  const id = specimenId(seed);
  return {
    id,
    version: "GCL-1.0",
    seed,
    family: selectedFamily,
    renderMode: random() > 0.76 ? "trails" : "points",
    paletteIndex: Math.floor(random() * 4),
    name: `${selectedFamily[0].toUpperCase()}${selectedFamily.slice(1)} ${id.slice(-3)}`,
    createdAt: new Date().toISOString(),
    parentIds: [],
    generation: 0,
    genes: defaultGenes(seed),
  };
}

export function cloneGenome(genome: CreatureGenome, patch: Partial<CreatureGenome> = {}): CreatureGenome {
  return { ...genome, ...patch, genes: { ...genome.genes, ...(patch.genes ?? {}) } };
}

type GeneRange = [number, number];
const geneRanges: Record<keyof CreatureGenes, GeneRange> = {
  amplitude: [0.2, 14], frequency: [5, 94], radial: [18, 150], phase: [0.1, 11], vertical: [18, 168], distortion: [0, 27], gravity: [0, 3], warp: [0.1, 3], twist: [0, 4], noise: [0, 1.5], bloom: [0, 1], speed: [0, 2.5], particleCount: [900, 12000], scale: [0.35, 1.85], hue: [0, 360], saturation: [30, 100], brightness: [35, 100],
};

export function updateGene(genome: CreatureGenome, gene: keyof CreatureGenes, value: number) {
  const [min, max] = geneRanges[gene];
  const normalized = gene === "particleCount" || gene === "hue" || gene === "saturation" || gene === "brightness" ? Math.round(clamp(value, min, max)) : numberCode(clamp(value, min, max));
  return cloneGenome(genome, { genes: { ...genome.genes, [gene]: normalized } });
}

export function mutateGenome(parent: CreatureGenome, intensity: MutationIntensity): CreatureGenome {
  const childSeed = hashString(`${parent.seed}:${intensity}:${Date.now()}:${parent.generation}`);
  const random = seededRandom(childSeed);
  const weight = mutationWeights[intensity];
  const genes = Object.entries(parent.genes).reduce((accumulator, [gene, rawValue]) => {
    const key = gene as keyof CreatureGenes;
    const [min, max] = geneRanges[key];
    const span = max - min;
    const signedOffset = (random() - 0.5) * 2 * span * weight * (0.45 + random() * 0.55);
    const value = key === "particleCount" || key === "hue" || key === "saturation" || key === "brightness" ? Math.round(clamp(rawValue + signedOffset, min, max)) : numberCode(clamp(rawValue + signedOffset, min, max));
    accumulator[key] = value;
    return accumulator;
  }, {} as CreatureGenes);
  const shouldShiftFamily = intensity === "chaotic" && random() > 0.58;
  const family = shouldShiftFamily ? familiesByIndex[Math.floor(random() * familiesByIndex.length)] : parent.family;
  const id = specimenId(childSeed);
  return { ...parent, id, seed: childSeed, family, genes, name: `${family[0].toUpperCase()}${family.slice(1)} ${id.slice(-3)}`, createdAt: new Date().toISOString(), parentIds: [parent.id], generation: parent.generation + 1, paletteIndex: Math.floor(random() * 4) };
}

export function crossoverGenome(parentA: CreatureGenome, parentB: CreatureGenome): CreatureGenome {
  const childSeed = hashString(`${parentA.seed}:${parentB.seed}:${Date.now()}`);
  const random = seededRandom(childSeed);
  const genes = Object.keys(parentA.genes).reduce((accumulator, gene) => {
    const key = gene as keyof CreatureGenes;
    const blend = random();
    const value = parentA.genes[key] * blend + parentB.genes[key] * (1 - blend);
    accumulator[key] = key === "particleCount" || key === "hue" || key === "saturation" || key === "brightness" ? Math.round(value) : numberCode(value);
    return accumulator;
  }, {} as CreatureGenes);
  const id = specimenId(childSeed);
  return { ...parentA, id, seed: childSeed, family: random() > 0.5 ? parentA.family : parentB.family, renderMode: random() > 0.52 ? parentA.renderMode : parentB.renderMode, paletteIndex: random() > 0.5 ? parentA.paletteIndex : parentB.paletteIndex, genes, name: `Hybrid ${id.slice(-3)}`, createdAt: new Date().toISOString(), parentIds: [parentA.id, parentB.id], generation: Math.max(parentA.generation, parentB.generation) + 1 };
}

type SharePayload = { v: string; s: number; f: CreatureFamily; r: RenderMode; p: number; n: string; g: CreatureGenes; x: string[]; q: number; id: string; t: string };

export function encodeDNA(genome: CreatureGenome) {
  const payload: SharePayload = { v: genome.version, s: genome.seed, f: genome.family, r: genome.renderMode, p: genome.paletteIndex, n: genome.name, g: genome.genes, x: genome.parentIds, q: genome.generation, id: genome.id, t: genome.createdAt };
  return `GCL1:${btoa(unescape(encodeURIComponent(JSON.stringify(payload))))}`;
}

export function decodeDNA(value: string): CreatureGenome | null {
  try {
    if (!value.trim().startsWith("GCL1:")) return null;
    const payload = JSON.parse(decodeURIComponent(escape(atob(value.trim().slice(5))))) as SharePayload;
    if (!payload.g || !payload.s || !families.some((family) => family.value === payload.f)) return null;
    return { id: payload.id || specimenId(payload.s), version: payload.v === "GCL-1.0" ? payload.v : "GCL-1.0", seed: payload.s, family: payload.f, renderMode: renderModes.some((mode) => mode.value === payload.r) ? payload.r : "points", paletteIndex: payload.p ?? 0, name: payload.n || "Recovered specimen", createdAt: payload.t || new Date().toISOString(), parentIds: payload.x ?? [], generation: payload.q ?? 0, genes: { ...defaultGenes(payload.s), ...payload.g } };
  } catch {
    return null;
  }
}

export function formattedSeed(seed: number) {
  return seed.toString(36).toUpperCase().padStart(7, "0").slice(-7);
}

export function fieldName(family: CreatureFamily) {
  return families.find((item) => item.value === family)?.label ?? "Experimental";
}

export type CreatureTraits = {
  complexity: number;
  coherence: number;
  chroma: number;
  rarity: "common" | "uncommon" | "rare" | "extreme" | "anomalous" | "singular";
  rarityReason: string;
  signature: string;
};

export type DailyFieldTrial = {
  id: string;
  date: string;
  title: string;
  mode: "lowDensity" | "quietDrift" | "chromatic" | "structural";
  briefing: string;
  requirement: string;
};

export function deriveCreatureTraits(genome: CreatureGenome): CreatureTraits {
  const { genes } = genome;
  const complexity = Math.round(clamp(24 + genes.frequency * 0.38 + genes.warp * 13 + genes.distortion * 1.25 + genes.noise * 18, 1, 99));
  const coherence = Math.round(clamp(94 - Math.abs(genes.twist - 1.15) * 15 - genes.noise * 19 - Math.abs(genes.gravity - 1.05) * 8 + genes.bloom * 7, 1, 99));
  const chroma = Math.round(clamp(genes.saturation * 0.48 + genes.brightness * 0.3 + genes.bloom * 19 + Math.abs(Math.sin(genes.hue * Math.PI / 180)) * 12, 1, 99));
  const edgeDistance = Math.min(genes.noise / 1.5, Math.abs(genes.twist - 2) / 2, Math.abs(genes.warp - 1.55) / 1.45, Math.abs(genes.frequency - 49) / 45);
  const rareIndex = complexity * 0.44 + chroma * 0.22 + (100 - coherence) * 0.22 + edgeDistance * 18;
  const rarity = rareIndex > 90 ? "singular" : rareIndex > 78 ? "anomalous" : rareIndex > 67 ? "extreme" : rareIndex > 57 ? "rare" : rareIndex > 46 ? "uncommon" : "common";
  const reason = rarity === "common"
    ? "Gene values sit near the expected centre of this family’s field."
    : rarity === "uncommon"
      ? "The genome combines a less frequent colour-energy balance with stable structure."
      : rarity === "rare"
        ? "Frequency, warp, and chromatic range land outside the usual shared pattern band."
        : rarity === "extreme"
          ? "Several active genes occupy edge-range territory while the field remains coherent."
          : rarity === "anomalous"
            ? "The genome holds a statistically unusual combination of turbulence and visual coherence."
            : "Multiple independent genes converge near extreme distribution edges in a stable artifact.";
  const signature = `${fieldName(genome.family).toUpperCase()} · ${Math.round(genes.frequency)}Hz / ${Math.round(genes.warp * 100)}W`;
  return { complexity, coherence, chroma, rarity, rarityReason: reason, signature };
}

export function getDailyFieldTrial(date = new Date()): DailyFieldTrial {
  const utcDate = date.toISOString().slice(0, 10);
  const random = seededRandom(hashString(`gcl-trial:${utcDate}`));
  const configurations: Omit<DailyFieldTrial, "id" | "date">[] = [
    { title: "Minimal Signal", mode: "lowDensity", briefing: "Constrain the field until every surviving particle must carry the form.", requirement: "Keep the particle gene at or below 4,200." },
    { title: "Quiet Drift", mode: "quietDrift", briefing: "Search for an organism that holds its silhouette inside a low-turbulence flow.", requirement: "Keep noise at or below 0.30 and coherence above 70." },
    { title: "Chromatic Constraint", mode: "chromatic", briefing: "Use colour energy to reveal a new structure, not to disguise one.", requirement: "Set saturation to 72 or higher and bloom to 0.45 or higher." },
    { title: "Structural Recall", mode: "structural", briefing: "Build a distinct mathematical form from a confined rotational field.", requirement: "Set warp between 1.10–1.75 and twist between 0.70–1.65." },
  ];
  const selected = configurations[Math.floor(random() * configurations.length)];
  return { ...selected, id: `field-${utcDate}`, date: utcDate };
}

export function meetsDailyFieldTrial(genome: CreatureGenome, trial: DailyFieldTrial) {
  const genes = genome.genes;
  if (trial.mode === "lowDensity") return genes.particleCount <= 4200;
  if (trial.mode === "quietDrift") return genes.noise <= 0.3 && deriveCreatureTraits(genome).coherence >= 70;
  if (trial.mode === "chromatic") return genes.saturation >= 72 && genes.bloom >= 0.45;
  return genes.warp >= 1.1 && genes.warp <= 1.75 && genes.twist >= 0.7 && genes.twist <= 1.65;
}

export type PlayControl = "flow" | "twist" | "chaos" | "gravity" | "glow" | "density";

export type GenomeScore = {
  total: number;
  complexity: number;
  coherence: number;
  stability: number;
  controlledVariation: number;
  challengeFit: number;
};

export type PracticeDuel = {
  id: string;
  base: CreatureGenome;
  target: CreatureGenome;
  targetScore: number;
  rule: string;
  durationSeconds: number;
};

export type ChallengePayload = {
  version: "GCL-DUEL-1";
  baseDNA: string;
  targetScore: number;
  rule: string;
  sourceId: string;
};

/**
 * Maps game-language controls to several raw genes. This keeps beginner play
 * expressive while the full mathematical genome remains available in the Lab.
 */
export function applyPlayControl(genome: CreatureGenome, control: PlayControl, value: number) {
  const normalized = clamp(value, 0, 100) / 100;
  const genes = { ...genome.genes };
  if (control === "flow") {
    genes.radial = numberCode(34 + normalized * 104);
    genes.frequency = numberCode(13 + normalized * 67);
    genes.phase = numberCode(0.5 + normalized * 7.5);
  }
  if (control === "twist") genes.twist = numberCode(normalized * 3.65);
  if (control === "chaos") {
    genes.noise = numberCode(normalized * 1.34);
    genes.distortion = numberCode(1 + normalized * 23);
  }
  if (control === "gravity") genes.gravity = numberCode(normalized * 2.7);
  if (control === "glow") {
    genes.bloom = numberCode(0.04 + normalized * 0.92);
    genes.brightness = Math.round(55 + normalized * 40);
    genes.saturation = Math.round(48 + normalized * 48);
  }
  if (control === "density") genes.particleCount = Math.round(1300 + normalized * 8600);
  return cloneGenome(genome, { genes });
}

/** A visible score contract for play and duels. Community outcomes are never folded into this score. */
export function deriveGenomeScore(genome: CreatureGenome, challengeRule?: string): GenomeScore {
  const traits = deriveCreatureTraits(genome);
  const { genes } = genome;
  const stability = Math.round(clamp(94 - genes.noise * 27 - Math.abs(genes.gravity - 1.1) * 11 - Math.abs(genes.twist - 1.35) * 8, 1, 99));
  const controlledVariation = Math.round(clamp(46 + genes.warp * 15 + genes.distortion * 1.05 + genes.bloom * 18 - Math.abs(genes.noise - 0.55) * 16, 1, 99));
  const challengeFit = challengeRule?.includes("stable")
    ? Math.round(clamp(stability * 0.68 + traits.coherence * 0.32, 1, 99))
    : Math.round(clamp(traits.complexity * 0.54 + traits.coherence * 0.27 + controlledVariation * 0.19, 1, 99));
  const total = Number((traits.complexity * 0.3 + traits.coherence * 0.25 + stability * 0.15 + controlledVariation * 0.15 + challengeFit * 0.15).toFixed(1));
  return { total, complexity: traits.complexity, coherence: traits.coherence, stability, controlledVariation, challengeFit };
}

export function createPracticeDuel(base: CreatureGenome): PracticeDuel {
  const targetSeed = hashString(`duel:${base.seed}:${base.family}:${base.generation}`);
  const target = mutateGenome({ ...base, seed: targetSeed, id: specimenId(targetSeed), name: "Practice target", parentIds: [], generation: 0 }, "low");
  const rules = ["Keep the field stable while improving its score.", "Create controlled variation without losing coherence.", "Build a complex organism that keeps its structure."];
  const rule = rules[targetSeed % rules.length];
  const targetScore = Number((deriveGenomeScore(target, rule).total + 1.5).toFixed(1));
  return { id: `DUEL-${targetSeed.toString(36).toUpperCase().slice(-6)}`, base, target, targetScore, rule, durationSeconds: 30 };
}

export function encodeChallengePayload(payload: ChallengePayload) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

export function decodeChallengePayload(value: string): ChallengePayload | null {
  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(value)))) as ChallengePayload;
    if (payload.version !== "GCL-DUEL-1" || !payload.baseDNA.startsWith("GCL1:") || !Number.isFinite(payload.targetScore)) return null;
    return payload;
  } catch { return null; }
}
