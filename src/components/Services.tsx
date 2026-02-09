import { useState } from "react";

export default function Services() {
  const [open, setOpen] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpen(open === index ? null : index);
  };

  return (
    <section id="servicios" className="px-[8vw] py-20">
      <div className="max-w-[720px] mb-12">
        <p className="uppercase tracking-[0.2rem] font-semibold text-muted text-xs mb-4">
          Servicios
        </p>
        <h2 className="text-[clamp(1.9rem,3vw,2.6rem)] mb-3 font-heading leading-[1.2]">
          Más que impuestos: acompañamiento estratégico.
        </h2>
        <p className="text-muted">
          Nuestro enfoque combina cumplimiento con visión financiera y control
          interno para maximizar beneficios.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">

        {/* 1. Fiscal */}
        <article className="bg-white p-6 rounded-[20px] shadow-card border border-[#efe7d8]">
          <h3 className="mb-2 text-primary font-heading leading-[1.2]">
            Gestión y Estrategia Fiscal
          </h3>
          <p className="text-muted mb-3">
            Planeación y cumplimiento tributario para reducir riesgos y optimizar cargas.
          </p>

          <button
            onClick={() => toggle(1)}
            className="text-sm font-semibold text-accent hover:underline"
          >
            {open === 1 ? "Menos" : "Más"}
          </button>

          {open === 1 && (
  <div className="mt-5 grid gap-3">
    {[
      "Declaraciones fiscales",
      "Planeación fiscal estratégica",
      "Asesoría fiscal continua",
      "Regularización fiscal",
      "Gestión de trámites SAT",
      "Atención a auditorías",
    ].map((item) => (
      <div
        key={item}
        className="flex items-start gap-3 rounded-xl border border-[#efe7d8] bg-[#faf7f2] px-4 py-3 text-sm text-muted"
      >
        <span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
        <span>{item}</span>
      </div>
    ))}
  </div>
)}

        </article>

        {/* 2. Finanzas */}
        <article className="bg-white p-6 rounded-[20px] shadow-card border border-[#efe7d8]">
          <h3 className="mb-2 text-primary font-heading leading-[1.2]">
            Gestión Financiera Estratégica
          </h3>
          <p className="text-muted mb-3">
            Información clara para decisiones financieras acertadas.
          </p>

          <button
            onClick={() => toggle(2)}
            className="text-sm font-semibold text-accent hover:underline"
          >
            {open === 2 ? "Menos" : "Más"}
          </button>

         {open === 2 && (
  <div className="mt-5 grid gap-3">
    {[
      "Análisis financiero",
      "Gestión de flujo de efectivo",
      "Presupuestos estratégicos",
      "Indicadores clave (KPI)",
      "Soporte para decisiones de inversión",
    ].map((item) => (
      <div
        key={item}
        className="flex items-start gap-3 rounded-xl border border-[#efe7d8] bg-[#faf7f2] px-4 py-3 text-sm text-muted"
      >
        <span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
        <span>{item}</span>
      </div>
    ))}
  </div>
)}

        </article>

        {/* 3. Control Interno */}
        <article className="bg-white p-6 rounded-[20px] shadow-card border border-[#efe7d8]">
          <h3 className="mb-2 text-primary font-heading leading-[1.2]">
            Gobierno Corporativo y Control Interno
          </h3>
          <p className="text-muted mb-3">
            Orden, trazabilidad y reducción de riesgos operativos.
          </p>

          <button
            onClick={() => toggle(3)}
            className="text-sm font-semibold text-accent hover:underline"
          >
            {open === 3 ? "Menos" : "Más"}
          </button>

          {open === 3 && (
  <div className="mt-5 grid gap-3">
    {[
      "Diagnóstico de control interno",
      "Diseño de procesos",
      "Políticas y procedimientos",
      "Gestión de riesgos operativos",
      "Auditoría interna",
    ].map((item) => (
      <div
        key={item}
        className="flex items-start gap-3 rounded-xl border border-[#efe7d8] bg-[#faf7f2] px-4 py-3 text-sm text-muted"
      >
        <span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
        <span>{item}</span>
      </div>
    ))}
  </div>
)}

        </article>

        {/* 4. Nóminas */}
        <article className="bg-white p-6 rounded-[20px] shadow-card border border-[#efe7d8]">
          <h3 className="mb-2 text-primary font-heading leading-[1.2]">
            Administración de Nómina y Seguridad Social
          </h3>
          <p className="text-muted mb-3">
            Cumplimiento laboral, fiscal y de seguridad social.
          </p>

          <button
            onClick={() => toggle(4)}
            className="text-sm font-semibold text-accent hover:underline"
          >
            {open === 4 ? "Menos" : "Más"}
          </button>

          {open === 4 && (
  <div className="mt-5 grid gap-3">
    {[
      "Gestión de nómina",
      "IMSS y SUA",
      "INFONAVIT",
      "Impuestos laborales",
      "Atención a requerimientos laborales",
    ].map((item) => (
      <div
        key={item}
        className="flex items-start gap-3 rounded-xl border border-[#efe7d8] bg-[#faf7f2] px-4 py-3 text-sm text-muted"
      >
        <span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
        <span>{item}</span>
      </div>
    ))}
  </div>
)}

        </article>

      </div>
    </section>
  );
}
