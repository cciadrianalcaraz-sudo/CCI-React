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
            // Clients see only their own, last 30 days. Admin sees all pending.
            let query = supabase.from('receipts').select('*').order('created_at', { ascending: false });
            
            if (!isMaster) {
                // Client view: only theirs, last 30 days
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                query = query.eq('user_id', user.id).gte('created_at', thirtyDaysAgo.toISOString());
            } else {
                // Admin view: only pending across all users
                query = query.eq('status', 'pendiente');
            }

            const { data, error } = await query;
            if (error) throw error;
            setReceipts(data as unknown as Receipt[]);
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

            // Upload to Supabase Storage - Private Bucket
            const { error: uploadError } = await supabase.storage
                .from('receipts')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Insert into Database
            const { error: dbError } = await supabase
                .from('receipts')
                .insert([{
                    user_id: user.id,
                    file_name: file.name,
                    file_path: filePath,
                    file_url: 'private', // Ignored since we use signed urls
                    status: 'pendiente'
                }]);

            if (dbError) throw dbError;

            loadReceipts();
            alert('¡Comprobante subido exitosamente!');
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
            // Generamos una firma criptográfica que dura 60 segundos
            const { data, error } = await supabase.storage.from('receipts').createSignedUrl(filePath, 60);
            if (error) throw error;
            
            // Abrimos en una nueva pestaña (seguro y temporal)
            window.open(data.signedUrl, '_blank');
        } catch (error) {
            console.error("Error downloading:", error);
            alert("No se pudo descargar o abrir el archivo. Quizá el administrador ya lo procesó.");
            loadReceipts(); // Recargar por si ya no existe
        }
    };

    const handleMarkProcessed = async (id: string, filePath: string) => {
        if (!confirm('¿Marcar como procesado? Esto eliminará físicamente el archivo del servidor para liberar espacio.')) return;
        
        try {
            // 1. Eliminamos el archivo físico del Storage (Magia de ahorro de espacio)
            const { error: storageError } = await supabase.storage.from('receipts').remove([filePath]);
            if (storageError) console.error("Could not delete from storage, but updating DB...", storageError);

            // 2. Actualizamos el registro en BD para que ya no salga
            const { error: dbError } = await supabase.from('receipts').update({ status: 'procesado' }).eq('id', id);
            if (dbError) throw dbError;

            loadReceipts();
        } catch (error) {
            console.error("Error processing:", error);
            alert("Error al procesar el ticket.");
        }
    };

    return (
        <div className="bg-white rounded-[2rem] border border-light-beige shadow-sm overflow-hidden animate-fade-in">
            <div className="p-8 border-b border-light-beige flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-primary-dark">
                        {isMaster ? 'Bandeja de Tickets Pendientes' : 'Mis Tickets y Facturas'}
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                        {isMaster ? 'Comprobantes enviados por los clientes listos para captura.' : 'Sube fotos de tus comprobantes. Se eliminarán automáticamente del servidor después de procesarse.'}
                    </p>
                </div>
                
                {!isMaster && (
                    <div>
                        <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*,.pdf" capture="environment" />
                        <Button primary className="flex items-center gap-2 px-6" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
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
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {receipts.map(receipt => (
                            <div key={receipt.id} className="bg-white border border-light-beige rounded-[1.5rem] p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-accent shrink-0 group-hover:bg-accent group-hover:text-white transition-colors">
                                        {receipt.file_name.toLowerCase().endsWith('.pdf') ? <FileText size={20} /> : <ImageIcon size={20} />}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-primary-dark text-sm truncate" title={receipt.file_name}>
                                            {receipt.file_name}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1.5 font-medium">
                                            <Clock size={12} className="text-amber-500" />
                                            {new Date(receipt.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-light-beige/50">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${receipt.status === 'pendiente' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                        <Clock size={12} /> {receipt.status}
                                    </span>
                                    
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleDownload(receipt.file_path)}
                                            className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                            title="Ver / Descargar"
                                        >
                                            <Download size={16} />
                                        </button>
                                        
                                        {isMaster && (
                                            <button 
                                                onClick={() => handleMarkProcessed(receipt.id, receipt.file_path)}
                                                className="p-2 text-neutral-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                                                title="Marcar como procesado (Elimina imagen)"
                                            >
                                                <CheckCircle size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
