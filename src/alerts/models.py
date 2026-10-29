"""Tespit kurallarının ürettiği alarm veri yapısı."""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass(frozen=True)
class Alert:
    rule: str  # kuralın adı, ör. "ssh_brute_force"
    mitre: str  # MITRE ATT&CK kodu, ör. "T1110"
    severity: Severity
    ip: str
    user: str | None  # hedef hesap; birden fazlaysa None
    count: int  # alarmı oluşturan olay sayısı
    first_seen: datetime
    last_seen: datetime
    description: str
