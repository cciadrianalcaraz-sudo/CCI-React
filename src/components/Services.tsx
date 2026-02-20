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
    <section id="servicios" className="px-[6vw] md:px-[8vw] py-16 md:py-24 bg-white">
      <div className="max-w-[1400px] mx-auto">
        <div className="max-w-[800px] mb-12 md:mb-16 text-center md:text-left">
          <p className="uppercase tracking-[0.2rem] font-semibold text-accent text-[0.65rem] md:text-xs mb-4 md:mb-6">
            Servicios
          </p>
          <h2 className="text-[clamp(1.9rem,4vw,2.8rem)] mb-4 md:mb-6 font-heading leading-[1.15] font-bold text-primary">
            Más que impuestos: acompañamiento estratégico.
          </h2>
          <p className="text-base md:text-lg text-neutral-600 leading-relaxed max-w-[650px] mx-auto md:mx-0">
            Nuestro enfoque combina cumplimiento con visión financiera y control
            interno para maximizar los beneficios de tu negocio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {services.map((service) => (
            <article
              key={service.id}
              className="bg-[#faf7f2] p-8 rounded-[2rem] border border-[#efe7d8] flex flex-col items-start transition-all hover:bg-white hover:shadow-xl hover:border-accent/30 group"
            >
              <h3 className="mb-4 text-primary font-bold text-xl font-heading leading-tight min-h-[3rem] flex items-center">
                {service.title}
              </h3>
              <p className="text-neutral-600 text-sm mb-8 flex-grow leading-relaxed">
                {service.description}
              </p>

              <button
                type="button"
                onClick={() => setActiveService(service)}
                className="mt-auto text-sm font-bold text-accent group-hover:translate-x-1 transition-transform cursor-pointer flex items-center gap-2"
              >
                Ver servicios <span>→</span>
              </button>
            </article>
          ))}
        </div>
      </div>

      {activeService && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-primary/40 backdrop-blur-md transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"
              }`}
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            className={`relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto flex flex-col transition-all duration-300 transform
                ${isClosing ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"}
                h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 md:p-10
              `}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-primary transition-colors cursor-pointer bg-neutral-100 rounded-full"
              aria-label="Cerrar modal"
            >
              <span className="text-xl leading-none">✕</span>
            </button>

            <h3 id="modal-title" className="text-2xl md:text-3xl font-bold font-heading text-primary mb-4 pr-10 leading-tight">
              {activeService.title}
            </h3>

            <p className="text-neutral-600 mb-10 leading-relaxed">
              {activeService.description}
            </p>

            <div className="grid gap-4 mb-10 overflow-y-auto">
              {activeService.items.map((item, index) => (
                <div
                  key={`${activeService.id}-${index}`}
                  className="flex items-start gap-4 rounded-2xl border border-[#efe7d8] bg-[#faf7f2] px-5 py-4 text-sm md:text-base transition-colors hover:border-accent/20"
                >
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-accent shrink-0" />
                  <span className="text-neutral-700 font-medium">{item}</span>
                </div>
              ))}
            </div>

            <Link
              to="/asesorias"
              className="mt-4 w-full rounded-2xl bg-primary px-6 py-5 text-white font-bold text-center hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95"
            >
              Agendar asesoría
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
