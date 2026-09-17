import api from "@/lib/services/api.service";

export interface CustomerSessionData {
  token: string;
  instagram_username?: string | null;
  instagram_scoped_id?: string | null;
  instagram_profile_pic?: string | null;
  saved_address?: {
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    shipping_address?: string;
    shipping_pincode?: string;
    shipping_place?: string;
    shipping_district?: string;
    shipping_state?: string;
  };
  recent_orders?: any[];
}

const STORAGE_KEY = "anydm_customer_session_token";

/**
 * Captures `cs=` token from URL query string if present, strips it from the address bar
 * via window.history.replaceState, and stores it in localStorage.
 */
export function initCustomerSessionFromUrl(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("cs") || urlParams.get("session");

    if (tokenFromUrl) {
      // Store in localStorage
      localStorage.setItem(STORAGE_KEY, tokenFromUrl);

      // Clean token parameter from address bar cleanly without page reload
      urlParams.delete("cs");
      urlParams.delete("session");
      const remainingQuery = urlParams.toString();
      const cleanPath = window.location.pathname + (remainingQuery ? `?${remainingQuery}` : "") + window.location.hash;
      window.history.replaceState(null, "", cleanPath);

      return tokenFromUrl;
    }
  } catch (err) {
    console.error("Error capturing customer session token from URL:", err);
  }

  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Returns existing token from localStorage or generates a fresh guest session from API.
 */
export async function getOrInitCustomerSessionToken(): Promise<string> {
  if (typeof window === "undefined") return "";

  let token = initCustomerSessionFromUrl();

  if (!token) {
    try {
      const res = await api.post("/crm/session/guest/");
      if (res.data?.token) {
        token = res.data.token;
        localStorage.setItem(STORAGE_KEY, token as string);
      }
    } catch (err) {
      console.warn("Failed to create guest session from backend. Generating local fallback token.");
      token = `cs_local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(STORAGE_KEY, token);
    }
  }

  return token || "";
}

/**
 * Fetches resolved session details (Instagram handle, profile pic, saved shipping address) from backend.
 */
export async function resolveCustomerSession(): Promise<CustomerSessionData | null> {
  const token = await getOrInitCustomerSessionToken();
  if (!token) return null;

  try {
    const res = await api.get(`/crm/session/resolve/?token=${encodeURIComponent(token)}`);
    if (res.data && res.data.found) {
      return res.data as CustomerSessionData;
    }
  } catch (err) {
    console.warn("Could not resolve customer session details:", err);
  }

  return { token };
}
