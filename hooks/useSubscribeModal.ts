import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useRef, useState } from 'react';

const TRIGGER_AFTER_CHECKS = 2;
const COOLDOWN_DAYS = 7;

const KEYS = {
    SUBSCRIBED: 'subscribe_subscribed',
    DISMISSED_COUNT: 'subscribe_dismissed_count',
    DISMISSED_AT: 'subscribe_dismissed_at',
    AI_CHECK_COUNT: 'subscribe_ai_check_count',
};

async function canShow(): Promise<boolean> {
    const subscribed = await AsyncStorage.getItem(KEYS.SUBSCRIBED);
    if (subscribed === 'true') return false;

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

export function useSubscribeModal() {
    const [visible, setVisible] = useState(false);
    const didSubscribeRef = useRef(false);

    const onAICheckSuccess = useCallback(async () => {
        const count = parseInt((await AsyncStorage.getItem(KEYS.AI_CHECK_COUNT)) || '0') + 1;
        await AsyncStorage.setItem(KEYS.AI_CHECK_COUNT, count.toString());

        if (count >= TRIGGER_AFTER_CHECKS && (await canShow())) {
            setVisible(true);
        }
    }, []);

    const onSubscribed = useCallback(async () => {
        didSubscribeRef.current = true;
        await AsyncStorage.setItem(KEYS.SUBSCRIBED, 'true');
    }, []);

    const onDismiss = useCallback(async () => {
        if (!didSubscribeRef.current) {
            const count = parseInt((await AsyncStorage.getItem(KEYS.DISMISSED_COUNT)) || '0') + 1;
            await AsyncStorage.setItem(KEYS.DISMISSED_COUNT, count.toString());
            await AsyncStorage.setItem(KEYS.DISMISSED_AT, Date.now().toString());
        }
        didSubscribeRef.current = false;
        setVisible(false);
    }, []);

    return { visible, onAICheckSuccess, onSubscribed, onDismiss };
}