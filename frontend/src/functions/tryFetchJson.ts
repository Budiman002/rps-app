export interface FetchResult<T> {
  data?: T;
  error?: string;
  problem?: Response;
}

export async function tryFetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<FetchResult<T>> {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      return {
        error: `Request failed with status ${response.status}`,
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

