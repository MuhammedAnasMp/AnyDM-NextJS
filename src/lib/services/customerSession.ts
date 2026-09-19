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

const GLOBAL_STORAGE_KEY = "anydm_customer_session_token";

export function getSessionStorageKey(username?: string): string {
  if (!username) return GLOBAL_STORAGE_KEY;
  const clean = username.replace(/^@/, "").toLowerCase().trim();
  return `anydm_customer_session_token_${clean}`;
}

/**
 * Captures `cs=` token from URL query string if present, strips it from the address bar
 * via window.history.replaceState, and stores it in website-scoped localStorage.
 */
export function initCustomerSessionFromUrl(username?: string): string | null {
  if (typeof window === "undefined") return null;

  const key = getSessionStorageKey(username);

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("cs") || urlParams.get("session");

    if (tokenFromUrl) {
      // Store in website-scoped localStorage as well as global fallback
      localStorage.setItem(key, tokenFromUrl);
      localStorage.setItem(GLOBAL_STORAGE_KEY, tokenFromUrl);

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

  return localStorage.getItem(key) || localStorage.getItem(GLOBAL_STORAGE_KEY);
}

/**
 * Returns existing website-scoped token from localStorage or generates a fresh guest session from API.
 */
export async function getOrInitCustomerSessionToken(username?: string): Promise<string> {
  if (typeof window === "undefined") return "";

  const key = getSessionStorageKey(username);
  let token = initCustomerSessionFromUrl(username);

  if (!token) {
    try {
      const cleanUsername = username ? username.replace(/^@/, "").toLowerCase().trim() : "";
      const res = await api.post("/crm/session/guest/", { username: cleanUsername });
      if (res.data?.token) {
        token = res.data.token;
        localStorage.setItem(key, token as string);
      }
    } catch (err) {
      console.warn("Failed to create guest session from backend. Generating local fallback token.");
      token = `cs_local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(key, token);
    }
  }

  return token || "";
}

/**
 * Fetches resolved session details (Instagram handle, profile pic, saved shipping address) from backend
 * scoped to the specific website/supplier.
 */
export async function resolveCustomerSession(username?: string): Promise<CustomerSessionData | null> {
  const token = await getOrInitCustomerSessionToken(username);
  if (!token) return null;

  let sessionData: CustomerSessionData = { token };

  try {
    const cleanUsername = username ? username.replace(/^@/, "").toLowerCase().trim() : "";
    const url = cleanUsername
      ? `/crm/session/resolve/?token=${encodeURIComponent(token)}&username=${encodeURIComponent(cleanUsername)}`
      : `/crm/session/resolve/?token=${encodeURIComponent(token)}`;

    const res = await api.get(url);
    if (res.data && res.data.found) {
      sessionData = res.data as CustomerSessionData;
    }
  } catch (err) {
    console.warn("Could not resolve customer session details:", err);
  }

  // Fallback: check localStorage saved customer details if backend customer_name is missing
  if (typeof window !== "undefined" && !sessionData.saved_address?.customer_name) {
    try {
      const storedOrders = JSON.parse(localStorage.getItem("anydm_customer_orders") || "[]");
      const cleanUser = username ? username.replace(/^@/, "").toLowerCase().trim() : "";
      const matchedOrder = storedOrders.slice().reverse().find((o: any) =>
        (!cleanUser || !o.username || o.username.toLowerCase() === cleanUser) && (o.name || o.email)
      );
      if (matchedOrder) {
        sessionData.saved_address = {
          ...sessionData.saved_address,
          customer_name: matchedOrder.name || matchedOrder.email?.split("@")[0],
          customer_email: sessionData.saved_address?.customer_email || matchedOrder.email,
          customer_phone: sessionData.saved_address?.customer_phone || matchedOrder.phone,
        };
      }
    } catch (e) {}
  }

  return sessionData;
}
