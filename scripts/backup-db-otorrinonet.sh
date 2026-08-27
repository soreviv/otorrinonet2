#!/bin/bash
# Backup diario cifrado de la base de datos de OtorrinoNet (regla 3-2-1).
# Corre en ESTE VPS (origen) vía backup-db-otorrinonet.timer.
#
# Genera un pg_dump -Fc, lo comprime y lo cifra con GPG asimétrico (solo la
# llave PÚBLICA vive en este servidor — la privada está fuera, en la PC del
# Dr. Viveros, así que un compromiso de este VPS no expone backups viejos
# ni nuevos). El resultado queda en /var/backups/otorrinonet/{diario,semanal,mensual}
# listo para que pull-backup-otorrinonet.sh (que corre en OTRO servidor) lo
# recoja por rsync.

set -euo pipefail

APP_ENV="/var/www/otorrinonet2/.env"
BACKUP_ROOT="/var/backups/otorrinonet"
GPG_RECIPIENT="604767D2A98DF0F806A522B0CC65CC82AD55E625"  # OtorrinoNet Backup (backupkey mail.otorrinonet.com)
LOG="/var/log/otorrinonet-backup.log"
LOCK="/var/run/otorrinonet-backup.lock"
ALERTA_EMAIL="drviverosorl@gmail.com"
TMPDIR="$(mktemp -d)"

RETENCION_DIARIO=30
RETENCION_SEMANAL=90
RETENCION_MENSUAL=365

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

enviar_alerta() {
  local asunto="$1" cuerpo="$2"
  echo "$cuerpo" | mail -s "$asunto" "$ALERTA_EMAIL" 2>>"$LOG" || log "AVISO: no se pudo enviar el correo de alerta"
}

limpiar() { rm -rf "$TMPDIR"; }
trap limpiar EXIT

fallar() {
  log "ERROR: $1"
  enviar_alerta "[OtorrinoNet] Falla en backup de base de datos" \
    "El backup de la base de datos falló el $(date) en $(hostname): $1. Revisar ${LOG}."
  exit 1
}

# Evita corridas superpuestas
exec 9>"$LOCK"
flock -n 9 || { log "ERROR: ya hay un backup en curso, se omite esta corrida"; exit 1; }

DATABASE_URL="$(grep -m1 '^DATABASE_URL=' "$APP_ENV" | cut -d= -f2- | sed 's/^["'\'']\|["'\'']$//g')"
[[ -n "$DATABASE_URL" ]] || fallar "no se pudo leer DATABASE_URL de ${APP_ENV}"

HOY=$(date +%Y-%m-%d)
BASENAME="otorrinonet_${HOY}"
DUMP_PATH="${TMPDIR}/${BASENAME}.dump"
GZ_PATH="${DUMP_PATH}.gz"
GPG_PATH="${GZ_PATH}.gpg"

mkdir -p "${BACKUP_ROOT}/diario" "${BACKUP_ROOT}/semanal" "${BACKUP_ROOT}/mensual"

log "Iniciando pg_dump de otorrinonet"
pg_dump -Fc "$DATABASE_URL" -f "$DUMP_PATH" 2>>"$LOG" || fallar "pg_dump falló"

log "Comprimiendo dump"
gzip "$DUMP_PATH" 2>>"$LOG" || fallar "gzip falló"

log "Cifrando con GPG (destinatario: ${GPG_RECIPIENT})"
gpg --homedir /root/.gnupg --trust-model always \
    --output "$GPG_PATH" --encrypt --recipient "$GPG_RECIPIENT" "$GZ_PATH" 2>>"$LOG" \
  || fallar "gpg --encrypt falló"

[[ -s "$GPG_PATH" ]] || fallar "el archivo cifrado quedó vacío (0 bytes) — mismo problema que el intento del 19-ago"

log "Backup cifrado generado: ${GPG_PATH} ($(du -h "$GPG_PATH" | cut -f1))"

cp "$GPG_PATH" "${BACKUP_ROOT}/diario/${BASENAME}.dump.gz.gpg"

if [[ "$(date +%u)" -eq 7 ]]; then
  log "Domingo: copiando también a semanal/"
  cp "$GPG_PATH" "${BACKUP_ROOT}/semanal/${BASENAME}.dump.gz.gpg"
fi

if [[ "$(date +%d)" -eq 01 ]]; then
  log "Día 1 del mes: copiando también a mensual/"
  cp "$GPG_PATH" "${BACKUP_ROOT}/mensual/${BASENAME}.dump.gz.gpg"
fi

log "Aplicando retención (diario ${RETENCION_DIARIO}d / semanal ${RETENCION_SEMANAL}d / mensual ${RETENCION_MENSUAL}d)"
find "${BACKUP_ROOT}/diario" -name "otorrinonet_*.dump.gz.gpg" -mtime "+${RETENCION_DIARIO}" -delete
find "${BACKUP_ROOT}/semanal" -name "otorrinonet_*.dump.gz.gpg" -mtime "+${RETENCION_SEMANAL}" -delete
find "${BACKUP_ROOT}/mensual" -name "otorrinonet_*.dump.gz.gpg" -mtime "+${RETENCION_MENSUAL}" -delete

log "Backup completado OK — espacio total: $(du -sh "$BACKUP_ROOT" | cut -f1)"
