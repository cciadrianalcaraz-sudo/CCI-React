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
    ResponsiveContainer, Tooltip as RechartsTooltip,
    PieChart as RechartsPieChart, Pie, Cell,
    BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid
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
    const [activeTab, setActiveTab] = useState<'dashboard' | 'finance' | 'tickets'>(() => {
        const saved = localStorage.getItem(`portal_active_tab_${user.id}`);
        return (saved === 'dashboard' || saved === 'finance' || saved === 'tickets') ? saved : 'dashboard';
    });

    // Save active tab to localStorage whenever it changes
    useEffect(() => {
        if (user?.id) {
            localStorage.setItem(`portal_active_tab_${user.id}`, activeTab);
        }
    }, [activeTab, user?.id]);
    const [selectedDashboardMonth, setSelectedDashboardMonth] = useState<string>('');
    const [availableMonths, setAvailableMonths] = useState<{label: string, value: string}[]>([]);

    const isMaster = user.email === MASTER_EMAIL;

    const loadDashboardData = async () => {
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

                if (!isMaster) {
                    // Fetch finance records for the dashboard
                    const { data: recordsData } = await supabase
                        .from('finance_records')
                        .select('*')
                        .order('date', { ascending: false });

                    if (recordsData) {
                        setRecords(recordsData);
                        
                        // Derive unique months for the filter
                        const recordMonths = Array.from(new Set(recordsData.map(r => {
                            // Normalize date format if needed (handle both YYYY-MM-DD and DD/MM/YYYY)
                            const date = r.date;
                            if (date.includes('-')) return date.substring(0, 7);
                            const parts = date.split('/');
                            if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}`;
                            return date;
                        }))).sort().reverse();

                        const formatted = recordMonths.filter(m => m && m.includes('-')).map(m => {
                            const [year, month] = m.split('-');
                            const date = new Date(Number(year), Number(month) - 1, 1);
                            return {
                                value: m,
                                label: date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
                            };
                        });
                        setAvailableMonths(formatted);
                        
                        // If no month selected or current month not in list, set it
                        if (!selectedDashboardMonth) {
                            const todayStr = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
                            if (formatted.some(m => m.value === todayStr)) {
                                setSelectedDashboardMonth(todayStr);
                            } else if (formatted.length > 0) {
                                setSelectedDashboardMonth(formatted[0].value);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        loadDashboardData();
    }, [user.id, isMaster]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#faf7f2] pt-32 md:pt-44 pb-20 px-[6vw] md:px-[8vw]">
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
                            onClick={() => {
                                localStorage.removeItem('portal_active_tab');
                                onLogout();
                            }}
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
                    <div className="animate-fade-in space-y-10 pb-10">
                        {/* BENTO GRID: Financial KPIs 2.0 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                            {/* Card 1: Balance Total al cierre del periodo */}
                            <div className="bg-primary-dark rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/5">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 rounded-full -mr-20 -mt-20 blur-[80px] transition-all duration-700 group-hover:bg-accent/40 group-hover:scale-110"></div>
                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-12 h-12 rounded-[1.25rem] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:border-accent/50 transition-colors">
                                                <DollarSign size={24} className="text-accent" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block">Liquididad</span>
                                                <span className="text-[9px] font-bold text-accent uppercase tracking-wider">Cierre de {availableMonths.find(m => m.value === selectedDashboardMonth)?.label || 'Periodo'}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-5xl font-heading font-black mb-2 tracking-tighter leading-none">
                                            ${records
                                                .filter(r => {
                                                    // Normalize for comparison
                                                    const rDate = r.date.includes('/') ? r.date.split('/').reverse().join('-') : r.date;
                                                    // Accumulate balance until the end of selected month
                                                    return rDate.substring(0, 7) <= (selectedDashboardMonth || '9999-12') && (r.concept || '').toUpperCase().trim() !== 'SALDO INICIAL';
                                                })
                                                .reduce((acc, r) => acc + (Number(r.income) - Number(r.expense)), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </h3>
                                    </div>
                                     <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                        <p className="text-xs text-white/30 font-medium">Patrimonio acumulado al periodo</p>
                                        <div className="flex items-center gap-1 text-accent text-[10px] font-black">
                                            SECURE <ShieldCheck size={12} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 1.5: Disponible para Gastar (PocketGuard Style) */}
                            {(() => {
                                const selectedMonth = selectedDashboardMonth || new Date().toISOString().substring(0, 7);
                                
                                const normalizeDate = (dateStr: string) => {
                                    if (dateStr.includes('-')) return dateStr;
                                    const parts = dateStr.split('/');
                                    if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                                    return dateStr;
                                };

                                // Calculate Historical Averages
                                const fijosByMonth: Record<string, number> = {};
                                const ahorroByMonth: Record<string, number> = {};
                                
                                records.forEach(r => {
                                    const dateStr = normalizeDate(r.date);
                                    const month = dateStr.substring(0, 7);
                                    
                                    if (r.expense_type === 'Fijo' && r.expense > 0) {
                                        fijosByMonth[month] = (fijosByMonth[month] || 0) + Number(r.expense);
                                    }
                                    if (r.expense_type === 'Ahorro' && r.expense > 0) {
                                        ahorroByMonth[month] = (ahorroByMonth[month] || 0) + Number(r.expense);
                                    }
                                });
                                
                                const currentRealMonth = new Date().toISOString().substring(0, 7);
                                const fijosMonths = Object.keys(fijosByMonth).filter(m => m !== currentRealMonth);
                                const avgFijo = fijosMonths.length > 0 ? fijosMonths.reduce((a, m) => a + fijosByMonth[m], 0) / fijosMonths.length : 0;
                                const avgAhorro = Object.keys(ahorroByMonth).filter(m => m !== currentRealMonth).length > 0 ? 
                                    Object.keys(ahorroByMonth).filter(m => m !== currentRealMonth).reduce((a, m) => a + ahorroByMonth[m], 0) / Object.keys(ahorroByMonth).filter(m => m !== currentRealMonth).length : 0;
                                
                                // Current month records
                                const monthRecords = records.filter(r => {
                                    const c = (r.concept || '').toUpperCase().trim();
                                    const normalizedDate = normalizeDate(r.date);
                                    return normalizedDate.startsWith(selectedMonth) && c !== 'SALDO INICIAL' && !c.includes('TRASPASO');
                                });
                                
                                const currentFijos = monthRecords.filter(r => r.expense_type === 'Fijo').reduce((a, r) => a + Number(r.expense), 0);
                                const currentAhorro = monthRecords.filter(r => r.expense_type === 'Ahorro').reduce((a, r) => a + Number(r.expense), 0);
                                
                                const pendingFijo = Math.max(0, avgFijo - currentFijos);
                                const pendingAhorro = Math.max(0, avgAhorro - currentAhorro);
                                
                                const totalBalance = records
                                    .filter(r => normalizeDate(r.date).substring(0, 7) <= selectedMonth && (r.concept || '').toUpperCase().trim() !== 'SALDO INICIAL')
                                    .reduce((acc, r) => acc + (Number(r.income) - Number(r.expense)), 0);
                                    
                                const libreParaGastar = totalBalance - pendingFijo - pendingAhorro;
                                const isSafe = libreParaGastar > (totalBalance * 0.1);

                                return (
                                    <div className="bg-gradient-to-br from-indigo-900 via-primary-dark to-indigo-950 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-indigo-900/40 border border-white/10 group">
                                        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full -ml-32 -mt-32 blur-3xl group-hover:bg-indigo-400/30 transition-all duration-700"></div>
                                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-teal-400/10 rounded-full -mr-20 -mb-20 blur-3xl"></div>
                                        
                                        <div className="relative z-10 h-full flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-center mb-8">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Libre para Hoy</span>
                                                    <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center backdrop-blur-sm border border-indigo-400/30">
                                                        <ShieldCheck size={16} className="text-indigo-200" />
                                                    </div>
                                                </div>
                                                <h3 className="text-4xl lg:text-5xl font-heading font-black tracking-tighter mb-2 break-words">
                                                    ${libreParaGastar.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </h3>
                                                <p className="text-xs font-bold text-indigo-200/60 uppercase tracking-widest mt-2 flex items-center gap-1.5">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isSafe ? 'bg-teal-400' : 'bg-red-400'}`}></span>
                                                    Gasto Variable Seguro
                                                </p>
                                            </div>
                                            
                                            <div className="mt-8 space-y-3">
                                                <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-white/50 border-t border-white/10 pt-4">
                                                    <span>Dinero Total</span>
                                                    <span className="text-white">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-bold text-white/70">
                                                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span> Fijos Pendientes</span>
                                                    <span className="text-red-200">${pendingFijo.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-bold text-white/70">
                                                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-teal-400 rounded-full"></span> Ahorro Pendiente</span>
                                                    <span className="text-teal-200">${pendingAhorro.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Card 2: Flujo Mensual - Interactive Glass */}
                            {(() => {
                                const selectedMonth = selectedDashboardMonth || new Date().toISOString().substring(0, 7);
                                
                                const normalizeDate = (dateStr: string) => {
                                    if (dateStr.includes('-')) return dateStr;
                                    const parts = dateStr.split('/');
                                    if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                                    return dateStr;
                                };

                                const monthRecords = records.filter(r => {
                                    const c = (r.concept || '').toUpperCase().trim();
                                    const normalizedDate = normalizeDate(r.date);
                                    return normalizedDate.startsWith(selectedMonth) && c !== 'SALDO INICIAL' && !c.includes('TRASPASO');
                                });
                                
                                const monthIncome = monthRecords.reduce((acc, r) => acc + Number(r.income), 0);
                                const monthExpense = monthRecords.reduce((acc, r) => acc + Number(r.expense), 0);
                                const savings = monthIncome - monthExpense;
                                const savingsRate = monthIncome > 0 ? (savings / monthIncome) * 100 : 0;
                                
                                // Calculation for daily burn
                                const isCurrentMonth = selectedMonth === new Date().toISOString().substring(0, 7);
                                const daysInMonth = isCurrentMonth ? new Date().getDate() : new Date(Number(selectedMonth.split('-')[0]), Number(selectedMonth.split('-')[1]), 0).getDate();
                                const dailyBurn = monthExpense / daysInMonth;

                                return (
                                    <>
                                        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-10 border border-light-beige shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:scale-125"></div>
                                            <div className="relative z-10 h-full flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center justify-between mb-8">
                                                        <div>
                                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 block mb-1">Rendimiento Real</span>
                                                            <select 
                                                                value={selectedDashboardMonth} 
                                                                onChange={(e) => setSelectedDashboardMonth(e.target.value)}
                                                                className="bg-transparent text-[10px] font-black text-accent uppercase tracking-widest outline-none cursor-pointer appearance-none pr-4 capitalize border-none p-0 focus:ring-0"
                                                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23a3a3a3\' stroke-width=\'3\'%3E%3Cpath d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '10px' }}
                                                            >
                                                                {availableMonths.map(m => (
                                                                    <option key={m.value} value={m.value} className="text-primary-dark font-sans">{m.label}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                                                            <TrendingUp size={16} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-6">
                                                        <div className="flex justify-between items-end">
                                                            <div>
                                                                <p className="text-[9px] font-black text-neutral-300 uppercase mb-2 tracking-widest">Ingresos</p>
                                                                <p className="text-3xl font-black text-primary-dark tracking-tighter">${monthIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[9px] font-black text-neutral-300 uppercase mb-2 tracking-widest">Gastos</p>
                                                                <p className="text-2xl font-black text-red-500 tracking-tighter">${monthExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="w-full h-2.5 bg-neutral-50 rounded-full overflow-hidden flex p-0.5 border border-neutral-100">
                                                                <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${monthIncome > 0 ? (monthIncome / (monthIncome + monthExpense)) * 100 : 50}%` }}></div>
                                                                <div className="h-full bg-red-400/30 rounded-full transition-all duration-1000 ml-1" style={{ width: `${monthExpense > 0 ? (monthExpense / (monthIncome + monthExpense)) * 100 : 50}%` }}></div>
                                                            </div>
                                                            <div className="flex justify-between text-[8px] font-black uppercase text-neutral-400 tracking-tighter">
                                                                <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Entrada</span>
                                                                <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> Salida</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-10 border border-light-beige shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-2xl transition-all duration-500 flex flex-col justify-between relative overflow-hidden group">
                                            <div className="absolute -bottom-8 -right-8 opacity-[0.03] rotate-[15deg] group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-700">
                                                <TrendingUp size={180} />
                                            </div>
                                            <div className="relative z-10">
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-2 block">Utilidad Neta</span>
                                                <h3 className={`text-4xl font-heading font-black tracking-tighter ${savings >= 0 ? 'text-primary-dark' : 'text-red-600'}`}>
                                                    ${savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </h3>
                                                <div className="mt-6 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-black text-neutral-300 uppercase tracking-widest">Margen de Ahorro</span>
                                                            <span className={`text-sm font-black ${savingsRate >= 20 ? 'text-green-600' : 'text-amber-500'}`}>{savingsRate.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="flex flex-col text-right">
                                                            <span className="text-[8px] font-black text-neutral-300 uppercase tracking-widest">Gasto Diario Promedio</span>
                                                            <span className="text-sm font-black text-primary-dark">${dailyBurn.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                                        </div>
                                                    </div>
                                                    <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-black text-neutral-300 uppercase tracking-widest">Estado</span>
                                                            <div className={`mt-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider text-center ${savings >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {savings >= 0 ? 'Superávit' : 'Déficit'}
                                                            </div>
                                                        </div>
                                                        <p className="text-[9px] text-neutral-400 font-medium max-w-[100px] leading-tight text-right italic">"Invertir el excedente aumenta tu libertad financiera."</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}

                            {/* Performance Bar Chart - NEW VISUALIZATION */}
                            <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] p-10 border border-light-beige shadow-sm col-span-1 md:col-span-3">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                                    <div>
                                        <h2 className="text-xl font-black text-primary-dark tracking-tighter">Comparativa Mensual de Rendimiento</h2>
                                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-1">Evolución de flujo de caja en los últimos 6 meses</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-primary-dark"></div>
                                            <span className="text-[10px] font-black uppercase text-neutral-600">Ingresos</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-accent"></div>
                                            <span className="text-[10px] font-black uppercase text-neutral-600">Gastos</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-80 w-full overflow-hidden">
                                    {(() => {
                                        // Get last 6 months for comparison
                                        const last6Months = availableMonths.slice(0, 6).reverse();
                                        const chartData = last6Months.map(m => {
                                            const monthMoves = records.filter(r => {
                                                const c = (r.concept || '').toUpperCase().trim();
                                                const normalizedDate = (r.date.includes('/')) ? r.date.split('/').reverse().join('-') : r.date;
                                                return normalizedDate.startsWith(m.value) && c !== 'SALDO INICIAL' && !c.includes('TRASPASO');
                                            });
                                            return {
                                                month: m.label.split(' ')[0], // Just the month name
                                                ingresos: monthMoves.reduce((acc, r) => acc + Number(r.income), 0),
                                                gastos: monthMoves.reduce((acc, r) => acc + Number(r.expense), 0)
                                            };
                                        });

                                        return (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RechartsBarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                    <XAxis 
                                                        dataKey="month" 
                                                        axisLine={false} 
                                                        tickLine={false} 
                                                        tick={{fill: '#a3a3a3', fontSize: 10, fontWeight: 900}} 
                                                        tickFormatter={(val) => val.toUpperCase()}
                                                    />
                                                    <YAxis 
                                                        axisLine={false} 
                                                        tickLine={false} 
                                                        tick={{fill: '#a3a3a3', fontSize: 10}}
                                                        tickFormatter={(val) => `$${val.toLocaleString()}`}
                                                    />
                                                    <RechartsTooltip 
                                                        cursor={{fill: '#f8f8f8'}}
                                                        content={({ active, payload }) => {
                                                            if (active && payload && payload.length) {
                                                                return (
                                                                    <div className="bg-primary-dark text-white p-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
                                                                        <p className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-50 border-b border-white/10 pb-2">{payload[0].payload.month}</p>
                                                                        <div className="space-y-2">
                                                                            <p className="flex items-center justify-between gap-8">
                                                                                <span className="text-[10px] font-bold uppercase">Ingresos:</span>
                                                                                <span className="text-sm font-black text-white">${payload[0].value?.toLocaleString()}</span>
                                                                            </p>
                                                                            <p className="flex items-center justify-between gap-8">
                                                                                <span className="text-[10px] font-bold uppercase">Gastos:</span>
                                                                                <span className="text-sm font-black text-accent">${payload[1].value?.toLocaleString()}</span>
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        }}
                                                    />
                                                    <Bar dataKey="ingresos" fill="#1a1a1a" radius={[6, 6, 0, 0]} barSize={24} />
                                                    <Bar dataKey="gastos" fill="#EFA364" radius={[6, 6, 0, 0]} barSize={24} />
                                                </RechartsBarChart>
                                            </ResponsiveContainer>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* THIRD ROW: Insightful Donut & Recent Activity */}
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Insight: Expense Distribution */}
                            <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] border border-light-beige shadow-sm overflow-hidden flex flex-col group">
                                <div className="p-10 border-b border-light-beige/50">
                                    <h2 className="text-xl font-black text-primary-dark tracking-tighter">Distribución de Gastos</h2>
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-1">Donde se concentra tu capital este periodo</p>
                                </div>
                                <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-8 gap-8">
                                    <div className="w-full h-56 relative">
                                        {(() => {
                                            const selectedMonth = selectedDashboardMonth || new Date().toISOString().substring(0, 7);
                                            const monthExpenses = records.filter(r => {
                                                const c = (r.concept || '').toUpperCase().trim();
                                                return r.date.startsWith(selectedMonth) && Number(r.expense) > 0 && c !== 'SALDO INICIAL' && !c.includes('TRASPASO');
                                            });
                                            
                                            const categoryTotals: Record<string, number> = {};
                                            monthExpenses.forEach(r => {
                                                categoryTotals[r.concept] = (categoryTotals[r.concept] || 0) + Number(r.expense);
                                            });

                                            const pieData = Object.entries(categoryTotals)
                                                .map(([name, value]) => ({ name, value }))
                                                .sort((a, b) => b.value - a.value)
                                                .slice(0, 4);

                                            if (Object.keys(categoryTotals).length > 4) {
                                                const othersValue = Object.entries(categoryTotals)
                                                    .slice(4)
                                                    .reduce((acc, [_, val]) => acc + val, 0);
                                                pieData.push({ name: 'Otros', value: othersValue });
                                            }

                                            const COLORS = ['#1a1a1a', '#eab308', '#4b5563', '#a1a1aa', '#f4f4f5'];

                                            if (pieData.length === 0) {
                                                return (
                                                    <div className="h-full flex items-center justify-center text-neutral-300 text-[10px] font-black uppercase tracking-widest border-2 border-dashed border-neutral-100 rounded-full aspect-square max-h-48 mx-auto">
                                                        Sin datos este periodo
                                                    </div>
                                                );
                                            }

                                            return (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RechartsPieChart>
                                                        <Pie
                                                            data={pieData}
                                                            innerRadius={65}
                                                            outerRadius={85}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                            animationBegin={0}
                                                            animationDuration={1500}
                                                        >
                                                            {pieData.map((_, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <RechartsTooltip 
                                                            content={({ active, payload }) => {
                                                                if (active && payload && payload.length && payload[0].value !== undefined) {
                                                                    return (
                                                                        <div className="bg-primary-dark text-white px-4 py-3 rounded-2xl text-[10px] font-bold shadow-2xl border border-white/10 backdrop-blur-md">
                                                                            <p className="uppercase tracking-widest mb-1 opacity-50">{payload[0].name}</p>
                                                                            <p className="text-sm font-black text-accent">${payload[0].value.toLocaleString()}</p>
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            }}
                                                        />
                                                    </RechartsPieChart>
                                                </ResponsiveContainer>
                                            );
                                        })()}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                            <PieChart size={24} className="mx-auto text-accent/20 mb-1" />
                                            <span className="text-[8px] font-black uppercase tracking-tighter text-neutral-400 block">Top</span>
                                            <span className="text-[8px] font-black uppercase tracking-tighter text-neutral-400 block">Gastos</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full space-y-3">
                                        {(() => {
                                            const selectedMonth = selectedDashboardMonth || new Date().toISOString().substring(0, 7);
                                            const monthExpenses = records.filter(r => {
                                                const c = (r.concept || '').toUpperCase().trim();
                                                return r.date.startsWith(selectedMonth) && Number(r.expense) > 0 && c !== 'SALDO INICIAL' && !c.includes('TRASPASO');
                                            });
                                            const totalMonthExpense = monthExpenses.reduce((acc, r) => acc + Number(r.expense), 0);
                                            
                                            const categoryTotals: Record<string, number> = {};
                                            monthExpenses.forEach(r => {
                                                categoryTotals[r.concept] = (categoryTotals[r.concept] || 0) + Number(r.expense);
                                            });

                                            const COLORS = ['bg-primary-dark', 'bg-accent', 'bg-neutral-600', 'bg-neutral-400', 'bg-neutral-200'];

                                            return Object.entries(categoryTotals)
                                                .map(([name, value]) => ({ name, value }))
                                                .sort((a, b) => b.value - a.value)
                                                .slice(0, 5)
                                                .map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between group/item">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-2 h-2 rounded-full ${COLORS[i % COLORS.length]}`}></div>
                                                            <span className="text-[10px] font-bold text-primary-dark uppercase truncate max-w-[100px]">{item.name}</span>
                                                        </div>
                                                        <span className="text-[10px] font-black text-neutral-400">{totalMonthExpense > 0 ? ((item.value / totalMonthExpense) * 100).toFixed(0) : 0}%</span>
                                                    </div>
                                                ));
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity: Floating List */}
                            <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] border border-light-beige shadow-sm overflow-hidden group">
                                <div className="p-10 border-b border-light-beige/50 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-black text-primary-dark tracking-tighter">Actividad</h2>
                                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Últimos movimientos registrados</p>
                                    </div>
                                    <button onClick={() => setActiveTab('finance')} className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 hover:bg-accent hover:text-white transition-all">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                                <div className="p-4 space-y-2">
                                     {records
                                        .filter(r => {
                                            const normalizedDate = (r.date.includes('/')) ? r.date.split('/').reverse().join('-') : r.date;
                                            return normalizedDate.startsWith(selectedDashboardMonth || new Date().toISOString().substring(0, 7));
                                        })
                                        .slice(0, 8).map((record) => (
                                         <div key={record.id} className="p-4 rounded-2xl hover:bg-neutral-50 flex items-center justify-between transition-all group/row">
                                             <div className="flex items-center gap-4">
                                                 <div className={`w-11 h-11 rounded-1.5xl flex items-center justify-center transition-all group-hover/row:scale-110 ${Number(record.income) > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                                     {Number(record.income) > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                                 </div>
                                                 <div>
                                                     <h4 className="font-bold text-primary-dark text-sm capitalize">{record.concept.toLowerCase()}</h4>
                                                     <div className="flex items-center gap-2 mt-0.5">
                                                         <span className="text-[8px] font-black text-neutral-300 uppercase tracking-widest leading-none border-r border-neutral-100 pr-2">{record.payment_method}</span>
                                                         <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-tighter leading-none">{new Date(record.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                                                     </div>
                                                 </div>
                                             </div>
                                             <div className="text-right">
                                                 <p className={`font-black text-sm tracking-tight ${Number(record.income) > 0 ? 'text-green-600' : 'text-primary-dark'}`}>
                                                     {Number(record.income) > 0 ? `+$${Number(record.income).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `-$${Number(record.expense).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                                                 </p>
                                                 <div className="h-1 w-0 bg-accent ml-auto mt-1 transition-all group-hover/row:w-full"></div>
                                             </div>
                                         </div>
                                     ))}
                                     {records.filter(r => r.date.startsWith(selectedDashboardMonth || new Date().toISOString().substring(0, 7))).length === 0 && (
                                         <div className="p-10 text-center text-neutral-300 text-[10px] font-black uppercase tracking-widest border-2 border-dashed border-neutral-50 rounded-[2rem]">
                                             Sin actividad en este periodo
                                         </div>
                                     )}
                                 </div>
                            </div>
                        </div>

                        {/* FOURTH ROW: Documents & Shortcuts (Simplified Bento) */}
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Glass Shortcuts */}
                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button 
                                    onClick={() => setActiveTab('finance')}
                                    className="bg-accent rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                    <div className="relative z-10 flex flex-col justify-between h-full min-h-[140px]">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                                            <Plus size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black tracking-tight leading-none mb-2">Nuevo Registro</h3>
                                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Añadir ingreso o gasto manual</p>
                                        </div>
                                    </div>
                                </button>
                                
                                <button 
                                    onClick={() => setActiveTab('tickets')}
                                    className="bg-white rounded-[2.5rem] p-8 border border-light-beige shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group"
                                >
                                    <div className="relative z-10 flex flex-col justify-between h-full min-h-[140px]">
                                        <div className="w-12 h-12 bg-primary-dark/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-dark group-hover:text-white transition-all">
                                            <Upload size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-primary-dark tracking-tight leading-none mb-2">Subir Comprobante</h3>
                                            <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest">Digitaliza tus tickets y facturas</p>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {/* Compact Dossier 2.0 */}
                            <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-light-beige shadow-sm p-8 group">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="font-black text-primary-dark tracking-tighter">Expediente</h3>
                                        <p className="text-[9px] text-neutral-400 font-black uppercase tracking-widest">Últimos archivos</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-accent">
                                        <FileText size={16} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {docs.slice(0, 3).map(doc => (
                                        <div key={doc.id} className="flex items-center justify-between group/doc bg-neutral-50/50 p-3 rounded-2xl hover:bg-neutral-50 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-white rounded-xl shadow-xs flex items-center justify-center text-neutral-300 group-hover/doc:text-accent transition-colors border border-neutral-100">
                                                    <FileText size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-primary-dark truncate w-24">{doc.name}</p>
                                                    <p className="text-[9px] text-neutral-400 font-medium">{new Date(doc.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <a href={doc.file_url} target="_blank" className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-300 hover:text-accent hover:bg-accent/10 transition-all">
                                                <Download size={16} />
                                            </a>
                                        </div>
                                    ))}
                                    <Button 
                                        full 
                                        outline 
                                        className="mt-4 border-dashed border-2 py-3 text-[9px] font-black uppercase tracking-[0.2em] opacity-60 hover:opacity-100"
                                        onClick={() => window.open('https://wa.me/5213121682366', '_blank')}
                                    >
                                        Solicitar Doc <Plus size={10} className="ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'finance' ? (
                    <div className="animate-fade-in">
                        <FinanceTracker 
                            user={user} 
                            records={records} 
                            onRefresh={loadDashboardData} 
                        />
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
