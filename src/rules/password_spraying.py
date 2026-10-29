"""Password spraying tespiti (MITRE ATT&CK T1110.003).

Mantık: Brute-force tek hesaba çok şifre dener. Spraying ise hesap kilitlenmesin
diye çok sayıda farklı hesaba birkaç deneme yapar. Bu yüzden burada deneme
sayısını değil, aynı IP'nin kaç FARKLI hesabı hedeflediğini sayarız.
"""

from collections import Counter, defaultdict
from datetime import timedelta
from typing import Iterable

from src.alerts import Alert, Severity
from src.parser import LogEvent

RULE_NAME = "ssh_password_spraying"
MITRE_ID = "T1110.003"


def detect_password_spraying(
    events: Iterable[LogEvent],
    threshold: int = 5,
    window: timedelta = timedelta(minutes=10),
) -> list[Alert]:
    """Pencere içinde bir IP `threshold`'dan fazla farklı hesabı hedeflediyse alarm üretir."""
    by_ip: dict[str, list[LogEvent]] = defaultdict(list)
    for e in events:
        if not e.success:
            by_ip[e.ip].append(e)

    alerts: list[Alert] = []
    for ip, ip_events in by_ip.items():
        ip_events.sort(key=lambda e: e.time)
        left = 0
        users_in_window: Counter[str] = Counter()  # penceredeki hesap -> deneme sayısı
        burst: tuple[int, int] | None = None
        peak = 0  # dalga boyunca görülen en yüksek farklı hesap sayısı

        for right, event in enumerate(ip_events):
            users_in_window[event.user] += 1
            # Pencere genişse sol uçtaki olayları çıkar
            while event.time - ip_events[left].time > window:
                old = ip_events[left].user
                users_in_window[old] -= 1
                if users_in_window[old] == 0:
                    del users_in_window[old]
                left += 1

            distinct = len(users_in_window)
            if distinct > threshold:
                burst = (left, right) if burst is None else (burst[0], right)
                peak = max(peak, distinct)
            elif burst is not None:
                alerts.append(_make_alert(ip, ip_events, burst, peak))
                burst, peak = None, 0

        if burst is not None:
            alerts.append(_make_alert(ip, ip_events, burst, peak))

    return sorted(alerts, key=lambda a: a.first_seen)


def _make_alert(ip: str, ip_events: list[LogEvent], burst: tuple[int, int], peak: int) -> Alert:
    start, end = burst
    return Alert(
        rule=RULE_NAME,
        mitre=MITRE_ID,
        severity=Severity.MEDIUM,
        ip=ip,
        user=None,  # birden fazla hesap hedeflendi
        count=peak,
        first_seen=ip_events[start].time,
        last_seen=ip_events[end].time,
        description=f"{ip} adresi kısa sürede {peak} farklı hesaba başarısız giriş denedi",
    )
