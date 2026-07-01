import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import api from '@/lib/services/api.service';
import { X, ImageIcon, Video, Check, Layers, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Media {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
}

interface InstagramMediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (mediaIds: string[], mediaDetails: Media[]) => void;
  selectedIds?: string[];
  resourceType?: string; // 'media' or 'story'
}

const INSTAGRAM_TOKEN = 'IGAAUrAi9uIGRBZAFlQVjFrNHNLWlhmTUl4eTl2ZADFFZA2k4TjNlSmJvUXpqY0pWT0RGSDN5YWphUFMxRG5ZAR2lkT3JJSm1PNm0waE9CcHB2SFJBSGhySjRneGNjRlpqZAW9RaWZAiUU11OVRwNmxXb2p6cEVJVE9mU0hZAS2xuNlJ4dwZDZD';
const INSTAGRAM_USER_ID = '27078812251731733';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export function InstagramMediaPicker({ open, onClose, onSelect, selectedIds = [], resourceType = 'media' }: InstagramMediaPickerProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [currentSelected, setCurrentSelected] = useState<Set<string>>(new Set(selectedIds));
  const [error, setError] = useState('');
  const observer = useRef<IntersectionObserver | null>(null);

  // Active account information from auth store
  const appUser = useSelector((state: RootState) => state.auth.user);
  const instagramAccounts = useSelector((state: RootState) => state.auth.instagramAccounts || []);
  const activeAccount = instagramAccounts.find(acc => acc.id === appUser?.active_instagram_account_id) || instagramAccounts[0];

  const fetchMedia = useCallback(async (url?: string) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError('');
    try {
      // 1. Try backend API first
      try {
        let endpoint = resourceType === 'story' ? '/accounts/instagram/stories/' : '/accounts/instagram/media-list/';
        if (url) {
          const cursor = new URL(url).searchParams.get('after');
          if (cursor) {
            endpoint += `?after=${cursor}`;
          }
        }
        const response = await api.get(endpoint);
        if (response.data && response.data.data) {
          const formatted = response.data.data.map((item: any) => ({
            id: item.id,
            media_type: item.media_type,
            media_url: item.media_url || item.thumbnail_url,
            thumbnail_url: item.thumbnail_url,
            permalink: item.permalink,
            caption: item.caption
          }));

          setMedia(prev => {
            if (!url) return formatted;
            const existingIds = new Set(prev.map(item => item.id));
            const newItems = formatted.filter((item: any) => !existingIds.has(item.id));
            return [...prev, ...newItems];
          });

          // Only attempt pagination if we received at least 10 items (standard page size is 20+)
          if (formatted.length >= 10 && response.data.paging?.cursors?.after) {
            setNextUrl(`https://graph.instagram.com/dummy?after=${response.data.paging.cursors.after}`);
          } else {
            setNextUrl(null);
          }
          return;
        }
      } catch (backendErr) {
        console.warn("Backend media fetch failed, falling back to direct graph API:", backendErr);
      }

      // 2. Fallback to direct Graph API
      let endpoint = url;
      if (!endpoint) {
        const urlObj = new URL(`https://graph.instagram.com/v25.0/${INSTAGRAM_USER_ID}/${resourceType === 'story' ? 'stories' : 'media'}`);
        urlObj.searchParams.append('access_token', INSTAGRAM_TOKEN);
        urlObj.searchParams.append('fields', 'id,media_type,media_url,thumbnail_url,permalink,caption');
        urlObj.searchParams.append('limit', '20');
        endpoint = urlObj.toString();
      }

      const response = await fetch(endpoint!);
      const data = await response.json();

      if (data.data) {
        setMedia(prev => {
          if (!url) return data.data;
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = data.data.filter((item: any) => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
        // Only attempt pagination if we received at least 10 items (standard page size is 20+)
        if (data.data.length >= 10 && data.paging?.next) {
          setNextUrl(data.paging.next);
        } else {
          setNextUrl(null);
        }
      } else if (data.error) {
        setError(data.error.message || 'Failed to fetch media');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load media');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [resourceType]);

  useEffect(() => {
    if (open) {
      fetchMedia();
    } else {
      // Clear data on close
      setMedia([]);
      setNextUrl(null);
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fetchMedia]);

  useEffect(() => {
    if (open) {
      setCurrentSelected(new Set(selectedIds));
    }
  }, [open]);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && nextUrl) {
        fetchMedia(nextUrl);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, nextUrl, fetchMedia]);

  const toggleSelection = (id: string) => {
    setCurrentSelected(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleConfirm = () => {
    const selectedDetails = media.filter(m => currentSelected.has(m.id));
    onSelect(Array.from(currentSelected), selectedDetails);
    onClose();
  };

  const getMediaIcon = (type: string) => {
    if (type === 'VIDEO') return <Video className="w-3.5 h-3.5 text-white" />;
    if (type === 'CAROUSEL_ALBUM') return <Layers className="w-3.5 h-3.5 text-white" />;
    return <ImageIcon className="w-3.5 h-3.5 text-white" />;
  };

  return (
    <AnimatePresence>
      {open && (
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
              {/* Top/Bottom Glow Accent */}
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
                    Select {resourceType === 'story' ? 'Instagram Stories' : 'Instagram Posts & Reels'}
                  </h2>
                  <p className="text-xs text-gray-400 font-medium mt-1">
                    {activeAccount ? `Account: @${activeAccount.username}` : "Select posts to apply automation rules"}
                  </p>
                </div>
              </div>

              {/* Media Grid Container */}
              <div
                className="flex-1 overflow-y-auto min-h-0 pr-1 mb-6 max-h-[48vh] scrollbar-thin"
              >
                {media.length === 0 && loading ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 py-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div key={i} className="aspect-square bg-white/5 border border-white/5 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-white">Failed to Fetch Feed</h4>
                      <p className="text-xs opacity-80 mt-1">{error}</p>
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
                    {media.map((item, index) => {
                      const isSelected = currentSelected.has(item.id);
                      const imageSrc = item.media_type === 'VIDEO' ? (item.thumbnail_url || item.media_url) : item.media_url;
                      const isLastElement = media.length === index + 1;

                      return (
                        <div
                          key={item.id}
                          ref={isLastElement ? lastElementRef : null}
                          onClick={() => toggleSelection(item.id)}
                          className={cn(
                            "group relative aspect-square bg-white/5 rounded-lg overflow-hidden cursor-pointer border transition-all duration-300",
                            isSelected
                              ? "border-pink-500 shadow-lg shadow-pink-500/15 scale-[0.98]"
                              : "border-white/5 hover:border-white/20"
                          )}
                        >
                          <img
                            src={imageSrc}
                            alt={item.caption || "Instagram Media"}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMWYyOTM3Ij48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+';
                            }}
                          />

                          {/* Caption Overlay on Hover */}
                          <div className={cn(
                            "absolute inset-0 bg-black/60 transition-opacity duration-200 flex flex-col justify-end p-2.5",
                            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          )}>
                            <p className="text-[10px] text-white font-medium line-clamp-2 leading-snug opacity-90">
                              {item.caption || "No caption provided"}
                            </p>
                          </div>

                          {/* Corner Badges */}
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1 rounded-md border border-white/10 shadow-sm flex items-center justify-center">
                            {getMediaIcon(item.media_type)}
                          </div>

                          {/* Selection Checkmark */}
                          {isSelected && (
                            <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md border border-white/10">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {loading && media.length > 0 && (
                  <div className="flex justify-center mt-6 pb-2 items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-500" />
                    <span className="text-xs text-gray-400 font-semibold">Loading more media...</span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/5 pt-4 gap-4 bg-transparent">
                <div className="text-center sm:text-left">
                  <span className="text-xs text-gray-400 font-semibold">
                    {currentSelected.size} items selected
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => fetchMedia()}
                    className="py-1.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={currentSelected.size === 0}
                    className="flex-1 sm:flex-none py-2 px-6 bg-white hover:bg-white/95 text-black rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Confirm Selection</span>
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
