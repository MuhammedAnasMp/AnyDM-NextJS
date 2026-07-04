"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import api from "@/lib/services/api.service";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Lock } from "lucide-react";

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

export default function InboxPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appUser = useSelector((state: RootState) => state.auth.user);
  const isPremiumActive = appUser?.is_premium_active ?? true;


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

  const [activeFilter, setActiveFilter] = useState("Primary");
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [businessInfo, setBusinessInfo] = useState<{ username: string; id: string } | null>(null);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [globalAIOn, setGlobalAIOn] = useState(false);

  useEffect(() => {
    const fetchGlobalAIStatus = async () => {
      try {
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
  const [chatCache, setChatCache] = useState<Record<string, { messages: any[], nextCursor: string | null, hasMore: boolean }>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [showRightPanel, setShowRightPanel] = useState(true);

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  useEffect(() => {
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
  }, []);

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
          return [tempConv, ...prev];
        });

        if (!selectedConversation || selectedConversation.recipient_id !== recipientIdParam) {
          setSelectedConversation(tempConv);
        }
      }
    }
  }, [recipientIdParam, usernameParam, nameParam, avatarParam, conversations.length]);


  const instagramAccounts = useSelector((state: RootState) => state.auth.instagramAccounts);
  const activeAccount = instagramAccounts.find(
    (acc: any) => acc.id === appUser?.active_instagram_account_id
  ) || instagramAccounts[0];

  const prevAccountUsernameRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (prevAccountUsernameRef.current && prevAccountUsernameRef.current !== activeAccount?.username) {
      setSelectedConversation(null); // Close the current chat when switching accounts
    }
    prevAccountUsernameRef.current = activeAccount?.username;
    fetchConversations();
  }, [activeAccount?.username]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations(true);
      if (selectedConversationIdRef.current) {
        fetchMessages(selectedConversationIdRef.current, null, true);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
            badge: 0,
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
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setConversations([]);
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
    if (selectedConversation) {
      selectedConversationIdRef.current = selectedConversation.id;
      setIsWithin24hWindow(selectedConversation.is_within_24h_window !== false);

      // Load from cache instantly if available
      const cached = chatCache[selectedConversation.id];
      if (cached) {
        setMessages(cached.messages);
        setNextCursor(cached.nextCursor);
        setHasMore(cached.hasMore);
      } else {
        setMessages([]);
        setNextCursor(null);
        setHasMore(true);
      }

      fetchMessages(selectedConversation.id);
      fetchEnquiries(selectedConversation.name);
    } else {
      selectedConversationIdRef.current = null;
      setMessages([]);
      setNextCursor(null);
      setHasMore(true);
      setEnquiries([]);
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
        if (!chatCache[conversationId]) {
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
        setChatCache((prevCache) => {
          const existingMessages = cursor && prevCache[conversationId] ? prevCache[conversationId].messages : [];
          const combined = cursor ? [...mapped, ...existingMessages] : mapped;
          const seen = new Set();
          const unique = combined.filter((msg: any) => {
            const key = msg.id || `${msg.created_time}-${msg.text}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          return {
            ...prevCache,
            [conversationId]: {
              messages: unique,
              nextCursor: res.data.next_cursor || null,
              hasMore: !!res.data.next_cursor
            }
          };
        });

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
    try {
      setSending(true);
      const payload = {
        recipient_id: selectedConversation.recipient_id,
        message: messagePayload
      };

      const isTemp = selectedConversation.id.startsWith("temp_");
      const url = isTemp
        ? `/crm/conversations/new/send/`
        : `/crm/conversations/${selectedConversation.id}/send/`;

      const res = await api.post(url, payload);

      const localMsg = {
        id: res.data.message_id || `local_${Date.now()}`,
        sender: "You",
        text: messagePayload.text || "[Template Message]",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isSelf: true,
        isAi: false,
        avatar: `https://ui-avatars.com/api/?name=Admin&background=000&color=fff`,
        created_time: new Date().toISOString(),
        attachments: messagePayload.attachment ? { data: [messagePayload.attachment] } : null
      };

      setMessages((prev) => [...prev, localMsg]);

      await fetchConversations();
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleSendTextMessage = async () => {
    if (!inputText.trim() || !selectedConversation) return;
    const textToSend = inputText;
    setInputText("");
    await handleSendMessage({ text: textToSend });
  };

  const handleSendButtonTemplate = async (text: string, buttons: any[]) => {
    const messagePayload = {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: text,
          buttons: buttons
        }
      }
    };
    await handleSendMessage(messagePayload);
    setShowButtonTemplateForm(false);
  };

  const handleSendGenericTemplate = async (elements: any[]) => {
    const messagePayload = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: elements
        }
      }
    };
    await handleSendMessage(messagePayload);
    setShowGenericTemplateForm(false);
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
        title: `🛒 Buy: ₹${p.price || ''}`.slice(0, 20),
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
        default_action: {
          type: 'web_url',
          url: prodUrl
        },
        buttons: [
          {
            type: 'web_url',
            title: p.price ? `Buy: ₹${p.price}`.slice(0, 20) : 'Buy Now',
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

    // Automatically open the template form
    setShowGenericTemplateForm(true);
    setShowButtonTemplateForm(false);
    setIsEditingGenericTemplate(false);
    setIsEditingButtonTemplate(false);
  };

  const handleToggleProductForSend = (ep: any) => {
    const prod = products.find(p => p.id === ep.product_id) || {
      id: ep.product_id,
      title: ep.title,
      price: ep.price,
      main_media_url: ep.main_media_url,
      description: "Check out this product!"
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
      console.error("Error uploading image to Cloudinary:", err);
      alert("Failed to upload image to Cloudinary.");
    } finally {
      setUploadingImage(false);
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 flex overflow-hidden -mx-4 md:-mx-8 -my-4 md:-my-8 h-[calc(100vh-112px)] bg-[#0c0c0c] relative font-sans"
    >
      {/* Background Ethereal Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#B6B2FF]/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#8FE3FF]/[0.03] blur-[120px] pointer-events-none" />

      {/* Left Pane: Conversation List */}
      <section
        className={`w-full lg:w-[360px] border-r border-white/5 flex flex-col bg-white/[0.01] backdrop-blur-md shrink-0 relative z-10
          ${showChatOnMobile ? "hidden lg:flex" : "flex"}`}
      >
        {/* Instagram Sidebar Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2 group cursor-pointer">
            <h1 className="text-base font-semibold text-white tracking-tight group-hover:text-white/80 transition-colors">
              {businessInfo?.username || activeAccount?.username || "inbox"}
            </h1>
            <span className="material-symbols-outlined text-base text-white/50 group-hover:text-white/80 transition-transform duration-200 group-hover:translate-y-0.5">
              expand_more
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                fetchConversations();
                if (selectedConversation) {
                  fetchMessages(selectedConversation.id);
                }
              }}
              disabled={loading}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh conversations"
            >
              <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>refresh</span>
            </button>
            <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all">
              <span className="material-symbols-outlined text-lg">edit_square</span>
            </button>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${globalAIOn ? "text-[#B6B2FF] bg-[#B6B2FF]/10 border border-[#B6B2FF]/10" : "text-white/40 bg-white/5 border border-white/5"
              }`}>
              AI MODE {globalAIOn ? "ON" : "OFF"}
            </span>
          </div>
        </div>




        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-white/5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 focus-within:border-white/20 transition-all">
            <span className="material-symbols-outlined text-sm text-white/40">search</span>
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs text-white placeholder-white/25 outline-none w-full p-0 focus:ring-0"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-white/40 hover:text-white">
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Conversation list scroll area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
          {loading ? (
            <div className="p-8 text-center text-xs text-white/30 flex flex-col items-center justify-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
              <span className="font-medium tracking-wider uppercase text-[10px]">Loading chats...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-white/30 flex flex-col items-center justify-center py-16 gap-2">
              <span className="material-symbols-outlined text-3xl text-white/10">forum</span>
              <span className="font-medium">No conversations found</span>
            </div>
          ) : (
            filteredConversations.map((item, idx) => {
              const isSelected = selectedConversation?.id === item.id;
              return (
                <div
                  key={item.id || idx}
                  onClick={() => {
                    setSelectedConversation(item);
                    setShowChatOnMobile(true);
                    setIsWithin24hWindow(item.is_within_24h_window !== false);
                  }}
                  className={cn(
                    "px-4 py-3.5 flex gap-3.5 cursor-pointer items-center rounded-xl transition-all border duration-200",
                    isSelected
                      ? "bg-white/[0.07] border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                      : "bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/5"
                  )}
                >
                  <div className="relative shrink-0">
                    <img
                      className="w-12 h-12 rounded-full border border-white/10 object-cover shadow-inner"
                      src={item.avatar}
                      alt={item.name}
                    />
                    <span className={cn(
                      "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0c0c0c] shadow-lg transition-all duration-300",
                      item.is_within_24h_window !== false
                        ? "bg-green-500 shadow-green-500/40"
                        : "bg-red-500 shadow-red-500/40"
                    )}></span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <div className="flex items-center gap-1 min-w-0">
                        <h3 className="font-semibold text-xs text-white truncate">{item.name}</h3>
                        {globalAIOn && item.is_ai_enabled !== false && (
                          <span className="material-symbols-outlined text-[13px] text-[#B6B2FF] shrink-0 animate-pulse" title="AI Support Active">psychology</span>
                        )}
                      </div>
                      <span className="text-[9px] text-white/30 font-medium shrink-0">{item.time}</span>
                    </div>
                    <p className={cn(
                      "text-[11px] truncate font-medium",
                      item.badge > 0 ? "text-white font-semibold" : "text-white/45"
                    )}>
                      {item.text}
                    </p>
                  </div>
                  {item.badge > 0 && (
                    <div className="w-2 h-2 bg-[#B6B2FF] rounded-full shrink-0 shadow-[0_0_8px_rgba(182,178,255,0.5)]"></div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Center Pane: Chat Conversation View */}
      <section
        className={`flex-grow flex flex-col bg-white/[0.005] backdrop-blur-lg relative overflow-hidden z-10
          ${showChatOnMobile ? "flex" : "hidden lg:flex"}`}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4.5 border-b border-white/5 flex items-center justify-between bg-[#0c0c0c]/40 backdrop-blur-md shrink-0 z-20">
              <div className="flex items-center gap-3">
                {/* Back Button (Mobile Only) */}
                <button
                  onClick={() => setShowChatOnMobile(false)}
                  className="lg:hidden w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                </button>

                <div className="relative">
                  <img
                    alt={selectedConversation.name}
                    className="w-10 h-10 rounded-full border border-white/10 object-cover"
                    src={selectedConversation.avatar}
                  />
                  <span className={cn(
                    "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0c0c0c] transition-colors",
                    isWithin24hWindow ? "bg-green-500" : "bg-red-500"
                  )}></span>
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-white leading-tight">{selectedConversation.name}</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500/80"></span>
                    <p className="text-[9px] text-white/40 font-medium">Active now</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 items-center text-white">
                {/* Specific Chat AI Toggle */}
                {globalAIOn && (
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg mr-1 text-[9px] font-bold text-white/70">
                    <span className="material-symbols-outlined text-[13px] text-[#B6B2FF] shrink-0">psychology</span>
                    <span className=" tracking-wider">{selectedConversation.name} AI Mode</span>
                    <input
                      type="checkbox"
                      checked={selectedConversation.is_ai_enabled !== false}
                      onChange={async (e) => {
                        const updatedVal = e.target.checked;
                        setSelectedConversation((prev: any) => prev ? { ...prev, is_ai_enabled: updatedVal } : null);
                        setConversations((prev: any[]) => prev.map(c => c.id === selectedConversation.id ? { ...c, is_ai_enabled: updatedVal } : c));
                        try {
                          const recipientId = selectedConversation.recipient_id;
                          await api.post(`/crm/customers/${recipientId}/toggle-ai/`, { is_ai_enabled: updatedVal });
                        } catch (err) {
                          console.error("Failed to toggle AI mode for customer:", err);
                        }
                      }}
                      className="w-7 h-4 bg-white/10 rounded-full accent-white cursor-pointer ml-1"
                    />
                  </div>
                )}

                <button
                  onClick={() => fetchMessages(selectedConversation.id)}
                  disabled={loadingMessages}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh chat messages"
                >
                  <span className={`material-symbols-outlined text-lg ${loadingMessages ? 'animate-spin' : ''}`}>refresh</span>
                </button>

                <button
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  className={cn(
                    "w-8 h-8 rounded-lg border flex items-center justify-center transition-all",
                    showRightPanel
                      ? "bg-[#B6B2FF]/10 border-[#B6B2FF]/20 text-[#B6B2FF]"
                      : "bg-white/5 border-white/5 text-white/70 hover:text-white hover:bg-white/10"
                  )}
                  title="Toggle Details"
                >
                  <span className="material-symbols-outlined text-lg">info</span>
                </button>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-black/10"
            >
              {loadingMore && (
                <div className="text-center text-[10px] text-white/30 py-2 flex items-center justify-center gap-2">
                  <div className="animate-spin w-3 h-3 border border-white/20 border-t-white rounded-full"></div>
                  <span className="font-medium uppercase tracking-wider text-[9px]">Loading history...</span>
                </div>
              )}

              {loadingMessages ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-white/30">
                  <div className="animate-spin w-6 h-6 border-2 border-white/20 border-t-white rounded-full"></div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest">Fetching Messages</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-20 text-xs text-white/30 flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-4xl text-white/5">chat_bubble_outline</span>
                  <span>No messages in this conversation.</span>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={msg.id || idx} className={`flex gap-3 max-w-[85%] sm:max-w-[70%] ${msg.isSelf ? "ml-auto flex-row-reverse" : ""}`}>
                    {!msg.isSelf && (
                      <img
                        alt={msg.sender}
                        className="w-8 h-8 rounded-full shrink-0 self-end border border-white/10 object-cover shadow"
                        src={msg.avatar || selectedConversation.avatar}
                      />
                    )}
                    <div className="flex flex-col gap-1 max-w-full">
                      {/* Text Bubble */}
                      {(msg.text || (!msg.attachments?.data && !msg.shares?.data && !msg.story)) && (
                        <div className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed break-words shadow-sm border ${msg.isSelf
                          ? "bg-white/10 backdrop-blur-md border-white/15 text-white rounded-br-none"
                          : "bg-white/[0.03] border-white/5 text-white/90 rounded-bl-none"
                          }`}>
                          {msg.isAi && (
                            <div className="flex items-center gap-1.5 mb-1.5 text-[#B6B2FF]">
                              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                              <span className="text-[8px] uppercase font-bold tracking-widest">Sent by AnyDM AI</span>
                            </div>
                          )}
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      )}

                      {/* Attachments (Generic Templates / Carousel / Images / Videos / Audio) */}
                      {msg.attachments?.data && msg.attachments.data.length > 0 && (
                        <div
                          className="flex gap-3 overflow-x-auto py-1.5 max-w-full mt-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
                          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                        >
                          {msg.attachments.data.map((att: any, aIdx: number) => {
                            // Generic Template Card
                            if (att.generic_template) {
                              const imageUrl = att.generic_template.media_url || att.generic_template.image_url;
                              return (
                                <div
                                  key={aIdx}
                                  className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden w-60 shrink-0 shadow-xl text-left snap-start flex flex-col justify-between"
                                >
                                  <div>
                                    {imageUrl && (
                                      <img src={imageUrl} className="w-full h-32 object-cover border-b border-white/5" alt="" />
                                    )}
                                    <div className="p-4">
                                      <p className="text-xs font-semibold text-white whitespace-pre-wrap leading-snug">
                                        {att.generic_template.title}
                                      </p>
                                      {att.generic_template.subtitle && (
                                        <p className="text-[11px] text-white/50 mt-1 leading-snug">
                                          {att.generic_template.subtitle}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {att.generic_template.cta && (
                                    <div className="border-t border-white/5 divide-y divide-white/5 flex flex-col mt-auto">
                                      {att.generic_template.cta.map((cta: any, cIdx: number) => (
                                        <a
                                          key={cIdx}
                                          href={cta.url || "#"}
                                          target={cta.url ? "_blank" : "_self"}
                                          rel="noopener noreferrer"
                                          className="py-2.5 text-center text-[11px] font-bold text-[#8FE3FF] hover:bg-white/5 transition-colors"
                                        >
                                          {cta.title}
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            // Image Attachment
                            if (att.image_data) {
                              return (
                                <div
                                  key={aIdx}
                                  className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden max-w-xs shrink-0 shadow-lg text-left snap-start"
                                >
                                  <a
                                    href={att.image_data.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block hover:opacity-90 transition-opacity"
                                  >
                                    <img
                                      src={att.image_data.preview_url || att.image_data.url}
                                      alt="Instagram Attachment"
                                      className="w-full h-auto max-h-56 object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </a>
                                </div>
                              );
                            }

                            // Video Attachment
                            if (att.video_data) {
                              return (
                                <div
                                  key={aIdx}
                                  className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden max-w-xs shrink-0 shadow-lg text-left snap-start"
                                >
                                  <PlayableVideoAttachment url={att.video_data.url} />
                                </div>
                              );
                            }

                            // Audio / Voice Message Attachment
                            if (att.audio_data) {
                              return (
                                <div
                                  key={aIdx}
                                  className="bg-white/[0.02] border border-white/10 rounded-2xl p-3.5 max-w-xs shrink-0 shadow-md text-left snap-start flex items-center gap-3"
                                >
                                  <span className="material-symbols-outlined text-lg text-white/60">mic</span>
                                  <audio src={att.audio_data.url} controls className="w-44 text-xs" />
                                </div>
                              );
                            }

                            return null;
                          })}
                        </div>
                      )}

                      {/* Shares (Shared Reel/Post) */}
                      {msg.shares?.data?.map((sh: any, sIdx: number) => {
                        if (sh.link) {
                          return (
                            <div key={sIdx} className="bg-white/[0.02] border border-white/15 rounded-2xl p-4 max-w-xs flex items-center gap-3.5 shadow-md mt-1 self-start text-left">
                              <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-lg text-[#8FE3FF]">play_circle</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-white truncate">Shared a Reel / Post</p>
                                <a
                                  href={sh.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-[#8FE3FF] hover:underline truncate block mt-0.5"
                                >
                                  View on Instagram
                                </a>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}

                      {/* Story Mentions */}
                      {msg.story && (
                        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 max-w-xs flex flex-col gap-2 shadow-lg mt-1 self-start text-left">
                          <div className="flex items-center gap-2 text-white/40 text-[9px] uppercase font-bold tracking-wider">
                            <span className="material-symbols-outlined text-xs">history_toggle_off</span>
                            <span>Story Mention</span>
                          </div>
                          {msg.story.url && (
                            <img src={msg.story.url} className="w-full h-36 object-cover rounded-xl border border-white/5" alt="" />
                          )}
                        </div>
                      )}

                      <span className={`text-[9px] text-white/30 mt-0.5 px-1 font-medium ${msg.isSelf ? "text-right" : ""}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Product Catalog Popup */}
            {showProductCatalogPopup && (
              <div className="p-5 bg-[#121212]/95 backdrop-blur-xl border-t border-white/10 text-xs text-white space-y-4 max-h-64 overflow-y-auto animate-fadeIn shadow-2xl relative z-30">
                <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <h4 className="font-semibold text-xs text-[#B6B2FF] uppercase tracking-wider">Product Catalog</h4>
                  <button
                    onClick={() => setShowProductCatalogPopup(false)}
                    className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </div>

                {/* Product Search */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 focus-within:border-white/20 transition-all">
                  <span className="material-symbols-outlined text-xs text-white/40">search</span>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    className="bg-transparent border-none text-[11px] text-white placeholder-white/25 outline-none w-full p-0 focus:ring-0"
                  />
                  {productSearchQuery && (
                    <button onClick={() => setProductSearchQuery("")} className="text-white/40 hover:text-white">
                      <span className="material-symbols-outlined text-[10px]">close</span>
                    </button>
                  )}
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-white/30">
                    No products found matching your search.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                    {filteredProducts.map((prod: any) => {
                      const isSelected = selectedProductsForTemplates.some(p => p.id === prod.id);

                      return (
                        <div
                          key={prod.id}
                          onClick={() => {
                            const fakeEp = {
                              product_id: prod.id,
                              title: prod.title,
                              price: prod.price,
                              main_media_url: prod.media_url || prod.main_media_url
                            };
                            handleToggleProductForSend(fakeEp);
                          }}
                          className={cn(
                            "group relative flex flex-col gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all duration-200",
                            isSelected
                              ? "bg-[#B6B2FF]/10 border-[#B6B2FF]/40 shadow-lg"
                              : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                          )}
                        >
                          <div className="aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/5">
                            {(prod.media_url || prod.main_media_url) ? (
                              <img
                                src={prod.media_url || prod.main_media_url}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                alt={prod.title}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl text-white/20">shopping_bag</span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-semibold text-white truncate text-[11px] leading-tight">
                              {prod.title}
                            </h5>
                            <p className="text-[10px] font-bold text-[#B6B2FF] mt-0.5">
                              ₹{prod.price}
                            </p>
                          </div>
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#B6B2FF] text-black text-[9px] font-bold shadow-md">
                              {selectedProductsForTemplates.findIndex(p => p.id === prod.id) + 1}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Template Send Forms (Carousel or Button) */}
            {(showButtonTemplateForm || showGenericTemplateForm) && (
              <div className="p-5 bg-[#121212]/95 backdrop-blur-xl border-t border-white/10 text-xs text-white space-y-4 animate-fadeIn relative z-30 shadow-2xl">
                {/* Header with toggle tabs */}
                <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <div className="flex gap-4 text-xs font-semibold">
                    <button
                      onClick={() => {
                        setShowGenericTemplateForm(true);
                        setShowButtonTemplateForm(false);
                      }}
                      className={cn(
                        "pb-1 transition-all relative font-bold text-[11px] uppercase tracking-wider",
                        showGenericTemplateForm ? "text-white" : "text-white/40 hover:text-white/70"
                      )}
                    >
                      Image Slider
                      {showGenericTemplateForm && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B6B2FF]" />}
                    </button>
                    <button
                      onClick={() => {
                        setShowButtonTemplateForm(true);
                        setShowGenericTemplateForm(false);
                      }}
                      className={cn(
                        "pb-1 transition-all relative font-bold text-[11px] uppercase tracking-wider",
                        showButtonTemplateForm ? "text-white" : "text-white/40 hover:text-white/70"
                      )}
                    >
                      Action Buttons
                      {showButtonTemplateForm && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B6B2FF]" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {selectedProductsForTemplates.length > 0 && (
                      <span className="text-[9px] bg-[#B6B2FF]/20 text-[#B6B2FF] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                        {selectedProductsForTemplates.length} selected
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setShowButtonTemplateForm(false);
                        setShowGenericTemplateForm(false);
                        setSelectedProductsForTemplates([]);
                      }}
                      className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                </div>

                {/* IMAGE SLIDER / CAROUSEL MODE */}
                {showGenericTemplateForm && (
                  <>
                    {isEditingGenericTemplate ? (
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-[#B6B2FF] font-bold uppercase tracking-wider">
                            Card {activeCardIndex + 1} of {carouselElements.length}
                          </span>
                          {carouselElements.length > 1 && (
                            <div className="flex gap-1">
                              <button
                                disabled={activeCardIndex === 0}
                                onClick={() => setActiveCardIndex(prev => prev - 1)}
                                className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center disabled:opacity-20"
                              >
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                              </button>
                              <button
                                disabled={activeCardIndex === carouselElements.length - 1}
                                onClick={() => setActiveCardIndex(prev => prev + 1)}
                                className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center disabled:opacity-20"
                              >
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="text-[9px] text-white/40 uppercase font-bold tracking-wider block mb-1.5">Card Title</label>
                            <input
                              type="text"
                              value={carouselElements[activeCardIndex]?.title || ""}
                              onChange={(e) => {
                                const newElems = [...carouselElements];
                                newElems[activeCardIndex] = { ...newElems[activeCardIndex], title: e.target.value };
                                setCarouselElements(newElems);
                              }}
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none text-xs focus:border-white/30 transition-all"
                              placeholder="Product name..."
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-white/40 uppercase font-bold tracking-wider block mb-1.5">Card Subtitle</label>
                            <input
                              type="text"
                              value={carouselElements[activeCardIndex]?.subtitle || ""}
                              onChange={(e) => {
                                const newElems = [...carouselElements];
                                newElems[activeCardIndex] = { ...newElems[activeCardIndex], subtitle: e.target.value };
                                setCarouselElements(newElems);
                              }}
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none text-xs focus:border-white/30 transition-all"
                              placeholder="Short description..."
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[9px] text-white/40 uppercase font-bold tracking-wider block mb-1.5">Card Image</label>
                            <div className="relative">
                              {carouselElements[activeCardIndex]?.image_url ? (
                                <div className="group relative w-full h-36 rounded-xl overflow-hidden border border-white/10 bg-black/20 flex items-center justify-center">
                                  <img
                                    src={carouselElements[activeCardIndex].image_url}
                                    className="w-full h-full object-cover"
                                    alt="Preview"
                                  />
                                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white text-black text-[11px] font-bold hover:bg-white/90 transition-colors flex items-center gap-1 shadow-lg">
                                      <span className="material-symbols-outlined text-sm">photo_camera</span>
                                      Change Image
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={uploadingImage}
                                      />
                                    </label>
                                    <button
                                      onClick={() => {
                                        const newElems = [...carouselElements];
                                        newElems[activeCardIndex] = { ...newElems[activeCardIndex], image_url: "" };
                                        setCarouselElements(newElems);
                                      }}
                                      className="p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-colors flex items-center justify-center shadow-lg"
                                      title="Remove Image"
                                    >
                                      <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <label className="cursor-pointer w-full h-36 rounded-xl border border-dashed border-white/10 hover:border-[#B6B2FF]/40 hover:bg-white/[0.02] transition-all flex flex-col items-center justify-center text-white/40 hover:text-white/80 gap-2">
                                  <span className="material-symbols-outlined text-2xl text-white/30">add_photo_alternate</span>
                                  <span className="text-xs font-semibold">
                                    {uploadingImage ? "Uploading to Cloudinary..." : "Upload Image"}
                                  </span>
                                  <span className="text-[9px] text-white/30 uppercase tracking-widest">Supports JPG, PNG, WEBP</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={uploadingImage}
                                  />
                                </label>
                              )}
                              {uploadingImage && (
                                <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center rounded-xl backdrop-blur-xs">
                                  <div className="animate-spin w-5 h-5 border-2 border-[#B6B2FF] border-t-transparent rounded-full mb-2"></div>
                                  <span className="text-[8px] font-bold text-[#B6B2FF] tracking-widest uppercase">Uploading...</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="sm:col-span-2 space-y-3">
                            <div className="flex justify-between items-center border-b border-white/5 pb-1">
                              <label className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Buttons (Max 3)</label>
                              {(carouselElements[activeCardIndex]?.buttons || []).length < 3 && (
                                <button
                                  onClick={() => {
                                    const newElems = [...carouselElements];
                                    const buttons = [...(newElems[activeCardIndex].buttons || [])];
                                    buttons.push({ type: 'web_url', title: 'New Button', url: 'https://' });
                                    newElems[activeCardIndex] = { ...newElems[activeCardIndex], buttons };
                                    setCarouselElements(newElems);
                                  }}
                                  className="text-[9px] text-[#8FE3FF] hover:underline font-bold flex items-center gap-0.5 uppercase tracking-wider"
                                >
                                  <span className="material-symbols-outlined text-xs">add</span>
                                  Add Button
                                </button>
                              )}
                            </div>

                            <div className="space-y-2">
                              {(carouselElements[activeCardIndex]?.buttons || []).map((btn: any, btnIdx: number) => (
                                <div key={btnIdx} className="flex gap-2 items-center bg-black/30 p-2.5 rounded-lg border border-white/5">
                                  <div className="flex-1 grid grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      value={btn.title}
                                      onChange={(e) => {
                                        const newElems = [...carouselElements];
                                        const buttons = [...newElems[activeCardIndex].buttons];
                                        buttons[btnIdx] = { ...buttons[btnIdx], title: e.target.value };
                                        newElems[activeCardIndex] = { ...newElems[activeCardIndex], buttons };
                                        setCarouselElements(newElems);
                                      }}
                                      className="bg-black/50 border border-white/10 rounded-md px-2 py-1.5 text-white outline-none text-[11px] focus:border-white/20"
                                      placeholder="Button Title"
                                    />
                                    <input
                                      type="text"
                                      value={btn.url}
                                      onChange={(e) => {
                                        const newElems = [...carouselElements];
                                        const buttons = [...newElems[activeCardIndex].buttons];
                                        buttons[btnIdx] = { ...buttons[btnIdx], url: e.target.value };
                                        newElems[activeCardIndex] = { ...newElems[activeCardIndex], buttons };
                                        setCarouselElements(newElems);
                                      }}
                                      className="bg-black/50 border border-white/10 rounded-md px-2 py-1.5 text-white outline-none text-[11px] focus:border-white/20"
                                      placeholder="https://..."
                                    />
                                  </div>
                                  {(carouselElements[activeCardIndex]?.buttons || []).length > 1 && (
                                    <button
                                      onClick={() => {
                                        const newElems = [...carouselElements];
                                        const buttons = newElems[activeCardIndex].buttons.filter((_: any, idx: number) => idx !== btnIdx);
                                        newElems[activeCardIndex] = { ...newElems[activeCardIndex], buttons };
                                        setCarouselElements(newElems);
                                      }}
                                      className="text-white/30 hover:text-red-400 p-1.5 hover:bg-white/5 rounded"
                                    >
                                      <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                          <button
                            onClick={() => setIsEditingGenericTemplate(false)}
                            className="px-4 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-white/90 transition-all"
                          >
                            Save & Preview
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-2 space-y-4">
                        <div className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Instagram Preview</div>

                        <div className="relative w-full max-w-sm flex justify-center items-center">
                          {carouselElements.length > 1 && activeCardIndex > 0 && (
                            <button
                              onClick={() => setActiveCardIndex(prev => prev - 1)}
                              className="absolute left-4 w-7 h-7 rounded-full bg-black/75 border border-white/10 text-white hover:bg-black/90 z-10 shadow-lg flex items-center justify-center transition-all"
                            >
                              <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                          )}

                          <div className="group relative bg-[#1f1f1f] border border-white/10 rounded-2xl overflow-hidden w-56 shadow-2xl text-left">
                            {carouselElements[activeCardIndex]?.image_url ? (
                              <img src={carouselElements[activeCardIndex].image_url} className="w-full h-28 object-cover border-b border-white/5" alt="" />
                            ) : (
                              <div className="w-full h-28 bg-white/5 flex items-center justify-center border-b border-white/5">
                                <span className="material-symbols-outlined text-2xl text-white/15">image</span>
                              </div>
                            )}
                            <div className="p-3">
                              <p className="text-[11px] font-semibold text-white truncate">
                                {carouselElements[activeCardIndex]?.title || "Product Title"}
                              </p>
                              <p className="text-[10px] text-white/45 mt-0.5 truncate leading-normal">
                                {carouselElements[activeCardIndex]?.subtitle || "Product Description"}
                              </p>
                            </div>
                            <div className="border-t border-white/5">
                              <div className="py-2 text-center text-[10px] font-bold text-[#8FE3FF] hover:bg-white/5 transition-colors cursor-pointer">
                                {carouselElements[activeCardIndex]?.buttons?.[0]?.title || "Buy Now"}
                              </div>
                            </div>
                            <button
                              onClick={() => setIsEditingGenericTemplate(true)}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100 shadow-md flex items-center justify-center"
                              title="Edit Template"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                          </div>

                          {carouselElements.length > 1 && activeCardIndex < carouselElements.length - 1 && (
                            <button
                              onClick={() => setActiveCardIndex(prev => prev + 1)}
                              className="absolute right-4 w-7 h-7 rounded-full bg-black/75 border border-white/10 text-white hover:bg-black/90 z-10 shadow-lg flex items-center justify-center transition-all"
                            >
                              <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                          )}
                        </div>

                        {carouselElements.length > 1 && (
                          <div className="flex gap-1.5 justify-center">
                            {carouselElements.map((_, idx) => (
                              <div
                                key={idx}
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full transition-all duration-200",
                                  idx === activeCardIndex ? "bg-[#B6B2FF] scale-110" : "bg-white/25"
                                )}
                              />
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2 w-full justify-end pt-3 border-t border-white/5">
                          <button
                            onClick={() => setIsEditingGenericTemplate(true)}
                            className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 font-bold text-xs flex items-center gap-1.5 transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Edit
                          </button>
                          <button
                            onClick={() => handleSendGenericTemplate(carouselElements)}
                            disabled={sending}
                            className="px-4 py-1.5 rounded-lg bg-white text-black hover:bg-white/90 font-bold text-xs disabled:opacity-50 transition-all"
                          >
                            Send Slider ({carouselElements.length} card{carouselElements.length > 1 ? 's' : ''})
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ACTION BUTTON MODE */}
                {showButtonTemplateForm && (
                  <>
                    {isEditingButtonTemplate ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-[9px] text-white/40 uppercase font-bold tracking-wider block mb-1.5">Message Text</label>
                          <input
                            type="text"
                            value={btnTempText}
                            onChange={(e) => setBtnTempText(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none text-xs focus:border-white/30 transition-all"
                            placeholder="e.g., Tap below to view details"
                          />
                        </div>

                        <div className="space-y-3">
                          <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider block">Buttons (Max 3)</span>
                          {buttonTemplateButtons.map((btn, idx) => (
                            <div key={idx} className="grid grid-cols-2 gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                              <div>
                                <label className="text-[9px] text-white/30 uppercase font-bold block mb-1">Button {idx + 1} Title</label>
                                <input
                                  type="text"
                                  value={btn.title}
                                  onChange={(e) => {
                                    const newBtns = [...buttonTemplateButtons];
                                    newBtns[idx] = { ...newBtns[idx], title: e.target.value };
                                    setButtonTemplateButtons(newBtns);
                                  }}
                                  className="w-full bg-black/50 border border-white/10 rounded-md px-2.5 py-1.5 text-white outline-none text-xs focus:border-white/20"
                                  placeholder="Buy Now"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-white/30 uppercase font-bold block mb-1">Button {idx + 1} URL</label>
                                <input
                                  type="text"
                                  value={btn.url}
                                  onChange={(e) => {
                                    const newBtns = [...buttonTemplateButtons];
                                    newBtns[idx] = { ...newBtns[idx], url: e.target.value };
                                    setButtonTemplateButtons(newBtns);
                                  }}
                                  className="w-full bg-black/50 border border-white/10 rounded-md px-2.5 py-1.5 text-white outline-none text-xs focus:border-white/20"
                                  placeholder="https://..."
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                          <button
                            onClick={() => setIsEditingButtonTemplate(false)}
                            className="px-4 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-white/90 transition-all"
                          >
                            Save & Preview
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-2 space-y-4">
                        <div className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Instagram Preview</div>

                        <div className="w-full max-w-sm flex flex-col items-end gap-1">
                          <div className="group relative px-4 py-2.5 rounded-2xl text-[11px] leading-relaxed break-words bg-white/[0.08] border border-white/10 text-white rounded-br-none shadow-lg">
                            <p>{btnTempText}</p>
                            <button
                              onClick={() => setIsEditingButtonTemplate(true)}
                              className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100 shadow-md flex items-center justify-center"
                              title="Edit Template"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                          </div>

                          <div className="w-[160px] bg-[#1f1f1f] border border-white/10 rounded-b-2xl overflow-hidden shadow-2xl divide-y divide-white/5">
                            {buttonTemplateButtons.map((btn, idx) => (
                              <div key={idx} className="py-2 text-[10px] font-bold text-[#8FE3FF] cursor-pointer hover:bg-white/5 transition-colors text-center">
                                {btn.title || `Button ${idx + 1}`}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 w-full justify-end pt-3 border-t border-white/5">
                          <button
                            onClick={() => setIsEditingButtonTemplate(true)}
                            className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 font-bold text-xs flex items-center gap-1.5 transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Edit
                          </button>
                          <button
                            onClick={() => handleSendButtonTemplate(btnTempText, buttonTemplateButtons)}
                            disabled={sending || buttonTemplateButtons.length === 0}
                            className="px-4 py-1.5 rounded-lg bg-white text-black hover:bg-white/90 font-bold text-xs disabled:opacity-50 transition-all"
                          >
                            Send Template ({buttonTemplateButtons.length} button{buttonTemplateButtons.length > 1 ? 's' : ''})
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Bottom Bar: Action Inputs */}
            <div className="p-4 bg-[#0c0c0c]/40 border-t border-white/5 shrink-0 z-20">
              {!isWithin24hWindow && (
                <div className="mb-4 p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-red-200/95 text-[11px] flex flex-col sm:flex-row items-center gap-3.5 justify-between font-medium">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-lg text-red-400">warning</span>
                    <span>Out of 24-hour messaging window. Only replies to inbound customer DMs are allowed.</span>
                  </div>
                  <a
                    href={`https://ig.me/m/${selectedConversation.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-3.5 py-1.5 rounded-lg bg-[#e1306c] hover:bg-[#c13584] text-white text-[10px] font-bold tracking-wide uppercase transition-all flex items-center gap-1.5 shadow-lg"
                  >
                    <span className="material-symbols-outlined text-sm">chat_bubble</span>
                    Message on Instagram
                  </a>
                </div>
              )}

              <div className={cn(
                "border rounded-xl py-3 px-5 flex items-center gap-4 bg-white/[0.02] backdrop-blur-md transition-all duration-300",
                isWithin24hWindow ? "border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]" : "border-red-500/10 opacity-40 cursor-not-allowed"
              )}>
                <button
                  disabled={!isWithin24hWindow}
                  className="text-white/60 hover:text-white transition-opacity shrink-0 disabled:opacity-35"
                >
                  <span className="material-symbols-outlined text-2xl">sentiment_satisfied</span>
                </button>

                <input
                  className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-white placeholder-white/25 outline-none disabled:cursor-not-allowed"
                  placeholder={isWithin24hWindow ? "Write a message..." : "Messaging disabled (24h window closed)"}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={!isWithin24hWindow}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendTextMessage();
                    }
                  }}
                />

                {/* Product Catalog Button */}
                <button
                  onClick={() => {
                    setShowProductCatalogPopup(!showProductCatalogPopup);
                    setShowButtonTemplateForm(false);
                    setShowGenericTemplateForm(false);
                  }}
                  disabled={!isWithin24hWindow}
                  className={cn(
                    "transition-all shrink-0 disabled:opacity-35 hover:scale-105",
                    showProductCatalogPopup ? "text-[#B6B2FF]" : "text-white/60 hover:text-white"
                  )}
                  title="Product Catalog"
                >
                  <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                </button>

                {/* Templates Selector */}
                <button
                  onClick={() => {
                    setShowGenericTemplateForm(!showGenericTemplateForm);
                    setShowButtonTemplateForm(false);
                    setShowProductCatalogPopup(false);
                  }}
                  disabled={!isWithin24hWindow}
                  className={cn(
                    "transition-all shrink-0 disabled:opacity-35 hover:scale-105",
                    showGenericTemplateForm ? "text-[#B6B2FF]" : "text-white/60 hover:text-white"
                  )}
                  title="Image Slider Template"
                >
                  <span className="material-symbols-outlined text-2xl">view_carousel</span>
                </button>

                <button
                  disabled={!isWithin24hWindow}
                  className="text-white/60 hover:text-white transition-opacity shrink-0 disabled:opacity-35"
                >
                  <span className="material-symbols-outlined text-2xl">image</span>
                </button>

                <button
                  onClick={handleSendTextMessage}
                  disabled={sending || !isWithin24hWindow || !inputText.trim()}
                  className="text-[#8FE3FF] hover:text-white font-bold text-[11px] uppercase tracking-wider transition-colors shrink-0 px-2 disabled:opacity-30"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/30 text-xs p-6 gap-2">
            <span className="material-symbols-outlined text-4xl text-white/10 mb-2 animate-pulse">forum</span>
            <span className="font-semibold uppercase tracking-wider text-[10px]">Select a conversation</span>
            <span className="text-white/20">Choose a contact from the sidebar to begin chatting</span>
          </div>
        )}
      </section>

      {/* Right Pane: Contextual Information (Desktop Only) */}
      {showRightPanel && (
        <section className="w-80 border-l border-white/5 bg-white/[0.005] backdrop-blur-md hidden xl:flex flex-col p-6 gap-6 overflow-y-auto shrink-0 relative z-10">
          {selectedConversation ? (
            <>
              {/* User Profile Info Card */}
              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-20 h-20 rounded-full border border-white/10 p-1 mb-4 shadow-[0_0_24px_rgba(255,255,255,0.03)] bg-black/20">
                  <img
                    src={selectedConversation.avatar}
                    alt={selectedConversation.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <h3 className="text-xs font-bold text-white tracking-wide">{selectedConversation.name}</h3>
                <div className="flex gap-2 justify-center mt-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-bold text-white/50 uppercase tracking-widest">Client</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#B6B2FF]/10 border border-[#B6B2FF]/20 text-[8px] font-bold text-[#B6B2FF] uppercase tracking-widest">Active</span>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-4 border-t border-white/5 pt-5">
                <h4 className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                  Conversation Details
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-white/[0.03]">
                    <span className="text-white/45 text-[11px]">Last Active</span>
                    <span className="text-white/90 font-medium text-[11px]">{selectedConversation.time}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-white/45 text-[11px]">24h Window</span>
                    <span className={cn(
                      "font-bold uppercase tracking-wider text-[9px] px-2 py-0.5 rounded",
                      isWithin24hWindow
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    )}>
                      {isWithin24hWindow ? "Open" : "Closed"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interested Items Section */}
              <div className="space-y-4 border-t border-white/5 pt-5 flex-1 flex flex-col min-h-0">
                <h4 className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                  Interested Items
                </h4>

                {loadingEnquiries ? (
                  <div className="text-center py-8 text-xs text-white/30 flex flex-col items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border border-white/20 border-t-white rounded-full"></div>
                    <span className="text-[9px] uppercase tracking-wider">Loading...</span>
                  </div>
                ) : enquiries.length === 0 ? (
                  <div className="text-center py-8 text-xs text-white/20 flex flex-col items-center justify-center gap-1.5 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                    <span className="material-symbols-outlined text-2xl text-white/10">shopping_bag</span>
                    <span className="text-[11px]">No items tracked yet</span>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 flex-1">
                    {enquiries.map((enquiry: any) => (
                      <div key={enquiry.id} className="space-y-2.5">
                        {enquiry.products?.map((ep: any) => {
                          const isSelected = selectedProductsForTemplates.some(p => p.id === ep.product_id);
                          const selectionIndex = selectedProductsForTemplates.findIndex(p => p.id === ep.product_id);

                          return (
                            <div
                              key={ep.enquiry_product_id}
                              onClick={() => handleToggleProductForSend(ep)}
                              className={cn(
                                "group flex gap-3 p-3 rounded-xl border transition-all duration-200 items-start relative cursor-pointer",
                                isSelected
                                  ? "bg-[#B6B2FF]/10 border-[#B6B2FF]/30 shadow-lg"
                                  : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                              )}
                            >
                              {ep.main_media_url ? (
                                <img
                                  src={ep.main_media_url}
                                  className="w-11 h-11 rounded-lg object-cover border border-white/10 shrink-0"
                                  alt={ep.title}
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                                  <span className="material-symbols-outlined text-base text-white/30">shopping_bag</span>
                                </div>
                              )}
                              <div className="min-w-0 flex-1 pr-6">
                                <h5 className="text-[11px] font-semibold text-white truncate leading-tight">
                                  {ep.title}
                                </h5>
                                {ep.price && (
                                  <p className="text-[10px] font-bold text-[#B6B2FF] mt-1">
                                    ₹{ep.price}
                                  </p>
                                )}
                                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${enquiry.status === "OPEN"
                                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                    : enquiry.status === "ACTIVE"
                                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                      : "bg-white/5 text-white/40 border border-white/10"
                                    }`}>
                                    {enquiry.status}
                                  </span>
                                  {ep.confidence_score !== null && (
                                    <span className="px-1.5 py-0.5 rounded bg-[#8FE3FF]/10 text-[#8FE3FF] border border-[#8FE3FF]/20 text-[8px] font-bold uppercase tracking-wider">
                                      {Math.round(ep.confidence_score * 100)}% Match
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Selection Number Badge */}
                              {isSelected && (
                                <span className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#B6B2FF] text-black text-[9px] font-bold shadow-md">
                                  {selectionIndex + 1}
                                </span>
                              )}

                              {/* Delete/Remove Icon */}
                              {!isSelected && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEnquiryProduct(ep.enquiry_product_id);
                                  }}
                                  className="absolute top-2 right-2 w-6 h-6 rounded bg-red-500/10 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                  title="Remove item"
                                >
                                  <span className="material-symbols-outlined text-xs">delete</span>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/20 text-[11px] font-semibold uppercase tracking-widest text-center">
              No conversation selected
            </div>
          )}
        </section>
      )}
    </motion.div>
  );
}
