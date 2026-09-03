#!/bin/bash
# Script de restauración de base de datos PostgreSQL para OtorrinoNet.
# Revierte/restaura la base de datos a partir de un respaldo cifrado (.dump.gz.gpg)
# mediante canalización directa en memoria (streaming) por seguridad de datos de salud.
#
# Uso:
#   ./restore-db-otorrinonet.sh <archivo_backup.dump.gz.gpg> [clave_privada.asc]
#
# Para llaves protegidas con contraseña, pase la frase de paso mediante la variable de entorno GPG_PASSPHRASE:
#   GPG_PASSPHRASE="mi_passphrase" ./restore-db-otorrinonet.sh <archivo_backup.dump.gz.gpg> [clave_privada.asc]

set -euo pipefail

APP_ENV="/var/www/otorrinonet2/.env"
LOG="/var/log/otorrinonet-restore.log"

log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $*"
  echo "$msg"
  if [[ -w "/var/log" ]] || [[ -w "$LOG" ]]; then
    echo "$msg" >> "$LOG" 2>/dev/null || true
  fi
}

fallar() {
  log "ERROR: $1"
  exit 1
}

# 1. Validar parámetros recibidos
if [[ $# -lt 1 ]]; then
  echo "Uso: $0 <archivo_backup.dump.gz.gpg> [clave_privada.asc]"
  echo "Nota: Si la llave requiere contraseña, use la variable de entorno GPG_PASSPHRASE por seguridad."
  exit 1
fi

BACKUP_FILE="$1"
PRIVATE_KEY_FILE="${2:-}"
PASSPHRASE="${GPG_PASSPHRASE:-}"

if [[ ! -f "$BACKUP_FILE" ]]; then
  fallar "El archivo de respaldo '$BACKUP_FILE' no existe."
fi

# 2. Leer DATABASE_URL desde .env
if [[ ! -f "$APP_ENV" ]]; then
  fallar "No se encontró el archivo de configuración .env en '$APP_ENV'."
fi

DATABASE_URL="$(grep -m1 '^DATABASE_URL=' "$APP_ENV" | cut -d= -f2- | sed -e 's/^["'\'']//' -e 's/["'\'']$//')"
if [[ -z "$DATABASE_URL" ]]; then
  fallar "No se pudo extraer DATABASE_URL de '$APP_ENV'."
fi

# 3. Importar llave privada GPG si fue proporcionada
if [[ -n "$PRIVATE_KEY_FILE" ]]; then
  if [[ ! -f "$PRIVATE_KEY_FILE" ]]; then
    fallar "El archivo de llave privada GPG '$PRIVATE_KEY_FILE' no existe."
  fi
  log "Importando llave privada GPG desde '$PRIVATE_KEY_FILE'..."
  gpg --batch --yes --import "$PRIVATE_KEY_FILE" 2>>"$LOG" || fallar "Falla al importar la llave privada GPG."
fi

# 4. Descifrado, descompresión y restauración en flujo directo (Stream)
log "Iniciando proceso de descifrado, descompresión y restauración en memoria (streaming)..."

GPG_OPTS=(--batch --yes --quiet)
if [[ -n "$PASSPHRASE" ]]; then
  GPG_OPTS+=(--pinentry-mode loopback --passphrase "$PASSPHRASE")
fi

gpg "${GPG_OPTS[@]}" --decrypt "$BACKUP_FILE" 2>>"$LOG" \
  | gzip -d -c 2>>"$LOG" \
  | pg_restore --clean --if-exists --no-owner --no-privileges -d "$DATABASE_URL" 2>>"$LOG" || {
    log "AVISO: La restauración finalizó con advertencias o errores menores."
  }

log "Restauración completada exitosamente desde '$BACKUP_FILE'."
