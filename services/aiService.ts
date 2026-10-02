import { Platform } from 'react-native';
import { getAccessToken } from './auth';
import { EVENTS, track } from './analytics';

const AI_API_URL = "https://eestiroll.eu.pythonanywhere.com/api/check/";

// Fallback limit used only if the backend hasn't been updated yet to return
// `limit`/`is_authenticated` itself. Accounts are hidden from the UI for
// now and don't raise the daily cap — everyone shares this same limit.
// Keep in sync with the copy in translations.ts and the actual backend cap.
const DAILY_LIMIT_FALLBACK = 3;

interface AICheckRequest {
    words: { estonian: string; translation: string }[];
    sentence: string;
    language: string;
}

export interface AICheckResponse {
    score: number;
    validation: string;
    coreIssue: string;
    rule: string;
    correctedSentence: string;
    notes: string;
    remaining: number;
    limit: number;
    isAuthenticated: boolean;
}

// Raw shape returned by the Python backend (snake_case). `limit` and
// `is_authenticated` are optional until the backend is updated to send them.
interface AICheckResponseRaw {
    score: number;
    validation: string;
    core_issue: string;
    rule: string;
    corrected_sentence: string;
    notes: string;
    remaining: number;
    limit?: number;
    is_authenticated?: boolean;
}

export class DailyLimitError extends Error {
    remaining: number;
    limit: number;
    isAuthenticated: boolean;

    constructor(remaining: number, limit: number, isAuthenticated: boolean) {
        super("daily_limit");
        this.name = "DailyLimitError";
        this.remaining = remaining;
        this.limit = limit;
        this.isAuthenticated = isAuthenticated;
    }
}

export class SessionInvalidError extends Error {
    constructor() {
        super("session_invalid");
        this.name = "SessionInvalidError";
    }
}

// A non-2xx the service error paths above don't special-case (401/429 are
// handled separately). Carries the status so callers/analytics can tell a
// 500 apart from e.g. a 502/504 without string-parsing the message.
export class HttpError extends Error {
    status: number;
    constructor(status: number) {
        super(`AI service error: ${status}`);
        this.name = "HttpError";
        this.status = status;
    }
}

// The backend returned a 2xx but the body wasn't valid JSON — most likely
// the response got cut off mid-generation (a long AI reply holding the
// connection open long enough to hit an upstream timeout) rather than a
// connectivity problem, which is otherwise indistinguishable from a plain
// network failure once it reaches the generic catch in the UI.
export class ResponseParseError extends Error {
    status: number;
    bodyLength: number;
    bodyPreview: string;
    constructor(status: number, body: string) {
        super("response_parse_error");
        this.name = "ResponseParseError";
        this.status = status;
        this.bodyLength = body.length;
        this.bodyPreview = body.slice(0, 200);
    }
}

export async function checkSentenceWithAI(
    request: AICheckRequest
): Promise<AICheckResponse> {
    track(EVENTS.AI_CHECK, { language: request.language, wordCount: request.words.length });

    const token = await getAccessToken();
    const response = await fetch(AI_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // Lets the backend tell this codebase's clients apart from the
            // older, still-live web build (which never sends this header) so
            // quota changes here don't silently affect that deployment.
            // See docs/backend-account-quota-spec.md.
            "X-Client-Platform": Platform.OS,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(request),
    });

    if (response.status === 401) {
        throw new SessionInvalidError();
    }

    if (response.status === 429) {
        const raw: Partial<AICheckResponseRaw> = await response.json().catch(() => ({}));
        const isAuthenticated = raw.is_authenticated ?? !!token;
        throw new DailyLimitError(
            raw.remaining ?? 0,
            raw.limit ?? DAILY_LIMIT_FALLBACK,
            isAuthenticated
        );
    }

    if (!response.ok) {
        throw new HttpError(response.status);
    }

    const bodyText = await response.text();
    let raw: AICheckResponseRaw;
    try {
        raw = JSON.parse(bodyText);
    } catch {
        throw new ResponseParseError(response.status, bodyText);
    }
    const isAuthenticated = raw.is_authenticated ?? !!token;
    return {
        score: raw.score,
        validation: raw.validation,
        coreIssue: raw.core_issue,
        rule: raw.rule,
        correctedSentence: raw.corrected_sentence,
        notes: raw.notes,
        remaining: raw.remaining,
        limit: raw.limit ?? DAILY_LIMIT_FALLBACK,
        isAuthenticated,
    };
}
