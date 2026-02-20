import { Link } from "react-router-dom";
import Button from "../ui/Button";

export default function Hero() {
    return (
        <header className="relative bg-gradient-to-br from-[#f3f1ee] via-white to-[#fbf2df] px-[6vw] md:px-[8vw] pt-32 pb-16 md:pt-44 md:pb-24">
            <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
                <div className="text-center lg:text-left">
                    <p className="uppercase tracking-[0.2rem] text-[0.65rem] md:text-xs font-semibold text-neutral-500 mb-4 md:mb-6">
                        CCICONTABLE.COM
                    </p>

                    <h1 className="text-[clamp(2rem,8vw,3.5rem)] font-bold mb-6 leading-[1.15] text-primary-dark font-heading">
                        Estrategia fiscal, financiera y de control interno para tomar mejores decisiones.
                    </h1>

                    <p className="text-neutral-600 text-base md:text-lg mb-8 md:mb-10 max-w-[600px] mx-auto lg:mx-0">
                        Acompañamos a micro, pequeñas y medianas empresas a transformar la contabilidad en una ventaja competitiva. Diseñamos soluciones que ordenan, optimizan y liberan recursos para crecer.
                    </p>

                    <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-10 md:mb-14 justify-center lg:justify-start">
                        <Button primary className="w-full sm:w-auto active:scale-95" onClick={() => window.location.href = '/asesorias'}>
                            Agenda tu diagnóstico
                        </Button>
                        <Button outline className="w-full sm:w-auto active:scale-95" onClick={() => window.location.href = '#servicios'}>
                            Conoce la metodología
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 pt-8 border-t border-light-beige lg:border-none">
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                            <h3 className="text-primary font-bold text-xl mb-1 font-heading">360°</h3>
                            <p className="text-sm text-neutral-600">Visión integral en fiscal, finanzas y control interno.</p>
                        </div>
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                            <h3 className="text-primary font-bold text-xl mb-1 font-heading">Claridad</h3>
                            <p className="text-sm text-neutral-600">Reportes fáciles de entender para actuar con confianza.</p>
                        </div>
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                            <h3 className="text-primary font-bold text-xl mb-1 font-heading">Control</h3>
                            <p className="text-sm text-neutral-600">Procesos definidos que reducen riesgos operativos.</p>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-[#eee4d2] relative z-10">
                        <h2 className="text-2xl font-bold mb-4 font-heading text-primary leading-tight">Diagnóstico inicial sin costo</h2>
                        <p className="text-neutral-600 mb-6 font-medium">
                            Revisamos tu situación actual y priorizamos oportunidades de mejora en 30 minutos.
                        </p>
                        <ul className="my-8 space-y-4 text-neutral-600">
                            <li className="flex items-start gap-3">
                                <span className="text-accent text-xl leading-none">✓</span>
                                <span className="text-sm">Mapa de riesgos y obligaciones fiscales.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-accent text-xl leading-none">✓</span>
                                <span className="text-sm">Estado financiero y flujo de efectivo.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-accent text-xl leading-none">✓</span>
                                <span className="text-sm">Procesos críticos y controles clave.</span>
                            </li>
                        </ul>
                        <Link
                            to="/asesorias"
                            className="w-full bg-accent text-[#2c2210] py-4 px-6 rounded-2xl font-bold text-center inline-block transition-all hover:bg-[#a67d3d] shadow-lg shadow-accent/20 active:scale-95"
                        >
                            Quiero mi diagnóstico
                        </Link>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl -z-0"></div>
                </div>
            </div>
        </header>
    );
}

