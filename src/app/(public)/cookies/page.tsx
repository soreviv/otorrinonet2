import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/sitio-publico/LegalPageShell'

export const metadata: Metadata = {
  title: 'Política de Cookies · Dr. Alejandro Viveros Domínguez',
  description: 'Uso de cookies y tecnologías de rastreo en el sitio web del Dr. Viveros Domínguez.',
  alternates: { canonical: '/cookies' },
}

export default function CookiesPage() {
  return (
    <LegalPageShell
      title="Política de Cookies"
      updatedAt="Última actualización: 7 de mayo de 2026"
      breadcrumb={{ label: 'Política de Cookies', href: '/cookies' }}
    >
      <section>
        <h2>¿Qué es una cookie?</h2>
        <p>
          Una cookie es un pequeño archivo de texto que se almacena en su computadora u otro dispositivo
          conectado a Internet para identificar su navegador, proporcionar análisis y recordar información
          sobre usted, como su preferencia de idioma. Son completamente seguras y no se pueden utilizar
          para ejecutar programas o enviar virus a su dispositivo.
        </p>
      </section>

      <section>
        <h2>¿Por qué utilizamos cookies?</h2>
        <p>Usamos cookies propias y de terceros en nuestra plataforma para varios propósitos:</p>
        <ul>
          <li>Para facilitar el funcionamiento y la funcionalidad básica del sitio.</li>
          <li>Para mejorar su experiencia de navegación y hacerla más rápida.</li>
          <li>Para entender cómo se utiliza el sitio y cuál es la mejor forma de mejorarlo.</li>
          <li>Para analizar la efectividad de nuestras comunicaciones.</li>
        </ul>
      </section>

      <section>
        <h2>Tipos de cookies que utilizamos</h2>

        <h3>Cookies esenciales</h3>
        <p>
          Estrictamente necesarias para habilitar funciones básicas como la seguridad y la gestión
          de preferencias. Sin ellas, no podría utilizar los servicios básicos del sitio.
        </p>

        <h3>Cookies analíticas</h3>
        <p>
          Nos permiten entender cómo los visitantes interactúan con el sitio. Usamos Google Analytics
          (GA4) para recopilar datos de uso de forma agregada y anónima. Estas cookies solo se activan
          si usted otorga su consentimiento.
        </p>

        <h3>Cookies de marketing</h3>
        <p>
          Se utilizan para adaptar la publicidad en línea a sus intereses y medir la efectividad de
          campañas. Solo se activan si usted otorga su consentimiento explícito.
        </p>
      </section>

      <section>
        <h2>Google Consent Mode v2</h2>
        <p>
          Este sitio implementa Google Consent Mode v2. Esto significa que Google Analytics carga
          desde el primer momento, pero <strong>sin guardar cookies de identificación</strong> hasta
          que usted acepte. Si rechaza, GA4 sigue midiendo visitas de forma agregada sin rastrear
          su identidad ni su comportamiento individual.
        </p>
      </section>

      <section>
        <h2>¿Cómo administrar sus preferencias de cookies?</h2>
        <p>
          Al visitar este sitio por primera vez verá un banner de cookies donde puede elegir aceptar
          todas las cookies, rechazarlas o personalizar su elección por categoría. Su preferencia se
          guarda durante 12 meses.
        </p>
        <p>
          También puede controlar las cookies directamente desde la configuración de su navegador.
          Tenga en cuenta que deshabilitar ciertas cookies puede afectar la funcionalidad del sitio.
        </p>
      </section>

      <section>
        <h2>Cambios en esta política</h2>
        <p>
          Podemos actualizar esta Política de Cookies para reflejar cambios en nuestro servicio o en
          la normativa aplicable. Si continúa utilizando el sitio tras la publicación de cambios,
          se considerará que acepta la política actualizada.
        </p>
      </section>

      <section>
        <h2>Contáctenos</h2>
        <p>
          Si tiene alguna pregunta sobre nuestra Política de Cookies, puede contactarnos en{' '}
          <a href="mailto:contacto@otorrinonet.com">contacto@otorrinonet.com</a>.
        </p>
      </section>

      <section>
        <h2>Más información sobre las cookies</h2>
        <p>
          Si desea ampliar su conocimiento sobre qué son las cookies, cómo funcionan y cómo
          gestionarlas,{' '}
          <a
            href="http://mzl.la/1BAQyo7"
            target="_blank"
            rel="noopener noreferrer"
          >
            puede hacer clic aquí para acceder a una guía detallada
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  )
}
