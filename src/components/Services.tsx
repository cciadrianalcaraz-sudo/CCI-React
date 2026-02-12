import { Link } from "react-router-dom";
import { useState } from "react";

interface Service {
  id: string;
  title: string;
  description: string;
  items: string[];
}

const services: Service[] = [
  {
    id: "fiscal",
    title: "Gestión y Estrategia Fiscal",
    description: "Planeación y cumplimiento tributario para reducir riesgos y optimizar cargas.",
    items: [
      "Declaraciones fiscales",
      "Planeación fiscal estratégica",
      "Asesoría fiscal continua",
      "Regularización fiscal",
      "Gestión de trámites SAT",
      "Atención a auditorías",
    ],
  },
  {
    id: "finanzas",
    title: "Gestión Financiera Estratégica",
    description: "Información clara para decisiones financieras acertadas.",
    items: [
      "Análisis financiero",
      "Gestión de flujo de efectivo",
      "Presupuestos estratégicos",
      "Indicadores clave (KPI)",
      "Soporte para decisiones de inversión",
    ],
  },
  {
    id: "control-interno",
    title: "Gobierno Corporativo y Control Interno",
    description: "Orden, trazabilidad y reducción de riesgos operativos.",
    items: [
      "Diagnóstico de control interno",
      "Diseño de procesos",
      "Políticas y procedimientos",
      "Gestión de riesgos operativos",
      "Auditoría interna",
    ],
  },
  {
    id: "nominas",
    title: "Administración de Nómina y Seguridad Social",
    description: "Cumplimiento laboral, fiscal y de seguridad social.",
    items: [
      "Gestión de nómina",
      "IMSS y SUA",
      "INFONAVIT",
      "Impuestos laborales",
      "Atención a requerimientos laborales",
    ],
  },
];

// ... (imports and interface)

export default function Services() {
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setActiveService(null);
      setIsClosing(false);
    }, 300); // 300ms matches animation duration
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
        {services.map((service) => (
          <article
            key={service.id}
            className="bg-white p-6 rounded-[20px] shadow-card border border-[#efe7d8] flex flex-col items-start"
          >
            <h3 className="mb-2 text-primary font-heading leading-[1.2]">
              {service.title}
            </h3>
            <p className="text-muted mb-4 flex-grow">
              {service.description}
            </p>

            <button
              type="button"
              onClick={() => setActiveService(service)}
              className="mt-auto text-sm font-semibold text-accent hover:underline cursor-pointer"
            >
              Ver servicios →
            </button>
          </article>
        ))}
      </div>

      {activeService && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${isClosing ? "animate-fade-out" : "animate-fade-in"
              }`}
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            className={`relative ml-auto h-full w-full max-w-md bg-white shadow-2xl p-8 overflow-y-auto flex flex-col ${isClosing ? "animate-slide-out" : "animate-slide-in"
              }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-6 right-6 text-muted hover:text-primary transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              ✕
            </button>

            <h3 id="modal-title" className="text-2xl font-heading text-primary mb-3 pr-8">
              {activeService.title}
            </h3>

            <p className="text-muted mb-8 leading-relaxed">
              {activeService.description}
            </p>

            <div className="grid gap-3 mb-8">
              {activeService.items.map((item, index) => (
                <div
                  key={`${activeService.id}-${index}`}
                  className="flex items-start gap-3 rounded-xl border border-[#efe7d8] bg-[#faf7f2] px-4 py-3 text-sm transition-colors hover:border-accent/20"
                >
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-accent shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
            <Link
              to="/asesorias"
              className="mt-auto w-full rounded-xl bg-primary px-6 py-4 text-white font-semibold text-center hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              Agendar asesoría
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
