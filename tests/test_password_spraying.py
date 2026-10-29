from datetime import datetime, timedelta

from src.alerts import Severity
from src.parser import LogEvent
from src.rules import detect_password_spraying

BASE = datetime(2026, 10, 30, 10, 0, 0)


def spray(ip: str, users: list[str], step: int = 20, start: datetime = BASE):
    """Her hesaba sırayla birer başarısız deneme üretir."""
    return [
        LogEvent(time=start + timedelta(seconds=i * step), success=False, user=u, ip=ip)
        for i, u in enumerate(users)
    ]


def test_many_distinct_accounts_raise_single_alert():
    users = [f"user{i}" for i in range(10)]

    alerts = detect_password_spraying(spray("198.51.100.23", users))

    assert len(alerts) == 1
    assert alerts[0].ip == "198.51.100.23"
    assert alerts[0].user is None
    assert alerts[0].count == 10
    assert alerts[0].mitre == "T1110.003"
    assert alerts[0].severity == Severity.MEDIUM


def test_repeating_attempts_on_same_accounts_still_count_distinct_users():
    # 2 tur boyunca 10 hesap: farklı hesap sayısı 10'dur, 20 değil
    users = [f"user{i}" for i in range(10)] * 2

    alerts = detect_password_spraying(spray("198.51.100.23", users))

    assert len(alerts) == 1
    assert alerts[0].count == 10


def test_few_distinct_accounts_do_not_alert():
    # Ofis ağında birkaç kişinin typo yapması normal
    users = ["can", "ayse", "mehmet"]

    assert detect_password_spraying(spray("192.168.1.10", users)) == []


def test_exactly_threshold_does_not_alert():
    users = [f"user{i}" for i in range(5)]

    assert detect_password_spraying(spray("198.51.100.23", users)) == []


def test_single_account_hammered_is_not_spraying():
    # Tek hesaba 50 deneme brute-force'tur, spraying değil
    users = ["root"] * 50

    assert detect_password_spraying(spray("203.0.113.5", users, step=2)) == []


def test_slow_spraying_outside_window_does_not_alert():
    # Her 30 dakikada bir hesap: hiçbir 10 dakikalık pencerede 5'ten fazla hesap yok
    users = [f"user{i}" for i in range(10)]

    assert detect_password_spraying(spray("198.51.100.23", users, step=1800)) == []


def test_successful_logins_are_ignored():
    events = [
        LogEvent(time=BASE + timedelta(seconds=i), success=True, user=f"user{i}", ip="192.168.1.10")
        for i in range(20)
    ]

    assert detect_password_spraying(events) == []
