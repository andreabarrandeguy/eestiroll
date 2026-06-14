import { supabase } from '@/config/supabase';

export type SubscribeSource = 'modal' | 'config';

interface SubscribeParams {
    email: string;
    source: SubscribeSource;
    language?: string;
}

export class AlreadySubscribedError extends Error {
    constructor() {
        super('already_subscribed');
        this.name = 'AlreadySubscribedError';
    }
}

export async function subscribeEmail({ email, source, language }: SubscribeParams): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();

    const { error } = await supabase
        .from('subscribers')
        .insert({ email: normalizedEmail, source, language });

    if (error) {
        // Postgres unique violation code
        if (error.code === '23505') {
            throw new AlreadySubscribedError();
        }
        throw new Error(error.message);
    }
}