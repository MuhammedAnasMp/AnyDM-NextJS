'use client';

import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { undo, redo, selectNode, setFlow, updateFlowName, updateNodeData } from '@/store/slices/flowSlice';
import { Undo, Redo, Settings, Eye, EyeOff, Loader2, ArrowLeft, Pencil, Calendar, ChevronDown, X, Trash2, Check } from 'lucide-react';
import api from '@/lib/services/api.service';
import { useRouter, useSearchParams } from 'next/navigation';
import Toast from '../Toast';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export function Topbar({ onTogglePreview, showPreview }: { onTogglePreview: () => void, showPreview: boolean }) {
  const flow = useSelector((state: RootState) => state.flow);
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const flowIdParam = searchParams.get('id');
  const isExistingFlow = !!(flowIdParam || (flow.id && /^\d+$/.test(String(flow.id))));

  const appUser = useSelector((state: RootState) => state.auth.user);
  const activeAccountId = appUser?.active_instagram_account_id;

  const triggerNode = flow.nodes.find(n => n.type === 'trigger');
  const [isSaving, setIsSaving] = React.useState(false);
  const [isTopbarHidden, setIsTopbarHidden] = React.useState(false);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [tempTitle, setTempTitle] = React.useState(flow.name);
  const [showSchedulePopover, setShowSchedulePopover] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false
  });

  React.useEffect(() => {
    setTempTitle(flow.name);
  }, [flow.name]);

  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('schedule-popover-state', { detail: showSchedulePopover }));
  }, [showSchedulePopover]);

  const toLocalDatetimeStr = (isoStr?: string | null) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${mins}`;
    } catch (e) {
      return '';
    }
  };

  const formatShortDate = (isoStr?: string | null) => {
    if (!isoStr) return null;
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return null;
    }
  };

  const applyPreset = (days: number | null) => {
    if (!triggerNode) return;
    const now = new Date();
    dispatch(updateNodeData({ id: triggerNode.id, key: 'start_at', value: now.toISOString() }));
    if (days === null) {
      dispatch(updateNodeData({ id: triggerNode.id, key: 'end_at', value: null }));
    } else {
      const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      dispatch(updateNodeData({ id: triggerNode.id, key: 'end_at', value: end.toISOString() }));
    }
  };

  const startFormatted = formatShortDate(triggerNode?.data?.start_at as string);
  const endFormatted = formatShortDate(triggerNode?.data?.end_at as string);

  const handleTitleSubmit = () => {
    const trimmed = tempTitle.trim();
    if (trimmed && trimmed !== flow.name) {
      dispatch(updateFlowName(trimmed));
    } else {
      setTempTitle(flow.name);
    }
    setIsEditingTitle(false);
  };

  const canUndo = (flow.past && flow.past.length > 0) || false;
  const canRedo = (flow.future && flow.future.length > 0) || false;

  const handleSave = async (status: 'draft' | 'active') => {
    if (isSaving) return;

    let hasValidationError = false;
    let firstErrorNodeId: string | null = null;
    let firstErrorMessage: string = '';

    // Clear old validation errors first
    flow.nodes.forEach(n => {
      if (n.data?.validationError) {
        dispatch(updateNodeData({ id: n.id, key: 'validationError', value: null }));
      }
    });

    // Mandatory Check: Ensure at least ONE Action Node is configured before saving
    const actionNodes = flow.nodes.filter(n => n.type === 'action' && n.data?.parent_event !== 'TRACK_ORDER');
    if (actionNodes.length > 0) {
      const hasAnyConfiguredAction = actionNodes.some(node => {
        if (node.data?.is_placeholder) return false;
        const actionType = node.data?.action_type || 'reply_comment';
        if (actionType === 'reply_comment') {
          const msgs = (node.data?.messages as string[] || []).filter(m => m && typeof m === 'string' && m.trim().length > 0);
          return msgs.length > 0;
        } else if (actionType === 'send_dm') {
          const dmFormat = node.data?.dm_format || 'text';
          if (dmFormat === 'text') {
            const msgs = (node.data?.messages as string[] || []).filter(m => m && typeof m === 'string' && m.trim().length > 0);
            return msgs.length > 0;
          }
          return true;
        }
        return false;
      });

      if (!hasAnyConfiguredAction) {
        hasValidationError = true;
        const errMsg = "Please configure at least 1 reply action (Public Reply or Direct Message) before saving.";
        actionNodes.forEach(node => {
          if (node.data?.is_placeholder) {
            dispatch(updateNodeData({ id: node.id, key: 'validationError', value: errMsg }));
          }
        });
        firstErrorNodeId = actionNodes[0].id;
        firstErrorMessage = errMsg;
      }
    }

    if (status === 'active' && !hasValidationError) {
      // 1. Validate Card 2 (Filter / Condition Node)
      const conditionNodes = flow.nodes.filter(n => n.type === 'condition');
      for (const node of conditionNodes) {
        const matchType = node.data?.match_type || 'contains';
        if (matchType === 'contains') {
          const kw = (node.data?.keywords || []).filter((k: string) => k.trim().length > 0);
          if (kw.length === 0) {
            hasValidationError = true;
            const errMsg = "Card 2 Error: Please enter at least 1 keyword for keyword filter before setting live.";
            dispatch(updateNodeData({ id: node.id, key: 'validationError', value: errMsg }));
            if (!firstErrorNodeId) {
              firstErrorNodeId = node.id;
              firstErrorMessage = errMsg;
            }
          }
        } else if (matchType === 'equals') {
          const kwEq = (node.data?.keywords_equals || []).filter((k: string) => k.trim().length > 0);
          if (kwEq.length === 0) {
            hasValidationError = true;
            const errMsg = "Card 2 Error: Please enter at least 1 exact match keyword before setting live.";
            dispatch(updateNodeData({ id: node.id, key: 'validationError', value: errMsg }));
            if (!firstErrorNodeId) {
              firstErrorNodeId = node.id;
              firstErrorMessage = errMsg;
            }
          }
        }

        if (node.data?.follower_gate) {
          const fgMsgs = (node.data?.follower_gate_messages || []).filter((m: string) => m.trim().length > 0);
          if (fgMsgs.length === 0) {
            hasValidationError = true;
            const errMsg = "Card 2 Error: Please provide a non-empty Follower Gate message.";
            dispatch(updateNodeData({ id: node.id, key: 'validationError', value: errMsg }));
            if (!firstErrorNodeId) {
              firstErrorNodeId = node.id;
              firstErrorMessage = errMsg;
            }
          }
        }
      }
    }

    if (hasValidationError) {
      setToast({ message: firstErrorMessage, type: 'error', visible: true });
      if (firstErrorNodeId) {
        dispatch(selectNode({ id: firstErrorNodeId, rect: null }));
      }
      return;
    }

    setIsSaving(true);
    setToast({ message: `Saving automation as ${status}...`, type: 'info', visible: true });
    try {
      if (status === 'active' && activeAccountId) {
        const isIcebreakers = flow.name === "Welcome Message Flow";
        const isMenu = flow.name === "Persistent Menu Flow";
        if (isIcebreakers || isMenu) {
          const triggerNode = flow.nodes.find(n => n.type === 'trigger');
          if (triggerNode) {
            if (isIcebreakers) {
              const icebreakers = triggerNode.data?.icebreakers || [];
              const welcomePrompt = triggerNode.data?.welcome_prompt || "Tap to send a question suggested by us";
              await api.post(`/crm/messenger-profile/ice-breakers/`, {
                account_id: activeAccountId,
                ice_breakers: icebreakers
              });
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
              await api.post(`/crm/messenger-profile/persistent-menu/`, {
                account_id: activeAccountId,
                composer_input_disabled: composerDisabled,
                call_to_actions: menuItems
              });
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

  React.useEffect(() => {
    const handleToggle = () => setIsTopbarHidden(prev => !prev);
    window.addEventListener('toggle-topbar', handleToggle);
    return () => window.removeEventListener('toggle-topbar', handleToggle);
  }, []);

  return (
    <div className={cn("w-full flex flex-col bg-[#131313] border-b border-white/5 z-10 shrink-0", isTopbarHidden && "hidden")}>
      <div className="h-11 sm:h-12 px-2 sm:px-2 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => {
              router.push('/dashboard/automation');
            }}
            className="p-1 rounded hover:bg-white/5 text-white/60 hover:text-white transition-all cursor-pointer mr-0.5 flex items-center justify-center"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          {(() => {
            const isSpecialFlowName = flow.name === "Welcome Message Flow" || flow.name === "Persistent Menu Flow";
            if (!isSpecialFlowName && isEditingTitle) {
              return (
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSubmit();
                    if (e.key === 'Escape') {
                      setTempTitle(flow.name);
                      setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                  className="bg-[#1a1a1a] border border-white/20 rounded px-2 py-0.5 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-white/50 font-sans"
                />
              );
            }
            return (
              <div
                onClick={() => {
                  if (!isSpecialFlowName) setIsEditingTitle(true);
                }}
                className={cn(
                  "flex items-center gap-1.5",
                  !isSpecialFlowName && "group cursor-pointer hover:opacity-85 transition-opacity"
                )}
                title={isSpecialFlowName ? flow.name : "Click to edit automation name"}
              >
                <h1 className="text-xs sm:text-sm font-semibold text-white tracking-tight truncate max-w-[120px] sm:max-w-none">{flow.name}</h1>
                {!isSpecialFlowName && (
                  <Pencil className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                )}
              </div>
            );
          })()}
          <span className="hidden sm:block text-[11px] text-[#8e9192] italic">Edited just now</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-0.5 bg-[#1a1a1a] border border-white/5 rounded-full p-0.5 mr-0.5 shadow-inner">
            <button
              onClick={() => dispatch(undo())}
              disabled={!canUndo}
              className={`p-1 rounded-full transition-all ${canUndo
                ? 'text-white hover:bg-white/10 hover:scale-105 active:scale-95'
                : 'text-white/25 cursor-not-allowed opacity-40'
                }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => dispatch(redo())}
              disabled={!canRedo}
              className={`p-1 rounded-full transition-all ${canRedo
                ? 'text-white hover:bg-white/10 hover:scale-105 active:scale-95'
                : 'text-white/25 cursor-not-allowed opacity-40'
                }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Desktop Schedule & Popover Trigger */}
          <div className="hidden sm:block relative">
            <button
              type="button"
              onClick={() => setShowSchedulePopover(!showSchedulePopover)}
              className="h-8 px-2.5 rounded-full bg-[#1a1a1a] text-white border border-white/10 font-semibold text-xs hover:bg-white/10 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              title="Configure automation schedule date & time"
            >
              <Calendar className="w-3.5 h-3.5 text-[#c4c0ff]" />
              <span className="font-medium text-xs text-white truncate max-w-[90px] sm:max-w-none">
                {startFormatted && endFormatted
                  ? `${startFormatted} – ${endFormatted}`
                  : startFormatted
                    ? `From ${startFormatted}`
                    : 'Always Active'}
              </span>
              <ChevronDown className={cn("w-3 h-3 text-zinc-400 transition-transform duration-200", showSchedulePopover && "rotate-180")} />
            </button>

            {showSchedulePopover && (
              <div className="absolute right-0 top-12 z-[9999] w-80 bg-[#131313]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-4 animate-in fade-in zoom-in-95 duration-150 text-white font-inter">
                <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#c4c0ff]" />
                    <span className="text-xs font-bold tracking-wider text-white">Automation Schedule</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSchedulePopover(false)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 tracking-wider block">QUICK PRESETS</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyPreset(7)}
                      className="px-2.5 py-2 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-semibold text-white transition-all text-center cursor-pointer active:scale-95"
                    >
                      7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset(10)}
                      className="px-2.5 py-2 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-semibold text-white transition-all text-center cursor-pointer active:scale-95"
                    >
                      10 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset(30)}
                      className="px-2.5 py-2 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-semibold text-white transition-all text-center cursor-pointer active:scale-95"
                    >
                      30 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset(null)}
                      className="px-2.5 py-2 rounded bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-bold text-[#c4c0ff] transition-all text-center cursor-pointer active:scale-95"
                    >
                      Always
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 tracking-wider block">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={toLocalDatetimeStr(triggerNode?.data?.start_at as string)}
                      onChange={(e) => {
                        if (triggerNode) {
                          const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                          dispatch(updateNodeData({ id: triggerNode.id, key: 'start_at', value: val }));
                        }
                      }}
                      style={{ colorScheme: 'dark' }}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 tracking-wider block">End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={toLocalDatetimeStr(triggerNode?.data?.end_at as string)}
                      onChange={(e) => {
                        if (triggerNode) {
                          const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                          dispatch(updateNodeData({ id: triggerNode.id, key: 'end_at', value: val }));
                        }
                      }}
                      style={{ colorScheme: 'dark' }}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  {(triggerNode?.data?.start_at || triggerNode?.data?.end_at) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (triggerNode) {
                          dispatch(updateNodeData({ id: triggerNode.id, key: 'start_at', value: null }));
                          dispatch(updateNodeData({ id: triggerNode.id, key: 'end_at', value: null }));
                        }
                      }}
                      className="w-full py-2.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-red-500 hover:text-rose-200 font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Remove Dates
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowSchedulePopover(false)}
                    className="w-full py-2.5 rounded bg-white text-black font-bold text-xs hover:bg-white/90 transition-all cursor-pointer shadow-md active:scale-98"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Schedule & Save Action Trigger */}
          <button
            type="button"
            onClick={() => setShowSchedulePopover(!showSchedulePopover)}
            className="sm:hidden h-8 px-3 rounded-full bg-white text-black font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer shrink-0"
            title="Publish or Schedule Automation"
          >
            <Check className="w-3.5 h-3.5 text-black" />
            <span>Publish</span>
          </button>

          {/* Mobile Modal Dialog */}
          {showSchedulePopover && (
            <div className="sm:hidden">
              <div
                className="fixed inset-0 bg-black/70 z-[9998] backdrop-blur-sm"
                onClick={() => setShowSchedulePopover(false)}
              />

              <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[9999] w-auto max-w-sm mx-auto bg-[#131313]/98 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-4 animate-in fade-in zoom-in-95 duration-150 text-white font-inter">
                <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#c4c0ff]" />
                    <span className="text-xs font-bold tracking-wider text-white">Schedule & Actions</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSchedulePopover(false)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 tracking-wider block">QUICK PRESETS</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyPreset(7)}
                      className="px-2.5 py-2 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-semibold text-white transition-all text-center cursor-pointer active:scale-95"
                    >
                      7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset(10)}
                      className="px-2.5 py-2 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-semibold text-white transition-all text-center cursor-pointer active:scale-95"
                    >
                      10 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset(30)}
                      className="px-2.5 py-2 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-semibold text-white transition-all text-center cursor-pointer active:scale-95"
                    >
                      30 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset(null)}
                      className="px-2.5 py-2 rounded bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-bold text-[#c4c0ff] transition-all text-center cursor-pointer active:scale-95"
                    >
                      Always
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 tracking-wider block">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={toLocalDatetimeStr(triggerNode?.data?.start_at as string)}
                      onChange={(e) => {
                        if (triggerNode) {
                          const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                          dispatch(updateNodeData({ id: triggerNode.id, key: 'start_at', value: val }));
                        }
                      }}
                      style={{ colorScheme: 'dark' }}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 tracking-wider block">End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={toLocalDatetimeStr(triggerNode?.data?.end_at as string)}
                      onChange={(e) => {
                        if (triggerNode) {
                          const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                          dispatch(updateNodeData({ id: triggerNode.id, key: 'end_at', value: val }));
                        }
                      }}
                      style={{ colorScheme: 'dark' }}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                {(triggerNode?.data?.start_at || triggerNode?.data?.end_at) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (triggerNode) {
                        dispatch(updateNodeData({ id: triggerNode.id, key: 'start_at', value: null }));
                        dispatch(updateNodeData({ id: triggerNode.id, key: 'end_at', value: null }));
                      }
                    }}
                    className="w-full py-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-red-500 hover:text-rose-200 font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Remove Dates
                  </button>
                )}

                <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSchedulePopover(false);
                        handleSave('draft');
                      }}
                      disabled={isSaving}
                      className="flex-1 py-2.5 rounded bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs transition-all cursor-pointer text-center"
                    >
                      Save Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSchedulePopover(false);
                        handleSave('active');
                      }}
                      disabled={isSaving}
                      className="flex-1 py-2.5 rounded bg-white text-black font-bold text-xs hover:bg-white/90 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {isExistingFlow ? 'Update' : 'Set Live'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Actions */}
          <button
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="hidden sm:inline-block text-xs font-semibold text-[#8e9192] hover:text-white cursor-pointer transition-colors bg-transparent border-0 disabled:opacity-50 disabled:cursor-not-allowed px-1"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave('active')}
            disabled={isSaving}
            className="hidden sm:flex h-8 px-4 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/90 transition-colors items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isExistingFlow ? 'Update' : 'Set Live'}
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
