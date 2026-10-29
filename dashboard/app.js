/*
 * self-siem dashboard — giriş noktası: üst bar, KPI kartları ve alarm akışı.
 * Veri, main.py'nin ürettiği data.js dosyasından window.SIEM_DATA olarak gelir.
 * Paneller: timeline.js (zaman çizelgesi), mitre.js (ATT&CK), rules.js (kural adları).
 */
"use strict";

(function (ui, rules) {
  const { el } = ui;

  const locationText = (geo) => {
    if (!geo) return "Bilinmiyor";
    return geo.city === geo.country ? geo.city : `${geo.city}, ${geo.country}`;
  };
  const isExternal = (alert) => !(alert.geo && alert.geo.internal);

  // ---------- Üst bar ----------

  function renderMeta(data) {
    document.getElementById("meta-source").textContent = data.source;
    document.getElementById("meta-generated").textContent = ui.dateTimeFmt.format(ui.toDate(data.generated_at));
  }

  // ---------- KPI kartları ----------

  function kpi({ label, value, sub, tone }) {
    return el("article", { class: `kpi kpi-${tone}` }, [
      el("div", { class: "kpi-label", text: label }),
      el("div", { class: "kpi-value", text: value }),
      el("div", { class: "kpi-sub", text: sub }),
    ]);
  }

  function renderKpis(data) {
    const { events, alerts } = data;
    const fmt = ui.numberFmt.format;
    const failed = events.filter((e) => !e.success).length;
    const failRate = events.length ? Math.round((failed / events.length) * 100) : 0;
    const critical = alerts.filter((a) => a.severity === "critical").length;
    const external = alerts.filter(isExternal);
    const attackerIps = ui.unique(external.map((a) => a.ip));
    const countries = ui.unique(external.filter((a) => a.geo).map((a) => a.geo.country));
    const rulesFired = ui.unique(alerts.map((a) => a.rule)).length;

    document.getElementById("kpis").replaceChildren(
      kpi({ label: "Toplam Olay", value: fmt(events.length), sub: `${fmt(events.length - failed)} başarılı giriş`, tone: "accent" }),
      kpi({ label: "Başarısız Giriş", value: fmt(failed), sub: `Tüm olayların %${failRate}'i`, tone: "high" }),
      kpi({ label: "Toplam Alarm", value: fmt(alerts.length), sub: `${rulesFired} farklı kural tetiklendi`, tone: "accent" }),
      kpi({
        label: "Kritik Alarm",
        value: fmt(critical),
        sub: critical ? "Acil müdahale gerekli" : "Kritik alarm yok",
        tone: critical ? "critical" : "ok",
      }),
      kpi({ label: "Saldırgan IP", value: fmt(attackerIps.length), sub: `${countries.length} farklı ülke`, tone: "high" }),
    );
  }

  // ---------- Alarm akışı ----------

  const feedState = { severities: new Set(), query: "" };

  function matchesFilters(alert) {
    if (feedState.severities.size && !feedState.severities.has(alert.severity)) return false;
    if (!feedState.query) return true;
    const haystack = [alert.ip, alert.user, alert.rule, rules.name(alert.rule), alert.mitre, alert.description]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("tr");
    return haystack.includes(feedState.query);
  }

  function renderFilters(alerts, onChange) {
    const container = document.getElementById("severity-filters");
    const counts = Object.fromEntries(ui.SEVERITIES.map((s) => [s, 0]));
    alerts.forEach((a) => { counts[a.severity] += 1; });

    const allChip = el("button", { class: "chip", type: "button", "aria-pressed": "true" }, [
      "Tümü", el("span", { class: "chip-count", text: String(alerts.length) }),
    ]);
    // Sadece en az bir alarmı olan önem dereceleri için filtre düğmesi göster
    const severityChips = ui.SEVERITIES.filter((s) => counts[s] > 0).map((severity) => ({
      severity,
      node: el("button", { class: `chip sev-${severity}`, type: "button", "aria-pressed": "false" }, [
        el("span", { class: "chip-dot" }),
        ui.SEVERITY_LABELS[severity],
        el("span", { class: "chip-count", text: String(counts[severity]) }),
      ]),
    }));

    const sync = () => {
      allChip.setAttribute("aria-pressed", String(feedState.severities.size === 0));
      for (const { severity, node } of severityChips) {
        node.setAttribute("aria-pressed", String(feedState.severities.has(severity)));
      }
      onChange();
    };

    allChip.addEventListener("click", () => { feedState.severities.clear(); sync(); });
    for (const { severity, node } of severityChips) {
      node.addEventListener("click", () => {
        if (feedState.severities.has(severity)) feedState.severities.delete(severity);
        else feedState.severities.add(severity);
        sync();
      });
    }

    container.replaceChildren(allChip, ...severityChips.map((c) => c.node));
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

    const item = el("li", { class: `alert sev-${alert.severity}`, tabindex: "0", "aria-expanded": "false" }, [
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

  function renderFeed(alerts) {
    const visible = alerts.filter(matchesFilters);
    document.getElementById("feed").replaceChildren(
      ...(visible.length
        ? visible.map(alertItem)
        : [el("li", { class: "feed-empty", text: "Filtreye uyan alarm yok." })]),
    );
    document.getElementById("feed-count").textContent =
      visible.length === alerts.length ? `${alerts.length} alarm` : `${visible.length} / ${alerts.length} alarm`;
  }

  function setupFeed(alerts) {
    const rerender = () => renderFeed(alerts);
    renderFilters(alerts, rerender);
    document.getElementById("feed-search").addEventListener("input", (e) => {
      feedState.query = e.target.value.trim().toLocaleLowerCase("tr");
      rerender();
    });
    rerender();
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
  renderKpis(data);
  setupFeed(data.alerts);
  window.SIEMTimeline.mount(document.getElementById("timeline-panel"), data);
  window.SIEMMitre.mount(document.getElementById("mitre"), data);
})(window.SIEMUI, window.SIEMRules);
