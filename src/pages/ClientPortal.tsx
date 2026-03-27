import { useState, useEffect } from "react";
import {
    Lock, FileText, PieChart, ShieldCheck,
    LogOut, Download, TrendingUp, TrendingDown,
    ChevronRight, Bell, DollarSign, Plus, Upload
} from "lucide-react";
import Button from "../components/ui/Button";
import { supabase } from "../lib/supabase";
import FinanceTracker from "../components/portal/FinanceTracker";
import AdminDashboard from "../components/portal/AdminDashboard";
import TicketUploader from "../components/portal/TicketUploader";
import { 
    BarChart, Bar, ResponsiveContainer, XAxis, Tooltip as RechartsTooltip
} from 'recharts';

const MASTER_EMAIL = 'cci.adrianalcaraz@gmail.com';

// Define interfaces for our real data
interface Profile {
    full_name: string;
    rfc: string;
    advisor_name: string;
    status: 'activo' | 'suspendido' | 'cancelado';
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

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        console.log("Attempting login...");
        setIsLoading(true);
        setMessage(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            console.log("Login result:", { data, error });

            if (error) {
                setMessage({ type: 'error', text: 'Acceso denegado. Verifique sus credenciales.' });
            } else {
                setMessage({ type: 'success', text: '¡Bienvenido de nuevo!' });
            }
        } catch (err) {
            console.error("Login exception:", err);
            setMessage({ type: 'error', text: 'Ocurrió un error inesperado al iniciar sesión.' });
        } finally {
            setIsLoading(false);
        }
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

                                <Button primary full className="py-4" loading={isLoading} type="submit" onClick={() => handleLogin()}>
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
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'finance' | 'tickets'>('dashboard');

    const isMaster = user.email === MASTER_EMAIL;

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
                    .order('created_at', { ascending: false });

                if (docsData) setDocs(docsData);

                // Fetch finance records for the dashboard
                const { data: recordsData } = await supabase
                    .from('finance_records')
                    .select('*')
                    .order('date', { ascending: false });

                if (recordsData) setRecords(recordsData);
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
                        <h1 className="text-3xl font-bold text-primary-dark mb-2">Resumen Financiero Digital</h1>
                        <p className="text-neutral-500 flex items-center gap-2">
                            <ShieldCheck size={16} className="text-green-600" />
                            Empresa: <span className="font-bold text-primary">{profile?.full_name || user.email}</span>
                            {profile?.status && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${profile.status === 'activo' ? 'bg-green-100 text-green-700' :
                                    profile.status === 'suspendido' ? 'bg-amber-100 text-amber-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {profile.status}
                                </span>
                            )}
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

