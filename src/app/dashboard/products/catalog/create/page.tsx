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
  Pencil,
  Smartphone,
  Film,
  AlertCircle,
  CheckCircle2,
  Volume2,
  VolumeX
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import api from "@/lib/services/api.service";
import { deleteFromCloudinary } from "@/lib/services/cloudinary.service";
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
  const [returnDeductionCharge, setReturnDeductionCharge] = useState("0");
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
  const [newlyUploadedMediaItems, setNewlyUploadedMediaItems] = useState<
    { publicId?: string; resourceType?: string; url: string }[]
  >([]);
  const isSavedRef = useRef(false);
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
  const [instagramPostType, setInstagramPostType] = useState<"CAROUSEL" | "REELS" | "IMAGE">("REELS");
  const [instagramCustomCaption, setInstagramCustomCaption] = useState("");

  const availablePostFormats = useMemo(() => {
    const totalCount = mediaList.length;
    const formats: { value: "CAROUSEL" | "REELS" | "IMAGE"; label: string; desc?: string }[] = [
      {
        value: "REELS",
        label: "🎥 Reel",
        desc: "Published as an Instagram Reel"
      },
      {
        value: "IMAGE",
        label: "🖼️ Post",
        desc: "Published as a photo post"
      },
      {
        value: "CAROUSEL",
        label: totalCount >= 2 ? `📸 Carousel (${totalCount})` : "📸 Carousel",
        desc: "Multi-media swipeable album"
      }
    ];

    return formats;
  }, [mediaList.length]);

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

  // Media & Upload States for Instagram Creator Studio Modal
  const [mediaUrl, setMediaUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [carouselUrls, setCarouselUrls] = useState<string[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaUploadProgress, setMediaUploadProgress] = useState(0);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [errors, setErrors] = useState<{ media?: string }>({});

  useEffect(() => {
    if (mediaList.length > 0) {
      const urls = mediaList.map(m => m.url).filter(Boolean);
      if (urls.length > 0 && carouselUrls.length === 0) {
        setCarouselUrls(urls);
      }
      if (!mediaUrl && urls[0]) {
        setMediaUrl(urls[0]);
      }
    }
  }, [mediaList]);

  const uploadSingleFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "any_dm_product_upload";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, true);
      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data.secure_url);
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error("Cloudinary upload failed"));
        }
      };
      xhr.onerror = () => reject(new Error("Upload network error"));
      xhr.send(formData);
    });
  };

  const handleCarouselFilesUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (carouselUrls.length + fileArray.length > 10) {
      showToast("Instagram carousels support a maximum of 10 items", "error");
      return;
    }

    setUploadingMedia(true);
    setMediaUploadProgress(10);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const url = await uploadSingleFile(file);
        newUrls.push(url);
        setMediaUploadProgress(Math.round(((i + 1) / fileArray.length) * 100));
      }
      const updated = [...carouselUrls, ...newUrls];
      setCarouselUrls(updated);
      if (!mediaUrl && updated.length > 0) {
        setMediaUrl(updated[0]);
      }
      showToast(`Added ${newUrls.length} item${newUrls.length > 1 ? "s" : ""} to carousel`);
    } catch {
      showToast("Failed to upload some carousel files", "error");
    } finally {
      setUploadingMedia(false);
      setMediaUploadProgress(0);
    }
  };

  const removeCarouselSlide = (indexToRemove: number) => {
    const updated = carouselUrls.filter((_, idx) => idx !== indexToRemove);
    setCarouselUrls(updated);
    if (carouselIndex >= updated.length) {
      setCarouselIndex(Math.max(0, updated.length - 1));
    }
    if (updated.length > 0) {
      setMediaUrl(updated[0]);
    } else {
      setMediaUrl("");
    }
  };

  const uploadToCloudinary = (file: File, isCover = false) => {
    const isVideo = file.type.startsWith("video/");
    if (isCover && isVideo) {
      showToast("Thumbnails must be image files (JPG, PNG, WebP)", "error");
      return;
    }

    if (isCover) {
      setUploadingCover(true);
      setCoverUploadProgress(0);
    } else {
      setUploadingMedia(true);
      setMediaUploadProgress(0);
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "any_dm_product_upload";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        if (isCover) setCoverUploadProgress(percent);
        else setMediaUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          const url = data.secure_url;
          if (isCover) {
            setCoverUrl(url);
            showToast("Cover thumbnail attached");
          } else {
            setMediaUrl(url);
            if (carouselUrls.length === 0) {
              setCarouselUrls([url]);
            }
            showToast("Media file uploaded");
          }
        } catch (e) {
          showToast("Upload response error", "error");
        }
      } else {
        showToast("Cloudinary upload failed", "error");
      }
      if (isCover) setUploadingCover(false);
      else setUploadingMedia(false);
    };

    xhr.onerror = () => {
      showToast("Network error during upload", "error");
      if (isCover) setUploadingCover(false);
      else setUploadingMedia(false);
    };

    xhr.send(formData);
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
  // System Commission Settings State (from SystemSettings table)
  const [globalCommPct, setGlobalCommPct] = useState<number>(10.00);
  const [instantCommPct, setInstantCommPct] = useState<number>(3.00);
  const [payoutHoldMode, setPayoutHoldMode] = useState<string>("INSTANT");

  useEffect(() => {
    const fetchCommissionSettings = async () => {
      try {
        const res = await api.get("/crm/seller/orders/");
        if (res.data) {
          if (res.data.global_commission_pct !== undefined) {
            setGlobalCommPct(parseFloat(res.data.global_commission_pct) || 10.00);
          }
          if (res.data.instant_payout_commission_pct !== undefined) {
            setInstantCommPct(parseFloat(res.data.instant_payout_commission_pct) || 3.00);
          }
          if (res.data.payout_hold_mode) {
            setPayoutHoldMode(res.data.payout_hold_mode);
          }
        }
      } catch (e) {
        console.warn("Could not fetch system commission settings:", e);
      }
    };
    fetchCommissionSettings();
  }, []);

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
      setReturnDeductionCharge(product.return_deduction_charge ? product.return_deduction_charge.toString() : "0");
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

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "any_dm_product_upload";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, true);

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

          setNewlyUploadedMediaItems((prev) => [
            ...prev,
            {
              publicId: response.public_id,
              resourceType: isVideo ? "video" : "image",
              url: secureUrl,
            },
          ]);

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

  const handleDiscard = async () => {
    if (newlyUploadedMediaItems.length > 0) {
      const itemsToDelete = [...newlyUploadedMediaItems];
      setNewlyUploadedMediaItems([]);
      showToast("Cleaning up uploaded media...", "info");
      try {
        await Promise.all(
          itemsToDelete.map((item) =>
            deleteFromCloudinary({
              publicId: item.publicId,
              resourceType: item.resourceType,
            })
          )
        );
      } catch (e) {
        console.warn("Cloudinary discard cleanup error:", e);
      }
    }
    router.push("/dashboard/products/catalog");
  };

  useEffect(() => {
    return () => {
      if (!isSavedRef.current && newlyUploadedMediaItems.length > 0) {
        newlyUploadedMediaItems.forEach((item) => {
          deleteFromCloudinary({
            publicId: item.publicId,
            resourceType: item.resourceType,
          });
        });
      }
    };
  }, [newlyUploadedMediaItems]);

  const removeMediaItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const itemToRemove = mediaList.find((item) => item.id === id);
    if (itemToRemove) {
      const uploadedItem = newlyUploadedMediaItems.find((m) => m.url === itemToRemove.url || m.publicId === id);
      if (uploadedItem) {
        deleteFromCloudinary({
          publicId: uploadedItem.publicId,
          resourceType: uploadedItem.resourceType,
        });
        setNewlyUploadedMediaItems((prev) => prev.filter((m) => m.url !== itemToRemove.url));
      }
    }
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
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "any_dm_product_upload";
    const formData = new FormData();
    formData.append("file", blob, filename);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
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
    if (originalPrice && parseFloat(originalPrice) <= parseFloat(price)) {
      showToast("Compare price must be greater than selling price", "error");
      return;
    }
    if (mediaList.length === 0) {
      showToast("Upload or select at least one media item", "error");
      return;
    }

    isSavedRef.current = true;
    setNewlyUploadedMediaItems([]);
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
      return_deduction_charge: returnDeductionCharge ? parseFloat(returnDeductionCharge) : 0,
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
      instagram_schedule_time: null,
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
      className="text-[#e5e2e1] pb-16 space-y-4 font-sans"
    >
      {/* Header & Actions */}
      <div className="sticky top-[64px] z-30 flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 pt-4 -mt-6 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-[#444748]/10 bg-[#131313]">
        <div className="hidden sm:block">
          <nav className="flex items-center gap-2 text-[#c4c7c8] text-xs mb-2">
            <Link href="/dashboard/products/catalog" className="hover:text-white transition-colors">
              All Products
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
            onClick={handleDiscard}
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
          <div className="lg:col-span-8 space-y-6">

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
                      value="INR"
                      disabled
                      className="w-full bg-[#1c1b1b] border border-[#444748]/60 rounded-[4px] px-3 py-2 text-sm text-white cursor-not-allowed opacity-80"
                    >
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-[#c4c7c8] block mb-1.5 font-medium">Price (includes delivery)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9192] text-xs font-semibold">₹</span>
                      <input
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full bg-[#1c1b1b] border border-[#444748]/60 rounded-[4px] pl-8 pr-3 py-2 text-sm focus:border-white outline-none transition-colors text-white placeholder:text-[#8e9192]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#c4c7c8] block mb-1.5 font-medium">Compare at price (original)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9192] text-xs font-semibold">₹</span>
                      <input
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className={cn(
                          "w-full bg-[#1c1b1b] border rounded-[4px] pl-8 pr-3 py-2 text-sm outline-none transition-colors text-white placeholder:text-[#8e9192]",
                          originalPrice && parseFloat(originalPrice) <= (parseFloat(price) || 0)
                            ? "border-red-500 focus:border-red-500"
                            : "border-[#444748]/60 focus:border-white"
                        )}
                      />
                    </div>
                    {originalPrice && parseFloat(originalPrice) <= (parseFloat(price) || 0) && (
                      <p className="text-[11px] text-red-400 font-medium mt-1">
                        Compare price must be &gt; price (₹{parseFloat(price) || 0})
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-[#c4c7c8] block mb-1.5 font-medium">Return Deduction Charge (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9192] text-xs font-semibold">₹</span>
                      <input
                        value={returnDeductionCharge}
                        onChange={(e) => setReturnDeductionCharge(e.target.value)}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full bg-[#1c1b1b] border border-[#444748]/60 rounded-[4px] pl-8 pr-3 py-2 text-sm focus:border-white outline-none transition-colors text-white placeholder:text-[#8e9192]"
                      />
                    </div>
                    <p className="text-[11px] text-[#8e9192] mt-1">Deducted from customer refund when item is returned.</p>

                    {/* Return Deduction Payout Breakdown Box */}
                    {(() => {
                      const r = parseFloat(returnDeductionCharge) || 0;
                      const activeCommRateVal = payoutHoldMode === "INSTANT" ? Number(instantCommPct) : Number(globalCommPct);
                      const feeRatePct = (isNaN(activeCommRateVal) ? 3 : activeCommRateVal) + 2;
                      const feeAmount = r * (feeRatePct / 100);
                      const supplierGetOnReturn = Math.max(0, r - feeAmount);

                      return (
                        <div className="mt-2.5 p-3 rounded-[4px] bg-[#131313] border border-[#444748]/70 space-y-2 text-xs text-[#e5e2e1]">
                          <div className="flex justify-between items-center pb-1.5 border-b border-[#444748]/50">
                            <span className="text-[11px] font-semibold text-[#c4c7c8] tracking-wide uppercase flex items-center gap-1.5">
                              <span>When Customer Returns Order</span>
                            </span>
                            <span className="text-[10px] text-[#8e9192]">
                              Platform Fee: {feeRatePct.toFixed(2)}%
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-[#c4c7c8]">Return Deduction Charge:</span>
                            <span className="font-mono text-white font-medium">₹{r.toFixed(2)}</span>
                          </div>

                          <div className="flex justify-between items-center text-xs text-red-400">
                            <span>Minus Platform Charge ({feeRatePct.toFixed(2)}%):</span>
                            <span className="font-mono font-medium">- ₹{feeAmount.toFixed(2)}</span>
                          </div>

                          <div className="pt-1.5 border-t border-[#444748]/50 flex justify-between items-center text-xs font-semibold">
                            <span className="text-zinc-200">Amount you will get on return:</span>
                            <span className="font-mono text-emerald-400 text-sm">₹{supplierGetOnReturn.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Dynamic Commission & Earnings Breakdown using DESIGN.md (Glass Monochrome & Google Inter Font) */}
                {parseFloat(price) > 0 && (() => {
                  const p = parseFloat(price) || 0;
                  const activeCommRateVal = payoutHoldMode === "INSTANT" ? Number(instantCommPct) : Number(globalCommPct);
                  const activeCommRate = isNaN(activeCommRateVal) ? 3 : activeCommRateVal;
                  const platformFee = p * (activeCommRate / 100);
                  const gatewayTax = p * 0.02;
                  const totalFeeAndTax = platformFee + gatewayTax;
                  const priceThatYouGet = Math.max(0, p - totalFeeAndTax);

                  const r = parseFloat(returnDeductionCharge) || 0;
                  const returnFeeRatePct = activeCommRate + 2;
                  const returnFeeAmount = r * (returnFeeRatePct / 100);
                  const supplierGetOnReturn = Math.max(0, r - returnFeeAmount);

                  return (
                    <div
                      className="p-4 rounded-[6px] bg-[#1c1b1b] border border-[#444748] space-y-3 shadow-sm transition-all text-[#e5e2e1]"
                      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
                    >
                      <div className="flex justify-between items-center pb-2.5 border-b border-[#444748]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#e5e2e1] tracking-tight flex items-center gap-1.5">
                            <span>Commission Breakdown</span> (Only for online payments)
                          </span>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-[4px] font-semibold tracking-wide bg-[#131313] border border-[#444748]">
                          {payoutHoldMode === "INSTANT" ? "Instant Payout" : "Standard"} Is Active ({activeCommRate.toFixed(2)}%)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                        <div className="bg-[#131313] p-3 rounded-[4px] border border-[#ffb4ab]/30 space-y-1">
                          <div className="text-[11px] text-[#c4c7c8] font-semibold tracking-wide uppercase">
                            Fee and tax
                          </div>
                          <div className="text-base text-[#ff2f18] tracking-tight font-mono font-bold">
                            - ₹{totalFeeAndTax.toFixed(2)}
                          </div>
                          <p className="text-[11px] text-[#c4c7c8] leading-normal">
                            {activeCommRate.toFixed(2)}% Platform Commission + 2% Gateway Fee &amp; Tax
                          </p>
                        </div>

                        <div className="bg-[#131313] p-3 rounded-[4px] border border-white/30 space-y-1">
                          <div className="text-[11px] text-[#c4c7c8] font-semibold tracking-wide uppercase">
                            Price that you get
                          </div>
                          <div className="text-base text-green-500 tracking-tight font-mono font-bold">
                            ₹{priceThatYouGet.toFixed(2)}
                          </div>
                          <p className="text-[11px] text-[#c4c7c8] leading-normal">
                            Net amount credited directly to supplier account
                          </p>
                        </div>

                        <div className="bg-[#131313] p-3 rounded-[4px] border border-emerald-500/30 space-y-1">
                          <div className="text-[11px] text-[#c4c7c8] font-semibold tracking-wide uppercase">
                            You get on return
                          </div>
                          <div className="text-base text-emerald-400 tracking-tight font-mono font-bold">
                            ₹{supplierGetOnReturn.toFixed(2)}
                          </div>
                          <p className="text-[11px] text-[#c4c7c8] leading-normal">
                            Return charge ₹{r.toFixed(2)} (-{returnFeeRatePct.toFixed(2)}% platform charge)
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

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
          <div className="lg:col-span-4 space-y-6">

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
                      {activeAccount?.profile_picture_url ? (
                        <img
                          src={activeAccount.profile_picture_url}
                          className="w-4 h-4 rounded-full object-cover border border-white/20"
                          alt="Profile avatar"
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-[#20201f] border border-[#2a2a2a] flex items-center justify-center text-[#e5e2e1] text-[8px]  font-mono">
                          {(activeAccount?.username || "I").charAt(0).toUpperCase()}
                        </div>
                      )}
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
                      <h4 className="text-xs  text-white tracking-tight">Also Post to Instagram</h4>
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
                      <span className=" text-white font-mono">
                        @{activeAccount?.username || "connected_account"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#8e9192]">Format &amp; Mode:</span>
                      <span className="text-white font-medium">
                        {instagramPostType === "REELS" ? "🎬 Reel" : instagramPostType === "CAROUSEL" ? "📸 Carousel" : "🖼️ Post"} • Instant
                      </span>
                    </div>

                    {createAutomation && (
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#8e9192]">Auto-DM:</span>
                        <span className="text-white ">
                          ✨ Active ({automationDmFormat === "generic_template" ? "🛍️ Product Card" : "📝 Text"})
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowAutomationModal(true)}
                      className="w-full py-2 px-3 rounded bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs  flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm mt-1"
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

      {/* ── INSTAGRAM PUBLISHING MODAL PORTAL ── */}
      {mounted && showAutomationModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-1.5 sm:p-4 bg-black/90 backdrop-blur-xl overflow-hidden text-white font-sans">
          {/* Background Ambient Glows */}
          <div className="absolute w-[40vw] h-[40vw] rounded-full bg-[#c4c0ff] top-[-20%] left-[-20%] filter blur-[120px] opacity-[0.08] pointer-events-none z-0" />

          {/* Main Outer Modal Container */}
          <div className="relative w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl h-[92vh] sm:h-[88vh] lg:h-[90vh] bg-[#141414] border border-white/15 rounded-xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col z-10">

            {/* Modal Header */}
            <div className="p-2.5 sm:p-3.5 px-3 sm:px-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#1c1b1b] gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 bg-white/5 rounded-lg border border-white/10 shrink-0">
                  <InstagramIcon className="w-4 h-4 text-white" />
                </div>
                <div className="truncate">
                  <h2 className="text-xs sm:text-sm  text-white tracking-tight truncate">
                    Instagram Publishing &amp; Automation
                  </h2>
                  <p className="hidden md:block text-[10px] text-[#8e9192] truncate">
                    Publish post, reel, or carousel to Instagram
                  </p>
                </div>
              </div>

              {/* Header Action Controls */}
              <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                {/* Mobile Icon Tab Switcher */}
                <div className="flex lg:hidden items-center gap-0.5 bg-[#20201f] p-0.5 rounded border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setAutomationMobileView("edit")}
                    title="Editor"
                    className={`p-1.5 px-2 rounded text-xs  transition-all flex items-center gap-1.5 ${automationMobileView === "edit" ? "bg-white text-black shadow-sm" : "text-[#8e9192]"
                      }`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Editor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAutomationMobileView("preview")}
                    title="Live Preview"
                    className={`p-1.5 px-2 rounded text-xs  transition-all flex items-center gap-1.5 ${automationMobileView === "preview" ? "bg-white text-black shadow-sm" : "text-[#8e9192]"
                      }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAutomationModal(false)}
                  className="px-2.5 sm:px-3 py-1.5 rounded bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-[#8e9192] hover:text-rose-400 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPostToInstagram(true);
                    setShowAutomationModal(false);
                    showToast("Instagram configuration applied", "success");
                  }}
                  className="px-3 sm:px-4 py-1.5 rounded bg-gradient-to-r from-white to-[#eaeaea] text-black text-xs  shadow flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Save
                </button>
              </div>
            </div>

            {/* Modal Body: Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1 min-h-0 overflow-hidden">

              {/* LEFT CANVAS: Phone Device Preview (5 Columns) */}
              <div
                className={`lg:col-span-5 xl:col-span-5 lg:order-first p-2 sm:p-5 bg-[#070707] flex flex-col items-center justify-start lg:justify-center border-r-0 lg:border-r border-white/10 relative select-none overflow-y-auto custom-scrollbar ${automationMobileView === "preview" ? "flex" : "hidden lg:flex"
                  }`}
              >
                {/* Ambient Glow */}
                <div className="absolute w-72 h-72 bg-gradient-to-tr from-purple-600/15 via-[#c4c0ff]/15 to-pink-500/15 blur-3xl rounded-full pointer-events-none" />

                {/* iPhone 16 Pro Frame Scaling Container */}
                <div className="transform scale-[0.72] sm:scale-90 md:scale-95 lg:scale-100 origin-center sm:origin-top lg:origin-center -my-16 sm:-my-4 lg:my-0 flex justify-center shrink-0">
                  <div className="w-[280px] h-[560px] rounded-[42px] p-[8px] shadow-[0_30px_70px_-15px_rgba(0,0,0,1),0_0_0_1px_rgba(255,255,255,0.22),0_0_0_4px_#222222] bg-gradient-to-b from-[#3a3a3a] via-[#1c1c1e] to-[#2a2a2a] flex flex-col shrink-0 overflow-visible relative">

                    {/* iPhone Side Hardware Buttons */}
                    <div className="absolute -left-[4px] top-[80px] w-[3px] h-[20px] bg-[#404040] rounded-l-[2px]" />
                    <div className="absolute -left-[4px] top-[115px] w-[3px] h-[40px] bg-[#404040] rounded-l-[2px]" />
                    <div className="absolute -left-[4px] top-[165px] w-[3px] h-[40px] bg-[#404040] rounded-l-[2px]" />
                    <div className="absolute -right-[4px] top-[130px] w-[3px] h-[60px] bg-[#404040] rounded-r-[2px]" />

                    {/* OLED Screen */}
                    <div className="relative w-full h-full bg-black rounded-[36px] overflow-hidden flex flex-col justify-between text-white border border-white/10 shadow-inner">

                      {/* Dynamic Island */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 w-20 h-4 bg-black rounded-full border border-white/10 flex items-center justify-between px-2 shadow-md">
                        <div className="w-2 h-2 rounded-full bg-[#111] border border-[#262626]" />
                        <div className="w-2 h-2 rounded-full bg-[#070b18] border border-[#1e293b]" />
                      </div>

                      {/* Status Bar */}
                      <div className="h-7 px-4 pt-1.5 flex items-center justify-between text-[9px] font-semibold text-white z-30 pointer-events-none bg-black">
                        <span>9:41</span>
                        <div className="flex items-center gap-1 opacity-90">
                          <span className="text-[8px]">📶</span>
                          <span className="text-[8px]">5G</span>
                        </div>
                      </div>

                      {/* ── FORMAT 1: INSTAGRAM REELS (9:16 Fullscreen Mockup) ── */}
                      {instagramPostType === "REELS" && (
                        <div className="relative w-full h-full bg-black flex flex-col justify-between overflow-hidden">
                          {/* Video Canvas */}
                          <div className="absolute inset-0 bg-[#0f0f0f]">
                            {mediaList[0]?.url ? (
                              mediaList[0].type === "VIDEO" ? (
                                <video src={mediaList[0].url} className="w-full h-full object-cover" autoPlay loop playsInline muted />
                              ) : (
                                <img src={mediaList[0].url} alt="Reel media" className="w-full h-full object-cover" />
                              )
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#1a1024] via-[#101010] to-[#0a0a0a]">
                                <Film className="w-8 h-8 text-[#c4c0ff] animate-pulse mb-2" />
                                <span className="text-xs  text-white">Reel Preview</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/95 pointer-events-none" />
                          </div>

                          {/* Top Reels Header Bar */}
                          <div className="relative z-30 pt-4 px-3 flex items-center justify-between text-white pointer-events-none">
                            <span className="font-extrabold text-[16px]">Reels</span>
                            <div className="w-6 h-6 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/15">
                              <span className="text-[9px]">🎵</span>
                            </div>
                          </div>

                          {/* Right Action Rail */}
                          <div className="absolute right-2.5 bottom-5 z-30 flex flex-col items-center gap-3 text-white pointer-events-none">
                            <div className="flex flex-col items-center gap-0.5">
                              <Heart className="w-5 h-5 text-white" />
                              <span className="text-[9px] ">142K</span>
                            </div>
                            <div className="flex flex-col items-center gap-0.5">
                              <MessageCircle className="w-5 h-5 text-white" />
                              <span className="text-[9px] ">1.2K</span>
                            </div>
                            <div className="flex flex-col items-center gap-0.5">
                              <Send className="w-5 h-5 text-white" />
                              <span className="text-[9px] ">38K</span>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-[#111] border border-white/20 p-0.5 animate-spin">
                              <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-400 to-rose-500" />
                            </div>
                          </div>

                          {/* Bottom Left Creator & Caption Overlay */}
                          <div className="absolute left-3 bottom-5 z-30 text-white space-y-1 max-w-[190px] text-left">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 p-[1px] shrink-0">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[8px] ">
                                  {activeAccount?.username ? activeAccount.username[0] : "Z"}
                                </div>
                              </div>
                              <span className="text-[10px]  text-white truncate">
                                {activeAccount?.username || "your_brand"}
                              </span>
                            </div>
                            <p className="text-[9.5px] text-white/90 line-clamp-2 leading-tight">
                              {instagramCustomCaption || title || "Check out our latest post!"}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* ── FORMAT 2 & 3: INSTAGRAM FEED POST & CAROUSEL (1:1 Square Feed Mockup) ── */}
                      {(instagramPostType === "IMAGE" || instagramPostType === "CAROUSEL") && (
                        <div className="relative w-full h-full bg-black flex flex-col justify-between overflow-hidden">
                          {/* Instagram Top Bar */}
                          <div className="pt-4 px-3 pb-1.5 flex items-center justify-between border-b border-zinc-800 bg-black">
                            <span className="font-serif italic text-base  text-white">Instagram</span>
                            <div className="flex items-center gap-2.5 text-white">
                              <Heart className="w-4 h-4 text-white" />
                              <Send className="w-4 h-4 text-white" />
                            </div>
                          </div>

                          {/* Feed Post Content */}
                          <div className="flex-1 flex flex-col justify-start overflow-hidden text-left">
                            {/* User Header */}
                            <div className="px-2.5 py-1.5 flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 p-[1px]">
                                  <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-[8px]  text-white">
                                    {activeAccount?.username ? activeAccount.username[0].toUpperCase() : "Z"}
                                  </div>
                                </div>
                                <span className="text-[10px]  text-white truncate">
                                  {activeAccount?.username || "brand_official"}
                                </span>
                              </div>
                              <MoreHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                            </div>

                            {/* 1:1 Square Media Box */}
                            <div className="relative w-full aspect-square bg-[#151515] flex items-center justify-center overflow-hidden group/slide">
                              {instagramPostType === "CAROUSEL" ? (
                                carouselUrls.length > 0 ? (
                                  <>
                                    {carouselUrls[carouselIndex]?.toLowerCase().endsWith(".mp4") || carouselUrls[carouselIndex]?.toLowerCase().endsWith(".mov") || carouselUrls[carouselIndex]?.includes("/video/upload/") ? (
                                      <video src={carouselUrls[carouselIndex]} className="w-full h-full object-cover" autoPlay loop playsInline muted />
                                    ) : (
                                      <img src={carouselUrls[carouselIndex]} alt={`Slide ${carouselIndex + 1}`} className="w-full h-full object-cover" />
                                    )}

                                    {/* Slide Counter Badge */}
                                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px]  text-white shadow-sm border border-white/10">
                                      {carouselIndex + 1}/{carouselUrls.length}
                                    </div>

                                    {/* Interactive Navigation Chevrons */}
                                    {carouselUrls.length > 1 && (
                                      <>
                                        {carouselIndex > 0 && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setCarouselIndex(prev => Math.max(0, prev - 1));
                                            }}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-90 cursor-pointer shadow z-20"
                                          >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                        {carouselIndex < carouselUrls.length - 1 && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setCarouselIndex(prev => Math.min(carouselUrls.length - 1, prev + 1));
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-90 cursor-pointer shadow z-20"
                                          >
                                            <ChevronRight className="w-3.5 h-3.5" />
                                          </button>
                                        )}

                                        {/* Pagination Dots */}
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-xs z-20">
                                          {carouselUrls.map((_, i) => (
                                            <div
                                              key={i}
                                              className={`rounded-full transition-all duration-200 ${i === carouselIndex ? "w-1.5 h-1.5 bg-[#0095f6]" : "w-1 h-1 bg-white/50"
                                                }`}
                                            />
                                          ))}
                                        </div>
                                      </>
                                    )}
                                  </>
                                ) : (
                                  <div className="text-center p-4 text-white/40">
                                    <Layers className="w-9 h-9 mx-auto mb-1 opacity-50 text-[#c4c0ff]" />
                                    <span className="text-[10px]  block text-white">Carousel Album</span>
                                  </div>
                                )
                              ) : mediaUrl || mediaList[0]?.url ? (
                                (mediaUrl || mediaList[0]?.url).includes(".mp4") ? (
                                  <video src={mediaUrl || mediaList[0]?.url} poster={coverUrl || undefined} className="w-full h-full object-cover" autoPlay loop playsInline muted />
                                ) : (
                                  <img src={coverUrl || mediaUrl || mediaList[0]?.url} alt="Feed post" className="w-full h-full object-cover" />
                                )
                              ) : (
                                <div className="text-center p-4 text-zinc-500">
                                  <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50 text-[#c4c0ff]" />
                                  <span className="text-[9px]  block text-zinc-400">Post Photo</span>
                                </div>
                              )}
                            </div>

                            {/* Engagement Action Bar */}
                            <div className="px-2.5 pt-1.5 pb-1 flex items-center justify-between text-white">
                              <div className="flex items-center gap-2.5">
                                <Heart className="w-4 h-4 text-white" />
                                <MessageCircle className="w-4 h-4 text-white" />
                                <Send className="w-4 h-4 text-white" />
                              </div>
                              <Bookmark className="w-4 h-4 text-white" />
                            </div>

                            {/* Likes Count & Caption */}
                            <div className="px-2.5 space-y-0.5 text-[9.5px]">
                              <p className=" text-white">1,428 likes</p>
                              <p className="text-zinc-300 line-clamp-2">
                                <strong className="mr-1 text-white">{activeAccount?.username || "your_brand"}</strong>
                                {instagramCustomCaption || title || "Your post caption..."}
                              </p>
                              <p className="text-[7.5px] text-zinc-500 pt-0.5">2 HOURS AGO</p>
                            </div>
                          </div>

                          {/* Home Indicator */}
                          <div className="w-16 h-1 bg-zinc-700 rounded-full mx-auto my-1 shrink-0" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT FORM: Configuration Fields (7 Columns) */}
              <div
                className={`lg:col-span-7 xl:col-span-7 lg:order-last p-3 sm:p-6 space-y-4 text-left border-l-0 lg:border-l border-white/10 overflow-y-auto custom-scrollbar bg-[#131313] ${automationMobileView === "edit" ? "block" : "hidden lg:block"
                  }`}
              >
                {/* 1. Type (Instagram Post Format - 3 options strip) */}
                <div className="space-y-1.5 border-b border-[#2a2a2a] pb-3.5">
                  <label className="text-[11px] font-semibold text-[#8e9192]">Type</label>
                  <div className="grid grid-cols-3 gap-1 bg-[#101115] p-1 rounded-md border border-[#2a2a2a] w-full">
                    {availablePostFormats.map((opt) => {
                      const isSelected = instagramPostType === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setInstagramPostType(opt.value as any)}
                          className={`px-2 py-1.5 rounded-md text-[10px] sm:text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${isSelected
                            ? "bg-white text-zinc-950 shadow-sm "
                            : "text-[#8e9192] hover:text-white"
                            }`}
                        >
                          <span className="truncate">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Media Upload Section */}
                {instagramPostType === "CAROUSEL" ? (
                  <div className="space-y-2.5 border-b border-[#2a2a2a] pb-3.5">
                    <div className="flex items-center justify-between text-[11px]  text-[#8e9192] tracking-wider">
                      <span>Carousel ({carouselUrls.length}/10)</span>
                      <span className="text-[10px] text-[#c4c0ff] font-semibold">Max 10 items</span>
                    </div>

                    {/* Slides Grid Preview */}
                    {carouselUrls.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2.5 bg-[#1c1b1b] border border-white/10 rounded-lg">
                        {carouselUrls.map((url, idx) => {
                          const isVid = url.toLowerCase().endsWith(".mp4") || url.toLowerCase().endsWith(".mov") || url.includes("/video/upload/");
                          return (
                            <div
                              key={idx}
                              className={cn(
                                "relative aspect-square rounded-md overflow-hidden border bg-black group transition-all cursor-pointer",
                                carouselIndex === idx ? "border-[#c4c0ff] ring-2 ring-[#c4c0ff]/30" : "border-white/10"
                              )}
                              onClick={() => setCarouselIndex(idx)}
                            >
                              {isVid ? (
                                <video src={url} className="w-full h-full object-cover" />
                              ) : (
                                <img src={url} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                              )}
                              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px]  text-white">
                                #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeCarouselSlide(idx);
                                }}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/75 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Carousel Upload Dropzone */}
                    {carouselUrls.length < 10 && (
                      <label className="border border-dashed border-white/15 hover:border-[#c4c0ff]/60 rounded-lg p-4 flex flex-col items-center justify-center gap-1 bg-[#1c1b1b]/40 hover:bg-[#1c1b1b] cursor-pointer transition-all">
                        <div className="w-7 h-7 rounded bg-[#c4c0ff]/10 flex items-center justify-center text-[#c4c0ff]">
                          <Upload className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs  text-white">
                          {uploadingMedia ? `Uploading (${mediaUploadProgress}%)...` : "Upload Slides (Multi-select)"}
                        </span>

                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleCarouselFilesUpload(e.target.files);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5 border-b border-[#2a2a2a] pb-3.5">
                    <div className="flex items-center justify-between text-[11px]  text-[#8e9192] tracking-wider">
                      <span>Media</span>
                    </div>

                    {mediaUrl ? (
                      <div className="p-2.5 rounded bg-[#1c1b1b] border border-white/10 flex items-center justify-between gap-3 shadow-inner">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-12 h-12 rounded bg-black flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                            {instagramPostType === "REELS" || mediaUrl.includes(".mp4") ? (
                              <video src={mediaUrl} className="w-full h-full object-cover" />
                            ) : (
                              <img src={mediaUrl} alt="Uploaded" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="truncate">
                            {/* <p className="text-xs  text-white truncate">{mediaUrl}</p> */}
                            <p className="text-[10px] text-[#c4c0ff] font-medium flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Ready
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setMediaUrl("")}
                          className="px-2.5 py-1 rounded bg-white/5 hover:bg-rose-500/20 text-white/70 hover:text-rose-300 text-[10px]  transition-colors cursor-pointer"
                        >
                          Replace
                        </button>
                      </div>
                    ) : (
                      <label className="border border-dashed border-white/15 hover:border-[#c4c0ff]/60 rounded-lg p-4 sm:p-5 flex flex-col items-center justify-center gap-1 bg-[#1c1b1b]/40 hover:bg-[#1c1b1b] cursor-pointer transition-all">
                        <div className="w-7 h-7 rounded bg-[#c4c0ff]/10 flex items-center justify-center text-[#c4c0ff]">
                          <Upload className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs  text-white">
                          {uploadingMedia ? `Uploading (${mediaUploadProgress}%)...` : "Upload Photo or Video"}
                        </span>
                        <span className="text-[10px] text-[#8e9192]">
                          MP4, MOV, JPG, PNG
                        </span>
                        <input
                          type="file"
                          accept={instagramPostType === "REELS" ? "video/*" : "image/*,video/*"}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              uploadToCloudinary(e.target.files[0], false);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                )}

                {/* 3. Custom Reel / Video Thumbnail Cover */}
                {instagramPostType === "REELS" && (
                  <div className="space-y-1.5 border-b border-[#2a2a2a] pb-3.5">
                    <label className="text-[11px]  text-[#8e9192] tracking-wider flex items-center justify-between">
                      <span>Thumbnail (Optional)</span>
                    </label>

                    {coverUrl ? (
                      <div className="p-2 rounded bg-[#1c1b1b] border border-white/10 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <img src={coverUrl} alt="Cover" className="w-8 h-10 object-cover rounded border border-white/10" />
                          <span className="text-xs text-[#c4c0ff] font-medium">Cover Attached</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCoverUrl("")}
                          className="text-[10px] text-white/50 hover:text-rose-300  cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="p-2.5 rounded bg-[#1c1b1b] border border-white/10 hover:border-white/20 flex items-center justify-between cursor-pointer transition-all">
                        <span className="text-xs text-[#8e9192]">
                          {uploadingCover ? `Uploading (${coverUploadProgress}%)...` : "Choose high-res thumbnail photo"}
                        </span>
                        <span className="text-xs text-[#c4c0ff]  flex items-center gap-1">
                          <Upload className="w-3.5 h-3.5" /> Upload
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              uploadToCloudinary(e.target.files[0], true);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                )}

                {/* 3. Post Caption */}
                <div className="space-y-1.5 border-b border-[#2a2a2a] pb-3.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#8e9192]">
                    <span>Caption</span>
                    <span className={instagramCustomCaption.length > 2200 ? "text-rose-400 " : "text-[#8e9192]"}>
                      {instagramCustomCaption.length} / 2200
                    </span>
                  </div>
                  <textarea
                    value={instagramCustomCaption}
                    onChange={(e) => setInstagramCustomCaption(e.target.value)}
                    placeholder="Write a caption..."
                    rows={4}
                    className="w-full bg-[#1c1b1b] border border-white/10 rounded p-2.5 text-xs text-white placeholder-[#8e9192]/50 outline-none focus:border-[#c4c0ff] transition-all resize-none"
                  />

                  {/* Hashtag Quick Inserter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-[#8e9192] font-semibold mr-0.5">Add Tags:</span>
                    {[
                      "#ecommerce",
                      "#viral",
                      "#trending",
                      "#anydm",
                      "#newarrival"
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setInstagramCustomCaption(prev => prev ? `${prev} ${tag}` : tag);
                        }}
                        className="px-2 py-0.5 rounded-full bg-[#20201f] border border-[#2a2a2a] hover:border-[#c4c0ff] text-[10px] text-[#c4c0ff] font-semibold hover:bg-[#c4c0ff]/10 transition-all cursor-pointer active:scale-95"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Share to Profile Grid Toggle (for Reels) */}
                {instagramPostType === "REELS" && (
                  <div className="p-3 rounded bg-[#1c1b1b] border border-white/10 flex items-center justify-between">
                    <div className="space-y-0.5 text-left">
                      <p className="text-xs  text-white">Share to Profile Grid</p>
                      <p className="text-[10px] text-[#8e9192]">Show reel in main profile feed</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPostToInstagram(!postToInstagram)}
                      className={`w-10 h-5.5 rounded-full transition-colors p-0.5 flex items-center ${postToInstagram ? "bg-[#c4c0ff] justify-end" : "bg-white/20 justify-start"
                        }`}
                    >
                      <div className={`w-4.5 h-4.5 rounded-full shadow-sm ${postToInstagram ? "bg-black" : "bg-white"}`} />
                    </button>
                  </div>
                )}
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