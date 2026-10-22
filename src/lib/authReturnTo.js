// Shared by the auth pages (Login, Register, and any page that resumes a flow
// after sign-in, e.g. the MCP OAuth consent page). Keep the redirect
// validation in one place — it is security-sensitive and easy to drift.

// Where users land after signing in when no returnTo was given.
export const DEFAULT_AFTER_LOGIN = "/painel";

// Resolve ?returnTo= to a safe same-origin path, else the default destination.
//
// The same-origin check alone is not enough: a value like /.//evil.com or
// /\evil.com parses same-origin but normalizes to a protocol-relative
// //evil.com when assigned to location.href — an open redirect. So require the
// resolved path to be exactly one leading slash (no "//" prefix, no backslash).
export function safeReturnTo() {
  const raw = new URLSearchParams(window.location.search).get("returnTo");
  if (!raw) return DEFAULT_AFTER_LOGIN;
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return DEFAULT_AFTER_LOGIN;
    // Only access_token/clear_access_token are still URL-read by app-params.js, but the
    // whole bootstrap set stays stripped: one going back to a URL read must not silently
    // become injectable again. Normal app-flow params (e.g. the OAuth consent ctx) are kept.
    for (const p of ["access_token", "clear_access_token", "app_id", "app_base_url", "functions_version", "from_url"]) {
      url.searchParams.delete(p);
    }
    const path = url.pathname + url.search;
    if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return DEFAULT_AFTER_LOGIN;
    if (path === "/") return DEFAULT_AFTER_LOGIN;
    return path;
  } catch {
    return DEFAULT_AFTER_LOGIN;
  }
}

// True when the URL carries an explicit returnTo (so links between auth pages keep it).
export function hasReturnTo() {
  return safeReturnTo() !== DEFAULT_AFTER_LOGIN;
}