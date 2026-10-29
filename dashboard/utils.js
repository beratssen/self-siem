/*
 * self-siem dashboard — ortak yardımcılar (window.SIEMUI).
 *
 * GÜVENLİK: Log verisi (kullanıcı adı, IP...) saldırgan kontrolündedir. Hiçbir veri
 * innerHTML ile basılmaz; el() ve svg() metinleri her zaman text node olarak ekler.
 */
"use strict";

window.SIEMUI = (function () {
  const SVG_NS = "http://www.w3.org/2000/svg";

  const SEVERITIES = ["critical", "high", "medium", "low"];
  const SEVERITY_LABELS = { critical: "Kritik", high: "Yüksek", medium: "Orta", low: "Düşük" };
  const SEVERITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 };

  function applyProps(node, props) {
    for (const [key, value] of Object.entries(props)) {
      if (value === null || value === undefined || value === false) continue;
      if (key === "class") node.setAttribute("class", value);
      else if (key === "text") node.textContent = value;
      else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? "" : value);
    }
  }

  function appendChildren(node, children) {
    for (const child of [].concat(children)) {
      if (child !== null && child !== undefined && child !== false) node.append(child);
    }
  }

  /** Güvenli HTML eleman oluşturucu. */
  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    applyProps(node, props);
    appendChildren(node, children);
    return node;
  }

  /** Güvenli SVG eleman oluşturucu. */
  function svg(tag, props = {}, children = []) {
    const node = document.createElementNS(SVG_NS, tag);
    applyProps(node, props);
    appendChildren(node, children);
    return node;
  }

  const numberFmt = new Intl.NumberFormat("tr-TR");
  const dateTimeFmt = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const shortFmt = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
  const timeFmt = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" });
  const dayFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" });

  const toDate = (iso) => new Date(iso);
  const unique = (items) => [...new Set(items)];

  function formatDuration(ms) {
    const total = Math.round(ms / 1000);
    if (total < 60) return `${total} sn`;
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    if (minutes < 60) return seconds ? `${minutes} dk ${seconds} sn` : `${minutes} dk`;
    return `${Math.floor(minutes / 60)} sa ${minutes % 60} dk`;
  }

  const mitreIds = (alert) => alert.mitre.split(",").map((s) => s.trim()).filter(Boolean);

  /** Bir alarm listesindeki en ciddi önem derecesi. */
  function topSeverity(alerts) {
    return alerts.reduce(
      (best, a) => (SEVERITY_RANK[a.severity] < SEVERITY_RANK[best] ? a.severity : best),
      "low",
    );
  }

  /**
   * Grafiğin içinde konumlanan, tek bir paylaşılan ipucu kutusu.
   * show() satırları text olarak alır: [["Başlık"], ["Etiket", "Değer", "renk-sınıfı"], ...]
   */
  function createTooltip(container) {
    const tip = el("div", { class: "chart-tooltip", role: "tooltip", hidden: true });
    container.append(tip);
    return {
      show(event, rows) {
        tip.replaceChildren(
          ...rows.map(([label, value, swatch]) =>
            value === undefined
              ? el("div", { class: "tt-title", text: label })
              : el("div", { class: "tt-row" }, [
                  swatch ? el("span", { class: `tt-swatch ${swatch}` }) : null,
                  el("span", { class: "tt-label", text: label }),
                  el("span", { class: "tt-value", text: value }),
                ]),
          ),
        );
        tip.hidden = false;
        const box = container.getBoundingClientRect();
        const x = event.clientX - box.left;
        const y = event.clientY - box.top;
        const w = tip.offsetWidth;
        const h = tip.offsetHeight;
        // İmlecin sağında göster; sığmıyorsa soluna al
        const left = x + 14 + w > box.width ? x - 14 - w : x + 14;
        tip.style.left = `${Math.max(4, left)}px`;
        tip.style.top = `${Math.min(Math.max(4, y - h / 2), box.height - h - 4)}px`;
      },
      hide() {
        tip.hidden = true;
      },
    };
  }

  return {
    SEVERITIES,
    SEVERITY_LABELS,
    SEVERITY_RANK,
    el,
    svg,
    numberFmt,
    dateTimeFmt,
    shortFmt,
    timeFmt,
    dayFmt,
    toDate,
    unique,
    formatDuration,
    mitreIds,
    topSeverity,
    createTooltip,
  };
})();
