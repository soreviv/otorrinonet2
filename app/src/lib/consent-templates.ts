// Catálogo de plantillas de consentimiento informado — NOM-004-SSA3-2012.
//
// Cada plantilla representa un procedimiento independiente. El texto es genérico
// (se refiere a "el paciente"); los datos personales, la fecha, el lugar y las
// líneas de firma se insertan al imprimir (ver src/lib/print-consent.ts).
//
// Formato del cuerpo: se serializa a texto plano con `renderTemplateToText()`.
//   - Los encabezados de sección se marcan con el prefijo "## ".
//   - Los párrafos se separan con una línea en blanco.
// Tanto la vista de detalle como la impresión parsean ese formato.

export interface ConsentTemplateSection {
  heading: string
  paragraphs: string[]
}

export interface ConsentTemplate {
  /** Identificador estable en kebab-case. */
  slug: string
  /** Nombre visible; se guarda en PatientConsent.tipoConsentimiento. */
  procedure: string
  /** Subtítulo corto para el selector. */
  descripcion: string
  /** Párrafo introductorio (opcional). */
  intro?: string
  /** Secciones clínicas específicas del procedimiento. */
  sections: ConsentTemplateSection[]
  /** Si requiere líneas para dos testigos en el bloque de firmas. */
  requiereTestigos: boolean
}

// ─── Bloques compartidos entre consentimientos quirúrgicos ────────────────────

/** Riesgo anestésico general — común a toda cirugía bajo anestesia general. */
const RIESGO_ANESTESIA =
  'No hay que ignorar, además de todo ello, las complicaciones propias de toda ' +
  'intervención quirúrgica, y las relacionadas con la anestesia general: a pesar de ' +
  'que se le ha realizado un completo estudio preoperatorio, y de que todas las ' +
  'maniobras quirúrgicas y anestésicas se realizan con el máximo cuidado, se ha ' +
  'descrito un caso de muerte por cada 15,000 intervenciones quirúrgicas realizadas ' +
  'bajo anestesia general, como consecuencia de esta. En general, este riesgo ' +
  'anestésico aumenta en relación con la edad, con la existencia de otras ' +
  'enfermedades, y con la gravedad de estas.'

/** Declaraciones estándar del paciente — común a los consentimientos quirúrgicos. */
const DECLARACIONES_QUIRURGICAS: ConsentTemplateSection = {
  heading: 'Declaraciones y firmas',
  paragraphs: [
    'Declaro que he sido informado, por el médico, de los aspectos más importantes de la intervención quirúrgica que se me va a realizar, de su normal evolución, de las posibles complicaciones y riesgos de esta, de sus contraindicaciones, de las consecuencias que se derivarían en el caso de que no me sometiera a la mencionada intervención y de las alternativas a esta técnica quirúrgica.',
    'Estoy satisfecho de la información recibida. He podido formular todas las preguntas que he creído conveniente y me han sido aclaradas todas las dudas planteadas.',
    'Declaro, además, no haber ocultado información esencial sobre mi caso, mis hábitos o régimen de vida, que pudieran ser relevantes a los médicos que me atienden.',
    'Acepto que, durante la intervención, el cirujano pueda tomar las muestras biológicas que considere necesarias para el estudio de mi proceso, o las imágenes precisas para la adecuada documentación del caso.',
    'Comprendo que, a pesar de las numerosas y esmeradas medidas de higiene del equipo asistencial que me atiende, el acto quirúrgico y la estancia en el hospital son un factor de las llamadas infecciones hospitalarias, que son excepcionales, pero posibles.',
    'En el caso de que, durante la intervención quirúrgica, el cirujano descubra aspectos de mi enfermedad, o de otras enfermedades que pudiera padecer, que le exijan o le aconsejen modificar, de forma relevante, el procedimiento terapéutico inicialmente proyectado, consultará la decisión a tomar con la persona autorizada por mí a este respecto. Únicamente cuando las eventualidades acaecidas durante la intervención quirúrgica pongan en riesgo mi vida autorizo al cirujano para que adopte la decisión más conveniente para mi salud.',
    'En resumen, considero que la información ofrecida por el médico y la contenida en el presente documento resultan suficientes y adecuadas para comprender todos los aspectos de la intervención a la que voy a ser sometido y asumir sus riesgos y posibles complicaciones.',
    'Tras todo ello, DOY MI CONSENTIMIENTO PARA SER SOMETIDO A ESTA INTERVENCIÓN, entendiendo, por otra parte, mi derecho a revocar esta autorización en cualquier momento.',
  ],
}

