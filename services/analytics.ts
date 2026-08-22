import { PostHog } from 'posthog-react-native';

let posthogInstance: PostHog | null = null;

export const setPostHogInstance = (instance: PostHog) => {
    posthogInstance = instance;
};

export const track = (eventName: string, properties?: Record<string, any>) => {
    if (!posthogInstance) return;
    posthogInstance.capture(eventName, properties);
};

export const EVENTS = {
    ROLL: 'roll_performed',
    CATEGORY_TOGGLED: 'category_toggled',
    LEVEL_CHANGED: 'level_changed',
    LANGUAGE_CHANGED: 'language_changed',
    AI_SUGGESTION: 'ai_suggestion_requested',
    AI_CHECK: 'ai_check_requested',
    AI_CHECK_FAILED: 'ai_check_failed',
    SUBSCRIBED: 'subscribed',
    SUBSCRIBE_DISMISSED: 'subscribe_dismissed',
    SHARE: 'share_tapped',
    FEEDBACK_SUBMITTED: 'feedback_submitted',
} as const;