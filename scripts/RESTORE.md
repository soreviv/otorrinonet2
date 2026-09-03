# Restauración de Respaldos de Base de Datos - OtorrinoNet

Para instrucciones detalladas sobre la restauración de respaldos en OtorrinoNet, consulte la guía completa en:
👉 [`docs/GUIA_RESTAURACION_BACKUP.md`](../docs/GUIA_RESTAURACION_BACKUP.md)

### Resumen Rápido

Para restaurar un respaldo cifrado mediante el script automatizado (procesamiento seguro en streaming):

```bash
/var/www/otorrinonet2/scripts/restore-db-otorrinonet.sh <archivo.dump.gz.gpg> [clave_privada.asc]
```

Ejemplo con contraseña enviada por variable de entorno:

```bash
export GPG_PASSPHRASE="MiContrasenaSeguraGPG"
/var/www/otorrinonet2/scripts/restore-db-otorrinonet.sh \
  /var/backups/otorrinonet/diario/otorrinonet_2026-05-18.dump.gz.gpg \
  /ruta/a/clave_privada.asc
```
