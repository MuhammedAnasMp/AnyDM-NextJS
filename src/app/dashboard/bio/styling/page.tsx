"use client";

import { Suspense } from "react";
import BioDashboardClient from "../BioDashboardClient";

export default function BioStylingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center bg-[#131313]">
          <div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-[#c4c0ff] animate-spin"></div>
        </div>
      }
    >
      <BioDashboardClient initialTab="styling" />
    </Suspense>
  );
}
