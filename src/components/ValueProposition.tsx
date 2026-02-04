export default function ValueProposition() {
    return (
        <section id="valor" className="px-[8vw] py-20 bg-soft">
            <div className="max-w-[720px] mb-12">
                <p className="uppercase tracking-[0.2rem] font-semibold text-muted text-xs mb-4">Propuesta de valor</p>
                <h2 className="text-[clamp(1.9rem,3vw,2.6rem)] mb-3 font-heading leading-[1.2]">Una consultoría que se integra a tu operación.</h2>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-8">
                <div>
                    <h3 className="text-primary mb-2 font-heading leading-[1.2]">Diagnóstico profundo</h3>
                    <p className="text-muted">
                        Identificamos brechas fiscales, financieras y de control interno para priorizar las
                        acciones de mayor impacto.
                    </p>
                </div>
                <div>
                    <h3 className="text-primary mb-2 font-heading leading-[1.2]">Plan de acción realista</h3>
                    <p className="text-muted">
                        Entregamos un roadmap con responsables, tiempos y métricas para medir avances.
                    </p>
                </div>
                <div>
                    <h3 className="text-primary mb-2 font-heading leading-[1.2]">Acompañamiento cercano</h3>
                    <p className="text-muted">
                        Trabajamos con tu equipo para implementar soluciones y consolidar la mejora.
                    </p>
                </div>
                <div>
                    <h3 className="text-primary mb-2 font-heading leading-[1.2]">Información para decidir</h3>
                    <p className="text-muted">
                        Reportes claros y tableros que facilitan decisiones rápidas y estratégicas.
                    </p>
                </div>
            </div>
        </section>
    );
}
