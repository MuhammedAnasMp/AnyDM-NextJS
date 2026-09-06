"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Link2,
  Zap,
  CalendarClock,
  Package,
  MessageSquare,
  Gift,
  DollarSign,
  CreditCard,
  Settings,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { DOCS_NAVIGATION, DocSection } from "@/lib/docs";
import { cn } from "@/lib/utils";

interface DocsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Link2,
  Zap,
  CalendarClock,
  Package,
  MessageSquare,
  Gift,
  DollarSign,
  CreditCard,
  Settings,
  ShieldAlert,
};

export default function DocsSidebar({ isOpen, onClose }: DocsSidebarProps) {
  const pathname = usePathname();

  // Keep all sections open by default for easy browsing, or track open states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};
    DOCS_NAVIGATION.forEach((sec) => {
      state[sec.slug] = true;
    });
    return state;
  });

  const toggleSection = (slug: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#0e0e0e]/70 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={cn(
          "fixed top-14 bottom-0 left-0 z-30 w-64 bg-[#131313] border-r border-[#20201f] overflow-y-auto p-3.5 select-none transition-transform duration-200 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider px-2 mb-2">
          Navigation Hierarchy
        </div>

        <nav className="space-y-3 pb-8">
          {DOCS_NAVIGATION.map((section: DocSection) => {
            const Icon = ICON_MAP[section.iconName] || LayoutDashboard;
            const isSectionExpanded = openSections[section.slug] ?? true;
            const hasMultipleItems = section.items.length > 1;
            const isSingleItemActive =
              !hasMultipleItems && pathname === section.items[0]?.href;

            if (!hasMultipleItems) {
              // Direct single link section (e.g., Dashboard, Schedule, Refer, Creator Hub, Pricing)
              const singleItem = section.items[0];
              const isActive = pathname === singleItem.href;
              return (
                <div key={section.slug}>
                  <Link
                    href={singleItem.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group",
                      isActive
                        ? "bg-[#20201f] text-white border border-[#353535]/80 font-semibold shadow-sm"
                        : "text-[#c4c7c8] hover:text-white hover:bg-[#1c1b1b]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isActive ? "text-[#c4c0ff]" : "text-[#8e9192] group-hover:text-[#e5e2e1]"
                      )}
                    />
                    <span className="truncate">{section.title}</span>
                  </Link>
                </div>
              );
            }

            // Multi-item expandable section (e.g., Link-in-Bio, Automations, Products, Inbox, Settings, Admin)
            const isAnySubItemActive = section.items.some(
              (item) => pathname === item.href || pathname.startsWith(item.href + "/")
            );

            return (
              <div key={section.slug} className="space-y-0.5">
                <button
                  onClick={() => toggleSection(section.slug)}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors group cursor-pointer",
                    isAnySubItemActive
                      ? "text-white font-semibold"
                      : "text-[#c4c7c8] hover:text-white hover:bg-[#1c1b1b]"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isAnySubItemActive
                          ? "text-[#c4c0ff]"
                          : "text-[#8e9192] group-hover:text-[#e5e2e1]"
                      )}
                    />
                    <span className="truncate">{section.title}</span>
                  </div>
                  {isSectionExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[#8e9192]" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[#8e9192]" />
                  )}
                </button>

                {isSectionExpanded && (
                  <div className="ml-4 pl-2.5 border-l border-[#2a2a2a] space-y-0.5 mt-0.5">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "block px-2 py-1 rounded text-[11px] transition-all truncate",
                            isActive
                              ? "bg-[#20201f] text-[#c4c0ff] font-semibold border-l-2 border-[#c4c0ff] -ml-[11px] pl-[9px]"
                              : "text-[#8e9192] hover:text-[#e5e2e1] hover:bg-[#1c1b1b]"
                          )}
                        >
                          {item.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
