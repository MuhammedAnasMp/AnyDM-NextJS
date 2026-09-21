"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { marked } from "marked";
import {
  BookOpen,
  ArrowLeft,
  Crown,
  Coins,
  Settings,
  ShieldAlert,
  FileText,
  Sparkles,
  Search,
  ExternalLink,
  Gift,
  DollarSign,
  Copy,
  Check,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { adminSystemDocsMarkdown } from "@/content/adminDocs";

const t = {
  surface: "#131313",
  surfaceContainerLowest: "#0e0e0e",
  surfaceContainerLow: "#1c1b1b",
  surfaceContainer: "#20201f",
  surfaceContainerHigh: "#2a2a2a",
  surfaceContainerHighest: "#353535",
  onSurface: "#e5e2e1",
  onSurfaceVariant: "#c4c7c8",
  outline: "#8e9192",
  outlineVariant: "#444748",
  primary: "#ffffff",
  onPrimary: "#2f3131",
  accentLavender: "#b6b2ff",
  accentCyan: "#8fe3ff",
  error: "#ffb4ab",
};

export default function AdminDocsPage() {
  const appUser = useSelector((state: RootState) => state.auth.user);
  const isAdmin = !!(appUser?.is_superuser || appUser?.is_staff);

  const [copied, setCopied] = useState(false);

  const renderedHtml = useMemo(() => {
    return marked.parse(adminSystemDocsMarkdown) as string;
  }, []);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(adminSystemDocsMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center px-4">
        <ShieldAlert className="w-10 h-10 text-[#ffb4ab]" />
        <h2 className="text-sm font-semibold text-[#e5e2e1]">Access Denied</h2>
        <span className="text-xs text-[#c4c7c8] max-w-sm">
          You do not have the required administrative permissions to access this documentation.
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4 max-w-6xl mx-auto font-sans"
      style={{ color: t.onSurface }}
    >
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4"
        style={{ borderBottom: `1px solid ${t.outlineVariant}` }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/admin"
            className="p-1.5 rounded bg-[#1c1b1b] hover:bg-[#2a2a2a] border border-[#444748] text-[#e5e2e1] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="p-1.5 rounded bg-[#20201f] border border-[#444748] text-[#b6b2ff]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-[#e5e2e1]">Admin Reference Documentation</h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#20201f] text-[#c4c7c8] border border-[#444748]">
                MD SPEC
              </span>
            </div>
            <p className="text-xs mt-0.5 text-[#c4c7c8]">
              Comprehensive specification for membership plans, point rewards, VIP Free Pro, and affiliate commission lifecycle.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-1.5 rounded text-xs font-medium border border-[#444748] bg-[#1c1b1b] hover:bg-[#2a2a2a] text-[#e5e2e1] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Raw .MD"}</span>
          </button>
          <Link
            href="/dashboard/admin"
            className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-opacity hover:opacity-90 bg-[#ffffff] text-[#2f3131]"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Admin Settings</span>
          </Link>
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded bg-[#20201f] border border-[#444748] space-y-1">
          <div className="flex items-center gap-1.5 text-[#8fe3ff] font-medium text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pro Plan Tier</span>
          </div>
          <p className="text-lg font-semibold text-[#e5e2e1]">₹499 <span className="text-xs text-[#c4c7c8] font-normal">/ mo</span></p>
          <span className="text-[11px] text-[#c4c7c8] block">Unlimited DM triggers & master AI token</span>
        </div>

        <div className="p-3.5 rounded bg-[#20201f] border border-[#444748] space-y-1">
          <div className="flex items-center gap-1.5 text-[#e5e2e1] font-medium text-xs">
            <Coins className="w-3.5 h-3.5" />
            <span>Standard Point Rule</span>
          </div>
          <p className="text-lg font-semibold text-[#e5e2e1]">+50 <span className="text-xs text-[#c4c7c8] font-normal">pts/user</span></p>
          <span className="text-[11px] text-[#c4c7c8] block">100 pts = 1 Mo Pro Extension</span>
        </div>

        <div className="p-3.5 rounded bg-[#20201f] border border-[#444748] space-y-1">
          <div className="flex items-center gap-1.5 text-[#b6b2ff] font-medium text-xs">
            <Gift className="w-3.5 h-3.5" />
            <span>VIP Free Pro</span>
          </div>
          <p className="text-lg font-semibold text-[#e5e2e1]">+20 <span className="text-xs text-[#c4c7c8] font-normal">pts/paid sub</span></p>
          <span className="text-[11px] text-[#c4c7c8] block">3 Mo default term + 15 day trial</span>
        </div>

        <div className="p-3.5 rounded bg-[#20201f] border border-[#444748] space-y-1">
          <div className="flex items-center gap-1.5 text-[#8fe3ff] font-medium text-xs">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Affiliate Commission</span>
          </div>
          <p className="text-lg font-semibold text-[#e5e2e1]">10.0% <span className="text-xs text-[#c4c7c8] font-normal">rev-share</span></p>
          <span className="text-[11px] text-[#c4c7c8] block">6 Mo default term • ₹500 min payout</span>
        </div>
      </div>

      {/* Main Rendered Markdown Container */}
      <div
        className="rounded p-5 sm:p-6 bg-[#1c1b1b] border border-[#444748] shadow-sm overflow-hidden"
      >
        <div
          className="admin-markdown-content text-[#e5e2e1]"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>

      <style jsx global>{`
        .admin-markdown-content h1 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 0.5rem;
          border-bottom: 1px solid #444748;
          padding-bottom: 0.5rem;
        }
        .admin-markdown-content h2 {
          font-size: 1rem;
          font-weight: 600;
          color: #e5e2e1;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .admin-markdown-content h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #b6b2ff;
          margin-top: 1rem;
          margin-bottom: 0.375rem;
        }
        .admin-markdown-content p {
          font-size: 0.8125rem;
          line-height: 1.5;
          color: #c4c7c8;
          margin-bottom: 0.75rem;
        }
        .admin-markdown-content hr {
          border: 0;
          border-top: 1px solid #444748;
          margin: 1.25rem 0;
        }
        .admin-markdown-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 0.75rem;
          background: #20201f;
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid #444748;
        }
        .admin-markdown-content th {
          background: #2a2a2a;
          color: #ffffff;
          font-weight: 600;
          text-align: left;
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid #444748;
        }
        .admin-markdown-content td {
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid #2a2a2a;
          color: #e5e2e1;
        }
        .admin-markdown-content tr:hover td {
          background: #2a2a2a;
        }
        .admin-markdown-content ul {
          list-style-type: disc;
          padding-left: 1.25rem;
          margin-bottom: 0.75rem;
          font-size: 0.8125rem;
          line-height: 1.5;
          color: #c4c7c8;
        }
        .admin-markdown-content li {
          margin-bottom: 0.25rem;
        }
        .admin-markdown-content code {
          background: #2a2a2a;
          color: #8fe3ff;
          padding: 0.1rem 0.3rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .admin-markdown-content pre {
          background: #0e0e0e;
          border: 1px solid #444748;
          padding: 0.75rem;
          border-radius: 4px;
          overflow-x: auto;
          margin: 0.75rem 0;
        }
        .admin-markdown-content pre code {
          background: transparent;
          color: #b6b2ff;
          padding: 0;
          font-size: 0.75rem;
          line-height: 1.4;
        }
        .admin-markdown-content strong {
          color: #ffffff;
          font-weight: 600;
        }
      `}</style>
    </motion.div>
  );
}
