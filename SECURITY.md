# Política de Seguridad

## Versiones soportadas

| Versión | Soporte de seguridad |
|---|---|
| main (actual) | Activo |

## Reportar una vulnerabilidad

Si descubres una vulnerabilidad de seguridad en este proyecto, por favor repórtala de forma responsable **sin divulgarla públicamente** hasta que haya sido atendida.

**Contacto:** drviverosorl@gmail.com

Incluye en tu reporte:

- Descripción detallada de la vulnerabilidad
- Pasos para reproducirla
- Impacto potencial
- Sugerencia de mitigación (opcional)

Recibirás una respuesta en un plazo máximo de **72 horas**. Una vez confirmada y corregida la vulnerabilidad, se reconocerá tu contribución responsable.

## Alcance

Este sistema maneja información clínica protegida (ICP) de pacientes. Las siguientes áreas son de especial interés para reporte:

- Autenticación y gestión de sesiones (JWT, TOTP 2FA)
- Control de acceso basado en roles (médico, enfermera, recepcionista)
- Exposición de datos de pacientes o expedientes clínicos
- Inyección SQL u otras vulnerabilidades de acceso a base de datos
- Bypass del registro de auditoría (bitácora LFPDPPP)
- Exportación no autorizada de datos FHIR

## Fuera de alcance

- Ataques de denegación de servicio (DoS/DDoS)
- Vulnerabilidades en dependencias de terceros ya reportadas en sus repositorios oficiales
- Problemas de configuración de infraestructura no relacionados con el código fuente

## Normativa aplicable

Este sistema cumple con **LFPDPPP**, **NOM-004-SSA3** y **NOM-024-SSA3**. Las vulnerabilidades que comprometan la confidencialidad o integridad de expedientes clínicos se tratarán con máxima prioridad.
