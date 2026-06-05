"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Link as LinkIcon
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
  const [currency, setCurrency] = useState("USD");
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

  // Redux connected user & Instagram context
  const appUser = useSelector((state: RootState) => state.auth.user);
  const instagramAccounts = useSelector((state: RootState) => state.auth.instagramAccounts);
  const activeAccount = instagramAccounts.find(acc => acc.id === appUser?.active_instagram_account_id) || instagramAccounts[0];

  // Source Type
  const [productSource, setProductSource] = useState<"instagram" | "manual">("manual");

  // Variant States
  const [variants, setVariants] = useState<string[]>(["Black", "Olive", "S", "M", "L", "XL"]);
  const [newVariant, setNewVariant] = useState("");

  // Instagram Modal State
  const [showInstagramModal, setShowInstagramModal] = useState(false);

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

      if (captionParam) {
        setDescription(captionParam);
        const croppedTitle = captionParam.split(/[.!?]/)[0].trim();
        setTitle(croppedTitle.length > 50 ? croppedTitle.slice(0, 47) + "..." : croppedTitle);
      }

      // Read selected media details from sessionStorage (from InstagramImportModal)
      let storedMedia: any = null;
      try {
        const stored = sessionStorage.getItem("instagram_selected_media");
        if (stored) {
          storedMedia = JSON.parse(stored);
          setTimeout(() => sessionStorage.removeItem("instagram_selected_media"), 500);
        }
      } catch (e) { /* ignore parse error */ }

      // Handle Carousel vs Single Media
      if (
        mediaTypeParam === "CAROUSEL_ALBUM" &&
        storedMedia?.children?.data &&
        storedMedia.children.data.length > 0
      ) {
        const carouselItems: MediaItem[] = storedMedia.children.data.map((child: any, index: number) => ({
          id: `${child.id}_${Date.now()}_${index}`,
          url: child.media_url || child.thumbnail_url,
          thumbnail_url: child.thumbnail_url || undefined,
          type: (child.media_type === "VIDEO" ? "VIDEO" : "IMAGE") as "IMAGE" | "VIDEO",
          isMain: index === 0
        }));
        setMediaList(carouselItems);
        showToast(`Imported ${carouselItems.length} media items from carousel!`, "success");
      } else {
        const resolvedThumbnail = thumbnailUrlParam || storedMedia?.thumbnail_url || undefined;
        setMediaList([{
          id: `${mediaIdParam || "ig_imported"}_${Date.now()}`,
          url: mediaUrlParam,
          thumbnail_url: resolvedThumbnail,
          type: (mediaTypeParam === "VIDEO" ? "VIDEO" : "IMAGE") as "IMAGE" | "VIDEO",
          isMain: true
        }]);
        showToast("Instagram media imported successfully!", "success");
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
      setCurrency(product.currency || "USD");
      setCategory(product.category || "Apparel");
      setStock(product.stock ? product.stock.toString() : "10");
      setLocation(product.location || "");
      setNegotiable(product.negotiable || false);
      setStatus(product.status || "PUBLISHED");
      setProductSource(product.source === "instagram" ? "instagram" : "manual");

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
        const metadataArray = Object.entries(product.metadata).map(([key, value]) => ({
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

  // Drag and Drop support
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

          showToast(`Uploaded "${file.name}" successfully!`, "success");
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

  const handleImportInstagramMedia = async (item: any) => {
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
          let thumbnailUrl = undefined;
          if (asset.media_type === "VIDEO") {
            thumbnailUrl = asset.thumbnail_url || asset.url.replace(/\.[^/.]+$/, ".jpg");
          }
          uploadedAssets.push({
            id: asset.id,
            url: asset.url,
            thumbnail_url: thumbnailUrl,
            type: asset.media_type === "VIDEO" ? "VIDEO" : "IMAGE"
          });
        }
        setUploadProgress(Math.round(((i + 1) / total) * 100));
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

      showToast("Instagram media assets added successfully!", "success");
    } catch (e) {
      console.error("Asset import error:", e);
      showToast("Failed to process Instagram assets", "error");
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };

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

  // Submit and save
  const handleSave = async (submitStatus: "PUBLISHED" | "DRAFT") => {
    if (!title) {
      showToast("Product title is required", "error");
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      showToast("Please specify a valid price", "error");
      return;
    }
    if (mediaList.length === 0) {
      showToast("Please upload or select at least one media item", "error");
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
      cloudinary_metadata: mainMedia.cloudinary_metadata || null,
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
      showToast(isEditing ? "Product updated successfully!" : "Product created successfully!", "success");

      setTimeout(() => {
        router.push("/dashboard/products/catalog");
      }, 1000);
    } catch (err) {
      console.warn("Backend API unreachable. Storing product changes locally.");
      updateLocalStorage(submitStatus, productPayload);
      showToast(isEditing ? "Product updated locally!" : "Product created locally!", "success");

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
      className="max-w-6xl mx-auto text-white pb-16 space-y-6"
    >
      {/* Top Header / Breadcrumb navigation */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <nav className="flex items-center gap-2 text-gray-400 text-xs mb-2">
            <Link href="/dashboard/products/catalog" className="hover:text-white transition-colors">Products</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-white">{isEditing ? "Edit Product" : "Create Product"}</span>
          </nav>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {isEditing ? `Edit: ${title || "Product"}` : "Create New Product"}
            {!isEditing && productSource === "instagram" && <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />}
          </h2>
        </div>
        <div className="flex gap-2 text-xs">
          <button 
            onClick={() => router.push("/dashboard/products/catalog")}
            className="px-4 py-2 rounded-lg border border-white/10 text-white font-semibold hover:bg-white/5 transition-all"
          >
            Discard
          </button>
          <button 
            disabled={loading}
            onClick={() => handleSave(status)}
            className="px-4 py-2 rounded-lg bg-white text-black font-bold hover:bg-[#eaeaea] transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : isEditing ? "Save Updates" : "Create Product"}
          </button>
        </div>
      </div>

      {initialLoading ? (
        <div className="py-20 text-center text-gray-500 font-medium">
          <RefreshCw className="w-10 h-10 animate-spin text-white mx-auto mb-4" />
          Loading product details...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Primary Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Media Assets Section */}
            <section className="glass-pane rounded-xl p-6 border border-white/10 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Media Assets</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">Click any image to set it as cover. The first image will be cover by default.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowInstagramModal(true)}
                    className="text-white bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all"
                  >
                    <svg className="w-3.5 h-3.5 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <span>Import Instagram Media</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-white bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Asset
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

              {/* Drag and Drop upload area */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white/[0.02]",
                  dragActive ? "border-white bg-white/[0.05]" : "border-white/10",
                  mediaList.length === 0 ? "h-40" : "py-4"
                )}
              >
                <Upload className="w-8 h-8 text-gray-500 mb-2" />
                <p className="text-xs text-gray-300 font-medium">
                  Drag & drop assets here, or click to upload
                </p>
                <p className="text-[10px] text-gray-500 mt-1">Supports PNG, JPG, JPEG, MP4 files</p>
              </div>

              {uploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Uploading asset...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              {/* Media Grid */}
              {mediaList.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mediaList.map((item, i) => (
                    <div 
                      key={item.id}
                      onClick={() => setMainMedia(item.id)}
                      className={cn(
                        "relative aspect-square rounded-lg overflow-hidden border cursor-pointer group transition-all",
                        item.isMain ? "border-white scale-[0.98]" : "border-white/10 hover:border-white/20"
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
                          className="p-1 bg-black/60 hover:bg-black/90 text-red-500 rounded-md border border-white/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      {item.isMain && (
                        <div className="absolute bottom-1.5 left-1.5 bg-white text-black text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow">
                          Cover
                        </div>
                      )}
                      
                      <div className="absolute top-1.5 left-1.5 bg-black/50 backdrop-blur-md p-1 rounded border border-white/10 shadow-sm flex items-center justify-center">
                        {item.type === "VIDEO" ? <VideoIcon className="w-3 h-3 text-white" /> : <ImageIcon className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Core Details section */}
            <section className="glass-pane rounded-xl p-6 border border-white/10 space-y-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Core Details</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5 uppercase tracking-wider font-bold">Product Title</label>
                  <input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    type="text" 
                    placeholder="Enter product title..."
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-white/30 focus:ring-0 outline-none transition-all text-white placeholder:text-gray-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1.5 uppercase tracking-wider font-bold">Price</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        type="text" 
                        placeholder="0.00"
                        className="w-full bg-black/20 border border-white/10 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:border-white/30 focus:ring-0 outline-none transition-all text-white placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1.5 uppercase tracking-wider font-bold">Compare at Price (Original)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input 
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        type="text" 
                        placeholder="0.00"
                        className="w-full bg-black/20 border border-white/10 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:border-white/30 focus:ring-0 outline-none transition-all text-white placeholder:text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 bg-black/10 px-4 rounded-lg border border-white/5">
                  <span className="text-xs font-semibold text-gray-300">Allow Price Negotiation</span>
                  <label className="relative flex items-center cursor-pointer my-2">
                    <input 
                      type="checkbox" 
                      checked={negotiable}
                      onChange={(e) => setNegotiable(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-white peer-checked:after:bg-black peer-checked:after:border-white"></div>
                  </label>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1.5 uppercase tracking-wider font-bold">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter rich descriptions..."
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm h-40 focus:border-white/30 focus:ring-0 outline-none transition-all text-white placeholder:text-gray-600 leading-relaxed"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Sidebar Metadata */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Social Context Card */}
            {productSource === "instagram" && (
              <section className="glass-pane rounded-xl p-5 border border-white/10 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3">
                  <div className="flex items-center gap-1 bg-pink-500/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-pink-500/20 text-[9px] font-bold text-pink-400">
                    <svg className="w-2.5 h-2.5 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <span>INSTAGRAM POST</span>
                  </div>
                </div>
                
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Social Context</h3>
                
                <div className="rounded-lg overflow-hidden border border-white/5 bg-white/5 group relative aspect-video mt-2">
                  <img 
                    className="w-full h-full object-cover opacity-80" 
                    src={mediaUrlParam || (mediaList[0]?.url)} 
                    alt="Instagram Post visual" 
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-[10px]">
                    <span className="font-bold text-white flex items-center gap-1">
                      <img 
                        src={activeAccount?.profile_picture_url || "https://picsum.photos/seed/elena/100/100"} 
                        className="w-4 h-4 rounded-full object-cover border border-white/20" 
                        alt="Profile avatar"
                      />
                      @{activeAccount?.username || "instagram_feed"}
                    </span>
                    <span className="text-gray-400">Imported Feed</span>
                  </div>
                </div>
                {captionParam && (
                  <p className="text-[12px] text-gray-400 italic line-clamp-3">
                    "{captionParam}"
                  </p>
                )}
                {mediaIdParam && (
                  <a 
                    href={`https://instagram.com/p/${mediaIdParam}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/5 transition-all mt-2"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    View Original Post
                  </a>
                )}
              </section>
            )}

            {/* Inventory Management Card */}
            <section className="glass-pane rounded-xl p-5 border border-white/10 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Inventory & Details</h3>
              
              <div className="space-y-3.5">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-white/30 focus:ring-0 outline-none text-white cursor-pointer"
                  >
                    <option className="bg-[#1c1b1b] text-white" value="PUBLISHED">Published</option>
                    <option className="bg-[#1c1b1b] text-white" value="DRAFT">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Category</label>
                  {!isAddingCategory ? (
                    <div className="flex gap-2">
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-white/30 focus:ring-0 outline-none text-white cursor-pointer"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat} className="bg-[#1c1b1b] text-white">{cat}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => setIsAddingCategory(true)}
                        className="p-2 border border-white/10 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input 
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Add category..."
                        type="text"
                        className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:border-white/30 focus:ring-0 outline-none text-white"
                      />
                      <button 
                        onClick={handleAddCategory}
                        className="p-1.5 bg-white text-black rounded-lg hover:bg-[#eaeaea]"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setIsAddingCategory(false)}
                        className="p-1.5 border border-white/10 text-gray-400 rounded-lg hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Stock Quantity</label>
                  <input 
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    type="number" 
                    placeholder="10"
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-white/30 focus:ring-0 outline-none text-white placeholder:text-gray-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Physical Location</label>
                  <input 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    type="text" 
                    placeholder="e.g. Mumbai, IN"
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-white/30 focus:ring-0 outline-none text-white placeholder:text-gray-600"
                  />
                </div>
              </div>

              {/* Variants Section */}
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block">Active Variants</label>
                <div className="flex flex-wrap gap-1.5">
                  {variants.map(v => (
                    <span 
                      key={v}
                      className="px-2.5 py-0.5 bg-white/5 rounded-full text-[10px] font-semibold border border-white/10 flex items-center gap-1 group text-gray-300"
                    >
                      {v}
                      <button 
                        onClick={() => handleRemoveVariant(v)}
                        className="p-0.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-full"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-2 pt-1">
                  <input 
                    value={newVariant}
                    onChange={(e) => setNewVariant(e.target.value)}
                    placeholder="New variant (e.g. Red, XL)..."
                    type="text"
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:border-white/30 focus:ring-0 outline-none text-white"
                  />
                  <button 
                    onClick={handleAddVariant}
                    className="px-3 bg-white text-black font-bold text-xs rounded-lg hover:bg-[#eaeaea]"
                  >
                    Add
                  </button>
                </div>
              </div>
            </section>

            {/* Metadata (Key/Value) details */}
            <section className="glass-pane rounded-xl p-5 border border-white/10 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Technical Details</h3>
                <button 
                  onClick={() => setMetadata([...metadata, { key: "", value: "" }])}
                  className="text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded border border-white/10 text-[10px] font-bold"
                >
                  Add Detail
                </button>
              </div>

              <div className="space-y-2">
                {metadata.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input 
                      value={item.key}
                      onChange={(e) => {
                        const updated = [...metadata];
                        updated[i].key = e.target.value;
                        setMetadata(updated);
                      }}
                      placeholder="Specification (e.g. Size)"
                      className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <input 
                      value={item.value}
                      onChange={(e) => {
                        const updated = [...metadata];
                        updated[i].value = e.target.value;
                        setMetadata(updated);
                      }}
                      placeholder="Value (e.g. 10x20 inches)"
                      className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <button 
                      onClick={() => setMetadata(metadata.filter((_, idx) => idx !== i))}
                      className="p-1.5 border border-white/10 hover:bg-white/5 text-red-500 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {metadata.length === 0 && (
                  <p className="text-[11px] text-gray-500 text-center py-2">No custom details specified.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Instagram Selector Modal */}
      <InstagramImportModal 
        isOpen={showInstagramModal}
        onClose={() => setShowInstagramModal(false)}
        onSelectImport={handleImportInstagramMedia}
      />

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
