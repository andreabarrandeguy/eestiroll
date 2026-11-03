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

// Rides along on every event so the funnel can be split by UI language —
// language_changed only fires on an explicit pick, which says nothing about
// the language someone actually used.
export const setLanguageSuperProperty = (language: string) => {
    if (!posthogInstance) return;
    posthogInstance.register({ ui_language: language });
};

export const EVENTS = {
    ROLL: 'roll_performed',
    CATEGORY_TOGGLED: 'category_toggled',
    LEVEL_CHANGED: 'level_changed',
    LANGUAGE_CHANGED: 'language_changed',
    AI_CHECK: 'ai_check_requested',
    AI_CHECK_SUCCEEDED: 'ai_check_succeeded',
    AI_CHECK_FAILED: 'ai_check_failed',
    AI_LIMIT_REACHED: 'ai_limit_reached',
    // Someone who sent the words back untouched never understood the game,
    // which until now was indistinguishable from someone who understood it and
    // wrote badly. The two need completely different fixes.
    AI_WORDS_NOT_ADJUSTED: 'ai_words_not_adjusted',
    // The missing link between rolling and submitting: someone who rolled,
    // read the words and typed nothing used to be indistinguishable from
    // someone who rolled and closed the tab.
    SENTENCE_STARTED: 'sentence_started',
    ROLL_HINT_SHOWN: 'roll_hint_shown',
    BOOT_FAILED: 'boot_failed',
    // captureScreens is off, so navigation is otherwise invisible.
    CONFIG_OPENED: 'config_opened',
    HISTORY_OPENED: 'history_opened',
    EXAMPLES_OPENED: 'examples_opened',
    TEACHERS_OPENED: 'teachers_opened',
    TEACHERS_ACCESS_OPENED: 'teachers_access_opened',
    TEACHERS_ACCESS_SUBMITTED: 'teachers_access_submitted',
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
    HOW_IT_WORKS_STEP: 'how_it_works_step',
    HOW_IT_WORKS_COMPLETED: 'how_it_works_completed',
    HOW_IT_WORKS_DISMISSED: 'how_it_works_dismissed',
} as const;