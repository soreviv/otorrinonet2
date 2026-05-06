import type { Metadata } from 'next'
import { PublicHeader } from '@/components/sitio-publico/PublicHeader'
import { PublicFooter } from '@/components/sitio-publico/PublicFooter'

export const metadata: Metadata = {
  title: 'Descargo de Responsabilidad · Dr. Alejandro Viveros Domínguez',
  description: 'Información sobre la limitación de responsabilidad del sitio web del Dr. Viveros Domínguez.',
  alternates: { canonical: '/descargo' },
}

export default function DescargoDePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans antialiased flex flex-col">
      <PublicHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        Descargo de Responsabilidad
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-10">
        Actualizado el 6 de febrero de 2022
      </p>

      <div className="prose prose-slate dark:prose-invert max-w-none text-[15px] leading-relaxed space-y-6">

        <p className="text-slate-600 dark:text-slate-400">
          Dr. Viveros Otorrino por la presente le otorga acceso a{' '}
          <a href="https://www.otorrinonet.com" className="text-sky-600 underline">
            www.otorrinonet.com
          </a>{' '}
          (&ldquo;el sitio web&rdquo;) y lo invita a consultar los servicios que se ofrecen aquí.
        </p>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-8 mb-3">
            Definiciones y términos clave
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Para ayudar a explicar las cosas de la manera más clara posible en este Descargo de
            Responsabilidad, cada vez que se hace referencia a cualquiera de estos términos, se
            definen estrictamente como:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2 text-slate-600 dark:text-slate-400">
            <li>
              <strong className="text-slate-700 dark:text-slate-300">Cookie:</strong> pequeña cantidad
              de datos generados por un sitio web y guardados por su navegador web. Se utiliza para
              identificar su navegador, proporcionar análisis, recordar información sobre usted, como
              su preferencia de idioma o información de inicio de sesión.
            </li>
            <li>
              <strong className="text-slate-700 dark:text-slate-300">Compañía:</strong> cuando este
              Descargo de Responsabilidad menciona &ldquo;Compañía&rdquo;, &ldquo;nosotros&rdquo;,
              &ldquo;nos&rdquo; o &ldquo;nuestro&rdquo;, se refiere a Dr. Viveros Otorrino, que es
              responsable de su información en virtud de este Descargo de Responsabilidad.
            </li>
            <li>
              <strong className="text-slate-700 dark:text-slate-300">Plataforma:</strong> sitio web de
              Internet, aplicación web o aplicación digital de cara al público de Dr. Viveros Otorrino.
            </li>
            <li>
              <strong className="text-slate-700 dark:text-slate-300">Servicio:</strong> se refiere al
              servicio brindado por Dr. Viveros Otorrino como se describe en los términos relativos (si
              están disponibles) y en esta plataforma.
            </li>
            <li>
              <strong className="text-slate-700 dark:text-slate-300">Sitio web:</strong> el sitio de
              Dr. Viveros Otorrino, al que se puede acceder a través de esta URL:{' '}
              <a href="https://www.otorrinonet.com" className="text-sky-600 underline">
                www.otorrinonet.com
              </a>
            </li>
            <li>
              <strong className="text-slate-700 dark:text-slate-300">Usted:</strong> una persona o
              entidad que está registrada con Dr. Viveros Otorrino para utilizar los Servicios.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-8 mb-3">
            De Responsabilidad Limitada
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Dr. Viveros Otorrino se esfuerza por actualizar y/o complementar el contenido de la
            plataforma de forma regular. A pesar de nuestro cuidado y atención, el contenido puede
            estar incompleto y/o incorrecto.
          </p>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Los materiales ofrecidos en la plataforma se ofrecen sin ningún tipo de garantía o reclamo
            de su exactitud. Estos materiales se pueden cambiar en cualquier momento sin previo aviso
            de Dr. Viveros Otorrino.
          </p>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            En particular, todos los precios en la plataforma están sujetos a errores de escritura y
            programación. No se asume ninguna responsabilidad por las implicaciones de tales errores.
            No se concluye ningún acuerdo sobre la base de tales errores.
          </p>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Dr. Viveros Otorrino no asumirá ninguna responsabilidad por los hipervínculos a sitios web
            o servicios de terceros incluidos en la plataforma. Desde nuestra plataforma, puede visitar
            otros sitios web siguiendo los hipervínculos a dichos sitios externos. Si bien nos
            esforzamos por proporcionar solo enlaces de calidad a sitios web útiles y éticos, no
            tenemos control sobre el contenido y la naturaleza de estos sitios. Estos enlaces a otros
            sitios web no implican una recomendación para todo el contenido que se encuentra en estos
            sitios.
          </p>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            También tenga en cuenta que cuando abandona nuestra plataforma, otros sitios pueden tener
            diferentes políticas y términos de privacidad que no están a nuestro control. Asegúrese de
            consultar las Políticas de privacidad de estos sitios, así como sus &ldquo;Términos de
            servicio&rdquo; antes de participar en cualquier negocio o cargar cualquier información.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-8 mb-3">
            Descargo de Responsabilidad por Errores y Omisiones
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Dr. Viveros Otorrino no es responsable de ningún contenido, código o cualquier otra
            imprecisión.
          </p>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Dr. Viveros Otorrino no ofrece garantías.
          </p>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            En ningún caso Dr. Viveros Otorrino será responsable de ningún daño especial, directo,
            indirecto, consecuente o incidental o de cualquier daño, ya sea en una acción contractual,
            negligencia u otro agravio, que surja de o en conexión con el uso del Servicio o el
            contenido del Servicio. Dr. Viveros Otorrino se reserva el derecho de realizar adiciones,
            eliminaciones o modificaciones al contenido del Servicio en cualquier momento sin previo
            aviso.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-8 mb-3">
            Descargo de Responsabilidad General
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            El Servicio Dr. Viveros Otorrino y su contenido se proporcionan &ldquo;tal cual&rdquo; y
            &ldquo;según esté disponible&rdquo; sin ninguna garantía o representación de ningún tipo,
            ya sea expresa o implícita. Dr. Viveros Otorrino es un distribuidor y no un editor del
            contenido proporcionado por terceros; como tal, Dr. Viveros Otorrino no ejerce ningún
            control editorial sobre dicho contenido y no ofrece ninguna garantía o representación en
            cuanto a la precisión, confiabilidad o vigencia de cualquier información, contenido,
            servicio o mercancía proporcionada o accesible a través del Servicio de Dr. Viveros
            Otorrino.
          </p>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Sin limitar lo anterior, Dr. Viveros Otorrino renuncia específicamente a todas las
            garantías y representaciones en cualquier contenido transmitido en conexión con el Servicio
            o en los productos proporcionados como parte del mismo, incluidas, entre otras, las
            garantías de comerciabilidad, idoneidad para un propósito particular o no infracción de
            derechos de terceros. Ningún consejo oral o información escrita proporcionada por
            Dr. Viveros Otorrino o cualquiera de sus afiliados creará una garantía. La información
            sobre precios y disponibilidad está sujeta a cambios sin previo aviso. Dr. Viveros Otorrino
            no garantiza que el Servicio sea ininterrumpido, sin corrupción, oportuno o sin errores.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-8 mb-3">
            Su consentimiento
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Hemos actualizado nuestro Descargo de Responsabilidad para brindarle total transparencia
            sobre lo que se establece cuando visita nuestro sitio y cómo se utiliza. Al utilizar
            nuestra plataforma, registrar una cuenta o realizar una compra, por la presente acepta
            nuestro Descargo de Responsabilidad y acepta sus términos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-8 mb-3">
            Cambios en nuestro Descargo de Responsabilidad
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Podemos actualizar, enmendar o realizar cambios en este documento para que reflejen con
            precisión nuestro Servicio y nuestras políticas. A menos que la ley exija lo contrario,
            esos cambios se publicarán de manera destacada aquí. Si continúa utilizando el Servicio,
            estará sujeto al Descargo de Responsabilidad actualizado.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-8 mb-3">
            Contáctenos
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            No dude en ponerse en contacto con nosotros si tiene alguna pregunta sobre este Descargo
            de Responsabilidad.
          </p>
          <ul className="list-disc list-inside mt-2 text-slate-600 dark:text-slate-400">
            <li>
              A través de correo electrónico:{' '}
              <a href="mailto:contacto@otorrinonet.com" className="text-sky-600 underline">
                contacto@otorrinonet.com
              </a>
            </li>
          </ul>
        </section>

      </div>
      </main>
      <PublicFooter />
    </div>
  )
}
