'use client';

import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { updateNodeData, selectNode } from '@/store/slices/flowSlice';
import { AUTOMATION_MANIFESTS } from '@/lib/manifest';
import { Input, Select, Switch } from '@/components/ui/InputForm';
import { X, ExternalLink, GripHorizontal } from 'lucide-react';
import { motion, useDragControls, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';
import { InstagramMediaPicker } from '@/components/builder/InstagramMediaPicker';

export function RightSidebar() {
  const dispatch = useDispatch();
  const selectedNodeId = useSelector((state: RootState) => state.flow.selectedNodeId);
  const selectedNode = useSelector((state: RootState) => state.flow.nodes.find(n => n.id === selectedNodeId));
  const selectedNodeRect = useSelector((state: RootState) => state.flow.selectedNodeRect);
  const [pickerOpen, setPickerOpen] = React.useState<string | null>(null);
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

  if (!selectedNode) return null;

  const ruleType = selectedNode.ruleType || 'comment_automation';
  const definitions = AUTOMATION_MANIFESTS[ruleType]?.nodeDefinitions[selectedNode.type] || [];

  const handleUpdate = (key: string, value: any) => {
    dispatch(updateNodeData({ id: selectedNode.id, key, value }));
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
          <h3 className={cn("text-xs font-bold uppercase tracking-wider", selectedNodeRect ? "text-[#8FE3FF]" : "text-white")}>
            {selectedNode.type} Settings
          </h3>
        </div>
        <button onClick={() => dispatch(selectNode(null))} className="p-1 rounded-md hover:bg-white/10 text-on-surface-variant transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {definitions.map((def) => {
          // Check dependencies
          if (def.dependsOn) {
            const depVal = selectedNode.data[def.dependsOn.field];
            if (depVal !== def.dependsOn.value) return null;
          }

          const value = selectedNode.data[def.name];

          switch (def.type) {
            case 'select':
              return (
                <Select
                  key={def.name}
                  label={def.label}
                  value={value || ''}
                  onChange={(e) => handleUpdate(def.name, e.target.value)}
                >
                  <option value="" disabled>Select an option</option>
                  {def.options?.map(o => (
                    <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
                  ))}
                </Select>
              );
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
             case 'resource_picker':
               return (
                <div key={def.name} className="space-y-2">
                  <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">{def.label}</label>
                  <div onClick={() => setPickerOpen(def.name)} className="flex h-10 w-full items-center justify-between rounded-md bg-surface-container border border-white/10 px-3 cursor-pointer hover:bg-surface-container-highest transition-colors">
                    <span className="text-sm text-on-surface-variant">
                      {value?.length ? `${value.length} items selected` : 'Select Resource...'}
                    </span>
                    <ExternalLink className="h-4 w-4 text-on-surface-variant" />
                  </div>
                  <InstagramMediaPicker
                    open={pickerOpen === def.name}
                    onClose={() => setPickerOpen(null)}
                    onSelect={(ids) => handleUpdate(def.name, ids)}
                    selectedIds={value || []}
                    resourceType={def.resourceType || 'media'}
                  />
                </div>
               );
            default:
              return null;
          }
        })}
      </div>
    </motion.div>
  );
}
