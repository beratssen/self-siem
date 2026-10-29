/*
 * Olay zaman çizelgesi: giriş denemelerini 15 dakikalık dilimlerde yığılmış sütunlarla
 * gösterir; alarmları üstte işaretler, mesai dışı saatleri gölgeler. Kütüphane yok, saf SVG.
 *
 * Eksenler (zaman aralığı ve Y ölçeği) tüm veriden bir kez hesaplanır; canlı akış
 * sırasında sadece o ana kadarki olaylar çizilir, böylece sütunlar yerinde büyür.
 */
"use strict";

window.SIEMTimeline = (function (ui) {
  const { el, svg } = ui;

  const BIN_MS = 15 * 60 * 1000;
  const HOUR_MS = 60 * 60 * 1000;
  const WORK_START = 7; // python tarafındaki off_hours kuralıyla aynı
  const WORK_END = 20;
  const HEIGHT = 300;
  const M = { top: 46, right: 12, bottom: 30, left: 40 }; // üstte alarm işaretleri için şerit
  const GAP = 2; // yığılmış segmentler arası yüzey boşluğu
  const MARKER_R = 5;

  /** Tüm olayları kapsayan, 15 dakikaya hizalı zaman aralığı. */
  function domainOf(events) {
    const times = events.map((e) => ui.toDate(e.time).getTime());
    return {
      start: Math.floor(Math.min(...times) / BIN_MS) * BIN_MS,
      end: (Math.floor(Math.max(...times) / BIN_MS) + 1) * BIN_MS,
    };
  }

  /** Olayları verilen aralıktaki 15 dakikalık dilimlere ayırır. */
  function binEvents(events, start, end) {
    const bins = Array.from({ length: Math.round((end - start) / BIN_MS) }, (_, i) => ({
      start: start + i * BIN_MS,
      ok: 0,
      fail: 0,
    }));
    for (const e of events) {
      const bin = bins[Math.floor((ui.toDate(e.time).getTime() - start) / BIN_MS)];
      if (!bin) continue;
      if (e.success) bin.ok += 1;
      else bin.fail += 1;
    }
    return bins;
  }

  /** Y ekseni için "temiz" tik değerleri (0, 10, 20...). */
  function niceTicks(max) {
    const raw = max / 5;
    const pow = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw);
    const top = Math.ceil(max / step) * step;
    const ticks = [];
    for (let v = 0; v <= top; v += step) ticks.push(v);
    return { top, ticks };
  }

  /** Sadece üst ucu yuvarlatılmış sütun (taban düz kalır). */
  function columnPath(x, y, w, h, rounded) {
    const r = rounded ? Math.min(4, h, w / 2) : 0;
    return [
      `M${x},${y + h}`,
      `V${y + r}`,
      r ? `Q${x},${y} ${x + r},${y}` : "",
      `H${x + w - r}`,
      r ? `Q${x + w},${y} ${x + w},${y + r}` : "",
      `V${y + h}`,
      "Z",
    ].join(" ");
  }

  /** Mesai dışı saat aralıklarını [başlangıç, bitiş] çiftleri olarak bulur. */
  function offHourBands(start, end) {
    const bands = [];
    const first = new Date(start);
    first.setMinutes(0, 0, 0);
    for (let t = first.getTime(); t < end; t += HOUR_MS) {
      const hour = new Date(t).getHours();
      if (hour >= WORK_START && hour < WORK_END) continue;
      const from = Math.max(t, start);
      const to = Math.min(t + HOUR_MS, end);
      const last = bands[bands.length - 1];
      if (last && last[1] === from) last[1] = to;
      else bands.push([from, to]);
    }
    return bands;
  }

  /** Yakın zamanlı alarmları tek işarette toplar (üst üste binmesin diye). */
  function clusterAlerts(alerts, x) {
    const sorted = [...alerts].sort((a, b) => ui.toDate(a.first_seen) - ui.toDate(b.first_seen));
    const clusters = [];
    for (const alert of sorted) {
      const cx = x(ui.toDate(alert.first_seen).getTime());
      const last = clusters[clusters.length - 1];
      if (last && cx - last.cx < MARKER_R * 3) last.alerts.push(alert);
      else clusters.push({ cx, alerts: [alert] });
    }
    return clusters;
  }

  function binLabel(bin) {
    return `${ui.shortFmt.format(new Date(bin.start))} – ${ui.timeFmt.format(new Date(bin.start + BIN_MS))}`;
  }

  function renderChart(host, view, domain, tooltip) {
    const width = host.clientWidth;
    if (!width) return;

    const { start, end, top, ticks } = domain;
    const bins = binEvents(view.events, start, end);
    const plotW = width - M.left - M.right;
    const plotH = HEIGHT - M.top - M.bottom;
    const baseline = M.top + plotH;
    const x = (t) => M.left + ((t - start) / (end - start)) * plotW;
    const y = (v) => baseline - (v / top) * plotH;
    const slot = plotW / bins.length;
    const barW = Math.max(2, Math.min(24, slot - GAP));

    const root = svg("svg", {
      class: "timeline-svg",
      width,
      height: HEIGHT,
      viewBox: `0 0 ${width} ${HEIGHT}`,
      role: "img",
      "aria-label": "15 dakikalık dilimlerde başarılı ve başarısız giriş denemeleri",
    });

    // Mesai dışı gölgeler
    for (const [from, to] of offHourBands(start, end)) {
      const bx = x(from);
      const bw = x(to) - bx;
      root.append(svg("rect", { class: "offhours", x: bx, y: M.top - 8, width: bw, height: plotH + 8 }));
      if (bw > 76) {
        root.append(svg("text", { class: "offhours-label", x: bx + 8, y: baseline - 8, text: "Mesai dışı" }));
      }
    }

    // Yatay ızgara ve y ekseni etiketleri
    for (const v of ticks) {
      root.append(
        svg("line", { class: v === 0 ? "axis" : "grid", x1: M.left, x2: width - M.right, y1: y(v), y2: y(v) }),
        svg("text", { class: "tick tick-y", x: M.left - 8, y: y(v), dy: "0.32em", text: ui.numberFmt.format(v) }),
      );
    }

    // X ekseni etiketleri: aralarında en az ~64px olacak saat adımı seç
    const pxPerHour = (plotW / (end - start)) * HOUR_MS;
    const stepHours = [1, 2, 3, 4, 6, 12, 24].find((h) => h * pxPerHour >= 64) || 24;
    const firstHour = new Date(start);
    firstHour.setMinutes(0, 0, 0);
    for (let t = firstHour.getTime(); t <= end; t += HOUR_MS) {
      const d = new Date(t);
      if (t < start || d.getHours() % stepHours !== 0) continue;
      const label = d.getHours() === 0 ? ui.dayFmt.format(d) : ui.timeFmt.format(d);
      root.append(
        svg("line", { class: "axis-tick", x1: x(t), x2: x(t), y1: baseline, y2: baseline + 4 }),
        svg("text", { class: "tick tick-x", x: x(t), y: baseline + 18, text: label }),
      );
    }

    // Sütunlar: başarılı altta, başarısız üstte; en üst segmentin ucu yuvarlak
    bins.forEach((bin, i) => {
      const bx = M.left + i * slot + (slot - barW) / 2;
      const okH = baseline - y(bin.ok);
      const failH = baseline - y(bin.fail);
      const group = svg("g", { class: "bin" });

      if (bin.ok) {
        group.append(svg("path", { class: "bar-ok", d: columnPath(bx, baseline - okH, barW, okH, !bin.fail) }));
      }
      if (bin.fail) {
        const failBase = baseline - okH - (bin.ok ? GAP : 0);
        group.append(svg("path", { class: "bar-fail", d: columnPath(bx, failBase - failH, barW, failH, true) }));
      }

      // Görünmez, sütundan geniş hover alanı
      const hit = svg("rect", { class: "hit", x: M.left + i * slot, y: M.top - 8, width: slot, height: plotH + 8 });
      hit.addEventListener("mousemove", (e) => {
        tooltip.show(e, [
          [binLabel(bin)],
          ["Başarısız", ui.numberFmt.format(bin.fail), "sw-fail"],
          ["Başarılı", ui.numberFmt.format(bin.ok), "sw-ok"],
        ]);
      });
      hit.addEventListener("mouseleave", () => tooltip.hide());
      group.append(hit);
      root.append(group);
    });

    // Sadece en yüksek sütunun değeri doğrudan yazılır
    const peakIndex = bins.reduce((best, b, i) => (b.ok + b.fail > bins[best].ok + bins[best].fail ? i : best), 0);
    const peakTotal = bins[peakIndex].ok + bins[peakIndex].fail;
    if (peakTotal > 0) {
      root.append(
        svg("text", {
          class: "peak-label",
          x: M.left + peakIndex * slot + slot / 2,
          y: y(peakTotal) - 8,
          text: ui.numberFmt.format(peakTotal),
        }),
      );
    }

    // Alarm işaretleri (üst şerit) ve zemine inen ince kılavuz çizgisi
    const laneY = M.top - 24;
    for (const cluster of clusterAlerts(view.alerts, x)) {
      const severity = ui.topSeverity(cluster.alerts);
      const group = svg("g", { class: `marker sev-${severity}` }, [
        svg("line", { class: "marker-guide", x1: cluster.cx, x2: cluster.cx, y1: laneY + MARKER_R, y2: baseline }),
        svg("circle", { class: "marker-dot", cx: cluster.cx, cy: laneY, r: MARKER_R }),
      ]);
      if (cluster.alerts.length > 1) {
        group.append(
          svg("text", { class: "marker-count", x: cluster.cx + MARKER_R + 4, y: laneY, dy: "0.32em", text: `×${cluster.alerts.length}` }),
        );
      }
      const hit = svg("circle", { class: "hit", cx: cluster.cx, cy: laneY, r: MARKER_R * 2.4 });
      hit.addEventListener("mousemove", (e) => {
        tooltip.show(e, [
          [ui.shortFmt.format(ui.toDate(cluster.alerts[0].first_seen))],
          ...cluster.alerts.map((a) => [ui.SEVERITY_LABELS[a.severity], window.SIEMRules.name(a.rule), `sw-${a.severity}`]),
        ]);
      });
      hit.addEventListener("mouseleave", () => tooltip.hide());
      group.append(hit);
      root.append(group);
    }

    // Canlı akış: oynatma çizgisi ve henüz gelmemiş zaman
    if (view.replaying) {
      const px = x(Math.min(Math.max(view.cursor, start), end));
      root.append(
        svg("rect", { class: "future", x: px, y: M.top - 8, width: Math.max(0, width - M.right - px), height: plotH + 8 }),
        svg("line", { class: "playhead", x1: px, x2: px, y1: M.top - 8, y2: baseline }),
        svg("circle", { class: "playhead-dot", cx: px, cy: baseline, r: 3.5 }),
      );
    }

    host.replaceChildren(root);
  }

  function renderTable(host, view, domain) {
    const rows = binEvents(view.events, domain.start, domain.end).filter((b) => b.ok || b.fail);
    host.replaceChildren(
      el("div", { class: "table-wrap" }, [
        el("table", { class: "data-table" }, [
          el("caption", { text: "15 dakikalık dilimlerde giriş denemeleri (boş dilimler gösterilmez)" }),
          el("thead", {}, el("tr", {}, ["Zaman aralığı", "Başarısız", "Başarılı", "Toplam"].map((h) => el("th", { scope: "col", text: h })))),
          el(
            "tbody",
            {},
            rows.map((b) =>
              el("tr", {}, [
                el("td", { text: binLabel(b) }),
                el("td", { class: "num", text: ui.numberFmt.format(b.fail) }),
                el("td", { class: "num", text: ui.numberFmt.format(b.ok) }),
                el("td", { class: "num", text: ui.numberFmt.format(b.ok + b.fail) }),
              ]),
            ),
          ),
        ]),
      ]),
    );
  }

  /**
   * Paneli kurar ve { update(view) } döndürür. Eksenler `full` veriden sabitlenir;
   * update() o anki görünümü (canlı akışta kısmi veri) çizer.
   */
  function mount(panel, full) {
    const host = panel.querySelector("[data-chart]");
    const toggle = panel.querySelector("[data-view-toggle]");
    const tooltip = ui.createTooltip(panel.querySelector(".chart"));

    const { start, end } = domainOf(full.events);
    const maxTotal = Math.max(1, ...binEvents(full.events, start, end).map((b) => b.ok + b.fail));
    // %15 pay: en yüksek sütunun etiketi alarm işaretleriyle çakışmasın
    const domain = { start, end, ...niceTicks(maxTotal * 1.15) };

    let current = full;
    let mode = "chart";
    let lastWidth = 0;

    const draw = () => (mode === "chart" ? renderChart(host, current, domain, tooltip) : renderTable(host, current, domain));

    toggle.addEventListener("click", () => {
      mode = mode === "chart" ? "table" : "chart";
      toggle.textContent = mode === "chart" ? "Tablo" : "Grafik";
      toggle.setAttribute("aria-pressed", String(mode === "table"));
      tooltip.hide();
      draw();
    });

    new ResizeObserver(() => {
      if (mode === "chart" && host.clientWidth !== lastWidth) {
        lastWidth = host.clientWidth;
        draw();
      }
    }).observe(host);

    return {
      update(view) {
        current = view;
        draw();
      },
    };
  }

  return { mount };
})(window.SIEMUI);
