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
  Sparkles,
  ShoppingBag,
  Smartphone,
  Laptop,
  Save,
  Lock,
  MessageSquare,
  Palette,
  AlertCircle,
  X,
  Package,
  Shield,
  Truck,
  RotateCcw,
  Heart,
  ArrowRight,
  Star,
  MapPin,
  Phone,
  Mail,
  Search,
  Menu,
  ChevronDown,
} from "lucide-react";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import api from "@/lib/services/api.service";
import Toast from "@/components/Toast";
import { cn } from "@/lib/utils";
import { getTemplateStyles, TemplateStyle } from "@/components/templates/TemplateProvider";

const t = {
  surface: "#131313",
  surfaceContainerLowest: "#0e0e0e",
  surfaceContainerLow: "#1c1b1b",
  surfaceContainer: "#20201f",
  surfaceContainerHigh: "#2a2a2a",
  onSurface: "#e5e2e1",
  onSurfaceVariant: "#c4c7c8",
  outline: "#8e9192",
  outlineVariant: "#444748",
  primary: "#ffffff",
  onPrimary: "#2f3131",
  accentCyan: "#8fe3ff",
  lavender: "#c4c0ff",
  success: "#34d399",
  error: "#ffb4ab",
};

interface TemplateTheme {
  id: string;
  name: string;
  colors: { primary: string; background: string; accent: string };
}

interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  defaultThemeId: string;
  themes: TemplateTheme[];
  previewBg: string;
  previewAccent: string;
}

const TEMPLATE_PRESETS: TemplateConfig[] = [
  {
    id: "glass_monochrome",
    name: "Glass monochrome",
    description: "Translucent frosted-glass panels with glowing neon accents.",
    defaultThemeId: "dark",
    previewBg: "#131313",
    previewAccent: "#c4c0ff",
    themes: [
      { id: "dark", name: "Deep charcoal", colors: { primary: "#ffffff", background: "#131313", accent: "#c4c0ff" } },
      { id: "light", name: "Frosted paper", colors: { primary: "#131313", background: "#f5f5f5", accent: "#605ca2" } },
      { id: "frosted", name: "Ice blue", colors: { primary: "#ffffff", background: "#0a1128", accent: "#8fe3ff" } },
    ],
  },
  {
    id: "organic_minimalist",
    name: "Organic minimalist",
    description: "Serene palettes, soft curves, and natural editorial vibe.",
    defaultThemeId: "warm_beige",
    previewBg: "#F9F7F2",
    previewAccent: "#4A5D4E",
    themes: [
      { id: "warm_beige", name: "Warm beige", colors: { primary: "#2c2520", background: "#fcf9f5", accent: "#d4a373" } },
      { id: "soft_sage", name: "Soft sage", colors: { primary: "#ffffff", background: "#4A5D4E", accent: "#DCE3DE" } },
      { id: "pure_white", name: "Pure white", colors: { primary: "#111111", background: "#ffffff", accent: "#5e5e5e" } },
    ],
  },
  {
    id: "cyber_neon_dark",
    name: "Cyber-neon dark",
    description: "Stark dark backdrop with vibrant glowing borders.",
    defaultThemeId: "cyberpunk_neon",
    previewBg: "#050508",
    previewAccent: "#00dbe9",
    themes: [
      { id: "cyberpunk_neon", name: "Cyberpunk cyan", colors: { primary: "#00dbe9", background: "#121414", accent: "#00dbe9" } },
      { id: "synthwave_sunset", name: "Synthwave purple", colors: { primary: "#ff24e4", background: "#0d0e0f", accent: "#ff24e4" } },
      { id: "matrix_green", name: "Matrix green", colors: { primary: "#00ff00", background: "#000000", accent: "#00ff00" } },
    ],
  },
  {
    id: "monochrome_precision",
    name: "Monochrome precision",
    description: "Stark interfaces with hairline borders and high cognitive speed.",
    defaultThemeId: "ink_black",
    previewBg: "#000000",
    previewAccent: "#ffffff",
    themes: [
      { id: "ink_black", name: "Ink black", colors: { primary: "#ffffff", background: "#000000", accent: "#555555" } },
      { id: "paper_white", name: "Paper white", colors: { primary: "#000000", background: "#ffffff", accent: "#cccccc" } },
      { id: "cool_gray", name: "Cool gray", colors: { primary: "#111111", background: "#f8f9fa", accent: "#888888" } },
    ],
  },
  {
    id: "minimalist_editorial",
    name: "Minimalist editorial",
    description: "High-end serif headings, spacious margins, large editorial layout.",
    defaultThemeId: "editorial_light",
    previewBg: "#faf8f5",
    previewAccent: "#1c1c1c",
    themes: [
      { id: "editorial_light", name: "Editorial light", colors: { primary: "#1c1c1c", background: "#faf8f5", accent: "#999" } },
      { id: "editorial_dark", name: "Editorial dark", colors: { primary: "#eaeaea", background: "#111111", accent: "#c5a880" } },
      { id: "tan_canvas", name: "Tan canvas", colors: { primary: "#2b221a", background: "#e8dfd8", accent: "#6b4e37" } },
    ],
  },
  {
    id: "neo_brutalist",
    name: "Neo-brutalist",
    description: "Thick black borders, heavy drop-shadows, high contrast energy.",
    defaultThemeId: "yellow_punch",
    previewBg: "#ffe600",
    previewAccent: "#0038ff",
    themes: [
      { id: "yellow_punch", name: "Yellow punch", colors: { primary: "#000000", background: "#ffe600", accent: "#0038ff" } },
      { id: "raw_concrete", name: "Raw concrete", colors: { primary: "#000000", background: "#e0e0e0", accent: "#0038ff" } },
      { id: "brutalist_blue", name: "Brutalist blue", colors: { primary: "#ffffff", background: "#0038ff", accent: "#ffe600" } },
    ],
  },
  {
    id: "luxury_boutique",
    name: "Luxury boutique",
    description: "Ivory elegance with gold accents — SSENSE/Mytheresa-inspired.",
    defaultThemeId: "ivory_gold",
    previewBg: "#faf8f4",
    previewAccent: "#b8955a",
    themes: [
      { id: "ivory_gold", name: "Ivory & gold", colors: { primary: "#1a1714", background: "#faf8f4", accent: "#b8955a" } },
      { id: "midnight_noir", name: "Midnight noir", colors: { primary: "#f5f0e8", background: "#0d0d0d", accent: "#d4a96a" } },
      { id: "blush_rose", name: "Blush rose", colors: { primary: "#2a1a1f", background: "#fdf6f0", accent: "#c4748a" } },
    ],
  },
  {
    id: "streetwear_bold",
    name: "Streetwear bold",
    description: "Dark, punchy, oversized type — Supreme/Nike-inspired energy.",
    defaultThemeId: "fire_red",
    previewBg: "#0a0a0a",
    previewAccent: "#ff0000",
    themes: [
      { id: "fire_red", name: "Fire red", colors: { primary: "#ffffff", background: "#0a0a0a", accent: "#ff0000" } },
      { id: "raw_orange", name: "Raw orange", colors: { primary: "#ffffff", background: "#0a0a0a", accent: "#ff5a00" } },
      { id: "hype_purple", name: "Hype purple", colors: { primary: "#ffffff", background: "#0a0a0a", accent: "#7c3aed" } },
    ],
  },
  {
    id: "sunset_gradient",
    name: "Sunset gradient",
    description: "Warm vibrant gradients with soft shadows — tropical & joyful.",
    defaultThemeId: "tropical_dawn",
    previewBg: "#fff7ed",
    previewAccent: "#f97316",
    themes: [
      { id: "tropical_dawn", name: "Tropical dawn", colors: { primary: "#1a0a00", background: "#fff7ed", accent: "#f97316" } },
      { id: "ocean_breeze", name: "Ocean breeze", colors: { primary: "#0c1a2e", background: "#eff6ff", accent: "#0ea5e9" } },
      { id: "cherry_bloom", name: "Cherry bloom", colors: { primary: "#1a0018", background: "#fdf2f8", accent: "#ec4899" } },
    ],
  },
];

