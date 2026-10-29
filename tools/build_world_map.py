"""Natural Earth ülke sınırlarından dashboard için küçük bir dünya haritası verisi üretir.

Kaynak (kamu malı, public domain):
    https://github.com/nvkelso/natural-earth-vector
    geojson/ne_110m_admin_0_countries.geojson

Kullanım:
    python tools/build_world_map.py <indirilen.geojson>

Çıktı: dashboard/world.js (window.SIEM_WORLD). Orijinal dosyada her ülke için 168
alan (nüfus, GSYİH, onlarca dilde ad...) var; burada sadece ülke kodu, adı ve
yuvarlanmış koordinatlar tutulur. Dosya veri olarak okunur, hiçbir içeriği çalıştırılmaz.
"""

import argparse
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXCLUDE = {"ATA"}  # Antarktika: saldırı haritasında çok yer kaplar, bilgi taşımaz
PRECISION = 2  # 1:110m ölçek için 0.01 derece fazlasıyla yeterli


def clean_ring(ring: list) -> list[list[float]]:
    """Koordinatları doğrular, yuvarlar ve yuvarlama sonrası tekrar eden noktaları atar."""
    out: list[list[float]] = []
    for point in ring:
        lon, lat = float(point[0]), float(point[1])
        if not (math.isfinite(lon) and math.isfinite(lat) and -180 <= lon <= 180 and -90 <= lat <= 90):
            raise ValueError(f"Geçersiz koordinat: {point}")
        rounded = [round(lon, PRECISION), round(lat, PRECISION)]
        if not out or out[-1] != rounded:
            out.append(rounded)
    return out


def polygons(geometry: dict) -> list:
    if geometry["type"] == "Polygon":
        polys = [geometry["coordinates"]]
    elif geometry["type"] == "MultiPolygon":
        polys = geometry["coordinates"]
    else:
        raise ValueError(f"Beklenmeyen geometri türü: {geometry['type']}")

    result = []
    for poly in polys:
        rings = [r for r in (clean_ring(ring) for ring in poly) if len(r) >= 4]
        if rings:
            result.append(rings)
    return result


def build(source: Path) -> list[dict]:
    data = json.loads(source.read_text(encoding="utf-8"))
    if data.get("type") != "FeatureCollection":
        raise ValueError("GeoJSON FeatureCollection bekleniyordu")

    countries = []
    for feature in data["features"]:
        props = feature["properties"]
        code = str(props["ADM0_A3"])
        if code in EXCLUDE:
            continue
        countries.append({"id": code, "name": str(props["NAME"]), "polygons": polygons(feature["geometry"])})
    return countries


def main() -> None:
    parser = argparse.ArgumentParser(description="Natural Earth GeoJSON -> dashboard/world.js")
    parser.add_argument("source", type=Path, help="ne_110m_admin_0_countries.geojson dosyası")
    parser.add_argument("--out", type=Path, default=ROOT / "dashboard" / "world.js")
    args = parser.parse_args()

    countries = build(args.source)
    # ensure_ascii: tüm ASCII dışı karakterler \uXXXX olarak kaçırılır
    body = json.dumps(countries, separators=(",", ":"), ensure_ascii=True)
    args.out.write_text(
        "// Natural Earth 1:110m ülke sınırları (kamu malı). tools/build_world_map.py ile üretildi.\n"
        f"window.SIEM_WORLD = {body};\n",
        encoding="utf-8",
    )
    points = sum(len(r) for c in countries for p in c["polygons"] for r in p)
    print(f"{len(countries)} ülke, {points} nokta, {args.out.stat().st_size:,} bayt -> {args.out}")


if __name__ == "__main__":
    main()
