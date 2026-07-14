"use client";

import React, { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, RefreshCw, ShoppingBag, ArrowRight, Star, X, Info, Ruler, Sparkles, AlertCircle } from "lucide-react";
import api from "@/lib/services/api.service";
import { getTemplateStyles, TemplateStyle } from "@/components/templates/TemplateProvider";
import { cn } from "@/lib/utils";

const isVideoUrl = (url: string) => {
  if (!url) return false;
  return url.endsWith(".mp4") || url.endsWith(".mov") || url.includes("/video/upload/");
};

interface PageProps {
  params: Promise<{ username: string }>;
}

interface SupplierData {
  username: string;
  full_name: string;
  profile_picture_url: string;
}

interface WebsiteSettingsData {
  store_name: string;
  store_logo: string;
  store_banner: string;
  store_description: string;
  template_id: string;
  theme_id: string;
  show_related_products: boolean;
  enable_instagram_button: boolean;
  enable_whatsapp_button: boolean;
  custom_colors: any;
  custom_fonts: any;
  custom_settings: any;
  privacy_policy?: string;
  terms_of_service?: string;
}

interface ProductData {
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
  metadata?: any;
}

export default function StorefrontPage({ params }: PageProps) {
  const { username } = use(params);
  const router = useRouter();

  // Hover & Mini Detail Popup States
  const [hoveredProduct, setHoveredProduct] = useState<ProductData | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper: check if a string represents a color
  const isColor = (val: string): boolean => {
    const colors = [
      'black', 'white', 'gray', 'grey', 'red', 'blue', 'green', 'yellow', 
      'orange', 'pink', 'purple', 'brown', 'navy', 'olive', 'gold', 'silver', 
      'beige', 'tan', 'teal', 'cream', 'maroon', 'khaki', 'charcoal'
    ];
    return colors.includes(val.trim().toLowerCase());
  };

  // Helper: get product metadata or generate a premium fallback dataset
  const getProductMetadata = (product: ProductData) => {
    if (product.metadata && typeof product.metadata === 'object' && product.metadata.variants) {
      return product.metadata;
    }
    
    const title = (product.title || "").toLowerCase();
    let variants = "Black,Olive,S,M,L,XL";
    let details: Record<string, string> = {
      "1": "Chest: 96cm, Length: 68cm, Shoulder: 42cm, Sleeve: 61cm",
      "2": "Chest: 100cm, Length: 70cm, Shoulder: 44cm, Sleeve: 62cm",
      "3": "Chest: 104cm, Length: 72cm, Shoulder: 46cm, Sleeve: 63cm",
      "4": "Chest: 108cm, Length: 74cm, Shoulder: 48cm, Sleeve: 64cm"
    };

    if (title.includes("shoe") || title.includes("sneaker") || title.includes("boot") || title.includes("footwear")) {
      variants = "White,Black,7,8,9,10,11";
      details = {
        "1": "US: 7, UK: 6, EU: 40, Length: 25cm",
        "2": "US: 8, UK: 7, EU: 41.5, Length: 26cm",
        "3": "US: 9, UK: 8, EU: 42.5, Length: 27cm",
        "4": "US: 10, UK: 9, EU: 44, Length: 28cm",
        "5": "US: 11, UK: 10, EU: 45, Length: 29cm"
      };
    } else if (title.includes("pant") || title.includes("jeans") || title.includes("trouser") || title.includes("denim")) {
      variants = "Blue,Grey,30,32,34,36";
      details = {
        "1": "Waist: 30\", Inseam: 32\", Outseam: 40\", Hip: 38\"",
        "2": "Waist: 32\", Inseam: 32\", Outseam: 41\", Hip: 40\"",
        "3": "Waist: 34\", Inseam: 32\", Outseam: 42\", Hip: 42\"",
        "4": "Waist: 36\", Inseam: 34\", Outseam: 43\", Hip: 44\""
      };
    } else if (title.includes("watch") || title.includes("accessory") || title.includes("cap") || title.includes("hat") || title.includes("glass")) {
      variants = "Gold,Silver,One Size";
      details = {
        "1": "Case: 40mm, Band Width: 20mm, Water Resistance: 50m"
      };
    } else if (title.includes("dress") || title.includes("skirt") || title.includes("top") || title.includes("kurti") || title.includes("gown")) {
      variants = "Red,Pink,S,M,L,XL";
      details = {
        "1": "Bust: 88cm, Waist: 70cm, Length: 102cm",
        "2": "Bust: 92cm, Waist: 74cm, Length: 104cm",
        "3": "Bust: 96cm, Waist: 78cm, Length: 106cm",
        "4": "Bust: 100cm, Waist: 82cm, Length: 108cm"
      };
    }

    return {
      variants,
      ...details
    };
  };

  // Helper: parse technical details string into key-value pairs
  const parseTechnicalDetails = (detailString: string) => {
    if (!detailString) return [];
    if (!detailString.includes(":")) {
      return [{ key: "Detail", value: detailString }];
    }
    return detailString.split(",").map(part => {
      const [key, ...valParts] = part.split(":");
      return {
        key: key ? key.trim() : "",
        value: valParts.join(":") ? valParts.join(":").trim() : ""
      };
    }).filter(item => item.key && item.value);
  };

  const handleProductHoverStart = (product: ProductData, event: React.MouseEvent) => {
    if (window.innerWidth < 1024) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    const cardElement = (event.currentTarget as HTMLElement).closest(".product-card-container");
    if (cardElement) {
      const rect = cardElement.getBoundingClientRect();
      setHoverPosition({
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
      });
      setSelectedColor(null);
      setSelectedSize(null);
      setHoveredProduct(product);
    }
  };

  const handleProductHoverEnd = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredProduct(null);
    }, 300);
  };

  const handlePopupMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const handlePopupMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredProduct(null);
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [settings, setSettings] = useState<WebsiteSettingsData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);

  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [inputOrderId, setInputOrderId] = useState("");
  const [localOrders, setLocalOrders] = useState<any[]>([]);
  const [activePolicyModal, setActivePolicyModal] = useState<"privacy" | "terms" | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const orders = JSON.parse(localStorage.getItem("anydm_customer_orders") || "[]");
      const supplierOrders = orders.filter((o: any) => o.username?.toLowerCase() === username?.toLowerCase());
      setLocalOrders(supplierOrders);
    }
  }, [isTrackingOpen, username]);

  useEffect(() => {
    if (username) {
      fetchStorefrontData();
    }
  }, [username]);

  const fetchStorefrontData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/accounts/public/store/${username}/`);
      if (response.data) {
        setSupplier(response.data.supplier);
        setSettings(response.data.settings);
        const normalizedProducts = (response.data.products || []).map((prod: any) => ({
          ...prod,
          main_media_url: prod.main_media_url || prod.media_url,
          is_negotiable: prod.negotiable !== undefined ? prod.negotiable : prod.is_negotiable
        }));
        setProducts(normalizedProducts);
      }
    } catch (err: any) {
      console.error("Storefront fetch error:", err);
      setError(err.response?.data?.error || "This store is currently not active or does not exist.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col items-center justify-center font-sans">
        <RefreshCw className="w-10 h-10 animate-spin text-white mb-4" />
        <p className="text-sm font-semibold tracking-tight">Loading storefront...</p>
      </div>
    );
  }

  if (error || !supplier || !settings) {
    return (
      <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col items-center justify-center px-6 text-center font-sans">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <Globe className="w-8 h-8 text-gray-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Storefront Offline</h2>
        <p className="text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">
          {error || "We couldn't load the requested storefront configuration. Please check the URL and try again."}
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-5 py-2.5 bg-white text-black font-bold rounded-lg text-xs hover:bg-[#eaeaea] transition-all"
        >
          Return Home
        </button>
      </div>
    );
  }

  const styles: TemplateStyle = getTemplateStyles(settings.template_id, settings.theme_id);

  return (
    <div className={cn("min-h-screen flex flex-col transition-colors duration-500 pb-12", styles.bodyClass, styles.fontBody)}>
      {/* Navigation Bar */}
      <header className={cn("sticky top-0 z-40 px-6 h-16 flex items-center justify-between w-full max-w-full mx-auto", styles.navClass)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 flex items-center justify-center bg-white/5">
            {settings.store_logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.store_logo} alt={settings.store_name} className="w-full h-full object-cover" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </div>
          <span className={cn("text-base font-bold tracking-tight", styles.fontHeadline, styles.textColorClass)}>
            {settings.store_name || supplier.full_name || supplier.username}
          </span>
        </div>
        
        {/* Navigation links - Login and Signup hidden for visitors */}
        <nav className="flex items-center gap-6">
          <a href="#" className={cn("text-xs font-semibold hover:opacity-80 transition-opacity", styles.textMutedClass)}>
            Catalog
          </a>
          <button 
            onClick={() => setIsTrackingOpen(true)}
            className={cn("text-xs font-semibold hover:opacity-80 transition-opacity focus:outline-none", styles.textMutedClass)}
          >
            Track Order
          </button>
        </nav>
      </header>

      {/* Hero / Store Banner */}
      {settings.store_banner ? (
        <section className="relative w-full overflow-hidden" style={{ maxHeight: '320px' }}>
          <img
            src={settings.store_banner}
            alt={settings.store_name || supplier.username}
            className="w-full object-cover"
            style={{ maxHeight: '320px', minHeight: '160px' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col items-center justify-end pb-8 text-center px-6">
            <h1 className={cn("text-3xl md:text-4xl font-black text-white drop-shadow-lg", styles.fontHeadline)}>
              { settings.store_name || supplier.full_name || supplier.username}
            </h1>
            {settings.store_description && (
              <p className="text-xs md:text-sm text-white/90 max-w-xl mx-auto mt-2 drop-shadow font-medium">
                {settings.store_description}
              </p>
            )}
          </div>
        </section>
      ) : (
        <section className={cn("py-12 md:py-16 text-center border-b border-white/5 bg-black/5", styles.containerClass)}>
          <h1 className={cn("text-4xl md:text-5xl font-black mb-4", styles.fontHeadline, styles.textColorClass)}>
            {settings.store_name || supplier.full_name || supplier.username}
          </h1>
          <p className={cn("text-xs md:text-sm max-w-xl mx-auto leading-relaxed", styles.textMutedClass)}>
            {settings.store_description || "Welcome to our official catalog storefront. Discover and purchase our products directly via Instagram DM or WhatsApp."}
          </p>
        </section>
      )}

      {/* Products Grid Catalog */}
      <main className={cn("py-12 flex-1", styles.containerClass)}>
        {products.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <ShoppingBag className="w-12 h-12 text-gray-500 mx-auto" />
            <p className={cn("text-xs font-medium", styles.textMutedClass)}>No active products currently available in this catalog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => router.push(`/${username}/product/${product.id}`)}
                className={cn("product-card-container flex flex-col h-full cursor-pointer overflow-hidden p-2 group", styles.cardClass)}
                onMouseLeave={handleProductHoverEnd}
              >
                {/* Image Container */}
                <div 
                  className="relative aspect-[4/5] w-full rounded-lg overflow-hidden bg-black/10 shrink-0"
                  onMouseEnter={(e) => handleProductHoverStart(product, e)}
                >
                  {isVideoUrl(product.main_media_url) ? (
                    <video
                      src={product.main_media_url}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.main_media_url}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMWYyOTM3Ij48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+';
                      }}
                    />
                  )}
                  {product.is_negotiable && (
                    <span className={cn("absolute top-3 left-3 text-[9px] tracking-wider font-extrabold uppercase px-2 py-0.5 rounded shadow", styles.badgeClass)}>
                      Negotiable
                    </span>
                  )}
                  {product.stock <= 3 && product.stock > 0 && (
                    <span className="absolute bottom-3 left-3 bg-red-600 text-white text-[8px] tracking-widest font-black uppercase px-2 py-0.5 rounded shadow">
                      Only {product.stock} Left
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h3 
                      className={cn("text-xs font-bold line-clamp-1 truncate transition-colors", styles.textColorClass)}
                      onMouseEnter={(e) => handleProductHoverStart(product, e)}
                    >
                      {product.title}
                    </h3>
                    <p className={cn("text-[10px] line-clamp-2 leading-relaxed h-8 overflow-hidden", styles.textMutedClass)}>
                      {product.description || "No description provided."}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-baseline pt-2 border-t border-white/5 shrink-0">
                    <span className={cn("text-sm font-black", styles.priceClass)}>
                      {product.price ? `${product.price} ${product.currency}` : "TBD"}
                    </span>
                    <span className={cn("text-[9px] uppercase font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform", styles.textMutedClass)}>
                      Details <ArrowRight className="w-3 h-3 stroke-[2.5px]" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={cn("mt-16 border-t border-white/5 pt-8 text-center text-[10px]", styles.containerClass, styles.textMutedClass)}>
        <p>© 2026 {settings.store_name || supplier.full_name || supplier.username}. Powered by AnyDM Automation.</p>
        <div className="flex justify-center gap-4 mt-2">
          <button onClick={() => setActivePolicyModal("privacy")} className="hover:underline focus:outline-none">Privacy Policy</button>
          <button onClick={() => setActivePolicyModal("terms")} className="hover:underline focus:outline-none">Terms of Service</button>
        </div>
      </footer>

      {/* Policy Modal Overlay */}
      {activePolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-white/10 p-6 shadow-2xl bg-[#1e1e24] text-white space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-sm font-bold uppercase tracking-wider text-[#b6b2ff]">
                {activePolicyModal === "privacy" ? "Privacy Policy" : "Terms of Service"}
              </span>
              <button 
                onClick={() => setActivePolicyModal(null)} 
                className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-zinc-350 leading-relaxed whitespace-pre-wrap pt-2 text-left">
              {activePolicyModal === "privacy" 
                ? (settings.privacy_policy || `We value your privacy. Your personal information, including name, email, and shipping details, is exclusively used to fulfill your orders and enhance your custom shopping experience with ${settings.store_name || supplier.full_name || supplier.username}.`)
                : (settings.terms_of_service || `By browsing this store and placing orders, you agree to comply with and be bound by the terms and conditions set forth by ${settings.store_name || supplier.full_name || supplier.username}. All items ordered are subjected to availability, return, and cancellation policies.`)
              }
            </div>
          </div>
        </div>
      )}

      {/* Interactive Hover Detail Popup */}
      {hoveredProduct && hoverPosition && (() => {
        const POPUP_HEIGHT = 480;
        const POPUP_WIDTH = 330;
        const GAP = 10;
        const viewportH = window.innerHeight;
        const viewportW = window.innerWidth;
        const cardTop = hoverPosition.y - window.scrollY;
        const cardLeft = hoverPosition.x;
        const cardCenter = cardLeft + hoverPosition.width / 2;

        // Prefer above, fallback below if not enough room
        let top: number;
        if (cardTop - POPUP_HEIGHT - GAP >= 8) {
          top = cardTop - POPUP_HEIGHT - GAP;
        } else {
          top = cardTop + hoverPosition.height + GAP;
        }
        top = Math.max(8, Math.min(viewportH - POPUP_HEIGHT - 8, top));

        // Center horizontally over card, clamp to viewport
        let left = cardCenter - POPUP_WIDTH / 2;
        left = Math.max(8, Math.min(viewportW - POPUP_WIDTH - 8, left));

        return (
          <div
            className="fixed z-50 w-[330px] premium-glass-popup rounded-2xl overflow-hidden p-4 text-white flex flex-col pointer-events-auto"
            style={{ top: `${top}px`, left: `${left}px` }}
            onMouseEnter={handlePopupMouseEnter}
            onMouseLeave={handlePopupMouseLeave}
          >
          {/* Header Image/Video */}
          <div className="relative h-40 w-full rounded-xl overflow-hidden mb-3 bg-white/5 border border-white/10 shrink-0">
            {isVideoUrl(hoveredProduct.main_media_url) ? (
              <video
                src={hoveredProduct.main_media_url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={hoveredProduct.main_media_url}
                alt={hoveredProduct.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMWYyOTM3Ij48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+';
                }}
              />
            )}
            
            {/* Price Badge */}
            <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold">
              {hoveredProduct.price ? `${hoveredProduct.price} ${hoveredProduct.currency}` : "TBD"}
            </div>
          </div>

          {/* Product details */}
          <div className="flex-grow flex flex-col min-h-0 overflow-y-auto pr-1">
            <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">{hoveredProduct.title}</h4>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mb-2.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-3.5 h-3.5 fill-amber-400 text-amber-400 rating-star-interactive cursor-pointer"
                />
              ))}
              <span className="text-[10px] text-zinc-400 ml-1">(4.8 / 5)</span>
            </div>

            {/* Description with Read More */}
            <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mb-3">
              {hoveredProduct.description || "No description provided."}
            </p>
            
            {/* Dynamic metadata variants */}
            {(() => {
              const meta = getProductMetadata(hoveredProduct);
              const variantList = meta.variants ? meta.variants.split(",").map((v: string) => v.trim()) : [];
              const colors = variantList.filter((v: string) => isColor(v));
              const sizes = variantList.filter((v: string) => !isColor(v));

              return (
                <div className="space-y-3">
                  {/* Colors */}
                  {colors.length > 0 && (
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Color</span>
                      <div className="flex flex-wrap gap-1.5">
                        {colors.map((color: string) => {
                          const isSelected = selectedColor === color;
                          return (
                            <button
                              key={color}
                              onClick={() => setSelectedColor(color)}
                              className={cn(
                                "h-6 px-2.5 rounded-full text-[10px] font-semibold border transition-all flex items-center justify-center gap-1",
                                isSelected 
                                  ? "bg-white text-black border-white scale-105" 
                                  : "bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10"
                              )}
                            >
                              <span 
                                className="w-2 h-2 rounded-full border border-white/20" 
                                style={{ backgroundColor: color.toLowerCase() }}
                              />
                              {color}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sizes & Size Chart */}
                  {sizes.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Size</span>
                        <button
                          onClick={() => setIsSizeChartOpen(!isSizeChartOpen)}
                          className="flex items-center gap-1 text-[9px] text-[#b6b2ff] font-bold hover:underline"
                        >
                          <Ruler className="w-3 h-3" /> Size Guide
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {sizes.map((size: string, idx: number) => {
                          const isSelected = selectedSize === size;
                          return (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className={cn(
                                "h-6 px-3 rounded-md text-[10px] font-bold border transition-all",
                                isSelected 
                                  ? "bg-white text-black border-white scale-105" 
                                  : "bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10"
                              )}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Size Guide panel inside popup */}
                  {isSizeChartOpen && (
                    <div className="rounded-lg border border-white/5 bg-black/40 p-2.5 text-[10px] animate-[popupScaleIn_0.2s_ease-out]">
                      <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-white/5">
                        <span className="font-bold text-zinc-300">Size Chart Reference</span>
                        <button onClick={() => setIsSizeChartOpen(false)}>
                          <X className="w-3 h-3 text-zinc-400 hover:text-white" />
                        </button>
                      </div>
                      <table className="w-full text-left text-zinc-400">
                        <thead>
                          <tr className="border-b border-white/5 text-zinc-500 font-bold">
                            <th className="pb-1">Size</th>
                            <th className="pb-1">Chest</th>
                            <th className="pb-1">Length</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sizes.map((sz: string, idx: number) => (
                            <tr key={sz} className="border-b last:border-0 border-white/5">
                              <td className="py-1 text-white font-bold">{sz}</td>
                              <td className="py-1">{90 + idx * 4} cm</td>
                              <td className="py-1">{66 + idx * 2} cm</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Technical Details for Selected Size */}
                  {selectedSize && (() => {
                    const sizeIndex = sizes.indexOf(selectedSize) + 1;
                    const techDetailVal = meta[String(sizeIndex)];
                    if (!techDetailVal) return null;
                    const parsedPairs = parseTechnicalDetails(techDetailVal);

                    return (
                      <div className="rounded-xl border border-[#b6b2ff]/20 bg-[#b6b2ff]/5 p-3 space-y-2 mt-2 transition-all">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#b6b2ff]" />
                          <span className="text-[10px] font-bold text-[#b6b2ff] uppercase tracking-wider">Specs for Size {selectedSize}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          {parsedPairs.map((pair, pIdx) => (
                            <div key={pIdx} className="bg-white/5 border border-white/5 rounded-md p-1.5 flex flex-col gap-0.5">
                              <span className="text-[9px] text-zinc-500 font-medium">{pair.key}</span>
                              <span className="text-zinc-200 font-bold">{pair.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
          </div>

          {/* Action button redirecting to PDP */}
          <button
            onClick={() => router.push(`/${username}/product/${hoveredProduct.id}`)}
            className="w-full mt-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shrink-0"
          >
            <span>View Full Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          </div>
        );
      })()}

      {/* Tracking Modal */}
      {isTrackingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 p-6 shadow-2xl bg-[#1e1e24] text-white space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#b6b2ff]" />
                <span className="text-sm font-bold">Track Your Order</span>
              </div>
              <button 
                onClick={() => {
                  setIsTrackingOpen(false);
                  setInputOrderId("");
                }} 
                className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (inputOrderId.trim()) {
                  router.push(`/track/${inputOrderId.trim()}`);
                }
              }}
              className="space-y-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Order ID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={inputOrderId}
                    onChange={(e) => setInputOrderId(e.target.value)}
                    placeholder="Enter order ID (e.g. AMD-20260712-...)"
                    className="w-full bg-[#0e0e0e] border border-[#444748] rounded px-3 py-2 text-xs text-white outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded text-xs font-bold bg-[#605ca2] hover:bg-[#605ca2]/90 transition-colors"
                  >
                    Track
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">Your Placed Orders ({localOrders.length})</span>
              {localOrders.length === 0 ? (
                <p className="text-[11px] text-zinc-500 italic">No recent orders found on this browser for this supplier.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {localOrders.map((order, idx) => (
                    <button
                      key={idx}
                      onClick={() => router.push(`/track/${order.order_id}`)}
                      className="w-full flex items-center justify-between text-left p-2.5 rounded bg-[#0e0e0e] border border-[#444748]/30 hover:border-[#605ca2] transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-mono font-bold text-[#b6b2ff] block">{order.order_id}</span>
                        {order.product_name && <span className="text-[9px] text-zinc-400 block truncate max-w-[200px]">{order.product_name}</span>}
                      </div>
                      <span className="text-[9px] text-zinc-500 shrink-0">
                        {order.timestamp ? new Date(order.timestamp).toLocaleDateString() : ""}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
