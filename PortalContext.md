# Portal Context

## File: src\pages\ClientPortal.tsx
```tsx
import { useState, useEffect, useMemo } from "react";
import {
    Lock, FileText, PieChart, ShieldCheck,
    LogOut, 
    Bell, 
    LayoutDashboard, BarChart3, Search,
    ArrowRight, Sun, Moon, Calendar as CalendarIcon
} from "lucide-react";
import Button from "../components/ui/Button";
import { supabase } from "../lib/supabase";
import FinanceTracker from "../components/portal/FinanceTracker";
import AdminDashboard from "../components/portal/AdminDashboard";
import TicketUploader from "../components/portal/TicketUploader";
import FinancialDashboard from "../components/portal/finance/DashboardView";
import CashflowCalendar from "../components/portal/finance/CashflowCalendar";
import { useFinance } from "../hooks/useFinance";

// Recharts imports removed as they are now handled by FinancialDashboard

const MASTER_EMAIL = 'cci.adrianalcaraz@gmail.com';

// Mapeo de Emergencia (Si RLS en Supabase falla)
const EMERGENCY_COMPANY_MAP: Record<string, string> = {
    'a.alcarazpreciado@gmail.com': 'GRUPO ALCA',
    'cci.lauracastillo@gmail.com': 'GRUPO ALCA'
};

// robust date normalization logic is now handled within the data hooks or components

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
                setMessage({ type: 'success', text: 'Â¡Bienvenido de nuevo!' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'OcurriÃ³ un error inesperado al iniciar sesiÃ³n.' });
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
                                { icon: FileText, title: "Expediente Digital", desc: "Toda tu documentaciÃ³n organizada y a un clic." },
                                { icon: PieChart, title: "Indicadores Clave", desc: "Visualiza la salud financiera de tu empresa." },
                                { icon: Lock, title: "Seguridad Bancaria", desc: "Tus datos protegidos con los estÃ¡ndares mÃ¡s altos." }
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
                            <h2 className="text-2xl font-bold mb-2 font-heading text-primary-dark">Iniciar SesiÃ³n</h2>
                            <p className="text-neutral-500 mb-8 text-sm">Ingrese las credenciales enviadas por su asesor.</p>

                            <form className="space-y-6" onSubmit={handleLogin}>
                                {message && (
                                    <div className={`p-4 rounded-xl text-sm font-bold animate-fade-in ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                        {message.text}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-bold text-primary-dark mb-2">Correo ElectrÃ³nico</label>
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
                                    <label className="block text-sm font-bold text-primary-dark mb-2">ContraseÃ±a</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-[#faf7f2] border border-light-beige rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                        placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                    />
                                </div>
                                <div className="text-right">
                                    <a href="#" className="text-xs text-accent font-bold hover:underline">Â¿Olvidaste tu contraseÃ±a?</a>
                                </div>

                                <Button primary full className="py-4" loading={isLoading} type="submit">
                                    {isLoading ? 'Verificando...' : 'Entrar al Portal'}
                                </Button>
                            </form>

                            <div className="mt-10 pt-8 border-t border-light-beige text-center">
                                <p className="text-sm text-neutral-500 mb-4">Â¿Desea dar de alta su empresa?</p>
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
    const [activeTab, setActiveTab] = useState<'dashboard' | 'finance' | 'calendar' | 'tickets'>(() => {
        const saved = localStorage.getItem(`portal_active_tab_${user.id}`);
        return (saved === 'dashboard' || saved === 'finance' || saved === 'calendar' || saved === 'tickets') ? saved : 'dashboard';
    });


    useEffect(() => {
        if (user?.id) localStorage.setItem(`portal_active_tab_${user.id}`, activeTab);
    }, [activeTab, user?.id]);

    const [selectedDashboardMonth, setSelectedDashboardMonth] = useState<string>('');
    const [availableMonths, setAvailableMonths] = useState<{label: string, value: string}[]>([]);

    const { 
        records: financeRecords, 
        goals, 
        credits,
        budgets,
        paymentMethods
    } = useFinance(user);
    
    const alertCount = useMemo(() => {
        const todayDay = new Date().getDate();
        let count = 0;
        credits.forEach(c => {
            if (c.cutoff_day && ((c.cutoff_day - todayDay + 31) % 31 <= 3)) count++;
            if (c.payment_day && ((c.payment_day - todayDay + 31) % 31 <= 5)) count++;
        });
        paymentMethods.forEach(pm => {
            if (pm.cutoff_day && ((pm.cutoff_day - todayDay + 31) % 31 <= 3)) count++;
            if (pm.payment_day && ((pm.payment_day - todayDay + 31) % 31 <= 5)) count++;
        });
        budgets.forEach(b => {
            if (b.due_day) {
                const days = b.due_day.split(',').map((d: any) => parseInt(d.trim())).filter((d: any) => !isNaN(d));
                if (days.some((day: number) => ((day - todayDay + 31) % 31 <= 3))) count++;
            }
        });
        return count;
    }, [credits, budgets, paymentMethods]);



    const summaryData = useMemo(() => {
        const month = selectedDashboardMonth || 'all';
        const filtered = month === 'all' ? financeRecords : financeRecords.filter(r => {
             const rDate = r.date.includes('/') ? r.date.split('/').reverse().join('-') : r.date;
             return rDate.startsWith(month);
        });
        
        const grouped = filtered
            .filter(r => {
                const c = (r.concept || '').toUpperCase().trim();
                const type = (r.expense_type || '').toUpperCase().trim();
                return c !== 'SALDO INICIAL' && !c.includes('TRASPASO') && type !== 'TRASPASO';
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
            // 1. BÃºsqueda Agresiva del Perfil (ID -> Email -> Manual)
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
                        advisor_name: 'AdriÃ¡n Alcaraz'
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
        <div className="min-h-screen bg-[var(--bg-main)] pt-24 md:pt-44 pb-32 md:pb-20 px-[5vw] md:px-[8vw] transition-colors duration-500">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-4 md:gap-6 animate-fade-in">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Resumen Financiero Digital</h1>
                        <div className="flex items-center gap-4 md:gap-6 mt-1 flex-wrap">
                            <span className="flex items-center gap-1.5 text-xs text-green-600/70 font-medium">
                                <ShieldCheck size={12} className="text-green-500" />
                                SesiÃ³n Segura
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
                            {(docs.some(d => d.status === 'pendiente') || alertCount > 0) && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-primary-dark animate-pulse"></span>}
                        </button>

                        <button onClick={onLogout} className="flex items-center gap-2 bg-white dark:bg-white/10 border border-light-beige dark:border-white/10 px-4 py-3 rounded-xl font-bold text-primary-dark dark:text-white hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-600 transition-all shadow-sm">
                            <LogOut size={18} /> Cerrar SesiÃ³n
                        </button>
                    </div>
                </div>

                {isMaster ? <AdminDashboard user={user} /> : (
                    <>
                        <div className="hidden md:flex flex-wrap gap-4 mb-8 border-b border-[var(--border-color)] pb-4 animate-fade-in">
                            {[
                                { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
                                { id: 'calendar', label: 'Cashflow Forecast', icon: CalendarIcon },
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
                                    paymentMethods={paymentMethods}
                                    budgets={budgets}
                                />
                            </div>
                        ) : activeTab === 'calendar' ? (
                            <div className="animate-fade-in">
                                <CashflowCalendar 
                                    records={financeRecords}
                                    credits={credits}
                                    budgets={budgets}
                                    paymentMethods={paymentMethods}
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
                                    if (v.includes('panel') || v.includes('dashboard')) setActiveTab('dashboard');
                                    else if (v.includes('finanza')) setActiveTab('finance');
                                    else if (v.includes('calendario') || v.includes('forecast') || v.includes('proyeccion')) setActiveTab('calendar');
                                    else if (v.includes('ticket') || v.includes('factura')) setActiveTab('tickets');

                                    setIsCommandCenterOpen(false);
                                }
                            }} />
                            <span className="text-[10px] font-black text-neutral-400 border border-neutral-200 px-2 py-1 rounded-lg">ESC</span>
                        </div>
                        <div className="p-4 space-y-2">
                            <button onClick={() => { setActiveTab('dashboard'); setIsCommandCenterOpen(false); }} className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 rounded-2xl transition-all"><div className="flex items-center gap-4"><LayoutDashboard size={18}/><span className="font-bold text-sm">Dashboard Principal</span></div><ArrowRight size={14}/></button>
                            <button onClick={() => { setActiveTab('calendar'); setIsCommandCenterOpen(false); }} className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 rounded-2xl transition-all"><div className="flex items-center gap-4"><CalendarIcon size={18}/><span className="font-bold text-sm">Cashflow Forecast</span></div><ArrowRight size={14}/></button>
                            <button onClick={() => { setActiveTab('finance'); setIsCommandCenterOpen(false); }} className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 rounded-2xl transition-all"><div className="flex items-center gap-4"><BarChart3 size={18}/><span className="font-bold text-sm">Control Presupuestario</span></div><ArrowRight size={14}/></button>
                            <button onClick={() => { setActiveTab('tickets'); setIsCommandCenterOpen(false); }} className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 rounded-2xl transition-all"><div className="flex items-center gap-4"><FileText size={18}/><span className="font-bold text-sm">Tickets y FacturaciÃ³n</span></div><ArrowRight size={14}/></button>
                        </div>

                </div>
            </div>
            )}

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] bg-white/80 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2rem] p-2 shadow-2xl z-[100] flex items-center justify-around overflow-hidden animate-slide-up">
                {[
                    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
                    { id: 'calendar', label: 'Calendario', icon: CalendarIcon },
                    { id: 'finance', label: 'Finanzas', icon: BarChart3 },
                    { id: 'tickets', label: 'Tickets', icon: FileText }
                ].map(item => {

                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`flex flex-col items-center gap-1.5 py-2 px-4 rounded-2xl transition-all duration-300 relative ${isActive ? 'text-accent' : 'text-neutral-400'}`}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-accent/10 rounded-2xl animate-scale-in"></div>
                            )}
                            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                        </button>
                    );
                })}
                <div className="w-[1px] h-8 bg-neutral-200 dark:bg-white/10 mx-1"></div>
                <button 
                    onClick={() => setIsCommandCenterOpen(true)}
                    className="flex flex-col items-center gap-1.5 py-2 px-4 text-neutral-400 hover:text-accent transition-colors"
                >
                    <Search size={22} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Buscar</span>
                </button>
            </div>
        </div>
    );
}

```

## File: src\components\portal\FinanceTracker.tsx
```tsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Search } from 'lucide-react';

import { toast } from '../../lib/toast';
import { Toaster } from '../ui/Toaster';
import { useConfirm } from '../../hooks/useConfirm';

import { useFinance } from '../../hooks/useFinance';
import { useFinanceCalculations } from '../../hooks/useFinanceCalculations';
import { importFromExcel, exportToExcel, exportToPDF } from '../../utils/financeImportExport';

import FinanceHeader from './finance/FinanceHeader';
import RecordForm from './finance/RecordForm';
import MovementsDetailedView from './finance/MovementsDetailedView';
import BudgetTracker from './finance/BudgetTracker';
import CreditsManager from './finance/CreditsManager';
import BalancesManager from './finance/BalancesManager';
import SnapshotModal from './finance/SnapshotModal';

import type { FinanceRecord } from '../../types/finance';

interface FinanceTrackerProps {
    user: { id: string; [key: string]: unknown };
    records?: FinanceRecord[];
    onRefresh?: () => void;
}

