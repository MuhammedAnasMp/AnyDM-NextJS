"use client";

import React, { useState, useEffect, useRef } from "react";
import api from "@/lib/services/api.service";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  Download,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Play,
  Share2,
  Globe,
  Phone,
  Mail,
  ShoppingBag,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  X,
  EyeOff,
} from "lucide-react";

import SocialIcon, { SOCIAL_ICON_MAP } from "./SocialIcon";

// ─────────────────────────────────────────────────────────────────────────────
// SOCIAL ICONS
// ─────────────────────────────────────────────────────────────────────────────

export const SocialIcons = SOCIAL_ICON_MAP;

// ─────────────────────────────────────────────────────────────────────────────
// PRESET THEMES (DESIGN.MD ALIGNED)
// ─────────────────────────────────────────────────────────────────────────────

export interface ThemeConfig {
  id: string;
  name: string;
  bgClass: string;
  bgStyle?: React.CSSProperties;
  textClass: string;
  textMutedClass: string;
  cardClass: string;
  cardBorderClass: string;
  buttonClass: string;
  accentColor: string;
  pasteCardClass: string;
  inputClass: string;
  isDark: boolean;
}

export const BIO_THEMES: Record<string, ThemeConfig> = {
  glass_monochrome: {
    id: "glass_monochrome",
    name: "Glass Monochrome",
    bgClass: "bg-[#131313] text-[#e5e2e1]",
    textClass: "text-[#ffffff]",
    textMutedClass: "text-[#8e9192]",
    cardClass: "bg-[#20201f] hover:bg-[#2a2a2a] text-[#ffffff] shadow-sm transition-all duration-200",
    cardBorderClass: "border border-[#353535] hover:border-[#8e9192]",
    buttonClass: "bg-[#ffffff] text-[#131313] hover:bg-[#e5e2e1] font-bold",
    accentColor: "#c4c0ff",
    pasteCardClass: "bg-[#20201f] border border-[#353535] shadow-lg",
    inputClass: "bg-[#131313] border border-[#353535] text-white placeholder-zinc-500 focus:border-[#ffffff]",
    isDark: true,
  },
  minimal: {
    id: "minimal",
    name: "Minimal Monochrome",
    bgClass: "bg-[#09090b] text-[#f4f4f5]",
    textClass: "text-white",
    textMutedClass: "text-zinc-400",
    cardClass: "bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm transition-all duration-200",
    cardBorderClass: "border border-zinc-800 hover:border-zinc-600",
    buttonClass: "bg-white text-black hover:bg-zinc-200 font-bold",
    accentColor: "#ffffff",
    pasteCardClass: "bg-zinc-900 border border-zinc-800",
    inputClass: "bg-black border border-zinc-700 text-white placeholder-zinc-500 focus:border-white",
    isDark: true,
  },
  creator: {
    id: "creator",
    name: "Creator Studio",
    bgClass: "bg-[#0f0c20] text-slate-100",
    bgStyle: {
      backgroundImage: "radial-gradient(ellipse at 50% 0%, #3b1b6a 0%, #0f0c20 70%)",
    },
    textClass: "text-white",
    textMutedClass: "text-purple-200/70",
    cardClass: "bg-purple-950/40 hover:bg-purple-900/50 text-white shadow-md transition-all duration-200",
    cardBorderClass: "border border-purple-500/30 hover:border-purple-400/60 shadow-[0_0_15px_rgba(168,85,247,0.15)]",
    buttonClass: "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:opacity-90 font-bold",
    accentColor: "#c084fc",
    pasteCardClass: "bg-purple-950/60 border border-purple-500/40 shadow-xl",
    inputClass: "bg-purple-950/80 border border-purple-700 text-white placeholder-purple-300/40 focus:border-purple-400",
    isDark: true,
  },
  dark_glass: {
    id: "dark_glass",
    name: "Translucent Glass",
    bgClass: "bg-[#0a0d14] text-slate-100",
    bgStyle: {
      backgroundImage: "radial-gradient(at 100% 0%, #1e293b 0px, transparent 50%), radial-gradient(at 0% 100%, #0f172a 0px, transparent 50%)",
    },
    textClass: "text-white",
    textMutedClass: "text-slate-400",
    cardClass: "bg-white/[0.04] hover:bg-white/[0.09] text-white shadow-lg transition-all duration-200",
    cardBorderClass: "border border-white/10 hover:border-white/25",
    buttonClass: "bg-white text-black hover:bg-slate-200 font-bold",
    accentColor: "#38bdf8",
    pasteCardClass: "bg-white/[0.06] border border-white/15 shadow-2xl",
    inputClass: "bg-black/40 border border-white/20 text-white placeholder-slate-500 focus:border-cyan-400",
    isDark: true,
  },
  gradient_glow: {
    id: "gradient_glow",
    name: "Aurora Glow",
    bgClass: "bg-[#0b0a1a] text-pink-50",
    bgStyle: {
      backgroundImage: "radial-gradient(circle at 20% 20%, rgba(236,72,153,0.15), transparent 40%), radial-gradient(circle at 80% 80%, rgba(99,102,241,0.2), transparent 50%)",
    },
    textClass: "text-white",
    textMutedClass: "text-pink-200/60",
    cardClass: "bg-slate-900/60 hover:bg-slate-800/80 text-white transition-all duration-200",
    cardBorderClass: "border border-pink-500/20 hover:border-pink-500/50 shadow-[0_0_12px_rgba(236,72,153,0.1)]",
    buttonClass: "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white hover:opacity-95 font-bold shadow-md",
    accentColor: "#f472b6",
    pasteCardClass: "bg-slate-900/80 border border-pink-500/30 shadow-xl",
    inputClass: "bg-black/50 border border-pink-500/30 text-white placeholder-pink-300/40 focus:border-pink-400",
    isDark: true,
  },
  cyber_neon: {
    id: "cyber_neon",
    name: "Cyber Neon",
    bgClass: "bg-[#040608] text-cyan-50",
    textClass: "text-cyan-400",
    textMutedClass: "text-cyan-600",
    cardClass: "bg-[#091016] hover:bg-[#0f1b24] text-cyan-100 transition-all duration-200",
    cardBorderClass: "border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]",
    buttonClass: "bg-cyan-400 text-black hover:bg-cyan-300 font-bold uppercase",
    accentColor: "#06b6d4",
    pasteCardClass: "bg-[#091016] border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
    inputClass: "bg-black border border-cyan-500/50 text-cyan-100 placeholder-cyan-800 focus:border-cyan-300",
    isDark: true,
  },
  sunset_warmth: {
    id: "sunset_warmth",
    name: "Sunset Rose",
    bgClass: "bg-[#180d14] text-amber-50",
    bgStyle: {
      backgroundImage: "linear-gradient(to bottom, #2b1122, #180d14)",
    },
    textClass: "text-amber-100",
    textMutedClass: "text-amber-200/60",
    cardClass: "bg-rose-950/30 hover:bg-rose-900/40 text-amber-50 transition-all duration-200",
    cardBorderClass: "border border-rose-500/30 hover:border-amber-400/50",
    buttonClass: "bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:opacity-90 font-bold",
    accentColor: "#fbbf24",
    pasteCardClass: "bg-rose-950/50 border border-rose-500/30",
    inputClass: "bg-black/50 border border-rose-500/30 text-amber-100 placeholder-rose-300/40 focus:border-amber-400",
    isDark: true,
  },
  clean_white: {
    id: "clean_white",
    name: "Clean Daylight",
    bgClass: "bg-[#f8fafc] text-slate-800",
    textClass: "text-slate-900",
    textMutedClass: "text-slate-500",
    cardClass: "bg-white hover:bg-slate-50 text-slate-900 shadow-sm transition-all duration-200",
    cardBorderClass: "border border-slate-200 hover:border-slate-400",
    buttonClass: "bg-slate-900 text-white hover:bg-slate-800 font-bold",
    accentColor: "#0f172a",
    pasteCardClass: "bg-white border border-slate-200 shadow-md",
    inputClass: "bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-900",
    isDark: false,
  },
  luxury_gold: {
    id: "luxury_gold",
    name: "Luxury Obsidian",
    bgClass: "bg-[#0d0d0d] text-[#e8e4db]",
    textClass: "text-[#d4af37]",
    textMutedClass: "text-stone-400",
    cardClass: "bg-[#161616] hover:bg-[#1e1e1e] text-[#f5f5f5] transition-all duration-200",
    cardBorderClass: "border border-[#d4af37]/30 hover:border-[#d4af37]/70 shadow-[0_0_10px_rgba(212,175,55,0.1)]",
    buttonClass: "bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] text-black hover:brightness-105 font-bold",
    accentColor: "#d4af37",
    pasteCardClass: "bg-[#161616] border border-[#d4af37]/40 shadow-xl",
    inputClass: "bg-black border border-[#d4af37]/30 text-stone-200 placeholder-stone-600 focus:border-[#d4af37]",
    isDark: true,
  },
};

