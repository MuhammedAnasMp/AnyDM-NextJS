"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Coins,
  Search,
  RefreshCw,
  ShieldAlert,
  Check,
  X,
  CreditCard,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Copy,
  Landmark,
  Zap,
  Building,
  UserCheck
} from "lucide-react";
import api from "@/lib/services/api.service";
import Toast from "@/components/Toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface Settlement {
  id: number;
  settlement_type: "PRODUCT_ORDER" | "CREATOR_COMMISSION" | string;
  order_id: string;
  seller_username: string;
  seller_full_name?: string;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_ifsc?: string | null;
  upi_id?: string | null;
  razorpay_account_id?: string | null;
  order_amount: string;
  commission: string;
  razorpay_fee: string;
  seller_amount: string;
  status: string;
  transfer_mode?: string;
  transfer_id?: string | null;
  utr_number?: string | null;
  payment_proof: string | null;
  failure_reason?: string | null;
  created_at: string;
  paid_at: string | null;
}

export default function AdminPaymentSettlementPage() {
  const appUser = useSelector((state: RootState) => state.auth.user);
  const isAdmin = !!(appUser?.is_superuser || appUser?.is_staff);

  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [typeFilter, setTypeFilter] = useState("All");

  // Processing state
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [paymentProof, setPaymentProof] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [showPayoutModal, setShowPayoutModal] = useState<Settlement | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isAttemptingAuto, setIsAttemptingAuto] = useState(false);

  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info"
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast(`Copied ${label} to clipboard!`, "info");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fetchSettlements = async () => {
    setLoading(true);
    try {
      const res = await api.get("/crm/seller/settlements/");
      if (Array.isArray(res.data)) {
        setSettlements(res.data);
      }
    } catch (err: any) {
      console.error("Error loading settlements:", err);
      showToast("Failed to load settlement records.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSettlements();
    }
  }, [isAdmin]);

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPayoutModal) return;

    setProcessingId(showPayoutModal.id);
    try {
      await api.post("/crm/seller/settlements/", {
        settlement_id: showPayoutModal.id,
        utr_number: utrNumber.trim(),
        payment_proof: paymentProof.trim() || "Completed via Admin Portal Manual Bank Transfer"
      });

      showToast("Manual payout recorded successfully!", "success");

      setSettlements(prev =>
        prev.map(s => s.id === showPayoutModal.id
          ? {
            ...s,
            status: "PAID",
            transfer_mode: "MANUAL",
            utr_number: utrNumber.trim() || s.utr_number,
            payment_proof: paymentProof.trim() || "Completed via Admin Portal Manual Bank Transfer",
            paid_at: new Date().toISOString()
          }
          : s
        )
      );

      setShowPayoutModal(null);
      setPaymentProof("");
      setUtrNumber("");
    } catch (err: any) {
      console.error("Error processing payout:", err);
      showToast(err.response?.data?.error || "Failed to process payout.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleAttemptAutoPayout = async () => {
    if (!showPayoutModal) return;
    setIsAttemptingAuto(true);
    try {
      const res = await api.post("/crm/seller/settlements/", {
        settlement_id: showPayoutModal.id,
        auto_transfer: true
      });

      const resData = res.data?.result;
      if (resData?.success && resData?.status === "PAID") {
        showToast(`Automated payout successful via ${resData.mode}!`, "success");
        fetchSettlements();
        setShowPayoutModal(null);
      } else {
        showToast(
          resData?.error || resData?.message || "Automated transfer not available or failed. Please process manually.",
          "error"
        );
        fetchSettlements();
      }
    } catch (err: any) {
      console.error("Error running auto payout:", err);
      showToast(err.response?.data?.error || "Automated payout attempt failed.", "error");
    } finally {
      setIsAttemptingAuto(false);
    }
  };

  // Filter list
  const filteredSettlements = settlements.filter(s => {
    const matchesSearch =
      s.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.seller_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.utr_number?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (typeFilter !== "All" && s.settlement_type !== typeFilter) return false;

    if (statusFilter === "All") return true;
    return s.status === statusFilter;
  });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center px-4">
        <ShieldAlert className="w-12 h-12 text-red-400" />
        <h2 className="text-base font-bold">Access Denied</h2>
        <span className="text-xs text-zinc-400 max-w-sm">
          You do not have the required administrative permissions to access this settlements panel.
        </span>
      </div>
    );
  }

  // Stats calculation
  const totalPendingAmount = settlements
    .filter(s => s.status === "PENDING")
    .reduce((sum, s) => sum + parseFloat(s.seller_amount), 0)
    .toFixed(2);

  const totalPaidAmount = settlements
    .filter(s => s.status === "PAID" || s.status === "COMPLETED")
    .reduce((sum, s) => sum + parseFloat(s.seller_amount), 0)
    .toFixed(2);

  const totalCommission = settlements
    .reduce((sum, s) => sum + parseFloat(s.commission), 0)
    .toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 text-[#e5e2e1] pb-10 font-sans"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-[#444748]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-purple-950/20 border border-purple-900/30">
            <Coins className="w-5 h-5 text-[#b6b2ff]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Payment Settlements</h1>
            <p className="text-xs mt-0.5 text-zinc-400">
              Manage product order payouts & creator affiliate commission settlements.
            </p>
          </div>
        </div>
        <button
          onClick={fetchSettlements}
          className="p-2 rounded hover:bg-white/5 transition-colors border border-white/10"
          title="Refresh List"
        >
          <RefreshCw className={cn("w-4 h-4 text-zinc-400", loading && "animate-spin")} />
        </button>
      </div>

      {/* Admin Payout Stats Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded bg-[#1c1b1b] border border-[#2a2a2a] flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-[#c4c7c8]">Pending Payouts</p>
            <p className="text-2xl font-semibold text-yellow-400 tracking-tight">₹{totalPendingAmount}</p>
            <p className="text-[10px] text-[#8e9192] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block" />
              Owed to creators & sellers
            </p>
          </div>
          <div className="w-8 h-8 rounded bg-[#131313] border border-[#2a2a2a] flex items-center justify-center text-yellow-400">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded bg-[#1c1b1b] border border-[#2a2a2a] flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-[#c4c7c8]">Completed Payouts</p>
            <p className="text-2xl font-semibold text-green-400 tracking-tight">₹{totalPaidAmount}</p>
            <p className="text-[10px] text-[#8e9192] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Disbursed via Bank / UPI / Route
            </p>
          </div>
          <div className="w-8 h-8 rounded bg-[#131313] border border-[#2a2a2a] flex items-center justify-center text-green-400">
            <Check className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded bg-[#1c1b1b] border border-[#2a2a2a] flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-[#c4c7c8]">Total Platform Commission</p>
            <p className="text-2xl font-semibold text-white tracking-tight">₹{totalCommission}</p>
            <p className="text-[10px] text-[#8e9192] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
              AnyDM retained share
            </p>
          </div>
          <div className="w-8 h-8 rounded bg-[#131313] border border-[#2a2a2a] flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Control Actions & Filter Bar */}
      <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-t p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex p-0.5 bg-[#131313] border border-[#2a2a2a] rounded">
            {["PENDING", "PAID", "All"].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 h-7 rounded text-xs font-medium transition-colors ${statusFilter === filter
                  ? "bg-[#20201f] text-white border border-[#2a2a2a] shadow-sm"
                  : "text-[#c4c7c8] hover:text-white border border-transparent"
                  }`}
              >
                {filter === "PENDING" ? "Pending Payments" : filter === "PAID" ? "Settled Payments" : "All Records"}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex p-0.5 bg-[#131313] border border-[#2a2a2a] rounded">
            {[
              { id: "All", label: "All Types" },
              { id: "PRODUCT_ORDER", label: "Product Orders" },
              { id: "CREATOR_COMMISSION", label: "Creator Commissions" }
            ].map((tItem) => (
              <button
                key={tItem.id}
                onClick={() => setTypeFilter(tItem.id)}
                className={`px-2.5 h-7 rounded text-[11px] font-medium transition-colors ${typeFilter === tItem.id
                  ? "bg-purple-900/40 text-purple-200 border border-purple-700/50"
                  : "text-[#c4c7c8] hover:text-white border border-transparent"
                  }`}
              >
                {tItem.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9192] w-4 h-4" strokeWidth={1.75} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#131313] border border-[#2a2a2a] rounded pl-9 pr-4 h-8 text-xs w-full md:w-64 focus:border-[#444748] transition-colors text-white placeholder-[#8e9192] outline-none"
            placeholder="Search by ID, username, UTR..."
            type="text"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#1c1b1b] border border-[#2a2a2a] border-t-0 rounded-b overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#b6b2ff]" />
            <span className="text-xs text-zinc-400">Loading settlement records...</span>
          </div>
        ) : filteredSettlements.length === 0 ? (
          <div className="text-center py-14 text-[#c4c7c8]">
            <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
              <div className="w-10 h-10 rounded-full bg-[#131313] border border-[#2a2a2a] flex items-center justify-center text-[#8e9192]">
                <AlertCircle className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-white">No settlements found</p>
                <p className="text-[11px] text-[#8e9192]">
                  No payment records match the selected filters.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#131313] border-b border-[#2a2a2a] text-[#8e9192] font-medium tracking-wide">
                  <th className="px-6 py-3.5 w-[20%]">Order / Type</th>
                  <th className="px-6 py-3.5 w-[18%]">Creator / User</th>
                  <th className="px-6 py-3.5 w-[15%]">Gross Amount</th>
                  <th className="px-6 py-3.5 w-[15%]">Commission</th>
                  <th className="px-6 py-3.5 w-[18%]">Net Payout</th>
                  <th className="px-6 py-3.5 text-right w-[14%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {filteredSettlements.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 font-mono text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#b6b2ff] font-bold">{s.order_id}</span>
                        <span className={cn("px-1.5 py-0.2 rounded text-[8px] font-semibold uppercase",
                          s.settlement_type === "CREATOR_COMMISSION"
                            ? "bg-purple-900/30 text-purple-300 border border-purple-700/40"
                            : "bg-blue-900/30 text-blue-300 border border-blue-700/40"
                        )}>
                          {s.settlement_type === "CREATOR_COMMISSION" ? "Affiliate" : "Order"}
                        </span>
                      </div>
                      <span className="block text-[8px] text-zinc-500 mt-1">
                        {new Date(s.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">@{s.seller_username}</div>
                      <div className="text-[10px] text-zinc-400">{s.seller_full_name || ""}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      ₹{s.order_amount}
                    </td>
                    <td className="px-6 py-4 space-y-1 text-zinc-400">
                      <div>Commission: <span className="font-semibold text-zinc-300">₹{s.commission}</span></div>
                      {parseFloat(s.razorpay_fee) > 0 && (
                        <div className="text-[9px] text-zinc-500">Gateway Fee (2%): ₹{s.razorpay_fee}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black text-green-400 text-sm">₹{s.seller_amount}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold inline-block",
                          s.status === "PENDING"
                            ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                            : "bg-green-500/10 border border-green-500/30 text-green-400"
                        )}>
                          {s.status === "PENDING" ? "Pending Payout" : "Paid"}
                        </span>

                        {s.transfer_mode && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {s.transfer_mode === "RAZORPAY_ROUTE" ? "⚡ Route" : s.transfer_mode === "RAZORPAY_PAYOUT" ? "⚡ RazorpayX" : "🏦 Manual Bank"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {s.status === "PENDING" ? (
                        <button
                          onClick={() => {
                            setShowPayoutModal(s);
                            setUtrNumber(s.utr_number || "");
                            setPaymentProof(s.payment_proof || "");
                          }}
                          className="px-3 py-1.5 rounded text-[10px] font-bold bg-green-500 text-black hover:bg-green-400 active:scale-95 transition-all shadow-sm"
                        >
                          Process Payout
                        </button>
                      ) : (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[9px] text-zinc-500">
                            Paid {s.paid_at ? new Date(s.paid_at).toLocaleDateString() : ""}
                          </span>
                          {s.utr_number && (
                            <span className="text-[9px] font-mono text-green-300 bg-green-950/40 px-1 py-0.5 rounded border border-green-800/40">
                              UTR: {s.utr_number}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Processing Dialog with Bank Details */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-white/10 p-6 shadow-2xl bg-[#1e1e24] text-white space-y-5 max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#b6b2ff]" />
                <div>
                  <h3 className="text-sm font-bold">Process Settlement Payout</h3>
                  <p className="text-[10px] text-zinc-400">Settlement ID #{showPayoutModal.id} • {showPayoutModal.settlement_type}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPayoutModal(null);
                  setPaymentProof("");
                  setUtrNumber("");
                }}
                className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bank / UPI Details Card for Copy-Pasting */}
            <div className="bg-[#131318] p-3.5 rounded-lg border border-purple-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-purple-400" />
                  Creator Payout Details
                </span>
                <span className="text-[9px] text-zinc-400">@{showPayoutModal.seller_username}</span>
              </div>

              {showPayoutModal.bank_account_number || showPayoutModal.upi_id ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {showPayoutModal.seller_full_name && (
                    <div className="col-span-2 flex items-center justify-between bg-black/30 p-2 rounded border border-white/5">
                      <div>
                        <div className="text-[9px] text-zinc-400">Account Holder Name</div>
                        <div className="font-semibold text-white">{showPayoutModal.seller_full_name}</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(showPayoutModal.seller_full_name!, "Name")}
                        className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {showPayoutModal.bank_account_number && (
                    <div className="flex items-center justify-between bg-black/30 p-2 rounded border border-white/5">
                      <div>
                        <div className="text-[9px] text-zinc-400">A/C Number ({showPayoutModal.bank_name || 'Bank'})</div>
                        <div className="font-mono font-bold text-green-300">{showPayoutModal.bank_account_number}</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(showPayoutModal.bank_account_number!, "Account Number")}
                        className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {showPayoutModal.bank_ifsc && (
                    <div className="flex items-center justify-between bg-black/30 p-2 rounded border border-white/5">
                      <div>
                        <div className="text-[9px] text-zinc-400">IFSC Code</div>
                        <div className="font-mono font-bold text-purple-300">{showPayoutModal.bank_ifsc}</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(showPayoutModal.bank_ifsc!, "IFSC")}
                        className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {showPayoutModal.upi_id && (
                    <div className="col-span-2 flex items-center justify-between bg-black/30 p-2 rounded border border-white/5">
                      <div>
                        <div className="text-[9px] text-zinc-400">UPI ID / VPA</div>
                        <div className="font-mono font-bold text-cyan-300">{showPayoutModal.upi_id}</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(showPayoutModal.upi_id!, "UPI ID")}
                        className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-yellow-950/20 border border-yellow-800/30 rounded text-[11px] text-yellow-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-yellow-400" />
                  <span>Creator has not added bank or UPI details yet in Settings &gt; KYC. You may contact them or verify details manually.</span>
                </div>
              )}
            </div>

            {/* Settlement Summary Breakdown */}
            <div className="space-y-1.5 text-xs bg-[#131318] p-3 rounded-lg border border-white/5">
              <div className="flex justify-between text-zinc-400">
                <span>Gross Amount:</span>
                <span className="text-white">₹{showPayoutModal.order_amount}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Platform Commission:</span>
                <span className="text-red-400">₹{showPayoutModal.commission}</span>
              </div>
              <div className="h-px bg-white/5 my-1" />
              <div className="flex justify-between text-sm font-bold text-green-400">
                <span>Net Payable Amount:</span>
                <span>₹{showPayoutModal.seller_amount}</span>
              </div>
            </div>

            {/* Quick Auto Payout Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleAttemptAutoPayout}
                disabled={isAttemptingAuto}
                className="w-full py-2 rounded text-xs font-semibold bg-purple-900/40 hover:bg-purple-900/70 border border-purple-600/50 text-purple-200 transition-all flex items-center justify-center gap-2"
              >
                {isAttemptingAuto ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                )}
                <span>Attempt Auto API Transfer (Razorpay Route / Payouts)</span>
              </button>
            </div>

            <div className="relative flex items-center my-2">
              <div className="flex-grow border-t border-white/10" />
              <span className="px-2 text-[9px] uppercase tracking-wider text-zinc-500 bg-[#1e1e24]">OR Record Manual Bank Transfer</span>
              <div className="flex-grow border-t border-white/10" />
            </div>

            {/* Manual Payment Form */}
            <form onSubmit={handlePayoutSubmit} className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold tracking-wider text-zinc-300">Bank UTR / Transaction Reference ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR1234567890, UPI/IMPS Ref..."
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="bg-[#131313] border border-[#2a2a2a] rounded px-3 py-2 text-xs w-full focus:border-purple-500 transition-colors text-white outline-none font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold tracking-wider text-zinc-400">Payment Proof / Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Paid via HDFC Netbanking"
                  value={paymentProof}
                  onChange={(e) => setPaymentProof(e.target.value)}
                  className="bg-[#131313] border border-[#2a2a2a] rounded px-3 py-2 text-xs w-full focus:border-[#444748] transition-colors text-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={processingId !== null}
                className="w-full py-2.5 rounded text-xs font-bold bg-green-500 hover:bg-green-400 text-black transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-lg"
              >
                {processingId !== null ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Mark Settlement Paid (Save UTR)</span>
              </button>
            </form>
          </div>
        </div>
      )}

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
    </motion.div>
  );
}
