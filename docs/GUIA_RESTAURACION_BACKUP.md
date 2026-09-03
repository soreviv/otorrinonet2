# Guía de Restauración de Respaldos de Base de Datos - OtorrinoNet

Esta guía describe el procedimiento para restaurar la base de datos PostgreSQL de **OtorrinoNet** a partir de los archivos de respaldo cifrados generados por la política de respaldos (regla 3-2-1).

---

## 1. Arquitectura de Respaldos y Seguridad

Los respaldos de OtorrinoNet se generan con el script `/var/www/otorrinonet2/scripts/backup-db-otorrinonet.sh` y se almacenan cifrados en `/var/backups/otorrinonet/{diario,semanal,mensual}` (y réplica remota).

- **Formato original**: Dump personalizado de PostgreSQL (`pg_dump -Fc`).
- **Compresión**: `gzip`.
- **Cifrado**: GPG asimétrico (clave pública en el servidor, clave privada guardada de forma segura en la PC del administrador/médico).
- **Extension de archivo**: `.dump.gz.gpg` (ej. `otorrinonet_2026-05-18.dump.gz.gpg`).
- **Seguridad en restauración**: Procesamiento mediante tuberías en memoria (*streaming* pipeline) para evitar escribir dumps no cifrados en almacenamiento temporal.

---

## 2. Requisitos Previos para la Restauración

Antes de iniciar la restauración, asegúrese de contar con:

1. **El archivo de respaldo cifrado** (`.dump.gz.gpg`).
2. **La llave privada GPG** (`.asc` o `.key`) correspondiente al ID de destinatario `604767D2A98DF0F806A522B0CC65CC82AD55E625`.
3. **Contraseña/Passphrase de la llave privada GPG** (exportada mediante variable de entorno `GPG_PASSPHRASE`).
4. **Archivo `.env`** configurado en `/var/www/otorrinonet2/.env` con la variable `DATABASE_URL`.
5. **Herramientas de sistema instaladas**: `gpg`, `gzip`, `pg_restore`.

---

## 3. Método 1: Restauración Automatizada (Recomendado)

Utilice el script `scripts/restore-db-otorrinonet.sh`.

### Sintaxis

```bash
/var/www/otorrinonet2/scripts/restore-db-otorrinonet.sh <archivo_backup.dump.gz.gpg> [llave_privada.asc]
```

> **Nota de seguridad:** Por buenas prácticas de seguridad y cumplimiento normativo de protección de datos personales de salud (NOM-024 / LFPDPPP), la contraseña de la llave GPG nunca debe pasarse como argumento de línea de comandos para evitar que quede registrada en el historial del shell (`~/.bash_history`) o visible en la lista de procesos (`ps aux`). Use la variable de entorno `GPG_PASSPHRASE`.

### Ejemplos de uso

#### Ejemplo A: Si la llave privada ya está importada en el llavero GPG del sistema
```bash
/var/www/otorrinonet2/scripts/restore-db-otorrinonet.sh /var/backups/otorrinonet/diario/otorrinonet_2026-05-18.dump.gz.gpg
```

#### Ejemplo B: Importando la llave privada automáticamente durante la ejecución
```bash
/var/www/otorrinonet2/scripts/restore-db-otorrinonet.sh \
  /var/backups/otorrinonet/diario/otorrinonet_2026-05-18.dump.gz.gpg \
  /ruta/a/clave_privada_otorrinonet.asc
```

#### Ejemplo C: Pasando la contraseña de la llave privada mediante variable de entorno
```bash
export GPG_PASSPHRASE="MiContrasenaSeguraGPG"
/var/www/otorrinonet2/scripts/restore-db-otorrinonet.sh \
  /var/backups/otorrinonet/diario/otorrinonet_2026-05-18.dump.gz.gpg \
  /ruta/a/clave_privada_otorrinonet.asc
```

---

## 4. Método 2: Restauración Manual Paso a Paso (Flujo Streaming)

Si prefiere realizar el proceso manualmente sin usar el script automatizado, utilice el flujo directo en tubería (*pipe*) para mayor seguridad de la información médica:

### Paso 1: Importar la llave privada GPG (si no se ha importado previamente)
```bash
gpg --import /ruta/a/clave_privada_otorrinonet.asc
```

### Paso 2: Obtener la URL de la base de datos
Consulte la cadena de conexión en el archivo `.env`:
```bash
export DATABASE_URL=$(grep -m1 '^DATABASE_URL=' /var/www/otorrinonet2/.env | cut -d= -f2- | sed -e 's/^["'\'']//' -e 's/["'\'']$//')
```

### Paso 3: Descifrar, descomprimir y restaurar directamente en streaming
```bash
gpg --batch --yes --decrypt /var/backups/otorrinonet/diario/otorrinonet_2026-05-18.dump.gz.gpg \
  | gzip -d -c \
  | pg_restore --clean --if-exists --no-owner --no-privileges -d "$DATABASE_URL"
```

---

## 5. Verificación Post-Restauración

Tras completar la restauración, se recomienda verificar la integridad de la base de datos:

1. Ejecutar consulta de verificación de tablas principales:
   ```bash
   psql "$DATABASE_URL" -c "SELECT count(*) FROM \"Patient\";"
   psql "$DATABASE_URL" -c "SELECT count(*) FROM \"MedicalNote\";"
   ```
2. En proyectos Prisma, validar el esquema de base de datos:
   ```bash
   cd /var/www/otorrinonet2/app
   npx prisma db pull --print
   ```

---

## 6. Consideraciones de Seguridad

- **No almacene la llave privada GPG en el servidor de producción de forma permanente.**
- El uso de tuberías directas (`gpg | gzip | pg_restore`) garantiza que nunca existan archivos de historia clínica o pacientes desempaquetados sin cifrar en carpetas temporales como `/tmp`.
