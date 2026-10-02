import { PostHog } from 'posthog-react-native';

let posthogInstance: PostHog | null = null;

export const setPostHogInstance = (instance: PostHog) => {
    posthogInstance = instance;
};

export const track = (eventName: string, properties?: Record<string, any>) => {
    if (!posthogInstance) return;
    posthogInstance.capture(eventName, properties);
};

// A super-property (not posthog.identify()) so accounts don't turn PostHog
// into another store of personal data that account deletion has to reach into.
export const setAuthSuperProperty = (isAuthenticated: boolean) => {
    if (!posthogInstance) return;
    posthogInstance.register({ is_authenticated: isAuthenticated });
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
    SIGN_IN_STARTED: 'sign_in_started',
    SIGN_IN_COMPLETED: 'sign_in_completed',
    SIGN_OUT: 'sign_out',
    ACCOUNT_DELETED: 'account_deleted',
    SIGN_IN_PROMPT_SHOWN: 'sign_in_prompt_shown',
    SIGN_IN_PROMPT_DISMISSED: 'sign_in_prompt_dismissed',
    HOW_IT_WORKS_OPENED: 'how_it_works_opened',
} as const;