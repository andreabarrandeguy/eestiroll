import { EVENTS, track } from './analytics';

const AI_API_URL = "https://eestiroll.eu.pythonanywhere.com/api/check/";

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
}

// Raw shape returned by the Python backend (snake_case)
interface AICheckResponseRaw {
    score: number;
    validation: string;
    core_issue: string;
    rule: string;
    corrected_sentence: string;
    notes: string;
    remaining: number;
}

export class DailyLimitError extends Error {
    constructor() {
        super("daily_limit");
        this.name = "DailyLimitError";
    }
}

export async function checkSentenceWithAI(
    request: AICheckRequest
): Promise<AICheckResponse> {
    track(EVENTS.AI_CHECK, { language: request.language, wordCount: request.words.length });
    const response = await fetch(AI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
    });

    if (response.status === 429) {
        throw new DailyLimitError();
    }

    if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
    }

    const raw: AICheckResponseRaw = await response.json();
    return {
        score: raw.score,
        validation: raw.validation,
        coreIssue: raw.core_issue,
        rule: raw.rule,
        correctedSentence: raw.corrected_sentence,
        notes: raw.notes,
        remaining: raw.remaining,
    };
}