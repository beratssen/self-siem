"""Brute-force tespiti (MITRE ATT&CK T1110).

Mantık: Aynı IP, aynı hesaba kısa sürede çok sayıda başarısız giriş yapıyorsa
şifre tahmini yapılıyordur. Kayan zaman penceresi kullanılır.
"""

from collections import defaultdict
from datetime import datetime, timedelta
from typing import Iterable

from src.alerts import Alert, Severity
from src.parser import LogEvent

RULE_NAME = "ssh_brute_force"
MITRE_ID = "T1110"


def detect_brute_force(
    events: Iterable[LogEvent],
    threshold: int = 10,
    window: timedelta = timedelta(minutes=5),
) -> list[Alert]:
    """Pencere içinde `threshold` değerinden fazla başarısız giriş varsa alarm üretir."""
    # (ip, kullanıcı) çiftine göre başarısız deneme zamanlarını topla
    failures: dict[tuple[str, str], list[datetime]] = defaultdict(list)
    for e in events:
        if not e.success:
            failures[(e.ip, e.user)].append(e.time)

    alerts: list[Alert] = []
    for (ip, user), times in failures.items():
        times.sort()
        left = 0
        burst: tuple[int, int] | None = None  # alarm veren [başlangıç, bitiş] indeksi

        for right in range(len(times)):
            # Pencere 5 dakikadan genişse sol ucu ilerlet
            while times[right] - times[left] > window:
                left += 1

            if right - left + 1 > threshold:
                # Eşik aşıldı: yeni dalga başlat ya da süren dalgayı uzat
                burst = (left, right) if burst is None else (burst[0], right)
            elif burst is not None:
                alerts.append(_make_alert(ip, user, times, burst))
                burst = None

        if burst is not None:
            alerts.append(_make_alert(ip, user, times, burst))

    return sorted(alerts, key=lambda a: a.first_seen)


def _make_alert(ip: str, user: str, times: list[datetime], burst: tuple[int, int]) -> Alert:
    start, end = burst
    count = end - start + 1
    return Alert(
        rule=RULE_NAME,
        mitre=MITRE_ID,
        severity=Severity.HIGH,
        ip=ip,
        user=user,
        count=count,
        first_seen=times[start],
        last_seen=times[end],
        description=f"{ip} adresi '{user}' hesabına {count} başarısız giriş denedi",
    )
