import { useCallback } from "react";
import type { BareFetcher } from "swr";

export function useSwrFetcherWithAccessToken(): BareFetcher<unknown> {
  const accessToken = localStorage.getItem("rps_access_token");

  return useCallback(
    async (url: string) => {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch resource. Status: ${response.status}`);
      }

      return response.json();
    },
    [accessToken],
  );
}

