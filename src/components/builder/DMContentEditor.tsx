'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { updateNodeData } from '@/store/slices/flowSlice';
import {
  X, Plus, Trash2, Edit2, Upload, Link as LinkIcon,
  Sparkles, Check, ChevronLeft, ChevronRight, MessageSquare, Info,
  Paperclip, ShoppingBag, Mic, Image as ImageIcon, Heart, Film, Headphones, Share2,
  Smile,
  Shuffle,
  Link2,
  MessageCircle,
  Package,
  Search,
  Reply,
  MousePointerClick,
  GalleryHorizontal,
  PillIcon,
  SquareArrowRight,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/services/api.service';
import { InstagramMediaPicker } from './InstagramMediaPicker';

// --- Fallback Products ---
const DEFAULT_PRODUCTS = [
  {
    id: "p_1",
    title: "HyperBoost Running Core",
    price: 7499.00,
    currency: "INR",
    description: "Hyper-responsive cushioning for ultimate running performance.",
    media_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&h=300"
  },
  {
    id: "p_2",
    title: "Serene Quartz Minimalist",
    price: 12499.00,
    currency: "INR",
    description: "Minimalist quartz watch with serene design aesthetics.",
    media_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&h=300"
  },
  {
    id: "p_3",
    title: "Acoustic Pro Gen-2",
    price: 16499.00,
    currency: "INR",
    description: "Next-gen acoustic headphones with passive noise cancelling.",
    media_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&h=300"
  }
];

// --- Types ---
type ButtonItem = {
  type: "web_url" | "postback" | "product";
  title: string;
  url?: string;
  payload?: string;
};

type GenericElement = {
  title: string;
  subtitle?: string;
  image_url?: string;
  default_action?: {
    type: "web_url";
    url: string;
  };
  buttons?: ButtonItem[];
};

interface DMContentEditorProps {
  nodeId: string;
  onClose: () => void;
}

interface CustomSelectProps {
  label?: string;
  value: string;
  options: {
    icon?: React.JSX.Element; value: string; label: string
  }[];
  onChange: (value: string) => void;
  dropdownId: string;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
  disabled?: boolean;
  labelClassName?: string;


}

function CustomSelect({
  label,
  value,
  options,
  onChange,
  dropdownId,
  openDropdownId,
  setOpenDropdownId,
  disabled,
  labelClassName
}: CustomSelectProps) {
  const isOpen = openDropdownId === dropdownId;
  const selectedOption = options.find(o => o.value === value) || options[0];
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, setOpenDropdownId]);

  return (
    <div ref={containerRef} className="space-y-1.5 relative w-full">
      {label && (
        <label
          className={cn(
            "text-label-sm text-on-surface-variant  tracking-wider block font-semibold mb-1",
            labelClassName
          )}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdownId(isOpen ? null : dropdownId)}
          className="w-full bg-surface-container-high border border-white/5 hover:border-white/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none cursor-pointer font-medium flex items-center justify-between transition-all text-left"
        >
          <span>{selectedOption?.label}</span>
          <ChevronRight className={cn("w-3.5 h-3.5 text-zinc-400 transition-transform duration-200", isOpen ? "rotate-90" : "")} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-high/95 backdrop-blur-md border border-white/10 rounded-md shadow-2xl z-50 overflow-hidden py-1 animate-fadeIn">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpenDropdownId(null);
                }}
                className={cn(
                  "w-full px-4 py-2.5 text-xs text-left font-medium transition-all flex items-center justify-between hover:bg-white/5",
                  value === opt.value
                    ? "text-white bg-white/10"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <div className="flex items-center gap-2">
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <span>{opt.label}</span>
                </div>

                {value === opt.value && (
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default function DMContentEditor({ nodeId, onClose }: DMContentEditorProps) {
  const dispatch = useDispatch();

  // Get node and auth details
  const node = useSelector((state: RootState) => state.flow.nodes.find(n => n.id === nodeId));
  const nodes = useSelector((state: RootState) => state.flow.nodes);
  const { user: appUser, instagramAccounts } = useSelector((state: RootState) => state.auth);
  const activeAccountId = appUser?.active_instagram_account_id;
  const activeAccount = React.useMemo(() => {
    if (!activeAccountId || !instagramAccounts) return null;
    return instagramAccounts.find((acc: any) => String(acc.id) === String(activeAccountId));
  }, [activeAccountId, instagramAccounts]);

  const triggerNode = React.useMemo(() => nodes.find(n => n.type === 'trigger'), [nodes]);
  const selectedMediaIds = React.useMemo(() => {
    if (!triggerNode) return [];
    return triggerNode.data?.media_ids || triggerNode.data?.target?.media_ids || [];
  }, [triggerNode]);
  const selectedMediaDetails = React.useMemo(() => {
    if (!triggerNode) return [];
    return triggerNode.data?.media_ids_details || [];
  }, [triggerNode]);

  // --- Local Editor States ---
  const [dmFormat, setDmFormat] = React.useState<'text' | 'quick_reply' | 'button_template' | 'generic_template' | 'attachment'>('button_template');
  const [rateLimitCount, setRateLimitCount] = React.useState<number>(1);
  const [rateLimitWindow, setRateLimitWindow] = React.useState<number>(86400);
  const [detailedCardView, setDetailedCardView] = React.useState<boolean>(false);
  const [textMessages, setTextMessages] = React.useState<string[]>(['']);
  const [mounted, setMounted] = React.useState(false);
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const format = dmFormat;

  // Quick Reply States
  const [quickReplyText, setQuickReplyText] = React.useState('');
  const [quickRepliesTitles, setQuickRepliesTitles] = React.useState<string[]>([]);

  // Button Template States
  const [buttonTemplateText, setButtonTemplateText] = React.useState('');
  const [buttonTemplateButtons, setButtonTemplateButtons] = React.useState<ButtonItem[]>([]);
  const [activeButtonTemplateButtonIndex, setActiveButtonTemplateButtonIndex] = React.useState(0);
  const normalizedActiveButtonTemplateButtonIndex = Math.min(activeButtonTemplateButtonIndex, Math.max(0, buttonTemplateButtons.length - 1));

  // Generic Template (Carousel) States
  const [carouselElements, setCarouselElements] = React.useState<GenericElement[]>([]);
  const [activeCardIndex, setActiveCardIndex] = React.useState(0);
  const [activeButtonIndex, setActiveButtonIndex] = React.useState(0);
  const [isDraggingCarousel, setIsDraggingCarousel] = React.useState(false);
  const dragStartRef = React.useRef<{ x: number; scrollLeft: number; time: number }>({ x: 0, scrollLeft: 0, time: 0 });
  const carouselScrollRef = React.useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = React.useRef(false);

  React.useEffect(() => {
    setActiveButtonIndex(0);
  }, [activeCardIndex]);

  const cardButtons = carouselElements[activeCardIndex]?.buttons || [];
  const normalizedActiveButtonIndex = Math.min(activeButtonIndex, Math.max(0, cardButtons.length - 1));

  const maxButtonsCount = React.useMemo(() => {
    return Math.max(...carouselElements.map(elem => elem.buttons?.length || 0), 0);
  }, [carouselElements]);

  const handleCarouselScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isProgrammaticScrollRef.current) return;
    if (isDraggingCarousel) return; // ignore scroll state updates while dragging
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const cardWidth = 190 + 10; // card width + gap
    const activeIndex = Math.round(scrollLeft / cardWidth);
    if (activeIndex !== activeCardIndex && activeIndex >= 0 && activeIndex < carouselElements.length) {
      setActiveCardIndex(activeIndex);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (carouselElements.length <= 1) return;
    const container = carouselScrollRef.current;
    if (!container) return;

    setIsDraggingCarousel(true);
    dragStartRef.current = {
      x: e.pageX,
      scrollLeft: container.scrollLeft,
      time: Date.now()
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const x = moveEvent.pageX;
      const startX = dragStartRef.current.x;
      const scrollLeft = dragStartRef.current.scrollLeft;
      const walk = (x - startX) * 1.2; // scroll speed multiplier
      container.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      setIsDraggingCarousel(false);

      const x = upEvent.pageX;
      const startX = dragStartRef.current.x;
      const deltaX = x - startX;
      const deltaTime = Date.now() - dragStartRef.current.time;

      const cardWidth = 190 + 10; // card width + gap
      const currentScroll = container.scrollLeft;

      let targetIndex = activeCardIndex;

      // If swipe was fast or far enough, slide to adjacent card
      if (Math.abs(deltaX) > 40 && deltaTime < 300) {
        if (deltaX < 0) {
          targetIndex = Math.min(carouselElements.length - 1, activeCardIndex + 1);
        } else {
          targetIndex = Math.max(0, activeCardIndex - 1);
        }
      } else {
        // Snap to closest card
        targetIndex = Math.round(currentScroll / cardWidth);
        targetIndex = Math.max(0, Math.min(carouselElements.length - 1, targetIndex));
      }

      container.scrollTo({
        left: targetIndex * cardWidth,
        behavior: 'smooth'
      });
      setActiveCardIndex(targetIndex);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const scrollToCard = (idx: number) => {
    isProgrammaticScrollRef.current = true;
    setActiveCardIndex(idx);
    if (carouselScrollRef.current) {
      const cardWidth = 190 + 10; // card width + gap
      carouselScrollRef.current.scrollTo({
        left: idx * cardWidth,
        behavior: 'smooth'
      });
    }
    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 400);
  };

  // Cloudinary/Upload Status States
  const [uploadingMap, setUploadingMap] = React.useState<Record<number, boolean>>({});
  const [uploadProgressMap, setUploadProgressMap] = React.useState<Record<number, number>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Attachments States
  type AttachmentItem = {
    type: 'image' | 'video' | 'audio' | 'sticker' | 'MEDIA_SHARE' | 'file';
    url?: string;
    media_id?: string;
    sticker_id?: string;
  };
  const [mediaDetailsCache, setMediaDetailsCache] = React.useState<Record<string, { media_url: string; media_type: string; thumbnail_url?: string }>>({});
  const [playingAudioIndex, setPlayingAudioIndex] = React.useState<number | null>(null);
  const [playingVideoIndex, setPlayingVideoIndex] = React.useState<number | null>(null);
  const [activeAudio, setActiveAudio] = React.useState<HTMLAudioElement | null>(null);
  const chatThreadRef = React.useRef<HTMLDivElement>(null);

  const [attachments, setAttachments] = React.useState<AttachmentItem[]>([]);
  const [selectedAttachmentType, setSelectedAttachmentType] = React.useState<'image' | 'video' | 'audio' | 'sticker' | 'MEDIA_SHARE' | 'file'>('image');
  const [customStickerId, setCustomStickerId] = React.useState<string>('');
  const [customMediaId, setCustomMediaId] = React.useState<string>('');
  const [showMediaPicker, setShowMediaPicker] = React.useState(false);
  const [uploadingFiles, setUploadingFiles] = React.useState<{ id: string; name: string; progress: number }[]>([]);
  const attachmentFileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    return () => {
      if (activeAudio) {
        activeAudio.pause();
      }
    };
  }, [activeAudio]);

  React.useEffect(() => {
    if (chatThreadRef.current) {
      chatThreadRef.current.scrollTop = chatThreadRef.current.scrollHeight;
    }
  }, [attachments, textMessages, quickReplyText, buttonTemplateText, format]);

  // Products and E-commerce States
  const [products, setProducts] = React.useState<any[]>([]);
  const [showProductPicker, setShowProductPicker] = React.useState<Record<string, boolean>>({});
  const isEcommerceTemplate = React.useMemo(() => {
    const hasInquiryType = (rt?: string) => !!(rt && rt.includes('product_inquiry'));
    if (hasInquiryType(node?.ruleType)) return true;
    const triggerNode = nodes.find(n => n.type === 'trigger');
    return hasInquiryType(triggerNode?.ruleType);
  }, [node, nodes]);

  const toggleProductPicker = React.useCallback((key: string) => {
    setShowProductPicker(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const lastGeneratedBtnKeyRef = React.useRef<string>('');
  const lastGeneratedCarouselKeyRef = React.useRef<string>('');
  // True once the node sync effect has loaded carousel data (even as a fallback default).
  // Prevents auto-gen from overwriting user-configured carousel when products load asynchronously.
  const carouselLoadedFromNodeRef = React.useRef<boolean>(false);


  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products/');
        const data = response.data?.results || response.data;
        if (data && Array.isArray(data)) {
          setProducts(data);
          localStorage.setItem("anydm_products", JSON.stringify(data));
        } else {
          loadFromLocal();
        }
      } catch (err) {
        loadFromLocal();
      }
    };

    const loadFromLocal = () => {
      const cached = localStorage.getItem("anydm_products");
      if (cached) {
        setProducts(JSON.parse(cached));
      } else {
        setProducts(DEFAULT_PRODUCTS);
      }
    };

    fetchProducts();
  }, []);

  // Hook to auto-generate dynamic buttons based on selected media count (max 3)
  React.useEffect(() => {
    if (!isEcommerceTemplate || format !== 'button_template' || products.length === 0) return;

    const mediaKey = [...selectedMediaIds].sort().join(',');
    const currentKey = `${nodeId}:${mediaKey}`;
    if (lastGeneratedBtnKeyRef.current === currentKey) return;

    lastGeneratedBtnKeyRef.current = currentKey;

    const username = activeAccount?.username || appUser?.username || 'shop';

    // Check if the current buttons are the default ones
    const isDefault = buttonTemplateButtons.length === 0 ||
      (buttonTemplateButtons.length === 1 &&
        (buttonTemplateButtons[0].url === 'https://shop.example.com' ||
          buttonTemplateButtons[0].url === 'https://' ||
          buttonTemplateButtons[0].url === '' ||
          buttonTemplateButtons[0].title === '🛍️ Shop Now' ||
          buttonTemplateButtons[0].title === 'New Button' ||
          buttonTemplateButtons[0].title === 'Button'));

    if (isDefault) {
      // Create N buttons based on selected trigger media count (min 1, max 3)
      const numButtons = selectedMediaIds.length > 0 ? Math.min(3, selectedMediaIds.length) : 1;

      const extractShortcode = (url: string) => {
        if (!url) return null;
        const match = url.match(/instagram\.com\/(?:reel|p)\/([^/?#&]+)/);
        return match ? match[1] : null;
      };

      const dynamicButtons = Array.from({ length: numButtons }).map((_, idx) => {
        const mediaId = selectedMediaIds[idx];
        let prod = null;

        if (mediaId) {
          const targetIdStr = String(mediaId).trim();
          const mediaDetail = selectedMediaDetails.find((m: any) => String(m.id) === targetIdStr);
          const shortcode = mediaDetail?.permalink ? extractShortcode(mediaDetail.permalink) : null;

          prod = products.find(p => {
            // 1. Match by backend source_id (shortcode)
            if (shortcode && p.source_id && String(p.source_id).trim() === shortcode) return true;
            // 2. Match by source_id (numeric media id)
            if (p.source_id && String(p.source_id).trim() === targetIdStr) return true;
            // 3. Match by product ID
            if (p.id && String(p.id).trim() === targetIdStr) return true;
            // 4. Match by permalink containing shortcode
            if (shortcode && p.instagram_permalink && p.instagram_permalink.includes(shortcode)) return true;
            // 5. Match by gallery
            if (p.gallery && Array.isArray(p.gallery)) {
              return p.gallery.some((g: any) =>
                (g.media_id && String(g.media_id).trim() === targetIdStr) ||
                (g.instagram_media_id && String(g.instagram_media_id).trim() === targetIdStr) ||
                (g.source_id && String(g.source_id).trim() === targetIdStr)
              );
            }
            return false;
          });
        }

        // If no mediaId was present or no media-specific product matched, fallback to first product as a general catalog default (only for first button)
        if (!prod && !mediaId && idx === 0) {
          prod = products[0];
        }

        const prodUrl = prod
          ? (typeof window !== 'undefined'
            ? `${window.location.origin}/${username}/product/${prod.id}`
            : `https://anydm.com/${username}/product/${prod.id}`)
          : 'https://'; // User selects manually if no product matches

        const titleText = prod ? (prod.title || prod.name || 'Product') : `Product ${idx + 1}`;
        const title = `🛍️ Buy ${titleText}`.slice(0, 20);

        return {
          type: 'web_url' as const,
          title,
          url: prodUrl
        };
      });

      setButtonTemplateButtons(dynamicButtons);
    }
  }, [isEcommerceTemplate, format, products, selectedMediaIds, selectedMediaDetails, activeAccount, appUser, buttonTemplateButtons, nodeId]);

  // Keep a ref to current carouselElements so we can read them in the effect without adding them as a dependency
  const carouselElementsRef = React.useRef(carouselElements);
  React.useEffect(() => {
    carouselElementsRef.current = carouselElements;
  }, [carouselElements]);

  // Hook to auto-generate dynamic generic template (carousel) cards based on selected media count (max 10)
  React.useEffect(() => {
    console.group('[Carousel AutoGen] Effect triggered');
    console.log('isEcommerceTemplate:', isEcommerceTemplate);
    console.log('format:', format);
    console.log('products.length:', products.length);
    console.log('selectedMediaIds:', selectedMediaIds);
    console.log('node.data?.generic_template_elements_json:', node?.data?.generic_template_elements_json);

    if (!isEcommerceTemplate || format !== 'generic_template' || products.length === 0) {
      console.log('[Carousel AutoGen] Skipping - conditions not met');
      console.groupEnd();
      return;
    }

    if (carouselLoadedFromNodeRef.current) {
      console.log('[Carousel AutoGen] 🚫 Skipping - carousel already loaded from node (preserving saved/default content)');
      console.groupEnd();
      return;
    }

    // If node already has explicitly saved carousel data, never auto-overwrite it
    const savedElements = node?.data?.generic_template_elements_json;
    const hasSavedCarousel = savedElements && (
      (typeof savedElements === 'string' && savedElements.trim().length > 2) ||
      (Array.isArray(savedElements) && savedElements.length > 0)
    );
    if (hasSavedCarousel) {
      console.log('[Carousel AutoGen] 🚫 Skipping - node has saved carousel data, preserving it');
      console.groupEnd();
      return;
    }

    const mediaKey = [...selectedMediaIds].sort().join(',');
    const currentKey = `${nodeId}:carousel:${mediaKey}`;
    console.log('currentKey:', currentKey, '| lastKey:', lastGeneratedCarouselKeyRef.current);
    if (lastGeneratedCarouselKeyRef.current === currentKey) {
      console.log('[Carousel AutoGen] Skipping - same key, already generated');
      console.groupEnd();
      return;
    }

    lastGeneratedCarouselKeyRef.current = currentKey;

    const username = activeAccount?.username || appUser?.username || 'shop';
    const current = carouselElementsRef.current;

    const firstImg = current[0]?.image_url || '';
    const DEFAULT_PIXABAY = 'https://cdn.pixabay.com/photo/2020/04/02/07/35/cat-4993829_960_720.jpg';
    const DEFAULT_THUMB = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRN2z0ERwXQUqH29urPuzWueLXKhJAY6SMyAA&s';

    // A "custom image" is any URL that is NOT empty and NOT one of our known placeholder defaults
    const isCustomImage = firstImg &&
      firstImg !== DEFAULT_PIXABAY &&
      firstImg !== DEFAULT_THUMB;

    const isDefaultCarousel = !isCustomImage && (
      current.length === 0 ||
      (current.length === 1 &&
        (current[0].title === 'Welcome Product' ||
          current[0].title === 'New Product Item' ||
          current[0].title === 'Welcome!' ||
          current[0].title === 'Summer Tote Bag' ||
          current[0].title === 'Product Item' ||
          current[0].image_url === '' ||
          current[0].image_url === DEFAULT_PIXABAY ||
          current[0].image_url === DEFAULT_THUMB ||
          current[0].default_action?.url === 'https://shop.example.com' ||
          current[0].default_action?.url === 'https://' ||
          current[0].default_action?.url === '' ||
          (current[0].default_action?.url || '').includes('shop.example.com') ||
          (current[0].default_action?.url || '').includes('example.com')))
    );

    console.log('[Carousel AutoGen] firstImg:', firstImg);
    console.log('[Carousel AutoGen] isCustomImage:', isCustomImage);
    console.log('[Carousel AutoGen] isDefaultCarousel:', isDefaultCarousel);
    console.log('[Carousel AutoGen] current carouselElements:', JSON.parse(JSON.stringify(current)));

    if (isDefaultCarousel) {
      console.log('[Carousel AutoGen] ✅ Proceeding to generate cards...');
      const numCards = selectedMediaIds.length > 0 ? Math.min(10, selectedMediaIds.length) : 1;

      const extractShortcode = (url: string) => {
        if (!url) return null;
        const match = url.match(/instagram\.com\/(?:reel|p)\/([^/?#&]+)/);
        return match ? match[1] : null;
      };

      const dynamicCards = Array.from({ length: numCards }).map((_, idx) => {
        const mediaId = selectedMediaIds[idx];
        const mediaDetail = selectedMediaDetails.find((m: any) => String(m.id) === String(mediaId));
        const shortcode = mediaDetail?.permalink ? extractShortcode(mediaDetail.permalink) : null;

        let prod = null;
        if (mediaId) {
          const targetIdStr = String(mediaId).trim();
          prod = products.find(p => {
            if (shortcode && p.source_id && String(p.source_id).trim() === shortcode) return true;
            if (p.source_id && String(p.source_id).trim() === targetIdStr) return true;
            if (p.id && String(p.id).trim() === targetIdStr) return true;
            if (shortcode && p.instagram_permalink && p.instagram_permalink.includes(shortcode)) return true;
            if (p.gallery && Array.isArray(p.gallery)) {
              return p.gallery.some((g: any) =>
                (g.media_id && String(g.media_id).trim() === targetIdStr) ||
                (g.instagram_media_id && String(g.instagram_media_id).trim() === targetIdStr) ||
                (g.source_id && String(g.source_id).trim() === targetIdStr)
              );
            }
            return false;
          });
        }

        if (!prod && !mediaId && idx === 0 && showProductPicker[`carousel-product-${idx}`]) {
          prod = products[0];
        }

        const getProductImageUrl = (p: any) => {
          if (!p) return '';
          const galleryItem = p.gallery?.[0];
          if (galleryItem) {
            if (galleryItem.media_type === 'VIDEO') {
              return galleryItem.thumbnail_url || galleryItem.media_url || '';
            }
            return galleryItem.media_url || '';
          }
          const mainUrl = p.media_url || p.main_media_url || '';
          const isVideoUrl = typeof mainUrl === 'string' && /\.(mp4|webm|ogg|mov|avi)/i.test(mainUrl);
          if (isVideoUrl && p.thumbnail_url) {
            return p.thumbnail_url;
          }
          return mainUrl || p.thumbnail_url || '';
        };

        const imageUrl = prod
          ? getProductImageUrl(prod)
          : (mediaDetail?.media_type === 'VIDEO'
            ? (mediaDetail?.thumbnail_url || mediaDetail?.media_url || '')
            : (mediaDetail?.media_url || mediaDetail?.thumbnail_url || ''));

        const prodUrl = prod
          ? (typeof window !== 'undefined'
            ? `${window.location.origin}/${username}/product/${prod.id}`
            : `https://anydm.com/${username}/product/${prod.id}`)
          : 'https://';

        const titleText = prod
          ? (prod.title || prod.name || 'Product')
          : (mediaDetail?.caption ? mediaDetail.caption.split(/[.!?]/)[0].trim().slice(0, 40) : `Product ${idx + 1}`);

        const subtitleText = prod
          ? (prod.description || 'No description available.')
          : (mediaDetail?.caption ? mediaDetail.caption : 'Premium quality item.');

        const priceText = prod
          ? `${prod.price} ${prod.currency || '₹'}`
          : '';

        return {
          title: titleText.slice(0, 80) || 'Product Item',
          subtitle: subtitleText.slice(0, 80) || 'Product Description',
          image_url: imageUrl,
          default_action: {
            type: 'web_url' as const,
            url: prodUrl
          },
          buttons: [
            {
              type: 'web_url' as const,
              title: prod ? `🛍️ Buy: ${priceText}`.slice(0, 20) : '🛍️ Buy Now',
              url: prodUrl
            }
          ]
        };
      });

      console.log('[Carousel AutoGen] Generated cards:', dynamicCards);
      setCarouselElements(dynamicCards);
    } else {
      console.log('[Carousel AutoGen] 🚫 Skipping overwrite - custom image or non-default content detected');
    }
    console.groupEnd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEcommerceTemplate, format, products, selectedMediaIds, selectedMediaDetails, activeAccount, appUser, nodeId, showProductPicker]);

  // Sync state on node load
  React.useEffect(() => {
    if (!node) return;

    // Load DM Format & Settings
    setDmFormat(node.data?.dm_format || 'button_template');
    setRateLimitCount(node.data?.rate_limit_limit !== undefined ? node.data.rate_limit_limit : 1);
    setRateLimitWindow(node.data?.rate_limit_window_seconds !== undefined ? node.data.rate_limit_window_seconds : 86400);
    setDetailedCardView(!!node.data?.detailed);
    setTextMessages(node.data?.messages || ['']);

    // Load Quick Reply data
    setQuickReplyText(node.data?.quick_reply_text || 'Pick size:');
    setQuickRepliesTitles(node.data?.quick_replies_titles || ['XS', 'S', 'M', 'L']);

    // Load Button data
    setButtonTemplateText(node.data?.button_template_text || 'What would you like to do?');
    let btns: ButtonItem[] = [];
    const btnsJson = node.data?.button_template_buttons_json;
    if (typeof btnsJson === 'string' && btnsJson.trim()) {
      try { btns = JSON.parse(btnsJson); } catch (e) { console.error(e); }
    } else if (Array.isArray(btnsJson)) {
      btns = btnsJson;
    } else {
      btns = [{ type: 'web_url', title: '🛍️ Shop Now', url: 'https://shop.example.com' }];
    }
    setButtonTemplateButtons(btns);

    // Load Carousel data
    let elems: GenericElement[] = [];
    const elemsJson = node.data?.generic_template_elements_json;
    if (typeof elemsJson === 'string' && elemsJson.trim()) {
      try { elems = JSON.parse(elemsJson); } catch (e) { console.error(e); }
    } else if (Array.isArray(elemsJson)) {
      elems = elemsJson;
    } else {
      elems = [{
        title: 'Welcome Product',
        subtitle: 'Premium quality slider description.',
        image_url: 'https://cdn.pixabay.com/photo/2020/04/02/07/35/cat-4993829_960_720.jpg',
        default_action: { type: 'web_url', url: 'https://shop.example.com' },
        buttons: [{ type: 'web_url', title: '🛒 Buy Now', url: 'https://shop.example.com' }]
      }];
    }
    setCarouselElements(elems);
    setActiveCardIndex(0);
    // Mark carousel as loaded from node so auto-gen does not overwrite it
    carouselLoadedFromNodeRef.current = true;
    console.log('[CarouselLoad] Set from node. elemsJson was:', node.data?.generic_template_elements_json, '| elems:', elems);

    // Initialize picker states for each card based on whether it has a linked product URL
    const initialPickerStates: Record<string, boolean> = {};
    elems.forEach((elem, idx) => {
      const url = elem.default_action?.url || '';
      if (url.includes('/product/')) {
        initialPickerStates[`carousel-product-${idx}`] = true;
      }
    });
    setShowProductPicker(prev => ({ ...prev, ...initialPickerStates }));

    // Load Attachments data
    const rawAttachments = node.data?.attachments || [];
    const normalizedAttachments: AttachmentItem[] = rawAttachments.map((item: any) => {
      if (typeof item === 'string') {
        let type: 'image' | 'video' | 'audio' = 'image';
        if (item.match(/\.(mp4|mov|avi|webm)/i)) {
          type = 'video';
        } else if (item.match(/\.(mp3|m4a|wav|ogg|aac)/i)) {
          type = 'audio';
        }
        return { type, url: item };
      }
      return item;
    });
    setAttachments(normalizedAttachments);
  }, [node]);

  if (!node || !mounted) return null;

  // --- Save Handler ---
  const handleSave = () => {
    // 1. Text Format Validation
    if (dmFormat === 'text') {
      if (textMessages.length === 0 || textMessages.every(msg => !msg.trim())) {
        setValidationError('At least one non-empty text message is required.');
        return;
      }
      for (let i = 0; i < textMessages.length; i++) {
        if (!textMessages[i].trim()) {
          setValidationError(`Message ${i + 1} cannot be empty.`);
          return;
        }
      }
    }

    // 2. Quick Reply Validation
    if (dmFormat === 'quick_reply') {
      if (!quickReplyText.trim()) {
        setValidationError('Quick reply text is required.');
        return;
      }
      if (quickRepliesTitles.length === 0) {
        setValidationError('At least one quick reply option is required.');
        return;
      }
      for (let i = 0; i < quickRepliesTitles.length; i++) {
        if (!quickRepliesTitles[i].trim()) {
          setValidationError(`Quick reply option ${i + 1} cannot be empty.`);
          return;
        }
      }
    }

    // 3. Button Template Validation
    if (dmFormat === 'button_template') {
      if (!buttonTemplateText.trim()) {
        setValidationError('Button template text is required.');
        return;
      }
      if (buttonTemplateButtons.length === 0) {
        setValidationError('At least one button is required for Button Template.');
        return;
      }
      for (let i = 0; i < buttonTemplateButtons.length; i++) {
        const btn = buttonTemplateButtons[i];
        if (!btn.title.trim()) {
          setValidationError(`Button ${i + 1} title is required.`);
          return;
        }
        if (btn.type === 'web_url' || btn.type === 'product') {
          if (!btn.url || btn.url.trim() === '' || btn.url.trim() === 'https://') {
            setValidationError(`Button ${i + 1} ("${btn.title}") URL is required.`);
            return;
          }
          // TODO
          // if (!btn.url.trim().startsWith('https://')) {
          //   setValidationError(`Button ${i + 1} ("${btn.title}") URL must start with https://`);
          //   return;
          // }
        }
      }
    }

    // 4. Carousel (Generic Template) Validation
    if (dmFormat === 'generic_template') {
      if (carouselElements.length === 0) {
        setValidationError('At least one card is required for Carousel.');
        return;
      }
      for (let i = 0; i < carouselElements.length; i++) {
        const elem = carouselElements[i];

        // 1. Image Asset Validation
        if (!elem.image_url || !elem.image_url.trim()) {
          setValidationError(`Card ${i + 1} Image Asset is required.`);
          return;
        }

        // 2. Default Click Action Web URL Validation
        if (!elem.default_action?.url || elem.default_action.url.trim() === '' || elem.default_action.url.trim() === 'https://') {
          if (showProductPicker[`carousel-product-${i}`]) {
            setValidationError(`Card ${i + 1} must have a selected catalog product.`);
          } else {
            setValidationError(`Card ${i + 1} Default Click Action Web URL is required.`);
          }
          return;
        }
        // TODO
        // if (!elem.default_action.url.trim().startsWith('https://')) {
        //   setValidationError(`Card ${i + 1} default action URL must start with https://`);
        //   return;
        // }

        // 3. Card Title Validation
        if (!elem.title || !elem.title.trim()) {
          setValidationError(`Card ${i + 1} Title is required.`);
          return;
        }

        // 4. Card Subtitle / Description Validation
        if (!elem.subtitle || !elem.subtitle.trim()) {
          setValidationError(`Card ${i + 1} Card Subtitle / Description is required.`);
          return;
        }

        if (elem.buttons) {
          for (let j = 0; j < elem.buttons.length; j++) {
            const btn = elem.buttons[j];
            if (!btn.title || !btn.title.trim()) {
              setValidationError(`Card ${i + 1} Button ${j + 1} title is required.`);
              return;
            }
            if (btn.type === 'web_url' || btn.type === 'product') {
              if (!btn.url || btn.url.trim() === '' || btn.url.trim() === 'https://') {
                setValidationError(`Card ${i + 1} Button ${j + 1} ("${btn.title}") URL is required.`);
                return;
              }
              // TODO
              // if (!btn.url.trim().startsWith('https://')) {
              //   setValidationError(`Card ${i + 1} Button ${j + 1} ("${btn.title}") URL must start with https://`);
              //   return;
              // }
            }
          }
        }
      }
    }

    // 5. Attachment Validation
    if (dmFormat === 'attachment') {
      if (attachments.length === 0) {
        setValidationError('At least one attachment is required.');
        return;
      }
      for (let i = 0; i < attachments.length; i++) {
        const att = attachments[i];
        if (att.type === 'sticker' && !att.sticker_id?.trim()) {
          setValidationError(`Attachment ${i + 1} (Sticker) is missing its sticker type/ID.`);
          return;
        }
        if (att.type === 'MEDIA_SHARE' && !att.media_id?.trim()) {
          setValidationError(`Attachment ${i + 1} (Media Share) is missing its Instagram Media ID.`);
          return;
        }
        if (['image', 'video', 'audio'].includes(att.type) && !att.url?.trim()) {
          setValidationError(`Attachment ${i + 1} (${att.type}) is missing its file URL.`);
          return;
        }
      }
    }

    // Clear validation error if valid
    setValidationError(null);

    // Save settings fields
    if (isEcommerceTemplate) {
      dispatch(updateNodeData({ id: nodeId, key: 'dm_format', value: dmFormat }));
      dispatch(updateNodeData({ id: nodeId, key: 'rate_limit_limit', value: rateLimitCount }));
      dispatch(updateNodeData({ id: nodeId, key: 'rate_limit_window_seconds', value: rateLimitWindow }));
      dispatch(updateNodeData({ id: nodeId, key: 'detailed', value: detailedCardView }));
    }

    if (dmFormat === 'text') {
      dispatch(updateNodeData({ id: nodeId, key: 'messages', value: textMessages }));
    } else if (dmFormat === 'quick_reply') {
      dispatch(updateNodeData({ id: nodeId, key: 'quick_reply_text', value: quickReplyText }));
      dispatch(updateNodeData({ id: nodeId, key: 'quick_replies_titles', value: quickRepliesTitles }));
      dispatch(updateNodeData({ id: nodeId, key: 'messages', value: [quickReplyText] }));
    } else if (dmFormat === 'button_template') {
      dispatch(updateNodeData({ id: nodeId, key: 'button_template_text', value: buttonTemplateText }));
      dispatch(updateNodeData({ id: nodeId, key: 'button_template_buttons_json', value: JSON.stringify(buttonTemplateButtons) }));
      dispatch(updateNodeData({ id: nodeId, key: 'messages', value: [buttonTemplateText] }));
    } else if (dmFormat === 'generic_template') {
      dispatch(updateNodeData({ id: nodeId, key: 'generic_template_elements_json', value: JSON.stringify(carouselElements) }));
      dispatch(updateNodeData({ id: nodeId, key: 'messages', value: [carouselElements[0]?.title || 'Here is your catalog'] }));
    } else if (dmFormat === 'attachment') {
      dispatch(updateNodeData({ id: nodeId, key: 'attachments', value: attachments }));
      dispatch(updateNodeData({ id: nodeId, key: 'messages', value: [`Sent ${attachments.length} attachment${attachments.length === 1 ? '' : 's'}`] }));
    }
    onClose();
  };

  // Save current state to Redux without validation (used by Cancel to preserve in-progress edits)
  const handleCancel = () => {
    dispatch(updateNodeData({ id: nodeId, key: 'dm_format', value: dmFormat }));
    dispatch(updateNodeData({ id: nodeId, key: 'rate_limit_limit', value: rateLimitCount }));
    dispatch(updateNodeData({ id: nodeId, key: 'rate_limit_window_seconds', value: rateLimitWindow }));
    dispatch(updateNodeData({ id: nodeId, key: 'detailed', value: detailedCardView }));
    if (dmFormat === 'text') {
      dispatch(updateNodeData({ id: nodeId, key: 'messages', value: textMessages }));
    } else if (dmFormat === 'quick_reply') {
      dispatch(updateNodeData({ id: nodeId, key: 'quick_reply_text', value: quickReplyText }));
      dispatch(updateNodeData({ id: nodeId, key: 'quick_replies_titles', value: quickRepliesTitles }));
    } else if (dmFormat === 'button_template') {
      dispatch(updateNodeData({ id: nodeId, key: 'button_template_text', value: buttonTemplateText }));
      dispatch(updateNodeData({ id: nodeId, key: 'button_template_buttons_json', value: JSON.stringify(buttonTemplateButtons) }));
    } else if (dmFormat === 'generic_template') {
      dispatch(updateNodeData({ id: nodeId, key: 'generic_template_elements_json', value: JSON.stringify(carouselElements) }));
    } else if (dmFormat === 'attachment') {
      dispatch(updateNodeData({ id: nodeId, key: 'attachments', value: attachments }));
    }
    onClose();
  };

  // --- Cloudinary Asset Upload ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, cardIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMap(prev => ({ ...prev, [cardIndex]: true }));
    setUploadProgressMap(prev => ({ ...prev, [cardIndex]: 0 }));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'any_dm_product_upload');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.cloudinary.com/v1_1/dx5bqewfx/auto/upload', true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgressMap(prev => ({ ...prev, [cardIndex]: percent }));
      }
    };

    xhr.onload = () => {
      setUploadingMap(prev => ({ ...prev, [cardIndex]: false }));
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          const secureUrl = response.secure_url;

          setCarouselElements(prev => {
            const updated = [...prev];
            updated[cardIndex] = {
              ...updated[cardIndex],
              image_url: secureUrl
            };
            return updated;
          });
        } catch (err) {
          alert('Failed to parse upload result.');
        }
      } else {
        alert('Image upload failed.');
      }
    };

    xhr.onerror = () => {
      setUploadingMap(prev => ({ ...prev, [cardIndex]: false }));
      alert('Network error during image upload.');
    };

    xhr.send(formData);
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const validFiles: File[] = [];

    for (const file of fileList) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      let detectedType: 'image' | 'video' | 'audio' | 'file' | null = null;
      let maxSize = 0;
      let allowedExtsStr = '';

      if (selectedAttachmentType === 'image') {
        if (['png', 'jpeg', 'jpg'].includes(ext)) {
          detectedType = 'image';
          maxSize = 8 * 1024 * 1024; // 8MB
        }
        allowedExtsStr = 'PNG, JPEG';
      } else if (selectedAttachmentType === 'video') {
        if (['mp4', 'ogg', 'avi', 'mov', 'webm'].includes(ext)) {
          detectedType = 'video';
          maxSize = 25 * 1024 * 1024; // 25MB
        }
        allowedExtsStr = 'MP4, OGG, AVI, MOV, WEBM';
      } else if (selectedAttachmentType === 'audio') {
        if (['aac', 'm4a', 'wav', 'mp4'].includes(ext)) {
          detectedType = 'audio';
          maxSize = 25 * 1024 * 1024; // 25MB
        }
        allowedExtsStr = 'AAC, M4A, WAV, MP4';
      } else if (selectedAttachmentType === 'file') {
        if (ext === 'pdf') {
          detectedType = 'file';
          maxSize = 25 * 1024 * 1024; // 25MB
        }
        allowedExtsStr = 'PDF';
      }

      if (!detectedType) {
        alert(`Invalid file format for ${file.name}. Only ${allowedExtsStr} files are allowed.`);
        continue;
      }

      if (file.size > maxSize) {
        const limitMB = maxSize / (1024 * 1024);
        alert(`File ${file.name} exceeds the maximum size limit of ${limitMB}MB.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      if (attachmentFileInputRef.current) {
        attachmentFileInputRef.current.value = '';
      }
      return;
    }

    validFiles.forEach(file => {
      const fileId = Math.random().toString(36).substring(2, 9);

      setUploadingFiles(prev => [...prev, { id: fileId, name: file.name, progress: 0 }]);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'any_dm_product_upload');

      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://api.cloudinary.com/v1_1/dx5bqewfx/auto/upload', true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadingFiles(prev =>
            prev.map(f => f.id === fileId ? { ...f, progress: percent } : f)
          );
        }
      };

      xhr.onload = () => {
        setUploadingFiles(prev => prev.filter(f => f.id !== fileId));

        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            const secureUrl = response.secure_url;

            let detectedType: 'image' | 'video' | 'audio' | 'file' = 'image';
            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            if (['mp4', 'ogg', 'avi', 'mov', 'webm'].includes(ext)) {
              detectedType = 'video';
            } else if (['aac', 'm4a', 'wav'].includes(ext)) {
              detectedType = 'audio';
            } else if (ext === 'pdf') {
              detectedType = 'file';
            }

            setAttachments(prev => [...prev, { type: detectedType, url: secureUrl }]);
          } catch (err) {
            alert(`Failed to parse upload result for ${file.name}`);
          }
        } else {
          alert(`Upload failed for ${file.name}`);
        }
      };

      xhr.onerror = () => {
        setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
        alert(`Network error during upload of ${file.name}`);
      };

      xhr.send(formData);
    });

    if (attachmentFileInputRef.current) {
      attachmentFileInputRef.current.value = '';
    }
  };

  // --- Helper Methods ---
  // Quick Action Pills
  const addQuickReplyPill = () => {
    if (quickRepliesTitles.length >= 13) return;
    setQuickRepliesTitles([...quickRepliesTitles, `Option ${quickRepliesTitles.length + 1}`]);
  };

  const removeQuickReplyPill = (idx: number) => {
    setQuickRepliesTitles(quickRepliesTitles.filter((_, i) => i !== idx));
  };

  const updateQuickReplyPill = (idx: number, val: string) => {
    const copy = [...quickRepliesTitles];
    copy[idx] = val;
    setQuickRepliesTitles(copy);
  };

  // Action Buttons
  const addButton = () => {
    if (buttonTemplateButtons.length >= 3) return;
    const newIdx = buttonTemplateButtons.length;
    setButtonTemplateButtons([...buttonTemplateButtons, { type: 'web_url', title: 'New Button', url: 'https://' }]);
    setActiveButtonTemplateButtonIndex(newIdx);
  };

  const removeButton = (idx: number) => {
    setButtonTemplateButtons(buttonTemplateButtons.filter((_, i) => i !== idx));
    setActiveButtonTemplateButtonIndex(prev => Math.max(0, prev - 1));
  };

  const updateButton = (idx: number, field: keyof ButtonItem, val: string) => {
    const copy = [...buttonTemplateButtons];
    if (field === 'type' && val === 'track_order') {
      copy[idx] = {
        ...copy[idx],
        type: 'postback',
        payload: 'TRACK_ORDER',
        url: undefined
      } as any;
    } else {
      copy[idx] = { ...copy[idx], [field]: val } as ButtonItem;
      // reset conditional values
      if (field === 'type') {
        if (val === 'web_url' || val === 'product') {
          copy[idx].payload = undefined;
          copy[idx].url = 'https://';
        } else {
          copy[idx].url = undefined;
          const uniqueId = Math.random().toString(36).substring(2, 7).toUpperCase();
          copy[idx].payload = `TRIGGER_EVENT_${uniqueId}`;
          copy[idx].title = 'Details';
        }
      }
    }
    setButtonTemplateButtons(copy);
  };

  // Carousel Cards
  const addCarouselCard = () => {
    if (carouselElements.length >= 10) return;
    const newIdx = carouselElements.length;
    setCarouselElements([...carouselElements, {
      title: 'New Product Item',
      subtitle: 'Premium catalog description.',
      image_url: 'https://cdn.pixabay.com/photo/2020/04/02/07/35/cat-4993829_960_720.jpg',
      default_action: { type: 'web_url', url: 'https://' },
      buttons: [{ type: 'web_url', title: '🛒 Shop Now', url: 'https://' }]
    }]);
    setTimeout(() => scrollToCard(newIdx), 50);
  };

  const removeCarouselCard = (idx: number) => {
    if (carouselElements.length <= 1) return;
    setCarouselElements(carouselElements.filter((_, i) => i !== idx));
    const nextIdx = Math.max(0, idx - 1);
    scrollToCard(nextIdx);
  };

  const updateCarouselField = (cardIdx: number, key: keyof GenericElement, val: any) => {
    const copy = [...carouselElements];
    copy[cardIdx] = { ...copy[cardIdx], [key]: val };
    setCarouselElements(copy);
  };

  const updateCarouselButton = (cardIdx: number, btnIdx: number, field: keyof ButtonItem, val: string) => {
    const copy = [...carouselElements];
    const card = { ...copy[cardIdx] };
    const btns = [...(card.buttons || [])];
    if (field === 'type' && val === 'track_order') {
      btns[btnIdx] = {
        ...btns[btnIdx],
        type: 'postback',
        payload: 'TRACK_ORDER',
        url: undefined
      } as any;
    } else {
      btns[btnIdx] = { ...btns[btnIdx], [field]: val } as ButtonItem;
      if (field === 'type') {
        if (val === 'web_url' || val === 'product') {
          btns[btnIdx].payload = undefined;
          btns[btnIdx].url = 'https://';
        } else {
          btns[btnIdx].url = undefined;
          const uniqueId = Math.random().toString(36).substring(2, 7).toUpperCase();
          btns[btnIdx].payload = `TRIGGER_EVENT_${uniqueId}`;
          btns[btnIdx].title = 'Details';
        }
      }
    }
    card.buttons = btns;
    copy[cardIdx] = card;
    setCarouselElements(copy);
  };

  const addCarouselButton = (cardIdx: number) => {
    const copy = [...carouselElements];
    const card = { ...copy[cardIdx] };
    const btns = [...(card.buttons || [])];
    if (btns.length >= 3) return;
    btns.push({ type: 'web_url', title: 'New Button', url: 'https://' });
    card.buttons = btns;
    copy[cardIdx] = card;
    setCarouselElements(copy);
  };

  const removeCarouselButton = (cardIdx: number, btnIdx: number) => {
    const copy = [...carouselElements];
    const card = { ...copy[cardIdx] };
    card.buttons = (card.buttons || []).filter((_, i) => i !== btnIdx);
    copy[cardIdx] = card;
    setCarouselElements(copy);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-hidden text-white font-inter">
      {/* Ethereal Background Glows */}
      <div className="absolute w-[40vw] h-[40vw] rounded-full bg-[#c4c0ff] top-[-20%] left-[-20%] filter blur-[120px] opacity-[0.1] pointer-events-none z-0" />
      <div className="absolute w-[40vw] h-[40vw] rounded-full bg-[#636565] bottom-[-20%] right-[-20%] filter blur-[120px] opacity-[0.1] pointer-events-none z-0" />

      {/* Outer Card Wrapper */}
      <div className="w-full max-w-6xl h-[88vh] max-h-[880px] bg-[#131313]/90 backdrop-blur-3xl border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-[0_32px_64px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in duration-300 text-white relative z-10 font-inter">

        {/* Modal Header with Actions */}
        <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-transparent">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-inter text-base md:text-lg font-bold text-white tracking-tight leading-tight">
                Flow Configuration
              </h2>
              <span className="text-xs text-zinc-400 font-medium tracking-wide block mt-1 leading-tight">
                {format === 'attachment'
                  ? 'Upload and manage files, images, or documents for Instagram DM automation'
                  : 'Customize your visual Instagram direct message layout and payloads'}
              </span>
            </div>
          </div>
          {/* Header Action Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded border border-white/10 text-zinc-300 font-semibold text-xs md:text-sm hover:bg-white/5 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded bg-white text-black font-bold text-xs md:text-sm hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-white/5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />Save
            </button>
          </div>
        </div>

        {validationError && (
          <div className="px-8 py-3 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2 text-red-400 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 shrink-0">
            <Info className="w-4 h-4 text-red-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Modal Body: Split Panel */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row">

          {/* LEFT: Instagram High-Fidelity Preview Box */}
          <div className="lg:w-[420px] bg-black/25 p-6 flex flex-col items-center overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/10 shrink-0 min-h-0 custom-scrollbar">


            {/* Phone Container (Realistic Device Frame) */}
            <div className="w-[280px] h-[560px] rounded-[44px] border-[8px] border-[#2a2a2a] bg-black shadow-2xl relative flex flex-col overflow-hidden select-none outline outline-2 outline-[#393939] shrink-0 my-auto">

              {/* Notch / Dynamic Island */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-30 pointer-events-none" />

              {/* Inner Screen Content Wrapper */}
              <div
                className="h-full w-full flex flex-col pt-0 relative z-10 bg-black rounded-[36px] overflow-hidden"
                style={{ clipPath: 'inset(0 round 36px)' }}
              >

                {/* iOS Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-6 px-5 flex items-center justify-between text-[9px] font-semibold text-white z-20 pointer-events-none bg-transparent">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    {/* Signal */}
                    <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                      <path d="M2 22h20V2z" />
                    </svg>
                    {/* Wifi */}
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 20h.01M8.5 16.5a5 5 0 0 1 7 0M5.5 13.5a9 9 0 0 1 13 0M2.5 10.5a13 13 0 0 1 19 0" />
                    </svg>
                    {/* Battery */}
                    <div className="w-4 h-2 border border-white/80 rounded-2xs p-0.5 flex items-center">
                      <div className="h-full w-3/4 bg-white/90 rounded-[1px]" />
                    </div>
                  </div>
                </div>

                {/* Instagram App Header Mock */}
                <div
                  className="pt-8 h-20 border-b border-white/5 px-4 flex items-center gap-3 bg-black/40 backdrop-blur-md shrink-0 rounded-t-[36px]"
                  style={{ clipPath: 'inset(0 round 36px 36px 0 0)' }}
                >
                  <ChevronLeft className="w-5 h-5 text-white shrink-0 cursor-pointer" />
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 overflow-hidden shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=50&h=50"
                      className="w-full h-full object-cover"
                      alt="Customer"
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-[11px] font-bold text-white truncate leading-tight block">
                      customer_chat
                    </span>
                    <span className="text-[8px] text-zinc-400 font-medium leading-none block mt-0.5">Active 10m ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-white shrink-0">
                    {/* Phone/Call icon */}
                    <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a12.035 12.035 0 01-7.108-7.108c-.155-.44.01-.928.387-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    {/* Video call icon */}
                    <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                </div>

                {/* Chat Thread Body */}
                <div ref={chatThreadRef} className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4 scrollbar-hide bg-black">
                  <div className="flex-1" />

                  {/* Simulated Customer Message Bubble (LEFT) */}
                  <div className="self-start flex items-end gap-2 max-w-[85%] shrink-0">
                    <div className="w-5 h-5 rounded-full bg-zinc-800 shrink-0 overflow-hidden mb-0.5 border border-white/5">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=50&h=50"
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    </div>
                    <div className="bg-[#262626] border border-white/5 rounded-2xl rounded-bl-none px-3.5 py-2 text-[11px] text-zinc-200">
                      {format === 'quick_reply' && "which side do youhave"}
                      {format === 'generic_template' && "send me the latest items"}
                      {format === 'attachment' && "send me the photos and videos"}
                      {format !== 'quick_reply' && format !== 'generic_template' && format !== 'attachment' && "Hi! I want to buy."}
                    </div>
                  </div>

                  {/* Incoming Auto-response Mock (RIGHT) */}
                  <div className={cn(
                    "flex flex-col shrink-0 gap-2",
                    (format === 'generic_template' && carouselElements.length > 1)
                      ? "w-full self-stretch items-stretch"
                      : "self-end items-end max-w-[85%]"
                  )}>

                    {/* Format-Specific Interactive Elements */}
                    <div className={cn(
                      "flex flex-col gap-2 w-full",
                      (format === 'generic_template' && carouselElements.length > 1) ? "items-stretch" : "items-end"
                    )}>

                      {/* FORMAT: Text Message bubble */}
                      {format === 'text' && (
                        <div className="bg-[#3797F0] border border-[#3797F0] rounded-2xl px-3.5 py-2.5 text-[11px] text-white leading-relaxed text-left break-words shadow-md animate-fadeIn">
                          {textMessages[0] || 'Hello!'}
                        </div>
                      )}

                      {/* FORMAT: Quick Replies Prompt text bubble */}
                      {format === 'quick_reply' && (
                        <>
                          <div className="bg-[#3797F0] border border-[#3797F0] rounded-2xl px-3.5 py-2.5 text-[11px] text-white leading-relaxed text-left break-words shadow-md animate-fadeIn">
                            {quickReplyText || 'Pick size:'}
                          </div>
                          {/* Quick Reply Pills Rendered right beneath the bubble */}
                          <div className="flex flex-wrap items-center justify-end gap-1.5 w-full mt-1 shrink-0 animate-fadeIn">
                            {quickRepliesTitles.map((title, qri) => (
                              <button
                                key={qri}
                                type="button"
                                className="py-1 px-2.5 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 rounded-full text-[10px] font-semibold text-[#3797F0] transition-all whitespace-nowrap cursor-pointer shadow-sm"
                              >
                                {title || 'Pill'}
                              </button>
                            ))}
                          </div>
                        </>
                      )}

                      {/* FORMAT: Button Template Box */}
                      {format === 'button_template' && (
                        <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl overflow-hidden w-full shadow-lg flex flex-col shrink-0 animate-fadeIn">
                          <div className="p-3 text-[11px] text-white leading-normal break-words border-b border-white/5 bg-white/5">
                            {buttonTemplateText || 'What would you like to do?'}
                          </div>
                          <div className="flex flex-col divide-y divide-white/5 bg-[#1c1c1c]">
                            {buttonTemplateButtons.map((btn, bi) => {
                              let displayTitle = btn.title || 'Button';
                              const matchedProduct = products.find(p => {
                                const username = activeAccount?.username || appUser?.username || 'shop';
                                const prodUrl = `product/${p.id}`;
                                return btn.url?.includes(prodUrl);
                              });
                              if (displayTitle.includes('{{price}}')) {
                                const priceStr = matchedProduct ? `₹${matchedProduct.price}` : '₹7,499';
                                displayTitle = displayTitle.replace('{{price}}', priceStr);
                              }
                              if (displayTitle.includes('{{name}}')) {
                                const nameStr = matchedProduct ? (matchedProduct.title || matchedProduct.name) : 'Product';
                                displayTitle = displayTitle.replace('{{name}}', nameStr);
                              }
                              return (
                                <button
                                  key={bi}
                                  type="button"
                                  className="w-full py-2.5 text-[10px] font-bold text-[#3797F0] hover:bg-white/5 text-center transition-colors cursor-pointer"
                                >
                                  {displayTitle}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* FORMAT: Generic Template (Carousel) Cards */}
                      {format === 'generic_template' && (
                        <div className="w-full flex flex-col items-center space-y-2 animate-fadeIn overflow-hidden">
                          {/* Horizontal scrollable container */}
                          <div
                            ref={carouselScrollRef}
                            onScroll={handleCarouselScroll}
                            onMouseDown={handleMouseDown}
                            className={cn(
                              "w-full flex flex-row items-start gap-2.5 pb-2 select-none",
                              carouselElements.length > 1
                                ? "overflow-x-auto scrollbar-hide -mx-4 px-4 cursor-grab active:cursor-grabbing"
                                : "justify-end",
                              (isDraggingCarousel && carouselElements.length > 1) ? "snap-none" : "snap-x snap-mandatory"
                            )}
                          >
                            {carouselElements.map((elem, ei) => (
                              <div
                                key={ei}
                                className="bg-[#1c1c1c] border border-white/10 rounded-2xl overflow-hidden w-[190px] shrink-0 snap-start shadow-lg flex flex-col text-left transition-all"
                              >
                                <div className="h-20 w-full bg-zinc-900 border-b border-white/5 relative overflow-hidden flex items-center justify-center shrink-0">
                                  {elem.image_url ? (
                                    <img src={elem.image_url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="text-[9px] font-semibold text-zinc-500 tracking-wide">No image uploaded</div>
                                  )}
                                </div>
                                <div className={cn("p-2.5 flex flex-col bg-[#121212] justify-center shrink-0", (elem.buttons && elem.buttons.length > 0) ? "border-b border-white/5" : "")}>
                                  {(() => {
                                    let displayTitle = elem.title || 'Welcome!';
                                    let displaySubtitle = elem.subtitle || 'Card Description';
                                    const matchedProduct = products.find(p => {
                                      const username = activeAccount?.username || appUser?.username || 'shop';
                                      const prodUrl = `product/${p.id}`;
                                      return elem.default_action?.url?.includes(prodUrl);
                                    });

                                    if (displayTitle.includes('{{price}}')) {
                                      const priceStr = matchedProduct ? `₹${matchedProduct.price}` : '₹7,499';
                                      displayTitle = displayTitle.replace('{{price}}', priceStr);
                                    }
                                    if (displayTitle.includes('{{name}}')) {
                                      const nameStr = matchedProduct ? (matchedProduct.title || matchedProduct.name) : 'Product';
                                      displayTitle = displayTitle.replace('{{name}}', nameStr);
                                    }

                                    if (displaySubtitle.includes('{{price}}')) {
                                      const priceStr = matchedProduct ? `₹${matchedProduct.price}` : '₹7,499';
                                      displaySubtitle = displaySubtitle.replace('{{price}}', priceStr);
                                    }
                                    if (displaySubtitle.includes('{{name}}')) {
                                      const nameStr = matchedProduct ? (matchedProduct.title || matchedProduct.name) : 'Product';
                                      displaySubtitle = displaySubtitle.replace('{{name}}', nameStr);
                                    }

                                    return (
                                      <>
                                        <span className="text-[10px] font-bold text-white truncate">{displayTitle}</span>
                                        <span className="text-[8px] text-zinc-400 mt-0.5 line-clamp-2 leading-tight">{displaySubtitle}</span>
                                      </>
                                    );
                                  })()}
                                </div>
                                {elem.buttons && elem.buttons.length > 0 && (
                                  <div className="flex flex-col divide-y divide-white/5 bg-[#1c1c1c] shrink-0">
                                    {elem.buttons.map((btn, bi) => {
                                      let displayTitle = btn.title || 'Button';
                                      const matchedProduct = products.find(p => {
                                        const username = activeAccount?.username || appUser?.username || 'shop';
                                        const prodUrl = `product/${p.id}`;
                                        return btn.url?.includes(prodUrl);
                                      });
                                      if (displayTitle.includes('{{price}}')) {
                                        const priceStr = matchedProduct ? `₹${matchedProduct.price}` : '₹7,499';
                                        displayTitle = displayTitle.replace('{{price}}', priceStr);
                                      }
                                      if (displayTitle.includes('{{name}}')) {
                                        const nameStr = matchedProduct ? (matchedProduct.title || matchedProduct.name) : 'Product';
                                        displayTitle = displayTitle.replace('{{name}}', nameStr);
                                      }
                                      return (
                                        <button
                                          key={bi}
                                          type="button"
                                          className="w-full py-1.5 text-[9px] font-bold text-[#3797F0] hover:bg-white/5 text-center transition-colors"
                                        >
                                          {displayTitle}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Swiper Dots */}
                          {carouselElements.length > 1 && (
                            <div className="flex items-center gap-1">
                              {carouselElements.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => scrollToCard(idx)}
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-all duration-200",
                                    idx === activeCardIndex ? "bg-white scale-110" : "bg-zinc-700"
                                  )}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* FORMAT: Media / Attachment Preview */}
                      {format === 'attachment' && (
                        <div className="flex flex-col gap-3 w-full items-end animate-fadeIn">
                          {/* Inject CSS Animation for Audio Spectrum */}
                          <style>{`
                            @keyframes audioWave {
                              0% { height: 25%; }
                              100% { height: 100%; }
                            }
                          `}</style>

                          {attachments.length > 0 ? (
                            (() => {
                              // Group consecutive images together, other types are separate
                              const groupedPreviews: { type: string; data: any }[] = [];
                              let currentImageGroup: any[] = [];

                              attachments.forEach((att) => {
                                if (att.type === 'image') {
                                  currentImageGroup.push(att);
                                } else {
                                  if (currentImageGroup.length > 0) {
                                    groupedPreviews.push({ type: 'images', data: currentImageGroup });
                                    currentImageGroup = [];
                                  }
                                  groupedPreviews.push({ type: att.type, data: att });
                                }
                              });
                              if (currentImageGroup.length > 0) {
                                groupedPreviews.push({ type: 'images', data: currentImageGroup });
                              }

                              return (
                                <div className="flex flex-col gap-3.5 w-full items-end">
                                  {groupedPreviews.map((group, gIdx) => {
                                    if (group.type === 'images') {
                                      const isSingle = group.data.length === 1;
                                      if (isSingle) {
                                        return (
                                          <div key={gIdx} className="w-[110px] aspect-[9/16] rounded-2xl border border-white/10 overflow-hidden bg-zinc-900 shadow-md">
                                            <img src={group.data[0].url} alt="" className="w-full h-full object-cover" />
                                          </div>
                                        );
                                      } else {
                                        return (
                                          <div key={gIdx} className="relative w-[110px] h-[195px] mr-2">
                                            {group.data.slice(0, 3).map((img: any, index: number) => {
                                              const rotation = index === 0 ? '-4deg' : index === 1 ? '3deg' : '0deg';
                                              const translateX = index === 0 ? '-6px' : index === 1 ? '6px' : '0px';
                                              const translateY = index * 4;
                                              return (
                                                <div
                                                  key={index}
                                                  className="absolute inset-0 rounded-2xl border border-white/10 overflow-hidden bg-zinc-900 shadow-md transition-all duration-300"
                                                  style={{
                                                    transform: `rotate(${rotation}) translate(${translateX}, ${translateY}px)`,
                                                    zIndex: 10 - index,
                                                    opacity: 1 - index * 0.15
                                                  }}
                                                >
                                                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                                                </div>
                                              );
                                            })}
                                            {group.data.length > 3 && (
                                              <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-bold text-white z-[12] border border-white/10 shadow-lg">
                                                +{group.data.length - 3}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      }
                                    } else if (group.type === 'sticker') {
                                      return (
                                        <div key={gIdx} className="flex items-center justify-end w-full pr-1.5 animate-fadeIn select-none">
                                          <span className="text-3xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] animate-pulse">
                                            ❤️
                                          </span>
                                        </div>
                                      );
                                    } else if (group.type === 'video') {
                                      const isPlaying = playingVideoIndex === gIdx;
                                      return (
                                        <div
                                          key={gIdx}
                                          onClick={() => setPlayingVideoIndex(isPlaying ? null : gIdx)}
                                          className="w-[110px] aspect-[9/16] rounded-2xl border border-white/10 overflow-hidden bg-zinc-950 shadow-md relative flex items-center justify-center group animate-fadeIn cursor-pointer"
                                        >
                                          {group.data.url && (
                                            <video
                                              key={isPlaying ? 'playing' : 'paused'}
                                              src={group.data.url}
                                              autoPlay={isPlaying}
                                              loop={isPlaying}
                                              muted
                                              playsInline
                                              className="absolute inset-0 w-full h-full object-cover z-0"
                                            />
                                          )}
                                          {!isPlaying && (
                                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-10">
                                              <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 transition-all">
                                                {/* Play icon */}
                                                <svg className="w-3 h-3 text-white fill-white ml-0.5" viewBox="0 0 24 24">
                                                  <path d="M8 5v14l11-7z" />
                                                </svg>
                                              </div>
                                            </div>
                                          )}
                                          <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between z-20">
                                            <span className="text-[6px] font-bold text-white/50 bg-black/45 px-1 py-0.5 rounded">VIDEO</span>
                                            <span className="text-[6px] font-bold text-white/90">0:15</span>
                                          </div>
                                        </div>
                                      );
                                    } else if (group.type === 'audio') {
                                      const isPlaying = playingAudioIndex === gIdx;

                                      const handleAudioPlay = () => {
                                        if (isPlaying) {
                                          activeAudio?.pause();
                                          setPlayingAudioIndex(null);
                                          setActiveAudio(null);
                                        } else {
                                          activeAudio?.pause();
                                          if (group.data.url) {
                                            const audio = new Audio(group.data.url);
                                            audio.play().catch(e => console.warn("Audio play failed:", e));
                                            audio.onended = () => {
                                              setPlayingAudioIndex(null);
                                              setActiveAudio(null);
                                            };
                                            setActiveAudio(audio);
                                            setPlayingAudioIndex(gIdx);
                                          } else {
                                            // Fallback simulation if no URL
                                            setPlayingAudioIndex(gIdx);
                                            setTimeout(() => {
                                              setPlayingAudioIndex(null);
                                            }, 8000);
                                          }
                                        }
                                      };

                                      return (
                                        <div key={gIdx} className="bg-[#1c1c1c] border border-white/10 rounded-2xl rounded-br-none px-2.5 py-2 shadow-md flex items-center gap-2 w-[110px] h-[36px] animate-fadeIn shrink-0">
                                          <button
                                            type="button"
                                            onClick={handleAudioPlay}
                                            className="w-5 h-5 rounded-full bg-[#CECBF6]/20 border border-[#CECBF6]/30 flex items-center justify-center shrink-0 cursor-pointer hover:bg-[#CECBF6]/30 transition-colors"
                                          >
                                            {isPlaying ? (
                                              <svg className="w-2 h-2 text-[#CECBF6] fill-[#CECBF6]" viewBox="0 0 24 24">
                                                <rect x="4" y="4" width="4" height="16" />
                                                <rect x="16" y="4" width="4" height="16" />
                                              </svg>
                                            ) : (
                                              <svg className="w-2 h-2 text-[#CECBF6] fill-[#CECBF6] ml-0.5" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                              </svg>
                                            )}
                                          </button>
                                          <div className="flex-1 flex items-end justify-between h-2.5 gap-0.5 pt-0.5">
                                            {[40, 70, 50, 90, 30, 80, 60, 45, 75, 35].map((val, idx) => (
                                              <div
                                                key={idx}
                                                className="w-[1.2px] bg-[#CECBF6] rounded-full"
                                                style={{
                                                  height: `${val}%`,
                                                  animationName: isPlaying ? 'audioWave' : 'none',
                                                  animationDuration: '1.2s',
                                                  animationTimingFunction: 'ease-in-out',
                                                  animationIterationCount: 'infinite',
                                                  animationDirection: 'alternate',
                                                  animationDelay: `${idx * 0.1}s`
                                                }}
                                              />
                                            ))}
                                          </div>
                                          <span className="text-[6px] font-bold text-zinc-500 shrink-0">{isPlaying ? 'Play' : '0:08'}</span>
                                        </div>
                                      );
                                    } else {
                                      // MEDIA_SHARE or other general files
                                      const isMediaShare = group.type === 'MEDIA_SHARE';
                                      const cached = mediaDetailsCache[group.data.media_id || ''];
                                      const hasImage = cached?.media_url;

                                      return (
                                        <div key={gIdx} className="w-[110px] h-[195px] rounded-2xl border border-white/10 overflow-hidden bg-[#1c1c1c] shadow-lg flex flex-col shrink-0 animate-fadeIn">
                                          {/* Top header with Instagram icon & name */}
                                          <div className="p-1.5 bg-[#121212] flex items-center gap-1 shrink-0 border-b border-white/5">
                                            <div className="w-3 h-3 rounded-full bg-zinc-800 flex items-center justify-center text-[5px] text-white font-bold">IG</div>
                                            <span className="text-[6px] text-zinc-400 font-bold truncate">
                                              {isMediaShare ? 'Instagram Post' : 'Attachment'}
                                            </span>
                                          </div>
                                          {/* Media Image */}
                                          <div className="flex-1 bg-zinc-900 relative flex items-center justify-center overflow-hidden">
                                            {hasImage ? (
                                              <img src={cached.media_type === 'VIDEO' ? (cached.thumbnail_url || cached.media_url) : cached.media_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                              isMediaShare ? (
                                                <Share2 className="w-4 h-4 text-emerald-400" />
                                              ) : (
                                                <Paperclip className="w-4 h-4 text-white/70" />
                                              )
                                            )}
                                          </div>
                                        </div>
                                      );
                                    }
                                  })}
                                </div>
                              );
                            })()
                          ) : (
                            <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl rounded-br-none px-4 py-3 text-[11px] text-white/60 text-center italic leading-normal">
                              No attachments uploaded.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>


                </div>

                {/* Instagram Message Typing Section */}
                <div className="p-3.5 border-t border-white/5 bg-black shrink-0">
                  <div className="flex items-center gap-2.5">
                    {/* Camera Button (Outside) */}
                    <div className="w-7 h-7 rounded-full bg-[#3797F0] flex items-center justify-center shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </div>
                    {/* Message input mock pill */}
                    <div className="flex-1 bg-[#1c1b1b] rounded-full px-3.5 py-1.5 flex items-center justify-between border border-white/5">
                      <span className="text-[11px] text-zinc-500 font-medium">Message...</span>
                      <div className="flex items-center gap-2.5 text-zinc-400 shrink-0">
                        <Mic className="w-3.5 h-3.5 hover:text-white transition-colors cursor-pointer" />
                        <ImageIcon className="w-3.5 h-3.5 hover:text-white transition-colors cursor-pointer" />
                        <Smile className="w-3.5 h-3.5 hover:text-white transition-colors cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT: Editor Fields Manager Panel */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

            <div className="glass-pane p-6 rounded border border-white/10 space-y-6 shadow-xl animate-fadeIn">
              {/* <div className="flex items-center gap-2 pb-2 border-b border-white/15">
                <Sparkles className="w-4 h-4 text-white" />
                <h3 className="font-sora text-xs font-semibold text-white tracking-[0.1em] ">Core Logic</h3>
              </div> */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* DM Format */}
                <CustomSelect
                  labelClassName='font-sora text-[10px] font-bold text-zinc-400 tracking-wider  block mb-1.5'
                  label="DM Format Layout"
                  value={dmFormat}
                  onChange={(val) => {
                    const oldFormat = dmFormat;
                    // Clear stale data for the OLD format from Redux immediately so wireframe doesn't break
                    if (oldFormat === 'quick_reply') {
                      dispatch(updateNodeData({ id: nodeId, key: 'quick_reply_text', value: '' }));
                      dispatch(updateNodeData({ id: nodeId, key: 'quick_replies_titles', value: [] }));
                    } else if (oldFormat === 'button_template') {
                      dispatch(updateNodeData({ id: nodeId, key: 'button_template_text', value: '' }));
                      dispatch(updateNodeData({ id: nodeId, key: 'button_template_buttons_json', value: '' }));
                    } else if (oldFormat === 'generic_template') {
                      dispatch(updateNodeData({ id: nodeId, key: 'generic_template_elements_json', value: '' }));
                    } else if (oldFormat === 'text') {
                      dispatch(updateNodeData({ id: nodeId, key: 'messages', value: [] }));
                    } else if (oldFormat === 'attachment') {
                      dispatch(updateNodeData({ id: nodeId, key: 'attachments', value: [] }));
                    }
                    // Update dm_format immediately in Redux so wireframe switches instantly
                    dispatch(updateNodeData({ id: nodeId, key: 'dm_format', value: val }));

                    if (val === 'generic_template' && oldFormat !== 'generic_template') {
                      const hasExistingCards = carouselElementsRef.current.length > 0;
                      if (!hasExistingCards) {
                        carouselLoadedFromNodeRef.current = false;
                        lastGeneratedCarouselKeyRef.current = '';
                      }
                    }
                    setDmFormat(val as any);
                  }}
                  options={[
                    {
                      value: 'text',
                      label: 'Text Message',
                      icon: <MessageSquare className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-400 transition-colors" />,
                    },
                    {
                      value: 'quick_reply',
                      label: 'Quick Replies',
                      icon: <PillIcon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />,
                    },
                    {
                      value: 'button_template',
                      label: 'Button Template',
                      icon: <SquareArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-purple-400 transition-colors" />,
                    },
                    {
                      value: 'generic_template',
                      label: 'Generic Template (Carousel)',
                      icon: <GalleryHorizontal className="w-3.5 h-3.5 text-zinc-400 group-hover:text-pink-400 transition-colors" />,
                    },
                    {
                      value: 'attachment',
                      label: 'Media / Attachment',
                      icon: <Paperclip className="w-3.5 h-3.5 text-zinc-400 group-hover:text-orange-400 transition-colors" />,
                    },
                  ]}
                  dropdownId="layout"
                  openDropdownId={openDropdownId}
                  setOpenDropdownId={setOpenDropdownId}
                />

                {/* Detailed Card View Switch */}
                {/* <div >
                  <span className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider  block mb-1.5">Display detailed settings</span>

                  <div className="w-full bg-surface-container-high border border-white/5 hover:border-white/10 rounded-md px-4 py-2 text-xs text-white focus:outline-none cursor-pointer font-medium flex items-center justify-between transition-all text-left">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-sora text-[11px] font-bold text-white .uppercase shrink-0">Detailed Canvas Card</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetailedCardView(!detailedCardView)}
                      className={cn(
                        "w-9 h-5  rounded-full relative transition-all duration-200 shrink-0",
                        detailedCardView ? "bg-white" : "bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "absolute top-[2px] w-4 h-4 rounded-full shadow transition-all duration-200",
                        detailedCardView ? "left-[18px] bg-[#131313]" : "left-[2px] bg-white"
                      )} />
                    </button>
                  </div>
                </div> */}
              </div>

            </div>

            {/* Form Fields: Plain Text format */}
            {format === 'text' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <div>
                      <h3 className="font-sora text-xs font-semibold text-zinc-400 tracking-wider ">This messages will send to the customer ({textMessages.length})</h3>
                      {/* <p className="text-[10px] text-zinc-500 mt-1 font-medium">Add one or more message variations. One will be chosen randomly on trigger.</p> */}
                    </div>
                    <button
                      onClick={() => setTextMessages([...textMessages, ''])}
                      className="py-2 px-4 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Variant
                    </button>
                  </div>

                  <div className="space-y-2">
                    {textMessages.map((msg, idx) => (
                      <div key={idx} className="flex gap-2 bg-[#0e0e0e] border border-[#444748] p-3 rounded-md items-center animate-fadeIn">
                        <span className="text-xs font-bold text-zinc-550 w-5 text-center">{idx + 1}</span>
                        <input
                          type="text"
                          value={msg}
                          onChange={(e) => {
                            const newMsgs = [...textMessages];
                            newMsgs[idx] = e.target.value;
                            setTextMessages(newMsgs);
                          }}
                          placeholder="Ask a question..."
                          maxLength={80}
                          className="flex-1 bg-[#131313] border border-[#444748] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-zinc-300 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setTextMessages(textMessages.filter((_, i) => i !== idx))}
                          className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>





                </div>
              </div>
            )}

            {/* Form Fields: Quick Actions format */}
            {format === 'quick_reply' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider uppercase block">Header Message Prompt</label>
                  <input
                    type="text"
                    value={quickReplyText}
                    onChange={(e) => setQuickReplyText(e.target.value)}
                    placeholder="e.g. What size do you need?"
                    className="w-full bg-[#1c1b1b]/60 border border-white/10 rounded px-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/50 focus:ring-0 font-medium"
                  />
                  <p className="text-[10px] text-zinc-500 font-medium">This text is sent first, right above the interactive quick action pill options.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <div>
                      <h3 className="font-sora text-xs font-semibold text-zinc-400 tracking-wider uppercase">Interactive Pills ({quickRepliesTitles.length}/13)</h3>
                      <p className="text-[10px] text-zinc-500 mt-1 font-medium">Users tap these buttons inside Instagram. Maximum of 13 pills.</p>
                    </div>
                    {quickRepliesTitles.length < 13 && (
                      <button
                        onClick={addQuickReplyPill}
                        className="py-2 px-4 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Pill
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quickRepliesTitles.map((title, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white/5 p-3 rounded-full border border-white/10 animate-fadeIn">
                        <span className="font-sora text-xs font-bold text-zinc-500 w-6 text-center">{idx + 1}</span>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => updateQuickReplyPill(idx, e.target.value)}
                          maxLength={20}
                          placeholder="e.g. Small"
                          className="flex-1 bg-[#1c1b1b]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/50 font-semibold"
                        />
                        <button
                          onClick={() => removeQuickReplyPill(idx)}
                          className="p-2.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Form Fields: Action Buttons format */}
            {format === 'button_template' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider uppercase block">Header Message Text</label>
                  <input
                    type="text"
                    value={buttonTemplateText}
                    onChange={(e) => setButtonTemplateText(e.target.value)}
                    placeholder="e.g. Select options from the menu below:"
                    className="w-full bg-[#1c1b1b]/60 border border-white/10 rounded px-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/50 focus:ring-0 font-medium"
                  />
                  <p className="text-[10px] text-zinc-500 font-medium">Text content that appears as the header message of the button card template.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider block">Card Buttons ({buttonTemplateButtons.length}/3)</label>
                    {buttonTemplateButtons.length < 3 && (
                      <button
                        type="button"
                        onClick={addButton}
                        className="py-1.5 px-3 bg-white/10 hover:bg-white/15 text-white text-[10px] font-bold rounded border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Card Button
                      </button>
                    )}
                  </div>

                  {/* ddddddddddddddddd */}

                  {/* Button Tabs */}
                  {buttonTemplateButtons.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2 border-b border-white/10 pb-3">
                      {buttonTemplateButtons.map((btn, idx) => {
                        const isSelected = idx === normalizedActiveButtonTemplateButtonIndex;
                        return (
                          <div key={idx} className="relative">
                            <button
                              onClick={() => setActiveButtonTemplateButtonIndex(idx)}
                              className={cn(
                                "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border",
                                isSelected
                                  ? "bg-white text-black border-white shadow-lg"
                                  : "bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10 hover:text-white"
                              )}
                            >
                              <span>{idx + 1}{btn.title ? `: ${btn.title.includes('{{name}}') || btn.title.includes('{{price}}') ? 'Product Link' : btn.title}` : ''}</span>
                            </button>
                            {buttonTemplateButtons.length > 1 && (

                              <button
                                onClick={() => removeButton(idx)}
                                className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center text-[10px] border border-[#131313] shadow-md cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}


                  <div className="space-y-4">
                    {buttonTemplateButtons.map((btn, idx) => {
                      if (idx !== normalizedActiveButtonTemplateButtonIndex) return null;
                      return (
                        <div key={idx} className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col gap-4 relative animate-fadeIn">

                          <div className="flex-1 w-full space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider uppercase block mb-1.5">Button Title</label>
                                <input
                                  type="text"
                                  value={btn.title}
                                  onChange={(e) => updateButton(idx, 'title', e.target.value)}
                                  maxLength={20}
                                  placeholder="e.g. Visit Shop"
                                  className="w-full bg-[#1c1b1b]/60 border border-white/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/50"
                                />
                              </div>
                              <div>
                                <CustomSelect
                                  labelClassName='font-sora text-[10px] font-bold text-zinc-400 tracking-wider uppercase block mb-1.5'
                                  label="Button Type"
                                  value={btn.type === 'postback' && btn.payload === 'TRACK_ORDER' ? 'track_order' : btn.type}
                                  onChange={(val) => updateButton(idx, 'type', val)}
                                  options={[
                                    {
                                      value: 'web_url',
                                      label: `Add you're Link`,
                                      icon: <Link2 className="w-3.5 h-3.5" />,
                                    },
                                    {
                                      value: 'postback',
                                      label: 'Continue Chat',
                                      icon: <MessageCircle className="w-3.5 h-3.5" />,
                                    },
                                    {
                                      value: 'product',
                                      label: 'Open Product in Website',
                                      icon: <Package className="w-3.5 h-3.5" />,
                                    },
                                    {
                                      value: 'track_order',
                                      label: 'Track Order (Dynamic)',
                                      icon: <Search className="w-3.5 h-3.5" />,
                                    },
                                  ]}
                                  dropdownId={`btn-type-${idx}`}
                                  openDropdownId={openDropdownId}
                                  setOpenDropdownId={setOpenDropdownId}
                                />
                              </div>
                            </div>

                            {btn.type === 'postback' && btn.payload === 'TRACK_ORDER' && (
                              <div className="bg-[#4f46e5]/10 border border-[#4f46e5]/20 rounded-xl p-3 text-xs text-indigo-300 font-medium">
                                ℹ️ Prompts customers for their Order ID and replies with the current order status.
                              </div>
                            )}

                            {btn.type === 'web_url' && (
                              <div>
                                <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider uppercase block mb-1.5">Web Link URL</label>
                                <div className="flex items-center bg-[#1c1b1b]/60 border border-white/10 rounded px-3 text-xs">
                                  <LinkIcon className="w-4 h-4 text-zinc-500 mr-2.5 shrink-0" />
                                  <input
                                    type="text"
                                    value={btn.url || ''}
                                    onChange={(e) => updateButton(idx, 'url', e.target.value)}
                                    placeholder="https://..."
                                    className="w-full bg-transparent border-none py-3 text-xs text-white focus:outline-none font-medium"
                                  />
                                </div>
                              </div>
                            )}

                            {btn.type === 'product' && (() => {
                              const username = activeAccount?.username || appUser?.username || 'shop';
                              const selectedProduct = btn.url ? products.find(p => {
                                return btn.url!.endsWith(`/product/${p.id}`);
                              }) : null;

                              return (
                                <div className="space-y-2 animate-fadeIn">
                                  {/* <label className="font-sora text-[12px] font-bold text-zinc-400 tracking-wider block mb-1">
                                    Click the button will open the product
                                  </label> */}
                                  {selectedProduct ? (
                                    <div className="relative bg-white/5 border border-white/20 rounded-xl p-3 flex items-center gap-3 animate-fadeIn">
                                      <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                        {(() => {
                                          const mediaUrl = selectedProduct.media_url || selectedProduct.main_media_url || selectedProduct.thumbnail_url || selectedProduct.gallery?.[0]?.thumbnail_url || selectedProduct.gallery?.[0]?.media_url || selectedProduct.image || selectedProduct.thumbnail;
                                          const isVideo =
                                            selectedProduct.gallery?.find((g: any) => g.media_url === mediaUrl)?.media_type === "VIDEO" ||
                                            selectedProduct.gallery?.[0]?.media_type === "VIDEO" ||
                                            (typeof mediaUrl === "string" && (
                                              /\.(mp4|webm|ogg|mov|avi)/i.test(mediaUrl) ||
                                              mediaUrl.includes("video")
                                            ));
                                          const thumbUrl = selectedProduct.gallery?.find((g: any) => g.media_url === mediaUrl)?.thumbnail_url || selectedProduct.gallery?.[0]?.thumbnail_url || selectedProduct.thumbnail_url || selectedProduct.thumbnail;

                                          return mediaUrl ? (
                                            isVideo && !thumbUrl ? (
                                              <video src={mediaUrl} className="w-full h-full object-cover" preload="metadata" muted playsInline />
                                            ) : (
                                              <img src={thumbUrl || mediaUrl} alt="" className="w-full h-full object-cover" />
                                            )
                                          ) : (
                                            <Paperclip className="w-4 h-4 text-zinc-600" />
                                          );
                                        })()}
                                      </div>
                                      <div className="flex-1 min-w-0 pr-8">
                                        <div className="flex justify-between items-start gap-1">
                                          <span className="text-[11px] font-bold text-white truncate">{selectedProduct.title || selectedProduct.name}</span>
                                          <span className="text-[10px] font-black text-white shrink-0">{selectedProduct.price} {selectedProduct.currency}</span>
                                        </div>
                                        <p className="text-[9px] text-zinc-400 line-clamp-1 mt-0.5 leading-snug">
                                          {selectedProduct.description || "No description available."}
                                        </p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => updateButton(idx, 'url', '')}
                                        className="absolute top-1/2 -translate-y-1/2 right-3 p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-all shrink-0"
                                        title="Remove product link"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="max-h-48 overflow-y-auto border border-white/10 rounded-xl bg-black/25 divide-y divide-white/5 p-2 space-y-1">
                                      {products.length === 0 ? (
                                        <div className="text-[10px] text-zinc-500 italic p-3 text-center">
                                          No products found in catalog.
                                        </div>
                                      ) : (
                                        products.map(p => {
                                          const prodUrl = typeof window !== 'undefined'
                                            ? `${window.location.origin}/${username}/product/${p.id}`
                                            : `https://anydm.com/${username}/product/${p.id}`;
                                          const isSelected = btn.url === prodUrl;

                                          const mediaUrl = p.media_url || p.main_media_url || p.thumbnail_url || p.gallery?.[0]?.thumbnail_url || p.gallery?.[0]?.media_url || p.image || p.thumbnail;
                                          const isVideo =
                                            p.gallery?.find((g: any) => g.media_url === mediaUrl)?.media_type === "VIDEO" ||
                                            p.gallery?.[0]?.media_type === "VIDEO" ||
                                            (typeof mediaUrl === "string" && (
                                              /\.(mp4|webm|ogg|mov|avi)/i.test(mediaUrl) ||
                                              mediaUrl.includes("video")
                                            ));
                                          const thumbUrl = p.gallery?.find((g: any) => g.media_url === mediaUrl)?.thumbnail_url || p.gallery?.[0]?.thumbnail_url || p.thumbnail_url || p.thumbnail;

                                          return (
                                            <div
                                              key={p.id}
                                              onClick={() => {
                                                if (isSelected) {
                                                  updateButton(idx, 'url', '');
                                                } else {
                                                  const copy = [...buttonTemplateButtons];
                                                  let newTitle = btn.title || '🛒 Buy';
                                                  if (!newTitle.includes('{{name}}') && !newTitle.includes('{{price}}')) {
                                                    newTitle = `{{name}} {{price}}`;
                                                  } else {
                                                    if (!newTitle.includes('{{name}}')) {
                                                      newTitle = `{{name}} ${newTitle}`;
                                                    }
                                                    if (!newTitle.includes('{{price}}')) {
                                                      newTitle = `${newTitle} {{price}}`;
                                                    }
                                                  }
                                                  if (newTitle.length > 20) {
                                                    newTitle = `{{name}} {{price}}`;
                                                  }
                                                  copy[idx] = {
                                                    ...copy[idx],
                                                    url: prodUrl,
                                                    title: newTitle
                                                  };
                                                  setButtonTemplateButtons(copy);
                                                }
                                              }}
                                              className={cn(
                                                "flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all hover:bg-white/5 border text-left",
                                                isSelected ? "border-white/30 bg-white/10" : "border-transparent"
                                              )}
                                            >
                                              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                                {mediaUrl ? (
                                                  isVideo && !thumbUrl ? (
                                                    <video src={mediaUrl} className="w-full h-full object-cover" preload="metadata" muted playsInline />
                                                  ) : (
                                                    <img src={thumbUrl || mediaUrl} alt="" className="w-full h-full object-cover animate-fadeIn" />
                                                  )
                                                ) : (
                                                  <Paperclip className="w-4 h-4 text-zinc-600" />
                                                )}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-1">
                                                  <span className="text-[11px] font-bold text-zinc-200 truncate">{p.title || p.name}</span>
                                                  <span className="text-[10px] font-black text-white shrink-0">{p.price} {p.currency}</span>
                                                </div>
                                                <p className="text-[9px] text-zinc-500 line-clamp-1 mt-0.5 leading-snug">
                                                  {p.description || "No description available."}
                                                </p>
                                              </div>
                                              <div className={cn(
                                                "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                                                isSelected ? "border-white bg-white text-black" : "border-zinc-700"
                                              )}>
                                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                              </div>
                                            </div>
                                          );
                                        })
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            {btn.type === 'postback' && btn.payload !== 'TRACK_ORDER' && (
                              <div className="bg-white/5 border border-[#8FE3FF]/25 text-[#8FE3FF] rounded p-4 text-xs flex flex-col gap-1.5 animate-fadeIn">
                                <p className="text-[12px] leading-relaxed text-zinc-400">
                                  New flow named  <span className="text-white">{btn.title || 'New Button'}</span> is ready. Configure reply for it .
                                </p>
                              </div>
                            )}

                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Form Fields: Image Slider format */}
            {format === 'generic_template' && (
              <div className="space-y-6">

                {/* Cards Deck Navigation Header */}
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-sora text-xs font-semibold text-zinc-400 tracking-wider uppercase">Carousel Slides ({carouselElements.length}/10)</h3>
                      <p className="text-[10px] text-zinc-500 mt-1 font-medium">Create a slider list of cards. Users swipe through horizontally.</p>
                    </div>
                    {carouselElements.length < 10 && (
                      <button
                        onClick={addCarouselCard}
                        className="py-2 px-4 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Card
                      </button>
                    )}
                  </div>

                  {/* Card Selector Row */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                    {carouselElements.map((elem, idx) => (
                      <div key={idx} className="relative">
                        <button
                          onClick={() => {
                            scrollToCard(idx);
                          }}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border",
                            idx === activeCardIndex
                              ? "bg-white border-white text-black"
                              : "bg-[#1c1b1b]/60 border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white"
                          )}
                        >
                          Card {idx + 1}
                        </button>
                        {carouselElements.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCarouselCard(idx);
                            }}
                            className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center text-[10px] border border-[#131313] shadow-md cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Edit Fields for the Selected Card */}
                {carouselElements[activeCardIndex] && (
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                      <span className="font-sora text-xs font-semibold text-white uppercase tracking-wider">Active Card {activeCardIndex + 1} Settings</span>
                    </div>

                    {/* Default action URL */}
                    <div className="space-y-3">
                      {/* <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider uppercase block">Default Click Action Web URL</label> */}
                      {isEcommerceTemplate && (
                        <div className="space-y-2">
                          {/* Show Products Toggle */}
                          <button
                            type="button"
                            onClick={() => {
                              const nextVal = !showProductPicker[`carousel-product-${activeCardIndex}`];
                              setShowProductPicker(prev => ({ ...prev, [`carousel-product-${activeCardIndex}`]: nextVal }));
                              if (!nextVal) {
                                setCarouselElements(prev => {
                                  const copy = [...prev];
                                  const card = { ...copy[activeCardIndex] };
                                  card.default_action = { type: 'web_url', url: '' };
                                  card.image_url = '';
                                  card.title = '';
                                  card.subtitle = '';
                                  if (card.buttons && card.buttons.length > 0) {
                                    const btns = [...card.buttons];
                                    btns[0] = { ...btns[0], url: '' };
                                    card.buttons = btns;
                                  }
                                  copy[activeCardIndex] = card;
                                  return copy;
                                });
                              }
                            }}
                            className={cn(
                              "flex items-center gap-2 w-full py-2.5 px-4 rounded-xl border transition-all cursor-pointer text-left",
                              showProductPicker[`carousel-product-${activeCardIndex}`]
                                ? "bg-white/10 border-white/20 text-white"
                                : "bg-[#1c1b1b]/40 border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            <ShoppingBag className="w-4 h-4 shrink-0" />
                            <span className="font-sora text-[10px] font-bold uppercase tracking-wider flex-1">Link catalog product</span>
                            <div className={cn(
                              "w-10 h-5 rounded-full relative transition-all duration-200 shrink-0",
                              showProductPicker[`carousel-product-${activeCardIndex}`] ? "bg-white" : "bg-white/10"
                            )}>
                              <div className={cn(
                                "absolute top-[2px] w-4 h-4 rounded-full shadow transition-all duration-200",
                                showProductPicker[`carousel-product-${activeCardIndex}`] ? "left-[22px] bg-[#131313]" : "left-[2px] bg-white"
                              )} />
                            </div>
                          </button>

                          {showProductPicker[`carousel-product-${activeCardIndex}`] && (() => {
                            const defaultActionUrl = carouselElements[activeCardIndex].default_action?.url || '';
                            const selectedProduct = defaultActionUrl ? products.find(p => {
                              return defaultActionUrl.endsWith(`/product/${p.id}`);
                            }) : null;

                            return (
                              <div className="animate-fadeIn">
                                <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider block mb-2">
                                  Select Catalog Product
                                </label>
                                {selectedProduct ? (
                                  <div className="relative bg-white/5 border border-white/20 rounded-xl p-3 flex items-center gap-3 animate-fadeIn">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                      {(() => {
                                        const mediaUrl = selectedProduct.media_url || selectedProduct.main_media_url || selectedProduct.thumbnail_url || selectedProduct.gallery?.[0]?.thumbnail_url || selectedProduct.gallery?.[0]?.media_url || selectedProduct.image || selectedProduct.thumbnail;
                                        const isVideo =
                                          selectedProduct.gallery?.find((g: any) => g.media_url === mediaUrl)?.media_type === "VIDEO" ||
                                          selectedProduct.gallery?.[0]?.media_type === "VIDEO" ||
                                          (typeof mediaUrl === "string" && (
                                            /\.(mp4|webm|ogg|mov|avi)/i.test(mediaUrl) ||
                                            mediaUrl.includes("video")
                                          ));
                                        const thumbUrl = selectedProduct.gallery?.find((g: any) => g.media_url === mediaUrl)?.thumbnail_url || selectedProduct.gallery?.[0]?.thumbnail_url || selectedProduct.thumbnail_url || selectedProduct.thumbnail;

                                        return mediaUrl ? (
                                          isVideo && !thumbUrl ? (
                                            <video src={mediaUrl} className="w-full h-full object-cover" preload="metadata" muted playsInline />
                                          ) : (
                                            <img src={thumbUrl || mediaUrl} alt="" className="w-full h-full object-cover" />
                                          )
                                        ) : (
                                          <Paperclip className="w-4 h-4 text-zinc-600" />
                                        );
                                      })()}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-8 text-left">
                                      <div className="flex justify-between items-start gap-1">
                                        <span className="text-[11px] font-bold text-white truncate">{selectedProduct.title || selectedProduct.name}</span>
                                        <span className="text-[10px] font-black text-white shrink-0">{selectedProduct.price} {selectedProduct.currency}</span>
                                      </div>
                                      <p className="text-[9px] text-zinc-400 line-clamp-1 mt-0.5 leading-snug">
                                        {selectedProduct.description || "No description available."}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCarouselElements(prev => {
                                          const copy = [...prev];
                                          const card = { ...copy[activeCardIndex] };
                                          card.default_action = { type: 'web_url', url: '' };
                                          card.image_url = '';
                                          card.title = 'New Product Item';
                                          card.subtitle = 'Premium catalog description.';
                                          if (card.buttons && card.buttons.length > 0) {
                                            const btns = [...card.buttons];
                                            btns[0] = { ...btns[0], url: '' };
                                            card.buttons = btns;
                                          }
                                          copy[activeCardIndex] = card;
                                          return copy;
                                        });
                                      }}
                                      className="absolute top-1/2 -translate-y-1/2 right-3 p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-all shrink-0"
                                      title="Remove product link"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="max-h-48 overflow-y-auto border border-white/10 rounded-xl bg-black/25 divide-y divide-white/5 p-2 space-y-1">
                                    {products.length === 0 ? (
                                      <div className="text-[10px] text-zinc-500 italic p-3 text-center">
                                        No products found in catalog.
                                      </div>
                                    ) : (
                                      products.map(p => {
                                        const username = activeAccount?.username || appUser?.username || 'shop';
                                        const prodUrl = typeof window !== 'undefined'
                                          ? `${window.location.origin}/${username}/product/${p.id}`
                                          : `https://anydm.com/${username}/product/${p.id}`;
                                        const isSelected = carouselElements[activeCardIndex].default_action?.url === prodUrl;

                                        const mediaUrl = p.media_url || p.main_media_url || p.thumbnail_url || p.gallery?.[0]?.thumbnail_url || p.gallery?.[0]?.media_url || p.image || p.thumbnail;
                                        const isVideo =
                                          p.gallery?.find((g: any) => g.media_url === mediaUrl)?.media_type === "VIDEO" ||
                                          p.gallery?.[0]?.media_type === "VIDEO" ||
                                          (typeof mediaUrl === "string" && (
                                            /\.(mp4|webm|ogg|mov|avi)/i.test(mediaUrl) ||
                                            mediaUrl.includes("video")
                                          ));
                                        const thumbUrl = p.gallery?.find((g: any) => g.media_url === mediaUrl)?.thumbnail_url || p.gallery?.[0]?.thumbnail_url || p.thumbnail_url || p.thumbnail;

                                        return (
                                          <div
                                            key={p.id}
                                            onClick={() => {
                                              if (isSelected) {
                                                updateCarouselField(activeCardIndex, 'default_action', { type: 'web_url', url: '' });
                                              } else {
                                                const cardImage = (isVideo ? (thumbUrl || mediaUrl) : mediaUrl) || '';
                                                setCarouselElements(prev => {
                                                  const copy = [...prev];
                                                  const card = { ...copy[activeCardIndex] };
                                                  card.default_action = { type: 'web_url', url: prodUrl };
                                                  card.image_url = cardImage;
                                                  card.title = '{{name}}';
                                                  card.subtitle = '{{price}}';
                                                  if (card.buttons && card.buttons.length > 0) {
                                                    const btns = [...card.buttons];
                                                    btns[0] = { ...btns[0], url: prodUrl };
                                                    card.buttons = btns;
                                                  }
                                                  copy[activeCardIndex] = card;
                                                  return copy;
                                                });
                                              }
                                            }}
                                            className={cn(
                                              "flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all hover:bg-white/5 border text-left",
                                              isSelected ? "border-white/30 bg-white/10" : "border-transparent"
                                            )}
                                          >
                                            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                              {mediaUrl ? (
                                                isVideo && !thumbUrl ? (
                                                  <video src={mediaUrl} className="w-full h-full object-cover" preload="metadata" muted playsInline />
                                                ) : (
                                                  <img src={thumbUrl || mediaUrl} alt="" className="w-full h-full object-cover animate-fadeIn" />
                                                )
                                              ) : (
                                                <Paperclip className="w-4 h-4 text-zinc-600" />
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex justify-between items-start gap-1">
                                                <span className="text-[11px] font-bold text-zinc-200 truncate">{p.title || p.name}</span>
                                                <span className="text-[10px] font-black text-white shrink-0">{p.price} {p.currency}</span>
                                              </div>
                                              <p className="text-[9px] text-zinc-500 line-clamp-1 mt-0.5 leading-snug">
                                                {p.description || "No description available."}
                                              </p>
                                            </div>
                                            <div className={cn(
                                              "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                                              isSelected ? "border-white bg-white text-black" : "border-zinc-700"
                                            )}>
                                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                    </div>
                    {isEcommerceTemplate && <span className='w-full flex justify-center'>OR</span>}
                    {/* Image URL & Cloudinary Upload */}
                    <div className="grid grid-cols-1 gap-4 .border-t border-white/10 .pt-4">
                      <div className="space-y-2">
                        <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider uppercase block">Image Asset</label>
                        <input
                          type="file"
                          id={`card-upload-${activeCardIndex}`}
                          onChange={(e) => handleFileUpload(e, activeCardIndex)}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById(`card-upload-${activeCardIndex}`)?.click()}
                          className="w-full h-28 border border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 rounded flex flex-col items-center justify-center p-4 text-center transition-all cursor-pointer"
                        >
                          {uploadingMap[activeCardIndex] ? (
                            <div className="space-y-2 w-full px-4">
                              <span className="font-sora text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Uploading to Cloudinary...</span>
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-white transition-all duration-150" style={{ width: `${uploadProgressMap[activeCardIndex] || 0}%` }} />
                              </div>
                              <span className="text-[9px] text-zinc-500">{uploadProgressMap[activeCardIndex] || 0}% complete</span>
                            </div>
                          ) : carouselElements[activeCardIndex].image_url ? (
                            <div className="flex items-center gap-4 w-full text-left">
                              <div className="w-20 h-20 rounded overflow-hidden bg-zinc-900 border border-white/10 shrink-0">
                                <img src={carouselElements[activeCardIndex].image_url} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-[11px] font-bold text-white block">Replace Image</span>
                                <span className="text-[9px] text-zinc-500 block truncate mt-1">{carouselElements[activeCardIndex].image_url}</span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-zinc-400 mb-1.5" />
                              <span className="font-sora text-[10px] font-bold text-white uppercase tracking-wide">Upload Custom Image</span>
                              <span className="text-[9px] text-zinc-500 mt-1">JPG, PNG to Cloudinary preset</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {!showProductPicker[`carousel-product-${activeCardIndex}`] && (
                      <div className="grid grid-cols-1 gap-4 border-t border-white/10 pt-4">
                        <div className="space-y-2.5 animate-fadeIn">
                          <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider  block">Default Click Action Web URL</label>
                          <div className="flex items-center bg-[#1c1b1b]/60 border border-white/10 rounded px-3 text-xs">
                            <LinkIcon className="w-4 h-4 text-zinc-500 mr-2.5 shrink-0" />
                            <input
                              type="text"
                              value={carouselElements[activeCardIndex].default_action?.url || ''}
                              onChange={(e) => updateCarouselField(activeCardIndex, 'default_action', { type: 'web_url', url: e.target.value })}
                              placeholder="https://..."
                              className="w-full bg-transparent border-none py-3 text-xs text-white focus:outline-none"
                            />
                          </div>
                          <p className="text-[10px] text-zinc-500 font-medium">The URL redirected to when the user taps on the card cover image itself.</p>
                        </div>
                      </div>
                    )}

                    {/* Title & Subtitle */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/10 pt-4">
                      <div className="space-y-2">
                        <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider block">Card Title</label>
                        <input
                          type="text"
                          value={carouselElements[activeCardIndex].title || ''}
                          onChange={(e) => updateCarouselField(activeCardIndex, 'title', e.target.value)}
                          maxLength={80}
                          placeholder="e.g. Summer Tote Bag"
                          className="w-full bg-[#1c1b1b]/60 border border-white/10 rounded px-4 py-3 text-xs text-white focus:outline-none focus:border-white/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider  block">Card Subtitle / Description</label>
                        <input
                          type="text"
                          value={carouselElements[activeCardIndex].subtitle || ''}
                          onChange={(e) => updateCarouselField(activeCardIndex, 'subtitle', e.target.value)}
                          maxLength={80}
                          placeholder="e.g. Leather. Available in 3 colors."
                          className="w-full bg-[#1c1b1b]/60 border border-white/10 rounded px-4 py-3 text-xs text-white focus:outline-none focus:border-white/50"
                        />
                      </div>
                    </div>

                    {/* Card Buttons Section */}
                    <div className="border-t border-white/10 pt-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider block">Card Buttons ({(carouselElements[activeCardIndex].buttons || []).length}/3)</label>
                        {(carouselElements[activeCardIndex].buttons || []).length < 3 && (
                          <button
                            type="button"
                            onClick={() => {
                              addCarouselButton(activeCardIndex);
                              setActiveButtonIndex((carouselElements[activeCardIndex].buttons || []).length);
                            }}
                            className="py-1.5 px-3 bg-white/10 hover:bg-white/15 text-white text-[10px] font-bold rounded border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Card Button
                          </button>
                        )}
                      </div>

                      {/* Button Tabs */}
                      {(carouselElements[activeCardIndex].buttons || []).length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2 border-b border-white/10 pb-3">
                          {(carouselElements[activeCardIndex].buttons || []).map((btn, bi) => {
                            const isSelected = bi === normalizedActiveButtonIndex;

                            return (
                              <div key={bi} className="relative">
                                <button
                                  type="button"
                                  onClick={() => setActiveButtonIndex(bi)}
                                  className={cn(
                                    "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border",
                                    isSelected
                                      ? "bg-white text-black border-white shadow-lg"
                                      : "bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10 hover:text-white"
                                  )}
                                >
                                  <span>
                                    {bi + 1}
                                    {btn.title
                                      ? `: ${btn.title.includes("{{name}}") ||
                                        btn.title.includes("{{price}}")
                                        ? "Product Link"
                                        : btn.title
                                      }`
                                      : ""}
                                  </span>
                                </button>

                                {(carouselElements[activeCardIndex].buttons || []).length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeCarouselButton(activeCardIndex, bi)}

                                    className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center text-[10px] border border-[#131313] shadow-md cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="space-y-4">
                        {(carouselElements[activeCardIndex].buttons || []).map((btn, bi) => {
                          if (bi !== normalizedActiveButtonIndex) return null;
                          const isFirstButtonProductLocked = bi === 0 && !!showProductPicker[`carousel-product-${activeCardIndex}`] && !!carouselElements[activeCardIndex].default_action?.url;
                          return (
                            <div key={bi} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col gap-4 relative animate-fadeIn">

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full ">
                                <div>
                                  <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider block mb-1.5">Button Name</label>
                                  <input
                                    type="text"
                                    value={btn.title}
                                    onChange={(e) => updateCarouselButton(activeCardIndex, bi, 'title', e.target.value)}
                                    maxLength={20}
                                    placeholder="e.g. Order Now"
                                    className="w-full bg-[#1c1b1b]/60 border border-white/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <CustomSelect
                                    labelClassName='font-sora text-[10px] font-bold text-zinc-400 tracking-wider  block mb-1.5'
                                    label="Button Type"
                                    value={btn.type === 'postback' && btn.payload === 'TRACK_ORDER' ? 'track_order' : btn.type}
                                    disabled={isFirstButtonProductLocked}
                                    onChange={(val) => updateCarouselButton(activeCardIndex, bi, 'type', val)}
                                    options={[
                                      {
                                        value: 'web_url',
                                        label: `Add you're Link`,
                                        icon: <Link2 className="w-3.5 h-3.5" />,
                                      },
                                      {
                                        value: 'postback',
                                        label: 'Continue Chat',
                                        icon: <MessageCircle className="w-3.5 h-3.5" />,
                                      },
                                      {
                                        value: 'product',
                                        label: 'Open Product in Website',
                                        icon: <Package className="w-3.5 h-3.5" />,
                                      },
                                      {
                                        value: 'track_order',
                                        label: 'Track Order (Dynamic)',
                                        icon: <Search className="w-3.5 h-3.5" />,
                                      },
                                    ]}
                                    dropdownId={`carousel-btn-type-${activeCardIndex}-${bi}`}
                                    openDropdownId={openDropdownId}
                                    setOpenDropdownId={setOpenDropdownId}
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  {btn.type === 'postback' && btn.payload === 'TRACK_ORDER' && (
                                    <div className="bg-[#4f46e5]/10 border border-[#4f46e5]/20 rounded-xl p-3 text-xs text-indigo-300 font-medium">
                                      ℹ️ Prompts customers for their Order ID and replies with the current order status.
                                    </div>
                                  )}
                                  {btn.type === 'web_url' && (
                                    <div>
                                      <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider uppercase block mb-1.5">Web Link URL</label>
                                      <div className="flex items-center bg-[#1c1b1b]/60 border border-white/10 rounded px-3 text-xs">
                                        <LinkIcon className="w-4 h-4 text-zinc-500 mr-2.5 shrink-0" />
                                        <input
                                          type="text"
                                          disabled={isFirstButtonProductLocked}
                                          value={btn.url || ''}
                                          onChange={(e) => updateCarouselButton(activeCardIndex, bi, 'url', e.target.value)}
                                          placeholder="https://..."
                                          className={cn(
                                            "w-full bg-transparent border-none py-3 text-xs text-white focus:outline-none font-medium",
                                            isFirstButtonProductLocked && "opacity-50 cursor-not-allowed text-zinc-500"
                                          )}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {btn.type === 'product' && (() => {
                                    const username = activeAccount?.username || appUser?.username || 'shop';
                                    const selectedProduct = btn.url ? products.find(p => {
                                      return btn.url!.endsWith(`/product/${p.id}`);
                                    }) : null;

                                    return (
                                      <div className="space-y-2 animate-fadeIn text-left">
                                        <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider block mb-1">
                                          Select Catalog Product
                                        </label>
                                        {isFirstButtonProductLocked ? (
                                          <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 text-[11px] text-zinc-500 italic">
                                            🔗 Locked to card product link.
                                          </div>
                                        ) : selectedProduct ? (
                                          <div className="relative bg-white/5 border border-white/20 rounded-xl p-3 flex items-center gap-3 animate-fadeIn">
                                            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                              {(() => {
                                                const mediaUrl = selectedProduct.media_url || selectedProduct.main_media_url || selectedProduct.thumbnail_url || selectedProduct.gallery?.[0]?.thumbnail_url || selectedProduct.gallery?.[0]?.media_url || selectedProduct.image || selectedProduct.thumbnail;
                                                const isVideo =
                                                  selectedProduct.gallery?.find((g: any) => g.media_url === mediaUrl)?.media_type === "VIDEO" ||
                                                  selectedProduct.gallery?.[0]?.media_type === "VIDEO" ||
                                                  (typeof mediaUrl === "string" && (
                                                    /\.(mp4|webm|ogg|mov|avi)/i.test(mediaUrl) ||
                                                    mediaUrl.includes("video")
                                                  ));
                                                const thumbUrl = selectedProduct.gallery?.find((g: any) => g.media_url === mediaUrl)?.thumbnail_url || selectedProduct.gallery?.[0]?.thumbnail_url || selectedProduct.thumbnail_url || selectedProduct.thumbnail;

                                                return mediaUrl ? (
                                                  isVideo && !thumbUrl ? (
                                                    <video src={mediaUrl} className="w-full h-full object-cover" preload="metadata" muted playsInline />
                                                  ) : (
                                                    <img src={thumbUrl || mediaUrl} alt="" className="w-full h-full object-cover" />
                                                  )
                                                ) : (
                                                  <Paperclip className="w-4 h-4 text-zinc-600" />
                                                );
                                              })()}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-8">
                                              <div className="flex justify-between items-start gap-1">
                                                <span className="text-[11px] font-bold text-white truncate">{selectedProduct.title || selectedProduct.name}</span>
                                                <span className="text-[10px] font-black text-white shrink-0">{selectedProduct.price} {selectedProduct.currency}</span>
                                              </div>
                                              <p className="text-[9px] text-zinc-400 line-clamp-1 mt-0.5 leading-snug">
                                                {selectedProduct.description || "No description available."}
                                              </p>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => updateCarouselButton(activeCardIndex, bi, 'url', '')}
                                              className="absolute top-1/2 -translate-y-1/2 right-3 p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-all shrink-0"
                                              title="Remove product link"
                                            >
                                              <X className="w-4 h-4" />
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="max-h-48 overflow-y-auto border border-white/10 rounded-xl bg-black/25 divide-y divide-white/5 p-2 space-y-1">
                                            {products.length === 0 ? (
                                              <div className="text-[10px] text-zinc-500 italic p-3 text-center">
                                                No products found in catalog.
                                              </div>
                                            ) : (
                                              products.map(p => {
                                                const prodUrl = typeof window !== 'undefined'
                                                  ? `${window.location.origin}/${username}/product/${p.id}`
                                                  : `https://anydm.com/${username}/product/${p.id}`;
                                                const isSelected = btn.url === prodUrl;

                                                const mediaUrl = p.media_url || p.main_media_url || p.thumbnail_url || p.gallery?.[0]?.thumbnail_url || p.gallery?.[0]?.media_url || p.image || p.thumbnail;
                                                const isVideo =
                                                  p.gallery?.find((g: any) => g.media_url === mediaUrl)?.media_type === "VIDEO" ||
                                                  p.gallery?.[0]?.media_type === "VIDEO" ||
                                                  (typeof mediaUrl === "string" && (
                                                    /\.(mp4|webm|ogg|mov|avi)/i.test(mediaUrl) ||
                                                    mediaUrl.includes("video")
                                                  ));
                                                const thumbUrl = p.gallery?.find((g: any) => g.media_url === mediaUrl)?.thumbnail_url || p.gallery?.[0]?.thumbnail_url || p.thumbnail_url || p.thumbnail;

                                                return (
                                                  <div
                                                    key={p.id}
                                                    onClick={() => {
                                                      if (isSelected) {
                                                        updateCarouselButton(activeCardIndex, bi, 'url', '');
                                                      } else {
                                                        const copy = [...carouselElements];
                                                        const card = { ...copy[activeCardIndex] };
                                                        const btns = [...(card.buttons || [])];
                                                        let newTitle = btn.title || '🛒 Shop';
                                                        if (!newTitle.includes('{{name}}') && !newTitle.includes('{{price}}')) {
                                                          newTitle = `{{name}} {{price}}`;
                                                        } else {
                                                          if (!newTitle.includes('{{name}}')) {
                                                            newTitle = `{{name}} ${newTitle}`;
                                                          }
                                                          if (!newTitle.includes('{{price}}')) {
                                                            newTitle = `${newTitle} {{price}}`;
                                                          }
                                                        }
                                                        if (newTitle.length > 20) {
                                                          newTitle = `{{name}} {{price}}`;
                                                        }
                                                        btns[bi] = {
                                                          ...btns[bi],
                                                          url: prodUrl,
                                                          title: newTitle
                                                        };
                                                        card.buttons = btns;
                                                        copy[activeCardIndex] = card;
                                                        setCarouselElements(copy);
                                                      }
                                                    }}
                                                    className={cn(
                                                      "flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all hover:bg-white/5 border text-left",
                                                      isSelected ? "border-white/30 bg-white/10" : "border-transparent"
                                                    )}
                                                  >
                                                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                                      {mediaUrl ? (
                                                        isVideo && !thumbUrl ? (
                                                          <video src={mediaUrl} className="w-full h-full object-cover" preload="metadata" muted playsInline />
                                                        ) : (
                                                          <img src={thumbUrl || mediaUrl} alt="" className="w-full h-full object-cover animate-fadeIn" />
                                                        )
                                                      ) : (
                                                        <Paperclip className="w-4 h-4 text-zinc-600" />
                                                      )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                      <div className="flex justify-between items-start gap-1">
                                                        <span className="text-[11px] font-bold text-zinc-200 truncate">{p.title || p.name}</span>
                                                        <span className="text-[10px] font-black text-white shrink-0">{p.price} {p.currency}</span>
                                                      </div>
                                                      <p className="text-[9px] text-zinc-500 line-clamp-1 mt-0.5 leading-snug">
                                                        {p.description || "No description available."}
                                                      </p>
                                                    </div>
                                                    <div className={cn(
                                                      "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                                                      isSelected ? "border-white bg-white text-black" : "border-zinc-700"
                                                    )}>
                                                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                                    </div>
                                                  </div>
                                                );
                                              })
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}

                                  {btn.type === 'postback' && btn.payload !== 'TRACK_ORDER' && (
                                    <div className="bg-white/5 border border-[#8FE3FF]/25 text-[#8FE3FF] rounded p-4 text-xs flex flex-col gap-1.5 animate-fadeIn">
                                      {/* <p className="font-bold flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#8FE3FF] animate-pulse"></span>
                                        Continue Chat
                                      </p> */}
                                      <p className="text-[11px] leading-relaxed text-zinc-400">
                                        Flow <strong className="text-white">"{btn.title || 'New Button'}"</strong> is ready. Configure its reply on the canvas.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form Fields: Attachments format */}
            {format === 'attachment' && (
              <div className="space-y-6">
                {/* Attachment Type Selector Tabs */}
                <div className="space-y-2">
                  <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider  block">Attachment Type</label>
                  <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-950/40 rounded-xl border border-white/5">
                    {[
                      { value: 'image', label: 'Image', icon: ImageIcon },
                      { value: 'video', label: 'Video', icon: Film },
                      { value: 'audio', label: 'Audio', icon: Headphones },
                      // { value: 'file', label: 'File', icon: Paperclip },
                      { value: 'sticker', label: 'Sticker', icon: Heart },
                      { value: 'MEDIA_SHARE', label: 'Media Share', icon: Share2 }
                    ].map(tab => {
                      const IconComponent = tab.icon;
                      const isSelected = selectedAttachmentType === tab.value;
                      return (
                        <button
                          key={tab.value}
                          type="button"
                          onClick={() => setSelectedAttachmentType(tab.value as any)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                            isSelected
                              ? "bg-white text-black shadow-md"
                              : "text-zinc-400 hover:text-white hover:bg-white/5"
                          )}
                        >
                          <IconComponent className={cn("w-3.5 h-3.5", tab.value === 'sticker' ? "text-red-500 fill-red-500" : "")} />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Upload or Input Area based on Type */}
                <div className="space-y-3">
                  {['image', 'video', 'audio', 'file'].includes(selectedAttachmentType) ? (
                    <div className="space-y-3">
                      <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider  block">
                        Upload {selectedAttachmentType.charAt(0).toUpperCase() + selectedAttachmentType.slice(1)} file
                      </label>

                      {/* File Input */}
                      <input
                        type="file"
                        ref={attachmentFileInputRef}
                        onChange={handleAttachmentUpload}
                        multiple
                        accept={
                          selectedAttachmentType === 'image' ? 'image/png, image/jpeg' :
                            selectedAttachmentType === 'video' ? 'video/mp4, video/ogg, video/avi, video/quicktime, video/webm' :
                              selectedAttachmentType === 'audio' ? 'audio/aac, audio/x-m4a, audio/m4a, audio/wav, audio/mp4, video/mp4' :
                                'application/pdf'
                        }
                        className="hidden"
                      />

                      {/* Dropzone Area */}
                      <div
                        onClick={() => attachmentFileInputRef.current?.click()}
                        className="border-2 border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 rounded p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3.5 group animate-fadeIn"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#1c1b1b] flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">Click to upload {selectedAttachmentType} file</p>
                          <p className="text-[10px] text-zinc-500 mt-1">
                            {selectedAttachmentType === 'image' && 'Supported: PNG, JPEG | Max: 8MB'}
                            {selectedAttachmentType === 'video' && 'Supported: MP4, OGG, AVI, MOV, WEBM | Max: 25MB'}
                            {selectedAttachmentType === 'audio' && 'Supported: AAC, M4A, WAV, MP4 | Max: 25MB'}
                            {selectedAttachmentType === 'file' && 'Supported: PDF | Max: 25MB'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : selectedAttachmentType === 'sticker' ? (
                    <div className="bg-white/5 border border-white/10 rounded p-3 flex items-center justify-between gap-2 animate-fadeIn">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">❤️</span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white">Like Heart Sticker</p>
                          <p className="text-[10px] text-zinc-500 truncate">Sends a standard Instagram Like Heart sticker</p>
                        </div>
                      </div>
                      {attachments.some(att => att.type === 'sticker' && att.sticker_id === 'like_heart') ? (
                        <span className="text-[10px] text-zinc-500 font-semibold italic bg-white/5 px-2.5 py-1.5 rounded-lg shrink-0">Added</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setAttachments(prev => [...prev, { type: 'sticker', sticker_id: 'like_heart' }]);
                          }}
                          className="px-3 py-1.5 rounded bg-white text-black font-bold text-xs hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded p-3 flex items-center justify-between gap-2 animate-fadeIn">
                      <div className="flex items-center gap-2 min-w-0">
                        <Share2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white">Share Post or Reel</p>
                          <p className="text-[10px] text-zinc-500 truncate">Select posts/reels from your account</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowMediaPicker(true)}
                        className="px-3 py-1.5 rounded bg-white text-black font-bold text-xs hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Select
                      </button>

                      {showMediaPicker && (
                        <InstagramMediaPicker
                          open={showMediaPicker}
                          onClose={() => setShowMediaPicker(false)}
                          onSelect={(mediaIds, mediaDetails) => {
                            // Cache the details for mobile live preview (without storing in database)
                            const newCache = { ...mediaDetailsCache };
                            if (mediaDetails) {
                              mediaDetails.forEach(detail => {
                                newCache[detail.id] = {
                                  media_url: detail.media_url,
                                  media_type: detail.media_type,
                                  thumbnail_url: detail.thumbnail_url
                                };
                              });
                            }
                            setMediaDetailsCache(newCache);

                            mediaIds.forEach(id => {
                              setAttachments(prev => {
                                if (prev.some(att => att.type === 'MEDIA_SHARE' && att.media_id === id)) {
                                  return prev;
                                }
                                return [...prev, { type: 'MEDIA_SHARE', media_id: id }];
                              });
                            });
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Uploading Files List */}
                {uploadingFiles.length > 0 && (
                  <div className="space-y-3 animate-fadeIn">
                    <h4 className="font-sora text-[10px] font-bold uppercase tracking-wider text-zinc-500">Uploading ({uploadingFiles.length})</h4>
                    <div className="space-y-2.5">
                      {uploadingFiles.map(file => (
                        <div key={file.id} className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-zinc-300 truncate max-w-[200px]">{file.name}</span>
                            <span className="text-white font-bold">{file.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-white transition-all duration-150"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Attachments Grid/List */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <h3 className="font-sora text-xs font-semibold text-white tracking-wider .uppercase">Attachments List ({attachments.length})</h3>
                    {attachments.length > 0 && (
                      <button
                        onClick={() => setAttachments([])}
                        className="text-[11px] font-bold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Clear All
                      </button>
                    )}
                  </div>

                  {attachments.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded p-8 text-center text-xs text-zinc-500 font-medium italic">
                      No attachments added yet. Select a type and add them above.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {attachments.map((att, idx) => {
                        const isImage = att.type === 'image';
                        const isVideo = att.type === 'video';
                        const isAudio = att.type === 'audio';
                        const isSticker = att.type === 'sticker';
                        const isMediaShare = att.type === 'MEDIA_SHARE';

                        const fileName = isSticker
                          ? `Sticker: ${att.sticker_id}`
                          : isMediaShare
                            ? `Media Share ID: ${att.media_id}`
                            : att.url?.split('/').pop() || `File ${idx + 1}`;

                        return (
                          <div key={idx} className="bg-white/5 p-2 rounded-xl border border-white/10 flex items-center gap-2 group relative animate-fadeIn">
                            {/* Visual preview */}
                            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                              {isImage && att.url ? (
                                <img src={att.url} alt="" className="w-full h-full object-cover" />
                              ) : isVideo ? (
                                <Film className="w-5 h-5 text-[#8FE3FF]" />
                              ) : isAudio ? (
                                <Headphones className="w-5 h-5 text-[#CECBF6]" />
                              ) : isSticker ? (
                                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                              ) : (
                                <Share2 className="w-5 h-5 text-emerald-400" />
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0 pr-8">
                              <span className="text-xs font-bold text-zinc-200 block truncate" title={fileName}>
                                {fileName}
                              </span>
                              <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-500 block mt-0.5">
                                {att.type === 'MEDIA_SHARE' ? 'Media Share' : att.type}
                              </span>
                              {att.url && (
                                <a
                                  href={att.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-zinc-400 hover:text-white hover:underline truncate block mt-0.5"
                                >
                                  View original file
                                </a>
                              )}
                            </div>

                            {/* Delete Action */}
                            <button
                              onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>


      </div>
    </div>,
    document.body
  );
}
