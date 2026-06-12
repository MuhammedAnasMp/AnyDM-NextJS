'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { updateNodeData } from '@/store/slices/flowSlice';
import {
  X, Plus, Trash2, Edit2, Upload, Link as LinkIcon,
  Sparkles, Check, ChevronLeft, ChevronRight, MessageSquare, Info,
  Paperclip, ShoppingBag, Mic, Image as ImageIcon, Smile
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/services/api.service';

// --- Fallback Products ---
const DEFAULT_PRODUCTS = [
  {
    id: "p_1",
    title: "HyperBoost Running Core",
    price: 89.00,
    currency: "USD",
    description: "Hyper-responsive cushioning for ultimate running performance.",
    media_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCp-lfo7IxC9Z5DkrJfEBY9prWBgF0Nraoa6TmtKPmY_PB4X6ompLv0r0FyRcyQV3Y7DL7dZ7QfCH8fmEBZ2xH_4791sWQi62XmCov1y89uvfbYEprthQFSJOyMmHylytZK6pPwtpbT24TVRlfH2rtROIriZ-_kdxixpTK1p26z04l3mJnPfn0S8AVS_zwfmqL6EoLMKOwiR-Iakj84qGedem6nbddsPRoii7KttJy0apq3mY4kxyaBO-6gsZMSZNVipVciRTsTuYM"
  },
  {
    id: "p_2",
    title: "Serene Quartz Minimalist",
    price: 145.00,
    currency: "USD",
    description: "Minimalist quartz watch with serene design aesthetics.",
    media_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsesPxVBpHJ7XEF6tg78St4xAph3PREaxRqKWCS12plW7-4Pa_qE92IDDJnvUdDFdjX-omDrM8QXM3mOCiDo_nn_sIJCEfxPOMKFZyVaS_oiYsw6pVh7h128phIqZe4JTWvM8xiC6eImDHQG4s6Pc6YwfCLlEIX4tcrN9OeBbIZM8937DX_TCXc0H1A-9xiXWWU2EMMnl8gwtjzFBCfQWtmzRrKv4BDic0xDUqen_Co_AaQamWvUbQXrzQvajonSpWp2ZEUNWUl88"
  },
  {
    id: "p_3",
    title: "Acoustic Pro Gen-2",
    price: 199.00,
    currency: "USD",
    description: "Next-gen acoustic headphones with passive noise cancelling.",
    media_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVsNaqvbiMCFl-eWS6BqN_WsaGyM8KlXz3TH0Q2VzLPXTCjRViD-j0ELNiAx8UW0rQ2xlo04t7bn2Y0xLqusFrB8h-jWEVyYc4Z4iaQCGvGsDDS7TXQXEIbLm5ofv5LypfpueOP4q6D0XWJzoc2lGtNNhHDaCx2XCQC41ed61mlPN7nLa0D7mqjJptirVd7z6ojMU2ygvTcHAIK9gQpY76riPuXGXTFoqYdZeA0ziKHf266WZY6DfdXUDjTv1-YSr_dFYolRkJ1V8"
  }
];

// --- Types ---
type ButtonItem = {
  type: "web_url" | "postback";
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
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  dropdownId: string;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
}

function CustomSelect({
  label,
  value,
  options,
  onChange,
  dropdownId,
  openDropdownId,
  setOpenDropdownId
}: CustomSelectProps) {
  const isOpen = openDropdownId === dropdownId;
  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="space-y-1.5 relative w-full">
      {label && (
        <label className="text-label-sm text-on-surface-variant uppercase tracking-wider block font-semibold mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdownId(isOpen ? null : dropdownId)}
          className="w-full bg-surface-container-high border border-white/5 hover:border-white/10 rounded-md px-4 py-2.5 text-xs text-white focus:outline-none cursor-pointer font-medium flex items-center justify-between transition-all text-left"
        >
          <span>{selectedOption?.label}</span>
          <ChevronRight className={cn("w-3.5 h-3.5 text-zinc-400 transition-transform duration-200", isOpen ? "rotate-90" : "")} />
        </button>

        {isOpen && (
          <>
            {/* Overlay click catcher */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpenDropdownId(null)}
            />
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
                    value === opt.value ? "text-white bg-white/10" : "text-zinc-400 hover:text-white"
                  )}
                >
                  <span>{opt.label}</span>
                  {value === opt.value && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </>
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

  // Generic Template (Carousel) States
  const [carouselElements, setCarouselElements] = React.useState<GenericElement[]>([]);
  const [activeCardIndex, setActiveCardIndex] = React.useState(0);
  const [isDraggingCarousel, setIsDraggingCarousel] = React.useState(false);
  const dragStartRef = React.useRef<{ x: number; scrollLeft: number; time: number }>({ x: 0, scrollLeft: 0, time: 0 });
  const carouselScrollRef = React.useRef<HTMLDivElement>(null);

  const maxButtonsCount = React.useMemo(() => {
    return Math.max(...carouselElements.map(elem => elem.buttons?.length || 0), 0);
  }, [carouselElements]);

  const handleCarouselScroll = (e: React.UIEvent<HTMLDivElement>) => {
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
    setActiveCardIndex(idx);
    if (carouselScrollRef.current) {
      const cardWidth = 190 + 10; // card width + gap
      carouselScrollRef.current.scrollTo({
        left: idx * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  // Cloudinary/Upload Status States
  const [uploadingMap, setUploadingMap] = React.useState<Record<number, boolean>>({});
  const [uploadProgressMap, setUploadProgressMap] = React.useState<Record<number, number>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Attachments States
  const [attachments, setAttachments] = React.useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = React.useState<{ id: string; name: string; progress: number }[]>([]);
  const attachmentFileInputRef = React.useRef<HTMLInputElement>(null);

  // Products and E-commerce States
  const [products, setProducts] = React.useState<any[]>([]);
  const [showProductPicker, setShowProductPicker] = React.useState<Record<string, boolean>>({});
  const isEcommerceTemplate = React.useMemo(() => {
    return !!(node?.ruleType && node.ruleType.includes('product_inquiry'));
  }, [node]);

  const toggleProductPicker = React.useCallback((key: string) => {
    setShowProductPicker(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const lastGeneratedBtnKeyRef = React.useRef<string>('');
  const lastGeneratedCarouselKeyRef = React.useRef<string>('');

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

  // Hook to auto-generate dynamic generic template (carousel) cards based on selected media count (max 10)
  React.useEffect(() => {
    if (!isEcommerceTemplate || format !== 'generic_template' || products.length === 0) return;

    const mediaKey = [...selectedMediaIds].sort().join(',');
    const currentKey = `${nodeId}:carousel:${mediaKey}`;
    if (lastGeneratedCarouselKeyRef.current === currentKey) return;

    lastGeneratedCarouselKeyRef.current = currentKey;

    const username = activeAccount?.username || appUser?.username || 'shop';

    const isDefaultCarousel = carouselElements.length === 0 ||
      (carouselElements.length === 1 &&
        (carouselElements[0].title === 'Welcome Product' ||
          carouselElements[0].title === 'New Product Item' ||
          carouselElements[0].title === 'Welcome!' ||
          carouselElements[0].title === 'Summer Tote Bag' ||
          carouselElements[0].title === 'Product Item' ||
          carouselElements[0].image_url === 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRN2z0ERwXQUqH29urPuzWueLXKhJAY6SMyAA&s' ||
          carouselElements[0].image_url === '' ||
          carouselElements[0].default_action?.url === 'https://shop.example.com' ||
          carouselElements[0].default_action?.url === 'https://' ||
          carouselElements[0].default_action?.url === '' ||
          (carouselElements[0].default_action?.url || '').includes('shop.example.com') ||
          (carouselElements[0].default_action?.url || '').includes('example.com')));

    if (isDefaultCarousel) {
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

        if (!prod && !mediaId && idx === 0) {
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
          ? `${prod.price} ${prod.currency || 'USD'}`
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

      setCarouselElements(dynamicCards);
    }
  }, [isEcommerceTemplate, format, products, selectedMediaIds, selectedMediaDetails, activeAccount, appUser, carouselElements, nodeId]);

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
        image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRN2z0ERwXQUqH29urPuzWueLXKhJAY6SMyAA&s',
        default_action: { type: 'web_url', url: 'https://shop.example.com' },
        buttons: [{ type: 'web_url', title: '🛒 Buy Now', url: 'https://shop.example.com' }]
      }];
    }
    setCarouselElements(elems);
    setActiveCardIndex(0);

    // Load Attachments data
    setAttachments(node.data?.attachments || []);
  }, [node]);

  if (!node || !mounted) return null;

  // --- Save Handler ---
  const handleSave = () => {
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

    fileList.forEach(file => {
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
            setAttachments(prev => [...prev, secureUrl]);
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
    setButtonTemplateButtons([...buttonTemplateButtons, { type: 'web_url', title: 'New Button', url: 'https://' }]);
  };

  const removeButton = (idx: number) => {
    setButtonTemplateButtons(buttonTemplateButtons.filter((_, i) => i !== idx));
  };

  const updateButton = (idx: number, field: keyof ButtonItem, val: string) => {
    const copy = [...buttonTemplateButtons];
    copy[idx] = { ...copy[idx], [field]: val } as ButtonItem;
    // reset conditional values
    if (field === 'type') {
      if (val === 'web_url') {
        copy[idx].payload = undefined;
        copy[idx].url = 'https://';
      } else {
        copy[idx].url = undefined;
        copy[idx].payload = 'TRIGGER_EVENT';
      }
    }
    setButtonTemplateButtons(copy);
  };

  // Carousel Cards
  const addCarouselCard = () => {
    if (carouselElements.length >= 10) return;
    setCarouselElements([...carouselElements, {
      title: 'New Product Item',
      subtitle: 'Premium catalog description.',
      image_url: '',
      default_action: { type: 'web_url', url: 'https://' },
      buttons: [{ type: 'web_url', title: '🛒 Shop Now', url: 'https://' }]
    }]);
    setActiveCardIndex(carouselElements.length);
  };

  const removeCarouselCard = (idx: number) => {
    if (carouselElements.length <= 1) return;
    setCarouselElements(carouselElements.filter((_, i) => i !== idx));
    setActiveCardIndex(prev => Math.max(0, prev - 1));
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
    btns[btnIdx] = { ...btns[btnIdx], [field]: val } as ButtonItem;
    if (field === 'type') {
      if (val === 'web_url') {
        btns[btnIdx].payload = undefined;
        btns[btnIdx].url = 'https://';
      } else {
        btns[btnIdx].url = undefined;
        btns[btnIdx].payload = 'TRIGGER_EVENT';
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-hidden">
      {/* Ethereal Background Glows */}
      <div className="absolute w-[40vw] h-[40vw] rounded-full bg-[#c4c0ff] top-[-20%] left-[-20%] filter blur-[120px] opacity-[0.1] pointer-events-none z-0" />
      <div className="absolute w-[40vw] h-[40vw] rounded-full bg-[#636565] bottom-[-20%] right-[-20%] filter blur-[120px] opacity-[0.1] pointer-events-none z-0" />

      {/* Outer Card Wrapper */}
      <div className="w-full max-w-6xl h-[88vh] max-h-[880px] bg-[#131313]/90 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden flex flex-col shadow-[0_32px_64px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in duration-300 text-white relative z-10">

        {/* Modal Header with Actions */}
        <div className="px-8 py-3 border-b border-white/10 flex items-center justify-between shrink-0 bg-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-xl border border-white/10">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-sora text-sm font-semibold text-white tracking-tight leading-tight">
                DM Node Configuration
              </h2>
              <span className="text-[10px] text-zinc-400 font-medium tracking-wide opacity-80 block mt-0.5 leading-tight">
                {format === 'attachment'
                  ? 'Upload and manage files, images, or documents for Instagram DM automation'
                  : 'Customize your visual Instagram direct message layout and payloads'}
              </span>
            </div>
          </div>
          {/* Header Action Controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 text-zinc-300 font-medium text-xs hover:bg-white/5 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:opacity-90 transition-all active:scale-95 flex items-center gap-1.5 shadow-lg shadow-white/5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Save Layout
            </button>
          </div>
        </div>

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
                <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-end space-y-4 scrollbar-hide bg-black">

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
                      Hi! I want to buy.
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
                        <div className="bg-[#3797F0] border border-[#3797F0] rounded-2xl rounded-br-none px-3.5 py-2.5 text-[11px] text-white leading-relaxed text-left break-words shadow-md animate-fadeIn">
                          {textMessages[0] || 'Hello!'}
                        </div>
                      )}

                      {/* FORMAT: Quick Replies Prompt text bubble */}
                      {format === 'quick_reply' && (
                        <>
                          <div className="bg-[#3797F0] border border-[#3797F0] rounded-2xl rounded-br-none px-3.5 py-2.5 text-[11px] text-white leading-relaxed text-left break-words shadow-md animate-fadeIn">
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
                        <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl rounded-br-none overflow-hidden w-full shadow-lg flex flex-col shrink-0 animate-fadeIn">
                          <div className="p-3 text-[11px] text-white leading-normal break-words border-b border-white/5 bg-white/5">
                            {buttonTemplateText || 'What would you like to do?'}
                          </div>
                          <div className="flex flex-col divide-y divide-white/5 bg-[#1c1c1c]">
                            {buttonTemplateButtons.map((btn, bi) => (
                              <button
                                key={bi}
                                type="button"
                                className="w-full py-2.5 text-[10px] font-bold text-[#3797F0] hover:bg-white/5 text-center transition-colors cursor-pointer"
                              >
                                {btn.title || 'Button'}
                              </button>
                            ))}
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
                              "w-full flex flex-row gap-2.5 pb-2 select-none",
                              carouselElements.length > 1
                                ? "overflow-x-auto scrollbar-hide -mx-4 px-4 cursor-grab active:cursor-grabbing"
                                : "justify-end",
                              (isDraggingCarousel && carouselElements.length > 1) ? "snap-none" : "snap-x snap-mandatory"
                            )}
                          >
                            {carouselElements.map((elem, ei) => (
                              <div
                                key={ei}
                                className="bg-[#1c1c1c] border border-white/10 rounded-2xl rounded-br-none overflow-hidden w-[190px] shrink-0 snap-start shadow-lg flex flex-col text-left transition-all"
                              >
                                <div className="h-20 w-full bg-zinc-900 border-b border-white/5 relative overflow-hidden flex items-center justify-center shrink-0">
                                  {elem.image_url ? (
                                    <img src={elem.image_url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="text-[9px] font-semibold text-zinc-500 tracking-wide">No image uploaded</div>
                                  )}
                                </div>
                                <div className="p-2.5 flex flex-col bg-[#121212] justify-center min-h-[45px] shrink-0 border-b border-white/5">
                                  <span className="text-[10px] font-bold text-white truncate">{elem.title || 'Welcome!'}</span>
                                  <span className="text-[8px] text-zinc-400 mt-0.5 line-clamp-2 leading-tight">{elem.subtitle || 'Card Description'}</span>
                                </div>
                                {maxButtonsCount > 0 && (
                                  <div className="flex flex-col divide-y divide-white/5 bg-[#1c1c1c] shrink-0">
                                    {(elem.buttons || []).map((btn, bi) => (
                                      <button
                                        key={bi}
                                        type="button"
                                        className="w-full py-1.5 text-[9px] font-bold text-[#3797F0] hover:bg-white/5 text-center transition-colors"
                                      >
                                        {btn.title || 'Button'}
                                      </button>
                                    ))}
                                    {/* Dummy spacer buttons to equalize card height */}
                                    {Array.from({ length: maxButtonsCount - (elem.buttons?.length || 0) }).map((_, di) => (
                                      <div
                                        key={`spacer-${di}`}
                                        className="w-full h-[25px] bg-transparent !border-t-0"
                                      />
                                    ))}
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
                        <div className="flex flex-col gap-2 w-full items-end animate-fadeIn">
                          {attachments.length > 0 ? (
                            attachments.length === 1 ? (
                              <div className="w-[140px] aspect-[4/5] rounded-2xl border border-white/10 overflow-hidden bg-zinc-900 shadow-md">
                                {attachments[0].match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                                  <img src={attachments[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-zinc-950">
                                    <Paperclip className="w-6 h-6 text-white/70 mb-1.5" />
                                    <span className="text-[8px] text-zinc-400 font-semibold truncate w-full px-1">
                                      {attachments[0].split('/').pop() || 'File'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-1.5 max-w-[210px]">
                                {attachments.map((url, index) => {
                                  const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)/i);
                                  return (
                                    <div key={index} className="aspect-square w-[100px] rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden relative group shadow-md">
                                      {isImage ? (
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-zinc-950">
                                          <Paperclip className="w-5 h-5 text-white mb-1" />
                                          <span className="text-[7px] text-zinc-500 font-semibold truncate w-full px-1">
                                            {url.split('/').pop() || 'File'}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )
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
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

            {/* General DM Node Settings */}
            {isEcommerceTemplate && (
              <div className="glass-pane p-6 rounded-2xl border border-white/10 space-y-6 shadow-xl animate-fadeIn">
                <div className="flex items-center gap-2 pb-2 border-b border-white/15">
                  <Sparkles className="w-4 h-4 text-white" />
                  <h3 className="font-sora text-xs font-semibold text-white tracking-[0.1em] uppercase">Core Logic</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* DM Format */}
                  <CustomSelect
                    label="DM Format Layout"
                    value={dmFormat}
                    onChange={(val) => setDmFormat(val as any)}
                    options={[
                      { value: 'text', label: 'Text Message' },
                      { value: 'quick_reply', label: 'Quick Replies' },
                      { value: 'button_template', label: 'Button Template' },
                      { value: 'generic_template', label: 'Generic Template (Carousel)' },
                      { value: 'attachment', label: 'Media / Attachment' }
                    ]}
                    dropdownId="layout"
                    openDropdownId={openDropdownId}
                    setOpenDropdownId={setOpenDropdownId}
                  />

                  {/* Detailed Card View Switch */}
                  <div className="bg-[#1c1b1b]/40 px-4 py-3.5 rounded-xl border border-white/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-sora text-[11px] font-bold text-white uppercase shrink-0">Detailed Canvas Card</span>
                      <span className="text-[10px] text-zinc-500 font-medium truncate">— Display detailed settings on canvas</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetailedCardView(!detailedCardView)}
                      className={cn(
                        "w-11 h-6 rounded-full relative transition-all duration-200 shrink-0",
                        detailedCardView ? "bg-white" : "bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "absolute top-[2px] w-5 h-5 rounded-full shadow transition-all duration-200",
                        detailedCardView ? "left-[18px] bg-[#131313]" : "left-[2px] bg-white"
                      )} />
                    </button>
                  </div>
                </div>

                {/* Rate limits box */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 border-dashed space-y-4">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-zinc-400" />
                    <h4 className="font-sora text-[11px] font-bold text-white uppercase tracking-wider">Rate Limit Intelligence</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Rate Limit Count */}
                    <div className="space-y-1.5">
                      <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider uppercase block">Count</label>
                      <input
                        type="number"
                        value={rateLimitCount}
                        onChange={(e) => setRateLimitCount(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-[#1c1b1b]/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/50 focus:ring-0 font-semibold"
                        placeholder="e.g. 1"
                      />
                    </div>

                    {/* Rate Limit Window */}
                    <div className="space-y-1.5">
                      <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider uppercase block">Window (Seconds)</label>
                      <input
                        type="number"
                        value={rateLimitWindow}
                        onChange={(e) => setRateLimitWindow(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-[#1c1b1b]/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/50 focus:ring-0 font-semibold"
                        placeholder="e.g. 86400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Fields: Plain Text format */}
            {format === 'text' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <div>
                      <h3 className="font-sora text-xs font-semibold text-zinc-400 tracking-wider uppercase">Plain Text Messages ({textMessages.length})</h3>
                      <p className="text-[10px] text-zinc-500 mt-1 font-medium">Add one or more message variations. One will be chosen randomly on trigger.</p>
                    </div>
                    <button
                      onClick={() => setTextMessages([...textMessages, ''])}
                      className="py-2 px-4 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Variant
                    </button>
                  </div>

                  <div className="space-y-4">
                    {textMessages.map((msg, idx) => (
                      <div key={idx} className="flex gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 items-start animate-fadeIn">
                        <span className="font-sora text-xs font-bold text-zinc-500 w-6 text-center pt-3">{idx + 1}</span>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-xl bg-[#1c1b1b]/60 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/50 focus:ring-0 transition-all resize-y font-medium"
                          value={msg}
                          onChange={(e) => {
                            const newMsgs = [...textMessages];
                            newMsgs[idx] = e.target.value;
                            setTextMessages(newMsgs);
                          }}
                          placeholder="Type your message here..."
                        />
                        {textMessages.length > 1 && (
                          <button
                            onClick={() => setTextMessages(textMessages.filter((_, i) => i !== idx))}
                            className="p-2.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer mt-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
                    className="w-full bg-[#1c1b1b]/60 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/50 focus:ring-0 font-medium"
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
                        className="py-2 px-4 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Pill
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quickRepliesTitles.map((title, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 animate-fadeIn">
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
                    className="w-full bg-[#1c1b1b]/60 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/50 focus:ring-0 font-medium"
                  />
                  <p className="text-[10px] text-zinc-500 font-medium">Text content that appears as the header message of the button card template.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <div>
                      <h3 className="font-sora text-xs font-semibold text-zinc-400 tracking-wider uppercase">Buttons List ({buttonTemplateButtons.length}/3)</h3>
                      <p className="text-[10px] text-zinc-500 mt-1 font-medium">Add up to 3 link or postback buttons inside the card.</p>
                    </div>
                    {buttonTemplateButtons.length < 3 && (
                      <button
                        onClick={addButton}
                        className="py-2 px-4 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Button
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {buttonTemplateButtons.map((btn, idx) => (
                      <div key={idx} className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col gap-4 relative animate-fadeIn">
                        <span className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                          {idx + 1}
                        </span>

                        <div className="flex-1 w-full space-y-4 pr-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider uppercase block mb-1.5">Button Title</label>
                              <input
                                type="text"
                                value={btn.title}
                                onChange={(e) => updateButton(idx, 'title', e.target.value)}
                                maxLength={20}
                                placeholder="e.g. Visit Shop"
                                className="w-full bg-[#1c1b1b]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/50"
                              />
                            </div>
                            <div>
                              <CustomSelect
                                label="Button Type"
                                value={btn.type}
                                onChange={(val) => updateButton(idx, 'type', val)}
                                options={[
                                  { value: 'web_url', label: 'Web URL Link' },
                                  { value: 'postback', label: 'Trigger Chat Event' }
                                ]}
                                dropdownId={`btn-type-${idx}`}
                                openDropdownId={openDropdownId}
                                setOpenDropdownId={setOpenDropdownId}
                              />
                            </div>
                          </div>

                          {btn.type === 'web_url' ? (
                            <div className="space-y-4">
                              {isEcommerceTemplate && (
                                <div className="space-y-2">
                                  {/* Show Products Toggle */}
                                  <button
                                    type="button"
                                    onClick={() => toggleProductPicker(`btn-${idx}`)}
                                    className={cn(
                                      "flex items-center gap-2 w-full py-2.5 px-4 rounded-xl border transition-all cursor-pointer text-left",
                                      showProductPicker[`btn-${idx}`]
                                        ? "bg-white/10 border-white/20 text-white"
                                        : "bg-[#1c1b1b]/40 border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white"
                                    )}
                                  >
                                    <ShoppingBag className="w-4 h-4 shrink-0" />
                                    <span className="font-sora text-[10px] font-bold uppercase tracking-wider flex-1">Link catalog product</span>
                                    <div className={cn(
                                      "w-10 h-5 rounded-full relative transition-all duration-200 shrink-0",
                                      showProductPicker[`btn-${idx}`] ? "bg-white" : "bg-white/10"
                                    )}>
                                      <div className={cn(
                                        "absolute top-[2px] w-4 h-4 rounded-full shadow transition-all duration-200",
                                        showProductPicker[`btn-${idx}`] ? "left-[22px] bg-[#131313]" : "left-[2px] bg-white"
                                      )} />
                                    </div>
                                  </button>

                                  {showProductPicker[`btn-${idx}`] && (
                                    <div className="animate-fadeIn">
                                      <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider block mb-2">
                                        Select Catalog Product
                                      </label>
                                      <div className="max-h-48 overflow-y-auto border border-white/10 rounded-xl bg-zinc-950 divide-y divide-white/5 p-2 space-y-1">
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
                                            const isSelected = btn.url === prodUrl;

                                            // Find main media URL (primary image/video thumbnail)
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
                                                    updateButton(idx, 'url', prodUrl);
                                                  }
                                                }}
                                                className={cn(
                                                  "flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all hover:bg-white/5 border text-left",
                                                  isSelected ? "border-white/30 bg-white/10" : "border-transparent"
                                                )}
                                              >
                                                {/* Visual Thumbnail */}
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

                                                {/* Text Details */}
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex justify-between items-start gap-1">
                                                    <span className="text-[11px] font-bold text-zinc-200 truncate">{p.title || p.name}</span>
                                                    <span className="text-[10px] font-black text-white shrink-0">{p.price} {p.currency}</span>
                                                  </div>
                                                  <p className="text-[9px] text-zinc-500 line-clamp-1 mt-0.5 leading-snug">
                                                    {p.description || "No description available."}
                                                  </p>
                                                </div>

                                                {/* Selection Radio */}
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
                                    </div>
                                  )}
                                </div>
                              )}

                              <div>
                                <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider uppercase block mb-1.5">Web Link URL</label>
                                <div className="flex items-center bg-[#1c1b1b]/60 border border-white/10 rounded-xl px-3 text-xs">
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
                            </div>
                          ) : (
                            <div>
                              <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider uppercase block mb-1.5">Event Payload ID (Secret Key)</label>
                              <input
                                type="text"
                                value={btn.payload || ''}
                                onChange={(e) => updateButton(idx, 'payload', e.target.value)}
                                placeholder="e.g. TRIGGER_FLOW"
                                className="w-full bg-[#1c1b1b]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/50"
                              />
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => removeButton(idx)}
                          className="absolute bottom-4 right-4 p-2.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    ))}
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
                        className="py-2 px-4 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
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
                            setActiveCardIndex(idx);
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
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-6 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                      <span className="font-sora text-xs font-semibold text-white uppercase tracking-wider">Active Card {activeCardIndex + 1} Settings</span>
                    </div>

                    {/* Image URL & Cloudinary Upload */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          className="w-full h-28 border border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 rounded-2xl flex flex-col items-center justify-center p-4 text-center transition-all cursor-pointer"
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
                              <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 shrink-0">
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

                      <div className="space-y-2 flex flex-col justify-end">
                        <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider uppercase block">Or Paste Image URL</label>
                        <div className="flex items-center bg-[#1c1b1b]/60 border border-white/10 rounded-xl px-3 text-xs">
                          <LinkIcon className="w-4 h-4 text-zinc-500 mr-2.5 shrink-0" />
                          <input
                            type="text"
                            value={carouselElements[activeCardIndex].image_url || ''}
                            onChange={(e) => updateCarouselField(activeCardIndex, 'image_url', e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-transparent border-none py-3 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/10 pt-4">
                      <div className="space-y-2">
                        <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider uppercase block">Card Title</label>
                        <input
                          type="text"
                          value={carouselElements[activeCardIndex].title || ''}
                          onChange={(e) => updateCarouselField(activeCardIndex, 'title', e.target.value)}
                          maxLength={80}
                          placeholder="e.g. Summer Tote Bag"
                          className="w-full bg-[#1c1b1b]/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider uppercase block">Card Subtitle / Description</label>
                        <input
                          type="text"
                          value={carouselElements[activeCardIndex].subtitle || ''}
                          onChange={(e) => updateCarouselField(activeCardIndex, 'subtitle', e.target.value)}
                          maxLength={80}
                          placeholder="e.g. Leather. Available in 3 colors."
                          className="w-full bg-[#1c1b1b]/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/50"
                        />
                      </div>
                    </div>

                    {/* Default action URL */}
                    <div className="space-y-3 border-t border-white/10 pt-4">
                      <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider uppercase block">Default Click Action Web URL</label>
                      {isEcommerceTemplate && (
                        <div className="space-y-2">
                          {/* Show Products Toggle */}
                          <button
                            type="button"
                            onClick={() => toggleProductPicker('carousel-default')}
                            className={cn(
                              "flex items-center gap-2 w-full py-2.5 px-4 rounded-xl border transition-all cursor-pointer text-left",
                              showProductPicker['carousel-default']
                                ? "bg-white/10 border-white/20 text-white"
                                : "bg-[#1c1b1b]/40 border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            <ShoppingBag className="w-4 h-4 shrink-0" />
                            <span className="font-sora text-[10px] font-bold uppercase tracking-wider flex-1">Link catalog product</span>
                            <div className={cn(
                              "w-10 h-5 rounded-full relative transition-all duration-200 shrink-0",
                              showProductPicker['carousel-default'] ? "bg-white" : "bg-white/10"
                            )}>
                              <div className={cn(
                                "absolute top-[2px] w-4 h-4 rounded-full shadow transition-all duration-200",
                                showProductPicker['carousel-default'] ? "left-[22px] bg-[#131313]" : "left-[2px] bg-white"
                              )} />
                            </div>
                          </button>

                          {showProductPicker['carousel-default'] && (
                            <div className="animate-fadeIn">
                              <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider block mb-2">
                                Select Catalog Product
                              </label>
                              <div className="max-h-48 overflow-y-auto border border-white/10 rounded-xl bg-zinc-950 divide-y divide-white/5 p-2 space-y-1 mb-2">
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

                                    // Find main media URL (primary image/video thumbnail)
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
                                              card.title = p.title || p.name || '';
                                              card.subtitle = p.description || '';
                                              // Set first button URL to product URL
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
                                        {/* Visual Thumbnail */}
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

                                        {/* Text Details */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex justify-between items-start gap-1">
                                            <span className="text-[11px] font-bold text-zinc-200 truncate">{p.title || p.name}</span>
                                            <span className="text-[10px] font-black text-white shrink-0">{p.price} {p.currency}</span>
                                          </div>
                                          <p className="text-[9px] text-zinc-500 line-clamp-1 mt-0.5 leading-snug">
                                            {p.description || "No description available."}
                                          </p>
                                        </div>

                                        {/* Selection Radio */}
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
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center bg-[#1c1b1b]/60 border border-white/10 rounded-xl px-3 text-xs">
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

                    {/* Card Buttons Section */}
                    <div className="border-t border-white/10 pt-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider block">Card Buttons ({(carouselElements[activeCardIndex].buttons || []).length}/3)</label>
                        {(carouselElements[activeCardIndex].buttons || []).length < 3 && (
                          <button
                            onClick={() => addCarouselButton(activeCardIndex)}
                            className="py-1.5 px-3 bg-white/10 hover:bg-white/15 text-white text-[10px] font-bold rounded-xl border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Card Button
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {(carouselElements[activeCardIndex].buttons || []).map((btn, bi) => (
                          <div key={bi} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col gap-4 relative animate-fadeIn">
                            <span className="absolute top-4 right-4 w-5 h-5 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                              {bi + 1}
                            </span>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full pr-8">
                              <div>
                                <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider block mb-1.5">Button Title</label>
                                <input
                                  type="text"
                                  value={btn.title}
                                  onChange={(e) => updateCarouselButton(activeCardIndex, bi, 'title', e.target.value)}
                                  maxLength={20}
                                  placeholder="e.g. Order Now"
                                  className="w-full bg-[#1c1b1b]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <CustomSelect
                                  label="Button Type"
                                  value={btn.type}
                                  onChange={(val) => updateCarouselButton(activeCardIndex, bi, 'type', val)}
                                  options={[
                                    { value: 'web_url', label: 'Web URL Link' },
                                    { value: 'postback', label: 'Trigger Chat Event' }
                                  ]}
                                  dropdownId={`carousel-btn-type-${activeCardIndex}-${bi}`}
                                  openDropdownId={openDropdownId}
                                  setOpenDropdownId={setOpenDropdownId}
                                />
                              </div>

                              <div className="md:col-span-2">
                                {btn.type === 'web_url' ? (
                                  <div className="space-y-4">
                                    {isEcommerceTemplate && (
                                      <div className="space-y-2">
                                        {/* Show Products Toggle */}
                                        <button
                                          type="button"
                                          onClick={() => toggleProductPicker(`carousel-${activeCardIndex}-${bi}`)}
                                          className={cn(
                                            "flex items-center gap-2 w-full py-2.5 px-4 rounded-xl border transition-all cursor-pointer text-left",
                                            showProductPicker[`carousel-${activeCardIndex}-${bi}`]
                                              ? "bg-white/10 border-white/20 text-white"
                                              : "bg-[#1c1b1b]/40 border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white"
                                          )}
                                        >
                                          <ShoppingBag className="w-4 h-4 shrink-0" />
                                          <span className="font-sora text-[10px] font-bold uppercase tracking-wider flex-1">Link catalog product</span>
                                          <div className={cn(
                                            "w-10 h-5 rounded-full relative transition-all duration-200 shrink-0",
                                            showProductPicker[`carousel-${activeCardIndex}-${bi}`] ? "bg-white" : "bg-white/10"
                                          )}>
                                            <div className={cn(
                                              "absolute top-[2px] w-4 h-4 rounded-full shadow transition-all duration-200",
                                              showProductPicker[`carousel-${activeCardIndex}-${bi}`] ? "left-[22px] bg-[#131313]" : "left-[2px] bg-white"
                                            )} />
                                          </div>
                                        </button>

                                        {showProductPicker[`carousel-${activeCardIndex}-${bi}`] && (
                                          <div className="animate-fadeIn">
                                            <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider block mb-2">
                                              Select Catalog Product
                                            </label>
                                            <div className="max-h-48 overflow-y-auto border border-white/10 rounded-xl bg-zinc-950 divide-y divide-white/5 p-2 space-y-1 mb-2">
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
                                                  const isSelected = btn.url === prodUrl;

                                                  // Find main media URL (primary image/video thumbnail)
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
                                                          updateCarouselButton(activeCardIndex, bi, 'url', prodUrl);
                                                        }
                                                      }}
                                                      className={cn(
                                                        "flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all hover:bg-white/5 border text-left",
                                                        isSelected ? "border-white/30 bg-white/10" : "border-transparent"
                                                      )}
                                                    >
                                                      {/* Visual Thumbnail */}
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

                                                      {/* Text Details */}
                                                      <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start gap-1">
                                                          <span className="text-[11px] font-bold text-zinc-200 truncate">{p.title || p.name}</span>
                                                          <span className="text-[10px] font-black text-white shrink-0">{p.price} {p.currency}</span>
                                                        </div>
                                                        <p className="text-[9px] text-zinc-500 line-clamp-1 mt-0.5 leading-snug">
                                                          {p.description || "No description available."}
                                                        </p>
                                                      </div>

                                                      {/* Selection Radio */}
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
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    <input
                                      type="text"
                                      value={btn.url || ''}
                                      onChange={(e) => updateCarouselButton(activeCardIndex, bi, 'url', e.target.value)}
                                      placeholder="https://..."
                                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/50"
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider block mb-1.5">Event Payload ID</label>
                                    <input
                                      type="text"
                                      value={btn.payload || ''}
                                      onChange={(e) => updateCarouselButton(activeCardIndex, bi, 'payload', e.target.value)}
                                      placeholder="e.g. TRIGGER_FLOW"
                                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/50"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => removeCarouselButton(activeCardIndex, bi)}
                              className="absolute bottom-4 right-4 p-2.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form Fields: Attachments format */}
            {format === 'attachment' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="font-sora text-[10px] font-bold text-zinc-400 tracking-wider uppercase block">Upload Attachments</label>
                  <p className="text-[11px] text-zinc-500 font-medium">Upload files, images or video clips to be sent as attachments in the Instagram DM thread.</p>

                  {/* File Input */}
                  <input
                    type="file"
                    ref={attachmentFileInputRef}
                    onChange={handleAttachmentUpload}
                    multiple
                    className="hidden"
                  />

                  {/* Dropzone Area */}
                  <div
                    onClick={() => attachmentFileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 rounded-2xl p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group animate-fadeIn"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#1c1b1b] flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-zinc-400 group-hover:text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Click to upload files</p>
                      <p className="text-[11px] text-zinc-500 mt-1">Images, PDFs, or any documents (auto-uploaded to Cloudinary)</p>
                    </div>
                  </div>
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
                    <h3 className="font-sora text-xs font-semibold text-[#8FE3FF] tracking-wider uppercase">Attachments List ({attachments.length})</h3>
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
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-xs text-zinc-500 font-medium italic">
                      No files uploaded yet. Select files above to start.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {attachments.map((url, idx) => {
                        const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)/i);
                        const fileName = url.split('/').pop() || `File ${idx + 1}`;

                        return (
                          <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-3.5 group relative animate-fadeIn">
                            {/* Visual preview */}
                            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                              {isImage ? (
                                <img src={url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Paperclip className="w-5 h-5 text-zinc-400" />
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0 pr-8">
                              <span className="text-xs font-bold text-zinc-200 block truncate" title={fileName}>
                                {fileName}
                              </span>
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-zinc-500 hover:text-white truncate block mt-0.5"
                              >
                                View original file
                              </a>
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