                {isMaster ? (
                    <AdminDashboard user={user} />
                ) : (
                    <>
                        {/* Tab Navigation */}
                        <div className="flex flex-wrap gap-4 mb-8 border-b border-light-beige pb-4 animate-fade-in delay-100">
                    <button 
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${activeTab === 'dashboard' ? 'bg-primary-dark text-white shadow-md' : 'bg-white border border-light-beige text-neutral-500 hover:border-accent hover:text-primary-dark'}`}
                    >
                        Panel Principal
                    </button>
                    <button 
                        onClick={() => setActiveTab('finance')}
                        className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${activeTab === 'finance' ? 'bg-primary-dark text-white shadow-md' : 'bg-white border border-light-beige text-neutral-500 hover:border-accent hover:text-primary-dark'}`}
                    >
                        Finanzas Personales
                    </button>
                    <button 
                        onClick={() => setActiveTab('tickets')}
                        className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${activeTab === 'tickets' ? 'bg-primary-dark text-white shadow-md' : 'bg-white border border-light-beige text-neutral-500 hover:border-accent hover:text-primary-dark'}`}
                    >
                        Tickets y Facturas
                    </button>
                </div>

                {activeTab === 'dashboard' ? (
                    <div className="animate-fade-in space-y-8">
                        {/* BENTO GRID: Financial KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Card 1: Balance Total */}
                            <div className="bg-primary-dark rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-accent/30"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                                            <DollarSign size={20} className="text-accent" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Liquididad Total</span>
                                    </div>
                                    <h3 className="text-4xl font-heading font-black mb-2 tracking-tighter">
                                        ${records.reduce((acc, r) => acc + (Number(r.income) - Number(r.expense)), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </h3>
                                    <p className="text-xs text-white/30 font-medium">Suma de todas tus cuentas activas</p>
                                </div>
                            </div>

                            {/* Card 2: Flujo Mensual */}
                            {(() => {
                                const currentMonth = new Date().toISOString().substring(0, 7);
                                const monthRecords = records.filter(r => r.date.startsWith(currentMonth));
                                const monthIncome = monthRecords.reduce((acc, r) => acc + Number(r.income), 0);
                                const monthExpense = monthRecords.reduce((acc, r) => acc + Number(r.expense), 0);
                                const savings = monthIncome - monthExpense;
                                
                                return (
                                    <>
                                        <div className="bg-white rounded-[2.5rem] p-8 border border-light-beige shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                                            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-all"></div>
                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-6">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Flujo de {new Date().toLocaleString('es', { month: 'long' })}</span>
                                                    <TrendingUp size={18} className="text-green-500" />
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-[10px] font-black text-neutral-300 uppercase mb-1">Ingresos</p>
                                                            <p className="text-xl font-bold text-primary-dark">${monthIncome.toLocaleString('en-US')}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-neutral-300 uppercase mb-1">Gastos</p>
                                                            <p className="text-xl font-bold text-red-500">${monthExpense.toLocaleString('en-US')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden flex">
                                                        <div className="h-full bg-green-500" style={{ width: `${monthIncome > 0 ? (monthIncome / (monthIncome + monthExpense)) * 100 : 50}%` }}></div>
                                                        <div className="h-full bg-red-500 opacity-30" style={{ width: `${monthExpense > 0 ? (monthExpense / (monthIncome + monthExpense)) * 100 : 50}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-[2.5rem] p-8 border border-light-beige shadow-sm hover:shadow-md transition-all flex flex-col justify-center relative overflow-hidden group">
                                            <div className="absolute top-1/2 -translate-y-1/2 right-6 opacity-5 rotate-12 group-hover:scale-110 transition-transform">
                                                <ShieldCheck size={80} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">Ahorro Neto</span>
                                            <h3 className={`text-3xl font-heading font-black tracking-tighter ${savings >= 0 ? 'text-primary-dark' : 'text-red-600'}`}>
                                                ${savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </h3>
                                            <p className="text-xs text-neutral-400 mt-2 font-medium">Margen del {monthIncome > 0 ? ((savings / monthIncome) * 100).toFixed(1) : 0}% sobre ingresos</p>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        {/* THIRD ROW: Mini-Chart & Flow Trend */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-light-beige shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-sm font-bold text-primary-dark">Tendencia de Flujo</h3>
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-1">Últimos 7 movimientos</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Ingresos</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Gastos</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-32 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={records.slice(0, 7).reverse().map(r => ({
                                        name: new Date(r.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
                                        ingreso: Number(r.income),
                                        gasto: Number(r.expense)
                                    }))}>
                                        <XAxis dataKey="name" hide />
                                        <RechartsTooltip 
                                            cursor={{ fill: '#f8f8f8' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-primary-dark text-white px-3 py-2 rounded-xl text-[10px] font-bold shadow-2xl border border-white/10">
                                                            {payload[0].payload.ingreso > 0 
                                                                ? `+$${payload[0].payload.ingreso.toLocaleString()}`
                                                                : `-$${payload[0].payload.gasto.toLocaleString()}`
                                                            }
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="ingreso" fill="#eab308" radius={[4, 4, 0, 0]} barSize={20} />
                                        <Bar dataKey="gasto" fill="#f87171" radius={[4, 4, 0, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* FOURTH ROW: Activity & Documents */}
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Recent Activity */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white rounded-[2.5rem] border border-light-beige shadow-sm overflow-hidden">
                                    <div className="p-8 border-b border-light-beige flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-primary-dark">Actividad Reciente</h2>
                                        <button onClick={() => setActiveTab('finance')} className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline flex items-center gap-1 group">
                                            Ver Todo <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                                        </button>
                                    </div>
                                    <div className="divide-y divide-light-beige/50">
                                        {records.slice(0, 6).map((record) => (
                                            <div key={record.id} className="p-5 flex items-center justify-between hover:bg-neutral-50/50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${Number(record.income) > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                                        {Number(record.income) > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-primary-dark text-sm capitalize">{record.concept.toLowerCase()}</h4>
                                                        <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">{record.payment_method}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-black text-sm ${Number(record.income) > 0 ? 'text-green-600' : 'text-primary-dark'}`}>
                                                        {Number(record.income) > 0 ? `+$${Number(record.income).toLocaleString()}` : `-$${Number(record.expense).toLocaleString()}`}
                                                    </p>
                                                    <p className="text-[10px] text-neutral-400 font-medium">
                                                        {new Date(record.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Compact Dossier & Shortcuts */}
                            <div className="space-y-6">
                                <div className="bg-primary-dark/5 p-8 rounded-[2.5rem] border border-primary-dark/5 space-y-6">
                                    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-primary-dark/40">Acciones Rápidas</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => { setActiveTab('finance'); /* Trigger form open logic if possible or just navigate */ }}
                                            className="bg-white p-4 rounded-2xl border border-light-beige shadow-sm hover:border-accent hover:scale-[1.02] transition-all text-center group"
                                        >
                                            <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-accent group-hover:text-white transition-all">
                                                <Plus size={20} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-wider text-primary-dark">Nuevo Gasto</span>
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab('tickets')}
                                            className="bg-white p-4 rounded-2xl border border-light-beige shadow-sm hover:border-accent hover:scale-[1.02] transition-all text-center group"
                                        >
                                            <div className="w-10 h-10 bg-primary-dark/5 text-primary-dark rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-dark group-hover:text-white transition-all">
                                                <Upload size={20} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-wider text-primary-dark">Subir Ticket</span>
                                        </button>
                                    </div>
                                    <Button 
                                        full 
                                        primary 
                                        className="py-4 text-[10px] font-black uppercase tracking-widest shadow-xl"
                                        onClick={() => window.open('https://wa.me/5213121682366', '_blank')}
                                    >
                                        Contactar Asesor
                                    </Button>
                                </div>

                                <div className="bg-white p-8 rounded-[2.5rem] border border-light-beige shadow-sm">
                                    <h3 className="font-bold text-primary-dark mb-6 flex items-center justify-between">
                                        Expediente Digital
                                        <FileText size={16} className="text-accent" />
                                    </h3>
                                    <div className="space-y-4">
                                        {docs.slice(0, 3).map(doc => (
                                            <div key={doc.id} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-neutral-50 rounded-lg flex items-center justify-center text-neutral-300 group-hover:text-accent transition-colors">
                                                        <FileText size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-primary-dark truncate max-w-[120px]">{doc.name}</p>
                                                        <p className="text-[9px] text-neutral-400 font-medium">{new Date(doc.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <a href={doc.file_url} target="_blank" className="p-2 text-neutral-300 hover:text-accent transition-colors">
                                                    <Download size={14} />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'finance' ? (
                    <div className="animate-fade-in">
                        <FinanceTracker user={user} />
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <TicketUploader user={user} isMaster={false} />
                    </div>
                )}
                    </>
                )}
            </div>
        </div>
    );
}
