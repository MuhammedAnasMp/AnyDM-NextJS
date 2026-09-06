/**
 * Helper to check if the current browser window is on a tenant subdomain or custom domain
 * (e.g. test_store.zoyee.in or custom_domain.in) versus main app (zoyee.in / localhost).
 */
export function isTenantDomain(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "zoyee.in").toLowerCase().trim();
  const rootHost = rootDomain.split(":")[0].toLowerCase();

  const isMainApp =
    host === `app.${rootHost}` ||
    host === rootHost ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".vercel.app");

  return !isMainApp;
}

/**
 * Get product URL depending on whether user is on a tenant domain or main app path.
 */
export function getProductUrl(username: string, productId: number | string): string {
  if (isTenantDomain()) {
    return `/product/${productId}`;
  }
  return `/${username}/product/${productId}`;
}

/**
 * Get store home URL depending on whether user is on a tenant domain or main app path.
 */
export function getStoreHomeUrl(username: string): string {
  if (isTenantDomain()) {
    return `/`;
  }
  return `/${username}`;
}

/**
 * Get store Terms of Service URL depending on whether user is on a tenant domain or main app path.
 */
export function getTermsUrl(username: string): string {
  if (isTenantDomain()) {
    return `/terms`;
  }
  return `/${username}/terms`;
}

/**
 * Get store Privacy Policy URL depending on whether user is on a tenant domain or main app path.
 */
export function getPrivacyUrl(username: string): string {
  if (isTenantDomain()) {
    return `/privacy`;
  }
  return `/${username}/privacy`;
}
