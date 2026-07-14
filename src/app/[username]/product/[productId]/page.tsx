"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Globe,
  RefreshCw,
  ShoppingBag,
  MessageCircle,
  ShieldCheck,
  Truck,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  X
} from "lucide-react";
import api from "@/lib/services/api.service";
import { getTemplateStyles, TemplateStyle } from "@/components/templates/TemplateProvider";
import { cn } from "@/lib/utils";

const isVideoUrl = (url: string) => {
  if (!url) return false;
  return url.endsWith(".mp4") || url.endsWith(".mov") || url.includes("/video/upload/");
};

interface PageProps {
  params: Promise<{ username: string; productId: string }>;
}

interface SupplierData {
  username: string;
  full_name: string;
  profile_picture_url: string;
}

interface WebsiteSettingsData {
  store_name: string;
  store_logo: string;
  template_id: string;
  theme_id: string;
  show_related_products: boolean;
  enable_instagram_button: boolean;
  enable_whatsapp_button: boolean;
  custom_colors: any;
  custom_fonts: any;
  custom_settings: any;
  cod_enabled?: boolean;
  online_payment_enabled?: boolean;
  return_policy?: string;
  cancellation_policy?: string;
}

interface GalleryMedia {
  id: number;
  media_url: string;
  thumbnail_url: string;
  media_type: string;
  order: number;
}

interface ProductDetail {
  id: number;
  title: string;
  description: string;
  price: string;
  original_price: string;
  currency: string;
  main_media_url: string;
  instagram_permalink: string;
  stock: number;
  is_negotiable: boolean;
  gallery: GalleryMedia[];
  variants: string[];
  category: string;
  metadata?: Record<string, any>;
  cod_enabled?: boolean;
}

