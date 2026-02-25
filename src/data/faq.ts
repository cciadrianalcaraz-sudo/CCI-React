export interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

export const faqItems: FAQItem[] = [
    {
        id: 'declaracion-anual',
        question: '¿Cuándo es la fecha límite para mi declaración anual?',
        answer: 'Para Personas Morales, la fecha límite es el 31 de marzo. Para Personas Físicas, el periodo es durante el mes de abril, con fecha límite el 30 de abril.'
    },
    {
        id: 'deducciones-personales',
        question: '¿Qué gastos puedo deducir como persona física?',
        answer: 'Puedes deducir honorarios médicos, dentales, hospitalarios, gastos funerarios, primas por seguros de gastos médicos, intereses reales de créditos hipotecarios y colegiaturas (hasta ciertos límites según el nivel educativo).'
    },
    {
        id: 'resico-requisitos',
        question: '¿Quiénes pueden tributar en el RESICO?',
        answer: 'Personas físicas con actividad empresarial, profesional o que otorguen el uso o goce temporal de bienes, cuyos ingresos no excedan los 3.5 millones de pesos anuales, y que cumplan con sus obligaciones fiscales regularmente.'
    },
    {
        id: 'cfdi-40',
        question: '¿Qué pasa si mi CFDI 4.0 es rechazado?',
        answer: 'El rechazo suele deberse a inconsistencias en el RFC del receptor, el código postal de su domicilio fiscal registrado ante el SAT, o el uso del CFDI. Es vital que los datos coincidan exactamente con la Constancia de Situación Fiscal.'
    },
    {
        id: 'multas-sat',
        question: '¿Cómo puedo evitar multas del SAT?',
        answer: 'La mejor forma es cumplir con tus declaraciones en tiempo y forma, mantener tu buzón tributario activo y actualizado, y contar con una contabilidad organizada que respalde todas tus operaciones con CFDI válidos.'
    }
];
