---
name: infraestructura-vps
description: Configuración de infraestructura del VPS de OtorrinoNet (PM2, nginx) — úsalo al tocar el proceso PM2, la config de nginx, o depurar cómo se sirve la app en producción.
---

## Infraestructura (VPS)

- **PM2**: proceso `otorrinonet` — `npm run start -- -p 5000` en `/var/www/otorrinonet2/app`.
- **nginx**: config activa en `/etc/nginx/sites-enabled/otorrinonet.conf` (symlink a `sites-available/otorrinonet.conf`). `nginx.conf` incluye tanto `conf.d/*.conf` como `sites-enabled/*` — editar el archivo en `sites-available/`, nunca el symlink.
  - `/_next/static/` → `alias` a `.next/static/` (archivos estáticos servidos desde disco, no proxeados).
  - `/assets/` → `root` en `public/`.
  - Todo lo demás → proxy a `127.0.0.1:5000`.
  - `conf.d/` también tiene configs de correo (`mail.otorrinonet.conf`) y `sites-enabled/` tiene `mta-sts.conf` para el correo autohospedado.
