import { Check } from "lucide-react";

const packages = [
    {
        name: "Plan Básico",
        price: "$1,200",
        period: "MXN / mes",
        description: "Ideal para personas físicas o en el régimen RESICO que buscan cumplimiento sin complicaciones.",
        features: [
            "Declaraciones mensuales integras",
            "Papeles de trabajo",
            "Asesoría mensual (45 min)",
            "Recordatorios de vencimientos fiscales",
            "Soporte básico por correo y/o whatsapp",
            "Validación de facturación recibida"
        ],
        highlight: false,
        cta: "Comenzar ahora",
        target: "Volumen bajo, margen medio."
    },
    {
        name: "Plan Estratégico",
        price: "$2,900",
        period: "MXN / mes",
        description: "Para negocios en crecimiento que necesitan una visión clara de sus finanzas y estrategia fiscal.",
        features: [
            "Todo lo del Plan Básico",
            "Análisis de estados financieros",
            "Estrategia fiscal personalizada",
            "Soporte prioritario por WhatsApp",
            "Planeación de flujo de efectivo",
            "Revisión de contratos y nómina básica"
        ],
        highlight: true,
        cta: "Elegir Plan Estratégico",
        target: "Negocios con visión de crecimiento."
    },
    {
        name: "Plan Premium",
        price: "$4,500",
        period: "MXN / mes",
        description: "Servicio integral de consultoría para empresas que requieren acompañamiento constante y alta especialización.",
        features: [
            "Todo lo del Plan Estratégico",
            "Auditoría interna preventiva",
            "Consultoría fiscal ilimitada",
            "Dashboard financiero avanzado",
            "Acompañamiento en toma de decisiones estratégicas"
        ],
        highlight: false,
        cta: "Contactar Especialista",
        target: "Empresas con alta transaccionalidad."
    }
];

export default function Packages() {
    const whatsappLink = (planName: string) => {
        const message = `Hola, me interesa obtener más información sobre el ${planName}.`;
        return `https://wa.me/5213121682366?text=${encodeURIComponent(message)}`;
    };

    return (
        <div className="pt-24 pb-16 md:pt-40 md:pb-24 px-[6vw] md:px-[8vw] min-h-screen bg-[#faf7f2]">
            <div className="max-w-[1200px] mx-auto">
                <div className="text-center mb-12 md:mb-20">
                    <p className="uppercase tracking-[0.2rem] font-semibold text-accent text-[0.65rem] md:text-xs mb-4 md:mb-6">Paquetes de Servicio</p>
                    <h1 className="text-[clamp(2.2rem,8vw,3.5rem)] font-heading text-primary leading-[1.15] mb-6 font-bold">
                        Inversión inteligente para tu tranquilidad fiscal
                    </h1>
                    <p className="text-lg md:text-xl text-muted max-w-[700px] mx-auto">
                        Elige el nivel de acompañamiento que mejor se adapte a la etapa actual de tu negocio.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    {packages.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative bg-white rounded-[2.5rem] p-8 md:p-10 border transition-all duration-300 ${plan.highlight
                                ? "border-accent ring-4 ring-accent/5 shadow-2xl lg:scale-105 z-10"
                                : "border-[#efe7d8] shadow-custom hover:translate-y-[-8px]"
                                }`}
                        >
                            {plan.highlight && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-white px-5 py-1.5 rounded-full text-[0.65rem] font-bold uppercase tracking-[0.1rem] whitespace-nowrap">
                                    Más Recomendado
                                </div>
                            )}

                            <div className="mb-10">
                                <h3 className="text-2xl font-bold text-primary mb-3">{plan.name}</h3>
                                <p className="text-sm text-neutral-500 mb-8 min-h-[48px] leading-relaxed">{plan.description}</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-4xl md:text-5xl font-heading text-primary font-bold">{plan.price}</span>
                                    <span className="text-muted text-sm">{plan.period}</span>
                                </div>
                                <p className="text-[0.65rem] text-accent font-bold mt-3 uppercase tracking-wider italic bg-accent/5 inline-block px-3 py-1 rounded-lg">{plan.target}</p>
                            </div>

                            <ul className="space-y-5 mb-12">
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex gap-4 text-sm md:text-base text-neutral-600">
                                        <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <a
                                href={whatsappLink(plan.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-full py-5 px-6 rounded-2xl font-bold text-center transition-all flex items-center justify-center gap-2 active:scale-95 ${plan.highlight
                                    ? "bg-accent text-white shadow-xl shadow-accent/20 hover:bg-[#a67d3d]"
                                    : "bg-[#faf7f2] text-primary border border-[#efe7d8] hover:bg-neutral-100"
                                    }`}
                            >
                                {plan.cta}
                            </a>
                        </div>
                    ))}
                </div>

                <div className="mt-20 md:mt-32 p-10 md:p-16 bg-white rounded-[3rem] border border-[#efe7d8] text-center shadow-custom">
                    <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">¿Necesitas un paquete a la medida?</h2>
                    <p className="text-muted text-lg mb-10 max-w-[650px] mx-auto leading-relaxed">
                        Entendemos que cada negocio es único. Si tus requerimientos superan estos niveles, podemos diseñar una propuesta personalizada para ti.
                    </p>
                    <a
                        href={whatsappLink("Plan Personalizado")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-12 py-5 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95"
                    >
                        Hablar con un consultor
                    </a>
                </div>
            </div>
        </div>
    );

}
