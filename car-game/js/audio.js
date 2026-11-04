/**
 * Web Audio API Sound Engine
 * Generates all vehicle and world audio procedurally without external audio files.
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.muted = false;
        this.radioEnabled = false;

        // Engine sound nodes
        this.engineOsc1 = null;
        this.engineOsc2 = null;
        this.engineSub = null;
        this.engineFilter = null;
        this.engineGain = null;

        // Tire squeal nodes
        this.tireGain = null;
        this.tireFilter = null;

        // Nitro sound nodes
        this.nitroGain = null;
        this.nitroFilter = null;

        // Radio music state
        this.radioInterval = null;
        this.radioGain = null;
        this.radioStep = 0;
    }

    init() {
        if (this.initialized) return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.ctx = new AudioCtx();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.setupEngineSound();
        this.setupTireSound();
        this.setupNitroSound();
        this.setupRadioSound();

        this.initialized = true;
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setupEngineSound() {
        // Multi-oscillator engine synthesizer
        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        this.engineFilter = this.ctx.createBiquadFilter();
        this.engineFilter.type = 'lowpass';
        this.engineFilter.frequency.setValueAtTime(250, this.ctx.currentTime);
        this.engineFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

        // Cylinder pulse wave (sawtooth)
        this.engineOsc1 = this.ctx.createOscillator();
        this.engineOsc1.type = 'sawtooth';
        this.engineOsc1.frequency.setValueAtTime(35, this.ctx.currentTime);

        // Sub harmonic oscillator
        this.engineOsc2 = this.ctx.createOscillator();
        this.engineOsc2.type = 'triangle';
        this.engineOsc2.frequency.setValueAtTime(17.5, this.ctx.currentTime);

        // Rumble wave (pulse-like)
        this.engineSub = this.ctx.createOscillator();
        this.engineSub.type = 'sawtooth';
        this.engineSub.frequency.setValueAtTime(70, this.ctx.currentTime);

        const subGain = this.ctx.createGain();
        subGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

        this.engineOsc1.connect(this.engineFilter);
        this.engineOsc2.connect(this.engineFilter);
        this.engineSub.connect(subGain);
        subGain.connect(this.engineFilter);

        this.engineFilter.connect(this.engineGain);
        this.engineGain.connect(this.masterGain);

        this.engineOsc1.start();
        this.engineOsc2.start();
        this.engineSub.start();
    }

    setupTireSound() {
        // White noise buffer for tire skidding & asphalt friction
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        this.tireFilter = this.ctx.createBiquadFilter();
        this.tireFilter.type = 'bandpass';
        this.tireFilter.frequency.setValueAtTime(1000, this.ctx.currentTime);
        this.tireFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

        this.tireGain = this.ctx.createGain();
        this.tireGain.gain.setValueAtTime(0, this.ctx.currentTime);

        whiteNoise.connect(this.tireFilter);
        this.tireFilter.connect(this.tireGain);
        this.tireGain.connect(this.masterGain);

        whiteNoise.start();
    }

    setupNitroSound() {
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        this.nitroFilter = this.ctx.createBiquadFilter();
        this.nitroFilter.type = 'bandpass';
        this.nitroFilter.frequency.setValueAtTime(1800, this.ctx.currentTime);
        this.nitroFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

        this.nitroGain = this.ctx.createGain();
        this.nitroGain.gain.setValueAtTime(0, this.ctx.currentTime);

        whiteNoise.connect(this.nitroFilter);
        this.nitroFilter.connect(this.nitroGain);
        this.nitroGain.connect(this.masterGain);

        whiteNoise.start();
    }

    setupRadioSound() {
        this.radioGain = this.ctx.createGain();
        this.radioGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
        this.radioGain.connect(this.masterGain);
    }

    updateEngine(rpmRatio, throttle, carType = 'vintage') {
        if (!this.initialized || this.muted) return;

        const now = this.ctx.currentTime;
        let baseFreq = 30;
        let maxFreq = 160;

        if (carType === 'vintage') {
            // Lower, chugging rumble for Model T
            baseFreq = 22;
            maxFreq = 110;
        } else if (carType === 'supercar') {
            // Porsche twin-turbo flat-six boxer engine roar
            baseFreq = 34;
            maxFreq = 240;
        } else if (carType === 'muscle') {
            // Deep burbling V8
            baseFreq = 28;
            maxFreq = 150;
        }

        const targetFreq = baseFreq + (maxFreq - baseFreq) * rpmRatio;
        this.engineOsc1.frequency.setTargetAtTime(targetFreq, now, 0.04);
        this.engineOsc2.frequency.setTargetAtTime(targetFreq * 0.5, now, 0.04);
        this.engineSub.frequency.setTargetAtTime(targetFreq * 2.0, now, 0.04);

        const filterFreq = 180 + rpmRatio * 1800 + (throttle ? 600 : 0);
        this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.05);

        // Volume adjustment based on throttle and rpm
        const targetVol = 0.22 + 0.35 * rpmRatio + (throttle ? 0.2 : 0);
        this.engineGain.gain.setTargetAtTime(targetVol, now, 0.05);
    }

    updateTireSqueal(slipRatio) {
        if (!this.initialized || this.muted) return;
        const now = this.ctx.currentTime;
        const vol = Math.min(0.6, Math.max(0, slipRatio) * 0.8);
        this.tireGain.gain.setTargetAtTime(vol, now, 0.03);
        const freq = 800 + slipRatio * 600;
        this.tireFilter.frequency.setTargetAtTime(freq, now, 0.03);
    }

    setNitro(active) {
        if (!this.initialized || this.muted) return;
        const now = this.ctx.currentTime;
        this.nitroGain.gain.setTargetAtTime(active ? 0.45 : 0.0, now, 0.08);
    }

    playCrash(speedRatio = 0.5) {
        if (!this.initialized || this.muted) return;
        const now = this.ctx.currentTime;

        // Crash thump
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);

        const vol = Math.min(0.8, Math.max(0.2, speedRatio));
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.35);

        // Metal crunch noise
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        const crunchGain = this.ctx.createGain();
        crunchGain.gain.setValueAtTime(vol * 0.5, now);
        noise.connect(filter);
        filter.connect(crunchGain);
        crunchGain.connect(this.masterGain);
        noise.start(now);
    }

    playHorn(vintage = true) {
        if (!this.initialized || this.muted) return;
        const now = this.ctx.currentTime;

        if (vintage) {
            // Vintage "AHOOGA" Klaxon Horn!
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';

            // Distinctive pitch rise and fall of the antique Klaxon
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(420, now + 0.12);
            osc.frequency.linearRampToValueAtTime(300, now + 0.35);
            osc.frequency.linearRampToValueAtTime(190, now + 0.55);

            gain.gain.setValueAtTime(0.0, now);
            gain.gain.linearRampToValueAtTime(0.5, now + 0.04);
            gain.gain.setValueAtTime(0.5, now + 0.45);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.6);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(350, now);
            filter.Q.setValueAtTime(2.0, now);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 0.62);
        } else {
            // Modern Dual-Tone Horn
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc1.type = 'sawtooth';
            osc2.type = 'sawtooth';
            osc1.frequency.setValueAtTime(440, now); // A4
            osc2.frequency.setValueAtTime(554.37, now); // C#5

            gain.gain.setValueAtTime(0.4, now);
            gain.gain.setTargetAtTime(0, now + 0.4, 0.05);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2200, now);

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.45);
            osc2.stop(now + 0.45);
        }
    }

    toggleRadio() {
        if (!this.initialized) this.init();
        this.radioEnabled = !this.radioEnabled;
        if (this.radioEnabled) {
            this.radioGain.gain.setTargetAtTime(0.25, this.ctx.currentTime, 0.5);
            this.startSynthwaveRadio();
        } else {
            this.radioGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.5);
            if (this.radioInterval) {
                clearInterval(this.radioInterval);
                this.radioInterval = null;
            }
        }
        return this.radioEnabled;
    }

    startSynthwaveRadio() {
        if (this.radioInterval) clearInterval(this.radioInterval);

        // Synthwave chord progression (D min, Bb maj, F maj, C maj)
        const notes = [
            [146.83, 220.00, 261.63], // Dm
            [116.54, 174.61, 233.08], // Bb
            [174.61, 220.00, 261.63], // F
            [130.81, 196.00, 261.63]  // C
        ];
        const bassNotes = [73.42, 58.27, 87.31, 65.41];

        this.radioStep = 0;
        this.radioInterval = setInterval(() => {
            if (!this.radioEnabled || this.muted) return;
            const chordIdx = Math.floor(this.radioStep / 8) % 4;
            const subStep = this.radioStep % 8;
            const now = this.ctx.currentTime;

            // Arpeggio synth lead
            const chord = notes[chordIdx];
            const noteFreq = chord[subStep % chord.length] * (subStep % 2 === 0 ? 1 : 2);

            const leadOsc = this.ctx.createOscillator();
            const leadGain = this.ctx.createGain();
            leadOsc.type = 'sawtooth';
            leadOsc.frequency.setValueAtTime(noteFreq, now);

            leadGain.gain.setValueAtTime(0.12, now);
            leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1400 + Math.sin(this.radioStep * 0.2) * 600, now);

            leadOsc.connect(filter);
            filter.connect(leadGain);
            leadGain.connect(this.radioGain);

            leadOsc.start(now);
            leadOsc.stop(now + 0.25);

            // Driving Synthwave Bass pulse on beats 0, 2, 4, 6
            if (subStep % 2 === 0) {
                const bassOsc = this.ctx.createOscillator();
                const bassGain = this.ctx.createGain();
                bassOsc.type = 'sawtooth';
                bassOsc.frequency.setValueAtTime(bassNotes[chordIdx], now);

                bassGain.gain.setValueAtTime(0.22, now);
                bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

                const bassFilter = this.ctx.createBiquadFilter();
                bassFilter.type = 'lowpass';
                bassFilter.frequency.setValueAtTime(450, now);

                bassOsc.connect(bassFilter);
                bassFilter.connect(bassGain);
                bassGain.connect(this.radioGain);

                bassOsc.start(now);
                bassOsc.stop(now + 0.22);
            }

            this.radioStep++;
        }, 160);
    }

    toggleMute() {
        if (!this.initialized) this.init();
        this.muted = !this.muted;
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.muted ? 0.0 : 0.7, this.ctx.currentTime);
        }
        return this.muted;
    }
}

window.soundEngine = new SoundEngine();