// ─── Plantillas ───────────────────────────────────────────────────────────────

const SEPTOPLASTIA: ConsentTemplate = {
  slug: 'septoplastia',
  procedure: 'Septoplastia',
  descripcion: 'Corrección del tabique nasal (sin remodelar la pirámide externa)',
  intro:
    'Este documento informativo pretende explicar, de forma sencilla, la intervención ' +
    'quirúrgica denominada SEPTOPLASTIA, así como los aspectos más importantes del ' +
    'postoperatorio y las complicaciones más frecuentes que de ella se puedan derivar.',
  sections: [
    {
      heading: 'Breve descripción del procedimiento quirúrgico',
      paragraphs: [
        'Llamamos septoplastia a la técnica quirúrgica que tiene como finalidad la corrección de las deformidades del tabique nasal. Se efectúa bajo anestesia general y consiste en la extirpación, remodelación y reposición de los fragmentos de cartílago o de hueso que no se hallan en la posición correcta y que son responsables de las alteraciones en el funcionamiento nasal. Esta intervención se realiza mediante una o varias incisiones que se practican en el interior de las fosas nasales. En ocasiones, y a criterio del cirujano, puede resultar necesaria la colocación de una o varias láminas de material sintético abrazando el septo nasal, sujetas mediante una sutura, durante unos días.',
        'Tras la intervención se suele colocar un taponamiento nasal que se mantendrá durante un tiempo variable. El taponamiento suele ocasionar molestias, tales como dolor o pesadez de cabeza, sensación de taponamiento de oídos, molestias al masticar y sequedad de garganta. Estas molestias se atenúan con tratamiento sintomático. Los taponamientos pueden tener que asociarse a antibioterapia oral para evitar infecciones nasosinusales. Durante las primeras horas del taponamiento, suele drenar por la nariz un líquido sanguinolento, que se considera normal.',
        'En raras ocasiones, se puede desplazar hacia atrás el taponamiento, por la parte posterior de la fosa nasal, hacia la garganta, provocando una sensación de molestias y náuseas, que se solucionan retirando el taponamiento y colocando otro, si es preciso. El mencionado taponamiento justifica que el paciente respire a través de la boca, por lo que pueden aparecer diversas molestias de escasa entidad en la garganta.',
        'Después de la intervención, suele presentarse dolor en la región nasal, que se puede irradiar a la cara y a la cabeza. También pueden aparecer vómitos sanguinolentos con coágulos que, durante las primeras horas, se consideran normales. Estos coágulos son la manifestación de la sangre deglutida y no precisan tratamiento; deben desaparecer tras las primeras 24 h de postoperatorio.',
        'En el período postoperatorio es recomendable la realización de lavados de la fosa nasal mediante suero fisiológico o similares soluciones, para favorecer la eliminación de costras que pueden dificultar la respiración nasal.',
      ],
    },
    {
      heading: 'En caso de no efectuar esta intervención',
      paragraphs: ['Persistirán los síntomas propios de la dificultad respiratoria nasal.'],
    },
    {
      heading: 'Beneficios esperables',
      paragraphs: [
        'Mejoría de la respiración nasal causada por un problema mecánico y de los síntomas relacionados con dicha dificultad respiratoria nasal.',
      ],
    },
    {
      heading: 'Procedimientos alternativos',
      paragraphs: ['No se conocen procedimientos de contrastada eficacia.'],
    },
    {
      heading: 'Riesgos específicos más frecuentes de este procedimiento',
      paragraphs: [
        'Una de las complicaciones más frecuentes es la hemorragia, que se previene con el taponamiento nasal, pero que puede aparecer a pesar de este. En ese caso, hay que revisar el taponamiento nasal previamente colocado; a veces requiere sustituirlo por otro que garantice algo más de presión. Excepcionalmente, puede ser necesaria la revisión de la zona quirúrgica bajo anestesia general y el cambio del taponamiento. También puede acumularse sangre en la zona quirúrgica y producir una colección que requiera drenaje quirúrgico. Eventualmente puede requerirse una transfusión sanguínea. Puede aparecer una infección de la cavidad operatoria o de las cavidades que rodean la fosa nasal, tales como los senos paranasales, lo que se conoce como una rinosinusitis.',
        'En algunos casos, al manipular las zonas óseas del tabique nasal se fractura el fino hueso de la base del cráneo y se produce salida de líquido cefalorraquídeo. La reparación de esta fístula puede requerir un procedimiento quirúrgico añadido. Se han descrito, de forma excepcional, casos de lesiones intracraneales cerebrales por fractura ósea del etmoides.',
        'En ocasiones, puede permanecer como secuela cefalea de intensidad y localización variables. En lo relativo a la fosa nasal, pueden aparecer perforaciones del tabique nasal, que son más frecuentes en las reintervenciones. Estas perforaciones pueden producir un ruido o silbido característico, esencialmente si son pequeñas y anteriores. Con frecuencia pueden dar lugar a una cierta tendencia a la formación de costras y a un sangrado nasal, leve pero reiterativo, a lo largo del tiempo. Todo ello precisará lavados nasales y la administración de pomadas vaselinadas para mejorar los síntomas de sequedad nasal.',
        'Pueden formarse sinequias o bridas entre las paredes de la fosa nasal, que pueden requerir su sección en un segundo tiempo operatorio. Pueden aparecer también trastornos de la olfacción.',
        'En un porcentaje de aproximadamente un 10% es necesario realizar una reintervención por persistir la obstrucción mecánica. Esto se debe a la existencia de diversas situaciones: un tabique muy deformado en la primera intervención, una mala cicatrización, un desplazamiento de los fragmentos recolocados o, por último, un traumatismo nasal sufrido durante el postoperatorio. Puede, también, producirse un defecto estético, esencialmente como consecuencia del hundimiento o plegamiento del dorso de la pirámide nasal, por un trastorno de la cicatrización.',
        'Pueden aparecer, además, alteraciones de la sensibilidad de la zona, así como de la zona dentaria. En algún caso, se ha señalado el cambio de color de alguna pieza dentaria.',
        RIESGO_ANESTESIA,
      ],
    },
    DECLARACIONES_QUIRURGICAS,
  ],
  requiereTestigos: true,
}

