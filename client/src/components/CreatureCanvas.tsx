/**
 * FibStein Prismatic Observatory canvas.
 * Keeps the visual field dominant: dark graphite, equation-driven particles, and a
 * compact spectrum produced by genome colour values—not by broad UI decoration.
 */
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { CreatureGenome } from "@/lib/creatureEngine";
import { seededRandom } from "@/lib/creatureEngine";

export type CreatureCanvasHandle = { exportImage: () => string | null };

type CreatureCanvasProps = {
  genome: CreatureGenome;
  paused: boolean;
  onTogglePause: () => void;
  onRandomize: () => void;
  onArchive: () => void;
  onMetrics: (fps: number, particles: number) => void;
};

type PointerField = { x: number; y: number; strength: number; active: boolean };

const CreatureCanvas = forwardRef<CreatureCanvasHandle, CreatureCanvasProps>(function CreatureCanvas({ genome, paused, onTogglePause, onRandomize, onArchive, onMetrics }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef<PointerField>({ x: 0, y: 0, strength: 0, active: false });
  const lastTapRef = useRef(0);
  const gestureRef = useRef({ x: 0, y: 0, moved: false });
  const longPressRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({ exportImage: () => canvasRef.current?.toDataURL("image/png") ?? null }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;
    const random = seededRandom(genome.seed);
    const geneticPhase = random() * Math.PI * 2;
    const geneticOffset = random() * 500;
    let frameId = 0;
    let width = 0;
    let height = 0;
    let density = 1;
    let quality = 1;
    let time = 0;
    let lastFrame = performance.now();
    let sampledFrames = 0;
    let sampledTime = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      density = Math.min(window.devicePixelRatio || 1, 1.55);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * density);
      canvas.height = Math.floor(height * density);
      context.setTransform(density, 0, 0, density, 0, 0);
      context.fillStyle = "#07080c";
      context.fillRect(0, 0, width, height);
    };

    const paintBackground = (opacity: number) => {
      const fade = context.createRadialGradient(width * 0.5, height * 0.46, 30, width * 0.5, height * 0.46, Math.max(width, height) * 0.7);
      fade.addColorStop(0, `rgba(11, 16, 20, ${opacity})`);
      fade.addColorStop(0.62, `rgba(6, 8, 12, ${Math.min(1, opacity + 0.04)})`);
      fade.addColorStop(1, `rgba(2, 3, 6, ${Math.min(1, opacity + 0.14)})`);
      context.fillStyle = fade;
      context.fillRect(0, 0, width, height);
    };

    const draw = (now: number) => {
      const delta = Math.min(2.6, (now - lastFrame) / 16.667);
      lastFrame = now;
      sampledFrames += 1;
      sampledTime += delta * 16.667;
      if (sampledTime > 700) {
        const fps = Math.round((sampledFrames * 1000) / sampledTime);
        if (fps < 38) quality = Math.max(0.42, quality - 0.08);
        if (fps > 54) quality = Math.min(1, quality + 0.025);
        onMetrics(fps, Math.floor(genome.genes.particleCount * quality));
        sampledFrames = 0;
        sampledTime = 0;
      }
      if (!paused) time += 0.0065 * genome.genes.speed * delta;

      const fadeOpacity = genome.renderMode === "trails" ? 0.12 : 0.98;
      paintBackground(fadeOpacity);
      const genes = genome.genes;
      const count = Math.min(12000, Math.max(700, Math.floor(genes.particleCount * quality)));
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const viewportScale = width < 650 ? width / 330 : Math.min(width, height) / 500;
      const canvasScale = viewportScale * genes.scale;
      const familySeed = geneticPhase + geneticOffset * 0.001;
      const pointer = pointerRef.current;
      pointer.strength *= pointer.active ? 0.94 : 0.91;

      context.globalCompositeOperation = genome.renderMode === "trails" ? "lighter" : "source-over";
      context.lineWidth = 0.55 + genes.bloom * 1.15;
      const familyHue = genes.hue + genome.paletteIndex * 27;
      const dotSize = Math.max(0.45, 0.62 + genes.bloom * 1.7) * Math.min(1.2, canvasScale);

      if (genome.renderMode === "lines") {
        for (let band = 0; band < 14; band += 1) {
          context.beginPath();
          let started = false;
          const hue = (familyHue + band * 11) % 360;
          context.strokeStyle = `hsla(${hue}, ${Math.min(100, genes.saturation + 8)}%, ${Math.max(54, Math.min(72, genes.brightness * 0.76))}%, .58)`;
          for (let i = band; i < count; i += 14) {
            const point = coordinateFor(genome, i, count, time, familySeed, canvasScale, centerX, centerY, pointer, width, height);
            if (!started) { context.moveTo(point.x, point.y); started = true; } else context.lineTo(point.x, point.y);
          }
          context.stroke();
        }
      } else {
        for (let index = 0; index < count; index += 1) {
          const point = coordinateFor(genome, index, count, time, familySeed, canvasScale, centerX, centerY, pointer, width, height);
          const shimmer = (Math.sin(index * 0.018 + time * 5 + familySeed) + 1) * 0.5;
          const hue = (familyHue + Math.sin(index * 0.004 + time) * 42 + (index % 13) * 1.1 + 360) % 360;
          const alpha = 0.18 + shimmer * (0.42 + genes.bloom * 0.25);
          context.fillStyle = `hsla(${hue}, ${Math.min(100, genes.saturation + 8)}%, ${Math.max(55, Math.min(78, genes.brightness * 0.8 + shimmer * 6))}%, ${alpha})`;
          if (genes.bloom > 0.56 && index % 31 === 0) {
            context.shadowBlur = 7 + genes.bloom * 16;
            context.shadowColor = `hsla(${hue}, ${genes.saturation}%, ${genes.brightness}%, .45)`;
          } else context.shadowBlur = 0;
          context.fillRect(point.x, point.y, dotSize + shimmer * dotSize, dotSize + shimmer * dotSize);
        }
      }
      context.shadowBlur = 0;
      context.globalCompositeOperation = "source-over";
      frameId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    frameId = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, [genome, onMetrics, paused]);

  function updatePointer(clientX: number, clientY: number) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerRef.current = { x: clientX - rect.left, y: clientY - rect.top, strength: 1, active: true };
  }

  function clearLongPress() {
    if (longPressRef.current !== null) {
      window.clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  }

  return <canvas
    ref={canvasRef}
    className="creature-canvas"
    aria-label="Live mathematical creature rendered from the active DNA genome"
    onPointerDown={(event) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      gestureRef.current = { x: event.clientX, y: event.clientY, moved: false };
      updatePointer(event.clientX, event.clientY);
      longPressRef.current = window.setTimeout(() => {
        gestureRef.current.moved = true;
        pointerRef.current.active = false;
        onArchive();
      }, 650);
    }}
    onPointerMove={(event) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        if (Math.hypot(event.clientX - gestureRef.current.x, event.clientY - gestureRef.current.y) > 7) {
          gestureRef.current.moved = true;
          clearLongPress();
        }
        updatePointer(event.clientX, event.clientY);
      }
    }}
    onPointerUp={(event) => {
      clearLongPress();
      pointerRef.current.active = false;
      if (gestureRef.current.moved) return;
      const now = performance.now();
      if (now - lastTapRef.current < 300) onRandomize(); else onTogglePause();
      lastTapRef.current = now;
    }}
    onPointerLeave={() => { clearLongPress(); pointerRef.current.active = false; }}
  />;
});

