"""Hesap ele geçirme tespiti (MITRE ATT&CK T1110 + T1078).

Mantık: Aynı IP, aynı hesaba çok sayıda başarısız giriş denedikten hemen sonra
başarılı giriş yaptıysa şifre büyük ihtimalle kırılmıştır. Brute-force kuralı
"denendi" der, bu kural "işe yaradı" der; bu yüzden önem derecesi CRITICAL'dır.
"""

from bisect import bisect_left
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Iterable

from src.alerts import Alert, Severity
from src.parser import LogEvent

RULE_NAME = "ssh_account_takeover"
MITRE_ID = "T1110, T1078"


def detect_account_takeover(
    events: Iterable[LogEvent],
    threshold: int = 10,
    window: timedelta = timedelta(minutes=5),
) -> list[Alert]:
    """Başarılı girişten önceki `window` içinde `threshold`'dan fazla başarısızlık varsa alarm üretir."""
    failures: dict[tuple[str, str], list[datetime]] = defaultdict(list)
    successes: dict[tuple[str, str], list[datetime]] = defaultdict(list)
    for e in events:
        target = successes if e.success else failures
        target[(e.ip, e.user)].append(e.time)

    alerts: list[Alert] = []
    for (ip, user), success_times in successes.items():
        fail_times = sorted(failures.get((ip, user), []))
        for t in sorted(success_times):
            # Başarılı girişten önceki pencerede kaç başarısız deneme var?
            start = bisect_left(fail_times, t - window)
            end = bisect_left(fail_times, t)
            count = end - start
            if count > threshold:
                alerts.append(
                    Alert(
                        rule=RULE_NAME,
                        mitre=MITRE_ID,
                        severity=Severity.CRITICAL,
                        ip=ip,
                        user=user,
                        count=count,
                        first_seen=fail_times[start],
                        last_seen=t,
                        description=(
                            f"{ip} adresi '{user}' hesabına {count} başarısız denemeden "
                            f"sonra başarıyla giriş yaptı, hesap ele geçirilmiş olabilir"
                        ),
                    )
                )

    return sorted(alerts, key=lambda a: a.first_seen)
