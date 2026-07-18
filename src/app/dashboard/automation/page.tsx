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
  ChevronRight,
  Edit3,
  CornerDownRight,
  AlertCircle,
  HelpCircle,
  Menu,
  Send
} from "lucide-react";
import api from "@/lib/services/api.service";
import Toast from "@/components/Toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

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

const getTriggerDetails = (item: any) => {
  const isWelcomeFlow = item.name === "Welcome Message Flow";
  const isPersistentMenu = item.name === "Persistent Menu Flow";

  if (isWelcomeFlow) {
    return {
      icon: <HelpCircle className="w-4 h-4 text-sky-400" />,
      label: "User Taps Icebreaker",
      desc: "Starts when a new user selects a preset question in your chat."
    };
  }
  if (isPersistentMenu) {
    return {
      icon: <Menu className="w-4 h-4 text-sky-400" />,
      label: "User Opens Menu",
      desc: "Triggered from options in the persistent chat menu."
    };
  }
  if (item.rule_type === "product_inquiry_comment" || item.rule_type === "comment_automation") {
    const hasKeywords = item.keywords && item.keywords.length > 0;
    return {
      icon: <MessageSquare className="w-4 h-4 text-purple-400" />,
      label: hasKeywords ? "Specific Comment" : "Any Comment",
      desc: hasKeywords
        ? `Comments containing: ${item.keywords.join(', ')}`
        : "Triggered by any comment on your post/reel."
    };
  }
  return {
    icon: <Send className="w-4 h-4 text-emerald-400" />,
    label: "Direct Message",
    desc: "Triggered via direct message interaction."
  };
};


