'use client';

import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { undo, redo, selectNode, setFlow } from '@/store/slices/flowSlice';
import { Undo, Redo, Settings, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import api from '@/lib/services/api.service';
import { useRouter, useSearchParams } from 'next/navigation';
import Toast from '../Toast';

export function Topbar({ onTogglePreview, showPreview }: { onTogglePreview: () => void, showPreview: boolean }) {
  const flow = useSelector((state: RootState) => state.flow);
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const appUser = useSelector((state: RootState) => state.auth.user);
  const activeAccountId = appUser?.active_instagram_account_id;

  const [isSaving, setIsSaving] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false
  });

  const canUndo = (flow.past && flow.past.length > 0) || false;
  const canRedo = (flow.future && flow.future.length > 0) || false;

  const handleSave = async (status: 'draft' | 'active') => {
    if (isSaving) return;
    setIsSaving(true);
    setToast({ message: `Saving automation as ${status}...`, type: 'info', visible: true });
    try {
      // Special check for Welcome Message Flow or Persistent Menu Flow when Set Live
      if (status === 'active' && activeAccountId) {
        const isIcebreakers = flow.name === "Welcome Message Flow";
        const isMenu = flow.name === "Persistent Menu Flow";
        if (isIcebreakers || isMenu) {
          const triggerNode = flow.nodes.find(n => n.type === 'trigger');
          if (triggerNode) {
            if (isIcebreakers) {
              const icebreakers = triggerNode.data?.icebreakers || [];
              const welcomePrompt = triggerNode.data?.welcome_prompt || "Tap to send a question suggested by us";
              // Save to Instagram API
              await api.post(`/crm/messenger-profile/ice-breakers/`, {
                account_id: activeAccountId,
                ice_breakers: icebreakers
              });
              // Cache locally
              const storageKey = `anydm_welcome_settings_${activeAccountId}`;
              localStorage.setItem(storageKey, JSON.stringify({
                welcomePrompt,
                iceBreakers: icebreakers,
                composerInputDisabled: triggerNode.data?.composer_input_disabled || false,
                persistentMenuItems: triggerNode.data?.persistent_menu_items || [],
                isSaved: { icebreakers: true, persistent_menu: false }
              }));
            } else if (isMenu) {
              const menuItems = triggerNode.data?.persistent_menu_items || [];
              const composerDisabled = triggerNode.data?.composer_input_disabled || false;
              const welcomePrompt = triggerNode.data?.welcome_prompt || "Tap to send a question suggested by us";
              // Save to Instagram API
              await api.post(`/crm/messenger-profile/persistent-menu/`, {
                account_id: activeAccountId,
                composer_input_disabled: composerDisabled,
                call_to_actions: menuItems
              });
              // Cache locally
              const storageKey = `anydm_welcome_settings_${activeAccountId}`;
              localStorage.setItem(storageKey, JSON.stringify({
                welcomePrompt,
                iceBreakers: triggerNode.data?.icebreakers || [],
                composerInputDisabled: composerDisabled,
                persistentMenuItems: menuItems,
                isSaved: { icebreakers: false, persistent_menu: true }
              }));
            }
          }
        }
      }

      const isIntegerId = /^\d+$/.test(String(flow.id));
      const payload = {
        id: isIntegerId ? parseInt(String(flow.id), 10) : null,
        name: flow.name,
        status: status,
        nodes: flow.nodes,
        edges: flow.edges
      };

      const response = await api.post('/automations/', payload);
      if (response.data && response.data.success) {
        dispatch(setFlow({
          ...flow,
          id: String(response.data.id),
        }));
        setToast({ message: `Successfully saved as ${status}! Redirecting...`, type: 'success', visible: true });
        const redirectUrl = '/dashboard/automation';
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1200);
      } else {
        setToast({ message: "Failed to save. Invalid response.", type: 'error', visible: true });
      }
    } catch (error: any) {
      console.error("Error saving automation:", error);
      const errMsg = error.response?.data?.error || "Failed to save automation. Please try again.";
      setToast({ message: errMsg, type: 'error', visible: true });
    } finally {
      setIsSaving(false);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          if (canRedo) {
            dispatch(redo());
          }
        } else {
          e.preventDefault();
          if (canUndo) {
            dispatch(undo());
          }
        }
      } else if (modifier && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (canRedo) {
          dispatch(redo());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, canUndo, canRedo]);

  return (
    <div className="w-full flex flex-col bg-[#131313] border-b border-white/5 z-10 shrink-0">
      {/* Main Header Row */}
      <div className="h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              router.push('/dashboard/automation');
            }}
            className="p-1.5 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-all cursor-pointer mr-1 flex items-center justify-center"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white tracking-tight">{flow.name}</h1>
          <span className="text-sm font-medium text-on-surface-variant italic">Edited just now</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Undo and Redo Buttons */}
          <div className="flex items-center gap-0.5 bg-[#1a1a1a] border border-white/5 rounded-full p-1 mr-2 shadow-inner">
            <button
              onClick={() => dispatch(undo())}
              disabled={!canUndo}
              className={`p-1.5 rounded-full transition-all ${canUndo
                ? 'text-white hover:bg-white/10 hover:scale-105 active:scale-95'
                : 'text-white/25 cursor-not-allowed opacity-40'
                }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={() => dispatch(redo())}
              disabled={!canRedo}
              className={`p-1.5 rounded-full transition-all ${canRedo
                ? 'text-white hover:bg-white/10 hover:scale-105 active:scale-95'
                : 'text-white/25 cursor-not-allowed opacity-40'
                }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* <button
            onClick={onTogglePreview}
            className={`h-10 px-4 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${showPreview
              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 shadow-sm'
              : 'bg-[#181818] border-white/10 text-on-surface-variant hover:text-white hover:border-white/20'
              }`}
          >
            {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
          </button> */}
          <button
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="text-sm font-medium text-on-surface-variant hover:text-white cursor-pointer transition-colors bg-transparent border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Draft
          </button>
          <button
            onClick={() => dispatch(selectNode({ id: 'global' }))}
            className="h-10 px-4 rounded-full bg-[#1a1a1a] text-white border border-white/5 font-semibold text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4 text-[#8FE3FF]" />
            Global Settings
          </button>
          <button
            onClick={() => handleSave('active')}
            disabled={isSaving}
            className="h-10 px-6 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Set Live
          </button>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
