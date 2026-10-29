import json
from datetime import datetime

from src.alerts import Alert, Severity, save_dashboard_data
from src.enrich import SimulatedGeoProvider
from src.parser import LogEvent

NOW = datetime(2026, 10, 30, 10, 0, 0)


def read_payload(path) -> dict:
    text = path.read_text(encoding="utf-8")
    prefix = "window.SIEM_DATA = "
    start = text.index(prefix) + len(prefix)
    return json.loads(text[start:].rstrip().rstrip(";"))


def test_dashboard_data_contains_alerts_events_and_office(tmp_path):
    alert = Alert(
        rule="ssh_brute_force", mitre="T1110", severity=Severity.HIGH, ip="203.0.113.5",
        user="root", count=45, first_seen=NOW, last_seen=NOW, description="açıklama",
    )
    event = LogEvent(time=NOW, success=False, user="root", ip="203.0.113.5")
    out = tmp_path / "data.js"

    save_dashboard_data([alert], [event], out, source="auth.log", office=SimulatedGeoProvider().office)

    payload = read_payload(out)
    assert payload["source"] == "auth.log"
    assert payload["alerts"][0]["severity"] == "high"
    assert payload["alerts"][0]["description"] == "açıklama"
    assert payload["events"][0] == {"time": "2026-10-30T10:00:00", "success": False, "user": "root", "ip": "203.0.113.5"}
    assert payload["office"]["city"] == "İstanbul"
    assert payload["office"]["country_code"] == "TUR"


def test_dashboard_data_without_office(tmp_path):
    out = tmp_path / "data.js"

    save_dashboard_data([], [], out, source="auth.log")

    assert read_payload(out)["office"] is None
