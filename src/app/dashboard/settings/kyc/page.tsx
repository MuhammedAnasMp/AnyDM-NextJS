"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Landmark,
  BadgeCheck,
  Zap,
} from "lucide-react";
import api from "@/lib/services/api.service";
import Toast from "@/components/Toast";

interface KYCState {
  full_name: string;
  pan_number: string;
  aadhaar_number: string;
  bank_name: string;
  bank_account_number: string;
  confirm_account_number: string;
  bank_ifsc: string;
  status: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED" | string;
  is_card_verified: boolean;
}

export default function SellerKYCPage() {
  const [kycData, setKycData] = useState<KYCState>({
    full_name: "",
    pan_number: "",
    aadhaar_number: "",
    bank_name: "",
    bank_account_number: "",
    confirm_account_number: "",
    bank_ifsc: "",
    status: "PENDING",
    is_card_verified: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ isVisible: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const isEditable = kycData.status === "PENDING" || kycData.status === "REJECTED";

  useEffect(() => {
    const fetchKYC = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/crm/seller/kyc/");
        if (res.data) {
          const accNum = res.data.bank_account_number || "";
          setKycData({
            full_name: res.data.full_name || "",
            pan_number: res.data.pan_number || "",
            aadhaar_number: res.data.aadhaar_number || "",
            bank_name: res.data.bank_name || "",
            bank_account_number: accNum,
            confirm_account_number: accNum,
            bank_ifsc: res.data.bank_ifsc || "",
            status: res.data.status || "PENDING",
            is_card_verified: !!res.data.is_card_verified,
          });
        }
      } catch (err) {
        console.error("Error loading KYC details:", err);
        showToast("Failed to load KYC verification status.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchKYC();
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (kycData.full_name.trim().length < 3) {
      errors.full_name = "Legal name must be at least 3 characters.";
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(kycData.pan_number)) {
      errors.pan_number = "Enter a valid 10-character PAN.";
    }

    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(kycData.aadhaar_number)) {
      errors.aadhaar_number = "Aadhaar number must be exactly 12 digits.";
    }

    if (kycData.bank_name.trim().length < 3) {
      errors.bank_name = "Enter your bank's legal name.";
    }

    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(kycData.bank_ifsc)) {
      errors.bank_ifsc = "Enter a valid 11-digit IFSC code.";
    }

    const bankAccountRegex = /^\d{9,18}$/;
    if (!bankAccountRegex.test(kycData.bank_account_number)) {
      errors.bank_account_number = "Account number must be 9–18 digits.";
    }

    if (isEditable && kycData.bank_account_number !== kycData.confirm_account_number) {
      errors.confirm_account_number = "Account numbers do not match.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please correct the highlighted errors.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        full_name: kycData.full_name.trim(),
        pan_number: kycData.pan_number.trim().toUpperCase(),
        aadhaar_number: kycData.aadhaar_number.trim(),
        bank_name: kycData.bank_name.trim(),
        bank_account_number: kycData.bank_account_number.trim(),
        bank_ifsc: kycData.bank_ifsc.trim().toUpperCase(),
      };

      const res = await api.post("/crm/seller/kyc/", payload);
      showToast("KYC documents submitted successfully!", "success");
      if (res.data && res.data.status) {
        setKycData((prev) => ({
          ...prev,
          status: res.data.status,
          confirm_account_number: prev.bank_account_number,
        }));
      }
    } catch (err: any) {
      console.error("Error submitting KYC:", err);
      const errMsg = err.response?.data?.error || "Failed to submit KYC details.";
      showToast(errMsg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusPill = () => {
    switch (kycData.status) {
      case "APPROVED":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#10b981]/10 border border-[#10b981]/30 text-[#34d399] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]"></span>
            <span>VERIFIED &amp; ACTIVE</span>
          </div>
        );
      case "SUBMITTED":
      case "REVIEW":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>UNDER REVIEW</span>
          </div>
        );
      case "REJECTED":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ACTION REQUIRED</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[#8e9192] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8e9192]"></span>
            <span>NOT SUBMITTED</span>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-2">
        <RefreshCw className="w-6 h-6 text-[#c4c0ff] animate-spin" />
        <p className="text-xs text-[#c4c7c8]/60">Loading compliance records...</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 overflow-hidden py-2 text-[#e5e2e1] w-full">
      {/* Background Soft Purple/Lavender Ambient Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[-50px] h-[320px] w-[600px] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#c4c0ff]/0 via-[#c4c0ff]/15 to-[#c4c0ff]/0 blur-3xl"
      />

      {/* SECTION HEADER */}
      <div className="relative text-center max-w-xl mx-auto space-y-2">
        {/* <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight text-[#e5e2e1]">
          Seller KYC Verification
        </h1> */}
        <p className="text-xs md:text-sm text-[#c4c7c8] max-w-md mx-auto leading-relaxed">
          Merchant identity &amp; direct bank payout verification.
        </p>

        <div className="inline-flex items-center gap-2 mt-1">
          {getStatusPill()}
        </div>
      </div>

      {/* STATUS NOTIFICATION BANNER */}
      <AnimatePresence>
        {kycData.status === "APPROVED" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-md bg-[#10b981]/10 border border-[#10b981]/30 flex items-start gap-3 shadow-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-[#34d399] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-[#34d399]">Identity Verified &amp; Payouts Active</h4>
              <p className="text-xs text-[#34d399]/80 leading-relaxed">
                Your bank details are verified. Settlements are automatically routed to{" "}
                <span className="font-bold text-white">{kycData.bank_name || "your registered bank"}</span> on a T+1 daily cycle.
              </p>
            </div>
          </motion.div>
        )}

        {(kycData.status === "SUBMITTED" || kycData.status === "REVIEW") && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 shadow-sm"
          >
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-amber-300">Verification Under Review</h4>
              <p className="text-xs text-amber-400/80 leading-relaxed">
                Your submitted details are undergoing validation (12–24h). Payouts will resume automatically once verified.
              </p>
            </div>
          </motion.div>
        )}

        {kycData.status === "REJECTED" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-md bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 shadow-sm"
          >
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-rose-300">Action Required</h4>
              <p className="text-xs text-rose-400/80 leading-relaxed">
                Details mismatch on PAN/Aadhaar or invalid IFSC. Please correct and resubmit below.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section 1: Legal Identity */}
        <div className="p-5 sm:p-6 rounded-md bg-[#1c1b1b] border border-[#2a2a2a] space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-[#2a2a2a] pb-3">
            <div className="w-7 h-7 rounded-md bg-[#20201f] border border-[#2a2a2a] flex items-center justify-center text-[#c4c0ff]">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold text-[#e5e2e1]">
              1. Legal Identity
            </h3>
          </div>

          <div className="space-y-4">
            {/* Legal Identity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Full Legal Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#e5e2e1]">Full Legal Name</label>
                <input
                  type="text"
                  disabled={!isEditable}
                  value={kycData.full_name}
                  onChange={(e) => {
                    setKycData({ ...kycData, full_name: e.target.value });
                    if (formErrors.full_name) setFormErrors((prev) => ({ ...prev, full_name: "" }));
                  }}
                  placeholder="As per PAN & Bank Account"
                  className={`w-full bg-[#101115] border rounded-md px-3.5 py-2.5 text-xs text-[#e5e2e1] placeholder-[#8e9192] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${formErrors.full_name
                      ? "border-rose-500 focus:border-rose-400"
                      : "border-[#2a2a2a] focus:border-[#c4c0ff]"
                    }`}
                />
                {formErrors.full_name && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{formErrors.full_name}</span>
                  </p>
                )}
              </div>

              {/* PAN Card */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#e5e2e1]">PAN Card Number</label>
                <input
                  type="text"
                  maxLength={10}
                  disabled={!isEditable}
                  value={kycData.pan_number}
                  onChange={(e) => {
                    setKycData({ ...kycData, pan_number: e.target.value.toUpperCase() });
                    if (formErrors.pan_number) setFormErrors((prev) => ({ ...prev, pan_number: "" }));
                  }}
                  placeholder="ABCDE1234F"
                  className={`w-full bg-[#101115] border rounded-md px-3.5 py-2.5 text-xs text-[#e5e2e1] placeholder-[#8e9192] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${formErrors.pan_number
                      ? "border-rose-500 focus:border-rose-400"
                      : "border-[#2a2a2a] focus:border-[#c4c0ff]"
                    }`}
                />
                {formErrors.pan_number && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{formErrors.pan_number}</span>
                  </p>
                )}
              </div>

              {/* Aadhaar Card */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#e5e2e1]">Aadhaar Number</label>
                <input
                  type="text"
                  maxLength={12}
                  disabled={!isEditable}
                  value={kycData.aadhaar_number}
                  onChange={(e) => {
                    setKycData({ ...kycData, aadhaar_number: e.target.value.replace(/\D/g, "") });
                    if (formErrors.aadhaar_number) setFormErrors((prev) => ({ ...prev, aadhaar_number: "" }));
                  }}
                  placeholder="12-digit Aadhaar Number"
                  className={`w-full bg-[#101115] border rounded-md px-3.5 py-2.5 text-xs text-[#e5e2e1] placeholder-[#8e9192] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${formErrors.aadhaar_number
                      ? "border-rose-500 focus:border-rose-400"
                      : "border-[#2a2a2a] focus:border-[#c4c0ff]"
                    }`}
                />
                {formErrors.aadhaar_number && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{formErrors.aadhaar_number}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Bank Account */}
        <div className="p-5 sm:p-6 rounded-md bg-[#1c1b1b] border border-[#2a2a2a] space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-[#2a2a2a] pb-3">
            <div className="w-7 h-7 rounded-md bg-[#20201f] border border-[#2a2a2a] flex items-center justify-center text-[#c4c0ff]">
              <Landmark className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold text-[#e5e2e1]">
              2. Bank Account Details
            </h3>
          </div>

          {/* Bank Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Bank Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#e5e2e1]">Bank Name</label>
              <input
                type="text"
                disabled={!isEditable}
                value={kycData.bank_name}
                onChange={(e) => {
                  setKycData({ ...kycData, bank_name: e.target.value });
                  if (formErrors.bank_name) setFormErrors((prev) => ({ ...prev, bank_name: "" }));
                }}
                placeholder="e.g. HDFC Bank, SBI"
                className={`w-full bg-[#101115] border rounded-md px-3.5 py-2.5 text-xs text-[#e5e2e1] placeholder-[#8e9192] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  formErrors.bank_name
                    ? "border-rose-500 focus:border-rose-400"
                    : "border-[#2a2a2a] focus:border-[#c4c0ff]"
                }`}
              />
              {formErrors.bank_name && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{formErrors.bank_name}</span>
                </p>
              )}
            </div>

            {/* Bank IFSC Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#e5e2e1]">Bank IFSC Code</label>
              <input
                type="text"
                maxLength={11}
                disabled={!isEditable}
                value={kycData.bank_ifsc}
                onChange={(e) => {
                  setKycData({ ...kycData, bank_ifsc: e.target.value.toUpperCase() });
                  if (formErrors.bank_ifsc) setFormErrors((prev) => ({ ...prev, bank_ifsc: "" }));
                }}
                placeholder="HDFC0001234"
                className={`w-full bg-[#101115] border rounded-md px-3.5 py-2.5 text-xs text-[#e5e2e1] placeholder-[#8e9192] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  formErrors.bank_ifsc
                    ? "border-rose-500 focus:border-rose-400"
                    : "border-[#2a2a2a] focus:border-[#c4c0ff]"
                }`}
              />
              {formErrors.bank_ifsc && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{formErrors.bank_ifsc}</span>
                </p>
              )}
            </div>

            {/* Account Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#e5e2e1] flex items-center justify-between">
                <span>Bank Account Number</span>
                <button
                  type="button"
                  onClick={() => setShowAccountNumber(!showAccountNumber)}
                  className="text-[11px] text-[#8e9192] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {showAccountNumber ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showAccountNumber ? "Hide" : "Show"}</span>
                </button>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showAccountNumber ? "text" : "password"}
                  maxLength={18}
                  disabled={!isEditable}
                  value={kycData.bank_account_number}
                  onChange={(e) => {
                    setKycData({
                      ...kycData,
                      bank_account_number: e.target.value.replace(/\D/g, ""),
                    });
                    if (formErrors.bank_account_number)
                      setFormErrors((prev) => ({ ...prev, bank_account_number: "" }));
                  }}
                  placeholder="Account Number"
                  className={`w-full bg-[#101115] border rounded-md pl-3.5 pr-9 py-2.5 text-xs text-[#e5e2e1] placeholder-[#8e9192] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    formErrors.bank_account_number
                      ? "border-rose-500 focus:border-rose-400"
                      : "border-[#2a2a2a] focus:border-[#c4c0ff]"
                  }`}
                />
                <Lock className="w-3.5 h-3.5 text-[#8e9192] absolute right-3 pointer-events-none" />
              </div>
              {formErrors.bank_account_number && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{formErrors.bank_account_number}</span>
                </p>
              )}
            </div>

            {/* Confirm Account Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#e5e2e1]">Confirm Account Number</label>
              <input
                type="text"
                maxLength={18}
                disabled={!isEditable}
                value={kycData.confirm_account_number}
                onChange={(e) => {
                  setKycData({
                    ...kycData,
                    confirm_account_number: e.target.value.replace(/\D/g, ""),
                  });
                  if (formErrors.confirm_account_number)
                    setFormErrors((prev) => ({ ...prev, confirm_account_number: "" }));
                }}
                placeholder="Re-enter Account Number"
                className={`w-full bg-[#101115] border rounded-md px-3.5 py-2.5 text-xs text-[#e5e2e1] placeholder-[#8e9192] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  formErrors.confirm_account_number
                    ? "border-rose-500 focus:border-rose-400"
                    : "border-[#2a2a2a] focus:border-[#c4c0ff]"
                }`}
              />
              {formErrors.confirm_account_number && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{formErrors.confirm_account_number}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Action Bar */}
        {isEditable && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-[#8e9192]">
              Ensure all details match your official documents.
            </p>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-md text-xs transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit for Verification</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </form>

      {/* Global Toast */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
