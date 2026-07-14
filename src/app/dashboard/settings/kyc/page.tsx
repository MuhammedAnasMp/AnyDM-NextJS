"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ShieldCheck, User, CreditCard, Check, AlertCircle, RefreshCw } from "lucide-react";
import api from "@/lib/services/api.service";
import Toast from "@/components/Toast";

const t = {
  primary: "#ffffff",
  onPrimary: "#2f3131",
  surfaceContainer: "#20201f",
  surfaceContainerLowest: "#0e0e0e",
  outlineVariant: "#444748",
  onSurface: "#e5e2e1",
  onSurfaceVariant: "#c4c7c8",
  accentCyan: "#8fe3ff",
  lavender: "#b6b2ff",
};

export default function SellerKYCPage() {
  const [kycData, setKycData] = useState({
    full_name: "",
    pan_number: "",
    aadhaar_number: "",
    bank_name: "",
    bank_account_number: "",
    bank_ifsc: "",
    status: "PENDING",
    is_card_verified: false,
  });

  const isEditable = kycData.status === "PENDING" || kycData.status === "REJECTED";

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" as "success" | "error" | "info" });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  useEffect(() => {
    const fetchKYC = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/crm/seller/kyc/");
        if (res.data) {
          setKycData({
            full_name: res.data.full_name || "",
            pan_number: res.data.pan_number || "",
            aadhaar_number: res.data.aadhaar_number || "",
            bank_name: res.data.bank_name || "",
            bank_account_number: res.data.bank_account_number || "",
            bank_ifsc: res.data.bank_ifsc || "",
            status: res.data.status || "PENDING",
            is_card_verified: !!res.data.is_card_verified,
          });
        }
      } catch (err) {
        console.error("Error loading KYC details:", err);
        showToast("Failed to load KYC details.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchKYC();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Full Name Validation
    if (kycData.full_name.trim().length < 3) {
      showToast("Full Name must be at least 3 characters long.", "error");
      return;
    }

    // 2. PAN Number Validation (5 letters, 4 digits, 1 letter)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(kycData.pan_number)) {
      showToast("Please enter a valid 10-character PAN Number (e.g., ABCDE1234F).", "error");
      return;
    }

    // 3. Aadhaar Number Validation (exactly 12 digits)
    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(kycData.aadhaar_number)) {
      showToast("Aadhaar Number must be exactly 12 digits.", "error");
      return;
    }

    // 4. Bank Name Validation
    if (kycData.bank_name.trim().length < 3) {
      showToast("Please enter a valid Bank Name.", "error");
      return;
    }

    // 5. IFSC Code Validation (4 alphabets, 0, 6 characters)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(kycData.bank_ifsc)) {
      showToast("Please enter a valid 11-character IFSC Code (e.g., SBIN0001234).", "error");
      return;
    }

    // 6. Bank Account Number Validation (9 to 18 digits)
    const bankAccountRegex = /^\d{9,18}$/;
    if (!bankAccountRegex.test(kycData.bank_account_number)) {
      showToast("Bank Account Number must be between 9 and 18 digits.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.post("/crm/seller/kyc/", kycData);
      showToast("KYC details submitted successfully!", "success");
      if (res.data && res.data.status) {
        setKycData(prev => ({ ...prev, status: res.data.status }));
      }
    } catch (err: any) {
      console.error("Error submitting KYC:", err);
      const errMsg = err.response?.data?.error || "Failed to submit KYC details.";
      showToast(errMsg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#b6b2ff]" strokeWidth={1.75} />
        <span className="text-xs text-zinc-400">Loading KYC Profile…</span>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (kycData.status) {
      case "APPROVED":
        return <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold rounded-full">APPROVED</span>;
      case "REJECTED":
        return <span className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-full">REJECTED</span>;
      case "SUBMITTED":
      case "REVIEW":
        return <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold rounded-full">UNDER REVIEW</span>;
      default:
        return <span className="px-3 py-1 bg-zinc-500/10 border border-zinc-550 text-zinc-400 text-xs font-bold rounded-full">PENDING</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 text-[#e5e2e1]"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-[#444748]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-purple-950/20 border border-purple-900/30">
            <ShieldCheck className="w-5 h-5 text-[#b6b2ff]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Seller KYC Verification</h1>
            <p className="text-xs mt-0.5 text-zinc-400">
              Submit your Aadhaar, PAN, and Bank details to activate store payouts.
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="rounded-lg p-5 space-y-6 bg-[#20201f] border border-white/5 shadow-md">
            {/* Owner Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#b6b2ff] flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>1. Personal & Tax Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-400">Full Name (as in bank/Aadhaar)</label>
                  <input
                    type="text"
                    required
                    disabled={!isEditable}
                    value={kycData.full_name}
                    onChange={(e) => setKycData({ ...kycData, full_name: e.target.value })}
                    className="rounded text-xs py-2 px-3 focus:outline-none bg-[#0e0e0e] border border-[#444748] text-white disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-400">PAN Card Number</label>
                  <input
                    type="text"
                    required
                    disabled={!isEditable}
                    value={kycData.pan_number}
                    onChange={(e) => setKycData({ ...kycData, pan_number: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className="rounded text-xs py-2 px-3 focus:outline-none bg-[#0e0e0e] border border-[#444748] text-white disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-medium text-zinc-400">Aadhaar Card Number</label>
                  <input
                    type="text"
                    required
                    disabled={!isEditable}
                    value={kycData.aadhaar_number}
                    onChange={(e) => setKycData({ ...kycData, aadhaar_number: e.target.value.replace(/\D/g, "") })}
                    placeholder="12-digit Aadhaar Number"
                    maxLength={12}
                    className="rounded text-xs py-2 px-3 focus:outline-none bg-[#0e0e0e] border border-[#444748] text-white disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <hr className="border-[#444748]" />

            {/* Bank details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#b6b2ff] flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>2. Bank Account Details</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-400">Bank Name</label>
                  <input
                    type="text"
                    required
                    disabled={!isEditable}
                    value={kycData.bank_name}
                    onChange={(e) => setKycData({ ...kycData, bank_name: e.target.value })}
                    className="rounded text-xs py-2 px-3 focus:outline-none bg-[#0e0e0e] border border-[#444748] text-white disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-400">Bank IFSC Code</label>
                  <input
                    type="text"
                    required
                    disabled={!isEditable}
                    value={kycData.bank_ifsc}
                    onChange={(e) => setKycData({ ...kycData, bank_ifsc: e.target.value.toUpperCase() })}
                    placeholder="SBIN0001234"
                    maxLength={11}
                    className="rounded text-xs py-2 px-3 focus:outline-none bg-[#0e0e0e] border border-[#444748] text-white disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-medium text-zinc-400">Bank Account Number</label>
                  <input
                    type="password"
                    required
                    disabled={!isEditable}
                    value={kycData.bank_account_number}
                    onChange={(e) => setKycData({ ...kycData, bank_account_number: e.target.value.replace(/\D/g, "") })}
                    className="rounded text-xs py-2 px-3 focus:outline-none bg-[#0e0e0e] border border-[#444748] text-white disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {isEditable && (
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 rounded bg-[#b6b2ff] text-black font-semibold text-xs transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? "Submitting details..." : "Submit KYC Details"}
              </button>
            )}
          </form>
        </div>

        {/* Info panel */}
        <div className="space-y-6">
          <div className="rounded-lg p-5 bg-[#20201f] border border-white/5 space-y-3 shadow-md">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#b6b2ff]">Verification Rules</h4>
            <ul className="text-xs space-y-2.5 text-zinc-400 leading-relaxed">
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-green-400 shrink-0" />
                <span>Submit correct Aadhaar & PAN details to prevent rejection.</span>
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-green-400 shrink-0" />
                <span>Verification usually takes 24-48 business hours.</span>
              </li>
              <li className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>Payouts will remain paused until KYC is APPROVED.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
    </motion.div>
  );
}
