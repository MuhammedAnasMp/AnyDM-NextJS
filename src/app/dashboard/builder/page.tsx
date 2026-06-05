"use client";

import React, { useState } from "react";
import { Topbar } from "@/components/builder/Topbar";
import { LeftSidebar } from "@/components/builder/LeftSidebar";
import { Canvas } from "@/components/builder/Canvas";
import { RightSidebar } from "@/components/builder/RightSidebar";
import { LivePreview } from "@/components/builder/LivePreview";
import { AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function BuilderPage() {
  const [showPreview, setShowPreview] = useState(true);
  const selectedNodeId = useSelector((state: RootState) => state.flow.selectedNodeId);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative z-10">
      <Topbar 
        onTogglePreview={() => setShowPreview(!showPreview)} 
        showPreview={showPreview}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <LeftSidebar />
        <Canvas />
        <AnimatePresence>
          {selectedNodeId && <RightSidebar />}
        </AnimatePresence>
        <AnimatePresence>
          {showPreview && <LivePreview onClose={() => setShowPreview(false)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
