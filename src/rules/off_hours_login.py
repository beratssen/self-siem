"""Mesai dışı başarılı giriş tespiti (MITRE ATT&CK T1078 - Valid Accounts).

Mantık: Çalışanlar genelde mesai saatlerinde giriş yapar. Gece yarısı yapılan
başarılı bir giriş, çalınmış bir hesabın kullanıldığının işareti olabilir.
Tek başına kesin kanıt değildir, bu yüzden önem derecesi orta seviyededir.
"""

from typing import Iterable

from src.alerts import Alert, Severity
from src.parser import LogEvent

RULE_NAME = "ssh_off_hours_login"
MITRE_ID = "T1078"


def detect_off_hours_login(
    events: Iterable[LogEvent],
    work_start_hour: int = 7,
    work_end_hour: int = 20,
) -> list[Alert]:
    """`work_start_hour` ile `work_end_hour` (hariç) arası dışındaki başarılı girişlere alarm üretir."""
    alerts: list[Alert] = []
    for e in events:
        if not e.success:
            continue
        if work_start_hour <= e.time.hour < work_end_hour:
            continue
        alerts.append(
            Alert(
                rule=RULE_NAME,
                mitre=MITRE_ID,
                severity=Severity.MEDIUM,
                ip=e.ip,
                user=e.user,
                count=1,
                first_seen=e.time,
                last_seen=e.time,
                description=(
                    f"'{e.user}' hesabı mesai dışında ({e.time:%H:%M}) "
                    f"{e.ip} adresinden giriş yaptı"
                ),
            )
        )
    return sorted(alerts, key=lambda a: a.first_seen)
