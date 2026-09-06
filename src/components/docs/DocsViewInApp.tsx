"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, Sparkles } from "lucide-react";

interface DocsViewInAppProps {
  appUrl: string;
  title?: string;
}

export default function DocsViewInApp({ appUrl, title }: DocsViewInAppProps) {
  if (!appUrl) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-[#1c1b1b] border border-[#353535] shadow-sm my-4 not-prose">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-md bg-[#20201f] border border-[#353535] flex items-center justify-center text-[#c4c0ff] shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-semibold text-[#e5e2e1]">
            Experience this feature in AnyDM
          </div>
          <p className="text-[11px] text-[#8e9192]">
            Open the live {title || "feature"} interface in your dashboard workspace.
          </p>
        </div>
      </div>

      <Link
        href={appUrl}
        className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-md bg-[#ffffff] text-[#131313] hover:bg-[#e5e2e1] text-xs font-semibold transition-all shadow-sm shrink-0 group"
      >
        <span>View in Application</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}
