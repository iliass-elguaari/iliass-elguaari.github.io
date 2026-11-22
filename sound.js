/* =========================================================
   Sound: effects and a chill lo-fi loop, all synthesized live
   with the Web Audio API. No audio files are downloaded.
   Everything stays silent until the visitor turns it on.
   ========================================================= */
(function () {
  "use strict";

  const STORE = "sound-prefs";
  const prefs = { music: false, sfx: false, volume: 0.6 };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(STORE) || "{}")); } catch (e) {}
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(prefs)); } catch (e) {} };

  let ctx = null;
  let master, sfxBus, musicBus, reverbIn, echoIn, noiseBuf, crackleSrc;

  // ---------- Audio graph ----------

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 3;
    master = ctx.createGain();
    master.gain.value = prefs.volume;
    master.connect(comp).connect(ctx.destination);

    // Room reverb from a generated impulse response.
    const reverb = ctx.createConvolver();
    reverb.buffer = impulse(2.6, 2.4);
    reverbIn = ctx.createGain();
    reverbIn.gain.value = 0.5;
    reverbIn.connect(reverb).connect(master);

    // Tape-style echo for the melody.
    const delay = ctx.createDelay(2);
    delay.delayTime.value = 0.625; // dotted eighth at 72 BPM
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 1800;
    echoIn = ctx.createGain();
    echoIn.connect(delay);
    delay.connect(tone).connect(fb).connect(delay);
    tone.connect(master);

    sfxBus = ctx.createGain();
    sfxBus.gain.value = 1.4;
    sfxBus.connect(master);

    // The music goes through a warm low-pass, like an old cassette.
    const warm = ctx.createBiquadFilter();
    warm.type = "lowpass";
    warm.frequency.value = 3200;
    warm.Q.value = 0.4;
    musicBus = ctx.createGain();
    musicBus.gain.value = 0;
    musicBus.connect(warm).connect(master);

    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    document.addEventListener("visibilitychange", () => {
      if (!ctx) return;
      if (document.hidden) ctx.suspend();
      else if (prefs.music || prefs.sfx) ctx.resume();
    });
    return ctx;
  }

  function impulse(seconds, decay) {
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const ch = buf.getChannelData(c);
      for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

  // One enveloped oscillator. Returns its gain node so callers can add sends.
  function voice(out, { type = "sine", freq, t, attack = 0.005, hold = 0, release = 0.3, gain = 0.2, detune = 0, glideTo = 0, sends = {} }) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + attack + hold + release * 0.6);
    osc.detune.value = detune;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    if (hold) g.gain.setValueAtTime(gain, t + attack + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
    osc.connect(g).connect(out);
    if (sends.reverb) { const s = ctx.createGain(); s.gain.value = sends.reverb; g.connect(s).connect(reverbIn); }
    if (sends.echo) { const s = ctx.createGain(); s.gain.value = sends.echo; g.connect(s).connect(echoIn); }
    osc.start(t);
    osc.stop(t + attack + hold + release + 0.05);
    return g;
  }

  function noise(out, { t, dur, gain, type = "bandpass", freq = 2000, q = 1, reverb = 0 }) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(out);
    if (reverb) { const s = ctx.createGain(); s.gain.value = reverb; g.connect(s).connect(reverbIn); }
    src.start(t, Math.random() * 1.5);
    src.stop(t + dur + 0.05);
  }

  // A soft bell: a sine plus a quiet inharmonic partial.
  function bell(out, midi, t, gain, release, sends) {
    voice(out, { freq: hz(midi), t, gain, release, sends });
    voice(out, { freq: hz(midi) * 2.76, t, gain: gain * 0.18, release: release * 0.4, sends });
  }

  // ---------- Sound effects ----------

  const SFX = {
    tick(t) { voice(sfxBus, { type: "sine", freq: 1400, glideTo: 900, t, release: 0.05, gain: 0.07 }); },
    hover(t) { voice(sfxBus, { type: "sine", freq: 2100, t, release: 0.03, gain: 0.025 }); },
    select(t) {
      voice(sfxBus, { type: "triangle", freq: hz(79), t, release: 0.12, gain: 0.09 });
      voice(sfxBus, { type: "triangle", freq: hz(86), t: t + 0.06, release: 0.2, gain: 0.08, sends: { reverb: 0.3 } });
      noise(sfxBus, { t, dur: 0.18, gain: 0.03, type: "bandpass", freq: 3000, q: 0.7 });
    },
    unlock(t) {
      bell(sfxBus, 76, t, 0.12, 0.9, { reverb: 0.5 });
      bell(sfxBus, 83, t + 0.09, 0.1, 1.2, { reverb: 0.6 });
    },
    achievement(t) {
      [72, 76, 79, 84].forEach((m, i) => {
        voice(sfxBus, { type: "triangle", freq: hz(m), t: t + i * 0.07, release: 0.5, gain: 0.08, sends: { reverb: 0.4 } });
        voice(sfxBus, { type: "sine", freq: hz(m + 12), t: t + i * 0.07, release: 0.6, gain: 0.04, sends: { reverb: 0.5 } });
      });
      for (let i = 0; i < 6; i++) bell(sfxBus, 96 + [0, 4, 7, 12][i % 4], t + 0.3 + i * 0.05, 0.025, 0.5, { reverb: 0.7 });
    },
    fanfare(t) {
      [60, 64, 67, 72, 76, 79].forEach((m, i) => {
        voice(sfxBus, { type: "triangle", freq: hz(m), t: t + i * 0.08, attack: 0.01, hold: 0.5 - i * 0.04, release: 1.2, gain: 0.06, sends: { reverb: 0.5 } });
      });
      [84, 88, 91, 96].forEach((m, i) => bell(sfxBus, m, t + 0.5 + i * 0.06, 0.04, 1.2, { reverb: 0.7 }));
    },
    on(t) {
      voice(sfxBus, { type: "sine", freq: hz(72), t, release: 0.12, gain: 0.08 });
      voice(sfxBus, { type: "sine", freq: hz(79), t: t + 0.07, release: 0.25, gain: 0.08, sends: { reverb: 0.3 } });
    },
    off(t) {
      voice(sfxBus, { type: "sine", freq: hz(79), t, release: 0.12, gain: 0.07 });
      voice(sfxBus, { type: "sine", freq: hz(72), t: t + 0.07, release: 0.2, gain: 0.07 });
    },
    success(t) {
      voice(sfxBus, { type: "triangle", freq: hz(79), t, release: 0.15, gain: 0.08 });
      voice(sfxBus, { type: "triangle", freq: hz(84), t: t + 0.08, release: 0.4, gain: 0.08, sends: { reverb: 0.4 } });
    },
    error(t) {
      voice(sfxBus, { type: "square", freq: 220, glideTo: 160, t, release: 0.16, gain: 0.03 });
    }
  };

  let lastHover = 0;
  function play(name) {
    if (!prefs.sfx || !SFX[name]) return;
    if (!ensure()) return;
    if (ctx.state !== "running") ctx.resume();
    if (name === "hover") {
      if (ctx.currentTime - lastHover < 0.08) return;
      lastHover = ctx.currentTime;
    }
    SFX[name](ctx.currentTime + 0.01);
  }

  // ---------- Music: a generative lo-fi loop at 72 BPM ----------

  const BPM = 72;
  const BEAT = 60 / BPM;
  const BAR = BEAT * 4;
  // Fmaj9 → Em7 → Dm9 → Cmaj9: a slow, descending progression.
  const CHORDS = [
    { root: 41, keys: [57, 60, 64, 67], tones: [69, 72, 76, 79, 81] },
    { root: 40, keys: [55, 59, 62, 64], tones: [67, 71, 74, 76, 79] },
    { root: 38, keys: [53, 57, 60, 64], tones: [69, 72, 74, 77, 81] },
    { root: 36, keys: [52, 55, 59, 62], tones: [67, 71, 72, 74, 76] }
  ];

  let playing = false;
  let timer = 0;
  let bar = 0;
  let nextBar = 0;
  let padBus, keysBus, bassBus, drumBus, melBus;

  function musicGraph() {
    if (padBus) return;
    const mk = (g, f) => {
      const gain = ctx.createGain();
      gain.gain.value = g;
      if (f) {
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = f;
        gain.connect(lp).connect(musicBus);
      } else gain.connect(musicBus);
      return gain;
    };
    padBus = mk(0.5, 1100);
    keysBus = mk(0.8, 2200);
    bassBus = mk(0.9, 420);
    drumBus = mk(0.8);
    melBus = mk(0.7, 3000);

    // Faint vinyl crackle under everything.
    const len = ctx.sampleRate * 3;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * 0.04 + (Math.random() < 0.0004 ? (Math.random() * 2 - 1) * 0.9 : 0);
    }
    crackleSrc = ctx.createBufferSource();
    crackleSrc.buffer = buf;
    crackleSrc.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 900;
    const cg = ctx.createGain();
    cg.gain.value = 0.05;
    crackleSrc.connect(hp).connect(cg).connect(musicBus);
    crackleSrc.start();
  }

  function scheduleBar(n, t) {
    const chord = CHORDS[n % CHORDS.length];
    const section = n % 16;
    const drums = n >= 2 && section !== 14 && section !== 15;
    const swing = BEAT * 0.09;

    // Pad: a slow swell under the whole bar.
    chord.keys.forEach((m) => {
      [-7, 7].forEach((det) => voice(padBus, { type: "triangle", freq: hz(m), t, attack: 1.2, hold: BAR - 1.4, release: 1.6, gain: 0.03, detune: det, sends: { reverb: 0.5 } }));
    });

    // Keys: a gently strummed electric-piano chord on 1 and on the "and" of 2.
    [0, BEAT * 1.5 + swing].forEach((offset, hit) => {
      chord.keys.forEach((m, i) => {
        const tt = t + offset + i * 0.018 + Math.random() * 0.01;
        const gain = (hit ? 0.035 : 0.05) * (0.85 + Math.random() * 0.3);
        voice(keysBus, { type: "sine", freq: hz(m + 12), t: tt, attack: 0.01, release: hit ? 1.1 : 1.8, gain, sends: { reverb: 0.25 } });
        voice(keysBus, { type: "sine", freq: hz(m + 24), t: tt, attack: 0.005, release: 0.4, gain: gain * 0.25 });
      });
    });

    // Bass: root on 1, root again on the "and" of 3.
    voice(bassBus, { type: "sine", freq: hz(chord.root), t, attack: 0.02, hold: BEAT * 1.2, release: 0.5, gain: 0.22 });
    voice(bassBus, { type: "triangle", freq: hz(chord.root), t: t + BEAT * 2.5 + swing, attack: 0.02, hold: BEAT * 0.6, release: 0.4, gain: 0.12 });

    // Melody: a few sparse notes from the chord, with echo.
    if (n >= 4) {
      for (let s = 0; s < 8; s++) {
        if (Math.random() > (s % 2 ? 0.12 : 0.22)) continue;
        const m = chord.tones[Math.floor(Math.random() * chord.tones.length)];
        const tt = t + s * (BEAT / 2) + (s % 2 ? swing : 0);
        bell(melBus, m, tt, 0.035, 1.1, { echo: 0.45, reverb: 0.35 });
      }
    }

    if (!drums) return;
    for (let b = 0; b < 4; b++) {
      const bt = t + b * BEAT;
      // Hats on every eighth, the off-beats swung and quieter.
      noise(drumBus, { t: bt, dur: 0.05, gain: 0.05, type: "highpass", freq: 7000 });
      noise(drumBus, { t: bt + BEAT / 2 + swing, dur: 0.04, gain: 0.03, type: "highpass", freq: 7500 });
      // Soft snare on 2 and 4.
      if (b === 1 || b === 3) {
        noise(drumBus, { t: bt, dur: 0.2, gain: 0.07, type: "bandpass", freq: 1700, q: 0.8, reverb: 0.25 });
        voice(drumBus, { type: "triangle", freq: 190, glideTo: 150, t: bt, release: 0.1, gain: 0.05 });
      }
    }
    // Kick on 1 and on the "and" of 3.
    [0, BEAT * 2.5].forEach((o) => voice(drumBus, { type: "sine", freq: 110, glideTo: 42, t: t + o, attack: 0.003, release: 0.35, gain: 0.32 }));
  }

  function tickScheduler() {
    while (nextBar < ctx.currentTime + 0.6) {
      scheduleBar(bar, nextBar);
      bar++;
      nextBar += BAR;
    }
  }

  function startMusic() {
    if (playing || !ensure()) return;
    ctx.resume();
    musicGraph();
    playing = true;
    bar = 0;
    nextBar = ctx.currentTime + 0.15;
    const g = musicBus.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(g.value, ctx.currentTime);
    g.linearRampToValueAtTime(0.75, ctx.currentTime + 3);
    tickScheduler();
    timer = setInterval(tickScheduler, 120);
    reflect();
  }

  function stopMusic() {
    if (!playing) return;
    playing = false;
    clearInterval(timer);
    const g = musicBus.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(g.value, ctx.currentTime);
    g.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    reflect();
  }

  // ---------- Controls in the top bar ----------

  let root, panel, btn, nudge;

  function reflect() {
    if (!root) return;
    root.classList.toggle("is-playing", playing);
    root.classList.toggle("is-on", prefs.music || prefs.sfx);
    root.querySelectorAll("[data-sound-toggle]").forEach((sw) => {
      sw.setAttribute("aria-checked", String(!!prefs[sw.dataset.soundToggle]));
    });
    const vol = root.querySelector("[data-sound-volume]");
    if (vol) vol.value = Math.round(prefs.volume * 100);
  }

  function set(key, value) {
    prefs[key] = value;
    save();
    if (key === "music") value ? startMusic() : stopMusic();
    if (key === "sfx" && value) { ensure(); ctx && ctx.resume(); }
    reflect();
    window.dispatchEvent(new CustomEvent("sound:change", { detail: { ...prefs } }));
  }

  function openPanel(open) {
    panel.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
  }

  function hideNudge() {
    if (!nudge || nudge.hidden) return;
    nudge.classList.remove("is-visible");
    setTimeout(() => { nudge.hidden = true; }, 300);
    try { localStorage.setItem("sound-nudged", "1"); } catch (e) {}
  }

  function initControls() {
    root = document.querySelector("[data-sound]");
    if (!root || !(window.AudioContext || window.webkitAudioContext)) {
      if (root) root.hidden = true;
      return;
    }
    panel = root.querySelector(".sound-panel");
    btn = root.querySelector(".sound-btn");
    nudge = root.querySelector(".sound-nudge");

    btn.addEventListener("click", () => {
      hideNudge();
      openPanel(panel.hidden);
    });
    root.querySelectorAll("[data-sound-toggle]").forEach((sw) => {
      sw.addEventListener("click", () => {
        const key = sw.dataset.soundToggle;
        const next = !prefs[key];
        if (key === "sfx" && !next) play("off");
        set(key, next);
        if (next) play("on");
      });
    });
    root.querySelector("[data-sound-volume]").addEventListener("input", (e) => {
      prefs.volume = e.target.value / 100;
      if (master) master.gain.setTargetAtTime(prefs.volume, ctx.currentTime, 0.05);
      save();
    });
    root.querySelector("[data-sound-all]").addEventListener("click", () => {
      hideNudge();
      set("sfx", true);
      set("music", true);
      play("on");
    });
    document.addEventListener("click", (e) => {
      if (!panel.hidden && !root.contains(e.target)) openPanel(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !panel.hidden) { openPanel(false); btn.focus(); }
    });

    // A one-time hint for first-time visitors.
    let nudged = false;
    try { nudged = !!localStorage.getItem("sound-nudged"); } catch (e) {}
    if (nudge && !nudged && !prefs.music && !prefs.sfx) {
      setTimeout(() => {
        nudge.hidden = false;
        requestAnimationFrame(() => nudge.classList.add("is-visible"));
        setTimeout(hideNudge, 9000);
      }, 3500);
    }

    // Browsers only allow audio after a gesture: if the visitor turned sound on
    // during an earlier visit, pick it back up on their first click or key press.
    if (prefs.music || prefs.sfx) {
      const resume = (e) => {
        if (root.contains(e.target)) return; // the controls handle themselves
        ensure();
        ctx.resume();
        if (prefs.music) startMusic();
        removeEventListener("pointerdown", resume, true);
        removeEventListener("keydown", resume, true);
      };
      addEventListener("pointerdown", resume, true);
      addEventListener("keydown", resume, true);
    }

    // Light click feedback on the page's own controls.
    document.addEventListener("click", (e) => {
      if (!prefs.sfx) return;
      const el = e.target.closest("button, a, [role='tab']");
      if (!el || root.contains(el)) return;
      if (el.matches("[data-level], .stage-prev, .stage-next")) play("select");
      else if (el.matches(".theme-btn, [data-set-lang]")) play("tick");
      else if (el.matches("#copy-email")) play("success");
      else if (el.tagName === "BUTTON" || el.getAttribute("role") === "tab") play("tick");
    });
    document.addEventListener("pointerover", (e) => {
      if (!prefs.sfx || e.pointerType !== "mouse") return;
      const card = e.target.closest("[data-level]");
      if (card && !card.contains(e.relatedTarget)) play("hover");
    });

    reflect();
  }

  window.Sound = { play, isMusicOn: () => playing, prefs };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initControls);
  else initControls();
})();
