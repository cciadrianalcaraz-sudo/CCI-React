import { useState } from "react";
import { Lock, FileText, PieChart, ShieldCheck } from "lucide-react";
import Button from "../components/ui/Button";

export default function ClientPortal() {
    const [email, setEmail] = useState("");

    return (
        <div className="min-h-screen bg-[#faf7f2] pt-32 pb-20 px-[6vw] md:px-[8vw]">
            <div className="max-w-[1400px] mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-primary/5 text-primary-dark px-4 py-2 rounded-full text-sm font-bold mb-6">
                            <ShieldCheck size={18} className="text-accent" />
                            Plataforma Segura para Clientes
                        </div>
                        <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-primary-dark leading-[1.1] mb-8 font-heading">
                            Todo tu control fiscal en un solo lugar.
                        </h1>
                        <p className="text-lg text-neutral-600 mb-10 leading-relaxed max-w-[540px]">
                            Acceda a sus estados financieros, declaraciones, y expedientes fiscales con la tranquilidad de una plataforma cifrada y disponible 24/7.
                        </p>

                        <div className="grid gap-6">
                            {[
                                { icon: FileText, title: "Expediente Digital", desc: "Toda tu documentación organizada y a un clic." },
                                { icon: PieChart, title: "Indicadores Clave", desc: "Visualiza la salud financiera de tu empresa." },
                                { icon: Lock, title: "Seguridad Bancaria", desc: "Tus datos protegidos con los estándares más altos." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-light-beige/50 shadow-sm transition-transform hover:scale-[1.02]">
                                    <div className="w-12 h-12 bg-[#faf7f2] rounded-xl flex items-center justify-center text-accent shrink-0">
                                        <item.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-primary-dark">{item.title}</h3>
                                        <p className="text-sm text-neutral-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        {/* Login Form Mockup */}
                        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-[#efe7d8] relative z-10">
                            <h2 className="text-2xl font-bold mb-2 font-heading text-primary-dark">Iniciar Sesión</h2>
                            <p className="text-neutral-500 mb-8 text-sm">Ingrese sus credenciales para acceder al portal.</p>

                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div>
                                    <label className="block text-sm font-bold text-primary-dark mb-2">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#faf7f2] border border-light-beige rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                        placeholder="usuario@tuempresa.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-primary-dark mb-2">Contraseña</label>
                                    <input
                                        type="password"
                                        className="w-full bg-[#faf7f2] border border-light-beige rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="text-right">
                                    <a href="#" className="text-xs text-accent font-bold hover:underline">¿Olvidaste tu contraseña?</a>
                                </div>

                                <Button primary full className="py-4">
                                    Entrar al Portal
                                </Button>
                            </form>

                            <div className="mt-10 pt-8 border-t border-light-beige text-center">
                                <p className="text-sm text-neutral-500 mb-4">¿Aún no eres cliente CCI?</p>
                                <Button outline full onClick={() => window.location.href = '/#contacto'}>
                                    Solicitar Acceso
                                </Button>
                            </div>
                        </div>

                        {/* Decorative background circle */}
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl -z-0"></div>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-0"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
