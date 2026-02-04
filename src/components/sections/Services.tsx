

export default function Services() {
    return (
        <section id="servicios" className="py-20 px-[8vw] bg-white">
            <h2 className="text-3xl font-bold mb-8 text-center">Nuestros Servicios</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center text-neutral-600">
                <div className="p-6 border rounded-xl">
                    <h3 className="font-bold text-xl mb-4 text-neutral-800">Contabilidad</h3>
                    <p>Registro y control de operaciones.</p>
                </div>
                <div className="p-6 border rounded-xl">
                    <h3 className="font-bold text-xl mb-4 text-neutral-800">Fiscal</h3>
                    <p>Estrategias para optimización de impuestos.</p>
                </div>
                <div className="p-6 border rounded-xl">
                    <h3 className="font-bold text-xl mb-4 text-neutral-800">Finanzas</h3>
                    <p>Análisis financiero para toma de decisiones.</p>
                </div>
            </div>
        </section>
    );
}
