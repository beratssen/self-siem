/*
 * self-siem dashboard — giriş noktası: üst bar, KPI kartları, alarm akışı ve panellerin
 * birlikte güncellenmesi. Veri, main.py'nin ürettiği data.js'ten window.SIEM_DATA olarak gelir.
 *
 * Tüm paneller render(view) ile çizilir. view normalde tüm veridir; canlı akışta
 * (replay.js) o ana kadarki olay ve alarmlardır.
 */
"use strict";

(function (ui, rules) {
  const { el } = ui;

  const locationText = (geo) => {
    if (!geo) return "Bilinmiyor";
    return geo.city === geo.country ? geo.city : `${geo.city}, ${geo.country}`;
  };
  const isExternal = (alert) => !(alert.geo && alert.geo.internal);
  const alertKey = (a) => `${a.rule}|${a.ip}|${a.first_seen}`;

  // ---------- Üst bar ----------

  function renderMeta(data) {
    document.getElementById("meta-source").textContent = data.source;
    document.getElementById("meta-generated").textContent = ui.dateTimeFmt.format(ui.toDate(data.generated_at));
  }

  // ---------- KPI kartları ----------

  const kpiPrevious = new Map();

  function kpi({ key, label, value, sub, tone, bump = false }) {
    // Değer arttıysa kartı kısa bir animasyonla vurgula (canlı akışta yeni alarm geldiğinde)
    const increased = bump && kpiPrevious.has(key) && value > kpiPrevious.get(key);
    kpiPrevious.set(key, value);
    return el("article", { class: `kpi kpi-${tone}${increased ? " bump" : ""}` }, [
      el("div", { class: "kpi-label", text: label }),
      el("div", { class: "kpi-value", text: ui.numberFmt.format(value) }),
      el("div", { class: "kpi-sub", text: sub }),
    ]);
  }

  function renderKpis(view) {
    const { events, alerts } = view;
    const failed = events.filter((e) => !e.success).length;
    const failRate = events.length ? Math.round((failed / events.length) * 100) : 0;
    const critical = alerts.filter((a) => a.severity === "critical").length;
    const external = alerts.filter(isExternal);
    const attackerIps = ui.unique(external.map((a) => a.ip)).length;
    const countries = ui.unique(external.filter((a) => a.geo).map((a) => a.geo.country)).length;
    const rulesFired = ui.unique(alerts.map((a) => a.rule)).length;

    document.getElementById("kpis").replaceChildren(
      kpi({ key: "events", label: "Toplam Olay", value: events.length, sub: `${ui.numberFmt.format(events.length - failed)} başarılı giriş`, tone: "accent" }),
      kpi({ key: "failed", label: "Başarısız Giriş", value: failed, sub: `Tüm olayların %${failRate}'i`, tone: "high" }),
      kpi({ key: "alerts", label: "Toplam Alarm", value: alerts.length, sub: `${rulesFired} farklı kural tetiklendi`, tone: "accent", bump: true }),
      kpi({
        key: "critical",
        label: "Kritik Alarm",
        value: critical,
        sub: critical ? "Acil müdahale gerekli" : "Kritik alarm yok",
        tone: critical ? "critical" : "ok",
        bump: true,
      }),
      kpi({ key: "ips", label: "Saldırgan IP", value: attackerIps, sub: `${countries} farklı ülke`, tone: "high", bump: true }),
    );
  }

  // ---------- Alarm akışı ----------

  const feedState = { severities: new Set(), query: "" };
  let feedAlerts = [];
  let freshKeys = new Set(); // canlı akışta yeni düşen alarmlar (parlama animasyonu için)
  const seenKeys = new Set();

  function matchesFilters(alert) {
    if (feedState.severities.size && !feedState.severities.has(alert.severity)) return false;
    if (!feedState.query) return true;
    const haystack = [alert.ip, alert.user, alert.rule, rules.name(alert.rule), alert.mitre, alert.description]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("tr");
    return haystack.includes(feedState.query);
  }

  function renderFilters(alerts) {
    const counts = Object.fromEntries(ui.SEVERITIES.map((s) => [s, 0]));
    alerts.forEach((a) => { counts[a.severity] += 1; });

    const allChip = el("button", { class: "chip", type: "button", "aria-pressed": String(feedState.severities.size === 0) }, [
      "Tümü", el("span", { class: "chip-count", text: String(alerts.length) }),
    ]);
    allChip.addEventListener("click", () => {
      feedState.severities.clear();
      renderFilters(feedAlerts);
      renderFeed();
    });

    // Sadece en az bir alarmı olan (ya da seçili olan) önem dereceleri için düğme göster
    const severityChips = ui.SEVERITIES.filter((s) => counts[s] > 0 || feedState.severities.has(s)).map((severity) => {
      const chip = el(
        "button",
        { class: `chip sev-${severity}`, type: "button", "aria-pressed": String(feedState.severities.has(severity)) },
        [el("span", { class: "chip-dot" }), ui.SEVERITY_LABELS[severity], el("span", { class: "chip-count", text: String(counts[severity]) })],
      );
      chip.addEventListener("click", () => {
        if (feedState.severities.has(severity)) feedState.severities.delete(severity);
        else feedState.severities.add(severity);
        renderFilters(feedAlerts);
        renderFeed();
      });
      return chip;
    });

    document.getElementById("severity-filters").replaceChildren(allChip, ...severityChips);
  }

  function alertDetail(alert) {
    const first = ui.toDate(alert.first_seen);
    const last = ui.toDate(alert.last_seen);
    const countLabel = alert.rule === "ssh_password_spraying" ? "Hedeflenen hesap" : "Olay sayısı";

    const location = el("dd", {}, [locationText(alert.geo)]);
    if (alert.geo && alert.geo.simulated) location.append(el("span", { class: "pill pill-sim", text: "Simüle" }));
    if (alert.geo && alert.geo.internal) location.append(el("span", { class: "pill pill-internal", text: "İç ağ" }));

    const rows = [
      ["Kural", el("dd", { class: "mono", text: alert.rule })],
      ["Kaynak IP", el("dd", { class: "mono", text: alert.ip })],
      ["Hedef hesap", el("dd", { text: alert.user || "Birden fazla hesap" })],
      [countLabel, el("dd", { text: ui.numberFmt.format(alert.count) })],
      ["İlk görülme", el("dd", { text: ui.dateTimeFmt.format(first) })],
      ["Son görülme", el("dd", { text: ui.dateTimeFmt.format(last) })],
      ["Süre", el("dd", { text: ui.formatDuration(last - first) })],
      ["Konum", location],
    ];

    const playbook = rules.playbook(alert.rule);

    return el("div", { class: "alert-detail", hidden: true, onclick: (e) => e.stopPropagation() }, [
      el("dl", { class: "detail-grid" }, rows.flatMap(([label, value]) => [el("dt", { text: label }), value])),
      playbook.length
        ? el("div", { class: "playbook" }, [
            el("div", { class: "playbook-title", text: "Önerilen müdahale" }),
            el("ol", {}, playbook.map((step) => el("li", { text: step }))),
          ])
        : null,
    ]);
  }

  function alertItem(alert) {
    const detail = alertDetail(alert);
    const tags = [
      el("span", { class: "tag mono", text: alert.ip }),
      alert.user ? el("span", { class: "tag", text: alert.user }) : null,
      alert.geo ? el("span", { class: "tag", text: locationText(alert.geo) }) : null,
      ...ui.mitreIds(alert).map((id) => el("span", { class: "tag tag-mitre mono", text: id })),
    ];
    const fresh = freshKeys.has(alertKey(alert));

    const item = el("li", { class: `alert sev-${alert.severity}${fresh ? " is-new" : ""}`, tabindex: "0", "aria-expanded": "false" }, [
      el("div", { class: "alert-head" }, [
        el("span", { class: "sev-badge", text: ui.SEVERITY_LABELS[alert.severity] }),
        el("span", { class: "alert-rule", text: rules.name(alert.rule) }),
        el("time", { class: "alert-time", datetime: alert.last_seen, text: ui.shortFmt.format(ui.toDate(alert.last_seen)) }),
      ]),
      el("p", { class: "alert-desc", text: alert.description }),
      el("div", { class: "tags" }, tags),
      detail,
    ]);

    const toggle = () => {
      const open = item.classList.toggle("open");
      item.setAttribute("aria-expanded", String(open));
      detail.hidden = !open;
    };
    item.addEventListener("click", toggle);
    item.addEventListener("keydown", (e) => {
      if (e.target === item && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        toggle();
      }
    });
    return item;
  }

  function renderFeed() {
    const visible = feedAlerts.filter(matchesFilters);
    const empty = feedAlerts.length ? "Filtreye uyan alarm yok." : "Henüz alarm yok.";
    document.getElementById("feed").replaceChildren(
      ...(visible.length ? visible.map(alertItem) : [el("li", { class: "feed-empty", text: empty })]),
    );
    document.getElementById("feed-count").textContent =
      visible.length === feedAlerts.length ? `${feedAlerts.length} alarm` : `${visible.length} / ${feedAlerts.length} alarm`;
  }

  /** Akışı günceller; canlı akışta yeni düşen alarmları döndürür. */
  function updateFeed(alerts, replaying) {
    freshKeys = new Set();
    if (replaying) {
      for (const a of alerts) if (!seenKeys.has(alertKey(a))) freshKeys.add(alertKey(a));
    }
    seenKeys.clear();
    alerts.forEach((a) => seenKeys.add(alertKey(a)));
    feedAlerts = alerts;
    renderFilters(alerts);
    renderFeed();
    const fresh = alerts.filter((a) => freshKeys.has(alertKey(a)));
    // Parlama bir kez oynasın; sonraki filtre/arama çizimlerinde tekrar etmesin
    setTimeout(() => { freshKeys = new Set(); }, 1500);
    return fresh;
  }

  document.getElementById("feed-search").addEventListener("input", (e) => {
    feedState.query = e.target.value.trim().toLocaleLowerCase("tr");
    renderFeed();
  });

  // ---------- Bildirimler (canlı akış) ----------

  function showToast(alert) {
    const toast = el("div", { class: `toast sev-${alert.severity}`, role: "status" }, [
      el("div", { class: "toast-head" }, [
        el("span", { class: "sev-badge", text: ui.SEVERITY_LABELS[alert.severity] }),
        el("span", { class: "toast-rule", text: rules.name(alert.rule) }),
      ]),
      el("div", { class: "toast-desc", text: alert.description }),
    ]);
    document.getElementById("toasts").append(toast);
    setTimeout(() => toast.classList.add("leaving"), 3800);
    setTimeout(() => toast.remove(), 4300);
  }

  // ---------- Başlangıç ----------

  function renderNoData() {
    document.getElementById("app").replaceChildren(
      el("div", { class: "no-data" }, [
        el("h2", { text: "Dashboard verisi bulunamadı" }),
        el("p", {}, [
          "Önce proje klasöründe ",
          el("code", { text: "python main.py" }),
          " komutunu çalıştır, ardından bu sayfayı yenile.",
        ]),
      ]),
    );
  }

  const data = window.SIEM_DATA;
  if (!data || !Array.isArray(data.alerts) || !Array.isArray(data.events) || !data.events.length) {
    renderNoData();
    return;
  }

  renderMeta(data);
  const timeline = window.SIEMTimeline.mount(document.getElementById("timeline-panel"), data);
  const map = window.SIEMMap.mount(document.getElementById("map"));
  let lastAlertCount = null;

  function render(view) {
    renderKpis(view);
    timeline.update(view);
    // Ağır paneller sadece alarm listesi değiştiğinde yeniden çizilir
    if (view.alerts.length !== lastAlertCount) {
      lastAlertCount = view.alerts.length;
      const fresh = updateFeed(view.alerts, view.replaying);
      window.SIEMMitre.mount(document.getElementById("mitre"), view);
      map.update(view);
      fresh.forEach(showToast);
    }
  }

  render({ ...data, cursor: null, replaying: false });
  window.SIEMReplay.attach(data, render);
})(window.SIEMUI, window.SIEMRules);
