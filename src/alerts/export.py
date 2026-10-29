"""Alarmları JSON'a ve dashboard'un okuyacağı data.js dosyasına yazar."""

import json
from dataclasses import asdict
from datetime import datetime
from pathlib import Path
from typing import Iterable

from src.parser import LogEvent

from .models import Alert, GeoLocation


def alert_to_dict(alert: Alert) -> dict:
    data = asdict(alert)
    data["severity"] = alert.severity.value
    data["first_seen"] = alert.first_seen.isoformat()
    data["last_seen"] = alert.last_seen.isoformat()
    return data


def event_to_dict(event: LogEvent) -> dict:
    return {
        "time": event.time.isoformat(),
        "success": event.success,
        "user": event.user,
        "ip": event.ip,
    }


def save_alerts(alerts: Iterable[Alert], path: str | Path) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = [alert_to_dict(a) for a in alerts]
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def save_dashboard_data(
    alerts: Iterable[Alert],
    events: Iterable[LogEvent],
    path: str | Path,
    source: str,
    office: GeoLocation | None = None,
) -> None:
    """Dashboard için alarmları ve olayları bir JavaScript dosyasına yazar.

    Tarayıcılar, çift tıklanarak açılan (file://) sayfaların yerel JSON okumasını
    güvenlik gereği engeller; ama normal bir <script> dosyasını yükleyebilir.
    Bu yüzden veriyi window.SIEM_DATA değişkeni olarak yazıyoruz.
    """
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "source": source,
        "office": asdict(office) if office else None,
        "alerts": [alert_to_dict(a) for a in alerts],
        "events": [event_to_dict(e) for e in events],
    }
    body = json.dumps(payload, indent=2, ensure_ascii=False)
    path.write_text(
        f"// self-siem tarafından otomatik üretildi, elle düzenlemeyin.\nwindow.SIEM_DATA = {body};\n",
        encoding="utf-8",
    )
