#!/bin/bash
# Pull remoto de backups cifrados de OtorrinoNet (regla 3-2-1).
# Corre en el SERVIDOR REMOTO (destino), no en el VPS de producción.
# Usa la cuenta "backup-pull" del VPS origen, restringida por rrsync -ro
# a /var/backups/otorrinonet (solo lectura, sin shell).

set -euo pipefail

ORIGEN_HOST="backup-pull@otorrinonet.com"        # ajustar: host o IP del VPS origen
ORIGEN_DIR="/var/backups/otorrinonet/"
DESTINO_DIR="/var/backups/otorrinonet-remoto/"
SSH_KEY="/root/.ssh/backup-pull_ed25519"          # clave privada que hace pareja con la pública en authorized_keys del origen
LOG="/var/log/pull-backup-otorrinonet.log"
ALERTA_EMAIL="drviverosorl@gmail.com"
LOCK="/var/run/pull-backup-otorrinonet.lock"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

enviar_alerta() {
  local asunto="$1" cuerpo="$2"
  echo "$cuerpo" | mail -s "$asunto" "$ALERTA_EMAIL" 2>>"$LOG" || log "AVISO: no se pudo enviar el correo de alerta"
}

# Evita corridas superpuestas si el pull anterior sigue en curso (red lenta, etc.)
exec 9>"$LOCK"
flock -n 9 || { log "ERROR: ya hay un pull en curso, se omite esta corrida"; exit 1; }

mkdir -p "$DESTINO_DIR"

log "Iniciando pull de backups desde ${ORIGEN_HOST}"

if ! rsync -avz --stats \
    -e "ssh -i ${SSH_KEY} -o BatchMode=yes -o ConnectTimeout=20 -o StrictHostKeyChecking=yes" \
    "${ORIGEN_HOST}:${ORIGEN_DIR}" "${DESTINO_DIR}" >>"$LOG" 2>&1; then
  log "ERROR: rsync falló"
  enviar_alerta "[OtorrinoNet] Falla en pull de backups" \
    "El rsync de backups desde ${ORIGEN_HOST} falló el $(date). Revisar ${LOG} en $(hostname)."
  exit 1
fi

# Verifica que realmente llegó el dump de hoy (evita un "éxito" silencioso
# si el timer del origen falló mucho antes de que corriera este pull).
HOY=$(date +%Y-%m-%d)
if ! find "${DESTINO_DIR}diario" -name "otorrinonet_${HOY}*.dump.gz.gpg" -mtime -1 2>/dev/null | grep -q .; then
  log "ERROR: no se encontró el dump de hoy (${HOY}) en ${DESTINO_DIR}diario tras el pull"
  enviar_alerta "[OtorrinoNet] Backup remoto desactualizado" \
    "No se encontró otorrinonet_${HOY}*.dump.gz.gpg en ${DESTINO_DIR}diario tras el rsync del $(date). Revisar el timer 'otorrinonet-backup' en el VPS origen."
  exit 1
fi

log "Pull completado OK"

# TODO(human): política de retención en el servidor remoto.
# El origen ya rota diario(30d)/semanal(90d)/mensual(365d) y BORRA lo viejo.
# Aquí, en el destino, se puede decidir una política distinta (ej. conservar
# más tiempo por ser el respaldo "profundo" fuera de sitio, o replicar la
# misma rotación que el origen para no acumular espacio indefinidamente).
# Implementar la limpieza de $DESTINO_DIR según la política elegida.

log "Backup remoto finalizado — espacio total: $(du -sh "$DESTINO_DIR" | cut -f1)"
