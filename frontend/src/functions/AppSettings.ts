const env = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env;

export const AppSettings = {
  apiGatewayBasePath: env.VITE_API_GATEWAY_BASE_PATH ?? "/api/gateway",
  requestTimeoutMs: Number(env.VITE_REQUEST_TIMEOUT_MS ?? 10000),
};

