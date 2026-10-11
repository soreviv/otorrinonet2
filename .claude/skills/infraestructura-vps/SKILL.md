---
name: infraestructura-vps
description: Configuración de infraestructura del VPS de OtorrinoNet (PM2, nginx) — úsalo al tocar el proceso PM2, la config de nginx, o depurar cómo se sirve la app en producción.
---

## Infraestructura (VPS)

- **PM2**: proceso `otorrinonet` declarado en `ecosystem.config.cjs` (raíz del repo) — `bash -c "npm run start -- -p 5000"` con `cwd` en `/var/www/otorrinonet2`, `NODE_ENV=production`, `max_memory_restart: 512M`. Ciclo de vida: `pm2 start ecosystem.config.cjs && pm2 save`; después de un rebuild, `pm2 restart otorrinonet`. El `args` debe ser un **arreglo** (`['-c', 'npm run start -- -p 5000']`): como string, PM2 lo parte en tokens y ejecuta `bash -c npm` en crash-loop. `pm2 startup` + `pm2-ubuntu.service` restauran el proceso al boot vía `~/.pm2/dump.pm2`.
- **nginx**: config activa en `/etc/nginx/sites-enabled/otorrinonet.conf` (symlink a `sites-available/otorrinonet.conf`). `nginx.conf` incluye tanto `conf.d/*.conf` como `sites-enabled/*` — editar el archivo en `sites-available/`, nunca el symlink.
  - `/_next/static/` → `alias` a `.next/static/` (archivos estáticos servidos desde disco, no proxeados).
  - `/assets/` → `root` en `public/`.
  - Todo lo demás → proxy a `127.0.0.1:5000`.
  - `conf.d/` también tiene configs de correo (`mail.otorrinonet.conf`) y `sites-enabled/` tiene `mta-sts.conf` para el correo autohospedado.
