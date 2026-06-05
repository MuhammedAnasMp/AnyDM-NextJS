"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function CatalogPage() {
  const [selectedFilter, setSelectedFilter] = useState("All");

  const bentoStats = [
    { label: "Total Products", val: "128", growth: "+12%", icon: "inventory" },
    { label: "DM Inquiries", val: "2.4k", growth: "+8%", icon: "chat_bubble" },
    { label: "Link Clicks", val: "15.8k", growth: "Stable", icon: "ads_click" },
    { label: "Conv. Rate", val: "3.2%", growth: "+0.4%", icon: "trending_up" }
  ];

  const products = [
    {
      name: "HyperBoost Running Core",
      sku: "HYP-CR-001",
      updated: "2h ago",
      inquiries: "842",
      clicks: "5.2k",
      conv: "4.8%",
      progress: 48,
      status: "Published",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCp-lfo7IxC9Z5DkrJfEBY9prWBgF0Nraoa6TmtKPmY_PB4X6ompLv0r0FyRcyQV3Y7DL7dZ7QfCH8fmEBZ2xH_4791sWQi62XmCov1y89uvfbYEprthQFSJOyMmHylytZK6pPwtpbT24TVRlfH2rtROIriZ-_kdxixpTK1p26z04l3mJnPfn0S8AVS_zwfmqL6EoLMKOwiR-Iakj84qGedem6nbddsPRoii7KttJy0apq3mY4kxyaBO-6gsZMSZNVipVciRTsTuYM"
    },
    {
      name: "Serene Quartz Minimalist",
      sku: "SER-QTZ-44",
      updated: "1d ago",
      inquiries: "1,205",
      clicks: "8.1k",
      conv: "2.1%",
      progress: 21,
      status: "Draft",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsesPxVBpHJ7XEF6tg78St4xAph3PREaxRqKWCS12plW7-4Pa_qE92IDDJnvUdDFdjX-omDrM8QXM3mOCiDo_nn_sIJCEfxPOMKFZyVaS_oiYsw6pVh7h128phIqZe4JTWvM8xiC6eImDHQG4s6Pc6YwfCLlEIX4tcrN9OeBbIZM8937DX_TCXc0H1A-9xiXWWU2EMMnl8gwtjzFBCfQWtmzRrKv4BDic0xDUqen_Co_AaQamWvUbQXrzQvajonSpWp2ZEUNWUl88"
    },
    {
      name: "Acoustic Pro Gen-2",
      sku: "AC-PRO-G2",
      updated: "4h ago",
      inquiries: "312",
      clicks: "2.4k",
      conv: "5.9%",
      progress: 59,
      status: "Published",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVsNaqvbiMCFl-eWS6BqN_WsaGyM8KlXz3TH0Q2VzLPXTCjRViD-j0ELNiAx8UW0rQ2xlo04t7bn2Y0xLqusFrB8h-jWEVyYc4Z4iaQCGvGsDDS7TXQXEIbLm5ofv5LypfpueOP4q6D0XWJzoc2lGtNNhHDaCx2XCQC41ed61mlPN7nLa0D7mqjJptirVd7z6ojMU2ygvTcHAIK9gQpY76riPuXGXTFoqYdZeA0ziKHf266WZY6DfdXUDjTv1-YSr_dFYolRkJ1V8"
    }
  ];

  const filteredProducts = products.filter(p => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Published") return p.status === "Published";
    if (selectedFilter === "Drafts") return p.status === "Draft";
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Product Catalog</h1>
          <p className="text-sm text-on-surface-variant opacity-70 mt-1">Manage and track your AI-synced ecommerce inventory.</p>
        </div>
        <div className="flex gap-2 text-xs">
          <button className="glass-pane px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-white/10 transition-all">
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Export CSV</span>
          </button>
          <button className="bg-white text-black px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-[#eaeaea] active:scale-95 transition-all">
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Create Product</span>
          </button>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {bentoStats.map((stat, i) => (
          <div key={i} className="glass-pane p-6 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-8xl">{stat.icon}</span>
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{stat.label}</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-2xl font-bold text-white">{stat.val}</span>
              <span className="text-xs text-emerald-400 font-semibold">{stat.growth}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Actions Bar */}
      <div className="glass-pane rounded-t-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-xs text-white">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            <span>Filters</span>
          </div>
          <div className="h-6 w-[1px] bg-white/10"></div>
          <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
            {["All", "Published", "Drafts"].map((filter) => (
              <button 
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  selectedFilter === filter 
                    ? "bg-white/10 text-white font-bold" 
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                {filter === "All" ? "All Products" : filter}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input 
              className="bg-white/5 border border-white/5 rounded-lg pl-9 py-2 pr-4 text-xs w-64 focus:ring-1 focus:ring-white/20 transition-all text-white placeholder:text-on-surface-variant/40 outline-none" 
              placeholder="Search products..." 
              type="text" 
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-pane rounded-b-xl overflow-hidden border-t-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-on-surface-variant font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4 text-center">Inquiries</th>
                <th className="px-6 py-4 text-center">Clicks</th>
                <th className="px-6 py-4 text-center">Conversion</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((p, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
                        <img className="w-full h-full object-cover" src={p.img} alt={p.name} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white mb-1">{p.name}</p>
                        <p className="text-[10px] text-on-surface-variant/60">SKU: {p.sku} • Updated {p.updated}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-medium text-white">{p.inquiries}</td>
                  <td className="px-6 py-4 text-center text-sm font-medium text-white">{p.clicks}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-bold text-white">{p.conv}</span>
                      <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: `${p.progress}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${
                      p.status === "Published" 
                        ? "bg-green-500/10 text-green-400 border-green-500/20" 
                        : "bg-white/10 text-on-surface-variant border-white/5"
                    }`}>
                      {p.status === "Published" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                      )}
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-white/10 rounded-lg text-[#c4c7c8]/60 hover:text-white transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg text-[#c4c7c8]/60 hover:text-white transition-colors" title="View Insights">
                        <span className="material-symbols-outlined text-lg">analytics</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs text-on-surface-variant font-medium">Showing 1 to {filteredProducts.length} of 128 products</p>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-30" disabled>
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-black text-xs font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-xs font-medium">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-xs font-medium">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
