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
        id: 'guia-sat-2026',
        title: 'Guía 2026: Cómo darse de alta en el SAT paso a paso',
        excerpt: 'Iniciar actividades económicas implica cumplir con obligaciones fiscales. Te explicamos cómo registrarte de forma correcta y legal.',
        content: `
            <p>Iniciar actividades económicas en México implica cumplir con obligaciones fiscales ante el Servicio de Administración Tributaria (SAT). Darse de alta correctamente es el primer paso para operar legalmente, emitir facturas y evitar sanciones fiscales.</p>
            
            <h2>¿Quién debe darse de alta en el SAT?</h2>
            <p>Deben inscribirse en el RFC las personas que:</p>
            <ul>
                <li>Inician un negocio</li>
                <li>Trabajan por honorarios</li>
                <li>Rentan un inmueble</li>
                <li>Reciben ingresos por plataformas digitales</li>
                <li>Tienen un empleo formal</li>
            </ul>

            <h2>Paso 1: Preinscripción en línea</h2>
            <p>Debes ingresar al portal del SAT y realizar la preinscripción al RFC. Se te solicitarán datos como:</p>
            <ul>
                <li>CURP y Nombre completo</li>
                <li>Fecha de nacimiento</li>
                <li>Domicilio fiscal</li>
                <li>Actividad económica</li>
            </ul>

            <h2>Paso 2: Generar cita en el SAT</h2>
            <p>Después de la preinscripción deberás agendar una cita para finalizar el trámite en una oficina desconcentrada.</p>

            <h2>Paso 3: Acudir a la oficina del SAT</h2>
            <p>Es indispensable llevar identificación oficial, CURP, comprobante de domicilio y una unidad USB para guardar tu e.firma.</p>

            <h2>Paso 4: Obtener tu e.firma</h2>
            <p>La firma electrónica (e.firma) es indispensable para presentar declaraciones, firmar trámites y emitir facturas electrónicas.</p>

            <blockquote>"Elegir correctamente tu régimen fiscal desde el inicio determinará tus impuestos a pagar y las deducciones permitidas."</blockquote>

            <p>Darse de alta correctamente evita problemas fiscales futuros. Si necesitas asesoría para elegir tu régimen fiscal, en <strong>CCI Consultoría Contable Integral</strong> podemos ayudarte.</p>
        `,
        date: '11 de Marzo, 2026',
        author: 'Adrian Alcaraz',
        category: 'Fiscal',
        readTime: '6 min',
        image: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'declaracion-anual-2026-pf',
        title: 'Declaración anual de personas físicas 2026: lo que debes saber',
        excerpt: 'En abril de 2026 deberás declarar los ingresos de 2025. Conoce quiénes están obligados y qué puedes deducir.',
        content: `
            <p>Cada año los contribuyentes deben presentar su declaración anual ante el SAT. En abril de 2026, las personas físicas deberán declarar los ingresos obtenidos durante el ejercicio 2025.</p>
            
            <h2>¿Quiénes están obligados?</h2>
            <p>Deben presentar declaración anual quienes:</p>
            <ul>
                <li>Tuvieron ingresos por honorarios o arrendamiento.</li>
                <li>Obtuvieron ingresos de plataformas digitales.</li>
                <li>Trabajaron para dos o más patrones.</li>
                <li>Percibieron ingresos mayores a $400,000 anuales.</li>
            </ul>

            <h2>Deducciones personales permitidas</h2>
            <p>Aprovechar las deducciones puede generar un saldo a favor. Algunas permitidas son:</p>
            <ul>
                <li>Gastos médicos, dentales y hospitalarios.</li>
                <li>Intereses reales de créditos hipotecarios.</li>
                <li>Colegiaturas y donativos autorizados.</li>
            </ul>

            <blockquote>"Presentar tu declaración a tiempo no solo es una obligación, es una oportunidad para obtener devoluciones de impuestos."</blockquote>

            <p>Te recomendamos verificar tus facturas deducibles y revisar los ingresos precargados antes del plazo límite para evitar contratiempos.</p>
        `,
        date: '10 de Marzo, 2026',
        author: 'Equipo CCI',
        category: 'Fiscal',
        readTime: '5 min',
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'materialidad-operaciones-fiscales',
        title: 'Materialidad en operaciones fiscales: qué es y por qué es importante',
        excerpt: 'No basta con tener una factura. Demostrar que una operación realmente ocurrió es clave para evitar que el SAT la considere simulación.',
        content: `
            <p>Las autoridades fiscales utilizan el criterio de materialidad para verificar si una operación realmente ocurrió o fue simulada para evadir impuestos.</p>
            
            <h2>¿Qué es la materialidad?</h2>
            <p>La materialidad implica demostrar que una operación existió realmente, se realizó con recursos reales y generó efectos económicos para la empresa.</p>

            <h2>Documentos que acreditan materialidad</h2>
            <p>Para sustentar tus operaciones comerciales, es vital conservar:</p>
            <ul>
                <li>Contratos y cotizaciones debidamente firmados.</li>
                <li>Transferencias bancarias y estados de cuenta.</li>
                <li>Evidencia de entrega de bienes (guías de envío, fotografías).</li>
                <li>Reportes de trabajo y correos electrónicos de seguimiento.</li>
            </ul>

            <h2>Riesgos de no demostrarla</h2>
            <p>Sin sustento suficiente, el SAT puede rechazar deducciones, cancelar sellos digitales o determinar créditos fiscales severos.</p>

            <p>Recordemos: <strong>No basta con tener una factura</strong>; se debe demostrar que la operación realmente tuvo lugar en el mundo físico y económico.</p>
        `,
        date: '08 de Marzo, 2026',
        author: 'Adrian Alcaraz',
        category: 'Legal',
        readTime: '7 min',
        image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'errores-fiscales-comunes',
        title: 'Errores fiscales comunes que pueden generarte multas',
        excerpt: 'Muchos contribuyentes enfrentan sanciones por descuidos que podrían evitarse con una administración correcta. Evita estos 4 errores.',
        content: `
            <p>Muchos contribuyentes enfrentan sanciones fiscales por errores operativos que pueden evitarse fácilmente con orden y asesoría.</p>
            
            <h2>Error 1: No presentar declaraciones</h2>
            <p>Esto puede generar multas que van desde $1,400 hasta más de $17,000 pesos dependiendo de la omisión y el tiempo transcurrido.</p>

            <h2>Error 2: Emitir facturas incorrectas</h2>
            <p>Capturar mal el RFC, el Uso del CFDI o el Régimen Fiscal puede invalidar la operación y causar problemas tanto al emisor como al receptor.</p>

            <h2>Error 3: No conservar documentación</h2>
            <p>La ley obliga a conservar la documentación contable durante un mínimo de 5 años. No tenerla disponible en una auditoría es causal de sanciones.</p>

            <h2>Error 4: No revisar el buzón tributario</h2>
            <p>El SAT envía notificaciones importantes por este medio. Ignorarlas no detiene el proceso legal y puede llevar a sorpresas desagradables.</p>

            <p>Una correcta administración fiscal inspirada en el control interno puede ahorrarte miles de pesos en multas innecesarias.</p>
        `,
        date: '05 de Marzo, 2026',
        author: 'Equipo CCI',
        category: 'Estrategia',
        readTime: '4 min',
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'cfdi-4-req-clave',
        title: 'CFDI 4.0: requisitos clave que debes revisar antes de facturar',
        excerpt: 'Asegura que tus facturas sean válidas revisando los datos obligatorios del emisor y receptor bajo el estándar actual.',
        content: `
            <p>Actualmente todas las facturas electrónicas en México se emiten bajo el estándar CFDI 4.0, lo que exige una precisión absoluta en los datos.</p>
            
            <h2>Datos obligatorios del receptor</h2>
            <p>Para que una factura sea deducible, necesitas que estos datos coincidan exactamente con la Constancia de Situación Fiscal:</p>
            <ul>
                <li>Nombre completo o razón social (sin el régimen de capital).</li>
                <li>RFC y Código postal del domicilio fiscal.</li>
                <li>Régimen fiscal y Uso del CFDI.</li>
            </ul>

            <h2>Errores comunes al facturar</h2>
            <p>Los fallos más frecuentes incluyen capturar mal el nombre, ignorar el código postal actualizado o usar un Uso de CFDI que el régimen del cliente no permite.</p>

            <p><strong>Recomendación:</strong> Solicita siempre la Constancia de Situación Fiscal actualizada a tus clientes antes de emitir su primer factura en el periodo.</p>
        `,
        date: '01 de Marzo, 2026',
        author: 'Adrian Alcaraz',
        category: 'Finanzas',
        readTime: '4 min',
        image: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
];
