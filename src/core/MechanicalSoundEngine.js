/**
 * MechanicalSoundEngine.js
 * Quản lý âm thanh bằng Web Audio API cho giao diện Steampunk
 * - Tiếng Gear clack: Âm thanh kim loại va chạm nhẹ
 * - Tiếng Spark: Tiếng điện xoẹt xoẹt mạnh khi kéo cầu dao
 */

class MechanicalSoundEngine {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
    this.masterGain = null;
  }

  init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.connect(this.audioCtx.destination);
      this.masterGain.gain.value = 0.5;
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.masterGain) {
      this.masterGain.gain.value = this.enabled ? 0.5 : 0;
    }
    return this.enabled;
  }

  // Tiếng lách cách của bánh răng (Clack)
  playGearClack() {
    if (!this.enabled) return;
    this.init();

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    // Tạo sóng square vuông góc để giả lập tiếng va đập cứng
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.audioCtx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.05);
  }

  // Tiếng Sét/Rít điện hùng vĩ khi bật Cầu Dao
  playElectricSpark() {
    if (!this.enabled) return;
    this.init();

    const bufferSize = this.audioCtx.sampleRate * 1.5;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, this.audioCtx.currentTime);
    filter.frequency.linearRampToValueAtTime(6000, this.audioCtx.currentTime + 0.2);
    filter.frequency.linearRampToValueAtTime(500, this.audioCtx.currentTime + 0.8);
    filter.Q.value = 5;

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(1.5, this.audioCtx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0.3, this.audioCtx.currentTime + 0.2);
    gain.gain.linearRampToValueAtTime(1.0, this.audioCtx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    noise.stop(this.audioCtx.currentTime + 1.5);
  }

  // Tiếng dây thừng/cáp căng lên (khi kéo ròng rọc)
  playRopeCreak() {
    if (!this.enabled) return;
    this.init();

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const osc2 = this.audioCtx.createOscillator();
    const gain2 = this.audioCtx.createGain();

    // Tiếng rít thấp từ dây căng
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, this.audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(120, this.audioCtx.currentTime + 0.08);
    osc.frequency.linearRampToValueAtTime(60, this.audioCtx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);

    // Tiếng cọ sát cao hơn
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(400, this.audioCtx.currentTime);
    osc2.frequency.linearRampToValueAtTime(200, this.audioCtx.currentTime + 0.12);

    gain2.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.12);

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(this.masterGain);
    gain2.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.2);
    osc2.start();
    osc2.stop(this.audioCtx.currentTime + 0.12);
  }

  // Tiếng xì hơi nước áp suất (khi overload / quiz sai nhiều)
  playSteamHiss() {
    if (!this.enabled) return;
    this.init();

    const bufferSize = this.audioCtx.sampleRate * 0.8;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    // Lowpass để tạo tiếng "steam" ấm, không chói
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.audioCtx.currentTime);
    filter.frequency.linearRampToValueAtTime(2000, this.audioCtx.currentTime + 0.1);
    filter.frequency.linearRampToValueAtTime(400, this.audioCtx.currentTime + 0.7);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.8, this.audioCtx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0.6, this.audioCtx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    noise.stop(this.audioCtx.currentTime + 0.8);
  }
  // Tiếng Bíp điện tử + kim loại va chạm (lúc Ignition)
  playIgnitionBeep() {
    if (!this.enabled) return;
    this.init();
    const t = this.audioCtx.currentTime;

    // Beep điện tử
    const osc = this.audioCtx.createOscillator();
    const g = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.15);
    g.gain.setValueAtTime(0.6, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    osc.connect(g); g.connect(this.masterGain);
    osc.start(t); osc.stop(t + 0.3);

    // Kim loại va đập
    const osc2 = this.audioCtx.createOscillator();
    const g2 = this.audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(200, t + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(60, t + 0.25);
    g2.gain.setValueAtTime(0.8, t + 0.05);
    g2.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    osc2.connect(g2); g2.connect(this.masterGain);
    osc2.start(t + 0.05); osc2.stop(t + 0.3);
  }
}

export const mechSounds = new MechanicalSoundEngine();
