"""Sahte SSH giriş logu üretir.

Bu script hiçbir ağ bağlantısı kurmaz ve gerçek bir sisteme dokunmaz.
Sadece data/auth.log dosyasına metin satırları yazar. Amaç, tespit
kurallarımızı güvenle test edebileceğimiz tekrarlanabilir bir veri üretmek.

Kullanım:
    python tools/generate_logs.py
"""

import random
from datetime import datetime, timedelta
from pathlib import Path

# Aynı seed ile her çalıştırmada aynı log üretilir (testler için önemli).
random.seed(42)

# 203.0.113.x ve 198.51.100.x aralıkları "dokümantasyon için ayrılmış"
# IP'lerdir, gerçek hiçbir sunucuya ait değildir.
ATTACKER_BRUTE = "203.0.113.5"
ATTACKER_SPRAY = "198.51.100.23"
ATTACKER_TAKEOVER = "203.0.113.77"

NORMAL_USERS = ["can", "ayse", "mehmet", "zeynep", "admin"]
INTERNAL_IPS = ["192.168.1.10", "192.168.1.11", "192.168.1.12", "192.168.1.20"]
SPRAY_TARGETS = NORMAL_USERS + ["root", "test", "guest", "oracle", "ubuntu"]

START = datetime(2026, 10, 30, 8, 0, 0)

# Her olay (zaman, satır) çifti olarak tutulur, sonda zamana göre sıralanır.
events: list[tuple[datetime, str]] = []


def add(time: datetime, message: str) -> None:
    events.append((time, f"{time:%Y-%m-%d %H:%M:%S} sshd {message}"))


def failed(time: datetime, user: str, ip: str) -> None:
    add(time, f"Failed password for {user} from {ip}")


def accepted(time: datetime, user: str, ip: str) -> None:
    add(time, f"Accepted password for {user} from {ip}")


# --- 1) Normal trafik: gün boyu rastgele başarılı girişler, ara sıra typo ---
for _ in range(120):
    t = START + timedelta(seconds=random.randint(0, 9 * 3600))
    user = random.choice(NORMAL_USERS)
    ip = random.choice(INTERNAL_IPS)
    if random.random() < 0.08:  # %8 ihtimalle kullanıcı şifreyi yanlış yazar
        failed(t, user, ip)
    accepted(t + timedelta(seconds=random.randint(3, 15)), user, ip)

# --- 2) Brute-force: tek IP, tek hesap (root), 2 dakikada 45 deneme ---
t = START + timedelta(hours=2, minutes=14)
for i in range(45):
    failed(t + timedelta(seconds=i * 2 + random.randint(0, 1)), "root", ATTACKER_BRUTE)

# --- 3) Password spraying: tek IP, çok hesap, her hesaba az deneme ---
t = START + timedelta(hours=4, minutes=30)
for i, user in enumerate(SPRAY_TARGETS * 2):
    failed(t + timedelta(seconds=i * 20), user, ATTACKER_SPRAY)

# --- 4) Hesap ele geçirme: çok başarısızlık, ardından başarılı giriş ---
t = START + timedelta(hours=6)
for i in range(30):
    failed(t + timedelta(seconds=i * 3), "admin", ATTACKER_TAKEOVER)
accepted(t + timedelta(seconds=30 * 3 + 5), "admin", ATTACKER_TAKEOVER)

# --- 5) Şüpheli saatte giriş: gece 03:12'de başarılı giriş ---
night = datetime(2026, 10, 31, 3, 12, 0)
accepted(night, "ayse", "192.168.1.99")


def main() -> None:
    events.sort(key=lambda e: e[0])
    out_path = Path(__file__).resolve().parent.parent / "data" / "auth.log"
    out_path.parent.mkdir(exist_ok=True)
    out_path.write_text("\n".join(line for _, line in events) + "\n", encoding="utf-8")
    print(f"{len(events)} satır yazıldı: {out_path}")


if __name__ == "__main__":
    main()
