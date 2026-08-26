#!/bin/bash
# Corre rkhunter y chkrootkit a diario, y clamscan los domingos, en ESTE VPS
# de producción. Si algún escaneo encuentra algo, avisa por ntfy al topic
# "otorrinonet-seguridad" (separado de "otorrinonet-staff", que es para
# citas/contacto/pedidos). Si todo sale limpio, solo queda en el log local.
#
# Requiere que install-security-tools.sh ya se haya corrido, y las
# credenciales de ntfy en /etc/otorrinonet-security-scans.env
# (NTFY_BASE_URL, NTFY_SECURITY_TOPIC, NTFY_SECURITY_TOKEN).

set -euo pipefail

LOG="/var/log/otorrinonet-security-scans.log"
LOCK="/var/run/otorrinonet-security-scans.lock"
CREDS="/etc/otorrinonet-security-scans.env"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

# Evita corridas superpuestas si un escaneo anterior sigue en curso.
exec 9>"$LOCK"
flock -n 9 || { log "ERROR: ya hay un escaneo en curso, se omite esta corrida"; exit 1; }

# shellcheck source=/dev/null
source "$CREDS"

enviar_alerta() {
  local mensaje="$1"
  curl -sf -H "Authorization: Bearer ${NTFY_SECURITY_TOKEN}" \
    -H "Title: Hallazgo en escaneo de seguridad" \
    -H "Priority: high" \
    -d "$mensaje" \
    "${NTFY_BASE_URL}/${NTFY_SECURITY_TOPIC}" >>"$LOG" 2>&1 \
    || log "AVISO: no se pudo publicar la alerta en ntfy"
}

HALLAZGOS=""

log "Iniciando rkhunter"
RKHUNTER_OUT=$(rkhunter --check --skip-keypress --report-warnings-only 2>&1); RKHUNTER_RC=$?
echo "$RKHUNTER_OUT" >>"$LOG"
if echo "$RKHUNTER_OUT" | grep -q "Warning"; then
  HALLAZGOS+=$'\n'"rkhunter reportó warnings — revisar /var/log/rkhunter.log en $(hostname)."
elif [[ "$RKHUNTER_RC" -gt 1 ]]; then
  # 0 = sin warnings, 1 = warnings (ya capturado arriba); >1 = el escaneo no se completó.
  HALLAZGOS+=$'\n'"rkhunter terminó con error (código ${RKHUNTER_RC}) sin completar el escaneo — revisar ${LOG} en $(hostname)."
fi

log "Iniciando chkrootkit"
CHKROOTKIT_OUT=$(chkrootkit 2>&1); CHKROOTKIT_RC=$?
echo "$CHKROOTKIT_OUT" >>"$LOG"
# La salida normal de chkrootkit incluye líneas como "not infected" en cada
# check limpio — filtrarlas es necesario para que el grep de abajo no
# dispare siempre. También se filtra el bindshell del puerto 465, falso
# positivo conocido de chkrootkit en servidores de correo (este VPS corre
# Postfix/Dovecot).
CHKROOTKIT_HALLAZGOS=$(echo "$CHKROOTKIT_OUT" | grep -vi "not infected" | grep -v "infected ports: 465" | grep -i "infected" || true)
if [[ -n "$CHKROOTKIT_HALLAZGOS" ]]; then
  HALLAZGOS+=$'\n'"chkrootkit reportó posible infección — revisar ${LOG} en $(hostname)."
elif [[ "$CHKROOTKIT_RC" -ne 0 ]]; then
  HALLAZGOS+=$'\n'"chkrootkit terminó con error (código ${CHKROOTKIT_RC}) sin completar el escaneo — revisar ${LOG} en $(hostname)."
fi

# clamscan es pesado — solo domingos (día 7 de la semana) para no cargar
# el VPS a diario con un escaneo de archivos completo.
if [[ "$(date +%u)" -eq 7 ]]; then
  log "Domingo: iniciando clamscan"
  CLAMSCAN_OUT=$(clamscan -r /var/www /home /root /tmp --infected 2>&1) || true
  echo "$CLAMSCAN_OUT" >>"$LOG"
  if echo "$CLAMSCAN_OUT" | grep -q "Infected files: [1-9]"; then
    HALLAZGOS+=$'\n'"clamscan encontró archivos infectados — revisar ${LOG} en $(hostname)."
  fi
else
  log "No es domingo, se omite clamscan"
fi

if [[ -n "$HALLAZGOS" ]]; then
  log "Hallazgos detectados, enviando alerta a ntfy"
  enviar_alerta "Escaneo de seguridad en $(hostname) del $(date '+%Y-%m-%d %H:%M'):${HALLAZGOS}"
  exit 1
fi

log "Escaneo completado sin hallazgos"
