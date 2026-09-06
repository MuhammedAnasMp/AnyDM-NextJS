"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, BookOpen, ArrowRight, FileText } from "lucide-react";
import { DOCS_NAVIGATION, getAllDocArticles, DocNavItem } from "@/lib/docs";

interface DocsSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocsSearchModal({ isOpen, onClose }: DocsSearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allArticles = getAllDocArticles();
  const filteredArticles = query.trim() === ""
    ? allArticles.slice(0, 8)
    : allArticles.filter((article) => {
        const q = query.toLowerCase();
        return (
          article.title.toLowerCase().includes(q) ||
          (article.description && article.description.toLowerCase().includes(q)) ||
          article.slug.toLowerCase().includes(q)
        );
      });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0e0e0e]/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-[#1c1b1b] border border-[#353535] rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[75vh]">
        {/* Search Header */}
        <div className="flex items-center px-4 border-b border-[#2a2a2a] h-13 shrink-0">
          <Search className="w-4 h-4 text-[#8e9192] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation by title, feature, or keyword..."
            className="flex-1 bg-transparent text-sm text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-[#8e9192] hover:text-[#e5e2e1] mr-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#20201f] text-[#8e9192] border border-[#353535]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((item) => {
              const section = DOCS_NAVIGATION.find((s) => s.items.some((i) => i.slug === item.slug));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-start justify-between p-3 rounded-lg hover:bg-[#20201f] border border-transparent hover:border-[#353535] transition-all group"
                >
                  <div className="flex items-start gap-3 min-w-0 pr-2">
                    <div className="w-7 h-7 rounded-md bg-[#20201f] border border-[#2a2a2a] flex items-center justify-center text-[#8e9192] group-hover:text-[#c4c0ff] shrink-0 mt-0.5">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#e5e2e1] group-hover:text-white truncate">
                          {item.title}
                        </span>
                        {section && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#2a2a2a] text-[#8e9192]">
                            {section.title}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-[#8e9192] line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8e9192] group-hover:text-[#c4c0ff] group-hover:translate-x-0.5 transition-all shrink-0 mt-1.5 opacity-0 group-hover:opacity-100" />
                </Link>
              );
            })
          ) : (
            <div className="py-12 text-center text-[#8e9192]">
              <BookOpen className="w-8 h-8 mx-auto text-[#444748] mb-2" />
              <p className="text-xs font-medium text-[#c4c7c8]">No documentation articles found</p>
              <p className="text-[11px] mt-0.5">Try searching with a different keyword like "bio", "orders", or "scheduler".</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#131313] border-t border-[#2a2a2a] flex items-center justify-between text-[10px] text-[#8e9192]">
          <span>Tip: Navigation mirrors the main AnyDM sidebar.</span>
          <span>{filteredArticles.length} results</span>
        </div>
      </div>
    </div>
  );
}
