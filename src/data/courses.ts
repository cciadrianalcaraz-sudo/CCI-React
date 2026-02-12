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
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 'control-interno-pyme',
        title: '2. Control Interno para PyMEs',
        description: 'Aprende a proteger los activos de tu empresa y optimizar procesos internos para reducir riesgos y fugas de capital.',
        type: 'paid',
        price: 750,
        duration: '1.5 horas',
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800',
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
        price: 2500,
        duration: '10 horas (4 semanas)',
        image: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
        id: 'excel-intermedio-avanzado',
        title: '5. Excel: De Intermedio a Avanzado',
        description: 'Modalidad Intensiva de 4 semanas. Macros, automatización avanzada y dashboards estratégicos para contadores.',
        type: 'paid',
        price: 3500,
        duration: '10 horas (4 semanas)',
        image: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800',
    }
];

export interface Tool {
    id: string;
    title: string;
    description: string;
    features?: string[];
    downloadUrl: string;
    fileName: string; // El nombre con el que se guardará el archivo
}

export const calculationTools: Tool[] = [
    {
        id: 'flujo-efectivo',
        title: 'Plantilla de Flujo de Efectivo',
        description: 'Controla tus movimientos financieros mensuales de forma automática y visual.',
        features: ['Registro de Ingresos y Egresos', 'Flujo mensual automático', 'Gráfica de rendimiento incluida'],
        downloadUrl: '/tools/flujo-efectivo.xlsx',
        fileName: 'CCI_Flujo_Efectivo.xlsx'
    },
    {
        id: 'punto-equilibrio',
        title: 'Calculadora de Punto de Equilibrio',
        description: 'Determina cuánto necesitas vender para cubrir tus costos y empezar a generar utilidad.',
        features: ['Costos fijos y variables', 'Precio unitario personalizado', 'Resultado automático instantáneo'],
        downloadUrl: '/tools/punto-equilibrio.xlsx',
        fileName: 'CCI_Punto_Equilibrio.xlsx'
    },
    {
        id: 'control-fiscal',
        title: 'Control Fiscal Mensual',
        description: 'Mantén tus obligaciones al día y evita sorpresas con el SAT.',
        features: ['Cálculo de ISR e IVA', 'Gestión de Retenciones', 'Semáforo de cumplimiento fiscal'],
        downloadUrl: '/tools/cf-mensual.xlsx',
        fileName: 'CCI_Control_Fiscal.xlsx'
    },
    {
        id: 'batch-diot-2026',
        title: 'Plantilla Batch DIOT 2026',
        description: 'La herramienta más estratégica para cumplir con la Declaración Informativa de Operaciones con Terceros.',
        features: ['Captura masiva de proveedores', 'RFC validado por formato', 'Exportación lista para carga masiva'],
        downloadUrl: '/tools/diot-2026.xlsm',
        fileName: 'CCI_Batch_DIOT_2026.xlsm'
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
