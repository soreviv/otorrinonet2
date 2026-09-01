# Guía de Despliegue con Docker — OtorrinoNet

Esta guía describe cómo construir, ejecutar y mantener OtorrinoNet en producción o desarrollo utilizando **Docker** y **Docker Compose**.

---

## 1. Requisitos Previos

- **Docker Engine** 24.0+
- **Docker Compose** v2+
- Archivo `.env` configurado con las variables requeridas (ver `.env.example`).

---

## 2. Estructura de Archivos

- **`Dockerfile`**: Compilación multi-etapa (*multi-stage build*) con Node.js 20 Alpine. Utiliza el modo `output: "standalone"` de Next.js para generar una imagen ligera (< 200 MB), segura (ejecuta con usuario no-root `nextjs`) y con healthchecks integrados.
- **`.dockerignore`**: Optimiza el contexto de construcción excluyendo `node_modules`, archivos `.env`, suites de test y documentación.
- **`docker-compose.yml`**: Orquesta el contenedor de la aplicación (`otorrinonet-app`) en el puerto 5000 y, opcionalmente, un contenedor PostgreSQL 16 (`otorrinonet-db`).

---

## 3. Despliegue con Docker Compose

### Opción A: Base de datos en contenedor incluido (Full-Stack)

1. **Configurar el archivo `.env`:**
   Asegúrate de que `DATABASE_URL` apunte al servicio de PostgreSQL del compose:
   ```env
   DATABASE_URL="postgresql://otorrinonet:otorrinonet_secret_pass@postgres:5432/otorrinonet?schema=public"
   ```

2. **Iniciar los servicios:**
   ```bash
   docker compose up -d --build
   ```

3. **Sincronizar el esquema de base de datos (primera vez o tras cambios):**
   ```bash
   docker compose exec app npx prisma db push
   # Opcional: Cargar datos iniciales (seed)
   docker compose exec app npm run db:seed
   ```

4. **Verificar el estado:**
   ```bash
   docker compose ps
   docker compose logs -f app
   ```

---

### Opción B: Base de datos externa (PostgreSQL en el host VPS o gestionado)

Si ya tienes PostgreSQL corriendo en el servidor (fuera de Docker) o en un servicio administrado:

1. **Configurar `.env` con la IP/Host accesible:**
   ```env
   # En Linux, host.docker.internal o la IP local/privada de la BD
   DATABASE_URL="postgresql://usuario:password@172.17.0.1:5432/otorrinonet?schema=public"
   ```

2. **Iniciar únicamente el servicio de la aplicación:**
   ```bash
   docker compose up -d --build app
   ```

---

## 4. Construcción y Ejecución Manual con Docker CLI

Si prefieres gestionar el contenedor directamente sin Compose:

```bash
# 1. Construir la imagen
docker build -t otorrinonet:latest .

# 2. Ejecutar el contenedor
docker run -d \
  --name otorrinonet \
  --restart unless-stopped \
  -p 5000:5000 \
  --env-file .env \
  otorrinonet:latest

# 3. Ver logs
docker logs -f otorrinonet
```

---

## 5. Integración con Nginx (Reverse Proxy)

Si utilizas Nginx en el host para terminar SSL (Let's Encrypt / Certbot), la configuración apunta directamente al puerto `5000` publicado por el contenedor:

```nginx
server {
    server_name otorrinonet.com www.otorrinonet.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 6. Procedimiento de Actualización en Producción

Para desplegar una nueva versión sin interrupciones prolongadas:

```bash
# 1. Obtener los cambios del repositorio
git pull origin master

# 2. Reconstruir y reiniciar el contenedor
docker compose up -d --build app

# 3. (Si hubo cambios en schema.prisma) Sincronizar la BD
docker compose exec app npx prisma db push

# 4. Limpiar imágenes huérfanas/antiguas
docker image prune -f
```

---

## 7. Comandos Útiles

| Acción | Comando |
|---|---|
| Ver logs en tiempo real | `docker compose logs -f app` |
| Reiniciar aplicación | `docker compose restart app` |
| Detener todos los servicios | `docker compose down` |
| Entrar a la shell del contenedor | `docker compose exec app sh` |
| Inspeccionar consumo de recursos | `docker stats otorrinonet-app` |
