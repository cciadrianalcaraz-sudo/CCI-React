export interface Course {
    id: string;
    title: string;
    description: string;
    type: 'free' | 'paid';
    price?: number;
    duration: string;
    image: string;
}

export const courses: Course[] = [
    {
        id: 'intro-fiscal',
        title: 'Introducción a la Estrategia Fiscal',
        description: 'Aprende los conceptos básicos para optimizar la carga tributaria de tu empresa de manera legal y eficiente.',
        type: 'free',
        duration: '2 horas',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'control-interno-pyme',
        title: 'Control Interno para PyMEs',
        description: 'Implementa procesos sólidos para reducir riesgos operativos y mejorar la trazabilidad de tus finanzas.',
        type: 'paid',
        price: 499,
        duration: '5 horas',
        image: 'https://images.unsplash.com/photo-1454165833762-02ac4f407d21?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'nominas-sin-errores',
        title: 'Administración de Nóminas sin Errores',
        description: 'Guía paso a paso para el cumplimiento de IMSS, INFONAVIT e impuestos laborales en México.',
        type: 'paid',
        price: 750,
        duration: '4 horas',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    }
];

export interface NewsItem {
    id: string;
    title: string;
    date: string;
    summary: string;
}

export const news: NewsItem[] = [
    {
        id: 'reformas-2025',
        title: 'Principales Cambios en la Miscelánea Fiscal 2025',
        date: '10 de Febrero, 2026',
        summary: 'Analizamos los puntos clave que impactarán a las PyMES mexicanas este año.',
    },
    {
        id: 'webinar-gratuito',
        title: 'Próximo Webinar: Optimización de Flujo de Efectivo',
        date: '05 de Febrero, 2026',
        summary: 'Únete a nuestra sesión práctica sobre cómo liberar recursos atrapados en tu operación.',
    }
];
