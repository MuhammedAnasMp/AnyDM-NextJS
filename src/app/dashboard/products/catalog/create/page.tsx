"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Plus,
  Check,
  Image as ImageIcon,
  Video as VideoIcon,
  HelpCircle,
  Globe,
  Sparkles,
  DollarSign,
  RefreshCw,
  X,
  Layers,
  Link as LinkIcon,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
  Heart,
  Send,
  MoreHorizontal,
  Bookmark,
  ShoppingBag,
  Sliders,
  Filter,
  UserCheck,
  Bot
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import api from "@/lib/services/api.service";
import Toast from "@/components/Toast";
import axios from "axios";
import { cn } from "@/lib/utils";
import InstagramImportModal from "@/components/InstagramImportModal";
import InstagramIcon from "@/components/ui/InstagramIcon";
import { createPortal } from "react-dom";

interface MediaItem {
  id: string;
  url: string;
  thumbnail_url?: string;
  type: "IMAGE" | "VIDEO";
  isMain?: boolean;
  cloudinary_metadata?: any;
}

export default function ProductCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Query Parameters
  const editId = searchParams.get("edit");
  const sourceParam = searchParams.get("source");
  const mediaIdParam = searchParams.get("media_id");
  const mediaUrlParam = searchParams.get("media_url");
  const mediaTypeParam = searchParams.get("media_type");
  const captionParam = searchParams.get("caption");
  const thumbnailUrlParam = searchParams.get("thumbnail_url");

  const isEditing = !!editId;

  // Form Fields State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [currency, setCurrency] = useState("₹");
  const [category, setCategory] = useState("Apparel");
  const [stock, setStock] = useState("10");
  const [location, setLocation] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
  const [metadata, setMetadata] = useState<{ key: string; value: string }[]>([]);

  // Category State
  const [categories, setCategories] = useState<string[]>(["Apparel", "Electronics", "Accessories", "Books", "Sports", "Other"]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Media Management
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mainMedia = useMemo(() => {
    return mediaList.find(m => m.isMain) || mediaList[0] || null;
  }, [mediaList]);

  // Redux connected user & Instagram context
  const appUser = useSelector((state: RootState) => state.auth.user);
  const instagramAccounts = useSelector((state: RootState) => state.auth.instagramAccounts);
  const activeAccount = instagramAccounts.find(acc => acc.id === appUser?.active_instagram_account_id) || instagramAccounts[0];

  // Source Type
  const [productSource, setProductSource] = useState<"instagram" | "manual">("manual");
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [instagramPermalink, setInstagramPermalink] = useState<string | null>(null);

  // Instagram Auto-Publishing State
  const [postToInstagram, setPostToInstagram] = useState(false);
  const [instagramPostType, setInstagramPostType] = useState<"CAROUSEL" | "REELS" | "IMAGE" | "STORIES">("REELS");
  const [instagramScheduleMode, setInstagramScheduleMode] = useState<"now" | "later">("now");
  const [instagramScheduleTime, setInstagramScheduleTime] = useState("");
  const [instagramCustomCaption, setInstagramCustomCaption] = useState("");

  const availablePostFormats = useMemo(() => {
    const imageCount = mediaList.filter(m => m.type === "IMAGE").length;
    const videoCount = mediaList.filter(m => m.type === "VIDEO").length;
    const totalCount = mediaList.length;

    const formats: { value: "CAROUSEL" | "REELS" | "IMAGE" | "STORIES"; label: string; desc?: string }[] = [];

    if (totalCount >= 2) {
      formats.push({
        value: "CAROUSEL",
        label: `📸 Carousel (${totalCount})`,
        desc: "Multi-media swipeable album"
      });
    }
    if (videoCount > 0) {
      formats.push({
        value: "REELS",
        label: "🎥 Reel",
        desc: "Published as an Instagram Reel"
      });
    }
    if (imageCount > 0) {
      formats.push({
        value: "IMAGE",
        label: "🖼️ Post",
        desc: "Published as a single photo post"
      });
    }
    formats.push({
      value: "STORIES",
      label: "📱 Story",
      desc: "Published to 24hr Story"
    });

    return formats;
  }, [mediaList]);

  // Sync post type when media is uploaded or changed
  useEffect(() => {
    if (mediaList.length >= 2) {
      setInstagramPostType("CAROUSEL");
    } else if (mediaList[0]?.type === "VIDEO") {
      setInstagramPostType("REELS");
    } else if (mediaList[0]?.type === "IMAGE") {
      setInstagramPostType("IMAGE");
    }
  }, [mediaList.length, mediaList[0]?.type]);

  // Instagram Comment-to-DM Automation State
  const [createAutomation, setCreateAutomation] = useState(true);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [automationKeywords, setAutomationKeywords] = useState("PRICE, BUY, LINK");
  const [keywordInput, setKeywordInput] = useState("");
  const [automationMatchType, setAutomationMatchType] = useState<"contains" | "equals" | "any">("contains");
  const [automationDmFormat, setAutomationDmFormat] = useState<"generic_template" | "text">("generic_template");
  const [automationDmMessage, setAutomationDmMessage] = useState("");
  const [automationCardImage, setAutomationCardImage] = useState<string>("");
  const [automationCommentReplies, setAutomationCommentReplies] = useState<string[]>([
    "Sent you a DM with the product link! 🛍️ Check your inbox!"
  ]);
  const [followerGate, setFollowerGate] = useState(false);
  const [followerGateMessages, setFollowerGateMessages] = useState<string[]>([
    "Please follow our page to unlock this offer! ✨"
  ]);
  const [modalPreviewTab, setModalPreviewTab] = useState<"dm" | "comment">("dm");
  const [automationMobileView, setAutomationMobileView] = useState<"edit" | "preview">("edit");

  const availableCardImages = useMemo(() => {
    const images: { url: string; label: string }[] = [];
    mediaList.forEach((item, i) => {
      if (item.type === "IMAGE" && item.url) {
        images.push({ url: item.url, label: `Image ${i + 1}` });
      } else if (item.thumbnail_url) {
        images.push({ url: item.thumbnail_url, label: `Thumbnail ${i + 1}` });
      }
    });
    if (images.length === 0 && mediaList[0]?.url) {
      images.push({ url: mediaList[0].url, label: "Main Media" });
    }
    return images;
  }, [mediaList]);

  const effectiveCardImage = useMemo(() => {
    if (automationCardImage) return automationCardImage;
    return availableCardImages[0]?.url || "";
  }, [automationCardImage, availableCardImages]);

  const handleAddCommentReplyVariation = () => {
    const defaultTemplates = [
      "Check your inbox! ✨ Sent you the link!",
      "Sent over all the product details in your DM! 📬",
      "Just messaged you! 📩 Check your message request tab.",
      "Check your messages for full details! 👇"
    ];
    const nextMsg = defaultTemplates[automationCommentReplies.length % defaultTemplates.length];
    setAutomationCommentReplies([...automationCommentReplies, nextMsg]);
  };

  const handleUpdateCommentReplyVariation = (index: number, val: string) => {
    const updated = [...automationCommentReplies];
    updated[index] = val;
    setAutomationCommentReplies(updated);
  };

  const handleRemoveCommentReplyVariation = (index: number) => {
    if (automationCommentReplies.length <= 1) return;
    setAutomationCommentReplies(automationCommentReplies.filter((_, idx) => idx !== index));
  };

  const handleAddMessageVariation = () => {
    setFollowerGateMessages([...followerGateMessages, ""]);
  };

  const handleUpdateMessageVariation = (index: number, val: string) => {
    const updated = [...followerGateMessages];
    updated[index] = val;
    setFollowerGateMessages(updated);
  };

  const handleRemoveMessageVariation = (index: number) => {
    setFollowerGateMessages(followerGateMessages.filter((_, idx) => idx !== index));
  };

  const activeKeywords = automationKeywords
    ? automationKeywords.split(",").map(k => k.trim()).filter(Boolean)
    : [];

  const handleAddKeyword = (e?: React.KeyboardEvent) => {
    if (e && e.key !== "Enter") return;
    if (e) e.preventDefault();
    const trimmed = keywordInput.trim();
    if (!trimmed) return;
    if (!activeKeywords.map(k => k.toUpperCase()).includes(trimmed.toUpperCase())) {
      const updated = [...activeKeywords, trimmed];
      setAutomationKeywords(updated.join(", "));
    }
    setKeywordInput("");
  };

  const handleAddKeywordBtn = () => {
    const trimmed = keywordInput.trim();
    if (!trimmed) return;
    if (!activeKeywords.map(k => k.toUpperCase()).includes(trimmed.toUpperCase())) {
      const updated = [...activeKeywords, trimmed];
      setAutomationKeywords(updated.join(", "));
    }
    setKeywordInput("");
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    const updated = activeKeywords.filter(k => k.toLowerCase() !== kwToRemove.toLowerCase());
    setAutomationKeywords(updated.join(", "));
  };

  const handleTogglePostToInstagram = () => {
    if (!postToInstagram) {
      setPostToInstagram(true);
      setShowAutomationModal(true);
    } else {
      setPostToInstagram(false);
    }
  };

  // Variant States
  const [variants, setVariants] = useState<string[]>(["Black", "Olive", "S", "M", "L", "XL"]);
  const [newVariant, setNewVariant] = useState("");

  // Instagram Modal State
  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Toast States
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/products/categories/");
        if (response.data && Array.isArray(response.data)) {
          const fetchedCategories = response.data.map((c: any) => c.name);
          setCategories(prev => Array.from(new Set([...prev, ...fetchedCategories])));
        }
      } catch (e) {
        console.warn("Failed to fetch user categories:", e);
      }
    };
    fetchCategories();
  }, []);

  // Hydration of Edit or Instagram imports
  useEffect(() => {
    if (isEditing) {
      loadProductForEditing();
    } else if (sourceParam === "instagram" && mediaUrlParam) {
      setProductSource("instagram");
      setSourceId(mediaIdParam);

      if (captionParam) {
        setDescription(captionParam);
        const croppedTitle = captionParam.split(/[.!?]/)[0].trim();
        setTitle(croppedTitle.length > 50 ? croppedTitle.slice(0, 47) + "..." : croppedTitle);
      }

      // Read selected media details from sessionStorage
      let storedMedia: any = null;
      try {
        const stored = sessionStorage.getItem("instagram_selected_media");
        if (stored) {
          storedMedia = JSON.parse(stored);
          if (storedMedia.permalink) {
            setInstagramPermalink(storedMedia.permalink);
          }
          setTimeout(() => sessionStorage.removeItem("instagram_selected_media"), 500);
        }
      } catch (e) { /* ignore parse error */ }

      if (storedMedia) {
        handleImportInstagramMedia(storedMedia);
      } else {
        handleImportInstagramMedia({
          id: mediaIdParam,
          media_url: mediaUrlParam,
          thumbnail_url: thumbnailUrlParam,
          media_type: mediaTypeParam,
          caption: captionParam
        });
      }
    }
  }, [editId, sourceParam]);

  const loadProductForEditing = async () => {
    setInitialLoading(true);
    let product: any = null;

    try {
      const response = await api.get(`/products/${editId}/`);
      if (response.data) {
        product = response.data;
      }
    } catch (err) {
      console.warn("Backend product fetch failed. Trying local storage backup:", err);
    }

    if (!product) {
      const cached = localStorage.getItem("anydm_products");
      const productsList = cached ? JSON.parse(cached) : [];
      product = productsList.find((p: any) => String(p.id) === String(editId));
    }

    if (product) {
      setTitle(product.title || "");
      setDescription(product.description || "");
      setPrice(product.price ? product.price.toString() : "");
      setOriginalPrice(product.original_price ? product.original_price.toString() : "");
      setCurrency(product.currency || "₹");
      setCategory(product.category || "Apparel");
      setStock(product.stock ? product.stock.toString() : "10");
      setLocation(product.location || "");
      setNegotiable(product.negotiable || false);
      setStatus(product.status || "PUBLISHED");
      setProductSource(product.source === "instagram" ? "instagram" : "manual");
      setSourceId(product.source_id || null);
      setInstagramPermalink(product.instagram_permalink || null);

      if (product.gallery && product.gallery.length > 0) {
        setMediaList(product.gallery.map((g: any, i: number) => {
          const isMainMedia = product.media_url ? g.media_url === product.media_url : (g.order === 0 || i === 0);
          return {
            id: g.id || `gallery_${i}_${Date.now()}`,
            url: g.media_url,
            type: g.media_type || "IMAGE",
            isMain: isMainMedia,
            thumbnail_url: g.thumbnail_url,
            cloudinary_metadata: g.cloudinary_metadata || null
          };
        }));
      } else if (product.media_url) {
        setMediaList([
          {
            id: "main_edit_media",
            url: product.media_url,
            type: product.media_type || "IMAGE",
            isMain: true
          }
        ]);
      } else {
        setMediaList([]);
      }

      if (product.metadata && typeof product.metadata === "object") {
        const metadataArray = Object.entries(product.metadata)
          .filter(([key]) => key !== "variants")
          .map(([key, value]) => ({
            key,
            value: String(value)
          }));
        setMetadata(metadataArray);
      }
    } else {
      showToast("Product not found", "error");
      router.push("/dashboard/products/catalog");
    }
    setInitialLoading(false);
  };

  const [dragActive, setDragActive] = useState(false);
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      performRealCloudinaryUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      performRealCloudinaryUpload(files[0]);
      e.target.value = "";
    }
  };

  const performRealCloudinaryUpload = (file: File) => {
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
          const secureUrl = response.secure_url;
          const isVideo = file.type.startsWith("video/");

          let thumbnailUrl = undefined;
          if (isVideo) {
            thumbnailUrl = secureUrl.replace(/\.[^/.]+$/, ".jpg");
          }

          const newMedia: MediaItem = {
            id: response.public_id || `cloudinary_${Date.now()}`,
            url: secureUrl,
            thumbnail_url: thumbnailUrl,
            type: isVideo ? "VIDEO" : "IMAGE",
            isMain: mediaList.length === 0,
            cloudinary_metadata: response
          };

          setMediaList((prevList) => {
            const hasMain = prevList.some(item => item.isMain);
            if (!hasMain) {
              newMedia.isMain = true;
            }
            return [...prevList, newMedia];
          });

          showToast(`Uploaded "${file.name}" successfully`, "success");
        } catch (e) {
          showToast("Failed to process uploaded file", "error");
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

  const removeMediaItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = mediaList.filter(item => item.id !== id);
    if (mediaList.find(item => item.id === id)?.isMain && updated.length > 0) {
      updated[0].isMain = true;
    }
    setMediaList(updated);
    showToast("Media item removed", "info");
  };

  const setMainMedia = (id: string) => {
    const updated = mediaList.map(item => ({
      ...item,
      isMain: item.id === id
    }));
    setMediaList(updated);
    showToast("Main visual cover image updated", "info");
  };

  const loadMediaAsBlob = async (url: string): Promise<Blob> => {
    if (url.startsWith("http") && !url.includes("localhost") && !url.includes("127.0.0.1")) {
      try {
        const response = await api.get("/accounts/instagram/proxy-media/", {
          params: { url },
          responseType: "blob"
        });
        if (response.data) {
          return response.data;
        }
      } catch (err) {
        console.error("[loadMediaAsBlob] Proxy media fetch failed, trying direct/canvas load fallbacks:", err);
      }
    }

    try {
      const res = await fetch(url);
      if (res.ok) return await res.blob();
    } catch (e) {
      console.warn("Direct fetch failed, trying canvas load...");
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to convert image to blob"));
          }, "image/jpeg", 0.95);
        } else {
          reject(new Error("Failed to get 2D context"));
        }
      };
      img.onerror = () => {
        reject(new Error("Failed to load image in browser"));
      };
      img.src = url;
    });
  };

  const uploadBlobToCDN = async (blob: Blob, filename: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", blob, filename);
    formData.append("upload_preset", "any_dm_product_upload");

    const response = await fetch("https://api.cloudinary.com/v1_1/dx5bqewfx/auto/upload", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary upload failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.secure_url;
  };

  async function handleImportInstagramMedia(item: any) {
    setUploading(true);
    setUploadProgress(0);
    try {
      let assetsToUpload: { id: string; url: string; thumbnail_url?: string; media_type: string }[] = [];

      if (item.media_type === "CAROUSEL_ALBUM" && item.children?.data && item.children.data.length > 0) {
        assetsToUpload = item.children.data.map((c: any, index: number) => ({
          id: `${c.id}_${Date.now()}_${index}`,
          url: c.media_url || c.thumbnail_url,
          thumbnail_url: c.thumbnail_url,
          media_type: c.media_type
        }));
      } else {
        assetsToUpload = [{
          id: `${item.id}_${Date.now()}`,
          url: item.media_url || item.thumbnail_url,
          thumbnail_url: item.thumbnail_url,
          media_type: item.media_type
        }];
      }

      const uploadedAssets: MediaItem[] = [];
      const total = assetsToUpload.length;

      for (let i = 0; i < total; i++) {
        const asset = assetsToUpload[i];
        try {
          const blob = await loadMediaAsBlob(asset.url);
          const isVideo = asset.media_type === "VIDEO";
          const fileExt = isVideo ? "mp4" : "jpg";
          const filename = `${asset.id}.${fileExt}`;

          const secureUrl = await uploadBlobToCDN(blob, filename);

          let thumbnailUrl = undefined;
          if (isVideo) {
            thumbnailUrl = secureUrl.replace(/\.[^/.]+$/, ".jpg");
          }

          uploadedAssets.push({
            id: asset.id,
            url: secureUrl,
            thumbnail_url: thumbnailUrl,
            type: isVideo ? "VIDEO" : "IMAGE"
          });
        } catch (err) {
          console.error(`Failed to upload Instagram asset ${asset.id} to Cloudinary:`, err);
        }
        setUploadProgress(Math.round(((i + 1) / total) * 100));
      }

      if (uploadedAssets.length === 0) {
        throw new Error("Could not upload any Instagram media to Cloudinary.");
      }

      setMediaList((prev) => {
        const hasMain = prev.some(m => m.isMain);
        const newItems = uploadedAssets.map((asset, i) => ({
          ...asset,
          isMain: !hasMain && i === 0
        }));
        return [...prev, ...newItems];
      });

      if (item.caption) {
        if (!description) {
          setDescription(item.caption);
        }
        if (!title) {
          const croppedTitle = item.caption.split(/[.!?]/)[0].trim();
          setTitle(croppedTitle.length > 50 ? croppedTitle.slice(0, 47) + "..." : croppedTitle);
        }
      }

      showToast("Instagram media assets uploaded successfully", "success");
    } catch (e: any) {
      console.error("Asset import error:", e);
      showToast(e.message || "Failed to upload Instagram assets", "error");
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setCategory(newCategory.trim());
      setNewCategory("");
      setIsAddingCategory(false);
      showToast("Category added", "success");
    }
  };

  const handleAddVariant = () => {
    if (newVariant.trim() && !variants.includes(newVariant.trim())) {
      setVariants([...variants, newVariant.trim()]);
      setNewVariant("");
    }
  };

  const handleRemoveVariant = (v: string) => {
    setVariants(variants.filter(item => item !== v));
  };

  const handleSave = async (submitStatus: "PUBLISHED" | "DRAFT") => {
    if (!title) {
      showToast("Product title is required", "error");
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      showToast("Specify a valid price", "error");
      return;
    }
    if (mediaList.length === 0) {
      showToast("Upload or select at least one media item", "error");
      return;
    }

    setLoading(true);
    const mainMedia = mediaList.find(item => item.isMain) || mediaList[0];

    const validMetadata = metadata.filter(item => item.key.trim() && item.value.trim());
    const metadataObject: Record<string, string> = {};
    validMetadata.forEach(item => {
      metadataObject[item.key.trim()] = item.value.trim();
    });

    const productPayload = {
      title,
      description,
      price: parseFloat(price),
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      metadata: { ...metadataObject, variants: variants.join(",") },
      currency,
      category,
      stock: parseInt(stock) || 0,
      location,
      negotiable,
      status: submitStatus,
      media_url: mainMedia.url,
      media_type: mainMedia.type,
      source: productSource,
      source_id: sourceId || mediaIdParam || null,
      media_id: sourceId || mediaIdParam || null,
      instagram_permalink: instagramPermalink || null,
      cloudinary_metadata: mainMedia.cloudinary_metadata || null,
      post_to_instagram: !isEditing && postToInstagram,
      instagram_post_type: instagramPostType,
      instagram_schedule_time: instagramScheduleMode === "later" && instagramScheduleTime ? new Date(instagramScheduleTime).toISOString() : null,
      instagram_caption: instagramCustomCaption || undefined,
      create_automation: createAutomation,
      automation_keywords: automationKeywords,
      automation_match_type: automationMatchType,
      automation_dm_format: automationDmFormat,
      automation_dm_message: automationDmMessage || undefined,
      automation_card_image_url: effectiveCardImage || undefined,
      automation_comment_reply: automationCommentReplies[0] || "Sent you a DM with the product link! 🛍️ Check your inbox!",
      automation_comment_replies: automationCommentReplies.filter(m => m.trim()),
      follower_gate: followerGate,
      follower_gate_messages: followerGateMessages.filter(m => m.trim()),
      gallery: mediaList.map((item, idx) => ({
        media_url: item.url,
        thumbnail_url: item.thumbnail_url || null,
        media_type: item.type,
        order: idx,
        cloudinary_metadata: item.cloudinary_metadata || null
      })),
      updated_at: new Date().toISOString()
    };

    try {
      if (isEditing) {
        await api.patch(`/products/${editId}/`, productPayload);
      } else {
        await api.post("/products/", productPayload);
      }

      updateLocalStorage(submitStatus, productPayload);
      showToast(isEditing ? "Product updated successfully" : "Product created successfully", "success");

      setTimeout(() => {
        router.push("/dashboard/products/catalog");
      }, 1000);
    } catch (err: any) {
      if (err.response && err.response.status === 400 && err.response.data && err.response.data.source_id) {
        showToast(err.response.data.source_id, "error");
        setLoading(false);
        return;
      }
      console.warn("Backend API unreachable. Syncing product changes locally.");
      updateLocalStorage(submitStatus, productPayload);
      showToast(isEditing ? "Product updated locally" : "Product created locally", "success");

      setTimeout(() => {
        router.push("/dashboard/products/catalog");
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const updateLocalStorage = (submitStatus: "PUBLISHED" | "DRAFT", productPayload: any) => {
    const cached = localStorage.getItem("anydm_products");
    let productsList = cached ? JSON.parse(cached) : [];

    if (isEditing) {
      productsList = productsList.map((p: any) =>
        String(p.id) === String(editId) ? { ...p, ...productPayload, id: editId } : p
      );
    } else {
      const newId = `p_local_${Date.now()}`;
      productsList.unshift({
        ...productPayload,
        id: newId
      });
    }
    localStorage.setItem("anydm_products", JSON.stringify(productsList));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-[#e5e2e1] pb-16 space-y-8 font-sans"
    >
      {/* Header & Actions */}
      <div className="sticky top-[100px] z-30 flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 pt-6 -mt-6 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-[#444748]/10 bg-[#131313]">
        <div className="hidden sm:block">
          <nav className="flex items-center gap-2 text-[#c4c7c8] text-xs mb-2">
            <Link href="/dashboard/products/catalog" className="hover:text-white transition-colors">
              Products
            </Link>
            <ChevronRight size={12} className="text-[#8e9192]" strokeWidth={1.75} />
            <span className="text-white">{isEditing ? "Edit product" : "Create product"}</span>
          </nav>
          <h2 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
            {isEditing ? `Edit: ${title || "Product"}` : "Create new product"}
            {!isEditing && productSource === "instagram" && (
              <Sparkles size={18} className="text-white/40 animate-pulse" strokeWidth={1.75} />
            )}
          </h2>
        </div>
        <div className="flex gap-2 text-xs w-full sm:w-auto justify-end">
          <button
            onClick={() => router.push("/dashboard/products/catalog")}
            className="px-4 py-2 rounded-[4px] bg-transparent border border-[#444748] text-[#e5e2e1] font-medium hover:bg-[#1c1b1b] transition-colors"
          >
            Discard
          </button>
          <button
            disabled={loading}
            onClick={() => handleSave(status)}
            className="px-4 py-2 rounded-[4px] bg-white text-[#131313] font-semibold hover:bg-[#e5e2e1] transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : isEditing ? "Save updates" : "Create product"}
          </button>
        </div>
      </div>

      {initialLoading ? (
        <div className="py-20 text-center text-[#c4c7c8] font-medium">
          <RefreshCw size={24} className="animate-spin text-white mx-auto mb-4" strokeWidth={1.75} />
          Loading product details...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Form Fields */}
          <div className="lg:col-span-8 space-y-10">

            {/* Media Assets Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-white">Media assets</h3>
                  <p className="text-[11px] text-[#c4c7c8]/70 mt-0.5">
                    Click any image to set it as cover. The first image is the default cover.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInstagramModal(true)}
                    className="text-[#e5e2e1] bg-[#1c1b1b] border border-[#444748]/60 hover:bg-[#1c1b1b] px-3 py-1.5 rounded-[4px] flex items-center gap-1.5 text-xs font-medium transition-colors"
                  >
                    <InstagramIcon className="w-4 h-4 text-pink-500" />
                    <span>Instagram media</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#e5e2e1] bg-[#1c1b1b] border border-[#444748]/60 hover:bg-[#1c1b1b] px-3 py-1.5 rounded-[4px] flex items-center gap-1.5 text-xs font-medium transition-colors"
                  >
                    <Plus size={14} strokeWidth={1.75} /> Media
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,video/*"
                />
              </div>

              {/* Recessed Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border border-dashed rounded-[4px] p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#1c1b1b]",
                  dragActive ? "border-white" : "border-[#444748]/60 hover:border-[#8e9192]",
                  mediaList.length === 0 ? "h-36" : "py-4"
                )}
              >
                <Upload size={20} className="text-[#8e9192] mb-1.5" strokeWidth={1.75} />
                <p className="text-xs text-[#e5e2e1] font-medium">
                  Drag and drop assets here, or click to upload
                </p>
                <p className="text-[10px] text-[#8e9192] mt-0.5">Supports PNG, JPG, JPEG, and MP4 files</p>
              </div>

              {uploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[#c4c7c8]">
                    <span>Uploading asset...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1 bg-[#1c1b1b] rounded-full overflow-hidden border border-[#444748]/20">
                    <div className="h-full bg-white transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              {/* Media Grid */}
              {mediaList.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mediaList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setMainMedia(item.id)}
                      className={cn(
                        "relative aspect-square rounded-[4px] overflow-hidden border cursor-pointer group transition-all bg-[#1c1b1b]",
                        item.isMain ? "border-white scale-[0.98]" : "border-[#444748]/30 hover:border-[#444748]"
                      )}
                    >
                      <img
                        src={item.thumbnail_url || item.url}
                        className="w-full h-full object-cover"
                        alt="Product visual"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMWYyOTM3Ij48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+';
                        }}
                      />
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button
                          onClick={(e) => removeMediaItem(item.id, e)}
                          className="p-1 bg-[#131313] hover:bg-[#1c1b1b] text-red-400 rounded border border-[#444748]"
                        >
                          <Trash2 size={12} strokeWidth={1.75} />
                        </button>
                      </div>

                      {item.isMain && (
                        <div className="absolute bottom-1 right-1 bg-white text-[#131313] text-[9px] font-semibold px-1 rounded-[2px] shadow">
                          Cover
                        </div>
                      )}

                      <div className="absolute top-1 left-1 bg-[#131313]/90 p-1 rounded border border-[#444748]/30 shadow-sm flex items-center justify-center">
                        {item.type === "VIDEO" ? <VideoIcon size={12} strokeWidth={1.75} /> : <ImageIcon size={12} strokeWidth={1.75} />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hairline Section Separator */}
            <div className="border-t border-[#444748]/20" />

            {/* Core Details Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wide text-white">Core details</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#c4c7c8] block mb-1.5 font-medium">Product title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    type="text"
                    placeholder="Enter product title"
                    className="w-full bg-[#1c1b1b] border border-[#444748]/60 rounded-[4px] px-3 py-2 text-sm focus:border-white outline-none transition-colors text-white placeholder:text-[#8e9192]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-[#c4c7c8] block mb-1.5 font-medium">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-[#1c1b1b] border border-[#444748]/60 rounded-[4px] px-3 py-2 text-sm focus:border-white outline-none transition-colors text-white cursor-pointer"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="KWD">KWD (KWD)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="AED">AED (AED)</option>
                      <option value="SAR">SAR (SAR)</option>
                      <option value="BHD">BHD (BHD)</option>
                      <option value="OMR">OMR (OMR)</option>
                      <option value="QAR">QAR (QAR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-[#c4c7c8] block mb-1.5 font-medium">Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9192] text-xs font-semibold">{currency}</span>
                      <input
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        type="text"
                        placeholder="0.00"
                        className="w-full bg-[#1c1b1b] border border-[#444748]/60 rounded-[4px] pl-12 pr-3 py-2 text-sm focus:border-white outline-none transition-colors text-white placeholder:text-[#8e9192]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#c4c7c8] block mb-1.5 font-medium">Compare at price (original)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9192] text-xs font-semibold">{currency}</span>
                      <input
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        type="text"
                        placeholder="0.00"
                        className="w-full bg-[#1c1b1b] border border-[#444748]/60 rounded-[4px] pl-12 pr-3 py-2 text-sm focus:border-white outline-none transition-colors text-white placeholder:text-[#8e9192]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 px-3 bg-[#1c1b1b] rounded-[4px] border border-[#444748]/30">
                  <span className="text-xs text-[#c4c7c8]">Allow price negotiation</span>
                  <label className="relative flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={negotiable}
                      onChange={(e) => setNegotiable(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#131313] border border-[#444748] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-[#8e9192] after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-white peer-checked:after:bg-[#131313] peer-checked:after:border-white"></div>
                  </label>
                </div>

                <div>
                  <label className="text-xs text-[#c4c7c8] block mb-1.5 font-medium">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter detailed description"
                    className="w-full bg-[#1c1b1b] border border-[#444748]/60 rounded-[4px] px-3 py-2 text-sm h-36 focus:border-white outline-none transition-colors text-white placeholder:text-[#8e9192] leading-relaxed resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Sidebar Stack */}
          <div className="lg:col-span-4 space-y-10">

            {/* Social Context Panel */}
            {productSource === "instagram" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-semibold tracking-wider text-[#c4c7c8] ">Social context</h3>
                  <span className="text-[10px] bg-[#1c1b1b] text-white px-2 py-0.5 rounded-full border border-[#444748]/40 font-medium">
                    Instagram post
                  </span>
                </div>

                <div className="rounded-[4px] overflow-hidden border border-[#444748]/30 bg-[#1c1b1b] relative aspect-video mt-2">
                  <img
                    className="w-full h-full object-cover opacity-80"
                    src={mediaUrlParam || (mediaList[0]?.url)}
                    alt="Instagram Post visual"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between text-[10px]">
                    <span className="font-medium text-white flex items-center gap-1">
                      <img
                        src={activeAccount?.profile_picture_url || "https://static.vecteezy.com/system/resources/previews/002/318/271/non_2x/user-profile-icon-free-vector.jpg"}
                        className="w-4 h-4 rounded-full object-cover border border-white/20"
                        alt="Profile avatar"
                      />
                      @{activeAccount?.username || "instagram_feed"}
                    </span>
                    <span className="text-[#c4c7c8]">Imported feed</span>
                  </div>
                </div>
                {captionParam && (
                  <p className="text-xs text-[#c4c7c8] italic line-clamp-3">
                    "{captionParam}"
                  </p>
                )}
                {mediaIdParam && (
                  <a
                    href={`https://instagram.com/p/${mediaIdParam}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 border border-[#444748] rounded-[4px] text-xs font-medium text-white hover:bg-[#1c1b1b] transition-colors mt-2"
                  >
                    <LinkIcon size={12} strokeWidth={1.75} />
                    View original post
                  </a>
                )}
                <div className="border-t border-[#444748]/20 pt-4" />
              </div>
            )}


            {/* Inventory Management Panel */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold tracking-wider text-[#c4c7c8] ">Inventory & details</h3>

              <div className="space-y-3.5">
                <div>
                  <label className="text-[10px] text-[#c4c7c8] tracking-wider font-medium block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-[#1c1b1b] border border-[#444748]/60 rounded-[4px] px-3 py-2 text-xs focus:border-white outline-none text-white cursor-pointer"
                  >
                    <option className="bg-[#1c1b1b]" value="PUBLISHED">Published</option>
                    <option className="bg-[#1c1b1b]" value="DRAFT">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#c4c7c8] tracking-wider font-medium block mb-1">Category</label>
                  {!isAddingCategory ? (
                    <div className="flex gap-2">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="flex-1 bg-[#1c1b1b] border border-[#444748]/60 rounded-[4px] px-3 py-2 text-xs focus:border-white outline-none text-white cursor-pointer"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat} className="bg-[#1c1b1b]">{cat}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setIsAddingCategory(true)}
                        className="p-2 border border-[#444748]/60 rounded-[4px] bg-[#1c1b1b] text-[#c4c7c8] hover:text-white transition-colors"
                      >
                        <Plus size={14} strokeWidth={1.75} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Add category"
                        type="text"
                        className="flex-1 bg-[#1c1b1b] border border-[#444748]/60 rounded-[4px] px-3 py-1.5 text-xs focus:border-white outline-none text-white"
                      />
                      <button
                        onClick={handleAddCategory}
                        className="p-1.5 bg-white text-[#131313] rounded-[4px] hover:bg-[#eaeaea]"
                      >
                        <Check size={14} strokeWidth={1.75} />
                      </button>
                      <button
                        onClick={() => setIsAddingCategory(false)}
                        className="p-1.5 border border-[#444748] text-[#c4c7c8] rounded-[4px] hover:text-white bg-[#1c1b1b]"
                      >
                        <X size={14} strokeWidth={1.75} />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] text-[#c4c7c8] tracking-wider font-medium block mb-1">Stock quantity</label>
                  <input
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    type="number"
                    placeholder="10"
                    className="w-full bg-[#1c1b1b] border border-[#444748]/60 rounded-[4px] px-3 py-2 text-xs focus:border-white outline-none text-white placeholder:text-[#8e9192]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#c4c7c8] tracking-wider font-medium block mb-1">Physical location</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    type="text"
                    placeholder="e.g. Mumbai, IN"
                    className="w-full bg-[#1c1b1b] border border-[#444748]/60 rounded-[4px] px-3 py-2 text-xs focus:border-white outline-none text-white placeholder:text-[#8e9192]"
                  />
                </div>
              </div>

              {/* Active Variants Area */}
              <div className="mt-4 pt-4 border-t border-[#444748]/20 space-y-2">
                <label className="text-[10px] text-[#c4c7c8] tracking-wider font-medium block">Active variants</label>
                <div className="flex flex-wrap gap-1.5">
                  {variants.map(v => (
                    <span
                      key={v}
                      className="px-2.5 py-0.5 bg-[#1c1b1b] rounded-full text-[10px] font-medium border border-[#444748]/40 flex items-center gap-1 text-[#c4c7c8]"
                    >
                      {v}
                      <button
                        onClick={() => handleRemoveVariant(v)}
                        className="p-0.5 text-[#8e9192] hover:text-white hover:bg-white/5 rounded-full"
                      >
                        <X size={10} strokeWidth={2} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    value={newVariant}
                    onChange={(e) => setNewVariant(e.target.value)}
                    placeholder="e.g. Red, XL"
                    type="text"
                    className="flex-1 bg-[#1c1b1b] border border-[#444748]/60 rounded-[4px] px-3 py-1.5 text-xs focus:border-white outline-none text-white placeholder:text-[#8e9192]"
                  />
                  <button
                    onClick={handleAddVariant}
                    className="px-3 py-1 bg-white text-[#131313] font-semibold text-xs rounded-[4px] hover:bg-[#eaeaea] transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* ── Also Post to Instagram Card ── */}
            {!isEditing && (
              <div className="p-4 rounded-[4px] bg-[#1c1b1b] border border-[#444748]/40 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#c4c0ff]/10 border border-[#c4c0ff]/20 flex items-center justify-center text-[#c4c0ff]">
                      <InstagramIcon className="w-3.5 h-3.5 text-[#c4c0ff]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-tight">Also Post to Instagram</h4>
                      <p className="text-[10px] text-[#8e9192]">Auto-publish or schedule to feed</p>
                    </div>
                  </div>

                  {/* Bulletproof Toggle Switch - Opens popup modal when toggled on */}
                  <button
                    type="button"
                    onClick={handleTogglePostToInstagram}
                    className={cn(
                      "w-11 h-6 rounded-full relative transition-all duration-200 shrink-0 cursor-pointer border border-white/10",
                      postToInstagram ? "bg-[#b6b2ff]" : "bg-white/10"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-[2px] w-4.5 h-4.5 rounded-full shadow transition-all duration-200",
                        postToInstagram ? "left-[22px] bg-[#131313]" : "left-[2px] bg-white"
                      )}
                    />
                  </button>
                </div>

                {postToInstagram && (
                  <div className="space-y-2.5 pt-2.5 border-t border-[#444748]/20 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#8e9192]">Target Account:</span>
                      <span className="font-bold text-white font-mono">
                        @{activeAccount?.username || "connected_account"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#8e9192]">Format &amp; Mode:</span>
                      <span className="text-white font-medium">
                        {instagramPostType === "REELS" ? "🎬 Reel" : instagramPostType === "STORIES" ? "⏳ Story" : "📸 Post"} •{" "}
                        {instagramScheduleMode === "now" ? "Publish on Save" : "Scheduled"}
                      </span>
                    </div>

                    {createAutomation && (
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#8e9192]">Auto-DM:</span>
                        <span className="text-[#34d399] font-bold">
                          ✨ Active ({automationDmFormat === "generic_template" ? "🛍️ Product Card" : "📝 Text"})
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowAutomationModal(true)}
                      className="w-full py-2 px-3 rounded bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm mt-1"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#c4c0ff]" />
                      <span>Configure Instagram &amp; Automation</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Hairline Sidebar Separator */}
            <div className="border-t border-[#444748]/20" />

            {/* Technical Specification Details */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-semibold tracking-wider text-[#c4c7c8] ">Specifications</h3>
                <button
                  onClick={() => setMetadata([...metadata, { key: "", value: "" }])}
                  className="text-white bg-[#1c1b1b] hover:bg-[#1c1b1b] px-2.5 py-1 rounded-[4px] border border-[#444748]/60 text-[10px] font-medium transition-colors"
                >
                  + Add Spec
                </button>
              </div>

              <div className="space-y-2">
                {metadata.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={item.key}
                      onChange={(e) => {
                        const updated = [...metadata];
                        updated[i].key = e.target.value;
                        setMetadata(updated);
                      }}
                      placeholder="Spec (e.g. Size)"
                      className="flex-1 min-w-0 bg-[#1c1b1b] border border-[#444748]/60 rounded-[4px] px-3 py-1.5 text-xs text-white placeholder:text-[#8e9192]"
                    />
                    <input
                      value={item.value}
                      onChange={(e) => {
                        const updated = [...metadata];
                        updated[i].value = e.target.value;
                        setMetadata(updated);
                      }}
                      placeholder="Value (e.g. 10x20 inches)"
                      className="flex-1 min-w-0 bg-[#1c1b1b] border border-[#444748]/60 rounded-[4px] px-3 py-1.5 text-xs text-white placeholder:text-[#8e9192]"
                    />
                    <button
                      onClick={() => setMetadata(metadata.filter((_, idx) => idx !== i))}
                      className="p-1.5 border border-[#444748] hover:bg-[#1c1b1b] text-red-400 rounded-[4px] bg-[#1c1b1b]"
                    >
                      <X size={14} strokeWidth={1.75} />
                    </button>
                  </div>
                ))}
                {metadata.length === 0 && (
                  <p className="text-[11px] text-[#8e9192] text-center py-2">No custom details specified.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instagram Selector Modal */}
      <InstagramImportModal
        isOpen={showInstagramModal}
        onClose={() => setShowInstagramModal(false)}
        onSelectImport={handleImportInstagramMedia}
      />

      {/* ── CONDITIONCONTENTEDITOR-STYLE FULL MODAL POPUP PORTAL ── */}
      {mounted && showAutomationModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-hidden text-white font-inter">
          {/* Background Glows */}
          <div className="absolute w-[40vw] h-[40vw] rounded-full bg-[#c4c0ff] top-[-20%] left-[-20%] filter blur-[120px] opacity-[0.1] pointer-events-none z-0" />
          <div className="absolute w-[40vw] h-[40vw] rounded-full bg-[#636565] bottom-[-20%] right-[-20%] filter blur-[120px] opacity-[0.1] pointer-events-none z-0" />

          {/* Main Outer Modal Container */}
          <div className="w-full max-w-5xl h-[92vh] sm:h-[88vh] max-h-[880px] bg-[#131313]/90 backdrop-blur-3xl border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-[0_32px_64px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in duration-300 text-white relative z-10 font-inter">

            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-transparent">
              <div className="flex items-center gap-2.5 sm:gap-3.5">
                <div className="p-1.5 sm:p-2.5 bg-white/5 rounded-xl border border-white/10 shrink-0">
                  <InstagramIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-inter text-xs sm:text-sm md:text-lg font-bold text-white tracking-tight leading-tight">
                    Instagram Publishing &amp; Automation
                  </h2>
                  <span className="text-[10px] sm:text-xs text-zinc-400 font-medium tracking-wide block mt-0.5 sm:mt-1 leading-tight">
                    Configure post format, scheduling, trigger keywords, and instant DM product card
                  </span>
                </div>
              </div>

              {/* Header Action Controls */}
              <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAutomationModal(false)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded border border-white/10 text-zinc-300 font-semibold text-xs hover:bg-white/5 hover:text-white transition-all active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPostToInstagram(true);
                    setShowAutomationModal(false);
                    showToast("Instagram configuration applied", "success");
                  }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-white text-black font-bold text-xs hover:opacity-90 transition-all active:scale-95 flex items-center gap-1.5 shadow-lg shadow-white/5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Save
                </button>
              </div>
            </div>

            {/* Toggle Bar for Mobile View */}
            <div className="flex lg:hidden border-b border-white/10 bg-white/5 shrink-0">
              <button
                type="button"
                onClick={() => setAutomationMobileView("edit")}
                className={cn(
                  "flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all",
                  automationMobileView === "edit"
                    ? "text-white border-white bg-white/5"
                    : "text-zinc-400 border-transparent hover:text-zinc-200"
                )}
              >
                Edit Configuration
              </button>
              <button
                type="button"
                onClick={() => setAutomationMobileView("preview")}
                className={cn(
                  "flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all",
                  automationMobileView === "preview"
                    ? "text-white border-white bg-white/5"
                    : "text-zinc-400 border-transparent hover:text-zinc-200"
                )}
              >
                Live Preview
              </button>
            </div>

            {/* Modal Body: Split View */}
            <div className="flex-1 min-h-0 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/10 overflow-hidden">
              {/* LEFT: Instagram Live Phone Device Frame Mockup Preview */}
              <div
                className={cn(
                  "lg:w-[410px] bg-[#09090b] p-4 sm:p-6 flex flex-col items-center justify-center shrink-0 overflow-y-auto border-b lg:border-b-0 lg:border-r border-zinc-800",
                  automationMobileView === "preview" ? "flex" : "hidden lg:flex"
                )}
              >
                {/* Mode Switcher on top of phone */}
                <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl w-[240px] sm:w-[300px] mb-3">
                  <button
                    type="button"
                    onClick={() => setModalPreviewTab("dm")}
                    className={cn(
                      "flex-1 py-1.5 text-center rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-200 cursor-pointer",
                      modalPreviewTab === "dm"
                        ? "bg-white text-black shadow-md"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                    )}
                  >
                    {automationDmFormat === "generic_template" ? "🛍️ Product Card" : "📝 Plain Text DM"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalPreviewTab("comment")}
                    className={cn(
                      "flex-1 py-1.5 text-center rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-200 cursor-pointer",
                      modalPreviewTab === "comment"
                        ? "bg-white text-black shadow-md"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                    )}
                  >
                    💬 Comment
                  </button>
                </div>

                {/* Mobile Phone Mockup Body - Scaled down for mobile screens */}
                <div className="w-[240px] h-[460px] sm:w-[300px] sm:h-[580px] rounded-[30px] sm:rounded-[42px] border-[8px] sm:border-[10px] border-[#222] bg-black shadow-2xl relative flex flex-col overflow-hidden select-none outline outline-1 outline-zinc-800 shrink-0">
                  {/* Speaker / Dynamic Island */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-3 sm:h-4 bg-black rounded-full z-40 pointer-events-none" />

                  {/* Phone Screen Container */}
                  <div className="h-full w-full flex flex-col bg-black text-white relative">
                    {/* iOS Top Status Bar */}
                    <div className="h-8 sm:h-10 px-5 sm:px-6 pt-1 sm:pt-2 flex items-center justify-between text-[9px] sm:text-[11px] font-semibold text-white z-30 pointer-events-none bg-black">
                      <span>9:41</span>
                      <div className="flex items-center gap-1 sm:gap-1.5 opacity-90">
                        <span className="text-[8px] sm:text-[10px]">📶</span>
                        <span className="text-[8px] sm:text-[10px]">⚡</span>
                      </div>
                    </div>

                    {modalPreviewTab === "comment" ? (
                      /* INSTAGRAM COMMENTS MOCKUP */
                      <div className="flex-1 flex flex-col justify-between bg-black text-[10px] sm:text-xs font-sans overflow-hidden">
                        {/* Scrollable Feed Container */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black text-left">
                          {/* Post Header */}
                          <div className="flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 border-b border-zinc-800 shrink-0">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              {activeAccount?.profile_picture_url ? (
                                <img
                                  src={activeAccount.profile_picture_url}
                                  className="w-5 h-5 sm:w-7 sm:h-7 rounded-full object-cover border border-zinc-700"
                                  alt={activeAccount?.username || "store"}
                                />
                              ) : (
                                <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] font-bold text-white ">
                                  {activeAccount?.username ? activeAccount.username[0] : "Z"}
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="font-semibold text-[9px] sm:text-[11px] text-white">
                                    {activeAccount?.username || "mybusiness"}
                                  </span>
                                  <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-sky-500 text-black flex items-center justify-center text-[5px] sm:text-[6px] font-bold">
                                    ✓
                                  </span>
                                </div>
                                <p className="text-[7px] sm:text-[8px] text-zinc-400">Original post</p>
                              </div>
                            </div>
                            <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
                          </div>

                          {/* Post Image */}
                          <div className="w-full h-24 sm:h-32 bg-black relative overflow-hidden shrink-0 border-b border-zinc-900 flex items-center justify-center">
                            {mediaList[0]?.url ? (
                              mediaList[0].type === "VIDEO" ? (
                                <video src={mediaList[0].url} className="w-full h-full object-cover" />
                              ) : (
                                <img src={mediaList[0].url} alt="Post media" className="w-full h-full object-cover" />
                              )
                            ) : (
                              <ShoppingBag className="w-8 h-8 text-zinc-600" />
                            )}
                          </div>

                          {/* Action Icons */}
                          <div className="flex justify-between px-2 sm:px-3 py-1.5 sm:py-2 text-zinc-200">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white hover:text-rose-500 cursor-pointer" />
                              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white cursor-pointer" />
                              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white cursor-pointer" />
                            </div>
                            <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white cursor-pointer" />
                          </div>

                          {/* Likes Count */}
                          <div className="px-2 sm:px-3 text-[8px] sm:text-[10px] font-medium text-zinc-300">
                            Liked by <span className="font-bold text-white">alex_design</span> and{" "}
                            <span className="font-bold text-white">2,384 others</span>
                          </div>

                          {/* Post Caption */}
                          <div className="px-2 sm:px-3 pt-1 text-[8px] sm:text-[10px] text-zinc-300 leading-tight">
                            <span className="font-bold text-white mr-1.5">
                              {activeAccount?.username || "mybusiness"}
                            </span>
                            <span>
                              {instagramCustomCaption || `${title || "Product Title"} - Now Available! Comment below 👇`}
                            </span>
                          </div>

                          <div className="px-2 sm:px-3 pt-2 text-[7px] sm:text-[9px] text-zinc-500 font-medium tracking-wider">
                            Comments
                          </div>

                          {/* Comments Feed Section */}
                          <div className="px-2 sm:px-3 py-1.5 sm:py-2 space-y-2.5 sm:space-y-3">
                            <div className="flex gap-2 sm:gap-2.5 items-start">
                              <img
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                                alt="Customer"
                                className="w-5.5 h-5.5 sm:w-7 sm:h-7 rounded-full object-cover shrink-0 border border-zinc-800"
                              />
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-[9px] sm:text-[11px] leading-snug text-zinc-200">
                                  <span className="font-semibold text-white mr-1.5">alex_design</span>
                                  <span>
                                    {automationMatchType === "any"
                                      ? "How much for this?"
                                      : activeKeywords[0]
                                        ? `${activeKeywords[0]} please!`
                                        : "PRICE"}
                                  </span>
                                </p>
                                <div className="flex gap-2 sm:gap-3 mt-0.5 sm:mt-1 text-[8px] sm:text-[9px] text-zinc-500 font-medium items-center">
                                  <span>2m</span>
                                  <span>34 likes</span>
                                  <button className="hover:text-zinc-300">Reply</button>
                                  {followerGate && (
                                    <span className="text-rose-400 font-semibold ml-auto text-[7.5px] sm:text-[8.5px]">
                                      Follower Gate Active
                                    </span>
                                  )}
                                </div>
                                {/* Public Bot Reply */}
                                {createAutomation && automationCommentReplies.length > 0 && (
                                  <div className="mt-1.5 pl-2.5 border-l-2 border-[#c4c0ff]/40 space-y-0.5">
                                    <p className="text-[8.5px] sm:text-[10px] text-zinc-300">
                                      <span className="font-semibold text-white mr-1">
                                        @{activeAccount?.username || "store"}
                                      </span>
                                      <span>{automationCommentReplies[0] || "Sent you a DM with the product link! 🛍️ Check your inbox!"}</span>
                                    </p>
                                    {automationCommentReplies.length > 1 && (
                                      <span className="text-[7.5px] text-[#c4c0ff] font-medium block">
                                        🎲 Randomly selects from {automationCommentReplies.length} variations
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <Heart className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-zinc-500 hover:text-rose-500 cursor-pointer shrink-0 mt-0.5" />
                            </div>
                          </div>
                        </div>

                        {/* Add Comment Input Bar */}
                        <div className="border-t border-zinc-800 px-2 sm:px-3 py-1.5 sm:py-2 bg-black shrink-0">
                          <div className="flex items-center gap-1.5 sm:gap-2.5">
                            <div className="w-5.5 h-5.5 sm:w-7 sm:h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                              {activeAccount?.username ? activeAccount.username[0] : "Z"}
                            </div>
                            <span className="flex-1 text-[10px] sm:text-xs text-zinc-500 truncate text-left">
                              Add a comment...
                            </span>
                            <button className="text-blue-500 font-semibold text-[10px] sm:text-xs hover:text-blue-400 cursor-pointer">
                              Post
                            </button>
                          </div>
                        </div>

                        {/* Home Indicator */}
                        <div className="w-16 sm:w-20 h-1 bg-zinc-700 rounded-full mx-auto my-1 shrink-0" />
                      </div>
                    ) : (
                      /* DM CHAT MOCKUP WITH PRODUCT CARD OR PLAIN TEXT */
                      <>
                        {/* Instagram Header */}
                        <div className="pt-6 sm:pt-8 pb-2 sm:pb-3 border-b border-zinc-800/60 px-3 sm:px-4 flex items-center rounded-full gap-2.5 sm:gap-3 bg-zinc-950/80 backdrop-blur-md shrink-0">
                          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
                          <div className="w-6.5 h-6.5 sm:w-8 sm:h-8 rounded-full bg-zinc-800 border border-zinc-700/50 overflow-hidden shrink-0 flex items-center justify-center">
                            {activeAccount?.profile_picture_url ? (
                              <img
                                src={activeAccount.profile_picture_url}
                                className="w-full h-full object-cover"
                                alt="Avatar"
                              />
                            ) : (
                              <span className="text-xs font-bold text-white ">
                                {activeAccount?.username ? activeAccount.username[0] : "Z"}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] sm:text-[11px] font-bold text-white truncate leading-tight">
                                {activeAccount?.username || "store"}
                              </span>
                              <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-emerald-500" />
                            </div>
                            <span className="text-[7px] sm:text-[8px] text-zinc-400 font-medium leading-none block mt-0.5 sm:mt-1">
                              Active now
                            </span>
                          </div>
                        </div>

                        {/* Chat Thread Body */}
                        <div className="flex-1 overflow-y-auto p-2.5 sm:p-3.5 flex flex-col space-y-2.5 sm:space-y-3.5 scrollbar-hide bg-black text-left">
                          <div className="flex-1" />

                          {/* Customer Left Bubble */}
                          <div className="self-start flex items-end gap-1.5 sm:gap-2 max-w-[85%] shrink-0">
                            <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-zinc-800 shrink-0 border border-zinc-700/40 overflow-hidden mb-0.5">
                              <img
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=50&h=50"
                                className="w-full h-full object-cover"
                                alt="Customer"
                              />
                            </div>
                            <div className="bg-[#26262a] border border-zinc-800/60 rounded-2xl rounded-bl-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[10px] sm:text-[11px] text-zinc-200 text-left">
                              {automationMatchType === "any" ? "Hi there!" : activeKeywords[0] || "PRICE"}
                            </div>
                          </div>

                          {/* Bot Reply: Follower Gate Response / Product Card / Plain Text Bubble */}
                          {followerGate ? (
                            <div className="self-end items-end max-w-[85%] flex flex-col shrink-0 gap-1 animate-in fade-in duration-200">
                              <div className="bg-[#18181b] border border-zinc-800 text-zinc-200 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl rounded-br-xs text-[10px] sm:text-[11px] leading-relaxed shadow-md text-left">
                                {followerGateMessages.find(m => m.trim()) || "Please follow our page to unlock this offer! ✨"}
                              </div>
                              <span className="text-[7px] sm:text-[8px] text-rose-400 font-semibold pr-1">Follower Gate Active</span>
                            </div>
                          ) : (
                            <div className="self-end items-end max-w-[85%] flex flex-col shrink-0 gap-1 animate-in fade-in duration-200">
                              {automationDmFormat === "generic_template" ? (
                                <div className="w-[180px] sm:w-[210px] bg-[#1c1c1e] border border-zinc-700/60 rounded-xl overflow-hidden shadow-xl text-left">
                                  <div className="w-full h-20 sm:h-26 bg-zinc-900 relative overflow-hidden flex items-center justify-center">
                                    {effectiveCardImage ? (
                                      <img src={effectiveCardImage} alt="Product" className="w-full h-full object-cover" />
                                    ) : mediaList[0]?.url ? (
                                      mediaList[0].type === "VIDEO" ? (
                                        <video src={mediaList[0].url} className="w-full h-full object-cover" />
                                      ) : (
                                        <img src={mediaList[0].url} alt="Product" className="w-full h-full object-cover" />
                                      )
                                    ) : (
                                      <ShoppingBag className="w-8 h-8 text-zinc-600" />
                                    )}
                                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[7.5px] font-bold text-emerald-400 border border-white/10">
                                      In Stock
                                    </div>
                                  </div>
                                  <div className="p-2 space-y-1">
                                    <h5 className="font-bold text-[10px] text-white truncate leading-tight">
                                      {title || "Product Title"}
                                    </h5>
                                    <div className="flex items-center justify-between text-[9px]">
                                      <span className="font-extrabold text-[#34d399]">
                                        {currency}
                                        {price || "999"}
                                      </span>
                                      <span className="text-[7.5px] text-zinc-400 font-medium">Free Delivery</span>
                                    </div>
                                  </div>
                                  <div className="border-t border-zinc-700/60 p-1.5 bg-[#141416]">
                                    <div className="w-full py-1 rounded bg-[#0095f6] text-white font-bold text-[9px] text-center flex items-center justify-center gap-1">
                                      <span>Buy Now 🛍️</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-[#0095f6] text-white px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl rounded-br-xs text-[10px] sm:text-[11px] leading-relaxed shadow-md text-left max-w-full break-words whitespace-pre-wrap">
                                  {automationDmMessage ||
                                    `Hey! Thanks for your comment! Here is the direct link to purchase ${title || "this product"
                                    } (${currency}${price || "0"}):\n\nhttps://app.zoyee.in/${activeAccount?.username || "store"
                                    }/product/${title ? encodeURIComponent(title.toLowerCase().replace(/\s+/g, "-")) : "item"}`}
                                </div>
                              )}
                              <span className="text-[7px] text-zinc-400 font-medium pr-1">Auto-reply sent</span>
                            </div>
                          )}
                        </div>

                        {/* Footer Input Bar */}
                        <div className="p-2 sm:p-3 border-t border-zinc-800/60 bg-zinc-950/90 shrink-0">
                          <div className="bg-zinc-900 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 flex items-center justify-between border border-zinc-800">
                            <span className="text-[9px] sm:text-[10px] text-zinc-500 font-medium">
                              Message @{activeAccount?.username || "store"}...
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: Editor Fields Panel */}
              <div
                className={cn(
                  "flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 sm:space-y-6 custom-scrollbar bg-[#131313]",
                  automationMobileView === "edit" ? "block" : "hidden lg:block"
                )}
              >
                {/* Instagram Post Format Selection */}
                <div className="space-y-3 text-left">
                  <label className="text-xs font-bold text-zinc-400 tracking-wider block font-inter">
                    Instagram Post Format
                  </label>

                  <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl w-full">
                    {availablePostFormats.map((opt) => {
                      const isSelected = instagramPostType === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setInstagramPostType(opt.value as any)}
                          className={cn(
                            "flex-1 py-2 sm:py-2.5 text-center rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-200 cursor-pointer",
                            isSelected
                              ? "bg-white text-black shadow-md"
                              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                          )}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Publishing Schedule Timing */}
                <div className="space-y-3 text-left">
                  <label className="text-xs font-bold text-zinc-400 tracking-wider block font-inter">
                    Publishing Schedule
                  </label>

                  <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl w-full">
                    {[
                      { value: "now", label: "Publish on Save" },
                      { value: "later", label: "Schedule Later" },
                    ].map((opt) => {
                      const isSelected = instagramScheduleMode === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setInstagramScheduleMode(opt.value as any)}
                          className={cn(
                            "flex-1 py-2 sm:py-2.5 text-center rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-200 cursor-pointer",
                            isSelected
                              ? "bg-white text-black shadow-md"
                              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                          )}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {instagramScheduleMode === "later" && (
                    <div className="pt-2 space-y-2 animate-in fade-in duration-200">
                      <input
                        type="datetime-local"
                        value={instagramScheduleTime}
                        min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                        onChange={(e) => setInstagramScheduleTime(e.target.value)}
                        onClick={(e) => {
                          try {
                            (e.target as any).showPicker?.();
                          } catch { }
                        }}
                        className="w-full bg-[#18181b] border border-white/10 rounded px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 font-medium transition-all [color-scheme:dark] cursor-pointer"
                      />
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] text-zinc-400 font-semibold mr-0.5">Presets:</span>
                        {[
                          { label: "+1 Hour", hours: 1 },
                          { label: "+3 Hours", hours: 3 },
                          { label: "+6 Hours", hours: 6 },
                          { label: "Tomorrow", hours: 24 },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              const d = new Date(Date.now() + preset.hours * 60 * 60 * 1000);
                              const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                              setInstagramScheduleTime(localIso);
                            }}
                            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 hover:text-white border border-white/5 text-[10px] font-semibold text-zinc-300 transition-colors cursor-pointer"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Instagram Post Caption */}
                <div className="space-y-3 text-left">
                  <label className="text-xs font-bold text-zinc-400 tracking-wider block font-inter">
                    Instagram Post Caption
                  </label>
                  <textarea
                    value={instagramCustomCaption}
                    onChange={(e) => setInstagramCustomCaption(e.target.value)}
                    placeholder={`${title || "Product Name"}\n\nPrice: ${currency}${price || "0"}\n\n${description || "Product description"
                      }\n\nDM to buy!`}
                    rows={3}
                    className="w-full bg-[#18181b] border border-white/10 rounded p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 font-medium transition-all resize-none"
                  />
                </div>

                {/* Comment-to-DM Automation Card (Follower Gate styling) */}
                <div className="bg-white/5 border border-white/10 rounded p-5 space-y-4 text-left font-inter shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-white shrink-0" />
                        <span className="text-xs font-bold text-white tracking-wider">
                          Enable Comment-to-DM Automation
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                        Automatically send product card in DM when someone comments.
                      </p>
                    </div>

                    {/* Custom Switch Toggle */}
                    <button
                      type="button"
                      onClick={() => setCreateAutomation(!createAutomation)}
                      className={cn(
                        "w-11 h-6 rounded-full relative transition-all duration-200 shrink-0 cursor-pointer border border-white/10",
                        createAutomation ? "bg-[#b6b2ff]" : "bg-white/10"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-[2px] w-4.5 h-4.5 rounded-full shadow transition-all duration-200",
                          createAutomation ? "left-[22px] bg-[#131313]" : "left-[2px] bg-white"
                        )}
                      />
                    </button>
                  </div>

                  {/* Inside Automation Configuration */}
                  {createAutomation && (
                    <div className="space-y-4 pt-3 border-t border-white/10 animate-in fade-in duration-200">
                      {/* Keyword Match Mode */}
                      <div className="space-y-3 text-left">
                        <label className="text-xs font-bold text-zinc-400 tracking-wider block font-inter">
                          Keyword Match Mode
                        </label>

                        <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl w-full">
                          {[
                            { value: "contains", label: "Contains Any" },
                            { value: "equals", label: "Exact Match" },
                            { value: "any", label: "Any Message" },
                          ].map((opt) => {
                            const isSelected = automationMatchType === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setAutomationMatchType(opt.value as any)}
                                className={cn(
                                  "flex-1 py-2 sm:py-2.5 text-center rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-200 cursor-pointer",
                                  isSelected
                                    ? "bg-white text-black shadow-md"
                                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                                )}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Keywords Input Section */}
                      {automationMatchType !== "any" && (
                        <div className="space-y-3 text-left">
                          <label className="text-xs font-bold text-zinc-400 tracking-wider block font-inter">
                            {automationMatchType === "equals"
                              ? "Keywords (Exact Match)"
                              : "Keywords (Contains Any)"}
                          </label>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={keywordInput}
                              onChange={(e) => setKeywordInput(e.target.value)}
                              onKeyDown={handleAddKeyword}
                              placeholder="Type keyword and press Enter..."
                              className="flex-1 bg-[#18181b] border border-white/10 rounded px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 font-medium transition-all"
                            />
                            <button
                              type="button"
                              onClick={handleAddKeywordBtn}
                              className="px-3.5 py-2 bg-white text-black font-bold text-xs rounded hover:opacity-90 transition-all flex items-center justify-center cursor-pointer shrink-0 shadow-md"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add
                            </button>
                          </div>

                          {/* Active Keyword Chips List */}
                          <div className="flex flex-wrap gap-2 bg-white/5 border border-white/10 rounded p-3.5 min-h-[52px] items-center">
                            {activeKeywords.length > 0 ? (
                              activeKeywords.map((kw) => (
                                <span
                                  key={kw}
                                  onClick={() => handleRemoveKeyword(kw)}
                                  className="bg-white/10 hover:bg-rose-500/20 hover:border-rose-500/40 text-white hover:text-rose-300 border border-white/15 text-xs font-bold pl-3 pr-2 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-sm group"
                                >
                                  <span>{kw}</span>
                                  <X className="w-3 h-3 text-zinc-400 group-hover:text-rose-300 transition-colors shrink-0" />
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-zinc-500 font-medium italic pl-1">
                                No keywords added yet. Type a keyword above.
                              </span>
                            )}
                          </div>

                          {/* Quick Add Keyword Pills */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] text-zinc-500 font-semibold mr-1">Popular:</span>
                            {["PRICE", "BUY", "LINK", "SHOP", "INFO", "ORDER"].map((kw) => (
                              <button
                                key={kw}
                                type="button"
                                onClick={() => {
                                  if (!activeKeywords.map((k) => k.toUpperCase()).includes(kw)) {
                                    setAutomationKeywords(
                                      activeKeywords.length > 0 ? `${automationKeywords}, ${kw}` : kw
                                    );
                                  }
                                }}
                                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-[#c4c0ff] border border-white/10 transition-colors cursor-pointer"
                              >
                                +{kw}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Follower Gate Settings Card */}
                      <div className="bg-white/5 border border-white/10 rounded p-5 space-y-4 text-left font-inter shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-white shrink-0" />
                              <span className="text-xs font-bold text-white tracking-wider">Enable Follower Gate</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                              Require customer to follow your account before trigger execution.
                            </p>
                          </div>

                          {/* Custom Switch Toggle */}
                          <button
                            type="button"
                            onClick={() => setFollowerGate(!followerGate)}
                            className={cn(
                              "w-11 h-6 rounded-full relative transition-all duration-200 shrink-0 cursor-pointer border border-white/10",
                              followerGate ? "bg-[#b6b2ff]" : "bg-white/10"
                            )}
                          >
                            <div
                              className={cn(
                                "absolute top-[2px] w-4.5 h-4.5 rounded-full shadow transition-all duration-200",
                                followerGate ? "left-[22px] bg-[#131313]" : "left-[2px] bg-white"
                              )}
                            />
                          </button>
                        </div>

                        {/* Message Variations for Follower Gate */}
                        {followerGate && (
                          <div className="space-y-3 pt-3 border-t border-white/10 animate-in fade-in duration-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="text-xs text-zinc-400 tracking-wider font-inter">
                                  Set messages for non-followers ({followerGateMessages.length})
                                </h4>
                              </div>
                              <button
                                type="button"
                                onClick={handleAddMessageVariation}
                                className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer hover:opacity-90 shadow-md"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add Variation
                              </button>
                            </div>

                            <div className="space-y-2">
                              {followerGateMessages.map((msg, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <span className="text-xs font-bold text-zinc-500 w-5 text-center">{idx + 1}</span>
                                  <input
                                    type="text"
                                    value={msg}
                                    onChange={(e) => handleUpdateMessageVariation(idx, e.target.value)}
                                    placeholder="Please follow our page to unlock this offer! ✨"
                                    className="flex-1 bg-[#18181b] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white/30 font-medium placeholder-zinc-600"
                                  />
                                  {followerGateMessages.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveMessageVariation(idx)}
                                      className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Public Comment Reply Section with Anti-Spam Random Variations */}
                      {instagramPostType !== "STORIES" && (
                        <div className="bg-white/5 border border-white/10 rounded p-5 space-y-3.5 text-left font-inter shadow-sm">
                          <div className="flex items-center justify-between gap-2">
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-white shrink-0" />
                                <span className="text-xs font-bold text-white tracking-wider">
                                  Public Comment Reply Variations ({automationCommentReplies.length})
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                                Randomly rotates reply variations to keep your account safe from Instagram spam limits.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleAddCommentReplyVariation}
                              className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer hover:opacity-90 shadow-md shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Variation
                            </button>
                          </div>

                          <div className="space-y-2 pt-1">
                            {automationCommentReplies.map((msg, idx) => (
                              <div key={idx} className="flex gap-2 items-center">
                                <span className="text-xs font-bold text-zinc-500 w-5 text-center shrink-0">
                                  {idx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={msg}
                                  onChange={(e) => handleUpdateCommentReplyVariation(idx, e.target.value)}
                                  placeholder="Sent you a DM with the product link! 🛍️ Check your inbox!"
                                  className="flex-1 bg-[#18181b] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white/30 font-medium placeholder-zinc-600"
                                />
                                {automationCommentReplies.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCommentReplyVariation(idx)}
                                    className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Direct Message Format */}
                      <div className="space-y-3 text-left">
                        <label className="text-xs font-bold text-zinc-400 tracking-wider block font-inter">
                          Direct Message Format
                        </label>

                        <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl w-full">
                          {[
                            { value: "generic_template", label: "🛍️ Product Card (Default)" },
                            { value: "text", label: "📝 Plain Text" },
                          ].map((opt) => {
                            const isSelected = automationDmFormat === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setAutomationDmFormat(opt.value as any)}
                                className={cn(
                                  "flex-1 py-2 sm:py-2.5 text-center rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-200 cursor-pointer",
                                  isSelected
                                    ? "bg-white text-black shadow-md"
                                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                                )}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Product Card Image Cover Selection */}
                        {automationDmFormat === "generic_template" && availableCardImages.length > 0 && (
                          <div className="space-y-2 text-left pt-1 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-zinc-400 tracking-wider block font-inter">
                                Card Cover Image
                              </label>
                              <span className="text-[10px] text-zinc-500 font-medium">
                                {availableCardImages.length} available
                              </span>
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                              {availableCardImages.map((img: { url: string; label: string }, idx: number) => {
                                const isSelected = (effectiveCardImage === img.url);
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setAutomationCardImage(img.url)}
                                    className={cn(
                                      "relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer",
                                      isSelected ? "border-[#b6b2ff] ring-2 ring-[#b6b2ff]/30" : "border-white/10 opacity-60 hover:opacity-100"
                                    )}
                                  >
                                    <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                                    {isSelected && (
                                      <div className="absolute inset-0 bg-[#b6b2ff]/20 flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Custom / Plain Text DM Message */}
                      <div className="space-y-2 text-left">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-zinc-400 tracking-wider block font-inter">
                            {automationDmFormat === "text"
                              ? "Plain Text DM Message"
                              : "Optional Note with Product Card"}
                          </label>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {automationDmMessage.length} chars
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-medium">
                          {automationDmFormat === "text"
                            ? "This exact text will be sent to the customer in Instagram DM when triggered."
                            : "Optional custom text note sent along with the interactive product card."}
                        </p>
                        <textarea
                          value={automationDmMessage}
                          onChange={(e) => setAutomationDmMessage(e.target.value)}
                          placeholder={
                            automationDmFormat === "text"
                              ? `Hey! Thanks for checking out ${title || "our product"
                              }! Here is the link to purchase for ${currency}${price || "0"}:\nhttps://app.zoyee.in/${activeAccount?.username || "store"
                              }/product/...`
                              : `Hey! Thanks for your comment! Here is the product details you requested 👇`
                          }
                          rows={3}
                          className="w-full bg-[#18181b] border border-white/10 rounded p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 font-medium transition-all resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast Messages */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </motion.div>
  );
}