/*
 * self-siem dashboard
 *
 * Veri, main.py'nin ürettiği data.js dosyasından window.SIEM_DATA olarak gelir.
 * GÜVENLİK: Log verisi (kullanıcı adı, IP...) saldırgan kontrolündedir. Bu yüzden
 * hiçbir veri innerHTML ile basılmaz; tüm metinler textContent / text node olarak
 * eklenir. Böylece "<script>" içeren bir kullanıcı adı bile düz metin görünür (XSS koruması).
 */
"use strict";

(function () {
  const SEVERITIES = ["critical", "high", "medium", "low"];
  const SEVERITY_LABELS = { critical: "Kritik", high: "Yüksek", medium: "Orta", low: "Düşük" };

  // Kural kimliği -> ekranda görünen ad ve analist için önerilen müdahale adımları
  const RULES = {
    ssh_account_takeover: {
      name: "Hesap Ele Geçirme",
      playbook: [
        "Hesabı hemen devre dışı bırak ve açık oturumları sonlandır.",
        "Kaynak IP'yi güvenlik duvarında engelle.",
        "Şifreyi sıfırla ve hesap için MFA'yı zorunlu kıl.",
        "Girişten sonraki tüm hesap aktivitelerini incele.",
      ],
    },
    ssh_brute_force: {
      name: "Brute-Force Saldırısı",
      playbook: [
        "Kaynak IP'yi güvenlik duvarında engelle.",
        "Hedef hesapta başarılı giriş olup olmadığını kontrol et.",
        "Hesap kilitleme ve hız sınırlama politikalarını gözden geçir.",
      ],
    },
    ssh_password_spraying: {
      name: "Password Spraying",
      playbook: [
        "Kaynak IP'yi güvenlik duvarında engelle.",
        "Hedeflenen hesaplarda başarılı giriş olup olmadığını kontrol et.",
        "Zayıf/yaygın şifre kullanan hesapları tespit edip şifre değişikliği iste.",
        "Tüm hesaplar için MFA'yı zorunlu kıl.",
      ],
    },
    ssh_off_hours_login: {
      name: "Mesai Dışı Giriş",
      playbook: [
        "Kullanıcıyla iletişime geçip girişin kendisine ait olduğunu teyit et.",
        "Kaynak IP'nin kullanıcının bilinen cihazlarından olup olmadığını kontrol et.",
        "Teyit edilemezse hesabı askıya al ve şifreyi sıfırla.",
      ],
    },
  };

  // ---------- Yardımcılar ----------

  /** Güvenli DOM oluşturucu: metinler her zaman text node olarak eklenir. */
  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
      if (value === null || value === undefined || value === false) continue;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? "" : value);
    }
    for (const child of [].concat(children)) {
      if (child !== null && child !== undefined && child !== false) node.append(child);
    }
    return node;
  }

  const numberFmt = new Intl.NumberFormat("tr-TR");
  const dateTimeFmt = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const shortFmt = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });

  const toDate = (iso) => new Date(iso);

  function formatDuration(ms) {
    const total = Math.round(ms / 1000);
    if (total < 60) return `${total} sn`;
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    if (minutes < 60) return seconds ? `${minutes} dk ${seconds} sn` : `${minutes} dk`;
    return `${Math.floor(minutes / 60)} sa ${minutes % 60} dk`;
  }

  const mitreIds = (alert) => alert.mitre.split(",").map((s) => s.trim()).filter(Boolean);
  const ruleName = (id) => (RULES[id] ? RULES[id].name : id);
  const locationText = (geo) => {
    if (!geo) return "Bilinmiyor";
    return geo.city === geo.country ? geo.city : `${geo.city}, ${geo.country}`;
  };
  const isExternal = (alert) => !(alert.geo && alert.geo.internal);
  const unique = (items) => [...new Set(items)];

  // ---------- Üst bar ----------

  function renderMeta(data) {
    document.getElementById("meta-source").textContent = data.source;
    document.getElementById("meta-generated").textContent = dateTimeFmt.format(toDate(data.generated_at));
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
    const failed = events.filter((e) => !e.success).length;
    const failRate = events.length ? Math.round((failed / events.length) * 100) : 0;
    const critical = alerts.filter((a) => a.severity === "critical").length;
    const external = alerts.filter(isExternal);
    const attackerIps = unique(external.map((a) => a.ip));
    const countries = unique(external.filter((a) => a.geo).map((a) => a.geo.country));
    const rulesFired = unique(alerts.map((a) => a.rule)).length;

    document.getElementById("kpis").replaceChildren(
      kpi({
        label: "Toplam Olay",
        value: numberFmt.format(events.length),
        sub: `${numberFmt.format(events.length - failed)} başarılı giriş`,
        tone: "accent",
      }),
      kpi({
        label: "Başarısız Giriş",
        value: numberFmt.format(failed),
        sub: `Tüm olayların %${failRate}'i`,
        tone: "high",
      }),
      kpi({
        label: "Toplam Alarm",
        value: numberFmt.format(alerts.length),
        sub: `${rulesFired} farklı kural tetiklendi`,
        tone: "accent",
      }),
      kpi({
        label: "Kritik Alarm",
        value: numberFmt.format(critical),
        sub: critical ? "Acil müdahale gerekli" : "Kritik alarm yok",
        tone: critical ? "critical" : "ok",
      }),
      kpi({
        label: "Saldırgan IP",
        value: numberFmt.format(attackerIps.length),
        sub: `${countries.length} farklı ülke`,
        tone: "high",
      }),
    );
  }

  // ---------- Alarm akışı ----------

  const feedState = { severities: new Set(), query: "" };

  function matchesFilters(alert) {
    if (feedState.severities.size && !feedState.severities.has(alert.severity)) return false;
    if (!feedState.query) return true;
    const haystack = [alert.ip, alert.user, alert.rule, ruleName(alert.rule), alert.mitre, alert.description]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("tr");
    return haystack.includes(feedState.query);
  }

  function renderFilters(alerts, onChange) {
    const container = document.getElementById("severity-filters");
    const counts = Object.fromEntries(SEVERITIES.map((s) => [s, 0]));
    alerts.forEach((a) => { counts[a.severity] += 1; });

    const allChip = el("button", { class: "chip", type: "button", "aria-pressed": "true" }, [
      "Tümü", el("span", { class: "chip-count", text: String(alerts.length) }),
    ]);
    // Sadece en az bir alarmı olan önem dereceleri için filtre düğmesi göster
    const severityChips = SEVERITIES.filter((s) => counts[s] > 0).map((severity) => ({
      severity,
      node: el("button", { class: `chip sev-${severity}`, type: "button", "aria-pressed": "false" }, [
        el("span", { class: "chip-dot" }),
        SEVERITY_LABELS[severity],
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
    const first = toDate(alert.first_seen);
    const last = toDate(alert.last_seen);
    const countLabel = alert.rule === "ssh_password_spraying" ? "Hedeflenen hesap" : "Olay sayısı";

    const location = el("dd", {}, [locationText(alert.geo)]);
    if (alert.geo && alert.geo.simulated) location.append(el("span", { class: "pill pill-sim", text: "Simüle" }));
    if (alert.geo && alert.geo.internal) location.append(el("span", { class: "pill pill-internal", text: "İç ağ" }));

    const rows = [
      ["Kural", el("dd", { class: "mono", text: alert.rule })],
      ["Kaynak IP", el("dd", { class: "mono", text: alert.ip })],
      ["Hedef hesap", el("dd", { text: alert.user || "Birden fazla hesap" })],
      [countLabel, el("dd", { text: numberFmt.format(alert.count) })],
      ["İlk görülme", el("dd", { text: dateTimeFmt.format(first) })],
      ["Son görülme", el("dd", { text: dateTimeFmt.format(last) })],
      ["Süre", el("dd", { text: formatDuration(last - first) })],
      ["Konum", location],
    ];

    const playbook = RULES[alert.rule] ? RULES[alert.rule].playbook : [];

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
      ...mitreIds(alert).map((id) => el("span", { class: "tag tag-mitre mono", text: id })),
    ];

    const item = el("li", { class: `alert sev-${alert.severity}`, tabindex: "0", "aria-expanded": "false" }, [
      el("div", { class: "alert-head" }, [
        el("span", { class: "sev-badge", text: SEVERITY_LABELS[alert.severity] }),
        el("span", { class: "alert-rule", text: ruleName(alert.rule) }),
        el("time", {
          class: "alert-time",
          datetime: alert.last_seen,
          text: shortFmt.format(toDate(alert.last_seen)),
        }),
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
    const feed = document.getElementById("feed");
    feed.replaceChildren(
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
  if (!data || !Array.isArray(data.alerts) || !Array.isArray(data.events)) {
    renderNoData();
    return;
  }

  renderMeta(data);
  renderKpis(data);
  setupFeed(data.alerts);
})();