export default function WebsiteSettingsPage() {
  const router = useRouter();

  const appUser = useSelector((state: RootState) => state.auth.user);
  const instagramAccounts = useSelector((state: RootState) => state.auth.instagramAccounts);
  const activeAccount = instagramAccounts.find((acc) => acc.id === appUser?.active_instagram_account_id) || instagramAccounts[0];

  const [storeName, setStoreName] = useState("");
  const [storeLogo, setStoreLogo] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [storeBanner, setStoreBanner] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [termsOfService, setTermsOfService] = useState("");
  const [returnPolicy, setReturnPolicy] = useState(false);
  const [cancellationPolicy, setCancellationPolicy] = useState(false);
  const [adminReturnPolicyAllowed, setAdminReturnPolicyAllowed] = useState(false);
  const [adminCancellationPolicyAllowed, setAdminCancellationPolicyAllowed] = useState(false);
  const [codEnabled, setCodEnabled] = useState(true);
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(true);
  const [showRelatedProducts, setShowRelatedProducts] = useState(true);
  const [enableInstagramButton, setEnableInstagramButton] = useState(true);
  const [enableWhatsAppButton, setEnableWhatsAppButton] = useState(true);
  const [templateId, setTemplateId] = useState("glass_monochrome");
  const [themeId, setThemeId] = useState("dark");
  const [kycStatus, setKycStatus] = useState("PENDING");
  const [customSettings, setCustomSettings] = useState<any>({});
  const [orderTrackRetryLimit, setOrderTrackRetryLimit] = useState(3);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewMode, setPreviewMode] = useState<"catalog" | "pdp">("catalog");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [activePreviewModal, setActivePreviewModal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerUploadProgress, setBannerUploadProgress] = useState(0);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    if (activeAccount) loadWebsiteSettings();
  }, [activeAccount]);

  const loadWebsiteSettings = async () => {
    setInitialLoading(true);
    try {
      const response = await api.get("/accounts/website-settings/");
      if (response.data) {
        const d = response.data;
        setStoreName(d.store_name || "");
        setStoreLogo(d.store_logo || "");
        setStoreSlug(d.store_slug || "");
        setStoreBanner(d.store_banner || "");
        setStoreDescription(d.store_description || "");
        setContactEmail(d.contact_email || "");
        setContactPhone(d.contact_phone || "");
        setBusinessAddress(d.business_address || "");
        setShippingAddress(d.shipping_address || "");
        const retAllowed = !!d.return_policy;
        const cancelAllowed = !!d.cancellation_policy;
        setReturnPolicy(retAllowed);
        setCancellationPolicy(cancelAllowed);
        setAdminReturnPolicyAllowed(retAllowed);
        setAdminCancellationPolicyAllowed(cancelAllowed);
        setCodEnabled(d.cod_enabled ?? true);
        setOnlinePaymentEnabled(d.online_payment_enabled ?? true);
        setShowRelatedProducts(d.show_related_products ?? true);
        setEnableInstagramButton(d.enable_instagram_button ?? true);
        setEnableWhatsAppButton(d.enable_whatsapp_button ?? true);
        setTemplateId(d.template_id || "glass_monochrome");
        setThemeId(d.theme_id || "dark");
        setPrivacyPolicy(d.privacy_policy || "");
        setTermsOfService(d.terms_of_service || "");
        const cSettings = d.custom_settings || {};
        setCustomSettings(cSettings);
        setOrderTrackRetryLimit(cSettings.order_track_retry_limit ?? 3);
      }
      try {
        const kycRes = await api.get("/crm/seller/kyc/");
        if (kycRes.data?.status) {
          const status = kycRes.data.status;
          setKycStatus(status);
          if (status.toUpperCase() !== "APPROVED") setCodEnabled(true);
        }
      } catch {}
    } catch (e) {
      showToast("Using local storefront configs.", "info");
      setStoreName(activeAccount?.full_name || activeAccount?.username || "");
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
      store_slug: storeSlug,
      store_banner: storeBanner,
      store_description: storeDescription,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      business_address: businessAddress,
      shipping_address: shippingAddress,
      cod_enabled: codEnabled,
      online_payment_enabled: onlinePaymentEnabled,
      return_policy: returnPolicy,
      cancellation_policy: cancellationPolicy,
      show_related_products: showRelatedProducts,
      enable_instagram_button: enableInstagramButton,
      enable_whatsapp_button: enableWhatsAppButton,
      template_id: templateId,
      theme_id: themeId,
      privacy_policy: privacyPolicy,
      terms_of_service: termsOfService,
      custom_settings: { ...customSettings, order_track_retry_limit: orderTrackRetryLimit },
    };
    try {
      await api.put("/accounts/website-settings/", payload);
      showToast("Store settings saved.", "success");
    } catch (err: any) {
      showToast(err.response?.data?.error || "Couldn't save settings. Try again.", "error");
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
      if (event.lengthComputable) setUploadProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      setUploading(false);
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          setStoreLogo(response.secure_url);
          showToast("Logo uploaded.", "success");
        } catch { showToast("Couldn't process the uploaded logo.", "error"); }
      } else { showToast("Upload failed.", "error"); }
    };
    xhr.onerror = () => { setUploading(false); showToast("Network error during upload.", "error"); };
    xhr.send(formData);
  };

  const performBannerUpload = (file: File) => {
    setBannerUploading(true);
    setBannerUploadProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "any_dm_product_upload");
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.cloudinary.com/v1_1/dx5bqewfx/auto/upload", true);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) setBannerUploadProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      setBannerUploading(false);
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          setStoreBanner(response.secure_url);
          showToast("Banner uploaded.", "success");
        } catch { showToast("Couldn't process the uploaded banner.", "error"); }
      } else { showToast("Banner upload failed.", "error"); }
    };
    xhr.onerror = () => { setBannerUploading(false); showToast("Network error during banner upload.", "error"); };
    xhr.send(formData);
  };

  const handleTemplateChange = (id: string) => {
    setTemplateId(id);
    const tmpl = TEMPLATE_PRESETS.find((t) => t.id === id);
    if (tmpl) setThemeId(tmpl.defaultThemeId);
  };

  const selectedTemplate = TEMPLATE_PRESETS.find((t) => t.id === templateId) || TEMPLATE_PRESETS[0];
  const storefrontUrl = typeof window !== "undefined"
    ? `${window.location.origin}/${activeAccount?.username}`
    : `/${activeAccount?.username}`;
  const previewStyles: TemplateStyle = getTemplateStyles(templateId, themeId);

  const previewStoreName = storeName || activeAccount?.full_name || "My Store";

  return (
    <div className="w-full space-y-6 pb-16" style={{ color: t.onSurface }}>
      <Toast message={toastMessage} isVisible={toastVisible} type={toastType} onClose={() => setToastVisible(false)} />

      {/* Header */}
      <div className="sticky top-[100px] z-30 flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-3 pt-4 -mt-6 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-[#444748]/10 bg-[#131313]">
        <div className="hidden md:block">
          <h1 className="text-xl font-bold tracking-tight">Website configuration</h1>
        </div>
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <a
            href={storefrontUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-md font-medium text-xs flex items-center gap-1.5 transition-colors hover:bg-white/5"
            style={{ border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
          >
            <Eye className="w-4 h-4" strokeWidth={1.75} />
            Preview live store
          </a>
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="px-4 py-2 rounded-md font-medium text-xs flex items-center gap-1.5 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: t.primary, color: t.onPrimary }}
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.75} /> : <Save className="w-4 h-4" strokeWidth={1.75} />}
            <span>Save changes</span>
          </button>
        </div>
      </div>

      {initialLoading ? (
        <div className="py-20 text-center text-sm" style={{ color: t.onSurfaceVariant }}>
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: t.onSurface }} strokeWidth={1.75} />
          Loading storefront settings…
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Left column — settings */}
          <div className="col-span-12 lg:col-span-7 space-y-5">

            {/* Branding */}
            <section className="rounded-lg p-4 md:p-5" style={{ backgroundColor: t.surfaceContainer }}>
              <SectionHeading icon={Sparkles} label="Supplier branding" />
              <div className="space-y-5">
                <Field label="Store name">
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full rounded text-sm px-3 py-2 focus:outline-none"
                    style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                    placeholder="Enter store name"
                  />
                </Field>

                <Field label="Store logo">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center p-2 shrink-0"
                      style={{ border: `1px solid ${t.outlineVariant}`, backgroundColor: t.surfaceContainerLowest }}
                    >
                      {storeLogo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt="Store logo" className="w-full h-full object-contain rounded-full" src={storeLogo} />
                      ) : (
                        <ShoppingBag className="w-6 h-6" style={{ color: t.outline }} strokeWidth={1.75} />
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        className="px-4 py-2 rounded-md text-xs font-medium flex items-center gap-1.5 transition-opacity hover:opacity-90"
                        style={{ backgroundColor: t.primary, color: t.onPrimary }}
                      >
                        {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        {uploading ? `${uploadProgress}%` : "Upload logo"}
                      </button>
                      {storeLogo && (
                        <button
                          onClick={() => setStoreLogo("")}
                          className="px-4 py-2 rounded-md text-xs font-medium transition-colors hover:bg-white/5"
                          style={{ border: `1px solid ${t.outlineVariant}`, color: t.error }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input type="file" ref={logoInputRef} onChange={e => { if (e.target.files?.[0]) performLogoUpload(e.target.files[0]); }} accept="image/*" className="hidden" />
                  </div>
                  <p className="text-xs mt-2" style={{ color: t.onSurfaceVariant }}>
                    Supports JPG and PNG. Best aspect ratio is 1:1 square.
                  </p>
                </Field>
              </div>
            </section>

            {/* Store Settings */}
            <section className="rounded-lg p-4 md:p-5 space-y-5" style={{ backgroundColor: t.surfaceContainer }}>
              <SectionHeading icon={Sliders} label="Store settings & logistics" />

              <Field label="Store Banner Image">
                <div className="space-y-3">
                  {storeBanner && (
                    <div className="relative w-full h-32 rounded overflow-hidden border" style={{ borderColor: t.outlineVariant }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={storeBanner} alt="Store Banner" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-semibold">Banner Preview</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={bannerUploading}
                      onClick={() => bannerInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2 rounded text-xs font-semibold transition-all"
                      style={{ backgroundColor: t.surfaceContainerHigh, border: `1px solid ${t.outlineVariant}`, color: t.onSurface, opacity: bannerUploading ? 0.6 : 1 }}
                    >
                      {bannerUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      {bannerUploading ? `Uploading… ${bannerUploadProgress}%` : "Upload Banner"}
                    </button>
                    {storeBanner && !bannerUploading && (
                      <button type="button" onClick={() => setStoreBanner("")} className="text-xs font-semibold" style={{ color: t.error }}>
                        Remove
                      </button>
                    )}
                  </div>
                  <input type="file" ref={bannerInputRef} onChange={e => { if (e.target.files?.[0]) performBannerUpload(e.target.files[0]); }} accept="image/*" className="hidden" />
                </div>
                <p className="text-xs mt-2" style={{ color: t.onSurfaceVariant }}>
                  Recommended: 16:9 or 3:1. JPG/PNG.
                </p>
              </Field>

              <Field label="Store description">
                <textarea
                  rows={3}
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  className="w-full rounded text-sm px-3 py-2 focus:outline-none resize-none"
                  style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                  placeholder="Short description of your store"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Contact Email">
                  <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded text-sm px-3 py-2 focus:outline-none"
                    style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }} />
                </Field>
                <Field label="Contact Phone">
                  <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full rounded text-sm px-3 py-2 focus:outline-none"
                    style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }} />
                </Field>
              </div>

              <Field label="Business Address">
                <textarea rows={2} value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)}
                  className="w-full rounded text-sm px-3 py-2 focus:outline-none resize-none"
                  style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }} />
              </Field>

              <Field label="Shipping Address">
                <textarea rows={2} value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full rounded text-sm px-3 py-2 focus:outline-none resize-none"
                  style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }} />
              </Field>

              <Field label="Privacy Policy">
                <textarea rows={4} value={privacyPolicy} onChange={(e) => setPrivacyPolicy(e.target.value)}
                  className="w-full rounded text-sm px-3 py-2 focus:outline-none resize-none"
                  style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                  placeholder="Enter Privacy Policy for your customers" />
              </Field>

              <Field label="Terms of Service">
                <textarea rows={4} value={termsOfService} onChange={(e) => setTermsOfService(e.target.value)}
                  className="w-full rounded text-sm px-3 py-2 focus:outline-none resize-none"
                  style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                  placeholder="Enter Terms of Service for your customers" />
              </Field>

              <ToggleRow title="Allow Returns & Exchanges" description="Allow customers to request returns or exchanges." checked={returnPolicy} onChange={() => setReturnPolicy(!returnPolicy)} disabled={!adminReturnPolicyAllowed} />
              <ToggleRow title="Allow Cancellations" description="Allow customers to cancel before shipment." checked={cancellationPolicy} onChange={() => setCancellationPolicy(!cancellationPolicy)} disabled={!adminCancellationPolicyAllowed} />
              <ToggleRow
                title="Allow Cash on Delivery (COD)"
                description="Enable COD payments (Global policies apply)."
                checked={codEnabled}
                onChange={() => {
                  if (kycStatus?.toUpperCase() !== "APPROVED") { showToast("Complete KYC to modify COD settings.", "error"); return; }
                  if (!onlinePaymentEnabled && codEnabled) { showToast("Keep at least one payment method enabled.", "error"); return; }
                  setCodEnabled(!codEnabled);
                }}
              />

              <div className="pt-4 border-t border-white/5 space-y-3">
                {kycStatus?.toUpperCase() === "APPROVED" ? (
                  <ToggleRow
                    title="Online Payments"
                    description="Accept credit card, debit card, and UPI payments."
                    checked={onlinePaymentEnabled}
                    onChange={() => {
                      if (!codEnabled && onlinePaymentEnabled) { showToast("Keep at least one payment method enabled.", "error"); return; }
                      setOnlinePaymentEnabled(!onlinePaymentEnabled);
                    }}
                  />
                ) : (
                  <div className="flex justify-between items-center text-xs font-semibold py-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-zinc-200">Online Payments</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Accept credit card, debit card, and UPI payments.</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase">Disabled</span>
                  </div>
                )}
                {kycStatus?.toUpperCase() !== "APPROVED" && (
                  <div className="rounded border border-yellow-500/20 bg-yellow-500/5 p-3 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-medium text-yellow-200/90">KYC verification required</p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">Complete your KYC to accept online payments.</p>
                      <button type="button" onClick={() => router.push("/dashboard/settings/kyc")} className="text-[10px] font-bold text-[#b6b2ff] hover:underline mt-1">
                        Complete KYC →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs font-semibold py-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-zinc-200">Order ID Retry Limit</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Attempts before order tracking is cancelled.</span>
                </div>
                <select
                  value={orderTrackRetryLimit}
                  onChange={(e) => setOrderTrackRetryLimit(Number(e.target.value))}
                  className="bg-[#131313] border border-[#444748] rounded px-3 py-1.5 text-xs text-white outline-none font-semibold cursor-pointer"
                >
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} {n === 1 ? "Attempt" : "Attempts"}</option>)}
                </select>
              </div>
            </section>

            {/* Appearance */}
            <section className="rounded-lg p-4 md:p-5" style={{ backgroundColor: t.surfaceContainer }}>
              <SectionHeading icon={Layout} label="Website appearance template" />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {TEMPLATE_PRESETS.map(tmpl => (
                  <TemplateCard
                    key={tmpl.id}
                    active={templateId === tmpl.id}
                    onClick={() => handleTemplateChange(tmpl.id)}
                    name={tmpl.name}
                    description={tmpl.description}
                    previewBg={tmpl.previewBg}
                    previewAccent={tmpl.previewAccent}
                  />
                ))}
              </div>
            </section>

            {/* Theme Palette */}
            <section className="rounded-lg p-4 md:p-5" style={{ backgroundColor: t.surfaceContainer }}>
              <SectionHeading icon={Palette} label="Theme palette" />
              <p className="text-xs mb-3" style={{ color: t.onSurfaceVariant }}>
                Choose a color variation for <span style={{ color: t.onSurface, fontWeight: 500 }}>{selectedTemplate?.name}</span>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {selectedTemplate?.themes.map((theme) => {
                  const active = themeId === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => setThemeId(theme.id)}
                      className="p-3 rounded-md cursor-pointer transition-all flex items-center gap-3"
                      style={{
                        border: active ? `2px solid ${t.primary}` : `1px solid ${t.outlineVariant}`,
                        backgroundColor: active ? t.surfaceContainerHigh : "transparent",
                      }}
                    >
                      {/* Color swatch showing bg + accent */}
                      <div
                        className="w-8 h-8 rounded-full shrink-0 border"
                        style={{
                          borderColor: t.outlineVariant,
                          background: `linear-gradient(135deg, ${theme.colors.accent} 0%, ${theme.colors.accent} 40%, ${theme.colors.background} 40%, ${theme.colors.background} 100%)`,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: t.onSurface }}>{theme.name}</p>
                        <div className="flex gap-1 mt-1">
                          <span className="w-3 h-3 rounded-sm border border-white/10" style={{ backgroundColor: theme.colors.background }} />
                          <span className="w-3 h-3 rounded-sm border border-white/10" style={{ backgroundColor: theme.colors.primary }} />
                          <span className="w-3 h-3 rounded-sm border border-white/10" style={{ backgroundColor: theme.colors.accent }} />
                        </div>
                      </div>
                      {active && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: t.primary }} strokeWidth={3} />}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Functionality */}
            <section className="rounded-lg p-4 md:p-5" style={{ backgroundColor: t.surfaceContainer }}>
              <SectionHeading icon={Sliders} label="Functionality settings" />
              <ToggleRow title="Show related products" description="Display other catalog items at bottom of product page." checked={showRelatedProducts} onChange={() => setShowRelatedProducts(!showRelatedProducts)} />
              <ToggleRow title="Enable Instagram checkout" description="Direct customers to Instagram to complete purchase." checked={enableInstagramButton} onChange={() => setEnableInstagramButton(!enableInstagramButton)} />
              <ToggleRow title="Enable WhatsApp redirection" description="Let customers ask questions or order via WhatsApp." checked={enableWhatsAppButton} onChange={() => setEnableWhatsAppButton(!enableWhatsAppButton)} last />
            </section>
          </div>

          {/* Right column — live preview */}
          <div className="col-span-12 lg:col-span-5 relative">
            <div className="lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium" style={{ color: t.onSurfaceVariant }}>
                  Live storefront preview
                </h3>
                <div className="flex items-center gap-1 rounded-md p-0.5" style={{ backgroundColor: t.surfaceContainer, border: `1px solid ${t.outlineVariant}` }}>
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className="p-1.5 rounded transition-colors"
                    style={{ backgroundColor: previewDevice === "desktop" ? t.surfaceContainerHigh : "transparent", color: previewDevice === "desktop" ? t.onSurface : t.outline }}
                  >
                    <Laptop className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className="p-1.5 rounded transition-colors"
                    style={{ backgroundColor: previewDevice === "mobile" ? t.surfaceContainerHigh : "transparent", color: previewDevice === "mobile" ? t.onSurface : t.outline }}
                  >
                    <Smartphone className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              {/* Browser mockup */}
              <div
                className={cn("rounded-lg overflow-hidden transition-all duration-300 shadow-2xl", previewDevice === "mobile" ? "max-w-[340px] h-[620px] mx-auto" : "h-[600px] w-full")}
                style={{ border: `1px solid ${t.outlineVariant}`, backgroundColor: "#000" }}
              >
                {/* Browser chrome */}
                <div className="px-4 py-2.5 flex items-center justify-between shrink-0" style={{ backgroundColor: "#18181b", borderBottom: `1px solid ${t.outlineVariant}` }}>
                  <div className="flex gap-1.5 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#FF5F57]" />
                    <div className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
                    <div className="w-2 h-2 rounded-full bg-[#27C93F]" />
                  </div>
                  <div className="px-3 py-1 rounded text-[10px] flex items-center gap-1.5 select-none overflow-hidden max-w-[200px]"
                    style={{ backgroundColor: t.surfaceContainer, color: t.onSurfaceVariant, border: `1px solid ${t.outlineVariant}` }}>
                    <Lock className="w-2.5 h-2.5 shrink-0" strokeWidth={1.75} />
                    <span className="truncate">zoyee.in/{activeAccount?.username || "mystore"}</span>
                  </div>
                  <div className="w-8" />
                </div>

                {/* Tab bar */}
                <div className="px-4 py-1.5 flex items-center gap-2 shrink-0" style={{ backgroundColor: "rgba(0,0,0,0.6)", borderBottom: `1px solid ${t.outlineVariant}` }}>
                  {["catalog", "pdp"].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setPreviewMode(mode as any)}
                      className="px-2.5 py-1 text-[10px] font-medium rounded transition-colors"
                      style={{
                        backgroundColor: previewMode === mode ? t.primary : "transparent",
                        color: previewMode === mode ? t.onPrimary : t.onSurfaceVariant,
                      }}
                    >
                      {mode === "catalog" ? "Catalog" : "Product page"}
                    </button>
                  ))}
                </div>

                {/* Preview viewport — matches real storefront structure */}
                <div className="relative overflow-hidden" style={{ height: "calc(100% - 72px)" }}>
                  <div className={cn("h-full overflow-y-auto custom-scrollbar", previewStyles.bodyClass, previewStyles.fontBody)}>

                    {/* Nav */}
                    <div className={cn("px-4 h-10 flex items-center justify-between border-b shrink-0", previewStyles.navClass)}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-5 h-5 overflow-hidden flex items-center justify-center", previewStyles.logoWrapperClass)}>
                          {storeLogo
                            ? <img src={storeLogo} alt="" className="w-full h-full object-cover" />
                            : <ShoppingBag className="w-3 h-3" strokeWidth={1.75} />
                          }
                        </div>
                        <span className={cn("text-[10px] font-bold truncate max-w-[80px]", previewStyles.textColorClass)}>{previewStoreName}</span>
                      </div>
                      <div className="flex gap-2">
                        <Search className={cn("w-3 h-3", previewStyles.textMutedClass)} />
                        <Menu className={cn("w-3 h-3", previewStyles.textMutedClass)} />
                      </div>
                    </div>

                    {previewMode === "catalog" ? (
                      <div className="p-3 space-y-4">
                        {/* Hero */}
                        {storeBanner ? (
                          <div className="relative w-full h-24 overflow-hidden rounded-md">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={storeBanner} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col items-center justify-end pb-2 px-2 text-center">
                              <p className={cn("text-[9px] font-black text-white leading-tight truncate w-full", previewStyles.fontHeadline)}>{previewStoreName}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 space-y-1">
                            <h2 className={cn("text-sm font-black leading-tight", previewStyles.fontHeadline, previewStyles.textColorClass)}>{previewStoreName}</h2>
                            {storeDescription && <p className={cn("text-[9px] leading-normal max-w-[140px] mx-auto", previewStyles.textMutedClass)}>{storeDescription.slice(0, 60)}{storeDescription.length > 60 ? "…" : ""}</p>}
                          </div>
                        )}

                        {/* Filters */}
                        <div className="flex justify-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
                          {["All", "Tops", "Bottoms"].map((cat, i) => (
                            <span key={cat} className={cn("text-[8px] shrink-0 truncate", i === 0 ? previewStyles.filterPillActiveClass : previewStyles.filterPillClass)}
                              style={{ padding: "2px 8px" }}>
                              {cat}
                            </span>
                          ))}
                        </div>

                        {/* Product grid */}
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { seed: "prod1", name: "Summer Top", price: "2499", currency: "INR" },
                            { seed: "prod2", name: "Denim Trouser", price: "4499", currency: "INR" },
                            { seed: "prod3", name: "Canvas Bag", price: "1499", currency: "INR" },
                            { seed: "prod4", name: "Cotton Cap", price: "999", currency: "INR" },
                          ].map((item, idx) => (
                            <div key={idx} className={cn("flex flex-col overflow-hidden", previewStyles.cardClass)}>
                              <div className="aspect-[3/4] w-full overflow-hidden relative bg-zinc-800">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={`https://picsum.photos/seed/${item.seed}/120/160`} alt="" className="w-full h-full object-cover" />
                                {idx === 0 && (
                                  <div className="absolute top-1 left-1 text-[7px] font-black px-1 py-0.5" style={{ backgroundColor: previewStyles.accentColor, color: previewStyles.isDark ? "#000" : "#fff" }}>
                                    -20%
                                  </div>
                                )}
                                <button className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-black/30">
                                  <Heart className={cn("w-2.5 h-2.5", idx === 1 ? "fill-red-500 text-red-500" : "text-white")} />
                                </button>
                              </div>
                              <div className="p-1.5 space-y-0.5">
                                <p className={cn("text-[9px] font-semibold truncate", previewStyles.textColorClass)}>{item.name}</p>
                                <p className={cn("text-[9px] font-bold", previewStyles.priceClass)}>{item.price} {item.currency}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* PDP preview */
                      <div className="p-3 space-y-3">
                        <div className={cn("flex gap-2", previewDevice === "mobile" ? "flex-col" : "flex-row")}>
                          <div className={cn("overflow-hidden bg-zinc-800", previewDevice === "mobile" ? "w-full aspect-[3/4]" : "w-2/5 aspect-square")}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="https://picsum.photos/seed/preview_pdp/200/260" alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 space-y-2.5">
                            <div className="space-y-0.5">
                              <span className={cn("text-[7px] font-bold uppercase tracking-wider inline-block", previewStyles.badgeClass)}>New arrival</span>
                              <h2 className={cn("text-[10px] font-bold leading-tight mt-1", previewStyles.textColorClass)}>Summer Silk Wrap</h2>
                              <p className={cn("text-[10px] font-bold", previewStyles.priceClass)}>₹4,200</p>
                            </div>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-2 h-2 fill-amber-400 text-amber-400" />)}
                              <span className={cn("text-[7px] ml-0.5", previewStyles.textMutedClass)}>(4.8)</span>
                            </div>
                            <div className="space-y-1">
                              <span className={cn("text-[8px] font-medium block", previewStyles.textMutedClass)}>Size</span>
                              <div className="flex gap-1">
                                {["S", "M", "L"].map((v, i) => (
                                  <span key={v} className={cn("w-5 h-5 flex items-center justify-center text-[8px] border font-bold", i === 0 ? previewStyles.filterPillActiveClass : previewStyles.filterPillClass)} style={{ padding: 0 }}>
                                    {v}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-1 pt-0.5">
                              {enableInstagramButton && (
                                <button className={cn("w-full py-1.5 font-bold text-[8px] flex items-center justify-center gap-1", previewStyles.instagramButtonClass)}>
                                  <InstagramIcon className="w-2.5 h-2.5" /> Purchase on Instagram
                                </button>
                              )}
                              {enableWhatsAppButton && (
                                <button className={cn("w-full py-1.5 font-bold text-[8px] flex items-center justify-center gap-1", previewStyles.whatsappButtonClass)}>
                                  <MessageSquare className="w-2.5 h-2.5" /> Order via WhatsApp
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {showRelatedProducts && (
                          <div className={cn("pt-2 border-t space-y-1.5", previewStyles.dividerClass)}>
                            <h4 className={cn("text-[8px] font-bold uppercase tracking-wider", previewStyles.textColorClass)}>You might also like</h4>
                            <div className="grid grid-cols-3 gap-1.5">
                              {[1, 2, 3].map(i => (
                                <div key={i} className={cn("overflow-hidden", previewStyles.cardClass)}>
                                  <div className="aspect-square bg-zinc-800 overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={`https://picsum.photos/seed/rel${i}/60/60`} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="p-1">
                                    <p className={cn("text-[7px] truncate", previewStyles.textColorClass)}>Product {i}</p>
                                    <p className={cn("text-[7px] font-bold", previewStyles.priceClass)}>${(i * 15 + 20)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Preview footer */}
                    <div className={cn("px-3 py-4 border-t text-center space-y-1.5 mt-4", previewStyles.dividerClass, previewStyles.textMutedClass)}>
                      <p className="text-[8px]">© 2026 {previewStoreName}. Powered by <span style={{ color: previewStyles.accentColor }} className="font-bold">AnyDM</span>.</p>
                      {(contactEmail || contactPhone) && (
                        <div className="flex justify-center gap-3 text-[7px] flex-wrap opacity-80">
                          {contactEmail && <span>✉ {contactEmail.slice(0, 18)}{contactEmail.length > 18 ? "…" : ""}</span>}
                          {contactPhone && <span>📞 {contactPhone}</span>}
                        </div>
                      )}
                      <div className="flex justify-center gap-3 text-[8px]">
                        <span className="hover:underline cursor-pointer">Privacy</span>
                        <span className="hover:underline cursor-pointer">Terms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick tip */}
              <p className="text-[10px] mt-3 text-center" style={{ color: t.onSurfaceVariant }}>
                💡 Preview updates instantly as you change settings.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Local helpers ─────────────────────────── */

function SectionHeading({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <Icon className="w-4 h-4" style={{ color: t.onSurfaceVariant }} strokeWidth={1.75} />
      <h2 className="text-[13px] font-medium tracking-[0.01em]" style={{ color: t.onSurface }}>{label}</h2>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs mb-1.5 block font-medium" style={{ color: t.onSurfaceVariant }}>{label}</label>
      {children}
    </div>
  );
}

function TemplateCard({
  active, onClick, name, description, previewBg, previewAccent,
}: {
  active: boolean; onClick: () => void; name: string; description: string; previewBg: string; previewAccent: string;
}) {
  return (
    <div
      onClick={onClick}
      className="rounded-md p-3 cursor-pointer transition-all flex flex-col justify-between hover:opacity-90"
      style={{
        border: active ? `2px solid ${t.primary}` : `1px solid ${t.outlineVariant}`,
        backgroundColor: active ? t.surfaceContainerHigh : "transparent",
      }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-medium truncate pr-2" style={{ color: t.onSurface }}>{name}</span>
        {active
          ? <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: t.primary }}><Check className="w-2.5 h-2.5" style={{ color: t.onPrimary }} strokeWidth={3} /></div>
          : <div className="w-4 h-4 rounded-full shrink-0" style={{ border: `1px solid ${t.outlineVariant}` }} />
        }
      </div>
      {/* Mini visual preview */}
      <div className="h-16 rounded overflow-hidden relative" style={{ backgroundColor: previewBg, border: `1px solid ${t.outlineVariant}` }}>
        <div className="absolute inset-0 p-2 flex flex-col gap-1.5">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: previewAccent, opacity: 0.7 }} />
            <div className="h-1.5 rounded-full flex-1 opacity-30" style={{ backgroundColor: previewAccent }} />
          </div>
          <div className="grid grid-cols-3 gap-1 flex-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="rounded-sm" style={{ backgroundColor: i === 0 ? previewAccent : `${previewAccent}22`, opacity: i === 0 ? 0.8 : 0.4 }} />
            ))}
          </div>
          <div className="h-1.5 rounded-full w-1/2" style={{ backgroundColor: previewAccent, opacity: 0.5 }} />
        </div>
      </div>
      <p className="text-[10px] leading-normal mt-2" style={{ color: t.onSurfaceVariant }}>{description}</p>
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange, last = false, disabled = false }: {
  title: string; description: string; checked: boolean; onChange: () => void; last?: boolean; disabled?: boolean;
}) {
  return (
    <div
      className={cn("flex items-center justify-between py-3.5", disabled && "opacity-40")}
      style={!last ? { borderBottom: `1px solid ${t.outlineVariant}` } : undefined}
    >
      <div className="pr-4">
        <h4 className="text-xs font-medium" style={{ color: t.onSurface }}>{title}</h4>
        <p className="text-[11px] mt-0.5" style={{ color: t.onSurfaceVariant }}>{description}</p>
      </div>
      <button
        onClick={disabled ? undefined : onChange}
        disabled={disabled}
        className={cn("relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus:outline-none", disabled ? "cursor-not-allowed" : "cursor-pointer")}
        style={{ backgroundColor: checked ? t.primary : t.surfaceContainerHigh }}
      >
        <span
          className="pointer-events-none inline-block h-4 w-4 mt-0.5 transform rounded-full transition duration-200"
          style={{
            transform: checked ? "translateX(18px)" : "translateX(2px)",
            backgroundColor: checked ? (disabled ? t.outline : t.onPrimary) : t.outline,
          }}
        />
      </button>
    </div>
  );
}