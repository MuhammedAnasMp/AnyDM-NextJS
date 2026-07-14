"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Settings, 
  Store, 
  Edit3, 
  Save, 
  X, 
  Search, 
  RefreshCw, 
  ShieldAlert 
} from "lucide-react";
import api from "@/lib/services/api.service";
import Toast from "@/components/Toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface StoreSetting {
  id: number;
  username: string;
  store_name: string;
  store_slug: string;
  return_policy: boolean;
  cancellation_policy: boolean;
}

const t = {
  primary: "#b6b2ff",
  onPrimary: "#111",
  surfaceContainer: "#1e1e24",
  surfaceContainerLowest: "#101012",
  surfaceContainerHigh: "#2a2a30",
  outline: "#8e9192",
  outlineVariant: "#444748",
  onSurface: "#e5e2e1",
  onSurfaceVariant: "#c4c7c8",
  accentCyan: "#a3f7ff",
  error: "#ffb4ab",
};

export default function AdminOrderSettingsPage() {
  const appUser = useSelector((state: RootState) => state.auth.user);
  const isAdmin = !!(appUser?.is_superuser || appUser?.is_staff);

  const [stores, setStores] = useState<StoreSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingStore, setEditingStore] = useState<StoreSetting | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Fields for editing
  const [editReturnPolicy, setEditReturnPolicy] = useState(false);
  const [editCancellationPolicy, setEditCancellationPolicy] = useState(false);

  const [toast, setToast] = useState({ 
    isVisible: false, 
    message: "", 
    type: "success" as "success" | "error" | "info" 
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await api.get("/crm/admin/order-settings/");
      if (Array.isArray(res.data)) {
        setStores(res.data.map((s: any) => ({
          ...s,
          return_policy: !!s.return_policy,
          cancellation_policy: !!s.cancellation_policy
        })));
      }
    } catch (err: any) {
      console.error("Error loading store list:", err);
      showToast("Failed to load store configurations.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStores();
    }
  }, [isAdmin]);

  const handleEditClick = (store: StoreSetting) => {
    setEditingStore(store);
    setEditReturnPolicy(!!store.return_policy);
    setEditCancellationPolicy(!!store.cancellation_policy);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;
    
    setIsSaving(true);
    try {
      const res = await api.post("/crm/admin/order-settings/", {
        settings_id: editingStore.id,
        return_policy: editReturnPolicy,
        cancellation_policy: editCancellationPolicy,
      });
      
      showToast("Order policies updated successfully!", "success");
      
      // Update local state
      setStores(prev => 
        prev.map(s => s.id === editingStore.id 
          ? { 
              ...s, 
              return_policy: !!res.data.return_policy, 
              cancellation_policy: !!res.data.cancellation_policy 
            } 
          : s
        )
      );
      
      setEditingStore(null);
    } catch (err: any) {
      console.error("Error saving policy settings:", err);
      showToast(err.response?.data?.error || "Failed to update order policies.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter stores
  const filteredStores = stores.filter(store => 
    store.store_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.store_slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center px-4">
        <ShieldAlert className="w-12 h-12 text-red-400" />
        <h2 className="text-base font-bold">Access Denied</h2>
        <span className="text-xs text-zinc-400 max-w-sm">
          You do not have the required administrative permissions to access this configuration panel.
        </span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6 text-[#e5e2e1] pb-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-[#444748]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-purple-950/20 border border-purple-900/30">
            <Settings className="w-5 h-5 text-[#b6b2ff]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Global Order Settings</h1>
            <p className="text-xs mt-0.5 text-zinc-400">
              Manage Return and Cancellation policies for all supplier stores.
            </p>
          </div>
        </div>
        <button 
          onClick={fetchStores}
          className="p-2 rounded hover:bg-white/5 transition-colors border border-white/10"
          title="Refresh List"
        >
          <RefreshCw className={cn("w-4 h-4 text-zinc-400", loading && "animate-spin")} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between items-center bg-[#20201f] border border-white/5 p-3 rounded-lg">
        <div className="flex items-center gap-1.5 bg-[#0e0e0e] border border-[#444748] rounded px-3 py-1.5 w-full max-w-md">
          <Search className="w-3.5 h-3.5 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search store name, username, or URL slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#b6b2ff]" />
            <span className="text-xs text-zinc-400">Loading stores list...</span>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-12 bg-[#20201f] border border-white/5 rounded-lg">
            <Store className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">No stores found matching search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-[#20201f] border border-white/5 rounded-lg shadow-md">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#444748] text-zinc-400 uppercase tracking-wider text-[10px] font-bold">
                  <th className="px-4 py-3">Store Details</th>
                  <th className="px-4 py-3">Return Policy</th>
                  <th className="px-4 py-3">Cancellation Policy</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStores.map(store => (
                  <tr key={store.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-4 space-y-0.5">
                      <div className="font-bold text-white text-sm">{store.store_name}</div>
                      <div className="text-[10px] text-zinc-400">
                        @{store.username} &middot; <span className="text-[#b6b2ff] font-semibold">{store.store_slug || "no-slug"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 max-w-[200px] truncate font-medium">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        store.return_policy 
                          ? "bg-green-500/10 border border-green-500/30 text-green-400" 
                          : "bg-red-500/10 border border-red-500/30 text-red-400"
                      )}>
                        {store.return_policy ? "Accepted" : "Not Accepted"}
                      </span>
                    </td>
                    <td className="px-4 py-4 max-w-[200px] truncate font-medium">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        store.cancellation_policy 
                          ? "bg-green-500/10 border border-green-500/30 text-green-400" 
                          : "bg-red-500/10 border border-red-500/30 text-red-400"
                      )}>
                        {store.cancellation_policy ? "Allowed" : "Not Allowed"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleEditClick(store)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-bold tracking-tight bg-purple-950/20 border border-purple-900/30 hover:bg-purple-950/40 text-[#b6b2ff] transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Policies
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Modal Dialog */}
        <AnimatePresence>
          {editingStore && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-xl border border-white/10 shadow-2xl overflow-hidden"
                style={{ backgroundColor: t.surfaceContainer }}
              >
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-[#444748] bg-[#1a1a20]">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#b6b2ff]" />
                    <span className="text-sm font-bold text-white">Edit Store Policies: {editingStore.store_name}</span>
                  </div>
                  <button 
                    onClick={() => setEditingStore(null)} 
                    className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSaveSettings} className="p-5 space-y-4">
                  <div className="flex justify-between items-center bg-[#0e0e0e] border border-[#444748] rounded px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-white font-sans">Return & Exchange Policy</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Allow customers to return or exchange products.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={editReturnPolicy}
                      onChange={(e) => setEditReturnPolicy(e.target.checked)}
                      className="w-4 h-4 accent-[#605ca2] cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-between items-center bg-[#0e0e0e] border border-[#444748] rounded px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-white font-sans">Cancellation Policy</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Allow customers to cancel orders before shipment.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={editCancellationPolicy}
                      onChange={(e) => setEditCancellationPolicy(e.target.checked)}
                      className="w-4 h-4 accent-[#605ca2] cursor-pointer"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setEditingStore(null)}
                      className="px-3.5 py-2 rounded text-xs font-bold text-zinc-400 border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold tracking-tight bg-[#605ca2] text-white hover:bg-[#605ca2]/90 disabled:opacity-50 transition-colors"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast Alert */}
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
