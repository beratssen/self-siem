"""self-siem ana programı: logu okur, tüm tespit kurallarını çalıştırır, alarmları gösterir.

Kullanım:
    python main.py                      # data/auth.log dosyasını analiz eder
    python main.py --log baska.log      # başka bir log dosyası
    python main.py --out sonuc.json     # alarmları başka bir yere yazar
"""

import argparse
import sys
from pathlib import Path

from src.alerts import Alert, Severity, save_alerts, save_dashboard_data
from src.enrich import SimulatedGeoProvider, enrich_alerts
from src.parser import LogEvent, parse_file
from src.rules import (
    detect_account_takeover,
    detect_brute_force,
    detect_off_hours_login,
    detect_password_spraying,
)

ROOT = Path(__file__).resolve().parent

# Demo IP'leri için simüle konumlar; gerçek veride GeoLite2 gibi bir sağlayıcıyla değiştirilir.
GEO_PROVIDER = SimulatedGeoProvider()

# Yeni bir kural yazdığımızda sadece bu listeye eklememiz yeterli.
RULES = [
    detect_brute_force,
    detect_account_takeover,
    detect_password_spraying,
    detect_off_hours_login,
]

# En ciddi alarm en üstte çıksın diye sıralama anahtarı
SEVERITY_ORDER = {Severity.CRITICAL: 0, Severity.HIGH: 1, Severity.MEDIUM: 2, Severity.LOW: 3}
COLORS = {
    Severity.CRITICAL: "\033[1;97;41m",  # beyaz yazı, kırmızı zemin
    Severity.HIGH: "\033[1;91m",
    Severity.MEDIUM: "\033[93m",
    Severity.LOW: "\033[96m",
}
RESET = "\033[0m"


def analyze(log_path: Path) -> tuple[list[LogEvent], list[Alert]]:
    # Kurallar olayları birden fazla kez dolaşır, bu yüzden listeye çeviriyoruz
    events = list(parse_file(log_path))
    alerts = [alert for rule in RULES for alert in rule(events)]
    alerts = enrich_alerts(alerts, GEO_PROVIDER)
    alerts.sort(key=lambda a: (SEVERITY_ORDER[a.severity], a.first_seen))
    return events, alerts


def format_alert(alert: Alert, color: bool) -> str:
    label = f" {alert.severity.value.upper():<8}"
    if color:
        label = f"{COLORS[alert.severity]}{label} {RESET}"
    else:
        label += " "
    return (
        f"{label} [{alert.mitre}] {alert.description}\n"
        f"{'':11} {alert.first_seen:%Y-%m-%d %H:%M:%S} -> {alert.last_seen:%H:%M:%S}"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="self-siem: SSH log analizi ve saldırı tespiti")
    parser.add_argument("--log", type=Path, default=ROOT / "data" / "auth.log")
    parser.add_argument("--out", type=Path, default=ROOT / "data" / "alerts.json")
    parser.add_argument("--dashboard", type=Path, default=ROOT / "dashboard" / "data.js")
    args = parser.parse_args()

    if not args.log.exists():
        sys.exit(f"Log dosyası bulunamadı: {args.log}\nÖnce 'python tools/generate_logs.py' çalıştır.")

    # Windows konsolunda Türkçe karakterlerin bozulmaması için
    sys.stdout.reconfigure(encoding="utf-8")
    color = sys.stdout.isatty()

    events, alerts = analyze(args.log)
    print(f"self-siem | {args.log.name} analiz edildi | {len(alerts)} alarm\n")
    for alert in alerts:
        print(format_alert(alert, color))
        print()

    save_alerts(alerts, args.out)
    save_dashboard_data(alerts, events, args.dashboard, source=args.log.name, office=GEO_PROVIDER.office)
    print(f"Alarmlar kaydedildi: {args.out}")
    print(f"Dashboard verisi: {args.dashboard}  (dashboard/index.html dosyasını aç)")


if __name__ == "__main__":
    main()