const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const isDirectVideo = (url: string): boolean => {
  if (!url) return false;
  return url.endsWith(".mp4") || url.endsWith(".mov") || url.endsWith(".webm") || url.includes("/video/upload/");
};

// ─────────────────────────────────────────────────────────────────────────────
// PROPS INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface PublicBlockData {
  id?: number;
  block_type: string;
  title: string;
  subtitle: string;
  url: string;
  media_url: string;
  config?: Record<string, unknown>;
  order: number;
  is_active: boolean;
  clicks_count?: number;
}

export interface PublicSocialAccount {
  id?: string;
  platform: string;
  url: string;
  label?: string;
  icon?: string;
  is_active: boolean;
}

export interface PublicPageData {
  id?: number;
  username: string;
  title: string;
  bio: string;
  profile_image_url: string;
  banner_image_url: string;
  theme_id: string;
  custom_theme?: Record<string, unknown>;
  social_accounts?: PublicSocialAccount[];
  social_display_mode: string;
  show_social_usernames?: boolean;
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

export interface PublicBioPayload {
  page: PublicPageData;
  blocks: PublicBlockData[];
  creator: {
    username: string;
    full_name: string;
    profile_picture_url: string;
    instagram_username?: string;
  };
}

interface RedirectResultPayload {
  found: boolean;
  destination_type: string;
  destination_value: string;
  destination_title?: string;
  rule_title?: string;
  message?: string;
}

interface LinkInBioPublicViewProps {
  username: string;
  initialData?: PublicBioPayload;
  isPreviewMode?: boolean;
  activeTab?: string;
}

export default function LinkInBioPublicView({
  username,
  initialData,
  isPreviewMode = false,
  activeTab,
}: LinkInBioPublicViewProps) {
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PublicBioPayload | null>(initialData || null);

  const [pasteInput, setPasteInput] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [redirectResult, setRedirectResult] = useState<RedirectResultPayload | null>(null);
  const [redirectError, setRedirectError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (isPreviewMode && activeTab) {
      const targetEl = sectionRefs.current[activeTab];
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [isPreviewMode, activeTab]);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setLoading(false);
      setError(null);
      return;
    }
    let isMounted = true;
    if (username) {
      const cleanHandle = username.replace(/^@/, "");
      api
        .get<PublicBioPayload>(`/accounts/public/link-in-bio/${cleanHandle}/`)
        .then((res) => {
          if (isMounted) {
            setData(res.data);
            setError(null);
            setLoading(false);
          }
        })
        .catch((err: unknown) => {
          if (isMounted) {
            console.error("Failed to load Link-in-Bio page:", err);
            const apiErr = err as { response?: { data?: { error?: string } } };
            setError(apiErr.response?.data?.error || "This profile could not be found.");
            setLoading(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [username, initialData]);

  const trackClick = async (eventType: string, blockId?: number) => {
    if (isPreviewMode) return;
    try {
      const cleanHandle = username.replace(/^@/, "");
      await api.post(`/accounts/public/link-in-bio/${cleanHandle}/track/`, {
        event_type: eventType,
        block_id: blockId,
      });
    } catch {
      // Non-blocking
    }
  };

  const handleClipboardPaste = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setPasteInput(text.trim());
        }
      }
    } catch {
      // Permission might be denied
    }
  };

  const handleResolveRedirect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pasteInput.trim()) return;

