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
  Pause, 
  TrendingUp, 
  CheckCircle2, 
  MessageSquare, 
  AlertTriangle,
  ArrowRight,
  Loader2,
  RefreshCw
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
      // Bypass cache to get fresh execution counts and statuses
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
          message: `Automation ${nextEnabled ? "activated" : "paused"} successfully.`,
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

  // Compute analytics
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

  const getRuleTypeGlow = (type: string) => {
    if (type.includes("comment")) return "border-[#8FE3FF]/20 text-[#8FE3FF]";
    if (type.includes("story")) return "border-[#F472B6]/20 text-[#F472B6]";
    return "border-[#C084FC]/20 text-[#C084FC]";
  };

  return (
    <div className="min-h-screen bg-[#0F1011] text-white p-6 lg:p-10 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <span>Instagram Automations</span>
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          </h1>
          <p className="text-sm text-[#c4c7c8]/60 mt-1 max-w-xl">
            Build and manage powerful workflows to reply to comments, trigger story actions, and automate DMs using the Meta Instagram API.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchAutomations()}
            disabled={loading}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all flex items-center justify-center cursor-pointer text-[#c4c7c8] hover:text-white"
            title="Refresh automations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link 
            href="/dashboard/automations"
            className="py-3 px-6 bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all duration-300 flex items-center gap-2 cursor-pointer border border-indigo-400/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Workflow</span>
          </Link>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10 relative z-10">
        {[
          { title: "Total Executions", value: totalTriggers, desc: "Successful trigger runs", icon: Zap, color: "text-[#FAC775]" },
          { title: "Active Workflows", value: activeCount, desc: "Currently running rules", icon: Play, color: "text-[#34D399]" },
          { title: "Total Workflows", value: automations.length, desc: "Saved automation rules", icon: MessageSquare, color: "text-[#8FE3FF]" },
          { title: "Top Trigger Type", value: mostCommonType ? formatRuleType(mostCommonType) : "N/A", desc: "Most popular workflow", icon: TrendingUp, color: "text-[#C084FC]" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-[#161618]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-xl flex items-center justify-between group hover:border-white/10 transition-all">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#c4c7c8]/40 uppercase tracking-wider block">{stat.title}</span>
                <span className="text-2xl font-extrabold text-white tracking-tight block">{stat.value}</span>
                <span className="text-xs text-[#c4c7c8]/40 block">{stat.desc}</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Workflows Listing */}
      <div className="relative z-10">
        <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <span>Active Workflows</span>
          <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-xs text-[#c4c7c8]/60 font-mono">
            {automations.length}
          </span>
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-60 bg-[#161618]/30 border border-white/5 rounded-2xl animate-pulse flex flex-col justify-between p-6">
                <div className="space-y-3">
                  <div className="h-5 bg-white/5 rounded w-2/3" />
                  <div className="h-4 bg-white/5 rounded w-1/3" />
                </div>
                <div className="h-10 bg-white/5 rounded w-full mt-auto" />
              </div>
            ))}
          </div>
        ) : automations.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center p-12 bg-[#161618]/30 border border-white/5 rounded-2xl backdrop-blur-xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Automations Created</h3>
            <p className="text-sm text-[#c4c7c8]/60 max-w-sm mb-6">
              You haven't built any workflows yet. Open the visual builder to create your first Instagram trigger automation.
            </p>
            <Link 
              href="/dashboard/automations"
              className="py-3 px-6 bg-white hover:bg-[#e4e4e4] text-black rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Build Your First Flow</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {automations.map((item) => (
                <motion.div
                  key={item.id}
                  layoutId={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-[#161618]/60 border backdrop-blur-xl rounded-2xl p-6 flex flex-col justify-between shadow-lg relative group transition-all hover:translate-y-[-2px] ${
                    item.status === "active" 
                      ? "border-indigo-500/20 shadow-indigo-500/5 hover:border-indigo-500/30" 
                      : "border-white/5 hover:border-white/15"
                  }`}
                >
                  {/* Card Header */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-bold text-[16px] text-white leading-snug tracking-tight truncate group-hover:text-indigo-300 transition-colors">
                        {item.name}
                      </h3>
                      
                      {/* Active Status Toggle */}
                      <button
                        onClick={() => handleToggle(item.id, item.status)}
                        disabled={togglingId === item.id}
                        className={`w-10 h-6 rounded-full p-0.5 transition-colors relative flex items-center cursor-pointer outline-none border-0 ${
                          item.status === "active" ? "bg-indigo-500" : "bg-white/10"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                          item.status === "active" ? "translate-x-4" : "translate-x-0"
                        } flex items-center justify-center`}>
                          {togglingId === item.id && (
                            <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
                          )}
                        </div>
                      </button>
                    </div>

                    {/* Trigger Type Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border bg-white/5 ${getRuleTypeGlow(item.rule_type)}`}>
                        {formatRuleType(item.rule_type)}
                      </span>
                      <span className="text-[11px] text-[#c4c7c8]/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#34D399]" />
                        {item.count} runs
                      </span>
                    </div>
                  </div>

                  {/* Keywords & Actions Info */}
                  <div className="my-6 space-y-3 flex-1">
                    {item.keywords && item.keywords.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] text-[#c4c7c8]/40 font-bold uppercase tracking-wider">Keywords</span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.keywords.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 bg-[#202022] border border-white/5 rounded-md text-xs text-[#c4c7c8] font-medium">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <span className="text-[11px] text-[#c4c7c8]/40 font-bold uppercase tracking-wider">Actions ({item.actions.length})</span>
                      <div className="space-y-1">
                        {item.actions.slice(0, 2).map((act, i) => (
                          <div key={i} className="text-xs text-[#c4c7c8]/80 flex items-center gap-1.5 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                            <span className="font-semibold text-indigo-300 shrink-0">{act.action_type === 'send_dm' ? 'Send DM' : act.action_type === 'reply_comment' ? 'Reply Comment' : 'Reply Story'}</span>
                            <span className="text-[#c4c7c8]/40">({act.dm_format || 'text'})</span>
                            <span className="truncate">"{act.messages[0]}"</span>
                          </div>
                        ))}
                        {item.actions.length > 2 && (
                          <span className="text-[10px] text-[#c4c7c8]/40 block pl-3">
                            + {item.actions.length - 2} more actions
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="flex items-center gap-2 pt-4 border-t border-white/5 mt-auto">
                    <Link
                      href={`/dashboard/automations?id=${item.id}`}
                      className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Flow</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 rounded-xl text-rose-400 transition-all flex items-center justify-center cursor-pointer"
                      title="Delete automation"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
