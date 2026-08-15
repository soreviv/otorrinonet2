---
name: certificacion-nom024
description: Contexto y estado del proceso de certificación NOM-024-SSA3-2012 (SIRES/DGIS) de OtorrinoNet — úsalo al trabajar en CURP/catálogos DGIS/CIE-10, GIIS-B015, GIIS-A004/SGSI, o al responder preguntas sobre el estado de la certificación.
---

## Certificación NOM-024-SSA3-2012 (en curso)

El sistema está en proceso de certificarse como SIRES ante la DGIS (Secretaría de Salud). Ver plan completo en la memoria del proyecto.

**4 tracks de implementación:**

1. **Track 1 ✅ Implementado** — Datos mínimos del paciente: CURP, sexo CURP, sexo biológico, género, derechohabiencia, entidad de nacimiento, indicadores indígena/afromexicano/migrante en modelo `Patient`.
2. **Track 2 ✅ Implementado** — Catálogos fundamentales: CIE-10 en diagnósticos de notas clínicas, CLUES del consultorio, catálogos DGIS.
3. **Track 3 ✅ Implementado** — GIIS-B015 Consulta Externa: somatometría + signos vitales en nota clínica, generador SIS-CEX en `src/app/api/dgis/exportar-cex/`, UI en `src/app/staff/dgis/`.
4. **Track 4 🔄 En documentación** — GIIS-A004 SGSI: 11 dominios ISO 27799, Declaración de Aplicabilidad (DDA), políticas. Requiere 6 meses de madurez antes de la verificación ante DGIS.

**Reglas críticas GIIS-B015:** nombres en MAYÚSCULAS sin acentos (A-Z + Ñ). Máx 15% CURP genérica. Máx 5% diagnóstico R69X.

**Contacto DGIS:** angel.serrano@salud.gob.mx / blanca.pinette@salud.gob.mx · +52 55 6392 2300 ext. 52584
