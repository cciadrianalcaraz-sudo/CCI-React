import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { subscribe, dismiss } from '../../lib/toast';
import type { ToastItem } from '../../lib/toast';

const ICONS = {
    success: <CheckCircle2 size={18} className="text-green-500 shrink-0" />,
    error:   <XCircle size={18} className="text-red-500 shrink-0" />,
    warning: <AlertTriangle size={18} className="text-amber-500 shrink-0" />,
    info:    <Info size={18} className="text-blue-500 shrink-0" />,
};

const BG = {
    success: 'border-green-100 bg-green-50/80',
    error:   'border-red-100 bg-red-50/80',
    warning: 'border-amber-100 bg-amber-50/80',
    info:    'border-blue-100 bg-blue-50/80',
};

function Toast({ item }: { item: ToastItem }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // trigger enter animation
        const t = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(t);
    }, []);

    return (
        <div
            className={`flex items-start gap-3 w-full max-w-sm px-4 py-3.5 rounded-2xl border shadow-lg backdrop-blur-md transition-all duration-300 ${BG[item.type]} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
            {ICONS[item.type]}
            <p className="text-xs font-bold text-primary-dark flex-1 leading-relaxed">{item.message}</p>
            <button
                onClick={() => dismiss(item.id)}
                className="opacity-40 hover:opacity-100 transition-opacity p-0.5 rounded-lg hover:bg-black/5"
            >
                <X size={14} />
            </button>
        </div>
    );
}

export function Toaster() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    useEffect(() => {
        return subscribe(setToasts);
    }, []);

    if (toasts.length === 0) return null;

    return createPortal(
        <div className="fixed bottom-6 right-6 z-[500] flex flex-col gap-3 items-end pointer-events-none">
            {toasts.map(t => (
                <div key={t.id} className="pointer-events-auto w-full max-w-sm">
                    <Toast item={t} />
                </div>
            ))}
        </div>,
        document.body
    );
}
