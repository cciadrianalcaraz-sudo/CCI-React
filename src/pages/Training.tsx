import { useState } from "react";
import { courses } from "../data/courses";
import type { Course } from "../data/courses";
import CourseCard from "../components/training/CourseCard";
import NewsSection from "../components/training/NewsSection";
import PaymentModal from "../components/training/PaymentModal";

export default function Training() {
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleBuyCourse = (course: Course) => {
        if (course.type === 'free') {
            alert("¡Genial! Este curso es gratuito. Te redirigiremos al material.");
            // Aquí podrías redirigir a una página del curso
            return;
        }
        setSelectedCourse(course);
    };

    const handlePaymentSuccess = (details: any) => {
        console.log("Pago exitoso:", details);
        setSelectedCourse(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
    };

    return (
        <div className="pt-32 pb-20 px-[8vw] relative">
            {/* Success Notification */}
            {showSuccess && (
                <div className="fixed top-24 right-8 z-[100] bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-slide-in flex items-center gap-3">
                    <span className="text-2xl">🎉</span>
                    <div>
                        <p className="font-bold">¡Pago Exitoso!</p>
                        <p className="text-sm opacity-90">Te hemos enviado los accesos por correo.</p>
                    </div>
                </div>
            )}

            <div className="max-w-[720px] mb-16">
                <p className="uppercase tracking-[0.2rem] font-semibold text-accent text-xs mb-4">Capacitaciones</p>
                <h1 className="text-[clamp(2.5rem,5vw,3.5rem)] font-heading text-primary leading-[1.1] mb-6">
                    Potenciamos tu conocimiento para un mejor control.
                </h1>
                <p className="text-xl text-muted">
                    Accede a cursos especializados y mantente informado con las últimas novedades del mundo contable y fiscal.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-heading text-primary mb-8 border-b border-[#efe7d8] pb-4">Nuestros Cursos</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {courses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                onBuy={handleBuyCourse}
                            />
                        ))}
                    </div>
                </div>

                <aside>
                    <NewsSection />
                </aside>
            </div>

            {selectedCourse && (
                <PaymentModal
                    course={selectedCourse}
                    onClose={() => setSelectedCourse(null)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
}