const RINOSEPTOPLASTIA: ConsentTemplate = {
  slug: 'rinoseptoplastia',
  procedure: 'Rinoseptoplastia',
  descripcion: 'Corrección conjunta de la forma y la función de la nariz',
  intro:
    'Este documento informativo pretende explicar, de forma sencilla, la intervención ' +
    'quirúrgica denominada SEPTORRINOPLASTIA o RINOSEPTOPLASTIA y los aspectos más ' +
    'importantes del postoperatorio y las complicaciones más frecuentes que de ella se ' +
    'puedan derivar.',
  sections: [
    {
      heading: 'Breve descripción del procedimiento quirúrgico',
      paragraphs: [
        'Llamamos septorrinoplastia o rinoseptoplastia a la técnica quirúrgica que tiene como finalidad la corrección conjunta de la forma y de la función de la nariz. Asocia, por ello, una reparación de la forma externa de la pirámide nasal con la remodelación del interior de la fosa nasal, en un mismo acto quirúrgico.',
        'La intervención se realiza bajo anestesia general, a través de una serie de incisiones que se practican en el interior de la nariz: el número y extensión de las mencionadas incisiones depende de la magnitud y localización de las deformidades a tratar. En ocasiones, también se precisa realizar pequeñísimas incisiones en la porción lateral de la fosa nasal.',
        'De la misma manera, según el tipo y localización de las deformidades puede ser preciso realizar una incisión suplementaria en la llamada columela. La columela es la estructura ubicada entre la punta nasal y el labio superior y que separa una fosa de la otra. Esta incisión permite trabajar sobre los elementos osteocartilaginosos (de hueso y de cartílago) de la pirámide nasal de una forma más directa. Este último tipo de abordaje se denomina Rinoplastia Abierta.',
        'En ocasiones y a criterio del cirujano, puede resultar necesaria la colocación de una o varias láminas de material sintético abrazando el tabique nasal, sujetas mediante una sutura, durante unos días. Estas láminas deben retirarse tras un lapso de tiempo que raramente supera las tres semanas.',
        'Tras la intervención quirúrgica, se coloca una pequeña férula sobre el dorso de la nariz y se suele realizar un taponamiento nasal que se mantendrá durante un periodo de tiempo variable. El taponamiento ocasionará molestias, tales como dolor o pesadez de cabeza, sensación de taponamiento de oídos, molestias al masticar y sequedad de garganta. Estas molestias se atenúan con tratamiento sintomático. Los taponamientos pueden tener que asociarse a antibioticoterapia oral para evitar infecciones nasosinusales.',
        'Después de la intervención, suele existir dolor en la fosa nasal, que se puede irradiar a la cara y a la cabeza. También pueden aparecer vómitos sanguinolentos con coágulos que, durante las primeras horas, se consideran normales. Puede aparecer, durante los primeros días, un hematoma en la cara o en el contorno ocular como consecuencia de la remodelación de los huesos y cartílagos de la nariz.',
        'El paciente en su domicilio debe mantenerse en reposo relativo durante unos días y evitará traumatismos sobre la nariz, que podrían modificar el resultado de la intervención quirúrgica. Si usa gafas no deberá utilizarlas hasta que se lo indique su cirujano. En caso de presentarse hemorragia por la nariz o la boca, unos días después de la cirugía, el paciente deberá acudir al hospital para su adecuada valoración y tratamiento.',
      ],
    },
    {
      heading: 'Beneficios esperables',
      paragraphs: [
        'Mejoría del aspecto externo de la pirámide nasal, así como de la permeabilidad nasal y de los síntomas que esta insuficiencia ventilatoria nasal puede producir.',
      ],
    },
    {
      heading: 'Procedimientos alternativos',
      paragraphs: ['No se conocen otros métodos de contrastada eficacia.'],
    },
    {
      heading: 'Riesgos específicos más frecuentes de este procedimiento',
      paragraphs: [
        'Ya se ha señalado la posibilidad de que se produzca una pequeña hemorragia nasal o bucal tras la intervención quirúrgica. Rara vez tiene una intensidad valorable, si bien puede requerir la colocación de un nuevo taponamiento nasal que garantice algo más de presión. Excepcionalmente puede requerir la revisión de la zona quirúrgica bajo anestesia general, así como una transfusión sanguínea.',
        'Puede aparecer una infección de la cavidad operatoria o de las cavidades que rodean la fosa nasal, tales como los senos. Aparecerá entonces una rinosinusitis. Excepcionalmente puede aparecer una infección en los tejidos de la cara.',
        'En ocasiones, puede permanecer como secuela cefalea de intensidad y localización variables. En lo relativo a la fosa nasal, pueden aparecer perforaciones del tabique nasal, más frecuentes en reintervenciones. Estas perforaciones pueden producir ruido o silbido característico, esencialmente si son pequeñas y anteriores; con frecuencia dan lugar a formación de costras y sangrado nasal, leve pero reiterado. Todo ello precisará lavados nasales y pomadas vaselinadas para mejorar los síntomas de sequedad nasal.',
        'Pueden formarse sinequias —bridas entre las paredes de la fosa nasal— que pueden requerir su sección en un segundo tiempo operatorio. Pueden aparecer, también, alteraciones de la olfacción y complicaciones oculares, tales como visión doble, con carácter generalmente temporal, edema de los párpados y hematomas faciales.',
        'Cabe la posibilidad de que los elementos osteocartilaginosos de la nariz puedan desplazarse en el postoperatorio, como consecuencia de una cicatrización anómala o de un traumatismo accidental; ello produciría defectos estéticos. Las porciones de hueso o cartílago remodeladas, resecadas o implantadas pueden dar lugar a irregularidades del dorso nasal, palpables o incluso visibles; en pieles finas y elásticas estas irregularidades pueden ser más notorias. La piel de la nariz o de la cara puede sufrir lesiones diversas: cierta pérdida de elasticidad, atrofia, retracciones y cambios en la coloración superficial.',
        'Puede producirse el hundimiento o plegamiento del dorso de la pirámide nasal en su porción cartilaginosa como consecuencia de un trastorno de cicatrización. Pueden aparecer alteraciones de la sensibilidad de la zona. Si se ha precisado una incisión en la columela, puede persistir una pequeña cicatriz que, con el tiempo, tiende a mejorar. En ocasiones se requiere tomar fragmentos de tejidos de otras zonas (cartílago de la oreja o hueso de la cadera), por lo que la cicatrización de estas zonas podría resultar no estética o dolorosa. De forma excepcional se han comunicado casos de complicaciones endocraneales cerebrales tras esta cirugía.',
        'En un escaso porcentaje de pacientes, que no supera el 20%, puede requerirse una nueva intervención quirúrgica por persistir la obstrucción nasal, en la mayor parte de los casos por una mala cicatrización, un desplazamiento poco afortunado de los fragmentos de reconstrucción o un traumatismo nasal en el postoperatorio. Si el paciente presenta grandes deformidades de la pirámide nasal, hay más posibilidades de tener que realizar una segunda cirugía para corregir defectos remanentes.',
        RIESGO_ANESTESIA,
      ],
    },
    DECLARACIONES_QUIRURGICAS,
  ],
  requiereTestigos: true,
}

