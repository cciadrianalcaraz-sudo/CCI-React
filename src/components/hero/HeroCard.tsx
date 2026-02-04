
import Button from "../ui/Button";

export default function HeroCard() {
    return (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-[#eee4d2]">
            <h2 className="text-2xl font-bold mb-3">Diagnóstico inicial sin costo</h2>
            <p className="text-neutral-600 mb-4">
                Oportunidades de mejora en 30 minutos.
            </p>

            <ul className="list-disc pl-5 text-neutral-600 mb-6 space-y-1">
                <li>Riesgos fiscales</li>
                <li>Flujo de efectivo</li>
                <li>Controles internos</li>
            </ul>

            <Button secondary full>
                Quiero mi diagnóstico
            </Button>
        </div>
    );
}