export default function FinanceTracker({ user, records: propsRecords, onRefresh }: FinanceTrackerProps) {
    const { 
        records, 
        loading, 
        paymentMethods: savedPaymentMethods, 
        credits, 
        goals,
        companyIds,
        refreshRecords: loadRecords,
        refreshPaymentMethods: loadPaymentMethods
    } = useFinance(user, propsRecords);

    const {
        selectedMonth,
        setSelectedMonth,
        uniqueMonths,
        summaryData,
        uniqueConcepts,
        paymentBalancesData,
        budgetData,
        planningAnalysis,
        getDisplayRecords,
        loadManualBudgets
    } = useFinanceCalculations(records, companyIds);

    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const [viewMode, setViewMode] = useState<'detailed' | 'balances' | 'budget' | 'credits'>(() => {
        const saved = localStorage.getItem(`finance_view_mode_${user.id}`);
        const validModes = ['detailed', 'balances', 'budget', 'credits'];
        return (saved && validModes.includes(saved)) ? (saved as any) : 'detailed';
    });

    useEffect(() => {
        if (user?.id) {
            localStorage.setItem(`finance_view_mode_${user.id}`, viewMode);
        }
    }, [viewMode, user?.id]);

    const [concept, setConcept] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [provider, setProvider] = useState('');
    const [income, setIncome] = useState<number | ''>('');
    const [expense, setExpense] = useState<number | ''>('');
    const [description, setDescription] = useState('');
    const [expenseType, setExpenseType] = useState('Variable');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSnapshot, setShowSnapshot] = useState(false);
    const [isProcessingOCR, setIsProcessingOCR] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { confirm, ConfirmModal } = useConfirm();

    // Smart Categorization Logic
    useEffect(() => {
        if (editingId) return; 
        
        const conceptUpper = (concept || '').toUpperCase();
        const providerUpper = (provider || '').toUpperCase();
        const combined = `${conceptUpper} ${providerUpper}`;

        const SMART_MAP = {
            'Variable': ['AMAZON', 'UBER', 'DIDI', 'NETFLIX', 'SPOTIFY', 'RESTAURANTE', 'CINE', 'STARBUCKS', 'RAPPI', 'MERCADO LIBRE', 'APPLE', 'VAPE', 'TIENDA'],
            'Fijo': ['CFE', 'RENTA', 'INTERNET', 'TELCEL', 'IZZI', 'TOTALPLAY', 'AGUA', 'GAS', 'HIPOTECA', 'SEGURO', 'PPR', 'MANTENIMIENTO'],
            'Ingreso': ['SUELDO', 'HONORARIOS', 'PAGO', 'VENTA', 'DIVIDENDO', 'CASHBACK', 'NOMINA', 'TRANSFERENCIA RECIBIDA'],
            'Ahorro': ['CETES', 'GBM', 'INVERSION', 'AHORRO', 'NU', 'BONOS'],
            'Deuda': ['TARJETA', 'PRESTAMO', 'CREDITO', 'PAGO A DEUDA']
        };

        for (const [type, keywords] of Object.entries(SMART_MAP)) {
            if (keywords.some(kw => combined.includes(kw))) {
                setExpenseType(type);
                break;
            }
        }
    }, [concept, provider, editingId]);

    const handleAddRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const numIncome = Number(income) || 0;
            const numExpense = Number(expense) || 0;

            if (editingId) {
                const { error, data } = await supabase
                    .from('finance_records')
                    .update({
                        concept,
                        date,
                        payment_method: paymentMethod,
                        provider,
                        income: numIncome,
                        expense: numExpense,
                        description,
                        expense_type: expenseType
                    })
                    .eq('id', editingId)
                    .select();

                if (error) throw error;
                if (data && data.length > 0) {
                    loadRecords();
                    resetForm();
                    setIsFormOpen(false);
                    toast.success('Registro actualizado correctamente.');
                }
            } else {
                const { data, error } = await supabase
                    .from('finance_records')
                    .insert([{
                        user_id: user.id,
                        concept,
                        date,
                        payment_method: paymentMethod,
                        provider,
                        income: numIncome,
                        expense: numExpense,
                        description,
                        expense_type: expenseType
                    }])
                    .select();

                if (error) throw error;
                if (data && data.length > 0) {
                    loadRecords();
                    resetForm();
                    setIsFormOpen(false);
                    toast.success('Registro guardado correctamente.');
                }
            }
        } catch (error) {
            console.error('Error adding/updating record:', error);
            toast.error(`Hubo un error al guardar el registro: ${(error as Error).message}`);
        }
    };

    const handleDelete = async (id: string) => {
        const ok = await confirm({
            title: 'Eliminar Registro',
            message: 'Â¿Seguro que deseas eliminar este movimiento? Esta acciÃ³n no se puede deshacer.',
            confirmLabel: 'Eliminar',
            danger: true,
        });
        if (!ok) return;
        try {
            const { error } = await supabase
                .from('finance_records')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Registro eliminado.');
            if (onRefresh) {
                onRefresh();
            } else {
                loadRecords();
            }
        } catch (error) {
            console.error('Error deleting record:', error);
            toast.error(`No se pudo eliminar el registro: ${(error as any).message}`);
        }
    };

    const resetForm = () => {
        setConcept('');
        setDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('');
        setProvider('');
        setIncome('');
        setExpense('');
        setDescription('');
        setExpenseType('Variable');
        setEditingId(null);
    };

    const handleEditClick = (record: FinanceRecord) => {
        setConcept(record.concept);
        setDate(record.date.split('T')[0]);
        setPaymentMethod(record.payment_method || '');
        setProvider(record.provider || '');
        setIncome((record.income && Number(record.income) !== 0) ? Number(record.income) : '');
        setExpense((record.expense && Number(record.expense) !== 0) ? Number(record.expense) : '');
        setDescription(record.description || '');
        setExpenseType(record.expense_type || 'Variable');
        setEditingId(record.id);
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFileUploadWrapper = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        await importFromExcel(file, user.id, loadRecords, setIsUploading);
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const displayRecords = getDisplayRecords(searchTerm);

    const renderPaymentOptions = () => (
        <>
            <option value="" disabled className="text-slate-900 bg-white">Seleccione pago...</option>
            {savedPaymentMethods.length > 0 ? (
                savedPaymentMethods.map(pm => (
                    <option key={pm.id} value={pm.name} className="text-slate-900 bg-white">{pm.name}</option>
                ))
            ) : (
                <>
                    <option value="EFECTIVO" className="text-slate-900 bg-white">EFECTIVO</option>
                    <option value="TARJETA DÃ‰BITO" className="text-slate-900 bg-white">TARJETA DÃ‰BITO</option>
                    <option value="TARJETA CRÃ‰DITO" className="text-slate-900 bg-white">TARJETA CRÃ‰DITO</option>
                </>
            )}
        </>
    );

    return (
        <div className="bg-white/40 dark:bg-slate-900/40 rounded-[3rem] border border-slate-200/60 dark:border-white/10 shadow-xl overflow-hidden animate-fade-in backdrop-blur-2xl">
            <FinanceHeader 
                viewMode={viewMode}
                setViewMode={setViewMode}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                uniqueMonths={uniqueMonths}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                isUploading={isUploading}
                onImportExcel={() => fileInputRef.current?.click()}
                onExportExcel={() => exportToExcel(displayRecords, selectedMonth)}
                onRefresh={loadRecords}
                onExportPDF={() => exportToPDF('finance-dashboard-content', selectedMonth)}
                onShowSnapshot={() => setShowSnapshot(true)}
                onToggleForm={() => setIsFormOpen(!isFormOpen)}
                isFormOpen={isFormOpen}
                kpis={{
                    income: summaryData.reduce((acc, row) => acc + row.income, 0),
                    expense: summaryData.reduce((acc, row) => acc + row.expense, 0),
                    balance: summaryData.reduce((acc, row) => acc + row.income, 0) - summaryData.reduce((acc, row) => acc + row.expense, 0)
                }}
            />

            <SnapshotModal 
                showSnapshot={showSnapshot}
                setShowSnapshot={setShowSnapshot}
                summaryData={summaryData}
                uniqueMonths={uniqueMonths}
                selectedMonth={selectedMonth}
            />

            <RecordForm 
                isOpen={isFormOpen}
                isEditing={!!editingId}
                isProcessingOCR={isProcessingOCR}
                setIsProcessingOCR={setIsProcessingOCR}
                onClose={() => { setIsFormOpen(false); resetForm(); }}
                onSubmit={handleAddRecord}
                concept={concept} setConcept={setConcept}
                date={date} setDate={setDate}
                paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                provider={provider} setProvider={setProvider}
                income={income} setIncome={setIncome}
                expense={expense} setExpense={setExpense}
                description={description} setDescription={setDescription}
                expenseType={expenseType} setExpenseType={setExpenseType}
                renderPaymentOptions={renderPaymentOptions}
                concepts={uniqueConcepts}
            />
        
            <div className="overflow-x-auto min-h-[500px]" id="finance-dashboard-content">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <div className="relative w-12 h-12">
                            <div className="absolute inset-0 border-4 border-sky-500/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sincronizando Datos...</p>
                    </div>
                ) : viewMode === 'credits' ? (
                    <CreditsManager 
                        user={user} 
                        credits={credits} 
                        records={records} 
                        paymentMethods={savedPaymentMethods} 
                        onRefresh={loadRecords} 
                    />
                ) : viewMode === 'detailed' ? (
                    <div className="space-y-6 p-8 md:p-10 pb-32">
                        {searchTerm && (
                            <div className="flex flex-col lg:flex-row gap-6 p-8 bg-sky-500/[0.03] dark:bg-white/[0.02] rounded-[2.5rem] border border-sky-500/10 animate-scale-in shadow-sm">
                                <div className="flex-1 flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500 shadow-inner">
                                        <Search size={20} strokeWidth={3} />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">AuditorÃ­a en Tiempo Real</h4>
                                        <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5 italic">"{searchTerm}" â€¢ {displayRecords.length} hallazgos</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-8 px-4">
                                    {[
                                        { label: 'Ingresos', val: displayRecords.reduce((acc, r) => acc + Number(r.income || 0), 0), color: 'text-emerald-500' },
                                        { label: 'Gastos', val: displayRecords.reduce((acc, r) => acc + Number(r.expense || 0), 0), color: 'text-rose-500' },
                                        { label: 'Neto', val: displayRecords.reduce((acc, r) => acc + Number(r.income || 0) - Number(r.expense || 0), 0), color: 'text-sky-500', bold: true }
                                    ].map((s, i) => (
                                        <div key={i} className="flex flex-col items-end">
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">{s.label}</span>
                                            <span className={`text-base font-black ${s.color}`}>
                                                ${s.val.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <MovementsDetailedView 
                            records={displayRecords}
                            onEdit={handleEditClick}
                            onDelete={handleDelete}
                        />
                    </div>
                ) : viewMode === 'budget' ? (
                    <div className="pb-32">
                        <BudgetTracker 
                            userId={user.id}
                            selectedMonth={selectedMonth}
                            budgetData={budgetData}
                            planningAnalysis={planningAnalysis}
                            records={records}
                            onBudgetUpdated={() => loadManualBudgets(selectedMonth)}
                        />
                    </div>
                ) : viewMode === 'balances' ? (
                    <div className="pb-32">
                        <BalancesManager 
                            user={user}
                            companyIds={companyIds}
                            records={records}
                            goals={goals}
                            savedPaymentMethods={savedPaymentMethods}
                            paymentBalancesData={paymentBalancesData}
                            selectedMonth={selectedMonth}
                            uniqueMonths={uniqueMonths}
                            onRefresh={() => {
                                loadRecords();
                                loadPaymentMethods();
                            }}
                        />
                    </div>
                ) : null}
            </div>

            {/* FLOATING TOTALS BAR - Refined Premium Look */}
            {viewMode === 'detailed' && displayRecords.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[95vw] max-w-2xl animate-slide-up">
                    <div className="bg-slate-900/90 dark:bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] p-2.5 pr-8 flex items-center justify-between gap-6 transition-all hover:scale-[1.02]">
                        <div className="flex bg-white/5 dark:bg-black/20 rounded-[2rem] p-1 border border-white/5">
                            {[
                                { label: 'Entradas', val: summaryData.reduce((acc, row) => acc + row.income, 0), color: 'text-emerald-400' },
                                { label: 'Salidas', val: summaryData.reduce((acc, row) => acc + row.expense, 0), color: 'text-rose-400' }
                            ].map((item, i) => (
                                <React.Fragment key={i}>
                                    <div className="px-8 py-2.5 flex flex-col items-center">
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">{item.label}</span>
                                        <span className={`text-sm font-black ${item.color}`}>
                                            ${item.val.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    {i === 0 && <div className="w-px h-8 bg-white/10 self-center"></div>}
                                </React.Fragment>
                            ))}
                        </div>
                        
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">Utilidad Neta</span>
                            <span className={`text-xl font-black tracking-tighter ${(summaryData.reduce((acc, row) => acc + row.income, 0) - summaryData.reduce((acc, row) => acc + row.expense, 0)) >= 0 ? 'text-white' : 'text-rose-400'}`}>
                                ${(summaryData.reduce((acc, row) => acc + row.income, 0) - summaryData.reduce((acc, row) => acc + row.expense, 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* FLOATING TOTALS BAR - Budget mode - Refined */}
            {viewMode === 'budget' && budgetData.length > 0 && (() => {
                const incomeData = budgetData.filter(b => b.category === 'income');
                const expenseData = budgetData.filter(b => b.category === 'expense');
                const totalIncomeTarget = incomeData.reduce((acc, row) => acc + row.avgBudget, 0);
                const totalIncomeReal = incomeData.reduce((acc, row) => acc + row.currentAmount, 0);
                const totalExpenseTarget = expenseData.reduce((acc, row) => acc + row.avgBudget, 0);
                const totalExpenseReal = expenseData.reduce((acc, row) => acc + row.currentAmount, 0);
                
                return (
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[95vw] max-w-4xl animate-slide-up">
                        <div className="bg-slate-900/90 dark:bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] p-2.5 pr-8 flex items-center justify-between gap-6">
                            <div className="flex bg-white/5 dark:bg-black/20 rounded-[2rem] p-1 border border-white/5">
                                <div className="px-7 py-2.5 flex flex-col items-center">
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">Real vs Meta (Ingresos)</span>
                                    <span className="text-sm font-black text-emerald-400">
                                        ${totalIncomeReal.toLocaleString()} <span className="text-[10px] opacity-30 font-bold ml-1">/ ${totalIncomeTarget.toLocaleString()}</span>
                                    </span>
                                </div>
                                <div className="w-px h-8 bg-white/10 self-center"></div>
                                <div className="px-7 py-2.5 flex flex-col items-center">
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">Real vs LÃ­mite (Gastos)</span>
                                    <span className="text-sm font-black text-rose-400">
                                        ${totalExpenseReal.toLocaleString()} <span className="text-[10px] opacity-30 font-bold ml-1">/ ${totalExpenseTarget.toLocaleString()}</span>
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">Remanente Real</span>
                                <span className={`text-2xl font-black tracking-tighter ${(totalIncomeReal - totalExpenseReal) >= 0 ? 'text-white' : 'text-rose-400'}`}>
                                    ${(totalIncomeReal - totalExpenseReal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUploadWrapper}
                accept=".xlsx, .xls"
                className="hidden"
            />
            
            <Toaster />
            {ConfirmModal}
        </div>
    );
}
```

## File: src\types\finance.ts
```tsx
export interface FinanceRecord {
    id: string;
    user_id: string;
    concept: string;
    date: string;
    payment_method: string;
    provider: string;
    income: number;
    expense: number;
    description: string;
    created_at: string;
    expense_type: string;
    balance?: number;
}

export interface PaymentMethod {
    id: string;
    user_id: string;
    name: string;
    cutoff_day?: number;
    payment_day?: number;
    initial_balance?: number;
}


export interface FinanceCredit {
    id: string;
    user_id: string;
    name: string;
    initial_balance: number;
    annual_rate: number;
    start_date: string;
    created_at: string;
    cutoff_day?: number;
    payment_day?: number;
}

export interface FinanceBudget {
    id: string;
    user_id: string;
    concept: string;
    month: string;
    amount: number;
    budget_category: 'income' | 'expense';
    expense_type: string;
    due_day?: string;
}



export interface FinanceGoal {
    id: string;
    user_id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    deadline?: string;
    icon?: string;
    color?: string;
}

export interface BudgetData {
    concept: string;
    avgBudget: number;
    currentAmount: number;
    difference: number;
    type: string; // 'Fijo', 'Variable', etc.
    category: 'income' | 'expense';
    expense_type?: string;
    due_day?: string;
}



```

## File: src\hooks\useFinanceCalculations.ts
```tsx
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { FinanceRecord } from '../types/finance';

export const useFinanceCalculations = (
    records: FinanceRecord[],
    companyIds: string[]
) => {
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [uniqueMonths, setUniqueMonths] = useState<{label: string, value: string}[]>([]);
    
    const [summaryData, setSummaryData] = useState<{concept: string, income: number, expense: number}[]>([]);
    const [uniqueConcepts, setUniqueConcepts] = useState<string[]>([]);
    const [paymentBalancesData, setPaymentBalancesData] = useState<{method: string, initialBalance: number, income: number, expense: number, finalBalance: number}[]>([]);
    
    const [budgetData, setBudgetData] = useState<any[]>([]);
    const [manualBudgets, setManualBudgets] = useState<Record<string, {amount: number, category: string, type?: string, due_day?: string}>>({});
    const [planningAnalysis, setPlanningAnalysis] = useState<any>(null);



    const loadManualBudgets = useCallback(async (month: string) => {
        if (!month || month === 'all' || companyIds.length === 0) return;
        try {
            const { data, error } = await supabase
                .from('finance_budgets')
                .select('concept, amount, budget_category, expense_type, due_day')

                .eq('month', month)
                .in('user_id', companyIds);
            
            
            
            if (error) throw error;
            
            const budgetMap: Record<string, {amount: number, category: string, type?: string, due_day?: string}> = {};
            if (data) {


                data.forEach((b: any) => {
                    budgetMap[b.concept] = { 
                        amount: Number(b.amount), 
                        category: b.budget_category || 'expense',
                        type: b.expense_type,
                        due_day: b.due_day
                    };

                });
            }
            setManualBudgets(budgetMap);
        } catch (error) {
            console.error("Error loading budgets:", error);
        }
    }, [companyIds]);

    // Unique Months Logic
    useEffect(() => {
        const recordMonths = Array.from(new Set(records.map(r => {
            if (r.date.includes('/')) return r.date.split('/').reverse().join('-').substring(0, 7);
            return r.date.substring(0, 7);
        })));
        
        const futureMonths: string[] = [];
        const today = new Date();
        for (let i = 0; i <= 12; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            futureMonths.push(`${yyyy}-${mm}`);
        }

        const allMonths = Array.from(new Set([...recordMonths, ...futureMonths])).sort().reverse();
        
        const formattedMonths = allMonths.map(m => {
            const [year, month] = m.split('-');
            const date = new Date(Number(year), Number(month) - 1, 1);
            return {
                value: m,
                label: date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
            };
        });
        
        setUniqueMonths([{label: 'Todos los meses', value: 'all'}, ...formattedMonths]);
        
        if (!selectedMonth && formattedMonths.length > 0) {
            const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            const hasCurrentMonth = formattedMonths.some(m => m.value === currentMonthStr);
            setSelectedMonth(hasCurrentMonth ? currentMonthStr : formattedMonths[0].value);
        }
    }, [records, selectedMonth]);

    // Load budgets when month changes
    useEffect(() => {
        if (selectedMonth) {
            loadManualBudgets(selectedMonth);
        }
    }, [selectedMonth, loadManualBudgets]);

    // Calculate Summary, Budgets, and Payment Balances
    useEffect(() => {
        if (!selectedMonth) return;
        
        const filteredRecords = selectedMonth === 'all' 
            ? records 
            : records.filter(r => {
                const rDate = r.date.includes('/') ? r.date.split('/').reverse().join('-') : r.date;
                return rDate.startsWith(selectedMonth);
            });
        
        const grouped = filteredRecords
            .filter(r => {
                const c = (r.concept || '').toUpperCase().trim();
                const type = (r.expense_type || '').toUpperCase().trim();
                return c !== 'SALDO INICIAL' && !c.includes('TRASPASO') && type !== 'TRASPASO';
            })
            .reduce((acc: Record<string, {concept: string, income: number, expense: number}>, curr: FinanceRecord) => {
                const c = curr.concept || 'SIN CONCEPTO';
                if (!acc[c]) {
                    acc[c] = { concept: c, income: 0, expense: 0 };
                }
                acc[c].income += Number(curr.income) || 0;
                acc[c].expense += Number(curr.expense) || 0;
                return acc;
            }, {});
        
        const sortedSummary = Object.values(grouped)
            .map(item => {
                if (item.income > item.expense) {
                    return { concept: item.concept, income: item.income - item.expense, expense: 0 };
                } else {
                    return { concept: item.concept, income: 0, expense: item.expense - item.income };
                }
            })
            .sort((a, b) => a.concept.localeCompare(b.concept));
        setSummaryData(sortedSummary);
        
        const historicalRecords = selectedMonth === 'all' 
            ? records 
            : records.filter((r: FinanceRecord) => {
                const rDate = r.date.includes('/') ? r.date.split('/').reverse().join('-') : r.date;
                return rDate.substring(0, 7) < selectedMonth;
            });
            
        const historicalMonthsCount = new Set(historicalRecords.map(r => {
                const rDate = r.date.includes('/') ? r.date.split('/').reverse().join('-') : r.date;
                return rDate.substring(0, 7);
            })).size || 1;
        
        const historicalNet = historicalRecords
            .filter(r => {
                const c = (r.concept || '').toUpperCase().trim();
                const type = (r.expense_type || '').toUpperCase().trim();
                return c !== 'SALDO INICIAL' && !c.includes('TRASPASO') && type !== 'TRASPASO';
            })
            .reduce((acc: Record<string, {income: number, expense: number}>, curr: FinanceRecord) => {
                const c = curr.concept || 'SIN CONCEPTO';
                if (!acc[c]) acc[c] = { income: 0, expense: 0 };
                acc[c].income += Number(curr.income) || 0;
                acc[c].expense += Number(curr.expense) || 0;
                return acc;
            }, {});

            
        const allEverConcepts = Array.from(new Set(records.map(r => (r.concept || '').toUpperCase().trim())))
            .filter(c => c !== '' && c !== 'SALDO INICIAL' && !c.includes('TRASPASO'));

        const allConcepts = new Set([
            ...allEverConcepts,
            ...Object.keys(manualBudgets)
        ]);
        
        // Smart Categorization Logic based on keywords
        const SMART_KEYWORDS: Record<string, string[]> = {
            'Fijo': ['CFE', 'RENTA', 'INTERNET', 'TELCEL', 'IZZI', 'TOTALPLAY', 'AGUA', 'GAS', 'HIPOTECA', 'SEGURO', 'PPR', 'MANTENIMIENTO', 'COLEGIO', 'ESCUELA', 'GIMNASIO', 'GYM'],
            'Variable': ['AMAZON', 'UBER', 'DIDI', 'NETFLIX', 'SPOTIFY', 'RESTAURANTE', 'CINE', 'STARBUCKS', 'RAPPI', 'MERCADO LIBRE', 'APPLE', 'VAPE', 'TIENDA', 'OXXO', 'SUPER', 'DESPENSA', 'SALUD', 'FARMACIA'],
            'Ingreso': ['SUELDO', 'HONORARIOS', 'PAGO', 'VENTA', 'DIVIDENDO', 'CASHBACK', 'NOMINA', 'TRANSFERENCIA RECIBIDA', 'INGRESO'],
            'Ahorro': ['CETES', 'GBM', 'INVERSION', 'AHORRO', 'NU', 'BONOS', 'DINERO CRECIENTE'],
            'Deuda': ['TARJETA', 'PRESTAMO', 'CREDITO', 'PAGO A DEUDA', 'SANTANDER', 'BBVA', 'AMEX', 'HSBC', 'BANAMEX']
        };

        const conceptTypeMap: Record<string, string> = {};
        const conceptFrequencies: Record<string, Record<string, number>> = {};

        // 1. Analyze historical frequencies
        records.forEach(r => {
            if (r.concept && r.expense_type) {
                const c = r.concept.toUpperCase().trim();
                if (!conceptFrequencies[c]) conceptFrequencies[c] = {};
                conceptFrequencies[c][r.expense_type] = (conceptFrequencies[c][r.expense_type] || 0) + 1;
            }
        });

        // 2. Build map based on highest frequency or keywords
        allConcepts.forEach(concept => {
            const c = concept.toUpperCase().trim();
            
            // Priority 1: Most frequent type in history
            if (conceptFrequencies[c]) {
                const types = Object.entries(conceptFrequencies[c]);
                types.sort((a, b) => b[1] - a[1]);
                conceptTypeMap[c] = types[0][0];
            } 
            
            // Priority 2: Keyword matching if no history or generic
            if (!conceptTypeMap[c] || conceptTypeMap[c] === 'Variable') {
                for (const [type, keywords] of Object.entries(SMART_KEYWORDS)) {
                    if (keywords.some(kw => c.includes(kw))) {
                        conceptTypeMap[c] = type;
                        break;
                    }
                }
            }

            // Default
            if (!conceptTypeMap[c]) conceptTypeMap[c] = 'Variable';
        });
        
        // Identify all concepts that have ever had an income amount
        const incomeConcepts = new Set(records.filter(r => Number(r.income) > 0).map(r => (r.concept || '').toUpperCase().trim()));

        const budgetArr = Array.from(allConcepts)
            .filter(c => c && c.trim() !== '')
            .map(concept => {
                const manual = manualBudgets[concept];
                // Auto-detect category based on historical data if not manually defined
                const conceptData = grouped[concept] || { income: 0, expense: 0 };
                const histData = historicalNet[concept] || { income: 0, expense: 0 };

                const hasHistIncome = (histData.income || 0) > (histData.expense || 0);
                const hasCurrentIncome = (conceptData.income || 0) > (conceptData.expense || 0);
                
                const isIngresoType = conceptTypeMap[concept] === 'Ingreso';
                const category = manual?.category || ((hasHistIncome || hasCurrentIncome || isIngresoType || incomeConcepts.has(concept)) ? 'income' : 'expense');
                
                let histAvg = 0;
                let currentAmount = 0;
                
                if (category === 'income') {
                    histAvg = (histData.income - histData.expense) / historicalMonthsCount;
                    currentAmount = conceptData.income - conceptData.expense;
                } else {
                    histAvg = (histData.expense - histData.income) / historicalMonthsCount;
                    currentAmount = conceptData.expense - conceptData.income;
                }


                const definedBudget = manual !== undefined ? manual.amount : histAvg;
                
                return {
                    concept,
                    avgBudget: definedBudget,
                    currentAmount: currentAmount,
                    difference: category === 'income' ? currentAmount - definedBudget : definedBudget - currentAmount,
                    type: manual?.type || conceptTypeMap[concept] || (category === 'income' ? 'Ingreso' : 'Variable'),
                    category,
                    expense_type: manual?.type,
                    due_day: manual?.due_day
                };

            })
            .filter(row => row.avgBudget > 0 || row.currentAmount > 0 || row.category === 'income')
            .sort((a,b) => b.avgBudget - a.avgBudget);
          
        const budgetAnalysis = {
            totalIncome: budgetArr.filter(b => b.category === 'income').reduce((acc, b) => acc + b.avgBudget, 0),
            fixed: budgetArr.filter(b => b.category === 'expense' && b.type === 'Fijo').reduce((acc, b) => acc + b.avgBudget, 0),
            variable: budgetArr.filter(b => b.category === 'expense' && b.type === 'Variable').reduce((acc, b) => acc + b.avgBudget, 0),
            savings: budgetArr.filter(b => b.category === 'expense' && (b.type === 'Ahorro' || b.type === 'Deuda')).reduce((acc, b) => acc + b.avgBudget, 0)
        };

        const planningAnalysis = {
            totalIncome: budgetAnalysis.totalIncome,
            fixedAmount: budgetAnalysis.fixed,
            variableAmount: budgetAnalysis.variable,
            savingsAmount: budgetAnalysis.savings,
            fixedPct: budgetAnalysis.totalIncome > 0 ? (budgetAnalysis.fixed / budgetAnalysis.totalIncome) * 100 : 0,
            variablePct: budgetAnalysis.totalIncome > 0 ? (budgetAnalysis.variable / budgetAnalysis.totalIncome) * 100 : 0,
            savingsPct: budgetAnalysis.totalIncome > 0 ? (budgetAnalysis.savings / budgetAnalysis.totalIncome) * 100 : 0,
            totalBudgetedExpense: budgetAnalysis.fixed + budgetAnalysis.variable + budgetAnalysis.savings,
            margin: budgetAnalysis.totalIncome - (budgetAnalysis.fixed + budgetAnalysis.variable + budgetAnalysis.savings)
        };

        setBudgetData(budgetArr);
        setUniqueConcepts(allEverConcepts);
        setPlanningAnalysis(planningAnalysis);

        const paymentMap: Record<string, { initial: number, income: number, expense: number, finalBalance: number }> = {};
        const cutoffMonth = selectedMonth === 'all' ? '9999-12' : selectedMonth;

        [...records]
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .filter(r => {
            const rDate = r.date.includes('/') ? r.date.split('/').reverse().join('-') : r.date;
            return rDate.substring(0, 7) <= cutoffMonth;
          })
          .forEach(r => {
            const pm = r.payment_method || 'SIN ESPECIFICAR';
            if (!paymentMap[pm]) {
                paymentMap[pm] = { initial: 0, income: 0, expense: 0, finalBalance: 0 };
            }
            
            const recordMonth = r.date.substring(0, 7);
            const isInitialBalance = (r.concept || '').toUpperCase().trim() === 'SALDO INICIAL';
            const recordIncome = Number(r.income) || 0;
            const recordExpense = Number(r.expense) || 0;

            if (selectedMonth !== 'all' && recordMonth < selectedMonth) {
                if (isInitialBalance) {
                    paymentMap[pm].finalBalance = recordIncome - recordExpense;
                } else {
                    paymentMap[pm].finalBalance += recordIncome - recordExpense;
                }
                paymentMap[pm].initial = paymentMap[pm].finalBalance;

            } else {
                if (isInitialBalance) {
                    const resetValue = recordIncome - recordExpense;
                    paymentMap[pm].initial = resetValue;
                    paymentMap[pm].finalBalance = resetValue;
                    paymentMap[pm].income = 0;
                    paymentMap[pm].expense = 0;
                } else {
                    paymentMap[pm].income += recordIncome;
                    paymentMap[pm].expense += recordExpense;
                    paymentMap[pm].finalBalance += recordIncome - recordExpense;
                }
            }
        });
        
        const balances = Object.entries(paymentMap)
            .map(([method, data]) => ({
                method,
                initialBalance: data.initial,
                income: data.income,
                expense: data.expense,
                finalBalance: data.finalBalance 
            }))
            .sort((a,b) => b.finalBalance - a.finalBalance);
            
        setPaymentBalancesData(balances);
        
    }, [records, selectedMonth, manualBudgets]);

    // getDisplayRecords returns the filtered and sorted records for the detailed view
    const getDisplayRecords = useCallback((searchTerm: string) => {
        const filteredRecords = selectedMonth === 'all' 
            ? records 
            : records.filter(r => r.date.startsWith(selectedMonth));

        let runningBalanceFlow = 0;
        return filteredRecords
            .filter(record => {
                if (!searchTerm) return true;
                const search = searchTerm.toLowerCase();
                return (
                    (record.concept || '').toLowerCase().includes(search) ||
                    (record.provider || '').toLowerCase().includes(search) ||
                    (record.payment_method || '').toLowerCase().includes(search) ||
                    (record.description || '').toLowerCase().includes(search)
                );
            })
            .map(record => {
                const isAdjustment = (record.concept || '').toUpperCase().trim() === 'SALDO INICIAL';
                if (!isAdjustment) {
                    runningBalanceFlow = runningBalanceFlow + Number(record.income) - Number(record.expense);
                }
                return {
                    ...record,
                    balance: runningBalanceFlow
                };
            });
    }, [records, selectedMonth]);

    return {
        selectedMonth,
        setSelectedMonth,
        uniqueMonths,
        summaryData,
        uniqueConcepts,
        paymentBalancesData,
        budgetData,
        manualBudgets,
        planningAnalysis,
        getDisplayRecords,
        loadManualBudgets
    };
};

```

## File: src\components\portal\finance\AIBriefingWidget.tsx
```tsx
import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Bot, AlertCircle } from 'lucide-react';
import { generateAIBriefing } from '../../../lib/gemini';
import Button from '../../../components/ui/Button';
import type { FinanceRecord, FinanceGoal, FinanceCredit } from '../../../types/finance';
import ReactMarkdown from 'react-markdown';

interface AIBriefingWidgetProps {
    records: FinanceRecord[];
    goals: FinanceGoal[];
    credits: FinanceCredit[];
}

const AIBriefingWidget: React.FC<AIBriefingWidgetProps> = ({ records, goals, credits }) => {
    const [briefing, setBriefing] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    // FunciÃ³n para obtener las estadÃ­sticas que alimentarÃ¡n el SuperPrompt de Gemini
    const getStats = () => {
        const today = new Date();
        const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        
        // Obtener el mes anterior (cuidado con Enero)
        const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

        const processRecords = (targetMonth: string) => {
            const monthRecords = records.filter(r => {
                const rMonth = r.date.includes('/') ? r.date.split('/').reverse().join('-').substring(0, 7) : r.date.substring(0, 7);
                return rMonth === targetMonth && (r.concept || '').toUpperCase().trim() !== 'SALDO INICIAL';
            });

            // Agrupar por concepto para netear
            const groupedConcepts: Record<string, { income: number, expense: number }> = {};
            monthRecords.forEach(r => {
                const c = r.concept || 'Otros';
                if (!groupedConcepts[c]) groupedConcepts[c] = { income: 0, expense: 0 };
                groupedConcepts[c].income += Number(r.income) || 0;
                groupedConcepts[c].expense += Number(r.expense) || 0;
            });

            let totalIncome = 0;
            let totalExpense = 0;
            const catMap: Record<string, number> = {};

            Object.entries(groupedConcepts).forEach(([concept, data]) => {
                const netIncome = Math.max(0, data.income - data.expense);
                const netExpense = Math.max(0, data.expense - data.income);
                
                totalIncome += netIncome;
                totalExpense += netExpense;
                
                if (netExpense > 0) {
                    catMap[concept] = netExpense;
                }
            });

            const topCategories = Object.entries(catMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([name, amount]) => ({ name, amount }));

            return { income: totalIncome, expense: totalExpense, topCategories };
        };

        return {
            currentMonth: new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(today),
            current: processRecords(currentMonthStr),
            previous: processRecords(prevMonthStr),
            goals,
            credits
        };
    };

    const fetchBriefing = async (force: boolean = false) => {
        const cached = localStorage.getItem('ai_last_briefing');
        const cachedDate = localStorage.getItem('ai_last_briefing_date');
        const todayStr = new Date().toISOString().split('T')[0];

        // Si no se fuerza y ya hay cachÃ© de hoy, lo usamos
        if (!force && cached && cachedDate === todayStr) {
            setBriefing(cached);
            return;
        }

        setIsLoading(true);
        setError('');
        
        try {
            const stats = getStats();
            const response = await generateAIBriefing(stats);
            
            if (response) {
                setBriefing(response);
                localStorage.setItem('ai_last_briefing', response);
                localStorage.setItem('ai_last_briefing_date', todayStr);
            } else {
                setError("No se pudo generar el anÃ¡lisis. Verifica la conexiÃ³n.");
            }
        } catch (err) {
            console.error("AI Briefing failed:", err);
            setError("Hubo un problema de conexiÃ³n con el Asesor Gemini.");
        } finally {
            setIsLoading(false);
        }
    };

    // Intentar cargar la primera vez
    useEffect(() => {
        if (records.length > 0) {
            fetchBriefing(false);
        }
    }, [records]);

    if (!records || records.length === 0) return null;

    return (
        <div className="w-full relative bg-gradient-to-br from-primary-dark via-primary-dark to-black rounded-[3rem] p-10 shadow-2xl overflow-hidden mt-6 mb-12 border border-white/10 group">
            {/* Elementos Decorativos */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-accent/30 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-[60px] -ml-10 -mb-10"></div>
            
            {/* Cabecera del Widget */}
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 border-b border-white/10 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                        <Sparkles size={28} className="text-accent animate-pulse-subtle" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            Executive Copilot
                            <div className="bg-accent/20 text-accent text-[9px] px-2 py-0.5 rounded-full border border-accent/20 font-bold tracking-widest uppercase inline-flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                                Live AI
                            </div>
                        </h2>
                        <p className="text-xs text-white/50 font-medium tracking-wide mt-1">
                            AnÃ¡lisis proactivo de tu salud financiera actual.
                        </p>
                    </div>
                </div>
                
                <Button 
                    outline 
                    onClick={() => fetchBriefing(true)}
                    disabled={isLoading}
                    className="border-white/20 text-white hover:bg-white/10 text-xs py-2 w-full sm:w-auto flex items-center gap-2 justify-center"
                >
                    {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    {isLoading ? 'Analizando...' : 'Actualizar Insight'}
                </Button>
            </div>

            {/* Contenido del Briefing (Markdown) */}
            <div className="relative z-10">
                {isLoading && !briefing ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-4 text-white/50">
                        <Bot size={40} className="animate-bounce text-accent/50" />
                        <p className="text-sm font-medium animate-pulse">Consultando patrones financieros...</p>
                    </div>
                ) : error ? (
                    <div className="py-10 flex flex-col items-center justify-center gap-3 text-red-400">
                        <AlertCircle size={32} />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                ) : (
                    <div className="prose prose-invert max-w-none prose-p:text-white/80 prose-headings:text-white prose-strong:text-accent prose-li:text-white/80 prose-ul:list-disc">
                        {briefing ? (
                            <ReactMarkdown>{briefing}</ReactMarkdown>
                        ) : (
                            <p className="text-white/50 italic">TodavÃ­a no hay suficientes datos para generar un insight profundo. Registra algunos movimientos primero.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIBriefingWidget;

```

## File: src\components\portal\finance\BalancesManager.tsx
```tsx
import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Edit2, Trash2, DollarSign, TrendingUp, TrendingDown, Bell } from 'lucide-react';

import Button from '../../ui/Button';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../hooks/useConfirm';
import SavingsGoalsManager from './SavingsGoalsManager';

interface BalancesManagerProps {
    user: { id: string; [key: string]: unknown };
    companyIds: string[];
    records: any[];
    goals: any[];
    savedPaymentMethods: any[];
    paymentBalancesData: any[];
    selectedMonth: string;
    uniqueMonths: { label: string; value: string }[];
    onRefresh: () => void;
}

export default function BalancesManager({
    user,
    companyIds,
    records,
    goals,
    savedPaymentMethods,
    paymentBalancesData,
    selectedMonth,
    uniqueMonths,
    onRefresh
}: BalancesManagerProps) {
    const [accMgmtTab, setAccMgmtTab] = useState<'initial' | 'transfer' | 'accounts'>('initial');
    const [newAccountName, setNewAccountName] = useState('');
    const [initialBalanceAmount, setInitialBalanceAmount] = useState<number | ''>('');
    const [initialBalancePM, setInitialBalancePM] = useState('');
    const [initialBalanceDate, setInitialBalanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [transferAmount, setTransferAmount] = useState<number | ''>('');
    const [transferOrigin, setTransferOrigin] = useState('');
    const [transferDest, setTransferDest] = useState('');
    const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
    const [transferDesc, setTransferDesc] = useState('');

    const [reassignModal, setReassignModal] = useState<{ method: string; count: number } | null>(null);
    const [reassignTarget, setReassignTarget] = useState('');
    const [isReassigning, setIsReassigning] = useState(false);
    
    // Alert Editing states
    const [editingAccount, setEditingAccount] = useState<any | null>(null);
    const [editCutoff, setEditCutoff] = useState<number | ''>('');
    const [editPayment, setEditPayment] = useState<number | ''>('');
    const [isSavingAlerts, setIsSavingAlerts] = useState(false);


    const { confirm, ConfirmModal } = useConfirm();

    const handleSavePaymentMethod = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAccountName.trim()) return;
        try {
            const { error } = await supabase
                .from('finance_payment_methods')
                .insert([{ user_id: user.id, name: newAccountName.trim().toUpperCase() }]);
            if (error) throw error;
            setNewAccountName('');
            onRefresh();
            toast.success('Cuenta agregada correctamente.');
        } catch (error) {
            console.error('Error saving payment method:', error);
            toast.error(`No se pudo agregar la cuenta: ${(error as any).message || 'Â¿Ya existe una con ese nombre?'}`);
        }
    };

    const handleDeletePaymentMethod = async (id: string, name: string) => {
        const ok = await confirm({
            title: 'Eliminar Cuenta',
            message: `Â¿Seguro que deseas eliminar "${name}"? Sus registros histÃ³ricos se conservarÃ¡n.`,
            confirmLabel: 'Eliminar',
            danger: true,
        });
        if (!ok) return;
        try {
            const { error } = await supabase.from('finance_payment_methods').delete().eq('id', id);
            if (error) throw error;
            onRefresh();
            toast.success(`Cuenta "${name}" eliminada.`);
        } catch (error) {
            console.error('Error deleting payment method:', error);
            toast.error('No se pudo eliminar la cuenta.');
        }
    };

    const handleAddInitialBalance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!initialBalancePM || initialBalanceAmount === '') {
            toast.warning('Por favor selecciona una cuenta y un monto.');
            return;
        }
        try {
            const { error } = await supabase.from('finance_records').insert([{
                user_id: user.id,
                concept: 'SALDO INICIAL',
                date: initialBalanceDate,
                payment_method: initialBalancePM,
                income: Number(initialBalanceAmount) >= 0 ? Number(initialBalanceAmount) : 0,
                expense: Number(initialBalanceAmount) < 0 ? Math.abs(Number(initialBalanceAmount)) : 0,
                provider: 'SISTEMA',
                description: 'Carga inicial de saldo'
            }]);
            if (error) throw error;
            setInitialBalanceAmount('');
            setInitialBalancePM('');
            setInitialBalanceDate(new Date().toISOString().split('T')[0]);
            onRefresh();
            toast.success('Saldo inicial registrado correctamente.');
        } catch (error) {
            console.error('Error setting initial balance:', error);
            toast.error('Error al guardar saldo inicial.');
        }
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transferOrigin || !transferDest || !transferAmount || transferOrigin === transferDest) {
            toast.warning('Por favor selecciona cuentas de origen y destino vÃ¡lidas y un monto.');
            return;
        }

        try {
            const numAmount = Number(transferAmount);

            // Registro de Salida
            const { error: outErr } = await supabase.from('finance_records').insert([{
                user_id: user.id,
                concept: 'TRASPASO INTERNO',
                date: transferDate,
                payment_method: transferOrigin,
                provider: `Hacia: ${transferDest}`,
                income: 0,
                expense: numAmount,
                description: `${transferDesc} (Traspaso: ${transferOrigin} -> ${transferDest})`,
                expense_type: 'Traspaso'
            }]);
            if (outErr) throw outErr;

            // Registro de Entrada
            const { error: inErr } = await supabase.from('finance_records').insert([{
                user_id: user.id,
                concept: 'TRASPASO INTERNO',
                date: transferDate,
                payment_method: transferDest,
                provider: `Desde: ${transferOrigin}`,
                income: numAmount,
                expense: 0,
                description: `${transferDesc} (Traspaso: ${transferOrigin} -> ${transferDest})`,
                expense_type: 'Traspaso'
            }]);
            if (inErr) throw inErr;

            setTransferAmount('');
            setTransferOrigin('');
            setTransferDest('');
            setTransferDesc('');
            onRefresh();
            toast.success('Traspaso registrado correctamente.');
        } catch (error) {
            console.error('Error creating transfer:', error);
            toast.error(`No se pudo realizar el traspaso: ${(error as any).message}`);
        }
    };
    
    const handleSaveAccountAlerts = async () => {
        if (!editingAccount) return;
        setIsSavingAlerts(true);
        try {
            const { error } = await supabase
                .from('finance_payment_methods')
                .update({
                    cutoff_day: editCutoff === '' ? null : Number(editCutoff),
                    payment_day: editPayment === '' ? null : Number(editPayment)
                })
                .eq('id', editingAccount.id);
            
            if (error) throw error;
            toast.success('Alertas configuradas correctamente.');
            setEditingAccount(null);
            onRefresh();
        } catch (err) {
            console.error(err);
            toast.error('Error al guardar configuraciÃ³n de alertas.');
        } finally {
            setIsSavingAlerts(false);
        }
    };


    const handleDeleteAccount = async (method: string) => {
        const recordsCount = records.filter(r => r.payment_method === method).length;
        const ok = await confirm({
            title: `Eliminar Cuenta: ${method}`,
            message: `Â¿Seguro que deseas eliminar esta cuenta? Se eliminarÃ¡n permanentemente los ${recordsCount} registros asociados a ella. Esta acciÃ³n no se puede deshacer.`,
            confirmLabel: 'Eliminar Todo',
            danger: true
        });
        if (!ok) return;

        try {
            const { error } = await supabase
                .from('finance_records')
                .delete()
                .eq('payment_method', method);
            
            if (error) throw error;
            toast.success(`Cuenta ${method} y sus registros eliminados.`);
            onRefresh();
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error('No se pudo eliminar la cuenta.');
        }
    };

    const renderPaymentOptions = () => (
        <>
            <option value="" disabled className="text-slate-900 bg-white">Seleccione pago...</option>
            {savedPaymentMethods.length > 0 ? (
                savedPaymentMethods.map(pm => (
                    <option key={pm.id} value={pm.name} className="text-slate-900 bg-white">{pm.name}</option>
                ))
            ) : (
                <>
                    <option value="EFECTIVO" className="text-slate-900 bg-white">EFECTIVO</option>
                    <option value="TARJETA DÃ‰BITO" className="text-slate-900 bg-white">TARJETA DÃ‰BITO</option>
                    <option value="TARJETA CRÃ‰DITO" className="text-slate-900 bg-white">TARJETA CRÃ‰DITO</option>
                </>
            )}
        </>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto animate-fade-in delay-100 text-[var(--text-primary)]">
            {selectedMonth && (
                <h3 className="text-2xl font-black font-heading text-center mb-10 capitalize flex items-center justify-center gap-4">
                    <div className="h-px bg-[var(--border-color)] dark:bg-white/10 flex-1"></div>
                    <span className="bg-[var(--bg-card)] dark:bg-white/5 px-6 py-2 rounded-2xl border border-[var(--border-color)] dark:border-white/10 shadow-sm">
                        {uniqueMonths.find(m => m.value === selectedMonth)?.label}
                    </span>
                    <div className="h-px bg-[var(--border-color)] dark:bg-white/10 flex-1"></div>
                </h3>
            )}
            
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Tabla Balance por Forma de Pago */}
                <div className="lg:col-span-2 bg-[var(--bg-card)]/50 dark:bg-white/5 backdrop-blur-md overflow-hidden rounded-[32px] border border-[var(--border-color)] dark:border-white/10 shadow-sm">
                    <h4 className="text-[10px] font-black text-center p-6 bg-accent/5 border-b border-[var(--border-color)] dark:border-white/10 uppercase tracking-[0.2em]">
                        Estado Actual de Cuentas
                    </h4>
                    <div className="overflow-x-auto custom-scrollbar pb-4">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] dark:border-white/10">
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest opacity-40">Cuenta</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest opacity-40 text-right">Inicial</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest opacity-40 text-right">Entradas</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest opacity-40 text-right">Salidas</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-right">Final</th>
                                    <th className="p-5 text-center font-black text-[10px] uppercase tracking-widest opacity-40">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)] dark:divide-white/5">
                                {paymentBalancesData.map((row) => (
                                    <tr key={row.method} className="hover:bg-[var(--bg-main)] dark:hover:bg-white/5 transition-colors group">
                                        <td className="p-5 font-black text-xs uppercase tracking-wider">{row.method}</td>
                                        <td className="p-5 text-right text-sm opacity-40 font-medium">
                                            ${row.initialBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-5 text-right text-sm text-green-600 font-bold">
                                            {row.income > 0 ? `$${row.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                                        </td>
                                        <td className="p-5 text-right text-sm text-red-500 font-bold">
                                            {row.expense > 0 ? `$${row.expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                                        </td>
                                        <td className={`p-5 text-right text-sm font-black ${row.finalBalance < 0 ? 'text-red-600' : ''}`}>
                                            ${row.finalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-5 text-center flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => {
                                                    const pm = savedPaymentMethods.find(p => p.name === row.method);
                                                    if (pm) {
                                                        setEditingAccount(pm);
                                                        setEditCutoff(pm.cutoff_day || '');
                                                        setEditPayment(pm.payment_day || '');
                                                    } else {
                                                        toast.error("No se pudo encontrar la configuraciÃ³n de la cuenta.");
                                                    }
                                                }}
                                                className="w-8 h-8 flex items-center justify-center text-accent hover:bg-accent/10 rounded-lg transition-all"
                                                title={`Configurar Alertas de Corte/Pago para ${row.method}`}
                                            >
                                                <Bell size={14} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const count = records.filter(r => r.payment_method === row.method).length;
                                                    setReassignModal({ method: row.method, count });
                                                    setReassignTarget('');
                                                }}
                                                className="w-8 h-8 flex items-center justify-center text-amber-500 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all"
                                                title={`Reasignar / Modificar cuenta ${row.method}`}
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteAccount(row.method)}
                                                className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                                                title={`Eliminar cuenta ${row.method} y sus registros`}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    </div>
                </div>

                {/* GestiÃ³n de Cuentas Paneles */}
                <div className="bg-accent rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-white/20"></div>
                    
                    <div className="flex bg-white/10 p-1.5 rounded-2xl mb-8 border border-white/5 relative z-10">
                        <button 
                            onClick={() => setAccMgmtTab('initial')}
                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${accMgmtTab === 'initial' ? 'bg-white text-accent shadow-lg scale-[1.02]' : 'text-white/40 hover:text-white'}`}
                        >
                            Saldo Inicial
                        </button>
                        <button 
                            onClick={() => setAccMgmtTab('transfer')}
                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${accMgmtTab === 'transfer' ? 'bg-white text-accent shadow-lg scale-[1.02]' : 'text-white/40 hover:text-white'}`}
                        >
                            Traspaso
                        </button>
                        <button 
                            onClick={() => setAccMgmtTab('accounts')}
                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${accMgmtTab === 'accounts' ? 'bg-white text-accent shadow-lg scale-[1.02]' : 'text-white/40 hover:text-white'}`}
                        >
                            Mis Cuentas
                        </button>
                    </div>

                    <div className="relative z-10">
                        {accMgmtTab === 'initial' ? (
                            <div className="animate-fade-in">
                                <h3 className="text-xl font-heading font-black mb-2 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center">
                                        <DollarSign size={18} className="text-accent" />
                                    </div>
                                    Ajustar Saldo
                                </h3>
                                <p className="text-white/40 text-[10px] mb-8 font-black uppercase tracking-widest">Balance de partida por cuenta</p>
                                
                                <form onSubmit={handleAddInitialBalance} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 block ml-1">Cuenta / Banco</label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={initialBalancePM}
                                                onChange={e => setInitialBalancePM(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-accent transition-all font-medium appearance-none cursor-pointer"
                                            >
                                                {renderPaymentOptions()}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"><TrendingDown size={14} className="text-white" /></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 block ml-1">Monto Inicial</label>
                                        <div className="relative group">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-accent font-black">$</span>
                                            <input 
                                                type="number"
                                                step="0.01"
                                                required
                                                value={initialBalanceAmount}
                                                onChange={e => setInitialBalanceAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                                placeholder="0.00"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-5 py-3.5 text-sm font-black text-white outline-none focus:border-accent placeholder:text-white/20 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 block ml-1">Fecha del Ajuste</label>
                                        <input
                                            type="date"
                                            required
                                            value={initialBalanceDate}
                                            onChange={e => setInitialBalanceDate(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-accent transition-all font-medium"
                                        />
                                    </div>
                                    <Button primary type="submit" className="w-full py-4 text-xs font-black uppercase tracking-widest shadow-2xl mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                        Guardar Ajuste
                                    </Button>
                                </form>
                            </div>
                        ) : accMgmtTab === 'transfer' ? (
                            <div className="animate-fade-in">
                                <h3 className="text-xl font-heading font-black mb-2 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center">
                                        <TrendingUp size={18} className="text-accent" />
                                    </div>
                                    Nuevo Traspaso
                                </h3>
                                <p className="text-white/40 text-[10px] mb-8 font-black uppercase tracking-widest">Movimiento entre cuentas</p>
                                
                                <form onSubmit={handleTransfer} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block ml-1">Origen</label>
                                            <div className="relative">
                                                <select required value={transferOrigin} onChange={e => setTransferOrigin(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-accent font-medium appearance-none cursor-pointer">
                                                    {renderPaymentOptions()}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"><TrendingDown size={12} className="text-white" /></div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block ml-1">Destino</label>
                                            <div className="relative">
                                                <select required value={transferDest} onChange={e => setTransferDest(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-accent font-medium appearance-none cursor-pointer">
                                                    {renderPaymentOptions()}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"><TrendingDown size={12} className="text-white" /></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block ml-1">Monto ($)</label>
                                        <input type="number" step="0.01" required value={transferAmount} onChange={e => setTransferAmount(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-black text-white outline-none focus:border-accent" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block ml-1">Fecha</label>
                                        <input type="date" required value={transferDate} onChange={e => setTransferDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white outline-none focus:border-accent" />
                                    </div>
                                    <Button primary type="submit" className="w-full py-4 text-xs font-black uppercase tracking-widest shadow-2xl mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                        Realizar Traspaso
                                    </Button>
                                </form>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <h3 className="text-xl font-heading font-black mb-2 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center">
                                        <DollarSign size={18} className="text-accent" />
                                    </div>
                                    Cuentas y MÃ©todos
                                </h3>
                                <p className="text-white/40 text-[10px] mb-6 font-black uppercase tracking-widest">CatÃ¡logo de formas de pago</p>
                                
                                <form onSubmit={handleSavePaymentMethod} className="flex gap-2 mb-6">
                                    <input 
                                        type="text" 
                                        required 
                                        value={newAccountName} 
                                        onChange={e => setNewAccountName(e.target.value)} 
                                        placeholder="Nueva Cuenta (Ej. BBVA)" 
                                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-xs text-white outline-none focus:border-accent" 
                                    />
                                    <Button primary type="submit" className="py-3 px-6 shadow-xl hover:scale-[1.02] transition-all text-xs font-black uppercase tracking-widest">
                                        Crear
                                    </Button>
                                </form>

                                <div className="space-y-2 max-h-56 overflow-y-auto pr-2 no-scrollbar">
                                    {savedPaymentMethods.length === 0 ? (
                                        <div className="text-center p-6 border border-white/10 border-dashed rounded-2xl text-white/40 text-xs font-bold uppercase tracking-widest">
                                            No tienes cuentas registradas
                                        </div>
                                    ) : (
                                        savedPaymentMethods.map(pm => (
                                            <div key={pm.id} className="flex items-center justify-between p-3 px-5 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                                                <span className="font-black text-sm uppercase tracking-wider">{pm.name}</span>
                                                <button 
                                                    onClick={() => handleDeletePaymentMethod(pm.id, pm.name)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-all"
                                                    title="Eliminar Cuenta"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* REASSIGN MODAL */}
            {reassignModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-primary-dark/40 backdrop-blur-md" onClick={() => setReassignModal(null)}></div>
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-scale-in border border-light-beige">
                        <h4 className="text-xl font-black text-primary-dark mb-2 flex items-center gap-3">
                            <Edit2 size={24} className="text-amber-500" /> Reasignar Cuenta
                        </h4>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-8 leading-relaxed">
                            Mover {reassignModal.count} registros de <span className="text-primary-dark font-black">{reassignModal.method}</span> a otra cuenta.
                        </p>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Seleccionar Cuenta Destino</label>
                                <div className="relative">
                                    <select 
                                        value={reassignTarget} 
                                        onChange={e => setReassignTarget(e.target.value)}
                                        className="w-full bg-neutral-50 border border-light-beige rounded-2xl px-6 py-4 text-sm font-bold text-primary-dark outline-none focus:border-accent appearance-none cursor-pointer"
                                    >
                                        <option value="" className="text-slate-900 bg-white">Selecciona una cuenta...</option>
                                        {savedPaymentMethods.filter(p => p.name !== reassignModal.method).map(pm => (
                                            <option key={pm.id} value={pm.name} className="text-slate-900 bg-white">{pm.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"><TrendingDown size={14} /></div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button outline className="flex-1 py-4" onClick={() => setReassignModal(null)}>Cancelar</Button>
                                <Button 
                                    primary 
                                    className="flex-1 py-4" 
                                    disabled={!reassignTarget || isReassigning}
                                    loading={isReassigning}
                                    onClick={async () => {
                                        setIsReassigning(true);
                                        try {
                                            const { error } = await supabase
                                                .from('finance_records')
                                                .update({ payment_method: reassignTarget })
                                                .eq('payment_method', reassignModal.method)
                                                .in('user_id', companyIds);
                                            
                                            if (error) throw error;
                                            toast.success(`Movidos ${reassignModal.count} registros a ${reassignTarget}`);
                                            setReassignModal(null);
                                            onRefresh();
                                        } catch (err) {
                                            console.error(err);
                                            toast.error('Error al reasignar registros');
                                        } finally {
                                            setIsReassigning(false);
                                        }
                                    }}
                                >
                                    Confirmar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT ALERTS MODAL */}
            {editingAccount && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-primary-dark/40 backdrop-blur-md" onClick={() => setEditingAccount(null)}></div>
                    <div className="bg-[var(--bg-card)] dark:bg-[#1a1a1a] w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-scale-in border border-[var(--border-color)] dark:border-white/10">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                                <Bell size={24} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-[var(--text-primary)]">Configurar Alertas</h4>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{editingAccount.name}</p>
                            </div>
                        </div>
                        
                        <div className="mt-8 space-y-6">
                            <p className="text-xs text-neutral-500 leading-relaxed">
                                Configura los dÃ­as del mes para recibir recordatorios automÃ¡ticos en tu Radar de Alertas.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">DÃ­a de Corte</label>
                                    <input 
                                        type="number" min="1" max="31"
                                        value={editCutoff}
                                        onChange={e => setEditCutoff(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="Ej: 28"
                                        className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-black text-[var(--text-primary)] outline-none focus:border-accent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">DÃ­a de Pago</label>
                                    <input 
                                        type="number" min="1" max="31"
                                        value={editPayment}
                                        onChange={e => setEditPayment(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="Ej: 5"
                                        className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-black text-[var(--text-primary)] outline-none focus:border-accent"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex gap-4 pt-4 border-t border-[var(--border-color)] dark:border-white/5">
                                <Button outline className="flex-1 py-4" onClick={() => setEditingAccount(null)}>Cancelar</Button>
                                <Button primary className="flex-1 py-4" loading={isSavingAlerts} onClick={handleSaveAccountAlerts}>Guardar Cambios</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <SavingsGoalsManager user={user} goals={goals} onRefresh={onRefresh} />
            
            {ConfirmModal}
        </div>

    );
}

```

## File: src\components\portal\finance\BudgetTracker.tsx
```tsx
import React, { useState, useMemo } from 'react';
import { TrendingUp, Trash2, ChevronDown, ChevronRight, AlertCircle, Flame, Target, CheckCircle2, Info, AlertTriangle, Activity } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../hooks/useConfirm';
import Button from '../../ui/Button';
import type { FinanceRecord, BudgetData } from '../../../types/finance';

interface BudgetTrackerProps {
    userId: string;
    selectedMonth: string;
    budgetData: BudgetData[];
    planningAnalysis?: {
        totalIncome: number;
        fixedAmount: number;
        variableAmount: number;
        savingsAmount: number;
        fixedPct: number;
        variablePct: number;
        savingsPct: number;
        totalBudgetedExpense: number;
        margin: number;
    };
    records: FinanceRecord[];
    onBudgetUpdated: () => void;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({
    userId,
    selectedMonth,
    budgetData,
    planningAnalysis,
    records,
    onBudgetUpdated
}) => {
    const { confirm, ConfirmModal } = useConfirm();
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [expandedConcept, setExpandedConcept] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'analysis' | 'income' | 'expense'>('analysis');
    const [expenseSubFilter, setExpenseSubFilter] = useState<'all' | 'Fijo' | 'Variable' | 'AhorroDeuda'>('all');

    // Calculate Month Pacing
    const pacing = useMemo(() => {
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        if (selectedMonth !== currentMonthStr) return 1; // 100% if not current month

        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const currentDay = now.getDate();
        return currentDay / daysInMonth;
    }, [selectedMonth]);

    // Filter data based on active tab before grouping
    const filteredBudgetData = useMemo(() => {
        return budgetData.filter(item => item.category === activeTab);
    }, [budgetData, activeTab]);

    // Group Data by Type
    const groupedData = useMemo(() => {
        const groups: Record<string, BudgetData[]> = {};
        filteredBudgetData.forEach(item => {
            const type = item.type || 'Variable';
            if (!groups[type]) groups[type] = [];
            groups[type].push(item);
        });
        return groups;
    }, [filteredBudgetData]);

    const handleSaveBudgetFull = async (concept: string, amount: number, category: string = 'expense', type?: string, due_day?: string) => {

        try {
            const { error } = await supabase
                .from('finance_budgets')
                .upsert({ 
                    user_id: userId, 
                    concept, 
                    month: selectedMonth,
                    amount,
                    budget_category: category,
                    expense_type: type,
                    due_day,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,concept,month,budget_category' });

            if (error) throw error;
            
            onBudgetUpdated();
        } catch (error) {
            console.error('Error saving budget:', error);
            toast.error('No se pudo guardar el presupuesto.');
        }
    };


    const handleDeleteBudget = async (concept: string) => {
        const ok = await confirm({
            title: 'Reiniciar Presupuesto',
            message: `Â¿Deseas eliminar el presupuesto personalizado de "${concept}"? Se usarÃ¡ el promedio histÃ³rico.`,
            confirmLabel: 'Reiniciar',
            danger: true,
        });
        if (!ok) return;
        try {
            const { error } = await supabase
                .from('finance_budgets')
                .delete()
                .eq('concept', concept)
                .eq('month', selectedMonth);

            if (error) throw error;

            onBudgetUpdated();
            toast.success(`Presupuesto de "${concept}" reiniciado.`);
        } catch (error) {
            console.error('Error deleting budget:', error);
            toast.error('No se pudo eliminar el presupuesto.');
        }
    };

    const toggleDrillDown = (concept: string) => {
        setExpandedConcept(expandedConcept === concept ? null : concept);
    };

    // 50/30/20 Calculation
    const budgetAnalysis = useMemo(() => {
        const totals = {
            fijo: 0,
            variable: 0,
            ahorroDeuda: 0,
            totalSpent: 0,
            fijoBudget: 0,
            variableBudget: 0,
            ahorroDeudaBudget: 0
        };

        budgetData.forEach(item => {
            if (item.category === 'income') return;
            const amount = item.currentAmount;
            const budgeted = item.avgBudget;
            
            totals.totalSpent += amount;
            
            if (item.type === 'Fijo') {
                totals.fijo += amount;
                totals.fijoBudget += budgeted;
            } else if (item.type === 'Variable') {
                totals.variable += amount;
                totals.variableBudget += budgeted;
            } else if (item.type === 'Ahorro' || item.type === 'Deuda') {
                totals.ahorroDeuda += amount;
                totals.ahorroDeudaBudget += budgeted;
            }
        });

        if (totals.totalSpent === 0 && (totals.fijoBudget + totals.variableBudget + totals.ahorroDeudaBudget === 0)) return null;

        const totalForPct = totals.totalSpent || 1;

        return {
            needs: { 
                label: 'Necesidades (50%)', 
                current: (totals.fijo / totalForPct) * 100, 
                target: 50, 
                color: 'bg-blue-500', 
                amount: totals.fijo,
                budgeted: totals.fijoBudget,
                remaining: totals.fijoBudget - totals.fijo
            },
            wants: { 
                label: 'Deseos (30%)', 
                current: (totals.variable / totalForPct) * 100, 
                target: 30, 
                color: 'bg-purple-500', 
                amount: totals.variable,
                budgeted: totals.variableBudget,
                remaining: totals.variableBudget - totals.variable
            },
            savings: { 
                label: 'Ahorro/Deuda (20%)', 
                current: (totals.ahorroDeuda / totalForPct) * 100, 
                target: 20, 
                color: 'bg-green-500', 
                amount: totals.ahorroDeuda,
                budgeted: totals.ahorroDeudaBudget,
                remaining: totals.ahorroDeudaBudget - totals.ahorroDeuda
            }
        };
    }, [budgetData]);

    const incomeAnalysis = useMemo(() => {
        const incomeItems = budgetData.filter(b => b.category === 'income');
        const totalGoal = incomeItems.reduce((acc, b) => acc + b.avgBudget, 0);
        const totalReal = incomeItems.reduce((acc, b) => acc + b.currentAmount, 0);
        return {
            goal: totalGoal,
            real: totalReal,
            progress: totalGoal > 0 ? (totalReal / totalGoal) * 100 : 0,
            remaining: totalGoal - totalReal,
            count: incomeItems.length
        };
    }, [budgetData]);

    const getConceptRecords = (concept: string, category: 'income' | 'expense') => {
        return records.filter(r => {
            const rMonth = r.date.includes('/') ? r.date.split('/').reverse().join('-').substring(0, 7) : r.date.substring(0, 7);
            const matchesConcept = (r.concept || '').toUpperCase().trim() === concept.toUpperCase().trim();
            const hasAmount = category === 'income' ? (Number(r.income) > 0) : (Number(r.expense) > 0);
            return rMonth === selectedMonth && matchesConcept && hasAmount;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const renderGroup = (type: string, items: BudgetData[]) => {
        const totalBudget = items.reduce((acc, curr) => acc + curr.avgBudget, 0);
        const totalReal = items.reduce((acc, curr) => acc + curr.currentAmount, 0);
        const category = items[0]?.category;
        const isIncome = category === 'income';

        return (
            <div key={type} className="mb-10 animate-fade-in">
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                            isIncome ? 'bg-green-500' :
                            type === 'Fijo' ? 'bg-blue-500' : 
                            type === 'Variable' ? 'bg-purple-500' : 
                            type === 'Ahorro' ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                        <h4 className="text-lg font-black uppercase tracking-tighter text-primary-dark">{isIncome ? `Meta de ${type}` : type}</h4>
                        <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">{items.length} Conceptos</span>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">{isIncome ? 'Subtotal Recibido' : 'Subtotal Gastado'}</p>
                        <p className="text-sm font-black text-primary-dark">
                            ${totalReal.toLocaleString('en-US', { minimumFractionDigits: 2 })} 
                            <span className="opacity-20 mx-2">/</span>
                            <span className="opacity-40">${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </p>
                    </div>
                </div>

                <div className="bg-[var(--bg-card)]/50 dark:bg-white/5 backdrop-blur-md overflow-hidden rounded-[24px] border border-[var(--border-color)] dark:border-white/10 shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-accent/5 text-[var(--text-primary)] text-[9px] font-black uppercase tracking-[0.2em] border-b border-[var(--border-color)] dark:border-white/10">
                                <th className="p-4 border-r border-[var(--border-color)] dark:border-white/10">Concepto</th>
                                <th className="p-4 border-r border-[var(--border-color)] dark:border-white/10 text-right w-40">Presupuesto</th>
                                <th className="p-4 border-r border-[var(--border-color)] dark:border-white/10 text-right w-56">{isIncome ? 'Ingreso Real' : 'Gasto Real'}</th>
                                {isEditingBudget && <th className="p-4 border-r border-[var(--border-color)] dark:border-white/10 text-center w-24">DÃ­a</th>}
                                <th className="p-4 text-right w-36">Estado</th>

                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100/50">
                            {items.map((row) => {
                                const percent = row.avgBudget > 0 ? (row.currentAmount / row.avgBudget) * 100 : 0;
                                const isOverBudget = !isIncome && percent > 100;
                                const isGoalMet = isIncome && percent >= 100;
                                const isPacingWarning = !isIncome && selectedMonth !== 'all' && (percent / 100) > (pacing + 0.1) && !isOverBudget;
                                
                                let progressColor = 'bg-green-500';
                                if (isIncome) {
                                    progressColor = isGoalMet ? 'bg-green-500' : percent > 50 ? 'bg-emerald-400' : 'bg-amber-400';
                                } else {
                                    progressColor = percent > 100 ? 'bg-red-500' : percent > 85 ? 'bg-amber-500' : 'bg-green-500';
                                }

                                const isExpanded = expandedConcept === row.concept;
                                
                                return (
                                    <React.Fragment key={row.concept}>
                                        <tr 
                                            className={`hover:bg-white/50 transition-colors group cursor-pointer ${isExpanded ? 'bg-accent/5' : ''}`}
                                            onClick={() => toggleDrillDown(row.concept)}
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {isExpanded ? <ChevronDown size={14} className="text-accent" /> : <ChevronRight size={14} className="opacity-20" />}
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-xs text-primary-dark uppercase tracking-wider">{row.concept}</span>
                                                        {isEditingBudget && !isIncome && (
                                                            <select 
                                                                className="mt-1 text-[8px] font-black uppercase tracking-widest bg-neutral-100 border-none rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-accent"
                                                                defaultValue={row.type}
                                                                onChange={(e) => handleSaveBudgetFull(row.concept, row.avgBudget, row.category, e.target.value, row.due_day)}

                                                            >
                                                                <option value="Fijo">Fijo</option>
                                                                <option value="Variable">Variable</option>
                                                                <option value="Ahorro">Ahorro</option>
                                                                <option value="Deuda">Deuda</option>
                                                            </select>
                                                        )}
                                                    </div>
                                                    {isPacingWarning && (
                                                        <div className="flex items-center gap-1 text-[8px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 animate-pulse">
                                                            <Flame size={10} /> RITMO ACELERADO
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 border-l border-neutral-100/50 bg-neutral-50/20 text-right" onClick={(e) => e.stopPropagation()}>
                                                {isEditingBudget ? (
                                                    <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl pl-3 pr-1 py-1 shadow-sm focus-within:border-accent transition-all group-hover:border-accent/40">
                                                        <span className="text-accent font-black text-xs">$</span>
                                                        <input 
                                                            type="number" 
                                                            className="w-20 bg-transparent outline-none text-right font-black text-xs text-primary-dark"
                                                            defaultValue={row.avgBudget}
                                                            onBlur={(e) => handleSaveBudgetFull(row.concept, parseFloat(e.target.value) || 0, row.category, row.type, row.due_day)}

                                                        />
                                                        <button 
                                                            onClick={() => handleDeleteBudget(row.concept)}
                                                            className="p-1 hover:bg-red-50 text-red-400 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="font-black text-xs text-primary-dark">
                                                        ${row.avgBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 border-l border-neutral-100/50">
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between items-center px-1">
                                                        <span className="text-[9px] font-black text-neutral-400">{percent.toFixed(0)}%</span>
                                                        <span className="text-xs font-black text-primary-dark">${row.currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden relative">
                                                        <div 
                                                            className={`h-full transition-all duration-700 ease-out rounded-full ${progressColor}`}
                                                            style={{ width: `${Math.min(percent, 100)}%` }}
                                                        ></div>
                                                        {selectedMonth !== 'all' && pacing < 1 && (
                                                            <div 
                                                                className="absolute top-0 w-0.5 h-full bg-primary-dark/20 z-10"
                                                                style={{ left: `${pacing * 100}%` }}
                                                                title="Hoy"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            {isEditingBudget && (
                                                <td className="p-4 border-l border-neutral-100/50" onClick={(e) => e.stopPropagation()}>
                                                    <input 
                                                        type="text" 
                                                        placeholder="-"
                                                        className="w-full bg-white border border-neutral-200 rounded-lg py-1 text-center font-black text-xs text-accent outline-none focus:border-accent"
                                                        defaultValue={row.due_day || ''}
                                                        onBlur={(e) => handleSaveBudgetFull(row.concept, row.avgBudget, row.category, row.type, e.target.value || undefined)}
                                                    />
                                                </td>

                                            )}
                                            <td className="p-4 text-right font-bold">

                                                {isIncome ? (
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${isGoalMet ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                                        {isGoalMet ? 'Logrado' : 'En Progreso'}
                                                    </span>
                                                ) : (
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${isOverBudget ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                                        {isOverBudget ? 'Excedido' : 'En Control'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-neutral-50/50 border-l-2 border-accent">
                                                <td colSpan={4} className="p-0">
                                                    <div className="p-4 animate-slide-in">
                                                        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-inner">
                                                            <table className="w-full text-[10px]">
                                                                <thead className="bg-neutral-50 text-neutral-400 font-black uppercase tracking-widest border-b">
                                                                    <tr>
                                                                        <th className="p-2 text-left">Fecha</th>
                                                                        <th className="p-2 text-left">{isIncome ? 'Fuente' : 'Proveedor'}</th>
                                                                        <th className="p-2 text-right">Monto</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y">
                                                                    {getConceptRecords(row.concept, row.category).length > 0 ? (
                                                                        getConceptRecords(row.concept, row.category).map(rec => (
                                                                            <tr key={rec.id} className="hover:bg-neutral-50 transition-colors">
                                                                                <td className="p-2 text-neutral-500">{new Date(rec.date).toLocaleDateString('es-ES')}</td>
                                                                                <td className="p-2 font-bold text-primary-dark uppercase">{rec.provider || (isIncome ? 'Sin fuente' : 'Sin proveedor')}</td>
                                                                                <td className="p-2 text-right font-black text-primary-dark">${(isIncome ? rec.income : rec.expense).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan={3} className="p-4 text-center italic text-neutral-400">No hay movimientos registrados para este concepto en {selectedMonth}.</td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const groupOrder = ['Ingreso', 'Fijo', 'Variable', 'Ahorro', 'Deuda'];
    const sortedGroups = Object.keys(groupedData).sort((a, b) => {
        const indexA = groupOrder.indexOf(a);
        const indexB = groupOrder.indexOf(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    const filteredGroups = sortedGroups.filter(group => {
        if (activeTab === 'income') return true; // Already filtered at groupedData level
        if (expenseSubFilter === 'all') return true;
        if (expenseSubFilter === 'AhorroDeuda') return group === 'Ahorro' || group === 'Deuda';
        return group === expenseSubFilter;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto animate-fade-in delay-100 text-[var(--text-primary)]">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                <div>
                    <h3 className="text-3xl font-black font-heading uppercase tracking-tighter">
                        Control Presupuestal
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="opacity-40 text-xs font-medium tracking-wide">Metas de Ingresos vs LÃ­mites de Gastos.</p>
                        {selectedMonth !== 'all' && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary-dark/5 rounded-full border border-primary-dark/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-dark animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">DÃ­a {new Date().getDate()} del mes ({(pacing * 100).toFixed(0)}%)</span>
                            </div>
                        )}
                    </div>
                </div>
                <Button 
                    outline={!isEditingBudget}
                    primary={isEditingBudget}
                    className={`text-[10px] font-black uppercase tracking-widest py-3 px-8 shadow-xl transition-all ${isEditingBudget ? 'scale-105' : 'hover:scale-105'}`}
                    onClick={() => setIsEditingBudget(!isEditingBudget)}
                >
                    {isEditingBudget ? 'Finalizar EdiciÃ³n' : 'Personalizar Presupuesto'}
                </Button>
            </div>

            {isEditingBudget && (
                <div className="mb-12 p-6 bg-primary-dark rounded-[24px] text-white shadow-xl flex gap-4 items-start animate-slide-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="bg-white/10 p-2 rounded-xl">
                        <TrendingUp className="text-accent" size={20} />
                    </div>
                    <div className="relative z-10">
                        <p className="font-black text-[10px] uppercase tracking-widest mb-1 opacity-60">Modo EdiciÃ³n Activo</p>
                        <p className="text-sm font-medium leading-relaxed">Modifica los montos en la columna <strong className="text-accent">Presupuesto</strong>. Haz clic fuera para guardar.</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-[var(--border-color)] dark:border-white/10 pb-4">
                <div className="flex gap-4">
                    <button 
                        onClick={() => setActiveTab('analysis')}
                        className={`text-sm font-black uppercase tracking-widest px-6 py-2 rounded-xl transition-all ${activeTab === 'analysis' ? 'bg-primary-dark text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                    >
                        AnÃ¡lisis
                    </button>
                    <button 
                        onClick={() => setActiveTab('expense')}
                        className={`text-sm font-black uppercase tracking-widest px-6 py-2 rounded-xl transition-all ${activeTab === 'expense' ? 'bg-blue-600 text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                    >
                        Gastos
                    </button>
                    <button 
                        onClick={() => setActiveTab('income')}
                        className={`text-sm font-black uppercase tracking-widest px-6 py-2 rounded-xl transition-all ${activeTab === 'income' ? 'bg-green-600 text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                    >
                        Ingresos
                    </button>
                </div>

                {activeTab === 'expense' && (
                    <div className="flex bg-neutral-100 dark:bg-white/5 p-1 rounded-2xl self-start">
                        {[
                            { id: 'all', label: 'Todos' },
                            { id: 'Fijo', label: 'Fijos' },
                            { id: 'Variable', label: 'Variables' },
                            { id: 'AhorroDeuda', label: 'Ahorro / Deuda' }
                        ].map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setExpenseSubFilter(filter.id as any)}
                                className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
                                    expenseSubFilter === filter.id 
                                        ? 'bg-white dark:bg-white/10 shadow-sm text-primary-dark dark:text-white' 
                                        : 'opacity-40 hover:opacity-60'
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {activeTab === 'analysis' && (
                <div className="space-y-12">
                    {/* Planning Analysis Section - Premium Bento Design */}
                    {planningAnalysis && (
                        <div className="space-y-8 animate-slide-up">
                            <div className="flex items-center justify-between px-2">
                                <div>
                                    <h4 className="text-2xl font-black uppercase tracking-tighter text-primary-dark">AnÃ¡lisis del Plan Maestro</h4>
                                    <p className="text-[11px] font-bold opacity-40 uppercase tracking-widest mt-1">EvaluaciÃ³n de tu estrategia mensual vs. Regla 50/30/20</p>
                                </div>
                                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-accent/5 rounded-2xl border border-accent/10">
                                    <Target size={16} className="text-accent" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-accent">Objetivo: Balance Perfecto</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Health Card */}
                                <div className="lg:col-span-2 bg-white dark:bg-white/5 p-8 rounded-[32px] border border-[var(--border-color)] dark:border-white/10 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-accent/10"></div>
                                    
                                    <div className="relative z-10 space-y-8">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">DistribuciÃ³n de Gastos Planificados</span>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-black text-primary-dark">${planningAnalysis.totalBudgetedExpense.toLocaleString()}</span>
                                                    <span className="text-sm font-bold opacity-30">presupuestados</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Eficiencia del Plan</span>
                                                <div className="text-xl font-black text-accent">
                                                    {((planningAnalysis.totalBudgetedExpense / (planningAnalysis.totalIncome || 1)) * 100).toFixed(1)}% <span className="text-xs opacity-40">del ingreso</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stacked Progress Bar */}
                                        <div className="space-y-3">
                                            <div className="w-full h-10 bg-neutral-100 dark:bg-white/10 rounded-[20px] overflow-hidden flex shadow-inner p-1">
                                                <div 
                                                    className="h-full bg-blue-500 rounded-l-[14px] transition-all duration-1000 relative group/bar"
                                                    style={{ width: `${Math.min(planningAnalysis.fixedPct, 100)}%` }}
                                                >
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/bar:opacity-100 bg-black/20 transition-opacity">
                                                        <span className="text-[9px] font-black text-white">FIJO</span>
                                                    </div>
                                                </div>
                                                <div 
                                                    className="h-full bg-purple-500 transition-all duration-1000 relative group/bar"
                                                    style={{ width: `${Math.min(planningAnalysis.variablePct, 100)}%` }}
                                                >
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/bar:opacity-100 bg-black/20 transition-opacity">
                                                        <span className="text-[9px] font-black text-white">VAR</span>
                                                    </div>
                                                </div>
                                                <div 
                                                    className="h-full bg-emerald-500 rounded-r-[14px] transition-all duration-1000 relative group/bar"
                                                    style={{ width: `${Math.min(planningAnalysis.savingsPct, 100)}%` }}
                                                >
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/bar:opacity-100 bg-black/20 transition-opacity">
                                                        <span className="text-[9px] font-black text-white">AHORRO</span>
                                                    </div>
                                                </div>
                                                {planningAnalysis.margin < 0 && (
                                                    <div 
                                                        className="h-full bg-red-500/20 border-l-2 border-red-500 animate-pulse"
                                                        style={{ width: `${Math.min(Math.abs(planningAnalysis.margin) / (planningAnalysis.totalIncome || 1) * 100, 20)}%` }}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex justify-between px-1">
                                                <div className="flex gap-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                        <span className="text-[9px] font-black uppercase opacity-40">Fijos</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                                                        <span className="text-[9px] font-black uppercase opacity-40">Variables</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                        <span className="text-[9px] font-black uppercase opacity-40">Ahorro</span>
                                                    </div>
                                                </div>
                                                {planningAnalysis.margin < 0 && (
                                                    <div className="flex items-center gap-1.5 text-red-500">
                                                        <AlertTriangle size={10} />
                                                        <span className="text-[9px] font-black uppercase">DÃ©ficit en Plan</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-6 pt-4 border-t border-neutral-100 dark:border-white/5">
                                            {[
                                                { 
                                                    label: 'Fijos (50%)', 
                                                    amount: planningAnalysis.fixedAmount, 
                                                    pct: planningAnalysis.fixedPct, 
                                                    target: 50,
                                                    color: 'text-blue-600',
                                                    bg: 'bg-blue-50'
                                                },
                                                { 
                                                    label: 'Deseos (30%)', 
                                                    amount: planningAnalysis.variableAmount, 
                                                    pct: planningAnalysis.variablePct, 
                                                    target: 30,
                                                    color: 'text-purple-600',
                                                    bg: 'bg-purple-50'
                                                },
                                                { 
                                                    label: 'Ahorro (20%)', 
                                                    amount: planningAnalysis.savingsAmount, 
                                                    pct: planningAnalysis.savingsPct, 
                                                    target: 20,
                                                    color: 'text-emerald-600',
                                                    bg: 'bg-emerald-50'
                                                }
                                            ].map((cat, i) => {
                                                const diff = cat.pct - cat.target;
                                                const isOver = diff > 5;
                                                const isUnder = diff < -10;
                                                
                                                return (
                                                    <div key={i} className="space-y-2">
                                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40 block">{cat.label}</span>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-lg font-black text-primary-dark">${cat.amount.toLocaleString()}</span>
                                                        </div>
                                                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${isOver ? 'bg-red-50 text-red-600' : isUnder ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                                            {isOver ? <AlertTriangle size={10} /> : isUnder ? <Info size={10} /> : <CheckCircle2 size={10} />}
                                                            <span className="text-[9px] font-black uppercase">{cat.pct.toFixed(0)}%</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Margin & Action Card */}
                                <div className={`p-8 rounded-[32px] border transition-all flex flex-col justify-between relative overflow-hidden ${
                                    planningAnalysis.margin >= 0 
                                        ? 'bg-primary-dark text-white border-primary-dark shadow-xl' 
                                        : 'bg-red-600 text-white border-red-600 shadow-xl animate-pulse'
                                }`}>
                                    {planningAnalysis.margin >= 0 && (
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                    )}

                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-white/10 rounded-2xl">
                                                {planningAnalysis.margin >= 0 ? <TrendingUp size={24} /> : <AlertCircle size={24} />}
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Margen del Plan</span>
                                                <h3 className="text-3xl font-black tracking-tighter text-white">
                                                    ${planningAnalysis.margin.toLocaleString()}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-sm font-medium leading-relaxed opacity-80">
                                                {planningAnalysis.margin > 0 
                                                    ? `Tienes un remanente positivo. Este dinero puede destinarse a inversiones adicionales o como fondo de emergencia.`
                                                    : planningAnalysis.margin === 0
                                                    ? `Tu plan estÃ¡ perfectamente equilibrado con tus ingresos. Cada peso tiene un propÃ³sito.`
                                                    : `Tu presupuesto excede tus ingresos por $${Math.abs(planningAnalysis.margin).toLocaleString()}. Necesitas ajustar gastos o incrementar metas de ingreso.`
                                                }
                                            </p>
                                            
                                            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Meta de Ingreso Mensual</span>
                                                </div>
                                                <p className="text-xl font-black">${planningAnalysis.totalIncome.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Estado de Salud</span>
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                            planningAnalysis.margin > 0 ? 'bg-green-500/20 text-green-300' : 'bg-white/20 text-white'
                                        }`}>
                                            {planningAnalysis.margin > 0 ? 'SuperÃ¡vit' : planningAnalysis.margin === 0 ? 'Equilibrado' : 'DÃ©ficit'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Execution Summary - Combined Income & Expense */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Income Goal Progress */}
                        <div className="bg-white dark:bg-white/5 p-8 rounded-[32px] border border-[var(--border-color)] dark:border-white/10 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-primary-dark">Cumplimiento de Ingresos</h4>
                                    <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Meta vs Realidad</span>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-[10px] font-black opacity-40 uppercase tracking-widest block mb-1">Recaudado</span>
                                        <span className="text-3xl font-black text-primary-dark">${incomeAnalysis.real.toLocaleString()}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black opacity-40 uppercase tracking-widest block mb-1">Meta</span>
                                        <span className="text-lg font-bold opacity-30">${incomeAnalysis.goal.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="w-full h-2 bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-green-500 transition-all duration-1000"
                                            style={{ width: `${Math.min(incomeAnalysis.progress, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-green-600">{incomeAnalysis.progress.toFixed(1)}% Logrado</span>
                                        <span className="opacity-40">{incomeAnalysis.remaining > 0 ? `Faltan $${incomeAnalysis.remaining.toLocaleString()}` : 'Meta superada'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Net Balance Status */}
                        <div className="bg-primary-dark p-8 rounded-[32px] border border-primary-dark shadow-xl text-white">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-accent">
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-widest">Balance Neto Real</h4>
                                    <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Utilidad del Periodo</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest block mb-1">Resultado Neto</span>
                                    <span className="text-4xl font-black tracking-tighter">${(incomeAnalysis.real - (budgetAnalysis ? Object.values(budgetAnalysis).reduce((acc, b) => acc + b.amount, 0) : 0)).toLocaleString()}</span>
                                </div>

                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-[11px] font-medium leading-relaxed">
                                    { (incomeAnalysis.real - (budgetAnalysis ? Object.values(budgetAnalysis).reduce((acc, b) => acc + b.amount, 0) : 0)) >= 0 
                                        ? "Tu flujo de caja es positivo. Los ingresos actuales cubren todos tus gastos registrados."
                                        : "Actualmente tienes un dÃ©ficit en el flujo de caja real. Los gastos registrados superan tus ingresos del periodo."
                                    }
                                </div>
                            </div>
                        </div>

                        {/* Quick Insights */}
                        <div className="bg-white dark:bg-white/5 p-8 rounded-[32px] border border-[var(--border-color)] dark:border-white/10 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                                    <Info size={20} />
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-primary-dark">Resumen de Conceptos</h4>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-neutral-50 dark:bg-white/5 rounded-2xl">
                                    <span className="text-[9px] font-black opacity-40 uppercase block mb-1">Fuentes Ingreso</span>
                                    <span className="text-xl font-black text-primary-dark">{incomeAnalysis.count}</span>
                                </div>
                                <div className="p-4 bg-neutral-50 dark:bg-white/5 rounded-2xl">
                                    <span className="text-[9px] font-black opacity-40 uppercase block mb-1">Tipos de Gasto</span>
                                    <span className="text-xl font-black text-primary-dark">{budgetData.filter(b => b.category === 'expense').length}</span>
                                </div>
                            </div>

                            <p className="mt-4 text-[10px] font-medium opacity-40 italic">
                                * Datos basados en los promedios y metas definidas para {new Date(selectedMonth + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}.
                            </p>
                        </div>
                    </div>

                    {/* Real Expense Execution - Moved from main view */}
                    {budgetAnalysis && (
                        <div className="space-y-6 animate-slide-up">
                            <div className="flex items-center gap-3 px-2">
                                <div className="w-8 h-8 rounded-xl bg-primary-dark/5 flex items-center justify-center text-primary-dark">
                                    <Activity size={18} />
                                </div>
                                <h4 className="text-lg font-black uppercase tracking-tighter text-primary-dark">Estado de EjecuciÃ³n de Gastos</h4>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {Object.entries(budgetAnalysis).map(([key, data]) => (
                                    <div key={key} className="bg-white dark:bg-white/5 p-6 rounded-[28px] border border-[var(--border-color)] dark:border-white/10 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{data.label}</span>
                                            <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                                                data.current > data.target ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                            }`}>
                                                Meta: {data.target}%
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4 mb-6">
                                            <div className="flex flex-col">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-black text-primary-dark">${(data as any).amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-black text-accent">{data.current.toFixed(1)}%</span>
                                                    <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest text-primary-dark">del gasto total</span>
                                                </div>
                                            </div>

                                            <div className={`p-3 rounded-2xl border ${
                                                (data as any).remaining >= 0 
                                                    ? 'bg-green-500/5 border-green-500/10' 
                                                    : 'bg-red-500/5 border-red-500/10'
                                            }`}>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Disponible</span>
                                                    <span className={`text-sm font-black ${(data as any).remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        ${(data as any).remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="w-full h-1.5 bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${data.color}`}
                                                    style={{ width: `${Math.min(data.current, 100)}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[8px] font-black opacity-30 uppercase">Progreso vs Regla</span>
                                                <span className={`text-[9px] font-black ${data.current > data.target ? 'text-red-500' : 'text-green-500'}`}>
                                                    {data.current > data.target ? `+${(data.current - data.target).toFixed(1)}% Excedido` : 'Dentro del rango'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab !== 'analysis' && (
                <>
                    {filteredGroups.length > 0 ? (
                        filteredGroups.map(group => renderGroup(group, groupedData[group]))
                    ) : (
                        <div className="bg-white/50 backdrop-blur-md p-16 text-center rounded-[32px] border border-dashed border-neutral-200">
                            <AlertCircle className="mx-auto text-neutral-300 mb-4" size={40} />
                            <p className="text-neutral-400 italic text-sm">
                                {activeTab === 'income' 
                                    ? 'No hay metas de ingresos definidas para este periodo.' 
                                    : 'No hay lÃ­mites de gastos definidos para este periodo.'}
                            </p>
                        </div>
                    )}
                </>
            )}

            {ConfirmModal}
        </div>
    );
};

export default BudgetTracker;

```

## File: src\components\portal\finance\CashflowCalendar.tsx
```tsx
import React, { useMemo, useState } from 'react';
import { 
    Calendar as CalendarIcon, 
    ChevronLeft, 
    ChevronRight, 
    AlertCircle, 
    CheckCircle2, 
    ArrowUpRight, 
    ArrowDownRight,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';

import type { FinanceRecord, FinanceCredit, FinanceBudget, PaymentMethod } from '../../../types/finance';

interface CashflowCalendarProps {
    records: FinanceRecord[];
    credits: FinanceCredit[];
    budgets: FinanceBudget[];
    paymentMethods: PaymentMethod[];
}

const CashflowCalendar: React.FC<CashflowCalendarProps> = ({ 
    records, 
    credits, 
    budgets,
    paymentMethods
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    // 1. Calculate Initial Liquidity for the current month
    // We sum all payment methods' current balances
    const initialLiquidity = useMemo(() => {
        const paymentMap: Record<string, number> = {};
        
        // We need all records to get current balance accurately
        const sortedRecords = [...records].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateA !== dateB) return dateA - dateB;
            return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        });

        sortedRecords.forEach(r => {
            const pm = (r.payment_method || 'SIN ESPECIFICAR').toUpperCase().trim();
            const isInitial = (r.concept || '').toUpperCase().trim() === 'SALDO INICIAL';
            const val = (Number(r.income) || 0) - (Number(r.expense) || 0);

            if (isInitial) {
                paymentMap[pm] = val;
            } else {
                paymentMap[pm] = (paymentMap[pm] || 0) + val;
            }
        });

        const registeredNames = new Set(paymentMethods.map(pm => pm.name.toUpperCase().trim()));
        return Object.entries(paymentMap)
            .filter(([name]) => registeredNames.has(name))
            .reduce((acc, [_, balance]) => acc + balance, 0);
    }, [records, paymentMethods]);

    // 2. Identify Scheduled Items for the current month
    const scheduledItems = useMemo(() => {
        const items: any[] = [];

        // Fixed items from budgets
        // We only take items that have a due_day and are for the current selected month
        const relevantBudgets = budgets.filter(b => b.month === currentMonthStr && b.due_day);
        
        relevantBudgets.forEach(b => {
            if (!b.due_day) return;

            // Parse multiple days (e.g., "15, 30")
            const days = b.due_day.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
            const amountPerDay = b.amount / (days.length || 1);

            days.forEach(day => {
                // Check if already paid in this month (This is tricky with multiple days)
                // For now, we'll mark as paid if there's AT LEAST ONE record for this concept this month
                // Ideally we'd match the specific installment, but without more data, this is the first step.
                const isPaid = records.some(r => {
                    const rMonth = r.date.includes('/') ? r.date.split('/').reverse().join('-').substring(0, 7) : r.date.substring(0, 7);
                    const rDay = parseInt(r.date.includes('/') ? r.date.split('/')[0] : r.date.split('-')[2]);
                    
                    return rMonth === currentMonthStr && 
                           r.concept.toUpperCase().trim() === b.concept.toUpperCase().trim() &&
                           (b.budget_category === 'income' ? Number(r.income) > 0 : Number(r.expense) > 0) &&
                           (days.length === 1 || Math.abs(rDay - day) <= 3); // Simple heuristic: if payment is within 3 days of scheduled day
                });

                items.push({
                    type: b.budget_category === 'income' ? 'income' : 'expense',
                    concept: b.concept,
                    amount: amountPerDay,
                    day: day,
                    isPaid,
                    original: b
                });
            });
        });



        // Credit payments
        credits.forEach(c => {
            if (c.payment_day) {
                // Check if paid (simplified check: any record containing credit name in this month)
                const isPaid = records.some(r => {
                    const rMonth = r.date.includes('/') ? r.date.split('/').reverse().join('-').substring(0, 7) : r.date.substring(0, 7);
                    return rMonth === currentMonthStr && 
                           (r.concept.toUpperCase().includes(c.name.toUpperCase()) || 
                            r.description.toUpperCase().includes(c.name.toUpperCase())) &&
                           Number(r.expense) > 0;
                });

                items.push({
                    type: 'expense',
                    concept: `Pago: ${c.name}`,
                    amount: 0, // In forecast we might want to estimate this, but for now we mark it
                    day: c.payment_day,
                    isPaid,
                    isCredit: true,
                    original: c
                });
            }
            if (c.cutoff_day) {
                items.push({
                    type: 'info',
                    concept: `Corte: ${c.name}`,
                    day: c.cutoff_day,
                    isCutoff: true,
                    original: c
                });
            }
        });

        return items;
    }, [budgets, credits, records, currentMonthStr]);

    // 3. Calendar Grid Logic
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const calendarDays = useMemo(() => {
        const days = [];
        // Pad for the first week
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    }, [daysInMonth, firstDayOfMonth]);

    // 4. Projection Logic (Day by Day)
    const dailyProjection = useMemo(() => {
        const projection: Record<number, { balance: number, items: any[] }> = {};
        let runningBalance = initialLiquidity;

        // Note: initialLiquidity is CURRENT liquidity. 
        // For projection, if we are in the middle of the month, we should ideally know the balance at start of month.
        // But let's assume we want to know "What will my balance be at end of month starting from TODAY".
        // Actually, let's just use scheduled items to see the flow.
        
        for (let d = 1; d <= 31; d++) {
            const dayItems = scheduledItems.filter(item => item.day === d);
            const unpaidExpenses = dayItems.filter(i => i.type === 'expense' && !i.isPaid).reduce((acc, i) => acc + i.amount, 0);
            const pendingIncome = dayItems.filter(i => i.type === 'income' && !i.isPaid).reduce((acc, i) => acc + i.amount, 0);
            
            // We only subtract/add if not already accounted for in liquidity (i.e. not paid)
            // This is a rough estimation.
            runningBalance = runningBalance + pendingIncome - unpaidExpenses;
            
            projection[d] = {
                balance: runningBalance,
                items: dayItems
            };
        }
        return projection;
    }, [initialLiquidity, scheduledItems]);

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
        setSelectedDay(null);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day && 
               today.getMonth() === currentDate.getMonth() && 
               today.getFullYear() === currentDate.getFullYear();
    };

    return (
        <div className="bg-[var(--bg-card)] dark:bg-white/5 rounded-[3rem] p-10 border border-[var(--border-color)] dark:border-white/10 shadow-sm animate-fade-in text-[var(--text-primary)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h3 className="text-3xl font-black tracking-tighter flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                            <CalendarIcon size={24} />
                        </div>
                        Cashflow Forecast
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-2 ml-16">ProyecciÃ³n ejecutiva de liquidez y compromisos</p>
                </div>
                
                <div className="flex items-center gap-4 bg-[var(--bg-main)] dark:bg-white/5 p-2 rounded-2xl border border-[var(--border-color)] dark:border-white/5">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-accent hover:text-white rounded-xl transition-all">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-black uppercase tracking-widest px-4 min-w-[160px] text-center capitalize">
                        {monthName}
                    </span>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-accent hover:text-white rounded-xl transition-all">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* CALENDAR GRID */}
                <div className="lg:col-span-8">
                    <div className="grid grid-cols-7 mb-4">
                        {['Dom', 'Lun', 'Mar', 'MiÃ©', 'Jue', 'Vie', 'SÃ¡b'].map(d => (
                            <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest opacity-30 py-2">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-3">
                        {calendarDays.map((day, i) => {
                            if (day === null) return <div key={`empty-${i}`} className="aspect-square"></div>;
                            
                            const dayData = dailyProjection[day];
                            const hasIncomes = dayData.items.some(it => it.type === 'income');
                            const hasExpenses = dayData.items.some(it => it.type === 'expense');
                            const hasCutoffs = dayData.items.some(it => it.isCutoff);
                            const allPaid = dayData.items.length > 0 && dayData.items.every(it => it.isPaid || it.type === 'info');
                            const isSelected = selectedDay === day;

                            return (
                                <button 
                                    key={day} 
                                    onClick={() => setSelectedDay(day)}
                                    className={`aspect-square rounded-3xl border transition-all relative flex flex-col p-3 group
                                        ${isToday(day) ? 'bg-accent/5 border-accent shadow-lg shadow-accent/10' : 'bg-[var(--bg-main)] dark:bg-white/5 border-[var(--border-color)] dark:border-white/5 hover:border-accent/40'}
                                        ${isSelected ? 'ring-2 ring-accent ring-offset-4 dark:ring-offset-primary-dark border-accent scale-105 z-10' : ''}
                                    `}
                                >
                                    <span className={`text-sm font-black ${isToday(day) ? 'text-accent' : 'opacity-60'}`}>{day}</span>
                                    
                                    <div className="mt-auto flex flex-wrap gap-1">
                                        {hasIncomes && <div className={`w-1.5 h-1.5 rounded-full ${dayData.items.filter(it => it.type === 'income' && !it.isPaid).length > 0 ? 'bg-green-500 animate-pulse' : 'bg-green-500/30'}`}></div>}
                                        {hasExpenses && <div className={`w-1.5 h-1.5 rounded-full ${dayData.items.filter(it => it.type === 'expense' && !it.isPaid).length > 0 ? 'bg-red-500 animate-pulse' : 'bg-red-500/30'}`}></div>}
                                        {hasCutoffs && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                                    </div>

                                    {dayData.items.length > 0 && allPaid && (
                                        <div className="absolute top-3 right-3 text-green-500 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <CheckCircle2 size={12} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* DAY DETAILS / PROJECTION */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-[var(--bg-main)] dark:bg-white/5 rounded-[2.5rem] p-8 border border-[var(--border-color)] dark:border-white/10 h-full">
                        {selectedDay ? (
                            <div className="animate-fade-in">
                                <div className="flex justify-between items-center mb-8">
                                    <h4 className="text-xl font-black tracking-tighter">DÃ­a {selectedDay}</h4>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">ProyecciÃ³n Saldo</span>
                                        <span className="text-lg font-black text-accent">${dailyProjection[selectedDay].balance.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {dailyProjection[selectedDay].items.length === 0 ? (
                                        <div className="py-20 text-center opacity-30 italic text-sm font-bold uppercase tracking-widest">
                                            Sin compromisos este dÃ­a
                                        </div>
                                    ) : (
                                        dailyProjection[selectedDay].items.map((item, i) => (
                                            <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between group transition-all ${
                                                item.isPaid ? 'bg-green-500/5 border-green-500/20' : 
                                                item.type === 'expense' ? 'bg-red-500/5 border-red-500/20' :
                                                item.type === 'income' ? 'bg-green-500/5 border-green-500/20' :
                                                'bg-blue-500/5 border-blue-500/20'
                                            }`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                                        item.isPaid ? 'bg-green-500 text-white' : 
                                                        item.type === 'expense' ? 'bg-red-500/10 text-red-500' :
                                                        item.type === 'income' ? 'bg-green-500/10 text-green-500' :
                                                        'bg-blue-500/10 text-blue-500'
                                                    }`}>
                                                        {item.isPaid ? <CheckCircle2 size={16} /> : 
                                                         item.type === 'expense' ? <ArrowDownRight size={16} /> :
                                                         item.type === 'income' ? <ArrowUpRight size={16} /> :
                                                         <AlertCircle size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-tight truncate max-w-[120px]">{item.concept}</p>
                                                        <p className="text-[8px] font-bold opacity-40 uppercase">{item.isPaid ? 'Ejecutado' : 'Pendiente'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm font-black ${item.type === 'expense' ? 'text-red-500' : item.type === 'income' ? 'text-green-500' : 'text-blue-500'}`}>
                                                        {item.amount > 0 ? `$${item.amount.toLocaleString()}` : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center mb-6">
                                    <TrendingUp size={40} className="text-accent/40" />
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-widest mb-2">Resumen de Flujo</h4>
                                <p className="text-xs font-bold leading-relaxed max-w-[200px]">
                                    Selecciona un dÃ­a para ver el detalle de los movimientos programados.
                                </p>
                                
                                <div className="mt-12 w-full space-y-4 text-left">
                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Liquidez Actual</span>
                                        <span className="text-sm font-black text-green-500">${initialLiquidity.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Efecto Forecast</span>
                                        <span className={`text-sm font-black ${dailyProjection[31].balance >= initialLiquidity ? 'text-green-500' : 'text-red-500'}`}>
                                            {dailyProjection[31].balance >= initialLiquidity ? '+' : '-'} 
                                            ${Math.abs(dailyProjection[31].balance - initialLiquidity).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-12 p-6 bg-accent/5 rounded-[2rem] border border-accent/20 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <ShieldCheck size={24} className="text-accent" />
                    <div>
                        <p className="text-xs font-black uppercase tracking-tight">Estrategia de TesorerÃ­a Activa</p>
                        <p className="text-[10px] font-bold opacity-60">El sistema monitorea tus fechas de corte y vencimiento para optimizar tu flujo.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Ingresos</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Gastos</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Info</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashflowCalendar;

```

## File: src\components\portal\finance\CreditsManager.tsx
```tsx
import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Trash2, TrendingDown, DollarSign } from 'lucide-react';
import Button from '../../ui/Button';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../hooks/useConfirm';

interface CreditsManagerProps {
    user: { id: string; [key: string]: unknown };
    credits: any[];
    records: any[];
    paymentMethods: any[];
    onRefresh: () => void;
}

export default function CreditsManager({ user, credits, records, paymentMethods, onRefresh }: CreditsManagerProps) {
    const [isCreditFormOpen, setIsCreditFormOpen] = useState(false);
    const [creditName, setCreditName] = useState('');
    const [creditInitialBalance, setCreditInitialBalance] = useState<number | ''>('');
    const [creditAnnualRate, setCreditAnnualRate] = useState<number | ''>('');
    const [creditStartDate, setCreditStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [creditCutoffDay, setCreditCutoffDay] = useState<number | ''>('');
    const [creditPaymentDay, setCreditPaymentDay] = useState<number | ''>('');
    const [isSavingCredit, setIsSavingCredit] = useState(false);


    const [isCreditPaymentFormOpen, setIsCreditPaymentFormOpen] = useState(false);
    const [activeCreditForPayment, setActiveCreditForPayment] = useState<any | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [creditPaymentMethod, setCreditPaymentMethod] = useState('');
    const [isSavingPayment, setIsSavingPayment] = useState(false);

    const { confirm, ConfirmModal } = useConfirm();

    const handleSaveCredit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!creditName.trim() || !creditInitialBalance) return;

        setIsSavingCredit(true);
        try {
            const { error } = await supabase
                .from('finance_credits')
                .insert([{
                    user_id: user.id,
                    name: creditName.trim().toUpperCase(),
                    initial_balance: Number(creditInitialBalance),
                    annual_rate: Number(creditAnnualRate) || 0,
                    start_date: creditStartDate,
                    cutoff_day: creditCutoffDay === '' ? null : Number(creditCutoffDay),
                    payment_day: creditPaymentDay === '' ? null : Number(creditPaymentDay)
                }]);

            if (error) throw error;

            // SYNC: Crear automÃ¡ticamente el mÃ©todo de pago (Cuenta) correspondiente
            await supabase
                .from('finance_payment_methods')

                .insert([{
                    user_id: user.id,
                    name: creditName.trim().toUpperCase(),
                    initial_balance: -Number(creditInitialBalance)
                }]);

            toast.success('LÃ­nea de crÃ©dito registrada.');
            setIsCreditFormOpen(false);
            setCreditName('');
            setCreditInitialBalance('');
            setCreditAnnualRate('');
            setCreditCutoffDay('');
            setCreditPaymentDay('');
            onRefresh();

        } catch (error) {
            console.error('Error saving credit:', error);
            toast.error(`Error: ${(error as any).message}`);
        } finally {
            setIsSavingCredit(false);
        }
    };

    const handleDeleteCredit = async (id: string, name: string) => {
        const ok = await confirm({
            title: 'Eliminar CrÃ©dito',
            message: `Â¿Seguro que deseas eliminar el crÃ©dito "${name}"?`,
            confirmLabel: 'Eliminar',
            danger: true
        });
        if (!ok) return;

        try {
            const { error } = await supabase.from('finance_credits').delete().eq('id', id);
            if (error) throw error;

            // SYNC: Eliminar tambiÃ©n el mÃ©todo de pago para evitar basura
            await supabase
                .from('finance_payment_methods')

                .delete()
                .eq('user_id', user.id)
                .eq('name', name.toUpperCase());

            toast.success('CrÃ©dito y cuenta asociada eliminados.');
            onRefresh();

        } catch (error) {
            console.error('Error deleting credit:', error);
            toast.error(`No se pudo eliminar el crÃ©dito: ${(error as any).message}`);
        }
    };

    const handleSaveCreditPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeCreditForPayment || !paymentAmount) return;

        setIsSavingPayment(true);
        try {
            const { error } = await supabase
                .from('finance_records')
                .insert([{
                    user_id: user.id,
                    concept: `PAGO CRÃ‰DITO: ${activeCreditForPayment.name}`,
                    date: paymentDate,
                    payment_method: creditPaymentMethod || 'TARJETA CRÃ‰DITO',
                    expense: Number(paymentAmount),
                    income: 0,
                    expense_type: 'Deuda',
                    provider: activeCreditForPayment.name,
                    description: `Abono a lÃ­nea de crÃ©dito ${activeCreditForPayment.name}`
                }]);

            if (error) throw error;
            toast.success('Abono registrado correctamente.');
            setIsCreditPaymentFormOpen(false);
            setActiveCreditForPayment(null);
            setPaymentAmount('');
            onRefresh();
        } catch (error) {
            console.error('Error saving payment:', error);
            toast.error(`No se pudo registrar el pago: ${(error as any).message}`);
        } finally {
            setIsSavingPayment(false);
        }
    };

    const formatDateLocal = (dateStr: string) => {
        if (!dateStr) return '';
        if (dateStr.includes('-')) {
            const [year, month, day] = dateStr.split('-');
            return `${day}/${month}/${year}`;
        }
        return dateStr;
    };

    const renderPaymentOptions = () => (
        <>
            <option value="" disabled>Seleccione pago...</option>
            {paymentMethods.length > 0 ? (
                paymentMethods.map(pm => (
                    <option key={pm.id} value={pm.name}>{pm.name}</option>
                ))
            ) : (
                <>
                    <option value="EFECTIVO">EFECTIVO</option>
                    <option value="TARJETA DÃ‰BITO">TARJETA DÃ‰BITO</option>
                    <option value="TARJETA CRÃ‰DITO">TARJETA CRÃ‰DITO</option>
                </>
            )}
        </>
    );

    return (
        <div className="p-8 space-y-10 animate-fade-in text-[var(--text-primary)]">
            <div className="flex justify-between items-center bg-accent/10 p-6 rounded-[2.5rem] border border-accent/10">
                <div>
                    <h3 className="text-2xl font-black tracking-tighter">GestiÃ³n de CrÃ©ditos</h3>
                    <p className="text-[10px] opacity-60 font-bold uppercase tracking-wider mt-1">Control de deudas y aceleraciÃ³n de libertad financiera</p>
                </div>
                <Button primary className="flex items-center gap-2 group" onClick={() => setIsCreditFormOpen(!isCreditFormOpen)}>
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> Nuevo CrÃ©dito
                </Button>
            </div>

            {isCreditFormOpen && (
                <div className="bg-[var(--bg-card)] dark:bg-white/5 p-8 rounded-[2.5rem] border border-[var(--border-color)] dark:border-white/10 shadow-xl animate-scale-in relative overflow-hidden group backdrop-blur-md">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-accent/10 transition-all duration-700"></div>
                    <h4 className="text-lg font-black mb-8 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center text-white">
                            <Plus size={20} />
                        </div>
                        Registrar Nuevo CrÃ©dito Bancario
                    </h4>
                    <form onSubmit={handleSaveCredit} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-40 ml-1">Nombre del CrÃ©dito</label>
                            <input type="text" required value={creditName} onChange={e => setCreditName(e.target.value)} placeholder="Ej: CrÃ©dito Hipotecario" className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:border-accent transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-40 ml-1">Monto Inicial ($)</label>
                            <input type="number" required value={creditInitialBalance} onChange={e => setCreditInitialBalance(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0.00" className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-black outline-none focus:border-accent transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-40 ml-1">Tasa Anual (%)</label>
                            <input type="number" step="0.1" required value={creditAnnualRate} onChange={e => setCreditAnnualRate(e.target.value === '' ? '' : Number(e.target.value))} placeholder="21.0" className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-black text-accent outline-none focus:border-accent transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-40 ml-1">Fecha de Inicio</label>
                            <input type="date" required value={creditStartDate} onChange={e => setCreditStartDate(e.target.value)} className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:border-accent transition-all" />
                        </div>

                        {/* SECCIÃ“N DE ALERTAS DESTACADA */}
                        <div className="md:col-span-2 lg:col-span-2 space-y-2 bg-accent/5 p-5 rounded-3xl border border-accent/10">
                            <label className="text-[10px] font-black uppercase text-accent ml-1">DÃ­a de Corte (Radar de Alertas)</label>
                            <input 
                                type="number" 
                                min="1" max="31" 
                                value={creditCutoffDay} 
                                onChange={e => setCreditCutoffDay(e.target.value === '' ? '' : Number(e.target.value))} 
                                placeholder="Ej: 28" 
                                className="w-full bg-white dark:bg-white/5 border border-accent/20 rounded-2xl px-5 py-3 text-sm font-black outline-none focus:border-accent transition-all" 
                            />
                        </div>
                        <div className="md:col-span-2 lg:col-span-2 space-y-2 bg-accent/5 p-5 rounded-3xl border border-accent/10">
                            <label className="text-[10px] font-black uppercase text-accent ml-1">DÃ­a de Pago (Radar de Alertas)</label>
                            <input 
                                type="number" 
                                min="1" max="31" 
                                value={creditPaymentDay} 
                                onChange={e => setCreditPaymentDay(e.target.value === '' ? '' : Number(e.target.value))} 
                                placeholder="Ej: 5" 
                                className="w-full bg-white dark:bg-white/5 border border-accent/20 rounded-2xl px-5 py-3 text-sm font-black outline-none focus:border-accent transition-all" 
                            />
                        </div>

                        <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-4 pt-4 border-t border-[var(--border-color)]">

                            <Button outline type="button" onClick={() => setIsCreditFormOpen(false)}>Cancelar</Button>
                            <Button primary type="submit" loading={isSavingCredit}>Guardar CrÃ©dito</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* LISTA DE CRÃ‰DITOS (3 columnas en LG) */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {credits.length === 0 && !isCreditFormOpen && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-light-beige rounded-[3rem]">
                            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-300">
                                <TrendingDown size={40} />
                            </div>
                            <p className="text-neutral-400 font-bold uppercase tracking-widest text-sm">No tienes crÃ©ditos registrados</p>
                            <p className="text-xs text-neutral-300 mt-2">Usa el botÃ³n superior para aÃ±adir tu primer compromiso financiero.</p>
                        </div>
                    )}
                    {credits.map(credit => {
                        // ... (el mapeo de crÃ©ditos sigue igual)

                    const creditPayments = records.filter(r => 
                        (r.concept.toUpperCase().includes(credit.name.toUpperCase()) || 
                         r.description.toUpperCase().includes(credit.name.toUpperCase())) && 
                        Number(r.expense) > 0
                    );
                    
                    const totalPaid = creditPayments.reduce((acc, r) => acc + Number(r.expense), 0);
                    
                    const start = new Date(credit.start_date);
                    const today = new Date();
                    const dailyRate = (credit.annual_rate / 100) / 365;
                    
                    let currentBalance = credit.initial_balance;
                    let interestSinceLastPayment = 0;
                    const iterDate = new Date(start);

                    while (iterDate <= today) {
                        const dateStr = iterDate.toISOString().substring(0, 10);
                        const dayPayments = creditPayments.filter(p => p.date === dateStr);
                        const dayPaid = dayPayments.reduce((acc, p) => acc + Number(p.expense), 0);
                        
                        if (dayPaid > 0) {
                            currentBalance -= dayPaid;
                            interestSinceLastPayment = 0; 
                        }

                        iterDate.setDate(iterDate.getDate() + 1);

                        if (iterDate <= today) {
                            const dayInterest = currentBalance * dailyRate;
                            currentBalance += dayInterest;
                            interestSinceLastPayment += dayInterest;
                        }
                    }

                    const progress = Math.min(100, Math.max(0, ((credit.initial_balance - currentBalance) / credit.initial_balance) * 100));

                    return (
                        <div key={credit.id} className="bg-[var(--bg-card)] dark:bg-white/5 rounded-[3rem] p-10 border border-[var(--border-color)] dark:border-white/10 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => {
                                        setActiveCreditForPayment(credit);
                                        setIsCreditPaymentFormOpen(true);
                                    }}
                                    className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-sm"
                                    title="Abonar a Capital"
                                >
                                    <DollarSign size={18} />
                                </button>
                                <button onClick={() => handleDeleteCredit(credit.id, credit.name)} className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-14 h-14 rounded-2xl bg-[var(--text-primary)] dark:bg-white flex items-center justify-center text-accent dark:text-primary-dark shadow-inner">
                                    <DollarSign size={28} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter capitalize">{credit.name.toLowerCase()}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-accent uppercase tracking-widest">{credit.annual_rate}% Tasa Anual</span>
                                        <div className="w-1 h-1 rounded-full bg-[var(--border-color)] dark:bg-white/20"></div>
                                        <span className="text-[10px] font-bold text-neutral-400">Inicio: {formatDateLocal(credit.start_date)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-10">
                                <div className="bg-neutral-50/50 dark:bg-black/20 p-6 rounded-[2rem] border border-neutral-100 dark:border-white/5">
                                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-2">Saldo al DÃ­a</p>
                                    <p className="text-3xl font-black text-[var(--text-primary)] tracking-tighter">${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                                <div className="bg-orange-50/30 dark:bg-orange-900/10 p-6 rounded-[2rem] border border-orange-100 dark:border-orange-500/20 flex flex-col justify-center">
                                    <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1">Costo del Dinero</p>
                                    <p className="text-xl font-black text-[var(--text-primary)] tracking-tight mb-1">${interestSinceLastPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    <p className="text-[8px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-tighter">Intereses acumulados</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Barra de Libertad Financiera</span>
                                        <span className="text-sm font-black text-[var(--text-primary)]">{progress.toFixed(1)}% Liquidado</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-neutral-400 italic">Meta: $0.00</span>
                                </div>
                                <div className="w-full h-4 bg-neutral-50 dark:bg-black/40 rounded-full border border-neutral-100 dark:border-white/10 overflow-hidden p-1 shadow-inner">
                                    <div 
                                        className="h-full bg-gradient-to-r from-primary-dark to-accent rounded-full transition-all duration-1000 relative" 
                                        style={{ width: `${progress}%` }}
                                    >
                                        <div className="absolute top-0 right-0 w-full h-full bg-white/20 animate-pulse-subtle"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-[var(--border-color)] dark:border-white/10 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Monto Original</p>
                                    <p className="text-sm font-bold text-neutral-600 dark:text-neutral-400">${credit.initial_balance.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total Abonado</p>
                                    <p className="text-sm font-black text-green-600">${totalPaid.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
                </div>

                
                {/* LISTA LATERAL DE CUENTAS EXISTENTES (1 columna en LG) */}
                <div className="bg-[var(--bg-card)] dark:bg-white/5 rounded-[2.5rem] p-8 border border-[var(--border-color)] dark:border-white/10 h-fit sticky top-8 animate-fade-in shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Radar de Cuentas</h4>
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                    </div>
                    
                    <div className="space-y-3">
                        {paymentMethods.length === 0 ? (
                            <p className="text-[10px] text-neutral-400 italic text-center py-4">No hay cuentas registradas</p>
                        ) : (
                            paymentMethods.map(pm => (
                                <div key={pm.id} className="flex items-center justify-between p-4 bg-[var(--bg-main)] dark:bg-white/5 rounded-2xl border border-[var(--border-color)] dark:border-white/5 group hover:border-accent/30 transition-all hover:translate-x-1">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-primary-dark dark:text-white uppercase truncate max-w-[120px]">{pm.name}</span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                                            <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-tighter">Activa</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-[11px] font-black ${Number(pm.initial_balance) < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                            ${Math.abs(Number(pm.initial_balance)).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-[var(--border-color)] dark:border-white/5">
                        <p className="text-[8px] font-bold text-neutral-400 uppercase leading-relaxed">
                            Cualquier crÃ©dito nuevo se sincronizarÃ¡ automÃ¡ticamente con esta lista.
                        </p>
                    </div>
                </div>
            </div>


            {/* CREDIT PAYMENT MODAL */}
            {isCreditPaymentFormOpen && activeCreditForPayment && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-primary-dark/40 backdrop-blur-md" onClick={() => setIsCreditPaymentFormOpen(false)}></div>
                    <div className="bg-[var(--bg-card)] dark:bg-[#1a1a1a] w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-scale-in border border-[var(--border-color)] dark:border-white/10">
                        <h4 className="text-xl font-black text-[var(--text-primary)] mb-2 flex items-center gap-3">
                            <Plus size={24} className="text-accent" /> Registar Abono
                        </h4>
                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-8">
                            Pago directo a {activeCreditForPayment.name}
                        </p>
                        
                        <form onSubmit={handleSaveCreditPayment} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Monto del Pago ($)</label>
                                <input 
                                    type="number" 
                                    required 
                                    autoFocus
                                    value={paymentAmount} 
                                    onChange={e => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))} 
                                    placeholder="0.00" 
                                    className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-lg font-black text-[var(--text-primary)] outline-none focus:border-accent" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Fecha del Movimiento</label>
                                <input 
                                    type="date" 
                                    required 
                                    value={paymentDate} 
                                    onChange={e => setPaymentDate(e.target.value)} 
                                    className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-accent" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Forma de Pago (Origen)</label>
                                <div className="relative">
                                    <select 
                                        required 
                                        value={creditPaymentMethod} 
                                        onChange={e => setCreditPaymentMethod(e.target.value)} 
                                        className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-accent appearance-none cursor-pointer" 
                                    >
                                        {renderPaymentOptions()}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"><TrendingDown size={14} /></div>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button outline className="flex-1 py-4" onClick={() => setIsCreditPaymentFormOpen(false)}>Cancelar</Button>
                                <Button primary className="flex-1 py-4" type="submit" loading={isSavingPayment}>Confirmar Pago</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {ConfirmModal}
        </div>
    );
}

```

## File: src\components\portal\finance\CreditTracker.tsx
```tsx
import React, { useState } from 'react';
import { Plus, TrendingDown, DollarSign, Trash2 } from 'lucide-react';
import Button from '../../ui/Button';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../hooks/useConfirm';
import type { FinanceCredit, FinanceRecord, PaymentMethod } from '../../../types/finance';
import { formatDate } from '../../../utils/financeUtils';

interface CreditTrackerProps {
    userId: string;
    credits: FinanceCredit[];
    records: FinanceRecord[];
    paymentMethods: PaymentMethod[];
    onRefreshCredits: () => void;
    onRefreshRecords: () => void;
}

const CreditTracker: React.FC<CreditTrackerProps> = ({ 
    userId, 
    credits, 
    records, 
    paymentMethods, 
    onRefreshCredits, 
    onRefreshRecords 
}) => {
    const { confirm, ConfirmModal } = useConfirm();

    // Credit Tracker states
    const [isCreditFormOpen, setIsCreditFormOpen] = useState(false);
    const [creditName, setCreditName] = useState('');
    const [creditInitialBalance, setCreditInitialBalance] = useState<number | ''>('');
    const [creditAnnualRate, setCreditAnnualRate] = useState<number | ''>('');
    const [creditStartDate, setCreditStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [creditCutoffDay, setCreditCutoffDay] = useState<number | ''>('');
    const [creditPaymentDay, setCreditPaymentDay] = useState<number | ''>('');
    const [isSavingCredit, setIsSavingCredit] = useState(false);


    // Credit Payment Form states
    const [isCreditPaymentFormOpen, setIsCreditPaymentFormOpen] = useState(false);
    const [activeCreditForPayment, setActiveCreditForPayment] = useState<FinanceCredit | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [creditPaymentMethod, setCreditPaymentMethod] = useState('');
    const [isSavingPayment, setIsSavingPayment] = useState(false);

    const handleSaveCredit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingCredit(true);
        try {
            const { error } = await supabase
                .from('finance_credits')
                .insert([{
                    user_id: userId,
                    name: creditName,
                    initial_balance: Number(creditInitialBalance),
                    annual_rate: Number(creditAnnualRate),
                    start_date: creditStartDate,
                    cutoff_day: creditCutoffDay === '' ? null : Number(creditCutoffDay),
                    payment_day: creditPaymentDay === '' ? null : Number(creditPaymentDay)
                }]);


            if (error) throw error;
            onRefreshCredits();
            setCreditName('');
            setCreditInitialBalance('');
            setCreditAnnualRate('');
            setCreditStartDate(new Date().toISOString().split('T')[0]);
            setCreditCutoffDay('');
            setCreditPaymentDay('');
            setIsCreditFormOpen(false);

            toast.success('CrÃ©dito registrado correctamente.');
        } catch (error) {
            console.error('Error saving credit:', error);
            toast.error('Error al guardar el crÃ©dito.');
        } finally {
            setIsSavingCredit(false);
        }
    };

    const handleDeleteCredit = async (id: string) => {
        const ok = await confirm({
            title: 'Eliminar CrÃ©dito',
            message: 'Â¿Seguro que quieres eliminar este crÃ©dito? Se perderÃ¡ todo su historial de cÃ¡lculo.',
            confirmLabel: 'Eliminar',
            danger: true,
        });
        if (!ok) return;
        try {
            const { error } = await supabase
                .from('finance_credits')
                .delete()
                .eq('id', id);

            if (error) throw error;
            onRefreshCredits();
            toast.success('CrÃ©dito eliminado correctamente.');
        } catch (error) {
            console.error('Error deleting credit:', error);
            toast.error('No se pudo eliminar el crÃ©dito.');
        }
    };

    const handleSaveCreditPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeCreditForPayment) return;
        setIsSavingPayment(true);
        try {
            const { error } = await supabase
                .from('finance_records')
                .insert([{
                    user_id: userId,
                    concept: `PAGO CAPITAL: ${activeCreditForPayment.name.toUpperCase()}`,
                    date: paymentDate,
                    payment_method: creditPaymentMethod || 'Transferencia',
                    provider: 'Banco',
                    income: 0,
                    expense: Number(paymentAmount),
                    description: `Abono directo a capital: ${activeCreditForPayment.name}`,
                    expense_type: 'Deuda' // Automatically set to Deuda for payments
                }]);

            if (error) throw error;
            
            onRefreshRecords();
            setIsCreditPaymentFormOpen(false);
            setPaymentAmount('');
            setActiveCreditForPayment(null);
            toast.success(`Pago de $${Number(paymentAmount).toLocaleString()} registrado.`);
        } catch (error) {
            console.error('Error saving credit payment:', error);
            toast.error('No se pudo registrar el pago.');
        } finally {
            setIsSavingPayment(false);
        }
    };

    return (
        <div className="p-8 space-y-10 animate-fade-in text-[var(--text-primary)] w-full max-w-7xl mx-auto">
            <div className="flex justify-between items-center bg-accent/10 p-6 rounded-[2.5rem] border border-accent/10">
                <div>
                    <h3 className="text-2xl font-black tracking-tighter">GestiÃ³n de CrÃ©ditos</h3>
                    <p className="text-[10px] opacity-60 font-bold uppercase tracking-wider mt-1">Control de deudas y aceleraciÃ³n de libertad financiera</p>
                </div>
                <Button primary className="flex items-center gap-2 group" onClick={() => setIsCreditFormOpen(!isCreditFormOpen)}>
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> Nuevo CrÃ©dito
                </Button>
            </div>

            {isCreditFormOpen && (
                <div className="bg-[var(--bg-card)] dark:bg-white/5 p-8 rounded-[2.5rem] border border-[var(--border-color)] dark:border-white/10 shadow-xl animate-scale-in relative overflow-hidden group backdrop-blur-md">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-accent/10 transition-all duration-700"></div>
                    <h4 className="text-lg font-black mb-8 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center text-white">
                            <Plus size={20} />
                        </div>
                        Registrar Nuevo CrÃ©dito Bancario
                    </h4>
                    <form onSubmit={handleSaveCredit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-40 ml-1">Nombre del CrÃ©dito</label>
                            <input type="text" required value={creditName} onChange={e => setCreditName(e.target.value)} placeholder="Ej: CrÃ©dito Hipotecario" className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:border-accent transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-40 ml-1">Monto Inicial ($)</label>
                            <input type="number" required value={creditInitialBalance} onChange={e => setCreditInitialBalance(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0.00" className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-black outline-none focus:border-accent transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-40 ml-1">Tasa Anual (%)</label>
                            <input type="number" step="0.1" required value={creditAnnualRate} onChange={e => setCreditAnnualRate(e.target.value === '' ? '' : Number(e.target.value))} placeholder="21.0" className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-black text-accent outline-none focus:border-accent transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-40 ml-1">Fecha de Inicio</label>
                            <input type="date" required value={creditStartDate} onChange={e => setCreditStartDate(e.target.value)} className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:border-accent transition-all" />
                        </div>

                        {/* SECCIÃ“N DE ALERTAS DESTACADA */}
                        <div className="md:col-span-2 lg:col-span-2 space-y-2 bg-accent/5 p-5 rounded-3xl border border-accent/10">
                            <label className="text-[10px] font-black uppercase text-accent ml-1">DÃ­a de Corte (Radar de Alertas)</label>
                            <input 
                                type="number" 
                                min="1" max="31" 
                                value={creditCutoffDay} 
                                onChange={e => setCreditCutoffDay(e.target.value === '' ? '' : Number(e.target.value))} 
                                placeholder="Ej: 28" 
                                className="w-full bg-white dark:bg-white/5 border border-accent/20 rounded-2xl px-5 py-3 text-sm font-black outline-none focus:border-accent transition-all" 
                            />
                        </div>
                        <div className="md:col-span-2 lg:col-span-2 space-y-2 bg-accent/5 p-5 rounded-3xl border border-accent/10">
                            <label className="text-[10px] font-black uppercase text-accent ml-1">DÃ­a de Pago (Radar de Alertas)</label>
                            <input 
                                type="number" 
                                min="1" max="31" 
                                value={creditPaymentDay} 
                                onChange={e => setCreditPaymentDay(e.target.value === '' ? '' : Number(e.target.value))} 
                                placeholder="Ej: 5" 
                                className="w-full bg-white dark:bg-white/5 border border-accent/20 rounded-2xl px-5 py-3 text-sm font-black outline-none focus:border-accent transition-all" 
                            />
                        </div>
                        
                        <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-4 pt-4 border-t border-[var(--border-color)] dark:border-white/5">
                            <Button outline type="button" onClick={() => setIsCreditFormOpen(false)}>Cancelar</Button>
                            <Button primary type="submit" loading={isSavingCredit}>Guardar CrÃ©dito</Button>
                        </div>
                    </form>

                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {credits.length === 0 && !isCreditFormOpen && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-[var(--border-color)] dark:border-white/10 rounded-[3rem]">
                        <div className="w-20 h-20 bg-[var(--bg-main)] dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-300">
                            <TrendingDown size={40} />
                        </div>
                        <p className="text-neutral-400 font-bold uppercase tracking-widest text-sm">No tienes crÃ©ditos registrados</p>
                        <p className="text-xs text-neutral-400/60 mt-2">Usa el botÃ³n superior para aÃ±adir tu primer compromiso financiero.</p>
                    </div>
                )}
                {credits.map(credit => {
                    // LÃ³gica de cÃ¡lculo DIARIO para la UI
                    const creditPayments = records.filter(r => 
                        (r.concept.toUpperCase().includes(credit.name.toUpperCase()) || 
                         r.description.toUpperCase().includes(credit.name.toUpperCase())) && 
                        Number(r.expense) > 0
                    );
                    
                    const totalPaid = creditPayments.reduce((acc, r) => acc + Number(r.expense), 0);
                    
                    // FECHAS CLAVE
                    const start = new Date(credit.start_date);
                    const today = new Date();
                    
                    // Tasa diaria
                    const dailyRate = (credit.annual_rate / 100) / 365;
                    
                    // CÃ¡lculo Progresivo DÃ­a a DÃ­a
                    let currentBalance = credit.initial_balance;
                    let interestSinceLastPayment = 0;
                    let iterDate = new Date(start);

                    // Iterar dÃ­a por dÃ­a desde el inicio hasta hoy
                    while (iterDate <= today) {
                        const dateStr = iterDate.toISOString().substring(0, 10);
                        
                        // 1. Restar pagos realizados este dÃ­a especÃ­fico 
                        const dayPayments = creditPayments.filter(p => p.date === dateStr);
                        const dayPaid = dayPayments.reduce((acc, p) => acc + Number(p.expense), 0);
                        
                        if (dayPaid > 0) {
                            currentBalance -= dayPaid;
                            interestSinceLastPayment = 0; 
                        }

                        // Avanzar un dÃ­a
                        iterDate.setDate(iterDate.getDate() + 1);

                        // 2. Aplicar interÃ©s del nuevo dÃ­a sobre el saldo insoluto (si aÃºn no llegamos al futuro)
                        if (iterDate <= today) {
                            const dayInterest = currentBalance * dailyRate;
                            currentBalance += dayInterest;
                            interestSinceLastPayment += dayInterest;
                        }
                    }

                    const progress = Math.min(100, Math.max(0, ((credit.initial_balance - currentBalance) / credit.initial_balance) * 100));

                    return (
                        <div key={credit.id} className="bg-[var(--bg-card)] dark:bg-white/5 rounded-[3rem] p-10 border border-[var(--border-color)] dark:border-white/10 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => {
                                        setActiveCreditForPayment(credit);
                                        setIsCreditPaymentFormOpen(true);
                                    }}
                                    className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-sm"
                                    title="Abonar a Capital"
                                >
                                    <DollarSign size={18} />
                                </button>
                                <button onClick={() => handleDeleteCredit(credit.id)} className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-14 h-14 rounded-2xl bg-primary-dark flex items-center justify-center text-accent shadow-inner">
                                    <DollarSign size={28} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-primary-dark tracking-tighter capitalize">{credit.name.toLowerCase()}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-accent uppercase tracking-widest">{credit.annual_rate}% Tasa Anual</span>
                                        <div className="w-1 h-1 rounded-full bg-neutral-200 dark:bg-white/10"></div>
                                        <span className="text-[10px] font-bold text-neutral-400">Inicio: {formatDate(credit.start_date)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-10">
                                <div className="bg-[var(--bg-main)] dark:bg-white/5 p-6 rounded-[2rem] border border-[var(--border-color)] dark:border-white/5">
                                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-2">Saldo al DÃ­a</p>
                                    <p className="text-3xl font-black text-primary-dark tracking-tighter">${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                                <div className="bg-orange-500/10 dark:bg-orange-500/5 p-6 rounded-[2rem] border border-orange-500/20 flex flex-col justify-center">
                                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1">Costo del Dinero</p>
                                    <p className="text-xl font-black text-primary-dark tracking-tight mb-1">${interestSinceLastPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    <p className="text-[8px] text-orange-600/70 font-bold uppercase tracking-tighter">Intereses acumulados</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Barra de Libertad Financiera</span>
                                        <span className="text-sm font-black text-primary-dark">{progress.toFixed(1)}% Liquidado</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-neutral-400 italic">Meta: $0.00</span>
                                </div>
                                <div className="w-full h-4 bg-[var(--bg-main)] dark:bg-white/5 rounded-full border border-[var(--border-color)] dark:border-white/5 overflow-hidden p-1 shadow-inner">
                                    <div 
                                        className="h-full bg-gradient-to-r from-primary-dark to-accent rounded-full transition-all duration-1000 relative" 
                                        style={{ width: `${progress}%` }}
                                    >
                                        <div className="absolute top-0 right-0 w-full h-full bg-white/20 animate-pulse-subtle"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-[var(--border-color)] dark:border-white/10 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Monto Original</p>
                                    <p className="text-sm font-bold text-neutral-500">${credit.initial_balance.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total Abonado</p>
                                    <p className="text-sm font-black text-green-500">${totalPaid.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CREDIT PAYMENT MODAL */}
            {isCreditPaymentFormOpen && activeCreditForPayment && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in text-[var(--text-primary)]">
                    <div className="absolute inset-0 bg-primary-dark/40 backdrop-blur-md" onClick={() => setIsCreditPaymentFormOpen(false)}></div>
                    <div className="bg-[var(--bg-card)] w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-scale-in border border-[var(--border-color)]">
                        <h4 className="text-xl font-black mb-2 flex items-center gap-3">
                            <Plus size={24} className="text-accent" /> Registrar Abono
                        </h4>
                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-8">
                            Pago directo a {activeCreditForPayment.name}
                        </p>
                        
                        <form onSubmit={handleSaveCreditPayment} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Monto del Pago ($)</label>
                                <input 
                                    type="number" 
                                    required 
                                    autoFocus
                                    value={paymentAmount} 
                                    onChange={e => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))} 
                                    placeholder="0.00" 
                                    className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-lg font-black outline-none focus:border-accent" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Fecha del Movimiento</label>
                                <input 
                                    type="date" 
                                    required 
                                    value={paymentDate} 
                                    onChange={e => setPaymentDate(e.target.value)} 
                                    className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-accent" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Forma de Pago (Origen)</label>
                                <div className="relative">
                                    <select 
                                        required 
                                        value={creditPaymentMethod} 
                                        onChange={e => setCreditPaymentMethod(e.target.value)} 
                                        className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-accent appearance-none cursor-pointer" 
                                    >
                                        <option value="">Selecciona cuenta origen...</option>
                                        {paymentMethods.map((pm) => (
                                            <option key={pm.id} value={pm.name}>{pm.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"><TrendingDown size={14} /></div>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4 border-t border-[var(--border-color)] dark:border-white/5">
                                <Button outline className="flex-1 py-4" onClick={() => setIsCreditPaymentFormOpen(false)}>Cancelar</Button>
                                <Button primary className="flex-1 py-4 shadow-lg shadow-accent/20" type="submit" loading={isSavingPayment}>Confirmar Pago</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {ConfirmModal}
        </div>
    );
};

export default CreditTracker;

```

## File: src\components\portal\finance\DashboardView.tsx
```tsx
import React, { useMemo, useRef } from 'react';
import { 
    Target, 
    ArrowUpRight, Wallet, PieChart, 
    Activity, AlertTriangle, TrendingUp,
    ChevronLeft, ChevronRight, Plus
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
    PieChart as RePieChart, Pie
} from 'recharts';
import type { FinanceRecord, FinanceGoal, FinanceCredit, PaymentMethod } from '../../../types/finance';
import { COLORS } from '../../../utils/financeUtils';

interface DashboardViewProps {
    records: FinanceRecord[];
    goals: FinanceGoal[];
    credits: FinanceCredit[];
    selectedMonth: string;
    summaryData: {concept: string, income: number, expense: number}[];
    uniqueMonths: {label: string, value: string}[];
    paymentMethods: PaymentMethod[];
    budgets: any[];
}


const DashboardView: React.FC<DashboardViewProps> = ({ 
    records, goals, credits, selectedMonth, 
    summaryData, paymentMethods, budgets
}) => {

    const scrollRef = useRef<HTMLDivElement>(null);
    
    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - 300 : scrollLeft + 300;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };
    
    // 1. CÃ¡lculos de KPIs principales
    const stats = useMemo(() => {
        const today = new Date();
        const currentMonth = selectedMonth === 'all' 
            ? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
            : selectedMonth;

        const filtered = records.filter(r => {
            const rMonth = r.date.includes('/') ? r.date.split('/').reverse().join('-').substring(0, 7) : r.date.substring(0, 7);
            const c = (r.concept || '').toUpperCase().trim();
            const type = (r.expense_type || '').toUpperCase().trim();
            const isInternal = c === 'SALDO INICIAL' || c.includes('TRASPASO') || type === 'TRASPASO';
            return (selectedMonth === 'all' || rMonth === currentMonth) && !isInternal;
        });

        const income = filtered.reduce((acc, r) => acc + (Number(r.income) || 0), 0);
        const expense = filtered.reduce((acc, r) => acc + (Number(r.expense) || 0), 0);
        const balance = income - expense;
        const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
        
        const totalDebt = credits.reduce((acc, c) => acc + (c.initial_balance || 0), 0); 
        
        return { income, expense, balance, savingsRate, totalDebt };
    }, [records, selectedMonth, credits]);

    // 1.5 CÃ¡lculos Analizador 50/30/20 y Salud
    const healthAndBudget = useMemo(() => {
        const currentMonth = selectedMonth === 'all' ? '' : selectedMonth;
        const filtered = records.filter(r => {
            const rMonth = r.date.includes('/') ? r.date.split('/').reverse().join('-').substring(0, 7) : r.date.substring(0, 7);
            const c = (r.concept || '').toUpperCase().trim();
            const type = (r.expense_type || '').toUpperCase().trim();
            const isInternal = c === 'SALDO INICIAL' || c.includes('TRASPASO') || type === 'TRASPASO';
            return (selectedMonth === 'all' || rMonth.startsWith(currentMonth)) && !isInternal;
        });

        const totalIncome = filtered.reduce((acc, r) => acc + (Number(r.income) || 0), 0);
        const totalExpense = filtered.reduce((acc, r) => acc + (Number(r.expense) || 0), 0);

        let healthStatus: 'healthy' | 'warning' | 'danger' = 'healthy';
        const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
        
        if (totalExpense > 0 && totalIncome === 0) {
            healthStatus = 'danger';
        } else if (expenseRatio >= 90) {
            healthStatus = 'danger';
        } else if (expenseRatio >= 75) {
            healthStatus = 'warning';
        }

        let needs = 0; // Fijo
        let wants = 0; // Variable
        let savingsDebt = 0; // Ahorro, Deuda

        filtered.filter(r => Number(r.expense) > 0).forEach(r => {
            const type = r.expense_type;
            const amount = Number(r.expense) || 0;
            if (type === 'Fijo') needs += amount;
            else if (type === 'Ahorro' || type === 'Deuda') savingsDebt += amount;
            else wants += amount; // Variable, default
        });

        const needsRatio = totalIncome > 0 ? (needs / totalIncome) * 100 : 0;
        const wantsRatio = totalIncome > 0 ? (wants / totalIncome) * 100 : 0;
        const savingsDebtRatio = totalIncome > 0 ? (savingsDebt / totalIncome) * 100 : 0;

        return {
            healthStatus,
            expenseRatio,
            needs, needsRatio,
            wants, wantsRatio,
            savingsDebt, savingsDebtRatio
        };
    }, [records, selectedMonth]);

    // 2. Datos para la GrÃ¡fica de Rendimiento (Ãšltimos 6 meses)
    const chartData = useMemo(() => {
        const last6Months = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleDateString('es-ES', { month: 'short' });
            
            const monthRecords = records.filter(r => {
                const rMonth = r.date.includes('/') ? r.date.split('/').reverse().join('-').substring(0, 7) : r.date.substring(0, 7);
                const c = (r.concept || '').toUpperCase().trim();
                const type = (r.expense_type || '').toUpperCase().trim();
                const isInternal = c === 'SALDO INICIAL' || c.includes('TRASPASO') || type === 'TRASPASO';
                return rMonth === monthStr && !isInternal;
            });

            const income = monthRecords.reduce((acc, r) => acc + (Number(r.income) || 0), 0);
            const expense = monthRecords.reduce((acc, r) => acc + (Number(r.expense) || 0), 0);

            last6Months.push({ 
                name: label, 
                fullMonthName: d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
                monthKey: monthStr,
                ingresos: income, 
                gastos: expense 
            });
        }
        return last6Months;
    }, [records]);

    // 3. DistribuciÃ³n por CategorÃ­a (Top 5)
    const categoryData = useMemo(() => {
        const currentMonth = selectedMonth === 'all' ? '' : selectedMonth;
        const filtered = records.filter(r => {
            const rMonth = r.date.includes('/') ? r.date.split('/').reverse().join('-').substring(0, 7) : r.date.substring(0, 7);
            const c = (r.concept || '').toUpperCase().trim();
            const type = (r.expense_type || '').toUpperCase().trim();
            const isInternal = c === 'SALDO INICIAL' || c.includes('TRASPASO') || type === 'TRASPASO';
            return (selectedMonth === 'all' || rMonth === currentMonth) && Number(r.expense) > 0 && !isInternal;
        });

        const catMap: Record<string, number> = {};
        filtered.forEach(r => {
            const cat = r.expense_type || 'Otros';
            catMap[cat] = (catMap[cat] || 0) + Number(r.expense);
        });

        return Object.entries(catMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }));
    }, [records, selectedMonth]);

    // 4. CÃ¡lculo de Saldos de Cuentas (Sincronizado con FinanceTracker)
    const accountBalances = useMemo(() => {
        const paymentMap: Record<string, number> = {};
        
        // Ordenar cronolÃ³gicamente para manejar correctamente el SALDO INICIAL
        const sortedRecords = [...records].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateA !== dateB) return dateA - dateB;
            return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        });

        sortedRecords.forEach(r => {
            const pm = (r.payment_method || 'SIN ESPECIFICAR').toUpperCase().trim();
            const isInitial = (r.concept || '').toUpperCase().trim() === 'SALDO INICIAL';
            const val = (Number(r.income) || 0) - (Number(r.expense) || 0);

            if (isInitial) {
                paymentMap[pm] = val;
            } else {
                paymentMap[pm] = (paymentMap[pm] || 0) + val;
            }
        });

        // Filtrar solo las cuentas que estÃ¡n registradas oficialmente
        const registeredNames = new Set(paymentMethods.map(pm => pm.name.toUpperCase().trim()));

        return Object.entries(paymentMap)
            .filter(([name]) => registeredNames.has(name))
            .map(([name, balance]) => ({ name, balance }))
            .sort((a, b) => b.balance - a.balance);
    }, [records, paymentMethods]);
    
    // 6. Sistema de Alertas Proactivas
    const alerts = useMemo(() => {
        const today = new Date();
        const todayDay = today.getDate();
        const list: any[] = [];

        // Alertas de CrÃ©dito
        credits.forEach(c => {
            if (c.cutoff_day) {
                const diff = (c.cutoff_day - todayDay + 31) % 31;
                if (diff >= 0 && diff <= 3) {
                    list.push({
                        id: `cutoff-${c.id}`,
                        type: 'cutoff',
                        title: `Corte de ${c.name}`,
                        desc: diff === 0 ? 'Â¡Es hoy!' : `Faltan ${diff} ${diff === 1 ? 'dÃ­a' : 'dÃ­as'}`,
                        priority: diff === 0 ? 'high' : 'medium'
                    });
                }
            }
            if (c.payment_day) {
                const diff = (c.payment_day - todayDay + 31) % 31;
                if (diff >= 0 && diff <= 5) {
                    list.push({
                        id: `payment-${c.id}`,
                        type: 'payment',
                        title: `Pago de ${c.name}`,
                        desc: diff === 0 ? 'Vence hoy' : diff === 1 ? 'Vence maÃ±ana' : `Vence en ${diff} dÃ­as`,
                        priority: diff <= 1 ? 'high' : 'medium'
                    });
                }
            }
        });

        // Alertas de Cuentas (Tarjetas de crÃ©dito registradas como cuenta)
        paymentMethods.forEach(pm => {
            if (pm.cutoff_day) {
                const diff = (pm.cutoff_day - todayDay + 31) % 31;
                if (diff >= 0 && diff <= 3) {
                    list.push({
                        id: `pm-cutoff-${pm.id}`,
                        type: 'cutoff',
                        title: `Corte de ${pm.name}`,
                        desc: diff === 0 ? 'Â¡Es hoy!' : `Faltan ${diff} ${diff === 1 ? 'dÃ­a' : 'dÃ­as'}`,
                        priority: diff === 0 ? 'high' : 'medium'
                    });
                }
            }
            if (pm.payment_day) {
                const diff = (pm.payment_day - todayDay + 31) % 31;
                if (diff >= 0 && diff <= 5) {
                    list.push({
                        id: `pm-payment-${pm.id}`,
                        type: 'payment',
                        title: `Pago de ${pm.name}`,
                        desc: diff === 0 ? 'Vence hoy' : diff === 1 ? 'Vence maÃ±ana' : `Vence en ${diff} dÃ­as`,
                        priority: diff <= 1 ? 'high' : 'medium'
                    });
                }
            }
        });

        // Alertas de Presupuesto (Sueldos, Rentas, etc)
        budgets.forEach(b => {
            if (b.due_day) {
                const days = b.due_day.split(',').map((d: string) => parseInt(d.trim())).filter((d: number) => !isNaN(d));
                days.forEach((day: number) => {
                    const diff = (day - todayDay + 31) % 31;
                    if (diff >= 0 && diff <= 3) {
                        list.push({
                            id: `budget-${b.id}-${day}`,
                            type: b.budget_category === 'income' ? 'income' : 'expense',
                            title: b.concept,
                            desc: diff === 0 ? 'Programado para hoy' : `En ${diff} dÃ­as`,
                            priority: diff === 0 ? 'high' : 'low'
                        });
                    }
                });
            }
        });

        return list.sort((a, b) => {
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (a.priority !== 'high' && b.priority === 'high') return 1;
            return 0;
        });

    }, [credits, budgets, paymentMethods]);



    // 5. LÃ³gica de Resumen (Integrada)
    const totalExpenses = summaryData.reduce((a, b) => a + b.expense, 0);
    const totalIncome = summaryData.reduce((a, b) => a + b.income, 0);
    
    const topExpenseData = [...summaryData].sort((a,b) => b.expense - a.expense)[0];
    const topExpenseConcept = topExpenseData?.expense > 0 ? topExpenseData.concept : null;
    const topExpenseAmount = topExpenseData?.expense > 0 ? topExpenseData.expense : 0;
    const topExpensePercentage = totalExpenses > 0 ? (topExpenseAmount / totalExpenses) * 100 : 0;

    const [selectedPoint, setSelectedPoint] = React.useState<any>(null);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">{payload[0].payload.fullMonthName}</p>
                    <div className="space-y-1">
                        <p className="text-sm font-black text-green-400">â†‘ ${Number(payload[0].value).toLocaleString()}</p>
                        <p className="text-sm font-black text-red-400">â†“ ${Number(payload[1].value).toLocaleString()}</p>
                    </div>
                    <p className="text-[8px] font-bold text-white/40 mt-2 uppercase tracking-tighter">Click para ver detalle</p>
                </div>
            );
        }
        return null;
    };

    const handleChartClick = (data: any) => {
        if (data && data.activePayload && data.activePayload.length) {
            const pointData = data.activePayload[0].payload;
            setSelectedPoint(pointData);
        }
    };

    return (
        <div className="p-8 space-y-8 animate-fade-in text-[var(--text-primary)]">
            
            {/* 0. Radar de Alertas Vigilante */}
            {alerts.length > 0 && (
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 animate-slide-down">
                    {alerts.map(alert => (
                        <div key={alert.id} className={`min-w-[280px] p-4 rounded-[2rem] border flex items-center gap-4 transition-all hover:scale-[1.02] shadow-sm ${
                            alert.priority === 'high' 
                                ? 'bg-red-500/10 border-red-500/30' 
                                : alert.priority === 'medium'
                                ? 'bg-amber-500/10 border-amber-500/30'
                                : 'bg-blue-500/10 border-blue-500/30'
                        }`}>
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                                alert.priority === 'high' ? 'bg-red-500 text-white' : 
                                alert.priority === 'medium' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                            }`}>
                                {alert.type === 'cutoff' ? <PieChart size={18} /> : 
                                 alert.type === 'payment' ? <Wallet size={18} /> : 
                                 alert.type === 'income' ? <ArrowUpRight size={18} /> : <AlertTriangle size={18} />}
                            </div>
                            <div>
                                <h5 className="text-xs font-black uppercase tracking-tight truncate max-w-[150px]">{alert.title}</h5>
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${
                                    alert.priority === 'high' ? 'text-red-600' : 
                                    alert.priority === 'medium' ? 'text-amber-600' : 'text-blue-600'
                                }`}>{alert.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {/* 1. Liquidity List (Top priority for decision making) */}
            <div className="w-full bg-white/30 dark:bg-white/5 rounded-[2.5rem] p-6 border border-white/20 dark:border-white/10 shadow-sm backdrop-blur-xl group">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <Wallet size={18} className="text-accent" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Liquidez por Cuenta</h4>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => scroll('left')} className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-sm">
                            <ChevronLeft size={16} />
                        </button>
                        <button onClick={() => scroll('right')} className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-sm">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
                <div 
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth"
                >
                    {accountBalances.length > 0 ? (
                        accountBalances.map((acc, i) => (
                            <div key={i} className="min-w-[180px] bg-[var(--bg-card)] dark:bg-white/10 p-5 rounded-3xl border border-[var(--border-color)] dark:border-white/10 shadow-sm group/card hover:-translate-y-1 transition-all">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 group-hover/card:text-accent transition-colors">{acc.name}</p>
                                <p className="text-lg font-black tracking-tighter">${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-xs font-bold opacity-30 uppercase tracking-widest">No hay cuentas registradas con movimientos</div>
                    )}
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                
                {/* --- ROW 1: KPI Cards (4 items x 3 cols = 12 cols) --- */}
                   {/* Card 1: SemÃ¡foro de Salud Financiera */}
                <div className={`lg:col-span-3 rounded-[2.5rem] p-7 border shadow-sm backdrop-blur-xl relative group overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between ${
                    healthAndBudget.healthStatus === 'danger' 
                        ? 'bg-red-500/5 border-red-500/20' 
                        : healthAndBudget.healthStatus === 'warning'
                        ? 'bg-amber-500/5 border-amber-500/20'
                        : 'bg-emerald-500/5 border-emerald-500/20'
                }`}>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] opacity-40 text-[var(--text-primary)]">Salud Financiera</span>
                            <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_15px_rgba(0,0,0,0.2)] ${
                                healthAndBudget.healthStatus === 'danger' ? 'bg-red-500' : 
                                healthAndBudget.healthStatus === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}></div>
                        </div>
                        <h4 className={`text-4xl font-black tracking-tighter mb-2 ${
                            healthAndBudget.healthStatus === 'danger' ? 'text-red-600' : 
                            healthAndBudget.healthStatus === 'warning' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                            {healthAndBudget.healthStatus === 'danger' ? 'CrÃ­tica' : healthAndBudget.healthStatus === 'warning' ? 'Alerta' : 'Ã“ptima'}
                        </h4>
                        <p className="text-xs font-bold opacity-40 text-[var(--text-primary)]">
                            {healthAndBudget.expenseRatio > 0 
                                ? `UtilizaciÃ³n: ${healthAndBudget.expenseRatio.toFixed(1)}%`
                                : 'Sin actividad'}
                        </p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                        <Activity size={120} />
                    </div>
                </div>

                {/* Card 2: Capacidad de Ahorro */}
                <div className="lg:col-span-3 bg-[#0f172a] dark:bg-white/[0.03] rounded-[2.5rem] p-7 text-white shadow-2xl relative overflow-hidden group flex flex-col justify-between hover:shadow-blue-500/10 transition-all duration-500 border border-white/5">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Capacidad de Ahorro</p>
                        <div className="flex items-baseline gap-2">
                            <h4 className="text-5xl font-black tracking-tighter">{stats.savingsRate.toFixed(0)}%</h4>
                            <span className="text-xs font-bold opacity-40">de margen</span>
                        </div>
                    </div>
                    <div className="relative z-10 mt-6">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest mb-2 opacity-40">
                            <span>Eficiencia</span>
                            <span>{stats.savingsRate > 20 ? 'Excelente' : 'Mejorable'}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                                style={{ width: `${Math.min(100, stats.savingsRate)}%` }}
                            ></div>
                        </div>
                    </div>
                    {/* Abstract background element */}
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-600/20 rounded-full blur-[60px] group-hover:bg-blue-600/30 transition-colors duration-700"></div>
                </div>

                {/* Card 3: Entradas de Capital */}
                <div className="lg:col-span-3 bg-[var(--bg-card)] dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-6 border border-[var(--border-color)] dark:border-white/10 shadow-sm flex flex-col">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2 mb-2">
                        <TrendingUp size={14} className="text-green-500" /> Ingresos
                    </h4>
                    <p className="text-xl font-heading font-black text-[var(--text-primary)] mb-2">
                        ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex-1 h-[80px] w-full relative">
                        {summaryData.filter(d => d.income > 0).length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie 
                                        data={summaryData.filter(d => d.income > 0).sort((a,b) => b.income - a.income)} 
                                        dataKey="income" 
                                        nameKey="concept" 
                                        cx="50%" cy="50%" 
                                        innerRadius={25} 
                                        outerRadius={40} 
                                        paddingAngle={5}
                                        stroke="none"
                                    >
                                        {summaryData.filter(d => d.income > 0).map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </RePieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-neutral-300 text-[10px] font-black uppercase tracking-widest">Sin ingresos</div>
                        )}
                    </div>
                </div>

                {/* Card 4: Mayor Gasto */}
                <div className="lg:col-span-3 bg-[var(--bg-card)] dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-6 border border-[var(--border-color)] dark:border-white/10 shadow-sm relative group overflow-hidden flex flex-col">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[50px] group-hover:bg-red-500/10 transition-all duration-500"></div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2 mb-2">
                        <AlertTriangle size={14} className="text-red-500" /> Mayor Gasto
                    </h4>
                    
                    {topExpenseConcept ? (
                        <div className="flex flex-col justify-between flex-1">
                            <div>
                                <p className="text-xl font-black font-heading text-[var(--text-primary)] leading-tight mb-1 capitalize truncate" title={topExpenseConcept}>
                                    {topExpenseConcept.toLowerCase()}
                                </p>
                                <p className="text-sm font-bold text-red-500">
                                    ${topExpenseAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            
                            <div className="mt-auto pt-4 flex items-center gap-3">
                                <div className="flex-1">
                                    <div className="w-full h-1.5 bg-red-500/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${topExpensePercentage}%` }}></div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-red-500">{topExpensePercentage.toFixed(0)}%</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center opacity-30 py-4 flex-1">
                            <Target size={24} />
                            <p className="text-[10px] uppercase tracking-widest font-bold mt-2">Sin gastos</p>
                        </div>
                    )}
                </div>

                {/* --- ROW 2: Charts (8 + 4) --- */}
                
                {/* Main Performance Chart */}
                <div className="lg:col-span-8 bg-white dark:bg-white/5 rounded-[3rem] p-8 md:p-10 border border-[var(--border-color)] dark:border-white/10 shadow-sm backdrop-blur-xl relative overflow-hidden group">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500">
                                    <Activity size={18} />
                                </div>
                                <h3 className="text-2xl font-black tracking-tighter">Tendencia Mensual</h3>
                            </div>
                            <p className="text-xs font-bold opacity-30 uppercase tracking-[0.1em] ml-11">Comparativa semestral de flujo de caja</p>
                        </div>
                        <div className="flex bg-neutral-100 dark:bg-white/5 p-1.5 rounded-2xl gap-2">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-white/10 shadow-sm">
                                <div className="w-2.5 h-2.5 rounded-full bg-sky-500"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Ingresos</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Gastos</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-[320px] w-full relative z-10 ml-[-20px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} onClick={handleChartClick} style={{ cursor: 'pointer' }}>
                                <defs>
                                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fb7185" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.03} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fontWeight: 900, opacity: 0.3}} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fontWeight: 900, opacity: 0.3}}
                                    tickFormatter={(val) => `$${val/1000}k`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="ingresos" 
                                    stroke="#0ea5e9" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorIngresos)" 
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#0ea5e9' }} 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="gastos" 
                                    stroke="#fb7185" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorGastos)" 
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#fb7185' }} 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Analizador 50/30/20 Vertical */}
                <div className="lg:col-span-4 bg-[var(--bg-card)] dark:bg-white/5 rounded-[2.5rem] p-6 md:p-8 border border-[var(--border-color)] dark:border-white/10 shadow-sm backdrop-blur-md relative overflow-hidden group flex flex-col">
                    <div className="flex items-center gap-3 mb-8 relative z-10">
                        <Target size={20} className="text-blue-500" />
                        <div>
                            <h3 className="text-lg font-black">Regla 50/30/20</h3>
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">DistribuciÃ³n Ideal vs Realidad</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6 relative z-10 flex-1 flex flex-col justify-center">
                        {/* Necesidades 50% */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-black uppercase tracking-wider">Necesidades</span>
                                <span className={`text-[10px] font-black ${healthAndBudget.needsRatio > 50 ? 'text-red-500' : 'text-neutral-400'}`}>
                                    {healthAndBudget.needsRatio.toFixed(1)}% / 50%
                                </span>
                            </div>
                            <div className="h-2.5 w-full bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden relative">
                                <div className="absolute top-0 bottom-0 border-r-2 border-neutral-300 dark:border-neutral-500 z-10" style={{ left: '50%' }}></div>
                                <div className={`h-full rounded-full transition-all duration-1000 ${healthAndBudget.needsRatio > 50 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, healthAndBudget.needsRatio)}%` }}></div>
                            </div>
                            <p className="text-[10px] font-bold text-neutral-400">${healthAndBudget.needs.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        </div>

                        {/* Deseos 30% */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-black uppercase tracking-wider">Deseos</span>
                                <span className={`text-[10px] font-black ${healthAndBudget.wantsRatio > 30 ? 'text-amber-500' : 'text-neutral-400'}`}>
                                    {healthAndBudget.wantsRatio.toFixed(1)}% / 30%
                                </span>
                            </div>
                            <div className="h-2.5 w-full bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden relative">
                                <div className="absolute top-0 bottom-0 border-r-2 border-neutral-300 dark:border-neutral-500 z-10" style={{ left: '30%' }}></div>
                                <div className={`h-full rounded-full transition-all duration-1000 ${healthAndBudget.wantsRatio > 30 ? 'bg-amber-500' : 'bg-purple-500'}`} style={{ width: `${Math.min(100, healthAndBudget.wantsRatio)}%` }}></div>
                            </div>
                            <p className="text-[10px] font-bold text-neutral-400">${healthAndBudget.wants.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        </div>

                        {/* Ahorro/Deuda 20% */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-black uppercase tracking-wider">Ahorro / Deudas</span>
                                <span className={`text-[10px] font-black ${healthAndBudget.savingsDebtRatio < 20 ? 'text-amber-500' : 'text-green-500'}`}>
                                    {healthAndBudget.savingsDebtRatio.toFixed(1)}% / 20%
                                </span>
                            </div>
                            <div className="h-2.5 w-full bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden relative">
                                <div className="absolute top-0 bottom-0 border-r-2 border-neutral-300 dark:border-neutral-500 z-10" style={{ left: '20%' }}></div>
                                <div className={`h-full rounded-full transition-all duration-1000 ${healthAndBudget.savingsDebtRatio < 20 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, healthAndBudget.savingsDebtRatio)}%` }}></div>
                            </div>
                            <p className="text-[10px] font-bold text-neutral-400">${healthAndBudget.savingsDebt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -mr-32 -mb-32"></div>
                </div>

                {/* --- ROW 3: Details (6 + 6) --- */}

                {/* Gastos por Tipo (BARRAS) */}
                <div className="lg:col-span-6 bg-[var(--bg-card)] dark:bg-white/5 rounded-[2.5rem] p-6 md:p-8 border border-[var(--border-color)] dark:border-white/10 shadow-sm backdrop-blur-md relative">
                    <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                        <PieChart size={20} className="text-purple-500" />
                        DistribuciÃ³n de Gastos
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fontWeight: 900, fill: 'currentColor', opacity: 0.5}}
                                />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                                    {categoryData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Goals Preview */}
                <div className="lg:col-span-6 bg-[var(--bg-card)] dark:bg-white/5 rounded-[2.5rem] p-6 md:p-8 border border-[var(--border-color)] dark:border-white/10 shadow-sm backdrop-blur-md overflow-hidden relative group">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-black flex items-center gap-3">
                                <Target size={20} className="text-amber-500" />
                                Avance de Metas
                            </h3>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        {goals.length === 0 ? (
                            <div className="py-12 text-center opacity-30 italic text-sm font-bold uppercase tracking-widest">Sin metas</div>
                        ) : (
                            goals.slice(0, 3).map(goal => {
                                const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
                                return (
                                    <div key={goal.id} className="relative">
                                        <div className="flex justify-between items-end mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-black uppercase tracking-wider">{goal.name}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-accent">{Math.round(progress)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full rounded-full transition-all duration-1000" 
                                                style={{ width: `${progress}%`, backgroundColor: goal.color }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

            </div>

            {/* TABLA DE DESGLOSE AVANZADA (Importada de Resumen) */}
            <div className="bg-[var(--bg-card)] dark:bg-white/5 backdrop-blur-xl overflow-hidden rounded-[3rem] border border-[var(--border-color)] dark:border-white/10 shadow-sm">
                <div className="p-8 border-b border-[var(--border-color)] dark:border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h4 className="text-lg font-heading font-black text-[var(--text-primary)] flex items-center gap-3">
                            <Activity size={20} className="text-accent" />
                            Desglose Detallado por Concepto
                        </h4>
                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">Comparativa de flujos y peso sobre el gasto total</p>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--bg-main)] dark:bg-white/5 text-[10px] uppercase tracking-[0.2em] font-black text-neutral-400 border-b-2 border-[var(--border-color)] dark:border-white/10">
                                <th className="p-6">Concepto / CategorÃ­a</th>
                                <th className="p-6 w-1/4">Peso en Gasto</th>
                                <th className="p-6 text-right w-40">Ingreso</th>
                                <th className="p-6 text-right w-40">Gasto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)] dark:divide-white/5">
                            {summaryData.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-neutral-400 font-bold uppercase tracking-widest text-xs italic">
                                        Sin datos en el periodo seleccionado
                                    </td>
                                </tr>
                            ) : summaryData.sort((a,b) => b.expense - a.expense).map((row, i) => {
                                const weight = totalExpenses > 0 ? (row.expense / totalExpenses) * 100 : 0;
                                return (
                                    <tr key={row.concept} className="hover:bg-[var(--bg-main)] dark:hover:bg-white/5 transition-colors group">
                                        <td className="p-6 font-black text-xs uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: row.expense > 0 ? COLORS[i % COLORS.length] : 'transparent' }}></div>
                                            {row.concept}
                                        </td>
                                        <td className="p-6">
                                            {row.expense > 0 ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-full h-1.5 bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden flex-1">
                                                        <div className="h-full rounded-full transition-all group-hover:brightness-110" 
                                                             style={{ width: `${weight}%`, backgroundColor: COLORS[i % COLORS.length] }}></div>
                                                    </div>
                                                    <span className="text-[10px] font-black text-neutral-400 w-8">{weight.toFixed(0)}%</span>
                                                </div>
                                            ) : <span className="text-neutral-300 dark:text-neutral-600">-</span>}
                                        </td>
                                        <td className="p-6 text-right font-bold text-sm text-green-600">
                                            {row.income > 0 ? `$${row.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                                        </td>
                                        <td className="p-6 text-right font-bold text-sm text-red-500">
                                            {row.expense > 0 ? `$${row.expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-[var(--bg-main)] dark:bg-white/5 font-black">
                            <tr>
                                <td colSpan={2} className="p-6 text-[10px] uppercase tracking-[0.2em] opacity-40">Totales Globales</td>
                                <td className="p-6 text-right text-green-600 border-x border-[var(--border-color)] dark:border-white/10">
                                    ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-6 text-right text-red-500">
                                    ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            {/* CHART DETAIL MODAL */}
            {selectedPoint && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPoint(null)}></div>
                    <div className="relative z-10 w-full max-w-lg bg-white dark:bg-[#161c26] rounded-[2.5rem] p-8 shadow-2xl overflow-hidden border border-neutral-200 dark:border-white/10 animate-scale-in">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h4 className="text-2xl font-black text-primary-dark dark:text-white capitalize">{selectedPoint.fullMonthName}</h4>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] mt-1">AnÃ¡lisis detallado del periodo</p>
                            </div>
                            <button onClick={() => setSelectedPoint(null)} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full transition-colors text-neutral-400">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-green-500/5 p-4 rounded-3xl border border-green-500/10">
                                <p className="text-[8px] font-black text-green-600/60 uppercase tracking-widest mb-1">Total Ingresos</p>
                                <p className="text-xl font-black text-green-600">${selectedPoint.ingresos.toLocaleString()}</p>
                            </div>
                            <div className="bg-red-500/5 p-4 rounded-3xl border border-red-500/10">
                                <p className="text-[8px] font-black text-red-500/60 uppercase tracking-widest mb-1">Total Gastos</p>
                                <p className="text-xl font-black text-red-500">${selectedPoint.gastos.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4 flex items-center gap-2">
                                    <ArrowUpRight size={14} className="text-green-500" /> Movimientos Relevantes
                                </h5>
                                <div className="space-y-3">
                                    {records
                                        .filter(r => {
                                            const rMonth = r.date.includes('/') ? r.date.split('/').reverse().join('-').substring(0, 7) : r.date.substring(0, 7);
                                            return rMonth === selectedPoint.monthKey && (r.concept || '').toUpperCase().trim() !== 'SALDO INICIAL';
                                        })
                                        .sort((a, b) => (Number(b.income) + Number(b.expense)) - (Number(a.income) + Number(a.expense)))
                                        .slice(0, 5)
                                        .map((r, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black uppercase tracking-tight truncate max-w-[150px]">{r.concept}</span>
                                                    <span className="text-[9px] font-bold text-neutral-400">{r.provider || 'S/P'}</span>
                                                </div>
                                                <span className={`text-xs font-black ${Number(r.income) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {Number(r.income) > 0 ? `+` : `-`} ${Math.max(Number(r.income), Number(r.expense)).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setSelectedPoint(null)}
                            className="w-full mt-8 py-4 bg-accent text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardView;

```

## File: src\components\portal\finance\FinanceHeader.tsx
```tsx
import React from 'react';
import { 
    Plus, Upload, Download, Calendar, Search, X, Printer, 
    TrendingUp, TrendingDown, Camera, Wallet
} from 'lucide-react';

interface FinanceHeaderProps {
    viewMode: 'detailed' | 'balances' | 'budget' | 'credits';
    setViewMode: (mode: 'detailed' | 'balances' | 'budget' | 'credits') => void;
    selectedMonth: string;
    setSelectedMonth: (month: string) => void;
    uniqueMonths: {label: string, value: string}[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isUploading: boolean;
    onImportExcel: () => void;
    onExportExcel: () => void;
    onRefresh: () => void;
    onExportPDF: () => void;
    onShowSnapshot: () => void;
    onToggleForm: () => void;
    isFormOpen: boolean;
    kpis: {
        income: number;
        expense: number;
        balance: number;
    };
}

const FinanceHeader: React.FC<FinanceHeaderProps> = ({
    viewMode, setViewMode,
    selectedMonth, setSelectedMonth, uniqueMonths,
    searchTerm, setSearchTerm,
    isUploading, onImportExcel, onExportExcel, onExportPDF,
    onShowSnapshot,
    onToggleForm, isFormOpen,
    kpis
}) => {
    return (
        <div className="bg-transparent">
            {/* Main Header Section */}
            <div className="p-8 md:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                <div className="animate-slide-up">
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Centro Financiero</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        GestiÃ³n Inteligente de Patrimonio
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 animate-slide-up delay-100">
                    <div className="flex bg-white dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
                        {[
                            { icon: Camera, title: 'Snapshot', action: onShowSnapshot, color: 'text-sky-500', bg: 'hover:bg-sky-500/10' },
                            { icon: Upload, title: 'Importar', action: onImportExcel, color: 'text-indigo-500', bg: 'hover:bg-indigo-500/10', disabled: isUploading },
                            { icon: Download, title: 'Exportar', action: onExportExcel, color: 'text-emerald-500', bg: 'hover:bg-emerald-500/10' },
                            { icon: Printer, title: 'Reporte', action: onExportPDF, color: 'text-rose-500', bg: 'hover:bg-rose-500/10' }
                        ].map((btn, i) => (
                            <button
                                key={i}
                                onClick={btn.action}
                                disabled={btn.disabled}
                                title={btn.title}
                                className={`p-3 rounded-xl transition-all duration-300 ${btn.bg} ${btn.color} active:scale-90 group relative`}
                            >
                                <btn.icon size={20} strokeWidth={2.5} />
                                <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    {btn.title}
                                </span>
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={onToggleForm}
                        className={`py-3.5 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-500 flex items-center gap-3 shadow-xl ${
                            isFormOpen 
                                ? 'bg-slate-800 text-white shadow-slate-900/20' 
                                : 'bg-sky-500 text-white shadow-sky-500/25 hover:bg-sky-600 hover:-translate-y-0.5'
                        }`}
                    >
                        {isFormOpen ? <X size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
                        <span>{isFormOpen ? 'Cerrar Panel' : 'Nuevo Registro'}</span>
                    </button>
                </div>
            </div>

            {/* KPI Summary Section */}
            <div className="px-8 md:px-10 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Ingresos Totales', value: kpis.income, color: 'text-emerald-600', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10', icon: TrendingUp },
                        { label: 'Gastos Ejecutados', value: kpis.expense, color: 'text-rose-600', bg: 'bg-rose-500/5', border: 'border-rose-500/10', icon: TrendingDown },
                        { label: 'Balance Neto', value: kpis.balance, color: kpis.balance >= 0 ? 'text-sky-600' : 'text-rose-600', bg: 'bg-slate-900', border: 'border-white/5', icon: Wallet, dark: true }
                    ].map((kpi, i) => (
                        <div key={i} className={`p-6 rounded-[2rem] border ${kpi.bg} ${kpi.border} shadow-sm group hover:shadow-md transition-all duration-500 animate-slide-up`} style={{ animationDelay: `${200 + i * 100}ms` }}>
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[10px] font-black uppercase tracking-[0.15em] opacity-40 ${kpi.dark ? 'text-white' : 'text-slate-900'}`}>{kpi.label}</span>
                                <div className={`p-2 rounded-xl ${kpi.dark ? 'bg-white/10 text-white' : 'bg-white dark:bg-white/5 text-slate-400 group-hover:text-accent'}`}>
                                    <kpi.icon size={16} />
                                </div>
                            </div>
                            <p className={`text-2xl font-black tracking-tight ${kpi.dark ? 'text-white' : kpi.color}`}>
                                ${kpi.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation & Filters Section */}
            <div className="px-8 md:px-10 pb-6 border-b border-slate-200 dark:border-white/5">
                <div className="flex flex-col xl:flex-row justify-between items-center gap-6 bg-white dark:bg-white/[0.03] p-2 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-xl">
                    <nav className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-full w-full xl:w-auto overflow-x-auto no-scrollbar">
                        {(['detailed', 'balances', 'budget', 'credits'] as const).map((mode) => (
                            <button 
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-8 py-3 rounded-full text-[10px] font-black tracking-[0.15em] uppercase transition-all duration-300 whitespace-nowrap ${
                                    viewMode === mode 
                                        ? 'bg-white dark:bg-white/10 text-sky-500 shadow-sm scale-[1.02]' 
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                                }`}
                            >
                                {mode === 'detailed' ? 'Movimientos' : 
                                 mode === 'balances' ? 'Cuentas' : 
                                 mode === 'budget' ? 'Presupuesto' : 'CrÃ©ditos'}
                            </button>
                        ))}
                    </nav>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto px-4">
                        {viewMode === 'detailed' && (
                            <div className="relative w-full sm:w-72 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" size={16} strokeWidth={3} />
                                <input 
                                    type="text"
                                    placeholder="FILTRAR REGISTROS..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-100 dark:bg-white/5 pl-11 pr-10 py-3 rounded-2xl text-[10px] font-black tracking-widest outline-none border border-transparent focus:border-sky-500/50 transition-all placeholder:text-slate-300"
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors">
                                        <X size={14} strokeWidth={3} />
                                    </button>
                                )}
                            </div>
                        )}
                        
                        <div className="relative w-full sm:w-auto">
                            <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 px-6 py-3 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all group cursor-pointer">
                                <Calendar size={16} className="text-slate-400 group-hover:text-sky-500 transition-colors" strokeWidth={2.5} />
                                <select 
                                    value={selectedMonth} 
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="bg-transparent text-[10px] font-black text-slate-500 dark:text-slate-400 outline-none cursor-pointer uppercase tracking-widest appearance-none pr-8"
                                >
                                    {uniqueMonths.map(m => (
                                        <option key={m.value} value={m.value} className="text-slate-900 bg-white">{m.label}</option>
                                    ))}
                                </select>
                                <div className="absolute right-6 pointer-events-none text-slate-300">
                                    <TrendingDown size={12} strokeWidth={4} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceHeader;

```

## File: src\components\portal\finance\MovementsDetailedView.tsx
```tsx
import React, { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { FinanceRecord } from '../../../types/finance';
import { formatDate } from '../../../utils/financeUtils';

interface MovementsDetailedViewProps {
    records: FinanceRecord[];
    onEdit: (record: FinanceRecord) => void;
    onDelete: (id: string) => void;
}

const SortIcon: React.FC<{ 
    column: keyof FinanceRecord | 'index'; 
    sortConfig: { key: keyof FinanceRecord | 'index'; direction: 'asc' | 'desc' } | null 
}> = ({ column, sortConfig }) => {
    if (!sortConfig || sortConfig.key !== column) return <ChevronsUpDown size={12} className="opacity-30 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={12} className="text-white" /> : <ChevronDown size={12} className="text-white" />;
};

const MovementsDetailedView: React.FC<MovementsDetailedViewProps> = ({
    records,
    onEdit,
    onDelete
}) => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof FinanceRecord | 'index'; direction: 'asc' | 'desc' } | null>({ key: 'date', direction: 'desc' });

    const handleSort = (key: keyof FinanceRecord | 'index') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    const sortedRecords = useMemo(() => {
        // Separamos SALDO INICIAL para dejarlos siempre abajo
        const initialBalanceRecords = records.filter(r => (r.concept || '').toUpperCase().trim() === 'SALDO INICIAL');
        const normalRecords = records.filter(r => (r.concept || '').toUpperCase().trim() !== 'SALDO INICIAL');

        if (sortConfig !== null) {
            normalRecords.sort((a, b) => {
                let aValue: string | number;
                let bValue: string | number;

                if (sortConfig.key === 'index') {
                    // Si es index, usamos la posiciÃ³n original en el array records
                    aValue = records.indexOf(a);
                    bValue = records.indexOf(b);
                } else {
                    const key = sortConfig.key as keyof FinanceRecord;
                    aValue = a[key] ?? '';
                    bValue = b[key] ?? '';
                }

                // Manejo de tipos numÃ©ricos para que el sort sea correcto
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                }

                // Manejo de strings
                const aStr = String(aValue).toLowerCase();
                const bStr = String(bValue).toLowerCase();

                if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return [...normalRecords, ...initialBalanceRecords];
    }, [records, sortConfig]);

    const [isMobileVisible, setIsMobileVisible] = useState(false);

    if (records.length === 0) {
        return (
            <div className="p-12 text-center text-neutral-400">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary/30">
                        <Search size={24} />
                    </div>
                </div>
                <p className="font-bold text-primary-dark mb-1">Sin registros financieros</p>
                <p className="text-sm">Comienza agregando tu primer movimiento o ajusta los filtros.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Mobile Toggle Button */}
            <div className="md:hidden px-2">
                <button 
                    onClick={() => setIsMobileVisible(!isMobileVisible)}
                    className="w-full flex items-center justify-between p-6 bg-white dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-[2rem] shadow-sm active:scale-[0.98] transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                            <ChevronsUpDown size={20} />
                        </div>
                        <div className="text-left">
                            <span className="block text-sm font-black text-primary-dark dark:text-white uppercase tracking-wider">Historial de Movimientos</span>
                            <span className="block text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{records.length} registros en total</span>
                        </div>
                    </div>
                    <div className={`p-2 rounded-full bg-neutral-50 dark:bg-white/5 transition-transform duration-300 ${isMobileVisible ? 'rotate-180' : ''}`}>
                        <ChevronDown size={18} />
                    </div>
                </button>
            </div>

            {/* Content Wrapper */}
            <div className={`${!isMobileVisible ? 'hidden md:block' : 'block animate-fade-in'}`}>
                <div className="bg-[var(--bg-card)]/50 dark:bg-white/5 backdrop-blur-md rounded-[32px] border border-[var(--border-color)] dark:border-white/10 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] dark:border-white/10">
                                    <th 
                                        className="sticky top-0 z-10 p-5 whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-black/10 transition-colors group"
                                        onClick={() => handleSort('index')}
                                    >
                                        <div className="flex items-center gap-2">ID <SortIcon column="index" sortConfig={sortConfig} /></div>
                                    </th>
                                    <th 
                                        className="sticky top-0 z-10 p-5 whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-black/10 transition-colors group"
                                        onClick={() => handleSort('concept')}
                                    >
                                        <div className="flex items-center gap-2">Concepto <SortIcon column="concept" sortConfig={sortConfig} /></div>
                                    </th>
                                    <th 
                                        className="sticky top-0 z-10 p-5 whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-black/10 transition-colors group"
                                        onClick={() => handleSort('date')}
                                    >
                                        <div className="flex items-center gap-2">Fecha <SortIcon column="date" sortConfig={sortConfig} /></div>
                                    </th>
                                    <th 
                                        className="sticky top-0 z-10 p-5 whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-black/10 transition-colors group"
                                        onClick={() => handleSort('payment_method')}
                                    >
                                        <div className="flex items-center gap-2">Pago <SortIcon column="payment_method" sortConfig={sortConfig} /></div>
                                    </th>
                                    <th 
                                        className="sticky top-0 z-10 p-5 whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-black/10 transition-colors group"
                                        onClick={() => handleSort('provider')}
                                    >
                                        <div className="flex items-center gap-2">Proveedor <SortIcon column="provider" sortConfig={sortConfig} /></div>
                                    </th>
                                    <th 
                                        className="sticky top-0 z-10 p-5 text-right whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-black/10 transition-colors group"
                                        onClick={() => handleSort('income')}
                                    >
                                        <div className="flex items-center justify-end gap-2">Ingreso <SortIcon column="income" sortConfig={sortConfig} /></div>
                                    </th>
                                    <th 
                                        className="sticky top-0 z-10 p-5 text-right whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-black/10 transition-colors group"
                                        onClick={() => handleSort('expense')}
                                    >
                                        <div className="flex items-center justify-end gap-2">Gasto <SortIcon column="expense" sortConfig={sortConfig} /></div>
                                    </th>
                                    <th 
                                        className="sticky top-0 z-10 p-5 text-right whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-black/10 transition-colors group"
                                        onClick={() => handleSort('balance')}
                                    >
                                        <div className="flex items-center justify-end gap-2">Saldo <SortIcon column="balance" sortConfig={sortConfig} /></div>
                                    </th>
                                    <th 
                                        className="sticky top-0 z-10 p-5 whitespace-nowrap max-w-xs bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-black/10 transition-colors group"
                                        onClick={() => handleSort('description')}
                                    >
                                        <div className="flex items-center gap-2">DescripciÃ³n <SortIcon column="description" sortConfig={sortConfig} /></div>
                                    </th>
                                    <th className="sticky top-0 z-10 p-5 text-center whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em]">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)] dark:divide-white/5">
                                {sortedRecords.map((record) => {
                                    const originalIndex = records.indexOf(record);
                                    const isInitialBalance = record.concept.toUpperCase() === 'SALDO INICIAL';
                                    const isTransfer = (record.concept || '').toUpperCase().includes('TRASPASO') || (record.expense_type || '').toUpperCase() === 'TRASPASO';
                                    return (
                                        <tr key={record.id} className={`hover:bg-[var(--bg-main)] dark:hover:bg-white/5 transition-colors group ${isInitialBalance ? 'bg-amber-500/10' : isTransfer ? 'bg-sky-500/5 opacity-80' : ''}`}>
                                            <td className="p-4 px-5 whitespace-nowrap opacity-40 font-bold text-[10px]">{originalIndex + 1}</td>
                                            <td className="p-4 px-5 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-xs uppercase tracking-wider">{record.concept}</span>
                                                    {isInitialBalance && <span className="text-[8px] bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">Ajuste</span>}
                                                    {isTransfer && <span className="text-[8px] bg-sky-500/20 text-sky-600 px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">Traspaso</span>}
                                                </div>
                                                <div className="mt-1">
                                                    <span className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest ${
                                                        record.expense_type === 'Fijo' ? 'bg-indigo-100 text-indigo-700' :
                                                        record.expense_type === 'Ahorro' ? 'bg-teal-100 text-teal-700' :
                                                        record.expense_type === 'Deuda' ? 'bg-orange-100 text-orange-700' :
                                                        record.expense_type === 'Ingreso' ? 'bg-green-100 text-green-700' :
                                                        record.expense_type === 'Traspaso' ? 'bg-sky-100 text-sky-700' :
                                                        'bg-neutral-100 text-neutral-500'
                                                    }`}>
                                                        {record.expense_type || 'Variable'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 px-5 whitespace-nowrap text-xs opacity-60 font-medium">
                                                {formatDate(record.date)}
                                            </td>
                                            <td className="p-4 px-5 whitespace-nowrap">
                                                <span className="bg-[var(--bg-main)] dark:bg-white/10 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter">{record.payment_method}</span>
                                            </td>
                                            <td className="p-4 px-5 whitespace-nowrap text-xs font-medium opacity-60">{record.provider}</td>
                                            <td className="p-4 px-5 text-right whitespace-nowrap text-green-600 font-bold text-sm">
                                                {(isInitialBalance || isTransfer) ? (record.income > 0 ? `$${Number(record.income).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-') : (Number(record.income) !== 0 ? `$${Number(record.income).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-')}
                                            </td>
                                            <td className="p-4 px-5 text-right whitespace-nowrap text-red-500 font-bold text-sm">
                                                {(isInitialBalance || isTransfer) ? (record.expense > 0 ? `$${Number(record.expense).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-') : (Number(record.expense) !== 0 ? `$${Number(record.expense).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-')}
                                            </td>
                                            <td className={`p-4 px-5 text-right whitespace-nowrap font-black text-sm ${Number(record.balance) < 0 ? 'text-red-500' : ''}`}>
                                                ${Number(record.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-4 px-5 text-xs opacity-40 max-w-xs truncate italic">{record.description}</td>
                                            <td className="p-4 px-5">
                                                <div className="flex justify-center gap-3">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); onEdit(record); }}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl text-primary-dark/60 hover:text-white hover:bg-accent hover:shadow-lg hover:shadow-accent/20 transition-all duration-300 hover:scale-110 active:scale-95 md:opacity-0 md:group-hover:opacity-100"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); onDelete(record.id); }}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl text-red-500/60 hover:text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 hover:scale-110 active:scale-95 md:opacity-0 md:group-hover:opacity-100"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovementsDetailedView;

```

## File: src\components\portal\finance\MovementsSummaryView.tsx
```tsx
import React from 'react';
import { Search, TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../../utils/financeUtils';

interface MovementsSummaryViewProps {
    summaryData: {concept: string, income: number, expense: number}[];
    selectedMonth: string;
    uniqueMonths: {label: string, value: string}[];
}

const MovementsSummaryView: React.FC<MovementsSummaryViewProps> = ({
    summaryData,
    selectedMonth,
    uniqueMonths
}) => {
    const monthLabel = uniqueMonths.find(m => m.value === selectedMonth)?.label;

    if (summaryData.length === 0) {
        return (
            <div className="p-16 text-center bg-[var(--bg-card)]/40 dark:bg-white/5 backdrop-blur-xl rounded-[3rem] border border-[var(--border-color)] dark:border-white/10 animate-fade-in">
                <div className="w-24 h-24 bg-accent/5 rounded-full flex items-center justify-center text-accent mx-auto mb-8 relative">
                    <Search size={40} className="relative z-10" />
                    <div className="absolute inset-0 border-2 border-dashed border-accent/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                </div>
                <h3 className="font-heading font-black text-[var(--text-primary)] text-3xl mb-3 tracking-tight">Sin movimientos registrados</h3>
                <p className="text-neutral-500 max-w-md mx-auto text-sm">No encontramos registros financieros para el periodo seleccionado. Agrega nuevos movimientos para comenzar el anÃ¡lisis.</p>
            </div>
        );
    }

    const totalExpenses = summaryData.reduce((a, b) => a + b.expense, 0);
    const totalIncome = summaryData.reduce((a, b) => a + b.income, 0);
    const netBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;
    
    // Top Expense Category
    const topExpenseData = [...summaryData].sort((a,b) => b.expense - a.expense)[0];
    const topExpenseConcept = topExpenseData?.expense > 0 ? topExpenseData.concept : null;
    const topExpenseAmount = topExpenseData?.expense > 0 ? topExpenseData.expense : 0;
    const topExpensePercentage = totalExpenses > 0 ? (topExpenseAmount / totalExpenses) * 100 : 0;

    // Custom Tooltip for charts
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">{payload[0].name}</p>
                    <p className="text-lg font-black text-white">${Number(payload[0].value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-fade-in delay-100 space-y-6 text-[var(--text-primary)]">
            {/* Header del Periodo */}
            {selectedMonth && (
                <div className="flex flex-col items-center justify-center mb-10 w-full relative">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-color)] dark:via-white/20 to-transparent w-full"></div>
                    </div>
                    <span className="relative bg-[var(--bg-main)] dark:bg-[#151515] px-8 py-3 rounded-full border border-[var(--border-color)] dark:border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.05)] text-lg font-heading font-black capitalize tracking-tight flex items-center gap-3">
                        <CalendarIcon />
                        {monthLabel}
                    </span>
                </div>
            )}

            {/* BENTO GRID PRINCIPAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 auto-rows-min">
                
                {/* 1. Kpi de Salud Financiera (Savings Rate) - Toma 4 columnas */}
                <div className="xl:col-span-4 bg-gradient-to-br from-primary-dark via-primary-dark to-black rounded-[2.5rem] p-8 relative overflow-hidden group shadow-lg border border-white/5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-accent/30 transition-all duration-700"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 flex items-center gap-2 mb-2">
                                <Activity size={14} className="text-green-400" /> Salud Financiera
                            </h4>
                            <p className="text-white text-3xl font-heading font-black tracking-tighter">
                                {savingsRate >= 0 ? '+' : ''}{savingsRate.toFixed(1)}%
                            </p>
                            <p className="text-xs text-white/40 mt-1 font-medium">Tasa de ahorro / Margen libre</p>
                        </div>
                        
                        <div className="mt-8">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Balance Neto</span>
                                <span className={`font-black ${netBalance >= 0 ? 'text-green-400' : 'text-red-400'} text-xl`}>
                                    ${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
                                <div className="h-full bg-green-500 rounded-l-full" style={{ width: `${Math.max(0, Math.min(savingsRate, 100))}%` }}></div>
                                <div className="h-full bg-red-500 rounded-r-full" style={{ width: `${netBalance < 0 ? 100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Alerta de Top Gasto - Toma 4 columnas */}
                <div className="xl:col-span-4 bg-[var(--bg-card)] dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-[var(--border-color)] dark:border-white/10 shadow-sm relative group overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[50px] group-hover:bg-red-500/10 transition-all duration-500"></div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2 mb-6">
                        <AlertTriangle size={14} className="text-red-500" /> Fuga Principal
                    </h4>
                    
                    {topExpenseConcept ? (
                        <div className="flex flex-col justify-between flex-1 mt-auto">
                            <div>
                                <p className="text-2xl font-black font-heading text-[var(--text-primary)] leading-none mb-1 capitalize truncate" title={topExpenseConcept}>
                                    {topExpenseConcept.toLowerCase()}
                                </p>
                                <p className="text-sm font-bold text-red-500">
                                    ${topExpenseAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            
                            <div className="mt-8 flex items-center gap-4 bg-red-500/5 dark:bg-red-500/10 p-4 rounded-2xl border border-red-500/10">
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500/70 mb-1">Impacto Global</p>
                                    <div className="w-full h-1.5 bg-red-500/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${topExpensePercentage}%` }}></div>
                                    </div>
                                </div>
                                <span className="text-lg font-black text-red-500">{topExpensePercentage.toFixed(0)}%</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full opacity-30 mt-4">
                            <Target size={32} />
                            <p className="text-xs uppercase tracking-widest font-bold mt-2">Sin gastos</p>
                        </div>
                    )}
                </div>

                {/* 3. DistribuciÃ³n de Ingresos - Toma 4 columnas */}
                <div className="xl:col-span-4 bg-[var(--bg-card)] dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-[var(--border-color)] dark:border-white/10 shadow-sm flex flex-col">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2 mb-4">
                        <TrendingUp size={14} className="text-green-500" /> Entradas de Capital
                    </h4>
                    <p className="text-xl font-heading font-black text-[var(--text-primary)] mb-6">
                        ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    
                    <div className="flex-1 h-[140px] w-full relative">
                        {summaryData.filter(d => d.income > 0).length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={summaryData.filter(d => d.income > 0).sort((a,b) => b.income - a.income)} 
                                        dataKey="income" 
                                        nameKey="concept" 
                                        cx="50%" cy="50%" 
                                        innerRadius={45} 
                                        outerRadius={65} 
                                        paddingAngle={5}
                                        stroke="none"
                                    >
                                        {summaryData.filter(d => d.income > 0).map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-neutral-300 text-xs font-bold uppercase tracking-widest">Sin ingresos</div>
                        )}
                    </div>
                </div>

                {/* 4. Dona Central de Gastos - Toma 8 columnas */}
                <div className="xl:col-span-8 bg-[var(--bg-card)] dark:bg-white/5 backdrop-blur-xl rounded-[3rem] p-8 md:p-10 border border-[var(--border-color)] dark:border-white/10 shadow-sm relative group overflow-hidden flex flex-col md:flex-row items-center gap-8 min-h-[380px]">
                    <div className="flex-1 w-full h-[300px] relative">
                         {summaryData.filter(d => d.expense > 0).length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie 
                                            data={summaryData.filter(d => d.expense > 0).sort((a,b) => b.expense - a.expense)} 
                                            dataKey="expense" 
                                            nameKey="concept" 
                                            cx="50%" cy="50%" 
                                            innerRadius={90} 
                                            outerRadius={130} 
                                            paddingAngle={2}
                                            stroke="none"
                                            cornerRadius={8}
                                        >
                                            {summaryData.filter(d => d.expense > 0).map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} 
                                                      className="drop-shadow-sm hover:opacity-80 transition-opacity" />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center pointer-events-none">
                                    <span className="text-neutral-400 text-[9px] uppercase tracking-[0.2em] font-black">Gastos Totales</span>
                                    <span className="text-3xl font-heading font-black text-red-500 mt-1">
                                        ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center text-neutral-400 text-sm italic border-2 border-dashed border-[var(--border-color)] rounded-full w-64 mx-auto">
                                No hay gastos registrados
                            </div>
                        )}
                    </div>
                    
                    <div className="w-full md:w-1/3 flex flex-col justify-center">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-6 flex items-center gap-2">
                            <TrendingDown size={14} className="text-red-500" /> AnÃ¡lisis de Gastos
                        </h4>
                        
                        <div className="space-y-4">
                            {summaryData.filter(d => d.expense > 0).sort((a,b) => b.expense - a.expense).slice(0, 4).map((item, index) => (
                                <div key={index} className="group cursor-default">
                                    <div className="flex justify-between items-end mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="text-xs font-bold text-[var(--text-primary)] uppercase truncate w-32" title={item.concept}>{item.concept}</span>
                                        </div>
                                        <span className="text-xs font-black text-[var(--text-primary)]">
                                            ${item.expense.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                    <div className="w-full h-1 bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full transition-all duration-1000 ease-out" 
                                             style={{ width: `${(item.expense / totalExpenses) * 100}%`, backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    </div>
                                </div>
                            ))}
                            {summaryData.filter(d => d.expense > 0).length > 4 && (
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center mt-4">
                                    + {summaryData.filter(d => d.expense > 0).length - 4} categorÃ­as mÃ¡s
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 5. EvoluciÃ³n (Placeholder Barras) - Toma 4 columnas */}
                 <div className="xl:col-span-4 bg-[var(--bg-card)] dark:bg-white/5 backdrop-blur-xl rounded-[3rem] p-8 border border-[var(--border-color)] dark:border-white/10 shadow-sm flex flex-col justify-center items-center text-center group">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                        <DollarSign size={24} />
                    </div>
                    <h3 className="text-lg font-black font-heading text-[var(--text-primary)] mb-2">VisiÃ³n 360Â°</h3>
                    <p className="text-xs text-neutral-400">Revisa el desglose completo en la tabla inferior para un anÃ¡lisis contable a detalle de cada uno de tus conceptos.</p>
                 </div>
            </div>

            {/* TABLA DE DESGLOSE AVANZADA */}
            <div className="mt-6 bg-[var(--bg-card)] dark:bg-white/5 backdrop-blur-xl overflow-hidden rounded-[3rem] border border-[var(--border-color)] dark:border-white/10 shadow-sm">
                <div className="p-8 border-b border-[var(--border-color)] dark:border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h4 className="text-lg font-heading font-black text-[var(--text-primary)]">Desglose Detallado</h4>
                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">Comparativa de flujos por concepto</p>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--bg-main)] dark:bg-white/5 text-[10px] uppercase tracking-[0.2em] font-black text-neutral-400 border-b-2 border-[var(--border-color)] dark:border-white/10">
                                <th className="p-6">Concepto / CategorÃ­a</th>
                                <th className="p-6 w-1/4">Peso en Gasto</th>
                                <th className="p-6 text-right w-40">Ingreso</th>
                                <th className="p-6 text-right w-40">Gasto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)] dark:divide-white/5">
                            {summaryData.sort((a,b) => b.expense - a.expense).map((row, i) => {
                                const weight = totalExpenses > 0 ? (row.expense / totalExpenses) * 100 : 0;
                                return (
                                    <tr key={row.concept} className="hover:bg-[var(--bg-main)] dark:hover:bg-white/5 transition-colors group">
                                        <td className="p-6 font-black text-xs uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: row.expense > 0 ? COLORS[i % COLORS.length] : 'transparent' }}></div>
                                            {row.concept}
                                        </td>
                                        <td className="p-6">
                                            {row.expense > 0 ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-full h-1.5 bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden flex-1">
                                                        <div className="h-full rounded-full transition-all group-hover:brightness-110" 
                                                             style={{ width: `${weight}%`, backgroundColor: COLORS[i % COLORS.length] }}></div>
                                                    </div>
                                                    <span className="text-[10px] font-black text-neutral-400 w-8">{weight.toFixed(0)}%</span>
                                                </div>
                                            ) : <span className="text-neutral-300 dark:text-neutral-600">-</span>}
                                        </td>
                                        <td className="p-6 text-right font-bold text-sm text-green-600">
                                            {row.income > 0 ? `$${row.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                                        </td>
                                        <td className="p-6 text-right font-bold text-sm text-red-500">
                                            {row.expense > 0 ? `$${row.expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-[var(--bg-main)] dark:bg-white/5 font-black">
                            <tr>
                                <td colSpan={2} className="p-6 text-[10px] uppercase tracking-[0.2em] opacity-40">Totales Globales</td>
                                <td className="p-6 text-right text-green-600 border-x border-[var(--border-color)] dark:border-white/10">
                                    ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-6 text-right text-red-500">
                                    ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            
            <style>{`
                /* Specific keyframes for local animations if not globally injected */
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

// Mini componente de apoyo
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

export default MovementsSummaryView;


```

## File: src\components\portal\finance\RecordForm.tsx
```tsx
import React, { useRef } from 'react';
import { Plus, Camera, Sparkles } from 'lucide-react';
import { extractDataFromReceipt } from '../../../lib/gemini';
import { toast } from '../../../lib/toast';

interface RecordFormProps {
    isOpen: boolean;
    isEditing: boolean;
    isProcessingOCR: boolean;
    setIsProcessingOCR: (val: boolean) => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    
    // Form States & Setters
    concept: string; setConcept: (v: string) => void;
    date: string; setDate: (v: string) => void;
    paymentMethod: string; setPaymentMethod: (v: string) => void;
    provider: string; setProvider: (v: string) => void;
    income: number | ''; setIncome: (v: number | '') => void;
    expense: number | ''; setExpense: (v: number | '') => void;
    description: string; setDescription: (v: string) => void;
    expenseType: string; setExpenseType: (v: string) => void;
    
    renderPaymentOptions: () => React.ReactNode;
    concepts?: string[];
}

const RecordForm: React.FC<RecordFormProps> = ({
    isOpen, isEditing, isProcessingOCR, setIsProcessingOCR, onClose, onSubmit,
    concept, setConcept,
    date, setDate,
    paymentMethod, setPaymentMethod,
    provider, setProvider,
    income, setIncome,
    expense, setExpense,
    description, setDescription,
    expenseType, setExpenseType,
    renderPaymentOptions,
    concepts = []
}) => {
    const ocrFileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleOCR = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsProcessingOCR(true);
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64 = e.target?.result as string;
                const data = await extractDataFromReceipt(base64);
                
                if (data.amount) {
                    setExpense(data.amount);
                    setIncome('');
                }
                if (data.date) setDate(data.date);
                if (data.provider) setProvider(data.provider);
                if (data.concept) setConcept(data.concept);
                
                if (data.category) {
                    const cat = data.category.toLowerCase();
                    if (cat.includes('alimento') || cat.includes('servicio')) setExpenseType('Fijo');
                    else if (cat.includes('salud') || cat.includes('educaciÃ³n')) setExpenseType('Variable');
                }
                
                toast.success("Â¡Ticket escaneado con Ã©xito!");
                setIsProcessingOCR(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error(err);
            toast.error("Error al analizar el ticket.");
            setIsProcessingOCR(false);
        }
        if (event.target) event.target.value = '';
    };

    return (
        <>
            {isProcessingOCR && (
                <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-white/10 shadow-2xl text-center max-w-sm">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 bg-sky-500/20 rounded-full animate-ping"></div>
                            <div className="relative z-10 w-20 h-20 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-lg">
                                <Sparkles size={32} className="animate-pulse" />
                            </div>
                        </div>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">IA Analizando...</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                            Extrayendo informaciÃ³n clave de tu ticket de forma automÃ¡tica.
                        </p>
                    </div>
                </div>
            )}

            <div className="fixed inset-0 z-[10000] flex items-start justify-center p-4 pt-12 md:pt-20 animate-fade-in overflow-y-auto">
                {/* Backdrop with extreme blur */}
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl" onClick={onClose}></div>
                
                {/* Modal Container */}
                <div className="relative z-10 w-full max-w-5xl bg-white dark:bg-[#0f172a] rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.4)] overflow-hidden animate-slide-up border border-slate-200 dark:border-white/5">
                    
                    {/* Header bar */}
                    <div className="p-8 md:p-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                                <Plus size={24} strokeWidth={3} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
                                    {isEditing ? 'Editar Registro' : 'Nuevo Movimiento'}
                                </h3>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">GestiÃ³n de flujo de caja</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl transition-all duration-300 text-slate-300 group">
                            <Plus size={24} strokeWidth={3} className="rotate-45 group-hover:text-rose-500 transition-colors" />
                        </button>
                    </div>

                    <div className="p-8 md:p-10 space-y-10">
                        {/* Smart Scan Section - Enhanced */}
                        <div className="relative overflow-hidden p-8 rounded-[2.5rem] bg-gradient-to-br from-sky-500/5 to-indigo-500/5 border border-sky-500/10 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-sky-500/30 transition-all duration-500">
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-white/10 flex items-center justify-center text-sky-500 shadow-sm border border-sky-500/10 group-hover:scale-110 transition-transform duration-500">
                                    <Camera size={28} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Smart Scan AI</h4>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Sincroniza tus tickets con un solo clic</p>
                                </div>
                            </div>
                            <input type="file" ref={ocrFileInputRef} className="hidden" accept="image/*" onChange={handleOCR} />
                            <button 
                                onClick={() => ocrFileInputRef.current?.click()}
                                className="w-full md:w-auto px-10 py-4 bg-sky-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-sky-500/20 hover:bg-sky-600 hover:-translate-y-1 transition-all z-10 flex items-center justify-center gap-3"
                            >
                                <Camera size={18} strokeWidth={3} /> Escanear Ticket
                            </button>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-[60px] -mr-32 -mt-32"></div>
                        </div>

                        {/* Form Grid */}
                        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                            {[
                                { label: 'Concepto', value: concept, setter: setConcept, type: 'text', list: 'concepts-list', placeholder: 'Ej. Supermercado...' },
                                { label: 'Fecha', value: date, setter: setDate, type: 'date' },
                                { label: 'Origen / Cuenta', value: paymentMethod, setter: setPaymentMethod, type: 'select', options: renderPaymentOptions() },
                                { label: 'Establecimiento', value: provider, setter: setProvider, type: 'text', placeholder: 'Ej. Costco...' },
                                { label: 'Ingreso (+)', value: income, setter: (v: any) => setIncome(v === '' ? '' : Number(v)), type: 'number', color: 'text-emerald-500', placeholder: '0.00' },
                                { label: 'Gasto (-)', value: expense, setter: (v: any) => setExpense(v === '' ? '' : Number(v)), type: 'number', color: 'text-rose-500', placeholder: '0.00' },
                                { label: 'ClasificaciÃ³n', value: expenseType, setter: setExpenseType, type: 'select', options: (
                                    <>
                                        <option value="Variable" className="text-slate-900 bg-white">ðŸ’… Variable</option>
                                        <option value="Fijo" className="text-slate-900 bg-white">ðŸ¡ Gasto Fijo</option>
                                        <option value="Ahorro" className="text-slate-900 bg-white">ðŸ’° InversiÃ³n</option>
                                        <option value="Deuda" className="text-slate-900 bg-white">ðŸ’³ Deudas</option>
                                        <option value="Ingreso" className="text-slate-900 bg-white">ðŸ’µ Ingreso</option>
                                        <option value="Traspaso" className="text-slate-900 bg-white">ðŸ”„ Traspaso</option>
                                    </>
                                )},
                                { label: 'Notas', value: description, setter: setDescription, type: 'text', placeholder: 'Opcional...' }
                            ].map((field, i) => (
                                <div key={i} className="space-y-3 group/field">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1 group-focus-within/field:text-sky-500 transition-colors">
                                        {field.label}
                                    </label>
                                    {field.type === 'select' ? (
                                        <select 
                                            value={field.value} 
                                            onChange={e => field.setter(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-black text-slate-700 dark:text-white outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-white/[0.06] transition-all cursor-pointer appearance-none"
                                        >
                                            {field.options}
                                        </select>
                                    ) : (
                                        <div className="relative">
                                            <input 
                                                type={field.type}
                                                step={field.type === 'number' ? '0.01' : undefined}
                                                list={field.list}
                                                value={field.value}
                                                onChange={e => field.setter(e.target.value)}
                                                placeholder={field.placeholder}
                                                className={`w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-bold ${field.color || 'text-slate-700 dark:text-white'} outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-white/[0.06] transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600`}
                                            />
                                        </div>
                                    )}
                                    {field.list && (
                                        <datalist id={field.list}>
                                            {concepts.map((c, idx) => <option key={idx} value={c} />)}
                                        </datalist>
                                    )}
                                </div>
                            ))}

                            <div className="lg:col-span-4 flex flex-col md:flex-row justify-end gap-4 pt-10 mt-4 border-t border-slate-100 dark:border-white/5">
                                <button 
                                    type="button" 
                                    onClick={onClose} 
                                    className="w-full md:w-auto px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all order-2 md:order-1"
                                >
                                    Descartar
                                </button>
                                <button 
                                    type="submit" 
                                    className="w-full md:w-auto px-16 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:-translate-y-1 active:scale-95 transition-all order-1 md:order-2"
                                >
                                    {isEditing ? 'Actualizar Registro' : 'Confirmar Registro'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RecordForm;

```

## File: src\components\portal\finance\SavingsGoalsManager.tsx
```tsx
import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Trash2, TrendingUp, Sparkles, User, DollarSign, Calendar } from 'lucide-react';
import Button from '../../ui/Button';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../hooks/useConfirm';

interface SavingsGoalsManagerProps {
    user: { id: string; [key: string]: unknown };
    goals: any[];
    onRefresh: () => void;
}

export default function SavingsGoalsManager({ user, goals, onRefresh }: SavingsGoalsManagerProps) {
    const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
    const [goalName, setGoalName] = useState('');
    const [goalTarget, setGoalTarget] = useState<number | ''>('');
    const [goalDeadline, setGoalDeadline] = useState('');
    const [isSavingGoal, setIsSavingGoal] = useState(false);

    const { confirm, ConfirmModal } = useConfirm();

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!goalName.trim() || !goalTarget) return;

        setIsSavingGoal(true);
        try {
            const { error } = await supabase
                .from('finance_goals')
                .insert([{
                    user_id: user.id,
                    name: goalName.trim().toUpperCase(),
                    target_amount: Number(goalTarget),
                    current_amount: 0,
                    deadline: goalDeadline || null,
                    color: '#4A7C82' // Default color
                }]);

            if (error) throw error;
            toast.success('Meta de ahorro creada.');
            setIsGoalFormOpen(false);
            setGoalName('');
            setGoalTarget('');
            setGoalDeadline('');
            onRefresh();
        } catch (error) {
            console.error('Error saving goal:', error);
            toast.error(`No se pudo crear la meta: ${(error as any).message}`);
        } finally {
            setIsSavingGoal(false);
        }
    };

    const handleDeleteGoal = async (id: string, name: string) => {
        const ok = await confirm({
            title: 'Eliminar Meta',
            message: `Â¿Seguro que deseas eliminar la meta "${name}"?`,
            confirmLabel: 'Eliminar',
            danger: true
        });
        if (!ok) return;

        try {
            const { error } = await supabase.from('finance_goals').delete().eq('id', id);
            if (error) throw error;
            toast.success('Meta eliminada.');
            onRefresh();
        } catch (error) {
            console.error('Error deleting goal:', error);
            toast.error('No se pudo eliminar la meta.');
        }
    };

    const handleUpdateGoalAmount = async (id: string, currentAmount: number) => {
        const amount = prompt('Â¿CuÃ¡nto deseas abonar a esta meta?');
        if (!amount || isNaN(Number(amount))) return;

        try {
            const { error } = await supabase
                .from('finance_goals')
                .update({ current_amount: currentAmount + Number(amount) })
                .eq('id', id);

            if (error) throw error;
            toast.success('Abono registrado con Ã©xito.');
            onRefresh();
        } catch (error) {
            console.error('Error updating goal:', error);
            toast.error(`No se pudo actualizar la meta: ${(error as any).message}`);
        }
    };

    return (
        <div className="mt-12 bg-[var(--bg-card)] dark:bg-white/5 rounded-[3rem] p-10 border border-[var(--border-color)] dark:border-white/10 shadow-sm animate-fade-in delay-200 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black flex items-center gap-3 text-[var(--text-primary)]">
                        <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                            <Sparkles size={20} />
                        </div>
                        Mis Metas de Ahorro
                    </h2>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Control de ahorro por objetivos especÃ­ficos</p>
                </div>
                <Button primary className="rounded-full px-8 py-4 shadow-xl shadow-accent/20 hover:scale-105 transition-all flex items-center gap-2" onClick={() => setIsGoalFormOpen(true)}>
                    <Plus size={18} /> Nueva Meta
                </Button>
            </div>

            {goals.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-[var(--border-color)] dark:border-white/10 rounded-[2.5rem] group hover:border-accent/30 transition-all cursor-pointer" onClick={() => setIsGoalFormOpen(true)}>
                    <div className="w-16 h-16 bg-neutral-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50 group-hover:scale-110 transition-transform">
                        <TrendingUp size={24} className="text-[var(--text-primary)]" />
                    </div>
                    <p className="text-sm font-bold text-neutral-400">TodavÃ­a no tienes metas activas. Comienza a ahorrar hoy mismo.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => {
                        const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
                        return (
                            <div key={goal.id} className="bg-[var(--bg-card)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform`} style={{ backgroundColor: `${goal.color}20`, color: goal.color }}>
                                        <span className="text-2xl">{goal.icon || 'ðŸŽ¯'}</span>
                                    </div>
                                    <button onClick={() => handleDeleteGoal(goal.id, goal.name)} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-neutral-300 hover:text-red-500 rounded-xl transition-all"><Trash2 size={16} /></button>
                                </div>
                                <h4 className="text-lg font-black mb-1 text-[var(--text-primary)]">{goal.name}</h4>
                                <div className="flex justify-between items-end mb-4">
                                    <span className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--text-primary)]">Progreso</span>
                                    <span className="text-xs font-black text-[var(--text-primary)]">${(goal.current_amount || 0).toLocaleString()} / ${(goal.target_amount || 0).toLocaleString()}</span>
                                </div>
                                <div className="h-2.5 bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden mb-6">
                                    <div className="h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,0,0,0.1)]" style={{ width: `${progress}%`, backgroundColor: goal.color }}></div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl font-black text-[var(--text-primary)]">{Math.round(progress)}%</span>
                                    <button onClick={() => handleUpdateGoalAmount(goal.id, goal.current_amount)} className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline">Abonar capital</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* SAVINGS GOAL MODAL */}
            {isGoalFormOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-primary-dark/40 backdrop-blur-md" onClick={() => setIsGoalFormOpen(false)}></div>
                    <div className="bg-[var(--bg-card)] dark:bg-[#1a1a1a] w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-scale-in border border-[var(--border-color)] dark:border-white/10">
                        <h4 className="text-xl font-black text-[var(--text-primary)] mb-2 flex items-center gap-3">
                            <TrendingUp size={24} className="text-accent" /> Nueva Meta de Ahorro
                        </h4>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-8">Define un objetivo claro para tus finanzas.</p>

                        <form onSubmit={handleAddGoal} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Nombre de la Meta</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        required 
                                        value={goalName} 
                                        onChange={e => setGoalName(e.target.value)}
                                        placeholder="Ej: Fondo de Emergencia"
                                        className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-accent"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20"><User size={16} /></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Monto Objetivo ($)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        required 
                                        value={goalTarget} 
                                        onChange={e => setGoalTarget(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="0.00"
                                        className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-accent"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20"><DollarSign size={16} /></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Fecha LÃ­mite (Opcional)</label>
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        value={goalDeadline} 
                                        onChange={e => setGoalDeadline(e.target.value)}
                                        className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-accent"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20"><Calendar size={16} /></div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button outline className="flex-1 py-4" onClick={() => setIsGoalFormOpen(false)}>Cancelar</Button>
                                <Button 
                                    primary 
                                    className="flex-1 py-4" 
                                    disabled={isSavingGoal}
                                    type="submit"
                                >
                                    Crear Meta
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {ConfirmModal}
        </div>
    );
}

```

## File: src\components\portal\finance\SavingsGoalsView.tsx
```tsx
import React, { useState } from 'react';
import { Plus, TrendingUp, Trash2, Sparkles, User, DollarSign, Calendar } from 'lucide-react';
import Button from '../../ui/Button';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../hooks/useConfirm';
import type { FinanceGoal } from '../../../types/finance';

interface SavingsGoalsViewProps {
    userId: string;
    goals: FinanceGoal[];
    onRefresh: () => void;
}

const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({ userId, goals, onRefresh }) => {
    const { confirm, ConfirmModal } = useConfirm();

    // Savings Goals states
    const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
    const [goalName, setGoalName] = useState('');
    const [goalTarget, setGoalTarget] = useState<number | ''>('');
    const [goalDeadline, setGoalDeadline] = useState('');
    const [isSavingGoal, setIsSavingGoal] = useState(false);

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!goalName || !goalTarget) return;

        setIsSavingGoal(true);
        try {
            const { error } = await supabase.from('finance_goals').insert([{
                user_id: userId,
                name: goalName,
                target_amount: Number(goalTarget),
                current_amount: 0,
                deadline: goalDeadline || null
            }]);

            if (error) throw error;
            toast.success("Meta de ahorro creada");
            setGoalName('');
            setGoalTarget('');
            setGoalDeadline('');
            setIsGoalFormOpen(false);
            onRefresh();
        } catch (error) {
            console.error(error);
            toast.error("Error al crear la meta");
        } finally {
            setIsSavingGoal(false);
        }
    };

    const handleDeleteGoal = async (id: string) => {
        if (!await confirm({
            title: 'Eliminar Meta',
            message: 'Â¿Seguro que quieres eliminar esta meta de ahorro?',
            confirmLabel: 'Eliminar',
            danger: true,
        })) return;
        try {
            const { error } = await supabase.from('finance_goals').delete().eq('id', id);
            if (error) throw error;
            toast.success("Meta eliminada");
            onRefresh();
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar la meta");
        }
    };
    
    const handleUpdateGoalAmount = async (id: string, current: number) => {
        const amount = window.prompt("Â¿CuÃ¡nto deseas abonar a esta meta?", "0");
        if (!amount || isNaN(Number(amount))) return;
        
        try {
            const { error } = await supabase
                .from('finance_goals')
                .update({ current_amount: current + Number(amount) })
                .eq('id', id);
            if (error) throw error;
            toast.success("Ahorro actualizado");
            onRefresh();
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar la meta");
        }
    };

    return (
        <div className="mt-12 bg-[var(--bg-card)] dark:bg-white/5 rounded-[3rem] p-10 border border-[var(--border-color)] dark:border-white/10 shadow-sm animate-fade-in delay-200 relative z-10 w-full mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black flex items-center gap-3 text-[var(--text-primary)]">
                        <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                            <Sparkles size={20} />
                        </div>
                        Mis Metas de Ahorro
                    </h2>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Control de ahorro por objetivos especÃ­ficos</p>
                </div>
                <Button primary className="rounded-full px-8 py-4 shadow-xl shadow-accent/20 hover:scale-105 transition-all flex items-center gap-2" onClick={() => setIsGoalFormOpen(true)}>
                    <Plus size={18} /> Nueva Meta
                </Button>
            </div>

            {goals.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-[var(--border-color)] dark:border-white/10 rounded-[2.5rem] group hover:border-accent/30 transition-all cursor-pointer" onClick={() => setIsGoalFormOpen(true)}>
                    <div className="w-16 h-16 bg-neutral-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50 group-hover:scale-110 transition-transform">
                        <TrendingUp size={24} className="text-[var(--text-primary)]" />
                    </div>
                    <p className="text-sm font-bold text-neutral-400">TodavÃ­a no tienes metas activas. Comienza a ahorrar hoy mismo.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => {
                        const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
                        return (
                            <div key={goal.id} className="bg-[var(--bg-card)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 text-right">
                                    <button 
                                        onClick={() => handleDeleteGoal(goal.id)}
                                        className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-all shadow-sm"
                                        title="Eliminar Meta"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform`} style={{ backgroundColor: `${goal.color || '#3b82f6'}20`, color: goal.color || '#3b82f6' }}>
                                        <span className="text-2xl">{goal.icon || 'ðŸŽ¯'}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-accent uppercase tracking-widest">{progress.toFixed(0)}% Alcanzado</span>
                                    </div>
                                </div>
                                <h4 className="text-lg font-black mb-4 text-[var(--text-primary)]">{goal.name}</h4>
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Acumulado</p>
                                        <p className="text-sm font-black text-accent">${(goal.current_amount || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Objetivo</p>
                                        <p className="text-sm font-black text-[var(--text-primary)] opacity-40">${(goal.target_amount || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="h-3 bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden mb-6 border border-white/5">
                                    <div className="h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,0,0,0.1)]" style={{ width: `${progress}%`, backgroundColor: goal.color || '#10b981' }}></div>
                                </div>
                                <div className="flex justify-center group-hover:block transition-all text-center">
                                    <button 
                                        onClick={() => handleUpdateGoalAmount(goal.id, goal.current_amount)} 
                                        className="px-4 py-2 bg-accent/5 hover:bg-accent text-accent hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all w-full"
                                    >
                                        Abonar Capital
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* SAVINGS GOAL FORM MODAL */}
            {isGoalFormOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-fade-in text-[var(--text-primary)]">
                    <div className="absolute inset-0 bg-primary-dark/40 backdrop-blur-md" onClick={() => setIsGoalFormOpen(false)}></div>
                    <div className="bg-[var(--bg-card)] w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-scale-in border border-[var(--border-color)]">
                        <h4 className="text-xl font-black mb-2 flex items-center gap-3">
                            <TrendingUp size={24} className="text-accent" /> Nueva Meta de Ahorro
                        </h4>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-8">Define un objetivo claro para tus finanzas.</p>

                        <form onSubmit={handleAddGoal} className="space-y-6 relative z-10 w-full text-left">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Nombre de la Meta</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        required 
                                        value={goalName} 
                                        onChange={e => setGoalName(e.target.value)}
                                        placeholder="Ej: Fondo de Emergencia"
                                        className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-accent"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20"><User size={16} /></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Monto Objetivo ($)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        required 
                                        value={goalTarget} 
                                        onChange={e => setGoalTarget(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="0.00"
                                        className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-accent"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20"><DollarSign size={16} /></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Fecha LÃ­mite (Opcional)</label>
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        value={goalDeadline} 
                                        onChange={e => setGoalDeadline(e.target.value)}
                                        className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-accent"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20"><Calendar size={16} /></div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-[var(--border-color)] dark:border-white/5">
                                <Button outline className="flex-1 py-4" onClick={() => setIsGoalFormOpen(false)}>Cancelar</Button>
                                <Button 
                                    primary 
                                    className="flex-1 py-4 shadow-lg shadow-accent/20" 
                                    disabled={isSavingGoal}
                                    type="submit"
                                >
                                    Crear Meta
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {ConfirmModal}
        </div>
    );
};

export default SavingsGoalsView;

```

## File: src\components\portal\finance\SnapshotModal.tsx
```tsx
import { useRef, useState } from 'react';
import { Sparkles, Plus, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from '../../../lib/toast';

interface SnapshotModalProps {
    showSnapshot: boolean;
    setShowSnapshot: (show: boolean) => void;
    summaryData: { concept: string; income: number; expense: number }[];
    uniqueMonths: { label: string; value: string }[];
    selectedMonth: string;
}

export default function SnapshotModal({ 
    showSnapshot, 
    setShowSnapshot, 
    summaryData, 
    uniqueMonths, 
    selectedMonth 
}: SnapshotModalProps) {
    const snapshotRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    if (!showSnapshot) return null;

    const handleDownload = async () => {
        if (!snapshotRef.current) return;
        
        setIsDownloading(true);
        toast.info("Generando imagen...");
        
        try {
            const canvas = await html2canvas(snapshotRef.current, {
                scale: 2, // High resolution
                useCORS: true,
                backgroundColor: null, // Transparent to keep border-radius if needed
            });
            
            const imgData = canvas.toDataURL('image/png');
            
            // Create a temporary link to download
            const link = document.createElement('a');
            link.href = imgData;
            link.download = `Resumen_Financiero_${selectedMonth || 'Global'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success("Â¡Imagen descargada con Ã©xito!");
            setShowSnapshot(false);
        } catch (error) {
            console.error("Error generating snapshot:", error);
            toast.error("Error al generar la imagen.");
        } finally {
            setIsDownloading(false);
        }
    };

    const totalIncome = summaryData.reduce((a, b) => a + b.income, 0);
    const totalExpense = summaryData.reduce((a, b) => a + b.expense, 0);
    const totalBalance = totalIncome - totalExpense;

    const maxExpense = summaryData.length > 0 
        ? summaryData.reduce((prev, current) => (prev.expense > current.expense) ? prev : current)
        : null;

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowSnapshot(false)}></div>
            <div className="relative z-10 w-full max-w-[380px] bg-white rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/20 animate-scale-in flex flex-col">
                
                {/* Contenedor que serÃ¡ capturado por html2canvas */}
                <div ref={snapshotRef} className="bg-gradient-to-br from-primary-dark to-[#1a3033] p-10 text-white relative">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                    
                    <div className="flex justify-between items-start mb-12 relative z-10">
                        <div>
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/5 shadow-xl">
                                <Sparkles size={24} className="text-accent" />
                            </div>
                            <h3 className="text-2xl font-black font-heading leading-tight">Resumen Ejecutivo</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mt-1">
                                {uniqueMonths.find(m => m.value === selectedMonth)?.label || 'General'}
                            </p>
                        </div>
                        {/* El botÃ³n de cerrar no deberÃ­a salir en la captura si lo ponemos fuera del ref, pero por diseÃ±o original estaba aquÃ­ */}
                        <button onClick={() => setShowSnapshot(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-all data-html2canvas-ignore">
                            <Plus size={20} className="rotate-45" />
                        </button>
                    </div>

                    <div className="space-y-8 relative z-10">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Balance Total</p>
                            <p className="text-5xl font-black tracking-tighter">
                                ${totalBalance.toLocaleString()}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-green-400">Ingresos</p>
                                <p className="text-xl font-black text-white/90">
                                    +${totalIncome.toLocaleString()}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-red-400">Gastos</p>
                                <p className="text-xl font-black text-white/90">
                                    -${totalExpense.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-3">Mayor Gasto del Mes</p>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                {maxExpense && maxExpense.expense > 0 ? (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-black uppercase tracking-tight truncate max-w-[150px]">
                                            {maxExpense.concept}
                                        </span>
                                        <span className="text-sm font-black text-red-400">
                                            ${maxExpense.expense.toLocaleString()}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-xs font-bold opacity-30 italic">Sin gastos registrados</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 flex flex-col items-center gap-4 relative z-10">
                        <div className="px-6 py-2 bg-accent/20 rounded-full border border-accent/30">
                            <span className="text-[10px] font-black uppercase tracking-widest text-accent">CCI Portal Clientes</span>
                        </div>
                        <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest">Generado el {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
                
                {/* SecciÃ³n de BotÃ³n de Descarga - Fuera de la captura de html2canvas */}
                <div className="p-6 bg-white dark:bg-[#1a3033] border-t border-neutral-100 dark:border-white/5 mt-auto">
                    <button 
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="w-full py-4 bg-primary-dark text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDownloading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <Download size={16} /> Descargar Imagen
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

```

