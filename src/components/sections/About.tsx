export default function About() {
  return (
    <section
      id="acerca-de"
      className="py-16 md:py-24 px-[6vw] md:px-[8vw] bg-[#faf7f2]"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Encabezado */}
        <div className="mb-12 md:mb-16 text-center md:text-left">
          <p className="uppercase tracking-[0.2rem] text-[0.65rem] md:text-xs font-semibold text-neutral-500 mb-4 md:mb-6">
            Acerca de
          </p>

          <h2 className="text-[clamp(2rem,4vw,2.8rem)] font-bold mb-6 text-primary leading-[1.15] font-heading">
            Más que contadores, somos tus aliados estratégicos.
          </h2>

          <p className="text-base md:text-lg text-neutral-600 max-w-3xl mx-auto md:mx-0 leading-relaxed font-medium">
            En CCI Consultoría Contable Integral ayudamos a
            empresarios, profesionistas y PyMES a tomar mejores decisiones
            financieras mediante orden, claridad y estrategia.
          </p>
        </div>

        {/* Historia */}
        <div className="mb-16 md:mb-20 max-w-4xl text-center md:text-left mx-auto md:mx-0">
          <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-4">
            Nuestra historia
          </h3>

          <div className="space-y-6">
            <p className="text-neutral-600 leading-relaxed text-sm md:text-base">
              CCI Consultoría Contable Integral nació con la visión de transformar la
              forma en que las empresas enfrentan sus retos contables y fiscales.
              Con una base sólida en el conocimiento técnico y un compromiso firme
              con la excelencia, hemos construido relaciones duraderas con
              emprendedores y empresarios.
            </p>

            <p className="text-neutral-600 leading-relaxed text-sm md:text-base">
              Nuestro enfoque va más allá del cumplimiento. Nos interesa que
              nuestros clientes comprendan su información financiera y la
              conviertan en una guía para tomar mejores decisiones, consolidándonos
              como un aliado estratégico en su crecimiento.
            </p>
          </div>
        </div>

        {/* Misión / Visión / Valores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="p-8 border border-[#efe7d8] rounded-[2rem] bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#faf7f2] rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-bold text-xl mb-4 text-primary font-heading">
              Misión
            </h3>
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed">
              Brindar servicios contables y fiscales integrales, personalizados y
              basados en la confianza, que permitan a nuestros clientes tomar
              decisiones estratégicas con seguridad.
            </p>
          </div>

          <div className="p-8 border border-[#efe7d8] rounded-[2rem] bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#faf7f2] rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">👁️</span>
            </div>
            <h3 className="font-bold text-xl mb-4 text-primary font-heading">
              Visión
            </h3>
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed">
              Ser un referente en consultoría contable y fiscal en México,
              reconocido por nuestra ética, profesionalismo e impacto positivo
              en las PyMES.
            </p>
          </div>

          <div className="p-8 border border-[#efe7d8] rounded-[2rem] bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#faf7f2] rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="font-bold text-xl mb-4 text-primary font-heading">
              Valores
            </h3>
            <ul className="text-neutral-600 text-sm md:text-base space-y-3 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Integridad
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Responsabilidad
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Confianza
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Excelencia
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Profesionalismo
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

