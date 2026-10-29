"""SSH giriş loglarını düzenli alanlara ayıran parser.

Ham satır (düz metin):
    2026-10-30 08:38:46 sshd Failed password for berat from 192.168.1.11

Ayrıştırılmış hali (kurallarımızın kullanacağı veri):
    LogEvent(time=datetime(...), success=False, user="berat", ip="192.168.1.11")
"""

import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterator

# (?P<isim>...) bir parçayı isimle yakalar. \S+ "boşluk olmayan karakterler" demek.
LINE_PATTERN = re.compile(
    r"^(?P<time>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) "
    r"sshd "
    r"(?P<result>Failed|Accepted) password for "
    r"(?P<user>\S+) from "
    r"(?P<ip>\d{1,3}(?:\.\d{1,3}){3})$"
)

TIME_FORMAT = "%Y-%m-%d %H:%M:%S"


@dataclass(frozen=True)
class LogEvent:
    """Tek bir giriş denemesi."""

    time: datetime
    success: bool
    user: str
    ip: str


def parse_line(line: str) -> LogEvent | None:
    """Bir log satırını LogEvent'e çevirir. Tanımadığı satır için None döner."""
    match = LINE_PATTERN.match(line.strip())
    if match is None:
        return None
    return LogEvent(
        time=datetime.strptime(match["time"], TIME_FORMAT),
        success=match["result"] == "Accepted",
        user=match["user"],
        ip=match["ip"],
    )


def parse_file(path: str | Path) -> Iterator[LogEvent]:
    """Dosyadaki tüm satırları okur, tanınanları sırayla verir."""
    with open(path, encoding="utf-8") as f:
        for line in f:
            event = parse_line(line)
            if event is not None:
                yield event
