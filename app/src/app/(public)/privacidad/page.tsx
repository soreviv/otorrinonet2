import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/sitio-publico/LegalPageShell'

export const metadata: Metadata = {
  title: 'Aviso de Privacidad · Dr. Alejandro Viveros Domínguez',
  description: 'Tratamiento de datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.',
  alternates: { canonical: '/privacidad' },
}

export default function AvisoPrivacidadPage() {
  return (
    <LegalPageShell
      title="Aviso de Privacidad"
      updatedAt="Última actualización: 11 de diciembre de 2025"
      breadcrumb={{ label: 'Aviso de Privacidad', href: '/privacidad' }}
    >
      <p>
        Alejandro Viveros Domínguez con domicilio en Chosica 730, Colonia Lindavista, C.P. 07300,
        Alcaldía Gustavo A. Madero en la Ciudad de México y portal de internet{' '}
        <a href="https://www.otorrinonet.com">www.otorrinonet.com</a>,
        es el responsable del uso y protección de sus datos personales conforme a este aviso de privacidad.
      </p>

      <section>
        <h2>¿Para qué fines utilizaremos sus datos personales?</h2>
        <p>
          Los datos personales que recabamos de usted los utilizaremos para las siguientes finalidades
          que son necesarias para el servicio que solicita:
        </p>
        <ul>
          <li>La creación, estudio, análisis, actualización y conservación del expediente clínico.</li>
          <li>La facturación y cobranza por la prestación de los servicios.</li>
        </ul>
        <p>
          De manera adicional, utilizaremos su información personal para las siguientes finalidades
          secundarias que no son necesarias para el servicio solicitado, pero que nos permiten y
          facilitan brindarle una mejor atención:
        </p>
        <ul>
          <li>Para la investigación y estadísticas relacionadas con la salud.</li>
          <li>Mercadotecnia o publicitaria.</li>
        </ul>
        <p>
          En caso de que no desee que sus datos personales se utilicen para estos fines secundarios,
          indíquelo a continuación:
        </p>
        <p><strong>No consiento que mis datos personales se utilicen para los siguientes fines:</strong></p>
        <ul className="not-prose list-none space-y-1 text-slate-600 dark:text-slate-400 text-base">
          <li>[ &nbsp;] Para la investigación y estadísticas relacionadas con la salud.</li>
          <li>[ &nbsp;] Mercadotecnia o publicidad.</li>
        </ul>
        <p>
          La negativa para el uso de sus datos personales para estas finalidades no podrá ser un motivo
          para que le neguemos los servicios solicitados o contratados.
        </p>
      </section>

      <section>
        <h2>¿Qué datos personales utilizaremos para estos fines?</h2>
        <p>
          Para llevar a cabo las finalidades descritas en el presente aviso de privacidad, utilizaremos
          los siguientes datos personales:
        </p>
        <ul>
          <li>Datos de identificación</li>
          <li>Datos de contacto</li>
          <li>Datos sobre características físicas</li>
          <li>Datos laborales</li>
          <li>Datos académicos</li>
        </ul>
        <p>
          Además de los datos personales mencionados anteriormente, para las finalidades informadas
          en el presente aviso de privacidad utilizaremos los siguientes datos personales considerados
          como sensibles, que requieren de especial protección:
        </p>
        <ul>
          <li>Datos de salud</li>
          <li>Datos sobre vida sexual</li>
          <li>Datos de origen étnico o racial</li>
          <li>Datos sobre creencias religiosas</li>
        </ul>
      </section>

      <section>
        <h2>¿Con quién compartimos su información personal y para qué fines?</h2>
        <p>
          Le informamos que sus datos personales son compartidos dentro y fuera del país con las
          siguientes personas, empresas, organizaciones o autoridades distintas a nosotros:
        </p>
        <div className="not-prose mt-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <th className="text-left px-4 py-3 font-semibold border-b border-slate-200 dark:border-slate-700">Destinatario</th>
                <th className="text-left px-4 py-3 font-semibold border-b border-slate-200 dark:border-slate-700">Finalidad</th>
                <th className="text-left px-4 py-3 font-semibold border-b border-slate-200 dark:border-slate-700">Consentimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <td className="px-4 py-3">Secretaría de Salud local</td>
                <td className="px-4 py-3">Cumplimiento de obligaciones sanitarias que impone la ley.</td>
                <td className="px-4 py-3">No requerido</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Su aseguradora</td>
                <td className="px-4 py-3">Trámites correspondientes para la intervención del seguro.</td>
                <td className="px-4 py-3">Sí</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Servicio de Administración Tributaria</td>
                <td className="px-4 py-3">Facturación en cumplimiento de disposiciones fiscales.</td>
                <td className="px-4 py-3">No requerido</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>¿Cómo puede acceder, rectificar o cancelar sus datos personales, u oponerse a su uso?</h2>
        <p>
          Usted tiene derecho a conocer qué datos personales tenemos, para qué los utilizamos y las
          condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de
          su información personal en caso de que esté desactualizada, sea inexacta o incompleta
          (Rectificación); que la eliminemos de nuestros registros o bases de datos cuando considere que
          la misma no está siendo utilizada adecuadamente (Cancelación); así como oponerse al uso de sus
          datos personales para fines específicos (Oposición). Estos derechos se conocen como derechos ARCO.
        </p>
        <p>
          Para el ejercicio de cualquiera de los derechos ARCO, usted deberá enviar la solicitud
          respectiva en escrito libre y anexando copia de su identificación oficial al correo electrónico{' '}
          <a href="mailto:contacto@otorrinonet.com">contacto@otorrinonet.com</a>.
        </p>
        <p>
          Los datos de contacto del responsable de datos personales: Lic. Jorge Moreno Loza, con
          domicilio en calle Río Hudson No. 25 Int. 102, Colonia Cuauhtémoc, Alcaldía Cuauhtémoc,
          C.P. 06500, Ciudad de México, México.
        </p>
        <p>
          Cualquier respuesta sobre los derechos ARCO o la revocación de su consentimiento se le
          informará en un plazo máximo de 5 (cinco) días hábiles al correo electrónico que haya
          proporcionado o a través del cual se haya recibido su solicitud.
        </p>
      </section>

      <section>
        <h2>El uso de tecnologías de rastreo en nuestro portal de internet</h2>
        <p>
          Le informamos que en nuestra página de internet utilizamos cookies, web beacons u otras
          tecnologías, a través de las cuales es posible monitorear su comportamiento como usuario de
          internet, así como brindarle un mejor servicio y experiencia al navegar en nuestra página.
          Los datos personales que recabamos a través de estas tecnologías, los utilizaremos para los
          siguientes fines: para proveer los servicios y productos afines que ofrecemos, así como
          actividades afines.
        </p>
        <p>
          Los datos personales que obtenemos de estas tecnologías de rastreo son los siguientes:
          identificadores (nombre de usuario), idioma preferido por el usuario, región en la que se
          encuentra el usuario, tipo de navegador del usuario, tipo de sistema operativo del usuario.
          Estas tecnologías podrán deshabilitarse en la configuración de su navegador.
        </p>
      </section>

      <section>
        <h2>¿Cómo puede conocer los cambios en este aviso de privacidad?</h2>
        <p>
          El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones
          derivadas de nuevos requerimientos legales; de nuestras propias necesidades por los productos
          o servicios que ofrecemos; de nuestras prácticas de privacidad; de cambios en nuestro modelo
          de negocio, o por otras causas. Nos comprometemos a mantenerlo informado sobre los cambios
          que pueda sufrir el presente aviso de privacidad, a través de la publicación impresa del nuevo
          aviso en el consultorio, publicación en el portal de internet{' '}
          <a href="https://www.otorrinonet.com">www.otorrinonet.com</a>{' '}
          y/o a través de un comunicado a su correo electrónico.
        </p>
      </section>

      <section>
        <h2>Usted puede revocar su consentimiento para el uso de sus datos personales</h2>
        <p>
          Usted puede revocar el consentimiento que, en su caso, nos haya otorgado para el tratamiento
          de sus datos personales. Sin embargo, es importante que tenga en cuenta que no en todos los
          casos podremos atender su solicitud o concluir el uso de forma inmediata, ya que es posible
          que por alguna obligación legal requiramos seguir tratando sus datos personales. Asimismo,
          usted deberá considerar que para ciertos fines, la revocación de su consentimiento implicará
          que no le podamos seguir prestando el servicio que nos solicitó o la conclusión de su relación
          con nosotros.
        </p>
        <p>
          Para revocar su consentimiento, usted deberá enviar la solicitud respectiva en escrito libre
          y anexando copia de su identificación oficial al correo electrónico{' '}
          <a href="mailto:contacto@otorrinonet.com">contacto@otorrinonet.com</a>.
        </p>
      </section>

      <section>
        <h2>Consentimiento del padre o tutor</h2>
        <p>
          Es de nuestro especial interés cuidar la información personal de los menores de edad y
          personas en estado de interdicción por lo que de ser necesario, solicitaremos la obtención
          del consentimiento del uso de sus datos personales a los padres o tutores.
        </p>
      </section>
    </LegalPageShell>
  )
}
