let audioCtx: AudioContext | null = null;

export function ensureAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playClunk(): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.05;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(600, now);
  filter.Q.setValueAtTime(1, now);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.06);
}

export function playTick(progress: number): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const freq = 1800 - progress * 900;
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.04);
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2500, now);
  filter.Q.setValueAtTime(2, now);
  const volume = 0.08 + (1 - progress) * 0.06;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.06);
}

export function playLand(): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes: [number, number, number][] = [
    [880, 0.15, 0.6],
    [1320, 0.1, 0.5],
    [1760, 0.06, 0.45],
  ];
  notes.forEach(([freq, vol, dur], i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.05);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + i * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + i * 0.05 + dur + 0.05);
  });
}

export function playClick(): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(700, now);
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.1);
}

export function playStartChime(): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = [523, 659, 784];
  notes.forEach((freq, i) => {
    const t = now + i * 0.12;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, t);
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.06, t + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.3);
  });
}

export function playAlarm(): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const tones = [880, 1100, 880];
  for (let r = 0; r < 3; r++) {
    const repOffset = r * 0.8;
    tones.forEach((freq, i) => {
      const t = now + repOffset + i * 0.2;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }
}
