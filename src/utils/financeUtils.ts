/**
 * Formato de fecha sin desajuste de zona horaria (YYYY-MM-DD -> DD/MM/YYYY)
 */
export const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    // Para YYYY-MM-DD, evitamos UTC shifts dividiendo y usando los componentes locales
    if (dateStr.includes('-')) {
        const [year, month, day] = dateStr.split('-');
        // El split puede venir con la hora T00:00:00.000Z si es ISO completa
        const cleanDay = day.split('T')[0];
        return `${cleanDay}/${month}/${year}`;
    }
    return dateStr;
};

/**
 * Normaliza una cadena de fecha a formato YYYY-MM
 */
export const getYearMonth = (dateStr: string): string => {
    if (dateStr.includes('/')) return dateStr.split('/').reverse().join('-').substring(0, 7);
    return dateStr.substring(0, 7);
};

export const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#6366f1', '#ec4899', '#14b8a6', '#84cc16', '#f43f5e', '#a855f7', '#0ea5e9'];
