"use client";

import React, { use, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Globe, RefreshCw, ShoppingBag, ArrowRight, Star, X, Heart,
  Search, ChevronDown, MessageCircle,
  Package, Shield, Truck, RotateCcw, Menu, MapPin, Phone, Mail,
  ChevronRight,
} from "lucide-react";

// Inline Instagram icon (lucide-react version may not export it)
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
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
  contact_email?: string;
  contact_phone?: string;
  shipping_address?: string;
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
  category?: string;
}

export default function StorefrontPage({ params }: PageProps) {
  const { username } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [settings, setSettings] = useState<WebsiteSettingsData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState<"default" | "price_asc" | "price_desc">("default");
  const [showSearch, setShowSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [inputOrderId, setInputOrderId] = useState("");
  const [localOrders, setLocalOrders] = useState<any[]>([]);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [activePolicyModal, setActivePolicyModal] = useState<"privacy" | "terms" | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductData | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Scroll detection for nav
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load wishlist from localStorage
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("anydm_favorites") || "[]");
    setWishlist(favs);
  }, []);

  // Load local orders
  useEffect(() => {
    if (typeof window !== "undefined") {
      const orders = JSON.parse(localStorage.getItem("anydm_customer_orders") || "[]");
      const supplierOrders = orders.filter((o: any) => o.username?.toLowerCase() === username?.toLowerCase());
      setLocalOrders(supplierOrders);
    }
  }, [isTrackingOpen, username]);

  // Fetch storefront data
  useEffect(() => {
    if (username) fetchStorefrontData();
  }, [username]);

  // Focus search input when shown
  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

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
          is_negotiable: prod.negotiable !== undefined ? prod.negotiable : prod.is_negotiable,
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

  const toggleWishlist = (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => {
      const next = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
      localStorage.setItem("anydm_favorites", JSON.stringify(next));
      return next;
    });
  };

  // Derived data
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[]];

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = searchQuery.trim() === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOrder === "price_asc") return parseFloat(a.price || "0") - parseFloat(b.price || "0");
      if (sortOrder === "price_desc") return parseFloat(b.price || "0") - parseFloat(a.price || "0");
      return 0;
    });

  const getDiscount = (product: ProductData) => {
    const price = parseFloat(product.price || "0");
    const original = parseFloat(product.original_price || "0");
    if (original > price && original > 0) {
      return Math.round(((original - price) / original) * 100);
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-white animate-spin" />
        </div>
        <p className="text-xs text-zinc-500 tracking-widest font-medium">Loading store…</p>
      </div>
    );
  }

  if (error || !supplier || !settings) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <Globe className="w-7 h-7 text-zinc-500" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Store Not Found</h2>
        <p className="text-sm text-zinc-500 max-w-xs mb-8 leading-relaxed">
          {error || "We couldn't load this storefront. Check the URL and try again."}
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2.5 bg-white text-black font-bold text-xs rounded-full hover:bg-zinc-100 transition-all"
        >
          Return Home
        </button>
      </div>
    );
  }

  const styles: TemplateStyle = getTemplateStyles(settings.template_id, settings.theme_id);
  const storeName = settings.store_name || supplier.full_name || supplier.username;

  return (
    <div className={cn("min-h-screen flex flex-col transition-colors duration-500", styles.bodyClass, styles.fontBody)}>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <header className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "shadow-sm" : "",
        styles.navClass
      )}>
        <div className={cn("h-16 flex items-center justify-between gap-4", styles.containerClass)}>
          {/* Logo & Store Name */}
          <Link href={`/${username}`} className="flex items-center gap-3 shrink-0">
            <div className={styles.logoWrapperClass}>
              {settings.store_logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.store_logo} alt={storeName} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
            </div>
            <span className={cn("text-sm font-bold tracking-tight hidden sm:block", styles.fontHeadline, styles.textColorClass)}>
              {storeName}
            </span>
          </Link>

          {/* Center nav links */}
          <nav className="hidden md:flex items-center gap-7">
            <button
              onClick={() => { setActiveCategory("All"); setShowSearch(false); }}
              className={cn("text-xs font-semibold tracking-wide hover:opacity-70 transition-opacity", styles.textMutedClass)}
            >
              All Products
            </button>
            <button
              onClick={() => setIsTrackingOpen(true)}
              className={cn("text-xs font-semibold tracking-wide hover:opacity-70 transition-opacity", styles.textMutedClass)}
            >
              Track Order
            </button>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            <button
              onClick={() => setShowSearch(v => !v)}
              className={cn("w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:opacity-70", styles.textMutedClass)}
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Wishlist button — always visible, clickable */}
            <button
              onClick={() => setWishlistOpen(true)}
              aria-label="View wishlist"
              className={cn("relative w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:opacity-70", styles.textMutedClass)}
            >
              <Heart className={cn("w-4 h-4 transition-all", wishlist.length > 0 ? "fill-current text-red-500" : "")} />
              {wishlist.length > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                  style={{ backgroundColor: styles.accentColor, color: styles.isDark ? "#000" : "#fff" }}
                >
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={cn("md:hidden w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:opacity-70", styles.textMutedClass)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search bar (slides in) */}
        {showSearch && (
          <div className={cn("border-t", styles.dividerClass)}>
            <div className={cn("py-3 flex items-center gap-3", styles.containerClass)}>
              <Search className={cn("w-4 h-4 shrink-0", styles.textMutedClass)} />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={`Search ${storeName} products…`}
                className={cn("flex-1 bg-transparent text-sm focus:outline-none", styles.textColorClass, "placeholder:opacity-40")}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className={styles.textMutedClass}>
                  <X className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => setShowSearch(false)} className={cn("text-xs font-medium", styles.textMutedClass)}>
                Close
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Mobile Drawer ──────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className={cn("relative ml-auto w-72 h-full flex flex-col p-6 shadow-2xl", styles.bodyClass)}>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className={cn("absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full", styles.textMutedClass)}
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-8 pt-2">
              <div className={styles.logoWrapperClass}>
                {settings.store_logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={settings.store_logo} alt={storeName} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="w-4 h-4" />
                )}
              </div>
              <span className={cn("text-sm font-bold", styles.textColorClass)}>{storeName}</span>
            </div>
            <nav className="space-y-1 flex-1">
              {["All Products", "Track Order"].map((item, i) => (
                <button
                  key={item}
                  onClick={() => {
                    if (i === 1) setIsTrackingOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className={cn("w-full text-left py-3 px-4 rounded-lg text-sm font-semibold transition-colors hover:opacity-70", styles.textColorClass)}
                >
                  {item}
                </button>
              ))}
            </nav>
            <div className={cn("pt-6 border-t text-xs", styles.dividerClass, styles.textMutedClass)}>
              <p>© 2026 {storeName}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero Banner ────────────────────────────────────────── */}
      {settings.store_banner ? (
        <section className="relative w-full overflow-hidden" style={{ maxHeight: "420px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={settings.store_banner}
            alt={storeName}
            className="w-full object-cover"
            style={{ maxHeight: "420px", minHeight: "220px" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col items-center justify-end pb-10 text-center px-6">
            <h1 className={cn("text-3xl sm:text-5xl font-black text-white drop-shadow-2xl mb-3", styles.fontHeadline)}>
              {storeName}
            </h1>
            {settings.store_description && (
              <p className="text-sm text-white/85 max-w-lg mx-auto drop-shadow font-medium leading-relaxed">
                {settings.store_description}
              </p>
            )}
            <button
              onClick={() => document.getElementById("product-grid")?.scrollIntoView({ behavior: "smooth" })}
              className={cn("mt-6 px-8 py-3 text-xs font-bold tracking-widest transition-all", styles.buttonClass)}
            >
              Shop Now
            </button>
          </div>
        </section>
      ) : (
        <section className={cn("py-16 text-center", styles.containerClass)}>
          <h1 className={cn("text-4xl sm:text-6xl font-black mb-4", styles.fontHeadline, styles.textColorClass)}>
            {storeName}
          </h1>
          <p className={cn("text-sm max-w-md mx-auto leading-relaxed mb-8", styles.textMutedClass)}>
            {settings.store_description || "Discover our curated collection of premium products."}
          </p>
          <button
            onClick={() => document.getElementById("product-grid")?.scrollIntoView({ behavior: "smooth" })}
            className={cn("px-8 py-3 text-xs font-bold tracking-widest transition-all", styles.buttonClass)}
          >
            Explore Collection
          </button>
        </section>
      )}

      {/* ── Trust Badges ──────────────────────────────────────── */}
      <div className={cn("border-y py-4", styles.dividerClass)}>
        <div className={cn("flex items-center justify-center gap-8 overflow-x-auto scrollbar-hide", styles.containerClass)}>
          {[
            { icon: Truck, label: "Fast Delivery" },
            { icon: Shield, label: "Secure Checkout" },
            { icon: RotateCcw, label: "Easy Returns" },
            { icon: Package, label: "Quality Assured" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className={cn("flex items-center gap-2 shrink-0", styles.textMutedClass)}>
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Category Filters (Shown right after Trust Badges) ── */}
      {categories.length > 1 && (
        <div className={cn("border-b py-4", styles.dividerClass)}>
          <div className={cn("flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide pb-1", styles.containerClass)}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn("shrink-0 transition-all", activeCategory === cat ? styles.filterPillActiveClass : styles.filterPillClass)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Product Catalog ────────────────────────────────────── */}
      <main id="product-grid" className={cn("flex-1 py-12", styles.containerClass)}>

        {/* Filter & Sort Bar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <span className={cn("text-xs font-semibold", styles.textMutedClass)}>
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
          </span>

          {/* Sort */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as any)}
                className={cn("appearance-none pr-7 text-xs font-semibold cursor-pointer", styles.inputClass, "!py-2")}
              >
                <option value="default">Sort: Default</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
              </select>
              <ChevronDown className={cn("absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none", styles.textMutedClass)} />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <ShoppingBag className={cn("w-10 h-10 mx-auto", styles.textMutedClass)} />
            <p className={cn("text-sm font-medium", styles.textMutedClass)}>
              {searchQuery ? `No products match "${searchQuery}"` : "No products available yet."}
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className={cn("text-xs underline", styles.textMutedClass)}>
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map(product => {
              const discount = getDiscount(product);
              const isWishlisted = wishlist.includes(product.id);
              const isOutOfStock = product.stock === 0;

              return (
                <div
                  key={product.id}
                  className={cn("group relative flex flex-col cursor-pointer", styles.cardClass)}
                  onClick={() => router.push(`/${username}/product/${product.id}`)}
                >
                  {/* Product Image */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900 shrink-0">
                    {isVideoUrl(product.main_media_url) ? (
                      <video
                        src={product.main_media_url}
                        muted
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.main_media_url}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMWYyOTM3Ij48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+";
                        }}
                      />
                    )}

                    {/* Overlays */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                        <span className="text-white text-[10px] font-black tracking-widest px-3 py-1 border border-white/30">
                          Out of Stock
                        </span>
                      </div>
                    )}

                    {/* Discount badge */}
                    {discount && !isOutOfStock && (
                      <div
                        className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-black tracking-widest"
                        style={{ backgroundColor: styles.accentColor, color: styles.isDark ? "#000" : "#fff" }}
                      >
                        -{discount}%
                      </div>
                    )}

                    {/* Low stock badge */}
                    {!isOutOfStock && product.stock > 0 && product.stock <= 3 && (
                      <div className="absolute bottom-2 left-2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 tracking-widest">
                        Only {product.stock} left
                      </div>
                    )}

                    {/* Wishlist button */}
                    <button
                      onClick={e => toggleWishlist(product.id, e)}
                      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-all hover:bg-black/50 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart
                        className={cn("w-4 h-4 transition-all", isWishlisted ? "fill-current text-red-500" : "text-white")}
                      />
                    </button>

                    {/* Quick view overlay */}
                    <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setQuickViewProduct(product);
                        }}
                        className="w-full text-[10px] font-bold tracking-widest py-2 bg-white/90 backdrop-blur-sm text-black hover:bg-white transition-colors"
                      >
                        Quick View
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-3 flex flex-col gap-1 flex-1">
                    <h3 className={cn("text-xs font-bold line-clamp-1 leading-snug", styles.textColorClass)}>
                      {product.title}
                    </h3>
                    {product.description && (
                      <p className={cn("text-[10px] line-clamp-1 leading-relaxed", styles.textMutedClass)}>
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className={cn("text-sm font-bold", styles.priceClass)}>
                        {product.price ? `${product.price} ${product.currency}` : "Price on request"}
                      </span>
                      {parseFloat(product.original_price || "0") > parseFloat(product.price || "0") && (
                        <span className={cn("text-[10px] line-through", styles.textMutedClass)}>
                          {product.original_price} {product.currency}
                        </span>
                      )}
                    </div>
                    {product.is_negotiable && (
                      <span className={cn("text-[9px] tracking-widest font-bold w-fit", styles.badgeClass)}>
                        Negotiable
                      </span>
                    )}
                    <div className={cn("flex items-center justify-end mt-auto pt-2", styles.textMutedClass)}>
                      <span className="text-[9px] font-bold tracking-widest flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                        Details <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className={cn("border-t mt-8", styles.dividerClass)}>
        <div className={cn("py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10", styles.containerClass)}>
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={styles.logoWrapperClass}>
                {settings.store_logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={settings.store_logo} alt={storeName} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="w-4 h-4" />
                )}
              </div>
              <span className={cn("text-sm font-bold", styles.textColorClass)}>{storeName}</span>
            </div>
            {settings.store_description && (
              <p className={cn("text-xs leading-relaxed max-w-xs", styles.textMutedClass)}>
                {settings.store_description}
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className={cn("text-xs font-bold tracking-widest", styles.textColorClass)}>Quick Links</h4>
            <div className="space-y-2">
              <button onClick={() => setIsTrackingOpen(true)} className={cn("block text-xs hover:underline", styles.textMutedClass)}>
                Track My Order
              </button>
              <button onClick={() => setActivePolicyModal("privacy")} className={cn("block text-xs hover:underline", styles.textMutedClass)}>
                Privacy Policy
              </button>
              <button onClick={() => setActivePolicyModal("terms")} className={cn("block text-xs hover:underline", styles.textMutedClass)}>
                Terms of Service
              </button>
            </div>
          </div>

          {/* Contact */}
          {(settings.contact_email || settings.contact_phone || settings.shipping_address) && (
            <div className="space-y-3">
              <h4 className={cn("text-xs font-bold tracking-widest", styles.textColorClass)}>Contact</h4>
              <div className="space-y-2">
                {settings.contact_email && (
                  <div className={cn("flex items-center gap-2 text-xs", styles.textMutedClass)}>
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <a href={`mailto:${settings.contact_email}`} className="hover:underline truncate">
                      {settings.contact_email}
                    </a>
                  </div>
                )}
                {settings.contact_phone && (
                  <div className={cn("flex items-center gap-2 text-xs", styles.textMutedClass)}>
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <a href={`tel:${settings.contact_phone}`} className="hover:underline">
                      {settings.contact_phone}
                    </a>
                  </div>
                )}
                {settings.shipping_address && (
                  <div className={cn("flex items-start gap-2 text-xs", styles.textMutedClass)}>
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{settings.shipping_address}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className={cn("border-t py-5 flex flex-col sm:flex-row items-center justify-between gap-2", styles.dividerClass, styles.containerClass)}>
          <p className={cn("text-[10px]", styles.textMutedClass)}>
            © 2026 {storeName}. Powered by{" "}
            <span style={{ color: styles.accentColor }} className="font-bold">AnyDM</span>.
          </p>
          <div className="flex items-center gap-4">
            {settings.enable_instagram_button && (
              <a
                href={`https://instagram.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("flex items-center gap-1.5 text-[10px] font-semibold hover:opacity-70 transition-opacity", styles.textMutedClass)}
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                Instagram
              </a>
            )}
            {settings.enable_whatsapp_button && (
              <a
                href={`https://wa.me/${settings.contact_phone?.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("flex items-center gap-1.5 text-[10px] font-semibold hover:opacity-70 transition-opacity", styles.textMutedClass)}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </footer>

      {/* ── Wishlist Drawer ─────────────────────────────────────── */}
      {wishlistOpen && (
        <div className="fixed inset-0 z-[70] flex justify-end" onClick={() => setWishlistOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Panel */}
          <div
            className={cn(
              "relative w-full max-w-sm h-full flex flex-col shadow-2xl",
              styles.bodyClass
            )}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className={cn("flex items-center justify-between px-5 py-4 border-b shrink-0", styles.dividerClass)}>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 fill-current text-red-500" />
                <span className={cn("text-sm font-bold", styles.textColorClass)}>
                  Wishlist
                </span>
                {wishlist.length > 0 && (
                  <span
                    className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center"
                    style={{ backgroundColor: styles.accentColor, color: styles.isDark ? "#000" : "#fff" }}
                  >
                    {wishlist.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setWishlistOpen(false)}
                className={cn("w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity", styles.textMutedClass)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {wishlist.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${styles.accentColor}15`, border: `1px solid ${styles.accentColor}30` }}
                  >
                    <Heart className={cn("w-7 h-7", styles.textMutedClass)} />
                  </div>
                  <div>
                    <p className={cn("text-sm font-bold mb-1", styles.textColorClass)}>Your wishlist is empty</p>
                    <p className={cn("text-xs leading-relaxed", styles.textMutedClass)}>
                      Tap the ♡ on any product to save it here for later.
                    </p>
                  </div>
                  <button
                    onClick={() => setWishlistOpen(false)}
                    className={cn("mt-2 text-xs font-bold px-6 py-2.5", styles.buttonClass)}
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="px-4 py-3 space-y-3">
                  {products
                    .filter(p => wishlist.includes(p.id))
                    .map(product => (
                      <div
                        key={product.id}
                        className={cn("flex gap-3 p-3 rounded-xl", styles.cardClass)}
                      >
                        {/* Thumbnail */}
                        <div
                          className="w-20 h-24 shrink-0 rounded-lg overflow-hidden bg-zinc-900 cursor-pointer"
                          onClick={() => { setWishlistOpen(false); router.push(`/${username}/product/${product.id}`); }}
                        >
                          {isVideoUrl(product.main_media_url) ? (
                            <video
                              src={product.main_media_url}
                              muted
                              playsInline
                              preload="metadata"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.main_media_url}
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={e => {
                                (e.target as HTMLImageElement).src =
                                  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMWYyOTM3Ij48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+";
                              }}
                            />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <h4
                              className={cn("text-xs font-bold line-clamp-2 leading-snug cursor-pointer hover:underline", styles.textColorClass)}
                              onClick={() => { setWishlistOpen(false); router.push(`/${username}/product/${product.id}`); }}
                            >
                              {product.title}
                            </h4>
                            <p className={cn("text-xs font-bold mt-1", styles.priceClass)}>
                              {product.price ? `${product.price} ${product.currency}` : "Price on request"}
                            </p>
                            {parseFloat(product.original_price || "0") > parseFloat(product.price || "0") && (
                              <p className={cn("text-[10px] line-through mt-0.5", styles.textMutedClass)}>
                                {product.original_price} {product.currency}
                              </p>
                            )}
                            {product.stock === 0 && (
                              <span className="text-[9px] font-bold text-red-400 tracking-wider mt-0.5 block">Out of stock</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => { setWishlistOpen(false); router.push(`/${username}/product/${product.id}`); }}
                              className={cn("flex-1 text-[10px] font-bold py-1.5 flex items-center justify-center gap-1 transition-all", styles.buttonClass)}
                            >
                              View <ArrowRight className="w-3 h-3" />
                            </button>
                            <button
                              onClick={e => toggleWishlist(product.id, e)}
                              className={cn("w-7 h-7 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity shrink-0", styles.textMutedClass)}
                              aria-label="Remove from wishlist"
                              title="Remove from wishlist"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {wishlist.length > 0 && (
              <div className={cn("px-5 py-4 border-t shrink-0", styles.dividerClass)}>
                <button
                  onClick={() => {
                    setWishlist([]);
                    localStorage.setItem("anydm_favorites", "[]");
                  }}
                  className={cn("w-full text-xs font-bold py-2.5 rounded-lg opacity-70 hover:opacity-100 transition-opacity", styles.textMutedClass)}
                  style={{ border: `1px solid`, borderColor: "currentColor" }}
                >
                  Clear all ({wishlist.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Quick View Modal ────────────────────────────────────── */}
      {quickViewProduct && (
        <div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            className={cn(
              "relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col sm:flex-row",
              styles.bodyClass
            )}
            onClick={e => e.stopPropagation()}
          >
            {/* Image */}
            <div className="w-full sm:w-48 aspect-square sm:aspect-auto sm:h-auto shrink-0 overflow-hidden bg-zinc-900 rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none">
              {isVideoUrl(quickViewProduct.main_media_url) ? (
                <video
                  src={quickViewProduct.main_media_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={quickViewProduct.main_media_url}
                  alt={quickViewProduct.title}
                  className="w-full h-full object-cover"
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMWYyOTM3Ij48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+";
                  }}
                />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 p-5 flex flex-col gap-4">
              <button
                onClick={() => setQuickViewProduct(null)}
                className={cn("absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm", styles.textMutedClass)}
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <h3 className={cn("text-base font-bold leading-tight mb-1", styles.fontHeadline, styles.textColorClass)}>
                  {quickViewProduct.title}
                </h3>
                <p className={cn("text-sm font-bold", styles.priceClass)}>
                  {quickViewProduct.price ? `${quickViewProduct.price} ${quickViewProduct.currency}` : "Price on request"}
                </p>
              </div>

              {quickViewProduct.description && (
                <p className={cn("text-xs leading-relaxed line-clamp-3", styles.textMutedClass)}>
                  {quickViewProduct.description}
                </p>
              )}

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className={cn("text-[10px] ml-1", styles.textMutedClass)}>(4.8)</span>
              </div>

              <button
                onClick={() => {
                  setQuickViewProduct(null);
                  router.push(`/${username}/product/${quickViewProduct.id}`);
                }}
                className={cn("w-full text-xs font-bold py-3 mt-auto flex items-center justify-center gap-2", styles.buttonClass)}
              >
                View Full Details <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Policy Modals ──────────────────────────────────────── */}
      {activePolicyModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className={cn("w-full max-w-lg rounded-2xl border p-6 shadow-2xl max-h-[80vh] overflow-y-auto custom-scrollbar", styles.bodyClass, styles.dividerClass.replace("border-", "border "))}>
            <div className={cn("flex justify-between items-center pb-3 mb-4 border-b", styles.dividerClass)}>
              <span className={cn("text-sm font-bold tracking-wider", styles.textColorClass)}>
                {activePolicyModal === "privacy" ? "Privacy Policy" : "Terms of Service"}
              </span>
              <button
                onClick={() => setActivePolicyModal(null)}
                className={cn("w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors", styles.textMutedClass)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className={cn("text-xs leading-relaxed whitespace-pre-wrap", styles.textMutedClass)}>
              {activePolicyModal === "privacy"
                ? settings.privacy_policy || "We value your privacy. Your personal information is exclusively used to fulfill your orders."
                : settings.terms_of_service || "By browsing this store and placing orders, you agree to comply with our terms and conditions."}
            </p>
          </div>
        </div>
      )}

      {/* ── Order Tracking Modal ───────────────────────────────── */}
      {isTrackingOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl bg-[#1c1c1f] text-white space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#c4c0ff]" />
                <span className="text-sm font-bold">Track Your Order</span>
              </div>
              <button
                onClick={() => { setIsTrackingOpen(false); setInputOrderId(""); }}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (inputOrderId.trim()) router.push(`/track/${inputOrderId.trim()}`);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[10px] font-bold tracking-widest text-zinc-400 block mb-1.5">
                  Order ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={inputOrderId}
                    onChange={e => setInputOrderId(e.target.value)}
                    placeholder="e.g. AMD-20260712-..."
                    className="flex-1 bg-[#111] border border-white/15 rounded-lg px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-bold"
                    style={{ backgroundColor: styles.accentColor, color: styles.isDark ? "#000" : "#fff" }}
                  >
                    Track
                  </button>
                </div>
              </div>
            </form>

            {localOrders.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/8">
                <span className="text-[10px] font-bold tracking-widest text-zinc-400 block">
                  Recent Orders ({localOrders.length})
                </span>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {localOrders.map((order, idx) => (
                    <div
                      key={idx}
                      onClick={() => router.push(`/track/${order.order_id}`)}
                      className="w-full flex items-center justify-between text-left p-2.5 rounded-lg bg-[#111] border border-white/8 hover:border-white/20 transition-colors cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono font-bold text-[#c4c0ff]">{order.order_id}</span>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              navigator.clipboard?.writeText(order.order_id);
                              setCopiedOrderId(order.order_id);
                              setTimeout(() => setCopiedOrderId(null), 2000);
                            }}
                            className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded hover:bg-white/10 text-zinc-400 cursor-pointer"
                          >
                            {copiedOrderId === order.order_id ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        {order.product_name && (
                          <span className="text-[9px] text-zinc-500 block truncate max-w-[200px]">{order.product_name}</span>
                        )}
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
