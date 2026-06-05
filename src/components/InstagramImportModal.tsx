"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Layers,
  Video,
  Image as ImageIcon,
  Check,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import api from "@/lib/services/api.service";
import { cn } from "@/lib/utils";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface InstagramImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImport?: (media: any) => void;
}

export default function InstagramImportModal({ isOpen, onClose, onSelectImport }: InstagramImportModalProps) {
  const router = useRouter();

  // Instagram integrations
  const appUser = useSelector((state: RootState) => state.auth.user);
  const instagramAccounts = useSelector((state: RootState) => state.auth.instagramAccounts);
  const [media, setMedia] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [errorMedia, setErrorMedia] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [mediaNextCursor, setMediaNextCursor] = useState<string | null>(null);
  const [loadingMoreMedia, setLoadingMoreMedia] = useState(false);

  const activeAccount = instagramAccounts.find(acc => acc.id === appUser?.active_instagram_account_id) || instagramAccounts[0];

  useEffect(() => {
    if (isOpen) {
      fetchInstagramMedia();
    } else {
      // Reset state on close
      setSelectedMedia(null);
      setErrorMedia("");
    }
  }, [isOpen]);

  const fetchInstagramMedia = async () => {
    setLoadingMedia(true);
    setErrorMedia("");

    try {
      const response = await api.get("/accounts/instagram/media-list/");
      if (response.data && response.data.data && response.data.data.length > 0) {
        setMedia(response.data.data);
        setMediaNextCursor(response.data.paging?.cursors?.after || null);
      } else {
        setErrorMedia("No media returned from your Instagram account.");
        setMedia([]);
        setMediaNextCursor(null);
      }
    } catch (err: any) {
      console.error("Instagram media fetch failed:", err);
      const errMsg = err.response?.data?.error || err.response?.data?.details?.error?.message || err.message;
      setErrorMedia(`Failed to load Instagram media: ${errMsg}`);
      setMedia([]);
    } finally {
      setLoadingMedia(false);
    }
  };

  const loadMoreInstagramMedia = async () => {
    if (!mediaNextCursor) return;
    setLoadingMoreMedia(true);
    try {
      const response = await api.get(`/accounts/instagram/media-list/?after=${mediaNextCursor}`);
      if (response.data && response.data.data) {
        setMedia(prev => [...prev, ...response.data.data]);
        setMediaNextCursor(response.data.paging?.cursors?.after || null);
      }
    } catch (err: any) {
      console.error("Failed to load more media", err);
    } finally {
      setLoadingMoreMedia(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const reachedBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (reachedBottom && mediaNextCursor && !loadingMoreMedia) {
      loadMoreInstagramMedia();
    }
  };

  const handleCreateProduct = () => {
    if (!selectedMedia) return;

    if (onSelectImport) {
      onSelectImport(selectedMedia);
      onClose();
      return;
    }

    // Store full media object in sessionStorage for reliable data transfer
    sessionStorage.setItem("instagram_selected_media", JSON.stringify(selectedMedia));

    // URL-encode data and route to creation page
    const params = new URLSearchParams({
      source: "instagram",
      media_id: selectedMedia.id,
      media_url: selectedMedia.media_url || selectedMedia.thumbnail_url,
      thumbnail_url: selectedMedia.thumbnail_url || "",
      media_type: selectedMedia.media_type,
      caption: selectedMedia.caption || ""
    });

    onClose();
    router.push(`/dashboard/products/catalog/create?${params.toString()}`);
  };

  const getMediaIcon = (type: string) => {
    if (type === "VIDEO") return <Video className="w-3.5 h-3.5 text-white" />;
    if (type === "CAROUSEL_ALBUM") return <Layers className="w-3.5 h-3.5 text-white" />;
    return <ImageIcon className="w-3.5 h-3.5 text-white" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="relative">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="w-full bg-[#1c1b1b]/95 backdrop-blur-3xl rounded-2xl p-6 md:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.4)] border border-white/10 pointer-events-auto relative overflow-hidden flex flex-col transition-all duration-300 max-w-[760px] max-h-[85vh]"
            >
              {/* Top Accent Ambient Glow */}
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-pink-500/5 blur-[90px] rounded-full" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/5 blur-[90px] rounded-full" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-400 hover:text-white transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Title */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                  <InstagramIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Import from Instagram
                  </h2>
                  <p className="text-xs text-gray-400 font-medium mt-1">
                    {activeAccount ? `Account: @${activeAccount.username}` : "Select a post to convert to a product"}
                  </p>
                </div>
              </div>

              {/* Media Grid Scroll Container */}
              <div 
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto min-h-0 pr-1 mb-6 max-h-[48vh] scrollbar-thin"
              >
                {loadingMedia ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 py-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div key={i} className="aspect-square bg-white/5 border border-white/5 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : errorMedia ? (
                  <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-white">Failed to Fetch Feed</h4>
                      <p className="text-xs opacity-80 mt-1">{errorMedia}</p>
                    </div>
                  </div>
                ) : media.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-white/5 rounded-xl border border-white/5">
                    <AlertCircle className="w-12 h-12 text-gray-500 mb-3 opacity-60" />
                    <h4 className="font-bold text-sm text-white">No media posts found</h4>
                    <p className="text-xs text-gray-400 text-center px-6 mt-1">We couldn't retrieve any media posts from your Instagram account.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 py-1">
                    {media.map((item) => {
                      const isSelected = selectedMedia?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedMedia(isSelected ? null : item)}
                          className={cn(
                            "group relative aspect-square bg-white/5 rounded-lg overflow-hidden cursor-pointer border transition-all duration-300",
                            isSelected
                              ? "border-pink-500 shadow-lg shadow-pink-500/15 scale-[0.98]"
                              : "border-white/5 hover:border-white/20"
                          )}
                        >
                          <img
                            src={item.thumbnail_url || item.media_url}
                            alt={item.caption || "Instagram Media"}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMWYyOTM3Ij48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+';
                            }}
                          />

                          {/* Media Overlay on Hover / Active Selection */}
                          <div className={cn(
                            "absolute inset-0 bg-black/60 transition-opacity duration-200 flex flex-col justify-end p-2.5",
                            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          )}>
                            <p className="text-[10px] text-white font-medium line-clamp-2 leading-snug opacity-90">
                              {item.caption || "No caption provided"}
                            </p>
                          </div>

                          {/* Corner Media Type Badges */}
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1 rounded-md border border-white/10 shadow-sm flex items-center justify-center">
                            {getMediaIcon(item.media_type)}
                          </div>

                          {/* Selected Check Indicator */}
                          {isSelected && (
                            <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md animate-scaleIn border border-white/10">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {loadingMoreMedia && (
                  <div className="flex justify-center mt-6 pb-2 items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-500" />
                    <span className="text-xs text-gray-400 font-semibold">Loading more media...</span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/5 pt-4 gap-4">
                <div className="text-center sm:text-left">
                  {selectedMedia && (
                    <span className="text-xs text-gray-400 font-semibold">
                      Selected 1 item from Instagram feed
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={fetchInstagramMedia}
                    className="py-1.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                  <button
                    disabled={!selectedMedia}
                    onClick={handleCreateProduct}
                    className="flex-1 sm:flex-none py-2 px-6 bg-white hover:bg-white/95 disabled:bg-white/20 disabled:text-white/40 text-black rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>Import to Product</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
