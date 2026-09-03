# Guía de Restauración de Respaldos de Base de Datos - OtorrinoNet

Esta guía describe el procedimiento para restaurar la base de datos PostgreSQL de **OtorrinoNet** a partir de los archivos de respaldo cifrados generados por la política de respaldos (regla 3-2-1).

---

## 1. Arquitectura de Respaldos y Seguridad

Los respaldos de OtorrinoNet se generan con el script `/var/www/otorrinonet2/scripts/backup-db-otorrinonet.sh` y se almacenan cifrados en `/var/backups/otorrinonet/{diario,semanal,mensual}` (y réplica remota).

- **Formato original**: Dump personalizado de PostgreSQL (`pg_dump -Fc`).
- **Compresión**: `gzip`.
- **Cifrado**: GPG asimétrico (clave pública en el servidor, clave privada guardada de forma segura en la PC del administrador/médico).
- **Extension de archivo**: `.dump.gz.gpg` (ej. `otorrinonet_2026-05-18.dump.gz.gpg`).

---

## 2. Requisitos Previos para la Restauración

Antes de iniciar la restauración, asegúrese de contar con:

1. **El archivo de respaldo cifrado** (`.dump.gz.gpg`).
2. **La llave privada GPG** (`.asc` o `.key`) correspondiente al ID de destinatario `604767D2A98DF0F806A522B0CC65CC82AD55E625`.
3. **Contraseña/Passphrase de la llave privada GPG** (si la llave posee una).
4. **Archivo `.env`** configurado en `/var/www/otorrinonet2/.env` con la variable `DATABASE_URL`.
5. **Herramientas de sistema instaladas**: `gpg`, `gzip`, `pg_restore`.

---

## 3. Método 1: Restauración Automatizada (Recomendado)

Utilice el script `scripts/restore-db-otorrinonet.sh`.

### Sintaxis

```bash
/var/www/otorrinonet2/scripts/restore-db-otorrinonet.sh <archivo_backup.dump.gz.gpg> [llave_privada.asc] [passphrase_gpg]
```

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

#### Ejemplo C: Pasando llave privada y contraseña por argumento o variable de entorno
```bash
# Opción 1: Por argumento
/var/www/otorrinonet2/scripts/restore-db-otorrinonet.sh \
  /var/backups/otorrinonet/diario/otorrinonet_2026-05-18.dump.gz.gpg \
  /ruta/a/clave_privada_otorrinonet.asc \
  "MiContrasenaSeguraGPG"

# Opción 2: Mediante variable de entorno GPG_PASSPHRASE
export GPG_PASSPHRASE="MiContrasenaSeguraGPG"
/var/www/otorrinonet2/scripts/restore-db-otorrinonet.sh \
  /var/backups/otorrinonet/diario/otorrinonet_2026-05-18.dump.gz.gpg \
  /ruta/a/clave_privada_otorrinonet.asc
```

---

## 4. Método 2: Restauración Manual Paso a Paso

Si prefiere realizar el proceso manualmente sin usar el script automatizado, siga estos pasos:

### Paso 1: Importar la llave privada GPG (si no se ha importado previa)
```bash
gpg --import /ruta/a/clave_privada_otorrinonet.asc
```

### Paso 2: Descifrar el archivo con GPG
```bash
gpg --output otorrinonet_backup.dump.gz --decrypt /var/backups/otorrinonet/diario/otorrinonet_2026-05-18.dump.gz.gpg
```

### Paso 3: Descomprimir el dump
```bash
gunzip -c otorrinonet_backup.dump.gz > otorrinonet_backup.dump
```

### Paso 4: Obtener la URL de la base de datos
Consulte la cadena de conexión en el archivo `.env`:
```bash
export DATABASE_URL=$(grep '^DATABASE_URL=' /var/www/otorrinonet2/.env | cut -d= -f2- | tr -d '"' | tr -d "'")
```

### Paso 5: Ejecutar la restauración con `pg_restore`
```bash
pg_restore --clean --if-exists --no-owner --no-privileges -d "$DATABASE_URL" otorrinonet_backup.dump
```

### Paso 6: Limpiar archivos temporales desempaquetados
```bash
rm -f otorrinonet_backup.dump.gz otorrinonet_backup.dump
```

---

## 5. Verificación Post-Restauración

Tras completar la restauración, se recomienda verificar la integridad de la base de datos:

1. Executar consulta de verificación de tablas principales:
   ```bash
   psql "$DATABASE_URL" -c "SELECT count(*) FROM \"Patient\";"
   psql "$DATABASE_URL" -c "SELECT count(*) FROM \"MedicalNote\";"
   ```
2. En proyectos Prisma, sincronizar o validar el estado si fuera necesario:
   ```bash
   cd /var/www/otorrinonet2/app
   npx prisma db pull --print
   ```

---

## 6. Consideraciones de Seguridad

- **No almacene la llave privada GPG en el servidor de producción de forma permanente.**
- Borre cualquier archivo de respaldo descifrado (`.dump` o `.gz`) de las carpetas temporales tras finalizar el procedimiento.
