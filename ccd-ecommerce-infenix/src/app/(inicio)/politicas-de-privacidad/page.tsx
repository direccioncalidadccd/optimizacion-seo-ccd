"use client";
import Link from "next/link";
import { useState } from "react";

export default function TerminosCondiciones() {
  const [activeTab, setActiveTab] = useState<number>(2);

  const handleTabChange = (tabNumber: number) => {
    setActiveTab(tabNumber);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Título principal */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold neon-white mb-4">
            Términos y Condiciones del Servicio
          </h1>
        </div>

        {/* Contenedor principal */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Menú lateral */}
          <div className="w-full md:w-1/4">
            <div
              className="top-28 bg-gradient-to-br from-[rgba(0,96,254,0.4)] via-[rgba(22,46,84,0.5)] to-[rgba(0,96,254,0.4)] border-2 border-[rgba(22,46,84,0.4)] p-6 rounded-2xl sticky"
              style={{ boxShadow: "3px 3px 14px rgba(0,234,223, 0.6)" }}
            >
              <h2 className="text-xl font-semibold mb-4 pb-5 text-white">
                Menú
              </h2>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleTabChange(1)}
                    className={`w-full text-left text-white px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 1
                        ? "bg-colors-cyan-ccd !text-gray-700 rounded-xl"
                        : "text-gray-700 hover:text-gray-700 hover:bg-[rgba(0,234,223,0.7)] rounded-xl"
                    }`}
                  >
                    1. Términos y Condiciones
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange(2)}
                    className={`w-full text-left text-white px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 2
                        ? "bg-colors-cyan-ccd !text-gray-700 rounded-xl"
                        : "text-gray-700 hover:text-gray-700 hover:bg-[rgba(0,234,223,0.7)] rounded-xl"
                    }`}
                  >
                    2. Política de Privacidad
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Contenido */}
          <div className="w-full md:w-3/4">
            {/* Términos y Condiciones */}
            <div
              className={`bg-gradient-to-br from-[#0060fe66] via-[#162e5480] to-[rgba(0,96,254,0.4)] border-2 border-[rgba(22,46,84,0.4)] p-8 rounded-2xl text-white shadow-md mb-8 ${
                activeTab !== 1 && "hidden"
              }`}
            >
              <div className="legal-document overflow-y-auto max-h-[80vh]">
                <p className="text-sm mb-6">
                  Última actualización: 09 de abril de 2025
                </p>

                <h1 className="text-2xl font-bold mb-4">
                  Términos y Condiciones - Centro de Capacitación y Desarrollo
                  (CCD)
                </h1>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    1. Introducción
                  </h2>
                  <p className="mb-4">
                    Estos Términos y Condiciones (&quot;Términos&quot;) rigen el uso de
                    los servicios proporcionados por el Centro de Capacitación y
                    Desarrollo (CCD), incluyendo el sitio web ubicado en
                    https://www.ccdcapacitacion.edu.pe/, aplicaciones móviles, y
                    otros servicios relacionados (colectivamente, los
                    &quot;Servicios&quot;).
                  </p>
                  <p className="mb-4">
                    Al acceder o utilizar nuestros Servicios, usted acepta estar
                    sujeto a estos Términos. Si no está de acuerdo con alguna
                    parte de estos Términos, no podrá acceder ni utilizar
                    nuestros Servicios.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    2. Elegibilidad
                  </h2>
                  <p className="mb-4">
                    Para utilizar nuestros Servicios, usted debe tener al menos
                    16 años de edad. Si tiene entre 16 y 18 años, debe contar
                    con el consentimiento de un padre o tutor legal. Al utilizar
                    nuestros Servicios, usted declara y garantiza que cumple con
                    estos requisitos de elegibilidad.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    3. Cuentas de usuario
                  </h2>
                  <h3 className="text-lg font-medium mb-1">3.1 Registro</h3>
                  <p className="mb-4">
                    Para acceder a ciertas funciones de nuestros Servicios,
                    deberá crear una cuenta. Usted es responsable de mantener la
                    confidencialidad de su información de cuenta y contraseña, y
                    de restringir el acceso a su dispositivo. Usted acepta la
                    responsabilidad por todas las actividades que ocurran bajo
                    su cuenta.
                  </p>
                  <h3 className="text-lg font-medium mb-1">
                    3.2 Información precisa
                  </h3>
                  <p className="mb-4">
                    Debe proporcionar información precisa, actual y completa
                    durante el proceso de registro y mantener esta información
                    actualizada. Nos reservamos el derecho de suspender o
                    terminar su cuenta si proporciona información falsa,
                    inexacta, desactualizada o incompleta.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    4. Servicios educativos
                  </h2>
                  <h3 className="text-lg font-medium mb-1">
                    4.1 Descripción de los servicios
                  </h3>
                  <p className="mb-4">
                    CCD ofrece diversos servicios educativos, que pueden incluir
                    cursos en línea, seminarios virtuales, materiales
                    didácticos, evaluaciones, certificaciones y otros recursos
                    formativos diseñados para el desarrollo profesional y
                    académico.
                  </p>
                  <h3 className="text-lg font-medium mb-1">
                    4.2 Modificaciones a los servicios
                  </h3>
                  <p className="mb-4">
                    Nos reservamos el derecho de modificar, suspender o
                    discontinuar, temporal o permanentemente, cualquier parte de
                    nuestros Servicios con o sin previo aviso. Usted acepta que
                    no seremos responsables ante usted ni ante terceros por
                    cualquier modificación, suspensión o interrupción de los
                    Servicios.
                  </p>
                  <h3 className="text-lg font-medium mb-1">
                    4.3 Acceso a los cursos
                  </h3>
                  <p className="mb-4">
                    Una vez inscrito y habiendo realizado el pago
                    correspondiente (cuando aplique), se le otorgará acceso a
                    los cursos o programas seleccionados durante el período
                    especificado en la descripción del curso o según los
                    términos de su suscripción.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    5. Pagos y facturación
                  </h2>
                  <h3 className="text-lg font-medium mb-1">5.1 Precios</h3>
                  <p className="mb-4">
                    Los precios de nuestros cursos, programas y suscripciones se
                    indican en nuestro sitio web. Todos los precios están
                    sujetos a cambios sin previo aviso. Cualquier cambio de
                    precio no afectará a los pagos ya realizados.
                  </p>
                  <h3 className="text-lg font-medium mb-1">
                    5.2 Métodos de pago
                  </h3>
                  <p className="mb-4">
                    Aceptamos diversas formas de pago, incluidas tarjetas de
                    crédito/débito y transferencias bancarias. Al proporcionar
                    información de pago, usted declara y garantiza que tiene la
                    autorización legal para utilizar el método de pago
                    designado.
                  </p>
                  <h3 className="text-lg font-medium mb-1">5.3 Reembolsos</h3>
                  <p className="mb-4">
                    Nuestra política de reembolso se detalla por separado y
                    puede variar según el tipo de curso o programa. En general,
                    ofrecemos reembolsos completos si se solicitan dentro de los
                    7 días posteriores a la compra, siempre que no se haya
                    accedido a más del 25% del contenido del curso.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    6. Propiedad intelectual
                  </h2>
                  <h3 className="text-lg font-medium mb-1">
                    6.1 Nuestro contenido
                  </h3>
                  <p className="mb-4">
                    Todo el contenido disponible a través de nuestros Servicios,
                    incluidos textos, gráficos, logotipos, íconos, imágenes,
                    clips de audio, descargas digitales, recopilaciones de datos
                    y software, es propiedad de CCD o de nuestros proveedores de
                    contenido y está protegido por leyes de propiedad
                    intelectual.
                  </p>
                  <h3 className="text-lg font-medium mb-1">
                    6.2 Licencia limitada
                  </h3>
                  <p className="mb-4">
                    Le otorgamos una licencia limitada, no exclusiva, no
                    transferible y revocable para acceder y utilizar nuestros
                    Servicios y contenidos para fines educativos personales y no
                    comerciales.
                  </p>
                  <h3 className="text-lg font-medium mb-1">
                    6.3 Restricciones
                  </h3>
                  <p className="mb-4">
                    No puede: (a) modificar, reproducir, distribuir, crear
                    trabajos derivados, exhibir públicamente o explotar de otra
                    manera cualquier contenido de los Servicios sin autorización
                    expresa; (b) utilizar técnicas de ingeniería inversa o
                    intentar obtener código fuente de nuestro software; (c)
                    utilizar robots, spiders o tecnologías similares para
                    acceder a los Servicios; o (d) eludir medidas tecnológicas
                    implementadas para proteger los Servicios.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    7. Contenido generado por el usuario
                  </h2>
                  <h3 className="text-lg font-medium mb-1">7.1 Propiedad</h3>
                  <p className="mb-4">
                    Usted conserva todos los derechos sobre el contenido que
                    envía, publica o muestra a través de nuestros Servicios
                    (&quotContenido del Usuario&quot). Al proporcionar Contenido del
                    Usuario, nos otorga una licencia mundial, no exclusiva,
                    libre de regalías, transferible y sublicenciable para usar,
                    reproducir, modificar, adaptar, publicar, traducir y
                    distribuir dicho contenido en relación con nuestros
                    Servicios.
                  </p>
                  <h3 className="text-lg font-medium mb-1">
                    7.2 Restricciones de contenido
                  </h3>
                  <p className="mb-4">
                    Usted no debe publicar Contenido del Usuario que: (a) sea
                    ilegal, amenazante, abusivo, acosador, difamatorio,
                    calumnioso, engañoso, fraudulento, invasivo de la
                    privacidad, obsceno, ofensivo, profano o de otra manera
                    objetable; (b) infrinja cualquier patente, marca registrada,
                    secreto comercial, derecho de autor u otro derecho de
                    propiedad intelectual; (c) contenga virus de software o
                    cualquier otro código diseñado para interrumpir o dañar
                    cualquier sistema o software; o (d) se haga pasar por otra
                    persona.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    8. Conducta del usuario
                  </h2>
                  <p className="mb-4">
                    Al utilizar nuestros Servicios, usted acepta:
                  </p>
                  <ul className="list-disc pl-6 mb-4">
                    <li>
                      Cumplir con todas las leyes y regulaciones aplicables
                    </li>
                    <li>
                      No interferir con el funcionamiento de los Servicios
                    </li>
                    <li>
                      No participar en actividades fraudulentas o engañosas
                    </li>
                    <li>No acosar, intimidar o amenazar a otros usuarios</li>
                    <li>
                      No usar los Servicios para enviar comunicaciones no
                      solicitadas
                    </li>
                    <li>
                      No intentar acceder sin autorización a cuentas, sistemas o
                      redes
                    </li>
                  </ul>
                  <p className="mb-4">
                    Nos reservamos el derecho de investigar y tomar las medidas
                    legales apropiadas contra cualquier usuario que viole estas
                    disposiciones.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">9. Terminación</h2>
                  <p className="mb-4">
                    Podemos suspender o terminar su acceso a los Servicios en
                    cualquier momento, sin previo aviso, por cualquier motivo,
                    incluida la violación de estos Términos. Tras la
                    terminación, su derecho a utilizar los Servicios cesará
                    inmediatamente.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    10. Renuncia de garantías
                  </h2>
                  <p className="mb-4 uppercase font-semibold">
                    LOS SERVICIOS SE PROPORCIONAN &quotTAL CUAL&quot Y &quotSEGÚN
                    DISPONIBILIDAD&quot SIN GARANTÍAS DE NINGÚN TIPO, YA SEAN
                    EXPRESAS O IMPLÍCITAS, INCLUIDAS, ENTRE OTRAS, GARANTÍAS
                    IMPLÍCITAS DE COMERCIABILIDAD, IDONEIDAD PARA UN FIN
                    PARTICULAR Y NO INFRACCIÓN.
                  </p>
                  <p className="mb-4">
                    No garantizamos que los Servicios cumplan con sus
                    requisitos, estén disponibles de forma ininterrumpida, sean
                    seguros o estén libres de errores, ni que los resultados
                    obtenidos del uso de los Servicios sean precisos o
                    confiables.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    11. Limitación de responsabilidad
                  </h2>
                  <p className="mb-4 uppercase font-semibold">
                    EN NINGÚN CASO CCD, SUS DIRECTORES, EMPLEADOS, SOCIOS,
                    AGENTES, PROVEEDORES O AFILIADOS SERÁN RESPONSABLES POR
                    DAÑOS INDIRECTOS, INCIDENTALES, ESPECIALES, CONSECUENTES O
                    PUNITIVOS, INCLUIDA LA PÉRDIDA DE BENEFICIOS, DATOS, USO,
                    BUENA VOLUNTAD U OTRAS PÉRDIDAS INTANGIBLES, RESULTANTES DE:
                  </p>
                  <p className="mb-4">
                    (a) SU ACCESO O USO O INCAPACIDAD PARA ACCEDER O USAR LOS
                    SERVICIOS; (b) CUALQUIER CONDUCTA O CONTENIDO DE TERCEROS EN
                    LOS SERVICIOS; (c) CUALQUIER CONTENIDO OBTENIDO DE LOS
                    SERVICIOS; Y (d) ACCESO NO AUTORIZADO, USO O ALTERACIÓN DE
                    SUS TRANSMISIONES O CONTENIDO.
                  </p>
                  <p className="mb-4">
                    La limitación de responsabilidad se aplicará
                    independientemente de la teoría legal en la que se base una
                    reclamación y de si se advirtió o no sobre la posibilidad de
                    tales daños.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    12. Indemnización
                  </h2>
                  <p className="mb-4">
                    Usted acepta defender, indemnizar y eximir de
                    responsabilidad a CCD y a sus empleados, contratistas,
                    directores, proveedores y representantes de cualquier
                    reclamación, responsabilidad, daño, pérdida y gasto,
                    incluidos honorarios legales razonables, que surjan de o
                    estén relacionados de alguna manera con su acceso o uso de
                    los Servicios o su violación de estos Términos.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    13. Modificaciones a estos términos
                  </h2>
                  <p className="mb-4">
                    Nos reservamos el derecho de modificar estos Términos en
                    cualquier momento. Las modificaciones entrarán en vigor
                    inmediatamente después de su publicación en nuestro sitio
                    web. Su uso continuado de los Servicios después de cualquier
                    modificación constituye su aceptación de los Términos
                    modificados.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    14. Ley aplicable
                  </h2>
                  <p className="mb-4">
                    Estos Términos se regirán e interpretarán de acuerdo con las
                    leyes de la República del Perú, sin tener en cuenta sus
                    disposiciones sobre conflictos de leyes.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    15. Resolución de disputas
                  </h2>
                  <p className="mb-4">
                    Cualquier disputa derivada de estos Términos se resolverá
                    primero mediante negociación de buena fe. Si la disputa no
                    puede resolverse mediante negociación, será sometida a
                    arbitraje en Lima, Perú, de acuerdo con las reglas del
                    Centro de Arbitraje de la Cámara de Comercio de Lima.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    16. Disposiciones generales
                  </h2>
                  <h3 className="text-lg font-medium mb-1">
                    16.1 Acuerdo completo
                  </h3>
                  <p className="mb-4">
                    Estos Términos constituyen el acuerdo completo entre usted y
                    CCD con respecto a los Servicios y reemplazan todas las
                    comunicaciones y propuestas anteriores o contemporáneas, ya
                    sean electrónicas, orales o escritas, entre usted y CCD con
                    respecto a los Servicios.
                  </p>
                  <h3 className="text-lg font-medium mb-1">
                    16.2 Divisibilidad
                  </h3>
                  <p className="mb-4">
                    Si alguna disposición de estos Términos se considera
                    inaplicable o inválida, dicha disposición se limitará o
                    eliminará en la medida mínima necesaria para que los
                    Términos permanezcan en pleno vigor y efecto y sean
                    aplicables.
                  </p>
                  <h3 className="text-lg font-medium mb-1">16.3 No renuncia</h3>
                  <p className="mb-4">
                    El hecho de que CCD no ejerza o haga cumplir cualquier
                    derecho o disposición de estos Términos no constituirá una
                    renuncia a dicho derecho o disposición.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">17. Contacto</h2>
                  <p className="mb-4">
                    Si tiene alguna pregunta sobre estos Términos, contáctenos
                    en:
                  </p>
                  <div className="ml-4">
                    <p className="mb-2">
                      Correo electrónico:{" "}
                      <a
                        href="mailto:info@ccdcapacitacion.com"
                        className="text-colors-cyan-ccd hover:underline"
                      >
                        info@ccdcapacitacion.com
                      </a>
                    </p>
                    <p className="mb-2">
                      Dirección postal: Av. Rivera Navarrete 762, San Isidro,
                      Lima 15046, Perú
                    </p>
                  </div>
                </section>
              </div>
            </div>

            {/* Política de Privacidad */}
            <div
              className={`bg-gradient-to-br from-[#0060fe66] via-[#162e5480] to-[rgba(0,96,254,0.4)] border-2 border-[rgba(22,46,84,0.4)] p-8 rounded-2xl text-white shadow-md mb-8 ${
                activeTab !== 2 && "hidden"
              }`}
            >
              <div className="legal-document overflow-y-auto max-h-[80vh]">
                <p className="text-sm mb-6">
                  Última actualización: 09 de abril de 2025
                </p>

                <h1 className="text-2xl font-bold mb-4">
                  Política de Privacidad - Centro de Capacitación y Desarrollo
                  (CCD)
                </h1>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    1. Introducción
                  </h2>
                  <p className="mb-4">
                    El Centro de Capacitación y Desarrollo (CCD) se compromete a
                    proteger la privacidad de sus usuarios. Esta Política de
                    Privacidad explica cómo recopilamos, utilizamos, compartimos
                    y protegemos la información personal que obtenemos a través
                    de nuestra plataforma educativa, sitio web, aplicaciones
                    móviles y servicios relacionados (colectivamente, los
                      &quotServicios&quot).
                  </p>
                  <p className="mb-4">
                    Al utilizar nuestros Servicios, usted acepta las prácticas
                    descritas en esta Política de Privacidad.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    2. Información que recopilamos
                  </h2>
                  <h3 className="text-lg font-medium mb-1">
                    2.1 Información proporcionada por usted
                  </h3>
                  <ul className="list-disc pl-6 mb-4">
                    <li>
                      Información de registro: nombre, dirección de correo
                      electrónico, número de teléfono, contraseña
                    </li>
                    <li>
                      Información del perfil: fotografía, biografía, historial
                      académico, intereses profesionales
                    </li>
                    <li>
                      Información de pago: datos de tarjetas de crédito,
                      información de facturación
                    </li>
                    <li>
                      Contenido generado: comentarios, preguntas, trabajos
                      enviados, participación en foros
                    </li>
                  </ul>
                  <h3 className="text-lg font-medium mb-1">
                    2.2 Información recopilada automáticamente
                  </h3>
                  <ul className="list-disc pl-6 mb-4">
                    <li>
                      Datos de uso: páginas visitadas, cursos vistos, tiempo
                      dedicado a los contenidos
                    </li>
                    <li>
                      Datos del dispositivo: tipo de dispositivo, sistema
                      operativo, identificadores únicos
                    </li>
                    <li>
                      Datos de ubicación: país, región, ciudad (basados en la
                      dirección IP)
                    </li>
                    <li>
                      Cookies y tecnologías similares: para más información,
                      consulte nuestra Política de Cookies
                    </li>
                  </ul>
                  <h3 className="text-lg font-medium mb-1">
                    2.3 Información de terceros
                  </h3>
                  <ul className="list-disc pl-6 mb-4">
                    <li>
                      Información de redes sociales cuando se conecta a través
                      de ellas
                    </li>
                    <li>Referencias o recomendaciones de otros usuarios</li>
                    <li>Información de socios educativos o empresariales</li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    3. Cómo utilizamos su información
                  </h2>
                  <p className="mb-4">
                    Utilizamos la información recopilada para:
                  </p>
                  <ul className="list-disc pl-6 mb-4">
                    <li>
                      Proporcionar, mantener y mejorar nuestros Servicios
                      educativos
                    </li>
                    <li>Procesar transacciones y gestionar su cuenta</li>
                    <li>
                      Personalizar la experiencia de aprendizaje y recomendar
                      contenido relevante
                    </li>
                    <li>
                      Comunicarnos con usted sobre actualizaciones, promociones
                      y noticias
                    </li>
                    <li>
                      Analizar el comportamiento de los usuarios para optimizar
                      nuestros Servicios
                    </li>
                    <li>
                      Detectar, investigar y prevenir actividades fraudulentas o
                      no autorizadas
                    </li>
                    <li>Cumplir con obligaciones legales y reglamentarias</li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    4. Compartición de información
                  </h2>
                  <p className="mb-4">Podemos compartir su información con:</p>
                  <h3 className="text-lg font-medium mb-1">
                    4.1 Proveedores de servicios
                  </h3>
                  <p className="mb-4">
                    Terceros que nos ayudan a proporcionar nuestros Servicios
                    (procesamiento de pagos, alojamiento web, análisis de datos,
                    atención al cliente).
                  </p>
                  <h3 className="text-lg font-medium mb-1">
                    4.2 Socios educativos
                  </h3>
                  <p className="mb-4">
                    Instituciones académicas o empresas con las que colaboramos
                    para ofrecer programas formativos, certificaciones o
                    acreditaciones.
                  </p>
                  <h3 className="text-lg font-medium mb-1">
                    4.3 Con su consentimiento
                  </h3>
                  <p className="mb-4">
                    Cuando usted ha dado su consentimiento explícito para
                    compartir información.
                  </p>
                  <h3 className="text-lg font-medium mb-1">
                    4.4 Por razones legales
                  </h3>
                  <p className="mb-4">
                    Para cumplir con la ley, procesos legales, o requerimientos
                    gubernamentales aplicables.
                  </p>
                  <h3 className="text-lg font-medium mb-1">
                    4.5 En caso de transferencia de negocio
                  </h3>
                  <p className="mb-4">
                    En conexión con una fusión, adquisición, reorganización o
                    venta de todos o parte de nuestros activos.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    5. Transferencias internacionales de datos
                  </h2>
                  <p className="mb-4">
                    CCD opera principalmente en Perú, pero puede transferir,
                    procesar y almacenar datos en otros países donde nosotros o
                    nuestros proveedores de servicios operamos. Al utilizar
                    nuestros Servicios, usted consiente a estas transferencias
                    de acuerdo con esta Política de Privacidad.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    6. Retención de datos
                  </h2>
                  <p className="mb-4">
                    Conservamos su información mientras mantiene una cuenta
                    activa con nosotros y posteriormente durante el tiempo
                    necesario para cumplir con nuestras obligaciones legales,
                    resolver disputas y hacer cumplir nuestros acuerdos. Puede
                    solicitar la eliminación de sus datos según se describe en
                    la sección de &quotSus derechos&quot.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    7. Seguridad de la información
                  </h2>
                  <p className="mb-4">
                    Implementamos medidas técnicas, administrativas y físicas
                    diseñadas para proteger la seguridad de la información
                    personal que recopilamos. Sin embargo, ningún sistema es
                    completamente seguro, por lo que no podemos garantizar la
                    seguridad absoluta de su información.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    8. Sus derechos
                  </h2>
                  <p className="mb-4">
                    Dependiendo de su ubicación, puede tener ciertos derechos
                    con respecto a su información personal, incluyendo:
                  </p>
                  <ul className="list-disc pl-6 mb-4">
                    <li>Acceder a su información personal</li>
                    <li>Corregir datos inexactos</li>
                    <li>Eliminar su información personal</li>
                    <li>Oponerse o restringir ciertos procesamientos</li>
                    <li>Solicitar la portabilidad de sus datos</li>
                    <li>Retirar su consentimiento en cualquier momento</li>
                  </ul>
                  <p className="mb-4">
                    Para ejercer estos derechos, contáctenos a través de{" "}
                    <a
                      href="mailto:info@ccdcapacitacion.com"
                      className="text-colors-cyan-ccd hover:underline"
                    >
                      info@ccdcapacitacion.com
                    </a>
                    .
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    9. Menores de edad
                  </h2>
                  <p className="mb-4">
                    Nuestros Servicios no están dirigidos a personas menores de
                    16 años. No recopilamos intencionalmente información
                    personal de menores. Si tiene conocimiento de que un menor
                    nos ha proporcionado información personal, contáctenos y
                    tomaremos medidas para eliminar dicha información.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    10. Cambios a esta política
                  </h2>
                  <p className="mb-4">
                    Podemos actualizar esta Política de Privacidad
                    periódicamente. La versión más reciente siempre estará
                    disponible en nuestro sitio web. Las modificaciones
                    sustanciales se notificarán a través de nuestros Servicios o
                    por correo electrónico.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">11. Contacto</h2>
                  <p className="mb-4">
                    Si tiene preguntas o inquietudes sobre esta Política de
                    Privacidad, contáctenos en:
                  </p>
                  <div className="ml-4">
                  <p className="mb-2">
                      Correo electrónico:{" "}
                      <a
                        href="mailto:info@ccdcapacitacion.com"
                        className="text-colors-cyan-ccd hover:underline"
                      >
                        info@ccdcapacitacion.com
                      </a>
                    </p>
                    <p className="mb-2">
                      Teléfono:{" "}
                      <span                        
                        className="text-colors-cyan-ccd"
                      >
                        908826878
                      </span>
                    </p>
                    <p className="mb-2">
                      Dirección postal: Av. Rivera Navarrete 762, San Isidro,
                      Lima 15046, Perú
                    </p>
                  </div>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    12. Delegado de Protección de Datos
                  </h2>
                  <p className="mb-4">
                    Nuestro Delegado de Protección de Datos es:
                  </p>
                  <div className="ml-4">
                    <p className="mb-2">
                      Correo electrónico:{" "}
                      <a
                        href="mailto:info@ccdcapacitacion.com"
                        className="text-colors-cyan-ccd hover:underline"
                      >
                        info@ccdcapacitacion.com
                      </a>
                    </p>
                    <p className="mb-2">
                      Dirección: Av. Rivera Navarrete 762, San Isidro, Lima
                      15046, Perú
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
