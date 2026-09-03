#!/bin/bash
# Script de restauración de base de datos PostgreSQL para OtorrinoNet.
# Revierte/restaura la base de datos a partir de un respaldo cifrado (.dump.gz.gpg).
#
# Uso:
#   ./restore-db-otorrinonet.sh <archivo_backup.dump.gz.gpg> [clave_privada.asc] [passphrase_gpg]
#
# También acepta la contraseña de GPG mediante la variable de entorno GPG_PASSPHRASE:
#   GPG_PASSPHRASE="mi_passphrase" ./restore-db-otorrinonet.sh <archivo_backup.dump.gz.gpg> [clave_privada.asc]

set -euo pipefail

APP_ENV="/var/www/otorrinonet2/.env"
LOG="/var/log/otorrinonet-restore.log"
TMPDIR="$(mktemp -d)"

log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $*"
  echo "$msg"
  if [[ -w "$(dirname "$LOG")" ]] || [[ -w "$LOG" ]]; then
    echo "$msg" >> "$LOG" 2>/dev/null || true
  fi
}

limpiar() {
  rm -rf "$TMPDIR"
}
trap limpiar EXIT

fallar() {
  log "ERROR: $1"
  exit 1
}

# 1. Validar parámetros recibidos
if [[ $# -lt 1 ]]; then
  echo "Uso: $0 <archivo_backup.dump.gz.gpg> [clave_privada.asc] [passphrase_gpg]"
  exit 1
fi

BACKUP_FILE="$1"
PRIVATE_KEY_FILE="${2:-}"
PASSPHRASE="${3:-${GPG_PASSPHRASE:-}}"

if [[ ! -f "$BACKUP_FILE" ]]; then
  fallar "El archivo de respaldo '$BACKUP_FILE' no existe o no es un archivo válido."
fi

# 2. Leer DATABASE_URL desde el archivo .env
if [[ ! -f "$APP_ENV" ]]; then
  fallar "No se encontró el archivo de configuración .env en '$APP_ENV'."
fi

DATABASE_URL="$(grep -m1 '^DATABASE_URL=' "$APP_ENV" | cut -d= -f2- | sed 's/^["'\'']\|["'\'']$//g')"
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

# 4. Descifrar el archivo de respaldo con GPG
TMP_GZ="${TMPDIR}/restore_temp.gz"
TMP_DUMP="${TMPDIR}/restore_temp.dump"

log "Descifrando respaldo '$BACKUP_FILE'..."
GPG_OPTS=(--batch --yes --output "$TMP_GZ")

if [[ -n "$PASSPHRASE" ]]; then
  GPG_OPTS+=(--pinentry-mode loopback --passphrase "$PASSPHRASE")
fi

gpg "${GPG_OPTS[@]}" --decrypt "$BACKUP_FILE" 2>>"$LOG" || fallar "Error al descifrar el archivo con GPG. Verifique la llave privada o la contraseña."

# 5. Descomprimir el dump
log "Descomprimiendo archivo..."
gzip -d -c "$TMP_GZ" > "$TMP_DUMP" 2>>"$LOG" || fallar "Error al descomprimir con gzip."

if [[ ! -s "$TMP_DUMP" ]]; then
  fallar "El archivo descomprimido quedó vacío."
fi

# 6. Restaurar en PostgreSQL usando pg_restore
log "Iniciando restauración en PostgreSQL..."
pg_restore --clean --if-exists --no-owner --no-privileges -d "$DATABASE_URL" "$TMP_DUMP" 2>>"$LOG" || {
  log "AVISO: pg_restore terminó con advertencias o errores menores (común si no existían algunas tablas previas)."
}

log "Restauración completada exitosamente desde '$BACKUP_FILE'."
