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
                            Extrayendo información clave de tu ticket de forma automática.
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
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">Gestión de flujo de caja</p>
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
                                { label: 'Clasificación', value: expenseType, setter: setExpenseType, type: 'select', options: (
                                    <>
                                        <option value="Variable">💅 Variable</option>
                                        <option value="Fijo">🏡 Gasto Fijo</option>
                                        <option value="Ahorro">💰 Inversión</option>
                                        <option value="Deuda">💳 Deudas</option>
                                        <option value="Ingreso">💵 Ingreso</option>
                                        <option value="Traspaso">🔄 Traspaso</option>
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
