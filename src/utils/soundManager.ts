class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playMove() {
    this.playTone(150, 'sine', 0.1, 0.1);
  }

  playHit() {
    this.playTone(100, 'square', 0.15, 0.05);
  }

  playRoll() {
    this.playTone(Math.random() * 200 + 400, 'triangle', 0.05, 0.05);
  }

  playWin() {
    this.playTone(440, 'sine', 0.2, 0.1);
    setTimeout(() => this.playTone(554, 'sine', 0.2, 0.1), 150);
    setTimeout(() => this.playTone(659, 'sine', 0.4, 0.1), 300);
  }
}

export const soundManager = new SoundManager();
