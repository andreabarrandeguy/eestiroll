import { supabase } from '@/config/supabase';

export type FeedbackSource = 'config' | 'word_modal' | 'about' | 'ai_result';

interface SubmitFeedbackParams {
    message: string;
    source: FeedbackSource;
    word?: string;
    category?: string;
    language?: string;
    context?: Record<string, unknown>;
}

export async function submitFeedback({ message, source, word, category, language, context }: SubmitFeedbackParams): Promise<void> {
    const { error } = await supabase
        .from('feedback')
        .insert({
            message: message.trim(),
            source,
            word,
            category,
            language,
            // Only sent when present — the `context` column doesn't exist until
            // the migration runs, and Supabase rejects unknown columns outright.
            ...(context ? { context } : {}),
        });

    if (error) throw new Error(error.message);
}
