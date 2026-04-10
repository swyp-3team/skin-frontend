export const MOCK_ACCESS_TOKEN = "mock-access-token" as const;
export const AUTH_REDIRECT_REASON = "AUTH_REQUIRED" as const;

export interface AuthRedirectState {
  redirectReason: typeof AUTH_REDIRECT_REASON;
  from: string;
}

export function isAuthRedirectState(value: unknown): value is AuthRedirectState {
  if (!value || typeof value !== "object") {
    return false;
  }

  if (!("redirectReason" in value) || !("from" in value)) {
    return false;
  }

  return (
    value.redirectReason === AUTH_REDIRECT_REASON && typeof value.from === "string"
  );
}
