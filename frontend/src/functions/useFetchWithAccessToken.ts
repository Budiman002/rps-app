import { useCallback, useMemo } from "react";
import { tryFetchJson, type FetchResult } from "./tryFetchJson";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: any };

export function useFetchWithAccessToken() {
  const accessToken = localStorage.getItem("rps_access_token");

  const withAuthHeader = useCallback(
    (init?: RequestInit): RequestInit => ({
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(init?.headers ?? {}),
      },
    }),
    [accessToken],
  );

  const fetchGET = useCallback(
    <T,>(url: string): Promise<FetchResult<T>> => {
      return tryFetchJson<T>(url, withAuthHeader({ method: "GET" }));
    },
    [withAuthHeader],
  );

  const fetchPOST = useCallback(
    <T,>(url: string, body: any): Promise<FetchResult<T>> => {
      return tryFetchJson<T>(url, withAuthHeader({ method: "POST", body: JSON.stringify(body) }));
    },
    [withAuthHeader],
  );

  const fetchPUT = useCallback(
    <T,>(url: string, body: any): Promise<FetchResult<T>> => {
      return tryFetchJson<T>(url, withAuthHeader({ method: "PUT", body: JSON.stringify(body) }));
    },
    [withAuthHeader],
  );

  const fetchDELETE = useCallback(
    <T,>(url: string): Promise<FetchResult<T>> => {
      return tryFetchJson<T>(url, withAuthHeader({ method: "DELETE" }));
    },
    [withAuthHeader],
  );

  return useMemo(() => ({
    fetchGET,
    fetchPOST,
    fetchPUT,
    fetchDELETE,
  }), [fetchGET, fetchPOST, fetchPUT, fetchDELETE]);
}

