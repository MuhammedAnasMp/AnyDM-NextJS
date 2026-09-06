"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/services/api.service";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  CalendarClock,
  Plus,
  Video,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Play,
  Upload,
  RefreshCw,
  Send,
  Eye,
  Pencil,
  X,
  Smile,
  Hash,
  ChevronLeft,
  ChevronRight,
  Film,
  Search,
  LayoutGrid,
  List,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  ArrowUpRight,
  Plane,
  Share,
  Smartphone
} from "lucide-react";
import InstagramIcon from "@/components/ui/InstagramIcon";
import { cn } from "@/lib/utils";

interface ScheduledPost {
  id: number;
  post_type: "REELS" | "IMAGE" | "VIDEO" | "STORIES" | "CAROUSEL";
  post_type_label?: string;
  media_url: string;
  cover_url?: string | null;
  carousel_urls?: string[];
  caption: string;
  share_to_feed: boolean;
  scheduled_at: string | null;
  status: "DRAFT" | "SCHEDULED" | "PROCESSING" | "PUBLISHED" | "FAILED" | "CANCELLED";
  container_id?: string | null;
  instagram_media_id?: string | null;
  instagram_permalink?: string | null;
  error_message?: string | null;
  product?: number | null;
  published_at?: string | null;
  created_at: string;
  updated_at?: string;
  account_username?: string;
}

