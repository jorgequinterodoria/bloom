let context: AudioContext | null = null;
let ambience: { oscillator: OscillatorNode; gain: GainNode } | null = null;

function getContext() {
  if (typeof window === "undefined") return null;
  context ??= new window.AudioContext();
  return context;
}

export function playBloomChime(kind: "start" | "complete" | "step" = "step") {
  const audio = getContext();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume();
  const frequencies = kind === "complete" ? [523.25, 659.25, 783.99] : kind === "start" ? [392, 523.25] : [440];
  frequencies.forEach((frequency, index) => {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    const at = audio.currentTime + index * 0.09;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(kind === "complete" ? 0.06 : 0.045, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.45);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(at);
    oscillator.stop(at + 0.5);
  });
}

export function toggleBloomAmbience(enabled: boolean) {
  const audio = getContext();
  if (!audio) return;
  if (enabled) {
    if (ambience) return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 174;
    gain.gain.value = 0.0001;
    gain.gain.exponentialRampToValueAtTime(0.012, audio.currentTime + 0.8);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    ambience = { oscillator, gain };
  } else if (ambience) {
    ambience.gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.5);
    ambience.oscillator.stop(audio.currentTime + 0.55);
    ambience = null;
  }
}
