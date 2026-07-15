"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import api from "@/lib/services/api.service";
import { authService } from "@/lib/services/auth.service";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Lock, Bot, X, Pencil, Plus } from "lucide-react";
import { span } from "framer-motion/client";
import Toast from "@/components/Toast";
const PlayableVideoAttachment = ({ url }: { url: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="relative group w-full h-full">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:opacity-95 transition-opacity relative"
      >
        <video
          ref={videoRef}
          src={url}
          loop
          muted
          playsInline
          className="w-full h-auto max-h-56 object-cover"
        />
        {!isPlaying && (
          <div
            onClick={handlePlayClick}
            className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/35 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-2xl">play_arrow</span>
            </div>
          </div>
        )}
        {isPlaying && (
          <div
            onClick={handlePlayClick}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm">pause</span>
          </div>
        )}
      </a>
    </div>
  );
};

const RichTemplateInput = ({ value, onChange, placeholder, disabled, maxLength }: any) => {
  const renderStyledText = (val: string) => {
    if (!val) return <span className="text-white/30">{placeholder}</span>;
    const parts = val.split("{{price}}");
    if (parts.length === 1) {
      return <span>{val}</span>;
    }
    const elements: React.ReactNode[] = [];
    parts.forEach((part, index) => {
      elements.push(<span key={`txt-${index}`}>{part}</span>);
      if (index < parts.length - 1) {
        elements.push(
          <span key={`ph-${index}`} className="inline-flex items-center select-none font-bold">
            <span className="text-red-500">{"{{"}</span>
            <span className="text-white font-semibold">price</span>
            <span className="text-red-500">{"}}"}</span>
          </span>
        );
      }
    });
    return elements;
  };

  return (
    <div className="relative w-full min-h-[32px] bg-black/50 border border-white/10 rounded px-2.5 py-1.5 flex items-center overflow-hidden">
      <div className="absolute inset-x-2.5 inset-y-1.5 flex items-center text-xs text-white pointer-events-none whitespace-pre overflow-hidden">
        {renderStyledText(value)}
      </div>
      <input
        type="text"
        value={value}
        disabled={disabled}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-none p-0 text-xs text-transparent caret-white outline-none focus:ring-0 relative z-10 font-medium"
      />
    </div>
  );
};

// Module-level global cache persisting message histories across client page transitions
let globalChatCache: Record<string, { messages: any[], nextCursor: string | null, hasMore: boolean }> = {};
let globalConversationsCache: { conversations: any[], businessInfo: any } | null = null;

