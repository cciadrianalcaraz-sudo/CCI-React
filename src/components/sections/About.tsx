export default function About() {
  return (
    <section
      id="acerca-de"
      className="relative z-10 px-[8vw] py-32 bg-[#faf7f2]"
    >
      <div className="max-w-6xl mx-auto grid gap-16 md:grid-cols-[1.1fr_0.9fr] items-start">

        {/* Encabezado */}
        <div className="max-w-xl pt-8">
          <p className="uppercase tracking-[0.2rem] text-xs font-semibold text-neutral-500 mb-4">
            Acerca de
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Más que contadores, aliados estratégicos.
          </h2>

          <p className="text-neutral-600 leading-relaxed">
            En <strong>CCI Consultoría Contable Integral</strong> ayudamos a
            empresarios, profesionistas y PyMES a tomar mejores decisiones
            financieras mediante orden, claridad y estrategia.
          </p>
        </div>

        {/* Pilares */}
        <div className="grid gap-6 pt-12">

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200">
            <h3 className="font-bold text-lg mb-3">Visión integral</h3>
            <p className="text-neutral-600 text-sm">
              Analizamos la parte fiscal, financiera y de control interno para
              que tu negocio crezca con bases sólidas.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200">
            <h3 className="font-bold text-lg mb-3">Claridad y orden</h3>
            <p className="text-neutral-600 text-sm">
              Convertimos números complejos en información clara para decidir
              con confianza.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200">
            <h3 className="font-bold text-lg mb-3">Acompañamiento real</h3>
            <p className="text-neutral-600 text-sm">
              Te asesoramos de forma continua para reducir riesgos y aprovechar
              oportunidades.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
