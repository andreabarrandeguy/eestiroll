import { supabase } from '@/config/supabase';

export class OtpRateLimitError extends Error {
    constructor() {
        super('otp_rate_limit');
        this.name = 'OtpRateLimitError';
    }
}

export class InvalidCodeError extends Error {
    constructor() {
        super('invalid_code');
        this.name = 'InvalidCodeError';
    }
}

export async function sendOtp(email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();

    const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: { shouldCreateUser: true },
    });

    if (error) {
        if (error.status === 429 || error.code === 'over_email_send_rate_limit') {
            throw new OtpRateLimitError();
        }
        throw new Error(error.message);
    }
}

export async function verifyOtp(email: string, token: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();

    const { error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: token.trim(),
        type: 'email',
    });

    if (error) {
        if (error.status === 401 || error.status === 403) {
            throw new InvalidCodeError();
        }
        throw new Error(error.message);
    }
}

export async function signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
}

export async function deleteAccount(): Promise<void> {
    const { error } = await supabase.rpc('delete_account');
    if (error) throw new Error(error.message);
    await supabase.auth.signOut();
}

export async function getAccessToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
}
