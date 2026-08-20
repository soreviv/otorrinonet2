#!/bin/bash
# Bootstrap de la instancia EC2 de OtorrinoNet (Ubuntu 24.04 LTS, arm64).
#
# Instala y configura PostgreSQL nativo, Node.js, PM2, nginx, certbot y ufw.
# NO clona el repo, NO toca secretos (Stripe, JWT_SECRET, etc.) — esos pasos
# quedan manuales a propósito, ver el resumen que imprime al final.
#
# Uso, ya conectado a la instancia (Session Manager o SSH):
#   git clone <repo> /tmp/otorrinonet2   (o sube este archivo suelto)
#   sudo bash bootstrap.sh

set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Este script debe correr como root: sudo bash bootstrap.sh" >&2
  exit 1
fi

APP_USER="ubuntu"
APP_DIR="/var/www/otorrinonet2"
DB_NAME="otorrinonet"
DB_USER="otorrinonet"
DB_PASS="$(openssl rand -hex 24)"
CREDS_FILE="/root/otorrinonet-db-credentials.txt"
NODE_MAJOR=22
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log() { echo -e "\n>>> $*"; }

export DEBIAN_FRONTEND=noninteractive

log "Actualizando paquetes del sistema"
apt-get update -y
apt-get upgrade -y

log "Instalando PostgreSQL nativo"
apt-get install -y postgresql postgresql-contrib

log "Creando base de datos y usuario de la app"
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
  ELSE
    ALTER ROLE ${DB_USER} PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;
SQL
sudo -u postgres psql -v ON_ERROR_STOP=1 -tc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" | grep -q 1 || \
  sudo -u postgres createdb -O "${DB_USER}" "${DB_NAME}"

cat > "$CREDS_FILE" <<EOF
# Generado por bootstrap.sh — $(date -u +%Y-%m-%dT%H:%M:%SZ)
# Copiar el valor de DATABASE_URL dentro de ${APP_DIR}/app/.env
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}
EOF
chmod 600 "$CREDS_FILE"
log "Credenciales de PostgreSQL guardadas en ${CREDS_FILE} (solo root puede leerlas)"

log "Instalando Node.js ${NODE_MAJOR}.x (NodeSource)"
curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
apt-get install -y nodejs

log "Instalando PM2"
npm install -g pm2

log "Instalando nginx"
apt-get install -y nginx

log "Instalando certbot"
apt-get install -y certbot python3-certbot-nginx

log "Configurando firewall (ufw)"
apt-get install -y ufw
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

log "Preparando carpeta de la app en ${APP_DIR}"
mkdir -p "${APP_DIR}"
chown "${APP_USER}:${APP_USER}" "${APP_DIR}"

log "Instalando config de nginx (HTTP; certbot agrega HTTPS después)"
cp "${SCRIPT_DIR}/nginx-otorrinonet.conf" /etc/nginx/sites-available/otorrinonet.conf
ln -sf /etc/nginx/sites-available/otorrinonet.conf /etc/nginx/sites-enabled/otorrinonet.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

cat <<SUMMARY

======================================================================
 Bootstrap completado
======================================================================
 PostgreSQL : base "${DB_NAME}", usuario "${DB_USER}"
 Credenciales: ${CREDS_FILE}  (DATABASE_URL listo para copiar a .env)
 App dir    : ${APP_DIR}  (dueño: ${APP_USER})
 nginx      : puerto 80, config en /etc/nginx/sites-available/otorrinonet.conf
 Node       : $(node -v)   PM2: $(pm2 -v)

 Pendiente (manual, como usuario "${APP_USER}"):
   1. git clone https://github.com/soreviv/otorrinonet2.git ${APP_DIR}
      (Git pedirá usuario/token — el PAT se pega ahí, nunca en un archivo)
   2. Crear ${APP_DIR}/app/.env con los secretos (Stripe, JWT_SECRET,
      ENCRYPTION_KEY, SMTP, ntfy, Turnstile...) + el DATABASE_URL de
      ${CREDS_FILE}
   3. cd ${APP_DIR}/app && npm install && npx prisma db push && npm run build
   4. pm2 start "npm run start -- -p 5000" --name otorrinonet && pm2 save
   5. pm2 startup   (seguir la instrucción que imprime, correrla como root)
   6. Apuntar el DNS del dominio a la Elastic IP de esta instancia
   7. sudo certbot --nginx -d otorrinonet.com -d www.otorrinonet.com
======================================================================
SUMMARY
