import { useState, useEffect, useMemo } from "react";
import {
    Lock, FileText, PieChart, ShieldCheck,
    LogOut, Download, TrendingUp, TrendingDown,
    Bell, DollarSign, Plus, Upload,
    LayoutDashboard, BarChart3, Search,
    ArrowRight, Sun, Moon
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

// Robust Date Normalization Helper
const normalizeDate = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('-')) return dateStr;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        // Assume DD/MM/YYYY
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
};

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
        setIsLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setMessage({ type: 'error', text: 'Acceso denegado. Verifique sus credenciales.' });
            } else {
                setMessage({ type: 'success', text: '¡Bienvenido de nuevo!' });
            }
        } catch (err) {
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
                                    <div className={`p-4 rounded-xl text-sm font-bold animate-fade-in ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
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

                                <Button primary full className="py-4" loading={isLoading} type="submit">
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

    useEffect(() => {
        if (user?.id) localStorage.setItem(`portal_active_tab_${user.id}`, activeTab);
    }, [activeTab, user?.id]);

    useEffect(() => {
        console.log("[DashboardView] Current Profile State:", profile);
    }, [profile]);

    const [selectedDashboardMonth, setSelectedDashboardMonth] = useState<string>('');
    const [availableMonths, setAvailableMonths] = useState<{label: string, value: string}[]>([]);
    const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem('portal_theme');
        return (saved === 'dark') ? 'dark' : 'light';
    });

    useEffect(() => {
        localStorage.setItem('portal_theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const financialMetrics = useMemo(() => {
        if (!records.length) return null;
        const selectedMonth = selectedDashboardMonth || new Date().toISOString().substring(0, 7);
        const [year, month] = selectedMonth.split('-').map(Number);
        
        const monthRecords = records.filter(r => {
            const c = (r.concept || '').toUpperCase().trim();
            const nDate = normalizeDate(r.date);
            return nDate.startsWith(selectedMonth) && c !== 'SALDO INICIAL' && !c.includes('TRASPASO');
        });

        const monthIncome = monthRecords.reduce((acc, r) => acc + Number(r.income), 0);
        const monthExpense = monthRecords.reduce((acc, r) => acc + Number(r.expense), 0);
        const savings = monthIncome - monthExpense;
        const savingsRate = monthIncome > 0 ? (savings / monthIncome) * 100 : 0;

        const totalBalance = records
            .filter(r => normalizeDate(r.date).substring(0, 7) <= selectedMonth && (r.concept || '').toUpperCase().trim() !== 'SALDO INICIAL')
            .reduce((acc, r) => acc + (Number(r.income) - Number(r.expense)), 0);

        // Previous month logic for comparison
        const prevMonthDate = new Date(year, month - 2, 1);
        const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
        
        const prevMonthRecords = records.filter(r => {
            const c = (r.concept || '').toUpperCase().trim();
            const nDate = normalizeDate(r.date);
            return nDate.startsWith(prevMonthStr) && c !== 'SALDO INICIAL' && !c.includes('TRASPASO');
        });

        const prevIncome = prevMonthRecords.reduce((acc, r) => acc + Number(r.income), 0);
        const prevExpense = prevMonthRecords.reduce((acc, r) => acc + Number(r.expense), 0);
        const prevBalance = records
            .filter(r => normalizeDate(r.date).substring(0, 7) <= prevMonthStr && (r.concept || '').toUpperCase().trim() !== 'SALDO INICIAL')
            .reduce((acc, r) => acc + (Number(r.income) - Number(r.expense)), 0);

        const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? '+100%' : '0%';
            const change = ((current - previous) / previous) * 100;
            return `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`;
        };

        const incomeChange = calculateChange(monthIncome, prevIncome);
        const expenseChange = calculateChange(monthExpense, prevExpense);
        const balanceChange = calculateChange(totalBalance, prevBalance);

        const fijosByMonth: Record<string, number> = {};
        records.forEach(r => {
            if (r.expense_type === 'Fijo' && r.expense > 0) {
                const m = normalizeDate(r.date).substring(0, 7);
                fijosByMonth[m] = (fijosByMonth[m] || 0) + Number(r.expense);
            }
        });
        const fijosMonths = Object.keys(fijosByMonth).filter(m => m !== new Date().toISOString().substring(0, 7));
        const avgFijo = fijosMonths.length > 0 ? fijosMonths.reduce((a, m) => a + fijosByMonth[m], 0) / fijosMonths.length : 0;
        const currentFijos = monthRecords.filter(r => r.expense_type === 'Fijo').reduce((a, r) => a + Number(r.expense), 0);
        const pendingFijo = Math.max(0, avgFijo - currentFijos);

        const isCurrentMonth = selectedMonth === new Date().toISOString().substring(0, 7);
        const daysInMonth = new Date(year, month, 0).getDate();
        const currentDay = isCurrentMonth ? new Date().getDate() : daysInMonth;
        const remainingDays = daysInMonth - currentDay;
        const dailyBurn = currentDay > 0 ? monthExpense / currentDay : 0;
        const projection = totalBalance - (dailyBurn * remainingDays) - pendingFijo;

        const savingsScore = Math.min(100, Math.max(0, (savingsRate / 20) * 100));
        const controlScore = Math.min(100, Math.max(0, 100 - (monthExpense > avgFijo ? ((monthExpense / (avgFijo || 1)) - 1) * 50 : 0)));
        const safetyScore = Math.min(100, (Math.max(0, totalBalance - pendingFijo) / (totalBalance || 1)) * 100);
        const healthScore = Math.round((savingsScore * 0.5) + (controlScore * 0.3) + (safetyScore * 0.2));

        return { 
            totalBalance, healthScore, monthIncome, monthExpense, 
            projection, pendingFijo, selectedMonth,
            incomeChange, expenseChange, balanceChange
        };
    }, [records, selectedDashboardMonth]);

    const isMaster = user.email === MASTER_EMAIL;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsCommandCenterOpen(prev => !prev); }
            if (e.key === 'Escape') setIsCommandCenterOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Búsqueda Agresiva del Perfil (ID -> Email -> Manual)
            let profileData: any = null;
            const userEmail = user.email?.toLowerCase().trim();

            // Intento A: Por ID exacto
            const { data: byId } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
            profileData = byId;

            // Intento B: Por Email exacto (si falló ID)
            if (!profileData && userEmail) {
                console.log(`[ClientPortal] Profile not found by ID, trying email: ${userEmail}`);
                const { data: byEmail } = await supabase.from('profiles').select('*').eq('email', userEmail).maybeSingle();
                profileData = byEmail;
            }

            // Intento C: Búsqueda manual (si falló todo lo anterior)
            if (!profileData && userEmail) {
                console.log(`[ClientPortal] Still no profile, performing manual search...`);
                const { data: allProfiles } = await supabase.from('profiles').select('*').limit(100);
                profileData = allProfiles?.find(p => p.email?.toLowerCase().trim() === userEmail) || null;
                if (profileData) console.log(`[ClientPortal] MANUALLY FOUND PROFILE BY EMAIL`);
            }
            
            if (profileData) {
                setProfile(profileData);
                console.log(`[ClientPortal] Profile loaded: ${profileData.full_name}`);
            } else {
                console.warn("[ClientPortal] ABANDON: No profile record found anywhere for user:", user.id, userEmail);
            }

            // 2. Cargar Documentos
            const { data: docsData } = await supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });
            if (docsData) setDocs(docsData);

            // 3. Cargar Registros Financieros (Compartidos por Empresa)
            if (!isMaster) {
                let companyUserIds: string[] = [user.id];
                const companyName = profileData?.full_name?.trim() || '';

                if (companyName) {
                    const { data: companions, error: companionsError } = await supabase
                        .from('profiles')
                        .select('id')
                        .ilike('full_name', companyName);
                    
                    if (companionsError) {
                        console.error("[ClientPortal] Error looking for companions:", companionsError);
                    } else if (companions && companions.length > 0) {
                        companyUserIds = companions.map((p: { id: string }) => p.id);
                    }
                }
                
                console.log(`[ClientPortal] Tracking ${companyUserIds.length} users for company: "${companyName || 'N/A'}"`);

                const { data: recordsData, error: recordsError } = await supabase
                    .from('finance_records')
                    .select('*')
                    .in('user_id', companyUserIds)
                    .order('date', { ascending: false });
                
                if (recordsError) {
                    console.error("[ClientPortal] Error loading finance records:", recordsError);
                } else if (recordsData) {
                    setRecords(recordsData);
                    const recordMonths = Array.from(new Set(recordsData.map(r => {
                        const date = r.date;
                        if (date.includes('-')) return date.substring(0, 7);
                        const parts = date.split('/');
                        if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}`;
                        return date;
                    }))).sort().reverse();

                    const formatted = recordMonths.filter(m => m && m.includes('-')).map(m => {
                        const [year, month] = m.split('-');
                        const date = new Date(Number(year), Number(month) - 1, 1);
                        return { value: m, label: date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) };
                    });
                    setAvailableMonths(formatted);
                    if (!selectedDashboardMonth && formatted.length > 0) setSelectedDashboardMonth(formatted[0].value);
                }
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => { loadDashboardData(); }, [user.id, isMaster]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Cargando Financial Command Center...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-main)] pt-32 md:pt-44 pb-20 px-[6vw] md:px-[8vw] transition-colors duration-500">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Resumen Financiero Digital</h1>
                        <div className="flex items-center gap-6 mt-1 flex-wrap">
                            <span className="flex items-center gap-1.5 text-xs text-green-600/70 font-medium">
                                <ShieldCheck size={12} className="text-green-500" />
                                Sesión Segura
                            </span>
                            <span className="text-xs text-neutral-400 font-medium">
                                Empresa: <span className="font-bold text-primary-dark">
                                    {profile?.full_name ? profile.full_name : 
                                     (loading ? "Buscando Perfil..." : `Sin Perfil (${user.email})`)}
                                </span>
                            </span>
                            {profile?.status && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${profile.status === 'activo' ? 'bg-green-100 text-green-700' : profile.status === 'suspendido' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                    {profile.status}
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className="p-3 bg-white dark:bg-white/10 rounded-xl border border-light-beige dark:border-white/10 hover:border-accent transition-all text-primary-dark dark:text-white relative group">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        <button className="p-3 bg-white dark:bg-white/10 rounded-xl border border-light-beige dark:border-white/10 hover:border-accent transition-all text-primary-dark dark:text-white relative group">
                            <Bell size={20} />
                            {docs.some(d => d.status === 'pendiente') && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-primary-dark animate-pulse"></span>}
                        </button>
                        <button onClick={onLogout} className="flex items-center gap-2 bg-white dark:bg-white/10 border border-light-beige dark:border-white/10 px-4 py-3 rounded-xl font-bold text-primary-dark dark:text-white hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-600 transition-all shadow-sm">
                            <LogOut size={18} /> Cerrar Sesión
                        </button>
                    </div>
                </div>

                {isMaster ? <AdminDashboard user={user} /> : (
                    <>
                        <div className="flex flex-wrap gap-4 mb-8 border-b border-[var(--border-color)] pb-4 animate-fade-in">
                            {[
                                { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
                                { id: 'finance', label: 'Finanzas Personales', icon: BarChart3 },
                                { id: 'tickets', label: 'Tickets y Facturas', icon: FileText }
                            ].map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-[var(--text-primary)] text-[var(--bg-card)] shadow-lg scale-105' : 'bg-[var(--bg-card)] dark:bg-white/5 border border-[var(--border-color)] opacity-60 hover:opacity-100 hover:border-accent'}`}>
                                    <tab.icon size={18} /> {tab.label}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'dashboard' ? (
                            <div className="animate-fade-in space-y-10 pb-10 text-[var(--text-primary)]">
                                {/* Row 1: KPIs */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                                    <div className="bg-primary-dark rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl group">
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-8">
                                                <div className="w-12 h-12 rounded-[1.25rem] bg-white/10 flex items-center justify-center border border-white/10"><DollarSign size={24} className="text-accent" /></div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block">Liquididad</span>
                                            </div>
                                            <h3 className="text-5xl font-heading font-black tracking-tighter">${(financialMetrics?.totalBalance || 0).toLocaleString()}</h3>
                                            <div className="mt-4 flex items-center gap-2">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${financialMetrics?.balanceChange.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {financialMetrics?.balanceChange.startsWith('+') ? '▲' : '▼'} {financialMetrics?.balanceChange}
                                                </span>
                                                <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">vs mes anterior</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[var(--bg-card)] rounded-[3rem] p-10 border border-[var(--border-color)] dark:border-white/10 shadow-sm relative overflow-hidden group backdrop-blur-md">
                                        <div className="flex flex-col items-center justify-between h-full">
                                            <span className="w-full text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Salud Financiera</span>
                                            <div className="relative flex items-center justify-center my-4">
                                                <svg className="w-32 h-32 transform -rotate-90">
                                                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="opacity-10" />
                                                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * (financialMetrics?.healthScore || 0)) / 100} strokeLinecap="round" className={(financialMetrics?.healthScore || 0) > 80 ? 'text-green-500' : 'text-amber-500'} />
                                                </svg>
                                                <span className="absolute text-4xl font-black">{financialMetrics?.healthScore || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-indigo-950 to-primary-dark rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl group">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-8">Libre para Hoy</h3>
                                        <h3 className="text-5xl font-heading font-black tracking-tighter">${((financialMetrics?.totalBalance || 0) - (financialMetrics?.pendingFijo || 0)).toLocaleString()}</h3>
                                        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between">
                                            <span className="text-[10px] font-black text-indigo-300">Smart Forecast</span>
                                            <span className="font-bold text-teal-400">${(financialMetrics?.projection || 0).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="bg-[var(--bg-card)] dark:bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 border border-[var(--border-color)] dark:border-white/10 shadow-sm relative overflow-hidden group">
                                        <div className="flex items-center justify-between mb-8">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Rendimiento</span>
                                            <select value={selectedDashboardMonth} onChange={e => setSelectedDashboardMonth(e.target.value)} className="bg-transparent text-[10px] font-black text-accent uppercase outline-none">
                                                {availableMonths.map(m => <option key={m.value} value={m.value} className="bg-[var(--bg-card)]">{m.label}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-[10px] font-bold mb-1">
                                                    <span className="flex items-center gap-2">INGRESOS <span className={financialMetrics?.incomeChange.startsWith('+') ? 'text-green-600' : 'text-red-500'}>{financialMetrics?.incomeChange}</span></span>
                                                    <span>${financialMetrics?.monthIncome.toLocaleString()}</span>
                                                </div>
                                                <div className="h-1.5 bg-neutral-100 dark:bg-white/10 rounded-full"><div className="h-full bg-[var(--text-primary)] rounded-full" style={{width: '70%'}}></div></div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-[10px] font-bold mb-1">
                                                    <span className="flex items-center gap-2">GASTOS <span className={financialMetrics?.expenseChange.startsWith('+') ? 'text-red-500' : 'text-green-600'}>{financialMetrics?.expenseChange}</span></span>
                                                    <span>${financialMetrics?.monthExpense.toLocaleString()}</span>
                                                </div>
                                                <div className="h-1.5 bg-neutral-100 dark:bg-white/10 rounded-full"><div className="h-full bg-accent rounded-full" style={{width: '40%'}}></div></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: Performance Chart */}
                                <div className="bg-[var(--bg-card)] dark:bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 border border-[var(--border-color)] dark:border-white/10 shadow-sm transition-all duration-500">
                                    <h2 className="text-xl font-black mb-10">Comparativa de Rendimiento</h2>
                                    <div className="h-80 w-full">
                                        {(() => {
                                            const chartData = availableMonths.slice(0, 6).reverse().map(m => {
                                                const moves = records.filter(r => normalizeDate(r.date).startsWith(m.value) && (r.concept || '').toUpperCase().trim() !== 'SALDO INICIAL');
                                                return { month: m.label.split(' ')[0], ingresos: moves.reduce((a, r) => a + Number(r.income), 0), gastos: moves.reduce((a, r) => a + Number(r.expense), 0) };
                                            });
                                            return (
                                                <ResponsiveContainer>
                                                    <RechartsBarChart data={chartData}>
                                                        <CartesianGrid vertical={false} stroke={theme === 'light' ? '#f0f0f0' : '#ffffff10'} />
                                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: 'currentColor'}} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'currentColor'}} />
                                                        <RechartsTooltip />
                                                        <Bar dataKey="ingresos" fill={theme === 'light' ? '#1a1a1a' : '#f8fafc'} radius={[6,6,0,0]} barSize={24} />
                                                        <Bar dataKey="gastos" fill="#EFA364" radius={[6,6,0,0]} barSize={24} />
                                                    </RechartsBarChart>
                                                </ResponsiveContainer>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Row 3: Distribution & Activity */}
                                <div className="grid lg:grid-cols-2 gap-8">
                                    <div className="bg-[var(--bg-card)] dark:bg-white/5 rounded-[3rem] p-10 border border-[var(--border-color)] dark:border-white/10 shadow-sm backdrop-blur-md">
                                        <h2 className="text-xl font-black mb-10">Distribución de Gastos</h2>
                                        <div className="h-64 flex flex-col md:flex-row items-center gap-8">
                                            <div className="flex-1 w-full h-full relative">
                                                <ResponsiveContainer>
                                                    <RechartsPieChart>
                                                        <Pie data={[{name: 'Gastos', value: financialMetrics?.monthExpense || 1}]} innerRadius={60} outerRadius={80} dataKey="value"><Cell fill={theme === 'light' ? '#1a1a1a' : '#f8fafc'} /></Pie>
                                                        <RechartsTooltip />
                                                    </RechartsPieChart>
                                                </ResponsiveContainer>
                                                <div className="absolute inset-0 flex items-center justify-center p-2"><PieChart size={24} className="text-accent/20" /></div>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex justify-between text-[10px] font-bold uppercase"><span>Categoría</span><span>Pje</span></div>
                                                <div className="h-0.5 bg-neutral-100 dark:bg-white/10"></div>
                                                <p className="text-[10px] opacity-40">Análisis detallado disponible en finanzas.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[var(--bg-card)] dark:bg-white/5 rounded-[3rem] p-10 border border-[var(--border-color)] dark:border-white/10 shadow-sm backdrop-blur-md">
                                        <h2 className="text-xl font-black mb-10">Actividad Reciente</h2>
                                        <div className="space-y-4">
                                            {records.slice(0, 4).map(r => (
                                                <div key={r.id} className="flex justify-between items-center p-3 rounded-2xl bg-[var(--bg-main)] dark:bg-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={Number(r.income) > 0 ? 'text-green-600' : 'text-red-500'}>{Number(r.income) > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}</div>
                                                        <span className="text-xs font-bold truncate w-32">{r.concept}</span>
                                                    </div>
                                                    <span className="text-xs font-black">${Number(r.income || r.expense).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Row 4: Shortcuts & Docs */}
                                <div className="grid lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <button onClick={() => setActiveTab('finance')} className="bg-accent rounded-[2.5rem] p-10 text-white shadow-xl hover:-translate-y-1 transition-all"><Plus size={24} className="mb-4" /><h3 className="text-2xl font-black">Nuevo Registro</h3></button>
                                        <button onClick={() => setActiveTab('tickets')} className="bg-[var(--bg-card)] dark:bg-white/5 rounded-[2.5rem] p-10 border border-[var(--border-color)] dark:border-white/10 hover:shadow-xl transition-all"><Upload size={24} className="mb-4 opacity-70" /><h3 className="text-2xl font-black">Subir Ticket</h3></button>
                                    </div>
                                    <div className="bg-[var(--bg-card)] dark:bg-white/5 rounded-[2.5rem] p-10 border border-[var(--border-color)] dark:border-white/10 shadow-sm backdrop-blur-md">
                                        <h3 className="font-black mb-8 flex justify-between items-center">Expediente <FileText size={16}/></h3>
                                        <div className="space-y-4">
                                            {docs.slice(0, 3).map(d => (
                                                <div key={d.id} className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-main)] dark:bg-white/5"><span className="text-xs font-bold truncate w-32">{d.name}</span><a href={d.file_url} target="_blank" rel="noreferrer"><Download size={14}/></a></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : activeTab === 'finance' ? (
                            <div className="animate-fade-in"><FinanceTracker user={user} records={records} onRefresh={loadDashboardData} /></div>
                        ) : (
                            <div className="animate-fade-in"><TicketUploader user={user} isMaster={false} /></div>
                        )}
                    </>
                )}
            </div>

            {isCommandCenterOpen && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
                    <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md" onClick={() => setIsCommandCenterOpen(false)}></div>
                    <div className="bg-white/95 backdrop-blur-2xl w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-command-enter flex flex-col">
                        <div className="flex items-center gap-4 px-8 py-6 border-b border-neutral-100">
                            <Search className="text-neutral-400" size={20} />
                            <input autoFocus className="bg-transparent border-none outline-none flex-1 text-lg font-bold text-primary-dark placeholder:text-neutral-300" placeholder="Escribe un comando..." onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    const v = e.currentTarget.value.toLowerCase();
                                    if (v.includes('panel')) setActiveTab('dashboard');
                                    else if (v.includes('finanza')) setActiveTab('finance');
                                    else if (v.includes('ticket')) setActiveTab('tickets');
                                    setIsCommandCenterOpen(false);
                                }
                            }} />
                            <span className="text-[10px] font-black text-neutral-400 border border-neutral-200 px-2 py-1 rounded-lg">ESC</span>
                        </div>
                        <div className="p-4 space-y-2">
                            <button onClick={() => { setActiveTab('dashboard'); setIsCommandCenterOpen(false); }} className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 rounded-2xl transition-all"><div className="flex items-center gap-4"><LayoutDashboard size={18}/><span className="font-bold text-sm">Dashboard</span></div><ArrowRight size={14}/></button>
                            <button onClick={() => { setActiveTab('finance'); setIsCommandCenterOpen(false); }} className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 rounded-2xl transition-all"><div className="flex items-center gap-4"><BarChart3 size={18}/><span className="font-bold text-sm">Finanzas</span></div><ArrowRight size={14}/></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
