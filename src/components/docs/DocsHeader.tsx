"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, ArrowUpRight, BookOpen } from "lucide-react";
import DocsSearchModal from "./DocsSearchModal";

interface DocsHeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function DocsHeader({ onToggleSidebar, isSidebarOpen }: DocsHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-14 bg-[#131313]/90 backdrop-blur-md border-b border-[#20201f] px-4 lg:px-6 flex items-center justify-between">
        {/* Left: Brand and Hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-md lg:hidden text-[#8e9192] hover:text-[#e5e2e1] hover:bg-[#1c1b1b] transition-colors"
            aria-label="Toggle documentation navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/docs" className="flex items-center gap-2.5 group">
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/logo_white.png"
                alt="AnyDM Logo"
                className="w-5 h-5 object-contain transition-transform group-hover:scale-105"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-[#e5e2e1] tracking-tight">AnyDM</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#20201f] text-[#c4c0ff] border border-[#353535] font-mono font-medium">
                DOCS
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Trigger */}
        <div className="flex-1 max-w-md mx-4 hidden sm:block">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#1c1b1b] border border-[#2a2a2a] text-[#8e9192] hover:border-[#444748] hover:text-[#c4c7c8] transition-all text-xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#8e9192]" />
              <span>Search user documentation...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#20201f] text-[#8e9192] border border-[#353535] rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="sm:hidden p-2 rounded-md text-[#8e9192] hover:text-[#e5e2e1] hover:bg-[#1c1b1b]"
            aria-label="Search documentation"
          >
            <Search className="w-4 h-4" />
          </button>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#20201f] hover:bg-[#2a2a2a] border border-[#353535] text-xs font-medium text-[#e5e2e1] hover:text-white transition-all shadow-sm"
          >
            <span>Open App</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#c4c0ff]" />
          </Link>
        </div>
      </header>

      {/* Global Search Modal */}
      <DocsSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
