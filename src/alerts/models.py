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
class GeoLocation:
    country: str
    city: str
    lat: float
    lon: float
    internal: bool = False  # True: kurum içi ağ adresi
    simulated: bool = False  # True: gerçek GeoIP verisi değil, demo için atanmış konum
    country_code: str | None = None  # ISO 3166-1 alpha-3, ör. "TUR" (haritada ülkeyi boyamak için)


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
    geo: GeoLocation | None = None  # zenginleştirme aşamasında doldurulur
