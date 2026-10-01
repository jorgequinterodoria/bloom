export type SoundscapeName = "rain" | "ocean" | "forest" | "night";

type ActiveSound = { stop: () => void } | null;
let active: ActiveSound = null;
let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  audioContext ??= new window.AudioContext();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

function noiseBuffer(ctx: AudioContext, seconds = 2) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function createNoise(ctx: AudioContext) {
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx);
  source.loop = true;
  return source;
}

function stopAll() {
  active?.stop();
  active = null;
}

export function stopSoundscape() {
  stopAll();
}

export function startSoundscape(name: SoundscapeName, volume = 0.16) {
  const ctx = getAudioContext();
  if (!ctx) return false;
  stopAll();

  const master = ctx.createGain();
  master.gain.value = Math.max(0, Math.min(0.35, volume));
  master.connect(ctx.destination);
  const nodes: Array<AudioScheduledSourceNode | AudioNode> = [];

  if (name === "rain") {
    const source = createNoise(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2200;
    filter.Q.value = 0.45;
    source.connect(filter).connect(master);
    source.start();
    nodes.push(source, filter);
  }

  if (name === "ocean") {
    const source = createNoise(ctx);
    const filter = ctx.createBiquadFilter();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    filter.type = "lowpass";
    filter.frequency.value = 800;
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 480;
    lfo.connect(lfoGain).connect(filter.frequency);
    source.connect(filter).connect(master);
    source.start();
    lfo.start();
    nodes.push(source, filter, lfo, lfoGain);
  }

  if (name === "forest") {
    const source = createNoise(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1800;
    source.connect(filter).connect(master);
    source.start();
    nodes.push(source, filter);
    [880, 1174.66, 1567.98].forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.008;
      oscillator.connect(gain).connect(master);
      oscillator.start(ctx.currentTime + index * 0.7);
      nodes.push(oscillator, gain);
    });
  }

  if (name === "night") {
    [174, 220, 261.63].forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.018 / (index + 1);
      oscillator.connect(gain).connect(master);
      oscillator.start();
      nodes.push(oscillator, gain);
    });
  }

  active = {
    stop: () => {
      const stopAt = ctx.currentTime + 0.35;
      master.gain.exponentialRampToValueAtTime(0.0001, stopAt);
      window.setTimeout(() => {
        nodes.forEach((node) => {
          try {
            if ("stop" in node && typeof node.stop === "function") node.stop();
          } catch {
            // Already stopped.
          }
          try { node.disconnect(); } catch { /* noop */ }
        });
        master.disconnect();
      }, 500);
    },
  };
  return true;
}
