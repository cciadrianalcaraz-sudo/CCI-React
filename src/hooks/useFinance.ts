import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { FinanceRecord, PaymentMethod, FinanceCredit, FinanceGoal } from '../types/finance';

/**
 * Obtiene los IDs de todos los usuarios que pertenecen a la misma empresa
 * (comparten el mismo `full_name` en la tabla `profiles`).
 * Si el usuario no tiene perfil, devuelve solo su propio ID.
 */
export async function getCompanyUserIds(userId: string, email?: string): Promise<string[]> {
    let { data: profileData } = await supabase
        .from('profiles')
        .select('full_name') // full_name se usa como identificador de empresa/familia
        .eq('id', userId)
        .single();
    
    // Fallback por Email si no se encuentra por ID
    if (!profileData?.full_name && email) {
        console.log(`[useFinance] Profile not found by ID, trying email: ${email}`);
        const { data: emailData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('email', email)
            .single();
        if (emailData) {
            profileData = emailData;
        }
    }

    if (!profileData || !profileData.full_name) {
        console.log(`[useFinance] No company profile found for user ${userId}, using single ID.`);
        return [userId];
    }

    const companyName = profileData.full_name?.trim() || '';
    if (!companyName) return [userId];

    const { data: companions } = await supabase
        .from('profiles')
        .select('id')
        .ilike('full_name', companyName);

    const ids = (companions || []).map((p: { id: string }) => p.id);
    console.log(`[useFinance] Found ${ids.length} users for company: "${companyName}"`);
    return ids.length > 0 ? ids : [userId];
}

export const useFinance = (user: { id: string; [key: string]: unknown }, propsRecords?: FinanceRecord[]) => {
    const [records, setRecords] = useState<FinanceRecord[]>(propsRecords || []);
    const [loading, setLoading] = useState(!propsRecords);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [credits, setCredits] = useState<FinanceCredit[]>([]);
    const [goals, setGoals] = useState<FinanceGoal[]>([]);
    const [companyIds, setCompanyIds] = useState<string[]>([user.id]);
    const userEmail = (user as any)?.email;

    // ── IDs de Empresa ────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchIds = async () => {
            const ids = await getCompanyUserIds(user.id, userEmail);
            setCompanyIds(ids);
        };
        fetchIds();
    }, [user.id, userEmail]);

    // ── Registros ──────────────────────────────────────────────────────────────
    const loadRecords = useCallback(async () => {
        try {
            setLoading(true);
            const ids = await getCompanyUserIds(user.id, userEmail);
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
            const ids = await getCompanyUserIds(user.id, userEmail);
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
            const ids = await getCompanyUserIds(user.id, userEmail);
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
            const ids = await getCompanyUserIds(user.id, userEmail);
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
