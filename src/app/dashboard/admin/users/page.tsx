"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Users,
  Search,
  RefreshCw,
  Gift,
  UserCheck,
  Award,
  Crown,
  Sparkles,
  ShoppingBag,
  Zap,
  Camera,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Check,
  Calendar,
  X,
  CreditCard,
  ExternalLink,
  Package,
  Layers,
  TrendingUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/services/api.service";
import Toast from "@/components/Toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const t = {
  primary: "#b6b2ff",
  onPrimary: "#111",
  surfaceContainer: "#1e1e24",
  surfaceContainerLowest: "#101012",
  surfaceContainerHigh: "#2a2a30",
  outline: "#8e9192",
  outlineVariant: "#444748",
  onSurface: "#e5e2e1",
  onSurfaceVariant: "#c4c7c8",
  accentCyan: "#a3f7ff",
  lavender: "#c4c0ff",
};

export default function AdminUsersPage() {
  const appUser = useSelector((state: RootState) => state.auth.user);
  const isAdmin = !!(appUser?.is_superuser || appUser?.is_staff);

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "vip" | "pro" | "trial">("all");

  // Selected User Modal State
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // VIP Grant modal / state
  const [targetEmail, setTargetEmail] = useState("");
  const [grantMonths, setGrantMonths] = useState(3);
  const [isGranting, setIsGranting] = useState(false);
  const [showGrantModal, setShowGrantModal] = useState(false);

  // Pagination & Sorting state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortField, setSortField] = useState<string>("date_joined");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" as "success" | "error" | "info" });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/accounts/admin/users/");
      if (res.data && res.data.users) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error("Error fetching users analytics:", err);
      showToast("Failed to load user analytics.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleGrantVIP = async () => {
    if (!targetEmail.trim()) return;
    setIsGranting(true);
    try {
      const res = await api.post("/accounts/admin/grant-creator-vip/", {
        email: targetEmail.trim(),
        months: grantMonths,
      });
      showToast(res.data?.message || `Granted ${grantMonths} months Creator Pro to ${targetEmail.trim()}!`, "success");
      setShowGrantModal(false);
      if (selectedUser && (selectedUser.email === targetEmail || selectedUser.username === targetEmail)) {
        setSelectedUser((prev: any) => ({
          ...prev,
          plan: "pro",
          is_creator_vip: true,
          is_premium_active: true,
        }));
      }
      setTargetEmail("");
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.details || "Failed to grant VIP access.";
      showToast(msg, "error");
    } finally {
      setIsGranting(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Filtered & Sorted users
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      u.email.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query) ||
      (u.referral_code && u.referral_code.toLowerCase().includes(query)) ||
      (u.ig_accounts && u.ig_accounts.some((acc: any) => acc.username.toLowerCase().includes(query) || (acc.full_name && acc.full_name.toLowerCase().includes(query))));

    if (!matchesSearch) return false;

    if (activeFilter === "vip") return u.is_creator_vip;
    if (activeFilter === "pro") return u.plan === "pro";
    if (activeFilter === "trial") return u.plan === "trial";
    return true;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = (bVal || "").toLowerCase();
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination calculation
  const totalUsers = sortedUsers.length;
  const totalPages = Math.ceil(totalUsers / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);

  // Overview stats
  const totalRegistered = users.length;
  const totalUsersCount = users.length;
  const totalVipCreators = users.filter((u) => u.is_creator_vip).length;
  const totalProSubscribers = users.filter((u) => u.plan === "pro").length;
  const totalReferralConversions = users.reduce((acc, u) => acc + (u.paid_referred_count || 0), 0);

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-zinc-500 hover:text-white transition-colors" />;
    return sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-[#c4c0ff]" /> : <ArrowDown className="w-3 h-3 text-[#c4c0ff]" />;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: t.onSurface }} strokeWidth={1.75} />
        <span className="text-xs font-medium" style={{ color: t.onSurfaceVariant }}>
          Loading user analytics dashboard…
        </span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center px-4">
        <ShieldAlert className="w-12 h-12 text-red-400" />
        <h2 className="text-base font-bold">Access Denied</h2>
        <span className="text-xs text-zinc-400 max-w-sm">
          You do not have administrative permissions to view the user analytics panel.
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      style={{ color: t.onSurface }}
    >
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/admin"
            className="p-2 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#e5e2e1] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#c4c0ff]" />
              <span>Registered User Analytics &amp; VIP Management</span>
            </h1>
            <p className="text-xs mt-0.5" style={{ color: t.onSurfaceVariant }}>
              Click any user row to inspect connected Instagram seller profiles, products, &amp; Pro purchase history.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setTargetEmail("");
            setGrantMonths(3);
            setShowGrantModal(true);
          }}
          className="px-4 py-2 rounded font-semibold text-xs flex items-center gap-2 transition-opacity hover:opacity-90 cursor-pointer shadow-md shrink-0"
          style={{ backgroundColor: t.accentCyan, color: "#111" }}
        >
          <Gift className="w-4 h-4 text-black" />
          <span>Grant Creator VIP Access</span>
        </button>
      </div>

      {/* Analytics KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="rounded-lg p-4 flex flex-col gap-1 border border-white/10 bg-white/5">
          <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Total Workspace Users
          </span>
          <span className="text-xl font-bold text-white">{totalUsersCount}</span>
        </div>

        <div className="rounded-lg p-4 flex flex-col gap-1 border border-[#2a2a2a] bg-[#1c1b1b]">
          <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5" />
            VIP Creator Accounts
          </span>
          <span className="text-xl font-bold text-emerald-400">{totalVipCreators}</span>
        </div>

        <div className="rounded-lg p-4 flex flex-col gap-1 border border-[#c4c0ff]/20 bg-[#c4c0ff]/5">
          <span className="text-[11px] font-medium text-[#c4c0ff] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Pro Plan Subscribers
          </span>
          <span className="text-xl font-bold text-[#c4c0ff]">{totalProSubscribers}</span>
        </div>

        <div className="rounded-lg p-4 flex flex-col gap-1 border border-indigo-500/20 bg-indigo-500/5">
          <span className="text-[11px] font-medium text-indigo-300 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            Paid Referral Conversions
          </span>
          <span className="text-xl font-bold text-indigo-300">{totalReferralConversions}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#1c1b1b] p-3 rounded-lg border border-[#2a2a2a]">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search email, @username, IG handles..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#0e0e0e] border border-[#444748] rounded py-1.5 pl-9 pr-3 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#c4c0ff]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(["all", "vip", "pro", "trial"] as const).map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => {
                setActiveFilter(filterKey);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded text-xs font-semibold tracking-wider transition-colors cursor-pointer whitespace-nowrap ${activeFilter === filterKey
                  ? "bg-white text-black font-bold shadow-sm"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
            >
              {filterKey === "all" ? "All Users" : filterKey === "vip" ? "VIP Creators" : filterKey === "pro" ? "Pro Plan" : "Active Trial"}
            </button>
          ))}
        </div>
      </div>

      {/* Users Analytics Table */}
      <section className="rounded-lg p-5 space-y-4" style={{ backgroundColor: t.surfaceContainer }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 gap-2">
          <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2" style={{ color: t.onSurface }}>
            <Users className="w-4 h-4 text-[#c4c0ff]" />
            <span>Accounts Directory &amp; Usage Metrics</span>
          </h3>

          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-medium">
              Showing {paginatedUsers.length} of {sortedUsers.length} Users
            </span>
          </div>
        </div>

        {paginatedUsers.length > 0 ? (
          <div className="flex flex-col justify-between flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 tracking-wider text-[10px] font-semibold select-none">
                    <th className="pb-2.5 cursor-pointer hover:text-white" onClick={() => handleSort("username")}>
                      <div className="flex items-center gap-1">
                        <span>User Account</span>
                        {getSortIcon("username")}
                      </div>
                    </th>
                    <th className="pb-2.5 cursor-pointer hover:text-white text-center" onClick={() => handleSort("ig_accounts_count")}>
                      <div className="flex items-center justify-center gap-1">
                        <span>IG Sellers</span>
                        {getSortIcon("ig_accounts_count")}
                      </div>
                    </th>
                    <th className="pb-2.5 cursor-pointer hover:text-white text-center" onClick={() => handleSort("automations_count")}>
                      <div className="flex items-center justify-center gap-1">
                        <span>Automations</span>
                        {getSortIcon("automations_count")}
                      </div>
                    </th>
                    <th className="pb-2.5 cursor-pointer hover:text-white text-center" onClick={() => handleSort("products_count")}>
                      <div className="flex items-center justify-center gap-1">
                        <span>Items Published</span>
                        {getSortIcon("products_count")}
                      </div>
                    </th>
                    <th className="pb-2.5 cursor-pointer hover:text-white" onClick={() => handleSort("pro_purchase_count")}>
                      <div className="flex items-center gap-1">
                        <span>Plan &amp; Payments</span>
                        {getSortIcon("pro_purchase_count")}
                      </div>
                    </th>
                    <th className="pb-2.5 cursor-pointer hover:text-white text-center" onClick={() => handleSort("referred_count")}>
                      <div className="flex items-center justify-center gap-1">
                        <span>Referrals (Paid)</span>
                        {getSortIcon("referred_count")}
                      </div>
                    </th>
                    <th className="pb-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedUsers.map((user: any) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 font-medium text-white">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-white group-hover:text-[#c4c0ff] transition-colors">
                              {user.email || user.username}
                            </span>
                            {user.is_creator_vip && (
                              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                                VIP
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500">@{user.username} • Joined {new Date(user.date_joined).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="py-3 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300 font-medium text-xs">
                            <Camera className="w-3 h-3 text-pink-400" />
                            <span>{user.ig_accounts_count}</span>
                          </span>
                          {user.ig_accounts && user.ig_accounts.length > 0 && (
                            <span className="text-[9px] text-zinc-400 max-w-[120px] truncate">
                              {user.ig_accounts.map((a: any) => `@${a.username}`).join(", ")}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300 font-medium text-xs">
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>{user.automations_count}</span>
                        </span>
                      </td>

                      <td className="py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300 font-medium text-xs">
                          <ShoppingBag className="w-3 h-3 text-cyan-400" />
                          <span>{user.products_count}</span>
                        </span>
                      </td>

                      <td className="py-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-semibold ${user.plan === "pro" ? "text-emerald-400" : "text-amber-400"}`}>
                              {user.plan === "pro" ? "Pro Plan" : "Trial"}
                            </span>
                            <span className="px-1.5 py-0.2 text-[9px] font-mono bg-white/5 text-zinc-300 rounded border border-white/10">
                              {user.pro_purchase_count} Payments
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400">
                            {user.premium_expires_at
                              ? `Expires: ${new Date(user.premium_expires_at).toLocaleDateString()}`
                              : `${user.trial_days_left} days left`}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold text-xs">
                            {user.referred_count} Total ({user.paid_referred_count} Paid)
                          </span>
                          {user.referral_code && (
                            <span className="text-[9px] font-mono text-zinc-500 mt-0.5">Code: {user.referral_code}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                          }}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                        >
                          View Details →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination & Page Size Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-4 mt-4 gap-3">
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-zinc-400 font-medium">
                  Showing <span className="text-white font-semibold">{startIndex + 1}</span> to{" "}
                  <span className="text-white font-semibold">{Math.min(startIndex + itemsPerPage, totalUsers)}</span> of{" "}
                  <span className="text-white font-semibold">{totalUsers}</span> users
                </span>

                <div className="flex items-center gap-1.5 text-xs text-zinc-400 border-l border-white/10 pl-3">
                  <span>Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-[#101012] border border-white/10 rounded px-2 py-1 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={500}>500</option>
                  </select>
                  <span>per page</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded text-xs font-semibold transition-colors cursor-pointer ${currentPage === pageNum
                          ? "bg-white text-black font-bold shadow-sm"
                          : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
            <Users className="w-6 h-6 text-zinc-600" />
            <span>No user accounts found matching query.</span>
          </div>
        )}
      </section>

      {/* User Detailed Inspection Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1e1e24] border border-white/10 rounded-xl p-6 max-w-3xl w-full space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#c4c0ff] font-bold text-sm">
                    {selectedUser.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{selectedUser.email || selectedUser.username}</span>
                      {selectedUser.is_creator_vip && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                          VIP Creator
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      @{selectedUser.username} • Account Created: {new Date(selectedUser.date_joined).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Detailed Metrics Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#101012] p-3 rounded-lg border border-white/5 flex flex-col gap-0.5">
                  <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-[#c4c0ff]" /> Pro Plan Purchases
                  </span>
                  <span className="text-base font-bold text-white">{selectedUser.pro_purchase_count} Payments</span>
                </div>

                <div className="bg-[#101012] p-3 rounded-lg border border-white/5 flex flex-col gap-0.5">
                  <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                    <Camera className="w-3 h-3 text-pink-400" /> IG Sellers Connected
                  </span>
                  <span className="text-base font-bold text-white">{selectedUser.ig_accounts_count} Accounts</span>
                </div>

                <div className="bg-[#101012] p-3 rounded-lg border border-white/5 flex flex-col gap-0.5">
                  <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3 text-cyan-400" /> Items Published
                  </span>
                  <span className="text-base font-bold text-white">{selectedUser.products_count} Products</span>
                </div>

                <div className="bg-[#101012] p-3 rounded-lg border border-white/5 flex flex-col gap-0.5">
                  <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-indigo-400" /> Referral Paid Conv.
                  </span>
                  <span className="text-base font-bold text-indigo-300">{selectedUser.paid_referred_count} Conversions</span>
                </div>
              </div>

              {/* Connected Instagram Accounts List */}
              <div className="space-y-3 bg-[#101012] p-4 rounded-lg border border-white/5">
                <h4 className="text-xs font-semibold text-[#c4c0ff] flex items-center gap-1.5 tracking-wider">
                  <Camera className="w-3.5 h-3.5 text-pink-400" />
                  <span>Connected Instagram Accounts ({selectedUser.ig_accounts?.length || 0})</span>
                </h4>

                {selectedUser.ig_accounts && selectedUser.ig_accounts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedUser.ig_accounts.map((acc: any) => (
                      <div key={acc.id} className="bg-[#1c1b1b] p-3 rounded border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {acc.profile_picture_url ? (
                            <img src={acc.profile_picture_url} alt={acc.username} className="w-7 h-7 rounded-full object-cover border border-white/10" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                              {acc.username.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-white">@{acc.username}</span>
                            <span className="text-[11px] text-zinc-300">{acc.full_name || acc.username}</span>
                            <span className="text-[9px] text-zinc-500">
                              Connected: {acc.connected_at ? new Date(acc.connected_at).toLocaleDateString() : "Active"}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${acc.is_token_expired ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                          {acc.is_token_expired ? "Expired" : "Active"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">No Instagram seller accounts connected yet.</p>
                )}
              </div>

              {/* Published Products Catalog */}
              <div className="space-y-3 bg-[#101012] p-4 rounded-lg border border-white/5">
                <h4 className="text-xs font-semibold text-[#c4c0ff] flex items-center gap-1.5 tracking-wider">
                  <Package className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Published Products &amp; Store Items ({selectedUser.products?.length || 0})</span>
                </h4>

                {selectedUser.products && selectedUser.products.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-zinc-500 text-[10px] font-semibold">
                          <th className="pb-2">Title</th>
                          <th className="pb-2">Price</th>
                          <th className="pb-2">Source</th>
                          <th className="pb-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {selectedUser.products.map((prod: any) => (
                          <tr key={prod.id}>
                            <td className="py-2 text-white font-medium">{prod.title}</td>
                            <td className="py-2 text-zinc-300 font-mono">₹{prod.price}</td>
                            <td className="py-2 text-zinc-400 text-[11px]">{prod.source_type || "Manual"}</td>
                            <td className="py-2 text-right">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {prod.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">No published products catalog items created yet.</p>
                )}
              </div>

              {/* Referred Audience List */}
              <div className="space-y-3 bg-[#101012] p-4 rounded-lg border border-white/5">
                <h4 className="text-xs font-semibold text-[#c4c0ff] flex items-center gap-1.5 tracking-wider">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Referred Audience ({selectedUser.referred_users?.length || 0} Joined)</span>
                </h4>

                {selectedUser.referred_users && selectedUser.referred_users.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedUser.referred_users.map((ref: any, i: number) => (
                      <div key={i} className="bg-[#1c1b1b] p-2.5 rounded border border-white/5 flex items-center justify-between text-xs">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{ref.display_name || ref.username}</span>
                          <span className="text-[10px] text-zinc-500">Joined {new Date(ref.date_joined).toLocaleDateString()}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ref.is_premium_active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-zinc-400"}`}>
                          {ref.is_premium_active ? "Paid Pro" : "Extended Trial"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">No users joined with this account's referral link yet.</p>
                )}
              </div>

              {/* Modal Action Bar */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-xs text-zinc-400 font-mono">
                  Referral ID: <strong className="text-white">{selectedUser.referral_code || "None"}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTargetEmail(selectedUser.email || selectedUser.username);
                      setGrantMonths(3);
                      setShowGrantModal(true);
                    }}
                    className="px-4 py-2 rounded font-bold text-xs bg-[#c4c0ff] text-black hover:bg-[#c4c0ff]/90 transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <Gift className="w-3.5 h-3.5 text-black" />
                    <span>{selectedUser.is_creator_vip ? "Extend VIP Access" : "Grant VIP Pro Access"}</span>
                  </button>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-3.5 py-2 rounded text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Grant VIP Modal */}
      {showGrantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1e1e24] border border-white/10 rounded-lg p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-400" />
                <span>Grant Creator VIP Access</span>
              </h3>
              <button onClick={() => setShowGrantModal(false)} className="text-zinc-400 hover:text-white text-xs cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400">Creator Account Email / Username</label>
                <input
                  type="text"
                  placeholder="creator@youtube.com"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  className="w-full bg-[#101012] border border-[#444748] rounded text-xs py-2 px-3 text-white focus:outline-none focus:border-[#c4c0ff]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400">VIP Pro Access Term</label>
                <select
                  value={grantMonths}
                  onChange={(e) => setGrantMonths(parseInt(e.target.value) || 3)}
                  className="w-full bg-[#101012] border border-[#444748] rounded text-xs py-2 px-3 text-white focus:outline-none focus:border-[#c4c0ff] cursor-pointer"
                >
                  <option value={1}>1 Month Free Pro</option>
                  <option value={3}>3 Months Free Pro (Recommended)</option>
                  <option value={6}>6 Months Free Pro</option>
                  <option value={12}>1 Year Free Pro</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowGrantModal(false)}
                className="px-3 py-1.5 rounded text-xs font-medium bg-white/5 hover:bg-white/10 text-zinc-400 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGrantVIP}
                disabled={isGranting || !targetEmail.trim()}
                className="px-4 py-1.5 rounded text-xs font-bold bg-[#a3f7ff] text-black hover:bg-[#a3f7ff]/90 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isGranting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                <span>Confirm VIP Grant</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))} />
    </motion.div>
  );
}
