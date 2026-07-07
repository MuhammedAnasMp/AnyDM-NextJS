"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Sparkles,
  Plus,
  Trash2,
  Edit,
  Play,
  TrendingUp,
  CheckCircle2,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  Loader2,
  RefreshCw,
  ChevronRight
} from "lucide-react";
import api from "@/lib/services/api.service";
import Toast from "@/components/Toast";

interface Automation {
  id: string;
  name: string;
  rule_type: string;
  trigger_event: string;
  status: "active" | "disabled";
  count: string;
  keywords: string[];
  target_mode: string;
  target_media_ids: string[];
  actions: Array<{
    action_type: string;
    dm_format: string;
    messages: string[];
  }>;
  created_at: string;
  updated_at: string;
}

export default function AutomationsDashboard() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; visible: boolean }>({
    message: "",
    type: "info",
    visible: false
  });

  const fetchAutomations = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await api.get("/automations/", {
        bypassCache: true
      } as any);
      if (Array.isArray(response.data)) {
        setAutomations(response.data);
      }
    } catch (error) {
      console.error("Error fetching automations:", error);
      setToast({
        message: "Failed to load automations. Please refresh.",
        type: "error",
        visible: true
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const handleToggle = async (id: string, currentStatus: "active" | "disabled") => {
    setTogglingId(id);
    const nextEnabled = currentStatus !== "active";
    try {
      const response = await api.post(`/automations/${id}/toggle/`, { isEnabled: nextEnabled });
      if (response.data && response.data.success) {
        setAutomations(prev => prev.map(item => {
          if (item.id === id) {
            return { ...item, status: nextEnabled ? "active" : "disabled" };
          }
          return item;
        }));
        setToast({
          message: `Automation ${nextEnabled ? "activated" : "paused"}.`,
          type: "success",
          visible: true
        });
      }
    } catch (error) {
      console.error("Error toggling automation:", error);
      setToast({
        message: "Failed to update status. Please try again.",
        type: "error",
        visible: true
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this automation?")) return;
    setDeletingId(id);
    try {
      const response = await api.delete(`/automations/${id}/`);
      if (response.data && response.data.success) {
        setAutomations(prev => prev.filter(item => item.id !== id));
        setToast({
          message: "Automation deleted successfully.",
          type: "success",
          visible: true
        });
      }
    } catch (error) {
      console.error("Error deleting automation:", error);
      setToast({
        message: "Failed to delete automation.",
        type: "error",
        visible: true
      });
    } finally {
      setDeletingId(null);
    }
  };

  const totalTriggers = automations.reduce((sum, item) => sum + parseInt(item.count || "0", 10), 0);
  const activeCount = automations.filter(item => item.status === "active").length;
  const triggerTypes = automations.map(item => item.rule_type);
  const mostCommonType = triggerTypes.length > 0
    ? triggerTypes.sort((a, b) => triggerTypes.filter(v => v === a).length - triggerTypes.filter(v => v === b).length).pop()
    : "None";

  const formatRuleType = (type: string) => {
    return type
      .replace(/_/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const getRuleTypeBadgeStyles = (type: string) => {
    if (type.includes("comment")) return "border-[#8FE3FF]/20 text-[#8FE3FF] bg-[#8FE3FF]/5";
    if (type.includes("story")) return "border-[#B6B2FF]/20 text-[#B6B2FF] bg-[#B6B2FF]/5";
    return "border-[#E0E0E0]/20 text-[#E0E0E0] bg-[#E0E0E0]/5";
  };

  return (
    <div className="min-h-screen .bg-[#131313] text-[#e5e2e1] font-sans antialiased selection:bg-[#c6c6c7]/30">

      {/* Dense Sticky Header Overlay */}


      <main className="w-full">

        {/* Compact Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 pb-3.5">

          <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#131313]/85 border-b border-[#444748]">
            <div className=" mx-auto h-12 flex items-center justify-between">

              <div>
                <h1 className="text-base font-bold tracking-tight text-[#e5e2e1] flex items-center gap-1.5">
                  <span>Instagram Automations</span>
                  {/* <Sparkles className="w-3.5 h-3.5 text-[#B6B2FF] shrink-0" /> */}
                </h1>

              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => fetchAutomations()}
                  disabled={loading}
                  className="p-1.5 bg-[#1c1b1b] hover:bg-[#20201f] border border-[#444748] rounded text-[#e5e2e1] transition-colors flex items-center justify-center disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                </button>
                <Link
                  href="/dashboard/automations"
                  className="py-1 px-2.5 bg-white hover:bg-[#e5e2e1] text-[#131313] rounded text-[11px] font-bold tracking-tight transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Create Workflow</span>
                </Link>
              </div>
            </div>
          </header>
        </div>

        {/* Structured Grid Stats Panel */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { title: "Total Executions", value: totalTriggers, icon: Zap, color: "text-[#E0E0E0]" },
            { title: "Active Workflows", value: activeCount, icon: Play, color: "text-[#8FE3FF]" },
            { title: "Saved Templates", value: automations.length, icon: MessageSquare, color: "text-[#c4c7c8]" },
            { title: "Leading Trigger", value: mostCommonType ? formatRuleType(mostCommonType) : "N/A", icon: TrendingUp, color: "text-[#B6B2FF]" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-[#1c1b1b] border border-[#444748] rounded p-3 flex items-center justify-between shadow-sm">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-semibold text-[#c4c7c8]/85 uppercase tracking-wider block">{stat.title}</span>
                  <span className="text-lg font-bold text-[#e5e2e1] tracking-tight block">{stat.value}</span>
                </div>
                <div className="w-7 h-7 rounded bg-[#20201f] border border-[#444748]/60 flex items-center justify-center shrink-0">
                  <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Grid Setup */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#c4c7c8]">
              Configured Profiles & Rules
            </h2>
            <span className="px-1.5 py-0.2 bg-[#20201f] border border-[#444748] rounded-sm text-[9px] text-[#c4c7c8] font-mono">
              {automations.length}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-40 bg-[#1c1b1b] border border-[#444748] rounded animate-pulse flex flex-col justify-between p-3.5">
                  <div className="space-y-2">
                    <div className="h-3.5 bg-[#20201f] rounded-sm w-2/3" />
                    <div className="h-3 bg-[#20201f] rounded-sm w-1/3" />
                  </div>
                  <div className="h-7 bg-[#20201f] rounded-sm w-full mt-auto" />
                </div>
              ))}
            </div>
          ) : automations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center text-center p-8 bg-[#1c1b1b] border border-[#444748] rounded"
            >
              <div className="w-8 h-8 rounded bg-[#20201f] border border-[#444748] flex items-center justify-center mb-3">
                <AlertTriangle className="w-4 h-4 text-[#8e9192]" />
              </div>
              <h3 className="text-xs font-semibold text-[#e5e2e1] mb-0.5">No Active Rule Sets</h3>
              <p className="text-[11px] text-[#c4c7c8] max-w-xs mb-3">
                Select a visual trigger set to automatically configure communication hooks.
              </p>
              <Link
                href="/dashboard/automations"
                className="py-1 px-2.5 bg-white hover:bg-[#e5e2e1] text-[#131313] rounded text-[11px] font-bold transition-colors flex items-center gap-1"
              >
                <span>Add Template</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <AnimatePresence>
                {automations.map((item) => (
                  <motion.div
                    key={item.id}
                    layoutId={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className={`bg-[#1c1b1b] border rounded p-3.5 flex flex-col justify-between shadow-sm transition-colors ${item.status === "active" ? "border-[#8e9192]" : "border-[#444748]"
                      }`}
                  >
                    {/* Header parameters */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-xs text-[#e5e2e1] tracking-tight truncate flex-1 leading-snug">
                          {item.name}
                        </h3>

                        {/* Minimal Compact Switch */}
                        <button
                          onClick={() => handleToggle(item.id, item.status)}
                          disabled={togglingId === item.id}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition-colors relative flex items-center cursor-pointer outline-none border border-transparent shrink-0 ${item.status === "active" ? "bg-white" : "bg-[#20201f] border-[#444748]"
                            }`}
                        >
                          <div className={`w-3 h-3 rounded-full shadow-sm transform transition-transform duration-100 ${item.status === "active" ? "translate-x-3.5 bg-[#131313]" : "translate-x-0 bg-[#8e9192]"
                            } flex items-center justify-center`}>
                            {togglingId === item.id && (
                              <Loader2 className="w-2.5 h-2.5 animate-spin text-white" />
                            )}
                          </div>
                        </button>
                      </div>

                      {/* Rule Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-1.5 py-0.2 text-[8px] font-bold rounded-sm uppercase tracking-wider border ${getRuleTypeBadgeStyles(item.rule_type)}`}>
                          {formatRuleType(item.rule_type)}
                        </span>
                        <span className="text-[10px] text-[#c4c7c8] flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-[#8FE3FF]" />
                          {item.count} runs
                        </span>
                      </div>
                    </div>

                    {/* Compact Nested Details */}
                    <div className="my-2.5 space-y-3.5 flex-1">
                      {/* Keyword tags */}
                      {item.keywords && item.keywords.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[8px] text-[#c4c7c8]/65 font-bold uppercase tracking-wider block">Keywords</span>
                          <div className="flex flex-wrap gap-1">
                            {item.keywords.map((kw, i) => (
                              <span key={i} className="px-1.5 py-0.2 bg-[#131313] border border-[#444748] rounded-sm text-[10px] text-[#e5e2e1] font-mono">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dynamic Action Lists */}
                      <div className="space-y-1">
                        <span className="text-[8px] text-[#c4c7c8]/65 font-bold uppercase tracking-wider block">
                          Actions ({item.actions.length})
                        </span>
                        <div className="space-y-1">
                          {item.actions.slice(0, 2).map((act, i) => (
                            <div key={i} className="text-[11px] text-[#c4c7c8] flex items-center gap-1.5 truncate">
                              <span className="w-1 h-1 rounded-full bg-[#B6B2FF] shrink-0" />
                              <span className="font-semibold text-[#B6B2FF] shrink-0">
                                {act.action_type === 'send_dm' ? 'DM' : act.action_type === 'reply_comment' ? 'Comment' : 'Story'}
                              </span>
                              <span className="text-[#c4c7c8]/50 font-mono text-[9px]">({act.dm_format || 'txt'})</span>
                              <span className="truncate italic text-[#c4c7c8]/90">"{act.messages[0]}"</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Operational Footer Buttons */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-[#444748]/60 mt-auto">
                      <Link
                        href={`/dashboard/automations?id=${item.id}`}
                        className="flex-1 py-1 px-2.5 bg-[#20201f] hover:bg-[#2a2a2a] border border-[#444748] rounded text-[11px] font-semibold text-[#e5e2e1] transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit className="w-3 h-3 text-[#c4c7c8]" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-1.5 bg-[#131313] hover:bg-rose-950/10 border border-[#444748] hover:border-rose-900/30 rounded text-[#e5e2e1] hover:text-rose-400 transition-colors flex items-center justify-center disabled:opacity-50"
                        title="Delete automation"
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
}