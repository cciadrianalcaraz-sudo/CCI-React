import { Link } from "react-router-dom";
import { useState } from "react";
import { Percent, TrendingUp, ShieldAlert, Users, Check, ChevronRight } from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string;
  items: string[];
  icon: React.ComponentType<{ size: number; className?: string }>;
}

const services: Service[] = [
  {
    id: "fiscal",
    title: "Gestión y Estrategia Fiscal",
    description: "Planeación y cumplimiento tributario para reducir riesgos y optimizar cargas.",
    icon: Percent,
    items: [
      "Declaraciones fiscales mensuales y anuales",
      "Planeación fiscal estratégica para PyMES",
      "Asesoría fiscal continua y preventiva",
      "Regularización de ejercicios anteriores",
      "Gestión de trámites ante el SAT",
      "Atención y defensa en auditorías",
    ],
  },
  {
    id: "finanzas",
    title: "Gestión Financiera Estratégica",
    description: "Información clara para decisiones financieras acertadas y crecimiento sustentable.",
    icon: TrendingUp,
    items: [
      "Análisis financiero integral",
      "Gestión de flujo de efectivo y tesorería",
      "Presupuestos y proyecciones estratégicas",
      "Indicadores clave de rendimiento (KPI)",
      "Soporte para decisiones de inversión",
    ],
  },
  {
    id: "control-interno",
    title: "Gobierno Corporativo y Control Interno",
    description: "Orden, trazabilidad y reducción de riesgos operativos en la estructura de tu empresa.",
    icon: ShieldAlert,
    items: [
      "Diagnóstico profundo de control interno",
      "Diseño y mapeo de procesos clave",
      "Elaboración de políticas y procedimientos",
      "Gestión y mitigación de riesgos operativos",
      "Auditoría interna y supervisión de controles",
    ],
  },
  {
    id: "nominas",
    title: "Administración de Nómina y Seguridad Social",
    description: "Cumplimiento impecable de las obligaciones laborales, fiscales y de seguridad social.",
    icon: Users,
    items: [
      "Gestión de nóminas periódicas",
      "Cálculo de cuotas IMSS y SUA",
      "Declaración de aportaciones INFONAVIT",
      "Cálculo de impuestos locales sobre nómina",
      "Atención a requerimientos de autoridades laborales",
    ],
  },
];

