"use client";

import React, { useEffect, useState } from "react";
import { DocHeading } from "@/lib/docs";
import { List, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocsTableOfContentsProps {
  headings: DocHeading[];
}

export default function DocsTableOfContents({ headings }: DocsTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -80% 0px" }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#e5e2e1] uppercase tracking-wider">
        <List className="w-3.5 h-3.5 text-[#c4c0ff]" />
        <span>On This Page</span>
      </div>

      <ul className="space-y-1 text-xs border-l border-[#2a2a2a] pl-2.5">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <li
              key={heading.id}
              style={{ paddingLeft: heading.level === 3 ? "0.75rem" : "0" }}
            >
              <a
                href={`#${heading.id}`}
                className={cn(
                  "block py-0.5 transition-colors truncate",
                  isActive
                    ? "text-[#c4c0ff] font-medium"
                    : "text-[#8e9192] hover:text-[#e5e2e1]"
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
