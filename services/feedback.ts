import { supabase } from '@/config/supabase';

export type FeedbackSource = 'config' | 'word_modal';

interface SubmitFeedbackParams {
    message: string;
    source: FeedbackSource;
    word?: string;
    category?: string;
    language?: string;
}

export async function submitFeedback({ message, source, word, category, language }: SubmitFeedbackParams): Promise<void> {
    const { error } = await supabase
        .from('feedback')
        .insert({ message: message.trim(), source, word, category, language });

    if (error) throw new Error(error.message);
}
