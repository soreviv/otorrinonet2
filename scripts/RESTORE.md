# Restauración de Respaldos de Base de Datos — OtorrinoNet

Para instrucciones detalladas sobre el procedimiento de restauración y la arquitectura de seguridad de respaldos en OtorrinoNet, consulte la guía completa en:

👉 [**Guía Completa de Restauración de Respaldos**](../docs/GUIA_RESTAURACION_BACKUP.md)

---

## Resumen Rápido

Para restaurar un respaldo cifrado mediante el script automatizado (procesamiento seguro en *streaming* directo sin archivos temporales en texto plano):

```bash
/var/www/otorrinonet2/scripts/restore-db-otorrinonet.sh <archivo.dump.gz.gpg> [clave_privada.asc]
```

### Ejemplo con variable de entorno (Recomendado)

```bash
export GPG_PASSPHRASE="MiContrasenaSeguraGPG"
/var/www/otorrinonet2/scripts/restore-db-otorrinonet.sh \
  /var/backups/otorrinonet/diario/otorrinonet_2026-05-18.dump.gz.gpg \
  /ruta/a/clave_privada.asc
```

> [!NOTE]
> La contraseña nunca debe pasarse como argumento de línea de comandos para evitar que quede visible en el historial del shell (`~/.bash_history`) o en la lista de procesos (`ps aux`).

