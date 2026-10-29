/*
 * Saldırı kaynakları haritası: Equal Earth projeksiyonunda dünya haritası, saldırgan
 * IP'lerinden ofise animasyonlu yaylar ve yanında kaynak listesi. Kütüphane yok, saf SVG.
 * Ülke sınırları world.js'ten (Natural Earth, kamu malı) gelir.
 */
"use strict";

window.SIEMMap = (function (ui) {
  const { el, svg } = ui;

  // Equal Earth projeksiyonu (Šavrič, Patterson, Jenny 2018): alanları doğru oranda gösterir
  const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796;
  const M = Math.sqrt(3) / 2;
  const RAD = Math.PI / 180;

  function project(lon, lat) {
    const t = Math.asin(M * Math.sin(lat * RAD));
    const t2 = t * t;
    const t6 = t2 * t2 * t2;
    return [
      (lon * RAD * Math.cos(t)) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2))),
      -t * (A1 + A2 * t2 + t6 * (A3 + A4 * t2)), // SVG'de y aşağı doğru artar
    ];
  }

  /** Dünya şekillerini bir kez projekte eder; sınırlar sonraki ölçekleme için tutulur. */
  function projectWorld(world) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const countries = world.map((country) => {
      const d = country.polygons
        .map((poly) =>
          poly
            .map((ring) =>
              ring
                .map(([lon, lat], i) => {
                  const [x, y] = project(lon, lat);
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
                  return `${i ? "L" : "M"}${x.toFixed(4)},${y.toFixed(4)}`;
                })
                .join("") + "Z",
            )
            .join(""),
        )
        .join("");
      return { id: country.id, name: country.name, d };
    });
    return { countries, bounds: { minX, minY, maxX, maxY } };
  }

  /** Alarmları kaynak IP'ye göre gruplar: [{ ip, geo, alerts, severity }] */
  function groupSources(alerts) {
    const byIp = new Map();
    for (const alert of alerts) {
      if (!byIp.has(alert.ip)) byIp.set(alert.ip, { ip: alert.ip, geo: alert.geo, alerts: [] });
      byIp.get(alert.ip).alerts.push(alert);
    }
    return [...byIp.values()]
      .map((s) => ({ ...s, severity: ui.topSeverity(s.alerts) }))
      .sort((a, b) => ui.SEVERITY_RANK[a.severity] - ui.SEVERITY_RANK[b.severity] || b.alerts.length - a.alerts.length);
  }

  const placeText = (geo) => (!geo ? "Konum bilinmiyor" : geo.city === geo.country ? geo.city : `${geo.city}, ${geo.country}`);

  /** Saldırgandan ofise yukarı doğru kavis yapan yay (ikinci derece Bézier). */
  function arcPath([x1, y1], [x2, y2]) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    let nx = -dy / len;
    let ny = dx / len;
    if (ny > 0) { nx = -nx; ny = -ny; } // kavis hep yukarı baksın
    const bend = len * 0.28;
    return `M${x1},${y1} Q${mx + nx * bend},${my + ny * bend} ${x2},${y2}`;
  }

  function renderMap(host, world, data, sources, tooltip) {
    const width = host.clientWidth;
    if (!width) return;

    const { bounds } = world;
    const pad = 8;
    const scale = (width - pad * 2) / (bounds.maxX - bounds.minX);
    const height = Math.round((bounds.maxY - bounds.minY) * scale + pad * 2);
    const toScreen = (lon, lat) => {
      const [x, y] = project(lon, lat);
      return [pad + (x - bounds.minX) * scale, pad + (y - bounds.minY) * scale];
    };

    // Ülkeleri, o ülkeden gelen en ciddi alarmın rengiyle boya
    const countrySeverity = new Map();
    for (const s of sources) {
      const code = s.geo && !s.geo.internal ? s.geo.country_code : null;
      if (!code) continue;
      const current = countrySeverity.get(code);
      if (!current || ui.SEVERITY_RANK[s.severity] < ui.SEVERITY_RANK[current]) countrySeverity.set(code, s.severity);
    }
    const officeCode = data.office ? data.office.country_code : null;

    const root = svg("svg", {
      class: "map-svg",
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": "Saldırı kaynaklarının dünya haritası",
    });

    const land = svg("g", {
      class: "land",
      transform: `translate(${pad - bounds.minX * scale},${pad - bounds.minY * scale}) scale(${scale})`,
    });
    for (const country of world.countries) {
      const severity = countrySeverity.get(country.id);
      let cls = "country";
      if (severity) cls += ` hot sev-${severity}`;
      else if (country.id === officeCode) cls += " home";
      land.append(svg("path", { class: cls, d: country.d }, [svg("title", { text: country.name })]));
    }
    root.append(land);

    const office = data.office ? toScreen(data.office.lon, data.office.lat) : null;
    const external = sources.filter((s) => s.geo && !s.geo.internal);

    // Yaylar: sabit silik çizgi + üzerinde akan parlak "kuyruklu yıldız"
    if (office) {
      const arcs = svg("g", { class: "arcs" });
      external.forEach((source, i) => {
        const d = arcPath(toScreen(source.geo.lon, source.geo.lat), office);
        arcs.append(
          svg("path", { class: `arc-base sev-${source.severity}`, d, "data-ip": source.ip }),
          svg("path", {
            class: `arc-comet sev-${source.severity}`,
            d,
            pathLength: 1,
            "data-ip": source.ip,
            style: `animation-delay: ${(i * 0.7).toFixed(1)}s`,
          }),
        );
      });
      root.append(arcs);
    }

    // Saldırgan noktaları
    for (const source of external) {
      const [cx, cy] = toScreen(source.geo.lon, source.geo.lat);
      const group = svg("g", { class: `source sev-${source.severity}`, "data-ip": source.ip }, [
        svg("circle", { class: "source-pulse", cx, cy, r: 5 }),
        svg("circle", { class: "source-dot", cx, cy, r: 5 }),
        svg("circle", { class: "hit", cx, cy, r: 14 }),
      ]);
      group.addEventListener("mousemove", (e) => {
        tooltip.show(e, [
          [source.ip],
          ["Konum", placeText(source.geo) + (source.geo.simulated ? " (simüle)" : "")],
          ...source.alerts.map((a) => [ui.SEVERITY_LABELS[a.severity], window.SIEMRules.name(a.rule), `sw-${a.severity}`]),
        ]);
        setFocus(host.closest(".map-layout"), source.ip);
      });
      group.addEventListener("mouseleave", () => {
        tooltip.hide();
        setFocus(host.closest(".map-layout"), null);
      });
      root.append(group);
    }

    // Ofis (hedef)
    if (office) {
      const [ox, oy] = office;
      root.append(
        svg("g", { class: "office" }, [
          svg("circle", { class: "office-ring", cx: ox, cy: oy, r: 11 }),
          svg("circle", { class: "office-dot", cx: ox, cy: oy, r: 4.5 }),
          svg("text", { class: "office-label", x: ox, y: oy + 24, text: `${data.office.city} · Ofis` }),
        ]),
      );
    }

    host.replaceChildren(root);
  }

  /** Listedeki satır ile haritadaki nokta/yay arasında karşılıklı vurgulama. */
  function setFocus(layout, ip) {
    if (!layout) return;
    layout.classList.toggle("has-focus", Boolean(ip));
    layout.querySelectorAll("[data-ip]").forEach((node) => {
      node.classList.toggle("is-focused", node.getAttribute("data-ip") === ip);
    });
  }

  function renderList(listHost, sources, layout) {
    if (!sources.length) {
      listHost.replaceChildren(
        el("div", { class: "sources-title", text: "Kaynak IP'ler" }),
        el("p", { class: "sources-empty", text: "Henüz alarm üreten kaynak yok." }),
      );
      return;
    }
    listHost.replaceChildren(
      el("div", { class: "sources-title", text: "Kaynak IP'ler" }),
      el(
        "ol",
        { class: "sources" },
        sources.map((source) => {
          const internal = source.geo && source.geo.internal;
          const row = el("li", { class: `source-row sev-${source.severity}`, "data-ip": source.ip, tabindex: "0" }, [
            el("span", { class: "chip-dot" }),
            el("div", { class: "source-main" }, [
              el("div", { class: "source-ip mono", text: source.ip }),
              el("div", { class: "source-place" }, [
                placeText(source.geo),
                source.geo && source.geo.simulated ? el("span", { class: "pill pill-sim", text: "Simüle" }) : null,
                internal ? el("span", { class: "pill pill-internal", text: "İç ağ" }) : null,
              ]),
            ]),
            el("div", { class: "source-count" }, [
              el("strong", { text: String(source.alerts.length) }),
              el("span", { text: "alarm" }),
            ]),
          ]);
          const focus = () => setFocus(layout, source.ip);
          const blur = () => setFocus(layout, null);
          row.addEventListener("mouseenter", focus);
          row.addEventListener("mouseleave", blur);
          row.addEventListener("focus", focus);
          row.addEventListener("blur", blur);
          return row;
        }),
      ),
    );
  }

  /** Paneli kurar ve { update(view) } döndürür; dünya şekilleri bir kez projekte edilir. */
  function mount(host) {
    if (!Array.isArray(window.SIEM_WORLD)) {
      host.replaceChildren(el("p", { class: "feed-empty", text: "Harita verisi (world.js) bulunamadı." }));
      return { update() {} };
    }

    const world = projectWorld(window.SIEM_WORLD);
    const mapHost = el("div", { class: "map-canvas" });
    const listHost = el("div", { class: "map-sources" });
    const layout = el("div", { class: "map-layout" }, [mapHost, listHost]);
    host.replaceChildren(layout);
    const tooltip = ui.createTooltip(layout);

    let current = null;
    let sources = [];
    let lastWidth = 0;

    new ResizeObserver(() => {
      if (current && mapHost.clientWidth !== lastWidth) {
        lastWidth = mapHost.clientWidth;
        renderMap(mapHost, world, current, sources, tooltip);
      }
    }).observe(mapHost);

    return {
      update(view) {
        current = view;
        sources = groupSources(view.alerts);
        tooltip.hide();
        renderList(listHost, sources, layout);
        renderMap(mapHost, world, view, sources, tooltip);
      },
    };
  }

  return { mount };
})(window.SIEMUI);
