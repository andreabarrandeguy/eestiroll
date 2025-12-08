import { supabase } from '@/config/supabase';

export async function fetchContent() {
    const { data, error } = await supabase.functions.invoke('init');

    if (error) throw error;

    return data;
}