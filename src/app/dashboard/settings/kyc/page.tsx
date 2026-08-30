"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  CreditCard,
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

    // 1. Full Name
    if (kycData.full_name.trim().length < 3) {
      errors.full_name = "Legal name must be at least 3 characters.";
    }

    // 2. PAN Number (5 letters, 4 numbers, 1 letter)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(kycData.pan_number)) {
      errors.pan_number = "Enter a valid 10-character PAN (e.g., ABCDE1234F).";
    }

    // 3. Aadhaar Number (12 digits)
    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(kycData.aadhaar_number)) {
      errors.aadhaar_number = "Aadhaar number must be exactly 12 digits.";
    }

    // 4. Bank Name
    if (kycData.bank_name.trim().length < 3) {
      errors.bank_name = "Enter your bank's legal name (e.g. HDFC Bank, ICICI Bank).";
    }

    // 5. IFSC Code (4 letters, 0, 6 alphanumeric)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(kycData.bank_ifsc)) {
      errors.bank_ifsc = "Enter a valid 11-digit IFSC code (e.g., HDFC0001234).";
    }

    // 6. Account Number (9 to 18 digits)
    const bankAccountRegex = /^\d{9,18}$/;
    if (!bankAccountRegex.test(kycData.bank_account_number)) {
      errors.bank_account_number = "Account number must be between 9 and 18 digits.";
    }

    // 7. Confirm Account Number (only if user is filling it)
    if (isEditable && kycData.bank_account_number !== kycData.confirm_account_number) {
      errors.confirm_account_number = "Account numbers do not match.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please correct the highlighted errors before submitting.", "error");
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
      showToast("KYC documents submitted for verification!", "success");
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
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>VERIFIED &amp; ACTIVE</span>
          </div>
        );
      case "SUBMITTED":
      case "REVIEW":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>UNDER REVIEW</span>
          </div>
        );
      case "REJECTED":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold tracking-wide">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ACTION REQUIRED</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-zinc-400 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
            <span>NOT SUBMITTED</span>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-white/60" />
        <p className="text-xs font-medium text-zinc-400">Loading statutory compliance records...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20 font-sans">
      {/* ── Top Hero / Breadcrumb Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#181818] p-5 sm:p-6 rounded-xl border border-white/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-white/[0.02] via-transparent to-transparent pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Seller KYC &amp; Settlement Routing
              </h1>
            </div>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Statutory merchant identity verification &amp; direct bank payout routing. Compliant with RBI/NPCI payment settlement guidelines.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">{getStatusPill()}</div>
      </div>

      {/* ── Status Banner Notification ── */}
      <AnimatePresence>
        {kycData.status === "APPROVED" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3.5"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-emerald-300">Identity Verified &amp; Direct Payouts Active</h4>
              <p className="text-xs text-emerald-400/80 leading-relaxed">
                Your PAN, Aadhaar, and Bank Account records have been fully verified. Store order settlements are automatically routed to{" "}
                <span className="font-semibold text-emerald-200">{kycData.bank_name || "your registered bank"}</span> on a T+1 daily rolling cycle.
              </p>
            </div>
          </motion.div>
        )}

        {(kycData.status === "SUBMITTED" || kycData.status === "REVIEW") && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3.5"
          >
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-300">Verification Under Review</h4>
              <p className="text-xs text-amber-400/80 leading-relaxed">
                Your submitted documents are currently undergoing automated and compliance desk validation. Verification is completed within 12–24 business hours. Order payouts will be queued and released automatically once approved.
              </p>
            </div>
          </motion.div>
        )}

        {kycData.status === "REJECTED" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-start gap-3.5"
          >
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-rose-300">Verification Action Required</h4>
              <p className="text-xs text-rose-400/80 leading-relaxed">
                Some details could not be matched with government verification registries (name mismatch on PAN/Aadhaar or invalid IFSC). Please correct your details below and resubmit.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Verification Form */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Legal Identity & Tax Info */}
            <div className="p-5 sm:p-6 rounded-xl bg-[#181818] border border-white/10 space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      1. Legal Identity &amp; Tax Credentials
                    </h3>
                    <p className="text-[11px] text-zinc-400">Must match government-issued identity cards</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">
                  Mandatory
                </span>
              </div>

              <div className="space-y-4">
                {/* Full Legal Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                    <span>Full Legal Name (as per PAN &amp; Bank Account)</span>
                    <span className="text-[10px] text-zinc-500">Government Identity Match</span>
                  </label>
                  <input
                    type="text"
                    disabled={!isEditable}
                    value={kycData.full_name}
                    onChange={(e) => {
                      setKycData({ ...kycData, full_name: e.target.value });
                      if (formErrors.full_name) setFormErrors((prev) => ({ ...prev, full_name: "" }));
                    }}
                    placeholder="e.g. Ramesh Kumar Sharma"
                    className={`w-full bg-[#121212] border rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      formErrors.full_name
                        ? "border-rose-500 focus:border-rose-400"
                        : "border-white/10 focus:border-white focus:ring-1 focus:ring-white/20"
                    }`}
                  />
                  {formErrors.full_name && (
                    <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.full_name}</span>
                    </p>
                  )}
                </div>

                {/* PAN & Aadhaar 2-Col Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* PAN Card */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                      <span>PAN Card Number</span>
                      <span className="text-[10px] text-zinc-500">10-Digit Alphanumeric</span>
                    </label>
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
                      className={`w-full bg-[#121212] border rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none uppercase tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        formErrors.pan_number
                          ? "border-rose-500 focus:border-rose-400"
                          : "border-white/10 focus:border-white focus:ring-1 focus:ring-white/20"
                      }`}
                    />
                    {formErrors.pan_number && (
                      <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{formErrors.pan_number}</span>
                      </p>
                    )}
                  </div>

                  {/* Aadhaar Card */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                      <span>Aadhaar Card Number</span>
                      <span className="text-[10px] text-zinc-500">12-Digit UIDAI</span>
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      disabled={!isEditable}
                      value={kycData.aadhaar_number}
                      onChange={(e) => {
                        setKycData({ ...kycData, aadhaar_number: e.target.value.replace(/\D/g, "") });
                        if (formErrors.aadhaar_number) setFormErrors((prev) => ({ ...prev, aadhaar_number: "" }));
                      }}
                      placeholder="123456789012"
                      className={`w-full bg-[#121212] border rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        formErrors.aadhaar_number
                          ? "border-rose-500 focus:border-rose-400"
                          : "border-white/10 focus:border-white focus:ring-1 focus:ring-white/20"
                      }`}
                    />
                    {formErrors.aadhaar_number && (
                      <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{formErrors.aadhaar_number}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Settlement Bank Account */}
            <div className="p-5 sm:p-6 rounded-xl bg-[#181818] border border-white/10 space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white">
                    <Landmark className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      2. Direct Settlement Bank Account
                    </h3>
                    <p className="text-[11px] text-zinc-400">All customer sales settlements are transferred here</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">
                  T+1 Daily Cycle
                </span>
              </div>

              <div className="space-y-4">
                {/* Bank Name & IFSC */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Bank Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Bank Name</label>
                    <input
                      type="text"
                      disabled={!isEditable}
                      value={kycData.bank_name}
                      onChange={(e) => {
                        setKycData({ ...kycData, bank_name: e.target.value });
                        if (formErrors.bank_name) setFormErrors((prev) => ({ ...prev, bank_name: "" }));
                      }}
                      placeholder="e.g. HDFC Bank, SBI, ICICI"
                      className={`w-full bg-[#121212] border rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        formErrors.bank_name
                          ? "border-rose-500 focus:border-rose-400"
                          : "border-white/10 focus:border-white focus:ring-1 focus:ring-white/20"
                      }`}
                    />
                    {formErrors.bank_name && (
                      <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{formErrors.bank_name}</span>
                      </p>
                    )}
                  </div>

                  {/* Bank IFSC Code */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                      <span>Bank IFSC Code</span>
                      <span className="text-[10px] text-zinc-500">11-Digit Code</span>
                    </label>
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
                      className={`w-full bg-[#121212] border rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none uppercase tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        formErrors.bank_ifsc
                          ? "border-rose-500 focus:border-rose-400"
                          : "border-white/10 focus:border-white focus:ring-1 focus:ring-white/20"
                      }`}
                    />
                    {formErrors.bank_ifsc && (
                      <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{formErrors.bank_ifsc}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Account Number & Confirm Account Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Account Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                      <span>Bank Account Number</span>
                      <button
                        type="button"
                        onClick={() => setShowAccountNumber(!showAccountNumber)}
                        className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
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
                        placeholder="Enter Account Number"
                        className={`w-full bg-[#121212] border rounded-lg pl-3.5 pr-9 py-2.5 text-xs text-white placeholder-zinc-600 outline-none tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          formErrors.bank_account_number
                            ? "border-rose-500 focus:border-rose-400"
                            : "border-white/10 focus:border-white focus:ring-1 focus:ring-white/20"
                        }`}
                      />
                      <Lock className="w-3.5 h-3.5 text-zinc-500 absolute right-3 pointer-events-none" />
                    </div>
                    {formErrors.bank_account_number && (
                      <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{formErrors.bank_account_number}</span>
                      </p>
                    )}
                  </div>

                  {/* Confirm Account Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Confirm Account Number</label>
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
                      className={`w-full bg-[#121212] border rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        formErrors.confirm_account_number
                          ? "border-rose-500 focus:border-rose-400"
                          : "border-white/10 focus:border-white focus:ring-1 focus:ring-white/20"
                      }`}
                    />
                    {formErrors.confirm_account_number && (
                      <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{formErrors.confirm_account_number}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action Bar */}
            {isEditable && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-zinc-500">
                  By submitting, you certify that the provided PAN and bank details belong to you or your registered business entity.
                </p>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-gradient-to-r from-white to-[#eaeaea] hover:from-white hover:to-white text-black text-xs font-bold rounded-lg shadow flex items-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting Records...</span>
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
        </div>

        {/* Right 4 Cols: Compliance & Settlement Blueprint */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Settlement Cycle Blueprint */}
          <div className="p-5 rounded-xl bg-[#181818] border border-white/10 space-y-3.5">
            <div className="flex items-center gap-2 text-white">
              <Zap className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Settlement Architecture</h4>
            </div>
            <div className="space-y-2.5 text-xs text-zinc-400">
              <div className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-zinc-400">Settlement Frequency:</span>
                <span className="font-bold text-white">T+1 Daily Cycle</span>
              </div>
              <div className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-zinc-400">Payout Network:</span>
                <span className="font-bold text-white">NEFT / IMPS / RTGS</span>
              </div>
              <div className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-zinc-400">Platform Deductions:</span>
                <span className="font-bold text-emerald-400">0% Platform Fee</span>
              </div>
            </div>
          </div>

          {/* Card 2: Security & RBI Data Localization */}
          <div className="p-5 rounded-xl bg-[#181818] border border-white/10 space-y-3.5">
            <div className="flex items-center gap-2 text-white">
              <Lock className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Bank-Grade Encryption</h4>
            </div>
            <ul className="text-xs space-y-2.5 text-zinc-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>256-Bit AES encryption for banking credentials and tax identifiers.</span>
              </li>
              <li className="flex items-start gap-2">
                <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Complies with RBI Data Localization guidelines. Hosted on certified secure infrastructure.</span>
              </li>
              <li className="flex items-start gap-2">
                <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Direct payout routing with no intermediary wallet holds.</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Need Expedited Verification */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-zinc-300">
              <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-semibold">Need Expedited Approval?</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              For high-volume merchants or enterprise accounts requiring immediate payout activation, contact our compliance desk at{" "}
              <a href="mailto:support@zoyee.in" className="text-white underline hover:text-zinc-200">
                support@zoyee.in
              </a>
            </p>
          </div>
        </div>
      </div>

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