interface RelatedProduct {
  id: number;
  title: string;
  price: string;
  currency: string;
  main_media_url: string;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { username, productId } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [settings, setSettings] = useState<WebsiteSettingsData | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);

  // Gallery and options selection states
  const [activeMediaUrl, setActiveMediaUrl] = useState("");
  const [activeMediaType, setActiveMediaType] = useState("IMAGE");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutPincode, setCheckoutPincode] = useState("");
  const [checkoutPlace, setCheckoutPlace] = useState("");
  const [checkoutDistrict, setCheckoutDistrict] = useState("");
  const [checkoutState, setCheckoutState] = useState("");
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState("COD");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => {
    if (product) {
      const favs = JSON.parse(localStorage.getItem("anydm_favorites") || "[]");
      setIsFavorited(favs.includes(product.id));
    }
  }, [product]);

  const toggleFavorite = () => {
    if (!product) return;
    let favs = JSON.parse(localStorage.getItem("anydm_favorites") || "[]");
    if (favs.includes(product.id)) {
      favs = favs.filter((id: number) => id !== product.id);
      setIsFavorited(false);
    } else {
      favs.push(product.id);
      setIsFavorited(true);
    }
    localStorage.setItem("anydm_favorites", JSON.stringify(favs));
  };

  const openCheckout = () => {
    if (isOutOfStock) {
      alert("This product is currently out of stock.");
      return;
    }
    const isCodAvailable = settings?.cod_enabled && product?.cod_enabled;
    const isOnlineAvailable = !!settings?.online_payment_enabled;

    if (isOnlineAvailable && !isCodAvailable) {
      setCheckoutPaymentMethod("RAZORPAY");
    } else if (isCodAvailable) {
      setCheckoutPaymentMethod("COD");
    } else {
      setCheckoutPaymentMethod("COD");
    }
    setIsCheckoutOpen(true);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !username) return;
    if (!checkoutName || !checkoutEmail || !checkoutPhone || !checkoutAddress || !checkoutPincode || !checkoutPlace || !checkoutDistrict || !checkoutState) {
      alert("Please fill in all fields.");
      return;
    }
    setIsSubmittingOrder(true);
    try {
      const res = await api.post("/crm/store/checkout/", {
        username,
        items: [{ product_id: product.id, quantity: quantity, variant: selectedVariant }],
        customer_name: checkoutName,
        customer_email: checkoutEmail,
        customer_phone: checkoutPhone,
        shipping_address: checkoutAddress,
        shipping_pincode: checkoutPincode,
        shipping_place: checkoutPlace,
        shipping_district: checkoutDistrict,
        shipping_state: checkoutState,
        payment_method: checkoutPaymentMethod
      });

      if (checkoutPaymentMethod === "RAZORPAY") {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          alert("Failed to load Razorpay SDK. Check your connection.");
          setIsSubmittingOrder(false);
          return;
        }

        const options = {
          key: res.data.razorpay_key_id,
          amount: res.data.amount,
          currency: res.data.currency,
          name: settings?.store_name || "AnyDm Store",
          description: `Order ${res.data.order_id}`,
          order_id: res.data.razorpay_order_id,
          handler: async (response: any) => {
            setIsSubmittingOrder(true);
            try {
              const verifyRes = await api.post("/crm/store/checkout/confirm-payment/", {
                order_id: res.data.order_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
              if (verifyRes.data && verifyRes.data.order_id) {
                // Save order session in local storage
                const existing = JSON.parse(localStorage.getItem("anydm_customer_orders") || "[]");
                existing.push({
                  order_id: res.data.order_id,
                  tracking_token: res.data.tracking_token,
                  username: username,
                  product_name: product.title,
                  email: checkoutEmail,
                  phone: checkoutPhone,
                  timestamp: new Date().toISOString()
                });
                localStorage.setItem("anydm_customer_orders", JSON.stringify(existing));
                alert("Payment verified and order placed successfully!");
                setIsCheckoutOpen(false);
                router.push(`/track/${res.data.order_id}`);
              }
            } catch (err: any) {
              alert(err.response?.data?.error || "Payment verification failed.");
            } finally {
              setIsSubmittingOrder(false);
            }
          },
          prefill: {
            name: checkoutName,
            email: checkoutEmail,
            contact: checkoutPhone
          },
          theme: {
            color: "#605ca2"
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        if (res.data && res.data.order_id) {
          const existing = JSON.parse(localStorage.getItem("anydm_customer_orders") || "[]");
          existing.push({
            order_id: res.data.order_id,
            tracking_token: res.data.tracking_token,
            username: username,
            product_name: product.title,
            email: checkoutEmail,
            phone: checkoutPhone,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem("anydm_customer_orders", JSON.stringify(existing));
          alert("Order placed successfully!");
          setIsCheckoutOpen(false);
          // Redirect to order tracking page
          router.push(`/track/${res.data.order_id}`);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to place order.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  useEffect(() => {
    if (username && productId) {
      fetchProductDetails();
    }
  }, [username, productId]);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Sora:wght@400;700;800&family=JetBrains+Mono:wght@700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/accounts/public/store/${username}/product/${productId}/`);
      if (response.data) {
        const rawProduct = response.data.product;

        // Normalize variants from response.data.product.variants or metadata.variants
        let parsedVariants: string[] = [];
        if (rawProduct.variants && Array.isArray(rawProduct.variants)) {
          parsedVariants = rawProduct.variants;
        } else if (rawProduct.metadata?.variants) {
          if (typeof rawProduct.metadata.variants === "string") {
            parsedVariants = rawProduct.metadata.variants
              .split(",")
              .map((v: string) => v.trim())
              .filter(Boolean);
          } else if (Array.isArray(rawProduct.metadata.variants)) {
            parsedVariants = rawProduct.metadata.variants;
          }
        }

        // Normalize negotiable / is_negotiable status
        const isNegotiable = rawProduct.negotiable !== undefined ? rawProduct.negotiable : rawProduct.is_negotiable;

        // Normalize main_media_url
        const mainMedia = rawProduct.media_url || rawProduct.main_media_url;

        // Normalize technical metadata — strip 'variants' key so it only appears in the size picker
        const rawMeta: Record<string, any> = rawProduct.metadata && typeof rawProduct.metadata === "object" ? rawProduct.metadata : {};
        const technicalDetails: Record<string, any> = Object.fromEntries(
          Object.entries(rawMeta).filter(([k]) => k !== "variants")
        );

        const normalizedProduct = {
          ...rawProduct,
          main_media_url: mainMedia,
          variants: parsedVariants,
          is_negotiable: isNegotiable,
          metadata: technicalDetails,
        };

        setProduct(normalizedProduct);
        setQuantity(1);
        setSupplier(response.data.supplier);
        setSettings(response.data.settings);

        // Normalize related products
        const normalizedRelated = (response.data.related_products || []).map((rel: any) => ({
          ...rel,
          main_media_url: rel.main_media_url || rel.media_url,
          is_negotiable: rel.negotiable !== undefined ? rel.negotiable : rel.is_negotiable
        }));
        setRelatedProducts(normalizedRelated);

        // Initialize active media with main product image
        setActiveMediaUrl(mainMedia);
        setActiveMediaType(
          normalizedProduct.gallery?.[0]?.media_type ||
          (isVideoUrl(mainMedia) ? "VIDEO" : "IMAGE")
        );

        // Initialize active variant
        if (normalizedProduct.variants && normalizedProduct.variants.length > 0) {
          setSelectedVariant(normalizedProduct.variants[0]);
        }
      }
    } catch (err: any) {
      console.error("Product fetch error:", err);
      setError(err.response?.data?.error || "We couldn't retrieve the product details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col items-center justify-center font-sans">
        <RefreshCw className="w-10 h-10 animate-spin text-white mb-4" />
        <p className="text-sm font-semibold tracking-tight">Loading product details...</p>
      </div>
    );
  }

  if (error || !product || !supplier || !settings) {
    return (
      <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col items-center justify-center px-6 text-center font-sans">
        <h2 className="text-xl font-bold text-white mb-2">Product Not Found</h2>
        <p className="text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">
          {error || "The product you are looking for might have been deleted, sold out, or is currently unavailable."}
        </p>
        <button
          onClick={() => router.push(`/${username}`)}
          className="px-5 py-2.5 bg-white text-black font-bold rounded-lg text-xs hover:bg-[#eaeaea] transition-all"
        >
          View Store Catalog
        </button>
      </div>
    );
  }

  const isOutOfStock = product ? (product.stock <= 0 || product.status === "OUT_OF_STOCK") : true;

  const styles: TemplateStyle = getTemplateStyles(settings.template_id, settings.theme_id);
  const isLight = styles.textColorClass === "text-black" || styles.textColorClass === "text-[#1c1c1c]" || styles.textColorClass === "text-[#2D362E]";

  // Generate Social Buttons URLs
  const currentUrl = typeof window !== 'undefined' ? window.location.href : "";
  const whatsappNumber = settings.custom_settings?.whatsapp_number || ""; // e.g. "96512345678"
  const whatsappMessage = encodeURIComponent(
    `Hi! I'm interested in purchasing your product: "${product.title}" (${product.price} ${product.currency}) from your storefront.\nLink: ${currentUrl}`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  // Helper renderers for different Stitch PDP layouts
  const renderOrganicMinimalist = () => {
    return (
      <div className="max-w-screen-2xl mx-auto px-8 md:px-16 pb-24 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
          {/* Gallery (7 Columns) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="aspect-[4/5] w-full bg-[#E8F0E9]/30 overflow-hidden">
              {activeMediaType === "VIDEO" ? (
                <video src={activeMediaUrl} controls autoPlay muted loop className="w-full h-full object-cover" />
              ) : (
                <img src={activeMediaUrl} alt={product.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="aspect-square bg-white overflow-hidden">
                {product.gallery && product.gallery.length > 1 ? (
                  <button
                    onClick={() => {
                      const sec = product.gallery[1];
                      setActiveMediaUrl(sec.media_url);
                      setActiveMediaType(sec.media_type);
                    }}
                    className="w-full h-full overflow-hidden cursor-pointer"
                  >
                    <img src={product.gallery[1].thumbnail_url || product.gallery[1].media_url} alt="Detail" className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                  </button>
                ) : (
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7qN_9IgWNtA0w6f8sD73RlNKRzIZs9EZRtuCfBoPadJ-v8WB6iDx6BuFJLJvFzUMS1mDruzDPHRU4h2h9F9JQubW7lNay2GtE07KCCV8NgIiH3nS5nuP7SjOQEU-NKR8dcMyf5cGUKZyTwNA4-sNFkmHG-X4CeMXgMUJ8dvNP1vUpaNi5FA5orlqvWhQzr71qNM0wdho8hiQ6SaPyPiLuygIm3_H1wuY6Cvs6GYi-xQtg9cwAMZ9ffcB4uPwkFu2fUgLoEYLE4ro" alt="Artisan details" className="w-full h-full object-cover grayscale" />
                )}
              </div>
              <div className="aspect-square bg-[#F2EFE9] flex items-center justify-center p-8">
                <p className="font-serif text-[#4A5D4E] italic text-center text-sm md:text-base leading-relaxed">
                  "Crafted for the conscious soul."
                </p>
              </div>
            </div>
          </div>

          {/* Details (5 Columns) */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-10">
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-[0.2em] font-semibold text-[#4A5D4E] uppercase">Limited Edition</span>
                <div className="h-px flex-1 bg-[#C2C9C3]/40"></div>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif text-[#2D362E] leading-tight font-bold">
                {product.title}
              </h1>
              <p className="text-2xl font-serif font-medium text-[#4A5D4E]">
                {product.price} {product.currency}
              </p>
            </section>

            <section className="space-y-6">
              <p className="text-sm md:text-base text-[#6A786C] leading-relaxed">
                {product.description || "A sculptural masterpiece of textile design. Hand-tailored and finished with premium organic details. Designed to age with grace and intent."}
              </p>

              {product.variants && product.variants.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#2D362E] block">Select Size</span>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v}
                        onClick={() => setSelectedVariant(v)}
                        className={cn(
                          "px-4 py-2 text-xs font-semibold rounded-none border transition-all",
                          selectedVariant === v
                            ? "bg-[#4A5D4E] text-white border-[#4A5D4E]"
                            : "bg-transparent text-[#2D362E] border-[#C2C9C3] hover:border-[#4A5D4E]"
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.metadata && typeof product.metadata === "object" && Object.keys(product.metadata).length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#C2C9C3]/40">
                  <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#2D362E] block">Specifications</span>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(product.metadata).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <span className="block text-[9px] uppercase tracking-wider text-[#6A786C]">{key}</span>
                        <span className="block text-xs font-semibold text-[#2D362E]">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-4">
              {/* Store Policies */}
              <div className="pt-2 border-t border-[#C2C9C3]/40 space-y-3 text-[#2D362E]">
                <span className="text-[9px] uppercase tracking-[0.15em] font-semibold text-[#6A786C] block">Store Policies</span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#6A786C]">Returns &amp; Exchanges</span>
                    <span className="font-semibold">{settings?.return_policy ? "Accepted" : "Not Accepted"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6A786C]">Cancellations</span>
                    <span className="font-semibold">{settings?.cancellation_policy ? "Allowed" : "Not Allowed"}</span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="flex items-center justify-between py-3 border-t border-[#C2C9C3]/40">
                  <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#2D362E]">Quantity</span>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className={cn("w-8 h-8 border flex items-center justify-center font-bold text-sm transition-all",
                        quantity <= 1 ? "opacity-30 cursor-not-allowed border-[#C2C9C3] text-[#6A786C]" : "border-[#4A5D4E] text-[#4A5D4E] hover:bg-[#4A5D4E]/5")}
                    >-</button>
                    <span className="w-6 text-center text-sm font-black text-[#2D362E]">{quantity}</span>
                    <button
                      type="button"
                      disabled={quantity >= product.stock}
                      onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                      className={cn("w-8 h-8 border flex items-center justify-center font-bold text-sm transition-all",
                        quantity >= product.stock ? "opacity-30 cursor-not-allowed border-[#C2C9C3] text-[#6A786C]" : "border-[#4A5D4E] text-[#4A5D4E] hover:bg-[#4A5D4E]/5")}
                    >+</button>
                  </div>
                </div>
              )}

              {/* Buy Now */}
              <button
                onClick={openCheckout}
                disabled={isOutOfStock}
                className={cn("w-full flex items-center justify-center py-5 font-bold text-xs tracking-widest uppercase rounded-none transition-all",
                  isOutOfStock
                    ? "bg-[#C2C9C3]/40 text-[#6A786C] cursor-not-allowed"
                    : "bg-[#4A5D4E] text-white hover:bg-[#4A5D4E]/90")}
              >
                <ShoppingBag className="w-4 h-4 mr-2 shrink-0" />
                <span>{isOutOfStock ? "Out of Stock" : "Buy Now / Checkout"}</span>
              </button>

              {settings.enable_instagram_button && product.instagram_permalink && !isOutOfStock && (
                <a
                  href={product.instagram_permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center py-5 bg-gradient-to-r from-orange-400 via-red-400 to-pink-500 text-white font-bold text-xs tracking-widest uppercase rounded-none hover:opacity-90 transition-all shadow-sm"
                >
                  Acquire on Instagram
                </a>
              )}

              <div className="grid grid-cols-2 gap-4">
                {settings.enable_whatsapp_button && !isOutOfStock && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-4 border border-[#25D366]/40 text-[#2D362E] font-medium text-xs rounded-none hover:bg-[#25D366]/5 transition-colors uppercase tracking-widest"
                  >
                    WhatsApp
                  </a>
                )}
                {product.instagram_permalink && !isOutOfStock && (
                  <a
                    href={product.instagram_permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-4 border border-[#E1306C]/40 text-[#2D362E] font-medium text-xs rounded-none hover:bg-[#E1306C]/5 transition-colors uppercase tracking-widest"
                  >
                    Instagram
                  </a>
                )}
              </div>
            </section>

            <div className="pt-8 border-t border-[#C2C9C3]/40 grid grid-cols-2 gap-6 text-[#2D362E]">
              <div className="space-y-1">
                <span className="block text-[9px] uppercase tracking-wider text-[#6A786C]">Origin</span>
                <span className="block text-xs font-semibold">Conscious Atelier</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[9px] uppercase tracking-wider text-[#6A786C]">Material</span>
                <span className="block text-xs font-semibold">{product.category || "Organic Blend"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Artisan Story Section */}
        <section className="mt-32 py-24 border-y border-[#C2C9C3]/40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-8">
              <span className="text-[10px] tracking-[0.2em] font-semibold text-[#4A5D4E] uppercase">Artisan Story</span>
              <h2 className="text-3xl md:text-4xl font-serif text-[#2D362E] leading-tight font-bold">Preserving the <br />Human Touch.</h2>
              <p className="text-sm md:text-base text-[#6A786C] leading-relaxed max-w-lg">
                Every stitch is placed with conscious intent in our artisan workshop. We believe that clothing should carry the energy of its creator, resulting in a garment that feels alive and sustainable.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-[16/10] bg-[#E8F0E9]/30 overflow-hidden border border-[#C2C9C3]/40">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBofp66CgBbw0rukcrAg05l2HrLdP4unVCP_IPQsqOOi6mSteQiRWGZgASEaoGTo4PVi0L22m3toOt8sNBWFMcymwTpGxKNUXRzar9I266IXQMEo3abij9Y3BFwq8EVnh9S4nEk5P9A-GDctbvmy7rjp2249w_C3dsZdG44H0VQBmp-gKMDX9n5pLpO32PKF7O-8Fu5xNT0YgQPM-mx9RcrtQlEOOXgYFsG9qTW1cYGARN6XqmY7mWP4PdWtchTNwnaSAllWMISXVw" alt="Artisan Hands" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-[#4A5D4E] p-6 hidden md:block text-white">
                <p className="text-[9px] uppercase tracking-wider leading-relaxed">
                  ESTIMATED PRODUCTION TIME: 14 DAYS PER GARMENT.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sustainability Notes */}
        <section className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 text-[#2D362E]">
          <div className="space-y-4">
            <div className="w-8 h-8 rounded-full bg-[#4A5D4E]/10 flex items-center justify-center text-[#4A5D4E]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-bold">Zero Waste</h3>
            <p className="text-xs text-[#6A786C] leading-relaxed">Pattern cutting optimized to leave less than 2% fabric waste. Excess is repurposed into packaging.</p>
          </div>
          <div className="space-y-4">
            <div className="w-8 h-8 rounded-full bg-[#4A5D4E]/10 flex items-center justify-center text-[#4A5D4E]">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-bold">Low Impact</h3>
            <p className="text-xs text-[#6A786C] leading-relaxed">Our materials are rain-fed, requiring minimal irrigation and zero harsh chemicals or synthetic dyes.</p>
          </div>
          <div className="space-y-4">
            <div className="w-8 h-8 rounded-full bg-[#4A5D4E]/10 flex items-center justify-center text-[#4A5D4E]">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-bold">Carbon Neutral</h3>
            <p className="text-xs text-[#6A786C] leading-relaxed">Shipping offsets included in every single acquisition. We utilize plastic-free, compostable mailers.</p>
          </div>
        </section>
      </div>
    );
  };

  const renderCyberNeon = () => {
    return (
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 mt-8 text-[#e2e2e2] font-mono">
        {/* Left Column (7 Columns) */}
        <section className="md:col-span-7 flex flex-col gap-4">
          <div className="aspect-[4/5] bg-[#0d0e0f] overflow-hidden relative border border-[#3b494b] group">
            {activeMediaType === "VIDEO" ? (
              <video src={activeMediaUrl} controls autoPlay muted loop className="w-full h-full object-cover" />
            ) : (
              <img src={activeMediaUrl} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            )}
            <div className="absolute top-4 left-4 bg-[#00f0ff]/10 backdrop-blur-md border border-[#00f0ff]/40 px-3 py-1">
              <span className="font-mono text-[10px] tracking-widest text-[#00f0ff]">COLLECTION_024</span>
            </div>
          </div>

          {product.gallery && product.gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.gallery.slice(0, 4).map((media) => (
                <button
                  key={media.id}
                  onClick={() => {
                    setActiveMediaUrl(media.media_url);
                    setActiveMediaType(media.media_type);
                  }}
                  className={cn(
                    "aspect-square bg-[#1a1c1c] border overflow-hidden cursor-pointer",
                    activeMediaUrl === media.media_url ? "border-[#00f0ff]" : "border-[#3b494b]/40"
                  )}
                >
                  <img src={media.thumbnail_url || media.media_url} alt="Thumb" className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Right Column (5 Columns) */}
        <section className="md:col-span-5 flex flex-col gap-6 sticky top-24 h-fit">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] tracking-widest text-[#ff24e4] uppercase">Limited Release / Series 01</span>
            <h1 className="font-bold text-3xl md:text-4xl tracking-tight uppercase text-[#dbfcff] font-sans">
              {product.title}
            </h1>
            <p className="font-mono text-xl text-[#00f0ff]">{product.price} {product.currency}</p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#b9cacb] leading-relaxed">
              {product.description || "Engineered for the urban vanguard. Featuring reactive fiber integration and ultra-matte technical fabrics."}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 border border-[#00f0ff]/40 text-[#00f0ff] font-mono text-[9px] uppercase">WATERPROOF</span>
              <span className="px-3 py-1 border border-[#ff24e4]/40 text-[#ff24e4] font-mono text-[9px] uppercase">THERMAL-TECH</span>
              <span className="px-3 py-1 border border-white/20 text-white font-mono text-[9px] uppercase">REACTIVE_GLOW</span>
            </div>
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className="flex flex-col gap-3 font-mono">
              <span className="text-[10px] text-[#b9cacb] uppercase tracking-widest">SELECT SIZE [EUR]</span>
              <div className="grid grid-cols-4 gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVariant(v)}
                    className={cn(
                      "py-3 border text-xs font-mono transition-all rounded-none",
                      selectedVariant === v
                        ? "border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/5"
                        : "border-white/10 hover:border-white/40 text-white"
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Store Policies */}
          <div className="flex flex-col gap-2 font-mono pt-2 border-t border-white/5">
            <span className="text-[10px] text-[#b9cacb] uppercase tracking-widest">STORE POLICIES</span>
            <div className="flex justify-between text-xs">
              <span className="text-[#b9cacb]">Returns &amp; Exchanges</span>
              <span className={settings?.return_policy ? "text-[#00f0ff]" : "text-red-400"}>{settings?.return_policy ? "Accepted" : "Not Accepted"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#b9cacb]">Cancellations</span>
              <span className={settings?.cancellation_policy ? "text-[#00f0ff]" : "text-red-400"}>{settings?.cancellation_policy ? "Allowed" : "Not Allowed"}</span>
            </div>
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="flex items-center justify-between py-3 border-t border-white/5">
              <span className="font-mono text-[10px] text-[#b9cacb] uppercase tracking-widest">QUANTITY</span>
              <div className="flex items-center gap-4">
                <button type="button" disabled={quantity <= 1}
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className={cn("w-8 h-8 border font-mono font-bold text-sm transition-all flex items-center justify-center",
                    quantity <= 1 ? "opacity-30 cursor-not-allowed border-white/10 text-zinc-600" : "border-[#00f0ff]/40 text-[#00f0ff] hover:bg-[#00f0ff]/5")}>
                  -
                </button>
                <span className="w-6 text-center font-mono font-black text-white text-sm">{quantity}</span>
                <button type="button" disabled={quantity >= product.stock}
                  onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                  className={cn("w-8 h-8 border font-mono font-bold text-sm transition-all flex items-center justify-center",
                    quantity >= product.stock ? "opacity-30 cursor-not-allowed border-white/10 text-zinc-600" : "border-[#00f0ff]/40 text-[#00f0ff] hover:bg-[#00f0ff]/5")}>
                  +
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
            {/* Primary Buy Button */}
            <button
              onClick={openCheckout}
              disabled={isOutOfStock}
              className={cn("w-full py-4 text-center font-bold uppercase tracking-widest text-xs rounded-none active:scale-95 transition-transform flex items-center justify-center gap-2",
                isOutOfStock
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60"
                  : "bg-[#00f0ff] text-black hover:shadow-[0_0_15px_rgba(0,240,255,0.5)]")}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>{isOutOfStock ? "OUT OF STOCK" : "BUY NOW / CHECKOUT"}</span>
            </button>

            {settings.enable_instagram_button && product.instagram_permalink && !isOutOfStock && (
              <a
                href={product.instagram_permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 text-center bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white font-bold uppercase tracking-widest text-xs rounded-none active:scale-95 transition-transform hover:shadow-[0_0_15px_rgba(255,36,228,0.5)]"
              >
                Buy on Instagram
              </a>
            )}

            {settings.enable_whatsapp_button && !isOutOfStock && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 text-center bg-[#25D366] text-black font-bold uppercase tracking-widest text-xs rounded-none active:scale-95 transition-transform hover:shadow-[0_0_15px_rgba(37,211,102,0.5)]"
              >
                Order via WhatsApp
              </a>
            )}
          </div>

          {/* Specifications Table */}
          <div className="bg-[#1a1c1c] p-6 border border-white/5 rounded-none font-mono">
            <h3 className="text-[10px] tracking-widest text-[#00f0ff] mb-4 border-b border-[#00f0ff]/20 pb-2 uppercase font-bold">PRODUCT SPECIFICATIONS</h3>
            <ul className="flex flex-col gap-3 text-xs text-[#b9cacb]">
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span>CATEGORY</span>
                <span className="text-white">{product.category || "UNASSIGNED"}</span>
              </li>
              {product.metadata && typeof product.metadata === "object" && Object.entries(product.metadata).map(([key, value], idx, arr) => (
                <li key={key} className={cn("flex justify-between pb-2", idx < arr.length - 1 && "border-b border-white/5")}>
                  <span className="uppercase">{key}</span>
                  <span className="text-white">{String(value)}</span>
                </li>
              ))}
              {(!product.metadata || Object.keys(product.metadata).length === 0) && (
                <>
                  <li className="flex justify-between border-b border-white/5 pb-2">
                    <span>MATERIAL</span>
                    <span className="text-white">{product.category || "SYNTH-FLEECE V2.0"}</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-2">
                    <span>HARDWARE</span>
                    <span className="text-white">YKK AQUAGUARD</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-2">
                    <span>OPTICS</span>
                    <span className="text-white">360° REACTIVE FIBER</span>
                  </li>
                  <li className="flex justify-between">
                    <span>ORIGIN</span>
                    <span className="text-white">NEO-TOKYO FACILITY</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </section>
      </div>
    );
  };

  const renderImmersiveGlass = () => {
    return (
      <div className="flex flex-col md:flex-row h-screen md:h-[calc(100vh-64px)] overflow-hidden w-full text-white bg-transparent">
        {/* Left Side: Product Reel Player (50% Width) */}
        <section className="w-full md:w-1/2 h-[50vh] md:h-full relative group shrink-0">
          <div className="absolute inset-0 bg-[#0e0e0e] overflow-hidden">
            {activeMediaType === "VIDEO" ? (
              <video src={activeMediaUrl} controls autoPlay muted loop className="w-full h-full object-cover" />
            ) : (
              <img src={activeMediaUrl} alt={product.title} className="w-full h-full object-cover" />
            )}

            {/* Social action buttons overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex flex-col gap-4 self-end mb-8 items-center">
                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all">
                  <span className="text-white text-xs font-bold">♥</span>
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all">
                  <span className="text-white text-xs font-bold">💬</span>
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all">
                  <span className="text-white text-xs font-bold">↗</span>
                </button>
              </div>
            </div>

            {/* Reel Progress Bar */}
            <div className="absolute top-4 left-4 right-4 h-1 flex gap-1 z-10">
              <div className="h-full w-1/3 bg-white rounded-full"></div>
              <div className="h-full w-1/3 bg-white/30 rounded-full"></div>
              <div className="h-full w-1/3 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Right Side: Scrollable Glassmorphic Panel (50% Width) */}
        <section className="w-full md:w-1/2 h-[50vh] md:h-full overflow-y-auto custom-scrollbar bg-black/20 backdrop-blur-xl border-t md:border-t-0 md:border-l border-white/10 px-6 md:px-12 py-8 md:py-12 flex flex-col justify-between">
          <div className="max-w-xl mx-auto w-full space-y-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 tracking-[0.2em] uppercase font-bold">{product.category || "Apparel"}</span>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{product.title}</h1>
              <p className="text-lg font-bold text-gray-200">{product.price} {product.currency}</p>
            </div>

            <div className="space-y-4">
              <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                {product.description || "Crafted from signature premium materials. Dropped silhouette fits and structured comfort details."}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 border border-black flex items-center justify-center text-[8px] font-bold text-white">U1</div>
                  <div className="w-6 h-6 rounded-full bg-pink-500 border border-black flex items-center justify-center text-[8px] font-bold text-white">U2</div>
                  <div className="w-6 h-6 rounded-full bg-emerald-500 border border-black flex items-center justify-center text-[8px] font-bold text-white">U3</div>
                </div>
                <span className="text-[10px] text-gray-400">2.4k others recently purchased</span>
              </div>
            </div>

            {/* Color/Theme Picker mockup */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-300 block">Colors</span>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full border-2 border-white bg-black"></button>
                <button className="w-8 h-8 rounded-full border border-white/20 bg-zinc-700"></button>
              </div>
            </div>

            {/* Size options */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-300 block">Select Size</span>
                <div className="grid grid-cols-4 gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v}
                      onClick={() => setSelectedVariant(v)}
                      className={cn(
                        "h-10 border rounded-lg text-xs font-bold flex items-center justify-center transition-colors",
                        selectedVariant === v
                          ? "border-white bg-white/10"
                          : "border-white/10 hover:bg-white/5"
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Store Policies */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-gray-300 block">Store Policies</span>
              <div className="flex justify-between p-2 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-gray-400">Returns &amp; Exchanges</span>
                <span className={settings?.return_policy ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                  {settings?.return_policy ? "Accepted" : "Not Accepted"}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-gray-400">Cancellations</span>
                <span className={settings?.cancellation_policy ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                  {settings?.cancellation_policy ? "Allowed" : "Not Allowed"}
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center justify-between py-3 border-t border-white/10">
                <span className="text-[10px] uppercase font-bold text-gray-300">Quantity</span>
                <div className="flex items-center gap-4">
                  <button type="button" disabled={quantity <= 1}
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className={cn("w-8 h-8 rounded-full border text-sm font-bold flex items-center justify-center transition-all",
                      quantity <= 1 ? "opacity-30 cursor-not-allowed border-white/10" : "border-white/20 text-white hover:bg-white/10")}>
                    -
                  </button>
                  <span className="w-6 text-center font-black text-white text-sm">{quantity}</span>
                  <button type="button" disabled={quantity >= product.stock}
                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    className={cn("w-8 h-8 rounded-full border text-sm font-bold flex items-center justify-center transition-all",
                      quantity >= product.stock ? "opacity-30 cursor-not-allowed border-white/10" : "border-white/20 text-white hover:bg-white/10")}>
                    +
                  </button>
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="space-y-3 pt-4">
              <button
                onClick={openCheckout}
                disabled={isOutOfStock}
                className={cn("w-full h-12 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all",
                  isOutOfStock
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60"
                    : "bg-white text-black hover:opacity-90 active:scale-95 shadow-md")}
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>{isOutOfStock ? "Out of Stock" : "Buy Now / Checkout"}</span>
              </button>
              {settings.enable_instagram_button && product.instagram_permalink && !isOutOfStock && (
                <a
                  href={product.instagram_permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:opacity-90 active:scale-95 transition-all shadow-md"
                >
                  Buy on Instagram
                </a>
              )}
              {settings.enable_whatsapp_button && !isOutOfStock && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 bg-[#25D366] text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold hover:opacity-95 active:scale-95 transition-all shadow-md"
                >
                  Order via WhatsApp
                </a>
              )}
            </div>

            {product.metadata && typeof product.metadata === "object" && Object.keys(product.metadata).length > 0 && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-300 block">Specifications</span>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  {Object.entries(product.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-gray-400 uppercase text-[10px]">{key}</span>
                      <span className="text-white font-semibold">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Peek box */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-yellow-400">★ 4.9 (128 Reviews)</span>
              </div>
              <p className="text-[11px] italic text-gray-400">
                "The quality is insane. The fit is perfect and the fabric feels like luxury brands costing 10x more."
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  };

  const renderMinimalistEditorial = () => {
    const galleryItems: { media_url: string; media_type: string }[] = [];
    if (product.main_media_url) {
      galleryItems.push({ media_url: product.main_media_url, media_type: "IMAGE" });
    }
    if (product.gallery && product.gallery.length > 0) {
      product.gallery.forEach(m => {
        if (m.media_url !== product.main_media_url) {
          galleryItems.push({ media_url: m.media_url, media_type: m.media_type });
        }
      });
    }
    const placeholders = [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBGTBk2k7ZbmX9Efzc5iX3aKNolca7s6G-T79uYIskv6jWSZSd9pHvzQINKUaDGy8zD7zTqkXqqo4C0jy1G-p8R0sYLRYMIOVJvJaW_iBUtxV2ud8iPRAE9iE-7ljXIU2R3pAMQuh67o80g3lCraGOPijqJuXIGapcfNUmEBKxNLqMoR_8ITS5pSaEaAii1rD2vcFDJkyWiIhhK-iyNz37K8BRbRO33QaonMh6aQFtUdBcYp8Y5VKpGxW0vMyJLzemB59nZMGSnEvc",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA0LTRvnN0HcYQNP8HKizmM3xpE1K8km9g8FsA-SGR58uQyzawW6Q_-j0303nDi1XFiUkEjkufkVSroiCqquDurmeyV-Tf_D3ec-FBNkZYfpi6j8DIcaaY3uMhu6uaHpeLF5Q1TQmDAhCWoSTrJxutfyv2_lwnjpnKZzDC-oPG40B6LNIW-W8PMUmWa7hxo6M2c5n8z_E4Xn3HUiJ9cxUbO27_NFZ8VrB9npcy0M9C4SkVZBiNEAVOn145oFkT7SHX5Q48Y68DJjQc",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDELKSIsorntj6lYD-Gzwe7UIcxeDQ0wy70Os1kdWvb7plJ5O4xvkfUVQczxEl2UZuuqcBEZgIFuLJ6LA8fdDGzV6DzcaHQaY0_ms9rBxWZV0pVvyHzuZ0mAYGHhXEf4Bt_iNrUJ4bp9XYBpNKxflyilVCN-sXFgUHqBe26Yz7OcRLRQEZWHTx-QPa3Se9B7eMa9rP3rYTRZkcbT1enqt3bUNlsUD_PN9lzrkvWA4PKxrwuDByJAaeXChEX4rOgOcqKYgvyv_ffUw8"
    ];
    let phIdx = 0;
    while (galleryItems.length < 4 && phIdx < placeholders.length) {
      galleryItems.push({ media_url: placeholders[phIdx], media_type: "IMAGE" });
      phIdx++;
    }

    return (
      <div className="max-w-[1440px] mx-auto px-6 py-12 text-[#1c1c1c] dark:text-[#eaeaea] font-sans">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          {/* Masonry Product Gallery (2/3 width on desktop) */}
          <section className="w-full lg:w-2/3 columns-1 md:columns-2 gap-6 space-y-6">
            {galleryItems.map((item, index) => (
              <div key={index} className="break-inside-avoid mb-6 overflow-hidden rounded-lg group">
                {item.media_type === "VIDEO" ? (
                  <video src={item.media_url} controls className="w-full h-auto object-cover rounded-lg filter grayscale hover:grayscale-0 transition-all duration-700" />
                ) : (
                  <img src={item.media_url} alt={`${product.title} view ${index + 1}`} className="w-full h-auto object-cover rounded-lg filter grayscale hover:grayscale-0 transition-all duration-700" />
                )}
              </div>
            ))}
          </section>

          {/* Product Details Column (1/3 width on desktop) */}
          <aside className="w-full lg:w-1/3 lg:sticky lg:top-32 flex flex-col gap-8">
            <header className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-400">
                COLLECTION 04 — {product.category || "STORE CATALOG"}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light tracking-wide text-zinc-900 dark:text-white leading-none mt-1">
                {product.title}
              </h1>
              <p className="font-serif text-xl italic text-zinc-500 dark:text-zinc-400 mt-2">
                {product.price} {product.currency}
              </p>
            </header>

            {/* Colors Section */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">COLOR: NOIR OBSIDIEN</span>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full border border-black dark:border-white bg-[#0e0e0e] flex items-center justify-center cursor-pointer">
                  <div className="w-6 h-6 rounded-full bg-[#1c1b1b]"></div>
                </div>
                <div className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-800 bg-transparent flex items-center justify-center cursor-pointer hover:border-black dark:hover:border-white transition-colors">
                  <div className="w-6 h-6 rounded-full bg-[#353535]"></div>
                </div>
              </div>
            </div>

            {/* Sizes Section */}
            {product.variants && product.variants.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">SIZE</span>
                  <span className="text-[10px] text-zinc-400 underline cursor-pointer hover:text-black dark:hover:text-white">SIZE GUIDE</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {product.variants.map((v) => {
                    const isActive = selectedVariant === v;
                    return (
                      <button
                        key={v}
                        onClick={() => setSelectedVariant(v)}
                        className={cn(
                          "py-3 border text-xs font-semibold transition-all rounded-none",
                          isActive
                            ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                            : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-black dark:hover:border-white"
                        )}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Store Policies */}
            <div className="flex flex-col gap-2">
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 space-y-2 text-xs">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block">Store Policies</span>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Returns &amp; Exchanges</span>
                  <span className={settings?.return_policy ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-red-500 font-semibold"}>
                    {settings?.return_policy ? "Accepted" : "Not Accepted"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Cancellations</span>
                  <span className={settings?.cancellation_policy ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-red-500 font-semibold"}>
                    {settings?.cancellation_policy ? "Allowed" : "Not Allowed"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center justify-between py-3 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Quantity</span>
                <div className="flex items-center gap-4">
                  <button type="button" disabled={quantity <= 1}
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className={cn("w-8 h-8 border rounded font-bold text-sm flex items-center justify-center transition-all",
                      quantity <= 1
                        ? "opacity-30 cursor-not-allowed border-zinc-200 dark:border-zinc-800 text-zinc-400"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white")}>
                    -
                  </button>
                  <span className="w-6 text-center font-black text-sm text-zinc-900 dark:text-white">{quantity}</span>
                  <button type="button" disabled={quantity >= product.stock}
                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    className={cn("w-8 h-8 border rounded font-bold text-sm flex items-center justify-center transition-all",
                      quantity >= product.stock
                        ? "opacity-30 cursor-not-allowed border-zinc-200 dark:border-zinc-800 text-zinc-400"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white")}>
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Purchase / Enquire CTAs */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={openCheckout}
                disabled={isOutOfStock}
                className={cn("w-full h-14 font-semibold text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                  isOutOfStock
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                    : "bg-black dark:bg-white text-white dark:text-black hover:opacity-90")}
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>{isOutOfStock ? "OUT OF STOCK" : "BUY NOW / CHECKOUT"}</span>
              </button>
              {settings.enable_instagram_button && product.instagram_permalink && !isOutOfStock && (
                <a
                  href={product.instagram_permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-14 bg-black dark:bg-white text-white dark:text-black font-semibold text-xs tracking-widest uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  <span>PURCHASE ON INSTAGRAM</span>
                </a>
              )}
              {settings.enable_whatsapp_button && !isOutOfStock && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-14 border border-zinc-300 dark:border-zinc-800 flex items-center justify-center gap-2 rounded-none hover:border-black dark:hover:border-white transition-all text-xs font-semibold tracking-widest uppercase text-zinc-800 dark:text-zinc-200"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>ENQUIRE VIA WHATSAPP</span>
                </a>
              )}
            </div>

            {/* Accordion Details */}
            <div className="border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl flex flex-col gap-4 bg-white/[0.01] dark:bg-white/[0.02] backdrop-blur-md">
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                {product.description || "A masterclass in modern tailoring. This floor-sweeping gown features asymmetrical architectural draping that captures the light as you move. Crafted from our signature heavy-weight silk crepe, it offers a structural silhouette with the fluid breathability of a second skin."}
              </p>

              {/* Accordion 1: Specifications (from real metadata) */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                  className="w-full flex justify-between items-center text-xs font-bold tracking-wider py-1 uppercase text-zinc-800 dark:text-zinc-200 hover:opacity-85 transition-opacity"
                >
                  <span>DETAILS &amp; CARE</span>
                  <ChevronRight className={cn("w-4 h-4 transition-transform duration-200", isDetailsOpen && "rotate-90")} />
                </button>
                {isDetailsOpen && (
                  <div className="pt-2 text-xs text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed space-y-2">
                    {product.metadata && typeof product.metadata === "object" && Object.keys(product.metadata).length > 0 ? (
                      <ul className="space-y-1">
                        {Object.entries(product.metadata).map(([key, value]) => (
                          <li key={key} className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-1">
                            <span className="uppercase text-[10px] tracking-wider font-semibold">{key}</span>
                            <span className="text-zinc-800 dark:text-zinc-200 font-medium">{String(value)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Premium quality materials</li>
                        <li>Category: {product.category || "General"}</li>
                        <li>Stock: {product.stock || "Available"}</li>
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 2 */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setIsShippingOpen(!isShippingOpen)}
                  className="w-full flex justify-between items-center text-xs font-bold tracking-wider py-1 uppercase text-zinc-800 dark:text-zinc-200 hover:opacity-85 transition-opacity"
                >
                  <span>SHIPPING &amp; RETURNS</span>
                  <ChevronRight className={cn("w-4 h-4 transition-transform duration-200", isShippingOpen && "rotate-90")} />
                </button>
                {isShippingOpen && (
                  <div className="pt-2 text-xs text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed">
                    Complimentary global shipping on all orders over $1,500. Returns accepted within 14 days of delivery.
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* Visual Divider */}
        <div className="max-w-[1440px] mx-auto py-16">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-800 to-transparent"></div>
        </div>

        {/* Related Editorial Content */}
        <section className="max-w-[1440px] mx-auto pb-12">
          <h2 className="font-serif text-2xl lg:text-3xl mb-8 text-zinc-900 dark:text-white tracking-tight">The Visual Journal</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4">
              <div className="aspect-[4/3] overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <img className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFTIXhVoBWnH3gZkdu6mCyPUFsi0c1jPcpyW2fk-8cc_HMdUH7y-pFwwS22w98V1okKoVnTfXmMayzm-ryENPECLEz8RvnB-KsSJIJG5SjMdjtT25Yd3SOxs8sp35R7mwBR-R60z5AMqYUkKpBanRC_EAVgxivYnDrKsuf8o8wJnfqQ9K5Je6ni-i3xZJTw7eNjKtYjwJAjqCgQhC3PmR-8l9QomTeLI8MUAvRYDKLF5W_ywze6XzwCOECg3BGQxG3X1_4CORL6FI" alt="The Weight of Light" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] tracking-wider text-zinc-400 font-semibold font-mono">STORY 01</span>
                <h3 className="font-serif text-lg text-zinc-800 dark:text-zinc-200 leading-tight">The Weight of Light</h3>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="aspect-[4/3] overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <img className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOuWWGyHN44xAaULJm3WcdlaGU6D9Z2Uo6zYfr8ypO_j0LpHb88ZBJ6jz39VWTS7PJUC_m6YqmgbLIavjvfvez6gG60sxyUOEVfAEbVu07fh7y_5V2QfkzL29SK115uObVCKwwUOuopwMh-h801j_kioldm1ksbpQvCwdAtaIzZRf9t2gzXpT9i2r783gPLHrQXNEzA-jgDpgEFP1Fr5jZOt_xf7I_N-wuTvuD0VS0WnmAxajvDb2Dn7ebiF6alFYIHp2bm4eZLBc" alt="Structured Serenity" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] tracking-wider text-zinc-400 font-semibold font-mono">STORY 02</span>
                <h3 className="font-serif text-lg text-zinc-800 dark:text-zinc-200 leading-tight">Structured Serenity</h3>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="aspect-[4/3] overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <img className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5qNKM0GQVfxNQRktaoDrnMRkwEuw3rDG59ZLWV_PZlPX3KRo6YAl76SRkX1RNTDQQU8ys99CnK3wjPOpOK93w-1Eqn_70KiOgPg73hFICGX49yA2sVv4NL0qG90e6gM7ctOiR8K_zukDNkUkd7xNqi1aSCHS_mD2ZiOK5IrmAetwvHF-i6dOibiLv343lr4QhCmSCjQTY3UgSDPQD8OJi1bfSs0F6hZ5m83TLnU08N-dHJIy3EQuemeU1JmwIvtR_GNVMlfEgKYU" alt="The Ritual of Ease" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] tracking-wider text-zinc-400 font-semibold font-mono">STORY 03</span>
                <h3 className="font-serif text-lg text-zinc-800 dark:text-zinc-200 leading-tight">The Ritual of Ease</h3>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };

  const renderNeoBrutalist = () => {
    return (
      <div className="max-w-7xl mx-auto px-6 pb-24 mt-8 text-black">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Visuals (7 Columns) */}
          <section className="lg:col-span-7 space-y-6">
            {/* Main Media Player */}
            <div className="relative aspect-[4/5] md:aspect-video w-full bg-zinc-100 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden group">
              {activeMediaType === "VIDEO" ? (
                <video src={activeMediaUrl} controls autoPlay muted loop className="w-full h-full object-cover" />
              ) : (
                <img src={activeMediaUrl} alt={product.title} className="w-full h-full object-cover" />
              )}
              <div className="absolute bottom-3 left-3 bg-black/80 text-white px-3 py-1 border border-white/20 backdrop-blur-md">
                <span className="text-[10px] font-bold tracking-wider">LIVE REEL</span>
              </div>
            </div>

            {/* 4-Item Gallery */}
            {product.gallery && product.gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {product.gallery.slice(0, 4).map((media) => {
                  const isActive = activeMediaUrl === media.media_url;
                  return (
                    <div
                      key={media.id}
                      onClick={() => {
                        setActiveMediaUrl(media.media_url);
                        setActiveMediaType(media.media_type);
                      }}
                      className={cn(
                        "aspect-square bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all cursor-pointer relative overflow-hidden",
                        isActive && "border-blue-600 ring-2 ring-blue-600/35"
                      )}
                    >
                      <img src={media.thumbnail_url || media.media_url} alt="Gallery Thumb" className="w-full h-full object-cover" />
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Right Column: Details & Actions (5 Columns) */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 space-y-6">

              {/* Category & Inventory Alert */}
              <div className="flex justify-between items-center">
                <span className="bg-[#ffe600] text-black border border-black px-2.5 py-0.5 font-bold text-xs uppercase tracking-wider">
                  {product.category || "Apparel"}
                </span>
                {product.stock > 0 && product.stock <= 10 && (
                  <span className="text-red-600 font-bold text-xs flex items-center gap-1">
                    <span className="text-red-600">⚠</span>
                    <span>{product.stock} units left</span>
                  </span>
                )}
              </div>

              {/* Title & Price */}
              <div>
                <h1 className="font-sans uppercase tracking-tight font-black text-3xl lg:text-4xl leading-none">
                  {product.title}
                </h1>
                <p className="font-mono text-xl lg:text-2xl font-black text-zinc-900 mt-2">
                  {product.price} {product.currency}
                </p>
              </div>

              {/* Description Divider & Text */}
              <div className="border-t border-black pt-4">
                <p className="text-xs font-bold leading-relaxed text-zinc-700">
                  {product.description || "A limited edition piece from our automation collection. Engineered for comfort and style, this item bridges the gap between high-performance utility and modern aesthetic."}
                </p>
              </div>

              {/* Size Option Picker (if available) */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2 border-t border-black pt-4">
                  <span className="text-[10px] uppercase font-black block">Select Option / Size</span>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const isActive = selectedVariant === v;
                      return (
                        <button
                          key={v}
                          onClick={() => setSelectedVariant(v)}
                          className={cn(
                            "px-4 py-2 text-xs font-black border-2 border-black bg-white transition-all shadow-[2px_2px_0px_#000] hover:translate-y-0.5 active:translate-y-1 active:shadow-none",
                            isActive && "bg-[#0038ff] text-white shadow-none translate-x-[2px] translate-y-[2px]"
                          )}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Store Policies */}
              <div className="space-y-2 pt-4 border-t border-black">
                <span className="text-[10px] font-black uppercase">Store Policies</span>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <div className="border-2 border-black p-2 flex flex-col gap-0.5">
                    <span className="text-zinc-500 font-bold text-[9px] uppercase">Returns &amp; Exchanges</span>
                    <span className={settings?.return_policy ? "text-emerald-600" : "text-red-600"}>
                      {settings?.return_policy ? "Accepted" : "Not Accepted"}
                    </span>
                  </div>
                  <div className="border-2 border-black p-2 flex flex-col gap-0.5">
                    <span className="text-zinc-500 font-bold text-[9px] uppercase">Cancellations</span>
                    <span className={settings?.cancellation_policy ? "text-emerald-600" : "text-red-600"}>
                      {settings?.cancellation_policy ? "Allowed" : "Not Allowed"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="flex items-center justify-between py-3 border-t border-black">
                  <span className="text-[10px] font-black uppercase">Quantity</span>
                  <div className="flex items-center gap-4">
                    <button type="button" disabled={quantity <= 1}
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className={cn("w-8 h-8 border-2 border-black font-black text-sm flex items-center justify-center shadow-[2px_2px_0px_#000] transition-all",
                        quantity <= 1 ? "opacity-30 cursor-not-allowed" : "hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none")}>
                      -
                    </button>
                    <span className="w-6 text-center font-black text-sm text-black">{quantity}</span>
                    <button type="button" disabled={quantity >= product.stock}
                      onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                      className={cn("w-8 h-8 border-2 border-black font-black text-sm flex items-center justify-center shadow-[2px_2px_0px_#000] transition-all",
                        quantity >= product.stock ? "opacity-30 cursor-not-allowed" : "hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none")}>
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="space-y-3 pt-4 border-t border-black">
                <button
                  onClick={openCheckout}
                  disabled={isOutOfStock}
                  className={cn("w-full h-12 border-2 border-black font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all",
                    isOutOfStock
                      ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                      : "bg-[#0038ff] text-white shadow-[4px_4px_0px_#000] hover:translate-y-0.5 active:translate-y-1 active:shadow-none")}
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span>{isOutOfStock ? "OUT OF STOCK" : "BUY NOW / CHECKOUT"}</span>
                </button>
                {settings.enable_instagram_button && product.instagram_permalink && !isOutOfStock && (
                  <a
                    href={product.instagram_permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-12 bg-gradient-to-r from-[#fdf497] via-[#fd5949] to-[#d6249f] text-white border-2 border-black font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_#000] hover:translate-y-0.5 active:translate-y-1 active:shadow-none flex items-center justify-center gap-2"
                  >
                    <span>BUY ON INSTAGRAM</span>
                  </a>
                )}
                {settings.enable_whatsapp_button && !isOutOfStock && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-12 bg-[#25D366] text-white border-2 border-black font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_#000] hover:translate-y-0.5 active:translate-y-1 active:shadow-none flex items-center justify-center gap-2"
                  >
                    <span>ORDER VIA WHATSAPP</span>
                  </a>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-black text-xs font-bold">
                <div className="border-2 border-black p-3 flex items-center gap-2 bg-white">
                  <span className="text-base">🚚</span>
                  <span>Fast Global Delivery</span>
                </div>
                <div className="border-2 border-black p-3 flex items-center gap-2 bg-white">
                  <span className="text-base">✓</span>
                  <span>Authentic Goods</span>
                </div>
              </div>
            </div>

            {/* Info Pane Details */}
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-4 text-black space-y-3">
              <h3 className="font-black text-xs flex items-center gap-1.5 uppercase">
                <span>ℹ</span>
                <span>Specifications</span>
              </h3>
              <ul className="space-y-2 text-xs font-bold text-zinc-700">
                <li className="flex justify-between border-b border-black/10 pb-1.5">
                  <span>SKU:</span>
                  <span className="text-black font-mono">ANY-{product.id || "0012"}-TX</span>
                </li>
                <li className="flex justify-between border-b border-black/10 pb-1.5">
                  <span>Category:</span>
                  <span className="text-black">{product.category || "General"}</span>
                </li>
                {product.metadata && typeof product.metadata === "object" && Object.entries(product.metadata).map(([key, value], idx, arr) => (
                  <li key={key} className={cn("flex justify-between pb-1.5", idx < arr.length - 1 && "border-b border-black/10")}>
                    <span>{key}:</span>
                    <span className="text-black">{String(value)}</span>
                  </li>
                ))}
                {(!product.metadata || Object.keys(product.metadata).length === 0) && (
                  <li className="flex justify-between">
                    <span>Stock:</span>
                    <span className="text-black">{product.stock > 0 ? `${product.stock} units` : "Out of stock"}</span>
                  </li>
                )}
              </ul>
            </div>
          </section>

        </div>

        {/* Bento Grid Recommendations Section */}
        {settings.show_related_products && relatedProducts.length > 0 && (
          <section className="mt-16 border-t-2 border-black pt-12">
            <h2 className="font-sans uppercase tracking-tight font-black text-2xl lg:text-3xl mb-8 text-black">
              Complete the look
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

              {/* Card 1: Double column (Hoodie) */}
              {relatedProducts[0] && (
                <div
                  onClick={() => router.push(`/${username}/product/${relatedProducts[0].id}`)}
                  className="md:col-span-2 bg-white border-2 border-black shadow-[4px_4px_0px_#000] group cursor-pointer overflow-hidden relative flex flex-col justify-between"
                >
                  <div className="w-full h-48 overflow-hidden bg-zinc-100">
                    <img
                      src={relatedProducts[0].main_media_url}
                      alt={relatedProducts[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 bg-white border-t border-black flex justify-between items-center">
                    <span className="font-black text-sm uppercase">{relatedProducts[0].title}</span>
                    <span className="font-mono text-sm font-black">{relatedProducts[0].price} {relatedProducts[0].currency}</span>
                  </div>
                </div>
              )}

              {/* Card 2: Single Column (Cap) */}
              {relatedProducts[1] && (
                <div
                  onClick={() => router.push(`/${username}/product/${relatedProducts[1].id}`)}
                  className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-4 flex flex-col justify-between group cursor-pointer"
                >
                  <div className="h-32 bg-zinc-100 border-2 border-black overflow-hidden mb-3">
                    <img
                      src={relatedProducts[1].main_media_url}
                      alt={relatedProducts[1].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-xs uppercase text-zinc-950">{relatedProducts[1].title}</p>
                    <p className="text-zinc-600 font-mono text-xs mt-0.5">{relatedProducts[1].price} {relatedProducts[1].currency}</p>
                  </div>
                </div>
              )}

              {/* Card 3: Single Column (Bag) */}
              {relatedProducts[2] && (
                <div
                  onClick={() => router.push(`/${username}/product/${relatedProducts[2].id}`)}
                  className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-4 flex flex-col justify-between group cursor-pointer"
                >
                  <div className="h-32 bg-zinc-100 border-2 border-black overflow-hidden mb-3">
                    <img
                      src={relatedProducts[2].main_media_url}
                      alt={relatedProducts[2].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-xs uppercase text-zinc-950">{relatedProducts[2].title}</p>
                    <p className="text-zinc-600 font-mono text-xs mt-0.5">{relatedProducts[2].price} {relatedProducts[2].currency}</p>
                  </div>
                </div>
              )}

            </div>
          </section>
        )}
      </div>
    );
  };

  const renderDefaultLayout = () => {
    return (
      <main className={cn("pt-8 md:pt-12 px-6 max-w-7xl mx-auto flex-1 w-full", styles.containerClass)}>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

          {/* Left Column: Media Gallery */}
          <div className="w-full lg:w-[55%] space-y-4 shrink-0">
            {/* Active Display Panel */}
            <div className={cn("relative overflow-hidden aspect-[4/5] bg-black/10 flex items-center justify-center rounded-2xl border border-white/5 shadow-inner")}>
              {activeMediaType === "VIDEO" ? (
                <video src={activeMediaUrl} controls autoPlay muted loop className="w-full h-full object-cover" />
              ) : (
                <img
                  src={activeMediaUrl}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-300"
                />
              )}
            </div>

            {/* Gallery Thumbnails List */}
            {product.gallery && product.gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {product.gallery.map((media) => {
                  const isActive = activeMediaUrl === media.media_url;
                  return (
                    <button
                      key={media.id}
                      onClick={() => {
                        setActiveMediaUrl(media.media_url);
                        setActiveMediaType(media.media_type);
                      }}
                      className={cn(
                        "relative w-16 h-20 rounded-lg overflow-hidden border bg-white/5 transition-all shrink-0 aspect-[4/5]",
                        isActive ? "border-white scale-[0.98]" : "border-white/10 hover:border-white/30"
                      )}
                    >
                      <img src={media.thumbnail_url || media.media_url} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Floating Info and Purchase Card */}
          <aside className="w-full lg:w-[45%] lg:sticky lg:top-24 space-y-6">
            <div className={cn("p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden", styles.cardClass)}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={cn("text-[10px] tracking-widest uppercase font-black", styles.badgeClass)}>
                    {product.category || "Apparel"}
                  </span>
                  {product.stock > 0 ? (
                    <span className="text-[10px] uppercase font-bold text-emerald-400">In Stock</span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-red-500">Sold Out</span>
                  )}
                </div>

                <h1 className={cn("text-2xl md:text-3xl font-black tracking-tight", styles.fontHeadline, styles.textColorClass)}>
                  {product.title}
                </h1>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className={cn("text-2xl font-black", styles.priceClass)}>
                    {product.price ? `${product.price} ${product.currency}` : "Price TBD"}
                  </span>
                  {product.original_price && (
                    <span className="text-xs text-gray-500 line-through">
                      {product.original_price} {product.currency}
                    </span>
                  )}
                  {product.is_negotiable && (
                    <span className={cn("text-[9px] font-bold py-0.5 px-2 rounded-full", styles.badgeClass)}>
                      Negotiable
                    </span>
                  )}
                </div>
              </div>

              <div className={cn("h-px", isLight ? "bg-black/10" : "bg-white/5")}></div>

              {/* Variants Picker (if available) */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-3">
                  <span className={cn("text-[10px] uppercase tracking-wider font-bold block", styles.textMutedClass)}>
                    Select Option / Size
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const isActive = selectedVariant === v;
                      return (
                        <button
                          key={v}
                          onClick={() => setSelectedVariant(v)}
                          className={cn(
                            "px-4 py-2 rounded-lg text-xs font-bold border transition-all select-none",
                            isLight
                              ? isActive
                                ? "bg-black text-white border-black"
                                : "bg-black/5 text-black border-black/20 hover:border-black/40"
                              : isActive
                                ? "bg-white text-black border-white"
                                : "bg-white/5 text-white border-white/10 hover:border-white/20"
                          )}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Specifications — shown inline after size picker */}
              {product.metadata && typeof product.metadata === "object" && Object.keys(product.metadata).length > 0 && (
                <div className="space-y-2">
                  <span className={cn("text-[10px] uppercase tracking-wider font-bold block", styles.textMutedClass)}>
                    Specifications
                  </span>
                  <div className={cn("rounded-lg border divide-y overflow-hidden text-xs", isLight ? "border-black/10 divide-black/10" : "border-white/10 divide-white/5")}>
                    {Object.entries(product.metadata).map(([key, value]) => (
                      <div key={key} className={cn("flex justify-between items-center px-3 py-2", isLight ? "bg-black/[0.02]" : "bg-white/[0.02]")}>
                        <span className={cn("font-semibold uppercase tracking-wide text-[10px]", styles.textMutedClass)}>{key}</span>
                        <span className={cn("font-bold", styles.textColorClass)}>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Return & Cancellation Policies */}
              <div className="space-y-2 pt-1">
                <span className={cn("text-[10px] uppercase tracking-wider font-bold block", styles.textMutedClass)}>
                  Store Policies
                </span>
                <div className={cn("rounded-lg border p-3 space-y-2.5 text-xs", isLight ? "border-black/10" : "border-white/10")}>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-zinc-400 text-[10px] uppercase tracking-wider">Return & Exchange Policy</span>
                    <p className={cn("text-xs leading-normal opacity-95", styles.textColorClass)}>
                      {settings?.return_policy ? "Returns and exchanges are accepted." : "Returns and exchanges are not accepted."}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-zinc-400 text-[10px] uppercase tracking-wider">Cancellation Policy</span>
                    <p className={cn("text-xs leading-normal opacity-95", styles.textColorClass)}>
                      {settings?.cancellation_policy ? "Cancellations are allowed before order shipment." : "Cancellations are not allowed once order is placed."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="flex items-center justify-between py-3.5 border-t border-b border-white/5 my-2">
                  <span className={cn("text-xs font-bold uppercase tracking-wider", styles.textMutedClass)}>
                    Quantity
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className={cn(
                        "w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm transition-all focus:outline-none",
                        quantity <= 1
                          ? "opacity-30 cursor-not-allowed border-white/10 text-zinc-550"
                          : "border-white/20 text-white hover:bg-white/5 active:scale-95"
                      )}
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-black text-white">{quantity}</span>
                    <button
                      type="button"
                      disabled={quantity >= product.stock}
                      onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                      className={cn(
                        "w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm transition-all focus:outline-none",
                        quantity >= product.stock
                          ? "opacity-30 cursor-not-allowed border-white/10 text-zinc-550"
                          : "border-white/20 text-white hover:bg-white/5 active:scale-95"
                      )}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Purchase Trigger Actions - No Add to Cart button required */}
              <div className="space-y-3 pt-3">
                <button
                  onClick={openCheckout}
                  disabled={isOutOfStock}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 h-10 rounded-lg text-xs font-bold transition-all active:scale-[0.98]",
                    isOutOfStock
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60 border border-white/5"
                      : "bg-[#605ca2] text-white hover:bg-[#605ca2]/90"
                  )}
                >
                  <ShoppingBag className="w-5 h-5 shrink-0" />
                  <span>{isOutOfStock ? "Out of Stock" : "Buy Now / Checkout"}</span>
                </button>

                {settings.enable_instagram_button && product.instagram_permalink && !isOutOfStock && (
                  <a
                    href={product.instagram_permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("w-full flex items-center justify-center gap-2", styles.instagramButtonClass)}
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <span>Purchase on Instagram</span>
                  </a>
                )}

                {settings.enable_whatsapp_button && !isOutOfStock && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("w-full flex items-center justify-center gap-2", styles.whatsappButtonClass)}
                  >
                    <MessageCircle className="w-5 h-5 shrink-0" />
                    <span>Order via WhatsApp</span>
                  </a>
                )}

                <button
                  onClick={toggleFavorite}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 h-10 rounded-lg text-xs font-bold border transition-all active:scale-[0.98]",
                    isFavorited
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20"
                      : isLight
                        ? "bg-transparent border-black/20 text-black hover:border-black/40 hover:bg-black/5"
                        : "bg-transparent border-white/20 text-white hover:border-white/40 hover:bg-white/5"
                  )}
                >
                  <Heart className={cn("w-4 h-4 shrink-0", isFavorited && "fill-current")} />
                  <span>{isFavorited ? "Saved to Favorites" : "Add to Favorites"}</span>
                </button>
              </div>

              {/* Storefront trust features */}
              <div className="pt-4 flex flex-col gap-2.5 border-t border-white/5">
                <div className={cn("flex items-center gap-2 text-[10px] font-semibold", styles.textMutedClass)}>
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified Supplier Catalog</span>
                </div>
                <div className={cn("flex items-center gap-2 text-[10px] font-semibold", styles.textMutedClass)}>
                  <Truck className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Doorstep delivery available</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Product Details Section */}
        <section className="mt-16 max-w-3xl space-y-6">
          <div className="space-y-2">
            <h3 className={cn("text-base font-bold uppercase tracking-wider", styles.textColorClass)}>
              Product Details
            </h3>
            <p className={cn("text-sm leading-relaxed whitespace-pre-wrap", styles.textMutedClass)}>
              {product.description || "No product description provided."}
            </p>
          </div>
        </section>
        <hr className="w-full mt-6" />

        {/* Related Products Grid (if enabled) */}
        {settings.show_related_products && relatedProducts.length > 0 && (
          <section className=" pt-12 border-t border-white/5 space-y-6">
            <h3 className={cn("text-base font-bold uppercase tracking-wider", styles.textColorClass)}>
              Related Products
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => {
                    // Navigate to the related product's PDP
                    router.push(`/${username}/product/${rel.id}`);
                  }}
                  className={cn("p-2 cursor-pointer flex flex-col group h-full", styles.cardClass)}
                >
                  <div className="aspect-[4/5] overflow-hidden rounded-lg bg-black/10 shrink-0">
                    <img
                      src={rel.main_media_url}
                      alt={rel.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMWYyOTM3Ij48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+';
                      }}
                    />
                  </div>
                  <div className="p-2 space-y-1.5 flex-1 flex flex-col justify-between">
                    <h4 className={cn("text-xs font-bold line-clamp-1 truncate transition-colors", styles.textColorClass)}>
                      {rel.title}
                    </h4>
                    <span className={cn("text-xs font-black shrink-0", styles.priceClass)}>
                      {rel.price} {rel.currency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    );
  };

  const renderContent = () => {
    switch (settings.template_id) {
      case "organic_minimalist":
        return renderOrganicMinimalist();
      case "cyber_neon_dark":
        return renderCyberNeon();
      case "immersive_glass":
        return renderImmersiveGlass();
      case "minimalist_editorial":
        return renderMinimalistEditorial();
      case "neo_brutalist":
        return renderNeoBrutalist();
      default:
        return renderDefaultLayout();
    }
  };

  return (
    <div className={cn("min-h-screen flex flex-col transition-colors duration-500 pb-16", styles.bodyClass, styles.fontBody)}>
      {/* Top Navbar */}
      <header className={cn("sticky top-0 z-40 px-6 h-16 flex items-center justify-between w-full max-w-full mx-auto", styles.navClass)}>
        <button onClick={() => router.push(`/${username}`)} className="flex items-center gap-1.5 text-xs font-bold hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 flex items-center justify-center bg-white/5">
            {settings.store_logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.store_logo} alt={settings.store_name} className="w-full h-full object-cover" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </div>
          <span className={cn("text-sm font-bold tracking-tight hidden sm:inline", styles.fontHeadline, styles.textColorClass)}>
            {settings.store_name || supplier.full_name || supplier.username}
          </span>
        </div>

        {/* Navigation links - Login and Signup hidden for visitors */}
        <nav className="flex items-center gap-4 text-xs font-semibold">
          <Link href={`/${username}`} className={cn("hover:opacity-80 transition-opacity", styles.textMutedClass)}>
            Storefront
          </Link>
        </nav>
      </header>

      {renderContent()}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto text-[#e5e2e1]">
          <div className={cn("rounded-xl max-w-md w-full p-6 border border-white/10 shadow-2xl relative space-y-4 text-left", isLight ? "bg-white text-zinc-950" : "bg-[#20201f] text-white")}>
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-md font-bold tracking-tight">Checkout Order</h3>

            <form onSubmit={handleCheckout} className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase tracking-wider opacity-60">Full Name</label>
                <input
                  type="text"
                  required
                  value={checkoutName}
                  onChange={(e) => setCheckoutName(e.target.value)}
                  placeholder="Enter your name"
                  className={cn("w-full px-3 py-2 text-xs rounded border outline-none", isLight ? "bg-zinc-100 border-zinc-300 text-black" : "bg-[#0e0e0e] border-[#444748] text-white")}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase tracking-wider opacity-60">Email Address</label>
                <input
                  type="email"
                  required
                  value={checkoutEmail}
                  onChange={(e) => setCheckoutEmail(e.target.value)}
                  placeholder="Enter email address"
                  className={cn("w-full px-3 py-2 text-xs rounded border outline-none", isLight ? "bg-zinc-100 border-zinc-300 text-black" : "bg-[#0e0e0e] border-[#444748] text-white")}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase tracking-wider opacity-60">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={checkoutPhone}
                  onChange={(e) => setCheckoutPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className={cn("w-full px-3 py-2 text-xs rounded border outline-none", isLight ? "bg-zinc-100 border-zinc-300 text-black" : "bg-[#0e0e0e] border-[#444748] text-white")}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase tracking-wider opacity-60">Shipping Address</label>
                <textarea
                  required
                  rows={2}
                  value={checkoutAddress}
                  onChange={(e) => setCheckoutAddress(e.target.value)}
                  placeholder="Detailed shipping address"
                  className={cn("w-full px-3 py-2 text-xs rounded border outline-none resize-none", isLight ? "bg-zinc-100 border-zinc-300 text-black" : "bg-[#0e0e0e] border-[#444748] text-white")}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider opacity-60">Pin Code</label>
                  <input
                    type="text"
                    required
                    value={checkoutPincode}
                    onChange={(e) => setCheckoutPincode(e.target.value)}
                    placeholder="Pin Code"
                    className={cn("w-full px-3 py-2 text-xs rounded border outline-none", isLight ? "bg-zinc-100 border-zinc-300 text-black" : "bg-[#0e0e0e] border-[#444748] text-white")}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider opacity-60">Place / City</label>
                  <input
                    type="text"
                    required
                    value={checkoutPlace}
                    onChange={(e) => setCheckoutPlace(e.target.value)}
                    placeholder="Place / City"
                    className={cn("w-full px-3 py-2 text-xs rounded border outline-none", isLight ? "bg-zinc-100 border-zinc-300 text-black" : "bg-[#0e0e0e] border-[#444748] text-white")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider opacity-60">District</label>
                  <input
                    type="text"
                    required
                    value={checkoutDistrict}
                    onChange={(e) => setCheckoutDistrict(e.target.value)}
                    placeholder="District"
                    className={cn("w-full px-3 py-2 text-xs rounded border outline-none", isLight ? "bg-zinc-100 border-zinc-300 text-black" : "bg-[#0e0e0e] border-[#444748] text-white")}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider opacity-60">State</label>
                  <input
                    type="text"
                    required
                    value={checkoutState}
                    onChange={(e) => setCheckoutState(e.target.value)}
                    placeholder="State"
                    className={cn("w-full px-3 py-2 text-xs rounded border outline-none", isLight ? "bg-zinc-100 border-zinc-300 text-black" : "bg-[#0e0e0e] border-[#444748] text-white")}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase tracking-wider opacity-60">Payment Method</label>
                {(() => {
                  const isCodAvailable = settings?.cod_enabled && product?.cod_enabled;
                  const isOnlineAvailable = !!settings?.online_payment_enabled;

                  if (isCodAvailable && isOnlineAvailable) {
                    return (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setCheckoutPaymentMethod("COD")}
                          className={cn(
                            "py-2 rounded border text-xs font-semibold transition-all",
                            checkoutPaymentMethod === "COD"
                              ? "border-[#605ca2] bg-[#605ca2]/15 text-[#b6b2ff]"
                              : isLight
                                ? "border-zinc-300 hover:border-zinc-400 text-black"
                                : "border-white/10 hover:border-white/20 text-white"
                          )}
                        >
                          Cash on Delivery
                        </button>
                        <button
                          type="button"
                          onClick={() => setCheckoutPaymentMethod("RAZORPAY")}
                          className={cn(
                            "py-2 rounded border text-xs font-semibold transition-all",
                            checkoutPaymentMethod === "RAZORPAY"
                              ? "border-[#605ca2] bg-[#605ca2]/15 text-[#b6b2ff]"
                              : isLight
                                ? "border-zinc-300 hover:border-zinc-400 text-black"
                                : "border-white/10 hover:border-white/20 text-white"
                          )}
                        >
                          Online
                        </button>
                      </div>
                    );
                  } else if (isCodAvailable) {
                    return (
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => setCheckoutPaymentMethod("COD")}
                          className={cn(
                            "py-2 rounded border text-xs font-semibold transition-all border-[#605ca2] bg-[#605ca2]/15 text-[#b6b2ff] text-center w-full"
                          )}
                        >
                          Cash on Delivery
                        </button>
                      </div>
                    );
                  } else if (isOnlineAvailable) {
                    return (
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => setCheckoutPaymentMethod("RAZORPAY")}
                          className={cn(
                            "py-2 rounded border text-xs font-semibold transition-all border-[#605ca2] bg-[#605ca2]/15 text-[#b6b2ff] text-center w-full"
                          )}
                        >
                          Online
                        </button>
                      </div>
                    );
                  } else {
                    return (
                      <div className="rounded border border-red-500/20 bg-red-500/5 p-3 text-center">
                        <p className="text-xs font-bold text-red-400">No Payment Methods Available</p>
                        <p className="text-[10px] text-zinc-400 mt-1">This store is currently not accepting any orders.</p>
                      </div>
                    );
                  }
                })()}
              </div>

              <button
                type="submit"
                disabled={isSubmittingOrder}
                className="w-full mt-4 h-10 rounded bg-[#605ca2] hover:bg-[#605ca2]/90 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {isSubmittingOrder ? "Placing Order..." : "Confirm & Place Order"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer (only if not immersive glass which is an h-screen app-style player) */}
      {settings.template_id !== "immersive_glass" && (
        <footer className={cn("mt-24 border-t border-white/5 pt-8 text-center text-[10px]", styles.containerClass, styles.textMutedClass)}>
          <p>© 2026 {settings.store_name || supplier.full_name || supplier.username}. Powered by AnyDM Automation.</p>
        </footer>
      )}
    </div>
  );
}
