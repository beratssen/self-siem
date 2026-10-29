from datetime import datetime, timedelta

from src.alerts import Severity
from src.parser import LogEvent
from src.rules import detect_account_takeover

BASE = datetime(2026, 10, 30, 10, 0, 0)


def attempts(ip: str, user: str, count: int, success: bool, start: datetime = BASE, step: int = 2):
    return [
        LogEvent(time=start + timedelta(seconds=i * step), success=success, user=user, ip=ip)
        for i in range(count)
    ]


def login_after(events: list[LogEvent], ip: str, user: str, gap_seconds: int = 5) -> LogEvent:
    return LogEvent(
        time=events[-1].time + timedelta(seconds=gap_seconds), success=True, user=user, ip=ip
    )


def test_success_after_many_failures_is_critical():
    fails = attempts("203.0.113.77", "admin", 30, success=False)
    events = fails + [login_after(fails, "203.0.113.77", "admin")]

    alerts = detect_account_takeover(events)

    assert len(alerts) == 1
    assert alerts[0].severity == Severity.CRITICAL
    assert alerts[0].ip == "203.0.113.77"
    assert alerts[0].user == "admin"
    assert alerts[0].count == 30


def test_normal_typo_then_success_does_not_alert():
    fails = attempts("192.168.1.10", "ayse", 2, success=False)
    events = fails + [login_after(fails, "192.168.1.10", "ayse")]

    assert detect_account_takeover(events) == []


def test_many_failures_without_success_does_not_alert():
    # Başarılı giriş yoksa bu kural değil, brute-force kuralı devreye girer
    events = attempts("203.0.113.5", "root", 45, success=False)

    assert detect_account_takeover(events) == []


def test_success_from_different_ip_does_not_alert():
    fails = attempts("203.0.113.5", "root", 30, success=False)
    events = fails + [login_after(fails, "192.168.1.10", "root")]

    assert detect_account_takeover(events) == []


def test_success_long_after_failures_does_not_alert():
    fails = attempts("203.0.113.5", "root", 30, success=False)
    events = fails + [login_after(fails, "203.0.113.5", "root", gap_seconds=3600)]

    assert detect_account_takeover(events) == []
