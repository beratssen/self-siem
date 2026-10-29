/*
 * MITRE ATT&CK paneli: üstte 14 taktiğin şeridi (tetiklenenler vurgulu),
 * altta tetiklenen tekniklerin kartları.
 */
"use strict";

window.SIEMMitre = (function (ui) {
  const { el } = ui;

  // ATT&CK Enterprise taktikleri, saldırı yaşam döngüsü sırasıyla
  const TACTICS = [
    ["reconnaissance", "Ön Keşif", "Reconnaissance"],
    ["resource-development", "Kaynak Geliştirme", "Resource Development"],
    ["initial-access", "İlk Erişim", "Initial Access"],
    ["execution", "Çalıştırma", "Execution"],
    ["persistence", "Kalıcılık", "Persistence"],
    ["privilege-escalation", "Yetki Yükseltme", "Privilege Escalation"],
    ["defense-evasion", "Savunmadan Kaçınma", "Defense Evasion"],
    ["credential-access", "Kimlik Bilgisi Erişimi", "Credential Access"],
    ["discovery", "Keşif", "Discovery"],
    ["lateral-movement", "Yanal Hareket", "Lateral Movement"],
    ["collection", "Veri Toplama", "Collection"],
    ["command-and-control", "Komuta ve Kontrol", "Command and Control"],
    ["exfiltration", "Veri Sızdırma", "Exfiltration"],
    ["impact", "Etki", "Impact"],
  ];

  const TECHNIQUES = {
    T1110: {
      name: "Brute Force",
      tactics: ["credential-access"],
      description: "Saldırgan, şifresini bilmediği hesaplara çok sayıda şifre deneyerek erişim kazanmaya çalışır.",
      url: "https://attack.mitre.org/techniques/T1110/",
    },
    "T1110.003": {
      name: "Password Spraying",
      tactics: ["credential-access"],
      description: "Hesap kilitlenmesine takılmamak için birkaç yaygın şifre çok sayıda farklı hesapta denenir.",
      url: "https://attack.mitre.org/techniques/T1110/003/",
    },
    T1078: {
      name: "Valid Accounts",
      tactics: ["initial-access", "persistence", "privilege-escalation", "defense-evasion"],
      description: "Saldırgan, ele geçirdiği gerçek bir hesapla sisteme meşru bir kullanıcı gibi girer.",
      url: "https://attack.mitre.org/techniques/T1078/",
    },
  };

  const tacticName = Object.fromEntries(TACTICS.map(([id, tr]) => [id, tr]));

  /** Teknik kimliği -> o tekniği içeren alarmlar */
  function groupByTechnique(alerts) {
    const groups = new Map();
    for (const alert of alerts) {
      for (const id of ui.mitreIds(alert)) {
        if (!groups.has(id)) groups.set(id, []);
        groups.get(id).push(alert);
      }
    }
    return groups;
  }

  function tacticStrip(groups) {
    // Taktik -> o taktiğe düşen alarmlar (bir alarm bir taktikte bir kez sayılır)
    const hits = new Map();
    for (const [id, alerts] of groups) {
      for (const tactic of (TECHNIQUES[id] || { tactics: [] }).tactics) {
        const set = hits.get(tactic) || new Set();
        alerts.forEach((a) => set.add(a));
        hits.set(tactic, set);
      }
    }

    return el(
      "ol",
      { class: "tactics", "aria-label": "ATT&CK taktikleri" },
      TACTICS.map(([id, tr, en], index) => {
        const alerts = hits.has(id) ? [...hits.get(id)] : [];
        const active = alerts.length > 0;
        const severity = active ? ui.topSeverity(alerts) : null;
        return el("li", { class: `tactic${active ? ` active sev-${severity}` : ""}`, title: en }, [
          el("span", { class: "tactic-step", text: String(index + 1).padStart(2, "0") }),
          el("span", { class: "tactic-name", text: tr }),
          active ? el("span", { class: "tactic-count", text: `${alerts.length} alarm` }) : null,
        ]);
      }),
    );
  }

  function techniqueCard(id, alerts) {
    const info = TECHNIQUES[id] || { name: id, tactics: [], description: "", url: null };
    const severity = ui.topSeverity(alerts);
    const counts = ui.SEVERITIES.map((s) => [s, alerts.filter((a) => a.severity === s).length]).filter(([, n]) => n);

    return el("article", { class: `technique sev-${severity}` }, [
      el("div", { class: "technique-head" }, [
        el("span", { class: "technique-id mono", text: id }),
        el("span", { class: "technique-total", text: `${alerts.length} alarm` }),
      ]),
      el("h3", { class: "technique-name", text: info.name }),
      el("p", { class: "technique-desc", text: info.description }),
      el("div", { class: "tags" }, info.tactics.map((t) => el("span", { class: "tag", text: tacticName[t] }))),
      el("div", { class: "technique-foot" }, [
        el(
          "span",
          { class: "technique-sev" },
          counts.map(([s, n]) =>
            el("span", { class: `sev-count sev-${s}` }, [el("span", { class: "chip-dot" }), `${ui.SEVERITY_LABELS[s]} ${n}`]),
          ),
        ),
        info.url
          ? el("a", { class: "ext-link", href: info.url, target: "_blank", rel: "noopener noreferrer", text: "MITRE'de incele ↗" })
          : null,
      ]),
    ]);
  }

  function mount(host, data) {
    const groups = groupByTechnique(data.alerts);
    // En ciddi teknik önce, eşitlikte daha çok alarm önce
    const ordered = [...groups.entries()].sort(
      ([, a], [, b]) => ui.SEVERITY_RANK[ui.topSeverity(a)] - ui.SEVERITY_RANK[ui.topSeverity(b)] || b.length - a.length,
    );

    host.replaceChildren(
      tacticStrip(groups),
      ordered.length
        ? el("div", { class: "techniques" }, ordered.map(([id, alerts]) => techniqueCard(id, alerts)))
        : el("p", { class: "feed-empty", text: "Tetiklenen teknik yok." }),
    );
  }

  return { mount };
})(window.SIEMUI);
