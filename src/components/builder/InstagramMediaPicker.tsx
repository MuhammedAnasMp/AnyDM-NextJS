import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ImageIcon, Video, Check } from 'lucide-react';
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
  onSelect: (mediaIds: string[]) => void;
  selectedIds?: string[];
  resourceType?: string; // 'media' or 'story'
}

const INSTAGRAM_TOKEN = 'IGAAUN0phDYERBZAFk0NUNhYks2ampTQnQ1YkQtWjZAPdDlnQmpTS1p3dU1YdVp6cXZAYemRBUTdkUVRiVXozR3FtZAXRINmdUSXpkaVNWalBNZAGRTZATNfTWpjTy1YdFpMaDhfZAmZA1a3lSV0xCUGszenIzakt3';
const INSTAGRAM_USER_ID = '24907175292313781';

export function InstagramMediaPicker({ open, onClose, onSelect, selectedIds = [], resourceType = 'media' }: InstagramMediaPickerProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [currentSelected, setCurrentSelected] = useState<Set<string>>(new Set(selectedIds));
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchMedia = useCallback(async (url?: string) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
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
      
      setMedia(prev => url ? [...prev, ...data.data] : data.data);
      setNextUrl(data.paging?.next || null);
    } catch (err) {
      console.error(err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [resourceType]);

  useEffect(() => {
    if (open) {
      if (media.length === 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchMedia();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fetchMedia]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentSelected(new Set(selectedIds));
  }, [selectedIds, open]);

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
    onSelect(Array.from(currentSelected));
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-[80vh] bg-[#1a1a1a] border border-[#393939] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#393939]">
          <h3 className="text-lg font-bold text-white">Select {resourceType === 'story' ? 'Stories' : 'Posts & Reels'}</h3>
          <button onClick={onClose} className="p-1 text-[#8e9192] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {media.length === 0 && !loading ? (
             <div className="flex items-center justify-center h-full text-on-surface-variant">
               No media found.
             </div>
          ) : (
             <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
               {media.map((m, index) => {
                 const isSelected = currentSelected.has(m.id);
                 const imageSrc = m.media_type === 'VIDEO' ? (m.thumbnail_url || m.media_url) : m.media_url;
                 const isLastElement = media.length === index + 1;
                 
                 return (
                   <div 
                     key={m.id} 
                     ref={isLastElement ? lastElementRef : null}
                     onClick={() => toggleSelection(m.id)}
                     className={cn(
                       "relative aspect-square bg-[#262626] rounded-md overflow-hidden cursor-pointer group hover:ring-2 hover:ring-white/50 transition-all",
                       isSelected ? "ring-2 ring-primary" : ""
                     )}
                   >
                     {/* Image */}
                     {imageSrc ? (
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imageSrc})` }} />
                     ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[#555]">
                           No Image
                        </div>
                     )}
                     
                     {/* Overlay */}
                     <div className={cn(
                       "absolute inset-0 bg-black/20 transition-opacity", 
                       isSelected ? "opacity-100 bg-black/40" : "opacity-0 group-hover:opacity-100"
                     )}>
                        {isSelected && (
                           <div className="absolute top-2 right-2 w-6 h-6 bg-primary text-black rounded-full flex items-center justify-center">
                             <Check className="w-4 h-4" />
                           </div>
                        )}
                        <div className="absolute bottom-2 left-2 text-white">
                           {m.media_type === 'VIDEO' ? <Video className="w-5 h-5 drop-shadow-md" /> : <ImageIcon className="w-5 h-5 drop-shadow-md" />}
                        </div>
                     </div>
                   </div>
                 );
               })}
               {loading && (
                 <div className="col-span-full py-4 flex justify-center">
                   <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                 </div>
               )}
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#393939] flex items-center justify-between bg-[#161616]">
           <div className="text-sm text-on-surface-variant">
             {currentSelected.size} items selected
           </div>
           <div className="flex gap-2">
             <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:bg-white/10 transition-colors">
               Cancel
             </button>
             <button onClick={handleConfirm} className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-black hover:bg-gray-200 transition-colors">
               Confirm Selection
             </button>
           </div>
        </div>

      </div>
    </div>
  );
}
