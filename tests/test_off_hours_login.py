from datetime import datetime

from src.alerts import Severity
from src.parser import LogEvent
from src.rules import detect_off_hours_login


def login(hour: int, minute: int = 0, success: bool = True, user: str = "ayse") -> LogEvent:
    return LogEvent(
        time=datetime(2026, 10, 30, hour, minute, 0),
        success=success,
        user=user,
        ip="192.168.1.99",
    )


def test_night_login_raises_alert():
    alerts = detect_off_hours_login([login(3, 12)])

    assert len(alerts) == 1
    assert alerts[0].user == "ayse"
    assert alerts[0].ip == "192.168.1.99"
    assert alerts[0].mitre == "T1078"
    assert alerts[0].severity == Severity.MEDIUM


def test_business_hours_login_does_not_alert():
    assert detect_off_hours_login([login(9), login(14, 30), login(19, 59)]) == []


def test_boundaries():
    # 07:00 mesai başlangıcı (alarm yok), 20:00 mesai bitişi (alarm var), 06:59 (alarm var)
    alerts = detect_off_hours_login([login(7), login(20), login(6, 59)])

    assert [a.first_seen.strftime("%H:%M") for a in alerts] == ["06:59", "20:00"]


def test_failed_night_logins_are_ignored():
    # Başarısız denemeler bu kuralın konusu değil
    assert detect_off_hours_login([login(3, success=False)]) == []


def test_custom_work_hours():
    # Vardiyalı çalışan bir ortamda 22:00 normal olabilir
    events = [login(22)]

    assert detect_off_hours_login(events, work_start_hour=14, work_end_hour=23) == []
