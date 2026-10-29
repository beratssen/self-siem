/*
 * Kural kimliği -> ekranda görünen ad ve analist için önerilen müdahale adımları (playbook).
 * Kimlikler python tarafındaki RULE_NAME değerleriyle aynıdır (src/rules/*.py).
 */
"use strict";

window.SIEMRules = (function () {
  const RULES = {
    ssh_account_takeover: {
      name: "Hesap Ele Geçirme",
      playbook: [
        "Hesabı hemen devre dışı bırak ve açık oturumları sonlandır.",
        "Kaynak IP'yi güvenlik duvarında engelle.",
        "Şifreyi sıfırla ve hesap için MFA'yı zorunlu kıl.",
        "Girişten sonraki tüm hesap aktivitelerini incele.",
      ],
    },
    ssh_brute_force: {
      name: "Brute-Force Saldırısı",
      playbook: [
        "Kaynak IP'yi güvenlik duvarında engelle.",
        "Hedef hesapta başarılı giriş olup olmadığını kontrol et.",
        "Hesap kilitleme ve hız sınırlama politikalarını gözden geçir.",
      ],
    },
    ssh_password_spraying: {
      name: "Password Spraying",
      playbook: [
        "Kaynak IP'yi güvenlik duvarında engelle.",
        "Hedeflenen hesaplarda başarılı giriş olup olmadığını kontrol et.",
        "Zayıf/yaygın şifre kullanan hesapları tespit edip şifre değişikliği iste.",
        "Tüm hesaplar için MFA'yı zorunlu kıl.",
      ],
    },
    ssh_off_hours_login: {
      name: "Mesai Dışı Giriş",
      playbook: [
        "Kullanıcıyla iletişime geçip girişin kendisine ait olduğunu teyit et.",
        "Kaynak IP'nin kullanıcının bilinen cihazlarından olup olmadığını kontrol et.",
        "Teyit edilemezse hesabı askıya al ve şifreyi sıfırla.",
      ],
    },
  };

  return {
    name: (id) => (RULES[id] ? RULES[id].name : id),
    playbook: (id) => (RULES[id] ? RULES[id].playbook : []),
  };
})();
