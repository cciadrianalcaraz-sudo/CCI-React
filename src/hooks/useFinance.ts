import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { FinanceRecord, PaymentMethod, FinanceCredit, FinanceGoal } from '../types/finance';
import { toast } from '../lib/toast';

/**
 * Obtiene los IDs de todos los usuarios que pertenecen a la misma empresa
 * (comparten el mismo `full_name` en la tabla `profiles`).
 * Si el usuario no tiene perfil, devuelve solo su propio ID.
 */
async function getCompanyUserIds(userId: string): Promise<string[]> {
    const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

    if (!profileData?.full_name) return [userId];

    const { data: companions } = await supabase
        .from('profiles')
        .select('id')
        .eq('full_name', profileData.full_name);

    return (companions || []).map((p: { id: string }) => p.id);
}

export const useFinance = (user: { id: string; [key: string]: unknown }, propsRecords?: FinanceRecord[]) => {
    const [records, setRecords] = useState<FinanceRecord[]>(propsRecords || []);
    const [loading, setLoading] = useState(!propsRecords);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [credits, setCredits] = useState<FinanceCredit[]>([]);

    // ── Registros ──────────────────────────────────────────────────────────────
    const loadRecords = useCallback(async () => {
        try {
            setLoading(true);
            // Con RLS actualizado en Supabase, SELECT devuelve toda la empresa
            const { data, error } = await supabase
                .from('finance_records')
                .select('*')
                .order('date', { ascending: true })
                .order('created_at', { ascending: true });

            if (error) throw error;
            if (data) setRecords(data as FinanceRecord[]);
        } catch (error) {
            console.error('Error loading finance records:', error);
            toast.error('Error al cargar los movimientos');
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Formas de pago ─────────────────────────────────────────────────────────
    const loadPaymentMethods = useCallback(async () => {
        try {
            const companyIds = await getCompanyUserIds(user.id);

            const { data, error } = await supabase
                .from('finance_payment_methods')
                .select('*')
                .in('user_id', companyIds)
                .order('name', { ascending: true });

            if (error) throw error;
            if (data) {
                // Deduplicar por nombre (por si varios usuarios crearon la misma cuenta)
                const seen = new Set<string>();
                const unique = (data as PaymentMethod[]).filter(pm => {
                    if (seen.has(pm.name)) return false;
                    seen.add(pm.name);
                    return true;
                });
                setPaymentMethods(unique);
            }
        } catch (error) {
            console.error('Error loading payment methods:', error);
        }
    }, [user.id]);

    // ── Créditos ───────────────────────────────────────────────────────────────
    const loadCredits = useCallback(async () => {
        try {
            // Con RLS actualizado, SELECT devuelve toda la empresa
            const { data, error } = await supabase
                .from('finance_credits')
                .select('*')
                .order('created_at', { ascending: true });
            if (error) throw error;
            setCredits(data || []);
        } catch (error) {
            console.error('Error loading credits:', error);
        }
    }, []);

    // ── Metas de ahorro ────────────────────────────────────────────────────────
    // finance_goals no existe en la BD; se mantiene como array vacío para
    // que los componentes que lo reciben no rompan.
    const goals: FinanceGoal[] = [];

    useEffect(() => {
        if (!propsRecords) {
            loadRecords();
        }
        loadPaymentMethods();
        loadCredits();
    }, [user.id]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        records,
        loading,
        paymentMethods,
        credits,
        goals,
        refreshRecords: loadRecords,
        refreshPaymentMethods: loadPaymentMethods,
        refreshCredits: loadCredits,
        refreshGoals: () => Promise.resolve(), // no-op: tabla no existe
    };
};
