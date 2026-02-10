export default function About() {
  return (
    <section
      id="acerca-de"
      className="relative z-10 px-[8vw] py-32 bg-[#faf7f2]"
    >
      <div className="grid gap-16 md:grid-cols-[1.1fr_0.9fr] items-start">

        {/* Encabezado */}
        <div className="max-w-xl pt-8">
          <p className="uppercase tracking-[0.2rem] text-xs font-semibold text-neutral-500 mb-4">
            Acerca de
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Más que contadores, somos tus aliados estratégicos.
          </h2>

          <p className="text-neutral-600 leading-relaxed">
            En <strong>CCI Consultoría Contable Integral</strong> somos una firma
            especializada en brindar soluciones contables, fiscales y de
            gestión financiera diseñadas para impulsar el crecimiento y la
            tranquilidad de micro, pequeñas y medianas empresas. Desde el inicio,
            nuestra convicción ha sido ofrecer un acompañamiento cercano y
            estratégico que permite a nuestros clientes enfocarse en lo que más
            importa: hacer crecer su negocio con confianza.
          </p>
        </div>
        {/* Historia */}
         <div className="max-w-xl">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">
              Nuestra Historia
            </h3>
             <p className="text-neutral-600 leading-relaxed mb-4">
              CCI Consultoría Contable Integral nació con la visión de transformar la forma en que las empresas
              enfrentan sus retos contables y fiscales. Con una base sólida en el conocimiento técnico y un
              compromiso firme con la excelencia, hemos construido relaciones duraderas con emprendedores y
              empresarios.
             </p>
             <p className="text-neutral-600 leading-relaxed">
               Nuestro enfoque va más allá del cumplimiento. Nos interesa que nuestros clientes entiendan
                su información financiera y la conviertan en una guía para tomar mejores decisiones. 
                Gracias a esta visión, nos hemos consolidado como un aliado estratégico que acompaña el
                crecimiento empresarial con claridad, orden y profesionalismo.
             </p>
        </div>
        {/* Pilares */}
        <div className="grid gap-6 pt-12">

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200">
            <h3 className="font-bold text-lg mb-3">Nuestra Misión</h3>
            <p className="text-neutral-600 text-sm">
              Brindar servicios de consultoría contable y fiscal integrales, personalizados
              y basados en la confianza, que ayuden a nuestros clientes a cumplir con sus
              obligaciones legales, comprender su situación financiera y tomar decisiones
              estratégicas informadas para el crecimiento sostenible de su negocio.
              Nos comprometemos con la calidad, la precisión y la mejora continua en cada servicio
              que ofrecemos — porque el éxito de nuestros clientes es el motor de nuestro propio compromiso profesional.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200">
            <h3 className="font-bold text-lg mb-3">Nuestra visión</h3>
            <p className="text-neutral-600 text-sm">
              Ser referente líder en consultoría contable y fiscal en México, reconocido por
              nuestra ética, compromiso con el cliente, innovación en soluciones financieras
              y por ser aliados estratégicos de pequeñas y medianas empresas que buscan elevar
              su gestión administrativa y cumplir sus metas de negocio.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200">
            <h3 className="font-bold text-lg mb-3">Nuestros Valores</h3>
            <p className="text-neutral-600 text-sm">
              Nuestros valores definen quiénes somos y cómo trabajamos todos los días:

              Integridad: Actuamos con honestidad y transparencia en cada proceso.

              Responsabilidad: Cumplimos con nuestros compromisos y cuidamos los intereses de nuestros clientes.

              Confianza: Fomentamos relaciones basadas en seguridad y respeto mutuo.

              Excelencia: Nos esforzamos por ofrecer resultados de alta calidad y soluciones eficaces.

              Profesionalismo: Nos mantenemos actualizados y capacitados para acompañar a nuestros clientes ante cambios fiscales y contables.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
