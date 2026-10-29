from datetime import datetime

from src.alerts import Alert, GeoLocation, Severity, alert_to_dict
from src.enrich import SimulatedGeoProvider, enrich_alerts


def make_alert(ip: str) -> Alert:
    now = datetime(2026, 10, 30, 10, 0, 0)
    return Alert(
        rule="r", mitre="T1110", severity=Severity.HIGH, ip=ip, user="root",
        count=1, first_seen=now, last_seen=now, description="d",
    )


def test_demo_attacker_ip_gets_simulated_location():
    geo = SimulatedGeoProvider().lookup("203.0.113.5")

    assert geo is not None
    assert geo.city == "Amsterdam"
    assert geo.country_code == "NLD"
    assert geo.simulated is True
    assert geo.internal is False


def test_private_ip_is_internal_office():
    geo = SimulatedGeoProvider().lookup("192.168.1.99")

    assert geo is not None
    assert geo.internal is True
    assert geo.city == "İstanbul"


def test_unknown_public_ip_returns_none():
    assert SimulatedGeoProvider().lookup("8.8.8.8") is None


def test_invalid_ip_returns_none():
    assert SimulatedGeoProvider().lookup("bu-bir-ip-degil") is None


def test_enrich_adds_geo_without_mutating_original():
    original = make_alert("203.0.113.5")

    enriched = enrich_alerts([original], SimulatedGeoProvider())

    assert original.geo is None
    assert enriched[0].geo is not None
    assert enriched[0].geo.country == "Hollanda"


def test_custom_provider_can_be_plugged_in():
    class FixedProvider:
        def lookup(self, ip: str) -> GeoLocation | None:
            return GeoLocation("Almanya", "Berlin", 52.52, 13.405)

    enriched = enrich_alerts([make_alert("1.2.3.4")], FixedProvider())

    assert enriched[0].geo.city == "Berlin"


def test_geo_is_serialized_in_alert_dict():
    enriched = enrich_alerts([make_alert("203.0.113.5")], SimulatedGeoProvider())

    data = alert_to_dict(enriched[0])

    assert data["geo"]["city"] == "Amsterdam"
    assert data["geo"]["simulated"] is True
    assert data["geo"]["lat"] == 52.3676
