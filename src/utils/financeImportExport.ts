import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from '../lib/toast';
import type { FinanceRecord } from '../types/finance';

export const importFromExcel = async (
    file: File, 
    userId: string, 
    onSuccess: () => void,
    onProgressChange?: (isUploading: boolean) => void
) => {
    if (onProgressChange) onProgressChange(true);
    
    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

        if (jsonData.length === 0) {
            throw new Error('El archivo está vacío o no tiene el formato correcto.');
        }

        const normalizeKey = (k: string) => k.toUpperCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^A-Z0-9]/g, ""); 

        const recordsToInsert = jsonData.map((row) => {
            const getValue = (keywords: string[]) => {
                const normalizedKeywords = keywords.map(kw => normalizeKey(kw));
                const keys = Object.keys(row);
                
                let foundKey = keys.find(k => {
                    const normK = normalizeKey(k);
                    return normalizedKeywords.some(kw => normK === kw);
                });
                
                if (!foundKey) {
                    foundKey = keys.find(k => {
                        const normK = normalizeKey(k);
                        return normalizedKeywords.some(kw => normK.includes(kw));
                    });
                }

                return foundKey ? row[foundKey] : undefined;
            };

            const parseNumber = (val: unknown) => {
                if (typeof val === 'number') return val;
                if (!val) return 0;
                
                let str = String(val).replace(/[^\d.,-]/g, '').trim();
                if (!str) return 0;

                const lastComma = str.lastIndexOf(',');
                const lastDot = str.lastIndexOf('.');
                
                if (lastComma > lastDot) {
                    str = str.replace(/\./g, '').replace(',', '.');
                } else if (lastDot > lastComma) {
                    str = str.replace(/,/g, '');
                } else if (lastComma !== -1) {
                    str = str.replace(',', '.');
                }
                
                const parsed = Number(str);
                return isNaN(parsed) ? 0 : parsed; 
            };

            const rawDate = getValue(['FECHA', 'DATE', 'DIA', 'MOMENTO', 'FEC', 'VALOR']);
            let dateStr = "";

            if (rawDate instanceof Date) {
                dateStr = rawDate.toISOString().split('T')[0];
            } else if (typeof rawDate === 'number') {
                const jsDate = new Date((rawDate - 25569) * 86400 * 1000);
                dateStr = jsDate.toISOString().split('T')[0];
            } else if (rawDate) {
                const sDate = String(rawDate).trim();
                const parts = sDate.split(/[/.-]/);
                if (parts.length === 3) {
                    if (parts[2].length === 4) {
                        dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                    } else if (parts[0].length === 4) {
                        dateStr = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                    }
                }
            }

            if (!dateStr) {
                dateStr = new Date().toISOString().split('T')[0];
            }

            const conceptValue = String(getValue(['CONCEPTO', 'CONCEPT', 'NOMBRE', 'TITULO', 'SERVICIO', 'MOVIMIENTO', 'DESCRIPCION', 'DETALLE', 'MOTIVO']) || '').trim().toUpperCase();
            const incomeValue = parseNumber(getValue(['INGRESO', 'ENTRADA', 'POSITIVO', 'DEPOSITO', 'ABONO', 'CREDITO', 'INPUT', 'CASHIN']));
            const expenseValue = parseNumber(getValue(['GASTO', 'SALIDA', 'NEGATIVO', 'EGRESO', 'CARGO', 'RETIRO', 'DEBITO', 'OUTPUT', 'CASHOUT']));

            const validTypes = ['Variable', 'Fijo', 'Ahorro', 'Deuda', 'Ingreso', 'Traspaso'];
            const rawType = String(getValue(['TIPO', 'TIPOGASTO', 'TIPOMOVIMIENTO', 'CATEGORIA', 'CATEGORY', 'TYPE']) || '').trim();
            const normalizedType = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();
            const expenseTypeValue = validTypes.includes(normalizedType) ? normalizedType : 'Variable';

            if (!conceptValue && incomeValue === 0 && expenseValue === 0) {
                return null;
            }

            return {
                user_id: userId,
                concept: conceptValue || 'MOVIMIENTO SIN NOMBRE',
                date: dateStr,
                payment_method: String(getValue(['FORMADEPAGO', 'PAGO', 'CUENTA', 'METODO', 'VIA', 'BANCO', 'ORIGEN']) || 'SIN ESPECIFICAR').trim().toUpperCase(),
                provider: String(getValue(['PROVEEDOR', 'PROVIDER', 'LUGAR', 'ESTABLECIMIENTO', 'DESTINO', 'COMERCIO']) || '').trim().toUpperCase(),
                income: incomeValue,
                expense: expenseValue,
                expense_type: expenseTypeValue,
                description: String(getValue(['DESCRIPCION', 'DETALLE', 'MOTIVO', 'COMENTARIO', 'OBSERVACION', 'REFERENCIA', 'NOTAS']) || '').trim()
            };
        }).filter(record => record !== null);

        if (recordsToInsert.length === 0) {
            throw new Error(`No se encontraron columnas de Concepto ni de Importes válidas.`);
        }

        const { error } = await supabase
            .from('finance_records')
            .insert(recordsToInsert);

        if (error) throw error;
        
        toast.success(`¡Importación exitosa! Se añadieron ${recordsToInsert.length} registros.`);
        onSuccess();

    } catch (error) {
        toast.error(`Error al importar: ${(error as Error).message || 'Verifica el formato'}`);
    } finally {
        if (onProgressChange) onProgressChange(false);
    }
};

export const exportToPDF = async (elementId: string, selectedMonth: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
        toast.error("No se encontró el contenido del reporte.");
        return;
    }

    toast.info("Generando PDF... por favor espera.");
    
    try {
        const isDarkMode = document.documentElement.classList.contains('dark');
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: isDarkMode ? '#151515' : '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Reporte_Mensual_${selectedMonth || 'Global'}.pdf`);
        toast.success("PDF generado con éxito.");
    } catch (error) {
        console.error("Error generating PDF:", error);
        toast.error("Error al generar el PDF.");
    }
};

export const exportToExcel = (displayRecords: (FinanceRecord & { balance?: number })[], selectedMonth: string) => {
    if (displayRecords.length === 0) {
        toast.warning('No hay registros para exportar en el mes seleccionado.');
        return;
    }

    try {
        const dataToExport = displayRecords.map((r, index) => ({
            'NO.': index + 1,
            'CONCEPTO': r.concept,
            'FECHA': r.date.split('-').reverse().join('/'),
            'FORMA DE PAGO': r.payment_method || 'SIN ESPECIFICAR',
            'PROVEEDOR': r.provider || '',
            'INGRESO': Number(r.income) || 0,
            'GASTO': Number(r.expense) || 0,
            'SALDO': Number(r.balance) || 0,
            'DESCRIPCION': r.description || ''
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Finanzas");
        
        const wscols = [
            {wch: 5}, {wch: 25}, {wch: 12}, {wch: 20}, 
            {wch: 20}, {wch: 10}, {wch: 10}, {wch: 12}, {wch: 40}
        ];
        ws['!cols'] = wscols;

        const fileName = `Finanzas_${selectedMonth === 'all' ? 'Completo' : selectedMonth}.xlsx`;
        XLSX.writeFile(wb, fileName);
        toast.success(`Archivo "${fileName}" exportado correctamente.`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        toast.error('No se pudo generar el archivo Excel.');
    }
};
