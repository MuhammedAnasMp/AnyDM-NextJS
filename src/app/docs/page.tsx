import React from "react";
import Link from "next/link";
import { Metadata } from "next";
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
  ArrowRight,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { DOCS_NAVIGATION } from "@/lib/docs";

export const metadata: Metadata = {
  title: "User Documentation | AnyDM",
  description:
    "Official user manual, guides, and feature documentation for AnyDM - AI Social Commerce Operating System.",
};

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

export default function DocsHomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Hero Header */}
      <div className="space-y-3 pb-6 border-b border-[#20201f]">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#1c1b1b] border border-[#353535] text-xs text-[#c4c0ff]">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Official User Manual</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          AnyDM User Documentation
        </h1>
        <p className="text-sm text-[#8e9192] max-w-2xl leading-relaxed">
          Learn how to automate your Instagram DMs, build high-converting Link-in-Bio profiles, schedule reels, sell digital products, and scale your social commerce business.
        </p>
      </div>

      {/* Navigation Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOCS_NAVIGATION.map((section) => {
          const Icon = ICON_MAP[section.iconName] || LayoutDashboard;
          const mainLink = section.items[0]?.href || section.href;

          return (
            <div
              key={section.slug}
              className="p-5 rounded-xl bg-[#1c1b1b] border border-[#2a2a2a] hover:border-[#444748] transition-all flex flex-col justify-between group shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#20201f] border border-[#353535] flex items-center justify-center text-[#c4c0ff] group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-semibold text-white">
                      {section.title}
                    </h2>
                  </div>
                  <Link
                    href={mainLink}
                    className="p-1 rounded text-[#8e9192] hover:text-white transition-colors"
                    title={`Open ${section.title}`}
                  >
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <ul className="space-y-1.5 pt-1">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-start justify-between text-xs text-[#c4c7c8] hover:text-[#c4c0ff] transition-colors py-0.5"
                      >
                        <span className="font-medium">• {item.title}</span>
                        <span className="text-[10px] text-[#8e9192] line-clamp-1 ml-2 text-right hidden sm:inline">
                          {item.description}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 mt-4 border-t border-[#252525] flex items-center justify-between text-[11px]">
                <Link
                  href={section.appUrl}
                  className="text-[#8e9192] hover:text-[#e5e2e1] transition-colors inline-flex items-center gap-1"
                >
                  <span>Open in App</span>
                  <span>→</span>
                </Link>
                <Link
                  href={mainLink}
                  className="text-[#c4c0ff] font-medium hover:underline"
                >
                  Read Docs →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
