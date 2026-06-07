"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Globe, 
  Upload, 
  Check, 
  RefreshCw, 
  Layout, 
  Eye, 
  Sliders, 
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Smartphone,
  Laptop,
  Save,
  Lock,
  MessageSquare,
  Palette
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import api from "@/lib/services/api.service";
import Toast from "@/components/Toast";
import { cn } from "@/lib/utils";
import { getTemplateStyles, TemplateStyle } from "@/components/templates/TemplateProvider";

interface TemplateTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    background: string;
    accent: string;
  };
}

interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  defaultThemeId: string;
  themes: TemplateTheme[];
}

const TEMPLATE_PRESETS: TemplateConfig[] = [
  {
    id: "glass_monochrome",
    name: "Glass Monochrome",
    description: "Translucent frosted-glass panels with glowing neon accents.",
    defaultThemeId: "dark",
    themes: [
      { id: "dark", name: "Deep Charcoal (Dark)", colors: { primary: "#ffffff", background: "#131313", accent: "#c4c0ff" } },
      { id: "light", name: "Frosted Paper (Light)", colors: { primary: "#131313", background: "#f5f5f5", accent: "#605ca2" } },
      { id: "frosted", name: "Ice Blue (Translucent)", colors: { primary: "#ffffff", background: "#0a1128", accent: "#8fe3ff" } }
    ]
  },
  {
    id: "organic_minimalist",
    name: "Organic Minimalist",
    description: "Serene palettes, soft curves, and natural editorial vibe.",
    defaultThemeId: "warm_beige",
    themes: [
      { id: "warm_beige", name: "Warm Beige", colors: { primary: "#2c2520", background: "#fcf9f5", accent: "#d4a373" } },
      { id: "soft_sage", name: "Soft Sage", colors: { primary: "#2a342a", background: "#f1f3f0", accent: "#a3b19b" } },
      { id: "pure_white", name: "Pure White", colors: { primary: "#111111", background: "#ffffff", accent: "#5e5e5e" } }
    ]
  },
  {
    id: "cyber_neon_dark",
    name: "Cyber-Neon Dark",
    description: "Stark dark backdrop with vibrant glowing borders.",
    defaultThemeId: "cyberpunk_neon",
    themes: [
      { id: "cyberpunk_neon", name: "Cyberpunk Pink/Cyan", colors: { primary: "#39ff14", background: "#050508", accent: "#ff007f" } },
      { id: "synthwave_sunset", name: "Synthwave Purple", colors: { primary: "#ff8c00", background: "#0f051d", accent: "#9b5de5" } },
      { id: "matrix_green", name: "Matrix Green", colors: { primary: "#00ff00", background: "#000000", accent: "#003300" } }
    ]
  },
  {
    id: "monochrome_precision",
    name: "Monochrome Precision",
    description: "Stark interfaces with hairline borders and high cognitive speed.",
    defaultThemeId: "ink_black",
    themes: [
      { id: "ink_black", name: "Ink Black", colors: { primary: "#ffffff", background: "#000000", accent: "#555555" } },
      { id: "paper_white", name: "Paper White", colors: { primary: "#000000", background: "#ffffff", accent: "#cccccc" } },
      { id: "cool_gray", name: "Cool Gray", colors: { primary: "#111111", background: "#f8f9fa", accent: "#888888" } }
    ]
  }
];

