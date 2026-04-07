/**
 * LabSoundEngine.js - Web Audio API Sound Engine cho Thí nghiệm Ảo
 * 
 * Tạo âm thanh tổng hợp (synthesized) cho các thí nghiệm vật lý.
 * Không cần file audio, tất cả được tạo bằng oscillator & noise.
 */

class LabSoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.enabled = true;
    this.volume = 0.5;
    this._initialized = false;
    this._activeSounds = new Map();
  }

  /** Khởi tạo AudioContext (phải gọi sau user interaction) */
  init() {
    if (this._initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
      this._initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
      this.enabled = false;
    }
  }

  /** Đảm bảo context đang active */
  _ensureRunning() {
    if (!this._initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /** Set volume (0-1) */
  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  /** Toggle mute */
  toggle() {
    this.enabled = !this.enabled;
    if (this.masterGain) {
      this.masterGain.gain.value = this.enabled ? this.volume : 0;
    }
    return this.enabled;
  }

  // ═══════════════════════════════════════════
  // HIỆU ỨNG ÂM THANH
  // ═══════════════════════════════════════════

  /** Tiếng va chạm mạnh (quả bóng rơi xuống đất) */
  playImpact(intensity = 1.0) {
    if (!this.enabled) return;
    this._ensureRunning();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Low thump
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150 * intensity, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
    gain.gain.setValueAtTime(0.8 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.4);

    // Noise burst
    this._playNoiseBurst(0.15 * intensity, 0.08);
  }

  /** Tiếng click nhẹ (ghi số liệu, nút bấm) */
  playClick() {
    if (!this.enabled) return;
    this._ensureRunning();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  /** Tiếng whoosh (vật đang rơi/di chuyển) — liên tục, trả về controller */
  startWhoosh(initialSpeed = 0.5) {
    if (!this.enabled) return null;
    this._ensureRunning();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Filtered noise
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 300 + initialSpeed * 800;
    filter.Q.value = 2;

    const gain = ctx.createGain();
    gain.gain.value = 0.08 * initialSpeed;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start(now);

    const id = 'whoosh_' + Date.now();
    const controller = {
      /** Cập nhật tốc độ (0-1) */
      update: (speed) => {
        const s = Math.max(0, Math.min(1, speed));
        filter.frequency.value = 300 + s * 1200;
        gain.gain.value = Math.min(0.15, 0.05 + s * 0.1);
      },
      /** Dừng */
      stop: () => {
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        setTimeout(() => {
          try { source.stop(); } catch (e) {}
        }, 150);
        this._activeSounds.delete(id);
      }
    };

    this._activeSounds.set(id, controller);
    return controller;
  }

  /** Tiếng tick (con lắc qua vị trí cân bằng) */
  playTick(pitch = 1.0) {
    if (!this.enabled) return;
    this._ensureRunning();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2000 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(1500 * pitch, now + 0.03);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  /** Tiếng trượt/ma sát liên tục — trả về controller */
  startFriction(intensity = 0.5) {
    if (!this.enabled) return null;
    this._ensureRunning();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;

    const gain = ctx.createGain();
    gain.gain.value = 0.03 * intensity;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start(now);

    const id = 'friction_' + Date.now();
    const controller = {
      update: (speed) => {
        const s = Math.max(0, Math.min(1, speed));
        filter.frequency.value = 1500 + s * 3000;
        gain.gain.value = Math.min(0.08, 0.02 + s * 0.06);
      },
      stop: () => {
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        setTimeout(() => {
          try { source.stop(); } catch (e) {}
        }, 200);
        this._activeSounds.delete(id);
      }
    };

    this._activeSounds.set(id, controller);
    return controller;
  }

  /** Tiếng success/hoàn thành */
  playSuccess() {
    if (!this.enabled) return;
    this._ensureRunning();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.25, now + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });
  }

  /** Tiếng drop/release (thả vật) */
  playDrop() {
    if (!this.enabled) return;
    this._ensureRunning();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  /** Tiếng buzz điện (cho thí nghiệm điện) */
  startBuzz(frequency = 60) {
    if (!this.enabled) return null;
    this._ensureRunning();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = frequency;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const gain = ctx.createGain();
    gain.gain.value = 0.03;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);

    const id = 'buzz_' + Date.now();
    const controller = {
      update: (intensity) => {
        gain.gain.value = Math.min(0.08, 0.02 * intensity);
        osc.frequency.value = frequency * (0.8 + intensity * 0.4);
      },
      stop: () => {
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        setTimeout(() => {
          try { osc.stop(); } catch (e) {}
        }, 150);
        this._activeSounds.delete(id);
      }
    };

    this._activeSounds.set(id, controller);
    return controller;
  }

  /** Tiếng nước sôi/bọt (cho nhiệt lượng kế) */
  startBubble(intensity = 0.5) {
    if (!this.enabled) return null;
    this._ensureRunning();
    const ctx = this.ctx;
    let intervalId = null;

    const playOneBubble = () => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const freq = 200 + Math.random() * 600;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.05);
      gain.gain.setValueAtTime(0.1 * intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.08);
    };

    intervalId = setInterval(playOneBubble, 100 + Math.random() * 200);

    const id = 'bubble_' + Date.now();
    const controller = {
      update: (newIntensity) => {
        intensity = newIntensity;
      },
      stop: () => {
        if (intervalId) clearInterval(intervalId);
        this._activeSounds.delete(id);
      }
    };

    this._activeSounds.set(id, controller);
    return controller;
  }

  // ═══════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════

  /** Phát noise burst ngắn */
  _playNoiseBurst(volume = 0.1, duration = 0.05) {
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(gain);
    gain.connect(this.masterGain);
    source.start(now);
  }

  /** Dừng tất cả âm thanh đang chạy */
  stopAll() {
    this._activeSounds.forEach(controller => {
      try { controller.stop(); } catch (e) {}
    });
    this._activeSounds.clear();
  }

  /** Cleanup */
  dispose() {
    this.stopAll();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this._initialized = false;
  }
}

// Singleton instance
const labSoundEngine = new LabSoundEngine();

export default labSoundEngine;
export { LabSoundEngine };
