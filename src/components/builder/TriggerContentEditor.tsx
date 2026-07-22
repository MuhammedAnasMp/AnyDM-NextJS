'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { updateNodeData } from '@/store/slices/flowSlice';
import {
  Zap,
  Layers,
  Image as ImageIcon,
  Trash2,
  Plus,
  Check,
  Video,
  AlertCircle,
  ArrowRightFromLine
} from 'lucide-react';
import { InstagramMediaPicker } from './InstagramMediaPicker';

interface TriggerContentEditorProps {
  nodeId: string;
  onClose: () => void;
}

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export default function TriggerContentEditor({ nodeId, onClose }: TriggerContentEditorProps) {
  const dispatch = useDispatch();
  const nodes = useSelector((state: RootState) => state.flow.nodes);
  const node = nodes.find(n => n.id === nodeId);

  const ruleType = node?.ruleType || 'comment_automation';
  const initialTargetMode = node?.data?.target_mode || 'every';
  const initialMediaIds = node?.data?.media_ids || [];
  const initialMediaDetails = node?.data?.media_ids_details || [];

  const [targetMode, setTargetMode] = React.useState<'every' | 'selected'>(initialTargetMode);
  const [selectedMediaIds, setSelectedMediaIds] = React.useState<string[]>(initialMediaIds);
  const [selectedMediaDetails, setSelectedMediaDetails] = React.useState<any[]>(initialMediaDetails);
  const [showMediaPicker, setShowMediaPicker] = React.useState<boolean>(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!node || !mounted) return null;

  const isStoryRule = ruleType.includes('story');
  const triggerTypeName = isStoryRule ? 'Story Reply Trigger' : 'Comments & Reel Trigger';

  const getMediaImageSrc = (media: any) => {
    if (!media) return 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300';
    return media.thumbnail_url || media.media_url || media.url || media.image_url || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300';
  };

  const handleSave = () => {
    if (targetMode === 'selected' && selectedMediaIds.length === 0) {
      setValidationError(isStoryRule ? 'Please select at least one story to save specific trigger settings.' : 'Please select at least one post or reel to save specific trigger settings.');
      return;
    }
    setValidationError(null);
    dispatch(updateNodeData({ id: nodeId, key: 'target_mode', value: targetMode }));
    dispatch(updateNodeData({ id: nodeId, key: 'media_ids', value: selectedMediaIds }));
    dispatch(updateNodeData({ id: nodeId, key: 'media_ids_details', value: selectedMediaDetails }));
    onClose();
  };

  const handleRemoveMedia = (idToRemove: string) => {
    const updatedIds = selectedMediaIds.filter(id => id !== idToRemove);
    const updatedDetails = selectedMediaDetails.filter(item => item.id !== idToRemove);
    setSelectedMediaIds(updatedIds);
    setSelectedMediaDetails(updatedDetails);
    if (targetMode === 'selected' && updatedIds.length === 0) {
      setValidationError(isStoryRule ? 'Please select at least one story to save specific trigger settings.' : 'Please select at least one post or reel to save specific trigger settings.');
    }
  };

  const handleMediaSelect = (mediaIds: string[], mediaDetails: any[]) => {
    setSelectedMediaIds(mediaIds);
    if (mediaDetails && mediaDetails.length > 0) {
      setSelectedMediaDetails(mediaDetails);
    }
    if (mediaIds.length > 0) {
      setValidationError(null);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-hidden text-white font-inter">
      {/* Background Glows */}
      <div className="absolute w-[35vw] h-[35vw] rounded-full bg-[#c4c0ff] top-[-15%] left-[-15%] filter blur-[120px] opacity-[0.08] pointer-events-none z-0" />
      <div className="absolute w-[35vw] h-[35vw] rounded-full bg-[#636565] bottom-[-15%] right-[-15%] filter blur-[120px] opacity-[0.08] pointer-events-none z-0" />

      {/* Main Modal Window */}
      <div className="w-full max-w-2xl bg-[#131313]/95 backdrop-blur-3xl border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-[0_32px_64px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in duration-200 text-white relative z-10 font-inter">

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
              <ArrowRightFromLine className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-inter text-sm md:text-base font-bold text-white tracking-tight leading-tight">
                Trigger Configuration
              </h2>
              <span className="text-[11px] text-zinc-400 font-medium tracking-wide block mt-0.5 leading-tight">
                Set target Instagram content rules for automated responses
              </span>
            </div>
          </div>

          {/* Header Action Controls - Compact Button Sizes */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-white/10 text-zinc-300 font-semibold text-xs hover:bg-white/5 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded bg-white text-black font-bold text-xs hover:opacity-90 transition-all active:scale-95 flex items-center gap-1.5 shadow-lg shadow-white/5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Save
            </button>
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="px-5 py-2.5 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between text-rose-400 text-xs font-semibold shrink-0 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{validationError}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowMediaPicker(true)}
              className="text-[11px] underline font-bold hover:text-white cursor-pointer"
            >
              Select Media Now
            </button>
          </div>
        )}

        {/* Modal Body Container */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh] custom-scrollbar bg-[#131313]">

          {/* Target Scope Section */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block font-inter">
              TARGET SCOPE
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* Option 1: All Content */}
              <button
                type="button"
                onClick={() => setTargetMode('every')}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative",
                  targetMode === 'every'
                    ? "bg-white/10 border-white text-white shadow-lg ring-1 ring-white/30"
                    : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                )}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center",
                    targetMode === 'every' ? "bg-white text-black" : "bg-white/5 text-zinc-400"
                  )}>
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  {targetMode === 'every' && (
                    <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">
                    {isStoryRule ? 'All Stories' : 'All Posts & Reels'}
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    Triggers automatically on any post or story interaction.
                  </p>
                </div>
              </button>

              {/* Option 2: Selected Content */}
              <button
                type="button"
                onClick={() => setTargetMode('selected')}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative",
                  targetMode === 'selected'
                    ? "bg-white/10 border-white text-white shadow-lg ring-1 ring-white/30"
                    : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                )}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center",
                    targetMode === 'selected' ? "bg-white text-black" : "bg-white/5 text-zinc-400"
                  )}>
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                  {targetMode === 'selected' && (
                    <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">
                    {isStoryRule ? 'Specific Story' : 'Specific Posts / Reels'}
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    Limit trigger execution to chosen media.
                  </p>
                </div>
              </button>

            </div>
          </div>

          {/* Media Selection Panel */}
          {targetMode === 'selected' && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[11px]  text-white tracking-wider font-inter">Selected Media  ({selectedMediaDetails.length})</h4>
                  {/* <p className="text-[11px] text-zinc-400 mt-0.5">Choose the Instagram posts or stories to monitor</p> */}
                </div>
                {/* Decreased button size */}
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="px-4 py-2 rounded bg-white text-black font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Select Media
                </button>
              </div>

              {selectedMediaDetails.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 pt-1">
                  {selectedMediaDetails.map((media: any) => (
                    <div key={media.id} className="relative aspect-square rounded-lg bg-black border border-white/10 overflow-hidden group shadow-md">
                      <img
                        src={getMediaImageSrc(media)}
                        alt={media.caption || "Instagram Media"}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300';
                        }}
                      />
                      {media.media_type === 'VIDEO' && (
                        <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-black/70 text-[8px] font-bold text-white flex items-center gap-0.5">
                          <Video className="w-2.5 h-2.5 text-purple-400" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(media.id)}
                        className="absolute top-1 right-1 p-1 rounded bg-black/80 hover:bg-rose-600 text-white transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-white/10 rounded-xl p-5 text-center space-y-1.5 bg-black/20">
                  <ImageIcon className="w-6 h-6 text-zinc-500 mx-auto" />
                  <p className="text-xs text-zinc-400 font-medium">No media selected yet</p>
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="text-xs text-white hover:underline font-bold"
                  >
                    Browse Instagram Media
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {showMediaPicker && (
        <InstagramMediaPicker
          open={showMediaPicker}
          onClose={() => setShowMediaPicker(false)}
          selectedIds={selectedMediaIds}
          resourceType={isStoryRule ? 'story' : 'media'}
          onSelect={handleMediaSelect}
        />
      )}
    </div>,
    document.body
  );
}
