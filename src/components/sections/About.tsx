export default function About() {
  return (
    <section
      id="acerca-de"
      className="px-[8vw] py-28 bg-[#faf7f2]"
    >
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Encabezado + descripción general */}
        <div>
          <p className="uppercase tracking-[0.2rem] text-xs font-semibold text-neutral-500 mb-4">
            Acerca de
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
            Más que contadores, somos tus aliados estratégicos.
          </h2>

          <p className="text-neutral-600 leading-relaxed">
            En <strong>CCI Consultoría Contable Integral</strong> somos una firma
            especializada en brindar soluciones contables, fiscales y de
            gestión financiera diseñadas para impulsar el crecimiento y la
            tranquilidad de micro, pequeñas y medianas empresas.
          </p>

          <p className="text-neutral-600 leading-relaxed mt-4">
            CCI Consultoría Contable Integral nació con la visión de transformar
            la forma en que las empresas enfrentan sus retos contables y
            fiscales. Con una base sólida en el conocimiento técnico y un
            compromiso firme con la excelencia, hemos construido relaciones
            duraderas con emprendedores y empresarios que buscan no solo
            cumplir sus obligaciones, sino también comprender y aprovechar su
            información financiera para tomar mejores decisiones.
          </p>

          <p className="text-neutral-600 leading-relaxed mt-4">
            Nuestro enfoque va más allá del cumplimiento. Nos interesa que
            nuestros clientes comprendan su información financiera y la
            conviertan en una guía para tomar mejores decisiones. Gracias a
            esta visión, nos hemos consolidado como un aliado estratégico que
            acompaña el crecimiento empresarial con claridad, orden y
            profesionalismo.
          </p>
        </div>

        {/* Sección de tarjetas (Misión / Visión / Valores) */}
        <div className="grid gap-8 md:grid-cols-3">

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200">
            <h3 className="font-semibold text-lg mb-3">Nuestra Misión</h3>
            <p className="text-neutral-600 text-sm">
              Brindar servicios de consultoría contable y fiscal integrales,
              personalizados y basados en la confianza, que ayuden a nuestros
              clientes a cumplir con sus obligaciones legales, comprender su
              situación financiera y tomar decisiones estratégicas informadas
              para el crecimiento sostenible de su negocio.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200">
            <h3 className="font-semibold text-lg mb-3">Nuestra Visión</h3>
            <p className="text-neutral-600 text-sm">
              Ser un referente líder en consultoría contable y fiscal en México,
              reconocido por nuestra ética, compromiso con el cliente e
              innovación en soluciones financieras, siendo aliados estratégicos
              de pequeñas y medianas empresas.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200">
            <h3 className="font-semibold text-lg mb-3">Nuestros Valores</h3>
            <ul className="text-neutral-600 text-sm space-y-2">
              <li><strong>Integridad:</strong> honestidad y transparencia.</li>
              <li><strong>Responsabilidad:</strong> compromiso con cada cliente.</li>
              <li><strong>Confianza:</strong> relaciones sólidas y duraderas.</li>
              <li><strong>Excelencia:</strong> calidad en cada entrega.</li>
              <li><strong>Profesionalismo:</strong> actualización constante.</li>
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
}
