"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProductUrl, getTermsUrl, getPrivacyUrl, getStorefrontPreviewUrl } from "@/lib/utils/domain";
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
  ChevronUp,
  Trash2,
  Pencil,
  ExternalLink,
  Copy,
  Image as ImageIcon,
} from "lucide-react";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/services/cloudinary.service";
import { CarouselSlide } from "@/lib/utils/domain";

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
  accentCyan: "#c4c0ff",
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
      { id: "frosted", name: "Ice blue", colors: { primary: "#ffffff", background: "#0a1128", accent: "#c4c0ff" } },
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
  const searchParams = useSearchParams();

  const appUser = useSelector((state: RootState) => state.auth.user);
  const instagramAccounts = useSelector((state: RootState) => state.auth.instagramAccounts);
  const activeAccount = instagramAccounts.find((acc) => acc.id === appUser?.active_instagram_account_id) || instagramAccounts[0];

  const hasPaidPro = Boolean(
    (appUser?.pro_purchase_count && appUser.pro_purchase_count > 0) ||
    appUser?.has_paid_pro ||
    appUser?.is_superuser
  );

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

  const [customDomain, setCustomDomain] = useState("");
  const [isCustomDomainVerified, setIsCustomDomainVerified] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [cfSyncing, setCfSyncing] = useState(false);
  const [cfStatus, setCfStatus] = useState<{ status: string; message: string } | null>(null);
  const [showDnsWarning, setShowDnsWarning] = useState(false);
  const [showMobilePreviewModal, setShowMobilePreviewModal] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const slugInputRef = useRef<HTMLInputElement>(null);
  const customDomainInputRef = useRef<HTMLInputElement>(null);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [isEditingCustomDomain, setIsEditingCustomDomain] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerUploadProgress, setBannerUploadProgress] = useState(0);

  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([]);
  const [carouselInterval, setCarouselInterval] = useState<number>(5);
  const [carouselUploading, setCarouselUploading] = useState<boolean>(false);
  const carouselInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [activeProductPickerSlideId, setActiveProductPickerSlideId] = useState<string | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState<string>("");

  const [cornerRadius, setCornerRadius] = useState<string>("rounded");
  const [fontFamily, setFontFamily] = useState<string>("inter");
  const [announcementText, setAnnouncementText] = useState<string>("✦ Fast Doorstep Delivery & Easy Returns | 100% Genuine Products");

  const filteredProducts = products.filter((p) => {
    if (!productSearchQuery.trim()) return true;
    const q = productSearchQuery.toLowerCase();
    const title = (p.title || p.name || "").toLowerCase();
    return title.includes(q);
  });

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSyncCloudflare = async () => {
    if (!customDomain) {
      showToast("Please enter a custom domain first.", "error");
      return;
    }
    setCfSyncing(true);
    setCfStatus(null);
    setShowDnsWarning(true);
    try {
      const res = await api.post("/accounts/website-settings/sync-cloudflare/");
      if (res.data?.cloudflare) {
        const cf = res.data.cloudflare;
        if (cf.status === "success") {
          setCfStatus({ status: "success", message: "Domain registered & SSL security certificate provisioned!" });
          showToast("Domain connected & SSL provisioned!", "success");
        } else {
          setCfStatus({ status: "info", message: cf.message || "Domain saved. Configure DNS records below." });
          showToast(cf.message || "Domain saved. Configure DNS below.", "info");
        }
      } else {
        setCfStatus({ status: "info", message: "Domain saved. Configure DNS CNAME record as shown below." });
      }
    } catch (err: any) {
      setCfStatus({ status: "error", message: err.response?.data?.error || "SSL provisioning failed. Please try again." });
    } finally {
      setCfSyncing(false);
    }
  };

  const showToast = (msg: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  const handleCarouselUpload = async (file: File) => {
    setCarouselUploading(true);
    try {
      const res = await uploadToCloudinary(file);
      if (res?.secure_url) {
        const newSlide: CarouselSlide = {
          id: `slide_${Date.now()}`,
          image_url: res.secure_url,
          public_id: res.public_id || "",
          link_url: "",
          title: "",
          subtitle: "",
        };
        setCarouselSlides((prev) => [...prev, newSlide]);
        showToast("Carousel slide uploaded successfully.", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to upload carousel slide.", "error");
    } finally {
      setCarouselUploading(false);
    }
  };

  const handleDeleteCarouselSlide = async (slide: CarouselSlide) => {
    if (slide.image_url || slide.public_id) {
      deleteFromCloudinary(slide.public_id || slide.image_url);
    }
    setCarouselSlides((prev) => prev.filter((s) => s.id !== slide.id));
    showToast("Slide removed.", "info");
  };

  const handleUpdateCarouselSlide = (id: string, updates: Partial<CarouselSlide>) => {
    setCarouselSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleMoveCarouselSlide = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= carouselSlides.length) return;
    const updated = [...carouselSlides];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setCarouselSlides(updated);
  };

  useEffect(() => {
    loadWebsiteSettings(true);
  }, [activeAccount]);

  const loadWebsiteSettings = async (isInitial = false) => {
    if (isInitial) setInitialLoading(true);
    try {
      const response = await api.get("/accounts/website-settings/");
      if (response.data) {
        const d = response.data;
        setStoreName(d.store_name || "");
        let initialLogo = d.store_logo || "";
        const fallbackLogo = activeAccount?.profile_picture_url || appUser?.photo_url || appUser?.profile_picture_url || "";
        if (!initialLogo && fallbackLogo) {
          initialLogo = fallbackLogo;
        }

        if (initialLogo) {
          if (initialLogo.includes("cloudinary.com")) {
            setStoreLogo(initialLogo);
          } else {
            // Upload direct Instagram / external profile image to Cloudinary
            uploadToCloudinary(initialLogo)
              .then((res) => {
                if (res?.secure_url) {
                  setStoreLogo(res.secure_url);
                  api.put("/accounts/website-settings/", { store_logo: res.secure_url }).catch(() => {});
                } else {
                  setStoreLogo(initialLogo);
                }
              })
              .catch(() => {
                setStoreLogo(initialLogo);
              });
          }
        } else {
          setStoreLogo("");
        }

        setStoreSlug(d.store_slug || "");
        setCustomDomain(d.custom_domain || "");
        setIsCustomDomainVerified(!!d.custom_domain_verified);
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
        setCarouselSlides(Array.isArray(cSettings.carousel_slides) ? cSettings.carousel_slides : []);
        setCarouselInterval(typeof cSettings.carousel_interval === "number" ? cSettings.carousel_interval : 5);
        setCornerRadius(cSettings.corner_radius || "rounded");
        setFontFamily(cSettings.font_family || "inter");
        setAnnouncementText(cSettings.announcement_text !== undefined ? cSettings.announcement_text : "✦ Fast Doorstep Delivery & Easy Returns | 100% Genuine Products");
      }
      try {
        setLoadingProducts(true);
        const prodRes = await api.get("/products/");
        const pData = prodRes.data?.results || prodRes.data;
        if (Array.isArray(pData)) {
          setProducts(pData);
        }
      } catch (pErr) {
        console.warn("Could not load products for slide redirect selector:", pErr);
      } finally {
        setLoadingProducts(false);
      }
      try {
        const kycRes = await api.get("/crm/seller/kyc/");
        if (kycRes.data?.status) {
          const status = kycRes.data.status;
          setKycStatus(status);
          if (status.toUpperCase() !== "APPROVED") setCodEnabled(true);
        }
      } catch { }
    } catch (e) {
      if (isInitial) {
        // showToast("Using local storefront configs.", "info");
        setStoreName(activeAccount?.full_name || activeAccount?.username || "");
        const fallbackLogo = activeAccount?.profile_picture_url || appUser?.photo_url || appUser?.profile_picture_url || "";
        if (fallbackLogo) {
          if (fallbackLogo.includes("cloudinary.com")) {
            setStoreLogo(fallbackLogo);
          } else {
            uploadToCloudinary(fallbackLogo)
              .then((res) => {
                if (res?.secure_url) {
                  setStoreLogo(res.secure_url);
                } else {
                  setStoreLogo(fallbackLogo);
                }
              })
              .catch(() => setStoreLogo(fallbackLogo));
          }
        } else {
          setStoreLogo("");
        }
        setStoreSlug("");
        setCustomDomain("");
      }
    } finally {
      if (isInitial) setInitialLoading(false);
    }
  };

  const handleSaveSettings = async (overrides?: any) => {
    setLoading(true);
    const validOverrides = (overrides && typeof overrides === 'object' && !('nativeEvent' in overrides) && !('target' in overrides)) ? overrides : {};
    const payload = {
      store_name: storeName,
      store_logo: storeLogo,
      store_slug: storeSlug,
      custom_domain: customDomain,
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
      custom_settings: {
        ...customSettings,
        order_track_retry_limit: orderTrackRetryLimit,
        carousel_slides: carouselSlides,
        carousel_interval: carouselInterval,
        corner_radius: cornerRadius,
        font_family: fontFamily,
        announcement_text: announcementText,
      },
      ...validOverrides,
    };
    try {
      await api.put("/accounts/website-settings/", payload);
      showToast("Store settings saved.", "success");
      await loadWebsiteSettings(false);
    } catch (err: any) {
      const data = err.response?.data;
      let msg = "Couldn't save settings. Try again.";
      if (typeof data === "string") {
        msg = data;
      } else if (data && typeof data === "object") {
        msg = data.error || data.detail || data.message || Object.values(data).flat().join(", ");
      } else if (err.message) {
        msg = err.message;
      }
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSlugEdit = async () => {
    if (isEditingSlug) {
      setIsEditingSlug(false);
      await handleSaveSettings({ store_slug: storeSlug });
    } else {
      setIsEditingSlug(true);
      setTimeout(() => slugInputRef.current?.focus(), 50);
    }
  };

  const handleConfirmCustomDomainEdit = async () => {
    if (!hasPaidPro) {
      showToast("Custom Domain mapping requires a paid Pro Plan (₹499). Please upgrade your account.", "error");
      return;
    }
    if (isEditingCustomDomain) {
      setIsEditingCustomDomain(false);
      await handleSaveSettings({ custom_domain: customDomain });
      if (customDomain) {
        await handleSyncCloudflare();
      }
    } else {
      setIsEditingCustomDomain(true);
      setTimeout(() => customDomainInputRef.current?.focus(), 50);
    }
  };

  const performLogoUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    try {
      const res = await uploadToCloudinary(file, {
        onProgress: (pct) => setUploadProgress(pct),
      });
      if (res?.secure_url) {
        setStoreLogo(res.secure_url);
        showToast("Logo uploaded.", "success");
      }
    } catch {
      showToast("Upload failed.", "error");
    } finally {
      setUploading(false);
    }
  };

  const performBannerUpload = async (file: File) => {
    setBannerUploading(true);
    setBannerUploadProgress(0);
    try {
      const res = await uploadToCloudinary(file, {
        onProgress: (pct) => setBannerUploadProgress(pct),
      });
      if (res?.secure_url) {
        setStoreBanner(res.secure_url);
        showToast("Banner uploaded.", "success");
      }
    } catch {
      showToast("Banner upload failed.", "error");
    } finally {
      setBannerUploading(false);
    }
  };

  const handleTemplateChange = (id: string) => {
    setTemplateId(id);
    const tmpl = TEMPLATE_PRESETS.find((t) => t.id === id);
    if (tmpl) setThemeId(tmpl.defaultThemeId);
  };

  const selectedTemplate = TEMPLATE_PRESETS.find((t) => t.id === templateId) || TEMPLATE_PRESETS[0];
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "zoyee.in";
  const activeSlugOrUsername = storeSlug || activeAccount?.username || "mystore";
  const baseRootDomain = rootDomain.replace(/^app\./, "");
  const subdomainUrl = `https://${activeSlugOrUsername}.${baseRootDomain}`;
  const cleanedCustomDomain = customDomain ? customDomain.replace(/^https?:\/\//, "").replace(/\/$/, "") : "";
  const customDomainUrl = cleanedCustomDomain ? `https://${cleanedCustomDomain}` : "";

  // Priority 1: Custom domain (if configured & verified)
  // Priority 2: Subdomain (e.g. https://12.zoyee.in)
  const storefrontUrl = getStorefrontPreviewUrl({
    username: activeAccount?.username,
    storeSlug,
    customDomain,
    isCustomDomainVerified,
  });
  const displayPreviewUrl = storefrontUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const activePreviewUrlString = `${displayPreviewUrl}${previewMode === "pdp" ? "/product/61" : ""}`;

  const handlePreviewLiveStore = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!cleanedCustomDomain) {
      window.open(subdomainUrl, "_blank", "noopener,noreferrer");
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      await fetch(customDomainUrl, { mode: "no-cors", signal: controller.signal });
      clearTimeout(timeoutId);
      window.open(customDomainUrl, "_blank", "noopener,noreferrer");
    } catch {
      showToast(`Custom domain (${cleanedCustomDomain}) DNS/CNAME not configured. Opening subdomain...`, "info");
      window.open(subdomainUrl, "_blank", "noopener,noreferrer");
    }
  };

  const previewStyles: TemplateStyle = getTemplateStyles(templateId, themeId, {
    corner_radius: cornerRadius,
    font_family: fontFamily,
  });
  const previewStoreName = storeName || activeAccount?.full_name || "My Store";

  const previewProductsList = products.length > 0
    ? products.slice(0, 10).map((p, idx) => ({
      id: p.id || idx,
      name: p.title || p.name || `Product #${p.id || idx + 1}`,
      price: p.price ? (String(p.price).includes("₹") ? String(p.price) : `₹${p.price}`) : "₹1,499",
      image: p.main_media_url || p.image_url || p.images?.[0] || `/icons/dark-placeholder.png`,
      discount: idx % 3 === 0 ? "-20%" : null,
    }))
    : [
      { id: 1, name: "Summer Silk Wrap Dress", price: "₹2,499", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80", discount: "-25%" },
      { id: 2, name: "Leather Crossbody Bag", price: "₹4,499", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80", discount: null },
      { id: 3, name: "Oversized Vintage Hoodie", price: "₹1,999", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&q=80", discount: "-15%" },
      { id: 4, name: "Minimalist Gold Chrono Watch", price: "₹5,999", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80", discount: null },
      { id: 5, name: "Urban Street Sneakers", price: "₹3,799", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", discount: "-30%" },
      { id: 6, name: "Classic Aviator Sunglasses", price: "₹1,299", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80", discount: null },
      { id: 7, name: "Handcrafted Ceramic Mug", price: "₹699", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80", discount: null },
      { id: 8, name: "Textured Cotton Linen Shirt", price: "₹2,199", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80", discount: "-10%" },
    ];

  const sectionIcons: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
    Branding: Sparkles,
    Settings: Sliders,
    Template: Layout,
    Theme: Palette,
  };

  const sections = ['Branding', 'Settings', 'Template', 'Theme'];
  const [activeSections, setActiveSectionState] = useState('Branding');

  const handleSectionChange = (section: string) => {
    setActiveSectionState(section);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", section.toLowerCase());
      window.history.replaceState(null, "", url.toString());
    }
  };

  useEffect(() => {
    if (!searchParams) return;
    const tabParam = searchParams.get("tab")?.toLowerCase();
    if (tabParam === "branding") {
      setActiveSectionState("Branding");
    } else if (tabParam === "template" || tabParam === "templates") {
      setActiveSectionState("Template");
    } else if (tabParam === "theme" || tabParam === "themes") {
      setActiveSectionState("Theme");
    } else if (tabParam === "settings" || tabParam === "setting") {
      setActiveSectionState("Settings");
    } else if (!tabParam) {
      setActiveSectionState("Branding");
    }
  }, [searchParams]);

  return (
    <div className="w-full space-y-6 pb-16" style={{ color: t.onSurface }}>
      <Toast message={toastMessage} isVisible={toastVisible} type={toastType} onClose={() => setToastVisible(false)} />

      {/* Header - 2 Line Layout */}
      <div className="sticky top-[100px] z-30 flex flex-col gap-3 pb-3 pt-4 -mt-6 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-[#444748]/10 bg-[#131313]">
        {/* Line 1: Title & Action Buttons */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <h1 className="text-base sm:text-xl font-bold tracking-tight truncate min-w-0">Website configuration</h1>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Mobile Preview Modal Trigger */}
            <button
              type="button"
              onClick={() => setShowMobilePreviewModal(true)}
              className="lg:hidden px-2.5 sm:px-3 py-2 rounded-md font-medium text-xs flex items-center gap-1.5 transition-colors hover:bg-white/5 cursor-pointer shrink-0"
              style={{ border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
            >
              <Smartphone className="w-4 h-4 text-emerald-400" strokeWidth={1.75} />
              <span>Preview</span>
            </button>

            <button
              type="button"
              onClick={handlePreviewLiveStore}
              className="hidden lg:flex px-4 py-2 rounded-md font-medium text-xs items-center gap-1.5 transition-colors hover:bg-white/5 cursor-pointer shrink-0"
              style={{ border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
            >
              <Eye className="w-4 h-4" strokeWidth={1.75} />
              Preview live store
            </button>
            <button
              onClick={() => handleSaveSettings()}
              disabled={loading}
              className="px-3 sm:px-4 py-2 rounded-md font-medium text-xs flex items-center gap-1.5 transition-opacity disabled:opacity-50 cursor-pointer shadow-sm shrink-0"
              style={{ backgroundColor: t.primary, color: t.onPrimary }}
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.75} /> : <Save className="w-4 h-4" strokeWidth={1.75} />}
              <span className="hidden sm:inline">Save changes</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>
        </div>

        {/* Line 2: Horizontal Nav Tabs */}
        <div className="flex items-center">
          <div className="inline-flex items-center gap-1 bg-[#101010] p-1 rounded border border-[#2c2c2c] overflow-x-auto scrollbar-hide shadow-inner max-w-full">
            {sections.map((cat) => {
              const Icon = sectionIcons[cat];
              const isActive = activeSections === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleSectionChange(cat)}
                  className={cn(
                    "px-3 sm:px-4 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap transition-all duration-200 cursor-pointer select-none shrink-0",
                    isActive
                      ? "bg-white text-black font-bold shadow-md scale-[1.02]"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {Icon && <Icon className={cn("w-3.5 h-3.5 shrink-0 hidden sm:block", isActive ? "text-black" : "text-zinc-400")} strokeWidth={1.75} />}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
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
            {activeSections === 'Branding' && (
              <section className="rounded-lg p-4 md:p-5 space-y-5" style={{ backgroundColor: t.surfaceContainer }}>
                <SectionHeading icon={Sparkles} label="Supplier branding & visual media" />
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

                  <Field label="Store description">
                    <textarea
                      rows={3}
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                      className="w-full rounded text-sm px-3 py-2 focus:outline-none resize-none"
                      style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                      placeholder="Short description or tagline for your store"
                    />
                  </Field>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <Field label="Store logo">
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
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
                        <div className="flex flex-wrap gap-2 items-center">
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="px-4 py-2 rounded-md text-xs font-medium flex items-center gap-1.5 transition-opacity hover:opacity-90 cursor-pointer"
                            style={{ backgroundColor: t.primary, color: t.onPrimary }}
                          >
                            {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            {uploading ? `${uploadProgress}%` : "Upload logo"}
                          </button>
                          {storeLogo && (
                            <button
                              type="button"
                              onClick={() => setStoreLogo("")}
                              className="px-4 py-2 rounded-md text-xs font-medium transition-colors hover:bg-white/5 cursor-pointer"
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

                    <Field label="Store Banner Image">
                      <div className="space-y-3">
                        {storeBanner ? (
                          <div className="relative w-full h-24 rounded overflow-hidden border" style={{ borderColor: t.outlineVariant }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={storeBanner} alt="Store Banner" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <span className="text-white text-xs font-semibold">Banner Preview</span>
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-full h-24 rounded border border-dashed flex flex-col items-center justify-center gap-1.5" style={{ borderColor: t.outlineVariant, backgroundColor: t.surfaceContainerLowest }}>
                            <ImageIcon className="w-6 h-6" style={{ color: t.outline }} strokeWidth={1.75} />
                            <span className="text-[11px]" style={{ color: t.outline }}>No banner image selected</span>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-2.5 justify-end">
                          {storeBanner && !bannerUploading && (
                            <button type="button" onClick={() => setStoreBanner("")} className="px-4 py-2 rounded-md text-xs font-medium transition-colors hover:bg-white/5 cursor-pointer" style={{ border: `1px solid ${t.outlineVariant}`, color: t.error }}>
                              Remove
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={bannerUploading}
                            onClick={() => bannerInputRef.current?.click()}
                            className="flex items-center gap-2 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer"
                            style={{ backgroundColor: t.surfaceContainerHigh, border: `1px solid ${t.outlineVariant}`, color: t.onSurface, opacity: bannerUploading ? 0.6 : 1 }}
                          >
                            {bannerUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            {bannerUploading ? `Uploading… ${bannerUploadProgress}%` : "Upload Banner"}
                          </button>
                        </div>
                        <input type="file" ref={bannerInputRef} onChange={e => { if (e.target.files?.[0]) performBannerUpload(e.target.files[0]); }} accept="image/*" className="hidden" />
                      </div>
                    </Field>
                  </div>

                  {/* Top Announcement Bar Field */}
                  <div className="pt-4 border-t space-y-3" style={{ borderColor: t.outlineVariant }}>
                    <Field label="Top Announcement Bar Banner">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-zinc-400">
                            Sitewide top announcement text (Max 120 chars). Clear to hide.
                          </span>
                          <span
                            className={cn(
                              "text-[11px]  font-bold px-2 py-0.5 rounded",
                              announcementText.length >= 120
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-[#161618] text-zinc-400 border border-[#2c2c2c]"
                            )}
                          >
                            {announcementText.length} / 120
                          </span>
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            maxLength={120}
                            value={announcementText}
                            onChange={(e) => setAnnouncementText(e.target.value)}
                            placeholder="✦ Fast Doorstep Delivery & Easy Returns | 100% Genuine Products"
                            className="w-full text-xs font-medium px-3.5 py-2.5 rounded border bg-[#161618] border-[#2c2c2c] text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
                          />
                          {announcementText && (
                            <button
                              type="button"
                              onClick={() => setAnnouncementText("")}
                              className="absolute right-2.5 px-2 py-1 text-[10px] font-bold rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        {/* Presets */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Presets:</span>
                          {[
                            "✦ Fast Doorstep Delivery & Easy Returns | 100% Genuine Products",
                            "⚡ Free Shipping on Orders Above ₹999 | 100% Genuine",
                            "🔥 Special Offer: Use Code WELCOME10 for 10% Off",
                          ].map((presetText) => (
                            <button
                              key={presetText}
                              type="button"
                              onClick={() => setAnnouncementText(presetText.slice(0, 120))}
                              className="text-[10px] font-medium px-2 py-1 rounded bg-[#1c1c20] hover:bg-[#282830] text-zinc-300 border border-[#2c2c2c] transition-colors cursor-pointer truncate max-w-[220px]"
                            >
                              {presetText}
                            </button>
                          ))}
                        </div>
                      </div>
                    </Field>
                  </div>

                  {/* Hero Carousel Section */}
                  <div className="pt-4 border-t space-y-4" style={{ borderColor: t.outlineVariant }}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: t.onSurface }}>
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          Hero Carousel Banners
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Upload multiple carousel slides with redirect links and configure display duration.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="file"
                          ref={carouselInputRef}
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleCarouselUpload(e.target.files[0]);
                          }}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={carouselUploading}
                          onClick={() => carouselInputRef.current?.click()}
                          className="px-3.5 py-2 rounded text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                          style={{ backgroundColor: t.primary, color: t.onPrimary, opacity: carouselUploading ? 0.6 : 1 }}
                        >
                          {carouselUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          <span>{carouselUploading ? "Uploading..." : "Add Carousel Slide"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Duration / Interval Selector */}
                    <div className="p-3 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#101010] border-[#2c2c2c]">
                      <div>
                        <label className="text-xs font-semibold text-zinc-200 block">
                          Autoplay Display Duration (Seconds)
                        </label>
                        <span className="text-[11px] text-zinc-400">
                          How long each slide stays visible before switching automatically.
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={60}
                          value={carouselInterval}
                          onChange={(e) => setCarouselInterval(Math.max(1, parseInt(e.target.value) || 5))}
                          className="w-20 px-3 py-1.5 text-xs text-center font-bold rounded border bg-[#161618] border-[#2c2c2c] text-zinc-100 focus:outline-none"
                        />
                        <span className="text-xs text-zinc-400 font-medium">sec</span>
                      </div>
                    </div>

                    {/* Carousel Slides List */}
                    {carouselSlides.length === 0 ? (
                      <div className="p-4 rounded border border-dashed text-center text-xs text-zinc-500 bg-[#121214] border-[#2c2c2c]">
                        No carousel slides added yet. Upload images above to create a hero slide showcase.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {carouselSlides.map((slide, index) => (
                          <div
                            key={slide.id || index}
                            className="p-3 rounded border bg-[#141416] border-[#2c2c2c] space-y-3 relative group"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                              {/* Slide Thumbnail */}
                              <div className="relative w-full sm:w-28 h-20 rounded overflow-hidden border border-[#2c2c2c] shrink-0 bg-black">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={slide.image_url} alt="Carousel slide" className="w-full h-full object-cover" />
                                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-black/70 text-white">
                                  #{index + 1}
                                </span>
                              </div>

                              {/* Inputs: Link, Title, Subtitle */}
                              <div className="flex-1 space-y-2 min-w-0">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                  <div className="relative flex-1">
                                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
                                    <input
                                      type="text"
                                      value={slide.link_url || ""}
                                      onChange={(e) => handleUpdateCarouselSlide(slide.id, { link_url: e.target.value })}
                                      placeholder="Redirect Link (e.g. /product/123 or https://...)"
                                      className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded border bg-[#1a1a1c] border-[#2c2c2c] text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
                                    />
                                  </div>

                                  {/* Choose Product Searchable Popover */}
                                  <div className="relative shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (activeProductPickerSlideId === slide.id) {
                                          setActiveProductPickerSlideId(null);
                                        } else {
                                          setActiveProductPickerSlideId(slide.id);
                                          setProductSearchQuery("");
                                        }
                                      }}
                                      className={cn(
                                        "w-full sm:w-auto flex items-center justify-between sm:justify-start gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 group",
                                        activeProductPickerSlideId === slide.id
                                          ? "bg-[#222228] border-indigo-500/60 text-white shadow-lg shadow-indigo-500/10"
                                          : "bg-[#1a1a1c] border-[#2c2c2c] text-zinc-300 hover:text-white hover:bg-[#222228] hover:border-indigo-500/40 hover:shadow-md"
                                      )}
                                    >
                                      <div className="flex items-center gap-1.5 truncate">
                                        <ShoppingBag className="w-3.5 h-3.5 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform duration-200" />
                                        <span className="truncate font-medium">Choose Product</span>
                                      </div>
                                      <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 shrink-0", activeProductPickerSlideId === slide.id && "rotate-180 text-indigo-400")} />
                                    </button>

                                    {/* Searchable Product Popover Dropdown */}
                                    {activeProductPickerSlideId === slide.id && (
                                      <>
                                        <div
                                          className="fixed inset-0 z-40"
                                          onClick={() => setActiveProductPickerSlideId(null)}
                                        />
                                        <div className="absolute right-0 sm:right-0 left-0 sm:left-auto top-full mt-2 w-full sm:w-72 bg-[#18181c] border border-[#2c2c2c] rounded-xl shadow-2xl z-50 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                                          <div className="relative">
                                            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                            <input
                                              type="text"
                                              autoFocus
                                              value={productSearchQuery}
                                              onChange={(e) => setProductSearchQuery(e.target.value)}
                                              placeholder="Search product title..."
                                              className="w-full text-xs pl-8 pr-7 py-1.5 rounded-md bg-[#101012] border border-[#2c2c2c] text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
                                            />
                                            {productSearchQuery && (
                                              <button
                                                type="button"
                                                onClick={() => setProductSearchQuery("")}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
                                              >
                                                ✕
                                              </button>
                                            )}
                                          </div>

                                          <div className="max-h-52 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                            {loadingProducts ? (
                                              <div className="py-6 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                                                Loading catalog...
                                              </div>
                                            ) : filteredProducts.length === 0 ? (
                                              <div className="py-6 text-center text-xs text-zinc-500">
                                                {productSearchQuery ? `No products match "${productSearchQuery}"` : "No products found in catalog."}
                                              </div>
                                            ) : (
                                              filteredProducts.map((prod) => {
                                                const prodImg = prod.image_url || prod.images?.[0] || prod.main_image || prod.image;
                                                return (
                                                  <button
                                                    key={prod.id}
                                                    type="button"
                                                    onClick={() => {
                                                      const prodUrl = getProductUrl(storeSlug || activeAccount?.username || "store", prod.id);
                                                      handleUpdateCarouselSlide(slide.id, {
                                                        link_url: prodUrl,
                                                        title: slide.title || prod.title || prod.name || "",
                                                      });
                                                      setActiveProductPickerSlideId(null);
                                                    }}
                                                    className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg bg-[#141416]/40 hover:bg-[#202026] border border-transparent hover:border-indigo-500/40 hover:shadow-lg transition-all duration-200 group active:scale-[0.99]"
                                                  >
                                                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-black border border-[#2c2c2c] group-hover:border-indigo-500/50 shrink-0 flex items-center justify-center transition-colors">
                                                      {prodImg ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={prodImg} alt={prod.title || prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                      ) : (
                                                        <Package className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                                                      )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                      <div className="text-xs text-zinc-300 group-hover:text-white font-medium truncate transition-colors">
                                                        {prod.title || prod.name || `Product #${prod.id}`}
                                                      </div>
                                                      {prod.price && (
                                                        <div className="text-[10px] text-zinc-500 group-hover:text-zinc-300 font-sans font-medium transition-colors">
                                                          ₹{prod.price}
                                                        </div>
                                                      )}
                                                    </div>
                                                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-indigo-400 group-hover:translate-x-1 shrink-0 transition-all duration-200" />
                                                  </button>
                                                );
                                              })
                                            )}
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    value={slide.title || ""}
                                    onChange={(e) => handleUpdateCarouselSlide(slide.id, { title: e.target.value })}
                                    placeholder="Slide Title (optional overlay)"
                                    className="text-xs px-2.5 py-1.5 rounded border bg-[#1a1a1c] border-[#2c2c2c] text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
                                  />
                                  <input
                                    type="text"
                                    value={slide.subtitle || ""}
                                    onChange={(e) => handleUpdateCarouselSlide(slide.id, { subtitle: e.target.value })}
                                    placeholder="Slide Subtitle (optional overlay)"
                                    className="text-xs px-2.5 py-1.5 rounded border bg-[#1a1a1c] border-[#2c2c2c] text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
                                  />
                                </div>
                              </div>

                              {/* Actions: Reorder & Delete */}
                              <div className="flex sm:flex-col items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2c2c2c]">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={index === 0}
                                    onClick={() => handleMoveCarouselSlide(index, "up")}
                                    className="p-1.5 rounded hover:bg-white/10 text-zinc-400 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                    title="Move Up"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={index === carouselSlides.length - 1}
                                    onClick={() => handleMoveCarouselSlide(index, "down")}
                                    className="p-1.5 rounded hover:bg-white/10 text-zinc-400 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                    title="Move Down"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteCarouselSlide(slide)}
                                  className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                                  title="Delete Slide"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Store Settings & Technical Config */}
            {activeSections === 'Settings' && (
              <section className="rounded-lg p-4 md:p-5 space-y-5" style={{ backgroundColor: t.surfaceContainer }}>
                <SectionHeading icon={Sliders} label="Store settings & logistics" />

                <div className="space-y-5">
                  {/* Subdomain Field */}
                  <Field label="Store Subdomain">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div
                        className="flex-1 flex items-center rounded overflow-hidden relative transition-colors min-w-0"
                        style={{
                          backgroundColor: t.surfaceContainerLowest,
                          border: `1px solid ${isEditingSlug ? t.accentCyan : t.outlineVariant}`,
                        }}
                      >
                        <span
                          className="px-2.5 sm:px-3 py-2 text-xs select-none shrink-0"
                          style={{
                            color: t.outline,
                            backgroundColor: t.surfaceContainerHigh,
                            borderRight: `1px solid ${t.outlineVariant}`,
                          }}
                        >
                          https://
                        </span>

                        <div className="relative flex-1 min-w-0 flex items-center">
                          <input
                            ref={slugInputRef}
                            type="text"
                            disabled={!isEditingSlug}
                            value={storeSlug}
                            onChange={(e) => {
                              const val = e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9_-]/g, "");
                              setStoreSlug(val);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleConfirmSlugEdit();
                              }
                            }}
                            className={cn(
                              "w-full text-xs sm:text-sm pl-2.5 sm:pl-3 pr-8 py-2 bg-transparent focus:outline-none transition-opacity min-w-0",
                              !isEditingSlug && "cursor-not-allowed opacity-70"
                            )}
                            style={{ color: t.onSurface }}
                            placeholder="youre_store_name"
                          />

                          <button
                            type="button"
                            onClick={handleConfirmSlugEdit}
                            title={isEditingSlug ? "Confirm & Save subdomain" : "Edit subdomain"}
                            className="absolute right-2 p-1 rounded hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
                          >
                            {isEditingSlug ? (
                              <Check
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400"
                                strokeWidth={2}
                              />
                            ) : (
                              <Pencil
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                style={{ color: t.outline }}
                                strokeWidth={1.75}
                              />
                            )}
                          </button>
                        </div>

                        <span
                          className="px-2.5 sm:px-3 py-2 text-xs select-none shrink-0"
                          style={{
                            color: t.outline,
                            backgroundColor: t.surfaceContainerHigh,
                            borderLeft: `1px solid ${t.outlineVariant}`,
                          }}
                        >
                          .{baseRootDomain}
                        </span>
                      </div>

                      {/* Visit button - disabled until store subdomain is saved */}
                      <button
                        type="button"
                        onClick={() => {
                          if (!isEditingSlug && storeSlug) {
                            window.open(subdomainUrl, "_blank", "noopener,noreferrer");
                          }
                        }}
                        disabled={isEditingSlug || !storeSlug}
                        className="px-3.5 py-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 shrink-0 transition-colors hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        style={{
                          color: t.accentCyan,
                          backgroundColor: t.surfaceContainerHigh,
                          border: `1px solid ${t.outlineVariant}`,
                        }}
                        title={isEditingSlug ? "Save Store Subdomain first to visit" : !storeSlug ? "Store Subdomain not set" : "Visit live store"}
                      >
                        <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
                        <span>Visit</span>
                      </button>
                    </div>
                  </Field>

                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px" style={{ backgroundColor: t.outlineVariant }} />
                    <span className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: t.outline }}>OR</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: t.outlineVariant }} />
                  </div>

                  <Field label="Custom Domain">
                    <div className="space-y-3.5">
                      {!hasPaidPro && (
                        <div className="p-3.5 rounded border border-[#2a2a2a] bg-[#1a1919] space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                                <Lock className="w-3.5 h-3.5" strokeWidth={1.75} />
                              </div>
                              <span className="text-xs font-semibold text-[#e5e2e1]">
                                Exclusive Paid Pro Feature (₹499)
                              </span>
                            </div>
                            <a
                              href="/dashboard/pricing"
                              className="px-3 py-1.5 rounded bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 shrink-0 self-start sm:self-auto"
                            >
                              <span>Upgrade — ₹499</span>
                              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                            </a>
                          </div>
                          <p className="text-[11px] text-[#c4c7c8]/80 leading-relaxed">
                            Custom domain setup is strictly reserved for creators who have purchased the Pro Plan (₹499). Free Reward Mode plans (VIP Free Pro Access & Commission Earnings) do not include custom domain mapping.
                          </p>
                        </div>
                      )}

                      {/* Step 1 Card */}
                      <div className={`p-3.5 rounded border bg-[#101010] border-[#2c2c2c] space-y-2.5 ${!hasPaidPro ? "opacity-75" : ""}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold flex items-center justify-center border border-cyan-500/30">
                              1
                            </span>
                            <span className="text-xs font-semibold text-zinc-200">
                              Step 1: Enter Custom Domain
                            </span>
                          </div>
                          {!hasPaidPro && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-medium flex items-center gap-1">
                              <Lock className="w-3 h-3" strokeWidth={1.75} />
                              <span>Paid Pro Only</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1 flex items-center rounded border border-[#2c2c2c] bg-[#161618] overflow-hidden">
                            <span className="px-3 py-2 text-xs text-zinc-500 bg-[#121214] border-r border-[#2c2c2c] select-none shrink-0">
                              https://
                            </span>
                            <input
                              ref={customDomainInputRef}
                              type="text"
                              disabled={!hasPaidPro || (!isEditingCustomDomain && !cfSyncing)}
                              value={customDomain}
                              onChange={(e) => {
                                if (!hasPaidPro) return;
                                const val = e.target.value
                                  .toLowerCase()
                                  .replace(/^https?:\/\//, "")
                                  .replace(/[^a-z0-9.-]/g, "");
                                setCustomDomain(val);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleConfirmCustomDomainEdit();
                                }
                              }}
                              className={`w-full text-xs px-3 py-2 bg-transparent focus:outline-none ${!hasPaidPro ? "text-zinc-500 cursor-not-allowed select-none" : "text-zinc-100"}`}
                              placeholder={hasPaidPro ? "yourdomain.com" : "Upgrade to Pro to set custom domain"}
                            />
                          </div>

                          <button
                            type="button"
                            disabled={!hasPaidPro || cfSyncing || loading}
                            onClick={handleConfirmCustomDomainEdit}
                            className={`px-4 py-2 text-xs font-bold rounded flex items-center justify-center gap-1.5 shrink-0 transition-all whitespace-nowrap bg-white text-black hover:bg-zinc-200 shadow-sm disabled:opacity-50 ${!hasPaidPro ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                          >
                            {!hasPaidPro ? (
                              <>
                                <Lock className="w-3.5 h-3.5 text-black" strokeWidth={1.75} />
                                <span>Locked</span>
                              </>
                            ) : cfSyncing ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                            ) : isEditingCustomDomain ? (
                              <Check className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
                            ) : (
                              <Pencil className="w-3.5 h-3.5 text-black" strokeWidth={1.75} />
                            )}
                            {hasPaidPro && (
                              <span>
                                {cfSyncing
                                  ? "Connecting..."
                                  : isEditingCustomDomain
                                    ? "Connect"
                                    : "Edit Domain"}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Step 2 Card */}
                      <div className="p-3.5 rounded border bg-[#101010] border-[#2c2c2c] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold flex items-center justify-center border border-cyan-500/30">
                              2
                            </span>
                            <span className="text-xs font-semibold text-zinc-200">
                              Step 2: Add DNS Record to Domain Provider
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-400">
                          Add this CNAME record in your domain registrar DNS settings (Cloudflare, GoDaddy, Namecheap, etc.):
                        </p>

                        <div className="rounded border border-[#2c2c2c] bg-[#161618] text-xs overflow-hidden">
                          <div className="grid grid-cols-12 px-3 py-1.5 text-[10px] font-sans font-semibold border-b border-[#2c2c2c] text-zinc-500 uppercase tracking-wider select-none">
                            <div className="col-span-3">Type</div>
                            <div className="col-span-4">Name</div>
                            <div className="col-span-5">Target</div>
                          </div>

                          <div className="grid grid-cols-12 px-3 py-2 items-center gap-1">
                            <div className="col-span-3">CNAME</div>
                            <div className="col-span-4 flex items-center gap-1 truncate">
                              <span className="truncate text-zinc-200">
                                {(() => {
                                  if (!customDomain) return "@";
                                  const cleaned = customDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
                                  const parts = cleaned.split(".");
                                  return parts.length > 2 ? parts[0] : "@";
                                })()}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const cleaned = (customDomain || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
                                  const parts = cleaned ? cleaned.split(".") : [];
                                  const nameVal = parts.length > 2 ? parts[0] : "@";
                                  copyToClipboard(nameVal, "name");
                                }}
                                className="p-1 hover:text-white text-zinc-500 transition-colors cursor-pointer"
                                title="Copy Name"
                              >
                                {copiedField === "name" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                            <div className="col-span-5 flex items-center gap-1 truncate">
                              <span className="truncate text-zinc-300 text-[11px]">
                                cname.{baseRootDomain}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(`cname.${baseRootDomain}`, "target")}
                                className="p-1 hover:text-white text-zinc-500 transition-colors cursor-pointer"
                                title="Copy Target"
                              >
                                {copiedField === "target" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {showDnsWarning && (
                          <div className="p-3 rounded flex items-start justify-between gap-3 text-xs border bg-amber-500/10 border-amber-500/30 text-amber-300 animate-in fade-in duration-200">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                              <div className="space-y-1">
                                <p className="font-bold text-amber-200">
                                  Action Required: Add CNAME Record to Domain DNS
                                </p>
                                <p className="text-[11px] text-amber-300/90 leading-relaxed">
                                  Ensure you add the CNAME record shown above in <strong>Cloudflare</strong>, <strong>GoDaddy</strong>, or <strong>Namecheap</strong> so your domain connects and SSL activates properly.
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowDnsWarning(false)}
                              className="p-1 rounded hover:bg-white/10 text-amber-400 hover:text-white transition-colors shrink-0 cursor-pointer"
                              title="Dismiss warning"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {cfStatus && (
                          <div
                            className="p-2.5 rounded text-[11px] flex items-center justify-between gap-2"
                            style={{
                              backgroundColor: cfStatus.status === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                              border: `1px solid ${cfStatus.status === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                              color: cfStatus.status === "success" ? "#10b981" : "#ef4444",
                            }}
                          >
                            <span className="font-medium">{cfStatus.message}</span>
                            <button type="button" onClick={() => setCfStatus(null)} className="p-0.5 hover:opacity-80 cursor-pointer">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold ">Disabled</span>
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

                  {/* Functionality Toggles */}
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Store Features & Integrations</h4>
                    <ToggleRow title="Show related products" description="Display other catalog items at bottom of product page." checked={showRelatedProducts} onChange={() => setShowRelatedProducts(!showRelatedProducts)} />
                    <ToggleRow title="Enable Instagram checkout" description="Direct customers to Instagram to complete purchase." checked={enableInstagramButton} onChange={() => setEnableInstagramButton(!enableInstagramButton)} />
                    <ToggleRow title="Enable WhatsApp redirection" description="Let customers ask questions or order via WhatsApp." checked={enableWhatsAppButton} onChange={() => setEnableWhatsAppButton(!enableWhatsAppButton)} last />
                  </div>
                </div>
              </section>
            )}

            {/* Appearance */}
            {activeSections === 'Template' &&
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
              </section>}

            {/* Theme Palette */}
            {activeSections === "Theme" &&
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

                {/* Corner Edge Size & Font Style Customization Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-4 border-t border-white/10">
                  {/* Corner Edge Size Dropdown */}
                  <Field label="Edge Size">
                    <div className="relative">
                      <select
                        value={cornerRadius}
                        onChange={(e) => setCornerRadius(e.target.value)}
                        className="w-full text-xs font-medium pl-3 pr-8 py-2 rounded border outline-none cursor-pointer appearance-none transition-colors"
                        style={{
                          backgroundColor: t.surfaceContainerLowest,
                          borderColor: t.outlineVariant,
                          color: t.onSurface,
                        }}
                      >
                        <option value="sharp" style={{ backgroundColor: "#1c1b1b", color: "#e5e2e1" }}>
                          Straight brutalist edges
                        </option>
                        <option value="subtle" style={{ backgroundColor: "#1c1b1b", color: "#e5e2e1" }}>
                          Soft rounded edges
                        </option>
                        <option value="rounded" style={{ backgroundColor: "#1c1b1b", color: "#e5e2e1" }}>
                          Standard modern curves
                        </option>
                        <option value="pill" style={{ backgroundColor: "#1c1b1b", color: "#e5e2e1" }}>
                          Fully curved pill shapes
                        </option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </Field>

                  {/* Font Style Dropdown */}
                  <Field label="Website Font Style">
                    <div className="relative">
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className={cn(
                          "w-full text-xs font-medium pl-3 pr-8 py-2 rounded border outline-none cursor-pointer appearance-none transition-colors",
                          (fontFamily === "serif" || fontFamily === "merriweather") && "font-serif",
                          (fontFamily === "grotesk" || fontFamily === "fira") && "",
                          fontFamily === "jakarta" && "font-sans font-medium",
                          fontFamily === "outfit" && "font-sans font-bold",
                          fontFamily === "urbanist" && "font-sans tracking-wide",
                          (fontFamily === "inter" || fontFamily === "roboto") && "font-sans"
                        )}
                        style={{
                          backgroundColor: t.surfaceContainerLowest,
                          borderColor: t.outlineVariant,
                          color: t.onSurface,
                        }}
                      >
                        <option value="inter" className="font-sans" style={{ backgroundColor: "#1c1b1b", color: "#e5e2e1" }}>
                          Clean Modern Sans-Serif (Default)
                        </option>
                        <option value="roboto" className="font-sans" style={{ backgroundColor: "#1c1b1b", color: "#e5e2e1" }}>
                          Crisp System Neutral Sans
                        </option>
                        <option value="jakarta" className="font-sans font-medium" style={{ backgroundColor: "#1c1b1b", color: "#e5e2e1" }}>
                          Premium Brand Sans
                        </option>
                        <option value="outfit" className="font-sans font-bold" style={{ backgroundColor: "#1c1b1b", color: "#e5e2e1" }}>
                          Dynamic Geometric Sans
                        </option>
                        <option value="urbanist" className="font-sans tracking-wide" style={{ backgroundColor: "#1c1b1b", color: "#e5e2e1" }}>
                          Minimalist Architectural Sans
                        </option>
                        <option value="serif" className="font-serif" style={{ backgroundColor: "#1c1b1b", color: "#e5e2e1" }}>
                          Luxury Editorial Serif
                        </option>
                        <option value="merriweather" className="font-serif" style={{ backgroundColor: "#1c1b1b", color: "#e5e2e1" }}>
                          Warm Book Serif
                        </option>
                        <option value="grotesk" className="" style={{ backgroundColor: "#1c1b1b", color: "#e5e2e1" }}>
                          Tech & Cyber Monospace
                        </option>
                        <option value="fira" className="" style={{ backgroundColor: "#1c1b1b", color: "#e5e2e1" }}>
                          Clean Code Monospace
                        </option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </Field>
                </div>
              </section>}


          </div>

          {/* Right column — live preview (Desktop layout) */}
          <div className="hidden lg:block lg:col-span-5 relative">
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
                  <div className="px-3 py-1 rounded text-[10px] flex items-center gap-1.5 select-none overflow-hidden max-w-[220px]"
                    style={{ backgroundColor: t.surfaceContainer, color: t.onSurfaceVariant, border: `1px solid ${t.outlineVariant}` }}>
                    <Lock className="w-2.5 h-2.5 shrink-0 text-emerald-400" strokeWidth={1.75} />
                    <span className="truncate text-zinc-300  text-[10px]">{activePreviewUrlString}</span>
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

                    {/* Live Announcement Bar Preview */}
                    {announcementText.trim() !== "" && (
                      <div className={cn("w-full text-center py-1 px-2 text-[8px] font-semibold tracking-wide border-b transition-colors truncate select-none", previewStyles.dividerClass)} style={{ backgroundColor: `${previewStyles.accentColor}12` }}>
                        <span>{announcementText}</span>
                      </div>
                    )}

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
                        {/* Hero Section: Hero Carousel Banners or Single Banner */}
                        {carouselSlides.length > 0 ? (
                          <div className="relative w-full h-32 sm:h-36 overflow-hidden rounded-lg group select-none bg-black border border-white/10 shadow-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={carouselSlides[0].image_url}
                              alt={carouselSlides[0].title || previewStoreName}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col items-center justify-end pb-3 px-3 text-center">
                              <p className={cn("text-xs sm:text-sm font-black text-white leading-tight drop-shadow-md mb-0.5", previewStyles.fontHeadline)}>
                                {carouselSlides[0].title || previewStoreName}
                              </p>
                              {carouselSlides[0].subtitle && (
                                <p className="text-[9px] text-white/85 line-clamp-1 max-w-[200px] mb-1.5 font-medium">
                                  {carouselSlides[0].subtitle}
                                </p>
                              )}
                              <span className={cn("px-3 py-1 text-[8px] font-extrabold tracking-widest uppercase transition-all inline-block shadow-md", previewStyles.buttonClass)}>
                                Explore Collection →
                              </span>
                            </div>
                            {carouselSlides.length > 1 && (
                              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1">
                                {carouselSlides.slice(0, 5).map((_, idx) => (
                                  <span
                                    key={idx}
                                    className={cn(
                                      "h-1 rounded-full transition-all",
                                      idx === 0 ? "w-3.5 bg-white" : "w-1 bg-white/40"
                                    )}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ) : storeBanner ? (
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
                          {["All", "Apparel", "Accessories", "Footwear"].map((cat, i) => (
                            <span key={cat} className={cn("text-[8px] shrink-0 truncate", i === 0 ? previewStyles.filterPillActiveClass : previewStyles.filterPillClass)}
                              style={{ padding: "2px 8px" }}>
                              {cat}
                            </span>
                          ))}
                        </div>

                        {/* Product grid - Extended items */}
                        <div className="grid grid-cols-2 gap-2">
                          {previewProductsList.map((item, idx) => (
                            <div key={item.id || idx} className={cn("flex flex-col overflow-hidden", previewStyles.cardClass)}>
                              <div className="aspect-[3/4] w-full overflow-hidden relative bg-zinc-800">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                {item.discount && (
                                  <div className="absolute top-1 left-1 text-[7px] font-black px-1 py-0.5 rounded-xs" style={{ backgroundColor: previewStyles.accentColor, color: previewStyles.isDark ? "#000" : "#fff" }}>
                                    {item.discount}
                                  </div>
                                )}
                                <button className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-black/30">
                                  <Heart className={cn("w-2.5 h-2.5", idx === 1 ? "fill-red-500 text-red-500" : "text-white")} />
                                </button>
                              </div>
                              <div className="p-1.5 space-y-0.5">
                                <p className={cn("text-[9px] font-semibold truncate", previewStyles.textColorClass)}>{item.name}</p>
                                <p className={cn("text-[9px] font-bold", previewStyles.priceClass)}>{item.price}</p>
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
                            <img src="/icons/dark-placeholder.png" alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 space-y-2.5">
                            <div className="space-y-0.5">
                              <span className={cn("text-[7px] font-bold tracking-wider inline-block", previewStyles.badgeClass)}>New arrival</span>
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
                            <h4 className={cn("text-[8px] font-bold tracking-wider", previewStyles.textColorClass)}>You might also like</h4>
                            <div className="grid grid-cols-3 gap-1.5">
                              {[1, 2, 3].map(i => (
                                <div key={i} className={cn("overflow-hidden", previewStyles.cardClass)}>
                                  <div className="aspect-square bg-zinc-800 overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/icons/dark-placeholder.png" alt="" className="w-full h-full object-cover" />
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
                        <span onClick={() => window.open(getPrivacyUrl(activeAccount?.username || "store"), "_blank")} className="hover:underline cursor-pointer">Privacy</span>
                        <span onClick={() => window.open(getTermsUrl(activeAccount?.username || "store"), "_blank")} className="hover:underline cursor-pointer">Terms</span>
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

      {/* Mobile Preview Popup Modal */}
      {showMobilePreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className={cn("relative w-full transition-all duration-300 bg-[#121214] border border-[#2c2c2c] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]", previewDevice === "desktop" ? "max-w-5xl" : "max-w-md")}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2c2c2c] bg-[#18181b] shrink-0">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Storefront Preview</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Device Switcher in Modal */}
                <div className="flex items-center gap-1 rounded-md p-0.5 bg-[#101010] border border-[#2c2c2c]">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className="p-1 rounded transition-colors cursor-pointer"
                    style={{ backgroundColor: previewDevice === "desktop" ? t.surfaceContainerHigh : "transparent", color: previewDevice === "desktop" ? t.onSurface : t.outline }}
                    title="Desktop View"
                  >
                    <Laptop className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className="p-1 rounded transition-colors cursor-pointer"
                    style={{ backgroundColor: previewDevice === "mobile" ? t.surfaceContainerHigh : "transparent", color: previewDevice === "mobile" ? t.onSurface : t.outline }}
                    title="Mobile View"
                  >
                    <Smartphone className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMobilePreviewModal(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Preview Body */}
            <div className="p-3 overflow-y-auto flex-1 flex justify-center bg-[#000]">
              <div className={cn("rounded-lg overflow-hidden transition-all duration-300 w-full flex flex-col border border-[#2c2c2c]", previewDevice === "mobile" ? "max-w-[340px] h-full mx-auto" : "w-full h-full")}>
                {/* Browser Chrome */}
                <div className="px-3 py-2 flex items-center justify-between shrink-0 bg-[#18181b] border-b border-[#2c2c2c]">
                  <div className="flex gap-1.5 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#FF5F57]" />
                    <div className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
                    <div className="w-2 h-2 rounded-full bg-[#27C93F]" />
                  </div>
                  <div className="px-2 py-0.5 rounded text-[10px] flex items-center gap-1 select-none overflow-hidden max-w-[200px] bg-[#101010] text-zinc-400 border border-[#2c2c2c]">
                    <Lock className="w-2.5 h-2.5 shrink-0 text-emerald-400" strokeWidth={1.75} />
                    <span className="truncate text-zinc-300  text-[10px]">{activePreviewUrlString}</span>
                  </div>
                  <div className="w-4" />
                </div>

                {/* Mode Switcher */}
                <div className="px-3 py-1.5 flex items-center gap-2 shrink-0 bg-black/60 border-b border-[#2c2c2c]">
                  {["catalog", "pdp"].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPreviewMode(mode as any)}
                      className="px-2.5 py-1 text-[10px] font-medium rounded transition-colors cursor-pointer"
                      style={{
                        backgroundColor: previewMode === mode ? t.primary : "transparent",
                        color: previewMode === mode ? t.onPrimary : t.onSurfaceVariant,
                      }}
                    >
                      {mode === "catalog" ? "Catalog" : "Product page"}
                    </button>
                  ))}
                </div>

                {/* Viewport Content */}
                <div className="relative overflow-hidden flex-1">
                  <div className={cn("h-full overflow-y-auto custom-scrollbar", previewStyles.bodyClass, previewStyles.fontBody)}>
                    {/* Storefront Nav */}
                    <div className={cn("px-4 h-10 flex items-center justify-between border-b shrink-0", previewStyles.navClass)}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-5 h-5 overflow-hidden flex items-center justify-center", previewStyles.logoWrapperClass)}>
                          {storeLogo ? <img src={storeLogo} alt="" className="w-full h-full object-cover" /> : <ShoppingBag className="w-3 h-3" strokeWidth={1.75} />}
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
                        {/* Hero Banner / Carousel */}
                        {carouselSlides.length > 0 ? (
                          <div className="relative w-full h-32 overflow-hidden rounded-lg group select-none bg-black border border-white/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={carouselSlides[0].image_url}
                              alt={carouselSlides[0].title || previewStoreName}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col items-center justify-end pb-2.5 px-2.5 text-center">
                              <p className={cn("text-xs font-black text-white leading-tight drop-shadow-md mb-0.5", previewStyles.fontHeadline)}>
                                {carouselSlides[0].title || previewStoreName}
                              </p>
                              {carouselSlides[0].subtitle && (
                                <p className="text-[8px] text-white/85 line-clamp-1 max-w-[180px] mb-1 font-medium">
                                  {carouselSlides[0].subtitle}
                                </p>
                              )}
                              <span className={cn("px-2.5 py-0.5 text-[7px] font-extrabold tracking-widest uppercase transition-all inline-block shadow-md", previewStyles.buttonClass)}>
                                Explore Collection →
                              </span>
                            </div>
                          </div>
                        ) : storeBanner ? (
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
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          {previewProductsList.map((item, idx) => (
                            <div key={item.id || idx} className={cn("flex flex-col overflow-hidden", previewStyles.cardClass)}>
                              <div className="aspect-[3/4] w-full overflow-hidden relative bg-zinc-800">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="p-1.5 space-y-0.5">
                                <p className={cn("text-[9px] font-semibold truncate", previewStyles.textColorClass)}>{item.name}</p>
                                <p className={cn("text-[9px] font-bold", previewStyles.priceClass)}>{item.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 space-y-3">
                        <div className="flex flex-col gap-2">
                          <div className="w-full aspect-[3/4] overflow-hidden bg-zinc-800">
                            <img src="/icons/dark-placeholder.png" alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="space-y-1">
                            <h2 className={cn("text-[10px] font-bold leading-tight", previewStyles.textColorClass)}>Summer Silk Wrap</h2>
                            <p className={cn("text-[10px] font-bold", previewStyles.priceClass)}>₹4,200</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
      className={cn(
        "rounded-lg p-3.5 cursor-pointer transition-all flex flex-col justify-between group hover:border-zinc-400 select-none shadow-sm",
        active ? "border-2 border-white bg-[#202022]" : "border border-[#333336] bg-[#141416] hover:bg-[#1a1a1d]"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold truncate text-white group-hover:text-cyan-300 transition-colors">{name}</span>
        </div>
        {active ? (
          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0">
            <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
          </div>
        ) : (
          <div className="w-4 h-4 rounded-full border border-zinc-600 shrink-0 group-hover:border-zinc-400" />
        )}
      </div>

      {/* Mini storefront visual mockup card */}
      <div className="h-20 rounded-md overflow-hidden relative border border-white/10 shadow-inner flex flex-col" style={{ backgroundColor: previewBg }}>
        {/* Nav header */}
        <div className="h-4 border-b border-white/10 px-2 flex items-center justify-between shrink-0" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: previewAccent }} />
          <div className="h-1 w-8 rounded-full bg-white/20" />
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
          </div>
        </div>

        {/* Hero banner / Content grid */}
        <div className="p-1.5 flex-1 flex flex-col justify-between">
          <div className="h-2.5 rounded w-3/4 opacity-90 mb-1" style={{ backgroundColor: previewAccent }} />
          <div className="grid grid-cols-3 gap-1 flex-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-sm flex flex-col justify-between p-0.5" style={{ backgroundColor: i === 0 ? previewAccent : "rgba(255,255,255,0.08)", opacity: i === 0 ? 0.9 : 0.6 }}>
                <div className="h-2 w-full rounded-xs bg-white/20" />
                <div className="h-1 w-2/3 rounded-xs bg-white/40" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-zinc-400 mt-2.5 leading-relaxed line-clamp-2">{description}</p>
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange, last = false, disabled = false }: {
  title: string; description: string; checked: boolean; onChange: () => void; last?: boolean; disabled?: boolean;
}) {
  return (
    <div
      className={cn("flex items-center justify-between py-3.5 gap-3", disabled && "opacity-40")}
      style={!last ? { borderBottom: `1px solid ${t.outlineVariant}` } : undefined}
    >
      <div className="pr-2 min-w-0 flex-1">
        <h4 className="text-xs font-medium truncate" style={{ color: t.onSurface }}>{title}</h4>
        <p className="text-[11px] mt-0.5 leading-snug" style={{ color: t.onSurfaceVariant }}>{description}</p>
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