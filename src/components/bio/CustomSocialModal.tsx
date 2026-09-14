"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Search, Plus, Trash2, Link2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import SocialIcon, { ALL_CUSTOM_ICONS } from "./SocialIcon";
import { PublicSocialAccount } from "./LinkInBioPublicView";

interface CustomSocialModalProps {
  isOpen: boolean;
  account: Partial<PublicSocialAccount> | null;
  onClose: () => void;
  onSave: (account: Partial<PublicSocialAccount>) => void;
  onDelete?: (account: Partial<PublicSocialAccount>) => void;
}

export default function CustomSocialModal({
  isOpen,
  account,
  onClose,
  onSave,
  onDelete,
}: CustomSocialModalProps) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("link");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (account) {
      setLabel(account.label || account.platform || "");
      setUrl(account.url || "");
      setIcon(account.icon || account.platform || "link");
    } else {
      setLabel("");
      setUrl("");
      setIcon("link");
    }
    setSearchQuery("");
    setCategoryFilter("All");
  }, [account, isOpen]);

  const categories = ["All", "Social", "Chat", "Creator", "Commerce", "Audio", "Streaming", "Professional", "General"];

  const filteredIcons = ALL_CUSTOM_ICONS.filter((item) => {
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    onSave({
      id: account?.id || `custom_${Date.now()}`,
      platform: account?.platform || "custom",
      label: label.trim() || ALL_CUSTOM_ICONS.find((i) => i.id === icon)?.name || "Link",
      url: url.trim(),
      icon: icon,
      is_active: true,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 font-sans">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            className="relative w-full max-w-lg bg-[#141414] border border-white/15 rounded overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col z-10 max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-3 sm:p-4 px-4 sm:px-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#1c1b1b] gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                  <SocialIcon platformOrIcon={icon} className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    {account?.id ? "Edit Custom Social Link" : "Add Custom Social Link"}
                  </h3>
                  {/* <p className="text-[10px] text-zinc-400">Add any social network, creator profile, or store link</p> */}
                </div>
              </div>


              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded bg-[#20201f] hover:bg-[#2a2a2a] border border-[#353535] text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!url.trim()}
                  className="px-4 py-1.5 rounded bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{account?.id ? "Save" : "Add"}</span>
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 scrollbar-hide">
              {/* Title / Label */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Title / Display Name</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. My GitHub, Buy Me A Coffee, Substack"
                  className="w-full bg-[#1c1b1b] border border-[#353535] rounded px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              {/* URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Destination URL *</label>
                <input
                  type="text"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#1c1b1b] border border-[#353535] rounded px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors font-mono"
                />
              </div>

              {/* Icon Selector Section */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">

                    <span>Choose Icon</span>
                  </label>
                  <span className="text-[10px] text-zinc-500 capitalize">Selected: {icon}</span>
                </div>

                {/* Search & Category Filter */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search icons (e.g. github, discord, shop)..."
                      className="w-full bg-[#1c1b1b] border border-[#353535] rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer select-none",
                          categoryFilter === cat
                            ? "bg-white text-black font-bold"
                            : "bg-[#1c1b1b] text-zinc-400 hover:text-white"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon Grid */}
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-40 overflow-y-auto p-1.5 bg-[#0e0e0e] rounded border border-[#262626]">
                  {filteredIcons.map((item) => {
                    const isSelected = icon === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setIcon(item.id)}
                        title={item.name}
                        className={cn(
                          "p-2 rounded flex flex-col items-center justify-center gap-1 transition-all cursor-pointer aspect-square",
                          isSelected
                            ? "bg-white text-black shadow font-bold scale-105"
                            : "bg-[#181818] text-zinc-300 hover:bg-[#252525] hover:text-white"
                        )}
                      >
                        <SocialIcon platformOrIcon={item.id} className="w-4 h-4 shrink-0" />
                        <span className="text-[8px] truncate max-w-full">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                {account?.id && onDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(account)}
                    className="px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                ) : (
                  <div />
                )}


              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
