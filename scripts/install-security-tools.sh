#!/bin/bash
# Instala fail2ban, rkhunter, chkrootkit y clamav en el VPS de producción,
# y los deja configurados en reposo (sin ejecutar ningún escaneo).
#
# La programación de los escaneos vive aparte, en run-security-scans.sh +
# security-scans.service/.timer — este script solo instala y prepara.
#
# Idempotente: se puede correr más de una vez sin romper nada.
#
# Uso: sudo bash install-security-tools.sh

set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Este script debe correr como root: sudo bash install-security-tools.sh" >&2
  exit 1
fi

log() { echo -e "\n>>> $*"; }

export DEBIAN_FRONTEND=noninteractive

log "Instalando fail2ban, rkhunter, chkrootkit y clamav"
apt-get update -y
apt-get install -y fail2ban rkhunter chkrootkit clamav clamav-daemon clamav-freshclam

log "Actualizando la base de propiedades de rkhunter (baseline)"
# Sin esto, el primer escaneo real reporta como "cambiados" archivos que en
# realidad son normales de una instalación nueva (falsos positivos).
rkhunter --propupd

log "Habilitando actualización automática de firmas de ClamAV"
systemctl enable --now clamav-freshclam

log "Desactivando el cron.daily por defecto de rkhunter y chkrootkit"
# La programación real vive en security-scans.timer (un solo mecanismo,
# con alerta a ntfy) — dejar además el cron.daily de cada paquete solo
# duplicaría corridas y mandaría avisos por mail a root, que nadie lee aquí.
if [[ -f /etc/default/rkhunter ]]; then
  sed -i 's/^CRON_DAILY_RUN=.*/CRON_DAILY_RUN="false"/' /etc/default/rkhunter
fi
if [[ -f /etc/chkrootkit.conf ]]; then
  sed -i 's/^RUN_DAILY=.*/RUN_DAILY="false"/' /etc/chkrootkit.conf
fi

log "Configurando fail2ban (sshd + nginx)"
cat > /etc/fail2ban/jail.local <<'EOF'
[sshd]
enabled = true

[nginx-http-auth]
enabled = true
logpath = /var/log/nginx/error.log

[nginx-botsearch]
enabled = true
logpath = /var/log/nginx/access.log
EOF
systemctl enable --now fail2ban
systemctl restart fail2ban

log "Instalación completa"
echo "
Verificar con:
  fail2ban-client status
  rkhunter --check --skip-keypress
  chkrootkit
"
