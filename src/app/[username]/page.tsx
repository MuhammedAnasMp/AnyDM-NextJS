"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, RefreshCw, ShoppingBag, ArrowRight } from "lucide-react";
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
  template_id: string;
  theme_id: string;
  show_related_products: boolean;
  enable_instagram_button: boolean;
  enable_whatsapp_button: boolean;
  custom_colors: any;
  custom_fonts: any;
  custom_settings: any;
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
}

export default function StorefrontPage({ params }: PageProps) {
  const { username } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [settings, setSettings] = useState<WebsiteSettingsData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);

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
          <a href="#" className={cn("text-xs font-semibold hover:opacity-80 transition-opacity", styles.textMutedClass)}>
            About
          </a>
        </nav>
      </header>

      {/* Hero / Store Banner */}
      <section className={cn("py-12 md:py-16 text-center border-b border-white/5 bg-black/5", styles.containerClass)}>
        <h1 className={cn("text-4xl md:text-5xl font-black mb-4", styles.fontHeadline, styles.textColorClass)}>
          {settings.store_name || supplier.full_name || supplier.username}
        </h1>
        <p className={cn("text-xs md:text-sm max-w-xl mx-auto leading-relaxed", styles.textMutedClass)}>
          Welcome to our official catalog storefront. Discover and purchase our products directly via Instagram DM or WhatsApp.
        </p>
      </section>

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
                className={cn("flex flex-col h-full cursor-pointer overflow-hidden p-2 group", styles.cardClass)}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden bg-black/10 shrink-0">
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
                    <h3 className={cn("text-xs font-bold line-clamp-1 truncate transition-colors", styles.textColorClass)}>
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
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
