export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string; // We can use HTML or Markdown here
    date: string;
    author: string;
    category: 'Fiscal' | 'Legal' | 'Finanzas' | 'Estrategia';
    readTime: string;
    image: string;
    featured?: boolean;
}

export const blogPosts: BlogPost[] = [
    {
        id: 'errores-declaracion-anual',
        title: '5 Errores Fatales en tu Declaración Anual que el SAT no te perdonará',
        excerpt: 'Descubre los descuidos más comunes que pueden convertir tu saldo a favor en una auditoría o una multa innecesaria.',
        content: `
            <p>La temporada de declaración anual es uno de los momentos más estresantes para los contribuyentes en México. Sin embargo, la mayoría de los problemas no surgen por falta de pago, sino por errores técnicos que podrían evitarse con una revisión previa.</p>
            
            <h2>1. No verificar el Visor de Deducciones Personales</h2>
            <p>Muchos contribuyentes dan por hecho que todas sus facturas de gastos médicos o colegiaturas están cargadas correctamente. Error. Si el CFDI no tiene el "Uso de CFDI" correcto o fue pagado en efectivo siendo mayor a $2,000, el SAT lo rechazará automáticamente.</p>
            
            <h2>2. Omitir ingresos exentos</h2>
            <p>Si recibiste préstamos, donativos o premios que en lo individual o en su conjunto excedan de $600,000 pesos, estás obligado a informarlos. No hacerlo puede causar que el SAT los considere ingresos gravables.</p>
            
            <h2>3. No conciliar los CFDI de nómina</h2>
            <p>Los visores del SAT a veces duplican recibos de nómina. Es vital que revises que lo que dice el portal coincida exactamente con lo que recibiste en tu cuenta bancaria.</p>
            
            <blockquote>"La prevención es la mejor estrategia fiscal. Revisar tu información antes de abril te da un margen de maniobra que no tendrás el 30 de marzo."</blockquote>
            
            <p>En CCI, te recomendamos iniciar tu revisión a más tardar la segunda semana de marzo para que tengas tiempo de solicitar correcciones a tus proveedores o patrones si es necesario.</p>
        `,
        date: '11 de Marzo, 2026',
        author: 'Adrian Alcaraz',
        category: 'Fiscal',
        readTime: '5 min',
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
        featured: true
    },
    {
        id: 'planeacion-fiscal-pymes',
        title: 'Estrategias de Planeación Fiscal para PyMEs en 2026',
        excerpt: 'Cómo optimizar la carga tributaria de tu empresa de manera legal y ética para reinvertir en crecimiento.',
        content: `
            <p>La planeación fiscal no se trata de evadir, sino de utilizar las herramientas que la ley otorga para optimizar los recursos financieros de la empresa.</p>
            <h2>Aprovechamiento de Estímulos</h2>
            <p>Existen diversos estímulos fiscales para ciertos sectores o actividades de investigación y desarrollo que muchas PyMEs ignoran por falta de asesoría especializada.</p>
        `,
        date: '05 de Marzo, 2026',
        author: 'Equipo CCI',
        category: 'Estrategia',
        readTime: '7 min',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'guia-impuestos-ahorro',
        title: 'Guía Definitiva: ¿Cómo transformar tus impuestos en ahorro real?',
        excerpt: 'Aprende a ver tus obligaciones fiscales como una oportunidad para estructurar mejor tus finanzas personales.',
        content: `
            <p>Los impuestos son inevitables, pero el monto final que pagas depende en gran medida de tu estructura financiera.</p>
        `,
        date: '28 de Febrero, 2026',
        author: 'Adrian Alcaraz',
        category: 'Finanzas',
        readTime: '4 min',
        image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800'
    }
];