export default function WebsiteSettingsPage() {
  const router = useRouter();

  // Redux connected user & Instagram context
  const appUser = useSelector((state: RootState) => state.auth.user);
  const instagramAccounts = useSelector((state: RootState) => state.auth.instagramAccounts);
  const activeAccount = instagramAccounts.find(acc => acc.id === appUser?.active_instagram_account_id) || instagramAccounts[0];

  // Component states
  const [storeName, setStoreName] = useState("");
  const [storeLogo, setStoreLogo] = useState("");
  const [showRelatedProducts, setShowRelatedProducts] = useState(true);
  const [enableInstagramButton, setEnableInstagramButton] = useState(true);
  const [enableWhatsAppButton, setEnableWhatsAppButton] = useState(true);
  const [templateId, setTemplateId] = useState("monochrome_precision");
  const [themeId, setThemeId] = useState("ink_black");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Live Preview layout state
  const [previewMode, setPreviewMode] = useState<"catalog" | "pdp">("pdp");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Toast States
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  const logoInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    if (activeAccount) {
      loadWebsiteSettings();
    }
  }, [activeAccount]);

  const loadWebsiteSettings = async () => {
    setInitialLoading(true);
    try {
      const response = await api.get("/accounts/website-settings/");
      if (response.data) {
        const d = response.data;
        setStoreName(d.store_name || "");
        setStoreLogo(d.store_logo || "");
        setShowRelatedProducts(d.show_related_products ?? true);
        setEnableInstagramButton(d.enable_instagram_button ?? true);
        setEnableWhatsAppButton(d.enable_whatsapp_button ?? true);
        setTemplateId(d.template_id || "monochrome_precision");
        setThemeId(d.theme_id || "ink_black");
      }
    } catch (e) {
      console.error("Failed to fetch settings from backend:", e);
      showToast("Using local storefront configs.", "info");
      setStoreName(activeAccount?.full_name || activeAccount?.username || "Elena Rossi");
      setStoreLogo(activeAccount?.profile_picture_url || "");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    const payload = {
      store_name: storeName,
      store_logo: storeLogo,
      show_related_products: showRelatedProducts,
      enable_instagram_button: enableInstagramButton,
      enable_whatsapp_button: enableWhatsAppButton,
      template_id: templateId,
      theme_id: themeId,
    };

    try {
      await api.put("/accounts/website-settings/", payload);
      showToast("Store settings saved successfully!", "success");
    } catch (err) {
      console.error("Save failed:", err);
      showToast("Failed to save settings to server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const performLogoUpload = (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "any_dm_product_upload");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.cloudinary.com/v1_1/dx5bqewfx/auto/upload", true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          setStoreLogo(response.secure_url);
          showToast("Logo uploaded successfully!", "success");
        } catch (e) {
          showToast("Failed to process uploaded logo", "error");
        }
      } else {
        showToast("Upload failed", "error");
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      showToast("Network error during upload", "error");
    };

    xhr.send(formData);
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      performLogoUpload(files[0]);
    }
  };

  const handleTemplateChange = (id: string) => {
    setTemplateId(id);
    const tmpl = TEMPLATE_PRESETS.find(t => t.id === id);
    if (tmpl) {
      setThemeId(tmpl.defaultThemeId);
    }
  };

  const selectedTemplate = TEMPLATE_PRESETS.find(t => t.id === templateId) || TEMPLATE_PRESETS[0];
  const storefrontUrl = typeof window !== 'undefined' ? `${window.location.origin}/${activeAccount?.username}` : `/${activeAccount?.username}`;
  const previewStyles: TemplateStyle = getTemplateStyles(templateId, themeId);

  return (
    <div className="w-full space-y-6 text-white pb-16">
      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        type={toastType}
        onClose={() => setToastVisible(false)}
      />

      {/* Header Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
            <span>Products</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
            <span className="text-white font-medium">Website Storefront Settings</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
            Website Configuration
            <Globe className="w-6 h-6 text-indigo-400" />
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={storefrontUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg border border-white/10 text-white font-semibold hover:bg-white/5 transition-all text-xs flex items-center gap-1.5 bg-white/5"
          >
            <Eye className="w-4 h-4" />
            Preview Live Store
          </a>
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-white text-black font-bold hover:bg-[#eaeaea] transition-all disabled:opacity-50 text-xs flex items-center gap-1.5"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {initialLoading ? (
        <div className="py-20 text-center text-gray-500 font-medium">
          <RefreshCw className="w-10 h-10 animate-spin text-white mx-auto mb-4" />
          Loading storefront settings...
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column (Settings) */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            
            {/* Supplier Branding */}
            <section className="bg-white/[0.03] border border-white/5 backdrop-blur-xl rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-4 h-4 text-white" />
                <h2 className="uppercase text-[11px] tracking-widest font-black text-white">Supplier Branding</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] text-gray-400 mb-2 block uppercase tracking-wider font-bold">STORE NAME</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-white transition-colors"
                    placeholder="Enter store name"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 mb-2 block uppercase tracking-wider font-bold">STORE LOGO</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center p-2 shrink-0">
                      {storeLogo ? (
                        <img alt="Store Logo Preview" className="w-full h-full object-contain rounded-full" src={storeLogo} />
                      ) : (
                        <ShoppingBag className="w-8 h-8 text-gray-600" />
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        className="bg-white text-black hover:bg-[#eaeaea] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        Upload Logo
                      </button>
                      {storeLogo && (
                        <button
                          onClick={() => setStoreLogo("")}
                          className="border border-white/10 px-4 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={handleLogoFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <p className="text-gray-500 text-[10px] mt-2">Supports JPG, PNG formats. Best aspect ratio: 1:1 square.</p>
                </div>
              </div>
            </section>

            {/* Website Appearance Template */}
            <section className="bg-white/[0.03] border border-white/5 backdrop-blur-xl rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Layout className="w-4 h-4 text-white" />
                <h2 className="uppercase text-[11px] tracking-widest font-black text-white">Website Appearance Template</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Glass Monochrome */}
                <div
                  onClick={() => handleTemplateChange("glass_monochrome")}
                  className={cn(
                    "rounded-lg p-4 cursor-pointer transition-all bg-white/[0.01] flex flex-col justify-between",
                    templateId === "glass_monochrome" 
                      ? "border-2 border-white shadow-lg shadow-black/50" 
                      : "border border-white/5 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold">Glass Monochrome</span>
                    {templateId === "glass_monochrome" ? (
                      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-black stroke-[3px]" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-white/20"></div>
                    )}
                  </div>
                  <div className="h-20 bg-white/5 rounded-md mb-2 overflow-hidden relative border border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded border border-white/20 shadow-sm"></div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-normal">Translucent frosted-glass panels with glowing neon accents.</p>
                </div>

                {/* Organic Minimalist */}
                <div
                  onClick={() => handleTemplateChange("organic_minimalist")}
                  className={cn(
                    "rounded-lg p-4 cursor-pointer transition-all bg-white/[0.01] flex flex-col justify-between",
                    templateId === "organic_minimalist" 
                      ? "border-2 border-white shadow-lg shadow-black/50" 
                      : "border border-white/5 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold">Organic Minimalist</span>
                    {templateId === "organic_minimalist" ? (
                      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-black stroke-[3px]" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-white/20"></div>
                    )}
                  </div>
                  <div className="h-20 bg-stone-900 rounded-md mb-2 overflow-hidden relative border border-stone-800">
                    <div className="absolute inset-0 bg-[#1a1918] flex items-center justify-center p-2">
                      <div className="w-full h-full border border-stone-800 rounded-sm"></div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-normal">Serene palettes, soft curves, and natural editorial vibe.</p>
                </div>

                {/* Cyber-Neon Dark */}
                <div
                  onClick={() => handleTemplateChange("cyber_neon_dark")}
                  className={cn(
                    "rounded-lg p-4 cursor-pointer transition-all bg-white/[0.01] flex flex-col justify-between",
                    templateId === "cyber_neon_dark" 
                      ? "border-2 border-white shadow-lg shadow-black/50" 
                      : "border border-white/5 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold">Cyber-Neon Dark</span>
                    {templateId === "cyber_neon_dark" ? (
                      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-black stroke-[3px]" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-white/20"></div>
                    )}
                  </div>
                  <div className="h-20 bg-black rounded-md mb-2 overflow-hidden relative border border-white/5">
                    <div className="absolute inset-0 bg-zinc-950 flex flex-col justify-center gap-1 p-2">
                      <div className="h-1 w-full bg-emerald-500/20 blur-[1px]"></div>
                      <div className="h-1 w-2/3 bg-emerald-500/20 blur-[1px]"></div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-normal">Stark dark backdrop with vibrant glowing borders.</p>
                </div>

                {/* Monochrome Precision */}
                <div
                  onClick={() => handleTemplateChange("monochrome_precision")}
                  className={cn(
                    "rounded-lg p-4 cursor-pointer transition-all bg-white/[0.01] flex flex-col justify-between",
                    templateId === "monochrome_precision" 
                      ? "border-2 border-white shadow-lg shadow-black/50" 
                      : "border border-white/5 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold">Monochrome Precision</span>
                    {templateId === "monochrome_precision" ? (
                      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-black stroke-[3px]" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-white/20"></div>
                    )}
                  </div>
                  <div className="h-20 bg-black rounded-md mb-2 overflow-hidden border border-white/10 relative">
                    <div className="absolute inset-0 flex flex-col p-2 gap-1.5">
                      <div className="h-3 w-1/2 bg-white"></div>
                      <div className="flex gap-1">
                        <div className="h-10 flex-1 bg-zinc-900 border border-zinc-800"></div>
                        <div className="h-10 flex-1 bg-zinc-900 border border-zinc-800"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-normal">Stark interfaces with hairline borders and high cognitive speed.</p>
                </div>

              </div>
            </section>

            {/* Theme Palette */}
            <section className="bg-white/[0.03] border border-white/5 backdrop-blur-xl rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Palette className="w-4 h-4 text-white" />
                <h2 className="uppercase text-[11px] tracking-widest font-black text-white">Theme Palette</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-400 text-xs">Choose a color variation for your selected template <b>{selectedTemplate?.name}</b>:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedTemplate?.themes.map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => setThemeId(theme.id)}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 bg-white/[0.01]",
                        themeId === theme.id 
                          ? "border-2 border-white shadow-lg shadow-black/50" 
                          : "border border-white/5 hover:border-white/20"
                      )}
                    >
                      <div
                        className="w-7 h-7 rounded-full border border-white/10 shrink-0 flex items-center justify-center overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors.accent} 0%, ${theme.colors.primary} 50%, ${theme.colors.background} 100%)`
                        }}
                      />
                      <div className="overflow-hidden">
                        <p className="text-[11px] font-bold text-white truncate">{theme.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Functionality Settings */}
            <section className="bg-white/[0.03] border border-white/5 backdrop-blur-xl rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Sliders className="w-4 h-4 text-white" />
                <h2 className="uppercase text-[11px] tracking-widest font-black text-white">Functionality Settings</h2>
              </div>
              <div className="divide-y divide-white/5">
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h4 className="text-xs font-bold text-white">Show Related Products</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Display other catalog items at the bottom of the PDP.</p>
                  </div>
                  <button
                    onClick={() => setShowRelatedProducts(!showRelatedProducts)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      showRelatedProducts ? "bg-white" : "bg-white/10"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-200 ease-in-out",
                        showRelatedProducts ? "translate-x-4 bg-black" : "translate-x-0 bg-gray-500"
                      )}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h4 className="text-xs font-bold text-white">Enable Instagram Checkout</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Direct traffic to Instagram for transaction processing.</p>
                  </div>
                  <button
                    onClick={() => setEnableInstagramButton(!enableInstagramButton)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      enableInstagramButton ? "bg-white" : "bg-white/10"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-200 ease-in-out",
                        enableInstagramButton ? "translate-x-4 bg-black" : "translate-x-0 bg-gray-500"
                      )}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h4 className="text-xs font-bold text-white">Enable WhatsApp Redirection</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Allows customers to inquire or order via WhatsApp.</p>
                  </div>
                  <button
                    onClick={() => setEnableWhatsAppButton(!enableWhatsAppButton)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      enableWhatsAppButton ? "bg-white" : "bg-white/10"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-200 ease-in-out",
                        enableWhatsAppButton ? "translate-x-4 bg-black" : "translate-x-0 bg-gray-500"
                      )}
                    />
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column (Live Preview) */}
          <div className="col-span-12 lg:col-span-5 relative">
            <div className="lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Live Storefront Preview</h3>
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-lg">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      previewDevice === "desktop" ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"
                    )}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      previewDevice === "mobile" ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"
                    )}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Browser Mockup */}
              <div className={cn(
                "border border-white/10 rounded-xl overflow-hidden bg-black transition-all duration-300 shadow-2xl",
                previewDevice === "mobile" ? "max-w-[340px] h-[580px] mx-auto" : "h-[540px] w-full"
              )}>
                {/* Browser Bar */}
                <div className="bg-[#18181b] px-4 py-2.5 border-b border-white/5 flex items-center justify-between shrink-0">
                  <div className="flex gap-1.5 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#FF5F57]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#FFBD2E]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#27C93F]"></div>
                  </div>
                  <div className="bg-white/5 px-4 py-1 rounded text-[9px] text-gray-400 font-mono flex items-center gap-2 border border-white/5 select-none overflow-hidden max-w-[200px]">
                    <Lock className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{activeAccount?.username || "elenarossi"}.dm/store</span>
                  </div>
                  <div className="w-8"></div>
                </div>

                {/* View switcher Inside Preview */}
                <div className="bg-black/80 px-4 py-2 border-b border-white/5 flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setPreviewMode("catalog")}
                    className={cn(
                      "px-2 py-1 text-[9px] font-bold rounded transition-colors",
                      previewMode === "catalog" ? "bg-white text-black" : "text-gray-400 hover:text-white"
                    )}
                  >
                    Catalog
                  </button>
                  <button
                    onClick={() => setPreviewMode("pdp")}
                    className={cn(
                      "px-2 py-1 text-[9px] font-bold rounded transition-colors",
                      previewMode === "pdp" ? "bg-white text-black" : "text-gray-400 hover:text-white"
                    )}
                  >
                    Product PDP
                  </button>
                </div>

                {/* Store Content Viewport */}
                <div className={cn(
                  "h-[calc(100%-80px)] overflow-y-auto custom-scrollbar p-4 flex flex-col",
                  previewStyles.bodyClass,
                  previewStyles.fontBody
                )}>
                  {/* Store Header */}
                  <div className={cn("pb-3 mb-6 border-b flex items-center justify-between", previewStyles.navClass)}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 flex items-center justify-center border border-white/15">
                        {storeLogo ? (
                          <img alt="Logo" className="w-full h-full object-cover" src={storeLogo} />
                        ) : (
                          <ShoppingBag className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span className={cn("font-bold tracking-tight text-xs uppercase", previewStyles.textColorClass)}>
                        {storeName || "Elena Rossi"}
                      </span>
                    </div>
                    <div className="flex gap-3 text-[9px] font-bold uppercase tracking-wider">
                      <span>Shop</span>
                      <span>Story</span>
                    </div>
                  </div>

                  {/* Main Preview Content */}
                  {previewMode === "catalog" ? (
                    <div className="space-y-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="text-center py-2 space-y-1">
                          <h2 className={cn("text-lg font-black leading-tight", previewStyles.fontHeadline, previewStyles.textColorClass)}>
                            {storeName || "Elena Rossi"}
                          </h2>
                          <p className={cn("text-[9px] max-w-[200px] mx-auto leading-normal", previewStyles.textMutedClass)}>
                            Signature collections curated with delicate precision.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {[1, 2].map((idx) => (
                            <div key={idx} className={cn("flex flex-col p-2 rounded-lg border", previewStyles.cardClass)}>
                              <div className="aspect-[4/5] rounded overflow-hidden relative bg-zinc-800">
                                <img
                                  src={`https://picsum.photos/seed/product_${idx}/200/250`}
                                  alt="Mock Product"
                                  className="w-full h-full object-cover opacity-80"
                                />
                              </div>
                              <div className="pt-2 flex flex-col gap-1">
                                <span className={cn("font-bold truncate text-[10px]", previewStyles.textColorClass)}>
                                  {idx === 1 ? "Signature Silk Wrap" : "Linen Summer Trouser"}
                                </span>
                                <span className={cn("font-black text-[9px] tracking-tight", previewStyles.priceClass)}>
                                  {idx === 1 ? "420.00 USD" : "180.00 USD"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className={cn("text-center py-4 border-t border-white/5 text-[8px] mt-auto", previewStyles.textMutedClass)}>
                        © 2026 {storeName || "Elena Rossi"}. Powered by AnyDM.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className={cn("flex gap-3", previewDevice === "mobile" ? "flex-col" : "flex-row")}>
                          <div className={cn(
                            "aspect-square rounded-lg overflow-hidden bg-zinc-900 border border-white/10 shrink-0",
                            previewDevice === "mobile" ? "w-full" : "w-[45%]"
                          )}>
                            <img
                              src="https://picsum.photos/seed/product_1/400/500"
                              alt="Mock Product Detail"
                              className="w-full h-full object-cover opacity-80"
                            />
                          </div>
                          <div className="flex-1 space-y-3 w-full">
                            <div className="space-y-1">
                              <span className={cn("text-[8px] px-1.5 py-0.5 rounded font-bold uppercase", previewStyles.badgeClass)}>
                                New Arrival
                              </span>
                              <h2 className={cn("text-xs font-black tracking-tight leading-tight", previewStyles.textColorClass)}>
                                ELENA ROSSI SIGNATURE SILK WRAP
                              </h2>
                              <p className={cn("font-extrabold text-[11px]", previewStyles.priceClass)}>
                                420.00 USD
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className={cn("text-[8px] uppercase font-bold tracking-wider block", previewStyles.textMutedClass)}>
                                SELECT SIZE
                              </span>
                              <div className="flex gap-1">
                                {["S", "M", "L"].map((v, i) => (
                                  <span
                                    key={v}
                                    className={cn(
                                      "w-6 h-6 flex items-center justify-center text-[9px] border font-bold",
                                      i === 0 
                                        ? "bg-white text-black border-white" 
                                        : "bg-white/5 text-white border-white/10"
                                    )}
                                  >
                                    {v}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-1.5 pt-1">
                              {enableInstagramButton && (
                                <button className={cn("w-full py-2 font-bold text-[9px] flex items-center justify-center gap-1 cursor-pointer", previewStyles.instagramButtonClass)}>
                                  <svg className="w-3 h-3 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                                  </svg>
                                  <span>Purchase on Instagram</span>
                                </button>
                              )}
                              {enableWhatsAppButton && (
                                <button className={cn("w-full py-2 font-bold text-[9px] flex items-center justify-center gap-1 cursor-pointer", previewStyles.whatsappButtonClass)}>
                                  <MessageSquare className="w-3 h-3" />
                                  <span>Order via WhatsApp</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {showRelatedProducts && (
                          <div className="pt-4 border-t border-white/5 space-y-2">
                            <h4 className={cn("text-[8px] uppercase font-bold tracking-wider", previewStyles.textColorClass)}>
                              You might also like
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div className={cn("p-1.5 rounded flex items-center gap-2", previewStyles.cardClass)}>
                                <div className="w-7 h-9 bg-zinc-800 rounded overflow-hidden shrink-0">
                                  <img src="https://picsum.photos/seed/product_2/100/120" className="w-full h-full object-cover" alt="related" />
                                </div>
                                <div className="overflow-hidden space-y-0.5">
                                  <span className={cn("font-bold truncate text-[9px] block", previewStyles.textColorClass)}>Linen Trouser</span>
                                  <span className={cn("font-black text-[8px]", previewStyles.priceClass)}>180 USD</span>
                                </div>
                              </div>
                              <div className={cn("p-1.5 rounded flex items-center gap-2", previewStyles.cardClass)}>
                                <div className="w-7 h-9 bg-zinc-800 rounded overflow-hidden shrink-0">
                                  <img src="https://picsum.photos/seed/product_3/100/120" className="w-full h-full object-cover" alt="related" />
                                </div>
                                <div className="overflow-hidden space-y-0.5">
                                  <span className={cn("font-bold truncate text-[9px] block", previewStyles.textColorClass)}>Cotton Cap</span>
                                  <span className={cn("font-black text-[8px]", previewStyles.priceClass)}>60 USD</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>



            </div>
          </div>
        </div>
      )}
    </div>
  );
}
