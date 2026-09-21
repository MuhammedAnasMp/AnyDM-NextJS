"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import api from "@/lib/services/api.service";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  RefreshCw,
  Users,
  UserX,
  Search,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  X,
  CheckCircle2
} from "lucide-react";

interface Contact {
  id: number;
  instagram_scoped_id: string;
  username: string;
  full_name: string | null;
  profile_pic: string | null;
  total_interactions: number;
  total_enquiries: number;
  lead_score: number;
  last_interaction_at: string | null;
  is_following_business: boolean | null;
  is_business_follow_user: boolean | null;
  gained_via_automation?: string | null;
  last_inbound_time: string | null;
  last_inbound_message: string | null;
  seconds_remaining_24h: number;
  seconds_remaining_23h: number;
  is_within_24h_window: boolean;
  is_within_23h_window: boolean;
}

export default function ContactsPage() {
  const router = useRouter();

  // Active Instagram Account Info from Redux
  const instagramAccounts = useSelector((state: RootState) => state.auth.instagramAccounts);
  const appUser = useSelector((state: RootState) => state.auth.user);
  const activeAccount = instagramAccounts.find(
    (acc: any) => acc.id === appUser?.active_instagram_account_id
  ) || instagramAccounts[0];

  // State variables for API parameters
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);           // True only during initial render
  const [isFetching, setIsFetching] = useState(false);     // True during tab changes, search, or pagination
  const [search, setSearch] = useState("");
  const [windowFilter, setWindowFilter] = useState<"all" | "24h" | "23h" | "expired">("all");
  const [sortBy, setSortBy] = useState("-last_interaction_at");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Search input & automation filter local state
  const [searchInput, setSearchInput] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [selectedAutomationFilter, setSelectedAutomationFilter] = useState("all");
  const [automationNames, setAutomationNames] = useState<string[]>([]);
  const [activeAutomationTooltip, setActiveAutomationTooltip] = useState<number | null>(null);

  // Fetch automations list for dropdown filter
  useEffect(() => {
    const loadAutomations = async () => {
      try {
        const res = await api.get("/automations/");
        const data = res.data?.results || res.data;
        if (Array.isArray(data)) {
          const names = data.map((a: any) => a.name || a.title).filter(Boolean);
          setAutomationNames(names);
        }
      } catch (e) {
        console.warn("Could not fetch automations for filter:", e);
      }
    };
    loadAutomations();
  }, []);

  // Merge unique automation names from API and contacts list
  const allAutomationNames = useMemo(() => {
    const fromContacts = contacts
      .map(c => c.gained_via_automation)
      .filter((v): v is string => Boolean(v));
    return Array.from(new Set([...automationNames, ...fromContacts]));
  }, [automationNames, contacts]);

  // Filter contacts by selected automation
  const displayedContacts = useMemo(() => {
    if (selectedAutomationFilter === "all") return contacts;
    if (selectedAutomationFilter === "none") return contacts.filter(c => !c.gained_via_automation);
    return contacts.filter(c => c.gained_via_automation?.toLowerCase() === selectedAutomationFilter.toLowerCase());
  }, [contacts, selectedAutomationFilter]);

  // Checkbox/Selection State for Broadcast
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  // Instagram Rate Limits & Anti-Block State
  const [rateLimitData, setRateLimitData] = useState<{
    hourly_dm_count: number;
    hourly_dm_limit: number;
    hourly_dm_remaining: number;
    rate_limit_utilization_pct: number;
    reset_time_seconds: number;
    health_status: string;
    username: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchRateLimits = async () => {
      try {
        const res = await api.get("/accounts/instagram/rate-limits/", {
          params: activeAccount?.id ? { account_id: activeAccount.id } : {}
        });
        if (res.data) {
          setRateLimitData(res.data);
        }
      } catch (e) {
        console.error("Error fetching rate limits:", e);
      }
    };
    fetchRateLimits();
    const interval = setInterval(fetchRateLimits, 20000);
    return () => clearInterval(interval);
  }, [activeAccount?.id]);

  // Broadcast Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTab, setBroadcastTab] = useState<"text" | "products">("text");
  const [broadcastMessageText, setBroadcastMessageText] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedBroadcastProducts, setSelectedBroadcastProducts] = useState<any[]>([]);
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastResults, setBroadcastResults] = useState<{
    success_count: number;
    failed_count: number;
    total_count: number;
    results: any[];
  } | null>(null);

  // Reference to cancel concurrent stale HTTP requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Reset page on search
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch Contacts with race condition handling
  const fetchContacts = useCallback(async (silent = false) => {
    // Abort previous incomplete request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      if (!silent) {
        setIsFetching(true);
      }
      const params = {
        search,
        window_filter: windowFilter === "all" ? "" : windowFilter,
        sort_by: sortBy,
        page,
        limit,
        automation_filter: selectedAutomationFilter === "all" ? "" : selectedAutomationFilter,
      };

      const res = await api.get("/crm/contacts/", {
        params,
        headers: { "x-bypass-cache": "true" },
        signal: controller.signal
      });

      setContacts(res.data.results || []);
      setCount(res.data.count || 0);
      setTotalPages(res.data.total_pages || 0);
    } catch (err: any) {
      // Avoid acting on intentionally aborted requests
      if (err.name === "AbortError" || err.name === "CanceledError") {
        return;
      }
      console.error("Error fetching contacts:", err);
    } finally {
      if (controller === abortControllerRef.current) {
        if (!silent) setIsFetching(false);
        setLoading(false);
      }
    }
  }, [search, windowFilter, sortBy, page, limit, selectedAutomationFilter, activeAccount?.id]);

  useEffect(() => {
    fetchContacts();

    const interval = setInterval(() => {
      fetchContacts(true);
    }, 10000); // Polling every 10 seconds to reduce server load

    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchContacts]);

  useEffect(() => {
    const handleRefresh = () => fetchContacts(false);
    window.addEventListener("refresh-contacts", handleRefresh);
    window.addEventListener("refresh-active-page", handleRefresh);
    return () => {
      window.removeEventListener("refresh-contacts", handleRefresh);
      window.removeEventListener("refresh-active-page", handleRefresh);
    };
  }, [fetchContacts]);

  // Fetch products for product templates in broadcast
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products/");
        setProducts(res.data?.results || res.data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  // Navigate to Individual Chat
  const handleStartChat = (contact: Contact) => {
    if (!contact.is_within_23h_window) return;
    const params = new URLSearchParams();
    params.set("recipient_id", contact.instagram_scoped_id);
    if (contact.username) params.set("username", contact.username);
    if (contact.full_name) params.set("name", contact.full_name);
    if (contact.profile_pic) params.set("avatar", encodeURIComponent(contact.profile_pic));
    router.push(`/dashboard/inbox/chats?${params.toString()}`);
  };

  // Format window status details
  const getWindowDetails = (contact: Contact) => {
    if (contact.is_within_23h_window) {
      const hours = Math.floor(contact.seconds_remaining_23h / 3600);
      const mins = Math.floor((contact.seconds_remaining_23h % 3600) / 60);
      return {
        text: `${hours}h ${mins}m left`,
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        indicatorClass: "bg-emerald-400",
      };
    } else if (contact.is_within_24h_window) {
      const mins = Math.floor(contact.seconds_remaining_24h / 60);
      return {
        text: `Expiring soon (${mins}m)`,
        badgeClass: ".bg-[#f59e0b]/10 text-[#fbbf24] border-[#f59e0b]/20",
        indicatorClass: "bg-[#fbbf24]",
      };
    } else {
      return {
        text: "Expired",
        badgeClass: ".bg-white/5 text-white/40 border-white/5",
        indicatorClass: "bg-white/20",
      };
    }
  };

  // Individual selection toggle
  const handleToggleSelect = (contact: Contact) => {
    if (!contact.is_within_24h_window) return;
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contact.instagram_scoped_id)) {
      newSelected.delete(contact.instagram_scoped_id);
    } else {
      newSelected.add(contact.instagram_scoped_id);
    }
    setSelectedContacts(newSelected);
  };

  // Select all toggler on active page
  const handleToggleSelectAll = () => {
    const activePageIds = displayedContacts
      .filter(c => c.is_within_24h_window)
      .map(c => c.instagram_scoped_id);

    if (activePageIds.length === 0) return;

    const allSelected = activePageIds.every(id => selectedContacts.has(id));
    const newSelected = new Set(selectedContacts);

    if (allSelected) {
      activePageIds.forEach(id => newSelected.delete(id));
    } else {
      activePageIds.forEach(id => newSelected.add(id));
    }
    setSelectedContacts(newSelected);
  };

  // Send bulk broadcast
  const handleSendBroadcast = async () => {
    if (selectedContacts.size === 0) return;

    let message_payload: any = null;

    if (broadcastTab === "text") {
      if (!broadcastMessageText.trim()) {
        alert("Please enter a broadcast message.");
        return;
      }
      message_payload = { text: broadcastMessageText };
    } else {
      if (selectedBroadcastProducts.length === 0) {
        alert("Please select at least one product to broadcast.");
        return;
      }

      // Generate Generic Template elements (Max 10)
      const username = activeAccount?.username || "shop";
      const elements = selectedBroadcastProducts.slice(0, 10).map(p => {
        const prodUrl = `${window.location.origin}/${username}/product/${p.id}`;
        const storeUrl = `${window.location.origin}/${username}`;
        return {
          title: (p.title || "Product").slice(0, 80),
          subtitle: (p.description || "Check out this product!").slice(0, 80),
          image_url: p.media_url || p.main_media_url || "",
          default_action: {
            type: "web_url",
            url: prodUrl
          },
          buttons: [
            {
              type: "web_url",
              title: p.price ? `Buy: ₹${p.price}`.slice(0, 20) : "Buy Now",
              url: prodUrl
            },
            {
              type: "web_url",
              title: "🌐 Visit Store",
              url: storeUrl
            }
          ]
        };
      });

      message_payload = {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: elements
          }
        }
      };
    }

    try {
      setBroadcastSending(true);
      const res = await api.post("/crm/broadcast/", {
        recipient_ids: Array.from(selectedContacts),
        message_payload
      });

      setBroadcastResults(res.data);
    } catch (err: any) {
      console.error("Error sending broadcast:", err);
      alert("An error occurred while sending the broadcast: " + (err.response?.data?.error || err.message));
    } finally {
      setBroadcastSending(false);
    }
  };

  const handleCloseBroadcastModal = () => {
    setShowBroadcastModal(false);
    setBroadcastResults(null);
    setBroadcastMessageText("");
    setSelectedBroadcastProducts([]);
    if (broadcastResults && broadcastResults.success_count > 0) {
      setSelectedContacts(new Set()); // Clear selection on successful sends
    }
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleToggleProduct = (product: any) => {
    setSelectedBroadcastProducts(prev => {
      const idx = prev.findIndex(p => p.id === product.id);
      if (idx > -1) {
        return prev.filter(p => p.id !== product.id);
      } else {
        if (prev.length >= 10) {
          alert("You can select a maximum of 10 products for a broadcast.");
          return prev;
        }
        return [...prev, product];
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-3 space-y-4 relative text-white font-sans"
    >
      {/* Background Soft Purple/Lavender Ambient Glow */}
      <div
        className="-z-10 pointer-events-none absolute left-1/2 top-[-50px] h-[300px] w-[600px] -translate-x-1/2 rounded-[50%] bg-gradient-to-r .from-purple-600/0 .via-purple-600/15 to-purple-600/0 blur-3xl"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Contacts & CRM Leads
          </h1>
          {/* <p className="text-xs text-white/60 mt-0.5">
            Analyze, segment, and interact with Instagram users synced through automated workflows and message history.
          </p> */}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchContacts(false)}
            disabled={isFetching}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-[#B6B2FF]' : ''}`} />
            <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Floating Selection Banner for Bulk Broadcast */}
      <AnimatePresence>
        {selectedContacts.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-purple-500/10 to-purple-500/10 border border-purple-500/30 p-3 rounded flex flex-col md:flex-row justify-between items-center gap-3 shadow-lg backdrop-blur-md relative overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-[11px] text-white">
                <strong className="text-[#B6B2FF] font-bold">{selectedContacts.size}</strong> contacts selected.
                (Broadcasts will filter and send only to users within their active 24h window).
              </span>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setSelectedContacts(new Set())}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[11px]  text-white transition-all cursor-pointer"
              >
                Clear Selection
              </button>
              <button
                onClick={() => setShowBroadcastModal(true)}
                className="px-3.5 py-1 bg-gradient-to-r from-[#8e8aff] to-[#706bff] hover:from-[#7e7aff] hover:to-[#605bff] text-white text-[11px] font-bold rounded shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                Send Broadcast
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Panel (Search, DM Usage, Sort) */}
      <div className="flex flex-col gap-3 bg-white/[0.02] border border-white/5 p-3 rounded backdrop-blur-md relative overflow-hidden">
        {/* Sleek horizontal progress loading bar */}
        {isFetching && !loading && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#B6B2FF] to-[#8e8aff] animate-pulse" />
        )}

        {/* Desktop View (md:flex) */}
        <div className="hidden md:flex md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-white/[0.03] border border-white/10 focus-within:border-white/20 transition-all w-full max-w-xs">
            <Search className="w-3.5 h-3.5 text-[#8e9192]" />
            <input
              type="text"
              placeholder="Search username or name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-white/40 outline-none w-full border-none p-0 focus:ring-0"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* DM Rate & Usage Indicator */}
            <div className="flex items-center gap-2 text-[11px]   px-2.5 py-1.5 rounded">
              <span className="text-[#8e9192]">DM Limit:</span>
              <span className="text-white font-mono font-bold">{rateLimitData?.hourly_dm_count || 0}/{rateLimitData?.hourly_dm_limit || 200}</span>
              <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden shrink-0">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (((rateLimitData?.hourly_dm_count || 0) / (rateLimitData?.hourly_dm_limit || 200)) * 100))}%`,
                    backgroundColor: (rateLimitData?.hourly_dm_count || 0) > 160 ? "#ef4444" : (rateLimitData?.hourly_dm_count || 0) > 120 ? "#f59e0b" : "#8e8aff"
                  }}
                />
              </div>
              <span className=" text-[10px]">
                ({rateLimitData?.rate_limit_utilization_pct || 0}% used • {Math.ceil((rateLimitData?.reset_time_seconds || 3600) / 60)}m reset)
              </span>
            </div>

            {/* Automation Filter Selection */}
            <div className="flex items-center gap-2">
              {/* <span className="text-[11px] text-white/50 shrink-0">Automation</span> */}
              <select
                value={selectedAutomationFilter}
                onChange={(e) => {
                  setSelectedAutomationFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-white/[0.04] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer focus:border-white/20 max-w-[160px] truncate"
              >
                <option value="all" className="bg-[#121212]">All Automations</option>
                <option value="none" className="bg-[#121212]">Direct / Organic</option>
                {allAutomationNames.map((name) => (
                  <option key={name} value={name} className="bg-[#121212]">
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Selection */}
            <div className="flex items-center gap-2">
              {/* <span className="text-[11px] text-white/50 shrink-0">Sort By</span> */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="bg-white/[0.04] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer focus:border-white/20"
              >
                <option value="-last_interaction_at" className="bg-[#121212]">Last Active (Newest)</option>
                <option value="last_interaction_at" className="bg-[#121212]">Last Active (Oldest)</option>
                <option value="-lead_score" className="bg-[#121212]">Rating: High to Low</option>
                <option value="lead_score" className="bg-[#121212]">Rating: Low to High</option>
                <option value="-total_interactions" className="bg-[#121212]">Interactions: High to Low</option>
                <option value="username" className="bg-[#121212]">Username: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile View (flex md:hidden) - Single Line Layout */}
        <div className="flex md:hidden items-center justify-between gap-2 w-full">
          {isMobileSearchOpen ? (
            /* Active Search Mode: Full-width search bar + Close Button (hides DM limit & sort) */
            <div className="flex items-center gap-2 w-full bg-white/[0.04] border border-white/15 px-2.5 py-1.5 rounded">
              <Search className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search username or name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-white/40 outline-none w-full border-none p-0 focus:ring-0"
              />
              <button
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setSearchInput("");
                }}
                className="p-1 text-white/50 hover:text-white shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Default Single Line Mode: Search Icon Button + Compact DM Limit Pill + Compact Sort */
            <div className="flex items-center justify-between gap-1.5 w-full text-[11px]">
              {/* Search Toggle Icon Button (Lens Icon only on Mobile) */}
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className="p-1.5 rounded bg-white/[0.04] border border-white/10 text-white/80 hover:text-white shrink-0 cursor-pointer"
                title="Search"
              >
                <Search className="w-4 h-4 text-purple-400" />
              </button>

              {/* DM Rate Limit Pill */}
              <div className="flex items-center gap-1 px-2 py-1.5 rounded bg-white/[0.03] border border-white/10 text-[10px] min-w-0 truncate">
                <span className="text-[#8e9192]">Limit:</span>
                <span className="text-white font-mono font-bold">{rateLimitData?.hourly_dm_count || 0}/{rateLimitData?.hourly_dm_limit || 200}</span>
                <span className="text-purple-400 text-[9px]">({Math.ceil((rateLimitData?.reset_time_seconds || 3600) / 60)}m)</span>
              </div>

              {/* Automation Filter Compact Select */}
              <div className="shrink-0 max-w-[100px]">
                <select
                  value={selectedAutomationFilter}
                  onChange={(e) => {
                    setSelectedAutomationFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-white/[0.04] border border-white/10 rounded px-1.5 py-1.5 text-[10px] text-white outline-none cursor-pointer focus:border-white/20 w-full truncate"
                >
                  <option value="all" className="bg-[#121212]">All Auto</option>
                  <option value="none" className="bg-[#121212]">Direct</option>
                  {allAutomationNames.map((name) => (
                    <option key={name} value={name} className="bg-[#121212]">
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Selection Compact Dropdown */}
              <div className="shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="bg-white/[0.04] border border-white/10 rounded px-2 py-1.5 text-[10px] text-white outline-none cursor-pointer focus:border-white/20"
                >
                  <option value="-last_interaction_at" className="bg-[#121212]">Newest</option>
                  <option value="last_interaction_at" className="bg-[#121212]">Oldest</option>
                  <option value="-lead_score" className="bg-[#121212]">High Rating</option>
                  <option value="lead_score" className="bg-[#121212]">Low Rating</option>
                  <option value="-total_interactions" className="bg-[#121212]">Top Interactions</option>
                  <option value="username" className="bg-[#121212]">A-Z</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        {/* <div className="flex border-b border-white/5 text-xs gap-6 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Contacts" },
            { id: "24h", label: "Active Window (24h)" },
            { id: "23h", label: "Active Window (23h)" },
            { id: "expired", label: "Expired Window" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setWindowFilter(tab.id as any);
                setPage(1);
              }}
              disabled={isFetching}
              className={`pb-2 relative font-medium transition-all cursor-pointer disabled:cursor-wait ${windowFilter === tab.id
                ? "text-white"
                : "text-white/40 hover:text-white/70"
                }`}
            >
              {tab.label}
              {windowFilter === tab.id && (
                <motion.div
                  layoutId="activeTabUnderlineContacts"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B6B2FF] rounded-full"
                />
              )}
            </button>
          ))}
        </div> */}
      </div>

      {/* Main Grid/Table Card Container */}
      <div className="bg-white/[0.01] rounded overflow-hidden border-0 md:border border-white/5 backdrop-blur-md relative min-h-[350px]">
        {/* Desktop Table View (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[700px] text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/10 text-white/50 tracking-wider font-normal">
                <th className="px-3 py-2 text-center w-10 font-normal">
                  <input
                    type="checkbox"
                    checked={
                      displayedContacts.length > 0 &&
                      displayedContacts.some(c => c.is_within_24h_window) &&
                      displayedContacts.filter(c => c.is_within_24h_window).every(c => selectedContacts.has(c.instagram_scoped_id))
                    }
                    disabled={displayedContacts.length === 0 || !displayedContacts.some(c => c.is_within_24h_window)}
                    onChange={() => handleToggleSelectAll()}
                    className="accent-[#B6B2FF] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer w-4 h-4 rounded"
                  />
                </th>
                <th className="px-3 py-2 font-normal">User Details</th>
                <th className="px-3 py-2 font-normal">Rating (Lead Score)</th>
                <th className="px-3 py-2 font-normal">Activity & Metrics</th>
                <th className="px-3 py-2 font-normal">Automation</th>
                <th className="px-3 py-2 text-right font-normal">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className={`divide-y divide-white/5 transition-opacity duration-200 ${isFetching && !loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
              {loading ? (
                // Skeletons during initial load
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-white/5">
                    <td className="px-3 py-2.5 text-center"><div className="w-4 h-4 bg-white/5 animate-pulse rounded mx-auto" /></td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-2.5 w-24 bg-white/5 animate-pulse rounded" />
                          <div className="h-2 w-14 bg-white/5 animate-pulse rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="h-2.5 w-20 bg-white/5 animate-pulse rounded" />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="space-y-1.5">
                        <div className="h-2.5 w-16 bg-white/5 animate-pulse rounded" />
                        <div className="h-2 w-10 bg-white/5 animate-pulse rounded" />
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="h-4 w-16 bg-white/5 animate-pulse rounded-full" />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="h-7 w-16 bg-white/5 animate-pulse rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : displayedContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-white/40">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserX className="w-8 h-8 text-[#8e9192]" />
                      <span className="text-sm font-medium">No contacts found matching criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedContacts.map((contact) => {
                  const win = getWindowDetails(contact);
                  const isChecked = selectedContacts.has(contact.instagram_scoped_id);
                  return (
                    <tr
                      key={contact.id}
                      className={`hover:bg-white/[0.02] transition-all group ${isChecked ? "bg-white/[0.02]" : ""}`}
                    >
                      {/* Checkbox Column */}
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={!contact.is_within_24h_window}
                          onChange={() => handleToggleSelect(contact)}
                          className="accent-[#B6B2FF] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer w-4 h-4 rounded"
                        />
                      </td>

                      {/* User Details */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              contact.profile_pic ||
                              `https://ui-avatars.com/api/?name=${contact.username}&background=random&color=fff`
                            }
                            alt={contact.username}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "https://ui-avatars.com/api/?name=null";
                            }}
                            className="w-8 h-8 rounded-full border border-white/10 object-cover bg-white/5"
                          />
                          <div>
                            <div className="font-bold text-white text-xs">
                              {contact.full_name || contact.username}
                            </div>
                            <div className="text-white/40 text-[10px] mt-0.5">
                              @{contact.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Rating (Lead Score) */}
                      <td className="px-3 py-2">
                        {(() => {
                          const score = (() => {
                            if (contact.lead_score && contact.lead_score > 0) return Math.min(100, contact.lead_score);
                            let s = 15;
                            s += Math.min(40, (contact.total_interactions || 0) * 10);
                            s += Math.min(30, (contact.total_enquiries || 0) * 15);
                            if (contact.is_following_business) s += 15;
                            if (contact.is_within_24h_window) s += 15;
                            return Math.min(100, s);
                          })();

                          const isHot = score >= 70;
                          const isWarm = score >= 40 && score < 70;

                          const gradientColor = isHot
                            ? "from-emerald-400 to-teal-300"
                            : isWarm
                              ? "from-amber-400 to-yellow-300"
                              : "from-[#B6B2FF] to-[#8e8aff]";

                          return (
                            <div className="space-y-1 w-28">
                              <div className="flex items-center justify-between font-medium text-[10px]">
                                <span className="text-white font-bold">{score}%</span>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`bg-gradient-to-r ${gradientColor} h-full rounded-full transition-all duration-500`}
                                  style={{ width: `${Math.max(8, score)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Activity & Metrics */}
                      <td className="px-3 py-2">
                        <div className="space-y-0.5 text-white/70 text-[10px]">
                          <div>
                            <strong className="text-white font-semibold">{contact.total_interactions}</strong> interactions •{" "}
                            <strong className="text-white font-semibold">{contact.total_enquiries}</strong> enquiries
                          </div>
                          <div className="text-[9px] text-white/40">
                            Active:{" "}
                            {contact.last_interaction_at
                              ? new Date(contact.last_interaction_at).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                              : "Never"}
                          </div>
                        </div>
                      </td>

                      {/* Automation */}
                      <td className="px-3 py-2">
                        <span className="text-white/80 text-xs font-medium">
                          {contact.gained_via_automation || "Direct"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => handleStartChat(contact)}
                          disabled={!contact.is_within_23h_window}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-semibold transition-all relative overflow-hidden ${contact.is_within_23h_window
                            ? "bg-white text-black hover:bg-zinc-200 cursor-pointer active:scale-95 shadow"
                            : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                            }`}
                        >
                          <MessageSquare className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Compact Touch Cards (block md:hidden) */}
        <div className={`block md:hidden md:p-2 border-none space-y-2 transition-opacity duration-200 ${isFetching && !loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="p-3 bg-white/[0.02] border-0 md:border border-white/5 rounded-lg space-y-2 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/5" />
                    <div className="h-3 w-28 bg-white/5 rounded" />
                  </div>
                  <div className="h-4 w-16 bg-white/5 rounded-full" />
                </div>
                <div className="h-2 w-full bg-white/5 rounded" />
              </div>
            ))
          ) : displayedContacts.length === 0 ? (
            <div className="text-center py-16 text-white/40">
              <UserX className="w-7 h-7 mx-auto mb-1.5 text-[#8e9192]" />
              <span className="text-xs font-medium">No contacts found matching criteria.</span>
            </div>
          ) : (
            displayedContacts.map((contact) => {
              const win = getWindowDetails(contact);
              const isChecked = selectedContacts.has(contact.instagram_scoped_id);

              const score = (() => {
                if (contact.lead_score && contact.lead_score > 0) return Math.min(100, contact.lead_score);
                let s = 15;
                s += Math.min(40, (contact.total_interactions || 0) * 10);
                s += Math.min(30, (contact.total_enquiries || 0) * 15);
                if (contact.is_following_business) s += 15;
                if (contact.is_within_24h_window) s += 15;
                return Math.min(100, s);
              })();

              const isHot = score >= 70;
              const isWarm = score >= 40 && score < 70;
              const gradientColor = isHot
                ? "from-emerald-400 to-teal-300"
                : isWarm
                  ? "from-amber-400 to-yellow-300"
                  : "from-[#B6B2FF] to-[#8e8aff]";

              return (
                <div
                  key={contact.id}
                  className={`p-2.5 rounded-lg border-0 md:border transition-all ${isChecked ? "bg-white/[0.04] border-[#B6B2FF]/40" : "bg-white/[0.02] border-white/5"
                    }`}
                >
                  {/* Header Row: Checkbox, Avatar, Name & Username, Window Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={!contact.is_within_24h_window}
                        onChange={() => handleToggleSelect(contact)}
                        className="accent-[#B6B2FF] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer w-4 h-4 rounded shrink-0"
                      />
                      <img
                        src={
                          contact.profile_pic ||
                          `https://ui-avatars.com/api/?name=${contact.username}&background=random&color=fff`
                        }
                        alt={contact.username}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://ui-avatars.com/api/?name=null";
                        }}
                        className="w-8 h-8 rounded-full border border-white/10 object-cover bg-white/5 shrink-0"
                      />
                      <div className="min-w-0 leading-tight">
                        <div className="font-bold text-white text-xs truncate">
                          {contact.full_name || contact.username}
                        </div>
                        {contact.full_name && (
                          <div className="text-[10px] text-white/50 truncate">
                            @{contact.username}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Automation Name */}
                    <div className="shrink-0 text-right">
                      <span className="text-white/80 text-[11px] font-medium">
                        {contact.gained_via_automation || "Direct"}
                      </span>
                    </div>
                  </div>

                  {/* Metrics & Rating Footer */}
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between gap-2 text-[10px]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-white/50 text-[9px]">Rating:</span>
                      <span className="text-white font-bold text-[10px]">{score}%</span>
                      <div className="w-8 bg-white/10 rounded-full h-1 overflow-hidden shrink-0">
                        <div
                          className={`bg-gradient-to-r ${gradientColor} h-full rounded-full`}
                          style={{ width: `${Math.max(8, score)}%` }}
                        />
                      </div>
                      <span className="text-white/40 text-[9px] ml-1 truncate">
                        • {contact.total_interactions} int
                      </span>
                    </div>

                    {/* Message Button */}
                    <button
                      onClick={() => handleStartChat(contact)}
                      disabled={!contact.is_within_23h_window}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-semibold transition-all shrink-0 ${contact.is_within_23h_window
                        ? "bg-white text-black hover:bg-zinc-200 cursor-pointer active:scale-95 shadow"
                        : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                        }`}
                    >
                      <MessageSquare className="w-3 h-3" />

                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 0 && (
          <div className="px-3 py-2.5 border-t border-white/5 bg-white/[0.02]">
            {/* Desktop View (hidden md:flex) */}
            <div className="hidden md:flex items-center justify-between gap-3 text-xs">
              <div className="text-white/40 text-[11px]">
                Showing <span className="text-white font-medium">{(page - 1) * limit + 1}</span> to{" "}
                <span className="text-white font-medium">{Math.min(page * limit, count)}</span> of{" "}
                <span className="text-white font-medium">{count}</span> contacts
              </div>

              <div className="flex items-center gap-4">
                {/* Page Limit Selector */}
                <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                  <span>Rows</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="bg-transparent text-white outline-none cursor-pointer text-xs focus:ring-0 border-none"
                  >
                    <option value={10} className="bg-[#121212]">10</option>
                    <option value={25} className="bg-[#121212]">25</option>
                    <option value={50} className="bg-[#121212]">50</option>
                  </select>
                </div>

                {/* Prev/Next buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isFetching}
                    className={`w-7 h-7 rounded border flex items-center justify-center transition-all ${page === 1 || isFetching
                      ? "border-white/5 text-white/20 cursor-not-allowed"
                      : "border-white/10 text-white hover:bg-white/5 cursor-pointer active:scale-95"
                      }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="text-xs text-white/70 px-2">
                    {page} / {totalPages}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || isFetching}
                    className={`w-7 h-7 rounded border flex items-center justify-center transition-all ${page === totalPages || isFetching
                      ? "border-white/5 text-white/20 cursor-not-allowed"
                      : "border-white/10 text-white hover:bg-white/5 cursor-pointer active:scale-95"
                      }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile View (flex md:hidden) - Ultra Simple Single Line */}
            <div className="flex md:hidden items-center justify-between gap-2 text-[11px]">
              <div className="text-white/60 font-medium">
                {(page - 1) * limit + 1}-{Math.min(page * limit, count)} of {count}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-white/[0.04] border border-white/10 rounded px-1.5 py-1 text-[10px] text-white outline-none cursor-pointer"
                >
                  <option value={10} className="bg-[#121212]">10 rows</option>
                  <option value={25} className="bg-[#121212]">25 rows</option>
                  <option value={50} className="bg-[#121212]">50 rows</option>
                </select>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isFetching}
                    className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${page === 1 || isFetching
                      ? "border-white/5 text-white/20 cursor-not-allowed"
                      : "border-white/10 text-white active:scale-95 cursor-pointer"
                      }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-[10px] text-white/80 font-bold px-1">
                    {page}/{totalPages}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || isFetching}
                    className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${page === totalPages || isFetching
                      ? "border-white/5 text-white/20 cursor-not-allowed"
                      : "border-white/10 text-white active:scale-95 cursor-pointer"
                      }`}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Broadcast Modal Popup */}
      <AnimatePresence>
        {showBroadcastModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseBroadcastModal}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              data-modal="true"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#1c1b1b]">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-purple-400" />
                  <h3 className=" text-sm tracking-wide">Compose Bulk Broadcast</h3>
                </div>
                <button
                  onClick={handleCloseBroadcastModal}
                  className="w-6 h-6 rounded bg-[#20201f] border border-[#2a2a2a] flex items-center justify-center text-[#8e9192] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
                {!broadcastResults ? (
                  <>
                    <div className="p-3 bg-white/5 rounded border border-white/5 space-y-1.5 text-[11px] text-white/70">
                      <div className="flex items-center justify-between text-white font-medium">
                        <span>Selected Recipients: <strong>{selectedContacts.size}</strong> contacts</span>
                        <span className="text-purple-400 font-mono text-[10px] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                          ⚡ {rateLimitData?.hourly_dm_remaining ?? 200} Hourly DM quota left
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8e9192]">
                        Messages are filtered for the 24h compliance window and sent with randomized jitter delays (1.5s–3.5s) to guarantee account protection.
                      </p>
                    </div>

                    {/* Mode Select Tabs */}
                    <div className="flex border-b border-white/5 text-xs gap-6 pb-1">
                      <button
                        onClick={() => setBroadcastTab("text")}
                        className={`pb-2 relative font-medium transition-all ${broadcastTab === "text" ? "text-white" : "text-white/40 hover:text-white/70"
                          }`}
                      >
                        Text Message
                        {broadcastTab === "text" && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400" />
                        )}
                      </button>
                      <button
                        onClick={() => setBroadcastTab("products")}
                        className={`pb-2 relative font-medium transition-all ${broadcastTab === "products" ? "text-white" : "text-white/40 hover:text-white/70"
                          }`}
                      >
                        Product Showcase
                        {broadcastTab === "products" && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400" />
                        )}
                      </button>
                    </div>

                    {/* Tab Panels */}
                    {broadcastTab === "text" ? (
                      <div className="space-y-2">
                        <label className="text-[10px] tracking-wider text-white/40  block">
                          Broadcast Message
                        </label>
                        <textarea
                          rows={4}
                          value={broadcastMessageText}
                          onChange={(e) => setBroadcastMessageText(e.target.value)}
                          placeholder="Type your message to send in bulk..."
                          className="w-full bg-white/[0.03] border border-white/10 rounded p-3 text-xs text-white placeholder-white/30 focus:border-white/20 outline-none resize-none"
                        />
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] tracking-wider text-white/40 ">
                            Select Products (Max 10)
                          </label>
                          {selectedBroadcastProducts.length > 0 && (
                            <span className="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold">
                              {selectedBroadcastProducts.length} Selected
                            </span>
                          )}
                        </div>

                        {/* Product Search */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/[0.03] border border-white/10 focus-within:border-white/20 transition-all">
                          <Search className="w-3.5 h-3.5 text-[#8e9192]" />
                          <input
                            type="text"
                            placeholder="Search products..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="bg-transparent border-none text-[11px] text-white placeholder-white/25 outline-none w-full p-0 focus:ring-0"
                          />
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto custom-scrollbar p-0.5">
                          {filteredProducts.length === 0 ? (
                            <div className="col-span-2 text-center py-6 text-white/30 text-xs">
                              No products found.
                            </div>
                          ) : (
                            filteredProducts.map((prod) => {
                              const isSelected = selectedBroadcastProducts.some(p => p.id === prod.id);
                              return (
                                <div
                                  key={prod.id}
                                  onClick={() => handleToggleProduct(prod)}
                                  className={`relative flex items-center gap-3 p-2 rounded border cursor-pointer transition-all ${isSelected
                                    ? "bg-purple-500/10 border-purple-500/40 shadow-lg"
                                    : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                                    }`}
                                >
                                  <img
                                    src={prod.media_url || prod.main_media_url || `https://ui-avatars.com/api/?name=${prod.title}&background=random&color=fff`}
                                    alt={prod.title}
                                    className="w-10 h-10 rounded object-cover bg-white/5 border border-white/10"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <h5 className=" text-white truncate text-[11px] leading-tight">
                                      {prod.title}
                                    </h5>
                                    <p className="text-[10px] font-bold text-purple-400 mt-0.5">
                                      ₹{prod.price || "Free"}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Broadcast Results Summary Screen */
                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <Megaphone className="w-8 h-8 text-purple-400 animate-pulse" />
                      <h4 className="font-bold text-base mt-2">Broadcast Complete!</h4>
                      <p className="text-xs text-white/50 mt-1">Summary of sent statuses</p>
                    </div>

                    {/* Result Badges */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/5 border border-white/5 p-3 rounded text-center">
                        <div className="text-xl font-bold text-white">{broadcastResults.total_count}</div>
                        <div className="text-[9px] text-white/40  mt-0.5">Total</div>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded text-center">
                        <div className="text-xl font-bold text-purple-400">{broadcastResults.success_count}</div>
                        <div className="text-[9px] text-purple-400/70  mt-0.5">Sent</div>
                      </div>
                      <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 p-3 rounded text-center">
                        <div className="text-xl font-bold text-[#f87171]">{broadcastResults.failed_count}</div>
                        <div className="text-[9px] text-[#f87171]/60  mt-0.5">Failed</div>
                      </div>
                    </div>

                    {/* Result Logs List */}
                    <div className="space-y-2">
                      <label className="text-[9px] tracking-wider text-white/40 font-bold block">
                        Detailed Broadcast Logs
                      </label>
                      <div className="max-h-44 overflow-y-auto custom-scrollbar border border-white/5 rounded divide-y divide-white/5 bg-white/[0.01]">
                        {broadcastResults.results.map((res: any, idx: number) => {
                          const contact = contacts.find(c => c.instagram_scoped_id === res.recipient_id);
                          const name = contact ? contact.full_name || contact.username : `@${res.recipient_id}`;
                          const isSuccess = res.status === "success";

                          return (
                            <div key={idx} className="p-3 flex items-center justify-between text-xs">
                              <span className=" text-white/80">{name}</span>
                              {isSuccess ? (
                                <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded tracking-wider">
                                  Sent
                                </span>
                              ) : (
                                <span
                                  className="text-[9px] font-bold text-[#f87171] bg-[#ef4444]/10 border border-[#ef4444]/20 px-2 py-0.5 rounded tracking-wider cursor-help"
                                  title={res.error}
                                >
                                  Failed: {res.error?.includes("Allowed window") ? "Expired Window" : "Error"}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-white/5 flex justify-end gap-2.5 shrink-0 bg-white/[0.01]">
                {!broadcastResults ? (
                  <>
                    <button
                      onClick={handleCloseBroadcastModal}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs  text-white transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendBroadcast}
                      disabled={broadcastSending}
                      className="px-5 py-2 bg-gradient-to-r from-[#8e8aff] to-[#706bff] hover:from-[#7e7aff] hover:to-[#605bff] text-white text-xs font-bold rounded shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {broadcastSending ? (
                        <>
                          <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                          Broadcasting...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">send</span>
                          Send Broadcast ({selectedContacts.size})
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCloseBroadcastModal}
                    className="px-5 py-2 bg-gradient-to-r from-[#8e8aff] to-[#706bff] text-white text-xs font-bold rounded shadow-lg active:scale-95 transition-all cursor-pointer"
                  >
                    Done
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}