export default function InstagramSchedulerPage() {
  const instagramAccounts = useSelector((state: RootState) => state.auth.instagramAccounts);
  const appUser = useSelector((state: RootState) => state.auth.user);
  const activeAccount =
    instagramAccounts.find((acc: any) => acc.id === appUser?.active_instagram_account_id) ||
    instagramAccounts[0];

  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "SCHEDULED" | "PUBLISHED" | "FAILED">("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset to page 1 on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, typeFilter, pageSize]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postType, setPostType] = useState<"REELS" | "IMAGE" | "VIDEO" | "STORIES" | "CAROUSEL">("REELS");
  const [mediaUrl, setMediaUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [carouselUrls, setCarouselUrls] = useState<string[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [caption, setCaption] = useState("");
  const [shareToFeed, setShareToFeed] = useState(true);
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("later");
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [modalTab, setModalTab] = useState<"form" | "preview">("form");

  // Upload States
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaUploadProgress, setMediaUploadProgress] = useState(0);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);

  // Submitting State
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Inline Form Validation Errors
  const [errors, setErrors] = useState<{ media?: string; datetime?: string }>({});

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Scheduled Posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/automations/scheduled-posts/", {
        params: {
          status: activeTab !== "ALL" ? activeTab : undefined,
          type: typeFilter !== "ALL" ? typeFilter : undefined,
        },
      });
      setPosts(res.data.results || res.data || []);
    } catch (err: any) {
      console.error("Error fetching scheduled posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab, typeFilter]);

  // Real-Time WebSocket Synchronization
  useEffect(() => {
    if (!activeAccount) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    let host = "";
    let isSecure = false;
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://localapi.locanydm.online";

    if (rawApiUrl.startsWith("https://")) {
      host = rawApiUrl.substring(8);
      isSecure = true;
    } else if (rawApiUrl.startsWith("http://")) {
      host = rawApiUrl.substring(7);
      isSecure = false;
    } else if (typeof window !== "undefined") {
      isSecure = window.location.protocol === "https:";
      host = window.location.hostname + (window.location.port ? `:${window.location.port}` : "");
    }

    if (host.includes("/")) {
      host = host.split("/")[0];
    }

    const wsProtocol = isSecure ? "wss://" : "ws://";
    const wsUrl = `${wsProtocol}${host}/ws/inbox/?token=${token}&instagram_id=${activeAccount.id}`;

    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWs = () => {
      try {
        socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event_type === "scheduled_post_update") {
              const { action, post, post_id } = data;

              if (action === "deleted" && post_id) {
                setPosts((prev) => prev.filter((p) => p.id !== post_id));
              } else if (post) {
                setPosts((prev) => {
                  const exists = prev.some((p) => p.id === post.id);
                  if (exists) {
                    return prev.map((p) => (p.id === post.id ? post : p));
                  } else {
                    return [post, ...prev];
                  }
                });

                if (action === "published") {
                  showToast(`Post #${post.id} published live to Instagram!`, "success");
                } else if (action === "failed") {
                  showToast(`Post #${post.id} failed: ${post.error_message || "Meta API error"}`, "error");
                } else if (action === "processing") {
                  showToast(`Publishing post #${post.id} to Instagram...`, "success");
                }
              }
            }
          } catch (e) {
            console.error("[Schedule WS] Error parsing message:", e);
          }
        };

        socket.onclose = () => {
          reconnectTimeout = setTimeout(connectWs, 5000);
        };
      } catch (err) {
        console.warn("[Schedule WS] Connection failure:", err);
      }
    };

    connectWs();

    return () => {
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [activeAccount?.id]);

  const uploadSingleFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "any_dm_product_upload");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://api.cloudinary.com/v1_1/dx5bqewfx/auto/upload", true);
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

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "any_dm_product_upload");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.cloudinary.com/v1_1/dx5bqewfx/auto/upload", true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        if (isCover) setCoverUploadProgress(pct);
        else setMediaUploadProgress(pct);
      }
    };

    xhr.onload = () => {
      if (isCover) setUploadingCover(false);
      else setUploadingMedia(false);

      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          const secureUrl = data.secure_url;
          if (isCover) {
            setCoverUrl(secureUrl);
            showToast("Cover thumbnail uploaded successfully");
          } else {
            setMediaUrl(secureUrl);
            if (postType === "CAROUSEL") {
              setCarouselUrls(prev => [...prev, secureUrl]);
            } else if (postType !== "STORIES") {
              setPostType(isVideo ? "REELS" : "IMAGE");
            }
            showToast(`Uploaded ${file.name} successfully`);
          }
        } catch {
          showToast("Failed to parse upload response", "error");
        }
      } else {
        showToast("Cloudinary upload failed. Check file size.", "error");
      }
    };

    xhr.onerror = () => {
      if (isCover) setUploadingCover(false);
      else setUploadingMedia(false);
      showToast("Upload network error", "error");
    };

    xhr.send(formData);
  };

  const applyPresetTime = (hoursFromNow: number) => {
    const date = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
    const localIso = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setScheduledDateTime(localIso);
    setScheduleMode("later");
  };

  const insertHashtag = (tag: string) => {
    setCaption(prev => prev ? `${prev} ${tag}` : tag);
  };

  const validate = () => {
    const newErrors: { media?: string; datetime?: string } = {};
    if (postType === "CAROUSEL") {
      if (carouselUrls.length < 2)
        newErrors.media = "Carousel requires at least 2 photos or videos (max 10).";
    } else {
      if (!mediaUrl) newErrors.media = "Please upload a photo or video before posting.";
    }
    if (scheduleMode === "later" && !scheduledDateTime)
      newErrors.datetime = "Please pick a date and time to schedule this post.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload: any = {
        post_type: postType,
        media_url: postType === "CAROUSEL" ? carouselUrls[0] : mediaUrl,
        carousel_urls: postType === "CAROUSEL" ? carouselUrls : undefined,
        cover_url: coverUrl || null,
        caption: caption,
        share_to_feed: shareToFeed,
        publish_now: scheduleMode === "now",
      };

      if (scheduleMode === "later") {
        payload.scheduled_at = new Date(scheduledDateTime).toISOString();
      }

      await api.post("/automations/scheduled-posts/", payload);
      showToast(scheduleMode === "now" ? "Post queued for immediate publishing!" : "Post scheduled successfully!");
      setIsModalOpen(false);
      resetForm();
      fetchPosts();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to schedule post";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setMediaUrl("");
    setCoverUrl("");
    setCarouselUrls([]);
    setCarouselIndex(0);
    setCaption("");
    setShareToFeed(true);
    setScheduleMode("later");
    setScheduledDateTime("");
    setPostType("REELS");
    setErrors({});
  };

  const handlePublishNow = async (postId: number) => {
    if (!confirm("Are you sure you want to publish this post to Instagram right now?")) return;
    setActionLoadingId(postId);
    try {
      await api.post(`/automations/scheduled-posts/${postId}/publish-now/`);
      showToast("Publishing triggered!");
      fetchPosts();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to trigger publish", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this scheduled post?")) return;
    setActionLoadingId(postId);
    try {
      await api.delete(`/automations/scheduled-posts/${postId}/`);
      showToast("Scheduled post deleted");
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (err: any) {
      showToast("Failed to delete post", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (!searchQuery) return true;
      return (
        post.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.post_type_label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.post_type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [posts, searchQuery]);

  const totalPosts = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedPosts = useMemo(() => {
    const startIndex = (effectivePage - 1) * pageSize;
    return filteredPosts.slice(startIndex, startIndex + pageSize);
  }, [filteredPosts, effectivePage, pageSize]);

  const scheduledCount = posts.filter((p) => p.status === "SCHEDULED").length;
  const publishedCount = posts.filter((p) => p.status === "PUBLISHED").length;
  const failedCount = posts.filter((p) => p.status === "FAILED").length;

  return (
    <div className="relative space-y-5 overflow-hidden text-[#e5e2e1] pb-20 w-full font-sans">
      {/* Background Soft Purple/Lavender Ambient Glow */}
      <div
        className="-z-100 pointer-events-none absolute left-1/2 top-[-50px] h-[320px] w-[600px] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#c4c0ff]/0 via-[#c4c0ff]/15 to-[#c4c0ff]/0 blur-3xl"
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-4 py-2.5 rounded-md border text-xs font-semibold shadow-2xl flex items-center gap-2.5 backdrop-blur-xl ${toast.type === "success"
              ? "bg-[#1c1b1b] border-[#c4c0ff]/40 text-[#c4c0ff]"
              : "bg-rose-500/20 border-rose-500/40 text-rose-300"
              }`}
          >
            {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1c1b1b] p-5 rounded-lg border border-[#2a2a2a] shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* <div className="w-7 h-7 rounded-md bg-[#20201f] border border-[#2a2a2a] flex items-center justify-center text-[#c4c0ff]">
              <InstagramIcon className="w-4 h-4" />
            </div> */}
            <h1 className="text-md md:text-xl font-semibold tracking-tight text-[#e5e2e1]">
              Instagram Post Scheduler
            </h1>

          </div>
          <p className="text-xs text-[#8e9192]">
            Schedule Reels, Stories, Carousels &amp; Photos directly to Instagram.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          <button
            onClick={fetchPosts}
            className="p-2.5 rounded-md bg-[#20201f] border border-[#2a2a2a] text-[#8e9192] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            title="Refresh queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#c4c0ff]" : ""}`} />
          </button>

          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded shadow-md flex items-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Post</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bento (All 4 cards preserved) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-lg bg-[#1c1b1b] border border-[#2a2a2a] space-y-1 shadow-xl">
          <div className="flex items-center justify-between text-[#8e9192] text-xs font-semibold">
            <span>Pending Scheduled</span>
            <Clock className="w-4 h-4 text-[#c4c0ff]" />
          </div>
          <div className="text-2xl font-bold text-[#e5e2e1]">{scheduledCount}</div>
          <p className="text-[11px] text-[#8e9192]">Automated queue ready</p>
        </div>

        <div className="p-4 rounded-lg bg-[#1c1b1b] border border-[#2a2a2a] space-y-1 shadow-xl">
          <div className="flex items-center justify-between text-[#8e9192] text-xs font-semibold">
            <span>Published Live</span>
            <CheckCircle2 className="w-4 h-4 text-[#c4c0ff]" />
          </div>
          <div className="text-2xl font-bold text-[#e5e2e1]">{publishedCount}</div>
          <p className="text-[11px] text-[#8e9192]">Live posts on feed</p>
        </div>

        <div className="p-4 rounded-lg bg-[#1c1b1b] border border-[#2a2a2a] space-y-1.5 shadow-xl">
          <div className="flex items-center justify-between text-[#8e9192] text-xs font-semibold">
            <span>Daily 24h Quota</span>
            <span className="text-xs text-[#c4c0ff] font-semibold">{publishedCount}/100</span>
          </div>
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-[#101115] rounded-full overflow-hidden border border-[#2a2a2a]">
              <div
                className="h-full bg-[#c4c0ff] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (publishedCount / 100) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-[#8e9192]">{100 - publishedCount} upload slots remaining</p>
          </div>
        </div>


      </div>

      {/* Content Toolbar & Grid */}
      <div className="p-5 rounded-lg bg-[#1c1b1b] border border-[#2a2a2a] space-y-4 shadow-xl">
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#2a2a2a]">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-[#101115] p-1 rounded-md border border-[#2a2a2a]">
            {[
              { key: "ALL", label: "All Posts", count: posts.length },
              { key: "SCHEDULED", label: "Scheduled", count: scheduledCount },
              { key: "PUBLISHED", label: "Published", count: publishedCount },
              { key: "FAILED", label: "Failed", count: failedCount },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === t.key
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-[#8e9192] hover:text-white"
                  }`}
              >
                <span>{t.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-semibold ${activeTab === t.key ? "bg-zinc-200 text-zinc-950" : "bg-[#20201f] text-[#8e9192]"
                  }`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Format Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9192]" />
              <input
                type="text"
                placeholder="Search captions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#101115] border border-[#2a2a2a] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#e5e2e1] placeholder-[#8e9192] outline-none focus:border-[#c4c0ff] w-full sm:w-52 transition-all"
              />
            </div>

            {/* Format Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#101115] border border-[#2a2a2a] rounded-md px-3 py-1.5 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#8e9192]" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-[#e5e2e1] text-xs outline-none cursor-pointer border-none font-semibold"
              >
                <option value="ALL" className="bg-[#101115]">All Formats</option>
                <option value="REELS" className="bg-[#101115]">Reels</option>
                <option value="IMAGE" className="bg-[#101115]">Photo Posts</option>
                <option value="CAROUSEL" className="bg-[#101115]">Carousels</option>
                <option value="STORIES" className="bg-[#101115]">Stories</option>
                <option value="VIDEO" className="bg-[#101115]">Videos</option>
              </select>
            </div>

            {/* View Switcher */}
            <div className="flex items-center bg-[#101115] border border-[#2a2a2a] rounded-md p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-[#20201f] text-white" : "text-[#8e9192] hover:text-white"
                  }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-[#20201f] text-white" : "text-[#8e9192] hover:text-white"
                  }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Posts Rendering */}
        {loading && posts.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#8e9192] space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#c4c0ff]" />
            <p className="font-semibold text-[#e5e2e1]">Loading Instagram scheduling studio...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-14 text-center space-y-3 max-w-md mx-auto">
            <div className="w-10 h-10 rounded-md bg-[#20201f] border border-[#2a2a2a] flex items-center justify-center mx-auto text-[#c4c0ff]">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-[#e5e2e1]">No Posts Found</h4>
              <p className="text-xs text-[#8e9192] leading-relaxed">
                {searchQuery
                  ? `No posts matched "${searchQuery}".`
                  : activeTab === "ALL"
                    ? "You haven't scheduled any Instagram posts yet."
                    : `No posts found under "${activeTab}".`}
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-white text-zinc-950 text-xs font-bold rounded shadow-md hover:bg-zinc-200 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Post</span>
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-lg bg-[#101115] border border-[#2a2a2a] hover:border-[#444748] transition-all flex flex-col overflow-hidden group shadow-xl"
              >
                {/* Media Canvas */}
                <div className="relative h-48 bg-black flex items-center justify-center overflow-hidden">
                  {post.post_type === "REELS" || post.post_type === "VIDEO" || post.media_url?.includes(".mp4") ? (
                    <video
                      src={post.media_url}
                      poster={post.cover_url || undefined}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={post.cover_url || post.media_url}
                      alt="Post visual"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}

                  {/* Format Pill */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#101115]/80 backdrop-blur-md border border-[#2a2a2a] text-[10px] font-semibold text-white">
                    {post.post_type === "REELS" && <Film className="w-3 h-3 text-[#c4c0ff]" />}
                    {post.post_type === "STORIES" && <Play className="w-3 h-3 text-pink-400" />}
                    {post.post_type === "IMAGE" && <ImageIcon className="w-3 h-3 text-emerald-400" />}
                    {post.post_type === "CAROUSEL" && <Layers className="w-3 h-3 text-amber-400" />}
                    {post.post_type === "VIDEO" && <Video className="w-3 h-3 text-sky-400" />}
                    <span>{post.post_type === "CAROUSEL" ? `Carousel (${post.carousel_urls?.length || 2})` : (post.post_type_label || post.post_type)}</span>
                  </div>

                  {/* Status Pill */}
                  <div className="absolute top-2.5 right-2.5">
                    {post.status === "SCHEDULED" && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-semibold flex items-center gap-1 backdrop-blur-md">
                        <Clock className="w-3 h-3" /> Scheduled
                      </span>
                    )}
                    {post.status === "PROCESSING" && (
                      <span className="px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[10px] font-semibold flex items-center gap-1 backdrop-blur-md animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Publishing...
                      </span>
                    )}
                    {post.status === "PUBLISHED" && (
                      <span className="px-2 py-0.5 rounded-md bg-[#c4c0ff]/10 border border-[#c4c0ff]/30 text-[#c4c0ff] text-[10px] font-semibold flex items-center gap-1 backdrop-blur-md">
                        <CheckCircle2 className="w-3 h-3" /> Published
                      </span>
                    )}
                    {post.status === "FAILED" && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-semibold flex items-center gap-1 backdrop-blur-md">
                        <AlertCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <p className="text-xs text-[#e5e2e1] line-clamp-2 leading-relaxed">
                      {post.caption || <span className="italic text-[#8e9192]">No caption provided</span>}
                    </p>

                    {post.status === "FAILED" && post.error_message && (
                      <div className="p-2 rounded-md bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-400 font-medium">
                        <p className="line-clamp-2">{post.error_message}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-2.5 border-t border-[#2a2a2a] flex items-center justify-between text-xs">
                    <div className="text-[11px] text-[#8e9192] font-medium">
                      {post.status === "PUBLISHED" ? (
                        <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                      ) : (
                        <span>
                          {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Immediate"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {post.instagram_permalink && (
                        <a
                          href={post.instagram_permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded-md bg-[#20201f] border border-[#2a2a2a] hover:border-[#444748] text-white font-semibold text-[11px] flex items-center gap-1 transition-colors"
                          title="Open in Instagram"
                        >
                          <span>View Live</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {post.status !== "PUBLISHED" && post.status !== "PROCESSING" && (
                        <button
                          onClick={() => handlePublishNow(post.id)}
                          disabled={actionLoadingId === post.id}
                          className="px-2 py-1 rounded-md bg-[#c4c0ff]/10 hover:bg-[#c4c0ff]/20 text-[#c4c0ff] border border-[#c4c0ff]/30 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                        >
                          {actionLoadingId === post.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          <span>Publish</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        disabled={actionLoadingId === post.id}
                        className="p-1.5 rounded-md hover:bg-rose-500/10 text-[#8e9192] hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table / List View */
          <div className="border border-[#2a2a2a] rounded-md overflow-x-auto bg-[#101115]">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-[#1c1b1b] border-b border-[#2a2a2a] text-[#8e9192] font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Media</th>
                  <th className="py-2.5 px-4">Format</th>
                  <th className="py-2.5 px-4">Caption</th>
                  <th className="py-2.5 px-4">Target Time</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]/60">
                {paginatedPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="w-10 h-10 rounded-md bg-black overflow-hidden flex items-center justify-center border border-[#2a2a2a]">
                        {post.post_type === "REELS" || post.post_type === "VIDEO" ? (
                          <video src={post.media_url} poster={post.cover_url || undefined} className="w-full h-full object-cover" />
                        ) : (
                          <img src={post.cover_url || post.media_url} alt="Media" className="w-full h-full object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-[#e5e2e1]">
                      {post.post_type === "CAROUSEL" ? `Carousel (${post.carousel_urls?.length || 2})` : (post.post_type_label || post.post_type)}
                    </td>
                    <td className="py-2.5 px-4 max-w-xs truncate text-[#c4c7c8]">
                      {post.caption || <span className="italic text-[#8e9192]">No caption</span>}
                    </td>
                    <td className="py-2.5 px-4 text-[#8e9192]">
                      {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Immediate"}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${post.status === "PUBLISHED"
                        ? "bg-[#c4c0ff]/10 text-[#c4c0ff] border border-[#c4c0ff]/30"
                        : post.status === "SCHEDULED"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                        }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {post.instagram_permalink && (
                          <a href={post.instagram_permalink} target="_blank" rel="noopener noreferrer" className="text-[#c4c0ff] hover:underline flex items-center gap-1 font-semibold">
                            View <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {post.status !== "PUBLISHED" && (
                          <button onClick={() => handlePublishNow(post.id)} className="px-2 py-1 bg-[#20201f] border border-[#2a2a2a] hover:border-[#444748] text-[#e5e2e1] rounded-md text-[11px] font-semibold">
                            Publish Now
                          </button>
                        )}
                        <button onClick={() => handleDeletePost(post.id)} className="text-[#8e9192] hover:text-rose-400 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredPosts.length > 0 && (
          <div className="pt-4 border-t border-[#2a2a2a] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8e9192]">
            <div className="flex items-center gap-3">
              <span>
                Showing <strong className="text-white">{(effectivePage - 1) * pageSize + 1}</strong> to{" "}
                <strong className="text-white">{Math.min(effectivePage * pageSize, totalPosts)}</strong> of{" "}
                <strong className="text-white">{totalPosts}</strong> posts
              </span>

              <div className="flex items-center gap-1.5 bg-[#101115] border border-[#2a2a2a] rounded-md px-2 py-1 text-xs text-[#e5e2e1]">
                <span className="text-[10px] text-[#8e9192]">Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-transparent text-[#e5e2e1] text-xs outline-none cursor-pointer border-none font-semibold"
                >
                  <option value={8} className="bg-[#101115]">8</option>
                  <option value={12} className="bg-[#101115]">12</option>
                  <option value={24} className="bg-[#101115]">24</option>
                  <option value={48} className="bg-[#101115]">48</option>
                </select>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={effectivePage <= 1}
                  className="p-1.5 rounded-md bg-[#101115] hover:bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed border border-[#2a2a2a] transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      return Math.abs(page - effectivePage) <= 1;
                    })
                    .map((page, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && page - prev > 1;

                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && <span className="px-1 text-[#8e9192]">...</span>}
                          <button
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={cn(
                              "w-7 h-7 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center justify-center",
                              effectivePage === page
                                ? "bg-white text-zinc-950 font-bold shadow-sm"
                                : "bg-[#101115] hover:bg-white/5 text-[#8e9192] hover:text-white border border-[#2a2a2a]"
                            )}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={effectivePage >= totalPages}
                  className="p-1.5 rounded-md bg-[#101115] hover:bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed border border-[#2a2a2a] transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Centered Modal Popup Overlay (Portaled to document.body so it covers the sidebar) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isModalOpen && (
              <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsModalOpen(false)}
                  className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                />

            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              className="relative w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl h-[92vh] sm:h-[88vh] lg:h-[90vh] bg-[#141414] border border-white/15 rounded-xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-2.5 sm:p-3.5 px-3 sm:px-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#1c1b1b] gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="truncate">
                    <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">Schedular Studio</h3>
                    <p className="hidden md:block text-[10px] text-[#8e9192] truncate">Schedule &amp; publish Instagram posts, reels, stories &amp; carousels</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                  {/* Mobile Icon Tab Switcher */}
                  <div className="flex lg:hidden items-center gap-0.5 bg-[#20201f] p-0.5 rounded border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setModalTab("form")}
                      title="Editor"
                      className={`p-1.5 px-2 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${modalTab === "form" ? "bg-white text-black shadow-sm" : "text-[#8e9192]"
                        }`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Editor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalTab("preview")}
                      title="Live Preview"
                      className={`p-1.5 px-2 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${modalTab === "preview" ? "bg-white text-black shadow-sm" : "text-[#8e9192]"
                        }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Preview</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-2 sm:px-3 py-1.5 rounded bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-[#8e9192] hover:text-rose-400 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span className="">Cancel</span>
                  </button>

                  {/* Post / Schedule button — always visible in header */}
                  <button
                    type="submit"
                    form="creator-studio-form"
                    disabled={submitting || uploadingMedia}
                    className="px-3 sm:px-4 py-1.5 rounded bg-gradient-to-r from-white to-[#eaeaea] hover:from-white hover:to-white text-black text-xs font-bold shadow flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Posting...</span>
                      </>
                    ) : scheduleMode === "now" ? (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Post Now</span>
                        <span className="sm:hidden">Post</span>
                      </>
                    ) : (
                      <>
                        <CalendarClock className="w-3.5 h-3.5" />
                        <span>Schedule</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Modal Body (Left: iPhone Simulator, Right: Config Form) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1 min-h-0 overflow-hidden">
                {/* ── Right Config Form (7 Columns) — order-last on desktop so it renders right ── */}
                <form
                  id="creator-studio-form"
                  onSubmit={handleCreatePost}
                  className={`lg:col-span-7 xl:col-span-7 lg:order-last p-3 sm:p-6 space-y-4 sm:space-y-5 border-l-0 lg:border-l border-white/10 overflow-y-auto custom-scrollbar ${modalTab === "form" ? "block" : "hidden lg:block"
                    }`}
                >
                  {/* 1. Publishing Schedule (Small tab strip with width grid) */}
                  <div className="space-y-1.5 border-b border-[#2a2a2a] pb-4">
                    <label className="text-[11px] font-semibold text-[#8e9192]">
                      Schedule
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-[#101115] p-1 rounded-md border border-[#2a2a2a] w-full sm:w-fit">
                      <button
                        type="button"
                        onClick={() => setScheduleMode("now")}
                        className={`px-2 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 ${scheduleMode === "now"
                          ? "bg-white text-zinc-950 shadow-sm font-bold"
                          : "text-[#8e9192] hover:text-white"
                          }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Publish Now</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setScheduleMode("later");
                          if (!scheduledDateTime) {
                            applyPresetTime(1);
                          }
                        }}
                        className={`px-2 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 ${scheduleMode === "later"
                          ? "bg-white text-zinc-950 shadow-sm font-bold"
                          : "text-[#8e9192] hover:text-white"
                          }`}
                      >
                        <CalendarClock className="w-3.5 h-3.5" />
                        <span>Schedule Later</span>
                      </button>
                    </div>

                    {scheduleMode === "later" && (
                      <div className="space-y-2 pt-1.5 animate-in fade-in duration-200">
                        <div className="relative flex items-center">
                          <CalendarClock className="w-4 h-4 text-[#c4c0ff] absolute left-3 pointer-events-none" />
                          <input
                            type="datetime-local"
                            value={scheduledDateTime}
                            min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                            onChange={(e) => {
                              setScheduledDateTime(e.target.value);
                              if (e.target.value) setErrors(prev => ({ ...prev, datetime: undefined }));
                            }}
                            onClick={(e) => {
                              try {
                                (e.target as any).showPicker?.();
                              } catch { }
                            }}
                            className={`w-full bg-[#1c1b1b] border rounded-lg pl-9 pr-3 py-2 text-xs text-white outline-none transition-all [color-scheme:dark] cursor-pointer font-medium ${errors.datetime ? "border-rose-500 focus:border-rose-400" : "border-white/10 focus:border-[#c4c0ff]"
                              }`}
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          <span className="text-[10px] text-[#8e9192] font-semibold mr-0.5">Presets:</span>
                          {[
                            { label: "+1 Hour", hours: 1 },
                            { label: "+3 Hours", hours: 3 },
                            { label: "+6 Hours", hours: 6 },
                            { label: "Tomorrow", hours: 24 },
                            { label: "In 2 Days", hours: 48 },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => applyPresetTime(preset.hours)}
                              className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-white/5 hover:bg-white/10 hover:text-white border border-white/5 text-[9.5px] sm:text-[10px] font-semibold text-[#c4c7c8] transition-colors cursor-pointer"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                        {/* Datetime validation error */}
                        {errors.datetime && (
                          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-400">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />{errors.datetime}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content Format (Single line 4-column strip on all mobile & desktop screens) */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#8e9192]">Type</label>
                    <div className="grid grid-cols-4 gap-1 bg-[#101115] p-1 rounded-md border border-[#2a2a2a] w-full">
                      {[
                        { type: "REELS", label: "Reel", shortLabel: "Reel", icon: Film },
                        { type: "IMAGE", label: "Photo Post", shortLabel: "Photo", icon: ImageIcon },
                        { type: "CAROUSEL", label: "Carousel", shortLabel: "Carousel", icon: Layers },
                        { type: "STORIES", label: "Story", shortLabel: "Story", icon: Play },
                      ].map((fmt) => {
                        const Icon = fmt.icon;
                        const isSelected = postType === fmt.type;
                        return (
                          <button
                            key={fmt.type}
                            type="button"
                            onClick={() => setPostType(fmt.type as any)}
                            className={`px-1 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-0.5 sm:gap-1.5 ${isSelected
                              ? "bg-white text-zinc-950 shadow-sm font-bold"
                              : "text-[#8e9192] hover:text-white"
                              }`}
                          >
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-zinc-950" : "text-[#c4c0ff]"}`} />
                            <span className="truncate hidden sm:inline">{fmt.label}</span>
                            <span className="truncate sm:hidden">{fmt.shortLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Media Upload Section */}
                  {postType === "CAROUSEL" ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#8e9192] tracking-wider">
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
                                  "relative aspect-square rounded-md overflow-hidden border bg-black group transition-all",
                                  carouselIndex === idx ? "border-[#c4c0ff] ring-2 ring-[#c4c0ff]/30" : "border-white/10"
                                )}
                                onClick={() => setCarouselIndex(idx)}
                              >
                                {isVid ? (
                                  <video src={url} className="w-full h-full object-cover" />
                                ) : (
                                  <img src={url} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                                )}
                                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white">
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
                          <span className="text-xs font-bold text-white">
                            {uploadingMedia ? `Uploading (${mediaUploadProgress}%)...` : "Upload Slides"}
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
                      {/* Carousel error */}
                      {errors.media && (
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-400 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{errors.media}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#8e9192] tracking-wider">
                        <span>Media</span>
                      </div>

                      {mediaUrl ? (
                        <div className="p-2.5 rounded bg-[#1c1b1b] border border-white/10 flex items-center justify-between gap-3 shadow-inner">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-12 h-12 rounded bg-black flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                              {postType === "REELS" || postType === "VIDEO" || mediaUrl.includes(".mp4") ? (
                                <video src={mediaUrl} className="w-full h-full object-cover" />
                              ) : (
                                <img src={mediaUrl} alt="Uploaded" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-white truncate">{mediaUrl}</p>
                              <p className="text-[10px] text-[#c4c0ff] font-medium flex items-center gap-1 mt-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Ready
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setMediaUrl("")}
                            className="px-2.5 py-1 rounded bg-white/5 hover:bg-rose-500/20 text-white/70 hover:text-rose-300 text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Replace
                          </button>
                        </div>
                      ) : (
                        <label className={`border border-dashed rounded-lg p-4 sm:p-5 flex flex-col items-center justify-center gap-1 bg-[#1c1b1b]/40 hover:bg-[#1c1b1b] cursor-pointer transition-all ${errors.media ? "border-rose-500/60 hover:border-rose-400" : "border-white/15 hover:border-[#c4c0ff]/60"
                          }`}>
                          <div className="w-7 h-7 rounded bg-[#c4c0ff]/10 flex items-center justify-center text-[#c4c0ff]">
                            <Upload className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-white">
                            {uploadingMedia ? `Uploading (${mediaUploadProgress}%)...` : "Upload Photo or Video"}
                          </span>
                          <span className="text-[10px] text-[#8e9192]">
                            MP4, MOV, JPG, PNG
                          </span>
                          <input
                            type="file"
                            accept={postType === "REELS" || postType === "VIDEO" ? "video/*" : "image/*,video/*"}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                uploadToCloudinary(e.target.files[0], false);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                      {/* Single-media error */}
                      {errors.media && (
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-400 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{errors.media}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 3. Custom Reel Thumbnail Cover */}
                  {(postType === "REELS" || postType === "VIDEO") && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#8e9192] tracking-wider flex items-center justify-between">
                        <span>Thumbnail  (Optional)</span>
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
                            className="text-[10px] text-white/50 hover:text-rose-300 font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="p-2.5 rounded bg-[#1c1b1b] border border-white/10 hover:border-white/20 flex items-center justify-between cursor-pointer transition-all">
                          <span className="text-xs text-[#8e9192]">
                            {uploadingCover ? `Uploading (${coverUploadProgress}%)...` : "Choose"}
                          </span>
                          <span className="text-xs text-[#c4c0ff] font-bold flex items-center gap-1">
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

                  {/* 4. Caption & Tag Assistant */}
                  {postType !== "STORIES" && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#8e9192] tracking-wider">
                        <span>Caption</span>
                        <span className={caption.length > 2000 ? "text-rose-400" : "text-[#8e9192]"}>
                          {caption.length} / 2200
                        </span>
                      </div>
                      <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Write a caption..."
                        rows={4}
                        className="w-full bg-[#1c1b1b] border border-white/10 rounded p-2.5 text-xs text-white placeholder-[#8e9192]/50 outline-none focus:border-[#c4c0ff] transition-all resize-none"
                      />

                      {/* Hashtag & Caption Quick Inserter Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-[#8e9192] font-semibold mr-0.5">Add Tags:</span>
                        {[
                          "#ecommerce",
                          "#viral",
                          "#trending",
                          "#anydm",
                          "#giveaway",
                          "#linkinbio",
                          "#newarrival"
                        ].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => insertHashtag(tag)}
                            className="px-2.5 py-1 rounded-full bg-[#20201f] border border-[#2a2a2a] hover:border-[#c4c0ff] text-[10px] text-[#c4c0ff] font-semibold hover:bg-[#c4c0ff]/10 transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. Reels Grid Toggle */}
                  {postType === "REELS" && (
                    <div className="p-3 rounded bg-[#1c1b1b] border border-white/10 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white">Share to Profile Grid</p>
                        <p className="text-[10px] text-[#8e9192]">Show reel in main profile feed</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShareToFeed(!shareToFeed)}
                        className={`w-10 h-5.5 rounded-full transition-colors p-0.5 flex items-center ${shareToFeed ? "bg-[#c4c0ff] justify-end" : "bg-white/20 justify-start"
                          }`}
                      >
                        <div className={`w-4.5 h-4.5 rounded-full shadow-sm ${shareToFeed ? "bg-black" : "bg-white"}`} />
                      </button>
                    </div>
                  )}


                </form>

                {/* ── Left Canvas: iPhone 16 Pro Simulator (5 Columns) — order-first on desktop ── */}
                <div
                  className={`lg:col-span-5 xl:col-span-5 lg:order-first p-3 sm:p-5 bg-[#070707] flex flex-col items-center justify-start lg:justify-center border-r lg:border-r-0 border-t lg:border-t-0 relative select-none overflow-y-auto custom-scrollbar ${modalTab === "preview" ? "flex" : "hidden lg:flex"
                    }`}
                >
                  {/* Studio Ambient Glow */}
                  <div className="absolute w-80 h-80 bg-gradient-to-tr from-purple-600/15 via-[#c4c0ff]/15 to-pink-500/15 blur-3xl rounded-full pointer-events-none" />

                  {/* Header Tag with F                  {/* ── Responsive iPhone 16 Pro Wrapper ── */}
                  <div className="transform scale-[0.72] sm:scale-90 md:scale-95 lg:scale-100 origin-center sm:origin-top lg:origin-center -my-20 sm:-my-6 lg:my-0 flex justify-center shrink-0">
                    {/* ── iPhone 16 Pro Titanium Chassis ── */}
                    <div className="relative w-[310px] h-[630px] rounded-[50px] p-[10px] shadow-[0_30px_70px_-15px_rgba(0,0,0,1),0_0_0_1px_rgba(255,255,255,0.22),0_0_0_4px_#222222,0_0_20px_rgba(0,0,0,0.8)] bg-gradient-to-b from-[#3a3a3a] via-[#1c1c1e] to-[#2a2a2a] flex flex-col shrink-0 overflow-visible">

                      {/* Titanium Antenna Bands */}
                      <div className="absolute top-[80px] -left-[1px] w-[2px] h-[4px] bg-[#555] rounded-full" />
                      <div className="absolute top-[80px] -right-[1px] w-[2px] h-[4px] bg-[#555] rounded-full" />
                      <div className="absolute bottom-[80px] -left-[1px] w-[2px] h-[4px] bg-[#555] rounded-full" />
                      <div className="absolute bottom-[80px] -right-[1px] w-[2px] h-[4px] bg-[#555] rounded-full" />

                      {/* Left Hardware Buttons */}
                      {/* Action Button */}
                      <div className="absolute -left-[5px] top-[96px] w-[4px] h-[24px] bg-[#404040] border-l border-white/20 rounded-l-[3px] shadow-sm" />
                      {/* Volume Up */}
                      <div className="absolute -left-[5px] top-[138px] w-[4px] h-[48px] bg-[#404040] border-l border-white/20 rounded-l-[3px] shadow-sm" />
                      {/* Volume Down */}
                      <div className="absolute -left-[5px] top-[198px] w-[4px] h-[48px] bg-[#404040] border-l border-white/20 rounded-l-[3px] shadow-sm" />

                      {/* Right Hardware Buttons */}
                      {/* Power / Siri Button */}
                      <div className="absolute -right-[5px] top-[152px] w-[4px] h-[72px] bg-[#404040] border-r border-white/20 rounded-r-[3px] shadow-sm" />
                      {/* iPhone 16 Pro Camera Control Button */}
                      <div className="absolute -right-[4px] top-[375px] w-[3px] h-[40px] bg-[#2a2a2a] border border-white/20 rounded-r-[2px] shadow-inner" />

                      {/* ── OLED Display Bezel (Super Retina XDR) ── */}
                      <div className="relative w-full h-full bg-black rounded-[42px] overflow-hidden flex flex-col justify-between text-white border border-white/10 shadow-inner">

                        {/* Top Earpiece Speaker Slit */}
                        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-40 w-12 h-[3px] bg-[#1a1a1a] rounded-full" />

                        {/* ── iOS 18 Top Status Bar & Dynamic Island ── */}
                        <div className="absolute top-0 left-0 right-0 z-40 pt-3 px-6 flex items-center justify-between pointer-events-none">
                          {/* iOS Clock */}
                          <span className="text-[13px] font-semibold tracking-tight text-white font-sans">9:41</span>

                          {/* Dynamic Island */}
                          <div className="w-[105px] h-[26px] bg-black rounded-full border border-white/10 flex items-center justify-between px-2.5 shadow-md">
                            {/* FaceID Sensor */}
                            <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-[#262626] flex items-center justify-center">
                              <div className="w-1 h-1 rounded-full bg-[#050518]" />
                            </div>
                            {/* Front Camera Lens with Antireflective Sheen */}
                            <div className="w-2.5 h-2.5 rounded-full bg-[#070b18] border border-[#1e293b] flex items-center justify-center shadow-inner">
                              <div className="w-1 h-1 rounded-full bg-[#1e1b4b]" />
                            </div>
                          </div>

                          {/* Status Icons */}
                          <div className="flex items-center gap-1.5 text-white">
                            {/* Cellular Signal Bars */}
                            <div className="flex items-end gap-[1.5px] h-2.5">
                              <div className="w-[2px] h-[3px] bg-white rounded-[0.5px]" />
                              <div className="w-[2px] h-[5px] bg-white rounded-[0.5px]" />
                              <div className="w-[2px] h-[7px] bg-white rounded-[0.5px]" />
                              <div className="w-[2px] h-[9px] bg-white rounded-[0.5px]" />
                            </div>
                            <span className="text-[10px] font-bold tracking-tight">5G</span>
                            {/* Battery Capsule */}
                            <div className="flex items-center">
                              <div className="w-[20px] h-[10px] border border-white/80 rounded-[3px] p-[1px] flex items-center">
                                <div className="w-[14px] h-full bg-[#c4c0ff] rounded-[1px]" />
                              </div>
                              <div className="w-[1px] h-[4px] bg-white/80 rounded-r-[1px]" />
                            </div>
                          </div>
                        </div>

                        {/* ── FORMAT 1: INSTAGRAM REELS (Photorealistic 9:16 Fullscreen) ── */}
                        {postType === "REELS" && (
                          <div className="relative w-full h-full bg-black flex flex-col justify-between overflow-hidden">
                            {/* Video Canvas */}
                            <div
                              className="absolute inset-0 bg-[#0f0f0f] cursor-pointer"
                              onClick={() => setIsMuted(!isMuted)}
                            >
                              {mediaUrl ? (
                                <video
                                  src={mediaUrl}
                                  poster={coverUrl || undefined}
                                  className="w-full h-full object-cover"
                                  muted={isMuted}
                                  autoPlay
                                  loop
                                  playsInline
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#1a1024] via-[#101010] to-[#0a0a0a]">
                                  <Film className="w-8 h-8 text-[#c4c0ff] animate-pulse mb-2" />
                                  <span className="text-xs font-black text-white tracking-tight">Reel Preview</span>
                                </div>
                              )}

                              {/* Top & Bottom Vignette Gradients for Legibility */}
                              <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/95 pointer-events-none" />
                            </div>

                            {/* Top Reels Header Bar */}
                            <div className="relative z-30 pt-12 px-4 flex items-center justify-between text-white drop-shadow-md pointer-events-none">
                              <div className="flex items-center gap-1.5 font-black text-[20px] ">
                                <span>Reels</span>
                                <svg className="w-4 h-4 fill-current opacity-80 mt-0.5" viewBox="0 0 24 24">
                                  <path d="M7 10l5 5 5-5z" />
                                </svg>
                              </div>

                              <div className="flex items-center gap-2.5 pointer-events-auto">
                                {/* Audio Sound Equalizer Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMuted(!isMuted);
                                  }}
                                  className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/15 active:scale-90 transition-transform cursor-pointer"
                                  title={isMuted ? "Unmute" : "Mute"}
                                >
                                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#c4c0ff]" />}
                                </button>

                                {/* Camera Glyph */}
                                <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/15">
                                  <svg className="w-4 h-4 fill-none stroke-white stroke-[2.2]" viewBox="0 0 24 24">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                  </svg>
                                </div>
                              </div>
                            </div>

                            {/* Right Action Rail (Instagram Reels Exact Glyphs & Spacing) */}
                            <div className="absolute right-3.5 bottom-6 z-30 flex flex-col items-center gap-3.5 text-white drop-shadow-lg pointer-events-auto">
                              {/* Like Heart */}
                              <div className="flex flex-col items-center gap-0.5 cursor-pointer active:scale-90 transition-transform">
                                <div className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-xs flex items-center justify-center">
                                  <Heart></Heart>
                                </div>
                                <span className="text-[10px] font-bold text-white tracking-tight">142K</span>
                              </div>

                              {/* Comment Bubble */}
                              <div className="flex flex-col items-center gap-0.5 cursor-pointer active:scale-90 transition-transform">
                                <div className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-xs flex items-center justify-center">
                                  <MessageCircle></MessageCircle>
                                </div>
                                <span className="text-[10px] font-bold text-white tracking-tight">1,280</span>
                              </div>

                              {/* Share Paper Airplane */}
                              <div className="flex flex-col items-center gap-0.5 cursor-pointer active:scale-90 transition-transform">
                                <div className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-xs flex items-center justify-center">
                                  <Send></Send>
                                </div>
                                <span className="text-[10px] font-bold text-white tracking-tight">38.4K</span>
                              </div>

                              {/* 3 Horizontal Dots */}
                              <div className="cursor-pointer py-0.5 active:scale-90 transition-transform">
                                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                                  <circle cx="12" cy="5" r="2" />
                                  <circle cx="12" cy="12" r="2" />
                                  <circle cx="12" cy="19" r="2" />
                                </svg>
                              </div>

                              {/* Spinning Audio Album Vinyl Disc with Grooves */}
                              <div className="relative mt-0.5">
                                <div className="w-7 h-7 rounded-full bg-[#111] border-2 border-black p-[1.5px] shadow-2xl animate-spin [animation-duration:3.5s] flex items-center justify-center">
                                  {/* Vinyl Grooves */}
                                  <div className="w-full h-full rounded-full border border-white/20 p-[1.5px] flex items-center justify-center">
                                    {/* Center Colorful Album Art */}
                                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center">
                                      <div className="w-1 h-1 rounded-full bg-white" />
                                    </div>
                                  </div>
                                </div>
                                {/* Drifting Music Note */}
                                <div className="absolute -top-2 -left-1 text-[9px] text-white/90 animate-bounce">
                                  ♫
                                </div>
                              </div>
                            </div>

                            {/* Bottom Left Creator & Social Commerce Overlay (Anchored Directly Above Bottom Nav) */}
                            <div className="absolute left-3.5 bottom-6 z-30 p-0 text-white space-y-1.5 max-w-[215px] drop-shadow-md pointer-events-auto">
                              {/* Creator Row */}
                              <div className="flex items-center gap-2">
                                {/* Story Ring Avatar */}
                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] p-[1.5px] shadow-lg shrink-0">
                                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-black text-white">
                                    {activeAccount?.username ? activeAccount.username[0] : "Z"}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 truncate">
                                  <span className="text-xs font-black tracking-tight text-white truncate">
                                    {activeAccount?.username || "your_brand"}
                                  </span>
                                  {/* Verified Checkmark Badge */}
                                  <svg className="w-3.5 h-3.5 text-[#3897f0] fill-current shrink-0" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                  </svg>
                                </div>

                                {/* Follow Button */}
                                <button
                                  type="button"
                                  className="px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 border border-white/40 text-[9.5px] font-bold text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer shrink-0"
                                >
                                  Following
                                </button>
                              </div>

                              {/* Live Caption & Hashtags */}
                              <div className="text-[11px] text-white leading-tight drop-shadow-md">
                                <p className="line-clamp-2">
                                  <strong className="mr-1.5 font-black text-white">
                                    {activeAccount?.username || "your_brand"}
                                  </strong>
                                  <span className="text-white/95">
                                    {caption || "Caption here"}
                                  </span>
                                </p>
                              </div>

                              {/* Audio Track Tag with Graphic Wave */}
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-xs text-[9.5px] text-white/90 font-medium border border-white/10 max-w-full">
                                <span className="text-[10px]">🎵</span>
                                <span className="truncate">Original audio • @{activeAccount?.username || "creator"}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ── FORMAT 2: INSTAGRAM FEED POST (Photo / Video) ── */}
                        {(postType === "IMAGE" || postType === "VIDEO" || postType === "CAROUSEL") && (
                          <div className="relative w-full h-full bg-black flex flex-col justify-between overflow-hidden">
                            {/* Instagram Script Top Bar */}
                            <div className="pt-12 px-4 pb-2.5 flex items-center justify-between border-b border-white/5 bg-black">
                              <span className="font-serif italic text-xl font-black tracking-tight text-white">Instagram</span>
                              <div className="flex items-center gap-4 text-white">
                                {/* Notification Heart */}
                                <svg className="w-6 h-6 fill-none stroke-white stroke-2" viewBox="0 0 24 24">
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                                {/* DM Messenger with Badge */}
                                <div className="relative">
                                  <svg className="w-6 h-6 fill-none stroke-white stroke-2" viewBox="0 0 24 24">
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                  </svg>
                                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full text-[8px] flex items-center justify-center font-bold">1</span>
                                </div>
                              </div>
                            </div>

                            {/* Feed Post Content */}
                            <div className="flex-1 flex flex-col justify-start overflow-hidden">
                              {/* User Header */}
                              <div className="px-3 py-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-[1.5px]">
                                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                                      {activeAccount?.username ? activeAccount.username[0].toUpperCase() : "Z"}
                                    </div>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[11px] font-extrabold text-white leading-none">
                                      {activeAccount?.username || "brand_official"}
                                    </span>
                                    <span className="text-[9px] text-[#8e9192] leading-none mt-0.5">Original post</span>
                                  </div>
                                </div>
                                <svg className="w-5 h-5 fill-white/80" viewBox="0 0 24 24">
                                  <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
                                </svg>
                              </div>

                              {/* Media 1:1 Box */}
                              <div className="relative w-full aspect-square bg-[#151515] flex items-center justify-center overflow-hidden group/slide">
                                {postType === "CAROUSEL" ? (
                                  carouselUrls.length > 0 ? (
                                    <>
                                      {carouselUrls[carouselIndex]?.toLowerCase().endsWith(".mp4") || carouselUrls[carouselIndex]?.toLowerCase().endsWith(".mov") || carouselUrls[carouselIndex]?.includes("/video/upload/") ? (
                                        <video src={carouselUrls[carouselIndex]} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                                      ) : (
                                        <img src={carouselUrls[carouselIndex]} alt={`Slide ${carouselIndex + 1}`} className="w-full h-full object-cover" />
                                      )}

                                      {/* Slide Counter Badge */}
                                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-bold text-white shadow-sm border border-white/10">
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
                                      <span className="text-[10px] font-bold block text-white">Carousel Album</span>
                                    </div>
                                  )
                                ) : mediaUrl ? (
                                  postType === "VIDEO" || mediaUrl.includes(".mp4") ? (
                                    <video src={mediaUrl} poster={coverUrl || undefined} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                                  ) : (
                                    <img src={coverUrl || mediaUrl} alt="Feed post" className="w-full h-full object-cover" />
                                  )
                                ) : (
                                  <div className="text-center p-4 text-white/30">
                                    <ImageIcon className="w-9 h-9 mx-auto mb-1 opacity-40 text-[#c4c0ff]" />
                                    <span className="text-[10px] font-bold block text-white">Photo</span>
                                  </div>
                                )}
                              </div>

                              {/* Engagement Action Bar */}
                              <div className="px-3 pt-2.5 pb-1 flex items-center justify-between text-white">
                                <div className="flex items-center gap-4">
                                  <Heart />
                                  <MessageCircle />
                                  <Send />
                                </div>
                                <svg className="w-6 h-6 fill-none stroke-white stroke-[2] cursor-pointer" viewBox="0 0 24 24">
                                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                </svg>
                              </div>

                              {/* Likes Count & Caption */}
                              <div className="px-3 space-y-0.5 text-[11px]">
                                <p className="font-extrabold text-white leading-none">1,428 likes</p>
                                <p className="text-white/90 leading-tight line-clamp-2 pt-0.5">
                                  <strong className="mr-1 text-white font-extrabold">{activeAccount?.username || "your_brand"}</strong>
                                  {caption || "Your post description ..."}
                                </p>
                                <p className="text-[10px] text-[#8e9192] pt-0.5">View all 48 comments</p>
                                <p className="text-[8px] text-[#8e9192] tracking-wider">2 HOURS AGO</p>
                              </div>
                            </div>

                            {/* Instagram Bottom Nav */}
                            <div className="h-11 bg-black border-t border-white/10 px-5 flex items-center justify-between text-white/70">
                              <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
                              <svg className="w-5 h-5 fill-none stroke-current stroke-[2.2]" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="4" /><path d="M12 8v8m-4-4h8" /></svg>
                              <Film className="w-5 h-5" />
                              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-purple-600 p-[1px]">
                                <div className="w-full h-full bg-black rounded-full" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ── FORMAT 3: INSTAGRAM 24H STORY ── */}
                        {postType === "STORIES" && (
                          <div className="relative w-full h-full bg-black flex flex-col justify-between overflow-hidden">
                            {/* Story Background */}
                            <div className="absolute inset-0 bg-[#121212]">
                              {mediaUrl ? (
                                mediaUrl.includes(".mp4") ? (
                                  <video src={mediaUrl} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                                ) : (
                                  <img src={mediaUrl} alt="Story" className="w-full h-full object-cover" />
                                )
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white/40">
                                  <Play className="w-12 h-12 mb-3 text-pink-400 opacity-50 animate-pulse" />
                                  <span className="text-xs font-bold text-white/90">Story 24h Preview</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
                            </div>

                            {/* Segmented Progress Timer & User Header */}
                            <div className="relative z-30 pt-12 px-3 space-y-2.5">
                              {/* Segmented Timer Bar */}
                              <div className="h-[2px] w-full bg-white/30 rounded-full overflow-hidden flex gap-1">
                                <div className="h-full bg-white flex-1 rounded-full animate-[pulse_2s_infinite]" />
                                <div className="h-full bg-white/30 flex-1 rounded-full" />
                                <div className="h-full bg-white/30 flex-1 rounded-full" />
                              </div>

                              {/* User Bar */}
                              <div className="flex items-center justify-between text-white">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-[1.5px]">
                                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-[10px] font-black">
                                      {activeAccount?.username ? activeAccount.username[0].toUpperCase() : "Z"}
                                    </div>
                                  </div>
                                  <span className="text-xs font-extrabold">{activeAccount?.username || "your_brand"}</span>
                                  <span className="text-[10px] text-[#8e9192]">3h</span>
                                </div>
                                <X className="w-5 h-5 text-white cursor-pointer" />
                              </div>
                            </div>

                            {/* Story Bottom Interactive Bar */}
                            <div className="relative z-30 p-3 pb-6 flex items-center gap-3">
                              <div className="flex-1 h-10 rounded-full border border-white/40 bg-black/40 backdrop-blur-md px-4 flex items-center text-xs text-white/70">
                                Send message...
                              </div>
                              <Heart />
                              <Send />
                            </div>
                          </div>
                        )}

                        {/* ── iOS 18 Home Indicator Bar ── */}
                        <div className="absolute bottom-1.5 left-0 right-0 z-50 flex justify-center pointer-events-none">
                          <div className="w-32 h-[4px] bg-white/80 rounded-full shadow-xs" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </div>
  );
}
