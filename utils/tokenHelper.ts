interface JwtPayload {
  sub: string; // email
  iat: number;
  exp: number;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;
  return Math.floor(Date.now() / 1000) > payload.exp;
}

export function getEmailFromToken(token: string): string | null {
  return decodeToken(token)?.sub ?? null;
}

export function getTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("apnadost_token");
}

export function saveTokenToStorage(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("apnadost_token", token);
}

export function removeTokenFromStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("apnadost_token");
}
