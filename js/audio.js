export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.sfx = null;
    this.music = null;
    this.nodes = [];
    this.engineOn = false;
  }

  init() {
    if (this.ctx) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.38;
    this.master.connect(ctx.destination);
    this.sfx = ctx.createGain();
    this.sfx.gain.value = 1;
    this.sfx.connect(this.master);
    this.music = ctx.createGain();
    this.music.gain.value = 0.2;
    this.music.connect(this.master);
  }

  resume() {
    this.init();
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  env(g, t, peak, a, d) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }

  shot(silenced) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const n = this.ctx.createBuffer(1, 2205, this.ctx.sampleRate);
    const d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = n;
    const bp = this.ctx.createBiquadFilter();
    bp.type = silenced ? "bandpass" : "lowpass";
    bp.frequency.value = silenced ? 1800 : 900;
    const g = this.ctx.createGain();
    this.env(g, t, silenced ? 0.18 : 0.55, 0.005, silenced ? 0.06 : 0.18);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.sfx);
    src.start(t);
    src.stop(t + 0.25);
    const o = this.ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(silenced ? 140 : 90, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.08);
    const g2 = this.ctx.createGain();
    this.env(g2, t, silenced ? 0.12 : 0.4, 0.003, 0.09);
    o.connect(g2);
    g2.connect(this.sfx);
    o.start(t);
    o.stop(t + 0.12);
  }

  empty() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = "square";
    o.frequency.value = 90;
    const g = this.ctx.createGain();
    this.env(g, t, 0.08, 0.001, 0.04);
    o.connect(g);
    g.connect(this.sfx);
    o.start(t);
    o.stop(t + 0.05);
  }

  reload() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [180, 90, 220].forEach((f, i) => {
      const o = this.ctx.createOscillator();
      o.type = "square";
      o.frequency.value = f;
      const g = this.ctx.createGain();
      this.env(g, t + i * 0.12, 0.07, 0.01, 0.08);
      o.connect(g);
      g.connect(this.sfx);
      o.start(t + i * 0.12);
      o.stop(t + i * 0.12 + 0.1);
    });
  }

  foot(crouch) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = crouch ? 70 : 95;
    const g = this.ctx.createGain();
    this.env(g, t, crouch ? 0.04 : 0.09, 0.005, 0.07);
    o.connect(g);
    g.connect(this.sfx);
    o.start(t);
    o.stop(t + 0.09);
  }

  hit() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(60, t + 0.15);
    const g = this.ctx.createGain();
    this.env(g, t, 0.2, 0.005, 0.16);
    o.connect(g);
    g.connect(this.sfx);
    o.start(t);
    o.stop(t + 0.18);
  }

  hurt() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.25);
    const g = this.ctx.createGain();
    this.env(g, t, 0.28, 0.01, 0.25);
    const f = this.ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 500;
    o.connect(f);
    f.connect(g);
    g.connect(this.sfx);
    o.start(t);
    o.stop(t + 0.28);
  }

  pickup() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [523, 659, 784].forEach((f, i) => {
      const o = this.ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const g = this.ctx.createGain();
      this.env(g, t + i * 0.05, 0.1, 0.01, 0.12);
      o.connect(g);
      g.connect(this.sfx);
      o.start(t + i * 0.05);
      o.stop(t + i * 0.05 + 0.14);
    });
  }

  ui() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = "square";
    o.frequency.value = 880;
    const g = this.ctx.createGain();
    this.env(g, t, 0.06, 0.005, 0.06);
    o.connect(g);
    g.connect(this.sfx);
    o.start(t);
    o.stop(t + 0.08);
  }

  hack() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = "square";
    o.frequency.setValueAtTime(400, t);
    o.frequency.linearRampToValueAtTime(900, t + 0.08);
    const g = this.ctx.createGain();
    this.env(g, t, 0.05, 0.01, 0.07);
    o.connect(g);
    g.connect(this.sfx);
    o.start(t);
    o.stop(t + 0.09);
  }

  laser() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(1400, t);
    o.frequency.exponentialRampToValueAtTime(400, t + 0.12);
    const g = this.ctx.createGain();
    this.env(g, t, 0.12, 0.004, 0.1);
    o.connect(g);
    g.connect(this.sfx);
    o.start(t);
    o.stop(t + 0.13);
  }

  alarmBeep() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = "square";
    o.frequency.value = 980;
    const g = this.ctx.createGain();
    this.env(g, t, 0.08, 0.005, 0.1);
    o.connect(g);
    g.connect(this.sfx);
    o.start(t);
    o.stop(t + 0.12);
  }

  startMusic() {
    this.stopMusic();
    if (!this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = 36.71;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 280;
    f.Q.value = 6;
    const g = ctx.createGain();
    g.gain.value = 0.35;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lg = ctx.createGain();
    lg.gain.value = 80;
    lfo.connect(lg);
    lg.connect(f.frequency);
    osc.connect(f);
    f.connect(g);
    g.connect(this.music);
    osc.start();
    lfo.start();
    this.nodes.push(osc, lfo);

    const pulse = ctx.createOscillator();
    pulse.type = "square";
    pulse.frequency.value = 73.42;
    const pg = ctx.createGain();
    pg.gain.value = 0;
    const lfo2 = ctx.createOscillator();
    lfo2.frequency.value = 1.6;
    const lg2 = ctx.createGain();
    lg2.gain.value = 0.04;
    lfo2.connect(lg2);
    const bias = ctx.createConstantSource();
    bias.offset.value = 0.03;
    bias.start();
    lg2.connect(pg.gain);
    bias.connect(pg.gain);
    const pf = ctx.createBiquadFilter();
    pf.type = "lowpass";
    pf.frequency.value = 420;
    pulse.connect(pf);
    pf.connect(pg);
    pg.connect(this.music);
    pulse.start();
    lfo2.start();
    this.nodes.push(pulse, lfo2, bias);

    const pad = ctx.createOscillator();
    pad.type = "triangle";
    pad.frequency.value = 146.83;
    const pad2 = ctx.createOscillator();
    pad2.type = "triangle";
    pad2.frequency.value = 174.61;
    const pdg = ctx.createGain();
    pdg.gain.value = 0.045;
    pad.connect(pdg);
    pad2.connect(pdg);
    pdg.connect(this.music);
    pad.start();
    pad2.start();
    this.nodes.push(pad, pad2);
  }

  startAlarm() {
    if (this.alarmOn || !this.ctx) return;
    this.alarmOn = true;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = "square";
    const g = ctx.createGain();
    g.gain.value = 0.07;
    const lfo = ctx.createOscillator();
    lfo.type = "square";
    lfo.frequency.value = 2.2;
    const lg = ctx.createGain();
    lg.gain.value = 220;
    const base = ctx.createConstantSource();
    base.offset.value = 520;
    base.start();
    lfo.connect(lg);
    lg.connect(o.frequency);
    base.connect(o.frequency);
    o.connect(g);
    g.connect(this.sfx);
    o.start();
    lfo.start();
    this.nodes.push(o, lfo, base);
    if (this.music) {
      this.music.gain.linearRampToValueAtTime(0.32, ctx.currentTime + 0.4);
    }
  }

  stopMusic() {
    for (const n of this.nodes) {
      try {
        n.stop();
      } catch (e) {}
      try {
        n.disconnect();
      } catch (e) {}
    }
    this.nodes = [];
    this.alarmOn = false;
  }

  engine(on) {
    if (on) {
      this.stopMusic();
      this.engineOn = true;
      if (!this.ctx) return;
      const ctx = this.ctx;
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = 55;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 9;
      const lg = ctx.createGain();
      lg.gain.value = 7;
      lfo.connect(lg);
      lg.connect(o.frequency);
      const base = ctx.createConstantSource();
      base.offset.value = 52;
      base.start();
      base.connect(o.frequency);
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 300;
      f.Q.value = 5;
      o.connect(f);
      const g = ctx.createGain();
      g.gain.value = 0.42;
      f.connect(g);
      g.connect(this.music);
      o.start();
      lfo.start();
      this.nodes.push(o, lfo, base);
      if (this.music) {
        this.music.gain.cancelScheduledValues(ctx.currentTime);
        this.music.gain.setValueAtTime(0.0001, ctx.currentTime);
        this.music.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.25);
      }
    } else if (this.engineOn) {
      this.engineOn = false;
      const ctx = this.ctx;
      if (ctx && this.music) this.music.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      const ns = this.nodes;
      this.nodes = [];
      setTimeout(() => {
        for (const n of ns) {
          try {
            n.stop();
          } catch (e) {}
          try {
            n.disconnect();
          } catch (e) {}
        }
      }, 600);
    }
  }
}
