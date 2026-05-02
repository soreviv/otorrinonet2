#!/bin/bash
# Hook PostToolUse: despliega automáticamente tras un git push exitoso.

INPUT=$(cat)

# Extraer el comando bash ejecutado
COMMAND=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('tool_input', {}).get('command', ''))
except Exception:
    print('')
" 2>/dev/null)

# Solo actuar si fue un git push
if ! echo "$COMMAND" | grep -qE "^\s*git push"; then
    exit 0
fi

# Extraer el exit code de la respuesta
EXIT_CODE=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    resp = data.get('tool_response', {})
    code = resp.get('exitCode', resp.get('exit_code', 0))
    print(int(code))
except Exception:
    print(0)
" 2>/dev/null)

if [ "$EXIT_CODE" != "0" ]; then
    echo "git push falló (exit $EXIT_CODE) — se omite el despliegue."
    exit 0
fi

echo "=== git push exitoso — iniciando despliegue ==="
cd /var/www/otorrinonet2/app

echo "→ npm install"
npm install --prefer-offline 2>&1

echo "→ npm run build"
npm run build 2>&1

echo "→ pm2 restart all"
pm2 restart all 2>&1

echo "=== Despliegue completado ==="
