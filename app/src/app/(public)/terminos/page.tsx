import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/sitio-publico/LegalPageShell'

export const metadata: Metadata = {
  title: 'Términos y Condiciones · Dr. Alejandro Viveros Domínguez',
  description: 'Condiciones de uso del sitio web del Dr. Alejandro Viveros Domínguez, otorrinolaringólogo en CDMX.',
  alternates: { canonical: '/terminos' },
}

export default function TerminosPage() {
  return (
    <LegalPageShell
      title="Términos y Condiciones"
      updatedAt="Última actualización: 6 de mayo de 2026"
      breadcrumb={{ label: 'Términos y Condiciones', href: '/terminos' }}
    >
      <p>
        Bienvenido a{' '}
        <a href="https://www.otorrinonet.com">www.otorrinonet.com</a>,
        sitio web del Dr. Alejandro Viveros Domínguez, médico especialista en
        Otorrinolaringología. Al acceder y utilizar este sitio web, usted acepta quedar
        vinculado por los presentes Términos y Condiciones. Si no está de acuerdo con
        alguno de ellos, le pedimos que se abstenga de utilizar este sitio.
      </p>

      <section>
        <h2>1. Identificación del responsable</h2>
        <p>El titular y responsable del presente sitio web es:</p>
        <ul className="not-prose list-none space-y-1.5 text-slate-700 dark:text-slate-300 text-base mt-3">
          <li><strong>Nombre:</strong> Dr. Alejandro Viveros Domínguez</li>
          <li><strong>Especialidad:</strong> Otorrinolaringología</li>
          <li><strong>Domicilio:</strong> Chosica 730, Colonia Lindavista, C.P. 07300, Alcaldía Gustavo A. Madero, Ciudad de México</li>
          <li><strong>Correo electrónico:</strong>{' '}
            <a href="mailto:contacto@otorrinonet.com" className="text-sky-600 underline">contacto@otorrinonet.com</a>
          </li>
          <li><strong>Sitio web:</strong>{' '}
            <a href="https://www.otorrinonet.com" className="text-sky-600 underline">www.otorrinonet.com</a>
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Objeto y descripción del sitio</h2>
        <p>
          Este sitio web tiene como finalidad proporcionar información general sobre los servicios
          médicos de otorrinolaringología que ofrece el Dr. Alejandro Viveros Domínguez, así como
          facilitar la solicitud de citas médicas en línea. El sitio no constituye en ningún caso
          una plataforma de diagnóstico, tratamiento o prescripción médica a distancia.
        </p>
      </section>

      <section>
        <h2>3. Carácter informativo del contenido médico</h2>
        <p>
          Toda la información médica publicada en este sitio —incluyendo descripciones de
          padecimientos, procedimientos, vacunas y recomendaciones de salud— tiene un propósito
          exclusivamente informativo y divulgativo. Dicha información no sustituye, bajo ninguna
          circunstancia, la evaluación, el diagnóstico ni el tratamiento por parte de un médico
          calificado.
        </p>
        <p>
          Ante cualquier duda sobre su estado de salud o el de un familiar, le recomendamos
          acudir a consulta médica presencial. La relación médico-paciente se establece únicamente
          a partir de la primera consulta presencial con el Dr. Viveros Domínguez.
        </p>
      </section>

      <section>
        <h2>4. Agendado de citas en línea</h2>
        <p>
          El sistema de agendado en línea disponible en este sitio permite solicitar una cita
          médica sujeta a disponibilidad. La solicitud de cita no garantiza por sí misma la
          confirmación del servicio hasta que el consultorio notifique su aceptación.
        </p>
        <p>
          Para agendar una cita usted deberá proporcionar datos personales verídicos y actualizados.
          El uso de datos falsos o de terceros sin su autorización queda estrictamente prohibido.
        </p>
        <p>
          En caso de que usted no pueda asistir a su cita, le solicitamos cancelarla o reagendarla
          con al menos 24 horas de anticipación a través de los canales de contacto disponibles
          en este sitio, a fin de liberar el espacio para otros pacientes.
        </p>
      </section>

      <section>
        <h2>5. Uso aceptable del sitio</h2>
        <p>
          El usuario se compromete a utilizar este sitio web de conformidad con la ley, la moral y
          el orden público, y se obliga a abstenerse de:
        </p>
        <ul>
          <li>Utilizar el sitio con fines ilícitos o contrarios a los presentes Términos.</li>
          <li>Introducir o difundir virus informáticos o cualquier otro sistema que pueda dañar el sitio.</li>
          <li>Intentar acceder sin autorización a áreas restringidas del sitio o sus sistemas.</li>
          <li>Reproducir, distribuir o modificar los contenidos del sitio sin autorización expresa.</li>
          <li>Hacerse pasar por otra persona o entidad al utilizar los formularios del sitio.</li>
        </ul>
      </section>

      <section>
        <h2>6. Propiedad intelectual</h2>
        <p>
          Todos los contenidos de este sitio web —incluyendo textos, imágenes, logotipos, diseño
          gráfico, código fuente y elementos audiovisuales— son propiedad del Dr. Alejandro
          Viveros Domínguez o de sus respectivos titulares, y están protegidos por la legislación
          mexicana e internacional sobre propiedad intelectual.
        </p>
        <p>
          Queda prohibida la reproducción total o parcial de los contenidos del sitio sin
          autorización escrita del titular. Se permite la visualización y descarga de contenidos
          para uso personal, no comercial, siempre que se mantenga la atribución correspondiente.
        </p>
      </section>

      <section>
        <h2>7. Limitación de responsabilidad</h2>
        <p>
          El Dr. Viveros Domínguez no será responsable por daños directos, indirectos, incidentales
          o consecuentes derivados del uso o la imposibilidad de uso de este sitio, incluyendo
          interrupciones del servicio, errores u omisiones en el contenido, o acceso no autorizado
          a los datos del usuario por parte de terceros ajenos al consultorio.
        </p>
        <p>
          Este sitio puede contener enlaces a sitios web de terceros. Dichos enlaces se proporcionan
          únicamente para conveniencia del usuario; el Dr. Viveros Domínguez no controla ni avala
          el contenido de esos sitios y no asume responsabilidad alguna por su uso.
        </p>
      </section>

      <section>
        <h2>8. Protección de datos personales</h2>
        <p>
          El tratamiento de los datos personales que usted proporcione a través de este sitio se
          rige por nuestro{' '}
          <a href="/privacidad">Aviso de Privacidad</a>,
          el cual cumple con la Ley Federal de Protección de Datos Personales en Posesión de los
          Particulares (LFPDPPP) y su Reglamento. Le invitamos a leerlo detenidamente.
        </p>
      </section>

      <section>
        <h2>9. Modificaciones</h2>
        <p>
          Nos reservamos el derecho de modificar los presentes Términos y Condiciones en cualquier
          momento. Los cambios entrarán en vigor en el momento de su publicación en este sitio.
          El uso continuado del sitio tras la publicación de las modificaciones implica la
          aceptación de los nuevos términos. Le recomendamos revisar periódicamente esta página.
        </p>
      </section>

      <section>
        <h2>10. Legislación aplicable y jurisdicción</h2>
        <p>
          Los presentes Términos y Condiciones se rigen e interpretan de conformidad con las leyes
          vigentes en los Estados Unidos Mexicanos. Para la resolución de cualquier controversia
          derivada del uso de este sitio, las partes se someten expresamente a la jurisdicción de
          los tribunales competentes de la Ciudad de México, renunciando a cualquier otro fuero que
          pudiera corresponderles en razón de su domicilio presente o futuro.
        </p>
      </section>

      <section>
        <h2>11. Contáctenos</h2>
        <p>
          Si tiene alguna pregunta sobre estos Términos y Condiciones, puede contactarnos a través
          de los siguientes medios:
        </p>
        <ul>
          <li>Correo electrónico: <a href="mailto:contacto@otorrinonet.com">contacto@otorrinonet.com</a></li>
          <li>Domicilio: Chosica 730, Colonia Lindavista, C.P. 07300, Alcaldía Gustavo A. Madero, Ciudad de México</li>
        </ul>
      </section>
    </LegalPageShell>
  )
}
