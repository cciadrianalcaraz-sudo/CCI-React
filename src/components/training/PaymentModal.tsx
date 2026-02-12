import { PayPalButtons } from "@paypal/react-paypal-js";
import type { Course } from "../../data/courses";
import { useState } from "react";

interface PaymentModalProps {
    course: Course;
    onClose: () => void;
    onSuccess: (details: any) => void;
}

export default function PaymentModal({ course, onClose, onSuccess }: PaymentModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-primary/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted hover:text-primary transition-colors cursor-pointer z-10"
                >
                    ✕
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <span className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                            Finalizar Inscripción
                        </span>
                        <h2 className="text-2xl font-heading text-primary mb-2">{course.title}</h2>
                        <p className="text-muted text-sm">Estás por adquirir acceso completo a este curso.</p>
                    </div>

                    <div className="bg-[#faf7f2] rounded-2xl p-6 border border-[#efe7d8] mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-muted text-sm">Precio del curso</span>
                            <span className="font-bold text-primary">${course.price} MXN</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-[#efe7d8]">
                            <span className="font-bold text-primary">Total a pagar</span>
                            <span className="font-bold text-2xl text-accent">${course.price} MXN</span>
                        </div>
                    </div>

                    {course.syllabus && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                Temario del Curso
                            </h3>
                            <div className="bg-white border border-[#efe7d8] rounded-xl p-4 max-h-[160px] overflow-y-auto custom-scrollbar">
                                <ul className="space-y-2">
                                    {course.syllabus.map((item, idx) => (
                                        <li key={idx} className="text-xs text-muted flex gap-2">
                                            <span className="text-accent">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="relative min-h-[150px]">
                        {isProcessing && (
                            <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center rounded-xl">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-2" />
                                    <p className="text-xs font-bold text-primary">Procesando pago...</p>
                                </div>
                            </div>
                        )}
                        <PayPalButtons
                            style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                            createOrder={(_, actions) => {
                                return actions.order.create({
                                    intent: "CAPTURE",
                                    purchase_units: [
                                        {
                                            description: course.title,
                                            amount: {
                                                currency_code: "MXN",
                                                value: (course.price || 0).toString(),
                                            },
                                        },
                                    ],
                                });
                            }}
                            onApprove={async (_, actions) => {
                                setIsProcessing(true);
                                const details = await actions.order?.capture();
                                onSuccess(details);
                                setIsProcessing(false);
                            }}
                            onCancel={() => {
                                console.log("Pago cancelado");
                            }}
                            onError={(err) => {
                                console.error("Error en PayPal:", err);
                                alert("Hubo un error al procesar el pago. Por favor intenta de nuevo.");
                            }}
                        />
                    </div>

                    <p className="text-[10px] text-center text-muted mt-6">
                        Al realizar el pago, aceptas nuestros términos de servicio y políticas de privacidad.
                        Tus datos están protegidos por SSL y la seguridad de PayPal.
                    </p>
                </div>
            </div>
        </div>
    );
}
