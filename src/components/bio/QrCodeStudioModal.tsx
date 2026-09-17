"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Copy,
  Check,
  Sparkles,
  QrCode,
  Palette,
  Shapes,
  Image as ImageIcon,
  Sliders,
  Share2,
  AlertTriangle,
  Upload,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { QrcodeCanvas } from "react-qrcode-pretty";
import { cn } from "@/lib/utils";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/services/cloudinary.service";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN.md ALIGNED MONOCHROME & LAVENDER PRESETS
// ─────────────────────────────────────────────────────────────────────────────

export interface QrPreset {
  id: string;
  name: string;
  bodyColor: string;
  eyesColor: string;
  bgColor: string;
  bodyVariant: "standard" | "rounded" | "dots" | "fluid" | "circle" | "gravity";
  eyesVariant: "standard" | "rounded" | "dots" | "fluid" | "circle" | "gravity";
  bodyEffect?: "none" | "gradient-dark-vertical" | "gradient-dark-horizontal" | "gradient-dark-diagonal" | "gradient-light-vertical" | "gradient-light-horizontal";
  eyesEffect?: "none" | "gradient-dark-vertical" | "gradient-dark-horizontal" | "gradient-dark-diagonal" | "gradient-light-vertical" | "gradient-light-horizontal";
}

export const QR_PRESETS: QrPreset[] = [
  {
    id: "glass_monochrome",
    name: "Glass Monochrome",
    bodyColor: "#ffffff",
    eyesColor: "#c4c0ff",
    bgColor: "#131313",
    bodyVariant: "rounded",
    eyesVariant: "rounded",
  },
  {
    id: "anydm_lavender",
    name: "AnyDM Lavender",
    bodyColor: "#c4c0ff",
    eyesColor: "#ffffff",
    bgColor: "#1c1b1b",
    bodyVariant: "fluid",
    eyesVariant: "gravity",
    bodyEffect: "gradient-dark-vertical",
    eyesEffect: "gradient-dark-diagonal",
  },
  {
    id: "minimal_print",
    name: "High-Contrast Print",
    bodyColor: "#000000",
    eyesColor: "#000000",
    bgColor: "#ffffff",
    bodyVariant: "standard",
    eyesVariant: "standard",
  },
  {
    id: "sleek_silver",
    name: "Sleek Silver",
    bodyColor: "#e5e2e1",
    eyesColor: "#c4c0ff",
    bgColor: "#131313",
    bodyVariant: "dots",
    eyesVariant: "circle",
  },
  {
    id: "bold_inverse",
    name: "Bold Inverse",
    bodyColor: "#131313",
    eyesColor: "#20201f",
    bgColor: "#ffffff",
    bodyVariant: "rounded",
    eyesVariant: "rounded",
  },
  {
    id: "charcoal_dark",
    name: "Charcoal Dark",
    bodyColor: "#ffffff",
    eyesColor: "#8e9192",
    bgColor: "#1c1b1b",
    bodyVariant: "gravity",
    eyesVariant: "standard",
  },
];

const BODY_VARIANTS = [
  { id: "standard", label: "Standard" },
  { id: "rounded", label: "Rounded" },
  { id: "dots", label: "Dots" },
  { id: "fluid", label: "Fluid" },
  { id: "circle", label: "Circle" },
  { id: "gravity", label: "Gravity" },
] as const;

const EYE_VARIANTS = [
  { id: "standard", label: "Standard" },
  { id: "rounded", label: "Rounded" },
  { id: "dots", label: "Dots" },
  { id: "fluid", label: "Fluid" },
  { id: "circle", label: "Circle" },
  { id: "gravity", label: "Gravity" },
] as const;

const COLOR_EFFECTS = [
  { id: "none", label: "Solid Color" },
  { id: "gradient-dark-vertical", label: "Vertical Gradient" },
  { id: "gradient-dark-horizontal", label: "Horizontal Gradient" },
  { id: "gradient-dark-diagonal", label: "Diagonal Gradient" },
] as const;

// OFFICIAL ANYDM LOGO OPTIONS FROM public/icons
const ANYDM_LOGOS = [
  { id: "logo_white", label: "White Logo", path: "/icons/logo_white.png" },
  { id: "original", label: "Original Logo", path: "/icons/original.png" },
  { id: "log_icon", label: "Log Icon", path: "/icons/log.png" },
  { id: "fav_icon", label: "Favicon", path: "/icons/fav_icon.ico" },
];

const PRESET_COLORS = [
  "#ffffff",
  "#c4c0ff",
  "#e5e2e1",
  "#8e9192",
  "#353535",
  "#20201f",
  "#1c1b1b",
  "#131313",
  "#000000",
];

