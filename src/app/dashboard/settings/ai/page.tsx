"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Brain, 
  Settings2, 
  MessageSquareCode, 
  Sparkles, 
  Save, 
  HelpCircle, 
  Plus, 
  Trash2,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  MapPin,
  Truck,
  Phone,
  Store,
  Layers,
  BookOpen
} from "lucide-react";
import Toast from "@/components/Toast";
import api from "@/lib/services/api.service";

export default function AISettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isAiModeOn, setIsAiModeOn] = useState(false);
  const [customInstructions, setCustomInstructions] = useState("");
  const [responseStyle, setResponseStyle] = useState("Friendly");
  const [maxReplyLength, setMaxReplyLength] = useState(150);
  const [maxReplyCount, setMaxReplyCount] = useState(50);
  
  // Business details
  const [businessName, setBusinessName] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [contactDetails, setContactDetails] = useState("");
  const [productsAndServices, setProductsAndServices] = useState("");
  
  // FAQ and Quick Replies
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  
  // Local state for builders
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");
  const [newQuickReply, setNewQuickReply] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" as "success" | "error" | "info" });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/crm/ai-settings/");
        if (res.data) {
          setApiKey(res.data.api_key || "");
          setIsAiModeOn(res.data.is_ai_mode_on || false);
          setCustomInstructions(res.data.custom_instructions || "");
          setResponseStyle(res.data.response_style || "Friendly");
          setMaxReplyLength(res.data.max_reply_length || 150);
          setMaxReplyCount(res.data.max_reply_count || 50);
          setBusinessName(res.data.business_name || "");
          setBusinessLocation(res.data.business_location || "");
          setWorkingHours(res.data.working_hours || "");
          setDeliveryTime(res.data.delivery_time || "");
          setContactDetails(res.data.contact_details || "");
          setProductsAndServices(res.data.products_and_services || "");
          setFaqs(res.data.faqs || []);
          setQuickReplies(res.data.quick_replies || []);
        }
      } catch (err) {
        console.error("Error fetching AI settings:", err);
        showToast("Failed to load AI configuration.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/crm/ai-settings/", {
        api_key: apiKey,
        is_ai_mode_on: isAiModeOn,
        custom_instructions: customInstructions,
        response_style: responseStyle,
        max_reply_length: maxReplyLength,
        max_reply_count: maxReplyCount,
        business_name: businessName,
        business_location: businessLocation,
        working_hours: workingHours,
        delivery_time: deliveryTime,
        contact_details: contactDetails,
        products_and_services: productsAndServices,
        faqs,
        quick_replies: quickReplies
      });
      setIsAiModeOn(res.data.is_ai_mode_on);
      showToast("AI Assistant settings saved successfully!", "success");
    } catch (err) {
      console.error("Error saving AI settings:", err);
      showToast("Failed to save AI configuration.", "error");
    }
  };

  const handleAddFaq = () => {
    if (!newFaqQ.strip() || !newFaqA.strip()) {
      showToast("Please enter both question and answer.", "error");
      return;
    }
    setFaqs([...faqs, { question: newFaqQ.trim(), answer: newFaqA.trim() }]);
    setNewFaqQ("");
    setNewFaqA("");
    showToast("FAQ added.", "success");
  };

  const handleDeleteFaq = (index: number) => {
    setFaqs(faqs.filter((_, idx) => idx !== index));
    showToast("FAQ removed.", "info");
  };

  const handleAddQuickReply = () => {
    if (!newQuickReply.strip()) return;
    if (quickReplies.includes(newQuickReply.trim())) {
      showToast("Quick reply already exists.", "error");
      return;
    }
    setQuickReplies([...quickReplies, newQuickReply.trim()]);
    setNewQuickReply("");
    showToast("Quick reply pill added.", "success");
  };

  const handleDeleteQuickReply = (pill: string) => {
    setQuickReplies(quickReplies.filter(p => p !== pill));
    showToast("Quick reply pill removed.", "info");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="animate-spin w-8 h-8 border-4 border-white/20 border-t-white rounded-full"></div>
        <span className="text-xs font-semibold text-white/50 tracking-wider">LOADING CONFIGURATION...</span>
      </div>
    );
  }

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
            <span>AI Support Agent Core</span>
          </h1>
          <p className="text-xs text-[#c4c7c8]/60 mt-1">Configure your automated customer support employee, access databases, and customize replies.</p>
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
          
          {/* AI Credentials & Autopilot */}
          <div className="glass-pane p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-[#B6B2FF]" />
              <span>AI Access & Activation</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#c4c7c8]/80 mb-2">Gemini API Token</label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    placeholder="Enter your Gemini API key (e.g., AIzaSy...)"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-2.5 pl-4 pr-10 text-xs text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-2.5 text-[#c4c7c8]/50 hover:text-white transition-colors"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#c4c7c8]/40 mt-1">Provided directly to run the support AI. Disables automatically if invalid or quota limit exceeded.</p>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8FE3FF]" />
                    <span>Enable AI Autopilot Mode</span>
                  </span>
                  <p className="text-[10px] text-[#c4c7c8]/50 max-w-sm">When active, the AI manages support conversations automatically using your settings.</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const nextVal = !isAiModeOn;
                    setIsAiModeOn(nextVal);
                    try {
                      await api.post("/crm/ai-settings/toggle-global/", { is_ai_mode_on: nextVal });
                      showToast(`AI Autopilot Mode turned ${nextVal ? "ON" : "OFF"}.`, "success");
                    } catch (err) {
                      console.error("Failed to toggle global AI mode:", err);
                      showToast("Failed to update AI mode.", "error");
                    }
                  }}
                  className={cn(
                    "w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer relative shrink-0",
                    isAiModeOn ? "bg-[#B6B2FF]" : "bg-white/10 border border-white/5"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full transition-transform duration-200 shadow",
                      isAiModeOn ? "translate-x-5 bg-black" : "translate-x-0 bg-white/70"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Agent Directives & Personality */}
          <div className="glass-pane p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#B6B2FF]" />
              <span>AI Agent Personality</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#c4c7c8]/80 mb-2">Tone of Voice</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["Friendly", "Professional", "Casual / Approachable", "Formal"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setResponseStyle(t)}
                      className={cn(
                        "py-2 px-3 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer",
                        responseStyle === t
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#c4c7c8]/80">Custom Instructions</label>
                  <span className="text-[10px] text-[#c4c7c8]/40 font-mono">{customInstructions.length} chars</span>
                </div>
                <textarea
                  rows={4}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Define how the AI employee should act, rules to follow, greeting style, etc."
                  className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-2.5 px-4 text-xs text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#c4c7c8]/80">Max Word Limit</label>
                    <span className="text-xs font-bold text-white">{maxReplyLength} words</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="10"
                    value={maxReplyLength}
                    onChange={(e) => setMaxReplyLength(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#1c1b1b] rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#c4c7c8]/80">Max Replies / Chat</label>
                    <span className="text-xs font-bold text-white">{maxReplyCount} msgs</span>
                  </div>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={maxReplyCount}
                    onChange={(e) => setMaxReplyCount(parseInt(e.target.value) || 20)}
                    className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-1 px-3 text-xs text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive FAQ Builder */}
          <div className="glass-pane p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#B6B2FF]" />
              <span>Interactive FAQs (Frequently Asked Questions)</span>
            </h3>
            <p className="text-[11px] text-[#c4c7c8]/60">Input common customer questions and exact answers. The AI will prioritize referencing these.</p>

            <div className="space-y-3 bg-[#111111]/50 p-4 rounded-xl border border-white/5">
              <input
                type="text"
                placeholder="Question (e.g., Do you offer refunds?)"
                value={newFaqQ}
                onChange={(e) => setNewFaqQ(e.target.value)}
                className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
              />
              <textarea
                rows={2}
                placeholder="Answer (e.g., Yes, we offer full refunds within 14 days of purchase...)"
                value={newFaqA}
                onChange={(e) => setNewFaqA(e.target.value)}
                className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
              />
              <button
                type="button"
                onClick={handleAddFaq}
                className="bg-white text-black text-xs font-bold py-1.5 px-4 rounded-lg flex items-center justify-center gap-1.5 ml-auto hover:bg-[#eaeaea] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add FAQ</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {faqs.length === 0 ? (
                <p className="text-[10px] text-white/30 text-center py-4">No FAQs added yet. Add some above to feed your AI.</p>
              ) : (
                faqs.map((faq, index) => (
                  <div key={index} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-white">Q: {faq.question}</p>
                      <p className="text-[10px] text-[#c4c7c8]/80">A: {faq.answer}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(index)}
                      className="text-[#c4c7c8]/50 hover:text-red-400 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Business Profile Data */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Business settings */}
          <div className="glass-pane p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-[#B6B2FF]" />
              <span>Business Profile</span>
            </h3>
            <p className="text-[11px] text-[#c4c7c8]/60 leading-relaxed">
              Define static store data. The AI assistant retrieves this secure data to formulate correct custom answers.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c4c7c8]/70 mb-1 flex items-center gap-1.5">
                  <Store className="w-3 h-3 text-[#B6B2FF]" />
                  <span>Business Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Serene Quartz Jewels"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c4c7c8]/70 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#B6B2FF]" />
                  <span>Working Hours</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Mon - Fri: 9AM - 6PM"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c4c7c8]/70 mb-1 flex items-center gap-1.5">
                  <Truck className="w-3 h-3 text-[#B6B2FF]" />
                  <span>Delivery Time</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2-3 Business Days"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c4c7c8]/70 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-[#B6B2FF]" />
                  <span>Contact Details</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Email: support@serene.com, Phone: +123 456 789"
                  value={contactDetails}
                  onChange={(e) => setContactDetails(e.target.value)}
                  className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c4c7c8]/70 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#B6B2FF]" />
                  <span>Store Location</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., 5th Avenue, Suite 400, New York, NY"
                  value={businessLocation}
                  onChange={(e) => setBusinessLocation(e.target.value)}
                  className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c4c7c8]/70 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-[#B6B2FF]" />
                  <span>Products & Services Description</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your products/services in detail so the AI can answer matching specs..."
                  value={productsAndServices}
                  onChange={(e) => setProductsAndServices(e.target.value)}
                  className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                />
              </div>
            </div>
          </div>


          {/* Autopilot security rules info */}
          <div className="p-5 rounded-xl bg-white/5 flex items-start space-x-3 border border-white/5">
            <AlertCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[11px] font-bold text-white mb-1">Global System Safety Rules</h4>
              <p className="text-[9px] text-[#c4c7c8]/60 leading-relaxed">
                The core prompt prevents the AI employee from performing unauthorized actions, leaking credentials, or exposing private details, complying with strict company privacy guidelines.
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
