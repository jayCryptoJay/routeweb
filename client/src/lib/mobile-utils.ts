export type HapticKind = "tap" | "success" | "warning";

const HAPTIC_PATTERNS: Record<HapticKind, number | number[]> = {
  tap: 8,
  success: [12, 40, 12],
  warning: [28, 50, 28],
};

export function triggerHaptic(kind: HapticKind = "tap") {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return false;
  return navigator.vibrate(HAPTIC_PATTERNS[kind]);
}

export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function stopSpeaking() {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}

export function speakStop(address: string, specialRequest?: string | null) {
  if (!isSpeechSupported()) return false;
  stopSpeaking();
  const request = specialRequest ? `. Special request: ${specialRequest}` : "";
  const utterance = new SpeechSynthesisUtterance(`Next delivery: ${address}${request}`);
  utterance.rate = 0.92;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
  return true;
}

export async function requestScreenWakeLock(): Promise<WakeLockSentinel | null> {
  if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return null;
  try {
    return await (navigator as Navigator & { wakeLock: { request: (type: "screen") => Promise<WakeLockSentinel> } }).wakeLock.request("screen");
  } catch {
    return null;
  }
}
