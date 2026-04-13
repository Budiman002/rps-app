export interface FetchResult<T> {
  data?: T;
  error?: string;
  problem?: Response;
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const obj = payload as Record<string, unknown>;

  if (typeof obj.message === "string" && obj.message.trim().length > 0) {
    return obj.message;
  }

  if (typeof obj.error === "string" && obj.error.trim().length > 0) {
    return obj.error;
  }

  if (typeof obj.title === "string" && obj.title.trim().length > 0) {
    return obj.title;
  }

  const errors = obj.errors;
  if (errors && typeof errors === "object") {
    const first = Object.values(errors as Record<string, unknown>)[0];
    if (Array.isArray(first) && typeof first[0] === "string") {
      return first[0];
    }
  }

  return fallback;
}

export async function tryFetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<FetchResult<T>> {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      const fallback = `Request failed with status ${response.status}`;
      let message = fallback;

      try {
        const text = await response.text();
        if (text) {
          const payload = JSON.parse(text) as unknown;
          message = extractErrorMessage(payload, fallback);
        }
      } catch {
        // Ignore parse errors and keep fallback message
      }

      return {
        error: message,
        problem: response,
      };
    }

    const text = await response.text();
    const data = text ? (JSON.parse(text) as T) : ({} as T);
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unexpected request error",
    };
  }
}

