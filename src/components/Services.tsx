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
            <ul className="mt-4 space-y-2 text-muted list-disc list-inside">
              <li>Declaraciones anuales y provisionales (PF y PM)</li>
              <li>Planeación y estrategia fiscal</li>
              <li>Asesoría fiscal permanente</li>
              <li>Regularización ante el SAT</li>
              <li>Altas, bajas y actualizaciones en el SAT</li>
              <li>Atención a requerimientos y auditorías</li>
            </ul>
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
            <ul className="mt-4 space-y-2 text-muted list-disc list-inside">
              <li>Análisis financiero integral</li>
              <li>Flujo de efectivo y proyecciones</li>
              <li>Presupuestos y control financiero</li>
              <li>Indicadores financieros (KPI)</li>
              <li>Estructuración de costos y rentabilidad</li>
            </ul>
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
            <ul className="mt-4 space-y-2 text-muted list-disc list-inside">
              <li>Diagnóstico de control interno</li>
              <li>Mapeo y documentación de procesos</li>
              <li>Diseño de políticas y procedimientos</li>
              <li>Segregación de funciones</li>
              <li>Evaluación y mitigación de riesgos</li>
            </ul>
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
            <ul className="mt-4 space-y-2 text-muted list-disc list-inside">
              <li>Cálculo y timbrado de nómina</li>
              <li>Altas, bajas y modificaciones ante el IMSS</li>
              <li>Cálculo de cuotas obrero-patronales</li>
              <li>Gestión de INFONAVIT y SUA</li>
              <li>Cumplimiento de obligaciones patronales</li>
            </ul>
          )}
        </article>

      </div>
    </section>
  );
}
