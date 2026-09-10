"use client";

import React, { useState } from "react";
import DocsHeader from "@/components/docs/DocsHeader";
import DocsSidebar from "@/components/docs/DocsSidebar";
import "./docs.css";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] font-sans antialiased flex flex-col">
      {/* Top Navigation Header */}
      <DocsHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main 3-Column Grid Container */}
      <div className="flex-1 flex w-full max-w-[1700px] mx-auto min-w-0">
        {/* Left Section: Sticky In-Flow Navigation Sidebar */}
        <DocsSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Center & Right Documentation Content Area */}
        <main className="flex-1 min-w-0 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
