"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Brain, 
  Settings2, 
  MessageSquareCode, 
  Sparkles, 
  Save, 
  HelpCircle, 
  Upload, 
  FileText, 
  Trash2,
  AlertCircle
} from "lucide-react";
import Toast from "@/components/Toast";

export default function AISettingsPage() {
  const [tone, setTone] = useState("Friendly");
  const [autopilot, setAutopilot] = useState(true);
  const [delay, setDelay] = useState(15); // in seconds
  const [instructions, setInstructions] = useState(
    "You are a helpful and elegant sales assistant for AnyDM. Help users find product links and resolve checkout queries quickly, keeping your tone sophisticated yet approachable."
  );
  const [handoverThreshold, setHandoverThreshold] = useState(75);
  const [files, setFiles] = useState([
    { name: "serene_quartz_catalog_specifications.pdf", size: "1.2 MB", uploaded: "3d ago" },
    { name: "hyperboost_running_core_support_faq.docx", size: "340 KB", uploaded: "1w ago" }
  ]);
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" as "success" | "error" | "info" });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("AI configuration saved successfully!", "success");
  };

  const handleDeleteFile = (fileName: string) => {
    setFiles(files.filter(f => f.name !== fileName));
    showToast(`${fileName} removed from knowledge base.`, "info");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-white">psychology</span>
            <span>AI Sales Core Settings</span>
          </h1>
          <p className="text-xs text-[#c4c7c8]/60 mt-1">Configure prompt directives, delay schedules, autopilot settings, and context manuals.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-white text-black px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:bg-[#eaeaea] hover:scale-[1.01] active:scale-95 transition-all text-xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Directives & Autopilot */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Agent Directives */}
          <div className="glass-pane p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-white" />
              <span>AI System Directives</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#c4c7c8]/80 mb-2">Tone of Voice</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["Friendly", "Professional", "Bold / Witty", "Clinical"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={cn(
                        "py-2 px-3 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer",
                        tone === t
                          ? "bg-white text-black border-white"
                          : "bg-[#1c1b1b] border-white/10 text-[#c4c7c8] hover:border-white/20 hover:text-white"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#c4c7c8]/80">System Instructions</label>
                  <span className="text-[10px] text-[#c4c7c8]/40 font-mono">{instructions.length} chars</span>
                </div>
                <textarea
                  rows={4}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-2.5 px-4 text-xs text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all font-mono"
                />
              </div>
            </div>
          </div>

          {/* Autopilot and Response Latency */}
          <div className="glass-pane p-6 rounded-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Autopilot Mode</span>
                </h3>
                <p className="text-[11px] text-[#c4c7c8]/60 max-w-sm">When active, the AI directly handles storefront transactions and client messages without manual queue authorization.</p>
              </div>
              <input
                type="checkbox"
                checked={autopilot}
                onChange={(e) => setAutopilot(e.target.checked)}
                className="w-10 h-6 bg-[#1c1b1b] border-white/10 checked:bg-white text-black rounded-full accent-white cursor-pointer"
              />
            </div>

            <div className="border-t border-white/5 pt-4 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#c4c7c8]/80">Human Handover Threshold</label>
                  <span className="text-xs font-bold text-white">{handoverThreshold}% confidence</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={handoverThreshold}
                  onChange={(e) => setHandoverThreshold(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#1c1b1b] rounded-lg appearance-none cursor-pointer accent-white"
                />
                <p className="text-[10px] text-[#c4c7c8]/40 mt-2">If confidence matches or falls below this percentage, the lead is automatically flagged in your Inbox queue for human resolution.</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#c4c7c8]/80">Typing Response Latency</label>
                  <span className="text-xs font-bold text-white">{delay} seconds</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="60"
                  value={delay}
                  onChange={(e) => setDelay(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#1c1b1b] rounded-lg appearance-none cursor-pointer accent-white"
                />
                <p className="text-[10px] text-[#c4c7c8]/40 mt-2">Delay autopilot responses by this duration. Natural latency mimics human typing patterns to maintain consumer trust.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Knowledge Base files upload */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-pane p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquareCode className="w-4 h-4 text-white" />
              <span>Knowledge Base</span>
            </h3>
            <p className="text-[11px] text-[#c4c7c8]/60 leading-relaxed">
              Upload spreadsheets, catalogs, or business PDFs. The AI references these resources dynamically to handle specs queries.
            </p>

            <div className="border border-dashed border-white/10 rounded-xl p-6 text-center hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer">
              <Upload className="w-6 h-6 text-white/40 mx-auto mb-2 animate-bounce" />
              <p className="text-[11px] font-bold text-white">Upload Manual Files</p>
              <p className="text-[9px] text-[#c4c7c8]/40 mt-1">PDF, DOCX, or CSV (max 10MB)</p>
            </div>

            <div className="space-y-2.5 pt-2">
              {files.map((file) => (
                <div key={file.name} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-white/40 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-bold text-white truncate">{file.name}</p>
                      <p className="text-[9px] text-[#c4c7c8]/40 mt-0.5">{file.size} • {file.uploaded}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteFile(file.name)}
                    className="p-1.5 hover:bg-white/10 rounded text-[#c4c7c8] hover:text-red-400 transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white/5 flex items-start space-x-3 border border-white/5">
            <AlertCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[11px] font-bold text-white mb-1">Autopilot Warning</h4>
              <p className="text-[10px] text-[#c4c7c8]/60 leading-relaxed">
                Ensure your product catalogs are synced and your support manuals are up-to-date before turning Autopilot on.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </motion.div>
  );
}
