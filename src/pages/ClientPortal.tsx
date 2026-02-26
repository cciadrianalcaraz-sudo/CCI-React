import { useState, useEffect } from "react";
import {
    Lock, FileText, PieChart, ShieldCheck,
    LogOut, Download, Calendar, TrendingUp,
    ChevronRight, Bell, User
} from "lucide-react";
import Button from "../components/ui/Button";
import { supabase } from "../lib/supabase";

// Define interfaces for our real data
interface Profile {
    full_name: string;
    rfc: string;
    advisor_name: string;
}

interface Document {
    id: string;
    name: string;
    file_url: string;
    status: 'pendiente' | 'descargado';
    created_at: string;
}

export default function ClientPortal() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Initial session check
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage({ type: 'error', text: 'Acceso denegado. Verifique sus credenciales.' });
        } else {
            setMessage({ type: 'success', text: '¡Bienvenido de nuevo!' });
        }
        setIsLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    if (user) {
        return <DashboardView user={user} onLogout={handleLogout} />;
    }

    return (
        <div className="min-h-screen bg-[#faf7f2] pt-32 pb-20 px-[6vw] md:px-[8vw] overflow-hidden">
            <div className="max-w-[1400px] mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="animate-fade-in">
                        <div className="inline-flex items-center gap-2 bg-primary/5 text-primary-dark px-4 py-2 rounded-full text-sm font-bold mb-6 animate-scale-in">
                            <ShieldCheck size={18} className="text-accent" />
                            Plataforma Segura para Clientes
                        </div>
                        <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-primary-dark leading-[1.1] mb-8 font-heading animate-slide-in">
                            Todo tu control fiscal en un solo lugar.
                        </h1>
                        <p className="text-lg text-neutral-600 mb-10 leading-relaxed max-w-[540px] animate-fade-in delay-200">
                            Acceda a sus estados financieros, declaraciones, y expedientes fiscales con la tranquilidad de una plataforma cifrada y disponible 24/7.
                        </p>

                        <div className="grid gap-6">
                            {[
                                { icon: FileText, title: "Expediente Digital", desc: "Toda tu documentación organizada y a un clic." },
                                { icon: PieChart, title: "Indicadores Clave", desc: "Visualiza la salud financiera de tu empresa." },
                                { icon: Lock, title: "Seguridad Bancaria", desc: "Tus datos protegidos con los estándares más altos." }
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className={`flex gap-4 p-4 bg-white rounded-2xl border border-light-beige/50 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-accent/30 group animate-scale-in-subtle delay-${(i + 1) * 100}`}
                                >
                                    <div className="w-12 h-12 bg-[#faf7f2] rounded-xl flex items-center justify-center text-accent shrink-0 group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                                        <item.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-primary-dark group-hover:text-accent transition-colors">{item.title}</h3>
                                        <p className="text-sm text-neutral-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative animate-scale-in delay-300">
                        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-[#efe7d8] relative z-10">
                            <h2 className="text-2xl font-bold mb-2 font-heading text-primary-dark">Iniciar Sesión</h2>
                            <p className="text-neutral-500 mb-8 text-sm">Ingrese las credenciales enviadas por su asesor.</p>

                            <form className="space-y-6" onSubmit={handleLogin}>
                                {message && (
                                    <div className={`p-4 rounded-xl text-sm font-bold animate-fade-in ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'
                                        }`}>
                                        {message.text}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-bold text-primary-dark mb-2">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#faf7f2] border border-light-beige rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                        placeholder="ejemplo@correo.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-primary-dark mb-2">Contraseña</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-[#faf7f2] border border-light-beige rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="text-right">
                                    <a href="#" className="text-xs text-accent font-bold hover:underline">¿Olvidaste tu contraseña?</a>
                                </div>

                                <Button primary full className="py-4" loading={isLoading}>
                                    {isLoading ? 'Verificando...' : 'Entrar al Portal'}
                                </Button>
                            </form>

                            <div className="mt-10 pt-8 border-t border-light-beige text-center">
                                <p className="text-sm text-neutral-500 mb-4">¿Desea dar de alta su empresa?</p>
                                <Button outline full onClick={() => window.location.href = '/#contacto'}>
                                    Contactar Ventas
                                </Button>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl -z-0 animate-pulse-subtle"></div>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-0 animate-pulse-subtle delay-500"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DashboardView({ user, onLogout }: { user: any, onLogout: () => void }) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [docs, setDocs] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboardData() {
            setLoading(true);
            try {
                // Fetch profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileData) setProfile(profileData);

                // Fetch documents
                const { data: docsData } = await supabase
                    .from('documents')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (docsData) setDocs(docsData);
            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        }

        loadDashboardData();
    }, [user.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#faf7f2] pt-24 pb-20 px-[6vw] md:px-[8vw]">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-dark mb-2">Panel de Control Fiscal</h1>
                        <p className="text-neutral-500 flex items-center gap-2">
                            <ShieldCheck size={16} className="text-green-600" />
                            Empresa: <span className="font-bold text-primary">{profile?.full_name || user.email}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-white rounded-xl border border-light-beige hover:border-accent transition-all text-primary-dark relative">
                            <Bell size={20} />
                            {docs.some(d => d.status === 'pendiente') && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                        </button>
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 bg-white border border-light-beige px-4 py-3 rounded-xl font-bold text-primary-dark hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer"
                        >
                            <LogOut size={18} />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 animate-slide-in">
                    <div className="bg-white p-6 rounded-3xl border border-light-beige shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-green-50 text-green-600">
                                <TrendingUp size={24} />
                            </div>
                        </div>
                        <h3 className="text-neutral-500 text-sm font-medium mb-1 uppercase tracking-wider">Estado Fiscal</h3>
                        <p className="text-xl font-bold text-primary-dark leading-none">Cumplimiento Positivo</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-light-beige shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                                <Calendar size={24} />
                            </div>
                        </div>
                        <h3 className="text-neutral-500 text-sm font-medium mb-1 uppercase tracking-wider">Próxima Declaración</h3>
                        <p className="text-xl font-bold text-primary-dark leading-none">Abril 2026</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-light-beige shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                                <FileText size={24} />
                            </div>
                        </div>
                        <h3 className="text-neutral-500 text-sm font-medium mb-1 uppercase tracking-wider">Docs Pendientes</h3>
                        <p className="text-xl font-bold text-primary-dark leading-none">
                            {docs.filter(d => d.status === 'pendiente').length} Archivos
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 animate-fade-in delay-200">
                        <div className="bg-white rounded-[2rem] border border-light-beige shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-light-beige flex items-center justify-between">
                                <h2 className="text-xl font-bold text-primary-dark">Expediente Digital</h2>
                            </div>
                            <div className="divide-y divide-light-beige">
                                {docs.length > 0 ? docs.map((doc) => (
                                    <div key={doc.id} className="p-6 flex items-center justify-between hover:bg-[#faf7f2]/50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary/40 group-hover:text-accent transition-colors">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-primary-dark text-sm sm:text-base">{doc.name}</h4>
                                                <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
                                                    {new Date(doc.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {doc.status === 'pendiente' && (
                                                <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-md border border-amber-100 uppercase tracking-tighter">Nuevo</span>
                                            )}
                                            <a
                                                href={doc.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2.5 bg-neutral-50 text-neutral-400 rounded-xl hover:bg-accent hover:text-white transition-all cursor-pointer"
                                            >
                                                <Download size={18} />
                                            </a>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center text-neutral-400">
                                        No hay documentos disponibles en este momento.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 animate-fade-in delay-300">
                        <div className="bg-primary-dark p-8 rounded-[2rem] text-white">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white ring-4 ring-white/10">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold leading-tight">{profile?.full_name || 'Usuario CCI'}</h3>
                                    <p className="text-xs text-white/50 uppercase tracking-wider">RFC: {profile?.rfc || 'No registrado'}</p>
                                </div>
                            </div>
                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/50">Asesor:</span>
                                    <span className="font-bold text-accent">{profile?.advisor_name || 'Administración'}</span>
                                </div>
                                <Button primary full className="bg-white !text-primary-dark hover:bg-accent hover:!text-white border-none py-3 text-sm">
                                    Contactar Asesor
                                </Button>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-light-beige shadow-sm">
                            <h3 className="font-bold text-primary-dark mb-6 flex items-center justify-between">
                                Notificaciones
                                <ChevronRight size={16} className="text-accent" />
                            </h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 shrink-0"></div>
                                    <div>
                                        <p className="text-sm text-primary-dark leading-snug mb-1">Bienvenido a su nuevo portal digital de CCI.</p>
                                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Hoy</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
