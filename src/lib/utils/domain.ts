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
    host === `api.${rootHost}` ||
    host === rootHost ||
    host === "anydm.in" ||
    host === "www.anydm.in" ||
    host === "zoyee.in" ||
    host === "www.zoyee.in" ||
    host === "locanydm.online" ||
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

/**
 * Resolves the public storefront URL for a merchant according to active domain priority:
 * Priority 1: Custom Domain (e.g. https://12.com) - if custom domain is present & verified/configured
 * Priority 2: Subdomain (e.g. https://12.zoyee.in)
 * Priority 3: Path fallback (e.g. https://zoyee.in/12)
 */
export function getStorefrontPreviewUrl(options: {
  username?: string;
  storeSlug?: string;
  customDomain?: string;
  isCustomDomainVerified?: boolean;
}): string {
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "zoyee.in").toLowerCase().trim();
  const baseRootDomain = rootDomain.replace(/^app\./, "").split(":")[0];
  const activeSlug = (options.storeSlug || options.username || "").trim().toLowerCase();

  const cleanedCustomDomain = options.customDomain
    ? options.customDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "";

  // 1. Custom Domain (First Priority - if set and verified/well-configured)
  if (cleanedCustomDomain && options.isCustomDomainVerified !== false) {
    return `https://${cleanedCustomDomain}`;
  }

  // 2. Subdomain (Second Priority - e.g. https://12.zoyee.in)
  if (activeSlug) {
    return `https://${activeSlug}.${baseRootDomain}`;
  }

  // 3. Path fallback
  return `https://${baseRootDomain}/${activeSlug}`;
}

/**
 * Resolves the full absolute product URL for a merchant according to active domain priority:
 * Custom domain -> https://store.com/product/123
 * Subdomain -> https://storename.zoyee.in/product/123
 * Path fallback -> https://zoyee.in/storename/product/123
 */
export function getAbsoluteProductUrl(
  productId: number | string,
  options: {
    username?: string;
    storeSlug?: string;
    customDomain?: string;
    isCustomDomainVerified?: boolean;
  }
): string {
  const baseUrl = getStorefrontPreviewUrl(options);
  return `${baseUrl.replace(/\/$/, "")}/product/${productId}`;
}

export interface CarouselSlide {
  id: string;
  image_url: string;
  link_url?: string;
  title?: string;
  subtitle?: string;
  public_id?: string;
}
