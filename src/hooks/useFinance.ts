import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FinanceRecord, PaymentMethod, FinanceCredit, FinanceGoal } from '../types/finance';
import { toast } from '../lib/toast';

export const useFinance = (user: any, propsRecords?: FinanceRecord[]) => {
    const [records, setRecords] = useState<FinanceRecord[]>(propsRecords || []);
    const [loading, setLoading] = useState(!propsRecords);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [credits, setCredits] = useState<FinanceCredit[]>([]);
    const [goals, setGoals] = useState<FinanceGoal[]>([]);

    const loadRecords = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('finance_records')
                .select('*')
                .order('date', { ascending: true })
                .order('created_at', { ascending: true });

            if (error) throw error;
            if (data) setRecords(data as FinanceRecord[]);
        } catch (error) {
            console.error("Error loading finance records:", error);
            toast.error("Error al cargar los movimientos");
        } finally {
            setLoading(false);
        }
    };

    const loadPaymentMethods = async () => {
        try {
            const { data, error } = await supabase
                .from('finance_payment_methods')
                .select('*')
                .order('name', { ascending: true });
            
            if (error) throw error;
            if (data) setPaymentMethods(data as PaymentMethod[]);
        } catch (error) {
            console.error("Error loading payment methods:", error);
        }
    };

    const loadCredits = async () => {
        try {
            const { data, error } = await supabase
                .from('finance_credits')
                .select('*')
                .order('created_at', { ascending: true });
            if (error) throw error;
            setCredits(data || []);
        } catch (error) {
            console.error("Error loading credits:", error);
        }
    };

    const loadGoals = async () => {
        try {
            const { data, error } = await supabase
                .from('finance_goals')
                .select('*')
                .order('created_at', { ascending: true });
            if (error) throw error;
            setGoals(data || []);
        } catch (error) {
            console.error("Error loading goals:", error);
        }
    };

    useEffect(() => {
        if (!propsRecords) {
            loadRecords();
        }
        loadPaymentMethods();
        loadCredits();
        loadGoals();
    }, [user.id]);

    return {
        records,
        loading,
        paymentMethods,
        credits,
        goals,
        refreshRecords: loadRecords,
        refreshPaymentMethods: loadPaymentMethods,
        refreshCredits: loadCredits,
        refreshGoals: loadGoals
    };
};
