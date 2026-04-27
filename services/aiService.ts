const AI_API_URL = "https://eestiroll.eu.pythonanywhere.com/api/check/";

interface AICheckRequest {
    words: { estonian: string; translation: string }[];
    sentence: string;
    language: string;
}

export interface AICheckResponse {
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

    return response.json();
}