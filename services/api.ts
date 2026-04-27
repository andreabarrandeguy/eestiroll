import { supabase } from '@/config/supabase';
import { VocabLevel } from '@/types';

export async function fetchContent(vocabLevel: VocabLevel = 'A1') {
    // Build the levels array: A1 always included, A2 added if level is A2
    const levels = vocabLevel === 'A2' ? ['A1', 'A2'] : ['A1'];

    const { data, error } = await supabase.functions.invoke('init', {
        body: { levels },
    });

    if (error) throw error;

    return data;
}