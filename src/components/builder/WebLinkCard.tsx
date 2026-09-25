'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Globe, ExternalLink, Link2, ArrowUpRight, ShieldCheck } from 'lucide-react';

export interface WebLinkCardProps {
  customTitle?: string;
  customUrl?: string;
  customDescription?: string;
  size?: 'full' | 'compact' | 'canvas';
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export function WebLinkCard({
  customTitle,
  customUrl,
  customDescription,
  size = 'full',
  onClick,
  className,
}: WebLinkCardProps) {
  const rawUrl = customUrl || 'https://example.com';
  const displayUrl = React.useMemo(() => {
    try {
      const formatted = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
      const parsed = new URL(formatted);
      return parsed.hostname + (parsed.pathname !== '/' ? parsed.pathname : '');
    } catch (e) {
      return rawUrl.replace(/^https?:\/\//, '') || 'example.com';
    }
  }, [rawUrl]);

  const title = customTitle || 'Web Link Target';
  const description = customDescription || 'Opens interactive web link in popup window';

  const handleOpenPopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    const width = 800;
    const height = 600;
    const left = typeof window !== 'undefined' ? Math.max(0, Math.floor((window.innerWidth - width) / 2)) : 100;
    const top = typeof window !== 'undefined' ? Math.max(0, Math.floor((window.innerHeight - height) / 2)) : 100;
    const formattedUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `https://${rawUrl}`;

    window.open(
      formattedUrl,
      'popupWindow',
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
    );
  };

  if (size === 'compact' || size === 'canvas') {
    return (
      <div
        onClick={onClick}
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-cyan-500/20 bg-zinc-900/90 shadow-2xl transition-all select-none group",
          onClick && "cursor-pointer hover:border-cyan-400/40",
          className
        )}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/60 via-zinc-900 to-black pointer-events-none" />

        {/* Ambient Glows */}
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-600/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-blue-600/10 blur-2xl pointer-events-none" />

        {/* Content */}
        <div className="relative flex flex-col justify-between p-4.5 gap-3">
          {/* Top section */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              {/* Globe Icon Ring */}
              <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[2px] shadow-lg shadow-cyan-500/10">
                <div className="h-full w-full rounded-full bg-zinc-900 p-2 flex items-center justify-center text-cyan-400">
                  <Globe className="h-5 w-5" />
                </div>
              </div>

              {/* Title & Domain */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate leading-tight">
                    {title}
                  </span>

                </div>
                <p className="text-[10px] text-zinc-400 truncate mt-0.5 font-mono">
                  {displayUrl}
                </p>
              </div>
            </div>

            {/* External Link Glyph */}
            <button
              type="button"
              onClick={handleOpenPopup}
              title="Open Link in Popup"
              className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-2 shrink-0 hover:bg-cyan-500/20 text-cyan-300 transition-all cursor-pointer"
            >
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>

          {/* URL Box */}
          <div className="bg-black/60 border border-white/10 rounded p-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 text-[10px] text-zinc-300 font-mono">
              <Link2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{rawUrl}</span>
            </div>
            <span title="Secure Link">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            </span>
          </div>

          {/* Action button */}
          {/* <button
            type="button"
            onClick={handleOpenPopup}
            className="w-full rounded bg-gradient-to-r from-cyan-500 to-blue-600 py-2 px-3 text-xs font-bold text-white transition hover:from-cyan-400 hover:to-blue-500 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
          >
            <span>Open in Browser</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button> */}
        </div>
      </div>
    );
  }

  // Full Aspect Card
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative w-full max-w-[500px] aspect-[5/3] overflow-hidden rounded-3xl border border-cyan-500/30 bg-zinc-900 shadow-2xl select-none group",
        onClick && "cursor-pointer hover:border-cyan-400/50",
        className
      )}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950 via-zinc-900 to-black pointer-events-none" />

      {/* Glow Effects */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

      {/* Card Content */}
      <div className="relative flex h-full flex-col justify-between p-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[3px] shadow-xl shadow-cyan-500/20">
              <div className="h-full w-full rounded-full bg-zinc-900 p-3 flex items-center justify-center text-cyan-400">
                <Globe className="h-8 w-8" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {title}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  Web Link
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400 font-mono">
                {displayUrl}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenPopup}
            className="rounded-xl border border-white/10 bg-white/5 p-3 shrink-0 hover:bg-white/10 text-white transition-all cursor-pointer"
          >
            <ExternalLink className="h-5 w-5" />
          </button>
        </div>

        {/* Bottom Section */}
        <div className="space-y-4">
          <div className="bg-black/60 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 text-xs text-zinc-300 font-mono">
              <Link2 className="h-4 w-4 text-cyan-400 shrink-0" />
              <span className="truncate">{rawUrl}</span>
            </div>
            <span title="Secure Link">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenPopup}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 py-3 text-sm font-bold text-white transition hover:brightness-110 cursor-pointer shadow-lg flex items-center justify-center gap-2"
          >
            <span>Open Link in Browser Window</span>
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