const ADENOAMIGDALECTOMIA: ConsentTemplate = {
  slug: 'adenoamigdalectomia',
  procedure: 'Adenoamigdalectomía',
  descripcion: 'Extirpación conjunta de amígdalas palatinas y adenoides',
  intro:
    'Este documento pretende explicar, de forma sencilla, la intervención quirúrgica ' +
    'denominada ADENOAMIGDALECTOMÍA, así como los aspectos más importantes del período ' +
    'postoperatorio y las complicaciones más frecuentes que pudieran aparecer después de ' +
    'realizarse.',
  sections: [
    {
      heading: 'Breve descripción del procedimiento quirúrgico',
      paragraphs: [
        'La adenoamigdalectomía es la intervención quirúrgica en la que se extirpan las amígdalas palatinas, situadas a ambos lados del paladar, y las adenoides, situadas en la parte más posterior de la nariz, por detrás del paladar.',
        'La operación se suele efectuar bajo anestesia general y a través de la boca. Puede efectuarse mediante bisturí convencional, tijeras o utilizando otras técnicas como el láser, la radiofrecuencia o el bisturí eléctrico.',
        'Tras la intervención, aparecen molestias dolorosas al momento de deglutir, que suelen ser intensas y llegan a durar entre diez y quince días. Es habitual que haya irradiación del dolor hacia los oídos, debiendo, por ello, administrarse analgésicos.',
        'Puede notarse, durante las primeras horas, la saliva teñida de sangre o incluso flemas sanguinolentas o coágulos, debido a la sangre que se llega a deglutir durante el procedimiento. También pueden ser normales las heces oscuras, en los días inmediatos, por el mismo motivo.',
        'Durante los primeros días puede percibirse mal aliento, sin que implique una infección del lecho quirúrgico. Al abrir la boca y examinar la garganta podrán verse zonas grisáceas o blanquecinas en el lugar que ocupaban las amígdalas; ello es normal y corresponde al proceso de cicatrización de la zona.',
        'Al principio, la alimentación consistirá sólo en líquidos y, posteriormente, alimentación blanda hasta completarse la cicatrización. Es un proceso ambulatorio, lo que quiere decir que el paciente se va a casa el mismo día. El tiempo aproximado de la cirugía es de 1 h; sin embargo, al término de la cirugía el paciente tiene que recuperarse de los efectos de la anestesia, por lo que permanecerá en el área de observación entre 90 y 120 minutos.',
      ],
    },
    {
      heading: 'En caso de no efectuar esta intervención',
      paragraphs: [
        'Pueden seguir produciéndose amigdalitis con frecuencia. En el caso de que la infección se extienda desde las amígdalas, pueden aparecer infecciones de los territorios próximos —los llamados abscesos periamigdalinos— e, incluso, alteraciones graves a otros niveles (cardíacos, renales, articulares, etc.).',
        'En el caso de que la intervención quirúrgica se haya planteado para tratar los ronquidos o el síndrome de apnea del sueño, continuarán los mencionados ronquidos y la apnea del sueño, por la dificultad respiratoria determinada por el tamaño de las amígdalas y las adenoides. Asimismo, podría producirse pérdida de peso por dificultades en la alimentación.',
      ],
    },
    {
      heading: 'Beneficios esperables',
      paragraphs: [
        'Prevenir la aparición de infecciones frecuentes de las amígdalas, así como las complicaciones citadas. Por otra parte, la intervención puede mejorar las alteraciones de la alimentación y la respiración, así como el ronquido y sus complicaciones, en especial el síndrome de apnea del sueño.',
      ],
    },
    {
      heading: 'Procedimientos alternativos',
      paragraphs: [
        'En el caso de la amigdalitis crónica, ante el fracaso del tratamiento médico, el tratamiento quirúrgico es el único de contrastada eficacia. En el caso de la roncopatía y del síndrome de apnea del sueño, las técnicas de aporte forzado de aire al aparato respiratorio, tales como el NCPAP o el BIPAP, podrían considerarse una alternativa válida.',
      ],
    },
    {
      heading: 'Riesgos específicos más frecuentes de este procedimiento',
      paragraphs: [
        'Cabe la posibilidad de que la extirpación no pueda realizarse en su totalidad y de que persista una pequeña porción de tejido amigdalar o adenoideo. Asimismo, transcurrido un cierto tiempo, podría regenerarse parte del tejido extirpado, por lo que podrían reaparecer, en alguna medida, los problemas que justificaron la intervención.',
        'También es posible que se produzca una hemorragia de cierta intensidad durante el período posterior a la intervención; si esta hemorragia postoperatoria fuera muy intensa podría aparecer una anemia e incluso un «shock» —llamado hipovolémico, por la pérdida del volumen de sangre—. Por ello, la hemorragia casi siempre obliga a una nueva intervención para su control y, si fuera preciso, transfusión de hemoderivados. Este riesgo puede ocurrir aunque las pruebas de coagulación del estudio preoperatorio sean normales.',
        'Cabe la posibilidad de que, accidentalmente, la sangre que procede de la herida operatoria pueda pasar hacia las vías respiratorias: a esta posibilidad se la conoce como hemoaspiración y puede llegar a obstruir las vías aéreas, produciendo incluso un paro cardiorrespiratorio.',
        'No es frecuente que la herida se infecte, pero podría aparecer una pequeña infección o, incluso, si el estado general del paciente está debilitado, una septicemia, es decir, la propagación de la infección a través de la sangre.',
        'Durante el procedimiento se utiliza un bisturí eléctrico para llevar a cabo la cirugía o para cauterizar pequeños vasos que estén sangrando. Si bien se tiene un esmerado cuidado con este tipo de instrumental, cabe la posibilidad de que se produzcan quemaduras, generalmente leves, en las proximidades de la zona a intervenir o en la zona de la placa (polo negativo colocado en el muslo o la espalda del paciente).',
        'Hay que considerar, además, la posibilidad de una edentación —pérdida de alguna pieza dentaria— de manera accidental, una fisura del paladar, la aparición de una voz nasalizada que llamamos rinolalia, y la insuficiencia del velo del paladar para ocluir las fosas nasales en su parte posterior durante la deglución, lo que determinaría el paso de líquidos o sólidos ingeridos hacia las fosas nasales. En ocasiones se observa un cambio transitorio del tono de la voz. En algunos casos puede aparecer una tos persistente a lo largo de unos días y tortícolis, generalmente pasajera.',
        RIESGO_ANESTESIA,
      ],
    },
    DECLARACIONES_QUIRURGICAS,
  ],
  requiereTestigos: true,
}