export interface SavedQrConfig {
  presetId?: string;
  bodyColor?: string;
  eyesColor?: string;
  bgColor?: string;
  bodyVariant?: "standard" | "rounded" | "dots" | "fluid" | "circle" | "gravity";
  eyesVariant?: "standard" | "rounded" | "dots" | "fluid" | "circle" | "gravity";
  bodyEffect?: "none" | "gradient-dark-vertical" | "gradient-dark-horizontal" | "gradient-dark-diagonal" | "gradient-light-vertical" | "gradient-light-horizontal";
  eyesEffect?: "none" | "gradient-dark-vertical" | "gradient-dark-horizontal" | "gradient-dark-diagonal" | "gradient-light-vertical" | "gradient-light-horizontal";
  logoType?: "avatar" | "anydm" | "custom" | "none";
  selectedAnyDmLogo?: string;
  customLogoUrl?: string;
  logoSize?: number;
}

async function convertUrlToBase64(url: string): Promise<string> {
  if (!url) return "";
  if (url.startsWith("data:")) return url;

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = img.naturalWidth || img.width || 100;
        tempCanvas.height = img.naturalHeight || img.height || 100;
        const ctx = tempCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(tempCanvas.toDataURL("image/png"));
          return;
        }
      } catch (err) {
        console.warn("Offscreen canvas export failed:", err);
      }
      resolve("");
    };
    img.onerror = async () => {
      try {
        const res = await fetch(url, { mode: "cors" });
        if (res.ok) {
          const blob = await res.blob();
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string) || "");
          reader.onerror = () => resolve("");
          reader.readAsDataURL(blob);
          return;
        }
      } catch (e) {
        console.warn("Fetch fallback failed:", e);
      }
      resolve("");
    };
    img.src = url;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// EXTERNAL FREE SCANNING API INTEGRATION (https://api.qrserver.com/v1/read-qr-code/)
// ─────────────────────────────────────────────────────────────────────────────

async function scanQrCodeWithExternalApi(
  blob: Blob
): Promise<{ isScannable: boolean; decodedData: string | null; error: string | null }> {
  try {
    const formData = new FormData();
    formData.append("file", blob, "qrcode.png");

    const res = await fetch("/api/scan-qr", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      return {
        isScannable: false,
        decodedData: null,
        error: `Scanning API returned HTTP error ${res.status}`,
      };
    }

    const data = await res.json();
    return {
      isScannable: Boolean(data.isScannable),
      decodedData: data.decodedData || null,
      error: data.error || null,
    };
  } catch (err: any) {
    return {
      isScannable: false,
      decodedData: null,
      error: err?.message || "Failed to reach QR scanning API",
    };
  }
}

interface QrCodeStudioModalProps {
  isOpen: boolean;
  publicUrl: string;
  username: string;
  profileImageUrl?: string;
  initialConfig?: SavedQrConfig;
  onClose: () => void;
  onCopy: () => void;
  copiedLink: boolean;
  onSaveConfig?: (config: SavedQrConfig) => void;
}

