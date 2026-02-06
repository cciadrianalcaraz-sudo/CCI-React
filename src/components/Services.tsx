export default function Services() {
    return (
        <section id="servicios" className="px-[8vw] py-20">
            <div className="max-w-[720px] mb-12">
                <p className="uppercase tracking-[0.2rem] font-semibold text-muted text-xs mb-4">Servicios</p>
                <h2 className="text-[clamp(1.9rem,3vw,2.6rem)] mb-3 font-heading leading-[1.2]">Más que impuestos: acompañamiento estratégico.</h2>
                <p className="text-muted">
                    Nuestro enfoque combina cumplimiento con visión financiera y control interno para
                    maximizar beneficios.
                </p>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
                <article className="bg-white p-6 rounded-[20px] shadow-card border border-[#efe7d8]">
                    <h3 className="mb-3 text-primary font-heading leading-[1.2]">Fiscal inteligente</h3>
                    <p className="text-muted">
                        Planeación y cumplimiento tributario con análisis de impacto para reducir riesgos y
                        optimizar cargas.
                    </p>
                </article>
                <article className="bg-white p-6 rounded-[20px] shadow-card border border-[#efe7d8]">
                    <h3 className="mb-3 text-primary font-heading leading-[1.2]">Finanzas accionables</h3>
                    <p className="text-muted">
                        Modelos de flujo de efectivo, presupuestos y KPI para priorizar inversiones y cuidar
                        la liquidez.
                    </p>
                </article>
                <article className="bg-white p-6 rounded-[20px] shadow-card border border-[#efe7d8]">
                    <h3 className="mb-3 text-primary font-heading leading-[1.2]">Control interno</h3>
                    <p className="text-muted">
                        Diseño de procesos, políticas y controles que garantizan orden, trazabilidad y
                        cumplimiento.
                    </p>
                </article>
                <article className="bg-white p-6 rounded-[20px] shadow-card border border-[#efe7d8]">
                    <h3 className="mb-3 text-primary font-heading leading-[1.2]">Nóminas, IMSS e INFONAVIT</h3>
                    <p className="text-muted">
                        Administración de nómina, cálculo de impuestos, cumplimiento ante IMSS e INFONAVIT, altas, bajas y obligaciones patronales.
                    </p>
                </article>
            </div>
        </section>
    );
}
