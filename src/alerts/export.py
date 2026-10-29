"""Alarmları JSON'a çevirip dosyaya yazar. Dashboard bu dosyayı okuyacak."""

import json
from dataclasses import asdict
from pathlib import Path
from typing import Iterable

from .models import Alert


def alert_to_dict(alert: Alert) -> dict:
    data = asdict(alert)
    data["severity"] = alert.severity.value
    data["first_seen"] = alert.first_seen.isoformat()
    data["last_seen"] = alert.last_seen.isoformat()
    return data


def save_alerts(alerts: Iterable[Alert], path: str | Path) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = [alert_to_dict(a) for a in alerts]
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