function coordinateFor(genome: CreatureGenome, index: number, count: number, time: number, phase: number, scale: number, centerX: number, centerY: number, pointer: PointerField, width: number, height: number) {
  const genes = genome.genes;
  const progress = index / count;
  const angle = progress * Math.PI * 2;
  const wave = Math.sin(angle * genes.frequency + time * 4 + phase);
  const wobble = Math.cos(angle * (genes.frequency * 0.43) - time * 2.1 + phase * 2);
  let localX = 0;
  let localY = 0;
  const particleArc = index * 0.013 + time * genes.speed;

  if (genome.family === "tentacle") {
    const arm = index % 7;
    const tendril = progress * (132 + genes.vertical * 0.65);
    const radius = genes.radial + Math.sin(tendril * 0.05 + time * 2 + arm) * genes.amplitude * 8 + wobble * genes.distortion;
    const armAngle = arm * (Math.PI * 2 / 7) + Math.sin(progress * 9 + time) * genes.twist;
    localX = Math.cos(armAngle) * radius * (0.25 + progress * 0.72) + Math.sin(tendril * 0.08 + time * 3) * genes.distortion * 2;
    localY = Math.sin(armAngle) * radius * (0.25 + progress * 0.72) + tendril * Math.sin(armAngle + genes.phase) * 0.42 + wave * genes.vertical * 0.2;
  } else if (genome.family === "bloom") {
    const petals = Math.max(3, Math.floor(genes.frequency * 0.22));
    const radius = (genes.radial + Math.sin(angle * petals + time * 2.2) * genes.vertical * 0.5 + wobble * genes.distortion * 2) * (0.2 + progress * 0.82);
    localX = Math.cos(angle + time * genes.twist * 0.18) * radius;
    localY = Math.sin(angle + time * genes.twist * 0.18) * radius * (0.72 + genes.gravity * 0.12);
  } else if (genome.family === "orbital") {
    const orbit = 0.24 + progress * 1.08;
    const speed = 0.38 + (index % 11) * 0.032;
    const radius = genes.radial * orbit + Math.sin(particleArc * 5 + phase) * genes.distortion * 5;
    localX = Math.cos(particleArc * speed + angle * genes.phase) * radius;
    localY = Math.sin(particleArc * speed + angle * genes.phase) * radius * (0.58 + genes.gravity * 0.14) + Math.cos(angle * genes.frequency) * genes.amplitude * 8;
  } else if (genome.family === "plasma") {
    const radial = genes.radial * (0.35 + progress * 0.9) + wave * genes.vertical * 0.48;
    const distortion = Math.sin(angle * 5 + time * 2 + phase) * Math.cos(progress * genes.frequency * 0.17 - time * 3) * genes.distortion * 7;
    localX = Math.sin(angle * (1 + genes.warp * 0.34) + distortion * 0.02) * radial + Math.cos(angle * 13 + time * 4) * genes.noise * 37;
    localY = Math.cos(angle * (1 + genes.twist * 0.22) - distortion * 0.02) * radial * .72 + Math.sin(angle * 8 - time * 2) * genes.noise * 42;
  } else {
    const spiral = progress * (genes.radial * 1.45) + Math.sin(progress * genes.frequency + time * 2) * genes.amplitude * 12;
    const rotation = progress * Math.PI * (2.5 + genes.warp) + time * genes.twist * 0.8;
    localX = Math.cos(rotation) * spiral;
    localY = Math.sin(rotation) * spiral * .7 + Math.cos(progress * 34 + time * 2) * genes.distortion * 2;
  }
  localX += Math.sin(index * 0.031 + time * 3) * genes.noise * 18;
  localY += Math.cos(index * 0.024 - time * 2) * genes.noise * 18;
  let x = centerX + localX * scale;
  let y = centerY + localY * scale;
  if (pointer.strength > 0.02) {
    const dx = x - pointer.x;
    const dy = y - pointer.y;
    const distanceSquared = dx * dx + dy * dy + 90;
    const force = Math.min(58, (pointer.strength * genes.warp * 6400) / distanceSquared);
    x += dx * force;
    y += dy * force;
  }
  return { x: Math.min(width + 30, Math.max(-30, x)), y: Math.min(height + 30, Math.max(-30, y)) };
}

export default CreatureCanvas;