export function QrCodeStudioModal({
  isOpen,
  publicUrl,
  username,
  profileImageUrl,
  initialConfig,
  onClose,
  onCopy,
  copiedLink,
  onSaveConfig,
}: QrCodeStudioModalProps) {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Navigation
  const [activeTab, setActiveTab] = useState<"presets" | "colors" | "shapes" | "logo">("presets");
  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialConfig?.presetId || "glass_monochrome");

  // Colors
  const [bodyColor, setBodyColor] = useState<string>(initialConfig?.bodyColor || "#ffffff");
  const [eyesColor, setEyesColor] = useState<string>(initialConfig?.eyesColor || "#c4c0ff");
  const [bgColor, setBgColor] = useState<string>(initialConfig?.bgColor || "#131313");

  type VariantType = "standard" | "rounded" | "dots" | "fluid" | "circle" | "gravity";
  type EffectType = "none" | "gradient-dark-vertical" | "gradient-dark-horizontal" | "gradient-dark-diagonal" | "gradient-light-vertical" | "gradient-light-horizontal";

  // Variants & Effects
  const [bodyVariant, setBodyVariant] = useState<VariantType>(initialConfig?.bodyVariant || "rounded");
  const [eyesVariant, setEyesVariant] = useState<VariantType>(initialConfig?.eyesVariant || "rounded");
  const [bodyEffect, setBodyEffect] = useState<EffectType>(initialConfig?.bodyEffect || "none");
  const [eyesEffect, setEyesEffect] = useState<EffectType>(initialConfig?.eyesEffect || "none");

  // Logo
  const [logoType, setLogoType] = useState<"avatar" | "anydm" | "custom" | "none">(initialConfig?.logoType || "avatar");
  const [selectedAnyDmLogo, setSelectedAnyDmLogo] = useState<string>(initialConfig?.selectedAnyDmLogo || "/icons/logo_white.png");
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(initialConfig?.customLogoUrl || "");
  const [logoSize, setLogoSize] = useState<number>(initialConfig?.logoSize || 40);

  // Cloudinary Upload State
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // External Verification & Save State
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string>("");
  const [verifiedDecodedText, setVerifiedDecodedText] = useState<string>("");
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);

  // Actions state
  const [copiedImage, setCopiedImage] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadedQrMediaItemsRef = useRef<{ public_id: string; resource_type: string; url: string }[]>([]);
  const isQrSavedRef = useRef<boolean>(false);

  // Sync initialConfig or localStorage if opened & reset refs
  useEffect(() => {
    if (isOpen) {
      uploadedQrMediaItemsRef.current = [];
      isQrSavedRef.current = false;

      let parsedLocal: any = null;
      if (typeof window !== "undefined" && username) {
        try {
          const savedLocal = localStorage.getItem("anydm_qr_config_" + username);
          if (savedLocal) parsedLocal = JSON.parse(savedLocal);
        } catch (e) {
          console.error("Failed to parse local QR config:", e);
        }
      }
      const config = initialConfig || parsedLocal;
      if (config) {
        if (config.presetId) setSelectedPresetId(config.presetId);
        if (config.bodyColor) setBodyColor(config.bodyColor);
        if (config.eyesColor) setEyesColor(config.eyesColor);
        if (config.bgColor) setBgColor(config.bgColor);
        if (config.bodyVariant) setBodyVariant(config.bodyVariant);
        if (config.eyesVariant) setEyesVariant(config.eyesVariant);
        if (config.bodyEffect) setBodyEffect(config.bodyEffect);
        if (config.eyesEffect) setEyesEffect(config.eyesEffect);
        if (config.logoType) setLogoType(config.logoType);
        if (config.selectedAnyDmLogo) setSelectedAnyDmLogo(config.selectedAnyDmLogo);
        if (config.customLogoUrl) setCustomLogoUrl(config.customLogoUrl);
        if (config.logoSize) setLogoSize(config.logoSize);
      }
    }
  }, [isOpen, initialConfig, username]);

  // Cancel and clean up unsaved Cloudinary custom logo uploads
  const handleCancelQrModal = async () => {
    if (!isQrSavedRef.current && uploadedQrMediaItemsRef.current.length > 0) {
      const itemsToDelete = [...uploadedQrMediaItemsRef.current];
      uploadedQrMediaItemsRef.current = [];
      for (const item of itemsToDelete) {
        if (item.public_id) {
          deleteFromCloudinary({ publicId: item.public_id, resourceType: item.resource_type || "image" }).catch((err) =>
            console.warn("Failed to delete QR custom logo from Cloudinary on cancel:", err)
          );
        }
      }
    }
    onClose();
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (!isQrSavedRef.current && uploadedQrMediaItemsRef.current.length > 0) {
        const itemsToDelete = [...uploadedQrMediaItemsRef.current];
        uploadedQrMediaItemsRef.current = [];
        itemsToDelete.forEach((item) => {
          if (item.public_id) {
            deleteFromCloudinary({ publicId: item.public_id, resourceType: item.resource_type || "image" }).catch(() => {});
          }
        });
      }
    };
  }, []);

  // Reset verification messages when user changes settings
  useEffect(() => {
    setVerificationError("");
    setIsSavedSuccess(false);
  }, [bodyColor, eyesColor, bgColor, bodyVariant, eyesVariant, bodyEffect, eyesEffect, logoType, selectedAnyDmLogo, customLogoUrl, logoSize]);

  // Active logo image src
  const activeLogoSrc =
    logoType === "avatar"
      ? profileImageUrl
      : logoType === "anydm"
        ? selectedAnyDmLogo
        : logoType === "custom"
          ? customLogoUrl
          : undefined;

  const [logoBase64, setLogoBase64] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    if (!activeLogoSrc) {
      setLogoBase64("");
      return;
    }

    if (activeLogoSrc.startsWith("data:")) {
      setLogoBase64(activeLogoSrc);
      return;
    }

    convertUrlToBase64(activeLogoSrc).then((base64) => {
      if (isMounted) {
        setLogoBase64(base64 || "");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeLogoSrc]);

  // Handle Preset Select
  const handleApplyPreset = (preset: QrPreset) => {
    setSelectedPresetId(preset.id);
    setBodyColor(preset.bodyColor);
    setEyesColor(preset.eyesColor);
    setBgColor(preset.bgColor);
    setBodyVariant(preset.bodyVariant);
    setEyesVariant(preset.eyesVariant);
    setBodyEffect(preset.bodyEffect || "none");
    setEyesEffect(preset.eyesEffect || "none");
  };

  // Cloudinary Logo Upload Handler
  const handleCustomLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediately convert to local Base64 preview so canvas never taints
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCustomLogoUrl(reader.result);
        setLogoType("custom");
      }
    };
    reader.readAsDataURL(file);

    setUploadingLogo(true);
    setUploadProgress(0);

    try {
      const result = await uploadToCloudinary(file, {
        onProgress: (percent) => setUploadProgress(percent),
      });

      if (result && result.secure_url) {
        // If replacing an existing custom logo uploaded during this session, delete previous asset
        if (uploadedQrMediaItemsRef.current.length > 0) {
          const prevMedia = uploadedQrMediaItemsRef.current[uploadedQrMediaItemsRef.current.length - 1];
          if (prevMedia && prevMedia.public_id) {
            deleteFromCloudinary({ publicId: prevMedia.public_id, resourceType: prevMedia.resource_type || "image" }).catch((err) =>
              console.warn("Failed to delete replaced QR logo from Cloudinary:", err)
            );
          }
        }

        const newMedia = {
          public_id: result.public_id,
          resource_type: result.resource_type || "image",
          url: result.secure_url,
        };
        uploadedQrMediaItemsRef.current.push(newMedia);

        setCustomLogoUrl(result.secure_url);
        setLogoType("custom");
      }
    } catch (err) {
      console.error("Cloudinary custom logo upload failed:", err);
    } finally {
      setUploadingLogo(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Download High-Res PNG
  const handleDownloadPng = () => {
    if (!containerRef.current) return;
    const canvas = containerRef.current.querySelector("canvas");
    if (!canvas) return;

    try {
      const imageUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = imageUrl;
      a.download = `${username || "anydm"}-qrcode.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download QR image:", err);
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!containerRef.current) return;
    const canvas = containerRef.current.querySelector("canvas");
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        try {
          canvas.toBlob((b) => resolve(b), "image/png");
        } catch {
          resolve(null);
        }
      });

      if (!blob) return;

      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch (err) {
      console.error("Failed to copy image to clipboard:", err);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CALL EXTERNAL FREE SCANNING API ON BLOB & SAVE ONLY IF DECODED
  // ─────────────────────────────────────────────────────────────────────────
  const handleVerifyAndSave = async () => {
    if (!containerRef.current) return;
    const canvas = containerRef.current.querySelector("canvas");
    if (!canvas) return;

    setIsVerifying(true);
    setVerificationError("");
    setIsSavedSuccess(false);

    try {
      let blob: Blob | null = await new Promise<Blob | null>((resolve) => {
        try {
          canvas.toBlob((b) => resolve(b), "image/png");
        } catch (err) {
          console.error("Canvas export error:", err);
          resolve(null);
        }
      });

      // Fallback 1: try toDataURL -> fetch blob if toBlob returned null
      if (!blob) {
        try {
          const dataUrl = canvas.toDataURL("image/png");
          if (dataUrl && dataUrl.startsWith("data:image")) {
            const fetchRes = await fetch(dataUrl);
            blob = await fetchRes.blob();
          }
        } catch (fallbackErr) {
          console.error("toDataURL fallback error:", fallbackErr);
        }
      }

      if (!blob) {
        setIsVerifying(false);
        setVerificationError("Failed to extract canvas image blob. Please check logo format or try a preset logo.");
        return;
      }

      // Call External Scanning API (api.qrserver.com) with the image blob
      const result = await scanQrCodeWithExternalApi(blob);

      setIsVerifying(false);

      if (result.isScannable && result.decodedData) {
        // ONLY SAVE IF EXTERNAL API SUCCESSFULLY DECODED THE QR CODE IMAGE!
        setVerifiedDecodedText(result.decodedData);
        setIsSavedSuccess(true);
        isQrSavedRef.current = true;

        const config: SavedQrConfig = {
          presetId: selectedPresetId,
          bodyColor,
          eyesColor,
          bgColor,
          bodyVariant,
          eyesVariant,
          bodyEffect,
          eyesEffect,
          logoType,
          selectedAnyDmLogo,
          customLogoUrl,
          logoSize,
        };

        if (typeof window !== "undefined" && username) {
          try {
            localStorage.setItem("anydm_qr_config_" + username, JSON.stringify(config));
          } catch (e) {
            console.error("Failed to save QR config to localStorage:", e);
          }
        }

        if (onSaveConfig) {
          onSaveConfig(config);
        }
      } else {
        // DO NOT SAVE IF EXTERNAL API FAILED TO SCAN THE IMAGE!
        setVerificationError(
          result.error || "External QR Scanning API failed to decode image. Please increase color contrast or shrink logo size."
        );
      }
    } catch (err: any) {
      setIsVerifying(false);
      setVerificationError(err?.message || "An unexpected error occurred during verification.");
    }
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 font-sans select-none">
          {/* Backdrop (DESIGN.md Glass Overlay Level 2) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancelQrModal}
            className="absolute inset-0 bg-[#0e0e0e]/85 backdrop-blur-md"
          />

          {/* Studio Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            className="relative w-full max-w-2xl bg-[#131313] border border-[#353535] rounded-xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col max-h-[92vh] text-[#e5e2e1]"
          >
            {/* Top Bar Header with Cancel & Save Buttons */}
            <div className="w-full p-3 px-4 bg-[#1c1b1b] border-b border-[#353535] flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-[#c4c0ff]/10 text-[#c4c0ff] border border-[#c4c0ff]/20">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white tracking-tight">QR Studio</h3>
                  <p className="text-[10px] text-[#8e9192]">Customize & Save</p>
                </div>
              </div>

              {/* Top Action Buttons: Cancel & Save */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelQrModal}
                  className="px-3 py-1.5 rounded bg-[#20201f] hover:bg-[#2c2c2c] border border-[#353535] text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer select-none"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleVerifyAndSave}
                  disabled={isVerifying}
                  className="px-3 py-1.5 rounded bg-white hover:bg-[#e5e2e1] text-black font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow active:scale-95 disabled:opacity-50 select-none"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 text-black animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : isSavedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-black" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Main Body Columns */}
            <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden min-h-0">
              {/* Left Side: Live QR Showcase Stage */}
              <div className="w-full md:w-1/2 p-4 sm:p-5 bg-[#0e0e0e] flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-[#353535] relative overflow-y-auto">
                {/* Error Alert Box if Scan Verification Fails */}
                {verificationError && (
                  <div className="w-full mb-2 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-md flex items-center justify-center gap-2 text-[11px] text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <p className="font-bold text-amber-400">Invalid — Not Saved</p>
                  </div>
                )}

                {/* QR Code Canvas Card Display */}
                <div
                  className="w-full flex-1 flex flex-col items-center justify-center p-4 rounded-lg border border-[#353535] transition-all relative my-1 shadow-md"
                  style={{ backgroundColor: bgColor }}
                >
                  <div ref={containerRef} className="relative group transition-all duration-300 p-1 rounded-md">
                    <QrcodeCanvas
                      value={publicUrl}
                      size={210}
                      color={{
                        body: bodyColor,
                        eyes: eyesColor,
                      }}
                      variant={{
                        body: bodyVariant,
                        eyes: eyesVariant,
                      }}
                      colorEffect={{
                        body: bodyEffect,
                        eyes: eyesEffect,
                      }}
                      image={
                        logoBase64 && logoBase64.startsWith("data:")
                          ? {
                            src: logoBase64,
                            width: Math.min(logoSize, 44),
                            height: Math.min(logoSize, 44),
                            overlap: true,
                          }
                          : undefined
                      }
                      margin={8}
                      padding={8}
                    />
                  </div>

                  {/* Handle & Title Display */}
                  <div className="mt-2 text-center space-y-0.5">
                    <p className="text-xs font-semibold tracking-tight text-white">@{username}</p>
                    <p className="text-[10px] text-[#8e9192] font-mono truncate max-w-[190px] mx-auto">{publicUrl}</p>
                  </div>
                </div>

                {/* Action Buttons (Download / Copy PNG when saved) */}
                {isSavedSuccess && (
                  <div className="w-full pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadPng}
                        className="py-1.5 px-2 bg-[#20201f] hover:bg-[#2a2a2a] text-[#e5e2e1] border border-[#353535] font-semibold text-[11px] rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-[#8e9192]" />
                        <span>Download PNG</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyImage}
                        className="py-1.5 px-2 bg-[#20201f] hover:bg-[#2a2a2a] text-[#e5e2e1] border border-[#353535] font-semibold text-[11px] rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {copiedImage ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#8e9192]" />
                        )}
                        <span>{copiedImage ? "Copied" : "Copy PNG"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Creator Customization Studio Controls */}
              <div className="w-full md:w-1/2 p-4 sm:p-5 flex flex-col justify-between bg-[#131313] overflow-y-auto max-h-[520px] md:max-h-none">

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1 bg-[#1c1b1b] p-1 rounded-md border border-[#353535] mb-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("presets")}
                  className={cn(
                    "flex-1 py-1 text-xs font-semibold rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                    activeTab === "presets"
                      ? "bg-[#2a2a2a] text-white border border-[#444748] shadow-xs"
                      : "text-[#8e9192] hover:text-white"
                  )}
                >
                  {/* <Sparkles className="w-3.5 h-3.5 text-[#c4c0ff]" /> */}
                  <span>Presets</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("colors")}
                  className={cn(
                    "flex-1 py-1 text-xs font-semibold rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                    activeTab === "colors"
                      ? "bg-[#2a2a2a] text-white border border-[#444748] shadow-xs"
                      : "text-[#8e9192] hover:text-white"
                  )}
                >
                  {/* <Palette className="w-3.5 h-3.5 text-[#c4c0ff]" /> */}
                  <span>Colors</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("shapes")}
                  className={cn(
                    "flex-1 py-1 text-xs font-semibold rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                    activeTab === "shapes"
                      ? "bg-[#2a2a2a] text-white border border-[#444748] shadow-xs"
                      : "text-[#8e9192] hover:text-white"
                  )}
                >
                  {/* <Shapes className="w-3.5 h-3.5 text-[#c4c0ff]" /> */}
                  <span>Shapes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("logo")}
                  className={cn(
                    "flex-1 py-1 text-xs font-semibold rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                    activeTab === "logo"
                      ? "bg-[#2a2a2a] text-white border border-[#444748] shadow-xs"
                      : "text-[#8e9192] hover:text-white"
                  )}
                >
                  {/* <ImageIcon className="w-3.5 h-3.5 text-[#c4c0ff]" /> */}
                  <span>Logo</span>
                </button>
              </div>

              {/* Tab Content Area */}
              <div className="flex-1 space-y-3.5 overflow-y-auto pr-0.5">
                {/* TAB 1: PRESETS */}
                {activeTab === "presets" && (
                  <div className="space-y-3">
                    <p className="text-xs text-[#8e9192] font-medium">Scannable preset themes:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {QR_PRESETS.map((preset) => {
                        const isSelected = selectedPresetId === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleApplyPreset(preset)}
                            className={cn(
                              "p-2.5 rounded-md border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 relative overflow-hidden group",
                              isSelected
                                ? "bg-[#20201f] border-[#c4c0ff] ring-1 ring-[#c4c0ff]/40 shadow-sm"
                                : "bg-[#1c1b1b] border-[#353535] hover:border-[#8e9192] hover:bg-[#20201f]"
                            )}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-semibold text-white group-hover:text-[#c4c0ff] transition-colors">
                                {preset.name}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#c4c0ff]" />}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                                style={{ backgroundColor: preset.bodyColor }}
                                title="Body Color"
                              />
                              <div
                                className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                                style={{ backgroundColor: preset.eyesColor }}
                                title="Eyes Color"
                              />
                              <div
                                className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs ml-auto"
                                style={{ backgroundColor: preset.bgColor }}
                                title="Background Color"
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 2: COLORS */}
                {activeTab === "colors" && (
                  <div className="space-y-3">
                    {/* Body Color */}
                    <div className="space-y-2 bg-[#1c1b1b] p-3 rounded-md border border-[#353535]">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#e5e2e1]">QR Dots Body Color</label>
                        <span className="text-[10px] font-mono text-[#8e9192]">{bodyColor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bodyColor}
                          onChange={(e) => setBodyColor(e.target.value)}
                          className="w-7 h-7 rounded border border-[#353535] bg-transparent cursor-pointer"
                        />
                        <div className="flex items-center gap-1.5 flex-wrap flex-1">
                          {PRESET_COLORS.map((c) => (
                            <button
                              key={`body-${c}`}
                              type="button"
                              onClick={() => setBodyColor(c)}
                              className={cn(
                                "w-5 h-5 rounded-full border border-white/10 transition-transform cursor-pointer hover:scale-110",
                                bodyColor === c && "ring-2 ring-white scale-105"
                              )}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Eyes Color */}
                    <div className="space-y-2 bg-[#1c1b1b] p-3 rounded-md border border-[#353535]">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#e5e2e1]">Corner Eyes Color</label>
                        <span className="text-[10px] font-mono text-[#8e9192]">{eyesColor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={eyesColor}
                          onChange={(e) => setEyesColor(e.target.value)}
                          className="w-7 h-7 rounded border border-[#353535] bg-transparent cursor-pointer"
                        />
                        <div className="flex items-center gap-1.5 flex-wrap flex-1">
                          {PRESET_COLORS.map((c) => (
                            <button
                              key={`eyes-${c}`}
                              type="button"
                              onClick={() => setEyesColor(c)}
                              className={cn(
                                "w-5 h-5 rounded-full border border-white/10 transition-transform cursor-pointer hover:scale-110",
                                eyesColor === c && "ring-2 ring-white scale-105"
                              )}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Background Color */}
                    <div className="space-y-2 bg-[#1c1b1b] p-3 rounded-md border border-[#353535]">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#e5e2e1]">Canvas Background Color</label>
                        <span className="text-[10px] font-mono text-[#8e9192]">{bgColor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-7 h-7 rounded border border-[#353535] bg-transparent cursor-pointer"
                        />
                        <div className="flex items-center gap-1.5 flex-wrap flex-1">
                          {["#131313", "#1c1b1b", "#20201f", "#0e0e0e", "#ffffff", "#000000"].map((c) => (
                            <button
                              key={`bg-${c}`}
                              type="button"
                              onClick={() => setBgColor(c)}
                              className={cn(
                                "w-5 h-5 rounded-full border border-white/20 transition-transform cursor-pointer hover:scale-110",
                                bgColor === c && "ring-2 ring-white scale-105"
                              )}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: SHAPES & VARIANTS */}
                {activeTab === "shapes" && (
                  <div className="space-y-3">
                    {/* Body Pattern */}
                    <div className="space-y-2 bg-[#1c1b1b] p-3 rounded-md border border-[#353535]">
                      <label className="text-xs font-semibold text-[#e5e2e1] block">Body Module Pattern</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {BODY_VARIANTS.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setBodyVariant(v.id as VariantType)}
                            className={cn(
                              "py-1.5 text-xs rounded font-medium border transition-all cursor-pointer",
                              bodyVariant === v.id
                                ? "bg-[#c4c0ff]/15 border-[#c4c0ff] text-[#c4c0ff]"
                                : "bg-[#20201f] border-[#353535] text-[#8e9192] hover:text-white"
                            )}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Eyes Pattern */}
                    <div className="space-y-2 bg-[#1c1b1b] p-3 rounded-md border border-[#353535]">
                      <label className="text-xs font-semibold text-[#e5e2e1] block">Corner Eye Pattern</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {EYE_VARIANTS.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setEyesVariant(v.id as VariantType)}
                            className={cn(
                              "py-1.5 text-xs rounded font-medium border transition-all cursor-pointer",
                              eyesVariant === v.id
                                ? "bg-[#c4c0ff]/15 border-[#c4c0ff] text-[#c4c0ff]"
                                : "bg-[#20201f] border-[#353535] text-[#8e9192] hover:text-white"
                            )}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Gradient / Color Effect */}
                    <div className="space-y-2 bg-[#1c1b1b] p-3 rounded-md border border-[#353535]">
                      <label className="text-xs font-semibold text-[#e5e2e1] block">Gradient Color Effect</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {COLOR_EFFECTS.map((e) => (
                          <button
                            key={e.id}
                            type="button"
                            onClick={() => setBodyEffect(e.id as EffectType)}
                            className={cn(
                              "py-1.5 text-xs rounded font-medium border transition-all cursor-pointer truncate px-2 text-center",
                              bodyEffect === e.id
                                ? "bg-[#c4c0ff]/15 border-[#c4c0ff] text-[#c4c0ff]"
                                : "bg-[#20201f] border-[#353535] text-[#8e9192] hover:text-white"
                            )}
                          >
                            {e.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: CENTER LOGO */}
                {activeTab === "logo" && (
                  <div className="space-y-3">
                    <div className="space-y-2 bg-[#1c1b1b] p-3 rounded-md border border-[#353535]">
                      <label className="text-xs font-semibold text-[#e5e2e1] block">Center Logo Overlay</label>
                      <div className="grid grid-cols-2 gap-2">
                        {profileImageUrl && (
                          <button
                            type="button"
                            onClick={() => setLogoType("avatar")}
                            className={cn(
                              "p-2 rounded-md border transition-all flex items-center gap-2 cursor-pointer text-xs font-semibold",
                              logoType === "avatar"
                                ? "bg-[#c4c0ff]/15 border-[#c4c0ff] text-white"
                                : "bg-[#20201f] border-[#353535] text-[#8e9192] hover:text-white"
                            )}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={profileImageUrl} alt="Avatar" className="w-4 h-4 rounded-full object-cover" />
                            <span>Profile Avatar</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setLogoType("anydm")}
                          className={cn(
                            "p-2 rounded-md border transition-all flex items-center gap-2 cursor-pointer text-xs font-semibold",
                            logoType === "anydm"
                              ? "bg-[#c4c0ff]/15 border-[#c4c0ff] text-white"
                              : "bg-[#20201f] border-[#353535] text-[#8e9192] hover:text-white"
                          )}
                        >
                          <div className="w-4 h-4 rounded-full bg-[#c4c0ff] text-black font-bold flex items-center justify-center text-[9px]">
                            A
                          </div>
                          <span>AnyDM Logos</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setLogoType("custom");
                            fileInputRef.current?.click();
                          }}
                          className={cn(
                            "p-2 rounded-md border transition-all flex items-center gap-2 cursor-pointer text-xs font-semibold",
                            logoType === "custom"
                              ? "bg-[#c4c0ff]/15 border-[#c4c0ff] text-white"
                              : "bg-[#20201f] border-[#353535] text-[#8e9192] hover:text-white"
                          )}
                        >
                          <Upload className="w-4 h-4 text-[#c4c0ff]" />
                          <span>Upload</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setLogoType("none")}
                          className={cn(
                            "p-2 rounded-md border transition-all flex items-center gap-2 cursor-pointer text-xs font-semibold",
                            logoType === "none"
                              ? "bg-[#c4c0ff]/15 border-[#c4c0ff] text-white"
                              : "bg-[#20201f] border-[#353535] text-[#8e9192] hover:text-white"
                          )}
                        >
                          <X className="w-4 h-4 text-[#8e9192]" />
                          <span>No Logo</span>
                        </button>
                      </div>
                    </div>

                    {/* Official AnyDM Logo Selector */}
                    {logoType === "anydm" && (
                      <div className="space-y-2 bg-[#1c1b1b] p-3 rounded-md border border-[#353535]">
                        <label className="text-xs font-semibold text-[#e5e2e1] block">Choose AnyDM Brand Logo</label>
                        <div className="grid grid-cols-2 gap-2">
                          {ANYDM_LOGOS.map((logo) => {
                            const isSelected = selectedAnyDmLogo === logo.path;
                            return (
                              <button
                                key={logo.id}
                                type="button"
                                onClick={() => setSelectedAnyDmLogo(logo.path)}
                                className={cn(
                                  "p-2 rounded border flex items-center gap-2 transition-all cursor-pointer text-xs",
                                  isSelected
                                    ? "bg-[#20201f] border-[#c4c0ff] text-white"
                                    : "bg-[#131313] border-[#353535] text-[#8e9192] hover:text-white"
                                )}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={logo.path} alt={logo.label} className="w-5 h-5 object-contain rounded" />
                                <span className="truncate">{logo.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Cloudinary Custom Logo Upload */}
                    {logoType === "custom" && (
                      <div className="space-y-2 bg-[#1c1b1b] p-3 rounded-md border border-[#353535]">
                        <label className="text-xs font-semibold text-[#e5e2e1] block">Upload Custom Brand Logo</label>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleCustomLogoFileChange}
                          className="hidden"
                        />

                        {customLogoUrl ? (
                          <div className="flex items-center justify-between bg-[#131313] p-2.5 rounded border border-[#353535]">
                            <div className="flex items-center gap-2.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={customLogoUrl} alt="Custom Logo" className="w-8 h-8 rounded object-cover border border-[#353535]" />

                            </div>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-2 py-1 bg-[#20201f] hover:bg-[#2a2a2a] text-xs font-medium text-white border border-[#353535] rounded transition-all cursor-pointer"
                            >
                              Replace
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingLogo}
                            className="w-full p-4 border-2 border-dashed border-[#353535] hover:border-[#c4c0ff]/60 bg-[#131313] rounded-md transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center group"
                          >
                            {uploadingLogo ? (
                              <>
                                <Loader2 className="w-5 h-5 text-[#c4c0ff] animate-spin" />
                                <span className="text-xs font-semibold text-[#c4c0ff]">Uploading image... ({uploadProgress}%)</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-5 h-5 text-[#8e9192] group-hover:text-[#c4c0ff] transition-colors" />
                                <span className="text-xs font-semibold text-white">Click to Upload Image</span>
                                <span className="text-[10px] text-[#8e9192]">PNG, JPG, WebP, SVG</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Logo Size Slider */}
                    {logoType !== "none" && (
                      <div className="space-y-2 bg-[#1c1b1b] p-3 rounded-md border border-[#353535]">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-[#e5e2e1]">Center Logo Size</label>
                          <span className="text-[10px] font-mono text-[#8e9192]">{logoSize}px</span>
                        </div>
                        <input
                          type="range"
                          min={24}
                          max={48}
                          step={2}
                          value={Math.min(logoSize, 48)}
                          onChange={(e) => setLogoSize(Number(e.target.value))}
                          className="w-full accent-[#c4c0ff] cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
