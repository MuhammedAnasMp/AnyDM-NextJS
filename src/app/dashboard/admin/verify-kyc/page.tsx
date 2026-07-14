"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ShieldCheck, 
  User, 
  CreditCard, 
  Check, 
  X, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  FileText,
  Lock
} from "lucide-react";
import api from "@/lib/services/api.service";
import Toast from "@/components/Toast";

interface KYCSubmission {
  id: number;
  username: string;
  email: string;
  full_name: string;
  pan_number: string;
  aadhaar_number: string;
  bank_name: string;
  bank_account_number: string;
  bank_ifsc: string;
  status: string;
  is_card_verified: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminVerifyKYCPage() {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedKyc, setSelectedKyc] = useState<KYCSubmission | null>(null);
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" as "success" | "error" | "info" });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.get("/crm/admin/kyc/");
      if (Array.isArray(res.data)) {
        setSubmissions(res.data);
      }
    } catch (err: any) {
      console.error("Error loading KYC list:", err);
      if (err.response?.status === 403) {
        setErrorMsg("Access Denied: Only administrators are authorized to access this dashboard.");
      } else {
        setErrorMsg("Failed to load KYC submissions. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleVerifyAction = async (kycId: number, action: "APPROVE" | "REJECT") => {
    setProcessingId(kycId);
    try {
      const res = await api.post("/crm/admin/kyc/", { kyc_id: kycId, action });
      showToast(`KYC submission successfully ${action === "APPROVE" ? "approved" : "rejected"}!`, "success");
      
      // Update local state
      setSubmissions(prev => 
        prev.map(sub => sub.id === kycId ? { ...sub, status: res.data.status } : sub)
      );
      
      if (selectedKyc && selectedKyc.id === kycId) {
        setSelectedKyc(prev => prev ? { ...prev, status: res.data.status } : null);
      }
    } catch (err: any) {
      console.error("Error processing KYC action:", err);
      showToast(err.response?.data?.error || "Failed to update KYC status.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // Stats calculations
  const pendingCount = submissions.filter(s => s.status === "SUBMITTED" || s.status === "REVIEW").length;
  const approvedCount = submissions.filter(s => s.status === "APPROVED").length;
  const rejectedCount = submissions.filter(s => s.status === "REJECTED").length;

  // Filter & Search Logic
  const filteredSubmissions = submissions.filter(sub => {
    const matchesStatus = 
      filterStatus === "ALL" ||
      (filterStatus === "PENDING" && (sub.status === "SUBMITTED" || sub.status === "REVIEW" || sub.status === "PENDING")) ||
      sub.status === filterStatus;
      
    const matchesSearch = 
      sub.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.pan_number.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-4">
        <div className="p-3.5 rounded-full bg-red-950/20 border border-red-900/30">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        <div className="max-w-md">
          <h2 className="text-lg font-bold text-white">Administrator Access Required</h2>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6 text-[#e5e2e1] pb-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-[#444748]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-purple-950/20 border border-purple-900/30">
            <ShieldCheck className="w-5 h-5 text-[#b6b2ff]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">KYC Verification Dashboard</h1>
            <p className="text-xs mt-0.5 text-zinc-400">
              Review tax documents, identities, and bank details submitted by platform sellers.
            </p>
          </div>
        </div>
        <button 
          onClick={fetchSubmissions}
          className="p-2 rounded hover:bg-white/5 transition-colors border border-white/10"
          title="Refresh List"
        >
          <RefreshCw className={cn("w-4 h-4 text-zinc-400", loading && "animate-spin")} />
        </button>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg p-4 bg-[#20201f] border border-white/5 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-yellow-400">Pending Review</span>
            <h3 className="text-xl font-bold mt-1 text-white">{pendingCount}</h3>
          </div>
          <AlertCircle className="w-6 h-6 text-yellow-500/80" />
        </div>
        <div className="rounded-lg p-4 bg-[#20201f] border border-white/5 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-green-400">Approved Sellers</span>
            <h3 className="text-xl font-bold mt-1 text-white">{approvedCount}</h3>
          </div>
          <Check className="w-6 h-6 text-green-500/80" />
        </div>
        <div className="rounded-lg p-4 bg-[#20201f] border border-white/5 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-red-400">Rejected KYC</span>
            <h3 className="text-xl font-bold mt-1 text-white">{rejectedCount}</h3>
          </div>
          <X className="w-6 h-6 text-red-500/80" />
        </div>
      </div>

      {/* Submissions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-[#20201f] border border-white/5 p-3 rounded-lg">
            <div className="flex items-center gap-1.5 bg-[#0e0e0e] border border-[#444748] rounded px-3 py-1.5 shrink-0">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search username, name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-44"
              />
            </div>
            
            <div className="flex items-center gap-1 text-[11px] overflow-x-auto self-start sm:self-auto py-1">
              {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    "px-2.5 py-1 rounded transition-colors font-semibold",
                    filterStatus === status 
                      ? "bg-[#b6b2ff] text-black" 
                      : "text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Submissions List */}
          <div className="rounded-lg border border-white/5 bg-[#20201f] overflow-hidden shadow-md">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-[#b6b2ff]" />
                <span className="text-xs text-zinc-500">Loading submissions…</span>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500 space-y-2">
                <FileText className="w-8 h-8 opacity-40" />
                <span className="text-xs font-semibold">No KYC submissions found matching criteria</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02] text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Seller Account</th>
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">PAN Number</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredSubmissions.map((sub) => (
                      <tr 
                        key={sub.id} 
                        onClick={() => setSelectedKyc(sub)}
                        className={cn(
                          "hover:bg-white/[0.01] transition-colors cursor-pointer",
                          selectedKyc?.id === sub.id && "bg-white/[0.02]"
                        )}
                      >
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div className="flex flex-col">
                            <span>@{sub.username}</span>
                            <span className="text-[10px] text-zinc-400 font-normal">{sub.email}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-300 font-medium">{sub.full_name || "N/A"}</td>
                        <td className="py-3.5 px-4 font-mono uppercase tracking-wide text-zinc-400">{sub.pan_number || "N/A"}</td>
                        <td className="py-3.5 px-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                            sub.status === "APPROVED" && "bg-green-500/10 border border-green-500/30 text-green-400",
                            sub.status === "REJECTED" && "bg-red-500/10 border border-red-500/30 text-red-400",
                            (sub.status === "SUBMITTED" || sub.status === "REVIEW") && "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400",
                            sub.status === "PENDING" && "bg-zinc-500/10 border border-zinc-500/30 text-zinc-400"
                          )}>
                            {sub.status === "SUBMITTED" || sub.status === "REVIEW" ? "Under Review" : sub.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {sub.status !== "APPROVED" && (
                              <button
                                onClick={() => handleVerifyAction(sub.id, "APPROVE")}
                                disabled={processingId === sub.id}
                                className="p-1 rounded hover:bg-green-500/20 text-green-400 transition-colors"
                                title="Approve KYC"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {sub.status !== "REJECTED" && (
                              <button
                                onClick={() => handleVerifyAction(sub.id, "REJECT")}
                                disabled={processingId === sub.id}
                                className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                                title="Reject KYC"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Selected Details Sidebar Column */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {selectedKyc ? (
              <motion.div
                key={selectedKyc.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="rounded-lg p-5 bg-[#20201f] border border-white/5 space-y-5 shadow-md relative"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-white">Submission Profile</h3>
                    <span className="text-[10px] text-[#b6b2ff] font-semibold">@{selectedKyc.username}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedKyc(null)}
                    className="p-1 rounded hover:bg-white/5 transition-colors"
                  >
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>

                <hr className="border-white/5" />

                {/* Info List */}
                <div className="space-y-3.5 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Full Name</span>
                    <span className="text-zinc-200 font-medium">{selectedKyc.full_name}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">PAN Card</span>
                    <span className="font-mono text-zinc-200 uppercase tracking-wide">{selectedKyc.pan_number}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Aadhaar Card</span>
                    <span className="font-mono text-zinc-200">{selectedKyc.aadhaar_number}</span>
                  </div>
                  
                  <hr className="border-white/5 py-0.5" />
                  
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <CreditCard className="w-3 h-3 shrink-0" />
                      <span>Bank Name</span>
                    </span>
                    <span className="text-zinc-200 font-medium">{selectedKyc.bank_name}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">IFSC Code</span>
                    <span className="font-mono text-zinc-200 uppercase">{selectedKyc.bank_ifsc}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Account Number</span>
                    <span className="font-mono text-zinc-200">{selectedKyc.bank_account_number ? "•••• •••• " + selectedKyc.bank_account_number.slice(-4) : "N/A"}</span>
                  </div>
                </div>

                {/* Quick actions in sidebar */}
                {selectedKyc.status !== "APPROVED" && selectedKyc.status !== "REJECTED" && (
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
                    <button
                      onClick={() => handleVerifyAction(selectedKyc.id, "APPROVE")}
                      disabled={processingId === selectedKyc.id}
                      className="py-2 px-3 rounded bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-400 text-xs font-bold transition-all disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerifyAction(selectedKyc.id, "REJECT")}
                      disabled={processingId === selectedKyc.id}
                      className="py-2 px-3 rounded bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="rounded-lg p-8 border border-dashed border-white/10 text-center text-zinc-500 flex flex-col items-center justify-center gap-2.5">
                <User className="w-8 h-8 opacity-30" />
                <span className="text-xs leading-normal">Select a seller submission from the table to view verified details and tax documentation</span>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
    </motion.div>
  );
}
