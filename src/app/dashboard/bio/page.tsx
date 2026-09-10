"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import QRCode from "qrcode";
import api from "@/lib/services/api.service";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/services/cloudinary.service";
import { cn } from "@/lib/utils";
import LinkInBioPublicView, {
  BIO_THEMES,
  SocialIcons,
  PublicBlockData,
  PublicSocialAccount,
  PublicBioPayload,
} from "@/components/bio/LinkInBioPublicView";
import SocialIcon, { POPULAR_SOCIAL_PLATFORMS, ALL_CUSTOM_ICONS } from "@/components/bio/SocialIcon";
import CustomSocialModal from "@/components/bio/CustomSocialModal";
import { QrCodeStudioModal } from "@/components/bio/QrCodeStudioModal";
import Toast from "@/components/Toast";
import {
  Link2,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Sparkles,
  User,
  AlignLeft,
  Smartphone,
  Tablet,
  Monitor,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Palette,
  Share2,
  BarChart3,
  Globe,
  Settings,
  Video,
  Image as ImageIcon,
  FileText,
  ShoppingBag,
  MessageCircle,
  QrCode,
  ArrowRight,
  ArrowLeft,
  Layers,
  AlertCircle,
  X,
  Download,
  Upload,
  Loader2,
  Type,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Lock,
  Wifi,
  Shield,
  PanelLeft,
  PanelTop,
  PanelBottom,
  Maximize2,
  Play,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface BlockItem {
  id?: number;
  block_type: string;
  title: string;
  subtitle: string;
  url: string;
  media_url: string;
  config: Record<string, unknown>;
  order: number;
  is_active: boolean;
  clicks_count?: number;
}

interface RedirectRuleItem {
  id?: number;
  title: string;
  input_match_url: string;
  match_type: string;
  destination_type: string;
  destination_value: string;
  destination_title: string;
  is_active: boolean;
  hits_count?: number;
}

interface CustomThemeConfig {
  background_type?: "preset" | "color" | "image";
  background_color?: string;
  background_image_url?: string;
  background_overlay?: "dark" | "heavy" | "light";
  text_color?: string;
  [key: string]: unknown;
}

const BLOCK_TYPE_ICON_MAP: Record<string, any> = {
  link: Link2,
  header: FileText,
  video: Video,
  image: ImageIcon,
  file_download: Download,
  product_card: ShoppingBag,
  contact_card: MessageCircle,
  custom_button: ArrowRight,
};

interface BioPageData {
  id?: number;
  username: string;
  title: string;
  bio: string;
  profile_image_url: string;
  banner_image_url: string;
  theme_id: string;
  custom_theme: CustomThemeConfig;
  social_accounts: PublicSocialAccount[];
  social_display_mode: string;
  show_social_usernames: boolean;
  blocks_enabled?: boolean;
  social_enabled?: boolean;
  smart_redirect_enabled: boolean;
  smart_input_placeholder: string;
  smart_input_button_text: string;
  smart_input_title: string;
  section_order?: string[];
  is_published: boolean;
  views_count?: number;
  clicks_count?: number;
}

interface AnalyticsData {
  views_count: number;
  clicks_count: number;
  redirect_hits: number;
  total_blocks: number;
  active_blocks?: number;
}

interface BioSettingsResponse {
  page: BioPageData;
  blocks: BlockItem[];
  redirect_rules: RedirectRuleItem[];
  analytics: AnalyticsData;
}

interface UsernameCheckResponse {
  available: boolean;
  username: string;
  reason?: string;
}

interface TestRedirectResponse {
  found: boolean;
  destination_type?: string;
  destination_value?: string;
  destination_title?: string;
  rule_title?: string;
  message?: string;
}

const AVAILABLE_PLATFORMS = POPULAR_SOCIAL_PLATFORMS;

const PRESET_BG_PALETTES = [
  { name: "Obsidian Dark", color: "#131313", gradient: "linear-gradient(135deg, #1c1c1c 0%, #131313 100%)" },
  { name: "Pure Midnight", color: "#000000", gradient: "linear-gradient(135deg, #111111 0%, #000000 100%)" },
  { name: "Slate Navy", color: "#0f172a", gradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" },
  { name: "Deep Amethyst", color: "#1a102f", gradient: "linear-gradient(135deg, #3b1b6a 0%, #0f0c20 100%)" },
  { name: "Cyber Neon", color: "#040608", gradient: "linear-gradient(135deg, #091016 0%, #040608 100%)" },
  { name: "Sunset Rose", color: "#180d14", gradient: "linear-gradient(135deg, #2b1122 0%, #180d14 100%)" },
  { name: "Emerald Forest", color: "#062016", gradient: "linear-gradient(135deg, #064e3b 0%, #062016 100%)" },
  { name: "Warm Espresso", color: "#1f1610", gradient: "linear-gradient(135deg, #29180c 0%, #1f1610 100%)" },
  { name: "Luxury Gold", color: "#0d0d0d", gradient: "linear-gradient(135deg, #2a2010 0%, #0d0d0d 100%)" },
  { name: "Clean Daylight", color: "#f8fafc", gradient: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)" },
];

const PRESET_THEME_GRADIENTS: Record<string, string> = {
  glass_monochrome: "linear-gradient(135deg, #2b2b2b 0%, #131313 100%)",
  minimal: "linear-gradient(135deg, #27272a 0%, #09090b 100%)",
  creator: "radial-gradient(ellipse at 50% 0%, #3b1b6a 0%, #0f0c20 100%)",
  dark_glass: "linear-gradient(135deg, #1e293b 0%, #0f172a 60%, #0a0d14 100%)",
  gradient_glow: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #6366f1 100%)",
  cyber_neon: "linear-gradient(135deg, #083344 0%, #040608 100%)",
  sunset_warmth: "linear-gradient(135deg, #f59e0b 0%, #e11d48 50%, #180d14 100%)",
  clean_white: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)",
  luxury_gold: "linear-gradient(135deg, #d4af37 0%, #3a2e12 50%, #0d0d0d 100%)",
};

export default function LinkInBioDashboard() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [page, setPage] = useState<BioPageData>({
    username: "",
    title: "",
    bio: "",
    profile_image_url: "",
    banner_image_url: "",
    theme_id: "glass_monochrome",
    custom_theme: {
      background_type: "preset",
      background_color: "#131313",
      background_image_url: "",
      background_overlay: "dark",
      text_color: "",
    },
    social_accounts: [],
    social_display_mode: "icons_top",
    show_social_usernames: true,
    blocks_enabled: true,
    social_enabled: true,
    smart_redirect_enabled: true,
    smart_input_placeholder: "Paste link here...",
    smart_input_button_text: "Get Link",
    smart_input_title: "Have a Reel or Promo Link?",
    is_published: true,
  });

  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [redirectRules, setRedirectRules] = useState<RedirectRuleItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    views_count: 0,
    clicks_count: 0,
    redirect_hits: 0,
    total_blocks: 0,
  });

  const [previewDevice, setPreviewDevice] = useState<"mobile" | "tablet" | "desktop">("mobile");
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"blocks" | "styling" | "social" | "redirects" | "settings" | "analytics">("blocks");
  const [draggableTabs, setDraggableTabs] = useState<string[]>([
    "blocks",
    "social",
    "redirects",
  ]);

  const handleTabReorder = (newOrder: string[]) => {
    setDraggableTabs(newOrder);
    setPage((prev) => ({
      ...prev,
      section_order: newOrder,
    }));
    setPreviewKey((k) => k + 1);
  };

  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BlockItem | null>(null);
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RedirectRuleItem | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [customSocialModalOpen, setCustomSocialModalOpen] = useState(false);
  const [editingSocialAccount, setEditingSocialAccount] = useState<Partial<PublicSocialAccount> | null>(null);
  const [mockPreviewModalOpen, setMockPreviewModalOpen] = useState(false);

  const [usernameInput, setUsernameInput] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{ available: boolean; message: string } | null>(null);

  const [testingRuleId, setTestingRuleId] = useState<number | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [copiedLink, setCopiedLink] = useState(false);

  // Upload refs & state
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUploadProgress, setAvatarUploadProgress] = useState(0);
  const [avatarDeleteToken, setAvatarDeleteToken] = useState<string | null>(null);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);

  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerUploadProgress, setBannerUploadProgress] = useState(0);
  const [bannerDeleteToken, setBannerDeleteToken] = useState<string | null>(null);
  const [isDeletingBanner, setIsDeletingBanner] = useState(false);

  const [bgImageUploading, setBgImageUploading] = useState(false);
  const [bgImageUploadProgress, setBgImageUploadProgress] = useState(0);
  const [bgImageDeleteToken, setBgImageDeleteToken] = useState<string | null>(null);
  const [isDeletingBgImage, setIsDeletingBgImage] = useState(false);

  const [expandedBlockIds, setExpandedBlockIds] = useState<Record<string | number, boolean>>({});
  const [bgPaletteOpen, setBgPaletteOpen] = useState(false);
  const bgPaletteRef = useRef<HTMLDivElement>(null);
  const [presetThemeOpen, setPresetThemeOpen] = useState(false);
  const presetThemeRef = useRef<HTMLDivElement>(null);
  const [popularNetworkDropdownOpen, setPopularNetworkDropdownOpen] = useState(false);
  const popularNetworkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bgPaletteRef.current && !bgPaletteRef.current.contains(e.target as Node)) {
        setBgPaletteOpen(false);
      }
      if (presetThemeRef.current && !presetThemeRef.current.contains(e.target as Node)) {
        setPresetThemeOpen(false);
      }
      if (popularNetworkRef.current && !popularNetworkRef.current.contains(e.target as Node)) {
        setPopularNetworkDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
  };

  useEffect(() => {
    let isMounted = true;
    api
      .get<BioSettingsResponse>("/accounts/link-in-bio/")
      .then((res) => {
        if (isMounted && res.data) {
          const loadedPage = res.data.page || {};
          const customTheme = loadedPage.custom_theme || {};
          setPage({
            ...loadedPage,
            blocks_enabled:
              loadedPage.blocks_enabled !== undefined
                ? Boolean(loadedPage.blocks_enabled)
                : true,
            social_enabled:
              loadedPage.social_enabled !== undefined
                ? Boolean(loadedPage.social_enabled)
                : true,
            smart_redirect_enabled:
              loadedPage.smart_redirect_enabled !== undefined
                ? Boolean(loadedPage.smart_redirect_enabled)
                : true,
            smart_input_placeholder: loadedPage.smart_input_placeholder || "Paste link here...",
            smart_input_button_text: loadedPage.smart_input_button_text || "Get Link",
            smart_input_title: loadedPage.smart_input_title || "Have a Reel or Promo Link?",
            custom_theme: {
              background_type: customTheme.background_type || "preset",
              background_color: customTheme.background_color || "#131313",
              background_image_url: customTheme.background_image_url || "",
              background_overlay: customTheme.background_overlay || "dark",
              text_color: customTheme.text_color || "",
              ...customTheme,
            },
            show_social_usernames:
              loadedPage.show_social_usernames !== undefined ? loadedPage.show_social_usernames : true,
          });
          const loadedSecOrder = loadedPage.section_order || customTheme.section_order;
          if (loadedSecOrder && Array.isArray(loadedSecOrder)) {
            const filteredOrder: string[] = loadedSecOrder.filter(
              (s: string) => s === "blocks" || s === "social" || s === "redirects"
            );
            ["blocks", "social", "redirects"].forEach((s: string) => {
              if (!filteredOrder.includes(s)) filteredOrder.push(s);
            });
            setDraggableTabs(filteredOrder);
          }
          setUsernameInput(loadedPage.username || "");
          setBlocks(res.data.blocks || []);
          setRedirectRules(res.data.redirect_rules || []);
          setAnalytics(res.data.analytics || { views_count: 0, clicks_count: 0, redirect_hits: 0, total_blocks: 0 });
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          console.error("Failed to load Link-in-Bio data:", err);
          const apiErr = err as { response?: { data?: { error?: string } } };
          showToast(apiErr.response?.data?.error || "Failed to load data", "error");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleReorderSocialAccounts = (newAccounts: PublicSocialAccount[]) => {
    const activeIds = new Set(newAccounts.map((a) => a.id || a.platform));
    const hiddenAccounts = (page.social_accounts || []).filter(
      (s) => !activeIds.has(s.id || s.platform)
    );
    const updated = [...newAccounts, ...hiddenAccounts];
    setPage((prev) => ({ ...prev, social_accounts: updated }));
    setPreviewKey((k) => k + 1);
  };

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;
    setAvatarUploading(true);
    setAvatarUploadProgress(0);
    try {
      const res = await uploadToCloudinary(file, {
        onProgress: (p) => setAvatarUploadProgress(p),
      });
      setPage((prev) => ({ ...prev, profile_image_url: res.secure_url }));
      setAvatarDeleteToken(res.delete_token || null);
      setPreviewKey((k) => k + 1);
      showToast("Avatar updated");
    } catch (err: unknown) {
      const e = err as { message?: string };
      showToast(e?.message || "Failed to upload avatar", "error");
    } finally {
      setAvatarUploading(false);
      setAvatarUploadProgress(0);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsDeletingAvatar(true);
    try {
      if (avatarDeleteToken) {
        await deleteFromCloudinary(avatarDeleteToken);
      }
      setPage((prev) => ({ ...prev, profile_image_url: "" }));
      setAvatarDeleteToken(null);
      setPreviewKey((k) => k + 1);
      showToast("Avatar removed");
    } catch {
      setPage((prev) => ({ ...prev, profile_image_url: "" }));
      setAvatarDeleteToken(null);
      setPreviewKey((k) => k + 1);
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  const handleBannerUpload = async (file: File) => {
    if (!file) return;
    setBannerUploading(true);
    setBannerUploadProgress(0);
    try {
      const res = await uploadToCloudinary(file, {
        onProgress: (p) => setBannerUploadProgress(p),
      });
      setPage((prev) => ({ ...prev, banner_image_url: res.secure_url }));
      setBannerDeleteToken(res.delete_token || null);
      setPreviewKey((k) => k + 1);
      showToast("Cover updated");
    } catch (err: unknown) {
      const e = err as { message?: string };
      showToast(e?.message || "Failed to upload banner", "error");
    } finally {
      setBannerUploading(false);
      setBannerUploadProgress(0);
    }
  };

  const handleRemoveBanner = async () => {
    setIsDeletingBanner(true);
    try {
      if (bannerDeleteToken) {
        await deleteFromCloudinary(bannerDeleteToken);
      }
      setPage((prev) => ({ ...prev, banner_image_url: "" }));
      setBannerDeleteToken(null);
      setPreviewKey((k) => k + 1);
      showToast("Banner removed");
    } catch {
      setPage((prev) => ({ ...prev, banner_image_url: "" }));
      setBannerDeleteToken(null);
      setPreviewKey((k) => k + 1);
    } finally {
      setIsDeletingBanner(false);
    }
  };

  const handleBgImageUpload = async (file: File) => {
    if (!file) return;
    setBgImageUploading(true);
    setBgImageUploadProgress(0);
    try {
      const res = await uploadToCloudinary(file, {
        onProgress: (p) => setBgImageUploadProgress(p),
      });
      setPage((prev) => ({
        ...prev,
        custom_theme: {
          ...prev.custom_theme,
          background_type: "image",
          background_image_url: res.secure_url,
        },
      }));
      setBgImageDeleteToken(res.delete_token || null);
      setPreviewKey((k) => k + 1);
      showToast("Background image updated");
    } catch (err: unknown) {
      const e = err as { message?: string };
      showToast(e?.message || "Failed to upload background", "error");
    } finally {
      setBgImageUploading(false);
      setBgImageUploadProgress(0);
    }
  };

  const handleRemoveBgImage = async () => {
    setIsDeletingBgImage(true);
    try {
      if (bgImageDeleteToken) {
        await deleteFromCloudinary(bgImageDeleteToken);
      }
      setPage((prev) => ({
        ...prev,
        custom_theme: {
          ...prev.custom_theme,
          background_type: "preset",
          background_image_url: "",
        },
      }));
      setBgImageDeleteToken(null);
      setPreviewKey((k) => k + 1);
      showToast("Background image removed");
    } catch {
      setPage((prev) => ({
        ...prev,
        custom_theme: {
          ...prev.custom_theme,
          background_type: "preset",
          background_image_url: "",
        },
      }));
      setBgImageDeleteToken(null);
      setPreviewKey((k) => k + 1);
    } finally {
      setIsDeletingBgImage(false);
    }
  };

  const handleSavePageSettings = async (overrideData?: Partial<BioPageData>) => {
    setSaving(true);
    try {
      const payload = {
        ...page,
        section_order: draggableTabs,
        blocks_enabled: page.blocks_enabled !== false,
        social_enabled: page.social_enabled !== false,
        ...(overrideData || {}),
        username: usernameInput || page.username,
        custom_theme: {
          ...(page.custom_theme || {}),
          section_order: draggableTabs,
          blocks_enabled: page.blocks_enabled !== false,
          social_enabled: page.social_enabled !== false,
          show_social_usernames: page.show_social_usernames,
        },
      };
      const res = await api.put<{ page: BioPageData }>("/accounts/link-in-bio/", payload);
      if (res.data && res.data.page) {
        const loaded = res.data.page;
        const cTheme = loaded.custom_theme || {};
        const rawLoadedOrder = loaded.section_order || cTheme.section_order;
        const loadedOrder: string[] = Array.isArray(rawLoadedOrder) ? (rawLoadedOrder as string[]) : draggableTabs;
        if (loadedOrder.length > 0) {
          setDraggableTabs(loadedOrder);
        }
        setPage({
          ...loaded,
          section_order: loadedOrder,
          blocks_enabled:
            loaded.blocks_enabled !== undefined
              ? Boolean(loaded.blocks_enabled)
              : cTheme.blocks_enabled !== undefined
                ? Boolean(cTheme.blocks_enabled)
                : true,
          social_enabled:
            loaded.social_enabled !== undefined
              ? Boolean(loaded.social_enabled)
              : cTheme.social_enabled !== undefined
                ? Boolean(cTheme.social_enabled)
                : true,
          smart_redirect_enabled:
            loaded.smart_redirect_enabled !== undefined
              ? Boolean(loaded.smart_redirect_enabled)
              : true,
          smart_input_placeholder: loaded.smart_input_placeholder || "Paste link here...",
          smart_input_button_text: loaded.smart_input_button_text || "Get Link",
          smart_input_title: loaded.smart_input_title || "Have a Reel or Promo Link?",
          custom_theme: {
            background_type: cTheme.background_type || "preset",
            background_color: cTheme.background_color || "#131313",
            background_image_url: cTheme.background_image_url || "",
            background_overlay: cTheme.background_overlay || "dark",
            text_color: cTheme.text_color || "",
            ...cTheme,
          },
          show_social_usernames:
            loaded.show_social_usernames !== undefined
              ? Boolean(loaded.show_social_usernames)
              : cTheme.show_social_usernames !== undefined
                ? Boolean(cTheme.show_social_usernames)
                : true,
        });
        setUsernameInput(loaded.username);
        showToast("Saved successfully");
        setPreviewKey((k) => k + 1);
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string } } };
      showToast(apiErr.response?.data?.error || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!usernameInput || usernameInput === page.username) {
      return;
    }
    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await api.get<UsernameCheckResponse>(
          `/accounts/link-in-bio/check-username/?username=${encodeURIComponent(usernameInput)}`
        );
        setUsernameStatus({
          available: res.data.available,
          message: res.data.reason || (res.data.available ? "Available" : "Unavailable"),
        });
      } catch {
        setUsernameStatus(null);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [usernameInput, page.username]);

  const handleSaveBlock = async (blockData: Partial<BlockItem>) => {
    try {
      if (blockData.id) {
        const res = await api.put<{ block: BlockItem }>(`/accounts/link-in-bio/blocks/${blockData.id}/`, blockData);
        setBlocks((prev) => prev.map((b) => (b.id === blockData.id ? res.data.block : b)));
        showToast("Block updated");
      } else {
        const res = await api.post<{ block: BlockItem }>("/accounts/link-in-bio/blocks/", blockData);
        setBlocks((prev) => [...prev, res.data.block]);
        showToast("Block added");
      }
      setBlockModalOpen(false);
      setEditingBlock(null);
      setPreviewKey((k) => k + 1);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string } } };
      showToast(apiErr.response?.data?.error || "Failed to save block", "error");
    }
  };

  const handleDeleteBlock = async (blockId: number) => {
    if (!confirm("Delete this block?")) return;
    try {
      await api.delete(`/accounts/link-in-bio/blocks/${blockId}/`);
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      showToast("Block deleted");
      setPreviewKey((k) => k + 1);
    } catch {
      showToast("Failed to delete block", "error");
    }
  };

  const handleToggleBlockActive = async (block: BlockItem) => {
    const updated = { ...block, is_active: !block.is_active };
    setBlocks((prev) => prev.map((b) => (b.id === block.id ? updated : b)));
    try {
      await api.put(`/accounts/link-in-bio/blocks/${block.id}/`, { is_active: updated.is_active });
      setPreviewKey((k) => k + 1);
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const handleReorderBlocks = async (newBlocks: BlockItem[]) => {
    setBlocks(newBlocks);
    setPreviewKey((k) => k + 1);
    try {
      await api.post("/accounts/link-in-bio/blocks/reorder/", {
        block_ids: newBlocks.map((b) => b.id).filter(Boolean),
      });
    } catch {
      showToast("Failed to reorder blocks", "error");
    }
  };

  const handleMoveBlock = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(index, 1);
    newBlocks.splice(targetIndex, 0, moved);

    await handleReorderBlocks(newBlocks);
  };

  const handleReorderCustomSocialAccounts = (newCustomAccounts: PublicSocialAccount[]) => {
    const presetPlatformIds = new Set(AVAILABLE_PLATFORMS.map((p) => p.id).concat(["twitter"]));
    const presetAccounts = (page.social_accounts || []).filter(
      (s) => s.platform !== "custom" && presetPlatformIds.has(s.platform.toLowerCase()) && !s.id?.startsWith("custom_")
    );
    const combined = [...newCustomAccounts, ...presetAccounts];
    setPage({ ...page, social_accounts: combined });
    setPreviewKey((k) => k + 1);
  };

  const handleSaveRedirectRule = async (ruleData: Partial<RedirectRuleItem>) => {
    try {
      if (ruleData.id) {
        const res = await api.put<{ rule: RedirectRuleItem }>(
          `/accounts/link-in-bio/redirect-rules/${ruleData.id}/`,
          ruleData
        );
        setRedirectRules((prev) => prev.map((r) => (r.id === ruleData.id ? res.data.rule : r)));
        showToast("Rule updated");
      } else {
        const res = await api.post<{ rule: RedirectRuleItem }>("/accounts/link-in-bio/redirect-rules/", ruleData);
        setRedirectRules((prev) => [res.data.rule, ...prev]);
        showToast("Rule created");
      }
      setRuleModalOpen(false);
      setEditingRule(null);
      setPreviewKey((k) => k + 1);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string } } };
      showToast(apiErr.response?.data?.error || "Failed to save rule", "error");
    }
  };

  const handleDeleteRedirectRule = async (ruleId: number) => {
    if (!confirm("Delete this rule?")) return;
    try {
      await api.delete(`/accounts/link-in-bio/redirect-rules/${ruleId}/`);
      setRedirectRules((prev) => prev.filter((r) => r.id !== ruleId));
      showToast("Rule deleted");
    } catch {
      showToast("Failed to delete rule", "error");
    }
  };

  const handleTestSingleRule = async (rule: RedirectRuleItem) => {
    if (!rule.input_match_url?.trim()) return;
    setTestingRuleId(rule.id || null);
    try {
      const res = await api.post<TestRedirectResponse>(
        `/accounts/public/link-in-bio/${page.username}/resolve-redirect/`,
        {
          input_url: rule.input_match_url.trim(),
        }
      );
      if (res.data.found) {
        showToast(
          `✓ Test Matched! Routes to: ${res.data.destination_value || res.data.destination_title || rule.destination_value}`
        );
      } else {
        showToast("No redirect match found for this rule.", "error");
      }
    } catch {
      showToast("Error running test for this rule.", "error");
    } finally {
      setTestingRuleId(null);
    }
  };

  const handleOpenAddCustomSocial = () => {
    setEditingSocialAccount(null);
    setCustomSocialModalOpen(true);
  };

  const handleOpenEditCustomSocial = (account: PublicSocialAccount) => {
    setEditingSocialAccount(account);
    setCustomSocialModalOpen(true);
  };

  const handleSaveCustomSocial = (accountData: Partial<PublicSocialAccount>) => {
    const existing = page.social_accounts || [];
    let updatedAccounts: PublicSocialAccount[];

    const existsIndex = existing.findIndex((s) => s.id && s.id === accountData.id);
    if (existsIndex >= 0) {
      updatedAccounts = existing.map((s, idx) =>
        idx === existsIndex ? ({ ...s, ...accountData } as PublicSocialAccount) : s
      );
    } else {
      const newAccount: PublicSocialAccount = {
        id: accountData.id || `custom_${Date.now()}`,
        platform: accountData.platform || "custom",
        label: accountData.label || "Link",
        url: accountData.url || "",
        icon: accountData.icon || "link",
        is_active: accountData.is_active !== undefined ? accountData.is_active : true,
      };
      updatedAccounts = [...existing, newAccount];
    }

    setPage({ ...page, social_accounts: updatedAccounts });
    setCustomSocialModalOpen(false);
    setEditingSocialAccount(null);
    setPreviewKey((k) => k + 1);
    showToast(existsIndex >= 0 ? "Social link updated" : "Custom social link added");
  };

  const handleDeleteCustomSocial = (accountData: Partial<PublicSocialAccount>) => {
    const existing = page.social_accounts || [];
    const updated = existing.filter((s) => {
      if (accountData.id && s.id) return s.id !== accountData.id;
      if (accountData.platform && s.platform === accountData.platform && !s.id) return false;
      return true;
    });
    setPage({ ...page, social_accounts: updated });
    setCustomSocialModalOpen(false);
    setEditingSocialAccount(null);
    setPreviewKey((k) => k + 1);
    showToast("Social link removed");
  };

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "zoyee.in";
  const publicBioUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/@${page.username}`
      : `https://${rootDomain}/@${page.username}`;

  const handleCopyBioLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(publicBioUrl);
      setCopiedLink(true);
      showToast("Copied to clipboard");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getPreviewWidth = () => {
    if (previewDevice === "mobile") return "375px";
    if (previewDevice === "tablet") return "640px";
    return "100%";
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-white font-sans">
        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  const currentBgType = page.custom_theme?.background_type || "preset";
  const currentBgColor = page.custom_theme?.background_color || "#131313";
  const currentBgImage = page.custom_theme?.background_image_url || "";
  const currentBgOverlay = page.custom_theme?.background_overlay || "dark";
  const currentTextColor = page.custom_theme?.text_color || "";

  // Real-time live preview data reflects form updates immediately without needing save
  const livePreviewData: PublicBioPayload = {
    page: {
      ...page,
      section_order: draggableTabs,
      username: usernameInput || page.username,
      blocks_enabled: page.blocks_enabled !== false,
      social_enabled: page.social_enabled !== false,
      smart_redirect_enabled: page.smart_redirect_enabled !== false,
      smart_input_title: page.smart_input_title || "Have a Reel or Promo Link?",
      smart_input_placeholder: page.smart_input_placeholder || "Paste link here...",
      smart_input_button_text: page.smart_input_button_text || "Get Link",
    },
    blocks: blocks.filter((b) => b.is_active) as PublicBlockData[],
    creator: {
      username: usernameInput || page.username,
      full_name: page.title || usernameInput || page.username,
      profile_picture_url: page.profile_image_url,
    },
  };

  return (
    <div
      className="min-h-screen text-[#e5e2e1] pb-6 space-y-3 font-sans"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          isVisible={!!toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Top Header Card (2 rows on mobile, 1 row on desktop) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#1c1b1b] p-2 sm:px-2.5 sm:py-1 rounded border border-[#20201f]">
        {/* Row 1 on Mobile: User Link & Active Status Toggle */}
        <div className="flex items-center justify-between gap-2 w-full sm:w-auto min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-6.5 h-6.5 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
              <Link2 className="w-3.5 h-3.5 text-[#c4c0ff]" />
            </div>

            <div className="flex items-center gap-2 min-w-0">
              {isEditingUsername ? (
                <div className="flex items-center gap-1 bg-[#121214] border border-[#353535] focus-within:border-white/50 rounded px-2 py-0.5 text-xs text-white">
                  <span className="text-zinc-500 font-mono text-[11px] select-none">{rootDomain}/@</span>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "");
                      setUsernameInput(val);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSavePageSettings();
                        setIsEditingUsername(false);
                      } else if (e.key === "Escape") {
                        setUsernameInput(page.username);
                        setIsEditingUsername(false);
                      }
                    }}
                    className="bg-transparent text-white font-mono text-xs focus:outline-none w-24 sm:w-32"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleSavePageSettings();
                      setIsEditingUsername(false);
                    }}
                    className="p-0.5 hover:text-emerald-400 text-zinc-400 transition-colors cursor-pointer"
                    title="Save username"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUsernameInput(page.username);
                      setIsEditingUsername(false);
                    }}
                    className="p-0.5 hover:text-red-400 text-zinc-400 transition-colors cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 min-w-0">
                  {/* Clickable URL button to copy */}
                  <button
                    type="button"
                    onClick={handleCopyBioLink}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#121214] hover:bg-[#252528] border border-[#2c2c2c] hover:border-zinc-500 transition-all cursor-pointer select-none group/copy max-w-full"
                    title="Click to copy link"
                  >
                    <span className="text-xs font-bold text-white tracking-tight truncate">
                      {rootDomain}/@{page.username}
                    </span>
                    {copiedLink ? (
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    ) : (
                      <Copy className="w-3 h-3 text-zinc-400 group-hover/copy:text-white transition-colors shrink-0" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingUsername(true)}
                    className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                    title="Edit Page URL / Username"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#c4c0ff]" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Active Status Switch Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={page.is_published}
            onClick={() => {
              const nextPublished = !page.is_published;
              setPage((prev) => ({ ...prev, is_published: nextPublished }));
              handleSavePageSettings({ is_published: nextPublished });
            }}
            className="flex items-center gap-2 cursor-pointer select-none bg-[#141414] px-2.5 py-1 rounded border border-[#2c2c2c] hover:border-[#3d3d3d] transition-all shrink-0"
            title={page.is_published ? "Status: Active (Click to Disable)" : "Status: Inactive (Click to Enable)"}
          >
            <span className={cn("text-xs font-bold tracking-tight", page.is_published ? "text-white" : "text-zinc-400")}>
              {page.is_published ? "Active" : "Inactive"}
            </span>
            <div
              className={cn(
                "w-7 h-4 rounded-full p-0.5 transition-colors duration-200 flex items-center",
                page.is_published ? "bg-emerald-500" : "bg-zinc-700"
              )}
            >
              <div
                className={cn(
                  "w-3 h-3 rounded-full bg-white transition-transform duration-200 shadow-sm",
                  page.is_published ? "translate-x-3" : "translate-x-0"
                )}
              />
            </div>
          </button>
        </div>

        {/* Row 2 on Mobile: Action Buttons (Analytics, Preview, Save) */}
        <div className="grid grid-cols-3 sm:flex items-center gap-1.5 w-full sm:w-auto shrink-0 border-t border-white/5 pt-2 sm:border-0 sm:pt-0">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "analytics" ? "blocks" : "analytics")}
            className={cn(
              "px-2 py-1.5 sm:px-2.5 sm:py-1 rounded border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none",
              activeTab === "analytics"
                ? "bg-white text-black font-bold border-white shadow-sm hover:bg-zinc-200"
                : "bg-[#20201f] hover:bg-[#2c2c2c] border-[#353535] text-white"
            )}
            title={activeTab === "analytics" ? "Back to Bio Editor" : "View Analytics"}
          >
            {activeTab === "analytics" ? (
              <>
                <ArrowLeft className="w-3.5 h-3.5 text-black" />
                <span>Set Bio</span>
              </>
            ) : (
              <>
                <BarChart3 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Analytics</span>
              </>
            )}
          </button>

          {/* Mobile Preview Button (< xl) */}
          {activeTab !== "analytics" && (
            <button
              type="button"
              onClick={() => setMockPreviewModalOpen(true)}
              className="flex xl:hidden items-center justify-center gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-1 rounded bg-[#20201f] hover:bg-[#2c2c2c] border border-[#353535] text-xs font-semibold text-white transition-all cursor-pointer"
              title="Preview Live Page"
            >
              <Eye className="w-3.5 h-3.5 text-[#c4c0ff]" />
              <span>Preview</span>
            </button>
          )}

          {/* QR Code Button (hidden on mobile < sm) */}
          <button
            type="button"
            onClick={() => setQrModalOpen(true)}
            className="hidden sm:flex items-center justify-center gap-1 px-2.5 py-1 rounded bg-[#20201f] hover:bg-[#2c2c2c] border border-[#353535] text-xs font-semibold text-white transition-all cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-zinc-400" />
            <span>QR Code</span>
          </button>

          {/* Open Button (hidden on mobile < sm) */}
          <a
            href={publicBioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center justify-center gap-1 px-2.5 py-1 rounded bg-[#20201f] hover:bg-[#2c2c2c] border border-[#353535] text-xs font-semibold text-white transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            <span>Open</span>
          </a>

          <button
            onClick={() => handleSavePageSettings()}
            disabled={saving}
            className="px-3 py-1.5 sm:py-1 rounded bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Saving…</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Horizontal Tabs & Device Switcher Bar */}
      {activeTab !== "analytics" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-[#151515] p-1 rounded border border-[#20201f]">
          {/* Left: Horizontal Tabs (Pinned Styling + Draggable Page Sections + Separate Analytics Section) */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {/* Pinned Tab 1: Styling */}
            <button
              type="button"
              onClick={() => setActiveTab("styling")}
              className={cn(
                "px-2.5 py-1.5 rounded border border-[#2c2c2c] bg-[#101010]  text-[11px] font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer shrink-0 select-none",
                activeTab === "styling"
                  ? "bg-white text-black font-bold shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              {activeTab === "styling" && <Palette className="w-3 h-3 shrink-0" />}
              <span>Styling</span>
            </button>

            {/* Draggable Page Sections (Blocks, Social Hub, Redirects) */}
            <Reorder.Group
              axis="x"
              values={draggableTabs}
              onReorder={handleTabReorder}
              className="flex items-center gap-1 border border-[#2c2c2c] bg-[#101010] p-0.5 rounded"
            >
              {draggableTabs.map((tabId) => {
                const tabMeta: Record<string, { label: string; icon: any; count?: number }> = {
                  blocks: { label: "Blocks", icon: Layers, count: blocks.length },
                  social: {
                    label: "Social Hub",
                    icon: Share2,
                    count: page.social_accounts?.filter((s) => s.is_active && s.url).length || 0,
                  },
                  redirects: { label: "Redirects", icon: Sparkles, count: redirectRules.length },
                };

                const meta = tabMeta[tabId];
                if (!meta) return null;
                const Icon = meta.icon;
                const isActive = activeTab === tabId;

                return (
                  <Reorder.Item
                    key={tabId}
                    value={tabId}
                    className="shrink-0"
                    title="Drag tab to reorder public section"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTab(tabId as any)}
                      className={cn(
                        "px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-grab active:cursor-grabbing shrink-0 select-none group",
                        isActive
                          ? "bg-white text-black font-bold shadow-sm"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <GripVertical className="w-3 h-3 text-zinc-500 opacity-60 group-hover:opacity-100 shrink-0 transition-opacity" />
                      {isActive && <Icon className="w-3 h-3 shrink-0" />}
                      <span>{meta.label}</span>
                    </button>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          </div>

          {/* Right: Apple Device Viewport Switcher */}
          <div className="hidden sm:flex items-center gap-0.5 bg-[#101010] p-0.5 rounded border border-[#2c2c2c] shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              className={cn(
                "px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-all select-none cursor-pointer",
                previewDevice === "mobile" ? "bg-white text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
              )}
              title="iPhone 17 Pro Max (iOS)"
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span>iPhone</span>
            </button>

            <button
              type="button"
              onClick={() => setPreviewDevice("tablet")}
              className={cn(
                "px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-all select-none cursor-pointer",
                previewDevice === "tablet" ? "bg-white text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
              )}
              title="iPad Pro (iPadOS)"
            >
              <Tablet className="w-3.5 h-3.5 shrink-0" />
              <span>iPad</span>
            </button>

            <button
              type="button"
              onClick={() => setPreviewDevice("desktop")}
              className={cn(
                "px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-all select-none cursor-pointer",
                previewDevice === "desktop" ? "bg-white text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
              )}
              title="Mac (macOS)"
            >
              <Monitor className="w-3.5 h-3.5 shrink-0" />
              <span>Mac</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Left Studio Panels, Right Live Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-start">
        {/* Left Column: Active Tab Section */}
        <div
          className={cn(
            "flex flex-col gap-3 transition-all duration-300",
            activeTab === "analytics"
              ? "xl:col-span-12"
              : previewDevice === "mobile"
                ? "xl:col-span-7"
                : previewDevice === "tablet"
                  ? "xl:col-span-6"
                  : "xl:col-span-5"
          )}
        >
          {/* TAB 1: CONTENT BLOCKS */}
          {activeTab === "blocks" && (
            <div className="bg-[#1c1b1b] p-3 rounded border border-[#20201f] space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>Content Blocks</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#c4c0ff]/10 text-[#c4c0ff] border border-[#c4c0ff]/20">
                    {blocks.length}
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  {/* Enable / Disable Switch Toggle */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={page.blocks_enabled !== false}
                    onClick={() => {
                      const nextVal = page.blocks_enabled === false ? true : false;
                      setPage({ ...page, blocks_enabled: nextVal });
                      setPreviewKey((k) => k + 1);
                    }}
                    className="flex items-center gap-1.5 cursor-pointer select-none bg-[#141414] px-2.5 py-1 rounded border border-[#2c2c2c] hover:border-[#3d3d3d] transition-all shrink-0 h-[28px]"
                    title={page.blocks_enabled !== false ? "Content Blocks Enabled (Click to Disable)" : "Content Blocks Disabled (Click to Enable)"}
                  >
                    <span className="text-xs font-semibold text-zinc-300">
                      {page.blocks_enabled !== false ? "Enabled" : "Disabled"}
                    </span>
                    <div
                      className={cn(
                        "w-6 h-3.5 rounded-full p-0.5 transition-colors duration-200 flex items-center",
                        page.blocks_enabled !== false ? "bg-emerald-500" : "bg-zinc-700"
                      )}
                    >
                      <div
                        className={cn(
                          "w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 shadow-sm",
                          page.blocks_enabled !== false ? "translate-x-2.5" : "translate-x-0"
                        )}
                      />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingBlock(null);
                      setBlockModalOpen(true);
                    }}
                    className="px-2.5 py-1 bg-white text-black font-bold text-xs rounded hover:bg-zinc-200 transition-all flex items-center gap-1 cursor-pointer shadow-sm shrink-0 h-[28px] select-none"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Block</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {blocks.length === 0 ? (
                  <div className="py-8 text-center rounded border border-dashed border-[#353535] p-5 space-y-2">
                    <Layers className="w-6 h-6 mx-auto text-zinc-500" />
                    <button
                      onClick={() => {
                        setEditingBlock(null);
                        setBlockModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-white text-black font-bold text-xs rounded hover:bg-zinc-200 transition-all cursor-pointer"
                    >
                      + Add Block
                    </button>
                  </div>
                ) : (
                  <Reorder.Group
                    axis="y"
                    values={blocks}
                    onReorder={handleReorderBlocks}
                    className="space-y-2"
                  >
                    {blocks.map((block, index) => {
                      const blockKey = block.id || index;
                      const BlockIcon = BLOCK_TYPE_ICON_MAP[block.block_type] || Link2;

                      return (
                        <Reorder.Item
                          key={blockKey}
                          value={block}
                          whileDrag={{
                            boxShadow: "0 20px 30px -10px rgba(0,0,0,0.8)",
                            zIndex: 50,
                          }}
                          className={cn(
                            "group rounded-md border transition-colors select-none overflow-hidden cursor-pointer",
                            block.is_active
                              ? "bg-[#20201f] border-[#353535]/80 hover:border-zinc-500 shadow-sm"
                              : "bg-black/30 border-[#20201f] opacity-60"
                          )}
                          onClick={() => {
                            setEditingBlock(block);
                            setBlockModalOpen(true);
                          }}
                        >
                          {/* Single-line Header Row */}
                          <div className="flex items-center justify-between gap-2.5 p-2.5 sm:p-3 hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {/* Drag Handle */}
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/10 cursor-grab active:cursor-grabbing transition-colors shrink-0"
                                title="Drag to reorder"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>

                              {/* Block Type Icon Box */}
                              <div className="w-6 h-6 rounded bg-[#c4c0ff]/10 border border-[#c4c0ff]/20 flex items-center justify-center text-[#c4c0ff] shrink-0" title={block.block_type.replace("_", " ")}>
                                <BlockIcon className="w-3.5 h-3.5" />
                              </div>

                              {/* Block Type Badge */}
                              {/* <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-white/10 text-zinc-300 shrink-0">
                                {block.block_type.replace("_", " ")}
                              </span> */}

                              {/* Single-line Title & Subtitle */}
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <h3 className="text-xs font-semibold text-white truncate">
                                  {block.title || "Untitled Block"}
                                </h3>
                                {block.url && (
                                  <span className="text-[10px] text-zinc-400 truncate hidden sm:inline font-mono">
                                    {block.url}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Right Actions */}
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 shrink-0"
                            >
                              <button
                                type="button"
                                onClick={() => handleToggleBlockActive(block)}
                                className={cn(
                                  "p-1.5 rounded transition-colors cursor-pointer",
                                  block.is_active
                                    ? "text-emerald-400 hover:bg-emerald-500/10"
                                    : "text-zinc-500 hover:bg-white/10"
                                )}
                                title={block.is_active ? "Hide block" : "Show block"}
                              >
                                {block.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingBlock(block);
                                  setBlockModalOpen(true);
                                }}
                                className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Edit block"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => block.id && handleDeleteBlock(block.id)}
                                className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                title="Delete block"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE & BACKGROUND STYLING */}
          {activeTab === "styling" && (
            <div className="bg-[#1c1b1b] p-3.5 rounded-lg border border-[#20201f] space-y-5 animate-in fade-in">
              {/* SECTION 1: PROFILE IDENTITY */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  {/* <div className="w-6 h-6 rounded bg-[#c4c0ff]/10 border border-[#c4c0ff]/20 flex items-center justify-center text-[#c4c0ff]">
                    <User className="w-3.5 h-3.5" />
                  </div> */}
                  <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">Profile Details</h2>
                </div>

                {/* Media Cards: Avatar & Banner side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Profile Avatar Card */}
                  <div className="p-3 rounded-lg bg-[#20201f] border border-[#353535] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#c4c0ff]" />
                        <span>Profile Avatar</span>
                      </label>
                      {page.profile_image_url && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          disabled={isDeletingAvatar}
                          className="text-[10px] font-semibold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {isDeletingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shrink-0 bg-black flex items-center justify-center shadow-md">
                        {page.profile_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={page.profile_image_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <Globe className="w-5 h-5 text-zinc-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <input
                          type="file"
                          ref={avatarInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAvatarUpload(file);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={avatarUploading}
                          className="w-full py-1.5 px-3 rounded-md bg-[#131313] hover:bg-[#252525] border border-[#353535] text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          {avatarUploading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c4c0ff]" />
                              <span>{avatarUploadProgress}%</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Upload Avatar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cover Banner Card */}
                  <div className="p-3 rounded-lg bg-[#20201f] border border-[#353535] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#c4c0ff]" />
                        <span>Cover Banner</span>
                      </label>
                      {page.banner_image_url && (
                        <button
                          type="button"
                          onClick={handleRemoveBanner}
                          disabled={isDeletingBanner}
                          className="text-[10px] font-semibold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {isDeletingBanner ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-md overflow-hidden border border-white/20 shrink-0 bg-black flex items-center justify-center shadow-md">
                        {page.banner_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={page.banner_image_url} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-zinc-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <input
                          type="file"
                          ref={bannerInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleBannerUpload(file);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => bannerInputRef.current?.click()}
                          disabled={bannerUploading}
                          className="w-full py-1.5 px-3 rounded-md bg-[#131313] hover:bg-[#252525] border border-[#353535] text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          {bannerUploading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c4c0ff]" />
                              <span>{bannerUploadProgress}%</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Upload Banner</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Display Name & Bio inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Type className="w-3 h-3 text-zinc-400" />
                      <span>Display Name</span>
                    </label>
                    <input
                      type="text"
                      value={page.title}
                      onChange={(e) => {
                        setPage({ ...page, title: e.target.value });
                        setPreviewKey((k) => k + 1);
                      }}
                      placeholder="e.g. Alex Rivera"
                      className="w-full bg-[#131313] border border-[#353535] rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-all shadow-inner"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <AlignLeft className="w-3 h-3 text-zinc-400" />
                      <span>Bio</span>
                    </label>
                    <input
                      type="text"
                      value={page.bio}
                      onChange={(e) => {
                        setPage({ ...page, bio: e.target.value });
                        setPreviewKey((k) => k + 1);
                      }}
                      placeholder="Short bio description"
                      className="w-full bg-[#131313] border border-[#353535] rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: APPEARANCE & BACKGROUND */}
              <div className="pt-2 border-t border-white/5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#c4c0ff]/10 border border-[#c4c0ff]/20 flex items-center justify-center text-[#c4c0ff]">
                      <Palette className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">Appearance & Background</h2>
                  </div>

                  {/* Background Style Segmented Pill */}
                  <div className="inline-flex items-center gap-0.5 bg-[#141414] p-0.5 rounded-lg border border-[#2c2c2c] self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setPage((prev) => ({
                          ...prev,
                          custom_theme: { ...prev.custom_theme, background_type: "preset" },
                        }));
                        setPreviewKey((k) => k + 1);
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer select-none",
                        currentBgType === "preset"
                          ? "bg-white text-black font-bold shadow-sm"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {currentBgType === "preset" && <Palette className="w-3 h-3 shrink-0" />}
                      <span>Theme</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPage((prev) => ({
                          ...prev,
                          custom_theme: { ...prev.custom_theme, background_type: "color" },
                        }));
                        setPreviewKey((k) => k + 1);
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer select-none",
                        currentBgType === "color"
                          ? "bg-white text-black font-bold shadow-sm"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {currentBgType === "color" && <Sparkles className="w-3 h-3 shrink-0" />}
                      <span>Color</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPage((prev) => ({
                          ...prev,
                          custom_theme: { ...prev.custom_theme, background_type: "image" },
                        }));
                        setPreviewKey((k) => k + 1);
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer select-none",
                        currentBgType === "image"
                          ? "bg-white text-black font-bold shadow-sm"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {currentBgType === "image" && <ImageIcon className="w-3 h-3 shrink-0" />}
                      <span>Wallpaper</span>
                    </button>
                  </div>
                </div>

                {/* MODE 1: PRESET THEMES */}
                {currentBgType === "preset" && (
                  <div className="p-3.5 rounded-lg bg-[#20201f] border border-[#353535] space-y-2 animate-in fade-in">
                    <label className="text-xs font-semibold text-zinc-300">Preset Theme Selection</label>

                    <div className="relative" ref={presetThemeRef}>
                      {/* Dropdown Trigger */}
                      <button
                        type="button"
                        onClick={() => setPresetThemeOpen(!presetThemeOpen)}
                        className="w-full bg-[#131313] border border-[#353535] hover:border-zinc-500 rounded-md p-2 text-xs text-white flex items-center justify-between transition-all cursor-pointer select-none h-[36px]"
                      >
                        <div className="flex items-center gap-2 truncate min-w-0">
                          <div
                            className="w-5 h-4 rounded overflow-hidden border border-white/20 shrink-0 flex items-center justify-center p-0.5 shadow-sm"
                            style={{
                              background:
                                PRESET_THEME_GRADIENTS[page.theme_id] ||
                                (BIO_THEMES as Record<string, any>)[page.theme_id]?.bgStyle?.backgroundImage ||
                                "#131313",
                            }}
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full shadow-sm ring-1 ring-black/40"
                              style={{
                                backgroundColor:
                                  (BIO_THEMES as Record<string, any>)[page.theme_id]?.accentColor || "#c4c0ff",
                              }}
                            />
                          </div>
                          <span className="font-semibold text-white truncate text-xs">
                            {(BIO_THEMES as Record<string, any>)[page.theme_id]?.name || "Select Theme"}
                          </span>
                        </div>
                        <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-400 transition-transform shrink-0 ml-1", presetThemeOpen && "rotate-180")} />
                      </button>

                      {/* Dropdown Menu */}
                      {presetThemeOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#161616] border border-[#353535] rounded-lg shadow-2xl z-30 p-1.5 space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                          {Object.values(BIO_THEMES).map((theme) => {
                            const isSelected = page.theme_id === theme.id;
                            const gradientStyle =
                              PRESET_THEME_GRADIENTS[theme.id] ||
                              (theme.bgStyle as any)?.backgroundImage ||
                              "#131313";
                            return (
                              <button
                                key={theme.id}
                                type="button"
                                onClick={() => {
                                  setPage({
                                    ...page,
                                    theme_id: theme.id,
                                    custom_theme: {
                                      ...page.custom_theme,
                                      background_type: "preset",
                                    },
                                  });
                                  setPresetThemeOpen(false);
                                  setPreviewKey((k) => k + 1);
                                }}
                                className={cn(
                                  "w-full px-2.5 py-2 rounded-md flex items-center justify-between text-left transition-all cursor-pointer text-xs select-none",
                                  isSelected ? "bg-white/10 text-white font-bold" : "text-zinc-300 hover:bg-white/5 hover:text-white"
                                )}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <div
                                    className="w-8 h-5.5 rounded-md overflow-hidden border border-white/20 shrink-0 flex items-center justify-center p-0.5 shadow-sm"
                                    style={{ background: gradientStyle }}
                                  >
                                    <div
                                      className="w-2 h-2 rounded-full shadow-sm ring-1 ring-black/40"
                                      style={{ backgroundColor: theme.accentColor }}
                                    />
                                  </div>
                                  <span className="truncate">{theme.name}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <div
                                    className="w-10 h-2.5 rounded-full border border-white/10 opacity-70 hidden sm:block"
                                    style={{ background: gradientStyle }}
                                  />
                                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* MODE 2: SOLID / GRADIENT COLOR */}
                {currentBgType === "color" && (
                  <div className="p-3.5 rounded-lg bg-[#20201f] border border-[#353535] space-y-2.5 animate-in fade-in">
                    <label className="text-xs font-semibold text-zinc-300">Quick Palette Swatches</label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto custom-scrollbar p-1">
                        {PRESET_BG_PALETTES.map((palette) => {
                          const isChosen = currentBgColor.toLowerCase() === palette.color.toLowerCase();
                          return (
                            <button
                              key={palette.color}
                              type="button"
                              onClick={() => {
                                setPage((prev) => ({
                                  ...prev,
                                  custom_theme: { ...prev.custom_theme, background_color: palette.color },
                                }));
                                setPreviewKey((k) => k + 1);
                              }}
                              className={cn(
                                "w-7 h-7 rounded-full border transition-all cursor-pointer flex items-center justify-center shadow-sm relative group shrink-0",
                                isChosen
                                  ? "border-white ring-2 ring-white/40 scale-110"
                                  : "border-white/20 hover:scale-105 hover:border-white/60"
                              )}
                              style={{ background: palette.gradient }}
                              title={palette.name}
                            >
                              {isChosen && <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Hex Code */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="relative w-8 h-8 rounded-md overflow-hidden border border-white/20 shrink-0 cursor-pointer shadow-sm">
                        <input
                          type="color"
                          value={currentBgColor}
                          onChange={(e) => {
                            setPage((prev) => ({
                              ...prev,
                              custom_theme: { ...prev.custom_theme, background_color: e.target.value },
                            }));
                            setPreviewKey((k) => k + 1);
                          }}
                          className="absolute -inset-2 w-12 h-12 cursor-pointer opacity-0"
                        />
                        <div className="w-full h-full" style={{ backgroundColor: currentBgColor }} />
                      </div>
                      <input
                        type="text"
                        value={currentBgColor}
                        onChange={(e) => {
                          setPage((prev) => ({
                            ...prev,
                            custom_theme: { ...prev.custom_theme, background_color: e.target.value },
                          }));
                          setPreviewKey((k) => k + 1);
                        }}
                        placeholder="#131313"
                        className="flex-1 bg-[#131313] border border-[#353535] rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white font-mono shadow-inner"
                      />
                    </div>
                  </div>
                )}

                {/* MODE 3: CUSTOM WALLPAPER */}
                {currentBgType === "image" && (
                  <div className="p-3 rounded-lg bg-[#20201f] border border-[#353535] space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3.5 animate-in fade-in">
                    {/* Left Column: Custom Wallpaper Upload */}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-zinc-300">Custom Wallpaper</label>
                        {currentBgImage && (
                          <button
                            type="button"
                            onClick={handleRemoveBgImage}
                            disabled={isDeletingBgImage}
                            className="text-[10px] font-semibold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            {isDeletingBgImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-12 h-9 rounded-md overflow-hidden border border-white/20 shrink-0 bg-black flex items-center justify-center shadow-md">
                          {currentBgImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={currentBgImage} alt="Background" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-zinc-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <input
                            type="file"
                            ref={bgImageInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleBgImageUpload(file);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => bgImageInputRef.current?.click()}
                            disabled={bgImageUploading}
                            className="w-full py-1.5 px-2.5 rounded-md bg-[#131313] hover:bg-[#252525] border border-[#353535] text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                          >
                            {bgImageUploading ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-[#c4c0ff]" />
                                <span className="truncate">{bgImageUploadProgress}%…</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3 h-3 text-zinc-400" />
                                <span>Upload</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Divider Line */}
                    <div className="hidden sm:block w-px h-10 bg-[#353535]/60 shrink-0" />

                    {/* Right Column: Overlay Dark Tint */}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <label className="text-xs font-semibold text-zinc-300">Overlay Dark Tint</label>
                      <div className="grid grid-cols-3 gap-1 bg-[#131313] p-1 rounded-md border border-[#353535]">
                        {[
                          { id: "light", label: "Soft" },
                          { id: "dark", label: "Medium" },
                          { id: "heavy", label: "Heavy" },
                        ].map((tint) => {
                          const isSelected = currentBgOverlay === tint.id;
                          return (
                            <button
                              key={tint.id}
                              type="button"
                              onClick={() => {
                                setPage((prev) => ({
                                  ...prev,
                                  custom_theme: {
                                    ...prev.custom_theme,
                                    background_overlay: tint.id as "dark" | "heavy" | "light",
                                  },
                                }));
                                setPreviewKey((k) => k + 1);
                              }}
                              className={cn(
                                "py-1 px-1.5 rounded text-[10px] font-semibold text-center transition-all cursor-pointer select-none truncate",
                                isSelected
                                  ? "bg-white text-black font-bold shadow-sm"
                                  : "text-zinc-400 hover:text-white hover:bg-white/5"
                              )}
                            >
                              {tint.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* UNIFIED GLOBAL TEXT COLOR OVERRIDE */}
                <div className="p-3.5 rounded-lg bg-[#20201f] border border-[#353535] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-[#c4c0ff]" />
                      <span>Text Color Override</span>
                    </label>
                    {currentTextColor && (
                      <button
                        type="button"
                        onClick={() => {
                          setPage((prev) => ({
                            ...prev,
                            custom_theme: { ...prev.custom_theme, text_color: "" },
                          }));
                          setPreviewKey((k) => k + 1);
                        }}
                        className="text-[10px] text-zinc-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                        title="Reset to theme default"
                      >
                        <RotateCcw className="w-3 h-3 text-[#c4c0ff]" />
                        <span>Reset Default</span>
                      </button>
                    )}
                  </div>

                  {/* Preset Text Color Swatches */}
                  <div className="flex items-center gap-2">
                    {[
                      { name: "White", color: "#ffffff" },
                      { name: "Soft Pearl", color: "#e4e4e7" },
                      { name: "Golden Sand", color: "#fef08a" },
                      { name: "Cyan Spark", color: "#a5f3fc" },
                      { name: "Neon Mint", color: "#a7f3d0" },
                      { name: "Rose Pink", color: "#fbcfe8" },
                    ].map((swatch) => {
                      const isChosen = currentTextColor?.toLowerCase() === swatch.color.toLowerCase();
                      return (
                        <button
                          key={swatch.color}
                          type="button"
                          onClick={() => {
                            setPage((prev) => ({
                              ...prev,
                              custom_theme: { ...prev.custom_theme, text_color: swatch.color },
                            }));
                            setPreviewKey((k) => k + 1);
                          }}
                          className={cn(
                            "w-6 h-6 rounded-full border transition-all cursor-pointer flex items-center justify-center shadow-sm shrink-0",
                            isChosen ? "border-white ring-2 ring-white/40 scale-110" : "border-white/20 hover:scale-105"
                          )}
                          style={{ backgroundColor: swatch.color }}
                          title={swatch.name}
                        >
                          {isChosen && <Check className="w-3 h-3 text-black font-bold" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Hex Code */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="relative w-8 h-8 rounded-md overflow-hidden border border-white/20 shrink-0 cursor-pointer shadow-sm">
                      <input
                        type="color"
                        value={currentTextColor || "#ffffff"}
                        onChange={(e) => {
                          setPage((prev) => ({
                            ...prev,
                            custom_theme: { ...prev.custom_theme, text_color: e.target.value },
                          }));
                          setPreviewKey((k) => k + 1);
                        }}
                        className="absolute -inset-2 w-12 h-12 cursor-pointer opacity-0"
                      />
                      <div className="w-full h-full" style={{ backgroundColor: currentTextColor || "#ffffff" }} />
                    </div>
                    <input
                      type="text"
                      value={currentTextColor}
                      onChange={(e) => {
                        setPage((prev) => ({
                          ...prev,
                          custom_theme: { ...prev.custom_theme, text_color: e.target.value },
                        }));
                        setPreviewKey((k) => k + 1);
                      }}
                      placeholder="Theme Default (#ffffff)"
                      className="flex-1 bg-[#131313] border border-[#353535] rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white font-mono shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SOCIAL MEDIA HUB */}
          {activeTab === "social" && (
            <div className="bg-[#1c1b1b] p-3 rounded border border-[#20201f] space-y-3 animate-in fade-in">
              {/* Header Toolbar: All in One Line */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/5 pb-3">
                {/* Label & Active Count */}
                <div className="flex items-center gap-2">
                  {/* <div className="w-6 h-6 rounded bg-[#c4c0ff]/10 border border-[#c4c0ff]/20 flex items-center justify-center text-[#c4c0ff]">
                    <Share2 className="w-3.5 h-3.5" />
                  </div> */}
                  <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Social Media Hub</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#c4c0ff]/10 text-[#c4c0ff] border border-[#c4c0ff]/20">
                      {page.social_accounts?.filter((s) => s.is_active && s.url).length || 0}
                    </span>
                  </h2>
                </div>

                {/* Right Controls in One Line: Enable Switch, Icon Position Tabs, Show Handles, Add Custom Link */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Enable / Disable Switch Toggle for Social Hub */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={page.social_enabled !== false}
                    onClick={() => {
                      const nextVal = page.social_enabled === false ? true : false;
                      setPage({ ...page, social_enabled: nextVal });
                      setPreviewKey((k) => k + 1);
                    }}
                    className="flex items-center gap-1.5 cursor-pointer select-none bg-[#141414] px-2.5 py-1 rounded border border-[#2c2c2c] hover:border-[#3d3d3d] transition-all shrink-0 h-[28px]"
                    title={page.social_enabled !== false ? "Social Hub Enabled (Click to Disable)" : "Social Hub Disabled (Click to Enable)"}
                  >
                    <span className="text-xs font-semibold text-zinc-300">
                      {page.social_enabled !== false ? "Enabled" : "Disabled"}
                    </span>
                    <div
                      className={cn(
                        "w-6 h-3.5 rounded-full p-0.5 transition-colors duration-200 flex items-center",
                        page.social_enabled !== false ? "bg-emerald-500" : "bg-zinc-700"
                      )}
                    >
                      <div
                        className={cn(
                          "w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 shadow-sm",
                          page.social_enabled !== false ? "translate-x-2.5" : "translate-x-0"
                        )}
                      />
                    </div>
                  </button>

                  {/* Add Custom Link Button */}
                  <button
                    type="button"
                    onClick={handleOpenAddCustomSocial}
                    className="px-2.5 py-1 rounded bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all flex items-center gap-1 cursor-pointer shadow-sm shrink-0 h-[28px] select-none"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Link</span>
                  </button>
                </div>
              </div>

              {/* Popular Networks Dropdown Selector */}
              <div className="space-y-1 relative" ref={popularNetworkRef}>
                <label className="text-xs font-semibold text-zinc-300">
                  <span>Popular Networks</span>
                </label>

                <button
                  type="button"
                  onClick={() => setPopularNetworkDropdownOpen(!popularNetworkDropdownOpen)}
                  className="w-full bg-[#131313] border border-[#353535] hover:border-zinc-500 rounded p-2 text-xs text-white flex items-center justify-between transition-all cursor-pointer select-none h-[36px]"
                >
                  <div className="flex items-center gap-2 text-zinc-300 truncate min-w-0">
                    <Plus className="w-3.5 h-3.5 text-[#c4c0ff] shrink-0" />
                    <span className="font-medium text-xs text-zinc-400 truncate">
                      Select network...
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 text-zinc-400 transition-transform shrink-0 ml-1",
                      popularNetworkDropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                {popularNetworkDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#161616] border border-[#353535] rounded shadow-2xl z-30 p-1.5 space-y-1 max-h-64 overflow-y-auto">
                    {AVAILABLE_PLATFORMS.map((platform) => {
                      const isAlreadyAdded = (page.social_accounts || []).some(
                        (s) =>
                          (s.platform === platform.id || (platform.id === "x" && s.platform === "twitter")) &&
                          s.is_active
                      );

                      return (
                        <button
                          key={platform.id}
                          type="button"
                          onClick={() => {
                            const existing = page.social_accounts || [];
                            const matchKey = (s: PublicSocialAccount) =>
                              s.platform === platform.id || (platform.id === "x" && s.platform === "twitter");
                            let nextAccounts: PublicSocialAccount[];

                            if (existing.some(matchKey)) {
                              nextAccounts = existing.map((s) =>
                                matchKey(s) ? { ...s, is_active: true, icon: platform.icon || platform.id } : s
                              );
                            } else {
                              nextAccounts = [
                                ...existing,
                                {
                                  id: `preset_${platform.id}`,
                                  platform: platform.id,
                                  url: "",
                                  label: platform.name,
                                  icon: platform.icon || platform.id,
                                  is_active: true,
                                },
                              ];
                            }

                            const targetId = `preset_${platform.id}`;
                            setPage({ ...page, social_accounts: nextAccounts });
                            setPopularNetworkDropdownOpen(false);
                            setEditingSocialId(targetId);
                            setPreviewKey((k) => k + 1);
                          }}
                          className={cn(
                            "w-full px-2.5 py-2 rounded flex items-center justify-between text-left transition-all cursor-pointer text-xs select-none",
                            isAlreadyAdded
                              ? "bg-white/10 text-white font-bold"
                              : "text-zinc-300 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-white">
                              <SocialIcon platformOrIcon={platform.icon || platform.id} className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-medium text-xs">{platform.name}</span>
                          </div>
                          {isAlreadyAdded ? (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              Active
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-500">+ Add</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Configured Social Links List */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Configured Social Links ({(page.social_accounts || []).filter((s) => s.is_active || s.url).length})
                  </h3>

                  {/* Show Handles Switch Toggle */}

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      role="switch"
                      aria-checked={page.show_social_usernames}
                      onClick={() => {
                        setPage({ ...page, show_social_usernames: !page.show_social_usernames });
                        setPreviewKey((k) => k + 1);
                      }}
                      className="flex items-center gap-1.5 cursor-pointer select-none  px-2 py-1 rounded  hover:border-[#3d3d3d] transition-all"
                    >
                      <span className="text-[12px] sm:text-[12px] font-semibold text-zinc-300">Labels</span>
                      <div
                        className={cn(
                          "w-6 h-3.5 rounded-full p-0.5 transition-colors duration-200 flex items-center",
                          page.show_social_usernames ? "bg-emerald-500" : "bg-zinc-700"
                        )}
                      >
                        <div
                          className={cn(
                            "w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 shadow-sm",
                            page.show_social_usernames ? "translate-x-2.5" : "translate-x-0"
                          )}
                        />
                      </div>
                    </button>



                  </div>

                </div>

                {(page.social_accounts || []).length === 0 ||
                  !(page.social_accounts || []).some((s) => s.is_active || s.url) ? (
                  <div className="py-3.5 text-center rounded border border-dashed border-[#353535] p-3">
                    <p className="text-xs font-medium text-zinc-400">No active social links</p>
                  </div>
                ) : (
                  <Reorder.Group
                    axis="y"
                    values={(page.social_accounts || []).filter((account) => account.is_active || account.url)}
                    onReorder={handleReorderSocialAccounts}
                    className="space-y-2"
                  >
                    {(page.social_accounts || [])
                      .filter((account) => account.is_active || account.url)
                      .map((account) => {
                        const accountId = account.id || account.platform;
                        const isEditing = editingSocialId === accountId;
                        const platformInfo = AVAILABLE_PLATFORMS.find(
                          (p) => p.id === account.platform || (p.id === "x" && account.platform === "twitter")
                        );
                        const isCustom = account.platform === "custom" || (account.id && account.id.startsWith("custom_"));

                        return (
                          <Reorder.Item
                            key={accountId}
                            value={account}
                            as="div"
                            className={cn(
                              "p-2.5 rounded border transition-all flex items-center gap-2.5 select-none bg-[#20201f]",
                              account.is_active
                                ? "border-[#353535] hover:border-zinc-500 shadow-sm"
                                : "bg-black/30 border-[#20201f] opacity-60"
                            )}
                          >
                            {/* Drag Handle */}
                            <div className="cursor-grab active:cursor-grabbing p-0.5 text-zinc-500 hover:text-white shrink-0">
                              <GripVertical className="w-4 h-4" />
                            </div>

                            {/* Icon */}
                            <div
                              className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                account.is_active ? "bg-white/10 text-white" : "bg-white/5 text-zinc-500"
                              )}
                            >
                              <SocialIcon platformOrIcon={account.icon || account.platform} className="w-3.5 h-3.5" />
                            </div>

                            {/* Inline Editing vs View Mode */}
                            {isEditing ? (
                              <>
                                {/* Title / Label Input */}
                                <input
                                  type="text"
                                  value={account.label !== undefined ? account.label : (platformInfo?.name || account.platform)}
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const existing = page.social_accounts || [];
                                    const updated = existing.map((s) => {
                                      const match = (account.id && s.id && s.id === account.id) || (!account.id && s.platform === account.platform);
                                      return match ? { ...s, label: val } : s;
                                    });
                                    setPage({ ...page, social_accounts: updated });
                                    setPreviewKey((k) => k + 1);
                                  }}
                                  placeholder="Title"
                                  className="w-20 sm:w-28 bg-[#131313] border border-white/50 focus:border-white rounded px-2 py-1 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors shrink-0"
                                />

                                {/* URL Input */}
                                <input
                                  type="text"
                                  disabled={!account.is_active}
                                  value={account.url || ""}
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const existing = page.social_accounts || [];
                                    const updated = existing.map((s) => {
                                      const match = (account.id && s.id && s.id === account.id) || (!account.id && s.platform === account.platform);
                                      return match ? { ...s, url: val } : s;
                                    });
                                    setPage({ ...page, social_accounts: updated });
                                    setPreviewKey((k) => k + 1);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") setEditingSocialId(null);
                                  }}
                                  placeholder={platformInfo?.placeholder || "https://..."}
                                  className="flex-1 min-w-0 bg-[#131313] border border-white/50 focus:border-white rounded px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed font-mono transition-colors"
                                  autoFocus
                                />
                              </>
                            ) : (
                              <>
                                {/* Platform Title */}
                                <div className="w-20 sm:w-24 shrink-0 truncate">
                                  <span className="text-xs font-bold text-white truncate block">
                                    {account.label || platformInfo?.name || account.platform}
                                  </span>
                                </div>

                                {/* URL Text Display (Clickable to Edit) */}
                                <div
                                  onClick={() => setEditingSocialId(accountId)}
                                  className="flex-1 min-w-0 bg-[#131313] border border-[#2c2c2c] hover:border-zinc-500 rounded px-2.5 py-1.5 text-xs font-mono transition-colors truncate cursor-pointer select-none"
                                  title="Click to edit link"
                                >
                                  {account.url ? (
                                    <span className="text-zinc-300">{account.url}</span>
                                  ) : (
                                    <span className="text-zinc-600 italic">Click Edit to add link</span>
                                  )}
                                </div>
                              </>
                            )}

                            {/* Actions: Edit button, Active toggle, Delete */}
                            <div className="flex items-center gap-1 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
                              {isEditing ? (
                                <button
                                  type="button"
                                  onClick={() => setEditingSocialId(null)}
                                  className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                                  title="Done editing"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isCustom) {
                                      handleOpenEditCustomSocial(account);
                                    } else {
                                      setEditingSocialId(accountId);
                                    }
                                  }}
                                  className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                  title="Edit link"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <input
                                type="checkbox"
                                checked={account.is_active}
                                onChange={(e) => {
                                  const active = e.target.checked;
                                  const existing = page.social_accounts || [];
                                  const updated = existing.map((s) => {
                                    const match =
                                      (account.id && s.id && s.id === account.id) ||
                                      (!account.id && s.platform === account.platform);
                                    return match ? { ...s, is_active: active } : s;
                                  });
                                  setPage({ ...page, social_accounts: updated });
                                  setPreviewKey((k) => k + 1);
                                }}
                                className="w-3.5 h-3.5 accent-white cursor-pointer mr-0.5"
                                title="Toggle active"
                              />

                              <button
                                type="button"
                                onClick={() => {
                                  const existing = page.social_accounts || [];
                                  const updated = existing.filter((s) => {
                                    if (account.id && s.id) return s.id !== account.id;
                                    return s.platform !== account.platform;
                                  });
                                  setPage({ ...page, social_accounts: updated });
                                  setPreviewKey((k) => k + 1);
                                  showToast("Link removed");
                                }}
                                className="p-1.5 rounded hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                                title="Remove link"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </Reorder.Item>
                        );
                      })}
                  </Reorder.Group>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SMART REEL REDIRECTS */}
          {activeTab === "redirects" && (
            <div className="bg-[#1c1b1b] p-3 rounded border border-[#20201f] space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-2.5">
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    {/* <Sparkles className="w-4 h-4 text-[#c4c0ff]" /> */}
                    <span>Smart Redirects</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#c4c0ff]/10 text-[#c4c0ff] border border-[#c4c0ff]/20">
                      {redirectRules.length}
                    </span>
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {/* Enable / Disable Switch Toggle (Left of Add Rule) */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={page.smart_redirect_enabled !== false}
                    onClick={() => {
                      const nextVal = page.smart_redirect_enabled === false ? true : false;
                      setPage({ ...page, smart_redirect_enabled: nextVal });
                      setPreviewKey((k) => k + 1);
                    }}
                    className="flex items-center gap-1.5 cursor-pointer select-none bg-[#141414] px-2.5 py-1 rounded border border-[#2c2c2c] hover:border-[#3d3d3d] transition-all shrink-0 h-[28px]"
                    title={page.smart_redirect_enabled !== false ? "Resolver Card Enabled (Click to Disable)" : "Resolver Card Disabled (Click to Enable)"}
                  >
                    <span className="text-xs font-semibold text-zinc-300">
                      {page.smart_redirect_enabled !== false ? "Enabled" : "Disabled"}
                    </span>
                    <div
                      className={cn(
                        "w-6 h-3.5 rounded-full p-0.5 transition-colors duration-200 flex items-center",
                        page.smart_redirect_enabled !== false ? "bg-emerald-500" : "bg-zinc-700"
                      )}
                    >
                      <div
                        className={cn(
                          "w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 shadow-sm",
                          page.smart_redirect_enabled !== false ? "translate-x-2.5" : "translate-x-0"
                        )}
                      />
                    </div>
                  </button>

                  {/* Add Rule Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRule(null);
                      setRuleModalOpen(true);
                    }}
                    className="px-2.5 py-1 bg-white text-black font-bold text-xs rounded hover:bg-zinc-200 transition-all flex items-center gap-1 cursor-pointer shadow-sm shrink-0 h-[28px] select-none"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Rule</span>
                  </button>
                </div>
              </div>

              {/* Card Text & Labels Customizer */}
              {page.smart_redirect_enabled !== false && (
                <div className="p-3.5 rounded bg-[#20201f] border border-[#353535] space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <label className="text-xs font-semibold text-zinc-200">Card Text & Custom Labels</label>
                    <span className="text-[10px] text-zinc-400">Live preview sync</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400 font-medium">Card Title</label>
                      <input
                        type="text"
                        value={page.smart_input_title || ""}
                        onChange={(e) => {
                          setPage({ ...page, smart_input_title: e.target.value });
                          setPreviewKey((k) => k + 1);
                        }}
                        placeholder="Have a Reel or Promo Link?"
                        className="w-full bg-[#131313] border border-[#353535] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400 font-medium">Input Placeholder</label>
                      <input
                        type="text"
                        value={page.smart_input_placeholder || ""}
                        onChange={(e) => {
                          setPage({ ...page, smart_input_placeholder: e.target.value });
                          setPreviewKey((k) => k + 1);
                        }}
                        placeholder="Paste link here..."
                        className="w-full bg-[#131313] border border-[#353535] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400 font-medium">Button Label</label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={page.smart_input_button_text || ""}
                          onChange={(e) => {
                            setPage({ ...page, smart_input_button_text: e.target.value });
                            setPreviewKey((k) => k + 1);
                          }}
                          placeholder="Get Link"
                          className={cn(
                            "w-full rounded px-3 py-1.5 pr-7 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-white/80 transition-all shadow-sm placeholder:opacity-60",
                            (BIO_THEMES[page.theme_id] || BIO_THEMES.glass_monochrome).buttonClass
                          )}
                        />
                        <ArrowRight className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none opacity-80" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Configured Rules List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Configured Rules ({redirectRules.length})
                  </h3>
                </div>

                {redirectRules.length === 0 ? (
                  <div className="py-6 text-center rounded border border-dashed border-[#353535] p-4">
                    <p className="text-xs text-zinc-400">No redirect rules set up</p>
                  </div>
                ) : (
                  redirectRules.map((rule) => {
                    const formatUrl = (urlStr?: string) => {
                      if (!urlStr) return "#";
                      if (urlStr.startsWith("http://") || urlStr.startsWith("https://")) return urlStr;
                      if (urlStr.startsWith("www.")) return `https://${urlStr}`;
                      if (urlStr.includes(".") && !urlStr.includes(" ")) return `https://${urlStr}`;
                      return "#";
                    };

                    const destUrl = formatUrl(rule.destination_value);
                    const inputUrl = formatUrl(rule.input_match_url);
                    const targetRedirectUrl = destUrl !== "#" ? destUrl : inputUrl;

                    return (
                      <div
                        key={rule.id}
                        className="group p-2.5 rounded bg-[#20201f] border border-[#353535] hover:border-zinc-500 transition-colors flex items-center justify-between gap-3 select-none"
                      >
                        {/* Single-line Info Row */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {/* Action Type Icon Badge */}
                          <div
                            className="w-6 h-6 rounded bg-[#c4c0ff]/10 border border-[#c4c0ff]/20 flex items-center justify-center shrink-0"
                            title={`Action Type: ${rule.destination_type || "URL"}`}
                          >
                            {rule.destination_type === "url" && <ExternalLink className="w-3.5 h-3.5 text-[#c4c0ff]" />}
                            {rule.destination_type === "file" && <Download className="w-3.5 h-3.5 text-[#c4c0ff]" />}
                            {rule.destination_type === "product" && <ShoppingBag className="w-3.5 h-3.5 text-[#c4c0ff]" />}
                            {rule.destination_type === "message" && <MessageCircle className="w-3.5 h-3.5 text-[#c4c0ff]" />}
                            {!["url", "file", "product", "message"].includes(rule.destination_type || "") && (
                              <Link2 className="w-3.5 h-3.5 text-[#c4c0ff]" />
                            )}
                          </div>

                          {/* Rule Title, Input URL & Destination Value in ONE LINE */}
                          <div className="flex items-center gap-2 text-xs truncate min-w-0 font-mono">
                            <span className="font-bold text-white font-sans shrink-0 truncate max-w-[150px]">
                              {rule.title || "Rule"}
                            </span>
                            <span className="text-zinc-600 font-sans shrink-0">•</span>
                            <span className="text-zinc-400 truncate max-w-[200px]" title={rule.input_match_url}>
                              {rule.input_match_url}
                            </span>
                            <span className="text-zinc-500 shrink-0">➔</span>
                            <span className="text-zinc-300 font-semibold truncate max-w-[220px]" title={rule.destination_value}>
                              {rule.destination_value}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Test Button: Redirects to target URL in new tab when clicked */}
                          <button
                            type="button"
                            onClick={() => {
                              if (targetRedirectUrl && targetRedirectUrl !== "#") {
                                window.open(targetRedirectUrl, "_blank", "noopener,noreferrer");
                              }
                            }}
                            className="px-2.5 py-1 rounded bg-white/10 hover:bg-white text-white hover:text-black text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                            title={targetRedirectUrl !== "#" ? `Test redirect to ${targetRedirectUrl}` : "No valid URL to test"}
                          >
                            <Play className="w-3 h-3 fill-current text-[#c4c0ff] group-hover:text-black" />
                            <span>Test</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingRule(rule);
                              setRuleModalOpen(true);
                            }}
                            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                            title="Edit rule"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => rule.id && handleDeleteRedirectRule(rule.id)}
                            className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
                            title="Delete rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB: ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="bg-[#1c1b1b] p-3.5 sm:p-4 rounded border border-[#20201f] space-y-4 animate-in fade-in">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#c4c0ff]/10 border border-[#c4c0ff]/20 flex items-center justify-center text-[#c4c0ff]">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">Analytics & Button Click Performance</h2>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  Live Stats
                </span>
              </div>

              {/* Top Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: "Total Page Views", value: analytics.views_count || page.views_count || 0, icon: Globe, color: "text-blue-400" },
                  { label: "Total Link Clicks", value: analytics.clicks_count || page.clicks_count || 0, icon: ExternalLink, color: "text-emerald-400" },
                  { label: "Smart Redirect Hits", value: analytics.redirect_hits || 0, icon: Sparkles, color: "text-purple-400" },
                  { label: "Active Buttons & Links", value: blocks.length + (page.social_accounts?.filter((s) => s.is_active && s.url).length || 0), icon: Layers, color: "text-amber-400" },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="p-3 rounded bg-[#20201f] border border-[#353535] space-y-1">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span className="text-[10px] font-semibold uppercase tracking-wider">{stat.label}</span>
                        <Icon className={cn("w-3.5 h-3.5", stat.color)} />
                      </div>
                      <p className="text-lg font-bold text-white font-mono">{stat.value.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>

              {/* Configured Buttons & Links Performance Breakdown */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-[#c4c0ff]" />
                    <span>Configured Buttons Click Data</span>
                  </h3>
                  <span className="text-[10px] font-semibold text-zinc-400">
                    {blocks.length + (page.social_accounts?.filter((s) => s.is_active && s.url).length || 0) + redirectRules.length} items tracked
                  </span>
                </div>

                {/* 1. Content Blocks Performance */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Content Blocks ({blocks.length})</h4>
                  {blocks.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic p-2.5 rounded bg-black/20 border border-white/5">No blocks created yet</p>
                  ) : (
                    blocks.map((block) => {
                      const clicks = block.clicks_count || 0;
                      return (
                        <div
                          key={block.id || block.title}
                          className="p-2.5 rounded bg-[#20201f] border border-[#353535] flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white">
                              {block.block_type === "custom_button" && <ExternalLink className="w-3 h-3 text-[#c4c0ff]" />}
                              {block.block_type === "product_card" && <ShoppingBag className="w-3 h-3 text-amber-400" />}
                              {block.block_type === "file_download" && <Download className="w-3 h-3 text-blue-400" />}
                              {block.block_type === "video" && <Video className="w-3 h-3 text-red-400" />}
                              {block.block_type === "image" && <ImageIcon className="w-3 h-3 text-emerald-400" />}
                              {block.block_type === "contact_card" && <MessageCircle className="w-3 h-3 text-purple-400" />}
                              {block.block_type === "header" && <Type className="w-3 h-3 text-zinc-400" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-white truncate">{block.title || block.block_type}</p>
                              <p className="text-[10px] text-zinc-400 truncate font-mono">{block.url || block.subtitle || "Block item"}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold font-mono text-xs flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                              <span>{clicks} {clicks === 1 ? "click" : "clicks"}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* 2. Social Links Performance */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Social Hub Links ({(page.social_accounts || []).filter((s) => s.is_active && s.url).length})
                  </h4>
                  {(page.social_accounts || []).filter((s) => s.is_active && s.url).length === 0 ? (
                    <p className="text-xs text-zinc-500 italic p-2.5 rounded bg-black/20 border border-white/5">No active social links</p>
                  ) : (
                    (page.social_accounts || [])
                      .filter((s) => s.is_active && s.url)
                      .map((social) => {
                        const iconKey = social.icon || social.platform;
                        const clicks = (social as any).clicks_count || 0;
                        return (
                          <div
                            key={social.id || social.platform}
                            className="p-2.5 rounded bg-[#20201f] border border-[#353535] flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-white">
                                <SocialIcon platformOrIcon={iconKey} className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-white capitalize truncate">{social.label || social.platform}</p>
                                <p className="text-[10px] text-zinc-400 truncate font-mono">{social.url}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 font-bold font-mono text-xs flex items-center gap-1">
                                <Share2 className="w-3 h-3" />
                                <span>{clicks} {clicks === 1 ? "click" : "clicks"}</span>
                              </span>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>

                {/* 3. Redirect Rules Hits */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Redirect Rules ({redirectRules.length})</h4>
                  {redirectRules.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic p-2.5 rounded bg-black/20 border border-white/5">No redirect rules set up</p>
                  ) : (
                    redirectRules.map((rule) => {
                      const hits = rule.hits_count || 0;
                      return (
                        <div
                          key={rule.id}
                          className="p-2.5 rounded bg-[#20201f] border border-[#353535] flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-6 h-6 rounded bg-[#c4c0ff]/10 border border-[#c4c0ff]/20 flex items-center justify-center shrink-0">
                              <Sparkles className="w-3.5 h-3.5 text-[#c4c0ff]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-white truncate">{rule.title || "Rule"}</p>
                              <p className="text-[10px] text-zinc-400 truncate font-mono">{rule.input_match_url} ➔ {rule.destination_value}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold font-mono text-xs flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>{hits} {hits === 1 ? "hit" : "hits"}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Multi-Device Mockup Preview (Desktop only >= xl) */}
        {activeTab !== "analytics" && (
          <div
            className={cn(
              "hidden xl:flex flex-col sticky top-4 transition-all duration-300",
              previewDevice === "mobile"
                ? "xl:col-span-5"
                : previewDevice === "tablet"
                  ? "xl:col-span-6"
                  : "xl:col-span-7"
            )}
          >
            <div className="w-full flex flex-col items-center justify-center bg-[#09090b] p-2 sm:p-3 rounded border border-[#20201f] shadow-2xl relative min-h-[470px] group/mockup">
              {/* Disabled Page Preview Glass Overlay */}
              {!page.is_published && (
                <div className="absolute inset-0 z-50 bg-[#09090b]/85 backdrop-blur-md rounded-lg flex flex-col items-center justify-center p-6 text-center animate-in fade-in space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-lg">
                    <EyeOff className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white tracking-tight">Preview Disabled</h3>
                    <p className="text-xs text-zinc-400 max-w-[240px] leading-relaxed">
                      Your Link-in-Bio page is currently disabled. Enable your page to view the live preview.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPage((prev) => ({ ...prev, is_published: true }));
                      handleSavePageSettings({ is_published: true });
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 select-none mt-1"
                  >
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>Enable Page Preview</span>
                  </button>
                </div>
              )}

              {/* DEVICE 1: APPLE IPHONE 16 PRO SIMULATOR (iOS UI) */}
              {previewDevice === "mobile" && (
                <div key={`mobile-${previewKey}`} className="w-full flex justify-center py-1 animate-in fade-in zoom-in-95 duration-200">
                  <div className="relative w-[235px] sm:w-[245px] h-[450px] sm:h-[470px] rounded-[38px] p-[7px] shadow-[0_25px_60px_-15px_rgba(0,0,0,1),0_0_0_1px_rgba(255,255,255,0.2),0_0_0_3px_#222222,0_0_16px_rgba(0,0,0,0.8)] bg-gradient-to-b from-[#3a3a3a] via-[#1c1c1e] to-[#2a2a2a] flex flex-col shrink-0 overflow-visible">
                    {/* Titanium Antenna Bands */}
                    <div className="absolute top-[60px] -left-[1px] w-[2px] h-[4px] bg-[#555] rounded-full" />
                    <div className="absolute top-[60px] -right-[1px] w-[2px] h-[4px] bg-[#555] rounded-full" />
                    <div className="absolute bottom-[60px] -left-[1px] w-[2px] h-[4px] bg-[#555] rounded-full" />
                    <div className="absolute bottom-[60px] -right-[1px] w-[2px] h-[4px] bg-[#555] rounded-full" />

                    {/* Left Hardware Buttons: Action Button, Volume Up, Volume Down */}
                    <div className="absolute -left-[4px] top-[75px] w-[3px] h-[18px] bg-[#404040] border-l border-white/20 rounded-l-[3px] shadow-sm" title="Action Button" />
                    <div className="absolute -left-[4px] top-[105px] w-[3px] h-[36px] bg-[#404040] border-l border-white/20 rounded-l-[3px] shadow-sm" title="Volume Up" />
                    <div className="absolute -left-[4px] top-[149px] w-[3px] h-[36px] bg-[#404040] border-l border-white/20 rounded-l-[3px] shadow-sm" title="Volume Down" />

                    {/* Right Hardware Buttons: Power / Siri & Camera Control */}
                    <div className="absolute -right-[4px] top-[115px] w-[3px] h-[52px] bg-[#404040] border-r border-white/20 rounded-r-[3px] shadow-sm" title="Power" />
                    <div className="absolute -right-[3px] top-[275px] w-[2.5px] h-[28px] bg-[#2a2a2a] border border-white/20 rounded-r-[2px] shadow-inner" title="Camera Control" />

                    {/* OLED Display Bezel (Super Retina XDR) */}
                    <div className="relative w-full h-full bg-black rounded-[32px] overflow-hidden flex flex-col justify-between text-white border border-white/10 shadow-inner">
                      {/* Top Earpiece Speaker Slit */}
                      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-40 w-10 h-[2px] bg-[#1a1a1a] rounded-full" />

                      {/* iOS 18 Top Status Bar & Dynamic Island */}
                      <div className="absolute top-0 left-0 right-0 z-40 pt-2 px-3.5 flex items-center justify-between pointer-events-none">
                        {/* iOS Clock */}
                        <span className="text-[11px] font-semibold tracking-tight text-white font-sans">9:41</span>

                        {/* Dynamic Island */}
                        <div className="w-[80px] h-[20px] bg-black rounded-full border border-white/10 flex items-center justify-between px-1.5 shadow-md">
                          {/* FaceID Sensor */}
                          <div className="w-1.5 h-1.5 rounded-full bg-[#111] border border-[#262626] flex items-center justify-center">
                            <div className="w-0.5 h-0.5 rounded-full bg-[#050518]" />
                          </div>
                          {/* Front Camera Lens with Antireflective Sheen */}
                          <div className="w-1.5 h-1.5 rounded-full bg-[#070b18] border border-[#1e293b] flex items-center justify-center shadow-inner">
                            <div className="w-0.5 h-0.5 rounded-full bg-[#1e1b4b]" />
                          </div>
                        </div>

                        {/* Status Icons */}
                        <div className="flex items-center gap-1 text-white">
                          <div className="flex items-end gap-[1px] h-2">
                            <div className="w-[1.5px] h-[2.5px] bg-white rounded-[0.5px]" />
                            <div className="w-[1.5px] h-[4px] bg-white rounded-[0.5px]" />
                            <div className="w-[1.5px] h-[6px] bg-white rounded-[0.5px]" />
                            <div className="w-[1.5px] h-[8px] bg-white rounded-[0.5px]" />
                          </div>
                          <span className="text-[8.5px] font-bold tracking-tight">5G</span>
                          {/* Battery Capsule */}
                          <div className="flex items-center">
                            <div className="w-[15px] h-[8px] border border-white/80 rounded-[2px] p-[1px] flex items-center">
                              <div className="w-[10px] h-full bg-[#c4c0ff] rounded-[0.5px]" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Scrollable Screen Content */}
                      <div className="flex-1 w-full pt-7 overflow-y-auto scrollbar-hide overflow-x-hidden relative">
                        <div style={{ zoom: 0.725 }} className="w-full pb-2">
                          <LinkInBioPublicView
                            username={usernameInput || page.username}
                            initialData={livePreviewData}
                            isPreviewMode={true}
                            activeTab={activeTab}
                          />
                        </div>
                      </div>

                      {/* iOS Safari Bottom Address Pill & Home Indicator */}
                      <div className="bg-transparent shrink-0 z-40 flex flex-col items-center pointer-events-none pb-0.5 pt-0.5">
                        <div className="w-[88%] bg-black/70 backdrop-blur-xl border border-white/15 rounded-full py-0.5 px-2.5 flex items-center justify-between text-[9.5px] text-zinc-300 font-sans shadow-lg mb-0.5 pointer-events-auto">
                          <span className="font-sans font-bold text-zinc-400 text-[9px] tracking-tighter select-none">AA</span>
                          <div className="flex items-center gap-1 text-zinc-200">
                            <Lock className="w-2 h-2 text-zinc-400" />
                            <span className="font-medium text-[9.5px]">{rootDomain}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPreviewKey((k) => k + 1)}
                            className="hover:text-white transition-colors cursor-pointer"
                            title="Reload"
                          >
                            <RefreshCw className="w-2 h-2 text-zinc-400" />
                          </button>
                        </div>
                        <div className="w-24 h-[2.5px] bg-white/80 rounded-full shadow-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DEVICE 2: APPLE IPAD PRO (iPadOS UI) */}
              {previewDevice === "tablet" && (
                <div key={`tablet-${previewKey}`} className="w-full flex justify-center py-1 animate-in fade-in zoom-in-95 duration-200">
                  <div className="relative w-full max-w-[560px] bg-[#1c1c1e] rounded-[34px] p-3 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.18),inset_0_0_0_1.5px_#333336]">
                    {/* Top TrueDepth Camera & Ambient Sensor */}
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#121214] border border-white/10 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-blue-500/60" />
                      </div>
                      <div className="w-1 h-1 rounded-full bg-zinc-700" />
                    </div>

                    {/* Tablet Screen Frame */}
                    <div className="relative w-full bg-[#131313] rounded-[24px] overflow-hidden border border-[#2a2a2a] flex flex-col h-[700px] max-h-[76vh]">
                      {/* iPadOS Top Status Bar with 3-dot Multitasking Pill */}
                      <div className="h-7 bg-black/50 backdrop-blur-md shrink-0 z-40 px-4 flex items-center justify-between text-[10px] font-semibold text-white/90 select-none pointer-events-none">
                        <div className="flex items-center gap-2">
                          <span>Tuesday, Sep 6</span>
                          <span className="font-bold">9:41 AM</span>
                        </div>

                        {/* iPadOS 3-dot Multitasking Button */}
                        <div className="w-6 h-3 bg-white/15 rounded-full flex items-center justify-center gap-0.5 shadow-sm">
                          <div className="w-1 h-1 rounded-full bg-white/80" />
                          <div className="w-1 h-1 rounded-full bg-white/80" />
                          <div className="w-1 h-1 rounded-full bg-white/80" />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold tracking-tighter">5G</span>
                          <Wifi className="w-3 h-3 text-white/90" />
                          <span className="text-[9px] font-mono">100%</span>
                          <div className="w-4 h-2 rounded-xs border border-white/70 p-[1px] flex items-center relative">
                            <div className="w-full h-full bg-emerald-400 rounded-2xs" />
                          </div>
                        </div>
                      </div>

                      {/* iPadOS Safari Navigation Toolbar */}
                      <div className="h-9 bg-[#1e1e20]/90 backdrop-blur-md border-b border-white/10 px-3 flex items-center justify-between shrink-0 select-none gap-2 text-zinc-300">
                        {/* Left: Sidebar & Navigation */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button type="button" className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors" title="Sidebar">
                            <PanelLeft className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" className="p-1 rounded text-zinc-600 cursor-default">
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" className="p-1 rounded text-zinc-600 cursor-default">
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Center: iPadOS Safari Omnibar */}
                        <div className="flex-1 max-w-xs bg-black/40 border border-white/10 rounded-lg py-1 px-2.5 flex items-center justify-between text-[11px] font-mono text-zinc-300">
                          <div className="flex items-center gap-1.5 truncate">
                            <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">{rootDomain}/@{page.username}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPreviewKey((k) => k + 1)}
                            className="hover:text-white transition-colors cursor-pointer shrink-0 ml-1"
                            title="Reload"
                          >
                            <RefreshCw className="w-2.5 h-2.5 text-zinc-400" />
                          </button>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-1 shrink-0 text-zinc-400">
                          <button type="button" onClick={handleCopyBioLink} className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors cursor-pointer" title="Copy Link">
                            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <a href={publicBioUrl} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors cursor-pointer" title="Open Public Bio">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {/* Scrollable Screen Content */}
                      <div className="flex-1 w-full overflow-y-auto scrollbar-hide">
                        <LinkInBioPublicView
                          username={usernameInput || page.username}
                          initialData={livePreviewData}
                          isPreviewMode={true}
                          activeTab={activeTab}
                        />
                      </div>

                      {/* Bottom iPadOS Home Indicator Bar */}
                      <div className="h-4.5 bg-transparent shrink-0 z-40 flex items-center justify-center pointer-events-none">
                        <div className="w-40 h-1 bg-white/40 rounded-full shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DEVICE 3: APPLE MACBOOK / MACOS SAFARI UI */}
              {previewDevice === "desktop" && (
                <div key={`desktop-${previewKey}`} className="w-full flex justify-center py-1 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-full bg-[#18181a] rounded-2xl overflow-hidden border border-white/15 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95)] flex flex-col h-[700px] max-h-[76vh]">
                    {/* macOS Title Bar & Safari Toolbar */}
                    <div className="h-10 bg-[#222225]/95 backdrop-blur-xl border-b border-white/10 px-3.5 flex items-center justify-between shrink-0 select-none gap-3">
                      {/* Apple macOS Traffic Light Window Controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/60 shadow-sm flex items-center justify-center group/btn cursor-pointer">
                          <span className="opacity-0 group-hover/btn:opacity-100 text-[8px] font-bold text-black/70 leading-none">✕</span>
                        </div>
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/60 shadow-sm flex items-center justify-center group/btn cursor-pointer">
                          <span className="opacity-0 group-hover/btn:opacity-100 text-[8px] font-bold text-black/70 leading-none">−</span>
                        </div>
                        <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/60 shadow-sm flex items-center justify-center group/btn cursor-pointer">
                          <span className="opacity-0 group-hover/btn:opacity-100 text-[7px] font-bold text-black/70 leading-none">⤢</span>
                        </div>
                      </div>

                      {/* Safari Navigation Chevrons */}
                      <div className="flex items-center gap-1 shrink-0 text-zinc-400">
                        <button type="button" className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors cursor-pointer" title="Sidebar">
                          <PanelLeft className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="p-1 rounded text-zinc-600 cursor-default">
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="p-1 rounded text-zinc-600 cursor-default">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Centered Safari Smart Search Omnibar */}
                      <div className="flex-1 max-w-sm bg-[#121214] border border-white/10 hover:border-white/20 rounded-lg py-1 px-3 flex items-center justify-between text-xs text-zinc-300 gap-2 transition-all shadow-inner">
                        <div className="flex items-center gap-1.5 truncate">
                          <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
                          <Lock className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span className="text-zinc-200 font-medium truncate">https://{rootDomain}/@{page.username}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewKey((k) => k + 1)}
                            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            title="Reload Page"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCopyBioLink}
                            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            title="Copy Link"
                          >
                            {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Safari Action Controls: Share & Open in Tab */}
                      <div className="flex items-center gap-1.5 shrink-0 text-zinc-400">
                        <button
                          type="button"
                          onClick={handleCopyBioLink}
                          className="p-1.5 rounded hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                          title="Share link"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={publicBioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                          title="Open live link in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Desktop Viewport Body */}
                    <div className="flex-1 w-full overflow-y-auto scrollbar-hide bg-[#131313]">
                      <LinkInBioPublicView
                        username={usernameInput || page.username}
                        initialData={livePreviewData}
                        isPreviewMode={true}
                        activeTab={activeTab}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Preview Pill Button (Mobile & Tablet < xl) */}
      {activeTab !== "analytics" && (
        <button
          type="button"
          onClick={() => setMockPreviewModalOpen(true)}
          className="fixed bottom-5 right-5 z-40 xl:hidden px-3.5 py-2.5 rounded-full bg-white text-black font-bold text-xs shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 border border-white/20 select-none"
        >
          <Eye className="w-4 h-4 text-black" />
          <span>Preview Page</span>
        </button>
      )}

      {/* MODALS RENDERED VIA PORTAL */}

      {/* Mobile & Tablet Interactive Mockup Preview Modal */}
      {mounted &&
        mockPreviewModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-[#09090b] rounded-2xl border border-[#20201f] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#20201f] bg-[#141414] shrink-0">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#c4c0ff]" />
                  <h3 className="text-xs sm:text-sm font-bold text-white">Live Mockup Preview</h3>
                </div>
                <div className="flex items-center gap-2">
                  {/* QR Code Button in Mobile Preview Popup */}
                  <button
                    type="button"
                    onClick={() => {
                      setQrModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded bg-[#20201f] hover:bg-[#2c2c2c] border border-[#353535] text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer"
                    title="View QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#c4c0ff]" />
                    <span>QR Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMockPreviewModalOpen(false)}
                    className="p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Close Preview"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Device Switcher */}
              <div className="flex items-center justify-center gap-1 bg-[#101010] p-1.5 border-b border-[#20201f] shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all select-none cursor-pointer",
                    previewDevice === "mobile" ? "bg-white text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>iPhone</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("tablet")}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all select-none cursor-pointer",
                    previewDevice === "tablet" ? "bg-white text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>iPad</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all select-none cursor-pointer",
                    previewDevice === "desktop" ? "bg-white text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Mac</span>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-3 overflow-y-auto flex items-center justify-center min-h-[460px] bg-[#09090b]">
                {/* Disabled Page Preview Glass Overlay */}
                {!page.is_published && (
                  <div className="absolute inset-0 z-50 bg-[#09090b]/85 backdrop-blur-md rounded-lg flex flex-col items-center justify-center p-6 text-center animate-in fade-in space-y-3">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-lg">
                      <EyeOff className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white tracking-tight">Preview Disabled</h3>
                      <p className="text-xs text-zinc-400 max-w-[240px] leading-relaxed">
                        Your Link-in-Bio page is currently disabled. Enable your page to view the live preview.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPage((prev) => ({ ...prev, is_published: true }));
                        handleSavePageSettings({ is_published: true });
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 select-none mt-1"
                    >
                      <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                      <span>Enable Page Preview</span>
                    </button>
                  </div>
                )}

                {previewDevice === "mobile" && (
                  <div key={`mobile-modal-${previewKey}`} className="w-full flex justify-center py-1">
                    <div className="relative w-[235px] sm:w-[245px] h-[450px] sm:h-[470px] rounded-[38px] p-[7px] shadow-2xl bg-gradient-to-b from-[#3a3a3a] via-[#1c1c1e] to-[#2a2a2a] flex flex-col shrink-0">
                      <div className="relative w-full h-full bg-black rounded-[32px] overflow-hidden flex flex-col justify-between text-white border border-white/10 shadow-inner">
                        <div className="flex-1 w-full pt-7 overflow-y-auto scrollbar-hide relative">
                          <div className="w-[138%] origin-top-left transform scale-[0.725] min-h-full pb-8">
                            <LinkInBioPublicView
                              username={usernameInput || page.username}
                              initialData={livePreviewData}
                              isPreviewMode={true}
                              activeTab={activeTab}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {previewDevice === "tablet" && (
                  <div key={`tablet-modal-${previewKey}`} className="w-full flex justify-center py-1">
                    <div className="relative w-full max-w-[500px] bg-[#131313] rounded-[20px] overflow-hidden border border-[#2a2a2a] flex flex-col h-[520px]">
                      <div className="flex-1 w-full overflow-y-auto scrollbar-hide">
                        <LinkInBioPublicView
                          username={usernameInput || page.username}
                          initialData={livePreviewData}
                          isPreviewMode={true}
                          activeTab={activeTab}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {previewDevice === "desktop" && (
                  <div key={`desktop-modal-${previewKey}`} className="w-full flex justify-center py-1">
                    <div className="w-full bg-[#18181a] rounded-xl overflow-hidden border border-white/15 flex flex-col h-[520px]">
                      <div className="flex-1 w-full overflow-y-auto scrollbar-hide bg-[#131313]">
                        <LinkInBioPublicView
                          username={usernameInput || page.username}
                          initialData={livePreviewData}
                          isPreviewMode={true}
                          activeTab={activeTab}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Block Modal */}
      {mounted &&
        createPortal(
          <BlockEditModal
            isOpen={blockModalOpen}
            block={editingBlock}
            page={page}
            blocks={blocks}
            username={usernameInput || page.username}
            onClose={() => {
              setBlockModalOpen(false);
              setEditingBlock(null);
            }}
            onSave={handleSaveBlock}
          />,
          document.body
        )}

      {/* Redirect Rule Modal */}
      {mounted &&
        createPortal(
          <RedirectRuleEditModal
            isOpen={ruleModalOpen}
            rule={editingRule}
            onClose={() => {
              setRuleModalOpen(false);
              setEditingRule(null);
            }}
            onSave={handleSaveRedirectRule}
          />,
          document.body
        )}

      {/* QR Code Modal */}
      {mounted &&
        createPortal(
          <QrCodeStudioModal
            isOpen={qrModalOpen}
            publicUrl={publicBioUrl}
            username={page.username}
            profileImageUrl={page.profile_image_url}
            initialConfig={page.custom_theme?.qr_config as any}
            onClose={() => setQrModalOpen(false)}
            onCopy={handleCopyBioLink}
            copiedLink={copiedLink}
            onSaveConfig={(newConfig) => {
              setPage((prev) => ({
                ...prev,
                custom_theme: {
                  ...(prev.custom_theme || {}),
                  qr_config: newConfig,
                },
              }));
              handleSavePageSettings({
                custom_theme: {
                  ...(page.custom_theme || {}),
                  qr_config: newConfig,
                },
              });
              showToast("QR Code configuration saved to account");
            }}
          />,
          document.body
        )}

      {/* Custom Social Link Modal */}
      {mounted &&
        createPortal(
          <CustomSocialModal
            isOpen={customSocialModalOpen}
            account={editingSocialAccount}
            onClose={() => {
              setCustomSocialModalOpen(false);
              setEditingSocialAccount(null);
            }}
            onSave={handleSaveCustomSocial}
            onDelete={handleDeleteCustomSocial}
          />,
          document.body
        )}

      {/* Live Mockup Preview Popup Modal */}
      {mounted &&
        createPortal(
          <MockupPreviewModal
            isOpen={mockPreviewModalOpen}
            onClose={() => setMockPreviewModalOpen(false)}
            page={page}
            username={usernameInput || page.username}
            livePreviewData={livePreviewData}
            previewKey={previewKey}
            publicBioUrl={publicBioUrl}
            rootDomain={rootDomain}
            copiedLink={copiedLink}
            onCopy={handleCopyBioLink}
            activeTab={activeTab}
          />,
          document.body
        )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL: EDIT CONTENT BLOCK
// ─────────────────────────────────────────────────────────────────────────────

function BlockEditModal({
  isOpen,
  block,
  page,
  blocks,
  username,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  block: BlockItem | null;
  page: BioPageData;
  blocks: BlockItem[];
  username: string;
  onClose: () => void;
  onSave: (data: Partial<BlockItem>) => void;
}) {
  const [blockType, setBlockType] = useState(block?.block_type || "link");
  const [title, setTitle] = useState(block?.title || "");
  const [subtitle, setSubtitle] = useState(block?.subtitle || "");
  const [url, setUrl] = useState(block?.url || "");
  const [mediaUrl, setMediaUrl] = useState(block?.media_url || "");
  const [badge, setBadge] = useState((block?.config?.badge as string) || "");
  const [animation, setAnimation] = useState((block?.config?.highlight_animation as string) || "none");
  const [whatsapp, setWhatsapp] = useState((block?.config?.whatsapp as string) || "");
  const [email, setEmail] = useState((block?.config?.email as string) || "");
  const [price, setPrice] = useState((block?.config?.price as string) || "");

  const [isBlockTypeOpen, setIsBlockTypeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const blockMediaInputRef = useRef<HTMLInputElement>(null);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(0);

  useEffect(() => {
    setIsBlockTypeOpen(false);
    if (block) {
      setBlockType(block.block_type || "link");
      setTitle(block.title || "");
      setSubtitle(block.subtitle || "");
      setUrl(block.url || "");
      setMediaUrl(block.media_url || "");
      setBadge((block.config?.badge as string) || "");
      setAnimation((block.config?.highlight_animation as string) || "none");
      setWhatsapp((block.config?.whatsapp as string) || "");
      setEmail((block.config?.email as string) || "");
      setPrice((block.config?.price as string) || "");
    } else {
      setBlockType("link");
      setTitle("");
      setSubtitle("");
      setUrl("");
      setMediaUrl("");
      setBadge("");
      setAnimation("none");
      setWhatsapp("");
      setEmail("");
      setPrice("");
    }
    setActiveTab("edit");
  }, [block, isOpen]);

  const handleBlockMediaUpload = async (file: File) => {
    if (!file) return;
    setMediaUploading(true);
    setMediaProgress(0);
    try {
      const res = await uploadToCloudinary(file, {
        onProgress: (p) => setMediaProgress(p),
      });
      setMediaUrl(res.secure_url);
    } catch (err: unknown) {
      console.error("Block media upload failed:", err);
    } finally {
      setMediaUploading(false);
      setMediaProgress(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: block?.id,
      block_type: blockType,
      title,
      subtitle,
      url,
      media_url: mediaUrl,
      config: {
        ...(block?.config || {}),
        badge,
        highlight_animation: animation,
        whatsapp,
        email,
        price,
      },
    });
  };

  // Draft block for real-time mockup preview in popup
  const draftBlock: BlockItem = useMemo(() => {
    return {
      id: block?.id || 999999,
      block_type: blockType,
      title: title || (block ? (block.title || "") : "Your Link Title"),
      subtitle: subtitle || "",
      url: url || "https://example.com",
      media_url: mediaUrl || "",
      is_active: true,
      order: block?.order ?? 0,
      config: {
        ...(block?.config || {}),
        badge,
        highlight_animation: animation,
        whatsapp,
        email,
        price,
      },
    };
  }, [block, blockType, title, subtitle, url, mediaUrl, badge, animation, whatsapp, email, price]);

  // Combined preview payload for LinkInBioPublicView
  const modalPreviewData: PublicBioPayload = useMemo(() => {
    const previewBlocks = block
      ? (blocks || []).map((b) => (String(b.id) === String(block.id) ? draftBlock : b))
      : [draftBlock, ...(blocks || [])];

    return {
      page: {
        ...page,
        blocks: previewBlocks,
      },
      blocks: previewBlocks,
      creator: {
        username: username || page.username,
        full_name: page.title || "Creator",
        profile_picture_url: page.profile_image_url || "",
      },
    };
  }, [block, draftBlock, blocks, page, username]);

  const BLOCK_TYPES = [
    { id: "link", label: "Link", icon: Link2 },
    { id: "header", label: "Header", icon: FileText },
    { id: "video", label: "YouTube / Video", icon: Video },
    { id: "image", label: "Image", icon: ImageIcon },
    { id: "file_download", label: "File", icon: Download },
    { id: "product_card", label: "Product", icon: ShoppingBag },
    { id: "contact_card", label: "Contact", icon: MessageCircle },
    { id: "custom_button", label: "Button", icon: ArrowRight },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 font-sans">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            className="relative w-full max-w-4xl xl:max-w-5xl bg-[#141414] border border-white/15 rounded-xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col h-[570px] max-h-[88vh] z-10"
          >
            {/* Modal Header */}
            <div className="p-3 px-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#1c1b1b]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#c4c0ff]/10 border border-[#c4c0ff]/20 flex items-center justify-center text-[#c4c0ff]">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                    {block ? "Edit Block" : "Add Block"}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Top Action Buttons */}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1 rounded bg-[#20201f] text-zinc-300 text-xs font-semibold hover:bg-[#2c2c2c] transition-all cursor-pointer border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="block-edit-form"
                  className="px-3.5 py-1 rounded bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all cursor-pointer shadow-sm"
                >
                  {block ? "Update" : "Add"}
                </button>

                {/* Mobile View Switcher */}
                <div className="flex lg:hidden items-center gap-0.5 bg-[#101010] p-0.5 rounded border border-[#2c2c2c] ml-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("edit")}
                    className={cn(
                      "px-2.5 py-1 rounded text-[10px] font-semibold transition-all select-none cursor-pointer",
                      activeTab === "edit" ? "bg-white text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={cn(
                      "px-2.5 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-all select-none cursor-pointer",
                      activeTab === "preview" ? "bg-white text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    <Eye className="w-3 h-3 text-[#c4c0ff]" />
                    <span>Preview</span>
                  </button>
                </div>

                {/* <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
                >
                  <X className="w-4 h-4" />
                </button> */}
              </div>
            </div>

            {/* Modal Body: Split Live Mockup + Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden min-h-0">
              {/* Left Column: Live Mobile Mockup Preview */}
              <div
                className={cn(
                  "lg:col-span-5 bg-[#09090b] p-3 sm:p-4 flex flex-col items-center justify-center overflow-y-auto min-h-0 border-b lg:border-b-0 lg:border-r border-white/10",
                  activeTab === "edit" ? "hidden lg:flex" : "flex"
                )}
              >
                <div className="w-full flex justify-center py-1 animate-in fade-in zoom-in-95 duration-200">
                  <div className="relative w-[225px] sm:w-[235px] h-[410px] sm:h-[430px] rounded-[36px] p-[6px] shadow-[0_25px_60px_-15px_rgba(0,0,0,1),0_0_0_1px_rgba(255,255,255,0.2),0_0_0_3px_#222222,0_0_16px_rgba(0,0,0,0.8)] bg-gradient-to-b from-[#3a3a3a] via-[#1c1c1e] to-[#2a2a2a] flex flex-col shrink-0 overflow-visible">
                    {/* Titanium Antenna Bands */}
                    <div className="absolute top-[50px] -left-[1px] w-[2px] h-[4px] bg-[#555] rounded-full" />
                    <div className="absolute top-[50px] -right-[1px] w-[2px] h-[4px] bg-[#555] rounded-full" />
                    <div className="absolute bottom-[50px] -left-[1px] w-[2px] h-[4px] bg-[#555] rounded-full" />
                    <div className="absolute bottom-[50px] -right-[1px] w-[2px] h-[4px] bg-[#555] rounded-full" />

                    {/* Left Hardware Buttons: Action Button, Volume Up, Volume Down */}
                    <div className="absolute -left-[4px] top-[65px] w-[3px] h-[18px] bg-[#404040] border-l border-white/20 rounded-l-[3px] shadow-sm" title="Action Button" />
                    <div className="absolute -left-[4px] top-[94px] w-[3px] h-[34px] bg-[#404040] border-l border-white/20 rounded-l-[3px] shadow-sm" title="Volume Up" />
                    <div className="absolute -left-[4px] top-[136px] w-[3px] h-[34px] bg-[#404040] border-l border-white/20 rounded-l-[3px] shadow-sm" title="Volume Down" />

                    {/* Right Hardware Buttons: Power / Siri & Camera Control */}
                    <div className="absolute -right-[4px] top-[104px] w-[3px] h-[50px] bg-[#404040] border-r border-white/20 rounded-r-[3px] shadow-sm" title="Power" />
                    <div className="absolute -right-[3px] top-[260px] w-[2.5px] h-[26px] bg-[#2a2a2a] border border-white/20 rounded-r-[2px] shadow-inner" title="Camera Control" />

                    {/* OLED Display Bezel */}
                    <div className="relative w-full h-full bg-black rounded-[30px] overflow-hidden flex flex-col justify-between text-white border border-white/10 shadow-inner">
                      {/* Top Earpiece Speaker Slit */}
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 z-40 w-10 h-[2px] bg-[#1a1a1a] rounded-full" />

                      {/* iOS 18 Top Status Bar & Dynamic Island */}
                      <div className="absolute top-0 left-0 right-0 z-40 pt-2 px-3 flex items-center justify-between pointer-events-none">
                        <span className="text-[11px] font-semibold tracking-tight text-white font-sans">9:41</span>
                        <div className="w-[82px] h-[20px] bg-black rounded-full border border-white/10 flex items-center justify-between px-1.5 shadow-md">
                          <div className="w-2 h-2 rounded-full bg-[#111] border border-[#262626] flex items-center justify-center">
                            <div className="w-0.5 h-0.5 rounded-full bg-[#050518]" />
                          </div>
                          <div className="w-2 h-2 rounded-full bg-[#070b18] border border-[#1e293b] flex items-center justify-center shadow-inner">
                            <div className="w-0.5 h-0.5 rounded-full bg-[#1e1b4b]" />
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-white">
                          <span className="text-[9px] font-bold tracking-tight">5G</span>
                          <div className="flex items-center">
                            <div className="w-[16px] h-[8px] border border-white/80 rounded-[2px] p-[1px] flex items-center">
                              <div className="w-[10px] h-full bg-[#c4c0ff] rounded-[0.5px]" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Live Content */}
                      <div className="flex-1 w-full pt-7 overflow-y-auto scrollbar-hide overflow-x-hidden relative">
                        <div className="w-[138%] origin-top-left transform scale-[0.725] min-h-full pb-8">
                          <LinkInBioPublicView
                            username={username || page.username}
                            initialData={modalPreviewData}
                            isPreviewMode={true}
                          />
                        </div>
                      </div>

                      {/* iOS Bottom Indicator */}
                      <div className="h-2.5 bg-transparent shrink-0 z-40 flex items-center justify-center pointer-events-none">
                        <div className="w-20 h-[3px] bg-white/80 rounded-full shadow-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Form Fields */}
              <form
                id="block-edit-form"
                onSubmit={handleSubmit}
                className={cn(
                  "lg:col-span-7 p-4 overflow-y-auto space-y-3.5 flex flex-col justify-between",
                  activeTab === "preview" ? "hidden lg:flex" : "flex"
                )}
              >
                <div className="space-y-3.5">
                  {/* Block Type Custom Dropdown with Icons */}
                  <div className="space-y-1.5 relative z-30">
                    <label className="text-xs font-semibold text-zinc-300">Block Type</label>
                    <div className="relative">
                      {(() => {
                        const selectedTypeObj = BLOCK_TYPES.find((t) => t.id === blockType) || BLOCK_TYPES[0];
                        return (
                          <>
                            <button
                              type="button"
                              onClick={() => setIsBlockTypeOpen(!isBlockTypeOpen)}
                              className="w-full bg-[#131313] border border-[#353535] hover:border-white/40 rounded px-3 py-2 text-xs text-white flex items-center justify-between transition-all cursor-pointer shadow-sm"
                            >
                              <div className="flex items-center gap-2.5">
                                {selectedTypeObj && (
                                  <>
                                    <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-[#c4c0ff]">
                                      <selectedTypeObj.icon className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-bold text-xs">{selectedTypeObj.label}</span>
                                  </>
                                )}
                              </div>
                              <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform duration-200", isBlockTypeOpen && "rotate-180")} />
                            </button>

                            {isBlockTypeOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setIsBlockTypeOpen(false)}
                                />
                                <div className="absolute top-full left-0 right-0 mt-1 bg-[#18181a] border border-white/20 rounded-lg shadow-2xl overflow-hidden z-50 p-1 space-y-0.5 max-h-56 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-150">
                                  {BLOCK_TYPES.map((t) => {
                                    const Icon = t.icon;
                                    const isSelected = blockType === t.id;
                                    return (
                                      <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => {
                                          setBlockType(t.id);
                                          setIsBlockTypeOpen(false);
                                        }}
                                        className={cn(
                                          "w-full px-2.5 py-2 rounded text-xs flex items-center justify-between transition-colors select-none cursor-pointer text-left",
                                          isSelected
                                            ? "bg-white text-black font-bold"
                                            : "text-zinc-300 hover:bg-white/10 hover:text-white"
                                        )}
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <Icon className={cn("w-4 h-4", isSelected ? "text-black" : "text-[#c4c0ff]")} />
                                          <span>{t.label}</span>
                                        </div>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Title"
                      className="w-full bg-[#131313] border border-[#353535] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Subtitle (Optional)</label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="Subtitle"
                      className="w-full bg-[#131313] border border-[#353535] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  {blockType !== "header" && blockType !== "contact_card" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">
                        {blockType === "video" ? "YouTube Video / Media URL" : "Destination URL"}
                      </label>
                      <input
                        type="text"
                        required={blockType === "link" || blockType === "custom_button" || blockType === "video"}
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder={blockType === "video" ? "https://www.youtube.com/watch?v=... or https://youtu.be/..." : "https://..."}
                        className="w-full bg-[#131313] border border-[#353535] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono"
                      />
                      {blockType === "video" && (
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          Supports YouTube Watch links, Shorts, Embeds, or direct video MP4 URLs.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Media Upload */}
                  {(blockType === "link" || blockType === "image" || blockType === "product_card" || blockType === "video") && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">
                        {blockType === "video" ? "Video Thumbnail / Preview" : "Media / Image"}
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="file"
                          ref={blockMediaInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleBlockMediaUpload(file);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => blockMediaInputRef.current?.click()}
                          disabled={mediaUploading}
                          className="px-3.5 py-1.5 rounded bg-[#20201f] border border-[#353535] text-xs font-semibold text-white flex items-center gap-1.5 hover:bg-[#2c2c2c] cursor-pointer disabled:opacity-50 transition-all shrink-0"
                        >
                          {mediaUploading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c4c0ff]" />
                              <span>{mediaProgress}%</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>{mediaUrl ? "Change Image" : "Upload Image"}</span>
                            </>
                          )}
                        </button>
                        {mediaUrl ? (
                          <div className="flex items-center gap-2 flex-1 min-w-0 bg-[#131313] border border-[#353535] rounded px-2.5 py-1">
                            <div className="w-6 h-6 rounded overflow-hidden border border-white/20 shrink-0 bg-black flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={mediaUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[11px] text-zinc-400 truncate flex-1 font-medium">Image uploaded</span>
                            <button
                              type="button"
                              onClick={() => setMediaUrl("")}
                              className="text-zinc-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                              title="Remove image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-500 italic">No image selected</span>
                        )}
                      </div>
                    </div>
                  )}

                  {blockType === "product_card" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">Price (Optional)</label>
                      <input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g. ₹999 or $49"
                        className="w-full bg-[#131313] border border-[#353535] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>
                  )}

                  {blockType === "contact_card" && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-300">WhatsApp</label>
                        <input
                          type="text"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="+1234567890"
                          className="w-full bg-[#131313] border border-[#353535] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-300">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="user@example.com"
                          className="w-full bg-[#131313] border border-[#353535] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                        />
                      </div>
                    </div>
                  )}

                  {(blockType === "link" || blockType === "custom_button") && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-300">Badge</label>
                        <input
                          type="text"
                          value={badge}
                          onChange={(e) => setBadge(e.target.value)}
                          placeholder="HOT"
                          className="w-full bg-[#131313] border border-[#353535] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white uppercase"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-300">Animation</label>
                        <select
                          value={animation}
                          onChange={(e) => setAnimation(e.target.value)}
                          className="w-full bg-[#131313] border border-[#353535] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white cursor-pointer"
                        >
                          <option value="none">None</option>
                          <option value="pulse">Pulse</option>
                          <option value="shimmer">Shimmer</option>
                          <option value="bounce">Bounce</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL: EDIT SMART REDIRECT RULE
// ─────────────────────────────────────────────────────────────────────────────

function RedirectRuleEditModal({
  isOpen,
  rule,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  rule: RedirectRuleItem | null;
  onClose: () => void;
  onSave: (data: Partial<RedirectRuleItem>) => void;
}) {
  const [title, setTitle] = useState(rule?.title || "");
  const [inputUrl, setInputUrl] = useState(rule?.input_match_url || "");
  const [matchType, setMatchType] = useState(rule?.match_type || "reel_code");
  const [destinationType, setDestinationType] = useState(rule?.destination_type || "url");
  const [destinationValue, setDestinationValue] = useState(rule?.destination_value || "");
  const [destinationTitle, setDestinationTitle] = useState(rule?.destination_title || "");

  useEffect(() => {
    if (rule) {
      setTitle(rule.title || "");
      setInputUrl(rule.input_match_url || "");
      setMatchType(rule.match_type || "reel_code");
      setDestinationType(rule.destination_type || "url");
      setDestinationValue(rule.destination_value || "");
      setDestinationTitle(rule.destination_title || "");
    } else {
      setTitle("");
      setInputUrl("");
      setMatchType("reel_code");
      setDestinationType("url");
      setDestinationValue("");
      setDestinationTitle("");
    }
  }, [rule, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: rule?.id,
      title,
      input_match_url: inputUrl,
      match_type: matchType,
      destination_type: destinationType,
      destination_value: destinationValue,
      destination_title: destinationTitle,
      is_active: true,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 font-sans">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            className="relative w-full max-w-xl bg-[#141414] border border-white/15 rounded overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-3 px-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#1c1b1b]">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#c4c0ff]" />
                {rule ? "Edit Rule" : "Create Rule"}
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Rule Name</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Campaign name"
                  className="w-full bg-[#131313] border border-[#353535] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Trigger Reel URL or Keyword</label>
                <input
                  type="text"
                  required
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/..."
                  className="w-full bg-[#131313] border border-[#353535] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Action Type</label>
                <select
                  value={destinationType}
                  onChange={(e) => setDestinationType(e.target.value)}
                  className="w-full bg-[#131313] border border-[#353535] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-white cursor-pointer"
                >
                  <option value="url">Website URL</option>
                  <option value="file">File Download</option>
                  <option value="product">Product</option>
                  <option value="message">Popup Message</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">
                  {destinationType === "message" ? "Message / Code" : "Destination URL"}
                </label>
                <input
                  type="text"
                  required
                  value={destinationValue}
                  onChange={(e) => setDestinationValue(e.target.value)}
                  placeholder={destinationType === "message" ? "Message content" : "https://..."}
                  className="w-full bg-[#131313] border border-[#353535] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Display Title (Optional ,Users can see this)</label>
                <input
                  type="text"
                  value={destinationTitle}
                  onChange={(e) => setDestinationTitle(e.target.value)}
                  placeholder="Title for button"
                  className="w-full bg-[#131313] border border-[#353535] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#353535]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-[#20201f] text-zinc-300 text-xs font-semibold rounded hover:bg-[#2c2c2c] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-white text-black text-xs font-bold rounded hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  {rule ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL: BIO QR CODE (WITH CUSTOMIZABLE CREATOR STUDIO)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// MODAL: LIVE MOCKUP PREVIEW POPUP
// ─────────────────────────────────────────────────────────────────────────────

function MockupPreviewModal({
  isOpen,
  onClose,
  page,
  username,
  livePreviewData,
  previewKey,
  publicBioUrl,
  rootDomain,
  copiedLink,
  onCopy,
  activeTab,
}: {
  isOpen: boolean;
  onClose: () => void;
  page: BioPageData;
  username: string;
  livePreviewData: PublicBioPayload;
  previewKey: number;
  publicBioUrl: string;
  rootDomain: string;
  copiedLink: boolean;
  onCopy: () => void;
  activeTab?: string;
}) {
  const [modalDevice, setModalDevice] = useState<"mobile" | "tablet" | "desktop">("mobile");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-xl bg-[#141414] border border-white/15 rounded overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh] z-10"
          >
            {/* Modal Header */}
            <div className="p-3 px-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#1c1b1b]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#c4c0ff]/10 border border-[#c4c0ff]/20 flex items-center justify-center text-[#c4c0ff]">
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white tracking-tight">Live Mockup Preview</h3>
                  <p className="text-[10px] text-zinc-400 font-mono">@{username || page.username}</p>
                </div>
              </div>

              {/* Apple Device Switcher in Modal */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5 bg-[#101010] p-0.5 rounded border border-[#2c2c2c]">
                  <button
                    type="button"
                    onClick={() => setModalDevice("mobile")}
                    className={cn(
                      "px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-all select-none cursor-pointer",
                      modalDevice === "mobile" ? "bg-white text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
                    )}
                    title="iPhone (iOS)"
                  >
                    <Smartphone className="w-3 h-3 shrink-0" />
                    <span>iPhone</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalDevice("tablet")}
                    className={cn(
                      "px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-all select-none cursor-pointer",
                      modalDevice === "tablet" ? "bg-white text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
                    )}
                    title="iPad (iPadOS)"
                  >
                    <Tablet className="w-3 h-3 shrink-0" />
                    <span>iPad</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalDevice("desktop")}
                    className={cn(
                      "px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-all select-none cursor-pointer",
                      modalDevice === "desktop" ? "bg-white text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
                    )}
                    title="Mac (macOS)"
                  >
                    <Monitor className="w-3 h-3 shrink-0" />
                    <span>Mac</span>
                  </button>
                </div>

                {/* <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
                  title="Close popup"
                >
                  <X className="w-4 h-4" />
                </button> */}
              </div>
            </div>

            {/* Modal Body / Mockup Viewport */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#09090b] flex items-center justify-center min-h-[420px]">
              {/* DEVICE 1: APPLE IPHONE 16 PRO (iOS UI) */}
              {modalDevice === "mobile" && (
                <div key={`modal-mobile-${previewKey}`} className="w-full flex justify-center py-1 animate-in fade-in zoom-in-95 duration-200">
                  <div className="relative w-[215px] sm:w-[225px] h-[410px] sm:h-[430px] rounded-[36px] p-[6px] shadow-[0_20px_50px_-12px_rgba(0,0,0,1),0_0_0_1px_rgba(255,255,255,0.2),0_0_0_3px_#222222] bg-gradient-to-b from-[#3a3a3a] via-[#1c1c1e] to-[#2a2a2a] flex flex-col shrink-0 overflow-visible">
                    {/* Titanium Antenna Bands */}
                    <div className="absolute top-[50px] -left-[1px] w-[2px] h-[3px] bg-[#555] rounded-full" />
                    <div className="absolute top-[50px] -right-[1px] w-[2px] h-[3px] bg-[#555] rounded-full" />
                    <div className="absolute bottom-[50px] -left-[1px] w-[2px] h-[3px] bg-[#555] rounded-full" />
                    <div className="absolute bottom-[50px] -right-[1px] w-[2px] h-[3px] bg-[#555] rounded-full" />

                    {/* Left Hardware Buttons */}
                    <div className="absolute -left-[4px] top-[65px] w-[3px] h-[16px] bg-[#404040] border-l border-white/20 rounded-l-[2px] shadow-sm" title="Action Button" />
                    <div className="absolute -left-[4px] top-[92px] w-[3px] h-[32px] bg-[#404040] border-l border-white/20 rounded-l-[2px] shadow-sm" title="Volume Up" />
                    <div className="absolute -left-[4px] top-[132px] w-[3px] h-[32px] bg-[#404040] border-l border-white/20 rounded-l-[2px] shadow-sm" title="Volume Down" />

                    {/* Right Hardware Buttons */}
                    <div className="absolute -right-[4px] top-[102px] w-[3px] h-[46px] bg-[#404040] border-r border-white/20 rounded-r-[2px] shadow-sm" title="Power" />
                    <div className="absolute -right-[3px] top-[245px] w-[2px] h-[24px] bg-[#2a2a2a] border border-white/20 rounded-r-[2px]" title="Camera Control" />

                    {/* Screen Glass */}
                    <div className="relative w-full h-full bg-black rounded-[30px] overflow-hidden flex flex-col justify-between text-white border border-white/10 shadow-inner">
                      {/* Earpiece Speaker */}
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 z-40 w-9 h-[2px] bg-[#1a1a1a] rounded-full" />

                      {/* iOS Top Status Bar */}
                      <div className="absolute top-0 left-0 right-0 z-40 pt-1.5 px-3 flex items-center justify-between text-[10px] font-semibold text-white select-none pointer-events-none">
                        <span className="tracking-tight font-bold text-[10px]">9:41</span>

                        {/* Dynamic Island */}
                        <div className="w-[74px] h-[18px] bg-black rounded-full border border-white/10 flex items-center justify-between px-1.5 shadow-md">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#111] border border-[#262626] flex items-center justify-center">
                            <div className="w-0.5 h-0.5 rounded-full bg-[#050518]" />
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-[#070b18] border border-[#1e293b] flex items-center justify-center shadow-inner">
                            <div className="w-0.5 h-0.5 rounded-full bg-[#1e1b4b]" />
                          </div>
                        </div>

                        {/* Status Icons */}
                        <div className="flex items-center gap-1 text-[8.5px]">
                          <span className="font-bold tracking-tighter">5G</span>
                          <div className="w-[14px] h-[7.5px] border border-white/80 rounded-[2px] p-[1px] flex items-center relative">
                            <div className="w-full h-full bg-[#c4c0ff] rounded-[0.5px]" />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 w-full pt-6 overflow-y-auto scrollbar-hide overflow-x-hidden relative">
                        <div className="w-[138%] origin-top-left transform scale-[0.725] min-h-full pb-8">
                          <LinkInBioPublicView
                            username={username || page.username}
                            initialData={livePreviewData}
                            isPreviewMode={true}
                            activeTab={activeTab}
                          />
                        </div>
                      </div>

                      {/* Bottom Safari Pill & Home Indicator */}
                      <div className="bg-transparent shrink-0 z-40 flex flex-col items-center pointer-events-none pb-0.5 pt-0.5">
                        <div className="w-[88%] bg-black/70 backdrop-blur-xl border border-white/15 rounded-full py-0.5 px-2 flex items-center justify-between text-[9px] text-zinc-300 font-sans shadow-lg mb-0.5 pointer-events-auto">
                          <span className="font-sans font-bold text-zinc-400 text-[8.5px] tracking-tighter select-none">AA</span>
                          <div className="flex items-center gap-1 text-zinc-200">
                            <Lock className="w-2 h-2 text-zinc-400" />
                            <span className="font-medium text-[9px]">{rootDomain}</span>
                          </div>
                          <RefreshCw className="w-2 h-2 text-zinc-400" />
                        </div>
                        <div className="w-20 h-[2px] bg-white/70 rounded-full shadow-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DEVICE 2: APPLE IPAD PRO (iPadOS UI) */}
              {modalDevice === "tablet" && (
                <div key={`modal-tablet-${previewKey}`} className="w-full flex justify-center py-1 animate-in fade-in zoom-in-95 duration-200">
                  <div className="relative w-full max-w-[500px] bg-[#1c1c1e] rounded-[30px] p-2.5 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.18),inset_0_0_0_1.5px_#333336]">
                    <div className="relative w-full bg-[#131313] rounded-[22px] overflow-hidden border border-[#2a2a2a] flex flex-col h-[580px] max-h-[66vh]">
                      {/* iPadOS Status Bar */}
                      <div className="h-7 bg-black/50 backdrop-blur-md shrink-0 z-40 px-3 flex items-center justify-between text-[10px] font-semibold text-white/90 select-none pointer-events-none">
                        <span>Tuesday, Sep 6 9:41 AM</span>
                        <div className="w-5 h-2.5 bg-white/15 rounded-full flex items-center justify-center gap-0.5">
                          <div className="w-1 h-1 rounded-full bg-white/80" />
                          <div className="w-1 h-1 rounded-full bg-white/80" />
                          <div className="w-1 h-1 rounded-full bg-white/80" />
                        </div>
                        <div className="flex items-center gap-1 text-[9px]">
                          <Wifi className="w-2.5 h-2.5 text-white/90" />
                          <span>100%</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 w-full overflow-y-auto scrollbar-hide">
                        <LinkInBioPublicView
                          username={username || page.username}
                          initialData={livePreviewData}
                          isPreviewMode={true}
                          activeTab={activeTab}
                        />
                      </div>

                      <div className="h-3.5 bg-transparent shrink-0 z-40 flex items-center justify-center pointer-events-none">
                        <div className="w-32 h-1 bg-white/40 rounded-full shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DEVICE 3: APPLE MACBOOK / MACOS SAFARI UI */}
              {modalDevice === "desktop" && (
                <div key={`modal-desktop-${previewKey}`} className="w-full flex justify-center py-1 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-full bg-[#18181a] rounded-xl overflow-hidden border border-white/15 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95)] flex flex-col h-[580px] max-h-[66vh]">
                    {/* Title Bar */}
                    <div className="h-8 bg-[#222225]/95 border-b border-white/10 px-3 flex items-center justify-between shrink-0 select-none gap-2 text-xs">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                      </div>
                      <div className="flex-1 max-w-xs bg-[#121214] border border-white/10 rounded py-0.5 px-2 flex items-center justify-between text-[10px] font-mono text-zinc-300">
                        <span className="truncate">{rootDomain}/@{username || page.username}</span>
                      </div>
                      <div className="w-10" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 w-full overflow-y-auto scrollbar-hide bg-[#131313]">
                      <LinkInBioPublicView
                        username={username || page.username}
                        initialData={livePreviewData}
                        isPreviewMode={true}
                        activeTab={activeTab}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Bar */}
            <div className="p-3 border-t border-white/10 bg-[#161616] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onCopy}
                  className="px-2.5 py-1.5 rounded bg-[#20201f] hover:bg-[#2c2c2c] border border-[#353535] text-xs font-semibold text-white flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                  <span>{copiedLink ? "Copied" : "Copy Link"}</span>
                </button>

                <a
                  href={publicBioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded bg-[#20201f] hover:bg-[#2c2c2c] border border-[#353535] text-xs font-semibold text-white flex items-center gap-1 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Open Live Page</span>
                </a>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-white text-black font-bold text-xs rounded hover:bg-zinc-200 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