    setIsResolving(true);
    setRedirectError(null);
    setRedirectResult(null);

    try {
      const cleanHandle = username.replace(/^@/, "");
      const res = await api.post<RedirectResultPayload>(`/accounts/public/link-in-bio/${cleanHandle}/resolve-redirect/`, {
        input_url: pasteInput.trim(),
      });

      if (res.data.found) {
        setRedirectResult(res.data);
        if (res.data.destination_type === "url" && !isPreviewMode) {
          window.open(res.data.destination_value, "_blank");
        }
      } else {
        setRedirectError(res.data.message || "No matching destination link found.");
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setRedirectError(apiErr.response?.data?.message || "Could not resolve link.");
    } finally {
      setIsResolving(false);
    }
  };

  const handleCopyPageUrl = () => {
    if (typeof window !== "undefined") {
      const currentUrl = window.location.href;
      navigator.clipboard.writeText(currentUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center gap-4 text-white font-sans"
        suppressHydrationWarning
      >
        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  if (error || !data || !data.page) {
    return (
      <div
        className="min-h-screen bg-[#0e0e0e] text-white flex flex-col items-center justify-center p-6 text-center font-sans"
        suppressHydrationWarning
      >
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <Globe className="w-8 h-8 text-zinc-500" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
          {error || "The requested profile is unavailable."}
        </p>
      </div>
    );
  }

  const { page, blocks = [], creator } = data;
  const customTheme = page.custom_theme || {};
  const bgType = (customTheme.background_type as string) || "preset";
  const customBgColor = customTheme.background_color as string;
  const customBgImage = customTheme.background_image_url as string;
  const customTextColor = (customTheme.text_color as string) || "";
  const customOverlay = (customTheme.background_overlay as string) || "dark";

  const theme: ThemeConfig = BIO_THEMES[page.theme_id] || BIO_THEMES.glass_monochrome;
  const socialAccounts = Array.isArray(page.social_accounts) ? page.social_accounts.filter((s) => s.is_active && s.url) : [];

  // Determine dynamic background styling based on custom color / image or preset theme
  let containerBgStyle: React.CSSProperties = theme.bgStyle || {};
  let containerBgClass = theme.bgClass;

  if (bgType === "color" && customBgColor) {
    containerBgStyle = { backgroundColor: customBgColor };
    containerBgClass = "";
  } else if (bgType === "image" && customBgImage) {
    containerBgStyle = {
      backgroundImage: `url(${customBgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
    containerBgClass = "";
  }

  const primaryTextStyle: React.CSSProperties = customTextColor ? { color: customTextColor } : {};
  const mutedTextStyle: React.CSSProperties = customTextColor ? { color: customTextColor, opacity: 0.7 } : {};

  return (
    <div
      suppressHydrationWarning
      className={cn(
        "w-full flex flex-col items-center transition-colors duration-300 relative selection:bg-white/20 font-sans",
        isPreviewMode ? "min-h-full" : "min-h-screen",
        containerBgClass
      )}
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        ...containerBgStyle,
        ...primaryTextStyle,
      }}
    >
      {/* Background Overlay for Custom Image */}
      {bgType === "image" && customBgImage && (
        <div
          className={cn(
            "absolute inset-0 pointer-events-none z-0",
            customOverlay === "heavy"
              ? "bg-black/80 backdrop-blur-[2px]"
              : customOverlay === "light"
                ? "bg-black/35"
                : "bg-black/60"
          )}
        />
      )}

      {/* Banner / Cover */}
      {page.banner_image_url ? (
        <div className={cn("w-full relative overflow-hidden shrink-0 z-10", isPreviewMode ? "h-36" : "h-44 sm:h-52")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={page.banner_image_url}
            alt={page.title || "Cover"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
      ) : (
        <div className="w-full h-8 shrink-0 z-10" />
      )}

      {/* Top-Right Absolute Share Action */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30">
        <button
          onClick={handleCopyPageUrl}
          aria-label="Share"
          className={cn(
            "p-2 rounded-full backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer shadow-md",
            theme.cardClass,
            theme.cardBorderClass
          )}
          title="Share"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-semibold pr-1">Copied</span>
            </>
          ) : (
            <Share2 className="w-4 h-4 opacity-80 hover:opacity-100" />
          )}
        </button>
      </div>

      {/* Main Container */}
      <div className={cn("w-full max-w-md px-4 flex flex-col items-center z-10", isPreviewMode ? "gap-4 pb-2" : "gap-5 pb-16", page.banner_image_url ? (isPreviewMode ? "-mt-12" : "-mt-16 sm:-mt-18") : "mt-3")}>

        {/* Profile Header */}
        <div
          ref={(el) => {
            sectionRefs.current["styling"] = el;
          }}
          className={cn(
            "flex flex-col items-center text-center gap-2.5 w-full p-2 rounded-xl transition-all duration-300 relative",
            isPreviewMode && activeTab === "styling" && "ring-2 ring-[#c4c0ff] shadow-[0_0_20px_rgba(196,192,255,0.4)] bg-[#c4c0ff]/10"
          )}
        >
          <div className="relative group flex items-center justify-center">
            <div
              className={cn("rounded-full overflow-hidden p-1 shadow-2xl border-2 bg-[#131313]", isPreviewMode ? "w-20 h-20" : "w-24 h-24 sm:w-28 sm:h-28")}
              style={{ borderColor: theme.accentColor }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  page.profile_image_url ||
                  creator?.profile_picture_url ||
                  "https://static.vecteezy.com/system/resources/previews/002/318/271/non_2x/user-profile-icon-free-vector.jpg"
                }
                alt={page.title || page.username}
                className="w-full h-full object-cover rounded-full bg-zinc-900"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://static.vecteezy.com/system/resources/previews/002/318/271/non_2x/user-profile-icon-free-vector.jpg";
                }}
              />
            </div>
            <div
              className="absolute bottom-0 right-0 w-5.5 h-5.5 rounded-full flex items-center justify-center shadow-lg border-2 border-[#131313]"
              style={{ backgroundColor: theme.accentColor, color: theme.isDark ? "#000" : "#fff" }}
            >
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-0.5 w-full px-2">
            <h1
              className={cn("font-black tracking-tight leading-tight", isPreviewMode ? "text-lg" : "text-xl sm:text-2xl", !customTextColor && theme.textClass)}
              style={primaryTextStyle}
            >
              {page.title || creator?.full_name || `@${page.username}`}
            </h1>
            <p
              className={cn("font-semibold tracking-wide text-xs", !customTextColor && theme.textMutedClass)}
              style={mutedTextStyle}
            >
              @{page.username}
            </p>
          </div>

          {page.bio && (
            <p
              className={cn("font-normal leading-relaxed max-w-sm px-2 text-xs sm:text-sm", !customTextColor && theme.textMutedClass)}
              style={mutedTextStyle}
            >
              {page.bio}
            </p>
          )}
        </div>

        {/* Dynamic Section Ordering based on tab order */}
        {(() => {
          const defaultOrder = ["blocks", "social", "redirects"];
          const rawOrder = page.section_order || (page.custom_theme as any)?.section_order;
          const userOrder = (Array.isArray(rawOrder) ? rawOrder : []).filter((s) => defaultOrder.includes(s));
          defaultOrder.forEach((s) => {
            if (!userOrder.includes(s)) userOrder.push(s);
          });
          return userOrder;
        })().map((sectionKey: string) => {
          if (sectionKey === "social") {
            if (page.social_enabled === false) {
              if (!isPreviewMode) return null;
              return (
                <div
                  key="social"
                  ref={(el) => {
                    sectionRefs.current["social"] = el;
                  }}
                  className={cn(
                    "w-full py-2 px-3 rounded-xl text-center text-xs font-semibold border border-dashed border-zinc-700 text-zinc-400 bg-zinc-900/40 transition-all duration-300 relative",
                    isPreviewMode && activeTab === "social" && "ring-2 ring-[#c4c0ff] shadow-[0_0_20px_rgba(196,192,255,0.4)] bg-[#c4c0ff]/10 text-white border-solid border-[#c4c0ff]/50"
                  )}
                >
                  <div className="flex items-center justify-center gap-1.5 opacity-80">
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Social Hub (Disabled)</span>
                  </div>
                </div>
              );
            }


            if (page.social_display_mode === "hidden") {
              if (!isPreviewMode) return null;
              return (
                <div
                  key="social"
                  ref={(el) => {
                    sectionRefs.current["social"] = el;
                  }}
                  className={cn(
                    "w-full py-2 px-3 rounded-xl text-center text-xs font-semibold border border-dashed border-zinc-700 text-zinc-400 bg-zinc-900/40 transition-all duration-300 relative",
                    isPreviewMode && activeTab === "social" && "ring-2 ring-[#c4c0ff] shadow-[0_0_20px_rgba(196,192,255,0.4)] bg-[#c4c0ff]/10 text-white border-solid border-[#c4c0ff]/50"
                  )}
                >
                  <div className="flex items-center justify-center gap-1.5 opacity-80">
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Social Hub (Hidden on Public Bio)</span>
                  </div>
                </div>
              );
            }

            if (socialAccounts.length === 0) {
              if (!isPreviewMode) return null;
              return (
                <div
                  key="social"
                  ref={(el) => {
                    sectionRefs.current["social"] = el;
                  }}
                  className={cn(
                    "w-full py-2 px-3 rounded-xl text-center text-xs font-semibold border border-dashed border-zinc-700 text-zinc-400 bg-zinc-900/40 transition-all duration-300 relative",
                    isPreviewMode && activeTab === "social" && "ring-2 ring-[#c4c0ff] shadow-[0_0_20px_rgba(196,192,255,0.4)] bg-[#c4c0ff]/10 text-white border-solid border-[#c4c0ff]/50"
                  )}
                >
                  <div className="flex items-center justify-center gap-1.5 opacity-80">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Social Hub (No active links)</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key="social"
                ref={(el) => {
                  sectionRefs.current["social"] = el;
                }}
                className={cn(
                  "flex flex-wrap items-center justify-center gap-1.5 pt-0.5 w-full p-2 rounded-xl transition-all duration-300 relative",
                  page.show_social_usernames ? "max-w-sm" : "max-w-xs",
                  isPreviewMode && activeTab === "social" && "ring-2 ring-[#c4c0ff] shadow-[0_0_20px_rgba(196,192,255,0.4)] bg-[#c4c0ff]/10"
                )}
              >
                {socialAccounts.map((social) => {
                  const iconKey = social.icon || social.platform;
                  const rawHandle =
                    social.label ||
                    (social.url
                      ? social.url
                        .replace(/^https?:\/\/(www\.)?(instagram\.com\/|youtube\.com\/@?|tiktok\.com\/@?|x\.com\/|twitter\.com\/|t\.me\/)?/, "")
                        .replace(/\/$/, "")
                      : "");
                  const displayHandle = rawHandle
                    ? rawHandle.startsWith("@") || rawHandle.includes(".") || !social.platform || social.platform === "custom"
                      ? rawHandle
                      : `@${rawHandle}`
                    : social.label || social.platform;

                  if (page.show_social_usernames) {
                    return (
                      <a
                        key={social.id || social.platform || social.url}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackClick("social_click")}
                        className={cn(
                          "rounded-full flex items-center gap-1.5 font-semibold transition-all duration-200 hover:scale-[1.02] shadow-sm px-3 py-1 text-xs",
                          theme.cardClass,
                          theme.cardBorderClass
                        )}
                        style={primaryTextStyle}
                        title={social.label || social.platform}
                      >
                        <div className="w-4 h-4 rounded-full flex items-center justify-center bg-white/10 shrink-0">
                          <SocialIcon platformOrIcon={iconKey} className="w-2.5 h-2.5" />
                        </div>
                        <span className="truncate max-w-[110px]">{displayHandle}</span>
                      </a>
                    );
                  }

                  return (
                    <a
                      key={social.id || social.platform || social.url}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackClick("social_click")}
                      aria-label={social.label || social.platform}
                      className={cn(
                        "rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-sm",
                        isPreviewMode ? "w-9 h-9" : "w-10 h-10",
                        theme.cardClass,
                        theme.cardBorderClass
                      )}
                      style={primaryTextStyle}
                      title={social.label || social.platform}
                    >
                      <SocialIcon platformOrIcon={iconKey} className={cn(isPreviewMode ? "w-4 h-4" : "w-4.5 h-4.5")} />
                    </a>
                  );
                })}
              </div>
            );
          }

          if (sectionKey === "redirects") {
            if (page.smart_redirect_enabled === false) return null;

            return (
              <div
                key="redirects"
                ref={(el) => {
                  sectionRefs.current["redirects"] = el;
                }}
                className={cn(
                  "w-full p-4 rounded relative overflow-hidden transition-all duration-300",
                  theme.pasteCardClass,
                  isPreviewMode && activeTab === "redirects" && "ring-2 ring-[#c4c0ff] shadow-[0_0_20px_rgba(196,192,255,0.4)] bg-[#c4c0ff]/10"
                )}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  {/* <Sparkles className="w-4 h-4 shrink-0" style={{ color: theme.accentColor }} /> */}
                  <span
                    className={cn("text-xs font-bold tracking-tight", !customTextColor && theme.textClass)}
                    style={primaryTextStyle}
                  >
                    {page.smart_input_title || "Have a Reel or Promo Link?"}
                  </span>
                </div>

                <form onSubmit={handleResolveRedirect} className="flex flex-col gap-2">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={pasteInput}
                      onChange={(e) => setPasteInput(e.target.value)}
                      placeholder={page.smart_input_placeholder || "Paste link here..."}
                      className={cn(
                        "w-full px-3.5 py-2.5 pr-20 text-xs rounded focus:outline-none transition-all shadow-inner",
                        theme.inputClass
                      )}
                    />
                    <button
                      type="button"
                      onClick={handleClipboardPaste}
                      className={cn(
                        "absolute right-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1 cursor-pointer",
                        theme.isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                      )}
                      title="Paste"
                    >
                      <Copy className="w-3 h-3" />
                      Paste
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isResolving || !pasteInput.trim()}
                    className={cn(
                      "w-full py-2.5 px-4 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer",
                      theme.buttonClass
                    )}
                  >
                    {isResolving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Resolving…</span>
                      </>
                    ) : (
                      <>
                        <span>{page.smart_input_button_text || "Get Link"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>

                {redirectError && (
                  <div className="mt-3 p-2.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-snug">{redirectError}</span>
                  </div>
                )}

                {redirectResult && (
                  <div className="mt-3 p-3.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Result
                      </span>
                      <button
                        onClick={() => setRedirectResult(null)}
                        className="text-emerald-400/60 hover:text-emerald-300 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs font-bold text-white leading-snug">
                      {redirectResult.destination_title || redirectResult.rule_title || "Direct Access Link"}
                    </p>

                    {redirectResult.destination_type === "url" && (
                      <a
                        href={redirectResult.destination_value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded flex items-center justify-center gap-1.5 transition-all"
                      >
                        <span>Open Link</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {redirectResult.destination_type === "file" && (
                      <a
                        href={redirectResult.destination_value}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download File</span>
                      </a>
                    )}

                    {redirectResult.destination_type === "message" && (
                      <div className="p-2.5 rounded bg-black/40 text-xs text-white leading-relaxed">
                        {redirectResult.destination_value}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          }

          if (sectionKey === "blocks") {
            if (page.blocks_enabled === false) {
              if (!isPreviewMode) return null;
              return (
                <div
                  key="blocks"
                  ref={(el) => {
                    sectionRefs.current["blocks"] = el;
                  }}
                  className={cn(
                    "w-full py-2 px-3 rounded-xl text-center text-xs font-semibold border border-dashed border-zinc-700 text-zinc-400 bg-zinc-900/40 transition-all duration-300 relative",
                    isPreviewMode && activeTab === "blocks" && "ring-2 ring-[#c4c0ff] shadow-[0_0_20px_rgba(196,192,255,0.4)] bg-[#c4c0ff]/10 text-white border-solid border-[#c4c0ff]/50"
                  )}
                >
                  <div className="flex items-center justify-center gap-1.5 opacity-80">
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Content Blocks (Disabled)</span>
                  </div>
                </div>
              );
            }

            if (blocks.length === 0) return null;

            return (
              <div
                key="blocks"
                ref={(el) => {
                  sectionRefs.current["blocks"] = el;
                }}
                className={cn(
                  "w-full p-2 rounded-xl transition-all duration-300 relative",
                  isPreviewMode ? "space-y-2" : "space-y-3",
                  isPreviewMode && activeTab === "blocks" && "ring-2 ring-[#c4c0ff] shadow-[0_0_20px_rgba(196,192,255,0.4)] bg-[#c4c0ff]/10"
                )}
              >
                {blocks.map((block) => {
                  const config = block.config || {};
                  const badge = typeof config.badge === "string" ? config.badge : "";
                  const animation = typeof config.highlight_animation === "string" ? config.highlight_animation : "";
                  const whatsappVal = typeof config.whatsapp === "string" ? config.whatsapp : "";
                  const emailVal = typeof config.email === "string" ? config.email : "";
                  const phoneVal = typeof config.phone === "string" ? config.phone : "";
                  const priceVal = typeof config.price === "string" ? config.price : "";
                  const fileSizeVal = typeof config.file_size === "string" ? config.file_size : "";

                  const animationClass =
                    animation === "pulse"
                      ? "animate-pulse"
                      : animation === "bounce"
                        ? "animate-bounce"
                        : animation === "shimmer"
                          ? "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
                          : "";

                  if (block.block_type === "header") {
                    return (
                      <div key={block.id || block.title} className="pt-3 pb-1 text-center">
                        <h3
                          className={cn("text-sm sm:text-base font-black tracking-tight", !customTextColor && theme.textClass)}
                          style={primaryTextStyle}
                        >
                          {block.title}
                        </h3>
                        {block.subtitle && (
                          <p
                            className={cn("text-xs mt-0.5", !customTextColor && theme.textMutedClass)}
                            style={mutedTextStyle}
                          >
                            {block.subtitle}
                          </p>
                        )}
                      </div>
                    );
                  }

                  if (block.block_type === "video") {
                    const ytId = getYoutubeVideoId(block.url || block.media_url);
                    const directVideo = isDirectVideo(block.media_url || block.url);

                    return (
                      <div
                        key={block.id || block.title}
                        className={cn("w-full rounded overflow-hidden shadow-lg", theme.cardBorderClass)}
                      >
                        {ytId ? (
                          <div className="relative aspect-video w-full bg-black">
                            <iframe
                              src={`https://www.youtube.com/embed/${ytId}`}
                              title={block.title || "Video"}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : directVideo ? (
                          <div className="relative aspect-video w-full bg-black">
                            <video
                              src={block.media_url || block.url}
                              controls
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <a
                            href={block.url || block.media_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackClick("block_click", block.id)}
                            className={cn("flex items-center gap-3 p-4", theme.cardClass)}
                            style={primaryTextStyle}
                          >
                            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white shrink-0">
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4
                                className={cn("text-xs font-bold truncate", !customTextColor && theme.textClass)}
                                style={primaryTextStyle}
                              >
                                {block.title || "Watch Video"}
                              </h4>
                              <p
                                className={cn("text-[10px] truncate", !customTextColor && theme.textMutedClass)}
                                style={mutedTextStyle}
                              >
                                {block.subtitle || block.url}
                              </p>
                            </div>
                            <ExternalLink className="w-4 h-4 shrink-0 opacity-60" />
                          </a>
                        )}
                        {block.title && ytId && (
                          <div
                            className={cn("p-2.5 text-xs font-bold text-center", theme.cardClass)}
                            style={primaryTextStyle}
                          >
                            {block.title}
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (block.block_type === "image") {
                    const Component = block.url ? "a" : "div";
                    return (
                      <Component
                        key={block.id || block.title}
                        href={block.url || undefined}
                        target={block.url ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        onClick={() => block.url && trackClick("block_click", block.id)}
                        className={cn(
                          "group block w-full rounded overflow-hidden shadow-md transition-transform hover:scale-[1.01]",
                          theme.cardBorderClass,
                          block.url ? "cursor-pointer" : ""
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={block.media_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe"}
                          alt={block.title || "Banner"}
                          className="w-full h-44 object-cover"
                        />
                        {block.title && (
                          <div className={cn("p-3 flex items-center justify-between", theme.cardClass)}>
                            <div>
                              <p
                                className={cn("text-xs font-bold", !customTextColor && theme.textClass)}
                                style={primaryTextStyle}
                              >
                                {block.title}
                              </p>
                              {block.subtitle && (
                                <p
                                  className={cn("text-[10px]", !customTextColor && theme.textMutedClass)}
                                  style={mutedTextStyle}
                                >
                                  {block.subtitle}
                                </p>
                              )}
                            </div>
                            {block.url && <ExternalLink className="w-3.5 h-3.5 opacity-60" />}
                          </div>
                        )}
                      </Component>
                    );
                  }

                  if (block.block_type === "file_download") {
                    return (
                      <a
                        key={block.id || block.title}
                        href={block.url || block.media_url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackClick("block_click", block.id)}
                        className={cn(
                          "flex items-center gap-3.5 p-3.5 rounded transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]",
                          theme.cardClass,
                          theme.cardBorderClass,
                          animationClass
                        )}
                      >
                        <div className="w-10 h-10 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                          <Download className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4
                            className={cn("text-xs sm:text-sm font-bold truncate", !customTextColor && theme.textClass)}
                            style={primaryTextStyle}
                          >
                            {block.title || "Download File"}
                          </h4>
                          <p
                            className={cn("text-[10px] truncate", !customTextColor && theme.textMutedClass)}
                            style={mutedTextStyle}
                          >
                            {block.subtitle || fileSizeVal || "File"}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-white/10 text-white shrink-0">
                          GET
                        </span>
                      </a>
                    );
                  }

                  if (block.block_type === "contact_card") {
                    return (
                      <div
                        key={block.id || block.title}
                        className={cn("p-4 rounded space-y-3", theme.cardClass, theme.cardBorderClass)}
                      >
                        <div>
                          <h4
                            className={cn("text-xs sm:text-sm font-bold", !customTextColor && theme.textClass)}
                            style={primaryTextStyle}
                          >
                            {block.title || "Get In Touch"}
                          </h4>
                          {block.subtitle && (
                            <p
                              className={cn("text-[10px]", !customTextColor && theme.textMutedClass)}
                              style={mutedTextStyle}
                            >
                              {block.subtitle}
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {whatsappVal && (
                            <a
                              href={`https://wa.me/${whatsappVal.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => trackClick("block_click", block.id)}
                              className="py-2 px-3 rounded bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-600/20 transition-all"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          {emailVal && (
                            <a
                              href={`mailto:${emailVal}`}
                              onClick={() => trackClick("block_click", block.id)}
                              className="py-2 px-3 rounded bg-white/5 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-white/10 transition-all"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Email</span>
                            </a>
                          )}
                          {phoneVal && (
                            <a
                              href={`tel:${phoneVal}`}
                              onClick={() => trackClick("block_click", block.id)}
                              className="py-2 px-3 rounded bg-white/5 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-white/10 transition-all"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Call</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (block.block_type === "product_card") {
                    return (
                      <a
                        key={block.id || block.title}
                        href={block.url || `/${page.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackClick("block_click", block.id)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]",
                          theme.cardClass,
                          theme.cardBorderClass
                        )}
                      >
                        <div className="w-14 h-14 rounded overflow-hidden bg-zinc-900 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={block.media_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30"}
                            alt={block.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4
                            className={cn("text-xs sm:text-sm font-bold truncate", !customTextColor && theme.textClass)}
                            style={primaryTextStyle}
                          >
                            {block.title || "Product"}
                          </h4>
                          <p
                            className={cn("text-[10px] line-clamp-1", !customTextColor && theme.textMutedClass)}
                            style={mutedTextStyle}
                          >
                            {block.subtitle}
                          </p>
                          {priceVal && (
                            <span className="text-xs font-black" style={{ color: theme.accentColor }}>
                              {priceVal}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1.5 rounded bg-white text-black shrink-0 flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" /> Buy
                        </span>
                      </a>
                    );
                  }

                  if (block.block_type === "custom_button") {
                    return (
                      <a
                        key={block.id || block.title}
                        href={block.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackClick("block_click", block.id)}
                        className={cn(
                          "w-full py-3.5 px-5 rounded text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] shadow-lg cursor-pointer",
                          theme.buttonClass,
                          animationClass
                        )}
                      >
                        <span>{block.title || "Click Here"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    );
                  }

                  return (
                    <a
                      key={block.id || block.title}
                      href={block.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackClick("block_click", block.id)}
                      className={cn(
                        "group relative flex items-center gap-3.5 p-3.5 rounded transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] select-none",
                        theme.cardClass,
                        theme.cardBorderClass,
                        animationClass
                      )}
                    >
                      {block.media_url ? (
                        <div className="w-10 h-10 rounded overflow-hidden bg-zinc-900 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={block.media_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center shrink-0">
                          <Globe className="w-4.5 h-4.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <h4
                            className={cn("text-xs sm:text-sm font-bold truncate leading-snug", !customTextColor && theme.textClass)}
                            style={primaryTextStyle}
                          >
                            {block.title}
                          </h4>
                          {badge && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0"
                              style={{ backgroundColor: `${theme.accentColor}25`, color: theme.accentColor }}
                            >
                              {badge}
                            </span>
                          )}
                        </div>
                        {block.subtitle && (
                          <p
                            className={cn("text-[10px] sm:text-[11px] truncate leading-normal mt-0.5", !customTextColor && theme.textMutedClass)}
                            style={mutedTextStyle}
                          >
                            {block.subtitle}
                          </p>
                        )}
                      </div>

                      <ExternalLink className="w-4 h-4 shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </a>
                  );
                })}
              </div>
            );
          }

          return null;
        })}



        {/* AnyDM Footer Branding Badge */}
        <div className={cn("flex flex-col items-center justify-center text-center opacity-85 hover:opacity-100 transition-opacity", isPreviewMode ? "pt-3 pb-1" : "pt-6 pb-4")}>
          <a
            href="https://anydm.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-zinc-300 transition-all select-none group"
            style={mutedTextStyle}
          >
            <span className="text-zinc-400 group-hover:text-white transition-colors">Powered by</span>
            <span className="font-bold text-white tracking-tight flex items-center gap-1">
              AnyDM
              <span className="w-1.5 h-1.5 rounded-full bg-[#c4c0ff] animate-pulse" />
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
