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
        id: 'taller-declaraciones',
        title: '1. Taller de Declaraciones Fiscales',
        description: 'Curso práctico sobre el llenado y envío de declaraciones para personas físicas y morales. Ideal para contadores y emprendedores.',
        type: 'paid',
        price: 850,
        duration: '2 horas',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'control-interno-pyme',
        title: '2. Control Interno para PyMEs',
        description: 'Aprende a proteger los activos de tu empresa y optimizar procesos internos para reducir riesgos y fugas de capital.',
        type: 'paid',
        price: 750,
        duration: '1.5 horas',
        image: 'https://images.unsplash.com/photo-1454165833762-02ac4f407d21?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'presupuestos-paso-paso',
        title: '3. Presupuestos Empresariales Paso a Paso',
        description: 'Domina la creación de presupuestos maestros y operativos para proyectar el crecimiento real de tu negocio.',
        type: 'paid',
        price: 600,
        duration: '2 horas',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'excel-basico-intermedio',
        title: '4. Excel: De Básico a Intermedio',
        description: 'Modalidad Intensiva de 4 semanas. Domina fórmulas, tablas dinámicas y análisis de datos esenciales.',
        type: 'paid',
        price: 1200,
        duration: '10 horas (4 semanas)',
        image: 'https://images.unsplash.com/photo-1543286386-713bcd53b371?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'excel-intermedio-avanzado',
        title: '5. Excel: De Intermedio a Avanzado',
        description: 'Modalidad Intensiva de 4 semanas. Macros, automatización avanzada y dashboards estratégicos para contadores.',
        type: 'paid',
        price: 1500,
        duration: '10 horas (4 semanas)',
        image: 'https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=800',
    }
];

export interface Tool {
    id: string;
    title: string;
    description: string;
    downloadUrl: string;
}

export const calculationTools: Tool[] = [
    {
        id: 'calculadora-excel-fiscal',
        title: 'Herramienta de Cálculo en Excel',
        description: 'Plantilla automatizada para el cálculo de impuestos básicos y proyecciones financieras.',
        downloadUrl: '#',
    },
    {
        id: 'carga-batch-diot',
        title: 'Carga Batch para DIOT 2026',
        description: 'Generador masivo de archivos para la Declaración Informativa de Operaciones con Terceros.',
        downloadUrl: '#',
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
