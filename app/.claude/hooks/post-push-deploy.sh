#!/bin/bash
# Hook PostToolUse: despliega automáticamente tras un git push exitoso.

LOG=/tmp/claude-hook-push.log
INPUT=$(cat)

echo "=== $(date) ===" >> "$LOG"
echo "$INPUT" | head -c 600 >> "$LOG"
echo "" >> "$LOG"

# Solo actuar si el comando fue git push
if ! echo "$INPUT" | grep -q '"git push"'; then
    exit 0
fi

# Salir si el comando fue interrumpido (fallo)
if echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(1 if d.get('tool_response',{}).get('interrupted',False) else 0)" 2>/dev/null; then
    echo "  → git push interrumpido, omitiendo despliegue" >> "$LOG"
    exit 0
fi

echo "  → desplegando..." >> "$LOG"
cd /var/www/otorrinonet2/app

echo "=== git push exitoso — iniciando despliegue ==="

echo "→ npm install"
npm install --prefer-offline 2>&1

echo "→ npm run build"
npm run build 2>&1

echo "→ pm2 restart all"
pm2 restart all 2>&1

echo "=== Despliegue completado ==="
echo "  → OK" >> "$LOG"
