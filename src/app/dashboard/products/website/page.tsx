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
  Palette,
  AlertCircle,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import api from "@/lib/services/api.service";
import Toast from "@/components/Toast";
import { cn } from "@/lib/utils";
import { getTemplateStyles, TemplateStyle } from "@/components/templates/TemplateProvider";

/**
 * Design tokens — Glass Monochrome
 * Kept local to this file for now; move to tailwind.config theme.extend.colors
 * once adopted app-wide (see design-system.yaml).
 */
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

const monoStat = { fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace" };

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
    name: "Glass monochrome",
    description: "Translucent frosted-glass panels with glowing neon accents.",
    defaultThemeId: "dark",
    themes: [
      { id: "dark", name: "Deep charcoal (dark)", colors: { primary: "#ffffff", background: "#131313", accent: "#c4c0ff" } },
      { id: "light", name: "Frosted paper (light)", colors: { primary: "#131313", background: "#f5f5f5", accent: "#605ca2" } },
      { id: "frosted", name: "Ice blue (translucent)", colors: { primary: "#ffffff", background: "#0a1128", accent: "#8fe3ff" } },
    ],
  },
  {
    id: "organic_minimalist",
    name: "Organic minimalist",
    description: "Serene palettes, soft curves, and natural editorial vibe.",
    defaultThemeId: "warm_beige",
    themes: [
      { id: "warm_beige", name: "Warm beige", colors: { primary: "#2c2520", background: "#fcf9f5", accent: "#d4a373" } },
      { id: "soft_sage", name: "Soft sage", colors: { primary: "#2a342a", background: "#f1f3f0", accent: "#a3b19b" } },
      { id: "pure_white", name: "Pure white", colors: { primary: "#111111", background: "#ffffff", accent: "#5e5e5e" } },
    ],
  },
  {
    id: "cyber_neon_dark",
    name: "Cyber-neon dark",
    description: "Stark dark backdrop with vibrant glowing borders.",
    defaultThemeId: "cyberpunk_neon",
    themes: [
      { id: "cyberpunk_neon", name: "Cyberpunk pink/cyan", colors: { primary: "#39ff14", background: "#050508", accent: "#ff007f" } },
      { id: "synthwave_sunset", name: "Synthwave purple", colors: { primary: "#ff8c00", background: "#0f051d", accent: "#9b5de5" } },
      { id: "matrix_green", name: "Matrix green", colors: { primary: "#00ff00", background: "#000000", accent: "#003300" } },
    ],
  },
  {
    id: "monochrome_precision",
    name: "Monochrome precision",
    description: "Stark interfaces with hairline borders and high cognitive speed.",
    defaultThemeId: "ink_black",
    themes: [
      { id: "ink_black", name: "Ink black", colors: { primary: "#ffffff", background: "#000000", accent: "#555555" } },
      { id: "paper_white", name: "Paper white", colors: { primary: "#000000", background: "#ffffff", accent: "#cccccc" } },
      { id: "cool_gray", name: "Cool gray", colors: { primary: "#111111", background: "#f8f9fa", accent: "#888888" } },
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
  const [templateId, setTemplateId] = useState("monochrome_precision");
  const [themeId, setThemeId] = useState("ink_black");
  const [kycStatus, setKycStatus] = useState("PENDING");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [previewMode, setPreviewMode] = useState<"catalog" | "pdp">("pdp");
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
        setTemplateId(d.template_id || "monochrome_precision");
        setThemeId(d.theme_id || "ink_black");
        setPrivacyPolicy(d.privacy_policy || "");
        setTermsOfService(d.terms_of_service || "");
      }

      // Fetch KYC status for the logged-in user
      try {
        const kycRes = await api.get("/crm/seller/kyc/");
        if (kycRes.data && kycRes.data.status) {
          const status = kycRes.data.status;
          setKycStatus(status);
          if (status.toUpperCase() !== "APPROVED") {
            setCodEnabled(true);
          }
        }
      } catch (kycErr) {
        console.error("Failed to load KYC status:", kycErr);
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
    };

    try {
      await api.put("/accounts/website-settings/", payload);
      showToast("Store settings saved.", "success");
    } catch (err: any) {
      console.error("Save failed:", err);
      const errMsg = err.response?.data?.error || "Couldn't save settings. Try again.";
      showToast(errMsg, "error");
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
          showToast("Logo uploaded.", "success");
        } catch (e) {
          showToast("Couldn't process the uploaded logo.", "error");
        }
      } else {
        showToast("Upload failed.", "error");
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      showToast("Network error during upload.", "error");
    };

    xhr.send(formData);
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      performLogoUpload(files[0]);
    }
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
      if (event.lengthComputable) {
        setBannerUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      setBannerUploading(false);
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          setStoreBanner(response.secure_url);
          showToast("Banner uploaded.", "success");
        } catch (e) {
          showToast("Couldn't process the uploaded banner.", "error");
        }
      } else {
        showToast("Banner upload failed.", "error");
      }
    };

    xhr.onerror = () => {
      setBannerUploading(false);
      showToast("Network error during banner upload.", "error");
    };

    xhr.send(formData);
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      performBannerUpload(files[0]);
    }
  };

  const handleTemplateChange = (id: string) => {
    setTemplateId(id);
    const tmpl = TEMPLATE_PRESETS.find((t) => t.id === id);
    if (tmpl) {
      setThemeId(tmpl.defaultThemeId);
    }
  };

  const selectedTemplate = TEMPLATE_PRESETS.find((t) => t.id === templateId) || TEMPLATE_PRESETS[0];
  const storefrontUrl = typeof window !== "undefined" ? `${window.location.origin}/${activeAccount?.username}` : `/${activeAccount?.username}`;
  const previewStyles: TemplateStyle = getTemplateStyles(templateId, themeId);

  return (
    <div className="w-full space-y-6 pb-16" style={{ color: t.onSurface }}>
      <Toast message={toastMessage} isVisible={toastVisible} type={toastType} onClose={() => setToastVisible(false)} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>

          <h1 className="text-xl font-bold tracking-tight">
            Website configuration
            {/* <Globe className="w-5 h-5" style={{ color: t.lavender }} strokeWidth={1.75} /> */}
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
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
          <div className="col-span-12 lg:col-span-7 space-y-6">
            {/* Supplier branding */}
            <section className="rounded-lg p-4 md:p-5" style={{ backgroundColor: t.surfaceContainer }}>
              <SectionHeading icon={Sparkles} label="Supplier branding" />
              <div className="space-y-5">
                <Field label="Store name">
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full rounded text-sm px-3 py-2 focus:outline-none transition-colors"
                    style={{
                      backgroundColor: t.surfaceContainerLowest,
                      border: `1px solid ${t.outlineVariant}`,
                      color: t.onSurface,
                    }}
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
                        <img alt="Store logo preview" className="w-full h-full object-contain rounded-full" src={storeLogo} />
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
                        {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" strokeWidth={1.75} /> : <Upload className="w-3.5 h-3.5" strokeWidth={1.75} />}
                        Upload logo
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
                    <input type="file" ref={logoInputRef} onChange={handleLogoFileChange} accept="image/*" className="hidden" />
                  </div>
                  <p className="text-xs mt-2" style={{ color: t.onSurfaceVariant }}>
                    Supports JPG and PNG. Best aspect ratio is 1:1 square.
                  </p>
                </Field>
              </div>
            </section>

            {/* Store Settings & Policies */}
            <section className="rounded-lg p-4 md:p-5 space-y-5" style={{ backgroundColor: t.surfaceContainer }}>
              <SectionHeading icon={Sliders} label="Store settings & logistics" />

              <div className="space-y-4">
                {/* <Field label="Store URL slug">
                  <input
                    type="text"
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(e.target.value)}
                    className="w-full rounded text-sm px-3 py-2 focus:outline-none transition-colors"
                    style={{
                      backgroundColor: t.surfaceContainerLowest,
                      border: `1px solid ${t.outlineVariant}`,
                      color: t.onSurface,
                    }}
                    placeholder="e.g. movieplex_hub"
                  />
                  <p className="text-[10px] mt-1 text-zinc-500">
                    Your store will be live at: {storefrontUrl} (Unique ID. Cannot be changed without admin approval).
                  </p>
                </Field> */}

                <Field label="Store Banner Image">
                  <div className="space-y-3">
                    {storeBanner && (
                      <div className="relative w-full h-32 rounded overflow-hidden border" style={{ borderColor: t.outlineVariant }}>
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
                        style={{
                          backgroundColor: t.surfaceContainerHigh,
                          border: `1px solid ${t.outlineVariant}`,
                          color: t.onSurface,
                          opacity: bannerUploading ? 0.6 : 1,
                        }}
                      >
                        {bannerUploading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{bannerUploading ? `Uploading… ${bannerUploadProgress}%` : "Upload Banner"}</span>
                      </button>
                      {storeBanner && !bannerUploading && (
                        <button
                          type="button"
                          onClick={() => setStoreBanner("")}
                          className="text-xs font-semibold"
                          style={{ color: t.error }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input type="file" ref={bannerInputRef} onChange={handleBannerFileChange} accept="image/*" className="hidden" />
                  </div>
                  <p className="text-xs mt-2" style={{ color: t.onSurfaceVariant }}>
                    Supports JPG and PNG. Recommended aspect ratio is 16:9 or 3:1 for best results.
                  </p>
                </Field>

                <Field label="Store description">
                  <textarea
                    rows={3}
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                    className="w-full rounded text-sm px-3 py-2 focus:outline-none transition-colors resize-none"
                    style={{
                      backgroundColor: t.surfaceContainerLowest,
                      border: `1px solid ${t.outlineVariant}`,
                      color: t.onSurface,
                    }}
                    placeholder="Short description of your store"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Contact Email">
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full rounded text-sm px-3 py-2 focus:outline-none transition-colors"
                      style={{
                        backgroundColor: t.surfaceContainerLowest,
                        border: `1px solid ${t.outlineVariant}`,
                        color: t.onSurface,
                      }}
                    />
                  </Field>

                  <Field label="Contact Phone">
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full rounded text-sm px-3 py-2 focus:outline-none transition-colors"
                      style={{
                        backgroundColor: t.surfaceContainerLowest,
                        border: `1px solid ${t.outlineVariant}`,
                        color: t.onSurface,
                      }}
                    />
                  </Field>
                </div>

                <Field label="Business Address">
                  <textarea
                    rows={2}
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className="w-full rounded text-sm px-3 py-2 focus:outline-none transition-colors resize-none"
                    style={{
                      backgroundColor: t.surfaceContainerLowest,
                      border: `1px solid ${t.outlineVariant}`,
                      color: t.onSurface,
                    }}
                  />
                </Field>

                <Field label="Shipping Address">
                  <textarea
                    rows={2}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full rounded text-sm px-3 py-2 focus:outline-none transition-colors resize-none"
                    style={{
                      backgroundColor: t.surfaceContainerLowest,
                      border: `1px solid ${t.outlineVariant}`,
                      color: t.onSurface,
                    }}
                  />
                </Field>

                <Field label="Privacy Policy">
                  <textarea
                    rows={4}
                    value={privacyPolicy}
                    onChange={(e) => setPrivacyPolicy(e.target.value)}
                    className="w-full rounded text-sm px-3 py-2 focus:outline-none transition-colors"
                    style={{
                      backgroundColor: t.surfaceContainerLowest,
                      border: `1px solid ${t.outlineVariant}`,
                      color: t.onSurface,
                    }}
                    placeholder="Enter Privacy Policy terms for your customers"
                  />
                </Field>

                <Field label="Terms of Service">
                  <textarea
                    rows={4}
                    value={termsOfService}
                    onChange={(e) => setTermsOfService(e.target.value)}
                    className="w-full rounded text-sm px-3 py-2 focus:outline-none transition-colors"
                    style={{
                      backgroundColor: t.surfaceContainerLowest,
                      border: `1px solid ${t.outlineVariant}`,
                      color: t.onSurface,
                    }}
                    placeholder="Enter Terms of Service terms for your customers"
                  />
                </Field>

                <ToggleRow
                  title="Allow Returns & Exchanges"
                  description="Allow customers to request returns or exchanges for their orders."
                  checked={returnPolicy}
                  onChange={() => setReturnPolicy(!returnPolicy)}
                  disabled={!adminReturnPolicyAllowed}
                />

                <ToggleRow
                  title="Allow Cancellations"
                  description="Allow customers to cancel their orders before they are shipped."
                  checked={cancellationPolicy}
                  onChange={() => setCancellationPolicy(!cancellationPolicy)}
                  disabled={!adminCancellationPolicyAllowed}
                />

                <ToggleRow
                  title="Allow Cash on Delivery (COD)"
                  description="Enable COD payments for orders in your store (Global policies apply)."
                  checked={codEnabled}
                  onChange={() => {
                    if (kycStatus?.toUpperCase() !== "APPROVED") {
                      showToast("You cannot disable Cash on Delivery while KYC verification is not completed/approved.", "error");
                      return;
                    }
                    if (!onlinePaymentEnabled && codEnabled) {
                      showToast("You must keep at least one payment method enabled.", "error");
                      return;
                    }
                    setCodEnabled(!codEnabled);
                  }}
                />

                <div className="pt-4 border-t border-white/5 space-y-3">
                  {kycStatus?.toUpperCase() === "APPROVED" ? (
                    <ToggleRow
                      title="Online Payments "
                      description="Accept credit card, debit card, and UPI payments from customers."
                      checked={onlinePaymentEnabled}
                      onChange={() => {
                        if (!codEnabled && onlinePaymentEnabled) {
                          showToast("You must keep at least one payment method enabled.", "error");
                          return;
                        }
                        setOnlinePaymentEnabled(!onlinePaymentEnabled);
                      }}
                    />
                  ) : (
                    <div className="flex justify-between items-center text-xs font-semibold py-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-zinc-200">Online Payments </span>
                        <span className="text-[10px] text-zinc-400 font-normal">Accept credit card, debit card, and UPI payments from customers.</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase">Disabled</span>
                    </div>
                  )}

                  {kycStatus?.toUpperCase() !== "APPROVED" && (
                    <div className="rounded border border-yellow-500/20 bg-yellow-500/5 p-3 flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-medium text-yellow-200/90">KYC verification required to accept online payments</p>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          Only sellers with an approved KYC verification can accept online payments from their customers. Complete your KYC profile to start receiving online payouts.
                        </p>
                        <button
                          type="button"
                          onClick={() => router.push("/dashboard/settings/kyc")}
                          className="text-[10px] font-bold text-[#b6b2ff] hover:underline text-left mt-1"
                        >
                          Complete Seller KYC &rarr;
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Website appearance template */}
            <section className="rounded-lg p-4 md:p-5" style={{ backgroundColor: t.surfaceContainer }}>
              <SectionHeading icon={Layout} label="Website appearance template" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <TemplateCard
                  active={templateId === "glass_monochrome"}
                  onClick={() => handleTemplateChange("glass_monochrome")}
                  name="Glass monochrome"
                  description="Translucent frosted-glass panels with glowing neon accents."
                  preview={
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center">
                      <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded border border-white/20" />
                    </div>
                  }
                />
                <TemplateCard
                  active={templateId === "organic_minimalist"}
                  onClick={() => handleTemplateChange("organic_minimalist")}
                  name="Organic minimalist"
                  description="Serene palettes, soft curves, and natural editorial vibe."
                  preview={
                    <div className="absolute inset-0 bg-[#1a1918] flex items-center justify-center p-2">
                      <div className="w-full h-full border border-stone-800 rounded-sm" />
                    </div>
                  }
                />
                <TemplateCard
                  active={templateId === "cyber_neon_dark"}
                  onClick={() => handleTemplateChange("cyber_neon_dark")}
                  name="Cyber-neon dark"
                  description="Stark dark backdrop with vibrant glowing borders."
                  preview={
                    <div className="absolute inset-0 bg-zinc-950 flex flex-col justify-center gap-1 p-2">
                      <div className="h-1 w-full bg-emerald-500/20 blur-[1px]" />
                      <div className="h-1 w-2/3 bg-emerald-500/20 blur-[1px]" />
                    </div>
                  }
                />
                <TemplateCard
                  active={templateId === "monochrome_precision"}
                  onClick={() => handleTemplateChange("monochrome_precision")}
                  name="Monochrome precision"
                  description="Stark interfaces with hairline borders and high cognitive speed."
                  preview={
                    <div className="absolute inset-0 flex flex-col p-2 gap-1.5">
                      <div className="h-3 w-1/2 bg-white" />
                      <div className="flex gap-1">
                        <div className="h-8 flex-1 bg-zinc-900 border border-zinc-800" />
                        <div className="h-8 flex-1 bg-zinc-900 border border-zinc-800" />
                      </div>
                    </div>
                  }
                />
              </div>
            </section>

            {/* Theme palette */}
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
                      className="p-2.5 rounded-md cursor-pointer transition-colors flex items-center gap-2.5"
                      style={{
                        border: active ? `1px solid ${t.primary}` : `1px solid ${t.outlineVariant}`,
                        backgroundColor: active ? t.surfaceContainerHigh : "transparent",
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-full shrink-0"
                        style={{
                          border: `1px solid ${t.outlineVariant}`,
                          background: `linear-gradient(135deg, ${theme.colors.accent} 0%, ${theme.colors.primary} 50%, ${theme.colors.background} 100%)`,
                        }}
                      />
                      <p className="text-xs font-medium truncate" style={{ color: t.onSurface }}>
                        {theme.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Functionality settings */}
            <section className="rounded-lg p-4 md:p-5" style={{ backgroundColor: t.surfaceContainer }}>
              <SectionHeading icon={Sliders} label="Functionality settings" />
              <div>
                <ToggleRow
                  title="Show related products"
                  description="Display other catalog items at the bottom of the product page."
                  checked={showRelatedProducts}
                  onChange={() => setShowRelatedProducts(!showRelatedProducts)}
                />
                <ToggleRow
                  title="Enable Instagram checkout"
                  description="Direct customers to Instagram to complete their purchase."
                  checked={enableInstagramButton}
                  onChange={() => setEnableInstagramButton(!enableInstagramButton)}
                />
                <ToggleRow
                  title="Enable WhatsApp redirection"
                  description="Let customers ask questions or order over WhatsApp."
                  checked={enableWhatsAppButton}
                  onChange={() => setEnableWhatsAppButton(!enableWhatsAppButton)}
                  last
                />
              </div>
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
                    style={{
                      backgroundColor: previewDevice === "desktop" ? t.surfaceContainerHigh : "transparent",
                      color: previewDevice === "desktop" ? t.onSurface : t.outline,
                    }}
                  >
                    <Laptop className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className="p-1.5 rounded transition-colors"
                    style={{
                      backgroundColor: previewDevice === "mobile" ? t.surfaceContainerHigh : "transparent",
                      color: previewDevice === "mobile" ? t.onSurface : t.outline,
                    }}
                  >
                    <Smartphone className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              {/* Browser mockup */}
              <div
                className={cn(
                  "rounded-lg overflow-hidden transition-all duration-300 shadow-2xl",
                  previewDevice === "mobile" ? "max-w-[340px] h-[580px] mx-auto" : "h-[540px] w-full"
                )}
                style={{ border: `1px solid ${t.outlineVariant}`, backgroundColor: "#000000" }}
              >
                {/* Browser bar */}
                <div className="px-4 py-2.5 flex items-center justify-between shrink-0" style={{ backgroundColor: "#18181b", borderBottom: `1px solid ${t.outlineVariant}` }}>
                  <div className="flex gap-1.5 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#FF5F57]" />
                    <div className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
                    <div className="w-2 h-2 rounded-full bg-[#27C93F]" />
                  </div>
                  <div
                    className="px-3 py-1 rounded text-[10px] flex items-center gap-1.5 select-none overflow-hidden max-w-[200px]"
                    style={{ backgroundColor: t.surfaceContainer, color: t.onSurfaceVariant, border: `1px solid ${t.outlineVariant}` }}
                  >
                    <Lock className="w-2.5 h-2.5 shrink-0" strokeWidth={1.75} />
                    <span className="truncate">{activeAccount?.username || "elenarossi"}.dm/store</span>
                  </div>
                  <div className="w-8" />
                </div>

                {/* View switcher */}
                <div className="px-4 py-2 flex items-center gap-2 shrink-0" style={{ backgroundColor: "rgba(0,0,0,0.6)", borderBottom: `1px solid ${t.outlineVariant}` }}>
                  <button
                    onClick={() => setPreviewMode("catalog")}
                    className="px-2 py-1 text-[10px] font-medium rounded transition-colors"
                    style={{
                      backgroundColor: previewMode === "catalog" ? t.primary : "transparent",
                      color: previewMode === "catalog" ? t.onPrimary : t.onSurfaceVariant,
                    }}
                  >
                    Catalog
                  </button>
                  <button
                    onClick={() => setPreviewMode("pdp")}
                    className="px-2 py-1 text-[10px] font-medium rounded transition-colors"
                    style={{
                      backgroundColor: previewMode === "pdp" ? t.primary : "transparent",
                      color: previewMode === "pdp" ? t.onPrimary : t.onSurfaceVariant,
                    }}
                  >
                    Product page
                  </button>
                </div>

                {/* Store content viewport */}
                <div className="relative h-[calc(100%-80px)] w-full">
                  <div className={cn("h-full overflow-y-auto custom-scrollbar p-4 flex flex-col justify-between", previewStyles.bodyClass, previewStyles.fontBody)}>
                    <div>
                      {/* Store header */}
                      <div className={cn("pb-3 mb-6 border-b flex items-center justify-between", previewStyles.navClass)}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 flex items-center justify-center border border-white/15">
                            {storeLogo ? (
                              <img alt="Logo" className="w-full h-full object-cover" src={storeLogo} />
                            ) : (
                              <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.75} />
                            )}
                          </div>
                          <span className={cn("font-medium tracking-tight text-xs", previewStyles.textColorClass)}>{storeName || "Elena Rossi"}</span>
                        </div>
                        <div className="flex gap-3 text-[10px] font-medium">
                          <span>Shop</span>
                          <span>Story</span>
                        </div>
                      </div>

                      {previewMode === "catalog" ? (
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <div className="text-center py-2 space-y-1">
                              <h2 className={cn("text-lg font-semibold leading-tight", previewStyles.fontHeadline, previewStyles.textColorClass)}>
                                {storeName || "Elena Rossi"}
                              </h2>
                              <p className={cn("text-[10px] max-w-[200px] mx-auto leading-normal", previewStyles.textMutedClass)}>
                                Signature collections curated with delicate precision.
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {[1, 2].map((idx) => (
                                <div key={idx} className={cn("flex flex-col p-2 rounded-md border", previewStyles.cardClass)}>
                                  <div className="aspect-[4/5] rounded overflow-hidden relative bg-zinc-800">
                                    <img src={`https://picsum.photos/seed/product_${idx}/200/250`} alt="Mock product" className="w-full h-full object-cover opacity-80" />
                                  </div>
                                  <div className="pt-2 flex flex-col gap-1">
                                    <span className={cn("font-medium truncate text-[10px]", previewStyles.textColorClass)}>
                                      {idx === 1 ? "Signature silk wrap" : "Linen summer trouser"}
                                    </span>
                                    <span className={cn("font-bold text-[10px] tracking-tight", previewStyles.priceClass)} style={monoStat}>
                                      {idx === 1 ? "420.00 USD" : "180.00 USD"}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <div className="space-y-4">
                            <div className={cn("flex gap-3", previewDevice === "mobile" ? "flex-col" : "flex-row")}>
                              <div className={cn("aspect-square rounded-md overflow-hidden bg-zinc-900 border border-white/10 shrink-0", previewDevice === "mobile" ? "w-full" : "w-[45%]")}>
                                <img src="https://picsum.photos/seed/product_1/400/500" alt="Mock product detail" className="w-full h-full object-cover opacity-80" />
                              </div>
                              <div className="flex-1 space-y-3 w-full">
                                <div className="space-y-1">
                                  <span
                                    className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide inline-block"
                                    style={{ backgroundColor: "rgba(143,227,255,0.1)", border: "1px solid rgba(143,227,255,0.2)", color: t.accentCyan }}
                                  >
                                    New arrival
                                  </span>
                                  <h2 className={cn("text-xs font-semibold tracking-tight leading-tight", previewStyles.textColorClass)}>
                                    Elena Rossi signature silk wrap
                                  </h2>
                                  <p className={cn("font-bold text-xs", previewStyles.priceClass)} style={monoStat}>
                                    420.00 USD
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <span className={cn("text-[9px] font-medium block", previewStyles.textMutedClass)}>Select size</span>
                                  <div className="flex gap-1">
                                    {["S", "M", "L"].map((v, i) => (
                                      <span
                                        key={v}
                                        className={cn(
                                          "w-6 h-6 flex items-center justify-center text-[10px] border font-medium rounded",
                                          i === 0 ? "bg-white text-black border-white" : "bg-white/5 text-white border-white/10"
                                        )}
                                      >
                                        {v}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-1.5 pt-1">
                                  {enableInstagramButton && (
                                    <button className={cn("w-full py-2 font-medium text-[10px] flex items-center justify-center gap-1.5 rounded cursor-pointer", previewStyles.instagramButtonClass)}>
                                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                                      </svg>
                                      <span>Purchase on Instagram</span>
                                    </button>
                                  )}
                                  {enableWhatsAppButton && (
                                    <button className={cn("w-full py-2 font-medium text-[10px] flex items-center justify-center gap-1.5 rounded cursor-pointer", previewStyles.whatsappButtonClass)}>
                                      <MessageSquare className="w-3 h-3" strokeWidth={1.75} />
                                      <span>Order via WhatsApp</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {showRelatedProducts && (
                              <div className="pt-4 border-t border-white/5 space-y-2">
                                <h4 className={cn("text-[9px] font-medium", previewStyles.textColorClass)}>You might also like</h4>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className={cn("p-1.5 rounded flex items-center gap-2", previewStyles.cardClass)}>
                                    <div className="w-7 h-9 bg-zinc-800 rounded overflow-hidden shrink-0">
                                      <img src="https://picsum.photos/seed/product_2/100/120" className="w-full h-full object-cover" alt="Related" />
                                    </div>
                                    <div className="overflow-hidden space-y-0.5">
                                      <span className={cn("font-medium truncate text-[10px] block", previewStyles.textColorClass)}>Linen trouser</span>
                                      <span className={cn("font-bold text-[9px]", previewStyles.priceClass)} style={monoStat}>180 USD</span>
                                    </div>
                                  </div>
                                  <div className={cn("p-1.5 rounded flex items-center gap-2", previewStyles.cardClass)}>
                                    <div className="w-7 h-9 bg-zinc-800 rounded overflow-hidden shrink-0">
                                      <img src="https://picsum.photos/seed/product_3/100/120" className="w-full h-full object-cover" alt="Related" />
                                    </div>
                                    <div className="overflow-hidden space-y-0.5">
                                      <span className={cn("font-medium truncate text-[10px] block", previewStyles.textColorClass)}>Cotton cap</span>
                                      <span className={cn("font-bold text-[9px]", previewStyles.priceClass)} style={monoStat}>60 USD</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Unified Storefront Preview Footer */}
                    <div className={cn("text-center py-4 border-t border-white/5 text-[9px] mt-8 space-y-2 shrink-0", previewStyles.textMutedClass)}>
                      <p>© 2026 {storeName || "Elena Rossi"}. Powered by AnyDM.</p>
                      
                      {/* Contact Info rendered directly as text */}
                      {(contactEmail || contactPhone || shippingAddress) && (
                        <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 opacity-80">
                          {contactEmail && <span>Email: {contactEmail}</span>}
                          {contactPhone && <span>Phone: {contactPhone}</span>}
                          {shippingAddress && <span>Address: {shippingAddress}</span>}
                        </div>
                      )}

                      {/* Clickable Policy Links */}
                      <div className="flex justify-center gap-3 mt-1.5">
                        <button onClick={() => setActivePreviewModal("privacy")} className="hover:underline focus:outline-none">Privacy Policy</button>
                        <button onClick={() => setActivePreviewModal("terms")} className="hover:underline focus:outline-none">Terms of Service</button>
                      </div>
                    </div>
                  </div>

                  {/* Preview Modal Overlay inside frame */}
                  {activePreviewModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3">
                      <div className="w-full max-w-[260px] rounded-lg border border-white/10 p-3.5 shadow-2xl bg-[#1e1e24] text-white space-y-3 max-h-[85%] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#b6b2ff]">
                            {activePreviewModal === "privacy" ? "Privacy Policy" : "Terms of Service"}
                          </span>
                          <button 
                            onClick={() => setActivePreviewModal(null)} 
                            className="p-0.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[9px] text-zinc-305 leading-relaxed whitespace-pre-wrap pt-1 text-left">
                          {activePreviewModal === "privacy" 
                            ? (privacyPolicy || "We value your privacy. Your personal information is exclusively used to fulfill your orders.")
                            : (termsOfService || "By browsing this store and placing orders, you agree to comply with our terms and conditions.")
                          }
                        </div>
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

/* ---------- Local presentational helpers ---------- */

function SectionHeading({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <Icon className="w-4 h-4" style={{ color: t.onSurfaceVariant }} strokeWidth={1.75} />
      <h2 className="text-[13px] font-medium tracking-[0.01em]" style={{ color: t.onSurface }}>
        {label}
      </h2>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs mb-1.5 block font-medium" style={{ color: t.onSurfaceVariant }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function TemplateCard({
  active,
  onClick,
  name,
  description,
  preview,
}: {
  active: boolean;
  onClick: () => void;
  name: string;
  description: string;
  preview: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className="rounded-md p-3 cursor-pointer transition-colors flex flex-col justify-between"
      style={{
        border: active ? `1px solid ${t.primary}` : `1px solid ${t.outlineVariant}`,
        backgroundColor: active ? t.surfaceContainerHigh : "transparent",
      }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-medium" style={{ color: t.onSurface }}>
          {name}
        </span>
        {active ? (
          <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: t.primary }}>
            <Check className="w-2.5 h-2.5" style={{ color: t.onPrimary }} strokeWidth={3} />
          </div>
        ) : (
          <div className="w-4 h-4 rounded-full" style={{ border: `1px solid ${t.outlineVariant}` }} />
        )}
      </div>
      <div className="h-16 rounded overflow-hidden relative" style={{ border: `1px solid ${t.outlineVariant}`, backgroundColor: t.surfaceContainerLow }}>
        {preview}
      </div>
      <p className="text-[11px] leading-normal mt-2" style={{ color: t.onSurfaceVariant }}>
        {description}
      </p>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  last = false,
  disabled = false,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  last?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between py-3.5", disabled && "opacity-40")} style={!last ? { borderBottom: `1px solid ${t.outlineVariant}` } : undefined}>
      <div className="pr-4">
        <h4 className="text-xs font-medium" style={{ color: t.onSurface }}>
          {title}
        </h4>
        <p className="text-[11px] mt-0.5" style={{ color: t.onSurfaceVariant }}>
          {description}
        </p>
      </div>
      <button
        onClick={disabled ? undefined : onChange}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none",
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        )}
        style={{ backgroundColor: checked ? t.primary : t.surfaceContainerHigh }}
      >
        <span
          className="pointer-events-none inline-block h-4 w-4 mt-0.5 transform rounded-full transition duration-200 ease-in-out"
          style={{
            transform: checked ? "translateX(18px)" : "translateX(2px)",
            backgroundColor: checked ? (disabled ? t.outline : t.onPrimary) : t.outline,
          }}
        />
      </button>
    </div>
  );
}