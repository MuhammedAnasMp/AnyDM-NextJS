'use client';

import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { updateNodeData, selectNode, updateFlowName, openMediaPicker } from '@/store/slices/flowSlice';
import { AUTOMATION_MANIFESTS, TEMPLATE_OVERRIDES } from '@/lib/manifest';
import { Input, Select, Switch } from '@/components/ui/InputForm';
import { X, ExternalLink, GripHorizontal, Sparkles, ChevronDown, ChevronRight, LayoutGrid, MessageSquare, Zap, Paperclip, Settings } from 'lucide-react';
import { motion, useDragControls, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/services/api.service';

const DM_FORMAT_OPTIONS = {
  text: {
    title: "Plain Text",
    desc: "Randomized plain text variations.",
    icon: MessageSquare,
  },
  quick_reply: {
    title: "Quick Actions",
    desc: "Interactive text reply pills (up to 13).",
    icon: Zap,
  },
  button_template: {
    title: "Action Buttons",
    desc: "Message with up to 3 link buttons.",
    icon: ChevronRight,
  },
  generic_template: {
    title: "Image Slider",
    desc: "Swipeable carousel slides with custom CTAs.",
    icon: LayoutGrid,
  },
  attachment: {
    title: "Attachments",
    desc: "Upload and send files/images.",
    icon: Paperclip,
  },
} as const;

export function RightSidebar() {
  const dispatch = useDispatch();
  const selectedNodeId = useSelector((state: RootState) => state.flow.selectedNodeId);
  const selectedNode = useSelector((state: RootState) => state.flow.nodes.find(n => n.id === selectedNodeId));
  const selectedNodeRect = useSelector((state: RootState) => state.flow.selectedNodeRect);
  const flow = useSelector((state: RootState) => state.flow);
  const triggerNode = flow.nodes.find(n => n.type === 'trigger');
  const isProfileFlow = triggerNode?.data?.is_icebreaker_trigger || triggerNode?.data?.is_menu_trigger;
  const isSelectedProfileTrigger = selectedNode?.type === 'trigger' && (selectedNode.data?.is_icebreaker_trigger || selectedNode.data?.is_menu_trigger);

  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [dmFormatDropdownOpen, setDmFormatDropdownOpen] = React.useState(false);

  const dragControls = useDragControls();
  const controls = useAnimation();

  React.useEffect(() => {
    if (selectedNodeId) {
      controls.start({
        x: 0,
        y: 0,
        opacity: 1,
        scale: selectedNodeRect ? [0.95, 1.02, 1] : [1, 1.02, 1],
        filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
        transition: { duration: 0.3 }
      });
      // Fire xarrow updates
      setTimeout(() => window.dispatchEvent(new CustomEvent('update-xarrow')), 10);
      setTimeout(() => window.dispatchEvent(new CustomEvent('update-xarrow')), 50);
      setTimeout(() => window.dispatchEvent(new CustomEvent('update-xarrow')), 200);
    }
  }, [selectedNodeId, selectedNodeRect, controls]);

  React.useEffect(() => {
    if (selectedNode?.type === 'trigger' && (selectedNode.data.target_mode || selectedNode.data.mode) === 'selected') {
      const currentIds = selectedNode.data.media_ids || [];
      if (currentIds.length === 0) {
        const isStory = selectedNode.ruleType?.includes('story');
        const endpoint = isStory ? '/accounts/instagram/stories/' : '/accounts/instagram/media-list/';

        api.get(endpoint).then(res => {
          if (res.data && res.data.data && res.data.data.length > 0) {
            const latestItem = res.data.data[0];
            dispatch(updateNodeData({
              id: selectedNode.id,
              key: 'media_ids',
              value: [latestItem.id]
            }));
            dispatch(updateNodeData({
              id: selectedNode.id,
              key: 'media_ids_details',
              value: [{
                id: latestItem.id,
                media_type: latestItem.media_type,
                media_url: latestItem.media_url || latestItem.thumbnail_url,
                thumbnail_url: latestItem.thumbnail_url
              }]
            }));
          }
        }).catch(err => {
          console.warn("Failed to default select latest media in effect:", err);
          const dummyId = "dummy_" + Date.now();
          dispatch(updateNodeData({
            id: selectedNode.id,
            key: 'media_ids',
            value: [dummyId]
          }));
          dispatch(updateNodeData({
            id: selectedNode.id,
            key: 'media_ids_details',
            value: [{
              id: dummyId,
              media_type: 'IMAGE',
              media_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150',
              thumbnail_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150'
            }]
          }));
        });
      }
    }
  }, [selectedNode?.id, selectedNode?.data.target_mode, selectedNode?.data.mode, selectedNode?.data.media_ids, dispatch]);

  if (!selectedNodeId) return null;
  const isGlobal = selectedNodeId === 'global';
  if (!selectedNode && !isGlobal) return null;

  if (selectedNode && (selectedNode.type === 'action' || selectedNode.type === 'condition')) {
    return null;
  }

  const ruleType = selectedNode?.ruleType || triggerNode?.ruleType || 'comment_automation';
  const templateId = selectedNode?.templateId || triggerNode?.templateId;

  let definitions = !isGlobal && selectedNode ? (AUTOMATION_MANIFESTS[ruleType]?.nodeDefinitions[selectedNode.type] || []) : [];

  if (selectedNode && templateId && TEMPLATE_OVERRIDES[templateId]?.hiddenFields?.[selectedNode.type]) {
    const hiddenList = TEMPLATE_OVERRIDES[templateId].hiddenFields![selectedNode.type].filter(name =>
      name !== 'dm_format' &&
      name !== 'rate_limit_limit' &&
      name !== 'rate_limit_window_seconds'
    );
    definitions = definitions.filter(def => !hiddenList.includes(def.name));
  }

  if (selectedNode && selectedNode.type === 'action') {
    const format = selectedNode.data?.dm_format;
    const actionType = selectedNode.data?.action_type || 'reply_comment';
    const isEcommerceTemplate = !!(selectedNode.ruleType && selectedNode.ruleType.includes('product_inquiry'));

    if (actionType === 'send_dm') {
      if (isEcommerceTemplate) {
        definitions = [];
      } else {
        if (!format) {
          definitions = definitions.filter(def => def.name === 'action_type' || def.name === 'dm_format');
        } else if (format !== 'text') {
          definitions = definitions.filter(def =>
            def.name !== 'messages' &&
            def.name !== 'quick_reply_text' &&
            def.name !== 'quick_replies_titles' &&
            def.name !== 'button_template_text' &&
            def.name !== 'button_template_buttons_json' &&
            def.name !== 'generic_template_elements_json'
          );
        }
      }
    }
  }

  const handleUpdate = (key: string, value: any) => {
    if (selectedNode) {
      dispatch(updateNodeData({ id: selectedNode.id, key, value }));
    }
  };

  const handleGlobalTriggerUpdate = (key: string, value: any) => {
    if (triggerNode) {
      dispatch(updateNodeData({ id: triggerNode.id, key, value }));
    }
  };

  const style: React.CSSProperties = selectedNodeRect ? {
    position: 'fixed',
    // Position it safely within bounds
    left: Math.min(selectedNodeRect.left + selectedNodeRect.width + 16, typeof window !== 'undefined' ? window.innerWidth - 340 : 1000),
    top: Math.max(16, Math.min(selectedNodeRect.top, typeof window !== 'undefined' ? window.innerHeight - 400 : 800)),
    maxHeight: 'calc(100vh - 80px)',
  } : {
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
  };

  return (
    <motion.div
      id="settings-sidebar"
      drag={!!selectedNodeRect}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onUpdate={() => { window.dispatchEvent(new CustomEvent('update-xarrow')); }}
      initial={selectedNodeRect ? { scale: 0.95, opacity: 0 } : { x: 300, opacity: 0 }}
      animate={controls}
      exit={selectedNodeRect ? { scale: 0.95, opacity: 0 } : { x: 300, opacity: 0 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
      style={style}
      className={cn(
        "w-80 flex flex-col z-50 overflow-hidden",
        selectedNodeRect
          ? "rounded-2xl bg-[#0F0F1A]/95 backdrop-blur-3xl border-[1px] border-[#8FE3FF]/30 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.6),0_0_0_1px_rgba(143,227,255,0.15)] ring-1 ring-[#8FE3FF]/10"
          : "h-full rounded-none bg-[#1c1b1b]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between p-3 border-b border-white/5",
          selectedNodeRect && "cursor-grab active:cursor-grabbing bg-[#8FE3FF]/5"
        )}
        onPointerDown={(e) => selectedNodeRect && dragControls.start(e)}
      >
        <div className="flex items-center gap-2">
          {selectedNodeRect && <GripHorizontal className="w-4 h-4 text-[#8FE3FF]/70" />}
          <h3 className={cn("text-xs font-bold uppercase tracking-wider", (selectedNodeRect || isGlobal) ? "text-[#8FE3FF]" : "text-white")}>
            {isGlobal ? 'Global Settings' : `${selectedNode?.type} Settings`}
          </h3>
        </div>
        <button
          onClick={() => dispatch(selectNode(null))}
          onPointerDown={(e) => e.stopPropagation()}
          className="p-1 rounded-md hover:bg-white/10 text-on-surface-variant transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isGlobal && (
          <div className="space-y-6 animate-fadeIn">
            <Input
              label="Campaign Name"
              value={flow.name || ''}
              onChange={(e) => dispatch(updateFlowName(e.target.value))}
              placeholder="e.g. Welcome Message Flow"
              disabled={isProfileFlow}
            />
            {isProfileFlow ? (
              <div className="bg-[#8FE3FF]/5 border border-[#8FE3FF]/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-[#8FE3FF]">
                  <Settings className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">Welcome Experience Flow</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  This flow is connected to your active Instagram Welcome configuration. Trigger properties, schedules, and status are managed directly from the Welcome Experience settings page.
                </p>
                <div className="text-[10px] text-zinc-505 font-mono pt-1">
                  Flow Name: {flow.name}
                </div>
              </div>
            ) : triggerNode ? (
              <>
                {/* <Input
                  label="Campaign ID (Unique Slug)"
                  value={triggerNode.data.campaign_id || ''}
                  onChange={(e) => handleGlobalTriggerUpdate('campaign_id', e.target.value.toLowerCase().replace(/[^a-z0-9-_]+/g, '-'))}
                  placeholder="e.g. summer-sale-2026"
                /> */}

                {/* <Select
                  label="Campaign Status"
                  value={triggerNode.data.status || 'draft'}
                  onChange={(e) => handleGlobalTriggerUpdate('status', e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </Select> */}

                <div className="border-t border-white/5 pt-4 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Campaign Schedule</h4>
                  <Input
                    type="datetime-local"
                    label="Start Date & Time"
                    value={triggerNode.data.start_at ? triggerNode.data.start_at.substring(0, 16) : ''}
                    onChange={(e) => handleGlobalTriggerUpdate('start_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                  />
                  <Input
                    type="datetime-local"
                    label="End Date & Time"
                    value={triggerNode.data.end_at ? triggerNode.data.end_at.substring(0, 16) : ''}
                    onChange={(e) => handleGlobalTriggerUpdate('end_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                  />
                  {/* <Select
                    label="Timezone"
                    value={triggerNode.data.timezone || 'UTC'}
                    onChange={(e) => handleGlobalTriggerUpdate('timezone', e.target.value)}
                  >
                    <option value="UTC">UTC (GMT+0)</option>
                    <option value="Africa/Cairo">Africa/Cairo (GMT+2)</option>
                    <option value="Europe/London">Europe/London (GMT+1)</option>
                    <option value="Europe/Paris">Europe/Paris (GMT+2)</option>
                    <option value="US/Eastern">US/Eastern (EST/EDT)</option>
                    <option value="US/Pacific">US/Pacific (PST/PDT)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  </Select> */}
                </div>

              </>
            ) : (
              <p className="text-xs text-on-surface-variant italic">Add a Trigger node to set campaign details and rate limit options.</p>
            )}
          </div>
        )}
        {isSelectedProfileTrigger && (
          <div className="bg-black/35 border border-white/5 rounded-xl p-4 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-[#8FE3FF]">
              <Settings className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">Trigger Settings Locked</span>
            </div>
            <p className="text-xs text-zinc-405 leading-relaxed">
              This trigger node represents the active questions/buttons on your Instagram profile Welcome Experience.
            </p>
            <p className="text-xs text-zinc-405 leading-relaxed">
              To update active options, layouts, or question text, please visit the Inbox Welcome configuration page.
            </p>
            <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Options:</span>
              <div className="flex flex-col gap-1.5">
                {selectedNode.data?.is_icebreaker_trigger ? (
                  (selectedNode.data?.icebreakers || []).map((ib: any, idx: number) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-left text-xs font-semibold text-white flex items-center justify-between gap-3">
                      <span>{ib.question || `Question ${idx + 1}`}</span>
                      {/* <span className="text-[8px] bg-[#8FE3FF]/15 text-[#8FE3FF] border border-[#8FE3FF]/20 px-1 py-0.2 rounded font-mono shrink-0 uppercase">{ib.payload}</span> */}
                    </div>
                  ))
                ) : (
                  (selectedNode.data?.persistent_menu_items || []).map((item: any, idx: number) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-left text-xs font-semibold text-white flex items-center justify-between gap-3">
                      <span className="truncate">{item.title || `Button ${idx + 1}`}</span>
                      {/* <span className="text-[8px] bg-purple-500/15 text-purple-400 border border-purple-500/20 px-1 py-0.2 rounded font-mono shrink-0 uppercase">
                        {item.type === 'web_url' ? 'URL' : item.payload || 'POSTBACK'}
                      </span> */}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        {selectedNode && selectedNode.type === 'action' && selectedNode.data?.parent_event === 'TRACK_ORDER' && (
          // <div className="bg-[#4f46e5]/10 border border-[#4f46e5]/20 rounded-xl p-4 space-y-4 animate-fadeIn">
          //   <div className="flex items-center gap-2 text-indigo-400">
          //     <Sparkles className="w-4 h-4 shrink-0 text-indigo-400" />
          //     <span className="text-xs font-bold uppercase tracking-wider">Dynamic Tracking Flow</span>
          //   </div>
          //   <p className="text-xs text-indigo-200 leading-relaxed font-semibold">
          //     This node represents the live Order Tracking automation flow.
          //   </p>
          //   <p className="text-xs text-zinc-400 leading-relaxed">
          //     When triggered, the system automatically runs the conversational check:
          //   </p>
          //   <div className="space-y-3 text-[11px] text-zinc-300 bg-black/40 border border-white/5 p-3 rounded-lg font-mono">
          //     <div className="flex gap-2">
          //       <span className="text-indigo-400 font-bold shrink-0">1. Prompt:</span>
          //       <span>Asks customer to reply with their Order ID.</span>
          //     </div>
          //     <div className="flex gap-2">
          //       <span className="text-indigo-400 font-bold shrink-0">2. Query:</span>
          //       <span>Looks up order status directly from database.</span>
          //     </div>
          //     <div className="flex gap-2">
          //       <span className="text-indigo-400 font-bold shrink-0">3. Reply:</span>
          //       <span>Returns status details dynamically.</span>
          //     </div>
          //   </div>
          //   <p className="text-[10px] text-zinc-500 italic leading-normal">
          //     No manual configuration of message cards or child flows is required here.
          //   </p>
          // </div>

          <>No configuration needed</>
        )}
        {!isGlobal && !isSelectedProfileTrigger && selectedNode?.data?.parent_event !== 'TRACK_ORDER' && definitions.map((def) => {
          // Check dependencies
          if (def.dependsOn) {
            const depVal = selectedNode?.data[def.dependsOn.field];
            if (depVal !== def.dependsOn.value) return null;
          }

          const value = selectedNode?.data[def.name];

          switch (def.type) {
            case 'select': {
              const isDMFormatField = def.name === 'dm_format';
              const showEditButton = isDMFormatField && value;
              return (
                <div key={def.name} className="space-y-2 relative">
                  {isDMFormatField ? (
                    <div className="space-y-2 relative">
                      <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">{def.label}</label>
                      <button
                        type="button"
                        onClick={() => setDmFormatDropdownOpen(!dmFormatDropdownOpen)}
                        className="w-full flex items-center justify-between bg-[#1c1b1b] border border-white/10 rounded-xl p-3 text-left hover:border-white/20 transition-all cursor-pointer animate-fadeIn"
                      >
                        <div className="flex items-center gap-3">
                          {(() => {
                            if (!value) {
                              return (
                                <>
                                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 shrink-0">
                                    <MessageSquare className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white leading-normal">Select Format</span>
                                    <span className="text-[10px] text-zinc-400 mt-0.5 leading-normal">Choose DM Layout type</span>
                                  </div>
                                </>
                              );
                            }
                            const currentFmt = value as keyof typeof DM_FORMAT_OPTIONS;
                            const opt = DM_FORMAT_OPTIONS[currentFmt] || DM_FORMAT_OPTIONS.text;
                            const OptIcon = opt.icon;
                            return (
                              <>
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white shrink-0">
                                  <OptIcon className="w-4 h-4 text-[#8FE3FF]" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-white leading-normal">{opt.title}</span>
                                  <span className="text-[10px] text-zinc-400 mt-0.5 leading-normal">{opt.desc}</span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                        <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                      </button>

                      {dmFormatDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#161622] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] flex flex-col divide-y divide-white/5 animate-fadeIn">
                          {Object.entries(DM_FORMAT_OPTIONS).map(([fmt, opt]) => {
                            const OptIcon = opt.icon;
                            const isSelected = (value || 'text') === fmt;
                            return (
                              <button
                                key={fmt}
                                type="button"
                                onClick={() => {
                                  handleUpdate(def.name, fmt);
                                  setDmFormatDropdownOpen(false);
                                  if (selectedNode) {
                                    setTimeout(() => {
                                      window.dispatchEvent(new CustomEvent('open-dm-format-editor', {
                                        detail: { nodeId: selectedNode.id }
                                      }));
                                    }, 50);
                                  }
                                }}
                                className={cn(
                                  "w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-colors cursor-pointer",
                                  isSelected && "bg-white/5"
                                )}
                              >
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                  isSelected ? "bg-[#8FE3FF]/25 text-[#8FE3FF]" : "bg-white/5 text-zinc-400"
                                )}>
                                  <OptIcon className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                  <span className={cn("text-xs font-bold leading-normal", isSelected ? "text-[#8FE3FF]" : "text-white")}>{opt.title}</span>
                                  <span className="text-[10px] text-zinc-400 mt-0.5 leading-normal">{opt.desc}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <Select
                        label={def.label}
                        value={value || ''}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          handleUpdate(def.name, newVal);
                          if (def.name === 'match_type' && newVal === 'any' && selectedNode) {
                            dispatch(updateNodeData({ id: selectedNode.id, key: 'keywords', value: [] }));
                            dispatch(updateNodeData({ id: selectedNode.id, key: 'keywords_equals', value: [] }));
                          }
                          if (def.name === 'target_mode' && newVal === 'selected' && selectedNode) {
                            const isStory = selectedNode.ruleType?.includes('story');
                            const endpoint = isStory ? '/accounts/instagram/stories/' : '/accounts/instagram/media-list/';

                            api.get(endpoint).then(res => {
                              if (res.data && res.data.data && res.data.data.length > 0) {
                                const latestItem = res.data.data[0];
                                dispatch(updateNodeData({
                                  id: selectedNode.id,
                                  key: 'media_ids',
                                  value: [latestItem.id]
                                }));
                                dispatch(updateNodeData({
                                  id: selectedNode.id,
                                  key: 'media_ids_details',
                                  value: [{
                                    id: latestItem.id,
                                    media_type: latestItem.media_type,
                                    media_url: latestItem.media_url || latestItem.thumbnail_url,
                                    thumbnail_url: latestItem.thumbnail_url
                                  }]
                                }));
                              }
                            }).catch(err => {
                              console.warn("Failed to default select latest media:", err);
                              const dummyId = "dummy_" + Date.now();
                              dispatch(updateNodeData({
                                id: selectedNode.id,
                                key: 'media_ids',
                                value: [dummyId]
                              }));
                              dispatch(updateNodeData({
                                id: selectedNode.id,
                                key: 'media_ids_details',
                                value: [{
                                  id: dummyId,
                                  media_type: 'IMAGE',
                                  media_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150',
                                  thumbnail_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150'
                                }]
                              }));
                            });

                            dispatch(openMediaPicker({
                              nodeId: selectedNode.id,
                              fieldKey: 'media_ids',
                              resourceType: isStory ? 'story' : 'media'
                            }));
                          }
                        }}
                      >
                        <option value="" disabled>Select an option</option>
                        {def.options?.map(o => (
                          <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
                        ))}
                      </Select>
                    </>
                  )}

                  {showEditButton && (
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('open-dm-format-editor', {
                          detail: { nodeId: selectedNode.id }
                        }));
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all border-none"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Configure Layout & Content
                    </button>
                  )}
                </div>
              );
            }
            case 'switch':
              return (
                <Switch
                  key={def.name}
                  label={def.label}
                  checked={value === true}
                  onChange={(v) => handleUpdate(def.name, v)}
                />
              );
            case 'text':
            case 'number':
            case 'datetime':
              return (
                <Input
                  key={def.name}
                  type={def.type === 'datetime' ? 'datetime-local' : def.type}
                  label={def.label}
                  value={value || ''}
                  onChange={(e) => handleUpdate(def.name, def.type === 'number' ? Number(e.target.value) : e.target.value)}
                  placeholder={def.placeholder}
                />
              );
            case 'keywords':
              return (
                <div key={def.name} className="space-y-2">
                  <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">{def.label}</label>
                  <div className="flex flex-wrap gap-2">
                    {(value || []).map((kw: string, idx: number) => (
                      <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-surface-container-highest rounded-md text-xs border border-white/10">
                        {kw}
                        <X className="h-3 w-3 cursor-pointer opacity-50 hover:opacity-100" onClick={() => {
                          const newKw = [...value];
                          newKw.splice(idx, 1);
                          handleUpdate(def.name, newKw);
                        }} />
                      </span>
                    ))}
                  </div>
                  <Input
                    placeholder="Type keyword and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        handleUpdate(def.name, [...(value || []), e.currentTarget.value]);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              );
            case 'message_list':
              return (
                <div key={def.name} className="space-y-2">
                  <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">{def.label}</label>
                  <div className="space-y-2">
                    {(value || ['']).map((msg: string, idx: number) => (
                      <div key={idx} className="flex gap-2">
                        <textarea
                          className="flex min-h-[60px] w-full rounded-md bg-surface-container border border-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-all resize-y"
                          value={msg}
                          onChange={(e) => {
                            const newMsgs = [...(value || [''])];
                            newMsgs[idx] = e.target.value;
                            handleUpdate(def.name, newMsgs);
                          }}
                        />
                        <button className="text-on-surface-variant hover:text-error pt-2 pointer-events-auto cursor-pointer" onClick={() => {
                          const newMsgs = [...value];
                          newMsgs.splice(idx, 1);
                          handleUpdate(def.name, newMsgs);
                        }}>
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button className="text-xs text-primary hover:underline font-medium pointer-events-auto cursor-pointer" onClick={() => handleUpdate(def.name, [...(value || []), ''])}>
                      + Add Message Variant
                    </button>
                  </div>
                </div>
              );
            case 'resource_picker': {
              const detailsKey = `${def.name}_details`;
              const valueDetails = selectedNode?.data[detailsKey] || [];
              const hasError = def.name === 'media_ids' && (selectedNode?.data.target_mode || selectedNode?.data.mode) === 'selected' && (!value || value.length === 0);
              return (
                <div key={def.name} className="space-y-2">
                  <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">{def.label}</label>
                  <div onClick={() => selectedNode && dispatch(openMediaPicker({
                    nodeId: selectedNode.id,
                    fieldKey: def.name,
                    resourceType: (def.resourceType as string) === 'story' ? 'story' : 'media'
                  }))} className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md bg-surface-container border px-3 cursor-pointer hover:bg-surface-container-highest transition-colors",
                    hasError ? "border-red-500/50 hover:border-red-500/80" : "border-white/10"
                  )}>
                    <span className={cn("text-sm", hasError ? "text-red-400 font-medium" : "text-on-surface-variant")}>
                      {value?.length ? `${value.length} items selected` : '⚠️ Select at least 1 media...'}
                    </span>
                    <ExternalLink className={cn("h-4 w-4", hasError ? "text-red-400" : "text-on-surface-variant")} />
                  </div>
                  {hasError && (
                    <p className="text-[10px] text-red-400 font-medium">At least one media item must be selected to save.</p>
                  )}
                  {valueDetails.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin">
                      {valueDetails.map((m: any) => (
                        <div key={m.id} className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
                          <img src={m.thumbnail_url || m.media_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            case 'textarea': {
              let isInvalidJson = false;
              if (value && (def.name.endsWith('_json') || def.name.includes('weights'))) {
                try {
                  JSON.parse(value);
                } catch (e) {
                  isInvalidJson = true;
                }
              }
              return (
                <div key={def.name} className="flex flex-col gap-1 w-full">
                  <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">{def.label}</label>
                  <textarea
                    className={cn(
                      "flex min-h-[120px] w-full rounded-md bg-[#1c1b1b] border px-3 py-2 text-xs text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 transition-all font-mono resize-y",
                      isInvalidJson
                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                        : "border-white/10 focus:border-white/20 focus:ring-white/20"
                    )}
                    value={value || ''}
                    onChange={(e) => handleUpdate(def.name, e.target.value)}
                    placeholder={def.placeholder}
                  />
                  {isInvalidJson && <p className="text-[11px] text-red-400 font-medium">⚠️ Invalid JSON format</p>}
                  {def.helperText && <p className="text-xs text-on-surface-variant/70">{def.helperText}</p>}
                </div>
              );
            }
            default:
              return null;
          }
        })}
        {selectedNode && selectedNode.type === 'condition' && (
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-dm-format-editor', {
                detail: { nodeId: selectedNode.id }
              }));
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all border-none mt-4"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Configure Filter & Gate
          </button>
        )}
      </div>
    </motion.div>
  );
}
