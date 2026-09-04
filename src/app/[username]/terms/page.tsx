"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, RefreshCw } from "lucide-react";
import api from "@/lib/services/api.service";
import { getStoreHomeUrl } from "@/lib/utils/domain";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function TermsOfServicePage({ params }: PageProps) {
  const { username } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState("");
  const [terms, setTerms] = useState("");

  useEffect(() => {
    if (username) {
      api.get(`/accounts/public/store/${username}/`).then((res) => {
        if (res.data?.settings) {
          setStoreName(res.data.settings.store_name || username);
          setTerms(res.data.settings.terms_of_service || "By browsing this store and placing orders, you agree to comply with our terms and conditions.");
        }
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [username]);

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#e5e2e1] p-6 max-w-3xl mx-auto flex flex-col justify-between">
      <div className="space-y-6">
        <button
          onClick={() => router.push(getStoreHomeUrl(username))}
          className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </button>

        <div className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5 text-indigo-400 mb-1">
            <FileText className="w-5 h-5" />
            <span className="text-xs font-mono tracking-wider uppercase">Legal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-xs text-zinc-400 mt-1">{storeName}</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-zinc-500 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading Terms...
          </div>
        ) : (
          <div className="bg-[#1c1b1b] rounded-xl p-6 border border-white/5 shadow-xl">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-300 font-normal">
              {terms}
            </p>
          </div>
        )}
      </div>

      <footer className="pt-12 text-center text-xs text-zinc-500 border-t border-white/5 mt-12">
        &copy; {new Date().getFullYear()} {storeName || username}. All rights reserved.
      </footer>
    </div>
  );
}
