import { useEffect } from "react";

export default function Asesorias() {
    useEffect(() => {
        // Load Calendly script
        const script = document.createElement("script");
        script.src = "https://assets.calendly.com/assets/external/widget.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div className="pt-32 pb-20 px-[8vw] min-h-screen bg-[#faf7f2]">
            <div className="max-w-[1000px] mx-auto">
                <div className="text-center mb-12">
                    <p className="uppercase tracking-[0.2rem] font-semibold text-accent text-xs mb-4">Agendar Cita</p>
                    <h1 className="text-[clamp(2.5rem,5vw,3.5rem)] font-heading text-primary leading-[1.1] mb-6">
                        Asesoría Especializada 1 a 1
                    </h1>
                    <p className="text-xl text-muted max-w-[700px] mx-auto">
                        Selecciona el tipo de asesoría que necesitas y elige el horario que mejor se adapte a tu agenda.
                    </p>
                </div>

                <div className="bg-white rounded-3xl border border-[#efe7d8] shadow-custom overflow-hidden transition-all hover:shadow-xl">
                    <div
                        className="calendly-inline-widget w-full h-[700px]"
                        data-url="https://calendly.com/cci-adrianalcaraz/30min?hide_landing_page_details=1&hide_gdpr_banner=1"
                        data-background-color="faf7f2"
                        data-text-color="2c2210"
                        data-button-color="c29a5b"
                    />
                </div>

                <div className="mt-12 grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-2xl border border-[#efe7d8] text-center">
                        <div className="w-12 h-12 bg-[#faf7f2] rounded-xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">⚡</span>
                        </div>
                        <h3 className="font-bold text-primary mb-2">Inmediato</h3>
                        <p className="text-xs text-muted">Reserva en segundos sin esperas ni chats.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-[#efe7d8] text-center">
                        <div className="w-12 h-12 bg-[#faf7f2] rounded-xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📅</span>
                        </div>
                        <h3 className="font-bold text-primary mb-2">Sincronizado</h3>
                        <p className="text-xs text-muted">Recibe confirmación y enlace a tu calendario.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-[#efe7d8] text-center">
                        <div className="w-12 h-12 bg-[#faf7f2] rounded-xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🔒</span>
                        </div>
                        <h3 className="font-bold text-primary mb-2">Confidencial</h3>
                        <p className="text-xs text-muted">Sesiones 100% privadas y seguras.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