export default function AutomationsDashboard() {
  const appUser = useSelector((state: RootState) => state.auth.user);
  const activeAccountId = appUser?.active_instagram_account_id;

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
  }, [activeAccountId]);

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

          <header className="sticky top-0 z-40 w-full backdrop-blur-md .bg-[#131313]/85 border-b border-[#444748]">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {automations.map((item) => {
                  const isSpecialFlow = item.name === "Welcome Message Flow" || item.name === "Persistent Menu Flow";
                  const trigger = getTriggerDetails(item);
                  const isActive = item.status === "active";

                  return (
                    <motion.div
                      key={item.id}
                      layoutId={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className={`bg-[#171717] border rounded-xl flex flex-col justify-between shadow-md overflow-hidden transition-all duration-200 ${isActive
                        ? "border-[#3e3e3e] hover:border-[#555555] shadow-black/40"
                        : "border-[#262626] opacity-80"
                        }`}
                    >
                      {/* Card Header */}
                      <div className="p-4 pb-3 border-b border-[#262626] bg-[#1a1a1a]/50">
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="space-y-1 min-w-0">
                            <h3 className="font-semibold text-sm text-[#e5e5e5] tracking-tight truncate leading-tight">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-medium text-[#a3a3a3] flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                                {isActive ? 'Active' : 'Paused'}
                              </span>
                              <span className="text-zinc-600">•</span>
                              <span className="text-[10px] font-medium text-[#a3a3a3]">
                                {item.count || 0} runs
                              </span>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <button
                            onClick={() => {
                              if (isSpecialFlow) {
                                setToast({
                                  message: "Status managed by Welcome Profile config. It cannot be disabled here.",
                                  type: "info",
                                  visible: true
                                });
                                return;
                              }
                              handleToggle(item.id, item.status);
                            }}
                            disabled={togglingId === item.id || isSpecialFlow}
                            className={`w-9 h-5 rounded-full p-0.5 transition-all relative flex items-center outline-none border ${isActive
                              ? "bg-white border-transparent"
                              : "bg-[#262626] border-[#3a3a3a]"
                              } ${isSpecialFlow ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full shadow-sm transform transition-transform duration-150 flex items-center justify-center ${isActive ? "translate-x-4 bg-[#171717]" : "translate-x-0 bg-[#a3a3a3]"
                              }`}>
                              {togglingId === item.id && (
                                <div className="w-2 h-2 border-2 border-t-transparent border-white rounded-full animate-spin" />
                              )}
                            </div>
                          </button>
                        </div>

                        {/* Automation Category Pills */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`px-2 py-0.5 text-[9px] font-semibold rounded-full border tracking-wide uppercase ${item.rule_type.includes('comment')
                            ? 'bg-purple-950/20 text-purple-300 border-purple-900/30'
                            : 'bg-emerald-950/20 text-emerald-300 border-emerald-900/30'
                            }`}>
                            {item.rule_type.replace(/_/g, ' ')}
                          </span>

                          {isSpecialFlow && (
                            <span className="px-2 py-0.5 text-[9px] font-semibold rounded-full border tracking-wide uppercase bg-sky-950/20 text-sky-300 border-sky-900/30 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Special Flow
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Functional Pipeline (If Trigger -> Then Action) */}
                      <div className="p-4 space-y-4 flex-1">
                        {/* 1. Trigger Block */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">When Triggered</span>
                          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#1c1c1c] border border-[#262626]">
                            <div className="p-1.5 rounded bg-zinc-800 shrink-0">
                              {trigger.icon}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-[#e5e5e5]">{trigger.label}</h4>
                              <p className="text-[11px] text-[#a3a3a3] mt-0.5 leading-snug line-clamp-2">
                                {trigger.desc}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 2. Actions List */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                            Response Actions ({item.actions.length})
                          </span>

                          <div className="space-y-2 relative pl-2 border-l border-[#2d2d2d]">
                            {item.actions.slice(0, 3).map((act, i) => {
                              const isDM = act.action_type === 'send_dm';
                              return (
                                <div key={i} className="flex items-start gap-2 text-xs relative">
                                  <CornerDownRight className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
                                  <div className="min-w-0 flex-1 bg-[#1e1e1e]/45 p-2 rounded border border-[#2d2d2d]/40">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded-sm uppercase ${isDM
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'bg-purple-500/10 text-purple-400'
                                        }`}>
                                        {isDM ? 'Direct Message' : 'Public Reply'}
                                      </span>
                                      {act.dm_format && (
                                        <span className="text-[10px] text-zinc-500 font-mono">({act.dm_format})</span>
                                      )}
                                    </div>

                                    {act.messages && act.messages.length > 0 && (
                                      <p className="text-[11px] text-[#cccccc] italic truncate">
                                        "{act.messages[0]}"
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                            {item.actions.length > 3 && (
                              <div className="text-[10px] text-zinc-500 italic pl-5">
                                + {item.actions.length - 3} more actions
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Info Note for Exceptional Flows */}
                        {isSpecialFlow && (
                          <div className="flex items-start gap-1.5 p-2 rounded bg-sky-950/10 border border-sky-900/20 text-[10px] text-sky-300">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>This experience is managed via the Welcome Profile settings page.</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons Footer */}
                      <div className="px-4 py-3 bg-[#1a1a1a]/40 border-t border-[#262626] flex items-center gap-2 mt-auto">
                        <a
                          href={`/dashboard/automations?id=${item.id}`}
                          className="flex-1 py-1.5 px-3 bg-[#222222] hover:bg-[#2c2c2c] border border-[#2e2e2e] rounded-lg text-xs font-semibold text-[#e5e5e5] transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Configure Flow</span>
                        </a>

                        <button
                          onClick={() => {
                            if (isSpecialFlow) {
                              const tabParam = item.name === "Welcome Message Flow" ? "icebreakers" : "persistent_menu";
                              window.location.href = `/dashboard/inbox/wellcome?open=${tabParam}`;
                              return;
                            }
                            handleDelete(item.id);
                          }}
                          disabled={deletingId === item.id}
                          className={`p-2 border rounded-lg transition-colors flex items-center justify-center ${isSpecialFlow
                            ? "bg-transparent hover:bg-rose-950/20 hover:border-rose-900/40 text-zinc-400 hover:text-rose-400 border-zinc-800/40 cursor-pointer"
                            : "bg-[#1c1c1c] border-[#2e2e2e] hover:bg-rose-950/20 hover:border-rose-900/40 text-zinc-400 hover:text-rose-400"
                            }`}
                          title={isSpecialFlow ? "Configure Settings in Welcome Profile" : "Delete Automation"}
                        >
                          {deletingId === item.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-t-transparent border-current rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
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