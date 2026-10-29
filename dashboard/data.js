// self-siem tarafından otomatik üretildi, elle düzenlemeyin.
window.SIEM_DATA = {
  "generated_at": "2026-10-30T02:27:46",
  "source": "auth.log",
  "alerts": [
    {
      "rule": "ssh_account_takeover",
      "mitre": "T1110, T1078",
      "severity": "critical",
      "ip": "203.0.113.77",
      "user": "admin",
      "count": 30,
      "first_seen": "2026-10-30T14:00:00",
      "last_seen": "2026-10-30T14:01:35",
      "description": "203.0.113.77 adresi 'admin' hesabına 30 başarısız denemeden sonra başarıyla giriş yaptı, hesap ele geçirilmiş olabilir",
      "geo": {
        "country": "Brezilya",
        "city": "São Paulo",
        "lat": -23.5505,
        "lon": -46.6333,
        "internal": false,
        "simulated": true
      }
    },
    {
      "rule": "ssh_brute_force",
      "mitre": "T1110",
      "severity": "high",
      "ip": "203.0.113.5",
      "user": "root",
      "count": 45,
      "first_seen": "2026-10-30T10:14:00",
      "last_seen": "2026-10-30T10:15:28",
      "description": "203.0.113.5 adresi 'root' hesabına 45 başarısız giriş denedi",
      "geo": {
        "country": "Hollanda",
        "city": "Amsterdam",
        "lat": 52.3676,
        "lon": 4.9041,
        "internal": false,
        "simulated": true
      }
    },
    {
      "rule": "ssh_brute_force",
      "mitre": "T1110",
      "severity": "high",
      "ip": "203.0.113.77",
      "user": "admin",
      "count": 30,
      "first_seen": "2026-10-30T14:00:00",
      "last_seen": "2026-10-30T14:01:27",
      "description": "203.0.113.77 adresi 'admin' hesabına 30 başarısız giriş denedi",
      "geo": {
        "country": "Brezilya",
        "city": "São Paulo",
        "lat": -23.5505,
        "lon": -46.6333,
        "internal": false,
        "simulated": true
      }
    },
    {
      "rule": "ssh_password_spraying",
      "mitre": "T1110.003",
      "severity": "medium",
      "ip": "198.51.100.23",
      "user": null,
      "count": 10,
      "first_seen": "2026-10-30T12:30:00",
      "last_seen": "2026-10-30T12:36:20",
      "description": "198.51.100.23 adresi kısa sürede 10 farklı hesaba başarısız giriş denedi",
      "geo": {
        "country": "Singapur",
        "city": "Singapur",
        "lat": 1.3521,
        "lon": 103.8198,
        "internal": false,
        "simulated": true
      }
    },
    {
      "rule": "ssh_off_hours_login",
      "mitre": "T1078",
      "severity": "medium",
      "ip": "192.168.1.99",
      "user": "ayse",
      "count": 1,
      "first_seen": "2026-10-31T03:12:00",
      "last_seen": "2026-10-31T03:12:00",
      "description": "'ayse' hesabı mesai dışında (03:12) 192.168.1.99 adresinden giriş yaptı",
      "geo": {
        "country": "Türkiye",
        "city": "İstanbul",
        "lat": 41.0082,
        "lon": 28.9784,
        "internal": true,
        "simulated": false
      }
    }
  ],
  "events": [
    {
      "time": "2026-10-30T08:10:53",
      "success": true,
      "user": "can",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T08:13:32",
      "success": true,
      "user": "can",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T08:27:34",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T08:29:43",
      "success": true,
      "user": "can",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T08:38:46",
      "success": false,
      "user": "can",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T08:38:49",
      "success": true,
      "user": "can",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T08:47:28",
      "success": false,
      "user": "admin",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T08:47:32",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T08:50:24",
      "success": false,
      "user": "zeynep",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T08:50:32",
      "success": true,
      "user": "zeynep",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T08:53:43",
      "success": true,
      "user": "can",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T08:54:41",
      "success": true,
      "user": "can",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T08:55:57",
      "success": true,
      "user": "can",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T08:59:08",
      "success": true,
      "user": "zeynep",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T09:03:23",
      "success": true,
      "user": "zeynep",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T09:06:05",
      "success": false,
      "user": "ayse",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T09:06:08",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T09:08:23",
      "success": true,
      "user": "zeynep",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T09:20:41",
      "success": true,
      "user": "can",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T09:23:37",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T09:26:02",
      "success": true,
      "user": "can",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T09:26:36",
      "success": true,
      "user": "zeynep",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T09:28:23",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T09:36:03",
      "success": false,
      "user": "admin",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T09:36:09",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T09:37:31",
      "success": false,
      "user": "admin",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T09:37:43",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T09:38:11",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T09:49:14",
      "success": true,
      "user": "zeynep",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T09:55:08",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T09:56:47",
      "success": true,
      "user": "zeynep",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T09:58:56",
      "success": true,
      "user": "can",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T09:59:38",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T10:02:05",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T10:08:21",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T10:14:00",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:03",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:05",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:06",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:09",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:11",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:13",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:15",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:16",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:19",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:20",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:23",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:25",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:27",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:28",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:31",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:33",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:35",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:36",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T10:14:36",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:39",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:40",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:42",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:45",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:46",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:48",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:51",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:52",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:55",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:56",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:14:58",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:15:01",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:15:03",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:15:05",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:15:06",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:15:08",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T10:15:09",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:15:11",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:15:13",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:15:15",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:15:17",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:15:19",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:15:21",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:15:22",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:15:25",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:15:26",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:15:28",
      "success": false,
      "user": "root",
      "ip": "203.0.113.5"
    },
    {
      "time": "2026-10-30T10:16:36",
      "success": true,
      "user": "can",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T10:23:54",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T10:31:53",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T10:32:03",
      "success": true,
      "user": "can",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T10:32:37",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T10:35:52",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T10:43:34",
      "success": true,
      "user": "can",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T10:45:23",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T10:48:08",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T10:52:16",
      "success": false,
      "user": "zeynep",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T10:52:28",
      "success": true,
      "user": "zeynep",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T10:54:42",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T11:00:48",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T11:00:58",
      "success": true,
      "user": "can",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T11:19:14",
      "success": true,
      "user": "can",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T11:28:35",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T11:29:11",
      "success": false,
      "user": "ayse",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T11:29:20",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T11:37:51",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T11:39:58",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T11:41:52",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T11:51:14",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T11:54:56",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T11:55:38",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T11:57:30",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T11:58:12",
      "success": true,
      "user": "can",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T12:00:21",
      "success": true,
      "user": "can",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T12:03:46",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T12:05:10",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T12:08:43",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T12:30:00",
      "success": false,
      "user": "can",
      "ip": "198.51.100.23"
    },
    {
      "time": "2026-10-30T12:30:20",
      "success": false,
      "user": "ayse",
      "ip": "198.51.100.23"
    },
    {
      "time": "2026-10-30T12:30:40",
      "success": false,
      "user": "mehmet",
      "ip": "198.51.100.23"
    },
    {
      "time": "2026-10-30T12:31:00",
      "success": false,
      "user": "zeynep",
      "ip": "198.51.100.23"
    },
    {
      "time": "2026-10-30T12:31:20",
      "success": false,
      "user": "admin",
      "ip": "198.51.100.23"
    },
    {
      "time": "2026-10-30T12:31:40",
      "success": false,
      "user": "root",
      "ip": "198.51.100.23"
    },
    {
      "time": "2026-10-30T12:32:00",
      "success": false,
      "user": "test",
      "ip": "198.51.100.23"
    },
    {
      "time": "2026-10-30T12:32:20",
      "success": false,
      "user": "guest",
      "ip": "198.51.100.23"
    },
    {
      "time": "2026-10-30T12:32:40",
      "success": false,
      "user": "oracle",
      "ip": "198.51.100.23"
    },
    {
      "time": "2026-10-30T12:33:00",
      "success": false,
      "user": "ubuntu",
      "ip": "198.51.100.23"
    },
    {
      "time": "2026-10-30T12:33:20",
      "success": false,
      "user": "can",
      "ip": "198.51.100.23"
    },
    {
      "time": "2026-10-30T12:33:40",
      "success": false,
      "user": "ayse",
      "ip": "198.51.100.23"
    },
    {
      "time": "2026-10-30T12:34:00",
      "success": false,
      "user": "mehmet",
      "ip": "198.51.100.23"
    },
    {
      "time": "2026-10-30T12:34:20",
      "success": false,
      "user": "zeynep",
      "ip": "198.51.100.23"
    },
    {
      "time": "2026-10-30T12:34:40",
      "success": false,
      "user": "admin",
      "ip": "198.51.100.23"
    },
    {
      "time": "2026-10-30T12:35:00",
      "success": false,
      "user": "root",
      "ip": "198.51.100.23"
    },
    {
      "time": "2026-10-30T12:35:20",
      "success": false,
      "user": "test",
      "ip": "198.51.100.23"
    },
    {
      "time": "2026-10-30T12:35:40",
      "success": false,
      "user": "guest",
      "ip": "198.51.100.23"
    },
    {
      "time": "2026-10-30T12:36:00",
      "success": false,
      "user": "oracle",
      "ip": "198.51.100.23"
    },
    {
      "time": "2026-10-30T12:36:04",
      "success": true,
      "user": "zeynep",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T12:36:20",
      "success": false,
      "user": "ubuntu",
      "ip": "198.51.100.23"
    },
    {
      "time": "2026-10-30T12:38:20",
      "success": true,
      "user": "zeynep",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T12:51:49",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T13:01:31",
      "success": true,
      "user": "zeynep",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T13:01:52",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T13:14:29",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T13:21:20",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T13:25:10",
      "success": true,
      "user": "can",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T13:29:53",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T13:34:46",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T13:37:50",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T13:45:55",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T13:49:18",
      "success": true,
      "user": "can",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T13:55:07",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T13:59:06",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T14:00:00",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:00:03",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:00:06",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:00:09",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:00:12",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:00:15",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:00:18",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:00:21",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:00:24",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:00:27",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:00:30",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:00:33",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:00:36",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:00:39",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:00:42",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:00:45",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:00:48",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:00:51",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:00:54",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:00:57",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:01:00",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:01:03",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:01:06",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:01:09",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:01:12",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:01:14",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T14:01:15",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:01:18",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:01:21",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:01:24",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:01:27",
      "success": false,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:01:35",
      "success": true,
      "user": "admin",
      "ip": "203.0.113.77"
    },
    {
      "time": "2026-10-30T14:04:23",
      "success": true,
      "user": "can",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T14:04:45",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T14:05:35",
      "success": true,
      "user": "zeynep",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T14:05:50",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T14:06:05",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T14:06:59",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T14:07:04",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T14:09:13",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T14:33:12",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T14:42:08",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T14:45:39",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T14:47:00",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T14:50:13",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T15:01:18",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T15:04:02",
      "success": true,
      "user": "can",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T15:07:56",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T15:17:24",
      "success": true,
      "user": "can",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T15:21:13",
      "success": true,
      "user": "zeynep",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T15:23:00",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T15:35:04",
      "success": true,
      "user": "zeynep",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T15:35:38",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T15:43:40",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T15:44:17",
      "success": true,
      "user": "can",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T15:49:35",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T15:50:17",
      "success": true,
      "user": "can",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T15:52:14",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T15:53:25",
      "success": true,
      "user": "can",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T15:55:40",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T15:55:51",
      "success": false,
      "user": "ayse",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T15:55:57",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T15:58:45",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T16:03:15",
      "success": true,
      "user": "zeynep",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T16:10:24",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T16:13:51",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T16:21:13",
      "success": true,
      "user": "can",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T16:25:38",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T16:29:49",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T16:31:04",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.20"
    },
    {
      "time": "2026-10-30T16:31:14",
      "success": true,
      "user": "can",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T16:33:40",
      "success": true,
      "user": "zeynep",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T16:37:13",
      "success": true,
      "user": "can",
      "ip": "192.168.1.10"
    },
    {
      "time": "2026-10-30T16:37:18",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T16:38:16",
      "success": true,
      "user": "mehmet",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-30T16:51:56",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T16:54:16",
      "success": true,
      "user": "admin",
      "ip": "192.168.1.11"
    },
    {
      "time": "2026-10-30T16:58:21",
      "success": true,
      "user": "zeynep",
      "ip": "192.168.1.12"
    },
    {
      "time": "2026-10-31T03:12:00",
      "success": true,
      "user": "ayse",
      "ip": "192.168.1.99"
    }
  ]
};
