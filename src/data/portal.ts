export interface PortalDoc {
    id: string;
    name: string;
    type: string;
    date: string;
    status: 'descargado' | 'pendiente';
}

export interface PortalStat {
    label: string;
    value: string;
    trend?: string;
    status: 'success' | 'warning' | 'info';
}

export const portalStats: PortalStat[] = [
    {
        label: 'Estado Fiscal',
        value: 'Cumplimiento Positivo',
        status: 'success'
    },
    {
        label: 'Próxima Declaración',
        value: '31 de Marzo',
        trend: 'En 34 días',
        status: 'warning'
    },
    {
        label: 'Documentos Nuevos',
        value: '4',
        status: 'info'
    }
];

export const portalDocs: PortalDoc[] = [
    {
        id: '1',
        name: 'Opinión de Cumplimiento (32-D)',
        type: 'PDF',
        date: '15 Feb 2026',
        status: 'pendiente'
    },
    {
        id: '2',
        name: 'Declaración Mensual Enero 2026',
        type: 'PDF',
        date: '10 Feb 2026',
        status: 'descargado'
    },
    {
        id: '3',
        name: 'Constancia de Situación Fiscal',
        type: 'PDF',
        date: '02 Ene 2026',
        status: 'descargado'
    },
    {
        id: '4',
        name: 'Balance General - Diciembre 2025',
        type: 'PDF',
        date: '20 Ene 2026',
        status: 'pendiente'
    }
];

export const portalNews = [
    {
        date: 'hace 2 días',
        text: 'Tu opinión de cumplimiento ya está disponible para descarga.'
    },
    {
        date: 'hace 1 semana',
        text: 'Recordatorio: Enviar papelería para cierre de mes.'
    }
];
