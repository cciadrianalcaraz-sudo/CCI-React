import logo from '../assets/ccicontable-logo.png';

export default function Header() {
    return (
        <header className="bg-hero-gradient px-[8vw] pt-8 pb-24">
            <nav className="flex items-center justify-between gap-6 pb-12 flex-col md:flex-row md:items-center items-start">
                <div className="flex flex-col gap-2 font-semibold">
                    <img
                        className="w-[min(260px,50vw)] h-auto object-contain"
                        src={logo}
                        alt="CCI Consultoría Contable Integral" />
                    <span className="text-[0.8rem] text-muted uppercase tracking-[0.1rem]">Consultoría Contable Integral</span>
                </div>
                <div className="flex gap-6 font-semibold text-primary-dark flex-wrap">
                    <a className="relative after:content-[''] after:absolute after:left-0 after:-bottom-[6px] after:w-0 after:h-[2px] after:bg-accent after:transition-[width] after:duration-200 hover:after:w-full" href="#servicios">Servicios</a>
                    <a className="relative after:content-[''] after:absolute after:left-0 after:-bottom-[6px] after:w-0 after:h-[2px] after:bg-accent after:transition-[width] after:duration-200 hover:after:w-full" href="#valor">Propuesta de valor</a>
                    <a className="relative after:content-[''] after:absolute after:left-0 after:-bottom-[6px] after:w-0 after:h-[2px] after:bg-accent after:transition-[width] after:duration-200 hover:after:w-full" href="#contacto">Contacto</a>
                </div>
            </nav>
            <section className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-12 items-center">
                <div>
                    <p className="uppercase tracking-[0.2rem] font-semibold text-muted text-xs mb-4">CCICONTABLE.COM</p>
                    <h1 className="text-[clamp(2.2rem,4vw,3.4rem)] text-primary mb-4 font-heading leading-[1.2]">
                        Estrategia fiscal, financiera y de control interno para tomar mejores decisiones.
                    </h1>
                    <p className="text-[1.1rem] text-muted mb-6">
                        Acompañamos a micro, pequeñas y medianas empresas a transformar la contabilidad en
                        una ventaja competitiva. Diseñamos soluciones que ordenan, optimizan y liberan
                        recursos para crecer.
                    </p>
                    <div className="flex flex-wrap gap-4 mb-8">
                        <a className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold border border-transparent transition-transform duration-200 shadow-none hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(23,55,95,0.15)] bg-primary text-white" href="#contacto">Agenda tu diagnostico</a>
                        <a className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold border transition-transform duration-200 shadow-none hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(23,55,95,0.15)] border-primary text-primary bg-transparent" href="#servicios">Conoce la metodología</a>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 mt-4">
                        <div>
                            <h3 className="text-primary mb-2 text-[1.1rem] font-heading leading-[1.2]">360°</h3>
                            <p>Visión integral en fiscal, finanzas y control interno.</p>
                        </div>
                        <div>
                            <h3 className="text-primary mb-2 text-[1.1rem] font-heading leading-[1.2]">Mejor decisión</h3>
                            <p>Reportes claros para actuar con confianza.</p>
                        </div>
                        <div>
                            <h3 className="text-primary mb-2 text-[1.1rem] font-heading leading-[1.2]">Más control</h3>
                            <p>Procesos definidos que reducen riesgos.</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-custom border border-[#eee4d2]">
                    <h2 className="text-2xl mb-3 font-heading leading-[1.2]">Diagnóstico inicial sin costo</h2>
                    <p>
                        Revisamos tu situación actual y priorizamos oportunidades de mejora en 30 minutos.
                    </p>
                    <ul className="my-6 pl-5 text-muted list-disc">
                        <li>Mapa de riesgos y obligaciones fiscales.</li>
                        <li>Estado financiero y flujo de efectivo.</li>
                        <li>Procesos críticos y controles clave.</li>
                    </ul>
                    <a className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold border border-transparent transition-transform duration-200 shadow-none hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(23,55,95,0.15)] bg-accent text-[#2c2210]" href="#contacto">Quiero mi diagnóstico</a>
                </div>
            </section>
        </header>
    );
}
