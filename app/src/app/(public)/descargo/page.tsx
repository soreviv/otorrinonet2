import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/sitio-publico/LegalPageShell'

export const metadata: Metadata = {
  title: 'Descargo de Responsabilidad · Dr. Alejandro Viveros Domínguez',
  description: 'Información sobre la limitación de responsabilidad del sitio web del Dr. Viveros Domínguez.',
  alternates: { canonical: '/descargo' },
}

export default function DescargoDePage() {
  return (
    <LegalPageShell
      title="Descargo de Responsabilidad"
      updatedAt="Última actualización: 7 de mayo de 2026"
      breadcrumb={{ label: 'Descargo de Responsabilidad', href: '/descargo' }}
    >
      <p>
        El Dr. Alejandro Viveros Domínguez le otorga acceso a{' '}
        <a href="https://www.otorrinonet.com">www.otorrinonet.com</a>{' '}
        y lo invita a consultar los servicios que se ofrecen aquí.
      </p>

      <section>
        <h2>Responsabilidad limitada</h2>
        <p>
          El Dr. Viveros Domínguez se esfuerza por actualizar y complementar el contenido de este
          sitio de forma regular. A pesar de su cuidado y atención, el contenido puede estar
          incompleto o incorrecto. Los materiales se ofrecen sin ningún tipo de garantía sobre su
          exactitud y pueden cambiarse en cualquier momento sin previo aviso.
        </p>
        <p>
          El Dr. Viveros Domínguez no asumirá ninguna responsabilidad por los hipervínculos a sitios
          web o servicios de terceros incluidos en la plataforma. Si bien se esfuerza por proporcionar
          solo enlaces de calidad a sitios útiles y éticos, no tiene control sobre el contenido y la
          naturaleza de esos sitios externos.
        </p>
        <p>
          Cuando abandone este sitio, otros sitios pueden tener diferentes políticas de privacidad y
          términos de servicio. Le recomendamos consultarlos antes de proporcionar cualquier información.
        </p>
      </section>

      <section>
        <h2>Contenido médico e informativo</h2>
        <p>
          Toda la información médica publicada en este sitio —incluyendo descripciones de padecimientos,
          procedimientos, vacunas y recomendaciones de salud— tiene un propósito exclusivamente
          informativo y divulgativo. <strong>Dicha información no sustituye, bajo ninguna circunstancia,
          la evaluación, el diagnóstico ni el tratamiento por parte de un médico calificado.</strong>
        </p>
        <p>
          Ante cualquier duda sobre su estado de salud o el de un familiar, le recomendamos acudir a
          consulta médica presencial. La relación médico-paciente se establece únicamente a partir de
          la primera consulta presencial.
        </p>
      </section>

      <section>
        <h2>Errores y omisiones</h2>
        <p>
          El Dr. Viveros Domínguez no es responsable de ningún contenido, código o cualquier otra
          imprecisión en este sitio, y no ofrece garantías sobre su exactitud o vigencia.
        </p>
        <p>
          En ningún caso será responsable de ningún daño especial, directo, indirecto, consecuente o
          incidental que surja de o en conexión con el uso del sitio o su contenido. Se reserva el
          derecho de realizar adiciones, eliminaciones o modificaciones al contenido en cualquier
          momento sin previo aviso.
        </p>
      </section>

      <section>
        <h2>Disponibilidad del servicio</h2>
        <p>
          El sitio y su contenido se proporcionan &ldquo;tal cual&rdquo; y &ldquo;según esté disponible&rdquo; sin ninguna
          garantía de ningún tipo, ya sea expresa o implícita. No se garantiza que el servicio sea
          ininterrumpido, oportuno o libre de errores.
        </p>
      </section>

      <section>
        <h2>Cambios en este descargo</h2>
        <p>
          Podemos actualizar o enmendar este documento para que refleje con precisión nuestro servicio
          y nuestras políticas. Los cambios se publicarán de manera destacada en esta página. Si
          continúa utilizando el sitio, estará sujeto al descargo actualizado.
        </p>
      </section>

      <section>
        <h2>Contáctenos</h2>
        <p>
          Si tiene alguna pregunta sobre este Descargo de Responsabilidad, puede contactarnos en{' '}
          <a href="mailto:contacto@otorrinonet.com">contacto@otorrinonet.com</a>.
        </p>
      </section>
    </LegalPageShell>
  )
}