const AMIGDALECTOMIA: ConsentTemplate = {
  slug: 'amigdalectomia',
  procedure: 'Amigdalectomía',
  descripcion: 'Extirpación de las amígdalas palatinas (sin adenoides)',
  intro:
    'Este documento pretende explicar, de forma sencilla, la intervención quirúrgica ' +
    'denominada AMIGDALECTOMÍA, así como los aspectos más importantes del período ' +
    'postoperatorio y las complicaciones más frecuentes que pudieran aparecer después de ' +
    'realizarse.',
  sections: [
    {
      heading: 'Breve descripción del procedimiento quirúrgico',
      paragraphs: [
        'La amigdalectomía es la intervención quirúrgica en la que se extirpan las amígdalas palatinas, situadas a ambos lados del paladar.',
        'La operación se suele efectuar bajo anestesia general y a través de la boca. Puede efectuarse mediante bisturí convencional, tijeras o utilizando otras técnicas como el láser, la radiofrecuencia o el bisturí eléctrico.',
        'Tras la intervención, aparecen molestias dolorosas al momento de deglutir, que suelen ser intensas y llegan a durar entre diez y quince días. Es habitual que haya irradiación del dolor hacia los oídos, debiendo, por ello, administrarse analgésicos.',
        'Puede notarse, durante las primeras horas, la saliva teñida de sangre o incluso flemas sanguinolentas o coágulos, debido a la sangre que se llega a deglutir durante el procedimiento. También pueden ser normales las heces oscuras, en los días inmediatos, por el mismo motivo.',
        'Durante los primeros días puede percibirse mal aliento, sin que implique una infección del lecho quirúrgico. Al abrir la boca y examinar la garganta podrán verse zonas grisáceas o blanquecinas en el lugar que ocupaban las amígdalas; ello es normal y corresponde al proceso de cicatrización de la zona.',
        'Al principio, la alimentación consistirá sólo en líquidos y, posteriormente, alimentación blanda hasta completarse la cicatrización. Es un proceso ambulatorio, lo que quiere decir que el paciente se va a casa el mismo día. El tiempo aproximado de la cirugía es de 1 h; sin embargo, al término de la cirugía el paciente tiene que recuperarse de los efectos de la anestesia, por lo que permanecerá en el área de observación entre 90 y 120 minutos.',
      ],
    },
    {
      heading: 'En caso de no efectuar esta intervención',
      paragraphs: [
        'Pueden seguir produciéndose amigdalitis con frecuencia. En el caso de que la infección se extienda desde las amígdalas, pueden aparecer infecciones de los territorios próximos —los llamados abscesos periamigdalinos— e, incluso, alteraciones graves a otros niveles (cardíacos, renales, articulares, etc.).',
        'En el caso de que la intervención quirúrgica se haya planteado para tratar los ronquidos o el síndrome de apnea del sueño, continuarán los mencionados ronquidos y la apnea del sueño, por la dificultad respiratoria determinada por el tamaño de las amígdalas. Asimismo, podría producirse pérdida de peso por dificultades en la alimentación.',
      ],
    },
    {
      heading: 'Beneficios esperables',
      paragraphs: [
        'Prevenir la aparición de infecciones frecuentes de las amígdalas, así como las complicaciones citadas. Por otra parte, la intervención puede mejorar las alteraciones de la alimentación y la respiración, así como el ronquido y sus complicaciones, en especial el síndrome de apnea del sueño.',
      ],
    },
    {
      heading: 'Procedimientos alternativos',
      paragraphs: [
        'En el caso de la amigdalitis crónica, ante el fracaso del tratamiento médico, el tratamiento quirúrgico es el único de contrastada eficacia. En el caso de la roncopatía y del síndrome de apnea del sueño, las técnicas de aporte forzado de aire al aparato respiratorio, tales como el NCPAP o el BIPAP, podrían considerarse una alternativa válida.',
      ],
    },
    {
      heading: 'Riesgos específicos más frecuentes de este procedimiento',
      paragraphs: [
        'Cabe la posibilidad de que la extirpación no pueda realizarse en su totalidad y de que persista una pequeña porción de tejido amigdalar en uno o ambos lados del paladar. Asimismo, transcurrido un cierto tiempo, podría regenerarse parte del tejido extirpado, por lo que podrían reaparecer, en alguna medida, los problemas que justificaron la intervención.',
        'También es posible que se produzca una hemorragia de cierta intensidad durante el período posterior a la intervención; si esta hemorragia postoperatoria fuera muy intensa podría aparecer una anemia e incluso un «shock» —llamado hipovolémico, por la pérdida del volumen de sangre—. Por ello, la hemorragia casi siempre obliga a una nueva intervención para su control y, si fuera preciso, transfusión de hemoderivados. Este riesgo puede ocurrir aunque las pruebas de coagulación del estudio preoperatorio sean normales.',
        'Cabe la posibilidad de que, accidentalmente, la sangre que procede de la herida operatoria pueda pasar hacia las vías respiratorias: a esta posibilidad se la conoce como hemoaspiración y puede llegar a obstruir las vías aéreas, produciendo incluso un paro cardiorrespiratorio.',
        'No es frecuente que la herida se infecte, pero podría aparecer una pequeña infección o, incluso, si el estado general del paciente está debilitado, una septicemia, es decir, la propagación de la infección a través de la sangre.',
        'Durante el procedimiento se utiliza un bisturí eléctrico para llevar a cabo la cirugía o para cauterizar pequeños vasos que estén sangrando. Si bien se tiene un esmerado cuidado con este tipo de instrumental, cabe la posibilidad de que se produzcan quemaduras, generalmente leves, en las proximidades de la zona a intervenir o en la zona de la placa (polo negativo colocado en el muslo o la espalda del paciente).',
        'Hay que considerar, además, la posibilidad de una edentación —pérdida de alguna pieza dentaria— de manera accidental. En ocasiones se observa un cambio transitorio del tono de la voz. En algunos casos puede aparecer una tos persistente a lo largo de unos días y tortícolis, generalmente pasajera.',
        RIESGO_ANESTESIA,
      ],
    },
    DECLARACIONES_QUIRURGICAS,
  ],
  requiereTestigos: true,
}

