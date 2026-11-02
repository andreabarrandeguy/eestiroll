import { supabase } from '@/config/supabase';
import { VocabLevel } from '@/types';

// Callers all fall back to the bundled vocabulary when this rejects, but a
// request that never settles isn't a rejection — it left the boot screen
// spinning on "Loading content..." with no way out, since the retry button
// only renders on an error that never arrived.
const FETCH_TIMEOUT_MS = 8000;

export async function fetchContent(vocabLevel: VocabLevel = 'A1') {
    // Build the levels array: A1 always included, A2 added if level is A2
    const levels = vocabLevel === 'A2' ? ['A1', 'A2'] : ['A1'];

    const { data, error } = await Promise.race([
        supabase.functions.invoke('init', { body: { levels } }),
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('content_fetch_timeout')), FETCH_TIMEOUT_MS)
        ),
    ]);

    if (error) throw error;

    return data;
}