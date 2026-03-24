import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { Plus, Users, ShieldCheck, Mail, Lock } from 'lucide-react';
import Button from '../ui/Button';
import TicketUploader from './TicketUploader';

// Isolated client just for creating auth users without logging out
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});

interface Profile {
    id: string;
    email: string;
    full_name: string;
    rfc: string;
    advisor_name: string;
    status: 'activo' | 'suspendido' | 'cancelado';
}

interface AdminDashboardProps {
    user: any;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [rfc, setRfc] = useState('');
    const [advisorName, setAdvisorName] = useState('Adrián Alcaraz');
    const [status, setStatus] = useState<'activo' | 'suspendido' | 'cancelado'>('activo');
    
    const [formLoading, setFormLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setProfiles(data as Profile[]);
        } catch (error) {
            console.error("Error loading profiles:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setMessage(null);

        try {
            // 1. Create User in Auth using the isolated client
            const { data: authData, error: authError } = await authClient.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Insert into Profiles using the main client (which has master privileges)
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([{
                        id: authData.user.id,
                        email,
                        full_name: fullName,
                        rfc,
                        advisor_name: advisorName,
                        status
                    }]);

                if (profileError) {
                    console.error("Error creating profile row:", profileError);
                    throw new Error("Usuario creado, pero hubo un error al guardar el perfil. Requiere actualización en base de datos.");
                }

                setMessage({ type: 'success', text: `Usuario ${fullName} creado exitosamente.` });
                loadProfiles();
                resetForm();
                setIsFormOpen(false);
            }
        } catch (error: any) {
            console.error("Error in user creation:", error);
            setMessage({ type: 'error', text: error.message || "Error al crear el usuario." });
        } finally {
            setFormLoading(false);
        }
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setFullName('');
        setRfc('');
        setAdvisorName('Adrián Alcaraz');
        setStatus('activo');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-primary-dark p-8 rounded-[2rem] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg shadow-primary-dark/20">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-accent ring-2 ring-white/10 shrink-0">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold font-heading">Panel de Administración</h2>
                        <p className="text-white/60 text-sm mt-1">Gestión de Clientes y Accesos Maestra</p>
                    </div>
                </div>
                <Button primary onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center gap-2 whitespace-nowrap">
                    <Plus size={18} /> Nuevo Cliente
                </Button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-sm font-bold animate-fade-in ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {message.text}
                </div>
            )}

            {isFormOpen && (
                <div className="bg-white rounded-[2rem] border border-light-beige shadow-sm p-8 animate-slide-in">
                    <h3 className="text-lg font-bold text-primary-dark mb-6">Crear Nuevo Cliente</h3>
                    <form onSubmit={handleCreateUser} className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-wider border-b border-light-beige pb-2">Credenciales de Acceso</h4>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-primary-dark ml-1">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full text-sm border border-light-beige rounded-xl pl-10 pr-4 py-3 outline-none focus:border-accent" placeholder="cliente@empresa.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-primary-dark ml-1">Contraseña Temporal</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                                    <input type="text" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="w-full text-sm border border-light-beige rounded-xl pl-10 pr-4 py-3 outline-none focus:border-accent" placeholder="mínimo 6 caracteres" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-wider border-b border-light-beige pb-2">Datos del Perfil</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-primary-dark ml-1">Nombre Completo / Razón Social</label>
                                    <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full text-sm border border-light-beige rounded-xl px-4 py-3 outline-none focus:border-accent" placeholder="Empresa S.A. de C.V." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-primary-dark ml-1">RFC</label>
                                    <input type="text" required value={rfc} onChange={e => setRfc(e.target.value)} className="w-full text-sm border border-light-beige rounded-xl px-4 py-3 outline-none focus:border-accent uppercase" placeholder="ABC123456T8" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-primary-dark ml-1">Status</label>
                                    <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full text-sm border border-light-beige rounded-xl px-4 py-3 outline-none focus:border-accent bg-white">
                                        <option value="activo">Activo</option>
                                        <option value="suspendido">Suspendido</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-primary-dark ml-1">Asesor Asignado</label>
                                    <input type="text" required value={advisorName} onChange={e => setAdvisorName(e.target.value)} className="w-full text-sm border border-light-beige rounded-xl px-4 py-3 outline-none focus:border-accent" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-light-beige">
                            <Button outline type="button" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                            <Button secondary type="submit" loading={formLoading}>Crear Cuenta</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-[2rem] border border-light-beige shadow-sm overflow-hidden">
                <div className="p-8 border-b border-light-beige">
                    <h3 className="text-lg font-bold text-primary-dark flex items-center gap-2">
                        <Users size={20} className="text-accent" /> 
                        Directorio de Clientes
                    </h3>
                </div>
                
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                        </div>
                    ) : profiles.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 border-b border-light-beige font-bold">Cliente</th>
                                    <th className="p-4 border-b border-light-beige font-bold">Contacto</th>
                                    <th className="p-4 border-b border-light-beige font-bold">Asesor</th>
                                    <th className="p-4 border-b border-light-beige font-bold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-light-beige/50">
                                {profiles.map((profile) => (
                                    <tr key={profile.id} className="hover:bg-[#faf7f2]/50 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-primary-dark">{profile.full_name || 'Sin Nombre'}</p>
                                            <p className="text-xs text-neutral-400 font-medium uppercase">{profile.rfc || 'Sin RFC'}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-medium">{profile.email}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-neutral-600">{profile.advisor_name}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                                profile.status === 'activo' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                profile.status === 'suspendido' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                'bg-red-100 text-red-700 border border-red-200'
                                            }`}>
                                                {profile.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-neutral-400">
                            No hay clientes registrados en el sistema.
                        </div>
                    )}
                </div>
            </div>

            {/* Nueva sección: Bandeja de Tickets Global */}
            <TicketUploader user={user} isMaster={true} />
            
        </div>
    );
}