const ADENOIDECTOMIA: ConsentTemplate = {
  slug: 'adenoidectomia',
  procedure: 'Adenoidectomía',
  descripcion: 'Extirpación de las adenoides (sin amígdalas)',
  intro:
    'Este documento pretende explicar, de forma sencilla, la intervención quirúrgica ' +
    'denominada ADENOIDECTOMÍA, así como los aspectos más importantes del período ' +
    'postoperatorio y las complicaciones más frecuentes que pudieran aparecer después de ' +
    'realizarse.',
  sections: [
    // TODO(human): redactar las secciones clínicas específicas de la ADENOIDECTOMÍA
    // aislada. A diferencia de la amigdalectomía, las adenoides se abordan por la
    // rinofaringe (detrás del paladar) y el postoperatorio y los riesgos difieren
    // (p. ej. insuficiencia velopalatina / regurgitación nasal, rinolalia, recrecimiento
    // del tejido adenoideo, otitis, hemorragia rinofaríngea). Añade aquí los objetos
    // ConsentTemplateSection con { heading, paragraphs: [...] } para:
    //   1. "Breve descripción del procedimiento quirúrgico"
    //   2. "En caso de no efectuar esta intervención"
    //   3. "Beneficios esperables"
    //   4. "Procedimientos alternativos"
    //   5. "Riesgos específicos más frecuentes de este procedimiento" (cierra con RIESGO_ANESTESIA)
    // El bloque DECLARACIONES_QUIRURGICAS ya se añade abajo; no lo repitas.
    DECLARACIONES_QUIRURGICAS,
  ],
  requiereTestigos: true,
}

/** Catálogo completo, en orden de presentación. */
export const CONSENT_TEMPLATES: ConsentTemplate[] = [
  SEPTOPLASTIA,
  RINOSEPTOPLASTIA,
  AMIGDALECTOMIA,
  ADENOIDECTOMIA,
  ADENOAMIGDALECTOMIA,
]

export function getConsentTemplate(slug: string): ConsentTemplate | undefined {
  return CONSENT_TEMPLATES.find((t) => t.slug === slug)
}

/**
 * Serializa una plantilla a texto plano con marcas «## » para encabezados y
 * líneas en blanco entre párrafos. Este es el texto que se guarda en
 * PatientConsent.consentTexto y que parsean la vista de detalle y la impresión.
 */
export function renderTemplateToText(t: ConsentTemplate): string {
  const blocks: string[] = []
  if (t.intro) blocks.push(t.intro)
  for (const section of t.sections) {
    blocks.push(`## ${section.heading}`)
    for (const p of section.paragraphs) blocks.push(p)
  }
  return blocks.join('\n\n')
}
