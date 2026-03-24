import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { UploadCloud, Image as ImageIcon, FileText, CheckCircle, Clock, Download, Loader } from 'lucide-react';
import Button from '../ui/Button';

interface Receipt {
    id: string;
    file_name: string;
    file_path: string;
    status: 'pendiente' | 'procesado';
    created_at: string;
    signed_url?: string;
}

export default function TicketUploader({ user, isMaster }: { user: any, isMaster?: boolean }) {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadReceipts();
    }, [user.id, isMaster]);

    const loadReceipts = async () => {
        setLoading(true);
        try {
            // El RLS de base de datos ahora se encarga mágicamente de filtrar la empresa correcta
            let query = supabase.from('receipts').select('*').order('created_at', { ascending: false });
            
            if (!isMaster) {
                // Vista de cliente: Últimos 30 días, sin filtro de UID para permitir cuentas múltiples en misma empresa
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                query = query.gte('created_at', thirtyDaysAgo.toISOString());
            } else {
                // Vista de Admin
                query = query.eq('status', 'pendiente');
            }

            const { data, error } = await query;
            if (error) throw error;
            
            const rawReceipts = data as unknown as Receipt[];

            // Obtener las firmas criptográficas en bloque para mostrar las previsualizaciones reales de las imágenes
            const paths = rawReceipts.map(r => r.file_path);
            if (paths.length > 0) {
                const { data: urlsData, error: urlsError } = await supabase.storage.from('receipts').createSignedUrls(paths, 3600); // 1 hora de validez
                
                if (!urlsError && urlsData) {
                    rawReceipts.forEach(receipt => {
                        const urlMatch = urlsData.find(u => u.path === receipt.file_path);
                        if (urlMatch && !urlMatch.error) {
                            receipt.signed_url = urlMatch.signedUrl;
                        }
                    });
                }
            }

            setReceipts(rawReceipts);
        } catch (error) {
            console.error("Error loading receipts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('receipts')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { error: dbError } = await supabase
                .from('receipts')
                .insert([{
                    user_id: user.id,
                    file_name: file.name,
                    file_path: filePath,
                    file_url: 'private',
                    status: 'pendiente'
                }]);

            if (dbError) throw dbError;

            loadReceipts();
        } catch (error: any) {
            console.error("Error uploading:", error);
            alert(`Error al subir: ${error.message}`);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDownload = async (filePath: string) => {
        try {
            const { data, error } = await supabase.storage.from('receipts').createSignedUrl(filePath, 60);
            if (error) throw error;
            window.open(data.signedUrl, '_blank');
        } catch (error) {
            console.error("Error downloading:", error);
            alert("No se pudo descargar o abrir el archivo. Quizá el administrador ya lo procesó.");
            loadReceipts();
        }
    };

    const handleMarkProcessed = async (id: string, filePath: string) => {
        if (!confirm('¿Marcar como procesado? Esto eliminará físicamente el archivo del servidor para liberar espacio.')) return;
        
        try {
            const { error: storageError } = await supabase.storage.from('receipts').remove([filePath]);
            if (storageError) console.error("Alerta de storage:", storageError);

            const { error: dbError } = await supabase.from('receipts').update({ status: 'procesado' }).eq('id', id);
            if (dbError) throw dbError;

            loadReceipts();
        } catch (error) {
            console.error("Error processing:", error);
            alert("Error al procesar el ticket.");
        }
    };

    return (
        <div className="bg-white rounded-[2rem] border border-light-beige shadow-sm overflow-hidden animate-fade-in relative">
            <div className="p-8 border-b border-light-beige flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-primary-dark">
                        {isMaster ? 'Bandeja de Tickets Pendientes' : 'Mis Tickets y Facturas'}
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1 max-w-lg">
                        {isMaster ? 'Comprobantes enviados por los clientes listos para captura.' : 'Sube fotos de tus comprobantes. Se eliminarán automáticamente del servidor al procesarse. Todos los perfiles enlazados a tu empresa comparten esta bandeja.'}
                    </p>
                </div>
                
                {!isMaster && (
                    <div>
                        <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*,.pdf" capture="environment" />
                        <Button primary className="flex items-center gap-2 px-6 shadow-md" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                            {uploading ? <Loader className="animate-spin" size={18} /> : <UploadCloud size={18} />}
                            {uploading ? 'Subiendo...' : 'Subir Comprobante'}
                        </Button>
                    </div>
                )}
            </div>

            <div className="p-8">
                {loading ? (
                    <div className="flex justify-center p-12"><Loader className="animate-spin text-accent" size={32} /></div>
                ) : receipts.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-light-beige rounded-[2rem] bg-[#faf7f2]/30">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-neutral-300 mx-auto mb-4 shadow-sm border border-light-beige">
                            <ImageIcon size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-primary-dark mb-2">
                            {isMaster ? 'Bandeja limpia' : 'No hay comprobantes pendientes'}
                        </h3>
                        <p className="text-neutral-500 max-w-sm mx-auto text-sm">
                            {isMaster ? 'Has procesado todos los tickets enviados por tus clientes.' : 'Sube una foto de tu ticket. Aquí aparecerá el historial de tus subidas de los últimos 30 días.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {receipts.map(receipt => {
                            const isPdf = receipt.file_name.toLowerCase().endsWith('.pdf');
                            
                            return (
                                <div key={receipt.id} className="bg-white border border-light-beige rounded-[1.5rem] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
                                    
                                    {/* Thumbnail Area */}
                                    <div className="h-40 bg-neutral-100 flex items-center justify-center relative overflow-hidden group-hover:bg-neutral-200 transition-colors">
                                        {receipt.signed_url && !isPdf ? (
                                            <img src={receipt.signed_url} alt="ticket" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-neutral-300 group-hover:text-accent transition-colors">
                                                {isPdf ? <FileText size={48} /> : <ImageIcon size={48} />}
                                            </div>
                                        )}
                                        {/* Vista Previa Hover overlay */}
                                        <div className="absolute inset-0 bg-primary-dark/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button 
                                                onClick={() => handleDownload(receipt.file_path)}
                                                className="bg-white/20 hover:bg-white text-white hover:text-primary-dark backdrop-blur-md px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 transition-all"
                                            >
                                                <Download size={14} /> Ampliar / Abrir
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <p className="font-bold text-primary-dark text-sm truncate" title={receipt.file_name}>
                                            {receipt.file_name}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1 font-medium pb-4">
                                            <Clock size={12} className={receipt.status === 'pendiente' ? 'text-amber-500' : 'text-green-500'} />
                                            {new Date(receipt.created_at).toLocaleDateString()}
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-3 border-t border-light-beige/50">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${receipt.status === 'pendiente' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                                                {receipt.status}
                                            </span>
                                            
                                            {isMaster && (
                                                <button 
                                                    onClick={() => handleMarkProcessed(receipt.id, receipt.file_path)}
                                                    className="p-1.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"
                                                    title="Marcar como procesado (Elimina imagen)"
                                                >
                                                    <CheckCircle size={14} /> Hecho
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
