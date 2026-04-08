export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
    duration: number;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners: Set<Listener> = new Set();

const notify = () => {
    const snapshot = [...toasts];
    listeners.forEach(l => l(snapshot));
};

const add = (type: ToastType, message: string, duration = 4000): string => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    toasts = [...toasts, { id, type, message, duration }];
    notify();
    if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
    }
    return id;
};

export const dismiss = (id: string) => {
    toasts = toasts.filter(t => t.id !== id);
    notify();
};

export const subscribe = (listener: Listener): (() => void) => {
    listeners.add(listener);
    listener([...toasts]);
    return () => {
        listeners.delete(listener);
    };
};

export const toast = {
    success: (msg: string, duration?: number) => add('success', msg, duration),
    error: (msg: string, duration?: number) => add('error', msg, duration),
    warning: (msg: string, duration?: number) => add('warning', msg, duration),
    info: (msg: string, duration?: number) => add('info', msg, duration),
};
