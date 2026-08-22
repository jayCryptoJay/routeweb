/**
 * Generative Creature Lab 3.0 — Duel Rift.
 * A creature game first: the math stays deterministic underneath, while play,
 * tension, challenge, and sharing lead the interaction layer.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  Archive, ArrowRight, BadgeCheck, ChevronDown, CircleHelp, Copy, Dna, Download,
  Flame, Gamepad2, LockKeyhole, Pause, Play, RotateCcw, Save, Send, Share2,
  Sparkles, Swords, Target, Timer, Trophy, X, Zap,
} from "lucide-react";
import { toast } from "sonner";
import CreatureCanvas, { type CreatureCanvasHandle } from "@/components/CreatureCanvas";
import {
  applyPlayControl, createGenome, createPracticeDuel, decodeChallengePayload, decodeDNA,
  deriveCreatureTraits, deriveGenomeScore, encodeChallengePayload, encodeDNA, fieldName,
  formattedSeed, mutateGenome, type ChallengePayload, type CreatureGenome, type GenomeScore,
  type PlayControl, type PracticeDuel, type StoredCreature, updateGene,
} from "@/lib/creatureEngine";

type View = "rift" | "duel" | "archive" | "records";
type SheetMode = "create" | "lab";
type DuelStatus = "brief" | "active" | "result";
type TutorialStep = 0 | 1 | 2 | 3 | 4;

const playControls: { id: PlayControl; label: string; caption: string; left: string; right: string }[] = [
  { id: "flow", label: "Flow", caption: "Changes how the lifeform bends and moves through space.", left: "calm", right: "sweeping" },
  { id: "twist", label: "Twist", caption: "Wraps the mathematical field around itself.", left: "open", right: "coiled" },
  { id: "chaos", label: "Chaos", caption: "Adds controlled wildness to the field.", left: "precise", right: "wild" },
  { id: "gravity", label: "Gravity", caption: "Pulls the organism through its own field.", left: "weightless", right: "heavy" },
  { id: "glow", label: "Glow", caption: "Turns up the emitted energy without hiding the form.", left: "dim", right: "electric" },
  { id: "density", label: "Density", caption: "Changes how many particles make up the organism.", left: "minimal", right: "dense" },
];

const rawGenes: { key: keyof CreatureGenome["genes"]; label: string; min: number; max: number; step: number }[] = [
  { key: "amplitude", label: "Amplitude", min: 0.2, max: 14, step: 0.01 },
  { key: "frequency", label: "Frequency", min: 5, max: 94, step: 0.1 },
  { key: "radial", label: "Radial", min: 18, max: 150, step: 0.1 },
  { key: "phase", label: "Phase", min: 0.1, max: 11, step: 0.01 },
  { key: "vertical", label: "Vertical", min: 18, max: 168, step: 0.1 },
  { key: "distortion", label: "Distortion", min: 0, max: 27, step: 0.01 },
  { key: "warp", label: "Warp", min: 0.1, max: 3, step: 0.01 },
  { key: "noise", label: "Noise", min: 0, max: 1.5, step: 0.01 },
];

function PrismRule() { return <span className="prism-rule" aria-hidden="true" />; }

function Brand() { return <div className="brand-lockup"><div className="capsule-mark"><span /></div><div><div className="fibstein-wordmark"><span>FIB</span><b>STEIN</b></div><p>GENERATIVE CREATURE GAME / 03</p></div></div>; }

function scoreLabel(score: number, target: number) {
  const difference = Number((score - target).toFixed(1));
  if (difference >= 0) return { copy: "TARGET BEATEN", detail: `+${difference} above target`, tone: "win" };
  if (difference >= -3) return { copy: "SO CLOSE", detail: `${Math.abs(difference)} points short`, tone: "near" };
  return { copy: "FIELD UNSTABLE", detail: `${Math.abs(difference)} points to improve`, tone: "loss" };
}

function getControlValue(genome: CreatureGenome, control: PlayControl) {
  const { genes } = genome;
  if (control === "flow") return ((genes.frequency - 13) / 67) * 100;
  if (control === "twist") return (genes.twist / 3.65) * 100;
  if (control === "chaos") return (genes.noise / 1.34) * 100;
  if (control === "gravity") return (genes.gravity / 2.7) * 100;
  if (control === "glow") return ((genes.bloom - 0.04) / 0.92) * 100;
  return ((genes.particleCount - 1300) / 8600) * 100;
}

export default function Home() {
  const canvasRef = useRef<CreatureCanvasHandle>(null);
  const [view, setView] = useState<View>("rift");
  const [genome, setGenome] = useState<CreatureGenome>(() => createGenome());
  const [paused, setPaused] = useState(false);
  const [fps, setFps] = useState(60);
  const [particles, setParticles] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<SheetMode>("create");
  const [selectedControl, setSelectedControl] = useState<PlayControl>("flow");
  const [savedCreatures, setSavedCreatures] = useState<StoredCreature[]>([]);
  const [lineage, setLineage] = useState<CreatureGenome[]>([]);
  const [bestScore, setBestScore] = useState(0);
  const [mostUnusual, setMostUnusual] = useState(0);
  const [longestLineage, setLongestLineage] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lastAchievement, setLastAchievement] = useState("");
  const [duel, setDuel] = useState<PracticeDuel | null>(null);
  const [duelStatus, setDuelStatus] = useState<DuelStatus>("brief");
  const [duelSeconds, setDuelSeconds] = useState(30);
  const [duelResult, setDuelResult] = useState<GenomeScore | null>(null);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [onboarding, setOnboarding] = useState<TutorialStep | null>(null);
  const [incomingChallenge, setIncomingChallenge] = useState<ChallengePayload | null>(null);
  const [scorePulse, setScorePulse] = useState<"best" | "near" | "" >("");
  const traits = useMemo(() => deriveCreatureTraits(genome), [genome]);
  const score = useMemo(() => deriveGenomeScore(genome, duel?.rule), [genome, duel?.rule]);

  useEffect(() => {
    try {
      const gallery = localStorage.getItem("gcl3-gallery");
      const storedLineage = localStorage.getItem("gcl3-lineage");
      const storedRecords = localStorage.getItem("gcl3-records");
      const tutorialComplete = localStorage.getItem("gcl3-tutorial");
      if (gallery) setSavedCreatures(JSON.parse(gallery));
      if (storedLineage) setLineage(JSON.parse(storedLineage));
      if (storedRecords) {
        const records = JSON.parse(storedRecords) as { bestScore: number; mostUnusual: number; longestLineage: number; combo: number };
        setBestScore(records.bestScore ?? 0); setMostUnusual(records.mostUnusual ?? 0); setLongestLineage(records.longestLineage ?? 0); setCombo(records.combo ?? 0);
      }
      if (!tutorialComplete) setOnboarding(0);
      const encoded = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("duel");
      if (encoded) setIncomingChallenge(decodeChallengePayload(encoded));
    } catch { toast("Local Rift progress could not be restored."); }
  }, []);

  useEffect(() => { if (!lineage.length) setLineage([genome]); }, [genome, lineage.length]);
  useEffect(() => { localStorage.setItem("gcl3-gallery", JSON.stringify(savedCreatures.slice(0, 32))); }, [savedCreatures]);
  useEffect(() => { localStorage.setItem("gcl3-lineage", JSON.stringify(lineage.slice(-30))); }, [lineage]);
  useEffect(() => { localStorage.setItem("gcl3-records", JSON.stringify({ bestScore, mostUnusual, longestLineage, combo })); }, [bestScore, mostUnusual, longestLineage, combo]);

  useEffect(() => {
    if (!duel || duelStatus !== "active") return;
    let start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const nextSeconds = Math.max(0, 30 - Math.floor((now - start) / 1000));
      setDuelSeconds(nextSeconds);
      if (nextSeconds > 0) frame = requestAnimationFrame(tick);
      else lockDuel();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duel, duelStatus]);

  const onMetrics = useCallback((nextFps: number, nextParticles: number) => { setFps(nextFps); setParticles(nextParticles); }, []);

  function preserveCurrent(silent = false) {
    const preview = canvasRef.current?.exportImage();
    if (!preview) { toast("The creature is still resolving."); return false; }
    const saved: StoredCreature = { id: genome.id, genome, preview, savedAt: new Date().toISOString() };
    setSavedCreatures((current) => [saved, ...current.filter((item) => item.id !== saved.id)].slice(0, 32));
    if (!silent) toast("CREATURE LOCKED · Added to your archive.");
    return true;
  }

  function mutate() {
    const child = mutateGenome(genome, "medium");
    setGenome(child); setPaused(false); setLineage((current) => [...current, child].slice(-30));
    setCombo((current) => current + 1);
    setLongestLineage((current) => Math.max(current, child.generation));
    if (child.generation >= 3 && child.family === genome.family) setLastAchievement("STABLE EVOLUTION · 3 same-family descendants");
    if (navigator.vibrate) navigator.vibrate(18);
    toast("MUTATION COMPLETE · New organism in the Rift.");
  }

  function discover() {
    const next = createGenome();
    setGenome(next); setLineage((current) => [...current, next].slice(-30)); setCombo(0);
    toast("FIELD DETECTED · New lifeform discovered.");
  }

  function beginDuel() {
    const nextDuel = createPracticeDuel(genome);
    setDuel(nextDuel); setDuelStatus("brief"); setDuelSeconds(30); setDuelResult(null); setView("duel");
  }

  function startDuel() { setDuelStatus("active"); setSheetOpen(true); setSheetMode("create"); }

  function lockDuel() {
    if (!duel || duelStatus === "result") return;
    const result = deriveGenomeScore(genome, duel.rule);
    setDuelResult(result); setDuelStatus("result"); setSheetOpen(false); preserveCurrent(true);
    const resultLabel = scoreLabel(result.total, duel.targetScore);
    if (result.total > bestScore) { setBestScore(result.total); setScorePulse("best"); setLastAchievement("NEW PERSONAL BEST · Genome score record"); }
    else if (resultLabel.tone === "near") setScorePulse("near");
    setMostUnusual((current) => Math.max(current, Math.round(100 - traits.coherence + traits.complexity * .4)));
    if (navigator.vibrate) navigator.vibrate(resultLabel.tone === "win" ? [25, 45, 45] : 20);
  }

  function createChallengePayload() {
    const targetScore = Number((Math.max(score.total + 1.5, bestScore || score.total + 1.5)).toFixed(1));
    return { version: "GCL-DUEL-1" as const, baseDNA: encodeDNA(genome), targetScore, rule: "Beat the source score with controlled mutation.", sourceId: genome.id };
  }

  async function copyChallenge() {
    const payload = encodeChallengePayload(createChallengePayload());
    const url = `${window.location.origin}${window.location.pathname}#duel=${payload}`;
    try { await navigator.clipboard.writeText(url); toast("CHALLENGE LINK COPIED · Your friend can play without signing in."); } catch { toast("Clipboard access is unavailable here."); }
  }

  function acceptIncomingChallenge() {
    if (!incomingChallenge) return;
    const base = decodeDNA(incomingChallenge.baseDNA);
    if (!base) { toast("This challenge record is not valid."); return; }
    setGenome(base); setDuel({ ...createPracticeDuel(base), targetScore: incomingChallenge.targetScore, rule: incomingChallenge.rule }); setDuelStatus("brief"); setIncomingChallenge(null); setView("duel");
  }

  function exportChallengeCard() {
    const preview = canvasRef.current?.exportImage();
    if (!preview) { toast("The card preview is still resolving."); return; }
    const card = document.createElement("canvas");
    card.width = 1080; card.height = 1350;
    const context = card.getContext("2d");
    if (!context) return;
    const image = new Image();
    image.onload = () => {
      context.fillStyle = "#050609"; context.fillRect(0, 0, card.width, card.height);
      const gradient = context.createLinearGradient(0, 0, card.width, card.height);
      gradient.addColorStop(0, "rgba(235,127,163,.25)"); gradient.addColorStop(.48, "rgba(116,216,187,.12)"); gradient.addColorStop(1, "rgba(124,180,237,.2)");
      context.fillStyle = gradient; context.fillRect(0, 0, card.width, card.height);
      context.drawImage(image, 0, 225, card.width, card.width);
      context.fillStyle = "#f5f7f2"; context.font = "500 43px monospace"; context.fillText("FIBSTEIN", 74, 94);
      context.fillStyle = "#94a5a0"; context.font = "22px monospace"; context.fillText("GENERATIVE CREATURE GAME", 74, 133);
      context.fillStyle = "#f4f6f2"; context.font = "600 68px sans-serif"; context.fillText("I DISCOVERED THIS", 74, 1080);
      context.fillStyle = "#7dd9bb"; context.font = "600 58px monospace"; context.fillText(genome.id, 74, 1150);
      context.fillStyle = "#efb86f"; context.font = "28px monospace"; context.fillText(`${traits.rarity.toUpperCase()} · GENOME SCORE ${score.total}`, 74, 1202);
      context.fillStyle = "#f4f6f2"; context.font = "600 44px sans-serif"; context.fillText("CAN YOU BEAT THIS?", 74, 1282);
      const link = document.createElement("a"); link.download = `${genome.id.toLowerCase()}-challenge.png`; link.href = card.toDataURL("image/png"); link.click();
      toast("VERTICAL CHALLENGE CARD EXPORTED.");
    };
    image.src = preview;
  }

  function finishTutorial() { localStorage.setItem("gcl3-tutorial", "complete"); setOnboarding(null); }
  function nextTutorial() { if (onboarding === 4) finishTutorial(); else setOnboarding((current) => current === null ? null : (current + 1) as TutorialStep); }

  const targetScore = duel?.targetScore ?? Number((Math.max(score.total + 1.4, 82)).toFixed(1));
  const activeTarget = duel?.target ?? null;
  const currentResult = duelResult ? scoreLabel(duelResult.total, duel?.targetScore ?? targetScore) : null;

  return <div className="duel-app">
    <header className="duel-header"><Brand /><nav>{(["rift", "duel", "archive", "records"] as View[]).map((item) => <button key={item} className={view === item ? "active" : ""} onClick={() => { if (item === "duel" && !duel) beginDuel(); else setView(item); }}>{item === "rift" ? "Rift" : item === "duel" ? "Duel" : item === "archive" ? "Archive" : "Records"}</button>)}</nav><div className="header-record"><Trophy size={13} /><span>BEST</span><strong>{bestScore ? bestScore.toFixed(1) : "—"}</strong></div></header>

    {view === "rift" && <main className="rift-game">
      <section className="game-stage"><CreatureCanvas ref={canvasRef} genome={genome} paused={paused} onTogglePause={() => setPaused((value) => !value)} onRandomize={discover} onArchive={() => preserveCurrent()} onMetrics={onMetrics} />
        <div className="game-vignette" /><div className="game-rift" aria-hidden="true"><i /><i /><i /></div>
        <div className="field-status"><span>FIELD DETECTED</span><strong>{fieldName(genome.family).toUpperCase()} LIFEFORM</strong><small>{fps} FPS · {particles.toLocaleString()} PARTICLES</small></div>
        <div className="score-card"><div className="score-card-head"><span>YOUR SCORE</span><b>{score.total}</b></div><div className="score-bar"><i style={{ width: `${score.total}%` }} /></div><div className="score-details"><span>{traits.rarity.toUpperCase()}</span><em>FIELD STABLE</em></div><button onClick={() => setView("records")}>Score contract <ArrowRight size={13} /></button></div>
        <div className="target-lock"><span>DECLARED TARGET</span><strong>{targetScore}</strong><p>{score.total >= targetScore ? "TARGET BEATEN" : `${Number((targetScore - score.total).toFixed(1))} TO BEAT`}</p><i /></div>
        <div className="discovery-card"><span className={`rarity-orb ${traits.rarity}`} /><div><small>{traits.rarity.toUpperCase()} DISCOVERY</small><strong>{genome.id}</strong><p>{traits.rarityReason}</p></div></div>
        <div className="specimen-evidence"><span>STRAND / {Math.round(genome.genes.frequency)}</span><i /><span>COHERENCE / {traits.coherence}</span><i /><span>GEN / {genome.generation}</span></div>
        {scorePulse && <div className={`record-burst ${scorePulse}`}><Sparkles size={17} /><div><span>{scorePulse === "best" ? "NEW PERSONAL BEST" : "NEAR MISS"}</span><strong>{scorePulse === "best" ? `${score.total} GENOME SCORE` : `${Math.abs(Number((score.total - targetScore).toFixed(1)))} POINTS SHORT`}</strong></div></div>}
        <div className="command-dock"><span>FIELD COMMAND</span><div className="play-actions"><button className="mutate-action" onClick={mutate}><Sparkles size={18} /> MUTATE</button><button className="battle-action" onClick={beginDuel}><Swords size={18} /> BATTLE</button><button className="share-action" onClick={() => setChallengeOpen(true)}><Share2 size={18} /> CHALLENGE A FRIEND</button></div></div>
        <div className="stage-bottom"><button className="create-handle" onClick={() => setSheetOpen((current) => !current)}><span>CREATE</span><ChevronDown size={15} className={sheetOpen ? "turned" : ""} /></button><span>TOUCH THE LIFEFORM · DOUBLE TAP TO DISCOVER</span><button onClick={() => setPaused((current) => !current)} aria-label="Pause or resume field">{paused ? <Play size={14} /> : <Pause size={14} />}</button></div>
      </section>
      <section className={`create-sheet ${sheetOpen ? "open" : ""}`}><div className="sheet-tabs"><button className={sheetMode === "create" ? "active" : ""} onClick={() => setSheetMode("create")}>CREATE</button><button className={sheetMode === "lab" ? "active" : ""} onClick={() => setSheetMode("lab")}><Dna size={13} /> LAB</button><button className="sheet-close" onClick={() => setSheetOpen(false)}><X size={16} /></button></div><PrismRule />
        {sheetMode === "create" ? <><div className="control-explainer"><div><span>{playControls.find((item) => item.id === selectedControl)?.label.toUpperCase()}</span><p>{playControls.find((item) => item.id === selectedControl)?.caption}</p></div><CircleHelp size={16} /></div><div className="play-control-list">{playControls.map((control) => { const value = Math.round(Math.max(0, Math.min(100, getControlValue(genome, control.id)))); return <label key={control.id} className={selectedControl === control.id ? "play-control selected" : "play-control"} onClick={() => setSelectedControl(control.id)}><div><strong>{control.label}</strong><span>{control.left} <i /> {control.right}</span></div><input type="range" min="0" max="100" value={value} style={{ "--fill": `${value}%` } as CSSProperties} onChange={(event) => setGenome((current) => applyPlayControl(current, control.id, Number(event.target.value)))} /><output>{value}</output></label>; })}</div></> : <><p className="lab-intro">Raw genes are recoverable mathematical DNA. Changes here are exact, serializable, and intentionally secondary to play.</p><div className="lab-grid">{rawGenes.map((gene) => <label key={gene.key}><span>{gene.label}</span><input type="number" min={gene.min} max={gene.max} step={gene.step} value={genome.genes[gene.key]} onChange={(event) => setGenome((current) => updateGene(current, gene.key, Number(event.target.value)))} /></label>)}</div></>}
      </section>
    </main>}

    {view === "duel" && <main className="duel-view"><section className="duel-intro"><div><span>PRACTICE MUTATION DUEL</span><h1>{duelStatus === "brief" ? "Can you beat the field?" : duelStatus === "active" ? "Make every mutation count." : currentResult?.copy}</h1><p>{duel?.rule ?? "Start from the same genome. Improve it with controlled mutation."}</p></div><div className="duel-timer"><Timer size={15} /><strong>{duelStatus === "active" ? `00:${String(duelSeconds).padStart(2, "0")}` : "00:30"}</strong><small>{duelStatus === "result" ? "LOCKED" : duelStatus === "active" ? "LIVE" : "READY"}</small></div></section><section className="duel-arena"><div className="duel-entry current"><span>YOUR FIELD</span><div className="mini-creature"><CreatureCanvas ref={canvasRef} genome={genome} paused={false} onTogglePause={() => undefined} onRandomize={() => undefined} onArchive={() => undefined} onMetrics={() => undefined} /></div><strong>{duelResult?.total ?? score.total}</strong><small>GENOME SCORE</small></div><div className="versus"><Swords size={22} /><span>VS</span><small>MATHEMATICAL TARGET</small></div><div className="duel-entry target"><span>PRACTICE TARGET</span><div className="mini-creature">{activeTarget && <CreatureCanvas genome={activeTarget} paused={false} onTogglePause={() => undefined} onRandomize={() => undefined} onArchive={() => undefined} onMetrics={() => undefined} />}</div><strong>{duel?.targetScore ?? targetScore}</strong><small>DECLARED TARGET</small></div></section>{duelStatus === "brief" && <div className="duel-callout"><Target size={18} /><div><strong>Same seed. Transparent score. No fake opponent.</strong><p>Use the Create controls to make one field that beats the target in thirty seconds.</p></div><button onClick={startDuel}>START DUEL <ArrowRight size={15} /></button></div>}{duelStatus === "active" && <div className="duel-callout active"><Flame size={18} /><div><strong>FIELD OPEN · {duelSeconds}s REMAINING</strong><p>Control the organism, then lock your entry before time expires.</p></div><button onClick={lockDuel}><LockKeyhole size={14} /> LOCK CREATURE</button></div>}{duelStatus === "result" && <div className={`duel-result ${currentResult?.tone}`}><div><span>{currentResult?.copy}</span><strong>YOU {duelResult?.total} <em>—</em> TARGET {duel?.targetScore}</strong><p>{currentResult?.detail}. {currentResult?.tone === "win" ? "Your creature is now locked in the archive." : "One more mutation could change the field."}</p></div><div><button onClick={() => { setGenome(mutateGenome(genome, "low")); setDuelStatus("active"); setDuelSeconds(30); setDuelResult(null); }}>ONE MORE MUTATION</button><button className="outline" onClick={() => setChallengeOpen(true)}>CHALLENGE A FRIEND</button></div></div>}</main>}

    {view === "archive" && <main className="archive-view game-page"><div className="page-heading"><span>LOCKED CREATURES</span><h1>Build a lineage worth sending.</h1><p>Every locked organism retains its genome, discovery class, score, and ancestry.</p></div><div className="lineage-row">{lineage.slice(-8).map((entry, index) => <button key={`${entry.id}-${index}`} className={entry.id === genome.id ? "active" : ""} onClick={() => { setGenome(entry); setView("rift"); }}><i style={{ "--dot-hue": `${entry.genes.hue}deg` } as CSSProperties} /><span>GEN {entry.generation}</span><strong>{entry.id.slice(-4)}</strong></button>)}</div><div className="archive-grid">{savedCreatures.length ? savedCreatures.map((entry) => { const entryTraits = deriveCreatureTraits(entry.genome); const entryScore = deriveGenomeScore(entry.genome); return <button key={entry.id} onClick={() => { setGenome(entry.genome); setView("rift"); }}><img src={entry.preview} alt={`${entry.genome.name} saved creature`} /><span>{entryTraits.rarity.toUpperCase()}</span><div><small>{fieldName(entry.genome.family)} · GEN {entry.genome.generation}</small><strong>{entry.genome.name}</strong><p>{entry.id} · SCORE {entryScore.total}</p></div><ArrowRight size={15} /></button>; }) : <div className="empty-archive"><Archive size={26} /><strong>NO CREATURES LOCKED</strong><p>Beat a target or preserve a discovery to start your lineage.</p><button onClick={() => setView("rift")}>RETURN TO RIFT</button></div>}</div></main>}

    {view === "records" && <main className="records-view game-page"><div className="page-heading"><span>PERSONAL RECORDS</span><h1>Improve the things that matter.</h1><p>Every number comes from your locally recorded creatures and transparent genome scores.</p></div><div className="record-grid"><div><Trophy size={18} /><span>BEST SCORE</span><strong>{bestScore ? bestScore.toFixed(1) : "—"}</strong><small>Beat it in a Mutation Duel.</small></div><div><Sparkles size={18} /><span>MOST UNUSUAL</span><strong>{mostUnusual || "—"}</strong><small>Derived from parameter-distribution distance.</small></div><div><RotateCcw size={18} /><span>LONGEST LINEAGE</span><strong>{longestLineage || "—"}</strong><small>Keep evolving one original organism.</small></div><div><Flame size={18} /><span>EVOLUTION COMBO</span><strong>{combo || "—"}</strong><small>Mutate without abandoning the family.</small></div></div><div className="achievement-panel"><div><BadgeCheck size={18} /><span>ACTIVE FIELD MARK</span><strong>{lastAchievement || "Discover a new lifeform to begin."}</strong></div><p>Progress is tied to tangible creative behavior: discovery, stable evolution, lineage, duel score, and remix—not a generic daily-login loop.</p></div><div className="score-contract"><span>GENOME SCORE CONTRACT</span><PrismRule /><div>{Object.entries(score).filter(([key]) => key !== "total").map(([key, value]) => <div key={key}><small>{key.replace(/([A-Z])/g, " $1")}</small><strong>{value}</strong></div>)}</div><p>Complexity 30% · Coherence 25% · Stability 15% · Controlled variation 15% · Challenge fit 15%. Community voting, if added later, will remain separate.</p></div></main>}

    {challengeOpen && <div className="modal-layer"><button className="modal-scrim" onClick={() => setChallengeOpen(false)} aria-label="Close challenge dialog" /><section className="challenge-modal"><button className="close-modal" onClick={() => setChallengeOpen(false)}><X size={17} /></button><div className="vertical-card"><div className="card-top"><Brand /><span>CHALLENGE TRANSMISSION</span></div><img src={canvasRef.current?.exportImage() ?? ""} alt="Current creature challenge preview" /><div className="card-copy"><small>I DISCOVERED THIS LIFEFORM</small><strong>{genome.id}</strong><div><span>{traits.rarity.toUpperCase()}</span><span>GENOME SCORE {score.total}</span><span>GEN {genome.generation}</span></div><h2>CAN YOU BEAT THIS?</h2><p>Target score {Number((score.total + 1.5).toFixed(1))} · {fieldName(genome.family)} mutation duel</p></div></div><div className="challenge-actions"><button className="primary" onClick={copyChallenge}><Copy size={15} /> COPY CHALLENGE LINK</button><button onClick={exportChallengeCard}><Download size={15} /> EXPORT VERTICAL CARD</button><button onClick={() => { preserveCurrent(true); toast("SOURCE CREATURE LOCKED FOR REMIX."); }}><Save size={15} /> LOCK SOURCE</button></div><p className="challenge-note">The link carries the starting DNA, target score, and duel rule. A recipient sees the creature before any account prompt.</p></section></div>}

    {incomingChallenge && <div className="modal-layer incoming"><div className="modal-scrim" /><section className="incoming-modal"><span>INCOMING CREATURE CHALLENGE</span><h1>Your friend thinks you can’t beat this.</h1><p>Start from their recoverable genome and improve the field with controlled mutation.</p><div><small>TARGET SCORE</small><strong>{incomingChallenge.targetScore}</strong></div><button onClick={acceptIncomingChallenge}>ACCEPT CHALLENGE <ArrowRight size={16} /></button><button className="text" onClick={() => setIncomingChallenge(null)}>Maybe later</button></section></div>}

    {onboarding !== null && <div className="tutorial-layer"><div className="tutorial-step"><span>WELCOME TO THE RIFT · {onboarding + 1}/5</span><div className="tutorial-orb"><i /></div><h1>{["THIS IS A MATHEMATICAL LIFEFORM", "SHAPE THE FIELD", "MUTATE AN OFFSPRING", "BEAT THE TARGET", "CHALLENGE A FRIEND"][onboarding]}</h1><p>{["Tap, drag, and watch an original organism respond to you.", "Use a visual control. The mathematics stays underneath until you want it.", "Mutation preserves ancestry and creates a brand-new creature.", "Your score is transparent. See if one more mutation beats the field.", "Send a playable creature challenge, not a generic app link."][onboarding]}</p><div><button className="skip" onClick={finishTutorial}>SKIP</button><button onClick={nextTutorial}>{onboarding === 4 ? "ENTER THE RIFT" : "NEXT"} <ArrowRight size={15} /></button></div></div></div>}
  </div>;
}
