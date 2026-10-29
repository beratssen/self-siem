/*
 * Canlı akış (replay) modu: log kayıtlarını hızlandırılmış zamanda yeniden oynatır.
 * Her karede "simülasyon saatine kadar olan" olay ve alarmlardan bir görünüm üretip
 * render() fonksiyonuna verir. Bir alarm, last_seen anında (tespit anı) görünür olur.
 */
"use strict";

window.SIEMReplay = (function (ui) {
  const SIM_MS_PER_REAL_MS = (60 * 60 * 1000) / 2500; // 1× hızda 1 saat = 2,5 saniye
  const GAP_MS = 20 * 60 * 1000; // sıradaki olay bundan uzaktaysa boşluk say
  const GAP_BOOST = 12; // olaysız boşlukları 12 kat hızlı geç
  const SPEEDS = [1, 2, 4];
  const FRAME_MS = 50; // en fazla saniyede ~20 kez yeniden çiz
  const PLAY_ICON = "M5 3.2v9.6L13 8 5 3.2Z";
  const PAUSE_ICON = "M4.5 3h2.6v10H4.5zM8.9 3h2.6v10H8.9z";

  function attach(data, render) {
    const $ = (id) => document.getElementById(id);
    const toggleBtn = $("replay-toggle");
    const icon = $("replay-icon");
    const label = $("replay-label");
    const speedBtn = $("replay-speed");
    const stopBtn = $("replay-stop");
    const clock = $("replay-clock");
    const timeText = $("replay-time");
    const bar = $("replay-bar");
    const status = $("status");
    const statusText = $("status-text");

    const events = [...data.events].sort((a, b) => ui.toDate(a.time) - ui.toDate(b.time));
    const eventTimes = events.map((e) => ui.toDate(e.time).getTime());
    const alertTimes = data.alerts.map((a) => ui.toDate(a.last_seen).getTime());
    const start = eventTimes[0] - 60 * 1000;
    const end = Math.max(eventTimes[eventTimes.length - 1], ...alertTimes) + 60 * 1000;

    let state = "idle"; // idle | playing | paused
    let sim = start;
    let eventIndex = 0;
    let speedIndex = 0;
    let rafId = null;
    let lastReal = 0;
    let lastRender = 0;

    function currentView() {
      while (eventIndex < eventTimes.length && eventTimes[eventIndex] <= sim) eventIndex += 1;
      return {
        ...data,
        events: events.slice(0, eventIndex),
        alerts: data.alerts.filter((_, i) => alertTimes[i] <= sim),
        cursor: sim,
        replaying: true,
      };
    }

    function nextActivity() {
      const nextEvent = eventIndex < eventTimes.length ? eventTimes[eventIndex] : end;
      const pendingAlerts = alertTimes.filter((t) => t > sim);
      return Math.min(nextEvent, ...pendingAlerts, end);
    }

    function updateControls() {
      const active = state !== "idle";
      icon.setAttribute("d", state === "playing" ? PAUSE_ICON : PLAY_ICON);
      label.textContent = state === "playing" ? "Duraklat" : state === "paused" ? "Devam et" : "Canlı izle";
      toggleBtn.classList.toggle("is-active", active);
      clock.hidden = !active;
      stopBtn.hidden = !active;
      status.classList.toggle("live", state === "playing");
      statusText.textContent =
        state === "playing" ? "Canlı akış" : state === "paused" ? "Duraklatıldı" : "Analiz tamamlandı";
    }

    function updateClock() {
      timeText.textContent = ui.shortFmt.format(new Date(sim));
      bar.style.width = `${(((sim - start) / (end - start)) * 100).toFixed(2)}%`;
    }

    function frame(now) {
      const dt = Math.min(100, now - lastReal); // sekme arka plandaysa büyük sıçrama olmasın
      lastReal = now;
      const boost = nextActivity() - sim > GAP_MS ? GAP_BOOST : 1;
      sim = Math.min(end, sim + dt * SIM_MS_PER_REAL_MS * SPEEDS[speedIndex] * boost);

      if (now - lastRender >= FRAME_MS || sim >= end) {
        lastRender = now;
        render(currentView());
        updateClock();
      }

      if (sim >= end) {
        finish();
        return;
      }
      rafId = requestAnimationFrame(frame);
    }

    function play() {
      if (state === "idle") {
        sim = start;
        eventIndex = 0;
        render(currentView());
        updateClock();
      }
      state = "playing";
      lastReal = performance.now();
      rafId = requestAnimationFrame(frame);
      updateControls();
    }

    function pause() {
      cancelAnimationFrame(rafId);
      state = "paused";
      updateControls();
    }

    function finish() {
      cancelAnimationFrame(rafId);
      state = "idle";
      render({ ...data, cursor: null, replaying: false });
      updateControls();
    }

    toggleBtn.addEventListener("click", () => (state === "playing" ? pause() : play()));
    stopBtn.addEventListener("click", finish);
    speedBtn.addEventListener("click", () => {
      speedIndex = (speedIndex + 1) % SPEEDS.length;
      speedBtn.textContent = `${SPEEDS[speedIndex]}×`;
    });

    updateControls();
    return { play, pause, finish };
  }

  return { attach };
})(window.SIEMUI);
