"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import api from "@/lib/services/api.service";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

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

  // Search input local state
  const [searchInput, setSearchInput] = useState("");

  // Checkbox/Selection State for Broadcast
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

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
  }, [search, windowFilter, sortBy, page, limit]);

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
    const url = `/dashboard/inbox?recipient_id=${contact.instagram_scoped_id}&username=${contact.username}&name=${encodeURIComponent(contact.full_name || contact.username)}&avatar=${encodeURIComponent(contact.profile_pic || "")}`;
    router.push(url);
  };

  // Format window status details
  const getWindowDetails = (contact: Contact) => {
    if (contact.is_within_23h_window) {
      const hours = Math.floor(contact.seconds_remaining_23h / 3600);
      const mins = Math.floor((contact.seconds_remaining_23h % 3600) / 60);
      return {
        text: `${hours}h ${mins}m left`,
        badgeClass: "bg-[#10b981]/10 text-[#34d399] border-[#10b981]/20",
        indicatorClass: "bg-[#34d399] animate-pulse",
      };
    } else if (contact.is_within_24h_window) {
      const mins = Math.floor(contact.seconds_remaining_24h / 60);
      return {
        text: `Expiring soon (${mins}m)`,
        badgeClass: "bg-[#f59e0b]/10 text-[#fbbf24] border-[#f59e0b]/20",
        indicatorClass: "bg-[#fbbf24]",
      };
    } else {
      return {
        text: "Expired",
        badgeClass: "bg-white/5 text-white/40 border-white/5",
        indicatorClass: "bg-white/20",
      };
    }
  };

  // Individual selection toggle
  const handleToggleSelect = (instagram_scoped_id: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(instagram_scoped_id)) {
      newSelected.delete(instagram_scoped_id);
    } else {
      newSelected.add(instagram_scoped_id);
    }
    setSelectedContacts(newSelected);
  };

  // Select all toggler on active page
  const handleToggleSelectAll = () => {
    const activePageIds = contacts.map(c => c.instagram_scoped_id);
    const allSelected = activePageIds.every(id => selectedContacts.has(id));
    const newSelected = new Set(selectedContacts);

    if (allSelected) {
      activePageIds.forEach(id => newSelected.delete(id));
    } else {
      activePageIds.forEach(id => newSelected.add(id));
    }
    setSelectedContacts(newSelected);
  };

  // Select only users with active 24h window
  const handleSelectActiveWindow = () => {
    const activeIds = contacts
      .filter(c => c.is_within_24h_window)
      .map(c => c.instagram_scoped_id);
    const newSelected = new Set(activeIds);
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
      className="space-y-6 relative text-white"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Contacts & CRM Leads
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Analyze, segment, and interact with Instagram users synced through automated workflows and message history.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchContacts(false)}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-sm ${isFetching ? 'animate-spin' : ''}`}>refresh</span>
            Refresh
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
            className="bg-gradient-to-r from-[#B6B2FF]/10 to-[#8FE3FF]/10 border border-[#B6B2FF]/30 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg backdrop-blur-md relative overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#B6B2FF]">group</span>
              <span className="text-xs text-white">
                <strong className="text-[#B6B2FF] font-bold">{selectedContacts.size}</strong> contacts selected.
                (Broadcasts will filter and send only to users within their active 24h window).
              </span>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setSelectedContacts(new Set())}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer"
              >
                Clear Selection
              </button>
              <button
                onClick={() => handleSelectActiveWindow()}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-[#8FE3FF] transition-all cursor-pointer"
              >
                Select Active Only
              </button>
              <button
                onClick={() => setShowBroadcastModal(true)}
                className="px-4 py-1.5 bg-gradient-to-r from-[#8e8aff] to-[#706bff] hover:from-[#7e7aff] hover:to-[#605bff] text-white text-xs font-bold rounded-lg shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                Send Broadcast
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Panel (Search, Filters, Sort) */}
      <div className="flex flex-col gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-xl backdrop-blur-md relative overflow-hidden">
        {/* Sleek horizontal progress loading bar */}
        {isFetching && !loading && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#B6B2FF] to-[#8FE3FF] animate-pulse" />
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 focus-within:border-white/20 transition-all w-full md:max-w-xs">
            <span className="material-symbols-outlined text-sm text-white/40">search</span>
            <input
              type="text"
              placeholder="Search username or name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-white/40 outline-none w-full border-none p-0 focus:ring-0"
            />
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer focus:border-white/20"
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

        {/* Filter Tabs */}
        <div className="flex border-b border-white/5 text-xs gap-6 overflow-x-auto pb-1">
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
        </div>
      </div>

      {/* Main Grid/Table Card Container */}
      <div className="bg-white/[0.01] rounded-xl overflow-hidden border border-white/5 backdrop-blur-md relative min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/10 text-white/50 font-semibold uppercase tracking-wider">
                <th className="px-4 py-4 text-center w-12">
                  <input
                    type="checkbox"
                    checked={contacts.length > 0 && contacts.every(c => selectedContacts.has(c.instagram_scoped_id))}
                    onChange={() => handleToggleSelectAll()}
                    className="accent-[#B6B2FF] cursor-pointer w-4 h-4 rounded"
                  />
                </th>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Rating (Lead Score)</th>
                <th className="px-6 py-4">Activity & Metrics</th>
                <th className="px-6 py-4">Window Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className={`divide-y divide-white/5 transition-opacity duration-200 ${isFetching && !loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
              {loading ? (
                // Skeletons during the actual initial page load to prevent erratic jumps
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-white/5">
                    <td className="px-4 py-6 text-center"><div className="w-4 h-4 bg-white/5 animate-pulse rounded mx-auto" /></td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-3 w-28 bg-white/5 animate-pulse rounded" />
                          <div className="h-2 w-16 bg-white/5 animate-pulse rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-3 w-24 bg-white/5 animate-pulse rounded" />
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-2">
                        <div className="h-3 w-20 bg-white/5 animate-pulse rounded" />
                        <div className="h-2 w-12 bg-white/5 animate-pulse rounded" />
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-5 w-20 bg-white/5 animate-pulse rounded-full" />
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="h-8 w-24 bg-white/5 animate-pulse rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-24 text-white/40">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-white/20">group_off</span>
                      <span className="text-sm font-medium">No contacts found matching criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => {
                  const win = getWindowDetails(contact);
                  const isChecked = selectedContacts.has(contact.instagram_scoped_id);
                  return (
                    <tr
                      key={contact.id}
                      className={`hover:bg-white/[0.02] transition-all group ${isChecked ? "bg-white/[0.02]" : ""
                        }`}
                    >
                      {/* Checkbox Column */}
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(contact.instagram_scoped_id)}
                          className="accent-[#B6B2FF] cursor-pointer w-4 h-4 rounded"
                        />
                      </td>

                      {/* User Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              contact.profile_pic ||
                              `https://ui-avatars.com/api/?name=${contact.username}&background=random&color=fff`
                            }
                            alt={contact.username}
                            className="w-10 h-10 rounded-full border border-white/10 object-cover bg-white/5"
                          />
                          <div>
                            <div className="font-bold text-white text-sm">
                              {contact.full_name || contact.username}
                            </div>
                            <div className="text-white/40 text-xs">
                              @{contact.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Rating (Lead Score) */}
                      <td className="px-6 py-4">
                        <div className="space-y-1.5 w-32">
                          <div className="flex justify-between font-medium text-[11px]">
                            <span className="text-white/50">Lead Score</span>
                            <span className="text-white">{contact.lead_score}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#B6B2FF] to-[#8FE3FF] h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(5, Math.min(100, contact.lead_score))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Activity & Metrics */}
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-white/70">
                          <div>
                            <strong className="text-white font-semibold">
                              {contact.total_interactions}
                            </strong>{" "}
                            interactions
                          </div>
                          <div>
                            <strong className="text-white font-semibold">
                              {contact.total_enquiries}
                            </strong>{" "}
                            enquiries
                          </div>
                          <div className="text-[10px] text-white/40">
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

                      {/* Window Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${win.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${win.indicatorClass}`} />
                          {win.text}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleStartChat(contact)}
                          disabled={!contact.is_within_23h_window}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative overflow-hidden group/btn ${contact.is_within_23h_window
                              ? "bg-gradient-to-r from-[#8e8aff] to-[#706bff] hover:from-[#7e7aff] hover:to-[#605bff] text-white cursor-pointer active:scale-95 shadow-md shadow-purple-900/20"
                              : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                            }`}
                        >
                          <span className="material-symbols-outlined text-sm">chat</span>
                          Message
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-white/5 bg-white/[0.02]">
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
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>

                <div className="text-xs text-white/70 font-semibold px-2">
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
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#B6B2FF]">campaign</span>
                  <h3 className="font-semibold text-sm tracking-wide">Compose Bulk Broadcast</h3>
                </div>
                <button
                  onClick={handleCloseBroadcastModal}
                  className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
                {!broadcastResults ? (
                  <>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] text-white/70">
                      You are preparing a broadcast to{" "}
                      <strong className="text-white font-bold">{selectedContacts.size}</strong> selected contact(s).
                      Instagram API only allows broadcasting to recipients with an active 24-hour message window.
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
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B6B2FF]" />
                        )}
                      </button>
                      <button
                        onClick={() => setBroadcastTab("products")}
                        className={`pb-2 relative font-medium transition-all ${broadcastTab === "products" ? "text-white" : "text-white/40 hover:text-white/70"
                          }`}
                      >
                        Product Showcase
                        {broadcastTab === "products" && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B6B2FF]" />
                        )}
                      </button>
                    </div>

                    {/* Tab Panels */}
                    {broadcastTab === "text" ? (
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold block">
                          Broadcast Message
                        </label>
                        <textarea
                          rows={4}
                          value={broadcastMessageText}
                          onChange={(e) => setBroadcastMessageText(e.target.value)}
                          placeholder="Type your message to send in bulk..."
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-white/30 focus:border-white/20 outline-none resize-none"
                        />
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                            Select Products (Max 10)
                          </label>
                          {selectedBroadcastProducts.length > 0 && (
                            <span className="text-[9px] bg-[#B6B2FF]/20 text-[#B6B2FF] px-2.5 py-0.5 rounded-full font-bold uppercase">
                              {selectedBroadcastProducts.length} Selected
                            </span>
                          )}
                        </div>

                        {/* Product Search */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 focus-within:border-white/20 transition-all">
                          <span className="material-symbols-outlined text-xs text-white/40">search</span>
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
                                  className={`relative flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-all ${isSelected
                                      ? "bg-[#B6B2FF]/10 border-[#B6B2FF]/40 shadow-lg"
                                      : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                                    }`}
                                >
                                  <img
                                    src={prod.media_url || prod.main_media_url || `https://ui-avatars.com/api/?name=${prod.title}&background=random&color=fff`}
                                    alt={prod.title}
                                    className="w-10 h-10 rounded-lg object-cover bg-white/5 border border-white/10"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <h5 className="font-semibold text-white truncate text-[11px] leading-tight">
                                      {prod.title}
                                    </h5>
                                    <p className="text-[10px] font-bold text-[#B6B2FF] mt-0.5">
                                      ₹{prod.price || "Free"}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <span className="material-symbols-outlined text-[#B6B2FF] text-base pr-1">check_circle</span>
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
                      <span className="material-symbols-outlined text-4xl text-[#B6B2FF] animate-pulse">campaign</span>
                      <h4 className="font-bold text-base mt-2">Broadcast Complete!</h4>
                      <p className="text-xs text-white/50 mt-1">Summary of sent statuses</p>
                    </div>

                    {/* Result Badges */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-center">
                        <div className="text-xl font-bold text-white">{broadcastResults.total_count}</div>
                        <div className="text-[9px] text-white/40 uppercase font-semibold mt-0.5">Total</div>
                      </div>
                      <div className="bg-[#10b981]/10 border border-[#10b981]/20 p-3 rounded-xl text-center">
                        <div className="text-xl font-bold text-[#34d399]">{broadcastResults.success_count}</div>
                        <div className="text-[9px] text-[#34d399]/60 uppercase font-semibold mt-0.5">Sent</div>
                      </div>
                      <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 p-3 rounded-xl text-center">
                        <div className="text-xl font-bold text-[#f87171]">{broadcastResults.failed_count}</div>
                        <div className="text-[9px] text-[#f87171]/60 uppercase font-semibold mt-0.5">Failed</div>
                      </div>
                    </div>

                    {/* Result Logs List */}
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold block">
                        Detailed Broadcast Logs
                      </label>
                      <div className="max-h-44 overflow-y-auto custom-scrollbar border border-white/5 rounded-xl divide-y divide-white/5 bg-white/[0.01]">
                        {broadcastResults.results.map((res: any, idx: number) => {
                          const contact = contacts.find(c => c.instagram_scoped_id === res.recipient_id);
                          const name = contact ? contact.full_name || contact.username : `@${res.recipient_id}`;
                          const isSuccess = res.status === "success";

                          return (
                            <div key={idx} className="p-3 flex items-center justify-between text-xs">
                              <span className="font-semibold text-white/80">{name}</span>
                              {isSuccess ? (
                                <span className="text-[9px] font-bold text-[#34d399] bg-[#10b981]/10 border border-[#10b981]/20 px-2 py-0.5 rounded uppercase tracking-wider">
                                  Sent
                                </span>
                              ) : (
                                <span
                                  className="text-[9px] font-bold text-[#f87171] bg-[#ef4444]/10 border border-[#ef4444]/20 px-2 py-0.5 rounded uppercase tracking-wider cursor-help"
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
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendBroadcast}
                      disabled={broadcastSending}
                      className="px-5 py-2 bg-gradient-to-r from-[#8e8aff] to-[#706bff] hover:from-[#7e7aff] hover:to-[#605bff] text-white text-xs font-bold rounded-lg shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
                    className="px-5 py-2 bg-gradient-to-r from-[#8e8aff] to-[#706bff] text-white text-xs font-bold rounded-lg shadow-lg active:scale-95 transition-all cursor-pointer"
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