import React, { useRef } from 'react';
import { Plus, Camera, Sparkles } from 'lucide-react';
import Button from '../../ui/Button';
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
    renderPaymentOptions
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
                    else if (cat.includes('salud') || cat.includes('educación')) setExpenseType('Variable');
                }
                
                toast.success("¡Ticket escaneado con éxito!");
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
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-primary-dark/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-[var(--bg-card)] p-10 rounded-[3rem] border border-[var(--border-color)] shadow-2xl text-center max-w-sm">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping"></div>
                            <div className="relative z-10 w-20 h-20 bg-accent rounded-full flex items-center justify-center text-white shadow-lg">
                                <Sparkles size={32} className="animate-pulse" />
                            </div>
                        </div>
                        <h4 className="text-xl font-black text-[var(--text-primary)] mb-2">Analizando Ticket...</h4>
                        <p className="text-xs text-[var(--text-primary)]/40 font-bold uppercase tracking-widest leading-relaxed">
                            Nuestra IA está extrayendo montos, fechas y conceptos para ti.
                        </p>
                    </div>
                </div>
            )}

            <div className="mb-10 bg-[var(--bg-card)]/50 dark:bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-[var(--border-color)] dark:border-white/10 shadow-sm animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
                
                <h3 className="text-xl font-heading font-black mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center text-white shadow-lg">
                        <Plus size={20} />
                    </div>
                    {isEditing ? 'Editar Movimiento' : 'Registrar Nuevo Movimiento'}
                </h3>

                <div className="mb-8 p-6 bg-accent/[0.08] rounded-[2rem] border-2 border-dashed border-accent/20 flex flex-col md:flex-row items-center justify-between gap-6 group hover:bg-accent/10 transition-all">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                            <Camera size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-accent uppercase tracking-wider">¿Cero escritura manual?</h4>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Escanea tu ticket y deja que la IA llene el formulario por ti.</p>
                        </div>
                    </div>
                    <input type="file" ref={ocrFileInputRef} className="hidden" accept="image/*" onChange={handleOCR} />
                    <Button 
                        primary 
                        className="w-full md:w-auto px-8 py-3.5 flex items-center justify-center gap-2 shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all text-[11px] font-black uppercase tracking-tighter"
                        onClick={() => ocrFileInputRef.current?.click()}
                    >
                        <Camera size={16} /> Smart Scan (AI OCR)
                    </Button>
                </div>

                <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block ml-1">Concepto</label>
                        <input type="text" required value={concept} onChange={e => setConcept(e.target.value)} placeholder="Ej. Despensa, Renta..." className="w-full bg-[var(--bg-card)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-accent transition-all shadow-sm" />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block ml-1">Tipo</label>
                        <select className="w-full bg-[var(--bg-card)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3 text-sm font-black text-[var(--text-primary)] outline-none focus:border-accent" value={expenseType} onChange={e => setExpenseType(e.target.value)}>
                            <option value="Variable">💅 Variable / Lujo</option>
                            <option value="Fijo">🏡 Gasto Fijo</option>
                            <option value="Ahorro">💰 Ahorro / Inversión</option>
                            <option value="Deuda">💳 Pago a Deuda</option>
                            <option value="Ingreso">💵 Ingreso</option>
                            <option value="Traspaso">🔄 Traspaso</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block ml-1">Fecha</label>
                        <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full bg-[var(--bg-card)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-accent" />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block ml-1">Forma de pago</label>
                        <select required value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full bg-[var(--bg-card)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-accent">
                            {renderPaymentOptions()}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block ml-1">Proveedor</label>
                        <input type="text" required value={provider} onChange={e => setProvider(e.target.value)} placeholder="Ej. Walmart..." className="w-full bg-[var(--bg-card)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-accent" />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block ml-1">Ingreso ($)</label>
                        <input type="number" step="0.01" value={income} onChange={e => setIncome(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0.00" className="w-full bg-[var(--bg-card)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3 text-sm font-black text-green-600 outline-none focus:border-accent" />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block ml-1">Gasto ($)</label>
                        <input type="number" step="0.01" value={expense} onChange={e => setExpense(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0.00" className="w-full bg-[var(--bg-card)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3 text-sm font-black text-red-500 outline-none focus:border-accent" />
                    </div>
                    
                    <div className="space-y-2 lg:col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block ml-1">Notas</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalles..." className="w-full bg-[var(--bg-card)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-accent" />
                    </div>

                    <div className="lg:col-span-4 flex justify-end gap-3 pt-6 border-t border-[var(--border-color)]">
                        <Button outline type="button" onClick={onClose}>Cancelar</Button>
                        <Button primary type="submit">
                            {isEditing ? 'Actualizar' : 'Confirmar'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default RecordForm;
