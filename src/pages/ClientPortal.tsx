import { useState, useEffect, useMemo } from "react";
import {
    Lock, FileText, ShieldCheck,
    LogOut, Download, 
    Bell, Plus, Upload,
    LayoutDashboard, BarChart3, Search,
    ArrowRight, Sun, Moon
} from "lucide-react";
import Button from "../components/ui/Button";
import { supabase } from "../lib/supabase";
import FinanceTracker from "../components/portal/FinanceTracker";
import AdminDashboard from "../components/portal/AdminDashboard";
import TicketUploader from "../components/portal/TicketUploader";
import FinancialDashboard from "../components/portal/finance/DashboardView";
import { useFinance } from "../hooks/useFinance";
// Recharts imports removed as they are now handled by FinancialDashboard

const MASTER_EMAIL = 'cci.adrianalcaraz@gmail.com';

// Mapeo de Emergencia (Si RLS en Supabase falla)
const EMERGENCY_COMPANY_MAP: Record<string, string> = {
    'a.alcarazpreciado@gmail.com': 'GRUPO ALCA',
    'cci.lauracastillo@gmail.com': 'GRUPO ALCA'
};

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
        return <PortalView user={user} onLogout={handleLogout} />;
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

function PortalView({ user, onLogout }: { user: any, onLogout: () => void }) {
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

    const { 
        records: financeRecords, 
        goals, 
        credits
    } = useFinance(user);

    const summaryData = useMemo(() => {
        const month = selectedDashboardMonth || 'all';
        const filtered = month === 'all' ? financeRecords : financeRecords.filter(r => {
             const rDate = r.date.includes('/') ? r.date.split('/').reverse().join('-') : r.date;
             return rDate.startsWith(month);
        });
        
        const grouped = filtered
            .filter(r => {
                const c = (r.concept || '').toUpperCase().trim();
                return c !== 'SALDO INICIAL' && !c.includes('TRASPASO');
            })
            .reduce((acc: any, curr) => {
                const c = curr.concept || 'SIN CONCEPTO';
                if (!acc[c]) acc[c] = { concept: c, income: 0, expense: 0 };
                acc[c].income += Number(curr.income) || 0;
                acc[c].expense += Number(curr.expense) || 0;
                return acc;
            }, {});
        
        return Object.values(grouped).sort((a: any, b: any) => a.concept.localeCompare(b.concept)) as any[];
    }, [financeRecords, selectedDashboardMonth]);

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

            // Intento B: Por Email exacto
            if (!profileData && userEmail) {
                const { data: byEmail } = await supabase.from('profiles').select('*').eq('email', userEmail).maybeSingle();
                profileData = byEmail;
            }

            if (profileData) {
                setProfile(profileData);
            } else {
                // FALLBACK DE EMERGENCIA
                if (userEmail && EMERGENCY_COMPANY_MAP[userEmail]) {
                    const virtualName = EMERGENCY_COMPANY_MAP[userEmail];
                    setProfile({
                        full_name: virtualName,
                        status: 'activo',
                        rfc: 'PENDIENTE',
                        advisor_name: 'Adrián Alcaraz'
                    });
                }
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
                            <span className="text-xs text-neutral-400 font-medium tracking-tight">
                                Empresa: <span className="font-bold text-primary-dark">{profile?.full_name || (loading ? "Cargando..." : "Sin Perfil")}</span>
                            </span>
                            {profile?.status && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${profile.status === 'activo' ? 'bg-green-100 text-green-700' : profile.status === 'suspendido' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                    {profile.status}
                                </span>
                            )}
                        </div>
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
                            <div className="animate-fade-in -mt-4">
                                <FinancialDashboard 
                                    records={financeRecords}
                                    goals={goals}
                                    credits={credits}
                                    selectedMonth={selectedDashboardMonth}
                                    summaryData={summaryData}
                                    uniqueMonths={availableMonths}
                                />
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
