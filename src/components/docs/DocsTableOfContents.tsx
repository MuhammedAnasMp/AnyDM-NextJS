"use client";

import React, { useEffect, useState } from "react";
import { DocHeading } from "@/lib/docs";
import { List, ArrowUp, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocsTableOfContentsProps {
  headings: DocHeading[];
  appUrl?: string;
}

export default function DocsTableOfContents({ headings, appUrl }: DocsTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const headingElements = headings
        .map((h) => document.getElementById(h.id))
        .filter((el): el is HTMLElement => el !== null);

      const scrollPosition = window.scrollY + 120;

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i];
        if (el.offsetTop <= scrollPosition) {
          setActiveId(el.id);
          return;
        }
      }

      if (headingElements.length > 0 && window.scrollY < 100) {
        setActiveId(headingElements[0].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (headings.length === 0) return null;

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center gap-2 text-xs font-semibold text-[#e5e2e1] uppercase tracking-wider pb-2 border-b border-[#20201f]">
        <Hash className="w-3.5 h-3.5 text-[#c4c0ff]" />
        <span>On This Page</span>
      </div>

      <nav className="space-y-1">
        <ul className="space-y-1 text-xs">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;
            return (
              <li
                key={heading.id}
                className={cn(
                  "transition-all",
                  heading.level === 3 ? "ml-3.5" : "ml-0"
                )}
              >
                <a
                  href={`#${heading.id}`}
                  className={cn(
                    "flex items-center gap-1.5 py-1 px-2 rounded transition-colors truncate group text-[11px]",
                    isActive
                      ? "bg-[#20201f] text-[#c4c0ff] font-semibold border-l-2 border-[#c4c0ff]"
                      : "text-[#8e9192] hover:text-[#e5e2e1] hover:bg-[#1c1b1b]"
                  )}
                >
                  <span className="text-[10px] text-[#444748] group-hover:text-[#8e9192] shrink-0">#</span>
                  <span className="truncate">{heading.text}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="pt-3 border-t border-[#20201f] flex items-center justify-between text-[11px] text-[#8e9192]">
        <button
          onClick={scrollToTop}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowUp className="w-3 h-3" />
          <span>Back to top</span>
        </button>

        {appUrl && (
          <a
            href={appUrl}
            className="text-[#c4c0ff] hover:underline"
          >
            Open App →
          </a>
        )}
      </div>
    </div>
  );
}
