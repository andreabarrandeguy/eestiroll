import AsyncStorage from '@react-native-async-storage/async-storage';
import { EVENTS, track } from '@/services/analytics';
import { useCallback, useState } from 'react';

const COOLDOWN_DAYS = 7;

const KEYS = {
    DISMISSED_COUNT: 'signin_prompt_dismissed_count',
    DISMISSED_AT: 'signin_prompt_dismissed_at',
};

async function canShow(): Promise<boolean> {
    const dismissedCount = parseInt((await AsyncStorage.getItem(KEYS.DISMISSED_COUNT)) || '0');
    if (dismissedCount >= 2) return false;

    if (dismissedCount === 1) {
        const dismissedAt = await AsyncStorage.getItem(KEYS.DISMISSED_AT);
        if (dismissedAt) {
            const elapsed = Date.now() - parseInt(dismissedAt);
            const cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
            if (elapsed < cooldownMs) return false;
        }
    }

    return true;
}

export function useSignInPromptModal() {
    const [visible, setVisible] = useState(false);

    const trigger = useCallback(async () => {
        if (await canShow()) {
            setVisible(true);
            track(EVENTS.SIGN_IN_PROMPT_SHOWN);
        }
    }, []);

    const onDismiss = useCallback(async () => {
        const count = parseInt((await AsyncStorage.getItem(KEYS.DISMISSED_COUNT)) || '0') + 1;
        await AsyncStorage.setItem(KEYS.DISMISSED_COUNT, count.toString());
        await AsyncStorage.setItem(KEYS.DISMISSED_AT, Date.now().toString());
        setVisible(false);
    }, []);

    const hide = useCallback(() => setVisible(false), []);

    return { visible, trigger, onDismiss, hide };
}
