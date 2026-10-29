from datetime import datetime, timedelta

from src.parser import LogEvent
from src.rules import detect_brute_force

BASE = datetime(2026, 10, 30, 10, 0, 0)


def failures(ip: str, user: str, count: int, step_seconds: int = 2, start: datetime = BASE):
    """Test için `count` adet başarısız giriş olayı üretir."""
    return [
        LogEvent(time=start + timedelta(seconds=i * step_seconds), success=False, user=user, ip=ip)
        for i in range(count)
    ]


def test_many_failures_on_one_account_raise_single_alert():
    events = failures("203.0.113.5", "root", 45)

    alerts = detect_brute_force(events)

    assert len(alerts) == 1
    assert alerts[0].ip == "203.0.113.5"
    assert alerts[0].user == "root"
    assert alerts[0].count == 45
    assert alerts[0].mitre == "T1110"


def test_few_failures_do_not_raise_alert():
    # Normal kullanıcı birkaç kez şifreyi yanlış yazabilir
    events = failures("192.168.1.10", "ayse", 3)

    assert detect_brute_force(events) == []


def test_exactly_threshold_does_not_raise_alert():
    # Eşik "10'dan fazla" demek; tam 10 deneme alarm vermemeli
    events = failures("203.0.113.5", "root", 10)

    assert detect_brute_force(events) == []


def test_spraying_across_accounts_is_not_brute_force():
    # Aynı IP, 12 farklı hesaba 1'er deneme: bu password spraying'dir
    events = []
    for i in range(12):
        events += failures("198.51.100.23", f"user{i}", 1, start=BASE + timedelta(seconds=i * 20))

    assert detect_brute_force(events) == []


def test_slow_attempts_outside_window_do_not_raise_alert():
    # 15 deneme ama aralarında 1 saat var, hiçbir 5 dakikalık pencerede 10'u aşmaz
    events = failures("203.0.113.9", "root", 15, step_seconds=3600)

    assert detect_brute_force(events) == []


def test_successful_logins_are_ignored():
    events = [
        LogEvent(time=BASE + timedelta(seconds=i), success=True, user="can", ip="192.168.1.10")
        for i in range(50)
    ]

    assert detect_brute_force(events) == []


def test_two_separate_attacks_raise_two_alerts():
    events = failures("203.0.113.5", "root", 20) + failures(
        "203.0.113.5", "root", 20, start=BASE + timedelta(hours=3)
    )

    alerts = detect_brute_force(events)

    assert len(alerts) == 2
