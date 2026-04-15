import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { FinanceRecord, PaymentMethod, FinanceCredit, FinanceGoal } from '../types/finance';
import { toast } from '../lib/toast';

/**
 * Obtiene los IDs de todos los usuarios que pertenecen a la misma empresa
 * (comparten el mismo `full_name` en la tabla `profiles`).
 * Si el usuario no tiene perfil, devuelve solo su propio ID.
 */
export async function getCompanyUserIds(userId: string): Promise<string[]> {
    const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name') // full_name se usa como identificador de empresa/familia
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
    const [goals, setGoals] = useState<FinanceGoal[]>([]);
    const [companyIds, setCompanyIds] = useState<string[]>([user.id]);

    // ── IDs de Empresa ────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchIds = async () => {
            const ids = await getCompanyUserIds(user.id);
            setCompanyIds(ids);
        };
        fetchIds();
    }, [user.id]);

    // ── Registros ──────────────────────────────────────────────────────────────
    const loadRecords = useCallback(async () => {
        try {
            setLoading(true);
            const ids = await getCompanyUserIds(user.id);
            const { data, error } = await supabase
                .from('finance_records')
                .select('*')
                .in('user_id', ids)
                .order('date', { ascending: true })
                .order('created_at', { ascending: true });

            if (error) throw error;
            if (data) setRecords(data as FinanceRecord[]);
        } catch (error) {
            console.error('Error loading finance records:', error);
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    // ── Formas de pago ─────────────────────────────────────────────────────────
    const loadPaymentMethods = useCallback(async () => {
        try {
            const ids = await getCompanyUserIds(user.id);
            const { data, error } = await supabase
                .from('finance_payment_methods')
                .select('*')
                .in('user_id', ids)
                .order('name', { ascending: true });

            if (error) throw error;
            if (data) {
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
            const ids = await getCompanyUserIds(user.id);
            const { data, error } = await supabase
                .from('finance_credits')
                .select('*')
                .in('user_id', ids)
                .order('created_at', { ascending: true });
            if (error) throw error;
            setCredits(data || []);
        } catch (error) {
            console.error('Error loading credits:', error);
        }
    }, [user.id]);

    // ── Metas de ahorro ────────────────────────────────────────────────────────
    const loadGoals = useCallback(async () => {
        try {
            const ids = await getCompanyUserIds(user.id);
            const { data, error } = await supabase
                .from('finance_goals')
                .select('*')
                .in('user_id', ids)
                .order('created_at', { ascending: true });
            
            if (error) throw error;
            setGoals(data || []);
        } catch (error) {
            console.error('Error loading goals:', error);
        }
    }, [user.id]);

    useEffect(() => {
        if (!propsRecords) {
            loadRecords();
        }
        loadPaymentMethods();
        loadCredits();
        loadGoals();
    }, [user.id, loadRecords, loadPaymentMethods, loadCredits, loadGoals, propsRecords]);

    return {
        records,
        loading,
        paymentMethods,
        credits,
        goals,
        companyIds,
        refreshRecords: loadRecords,
        refreshPaymentMethods: loadPaymentMethods,
        refreshCredits: loadCredits,
        refreshGoals: loadGoals,
    };
};