export default function Services() {
  const [activeServiceId, setActiveServiceId] = useState<string>("fiscal");
  const [expandedId, setExpandedId] = useState<string | null>("fiscal");

  const selectedService = services.find((s) => s.id === activeServiceId) || services[0];
  const ActiveIcon = selectedService.icon;

  return (
    <section id="servicios" className="px-[6vw] md:px-[8vw] py-20 md:py-28 bg-[#faf7f2]/40 border-y border-light-beige/30">
      <div className="max-w-[1400px] mx-auto">
        {/* Encabezado */}
        <div className="max-w-[800px] mb-16 text-center md:text-left">
          <p className="uppercase tracking-[0.2rem] font-semibold text-accent text-[0.65rem] md:text-xs mb-4">
            Especialización
          </p>
          <h2 className="text-[clamp(1.9rem,4vw,2.8rem)] mb-6 font-heading leading-[1.15] font-bold text-primary">
            Más que impuestos: acompañamiento estratégico integral.
          </h2>
          <p className="text-base md:text-lg text-neutral-600 leading-relaxed max-w-[680px]">
            Nuestro enfoque combina cumplimiento con visión financiera y control
            interno para maximizar los beneficios de tu negocio.
          </p>
        </div>

        {/* Desktop Layout: Split Panel */}
        <div className="hidden lg:grid lg:grid-cols-[1.1fr_1.4fr] gap-12 items-stretch min-h-[520px]">
          {/* Selectores a la izquierda */}
          <div className="flex flex-col gap-4">
            {services.map((service) => {
              const isActive = service.id === activeServiceId;
              const IconComponent = service.icon;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setActiveServiceId(service.id)}
                  className={`group flex items-center gap-5 p-6 rounded-3xl border text-left transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "border-accent bg-white shadow-xl translate-x-2"
                      : "border-[#efe7d8] bg-[#faf7f2]/50 hover:bg-white hover:border-accent/30 hover:translate-x-1"
                  }`}
                >
                  <div
                    className={`p-4 rounded-2xl transition-colors duration-300 ${
                      isActive ? "bg-accent text-white" : "bg-white text-accent border border-[#efe7d8]"
                    }`}
                  >
                    <IconComponent size={24} />
                  </div>
                  <div className="flex-grow">
                    <h3
                      className={`font-bold font-heading text-lg transition-colors duration-300 ${
                        isActive ? "text-primary-dark" : "text-primary"
                      }`}
                    >
                      {service.title}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                      {service.description}
                    </p>
                  </div>
                  <ChevronRight
                    size={20}
                    className={`transition-all duration-300 ${
                      isActive
                        ? "text-accent translate-x-1 opacity-100"
                        : "text-neutral-300 opacity-0 group-hover:opacity-100"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Detalles a la derecha */}
          <div
            key={selectedService.id}
            className="bg-white p-10 rounded-[2.5rem] border border-[#efe7d8] shadow-2xl flex flex-col justify-between animate-scale-in-subtle"
          >
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3.5 bg-accent/10 rounded-2xl text-accent">
                  <ActiveIcon size={28} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent">
                    Metodología de Valor
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold font-heading text-primary-dark">
                    {selectedService.title}
                  </h3>
                </div>
              </div>

              <p className="text-neutral-600 mb-8 leading-relaxed text-base">
                {selectedService.description}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {selectedService.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-[#faf7f2] rounded-2xl border border-[#efe7d8]/50 hover:border-accent/20 transition-all hover:bg-white hover:shadow-sm"
                  >
                    <Check size={18} className="text-accent shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-700 font-medium leading-tight">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-light-beige/50 flex flex-col sm:flex-row items-center justify-between gap-6 mt-auto">
              <p className="text-xs text-neutral-500 max-w-[320px] leading-relaxed text-center sm:text-left">
                Cada módulo se adapta a la operación y tamaño de tu negocio para garantizar orden y claridad.
              </p>
              <Link
                to="/asesorias"
                className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-2xl text-center hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95 text-sm"
              >
                Agendar asesoría
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Layout: Accordion */}
        <div className="lg:hidden flex flex-col gap-4">
          {services.map((service) => {
            const isExpanded = expandedId === service.id;
            const IconComponent = service.icon;
            return (
              <div
                key={service.id}
                className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${
                  isExpanded ? "border-accent shadow-lg" : "border-[#efe7d8]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : service.id)}
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl transition-colors duration-300 ${
                        isExpanded ? "bg-accent text-white" : "bg-[#faf7f2] text-accent border border-[#efe7d8]"
                      }`}
                    >
                      <IconComponent size={20} />
                    </div>
                    <h3 className="font-bold font-heading text-base text-primary-dark">
                      {service.title}
                    </h3>
                  </div>
                  <span
                    className={`text-accent transition-transform duration-300 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  >
                    <ChevronRight size={20} />
                  </span>
                </button>

                {/* Contenido del Acordeón con animación */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded ? "max-h-[900px] opacity-100 border-t border-[#efe7d8]/50" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-6 bg-[#faf7f2]/30">
                    <p className="text-neutral-600 text-sm mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="grid gap-3 mb-6">
                      {service.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3.5 bg-white rounded-2xl border border-light-beige/40 shadow-sm"
                        >
                          <Check size={16} className="text-accent shrink-0 mt-0.5" />
                          <span className="text-xs text-neutral-700 font-medium leading-snug">{item}</span>
                        </div>
                      ))}
                    </div>
                    <Link
                      to="/asesorias"
                      className="block w-full py-4 bg-primary text-white font-bold rounded-2xl text-center hover:bg-primary-dark transition-all text-xs"
                    >
                      Agendar asesoría
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
