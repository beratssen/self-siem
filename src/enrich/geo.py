"""IP adreslerine konum bilgisi ekler (alarm zenginleştirme).

Demo loglarındaki IP'ler (203.0.113.x, 198.51.100.x) dokümantasyon için ayrılmış
aralıklardır ve gerçekte bir yerde değildir; bu yüzden gerçek bir GeoIP
veritabanı onlara konum veremez. SimulatedGeoProvider bu IP'lere demo amaçlı,
AÇIKÇA "simulated" olarak işaretlenmiş konumlar atar.

Gerçek loglarla çalışırken aynı GeoProvider arayüzünü uygulayan bir sınıf
(ör. MaxMind GeoLite2 okuyucusu) yazıp SimulatedGeoProvider yerine verilir.
"""

import ipaddress
from dataclasses import replace
from typing import Iterable, Protocol

from src.alerts import Alert, GeoLocation


class GeoProvider(Protocol):
    def lookup(self, ip: str) -> GeoLocation | None: ...


# Kurum içi ağın (ofis) konumu; iç ağ adresleri hep buraya eşlenir.
OFFICE = GeoLocation("Türkiye", "İstanbul", 41.0082, 28.9784, internal=True)

# Kurum içi sayılan aralıklar (RFC 1918 + loopback). ipaddress.is_private KULLANMIYORUZ:
# o, 203.0.113.x gibi dokümantasyon aralıklarını da "özel" sayar.
INTERNAL_NETWORKS = [
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("127.0.0.0/8"),
]

# Demo saldırgan IP'leri -> simüle edilmiş konumlar
DEMO_LOCATIONS: dict[str, GeoLocation] = {
    "203.0.113.5": GeoLocation("Hollanda", "Amsterdam", 52.3676, 4.9041, simulated=True),
    "198.51.100.23": GeoLocation("Singapur", "Singapur", 1.3521, 103.8198, simulated=True),
    "203.0.113.77": GeoLocation("Brezilya", "São Paulo", -23.5505, -46.6333, simulated=True),
}


class SimulatedGeoProvider:
    """Demo verisi için sabit bir tablodan konum döndürür. Ağ erişimi kullanmaz."""

    def __init__(self, table: dict[str, GeoLocation] | None = None) -> None:
        self.table = DEMO_LOCATIONS if table is None else table

    def lookup(self, ip: str) -> GeoLocation | None:
        try:
            address = ipaddress.ip_address(ip)
        except ValueError:
            return None
        if any(address in network for network in INTERNAL_NETWORKS):
            return OFFICE
        return self.table.get(ip)


def enrich_alerts(alerts: Iterable[Alert], provider: GeoProvider) -> list[Alert]:
    """Her alarmın IP'si için konum arar, bulursa alarmın kopyasına ekler."""
    return [replace(alert, geo=provider.lookup(alert.ip)) for alert in alerts]
