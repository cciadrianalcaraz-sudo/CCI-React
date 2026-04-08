import { useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2 } from 'lucide-react';

export interface ConfirmOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
}

export function useConfirm() {
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const resolveRef = useRef<((val: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setOptions(opts);
        });
    }, []);

    const handle = (val: boolean) => {
        resolveRef.current?.(val);
        resolveRef.current = null;
        setOptions(null);
    };

    const ConfirmModal = options ? createPortal(
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 animate-fade-in">
            <div
                className="absolute inset-0 bg-primary-dark/50 backdrop-blur-sm"
                onClick={() => handle(false)}
            />
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative border border-light-beige animate-scale-in">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${options.danger ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                    {options.danger ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
                </div>
                <h4 className="text-xl font-black text-primary-dark text-center mb-2 tracking-tight">
                    {options.title}
                </h4>
                <p className="text-sm text-neutral-500 text-center leading-relaxed mb-8">
                    {options.message}
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => handle(false)}
                        className="flex-1 py-3 px-4 bg-neutral-100 text-neutral-700 rounded-2xl font-black text-sm hover:bg-neutral-200 transition-all"
                    >
                        {options.cancelLabel || 'Cancelar'}
                    </button>
                    <button
                        onClick={() => handle(true)}
                        className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg ${options.danger ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : 'bg-primary-dark hover:bg-primary shadow-primary-dark/20'}`}
                    >
                        {options.confirmLabel || 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return { confirm, ConfirmModal };
}
