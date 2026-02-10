export default function About() {
  return (
    <section
      id="acerca-de"
      className="py-20 px-[8vw] bg-[#faf7f2]"
    >
      {/* Encabezado */}
      <div className="mb-12">
        <p className="uppercase tracking-[0.2rem] text-xs font-semibold text-neutral-500 mb-3">
          Acerca de
        </p>

        <h2 className="text-3xl font-bold mb-4 text-neutral-900">
          Más que contadores, somos tus aliados estratégicos.
        </h2>

        <p className="text-neutral-600 max-w-3xl leading-relaxed">
          En <strong>CCI Consultoría Contable Integral</strong> ayudamos a
          empresarios, profesionistas y PyMES a tomar mejores decisiones
          financieras mediante orden, claridad y estrategia.
        </p>
      </div>

      {/* Historia */}
      <div className="mb-16 max-w-4xl">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">
          Nuestra historia
        </h3>

        <p className="text-neutral-600 leading-relaxed mb-4">
          CCI Consultoría Contable Integral nació con la visión de transformar la
          forma en que las empresas enfrentan sus retos contables y fiscales.
          Con una base sólida en el conocimiento técnico y un compromiso firme
          con la excelencia, hemos construido relaciones duraderas con
          emprendedores y empresarios.
        </p>

        <p className="text-neutral-600 leading-relaxed">
          Nuestro enfoque va más allá del cumplimiento. Nos interesa que
          nuestros clientes comprendan su información financiera y la
          conviertan en una guía para tomar mejores decisiones, consolidándonos
          como un aliado estratégico en su crecimiento.
        </p>
      </div>

      {/* Misión / Visión / Valores */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="p-6 border rounded-xl bg-white">
          <h3 className="font-bold text-lg mb-3 text-neutral-800">
            Nuestra misión
          </h3>
          <p className="text-neutral-600 text-sm leading-relaxed">
            Brindar servicios contables y fiscales integrales, personalizados y
            basados en la confianza, que permitan a nuestros clientes tomar
            decisiones estratégicas con seguridad.
          </p>
        </div>

        <div className="p-6 border rounded-xl bg-white">
          <h3 className="font-bold text-lg mb-3 text-neutral-800">
            Nuestra visión
          </h3>
          <p className="text-neutral-600 text-sm leading-relaxed">
            Ser un referente en consultoría contable y fiscal en México,
            reconocido por nuestra ética, profesionalismo e impacto positivo
            en las PyMES.
          </p>
        </div>

        <div className="p-6 border rounded-xl bg-white">
          <h3 className="font-bold text-lg mb-3 text-neutral-800">
            Nuestros valores
          </h3>
          <ul className="text-neutral-600 text-sm space-y-1">
            <li>• Integridad</li>
            <li>• Responsabilidad</li>
            <li>• Confianza</li>
            <li>• Excelencia</li>
            <li>• Profesionalismo</li>
          </ul>
        </div>
        
      </div>
    </section>
  );
}
