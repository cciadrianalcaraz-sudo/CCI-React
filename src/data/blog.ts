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
        id: 'resico-oportunidades-riesgos-2026',
        title: 'RESICO 2026: Cómo mantener sus beneficios fiscales sin sorpresas',
        excerpt: 'El Régimen Simplificado de Confianza ofrece tasas de ISR muy bajas, pero un solo descuido puede hacerte perder el beneficio. Conoce las reglas clave.',
        content: `
            <p>El Régimen Simplificado de Confianza (RESICO) se ha consolidado en 2026 como una de las mejores opciones para personas físicas con actividades empresariales, profesionales o de arrendamiento. Sus tasas mínimas de Impuesto sobre la Renta (ISR), que oscilan entre el 1% y el 2.5%, representan un gran alivio financiero. Sin embargo, gozar de este beneficio conlleva una disciplina fiscal estricta.</p>
            
            <h2>Los límites que no debes superar</h2>
            <p>El límite de ingresos permitidos para tributar en RESICO es de <strong>$3.5 millones de pesos anuales</strong>. Si superas esta cantidad en el ejercicio fiscal actual o en el inmediato anterior, el SAT te excluirá de manera automática, obligándote a tributar en el Régimen de Actividad Empresarial o Arrendamiento de forma retroactiva.</p>

            <h2>Los 3 riesgos críticos que causan expulsión</h2>
            <p>Muchos contribuyentes han perdido este beneficio no por superar los ingresos, sino por descuidos de control administrativo:</p>
            <ul>
                <li><strong>No presentar la Declaración Anual:</strong> Esta es la causa número uno de salida del régimen. La declaración debe presentarse a tiempo para consolidar los pagos mensuales.</li>
                <li><strong>Retrasos en declaraciones mensuales:</strong> Omitir tres o más pagos provisionales consecutivos o no consecutivos te deja fuera de RESICO de manera irrevocable.</li>
                <li><strong>No contar con e.firma activa:</strong> La firma electrónica vigente es obligatoria. El SAT realiza revisiones periódicas y suspende a quienes no la tengan actualizada.</li>
            </ul>

            <blockquote>"Tributar en RESICO es un privilegio fiscal que requiere un control interno impecable. Un solo error puede costar miles de pesos en impuestos retroactivos."</blockquote>

            <h2>Recomendaciones para blindar tu RESICO en 2026</h2>
            <p>Te aconsejamos monitorear tu Opinión de Cumplimiento de forma mensual (debe mantenerse en 'Positiva'), revisar que tu Buzón Tributario tenga medios de contacto vigentes y proyectar tus ingresos con anticipación si estás cerca del límite de los 3.5 millones. En <strong>CCI Consultoría Contable Integral</strong>, automatizamos este monitoreo para que operes con total tranquilidad.</p>
        `,
        date: '08 de Junio, 2026',
        author: 'Adrian Alcaraz',
        category: 'Fiscal',
        readTime: '5 min',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
        featured: true
    },
    {
        id: 'planeacion-financiera-segundo-semestre-2026',
        title: 'Planeación Financiera para el Segundo Semestre: Estrategias de Crecimiento',
        excerpt: 'A mitad de año, es crucial evaluar los presupuestos y proyectar el flujo de efectivo para el cierre del ejercicio. Te damos un roadmap práctico.',
        content: `
            <p>Llegar al meridiano del año fiscal es el momento perfecto para evaluar la trayectoria financiera de tu negocio. Una planeación financiera activa a mitad de año permite corregir desviaciones, optimizar recursos y preparar el cierre de ejercicio con ventajas fiscales óptimas.</p>
            
            <h2>1. Análisis de Variaciones (Presupuestado vs. Real)</h2>
            <p>El primer paso consiste en comparar los números reales del primer semestre con el presupuesto original. Debes identificar:</p>
            <ul>
                <li>¿Qué líneas de negocio o productos superaron las metas y cuáles quedaron rezagados?</li>
                <li>¿Existen sobrecostos operativos que deban recortarse de inmediato?</li>
                <li>¿El margen de utilidad neta se alinea con la meta proyectada?</li>
            </ul>

            <h2>2. Proyección de Flujo de Efectivo (Cashflow Forecast)</h2>
            <p>La liquidez es el oxígeno de la empresa. Te sugerimos realizar una proyección de ingresos y gastos para los próximos 6 meses. Esto te permitirá planificar inversiones de capital (CapEx), saber si necesitarás financiamiento temporal o si cuentas con excedentes para liquidar deudas caras.</p>

            <h2>3. Precierre Fiscal Preventivo</h2>
            <p>No esperes a diciembre para calcular tus impuestos. Realizar un cálculo estimado del impuesto anual en junio/julio te da margen de maniobra para tomar decisiones estratégicas: deducir inversiones necesarias, ajustar el coeficiente de utilidad o programar gastos deducibles autorizados antes de que termine el año.</p>

            <blockquote>"La planeación financiera no predice el futuro, pero te prepara para resistir imprevistos y aprovechar oportunidades antes que tu competencia."</blockquote>

            <p>Contar con herramientas digitales adecuadas facilita este proceso. En nuestro <strong>Portal de Clientes CCI</strong>, puedes ver gráficos en tiempo real de tu flujo y controlar tus presupuestos para que tomes decisiones con datos duros y claridad absoluta.</p>
        `,
        date: '05 de Junio, 2026',
        author: 'Equipo CCI',
        category: 'Finanzas',
        readTime: '6 min',
        image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'cfdi-4-req-clave',
        title: 'CFDI 4.0: requisitos clave que debes revisar antes de facturar',
        excerpt: 'Asegura que tus facturas sean válidas revisando los datos obligatorios del emisor y receptor bajo el estándar actual.',
        content: `
            <p>Todas las facturas electrónicas en México se emiten bajo el estándar CFDI 4.0, lo que exige una precisión absoluta en los datos. El SAT valida automáticamente los datos fiscales del emisor y receptor en cada timbrado.</p>
            
            <h2>Datos obligatorios del receptor</h2>
            <p>Para que una factura sea válida y deducible, necesitas verificar que los siguientes campos coincidan exactamente con la Constancia de Situación Fiscal actualizada del cliente:</p>
            <ul>
                <li><strong>Nombre o Razón Social:</strong> Debe capturarse en mayúsculas y sin incluir el régimen de capital (por ejemplo, omitir "S.A. de C.V.").</li>
                <li><strong>RFC:</strong> Sin errores ni espacios.</li>
                <li><strong>Código Postal:</strong> El correspondiente al domicilio fiscal registrado del receptor.</li>
                <li><strong>Régimen Fiscal:</strong> Debe ser coherente con el tipo de deducción que aplicará.</li>
            </ul>

            <h2>Errores comunes al facturar en 2026</h2>
            <p>Los fallos más frecuentes que provocan el rechazo de facturas incluyen el uso incorrecto de las claves de productos/servicios, ingresar un Uso de CFDI incompatible con el régimen fiscal del receptor, o capturar mal el código postal por mudanzas no notificadas ante el SAT.</p>

            <blockquote>"Solicitar siempre la Constancia de Situación Fiscal actualizada a tus clientes antes de emitir la primera factura es la mejor práctica para evitar cancelaciones y retrabajos."</blockquote>

            <p>Mantener tus procesos de facturación en orden reduce la carga administrativa y agiliza los cobros. Si requieres asesoría para implementar flujos de facturación eficientes y libres de errores, nuestro equipo en CCI está a tu disposición.</p>
        `,
        date: '01 de Junio, 2026',
        author: 'Adrian Alcaraz',
        category: 'Finanzas',
        readTime: '4 min',
        image: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
        id: 'errores-fiscales-comunes',
        title: 'Errores fiscales comunes que pueden generarte multas de inmediato',
        excerpt: 'Muchos contribuyentes enfrentan sanciones por descuidos que podrían evitarse con una administración correcta. Evita estos 4 errores.',
        content: `
            <p>Muchos contribuyentes enfrentan sanciones fiscales no por evadir impuestos de forma consciente, sino por errores operativos y descuidos administrativos que pueden evitarse fácilmente implementando orden y control interno.</p>
            
            <h2>Error 1: No presentar declaraciones (o hacerlo a destiempo)</h2>
            <p>Esto puede generar requerimientos y multas que van desde $1,400 hasta más de $17,000 pesos por cada obligación omitida. Además, esto puede manchar tu Opinión de Cumplimiento y retirarte de regímenes benéficos como el RESICO.</p>

            <h2>Error 2: Emitir facturas con método de pago incorrecto</h2>
            <p>Confundir "PUE" (Pago en una sola exhibición) con "PPD" (Pago en parcialidades o diferido) es un error grave. Si emites un CFDI PUE y no te lo pagan en el mes corriente, el SAT asumirá que ya cobraste ese dinero y te exigirá el pago de impuestos correspondiente.</p>

            <h2>Error 3: No conservar la contabilidad y su materialidad</h2>
            <p>La ley obliga a conservar la documentación contable y comprobantes de las operaciones durante un mínimo de 5 años. En caso de una auditoría, no contar con los estados de cuenta, contratos o entregables que demuestren las transacciones puede invalidar las deducciones.</p>

            <h2>Error 4: No revisar el Buzón Tributario</h2>
            <p>El Buzón Tributario es el medio oficial de comunicación del SAT. Ignorar las notificaciones o no tener actualizados los medios de contacto es motivo de multas y puede resultar en una determinación fiscal perjudicial sin tu conocimiento oportuno.</p>

            <blockquote>"Una administración fiscal preventiva apoyada en un buen control de procesos ahorra tiempo, dinero y elimina el estrés de las notificaciones del SAT."</blockquote>

            <p>En CCI Consultoría Contable Integral te ayudamos a auditar tus procesos administrativos para erradicar estos errores comunes antes de que se traduzcan en sanciones.</p>
        `,
        date: '18 de Mayo, 2026',
        author: 'Equipo CCI',
        category: 'Estrategia',
        readTime: '4 min',
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'materialidad-operaciones-fiscales',
        title: 'Materialidad en operaciones fiscales: qué es y por qué es importante',
        excerpt: 'No basta con tener una factura. Demostrar que una operación realmente ocurrió es clave para evitar que el SAT la considere simulación.',
        content: `
            <p>En las auditorías actuales del SAT, contar con un CFDI y el registro contable de una operación ya no es suficiente. Las autoridades fiscales exigen comprobar la "materialidad" de la transacción para descartar que se trate de operaciones simuladas destinadas a la deducción indebida de impuestos.</p>
            
            <h2>¿Qué es la materialidad?</h2>
            <p>La materialidad es la evidencia objetiva de que una transacción realmente existió en el mundo real: que el servicio fue prestado o el bien fue entregado, y que la empresa cuenta con la infraestructura, personal y recursos para haberlo llevado a cabo.</p>

            <h2>Elementos clave para demostrar la materialidad</h2>
            <p>Para proteger tus deducciones y asegurar la validez de tus operaciones, debes armar un expediente que contenga:</p>
            <ul>
                <li><strong>Contratos:</strong> Firmados por las partes, preferentemente con fecha cierta (certificación notarial o firma electrónica avanzada).</li>
                <li><strong>Entregables y reportes:</strong> Documentación detallada del trabajo realizado (presentaciones, correos electrónicos, bitácoras de avance).</li>
                <li><strong>Evidencia física y digital:</strong> Fotografías, hojas de recepción de mercancía, guías de envío de paquetería, cotizaciones previas.</li>
                <li><strong>Medios de pago:</strong> Transferencias bancarias claras que vinculen las cuentas autorizadas de las empresas involucradas.</li>
            </ul>

            <blockquote>"Ante una auditoría del SAT, el contribuyente tiene la carga de la prueba. Un expediente sólido de materialidad es tu mejor defensa fiscal."</blockquote>

            <p>Implementar políticas de control interno para archivar y organizar esta evidencia desde el momento en que se contrata un servicio es fundamental. En CCI asesoramos a las empresas en el diseño de estos expedientes de soporte para blindar su operación fiscal.</p>
        `,
        date: '25 de Mayo, 2026',
        author: 'Adrian Alcaraz',
        category: 'Legal',
        readTime: '7 min',
        image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'guia-sat-2026',
        title: 'Guía 2026: Cómo darse de alta en el SAT paso a paso',
        excerpt: 'Iniciar actividades económicas implica cumplir con obligaciones fiscales. Te explicamos cómo registrarte de forma correcta y legal.',
        content: `
            <p>Iniciar un negocio, comenzar a trabajar bajo el esquema de honorarios profesionales, rentar una propiedad o emprender en plataformas digitales implica cumplir con obligaciones fiscales ante el SAT. Darse de alta correctamente es el primer paso indispensable para operar dentro del marco de la ley y poder facturar a tus clientes.</p>
            
            <h2>¿Quiénes deben inscribirse en el RFC?</h2>
            <p>La inscripción en el Registro Federal de Contribuyentes (RFC) es obligatoria en México para cualquier persona física que perciba ingresos por:</p>
            <ul>
                <li>Sueldos y salarios.</li>
                <li>Actividades empresariales y comerciales.</li>
                <li>Servicios profesionales (honorarios).</li>
                <li>Arrendamiento de inmuebles.</li>
                <li>Ventas a través de plataformas digitales (Amazon, Uber, etc.).</li>
            </ul>

            <h2>Guía paso a paso para el registro</h2>
            <ol className="space-y-3 my-6 pl-5 list-decimal">
                <li><strong>Preinscripción en el portal del SAT:</strong> Llena el formulario en línea con tus datos básicos (CURP, nombre, domicilio). Al finalizar, obtendrás un acuse de preinscripción.</li>
                <li><strong>Agendar una cita:</strong> Ingresa al sistema de citas del SAT para seleccionar el módulo más cercano. Debido a la alta demanda, te recomendamos inscribirte en la fila virtual si no encuentras espacios disponibles inmediatos.</li>
                <li><strong>Asistir a la oficina del SAT:</strong> Acude puntualmente con los documentos requeridos: identificación oficial vigente, CURP, comprobante de domicilio reciente y una memoria USB para guardar tus archivos de firma electrónica.</li>
                <li><strong>Generar tu e.firma y Contraseña:</strong> Durante tu cita, registrarán tus datos biométricos (huellas, iris y fotografía) y te entregarán tus archivos de firma digital (.key y .cer), esenciales para operar en línea.</li>
            </ol>

            <blockquote>"Elegir adecuadamente tu régimen fiscal (como el RESICO o el de Actividad Empresarial) en el momento del alta definirá tu porcentaje de impuestos y los gastos que podrás deducir legalmente."</blockquote>

            <p>Darse de alta de forma óptima desde el primer día te evita aclaraciones y multas futuras. Si requieres asesoría para definir tu régimen fiscal idóneo antes de tu cita, en CCI te ayudamos con el diagnóstico inicial sin costo.</p>
        `,
        date: '15 de Mayo, 2026',
        author: 'Adrian Alcaraz',
        category: 'Fiscal',
        readTime: '6 min',
        image: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'declaracion-anual-2026-pf',
        title: 'Declaración Anual de Personas Físicas: Claves para el cumplimiento exitoso',
        excerpt: 'Presentar tu declaración en el plazo correspondiente te evita multas y te abre la posibilidad de obtener saldos a favor. Conoce las bases.',
        content: `
            <p>Cada año, las personas físicas en México tienen la obligación de presentar su declaración anual ante el SAT. En este proceso se reportan de forma detallada los ingresos obtenidos, los impuestos pagados y las deducciones personales del ejercicio fiscal inmediato anterior.</p>
            
            <h2>¿Quiénes están obligados a declarar?</h2>
            <p>Como persona física, debes presentar declaración anual si te encuentras en alguno de estos supuestos:</p>
            <ul>
                <li>Obtuviste ingresos por honorarios, arrendamiento o actividades empresariales.</li>
                <li>Percibiste ingresos anuales superiores a los $400,000 pesos.</li>
                <li>Tuviste dos o más patrones de forma simultánea o cambiaste de empleo durante el año.</li>
                <li>Recibiste ingresos por intereses, dividendos o jubilaciones que excedan los montos exentos.</li>
            </ul>

            <h2>Aprovecha las Deducciones Personales</h2>
            <p>Presentar tu declaración es también la oportunidad de reportar gastos deducibles personales que pueden disminuir tu base gravable e incluso generar un saldo a favor que el SAT te devolverá. Los conceptos deducibles más comunes son:</p>
            <ul>
                <li>Gastos médicos, dentales, hospitalarios y de enfermería (pagados con medios electrónicos).</li>
                <li>Colegiaturas desde preescolar hasta bachillerato (con montos límites establecidos).</li>
                <li>Intereses reales devengados y efectivamente pagados de créditos hipotecarios (Infonavit, Bancos).</li>
                <li>Aportaciones voluntarias a tu cuenta de retiro (AFORE / PPR).</li>
            </ul>

            <blockquote>"Una declaración anual elaborada con orden y sustentada en facturas correctas es el camino directo para recuperar impuestos mediante la devolución automática."</blockquote>

            <p>Revisar periódicamente tus facturas y estados de cuenta durante el año te garantiza un trámite ágil y exitoso al momento de declarar. En CCI te acompañamos y revisamos tu contabilidad de manera integral para maximizar tus saldos a favor de forma legal y segura.</p>
        `,
        date: '10 de Abril, 2026',
        author: 'Equipo CCI',
        category: 'Fiscal',
        readTime: '5 min',
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800'
    }
];
