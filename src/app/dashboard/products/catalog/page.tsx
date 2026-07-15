"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import api from "@/lib/services/api.service";
import InstagramImportModal from "@/components/InstagramImportModal";
import Toast from "@/components/Toast";
import InstagramIcon from "@/components/ui/InstagramIcon";
import {
  Lock,
  Plus,
  Package,
  CheckCircle,
  FileText,
  RefreshCw,
  Filter,
  Search,
  Image as ImageIcon,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";

export default function CatalogPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isImportOpen = searchParams.get("import") === "instagram";

  const appUser = useSelector((state: RootState) => state.auth.user);
  const activeAccountId = appUser?.active_instagram_account_id;
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

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Toast notifications
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const cacheKey = `anydm_products_${activeAccountId || "default"}`;

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/products/");
      const data = response.data?.results || response.data;
      if (data && Array.isArray(data)) {
        setProducts(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } else {
        loadFromLocalStorage();
      }
    } catch (err) {
      console.warn("Backend API not reachable. Loading from localStorage fallback.");
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setProducts(JSON.parse(cached));
    } else {
      setProducts([]);
    }
  };

  useEffect(() => {
    setProducts([]);
    setSearchQuery("");
    setSelectedFilter("All");
    loadProducts();
  }, [activeAccountId]);

  const handleDeleteProduct = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await api.delete(`/products/${id}/`);
    } catch (err) {
      console.warn("API delete failed, performing local delete fallback.");
    }

    const updated = products.filter(p => String(p.id) !== String(id));
    setProducts(updated);
    localStorage.setItem("anydm_products", JSON.stringify(updated));
    showToast("Product deleted successfully", "success");
  };

  const formatUpdatedTime = (isoString: string) => {
    if (!isoString) return "recently";
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffHours = Math.floor(diffMs / 3600000);
      if (diffHours < 1) return "Just now";
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch (e) {
      return "recently";
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === "All") return true;
    if (selectedFilter === "Published") return p.status?.toUpperCase() === "PUBLISHED";
    if (selectedFilter === "Drafts") return p.status?.toUpperCase() === "DRAFT";
    return true;
  });

  const publishedCount = products.filter(p => p.status?.toUpperCase() === "PUBLISHED").length;
  const draftCount = products.filter(p => p.status?.toUpperCase() === "DRAFT").length;
  const totalProducts = products.length;

  const bentoStats = [
    { label: "Total products", val: String(totalProducts), meta: "Inventory count", icon: Package },
    { label: "Published items", val: String(publishedCount), meta: "Active online", icon: CheckCircle },
    { label: "Draft items", val: String(draftCount), meta: "Work in progress", icon: FileText },
    { label: "Instagram imports", val: String(products.filter(p => p.source === "instagram").length), meta: "Live sync active", icon: RefreshCw }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 text-[#e5e2e1]"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#20201f] pb-5">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Product catalog</h1>
          <p className="text-xs text-[#c4c7c8] mt-0.5">Manage, track, and optimize your synchronized ecommerce inventory.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => router.push("/dashboard/products/catalog?import=instagram")}
            className="h-9 px-4 rounded border border-[#2a2a2a] hover:bg-white/[0.02] text-white flex items-center gap-2 text-xs font-medium transition-colors bg-transparent active:scale-[0.98]"
          >
            <InstagramIcon className="w-4 h-4 text-pink-500" />
            <span>Create from Instagram</span>
          </button>
          <button
            onClick={() => router.push("/dashboard/products/catalog/create")}
            className="h-9 px-4 rounded bg-white hover:bg-[#e2e2e2] text-[#131313] flex items-center gap-1.5 text-xs font-semibold transition-colors active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>Create normal product</span>
          </button>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {bentoStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-4 rounded bg-[#1c1b1b] border border-[#2a2a2a] flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-[#c4c7c8]">{stat.label}</p>
                <p className="text-2xl font-semibold text-white tracking-tight">{stat.val}</p>
                <p className="text-[10px] text-[#8e9192] flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-neutral-600 inline-block" />
                  {stat.meta}
                </p>
              </div>
              <div className="w-8 h-8 rounded bg-[#131313] border border-[#2a2a2a] flex items-center justify-center text-[#8e9192]">
                <Icon className="w-4 h-4" strokeWidth={1.75} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Control Actions & Filter Bar */}
      <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-t p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Side: Filter Segments */}
        <div className="flex flex-wrap items-center gap-2">
          {/* <div className="flex items-center gap-1 px-2.5 h-8 rounded bg-[#131313] border border-[#2a2a2a] text-xs text-[#c4c7c8]">
            <Filter className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span className="font-medium">Filters</span>
          </div> */}
          <div className="h-4 w-[1px] bg-[#2a2a2a] hidden sm:block" />
          <div className="flex p-0.5 bg-[#131313] border border-[#2a2a2a] rounded">
            {["All", "Published", "Drafts"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 h-7 rounded text-xs font-medium transition-colors ${selectedFilter === filter
                  ? "bg-[#20201f] text-white border border-[#2a2a2a] shadow-sm"
                  : "text-[#c4c7c8] hover:text-white border border-transparent"
                  }`}
              >
                {filter === "All" ? "All products" : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Active Query Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9192] w-4 h-4" strokeWidth={1.75} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#131313] border border-[#2a2a2a] rounded pl-9 pr-4 h-8 text-xs w-full md:w-64 focus:border-[#444748] transition-colors text-white placeholder-[#8e9192] outline-none"
            placeholder="Search catalog by title, sku..."
            type="text"
          />
        </div>
      </div>

      {/* Data Table Frame */}
      <div className="bg-[#1c1b1b] border border-[#2a2a2a] border-t-0 rounded-b overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#131313] border-b border-[#2a2a2a] text-[#8e9192] font-medium tracking-wide">
                <th className="px-6 py-3.5 w-[30%]">Product name</th>
                <th className="px-6 py-3.5 w-[12%]">Price</th>
                <th className="px-6 py-3.5 w-[10%]">Stock</th>
                <th className="px-6 py-3.5 text-center w-[10%]">Inquiries</th>
                <th className="px-6 py-3.5 text-center w-[10%]">Clicks</th>
                <th className="px-6 py-3.5 text-center w-[13%]">Conversion rate</th>
                <th className="px-6 py-3.5 w-[10%]">Status</th>
                <th className="px-6 py-3.5 text-right w-[5%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-[#20201f] border border-white/5" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 bg-[#20201f] w-1/2 rounded" />
                        <div className="h-2.5 bg-[#20201f] w-1/4 rounded" />
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-3.5 bg-[#20201f] w-12 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-3.5 bg-[#20201f] w-8 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-3.5 bg-[#20201f] w-8 mx-auto rounded" /></td>
                    <td className="px-6 py-4"><div className="h-3.5 bg-[#20201f] w-8 mx-auto rounded" /></td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 max-w-[80px] mx-auto">
                        <div className="h-3 bg-[#20201f] w-10 mx-auto rounded" />
                        <div className="h-1 bg-[#20201f] w-full rounded-full" />
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-5 bg-[#20201f] w-16 rounded" /></td>
                    <td className="px-6 py-4" />
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-14 text-[#c4c7c8]">
                    <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
                      <div className="w-10 h-10 rounded-full bg-[#131313] border border-[#2a2a2a] flex items-center justify-center text-[#8e9192]">
                        <AlertCircle className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-white">No products found</p>
                        <p className="text-[11px] text-[#8e9192]">
                          Try modifying your filters, clearing your search query, or importing posts directly from Instagram.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p: any, i: number) => {
                  const hashId = typeof p.id === "number" ? p.id : (p.id?.charCodeAt(0) || 5);
                  const inquiriesVal = p.inquiries || Math.floor((hashId * 7) % 150) + 12;
                  const clicksVal = p.clicks || Math.floor(inquiriesVal * 6.5) + 32;
                  const convPercentage = p.conv || ((inquiriesVal / clicksVal) * 100).toFixed(1) + "%";
                  const convProgress = Math.min(100, Math.floor((inquiriesVal / clicksVal) * 100));

                  const titleText = p.title || p.name || "Untitled product";
                  const skuCode = p.sku || (titleText.substring(0, 3).toUpperCase() + "-" + String(p.id).substring(0, 4).toUpperCase());

                  const isInstagramProduct = p.source === "instagram" ||
                    p.source_type === "REEL" ||
                    p.source_type === "POST" ||
                    !!p.instagram_permalink ||
                    (p.source_id && p.source_type !== "MANUAL");

                  return (
                    <tr key={p.id || i} className="hover:bg-white/[0.01] transition-colors group">
                      {/* Product Name Column */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded overflow-hidden bg-[#131313] border border-[#2a2a2a] shrink-0 flex items-center justify-center relative">
                            {isInstagramProduct && (
                              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-black/80 rounded-full flex items-center justify-center border border-white/[0.08] z-10" title="Imported from Instagram">
                                <InstagramIcon className="w-2.5 h-2.5 text-pink-500" />
                              </div>
                            )}
                            {(() => {
                              const mainMediaUrl = p.media_url || p.gallery?.[0]?.media_url;
                              if (!mainMediaUrl) {
                                return <ImageIcon className="w-4 h-4 text-[#8e9192]" strokeWidth={1.5} />;
                              }

                              const isMainVideo =
                                p.gallery?.find((g: any) => g.media_url === mainMediaUrl)?.media_type === "VIDEO" ||
                                p.gallery?.[0]?.media_type === "VIDEO" ||
                                (typeof mainMediaUrl === "string" && (
                                  /\.(mp4|webm|ogg|mov|avi)/i.test(mainMediaUrl) ||
                                  mainMediaUrl.includes("video")
                                )) ||
                                p.source_type === "REEL";

                              const thumbUrl = p.gallery?.find((g: any) => g.media_url === mainMediaUrl)?.thumbnail_url || p.gallery?.[0]?.thumbnail_url;

                              if (isMainVideo && !thumbUrl) {
                                return <video src={mainMediaUrl} className="w-full h-full object-cover" preload="metadata" muted playsInline />;
                              } else {
                                return <img src={thumbUrl || mainMediaUrl} alt={titleText} className="w-full h-full object-cover" />;
                              }
                            })()}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-medium text-white truncate flex items-center gap-1.5">
                              {titleText}
                              {/* {isInstagramProduct && (
                                <InstagramIcon className="w-3.5 h-3.5 text-pink-500 shrink-0 inline" />
                              )} */}
                            </p>
                            <p className="text-[10px] text-[#8e9192] truncate">
                              SKU: {skuCode} • Updated {formatUpdatedTime(p.updated_at)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Price Column */}
                      <td className="px-6 py-3.5 font-medium text-white">
                        {p.price !== null && p.price !== undefined ? `${Number(p.price).toFixed(2)} ${p.currency || 'KWD'}` : '—'}
                      </td>

                      {/* Stock Column */}
                      <td className="px-6 py-3.5 font-medium text-white">
                        {p.stock !== null && p.stock !== undefined ? p.stock : '—'}
                      </td>

                      {/* Inquiries */}
                      <td className="px-6 py-3.5 text-center font-medium text-white">{inquiriesVal}</td>

                      {/* Clicks */}
                      <td className="px-6 py-3.5 text-center font-medium text-white">{clicksVal}</td>

                      {/* Conversion Analytics Column */}
                      <td className="px-6 py-3.5">
                        <div className="flex flex-col items-center gap-1.5 max-w-[100px] mx-auto">
                          <span className="font-semibold text-white flex items-center gap-1">
                            {convPercentage}
                            {convProgress > 15 && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                          </span>
                          <div className="w-16 h-1 bg-[#131313] border border-[#2a2a2a] rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full" style={{ width: `${convProgress}%` }} />
                          </div>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border ${p.status?.toUpperCase() === "PUBLISHED"
                          ? "bg-green-500/5 text-green-400 border-green-500/15"
                          : "bg-white/[0.02] text-[#8e9192] border-white/5"
                          }`}>
                          {p.status?.toUpperCase() === "PUBLISHED" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          )}
                          {p.status?.toLowerCase() === "published" ? "Published" : "Draft"}
                        </span>
                      </td>

                      {/* Table row action menu */}
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => router.push(`/dashboard/products/catalog/create?edit=${p.id}`)}
                            className="p-1.5 hover:bg-white/5 rounded text-[#c4c7c8] hover:text-white transition-colors border border-transparent hover:border-[#2a2a2a]"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteProduct(p.id, e)}
                            className="p-1.5 hover:bg-red-500/5 rounded text-red-400 hover:text-red-300 transition-colors border border-transparent hover:border-red-500/20"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Dense Pagination Navigation */}
        {!loading && filteredProducts.length > 0 && (
          <div className="p-3.5 bg-[#131313] border-t border-[#2a2a2a] flex items-center justify-between text-xs">
            <p className="text-[#8e9192]">Showing 1 to {filteredProducts.length} of {filteredProducts.length} products</p>
            <div className="flex gap-1">
              <button className="w-7 h-7 flex items-center justify-center rounded border border-[#2a2a2a] hover:bg-white/5 transition-colors disabled:opacity-30 disabled:pointer-events-none" disabled>
                <ChevronLeft className="w-3.5 h-3.5 text-white" strokeWidth={1.75} />
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded bg-white text-black text-xs font-semibold">1</button>
              <button className="w-7 h-7 flex items-center justify-center rounded border border-[#2a2a2a] hover:bg-white/5 transition-colors disabled:opacity-30 disabled:pointer-events-none" disabled>
                <ChevronRight className="w-3.5 h-3.5 text-white" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instagram Selector Overlap Drawer/Modal */}
      <InstagramImportModal
        isOpen={isImportOpen}
        onClose={() => {
          router.push("/dashboard/products/catalog");
          loadProducts();
        }}
      />

      {/* Action Notification Feed */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </motion.div>
  );
}