export default function InboxPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appUser = useSelector((state: RootState) => state.auth.user);
  const isPremiumActive = appUser?.is_premium_active ?? true;

  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" as "success" | "error" | "info" });
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const instagramAccounts = useSelector((state: RootState) => state.auth.instagramAccounts);
  const activeAccount = instagramAccounts.find(
    (acc: any) => acc.id === appUser?.active_instagram_account_id
  ) || instagramAccounts[0];


  if (!isPremiumActive) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6 relative font-sans .bg-[#131313]">
        {/* Subtle, restricted ambient glows matching premium state allowance */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-md bg-[#1c1b1b] border border-[#2a2a2a] rounded-lg p-6 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            {/* Lock Icon Frame */}
            <div className="w-12 h-12 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white mb-5 shadow-inner">
              <Lock className="w-5 h-5 text-white" strokeWidth={1.75} />
            </div>

            <h2 className="text-lg font-semibold text-white tracking-tight mb-2">
              Access restricted
            </h2>
            <p className="text-xs text-[#c4c7c8] leading-relaxed mb-6">
              Your free trial has expired. Upgrade to Creator Pro to unlock your synchronized product catalog, analytics, and custom storefront templates.
            </p>

            {/* Premium Feature Checklist */}
            <div className="w-full bg-[#131313]/50 rounded border border-[#2a2a2a] p-3.5 mb-6 text-left space-y-2.5">
              <div className="flex items-center gap-2 text-[11px] text-[#c4c7c8]">
                <CheckCircle className="w-3.5 h-3.5 text-white shrink-0" strokeWidth={2} />
                <span>Unlimited automated Instagram imports</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#c4c7c8]">
                <CheckCircle className="w-3.5 h-3.5 text-white shrink-0" strokeWidth={2} />
                <span>Real-time click &amp; conversion analytics</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#c4c7c8]">
                <CheckCircle className="w-3.5 h-3.5 text-white shrink-0" strokeWidth={2} />
                <span>Custom storefront storefront themes</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => router.push("/dashboard/pricing")}
                className="w-full bg-white hover:bg-[#e2e2e2] text-black font-semibold text-xs py-2.5 rounded transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Upgrade to Creator Pro</span>
              </button>
              <button
                onClick={() => router.push("/dashboard/refer")}
                className="w-full bg-transparent hover:bg-white/[0.03] text-white border border-[#444748] font-medium text-xs py-2.5 rounded transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Earn points (refer &amp; earn)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  const recipientIdParam = searchParams.get("recipient_id");
  const usernameParam = searchParams.get("username");
  const nameParam = searchParams.get("name");
  const avatarParam = searchParams.get("avatar");

  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [conversations, setConversations] = useState<any[]>(() => {
    return globalConversationsCache?.conversations || [];
  });
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [loading, setLoading] = useState(() => {
    return !globalConversationsCache;
  });
  const [businessInfo, setBusinessInfo] = useState<{ username: string; id: string } | null>(() => {
    return globalConversationsCache?.businessInfo || null;
  });
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [globalAIOn, setGlobalAIOn] = useState(false);
  const [enableAi, setEnableAi] = useState(true);

  useEffect(() => {
    const fetchGlobalAIStatus = async () => {
      try {
        try {
          const sysRes = await api.get("/accounts/settings/system/");
          if (sysRes.data && sysRes.data.enable_ai !== undefined) {
            setEnableAi(sysRes.data.enable_ai);
          }
        } catch (sysErr) {
          console.error("Error loading global system settings:", sysErr);
        }
        const res = await api.get("/crm/ai-settings/");
        if (res.data) {
          setGlobalAIOn(res.data.is_ai_mode_on);
        }
      } catch (err) {
        console.error("Error loading global AI status:", err);
      }
    };
    fetchGlobalAIStatus();
  }, []);

  // Outbound sending states
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  const [showButtonTemplateForm, setShowButtonTemplateForm] = useState(false);
  const [showGenericTemplateForm, setShowGenericTemplateForm] = useState(false);

  const [products, setProducts] = useState<any[]>([]);

  // Template form values
  const [btnTempText, setBtnTempText] = useState("What would you like to do?");
  const [buttonTemplateButtons, setButtonTemplateButtons] = useState<any[]>([
    { type: 'web_url', title: 'Shop Now', url: 'https://' }
  ]);

  const [carouselElements, setCarouselElements] = useState<any[]>([
    {
      title: 'Product Title',
      subtitle: 'Product Description',
      image_url: '',
      default_action: { type: 'web_url', url: 'https://' },
      buttons: [{ type: 'web_url', title: 'Buy Now', url: 'https://' }]
    }
  ]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [selectedProductsForTemplates, setSelectedProductsForTemplates] = useState<any[]>([]);

  // Preview / Edit toggles
  const [isEditingButtonTemplate, setIsEditingButtonTemplate] = useState(false);
  const [isEditingGenericTemplate, setIsEditingGenericTemplate] = useState(false);
  const [showProductCatalogPopup, setShowProductCatalogPopup] = useState(false);
  const [isWithin24hWindow, setIsWithin24hWindow] = useState<boolean>(true);
  const [focusedField, setFocusedField] = useState<{ cardIdx: number, type: 'title' | 'subtitle' | 'btn' | 'btnTempText' | 'btnTempBtn', btnIdx?: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [showRightPanel, setShowRightPanel] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      setShowRightPanel(false);
    }
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      const params = new URLSearchParams(window.location.search);
      params.set("recipient_id", selectedConversation.recipient_id);
      params.delete("username");
      params.delete("name");
      params.delete("avatar");
      router.replace(`/dashboard/inbox?${params.toString()}`, { scroll: false });
    } else {
      const params = new URLSearchParams(window.location.search);
      if (params.has("recipient_id")) {
        params.delete("recipient_id");
        params.delete("username");
        params.delete("name");
        params.delete("avatar");
        const search = params.toString();
        router.replace(`/dashboard/inbox${search ? `?${search}` : ""}`, { scroll: false });
      }
    }
  }, [selectedConversation, router]);

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  useEffect(() => {
    setSelectedProductsForTemplates([]);
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products/");
        const data = res.data?.results || res.data;
        if (data && Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, [activeAccount?.id]);

  useEffect(() => {
    if (recipientIdParam && conversations.length > 0) {
      const existing = conversations.find((c: any) => c.recipient_id === recipientIdParam);
      if (existing) {
        if (!selectedConversation || selectedConversation.recipient_id !== recipientIdParam) {
          setSelectedConversation(existing);
        }
      } else {
        const decodedAvatar = avatarParam ? decodeURIComponent(avatarParam) : "";
        const tempConv = {
          id: `temp_${recipientIdParam}`,
          name: usernameParam || nameParam || "Instagram User",
          recipient_id: recipientIdParam,
          time: "Now",
          text: "No messages yet",
          avatar: decodedAvatar || `https://ui-avatars.com/api/?name=${usernameParam || 'User'}&background=random&color=fff`,
          badge: 0,
          status: "Active",
          is_within_24h_window: true
        };

        setConversations(prev => {
          if (prev.some((c: any) => c.recipient_id === recipientIdParam)) return prev;
          const updated = [tempConv, ...prev];
          if (globalConversationsCache) {
            globalConversationsCache.conversations = updated;
          }
          return updated;
        });

        if (!selectedConversation || selectedConversation.recipient_id !== recipientIdParam) {
          setSelectedConversation(tempConv);
        }
      }
    }
  }, [recipientIdParam, usernameParam, nameParam, avatarParam, conversations.length]);




  const prevAccountUsernameRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!activeAccount?.username) return;

    if (prevAccountUsernameRef.current && prevAccountUsernameRef.current !== activeAccount?.username) {
      setSelectedConversation(null); // Close the current chat when switching accounts
      globalChatCache = {}; // Reset the messages cache for the new account
      globalConversationsCache = null; // Clear the cache
    }
    prevAccountUsernameRef.current = activeAccount?.username;

    if (globalConversationsCache) {
      setConversations(globalConversationsCache.conversations);
      setBusinessInfo(globalConversationsCache.businessInfo);
      setLoading(false);
    } else {
      fetchConversations();
    }
  }, [activeAccount?.username]);

  // Keep refs of state to prevent WebSocket event handler stale closures
  const selectedConversationRef = useRef(selectedConversation);
  const businessInfoRef = useRef(businessInfo);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    businessInfoRef.current = businessInfo;
  }, [businessInfo]);

  useEffect(() => {
    const token = authService.getAccessToken();
    if (!token || !activeAccount?.id) return;

    let wsUrl = "";
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    let host = rawApiUrl;
    let isSecure = false;

    if (rawApiUrl.startsWith("https://")) {
      host = rawApiUrl.substring(8);
      isSecure = true;
    } else if (rawApiUrl.startsWith("http://")) {
      host = rawApiUrl.substring(7);
    } else if (typeof window !== "undefined") {
      isSecure = window.location.protocol === "https:";
      if (!host) {
        host = window.location.hostname + (window.location.port ? `:${window.location.port}` : "");
      }
    }

    const wsProtocol = isSecure ? "wss://" : "ws://";
    wsUrl = `${wsProtocol}${host}/ws/inbox/?token=${token}&instagram_id=${activeAccount.id}`;

    console.log("[WebSocket] Connecting to", wsUrl);
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("[WebSocket] Connected successfully");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[WebSocket] Received message", data);

        if (data.event_type === "new_message") {
          const { recipient_id, message } = data;

          const currentSelConv = selectedConversationRef.current;
          const currentBusInfo = businessInfoRef.current;

          // Verify if this message belongs to the current active account
          const filterUsername = activeAccount?.username;
          if (filterUsername && message.from?.username && message.to?.username) {
            const hasActiveAccountParticipant =
              message.from.username === filterUsername ||
              message.to.username === filterUsername;
            if (!hasActiveAccountParticipant) {
              console.log("[WebSocket] Ignored message for a different connected account:", message.from.username, "to", message.to.username);
              return;
            }
          }

          // 1. Map backend message format to frontend message format
          const isSelf = message.from?.username === filterUsername || message.from?.id === currentBusInfo?.id;

          const formattedMessage = {
            id: message.id,
            sender: message.from?.username || (isSelf ? "You" : "Instagram User"),
            text: message.message || "",
            time: message.created_time
              ? new Date(message.created_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "",
            isSelf,
            isAi: message.message_source === "AI" || message.from?.username === "AI",
            avatar: isSelf
              ? `https://ui-avatars.com/api/?name=Admin&background=000&color=fff`
              : currentSelConv?.avatar || `https://ui-avatars.com/api/?name=User&background=random&color=fff`,
            created_time: message.created_time,
            attachments: (() => {
              if (!message.attachments) return null;
              // Backend sends an array for template attachments
              if (Array.isArray(message.attachments)) {
                return { data: message.attachments };
              }
              // Inbound messages already have { data: [...] } shape
              return message.attachments;
            })(),
            shares: message.shares,
            story: message.story
          };

          // 2. If this message is for the currently selected conversation, append it in real time
          if (currentSelConv && String(currentSelConv.recipient_id) === String(recipient_id)) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === formattedMessage.id)) return prev;
              return [...prev, formattedMessage];
            });

            // Update cache
            if (globalChatCache[currentSelConv.id]) {
              const cacheMsgs = globalChatCache[currentSelConv.id].messages;
              if (!cacheMsgs.some((m) => m.id === formattedMessage.id)) {
                globalChatCache[currentSelConv.id].messages = [...cacheMsgs, formattedMessage];
              }
            }
          }

          // 3. Update the conversation list
          setConversations((prevConvs) => {
            const index = prevConvs.findIndex((c) => String(c.recipient_id) === String(recipient_id));
            if (index !== -1) {
              const updatedConvs = [...prevConvs];
              const isSelected = currentSelConv && String(currentSelConv.recipient_id) === String(recipient_id);
              const isUnread = !isSelf && !isSelected;

              updatedConvs[index] = {
                ...updatedConvs[index],
                text: formattedMessage.text || "Sent an attachment",
                updated_time: message.created_time,
                time: "Just now",
                badge: isUnread ? (updatedConvs[index].badge || 0) + 1 : 0
              };
              // Re-sort conversations by updated_time descending
              updatedConvs.sort((a, b) => new Date(b.updated_time || 0).getTime() - new Date(a.updated_time || 0).getTime());
              if (globalConversationsCache) {
                globalConversationsCache.conversations = updatedConvs;
              }
              return updatedConvs;
            } else {
              // If conversation doesn't exist in the list, trigger silent fetch
              fetchConversations(true);
              return prevConvs;
            }
          });
        }
      } catch (err) {
        console.error("[WebSocket] Error handling incoming message:", err);
      }
    };

    socket.onerror = (error) => {
      console.error("[WebSocket] Error:", error);
    };

    socket.onclose = (event) => {
      console.log("[WebSocket] Connection closed", event);
    };

    return () => {
      console.log("[WebSocket] Cleaning up connection");
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      socket.close();
    };
  }, [activeAccount?.id]);




  const fetchConversations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get("/crm/conversations/", {
        headers: { "x-bypass-cache": "true" }
      });

      const busUsername = res.data.business_username;
      const busId = res.data.business_id;
      if (busUsername || busId) {
        setBusinessInfo({ username: busUsername || "", id: busId || "" });
      }

      if (res.data.conversations) {
        const mapped = res.data.conversations.map((c: any) => {
          // Find the participant that is NOT the business
          const filterUsername = busUsername || activeAccount?.username;
          const filterId = busId;

          const otherParticipant = c.participants?.data?.find(
            (p: any) => p.username !== filterUsername && p.id !== filterId
          ) || c.participants?.data?.[0];

          const username = otherParticipant?.username || `User_${c.id.substring(c.id.length - 6)}`;

          // Extract the latest message text
          const latestMessage = c.messages?.data?.[0]?.message || "";

          // Format time like Instagram (e.g., "12m", "2h", "3d")
          let timeFormatted = "Recently";
          if (c.updated_time) {
            const diffMs = new Date().getTime() - new Date(c.updated_time).getTime();
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (diffMins < 60) {
              timeFormatted = `${Math.max(1, diffMins)}m`;
            } else if (diffHours < 24) {
              timeFormatted = `${diffHours}h`;
            } else if (diffDays < 7) {
              timeFormatted = `${diffDays}d`;
            } else {
              timeFormatted = new Date(c.updated_time).toLocaleDateString([], { month: "short", day: "numeric" });
            }
          }

          return {
            id: c.id,
            name: username,
            recipient_id: otherParticipant?.id,
            time: timeFormatted,
            text: latestMessage || "No messages yet",
            avatar: c.profile_pic || `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`,
            badge: c.unread_count || 0,
            status: "Active",
            updated_time: c.updated_time,
            is_within_24h_window: c.is_within_24h_window,
            is_ai_enabled: c.is_ai_enabled !== false
          };
        });

        // Sort by updated_time descending (newest messages first)
        mapped.sort((a: any, b: any) => new Date(b.updated_time || 0).getTime() - new Date(a.updated_time || 0).getTime());

        if (selectedConversationIdRef.current?.startsWith("temp_")) {
          const tempConv = selectedConversation;
          const realConv = mapped.find((c: any) => c.recipient_id === tempConv.recipient_id);
          if (realConv) {
            setSelectedConversation(realConv);
          }
        }

        setConversations(mapped);
        globalConversationsCache = {
          conversations: mapped,
          businessInfo: { username: busUsername || "", id: busId || "" }
        };
      } else {
        setConversations([]);
        globalConversationsCache = null;
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setConversations([]);
      globalConversationsCache = null;
    } finally {
      setLoading(false);
    }
  };

  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const activeRequestsRef = useRef<Record<string, boolean>>({});

  const selectedConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Reset conversation-specific input/preview states
    setShowButtonTemplateForm(false);
    setShowGenericTemplateForm(false);
    setShowProductCatalogPopup(false);
    setSelectedProductsForTemplates([]);
    setIsEditingGenericTemplate(false);
    setIsEditingButtonTemplate(false);
    setInputText("");

    if (selectedConversation) {
      selectedConversationIdRef.current = selectedConversation.id;
      setIsWithin24hWindow(selectedConversation.is_within_24h_window !== false);

      // Load from cache instantly if available
      const cached = globalChatCache[selectedConversation.id];
      if (cached) {
        setMessages(cached.messages);
        setNextCursor(cached.nextCursor);
        setHasMore(cached.hasMore);
        setLoadingMessages(false);
      } else {
        setMessages([]);
        setNextCursor(null);
        setHasMore(true);
        fetchMessages(selectedConversation.id);
      }
      fetchEnquiries(selectedConversation.name);
    } else {
      selectedConversationIdRef.current = null;
      setMessages([]);
      setNextCursor(null);
      setHasMore(true);
      setEnquiries([]);
      setLoadingMessages(false);
    }
  }, [selectedConversation]);

  // Scroll to bottom on initial load of a conversation
  useEffect(() => {
    if (messagesContainerRef.current && !loadingMore) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async (conversationId: string, cursor: string | null = null, silent = false) => {
    if (conversationId.startsWith("temp_")) {
      setMessages([]);
      setNextCursor(null);
      setHasMore(false);
      setLoadingMessages(false);
      return;
    }
    const lockKey = `${conversationId}-${cursor || 'initial'}`;
    if (activeRequestsRef.current[lockKey]) {
      return;
    }
    activeRequestsRef.current[lockKey] = true;

    try {
      if (!cursor && !silent) {
        if (!globalChatCache[conversationId]) {
          setLoadingMessages(true);
        }
      }

      const url = cursor
        ? `/crm/conversations/${conversationId}/messages/?after=${cursor}`
        : `/crm/conversations/${conversationId}/messages/`;

      const res = await api.get(url, {
        headers: { "x-bypass-cache": "true" }
      });
      if (res.data.messages) {
        const mapped = res.data.messages.map((m: any) => {
          const isSelf = businessInfo?.username
            ? m.from?.username === businessInfo.username
            : (activeAccount?.username
              ? m.from?.username === activeAccount.username
              : m.from?.username !== selectedConversation?.name);

          return {
            id: m.id,
            sender: m.from?.username || (isSelf ? "You" : "Instagram User"),
            text: m.message || "",
            time: m.created_time
              ? new Date(m.created_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "",
            isSelf,
            isAi: false,
            avatar: isSelf
              ? `https://ui-avatars.com/api/?name=Admin&background=000&color=fff`
              : selectedConversation?.avatar,
            created_time: m.created_time,
            attachments: m.attachments,
            shares: m.shares,
            story: m.story
          };
        });

        // Sort by created_time ascending (oldest first for chat history)
        mapped.sort((a: any, b: any) => new Date(a.created_time || 0).getTime() - new Date(b.created_time || 0).getTime());

        // Always update the cache with the loaded messages
        const existingMessages = cursor && globalChatCache[conversationId] ? globalChatCache[conversationId].messages : [];
        const combined = cursor ? [...mapped, ...existingMessages] : mapped;
        const seen = new Set();
        const unique = combined.filter((msg: any) => {
          const key = msg.id || `${msg.created_time}-${msg.text}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        globalChatCache[conversationId] = {
          messages: unique,
          nextCursor: res.data.next_cursor || null,
          hasMore: !!res.data.next_cursor
        };

        // Only update active UI states if this conversation is still the selected one
        if (selectedConversationIdRef.current === conversationId) {
          if (cursor) {
            setMessages((prev) => {
              const combined = [...mapped, ...prev];
              const seen = new Set();
              return combined.filter((msg) => {
                const key = msg.id || `${msg.created_time}-${msg.text}`;
                if (seen.has(key)) {
                  return false;
                }
                seen.add(key);
                return true;
              });
            });
          } else {
            setMessages(mapped);
          }

          setNextCursor(res.data.next_cursor || null);
          setHasMore(!!res.data.next_cursor);

          // Client-side 24h window check fallback
          const lastMessage = mapped[mapped.length - 1];
          const isLastMessageFromCustomer = lastMessage && !lastMessage.isSelf;
          const hasInboundIn24h = mapped.some((m: any) => {
            if (m.isSelf) return false;
            if (!m.created_time) return false;
            const diffMs = new Date().getTime() - new Date(m.created_time).getTime();
            return diffMs < 24 * 60 * 60 * 1000;
          });

          const isAllowed = res.data.is_within_24h_window !== false || isLastMessageFromCustomer || hasInboundIn24h;
          setIsWithin24hWindow(isAllowed);
        }
      }
    } catch (err: any) {
      console.error("Error fetching messages:", err);
    } finally {
      if (selectedConversationIdRef.current === conversationId) {
        if (!cursor) {
          setLoadingMessages(false);
        }
      }
      delete activeRequestsRef.current[lockKey];
    }
  };

  const fetchEnquiries = async (username: string) => {
    try {
      if (selectedConversation?.name === username) {
        setLoadingEnquiries(true);
      }
      const res = await api.get(`/crm/enquiries/?username=${username}`);
      if (res.data.enquiries) {
        if (selectedConversation?.name === username) {
          setEnquiries(res.data.enquiries);
        }
      } else {
        if (selectedConversation?.name === username) {
          setEnquiries([]);
        }
      }
    } catch (err: any) {
      console.error("Error fetching enquiries:", err);
      if (selectedConversation?.name === username) {
        setEnquiries([]);
      }
    } finally {
      if (selectedConversation?.name === username) {
        setLoadingEnquiries(false);
      }
    }
  };

  const handleDeleteEnquiryProduct = async (enquiryProductId: number) => {
    if (!confirm("Are you sure you want to remove this product from the enquiries list?")) {
      return;
    }
    try {
      await api.delete(`/crm/enquiry-products/${enquiryProductId}/`);
      if (selectedConversation) {
        fetchEnquiries(selectedConversation.name);
      }
    } catch (err) {
      console.error("Error deleting enquiry product:", err);
      alert("Failed to remove product from enquiries.");
    }
  };

  const handleSendMessage = async (messagePayload: any) => {
    if (!selectedConversation) return;

    const tempId = `optimistic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const localMsg = {
      id: tempId,
      sender: "You",
      text: messagePayload.text || "",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSelf: true,
      isAi: false,
      avatar: `https://ui-avatars.com/api/?name=Admin&background=000&color=fff`,
      created_time: new Date().toISOString(),
      attachments: messagePayload.attachment ? { data: [messagePayload.attachment] } : null,
      status: "sending" as "sending" | "sent" | "error"
    };

    setMessages((prev) => [...prev, localMsg]);

    const isTemp = selectedConversation.id.startsWith("temp_");
    const url = isTemp
      ? `/crm/conversations/new/send/`
      : `/crm/conversations/${selectedConversation.id}/send/`;
    const payload = {
      recipient_id: selectedConversation.recipient_id,
      message: messagePayload
    };

    api.post(url, payload)
      .then((res) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { ...m, id: res.data.message_id || m.id, status: "sent" }
              : m
          )
        );
        fetchConversations(true);
      })
      .catch((err) => {
        console.error("Error sending message:", err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { ...m, status: "error" }
              : m
          )
        );
        showToast("Failed to send message.", "error");
      });
  };

  const handleSendTextMessage = async () => {
    if (!inputText.trim() || !selectedConversation) return;
    const textToSend = inputText;
    setInputText("");
    await handleSendMessage({ text: textToSend });
  };

  const handleSendButtonTemplate = async (text: string, buttons: any[]) => {
    const priceVal = selectedProductsForTemplates[0]?.price ? `${selectedProductsForTemplates[0].price} ${selectedProductsForTemplates[0].currency || 'KWD'}` : "";
    const processedText = (text || "").replace("{{price}}", priceVal);
    const processedButtons = (buttons || []).map((btn: any) => ({
      ...btn,
      title: (btn.title || "").replace("{{price}}", priceVal)
    }));

    const messagePayload = {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: processedText,
          buttons: processedButtons
        }
      }
    };
    setShowButtonTemplateForm(false);
    await handleSendMessage(messagePayload);
  };

  const handleSendGenericTemplate = async (elements: any[]) => {
    const processedElements = elements.map(el => {
      const priceVal = el.price ? `${el.price} ${el.currency || 'KWD'}` : "";
      const processedButtons = (el.buttons || []).map((btn: any) => ({
        ...btn,
        title: (btn.title || "").replace("{{price}}", priceVal)
      }));
      return {
        ...el,
        title: (el.title || "").replace("{{price}}", priceVal),
        subtitle: (el.subtitle || "").replace("{{price}}", priceVal),
        buttons: processedButtons
      };
    });
    const messagePayload = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: processedElements
        }
      }
    };
    setShowGenericTemplateForm(false);
    await handleSendMessage(messagePayload);
  };

  const updateTemplatesFromSelection = (selectedProds: any[]) => {
    const username = activeAccount?.username || appUser?.username || 'shop';

    if (selectedProds.length === 0) {
      setBtnTempText("What would you like to do?");
      setButtonTemplateButtons([{ type: 'web_url', title: 'Shop Now', url: 'https://' }]);
      setCarouselElements([{
        title: 'Product Title',
        subtitle: 'Product Description',
        image_url: '',
        price: '',
        default_action: { type: 'web_url', url: 'https://' },
        buttons: [{ type: 'web_url', title: 'Buy Now', url: 'https://' }]
      }]);
      setActiveCardIndex(0);
      return;
    }

    // 1. Update Button Template (Max 3 buttons)
    const btnProds = selectedProds.slice(0, 3);
    const newButtons = btnProds.map(p => {
      const prodUrl = `${window.location.origin}/${username}/product/${p.id}`;
      return {
        type: 'web_url',
        title: `🛒 Buy: ${p.price || ''} ${p.currency || 'KWD'}`.slice(0, 20),
        url: prodUrl
      };
    });
    setBtnTempText(`Check out our product${selectedProds.length > 1 ? 's' : ''}!`);
    setButtonTemplateButtons(newButtons);

    // 2. Update Image Slider / Carousel (Max 10 elements)
    const newElements = selectedProds.map(p => {
      const prodUrl = `${window.location.origin}/${username}/product/${p.id}`;
      const storeUrl = `${window.location.origin}/${username}`;
      return {
        title: (p.title || p.name || 'Product').slice(0, 80),
        subtitle: (p.description || 'Premium quality item.').slice(0, 80),
        image_url: p.media_url || p.main_media_url || '',
        price: p.price || '',
        currency: p.currency || 'KWD',
        default_action: {
          type: 'web_url',
          url: prodUrl
        },
        buttons: [
          {
            type: 'web_url',
            title: `Buy: {{price}}`,
            url: prodUrl
          },
          {
            type: 'web_url',
            title: '🌐 Visit Store',
            url: storeUrl
          }
        ]
      };
    });
    setCarouselElements(newElements);
    setActiveCardIndex(0);
  };

  const handleToggleProductForSend = (ep: any) => {
    const prod = products.find(p => p.id === ep.product_id) || {
      id: ep.product_id,
      title: ep.title,
      price: ep.price,
      currency: ep.currency || 'KWD',
      main_media_url: ep.main_media_url,
      description: ep.description || "Check out this product!"
    };

    setSelectedProductsForTemplates(prev => {
      const isAlreadySelected = prev.some(p => p.id === prod.id);
      let updated;
      if (isAlreadySelected) {
        updated = prev.filter(p => p.id !== prod.id);
      } else {
        if (prev.length >= 10) {
          alert("You can select up to 10 products at a time.");
          return prev;
        }
        updated = [...prev, prod];
      }
      updateTemplatesFromSelection(updated);
      return updated;
    });
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const cloudName = "dx5bqewfx";
      const uploadPreset = "any_dm_product_upload";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (data.secure_url) {
        const newElems = [...carouselElements];
        newElems[activeCardIndex] = { ...newElems[activeCardIndex], image_url: data.secure_url };
        setCarouselElements(newElems);
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (err) {
      console.error("Error uploading image :", err);

      showToast("Failed to upload image .", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSwitchTemplateType = (toGeneric: boolean) => {
    if (toGeneric) {
      setShowGenericTemplateForm(true);
      setShowButtonTemplateForm(false);

      const firstCard = carouselElements[0] || {
        image_url: "",
        title: "",
        subtitle: "",
        price: "",
        buttons: []
      };

      const updatedCard = {
        ...firstCard,
        title: btnTempText || firstCard.title,
        buttons: buttonTemplateButtons.length > 0 ? buttonTemplateButtons : firstCard.buttons
      };

      setCarouselElements(prev => {
        if (prev.length === 0) return [updatedCard];
        const copy = [...prev];
        copy[0] = updatedCard;
        return copy;
      });
    } else {
      setShowGenericTemplateForm(false);
      setShowButtonTemplateForm(true);

      const firstCard = carouselElements[0];
      if (firstCard) {
        setBtnTempText(firstCard.title || "");
        setButtonTemplateButtons(firstCard.buttons || []);
      }
    }
  };

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop === 0 && hasMore && !loadingMore && selectedConversation && nextCursor) {
      try {
        setLoadingMore(true);
        const previousScrollHeight = target.scrollHeight;

        await fetchMessages(selectedConversation.id, nextCursor);

        // Retain scroll position so it doesn't jump to the top
        setTimeout(() => {
          if (target) {
            target.scrollTop = target.scrollHeight - previousScrollHeight;
          }
        }, 50);
      } catch (err) {
        console.error("Error loading more messages:", err);
      } finally {
        setLoadingMore(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-full overflow-hidden bg-[#0d0d0d] font-sans text-white"
    >
      {/* ─── LEFT PANE: Conversation List ─────────────────────────────── */}
      <aside className={`w-full lg:w-[280px] xl:w-[300px] flex flex-col border-r border-white/[0.06] bg-[#111111] shrink-0 ${showChatOnMobile ? "hidden lg:flex" : "flex"}`}>

        {/* Account Header */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">

            <div>
              <h2 className="text-xs font-bold text-white leading-none">
                {businessInfo?.username || activeAccount?.username || "Inbox"}
              </h2>
              {enableAi && (
                <span className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 block ${globalAIOn ? "text-[#b6b2ff]" : "text-white/30"}`}>
                  AI {globalAIOn ? "ON" : "OFF"}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { fetchConversations(); if (selectedConversation) fetchMessages(selectedConversation.id); }}
              disabled={loading}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/[0.07] flex items-center justify-center text-white/50 hover:text-white transition-all active:scale-95 disabled:opacity-40"
            >
              <span className={`material-symbols-outlined text-[15px] ${loading ? "animate-spin" : ""}`}>refresh</span>
            </button>

          </div>
        </div>

        {/* Search */}
        <div className="px-3.5 pb-2.5 shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] focus-within:border-white/20 focus-within:bg-white/[0.06] transition-all">
            <span className="material-symbols-outlined text-[14px] text-white/30">search</span>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-[11px] text-white placeholder-white/25 outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-white/30 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[12px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}


        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-white/25">
              <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
              <span className="text-[10px] font-semibold uppercase tracking-widest">Loading chats</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-white/20">
              <span className="material-symbols-outlined text-4xl">forum</span>
              <span className="text-xs font-medium">No conversations found</span>
            </div>
          ) : (
            filteredConversations.map((item) => {
              const isSelected = selectedConversation?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedConversation(item);
                    setShowChatOnMobile(true);
                    setIsWithin24hWindow(item.is_within_24h_window !== false);
                    setConversations((prev) => prev.map((c) => c.id === item.id ? { ...c, badge: 0 } : c));
                  }}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg cursor-pointer transition-all duration-150 group select-none",
                    isSelected ? "bg-white/[0.09] border border-white/10" : "hover:bg-white/[0.04] border border-transparent"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img src={item.avatar} alt={item.name} className="w-9 h-9 rounded-full object-cover border border-white/10" />
                    <span className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#111]",
                      item.is_within_24h_window !== false ? "bg-emerald-500" : "bg-red-500"
                    )} />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={cn("text-[12px] truncate", item.badge > 0 ? "font-bold text-white" : "font-medium text-white/70")}>{item.name}</span>
                      </div>


                      <span className="flex gap-1">
                        <span className={cn("text-[9px] shrink-0 ml-2 p-1p", item.badge > 0 ? "font-bold text-[#b6b2ff]" : "text-white/30")}>{item.time}</span>
                        {enableAi && globalAIOn && item.is_ai_enabled !== false && (
                          <CheckCircle className="w-3.5 h-3.5 text-white shrink-0" strokeWidth={2} />
                        )}
                      </span>

                    </div>
                    <p className={cn("text-[10px] truncate", item.badge > 0 ? "font-bold text-white/90" : "font-normal text-white/40")}>{item.text}</p>
                  </div>
                  {item.badge > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#b6b2ff] shadow-[0_0_8px_rgba(182,178,255,0.6)] shrink-0" />

                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ─── CENTER PANE: Chat View ────────────────────────────────────── */}
      <section className={`flex-1 flex flex-col min-w-0 bg-[#0d0d0d] ${showChatOnMobile ? "flex" : "hidden lg:flex"}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-[#11]/80 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-2.5">
                <button onClick={() => setShowChatOnMobile(false)} className="lg:hidden w-7 h-7 rounded-lg bg-white/5 border border-white/[0.07] flex items-center justify-center text-white/60 hover:text-white transition-all">
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                </button>
                <div className="relative">
                  <img src={selectedConversation.avatar} alt={selectedConversation.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                  <span className={cn("absolute -bottom-0.5 -right-0.5 w-2 w-2 rounded-full border-2 border-[#111]", isWithin24hWindow ? "bg-emerald-500" : "bg-red-500")} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white leading-tight">{selectedConversation.name}</h3>
                  <span className="text-[9px] text-white/35">{isWithin24hWindow ? "Within 24h window · Can message" : "24h window closed"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {enableAi && globalAIOn && (
                  <label className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#b6b2ff]/10 border border-[#b6b2ff]/20 cursor-pointer select-none">
                    {/* <span className="material-symbols-outlined text-[14px] text-[#b6b2ff]">psychology</span> */}
                    <span className="text-[9px] font-bold text-[#b6b2ff] tracking-wider">AI reply for {selectedConversation.name} </span>
                    <input
                      type="checkbox"
                      checked={selectedConversation.is_ai_enabled !== false}
                      onChange={async (e) => {
                        const v = e.target.checked;
                        setSelectedConversation((p: any) => p ? { ...p, is_ai_enabled: v } : null);
                        setConversations((p: any[]) => {
                          const updated = p.map(c => c.id === selectedConversation.id ? { ...c, is_ai_enabled: v } : c);
                          if (globalConversationsCache) {
                            globalConversationsCache.conversations = updated;
                          }
                          return updated;
                        });
                        try { await api.post(`/crm/customers/${selectedConversation.recipient_id}/toggle-ai/`, { is_ai_enabled: v }); } catch { }
                      }}
                      className="w-6 h-3 rounded-full accent-[#b6b2ff] cursor-pointer"
                    />
                  </label>
                )}
                <button
                  onClick={() => fetchMessages(selectedConversation.id)}
                  disabled={loadingMessages}
                  className="w-7 h-7 rounded-lg bg-white/5 border border-white/[0.07] flex items-center justify-center text-white/50 hover:text-white transition-all active:scale-95 disabled:opacity-40"
                >
                  <span className={`material-symbols-outlined text-[15px] ${loadingMessages ? "animate-spin" : ""}`}>refresh</span>
                </button>
                <button
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  className={cn(
                    "w-7 h-7 rounded-lg border flex items-center justify-center transition-all",
                    showRightPanel ? "bg-[#b6b2ff]/10 border-[#b6b2ff]/20 text-[#b6b2ff]" : "bg-white/5 border-white/[0.07] text-white/50 hover:text-white"
                  )}
                >
                  <span className="material-symbols-outlined text-[15px]">dock_to_right</span>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full"
            >
              {loadingMore && (
                <div className="flex items-center justify-center gap-2 py-2 text-white/25">
                  <div className="w-3 h-3 rounded-full border border-white/20 border-t-white animate-spin" />
                  <span className="text-[10px] uppercase tracking-widest font-semibold">Loading history</span>
                </div>
              )}

              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center gap-3 h-full text-white/25">
                  <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                  <span className="text-[10px] uppercase tracking-widest font-semibold">Loading messages</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 h-full text-white/20">
                  <span className="material-symbols-outlined text-5xl">chat_bubble_outline</span>
                  <span className="text-xs font-medium">No messages yet</span>
                </div>
              ) : (
                (() => {
                  const seen = new Set();
                  return messages.filter((msg, mIdx) => {
                    const key = msg.id && !msg.id.startsWith("optimistic_")
                      ? msg.id
                      : `opt-${msg.created_time || ''}-${msg.text || ''}-${mIdx}`;
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                  });
                })().map((msg, idx) => (
                  <div key={msg.id || idx} className={`flex gap-2.5 max-w-[75%] ${msg.isSelf ? "ml-auto flex-row-reverse" : ""}`}>
                    {!msg.isSelf && (
                      <img src={msg.avatar || selectedConversation.avatar} alt={msg.sender} className="w-7 h-7 rounded-full object-cover border border-white/10 shrink-0 self-end" />
                    )}
                    <div className={`flex flex-col gap-1 ${msg.isSelf ? "items-end" : "items-start"}`}>
                      {msg.isAi && (
                        <div className="flex items-center gap-1 text-[#b6b2ff] mb-0.5">
                          <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                          <span className="text-[8px] font-bold uppercase tracking-widest">AnyDM AI</span>
                        </div>
                      )}
                      {(() => {
                        const hasTemplateAttachment = msg.attachments?.data?.some(
                          (att: any) =>
                            att.generic_template ||
                            att.button_template ||
                            att.type === "template"
                        );
                        return (msg.text && !hasTemplateAttachment) || (!msg.attachments?.data && !msg.shares?.data && !msg.story) ? (
                          <div className={cn(
                            "px-3 py-2 rounded-xl text-[12px] leading-relaxed break-words max-w-full",
                            msg.isSelf
                              ? "bg-white text-black rounded-br-md font-medium"
                              : "bg-white/[0.07] border border-white/[0.08] text-white/90 rounded-bl-md"
                          )}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        ) : null;
                      })()}

                      {msg.attachments?.data && msg.attachments.data.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto py-1 max-w-full snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
                          {msg.attachments.data.map((att: any, aIdx: number) => {
                            // 1. Handle optimistic/local button & generic templates
                            if (att.type === "template" && att.payload) {
                              if (att.payload.template_type === "generic" && att.payload.elements) {
                                return att.payload.elements.map((el: any, elIdx: number) => {
                                  const imageUrl = el.image_url || el.media_url;
                                  return (
                                    <div
                                      key={`${aIdx}-${elIdx}`}
                                      className="w-40 shrink-0 rounded-2xl overflow-hidden border border-[#2b2b2b] bg-[#1a1a1a] snap-start"
                                    >
                                      {imageUrl && (
                                        <img src={imageUrl} className="w-full h-24 object-cover" alt="" />
                                      )}
                                      <div className="p-2.5">
                                        <p className="text-[13px] font-semibold text-white leading-4">
                                          {el.title}
                                        </p>
                                        {el.subtitle && (
                                          <p className="mt-1 text-[11px] text-[#A8A8A8] leading-4">
                                            {el.subtitle}
                                          </p>
                                        )}
                                      </div>
                                      {el.buttons?.length > 0 && (
                                        <div className="border-t border-[#2b2b2b] divide-y divide-[#2b2b2b]">
                                          {el.buttons.map((btn: any, bIdx: number) => (
                                            <a
                                              key={bIdx}
                                              href={btn.url || "#"}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="block py-2 text-center text-[12px] font-semibold text-[#3797F0] hover:bg-[#262626] transition-colors"
                                            >
                                              {btn.title}
                                            </a>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                });
                              }

                              if (att.payload.template_type === "button") {
                                return (
                                  <div
                                    key={aIdx}
                                    className="w-44 shrink-0 rounded-2xl overflow-hidden border border-[#2b2b2b] bg-[#1a1a1a] snap-start flex flex-col justify-between"
                                  >
                                    <div className="p-3">
                                      <p className="text-[13px] font-semibold text-white leading-5">
                                        {att.payload.text}
                                      </p>
                                    </div>
                                    {att.payload.buttons?.length > 0 && (
                                      <div className="border-t border-[#2b2b2b] divide-y divide-[#2b2b2b]">
                                        {att.payload.buttons.map((btn: any, bIdx: number) => (
                                          <a
                                            key={bIdx}
                                            href={btn.url || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block py-2 text-center text-[12px] font-semibold text-[#3797F0] hover:bg-[#262626] transition-colors"
                                          >
                                            {btn.title}
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                            }

                            // 2. Handle backend button template
                            if (att.button_template) {
                              return (
                                <div
                                  key={aIdx}
                                  className="w-44 shrink-0 rounded-2xl overflow-hidden border border-[#2b2b2b] bg-[#1a1a1a] snap-start flex flex-col justify-between"
                                >
                                  <div className="p-3">
                                    <p className="text-[13px] font-semibold text-white leading-5">
                                      {att.button_template.text}
                                    </p>
                                  </div>
                                  {att.button_template.buttons?.length > 0 && (
                                    <div className="border-t border-[#2b2b2b] divide-y divide-[#2b2b2b]">
                                      {att.button_template.buttons.map((btn: any, bIdx: number) => (
                                        <a
                                          key={bIdx}
                                          href={btn.url || "#"}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block py-2 text-center text-[12px] font-semibold text-[#3797F0] hover:bg-[#262626] transition-colors"
                                        >
                                          {btn.title}
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            if (att.generic_template) {
                              const imageUrl =
                                att.generic_template.media_url ||
                                att.generic_template.image_url;

                              return (
                                <div
                                  key={aIdx}
                                  className="w-40 shrink-0 rounded-2xl overflow-hidden border border-[#2b2b2b] bg-[#1a1a1a] snap-start"
                                >
                                  {imageUrl && (
                                    <img
                                      src={imageUrl}
                                      alt=""
                                      className="w-full h-24 object-cover"
                                    />
                                  )}

                                  <div className="p-2.5">
                                    <p className="text-[13px] font-semibold text-white leading-4">
                                      {att.generic_template.title}
                                    </p>

                                    {att.generic_template.subtitle && (
                                      <p className="mt-1 text-[11px] text-[#A8A8A8] leading-4">
                                        {att.generic_template.subtitle}
                                      </p>
                                    )}
                                  </div>

                                  {att.generic_template.cta?.length > 0 && (
                                    <div className="border-t border-[#2b2b2b] divide-y divide-[#2b2b2b]">
                                      {att.generic_template.cta.map(
                                        (cta: any, cIdx: number) => (
                                          <a
                                            key={cIdx}
                                            href={cta.url || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block py-2 text-center text-[12px] font-semibold text-[#3797F0] hover:bg-[#262626] transition-colors"
                                          >
                                            {cta.title}
                                          </a>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            if (att.image_data)
                              return (
                                <a
                                  key={aIdx}
                                  href={att.image_data.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block w-40 shrink-0 rounded-2xl overflow-hidden border border-[#2b2b2b] bg-[#1a1a1a] snap-start"
                                >
                                  <img
                                    src={att.image_data.preview_url || att.image_data.url}
                                    alt=""
                                    className="w-full h-auto max-h-48 object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </a>
                              );

                            if (att.video_data)
                              return (
                                <div
                                  key={aIdx}
                                  className="w-40 shrink-0 rounded-2xl overflow-hidden border border-[#2b2b2b] bg-[#1a1a1a] snap-start"
                                >
                                  <PlayableVideoAttachment url={att.video_data.url} />
                                </div>
                              );

                            if (att.audio_data)
                              return (
                                <div
                                  key={aIdx}
                                  className="w-40 shrink-0 flex items-center gap-2 rounded-2xl border border-[#2b2b2b] bg-[#1a1a1a] px-3 py-2 snap-start"
                                >
                                  <span className="material-symbols-outlined text-[#A8A8A8] text-lg">
                                    mic
                                  </span>

                                  <audio
                                    src={att.audio_data.url}
                                    controls
                                    className="w-full"
                                  />
                                </div>
                              );

                            return null;
                          })}
                        </div>
                      )}

                      {/* Shares */}
                      {msg.shares?.data?.map((sh: any, sIdx: number) => sh.link && (
                        <div key={sIdx} className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-2xl px-3 py-2.5 mt-1 max-w-[260px] w-full">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[#8fe3ff] text-base">play_circle</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate">Shared a Reel / Post</p>
                            <a href={sh.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#8fe3ff] hover:underline truncate block">View on Instagram</a>
                          </div>
                        </div>
                      ))}

                      {/* Story */}
                      {msg.story && (
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 mt-1 max-w-[180px]">
                          <div className="flex items-center gap-1.5 text-white/30 text-[9px] uppercase font-bold tracking-widest mb-2">
                            <span className="material-symbols-outlined text-xs">history_toggle_off</span>
                            <span>Story Mention</span>
                          </div>
                          {msg.story.url && <img src={msg.story.url} className="w-full h-28 object-cover rounded-xl border border-white/5" alt="" />}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 px-1 mt-0.5">
                        <span className="text-[9px] text-white/20">{msg.time}</span>
                        {msg.status === "sending" && (
                          <div className="w-2 h-2 rounded-full border border-white/20 border-t-white/60 animate-spin shrink-0" />
                        )}
                        {msg.status === "error" && (
                          <span className="text-[8px] text-red-400 font-bold uppercase tracking-wider">Failed</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>



            {/* Template Forms */}
            {(showButtonTemplateForm || showGenericTemplateForm) && (
              <div className="relative border-t border-white/[0.06] bg-[#121212] p-4 space-y-3 shrink-0 animate-in slide-in-from-bottom duration-200">
                <div className="flex justify-between items-center">
                  <div className="flex gap-1.5">
                    {[["Image Slider", true, showGenericTemplateForm], ["Action Buttons", false, showButtonTemplateForm]].map(([label, isGeneric, isActive]: any) => (
                      <button key={label} onClick={() => handleSwitchTemplateType(isGeneric)}
                        className={cn("px-3 py-1 rounded-lg text-[10px] font-semibold transition-all", isActive ? "bg-white/10 text-white border border-white/15" : "text-white/35 hover:text-white/60 border border-transparent")}
                      >{label}</button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowProductCatalogPopup(true)}
                      className="flex items-center gap-0.5 px-2 rounded-md bg-white/5 border border-white/10 text-[9px] font-bold text-[#b6b2ff] hover:bg-white/10 hover:text-white transition-all cursor-pointer h-6"
                    >
                      {/* <span className="material-symbols-outlined text-[10px]">add</span> */}
                      Edit Items
                    </button>
                    <button onClick={() => { setShowButtonTemplateForm(false); setShowGenericTemplateForm(false); setSelectedProductsForTemplates([]); }} className="w-6 h-6 rounded-md bg-white/5 text-white/40 hover:text-white flex items-center justify-center transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                </div>

                {showGenericTemplateForm && (
                  <div className="flex flex-col items-center py-2 space-y-3 w-full">
                    <div className="flex items-start gap-2 overflow-x-auto py-2 px-1 max-w-full w-full justify-start md:justify-center snap-x snap-mandatory [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {carouselElements.map((elem, idx) => (
                        <div
                          key={idx}
                          className="
                                  w-48
                                  shrink-0
                                  bg-[#1a1a1a]
                                  border
                                  border-[#2b2b2b]
                                  rounded-2xl
                                  overflow-hidden
                                  snap-start
                                  relative
                                  flex
                                  flex-col
                                  justify-between
                                  select-none
                                "
                        >
                          {/* Remove Card Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const newElements = carouselElements.filter((_, i) => i !== idx);
                              setCarouselElements(newElements);
                              if (newElements.length === 0) {
                                setShowGenericTemplateForm(false);
                                setSelectedProductsForTemplates([]);
                              }
                            }}
                            className="absolute top-1.5 right-1.5 z-20 w-5 h-5 rounded-full bg-black/60 hover:bg-black/85 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
                            title="Remove Card"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>

                          {/* Image */}
                          <label className="block w-full h-24 overflow-hidden cursor-pointer relative shrink-0">
                            {elem.image_url ? (
                              <img
                                src={elem.image_url}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            ) : (
                              <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white/20 text-xl">
                                  image
                                </span>
                              </div>
                            )}

                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-[9px] font-semibold text-white bg-black/60 px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[10px]">
                                  edit
                                </span>
                                Change
                              </span>
                            </div>

                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                setActiveCardIndex(idx);
                                handleImageUpload(e);
                              }}
                              className="hidden"
                              disabled={uploadingImage}
                            />
                          </label>


                          {/* Content */}
                          <div className="px-2.5 py-2.5 space-y-1 flex-1 min-w-0 relative">

                            {/* Title */}
                            <div className="min-h-[18px]">
                              {focusedField?.cardIdx === idx &&
                                focusedField?.type === "title" ? (
                                <div className="flex flex-col">
                                  <input
                                    autoFocus
                                    type="text"
                                    value={elem.title}
                                    maxLength={80}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={(e) => {
                                      const n = [...carouselElements];
                                      n[idx] = {
                                        ...n[idx],
                                        title: e.target.value.slice(0, 80),
                                      };
                                      setCarouselElements(n);
                                    }}
                                    placeholder="Edit Title"
                                    className="
                                          bg-transparent
                                          border-none
                                          p-0
                                          text-[13px]
                                          font-semibold
                                          text-white
                                          outline-none
                                          focus:ring-0
                                          w-full
                                        "
                                  />

                                  <span className="text-[8px] text-white/40 text-right">
                                    {elem.title.length}/80
                                  </span>
                                </div>
                              ) : (
                                <div
                                  onClick={() =>
                                    setFocusedField({
                                      cardIdx: idx,
                                      type: "title",
                                    })
                                  }
                                  className="cursor-pointer"
                                >
                                  <span className="text-[13px] font-semibold text-white leading-4 truncate block hover:border rounded border-gray-400">
                                    {(elem.title || "Edit Title").replace(
                                      "{{price}}",
                                      elem.price
                                        ? `${elem.price} ${elem.currency || "KWD"}`
                                        : ""
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>


                            {/* Subtitle */}
                            <div className="min-h-[18px]">
                              {focusedField?.cardIdx === idx &&
                                focusedField?.type === "subtitle" ? (
                                <div className="flex flex-col">
                                  <input
                                    autoFocus
                                    type="text"
                                    value={elem.subtitle}
                                    maxLength={80}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={(e) => {
                                      const n = [...carouselElements];
                                      n[idx] = {
                                        ...n[idx],
                                        subtitle: e.target.value.slice(0, 80),
                                      };
                                      setCarouselElements(n);
                                    }}
                                    placeholder="Edit Description"
                                    className="
                      bg-transparent
                      border-none
                      p-0
                      text-[11px]
                      text-[#A8A8A8]
                      outline-none
                      focus:ring-0
                      w-full
                    "
                                  />

                                  <span className="text-[8px] text-white/40 text-right">
                                    {elem.subtitle.length}/80
                                  </span>
                                </div>
                              ) : (
                                <div
                                  onClick={() =>
                                    setFocusedField({
                                      cardIdx: idx,
                                      type: "subtitle",
                                    })
                                  }
                                  className="cursor-pointer"
                                >
                                  <span className="text-[11px] text-[#A8A8A8] leading-4 line-clamp-2 hover:border rounded border-gray-400">
                                    {(elem.subtitle || "Edit Description").replace(
                                      "{{price}}",
                                      elem.price
                                        ? `${elem.price} ${elem.currency || "KWD"}`
                                        : ""
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>


                            {/* Price */}
                            {elem.price && (
                              <div className="text-[11px] font-semibold text-[#b6b2ff] pt-1">
                                {elem.price} {elem.currency || "KWD"}
                              </div>
                            )}

                          </div>


                          {/* Buttons */}
                          <div className="border-t border-[#2b2b2b] divide-y divide-[#2b2b2b] flex flex-col shrink-0">

                            {(elem.buttons || []).map((btn: any, bIdx: number) => {
                              const isFirst = bIdx === 0;

                              return (
                                <div
                                  key={bIdx}
                                  className="
                    h-10
                    flex
                    items-center
                    justify-center
                    relative
                    group/btn
                    hover:bg-[#262626]
                    transition
                  "
                                >

                                  <span className="
                    text-[12px]
                    font-semibold
                    text-[#3797F0]
                    truncate
                    max-w-[80%]
                  ">
                                    {(btn.title || "").replace(
                                      "{{price}}",
                                      `${elem.price || ""}`
                                    )}
                                  </span>


                                  <div className="absolute right-1.5 flex items-center">
                                    <button
                                      onClick={() => {
                                        setFocusedField({
                                          cardIdx: idx,
                                          type: "btn",
                                          btnIdx: bIdx,
                                        });
                                        setShowRightPanel(true);
                                      }}
                                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                                      title="Edit Button"
                                    >
                                      <Pencil className="w-3.5 h-3.5 text-white/50" />
                                    </button>

                                    {!isFirst && (
                                      <button
                                        onClick={() => {
                                          const n = [...carouselElements];
                                          const btns =
                                            n[idx].buttons.filter(
                                              (_: any, i: number) => i !== bIdx
                                            );
                                          n[idx] = {
                                            ...n[idx],
                                            buttons: btns,
                                          };
                                          setCarouselElements(n);
                                        }}
                                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                                        title="Remove Button"
                                      >
                                        <X className="w-3.5 h-3.5 text-red-400" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}


                            {/* Add Button */}
                            {(elem.buttons || []).length < 3 && (
                              <button
                                onClick={() => {
                                  const n = [...carouselElements];
                                  const btns = [...(n[idx].buttons || [])];

                                  btns.push({
                                    type: "web_url",
                                    title: "New Button",
                                    url: "https://",
                                  });

                                  n[idx] = {
                                    ...n[idx],
                                    buttons: btns,
                                  };

                                  setCarouselElements(n);
                                }}
                                className="
                  h-10
                  flex
                  items-center
                  justify-center
                  gap-1
                  text-[11px]
                  font-semibold
                  text-[#3797F0]
                  hover:bg-[#262626]
                  transition
                "
                              >
                                <Plus className="w-3 h-3 text-[#3797F0]" />
                                Add Button
                              </button>
                            )}

                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showButtonTemplateForm && (
                  <div className="flex flex-col items-center py-2 space-y-3 w-full">
                    {/* Native Instagram DM Bubble mockup for Action Buttons template */}
                    <div className="w-[248px] shrink-0 bg-[#262626] border border-white/5 rounded-[18px] overflow-hidden relative shadow-lg flex flex-col justify-between select-none">

                      {/* 1. Message Bubble text content (click to edit inline) */}
                      <div className="p-3.5 flex-1 min-w-0">
                        {focusedField?.type === 'btnTempText' ? (
                          <input
                            autoFocus
                            type="text"
                            value={btnTempText}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setBtnTempText(e.target.value)}
                            placeholder="Message Text"
                            className="bg-transparent border-none p-0 text-sm text-[#f5f5f5] outline-none focus:ring-0 w-full"
                          />
                        ) : (
                          <div
                            onClick={() => setFocusedField({ cardIdx: -999, type: 'btnTempText' })}
                            className="flex items-center justify-between cursor-pointer group/btn-temp-txt w-full py-0.5"
                          >
                            <span className="text-sm text-[#f5f5f5] break-words whitespace-pre-wrap flex-1">
                              {(btnTempText || "Message text...").replace("{{price}}", selectedProductsForTemplates[0]?.price ? `${selectedProductsForTemplates[0].price} ${selectedProductsForTemplates[0].currency || 'KWD'}` : "")}
                            </span>
                            <Pencil className="w-2.5 h-2.5 text-white/30 opacity-100 md:opacity-0 md:group-hover/btn-temp-txt:opacity-100 transition-opacity ml-1 shrink-0" />
                          </div>
                        )}
                      </div>

                      {/* 2. Action Buttons list (Instagram blue link color, stacked with dividers) */}
                      <div className="border-t border-[#363636] divide-y divide-[#363636] flex flex-col shrink-0">
                        {(buttonTemplateButtons || []).map((btn: any, bIdx: number) => {
                          const isFirst = bIdx === 0;
                          return (
                            <div key={bIdx} className="py-2.5 flex items-center justify-center px-4 relative group/btn hover:bg-white/[0.02] transition-colors min-h-[40px]">
                              {/* Centered Button Title View */}
                              <span className="text-sm font-semibold text-[#0095f6] truncate max-w-[80%] pointer-events-none select-none text-center">
                                {(btn.title || "").replace("{{price}}", selectedProductsForTemplates[0]?.price ? `${selectedProductsForTemplates[0].price} ${selectedProductsForTemplates[0].currency || 'KWD'}` : "")}
                              </span>

                              {/* Absolute Edit Trigger Controls on the Right Edge of Button Row */}
                              <div className="absolute right-2 flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setFocusedField({ cardIdx: -999, type: 'btnTempBtn', btnIdx: bIdx });
                                    setShowRightPanel(true);
                                  }}
                                  className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                                  title="Edit Button"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-white/50" />
                                </button>
                                {!isFirst && (
                                  <button
                                    onClick={() => {
                                      const btns = buttonTemplateButtons.filter((_: any, i: number) => i !== bIdx);
                                      setButtonTemplateButtons(btns);
                                    }}
                                    className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                                    title="Remove Button"
                                  >
                                    <X className="w-3.5 h-3.5 text-red-400" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Button action inside bubble */}
                      {(buttonTemplateButtons || []).length < 3 && (
                        <button
                          onClick={() => {
                            const btns = [...buttonTemplateButtons];
                            btns.push({ type: 'web_url', title: 'New Button', url: 'https://' });
                            setButtonTemplateButtons(btns);
                          }}
                          className="py-2.5 text-center text-[10px] text-[#0095f6] hover:text-[#0095f6]/80 font-bold uppercase transition-all bg-white/[0.01] flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3 text-[#0095f6]" />
                          Add Button
                        </button>
                      )}
                    </div>

                  </div>
                )}

                {/* Floating Action Settings Popover (styled like Canvas trigger settings) */}
                {focusedField && (focusedField.type === "btn" || focusedField.type === "btnTempBtn") && (
                  <div className="absolute inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-[320px] rounded-xl bg-[#121212] border border-white/10">
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <h3 className="text-sm font-semibold text-white">Button Settings</h3>

                        <button
                          onClick={() => setFocusedField(null)}
                          className="text-white/60 hover:text-white"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>

                      {/* Body */}
                      <div className="p-4 space-y-4">
                        {(() => {
                          const isGeneric = focusedField.type === "btn";
                          const cardIdx = focusedField.cardIdx;
                          const btnIdx = focusedField.btnIdx ?? 0;

                          const btn = isGeneric
                            ? carouselElements[cardIdx]?.buttons?.[btnIdx]
                            : buttonTemplateButtons[btnIdx];

                          if (!btn)
                            return <p className="text-xs text-gray-400">No button selected.</p>;

                          const isFirst = btnIdx === 0;

                          return (
                            <>
                              <div>
                                <label className="block text-xs text-gray-300 mb-1">
                                  Button Text
                                </label>

                                <RichTemplateInput
                                  value={btn.title}
                                  maxLength={20}
                                  placeholder="Button Label"
                                  onChange={(val: string) => {
                                    if (isGeneric) {
                                      const n = [...carouselElements];
                                      const btns = [...n[cardIdx].buttons];
                                      btns[btnIdx] = {
                                        ...btns[btnIdx],
                                        title: val.slice(0, 20),
                                      };
                                      n[cardIdx] = { ...n[cardIdx], buttons: btns };
                                      setCarouselElements(n);
                                    } else {
                                      const btns = [...buttonTemplateButtons];
                                      btns[btnIdx] = {
                                        ...btns[btnIdx],
                                        title: val.slice(0, 20),
                                      };
                                      setButtonTemplateButtons(btns);
                                    }
                                  }}
                                />

                                <p className="mt-1 text-[10px] text-gray-500">
                                  Use <code>{"{{price}}"}</code> to display the product price.
                                </p>
                              </div>

                              <div>
                                <label className="block text-xs text-gray-300 mb-1">
                                  Button URL
                                </label>

                                <input
                                  type="text"
                                  disabled={isFirst}
                                  value={btn.url || ""}
                                  placeholder="https://example.com"
                                  onChange={(e) => {
                                    if (isGeneric) {
                                      const n = [...carouselElements];
                                      const btns = [...n[cardIdx].buttons];
                                      btns[btnIdx] = {
                                        ...btns[btnIdx],
                                        url: e.target.value,
                                      };
                                      n[cardIdx] = { ...n[cardIdx], buttons: btns };
                                      setCarouselElements(n);
                                    } else {
                                      const btns = [...buttonTemplateButtons];
                                      btns[btnIdx] = {
                                        ...btns[btnIdx],
                                        url: e.target.value,
                                      };
                                      setButtonTemplateButtons(btns);
                                    }
                                  }}
                                  className="w-full rounded-md border border-white/10 bg-[#1b1b1b] px-3 py-2 text-sm text-white outline-none focus:border-blue-500 disabled:opacity-50"
                                />

                                {isFirst && (
                                  <p className="mt-1 text-[10px] text-gray-500">
                                    The first button always uses the checkout URL.
                                  </p>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* Footer */}
                      <div className="flex justify-end border-t border-white/10 px-4 py-3">
                        <button
                          onClick={() => setFocusedField(null)}
                          className="rounded-md bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input Bar */}
            <div className="px-3.5 py-2.5 border-t border-white/[0.06] bg-[#0d0d0d] shrink-0">
              {!isWithin24hWindow ? (
                <div className="flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg bg-red-500/5 border border-red-500/20 text-red-300/80">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-400 text-[16px]">warning</span>
                    <span className="text-[10px] font-medium">24h messaging window closed</span>
                  </div>
                  <a href={`https://ig.me/m/${selectedConversation.name}`} target="_blank" rel="noopener noreferrer" className="shrink-0 px-2.5 py-0.5 rounded-md bg-[#e1306c] hover:bg-[#c13584] text-white text-[9px] font-bold tracking-wide uppercase transition-all flex items-center gap-1">
                    <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                    Instagram
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all bg-white/[0.04] border-white/[0.08] focus-within:border-white/20">
                  <button className="text-white/40 hover:text-white transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[18px]">sentiment_satisfied</span>
                  </button>
                  <input
                    className="flex-1 bg-transparent text-xs text-white placeholder-white/25 outline-none"
                    placeholder="Message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendTextMessage(); } }}
                  />
                  <div className="flex items-center gap-1.5 shrink-0">

                    {!(showGenericTemplateForm || showButtonTemplateForm) && (
                      <button onClick={() => { setShowProductCatalogPopup(!showProductCatalogPopup); setShowButtonTemplateForm(false); setShowGenericTemplateForm(false); }} className={cn("transition-all hover:scale-110", showProductCatalogPopup ? "text-[#b6b2ff]" : "text-white/40 hover:text-white")}>
                        <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        if (sending) return;
                        if (showGenericTemplateForm || showButtonTemplateForm) {
                          if (inputText.trim()) {
                            await handleSendTextMessage();
                          }
                          if (showGenericTemplateForm) {
                            await handleSendGenericTemplate(carouselElements);
                          } else if (showButtonTemplateForm) {
                            await handleSendButtonTemplate(btnTempText, buttonTemplateButtons);
                          }
                        } else {
                          await handleSendTextMessage();
                        }
                      }}
                      disabled={
                        showGenericTemplateForm
                          ? false
                          : showButtonTemplateForm
                            ? buttonTemplateButtons.length === 0
                            : !inputText.trim()
                      }
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center active:scale-95 transition-all shadow-sm cursor-pointer",
                        sending ? "opacity-40 cursor-not-allowed" : "disabled:opacity-30",
                        (showGenericTemplateForm || showButtonTemplateForm)
                          ? "bg-[#b6b2ff] text-black hover:bg-[#b6b2ff]/90"
                          : "bg-white text-black hover:bg-white/90"
                      )}
                      title={
                        showGenericTemplateForm
                          ? "Send Product Slider"
                          : showButtonTemplateForm
                            ? "Send Action Buttons"
                            : "Send Message"
                      }
                    >
                      <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/20 select-none">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-3xl">forum</span>
            </div>
            <h3 className="text-sm font-semibold text-white/40">Select a conversation</h3>
            <p className="text-xs text-white/20">Choose a contact from the sidebar to start chatting</p>
          </div>
        )}
      </section>

      {/* ─── RIGHT PANE: Context Panel ────────────────────────────────── */}
      {/* Backdrop for mobile */}
      {showRightPanel && selectedConversation && (
        <div className="xl:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-25" onClick={() => setShowRightPanel(false)} />
      )}
      {showRightPanel && selectedConversation && (
        <aside className={`
          fixed xl:relative top-[100px] xl:top-0 right-0 h-[calc(100vh-100px)] xl:h-full z-30
          w-72 xl:w-72
          border-l border-white/[0.06] bg-[#111]
          flex flex-col shrink-0 overflow-y-auto
          [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full
          transition-transform duration-300
          xl:translate-x-0
        `}>
          {selectedConversation ? (
            <>
              {/* Profile */}
              <div className="flex flex-col items-center text-center px-5 pt-6 pb-5 border-b border-white/[0.06]">
                <img src={selectedConversation.avatar} alt={selectedConversation.name} className="w-20 h-20 rounded-full object-cover border border-white/10 mb-3 shadow-lg" />
                <a
                  href={`https://instagram.com/${selectedConversation.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-white">@{selectedConversation.name}</a>


              </div>

              {/* Conversation Info */}
              <div className="px-5 py-4 border-b border-white/[0.06] space-y-2.5">
                <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest mb-3">Conversation Info</p>
                {[
                  ["Last Active", selectedConversation.time],
                  ["24h Window", isWithin24hWindow ? "Open" : "Closed"],
                  ["Messages", messages.length.toString()],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-[11px] text-white/40">{label}</span>
                    <span className="text-[11px] text-white font-medium">{val}</span>
                  </div>
                ))}
              </div>

              {/* Enquiries */}
              <div className="flex-1 px-5 py-4">
                <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest mb-3">Interested Products</p>
                {loadingEnquiries ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-8 text-white/20">
                    <div className="w-4 h-4 rounded-full border border-white/20 border-t-white animate-spin" />
                    <span className="text-[9px] uppercase tracking-widest">Loading</span>
                  </div>
                ) : enquiries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-8 border border-dashed border-white/[0.06] rounded-xl text-white/20">
                    <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                    <span className="text-[11px]">No items tracked</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {enquiries.map((enquiry: any) =>
                      enquiry.products?.map((ep: any) => {
                        const isSel = selectedProductsForTemplates.some(p => p.id === ep.product_id);
                        return (
                          <div
                            key={ep.enquiry_product_id}
                            onClick={() => handleToggleProductForSend(ep)}
                            className={cn("group flex gap-3 p-3 rounded-xl border cursor-pointer transition-all relative", isSel ? "bg-[#b6b2ff]/10 border-[#b6b2ff]/30" : "bg-white/[0.02] border-white/[0.06] hover:border-white/15")}
                          >
                            {ep.main_media_url ? (
                              <img src={ep.main_media_url} className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0" alt="" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-sm text-white/20">shopping_bag</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0 pr-5">
                              <p className="text-[11px] font-semibold text-white truncate">{ep.title}</p>
                              {ep.price && <p className="text-[10px] font-bold text-[#b6b2ff] mt-0.5">{ep.price} {ep.currency || 'KWD'}</p>}
                              <div className="flex gap-1 mt-1">
                                <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase", enquiry.status === "OPEN" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/30")}>{enquiry.status}</span>
                                {ep.confidence_score != null && <span className="px-1.5 py-0.5 rounded bg-[#8fe3ff]/10 text-[#8fe3ff] text-[8px] font-bold">{Math.round(ep.confidence_score * 100)}%</span>}
                              </div>
                            </div>
                            {isSel && <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#b6b2ff] text-black text-[8px] font-bold flex items-center justify-center">{selectedProductsForTemplates.findIndex(p => p.id === ep.product_id) + 1}</span>}
                            {!isSel && (
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteEnquiryProduct(ep.enquiry_product_id); }} className="absolute top-2 right-2 w-5 h-5 rounded bg-red-500/10 text-red-400 items-center justify-center hidden group-hover:flex hover:bg-red-500 hover:text-white transition-all">
                                <span className="material-symbols-outlined text-[11px]">delete</span>
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/15 text-[11px] font-semibold uppercase tracking-widest text-center px-5">
              Select a conversation
            </div>
          )}
          {/* Product Catalog Modal Popup */}
          <AnimatePresence>
            {showProductCatalogPopup && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="relative w-full max-w-2xl bg-[#121212] border border-white/10 rounded-2xl flex flex-col h-[520px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                  {/* Header */}
                  <div className="flex justify-between items-center px-5 py-4 border-b border-white/5 shrink-0 bg-[#161616]/20">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#b6b2ff] text-xl">shopping_bag</span>
                      <h3 className="text-sm font-semibold text-white">Product Catalog</h3>
                    </div>
                    <button
                      onClick={() => setShowProductCatalogPopup(false)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="px-5 py-3 border-b border-white/5 bg-[#161616]/10 shrink-0">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.07] focus-within:border-white/20 transition-all">
                      <span className="material-symbols-outlined text-base text-white/30">search</span>
                      <input
                        type="text"
                        placeholder="Search catalog products..."
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        className="bg-transparent text-xs text-white placeholder-white/25 outline-none w-full border-none p-0 focus:ring-0"
                      />
                    </div>
                  </div>

                  {/* Product Grid Area */}
                  <div className="flex-1 overflow-y-auto min-h-0 p-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {filteredProducts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-white/20 gap-2">
                        <span className="material-symbols-outlined text-4xl">shopping_bag</span>
                        <p className="text-xs font-semibold">No products found</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {filteredProducts.map((prod: any) => {
                          const isSel = selectedProductsForTemplates.some(p => p.id === prod.id);
                          const mainMedia = prod.media_url || prod.main_media_url || prod.gallery?.[0]?.media_url;
                          return (
                            <div
                              key={prod.id}
                              onClick={() => handleToggleProductForSend({
                                product_id: prod.id,
                                title: prod.title,
                                price: prod.price,
                                currency: prod.currency,
                                description: prod.description,
                                main_media_url: mainMedia
                              })}
                              className={cn(
                                "relative flex flex-col gap-2 p-3 rounded-2xl border cursor-pointer transition-all select-none hover:scale-[1.02] active:scale-95 duration-200",
                                isSel ? "bg-[#b6b2ff]/10 border-[#b6b2ff]/40 shadow-lg shadow-[#b6b2ff]/5" : "bg-white/[0.02] border-white/[0.06] hover:border-white/15"
                              )}
                            >
                              <div className="aspect-square rounded-xl overflow-hidden bg-white/5 shrink-0 border border-white/[0.03]">
                                {mainMedia ? (
                                  <img src={mainMedia} className="w-full h-full object-cover" alt={prod.title} />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-white/[0.01]">
                                    <span className="material-symbols-outlined text-white/10 text-2xl">shopping_bag</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-0.5 flex-1 justify-between">
                                <div>
                                  <p className="text-[11px] font-bold text-white line-clamp-1 w-full leading-tight">{prod.title}</p>
                                  <p className="text-[10px] text-white/40 line-clamp-2 w-full leading-normal mt-0.5">{prod.description || "No description"}</p>
                                </div>
                                <p className="text-[10px] font-extrabold text-[#b6b2ff] mt-1.5">{prod.price ? `${prod.price} ${prod.currency || 'KWD'}` : 'Price TBD'}</p>
                              </div>
                              {isSel && (
                                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#b6b2ff] text-black text-[9px] font-black flex items-center justify-center shadow-lg border border-black/10">
                                  {selectedProductsForTemplates.findIndex(p => p.id === prod.id) + 1}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-4 border-t border-white/5 bg-[#161616]/20 flex justify-end items-center shrink-0">
                    <div className="flex gap-2">
                      {selectedProductsForTemplates.length > 0 && (
                        <button
                          onClick={() => setSelectedProductsForTemplates([])}
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-bold tracking-wide transition-all uppercase cursor-pointer"
                        >
                          Clear Selection
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowProductCatalogPopup(false);
                          if (selectedProductsForTemplates.length > 0) {
                            setShowGenericTemplateForm(true);
                          }
                        }}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8e8aff] to-[#706bff] hover:from-[#7e7aff] hover:to-[#605bff] text-white text-[11px] font-black tracking-wide transition-all uppercase cursor-pointer shadow-lg active:scale-95"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </aside>
      )}

      {/* Product Catalog Modal Popup */}
      <AnimatePresence>
        {showProductCatalogPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-[#121212] border border-white/10 rounded-2xl flex flex-col h-[520px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex justify-between items-center px-5 py-4 border-b border-white/5 shrink-0 bg-[#161616]/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#b6b2ff] text-xl">shopping_bag</span>
                  <h3 className="text-sm font-semibold text-white">Product Catalog</h3>
                </div>
                <button
                  onClick={() => setShowProductCatalogPopup(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-5 py-3 border-b border-white/5 bg-[#161616]/10 shrink-0">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.07] focus-within:border-white/20 transition-all">
                  <span className="material-symbols-outlined text-base text-white/30">search</span>
                  <input
                    type="text"
                    placeholder="Search catalog products..."
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    className="bg-transparent text-xs text-white placeholder-white/25 outline-none w-full border-none p-0 focus:ring-0"
                  />
                </div>
              </div>

              {/* Product Grid Area */}
              <div className="flex-1 overflow-y-auto min-h-0 p-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full">
                {filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-white/20 gap-2">
                    <span className="material-symbols-outlined text-4xl">shopping_bag</span>
                    <p className="text-xs font-semibold">No products found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredProducts.map((prod: any) => {
                      const isSel = selectedProductsForTemplates.some(p => p.id === prod.id);
                      const mainMedia = prod.media_url || prod.main_media_url || prod.gallery?.[0]?.media_url;
                      return (
                        <div
                          key={prod.id}
                          onClick={() => handleToggleProductForSend({
                            product_id: prod.id,
                            title: prod.title,
                            price: prod.price,
                            currency: prod.currency,
                            description: prod.description,
                            main_media_url: mainMedia
                          })}
                          className={cn(
                            "relative flex flex-col gap-2 p-1 rounded-2xl border cursor-pointer transition-all select-none hover:scale-[1.02] active:scale-95 duration-200",
                            isSel ? "bg-[#b6b2ff]/10 border-[#b6b2ff]/40 shadow-lg shadow-[#b6b2ff]/5" : "bg-white/[0.02] border-white/[0.06] hover:border-white/15"
                          )}
                        >
                          <div className="aspect-square rounded-xl overflow-hidden bg-white/5 shrink-0 border border-white/[0.03]">
                            {mainMedia ? (
                              <img src={mainMedia} className="w-full h-full object-cover" alt={prod.title} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-white/[0.01]">
                                <span className="material-symbols-outlined text-white/10 text-2xl">shopping_bag</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5 flex-1 justify-between">
                            <div>
                              <p className="text-[11px] font-bold text-white line-clamp-1 w-full leading-tight">{prod.title}</p>
                              <p className="text-[10px] text-white/40 line-clamp-2 w-full leading-normal mt-0.5">{prod.description || "No description"}</p>
                            </div>
                            <p className="text-[10px] font-extrabold text-[#b6b2ff] mt-1.5">{prod.price ? `${prod.price} ${prod.currency || 'KWD'}` : 'Price TBD'}</p>
                          </div>
                          {isSel && (
                            <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#b6b2ff] text-black text-[9px] font-black flex items-center justify-center shadow-lg border border-black/10">
                              {selectedProductsForTemplates.findIndex(p => p.id === prod.id) + 1}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-white/5 bg-[#161616]/20 flex justify-end items-center shrink-0">
                <div className="flex gap-2">
                  {selectedProductsForTemplates.length > 0 && (
                    <button
                      onClick={() => setSelectedProductsForTemplates([])}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-bold tracking-wide transition-all uppercase cursor-pointer"
                    >
                      Clear Selection
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowProductCatalogPopup(false);
                      if (selectedProductsForTemplates.length > 0) {
                        setShowGenericTemplateForm(true);
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8e8aff] to-[#706bff] hover:from-[#7e7aff] hover:to-[#605bff] text-white text-[11px] font-black tracking-wide transition-all uppercase cursor-pointer shadow-lg active:scale-95"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
      {toast.isVisible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
        />
      )}
    </motion.div>
  );
}
