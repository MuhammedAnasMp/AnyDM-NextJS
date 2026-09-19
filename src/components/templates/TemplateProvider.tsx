import React from "react";

export interface TemplateStyle {
  bodyClass: string;
  navClass: string;
  cardClass: string;
  modalClass: string;
  buttonClass: string;
  badgeClass: string;
  textColorClass: string;
  textMutedClass: string;
  priceClass: string;
  fontHeadline: string;
  fontBody: string;
  containerClass: string;
  whatsappButtonClass: string;
  instagramButtonClass: string;
  logoWrapperClass: string;
  accentColor: string;       // CSS hex for programmatic use
  isDark: boolean;           // Quick helper for conditional dark rendering
  inputClass: string;        // For checkout/search inputs
  dividerClass: string;      // For <hr> / section dividers
  filterPillClass: string;   // Category pill / filter button
  filterPillActiveClass: string;
}

export function getTemplateStyles(
  templateId: string,
  themeId: string,
  customSettings?: { corner_radius?: string; font_family?: string }
): TemplateStyle {
  return applyCustomStyleOverrides(computeBaseTemplateStyles(templateId, themeId), customSettings);
}

function computeBaseTemplateStyles(templateId: string, themeId: string): TemplateStyle {
  // 1. Glass Monochrome
  if (templateId === "glass_monochrome") {
    const isLight = themeId === "light";
    const isFrosted = themeId === "frosted";
    const isDark = !isLight;

    return {
      isDark,
      accentColor: isLight ? "#605ca2" : "#c4c0ff",
      bodyClass: isLight
        ? "bg-[#f5f5f5] text-[#131313]"
        : isFrosted
          ? "bg-[#0a1128] text-white"
          : "bg-[#131313] text-[#e5e2e1]",
      navClass: isLight
        ? "bg-white/90 backdrop-blur-md border-b border-black/10"
        : "bg-[#131313]/90 backdrop-blur-md border-b border-white/10",
      cardClass: isLight
        ? "bg-white border border-black/10 rounded-2xl shadow-sm hover:border-black/25 hover:shadow-md transition-all duration-300"
        : "bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl shadow-xl hover:border-white/25 hover:bg-white/[0.07] transition-all duration-300",
      modalClass: isLight
        ? "bg-white text-black border border-black/10 shadow-2xl"
        : "bg-[#1c1c1c] text-white border border-white/10 shadow-2xl",
      buttonClass: isLight
        ? "bg-black text-white hover:bg-black/90 font-bold rounded-xl py-3.5 px-6 transition-all duration-200"
        : "bg-white text-black hover:bg-[#eaeaea] font-bold rounded-xl py-3.5 px-6 transition-all duration-200",
      badgeClass: isLight
        ? "bg-black/5 border border-black/10 text-black rounded-full px-3 py-1 text-[10px] font-bold"
        : "bg-white/10 border border-white/15 text-white rounded-full px-3 py-1 text-[10px] font-bold",
      textColorClass: isLight ? "text-black" : "text-white",
      textMutedClass: isLight ? "text-gray-600" : "text-gray-400",
      priceClass: isLight ? "text-black font-extrabold" : "text-white font-extrabold",
      fontHeadline: "font-sans tracking-tight",
      fontBody: "font-sans",
      containerClass: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
      whatsappButtonClass: "bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] font-semibold rounded-xl py-2.5 px-4 text-xs hover:bg-[#25D366]/25 transition-all text-center",
      instagramButtonClass: "bg-gradient-to-tr from-[#fdf497] via-[#fd5949] to-[#d6249f] text-white font-bold rounded-xl py-4 hover:opacity-90 transition-all text-center",
      logoWrapperClass: isLight
        ? "w-9 h-9 rounded-full overflow-hidden border border-black/15 bg-black/5 flex items-center justify-center"
        : "w-9 h-9 rounded-full overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center",
      inputClass: isLight
        ? "bg-black/5 border border-black/15 text-black placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-black/40 transition-colors"
        : "bg-white/5 border border-white/15 text-white placeholder-gray-400 rounded-xl px-4 py-2.5 focus:outline-none focus:border-white/40 transition-colors",
      dividerClass: isLight ? "border-black/10" : "border-white/10",
      filterPillClass: isLight
        ? "px-4 py-1.5 rounded-full text-xs font-semibold border border-black/10 text-gray-700 hover:border-black/30 hover:text-black transition-all bg-white"
        : "px-4 py-1.5 rounded-full text-xs font-semibold border border-white/10 text-gray-300 hover:border-white/30 hover:text-white transition-all bg-white/5",
      filterPillActiveClass: isLight
        ? "px-4 py-1.5 rounded-full text-xs font-semibold bg-black text-white shadow-sm"
        : "px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-black shadow-sm",
    };
  }

  // 2. Organic Minimalist
  if (templateId === "organic_minimalist") {
    const isSage = themeId === "soft_sage";
    const isWhite = themeId === "pure_white";
    const isDark = isSage;

    return {
      isDark,
      accentColor: isSage ? "#DCE3DE" : "#4A5D4E",
      bodyClass: isSage
        ? "bg-[#3D4F41] text-white"
        : isWhite
          ? "bg-[#ffffff] text-[#111111]"
          : "bg-[#F9F7F2] text-[#2D362E]",
      navClass: isSage
        ? "bg-[#344438]/95 backdrop-blur-xl border-b border-white/10"
        : "bg-[#F9F7F2]/95 backdrop-blur-xl border-b border-black/10",
      cardClass: isSage
        ? "bg-white/[0.08] border border-white/15 rounded-none transition-all duration-300 hover:bg-white/[0.14]"
        : "bg-[#F2EFE9] border border-[#C2C9C3] rounded-none transition-all duration-300 hover:border-[#4A5D4E]",
      modalClass: isSage
        ? "bg-[#2D3A30] text-white border border-white/15"
        : "bg-[#F9F7F2] text-[#2D362E] border border-[#C2C9C3]",
      buttonClass: isSage
        ? "bg-white text-[#3D4F41] font-bold tracking-widest rounded-none py-4 px-8 hover:bg-zinc-100 transition-all"
        : "bg-[#4A5D4E] text-white font-bold tracking-widest rounded-none py-4 px-8 hover:bg-[#3D4F41] transition-all",
      badgeClass: isSage
        ? "border border-white/30 text-white bg-white/10 rounded-none px-3 py-1 text-[10px] tracking-[0.2em]"
        : "border border-[#4A5D4E]/40 text-[#4A5D4E] bg-[#4A5D4E]/5 rounded-none px-3 py-1 text-[10px] tracking-[0.2em]",
      textColorClass: isSage ? "text-white" : "text-[#2D362E]",
      textMutedClass: isSage ? "text-emerald-100/80" : "text-[#5A685C]",
      priceClass: isSage ? "text-white font-semibold" : "text-[#4A5D4E] font-semibold text-lg",
      fontHeadline: "font-serif italic font-bold",
      fontBody: "font-sans",
      containerClass: "max-w-screen-xl mx-auto px-4 sm:px-8 md:px-12",
      whatsappButtonClass: isSage
        ? "border border-white/30 text-white rounded-none py-4 hover:bg-white/10 transition-all text-center tracking-widest font-medium text-xs"
        : "border border-[#4A5D4E]/40 text-[#2D362E] rounded-none py-4 hover:bg-[#4A5D4E]/10 transition-all text-center tracking-widest font-medium text-xs",
      instagramButtonClass: isSage
        ? "border border-white/30 text-white rounded-none py-4 hover:bg-white/10 transition-all text-center tracking-widest font-medium text-xs"
        : "border border-[#E1306C]/40 text-[#2D362E] rounded-none py-4 hover:bg-[#E1306C]/10 transition-all text-center tracking-widest font-medium text-xs",
      logoWrapperClass: "w-9 h-9 rounded-full overflow-hidden bg-transparent border border-current flex items-center justify-center",
      inputClass: isSage
        ? "bg-white/10 border border-white/20 text-white placeholder-emerald-100/50 rounded-none px-4 py-2.5 focus:outline-none focus:border-white transition-colors"
        : "bg-[#F2EFE9] border border-[#C2C9C3] text-[#2D362E] placeholder-[#5A685C] rounded-none px-4 py-2.5 focus:outline-none focus:border-[#4A5D4E] transition-colors",
      dividerClass: isSage ? "border-white/15" : "border-[#C2C9C3]/60",
      filterPillClass: isSage
        ? "px-4 py-1.5 text-xs font-semibold border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-all tracking-wider bg-white/5"
        : "px-4 py-1.5 text-xs font-semibold border border-[#4A5D4E]/30 text-[#5A685C] hover:text-[#2D362E] hover:border-[#4A5D4E]/60 transition-all tracking-wider bg-white",
      filterPillActiveClass: isSage
        ? "px-4 py-1.5 text-xs font-semibold bg-white text-[#3D4F41] tracking-wider"
        : "px-4 py-1.5 text-xs font-semibold bg-[#4A5D4E] text-white tracking-wider",
    };
  }

  // 3. Cyber Neon Dark
  if (templateId === "cyber_neon_dark") {
    const isSynth = themeId === "synthwave_sunset";
    const isMatrix = themeId === "matrix_green";

    return {
      isDark: true,
      accentColor: isMatrix ? "#00ff00" : isSynth ? "#ff24e4" : "#00dbe9",
      bodyClass: isMatrix
        ? "bg-black text-[#00ff00]"
        : isSynth
          ? "bg-[#0d0e0f] text-[#fface8]"
          : "bg-[#121414] text-[#e2e2e2]",
      navClass: "bg-[#121414]/95 backdrop-blur-xl border-b border-zinc-800",
      cardClass: isMatrix
        ? "bg-black border border-[#00ff00]/60 rounded-none hover:border-[#00ff00] hover:shadow-[0_0_20px_rgba(0,255,0,0.3)] transition-all"
        : isSynth
          ? "bg-[#181a1b] border border-[#ff24e4]/60 rounded-none hover:border-[#ff24e4] hover:shadow-[0_0_20px_rgba(255,36,228,0.3)] transition-all"
          : "bg-[#181a1b] border border-[#00dbe9]/60 rounded-none hover:border-[#00f0ff] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all",
      modalClass: isMatrix
        ? "bg-black text-[#00ff00] border-2 border-[#00ff00]"
        : isSynth
          ? "bg-[#181a1b] text-[#fface8] border-2 border-[#ff24e4]"
          : "bg-[#181a1b] text-[#e2e2e2] border-2 border-[#00dbe9]",
      buttonClass: isMatrix
        ? "bg-[#00ff00] text-black font-extrabold tracking-widest rounded-none py-4 px-8 hover:bg-black hover:text-[#00ff00] border border-[#00ff00] transition-all"
        : isSynth
          ? "bg-[#ff24e4] text-white font-extrabold tracking-widest rounded-none py-4 px-8 hover:bg-black border border-[#ff24e4] transition-all"
          : "bg-[#00dbe9] text-black font-extrabold tracking-widest rounded-none py-4 px-8 hover:bg-black hover:text-white border border-[#00dbe9] transition-all",
      badgeClass: "border border-current px-2.5 py-0.5 text-[9px] tracking-widest font-mono font-bold bg-black/50",
      textColorClass: "text-white",
      textMutedClass: "text-zinc-400 font-mono",
      priceClass: isMatrix ? "text-[#00ff00] font-mono text-lg font-bold" : isSynth ? "text-[#ff24e4] font-mono text-lg font-bold" : "text-[#00dbe9] font-mono text-lg font-bold",
      fontHeadline: "font-sans tracking-widest font-black",
      fontBody: "font-mono",
      containerClass: "max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10",
      whatsappButtonClass: isMatrix
        ? "border border-[#00ff00]/60 text-[#00ff00] rounded-none py-4 hover:bg-[#00ff00]/10 transition-all font-mono tracking-widest text-center text-xs"
        : "border border-[#25D366]/60 text-[#25D366] rounded-none py-4 hover:bg-[#25D366]/10 transition-all font-mono tracking-widest text-center text-xs",
      instagramButtonClass: isMatrix
        ? "border border-[#00ff00]/60 text-[#00ff00] rounded-none py-4 hover:bg-[#00ff00]/10 transition-all font-mono tracking-widest text-center text-xs"
        : "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white font-bold rounded-none py-4 hover:opacity-90 transition-all font-mono tracking-widest text-center text-xs",
      logoWrapperClass: "w-9 h-9 rounded-full overflow-hidden bg-transparent border border-zinc-700 flex items-center justify-center",
      inputClass: isMatrix
        ? "bg-black border border-[#00ff00]/60 text-[#00ff00] placeholder-emerald-800 font-mono rounded-none px-4 py-2.5 focus:outline-none focus:border-[#00ff00] transition-colors"
        : isSynth
          ? "bg-black border border-[#ff24e4]/60 text-[#fface8] placeholder-pink-900 font-mono rounded-none px-4 py-2.5 focus:outline-none focus:border-[#ff24e4] transition-colors"
          : "bg-black border border-[#00dbe9]/60 text-[#00dbe9] placeholder-cyan-900 font-mono rounded-none px-4 py-2.5 focus:outline-none focus:border-[#00dbe9] transition-colors",
      dividerClass: "border-zinc-800",
      filterPillClass: isMatrix
        ? "px-4 py-1.5 text-xs font-mono border border-[#00ff00]/50 text-[#00ff00]/80 hover:text-[#00ff00] hover:border-[#00ff00] transition-all tracking-widest bg-black"
        : isSynth
          ? "px-4 py-1.5 text-xs font-mono border border-[#ff24e4]/50 text-[#fface8]/80 hover:text-[#fface8] hover:border-[#ff24e4] transition-all tracking-widest bg-black"
          : "px-4 py-1.5 text-xs font-mono border border-[#00dbe9]/50 text-cyan-300 hover:text-white hover:border-[#00dbe9] transition-all tracking-widest bg-black",
      filterPillActiveClass: isMatrix
        ? "px-4 py-1.5 text-xs font-mono border border-[#00ff00] text-black bg-[#00ff00] tracking-widest font-bold"
        : isSynth
          ? "px-4 py-1.5 text-xs font-mono border border-[#ff24e4] text-white bg-[#ff24e4] tracking-widest font-bold"
          : "px-4 py-1.5 text-xs font-mono border border-[#00dbe9] text-black bg-[#00dbe9] tracking-widest font-bold",
    };
  }

  // 4. Monochrome Precision
  if (templateId === "monochrome_precision") {
    const isWhite = themeId === "paper_white";
    const isGray = themeId === "cool_gray";
    const isLight = isWhite || isGray;

    return {
      isDark: !isLight,
      accentColor: isLight ? "#000000" : "#ffffff",
      bodyClass: isWhite
        ? "bg-white text-black"
        : isGray
          ? "bg-[#f8f9fa] text-black"
          : "bg-[#0a0a0a] text-[#ededed]",
      navClass: isLight
        ? "bg-white/95 border-b border-black/15"
        : "bg-[#0a0a0a]/95 border-b border-white/15",
      cardClass: isLight
        ? "bg-white border border-black/15 rounded-none hover:border-black transition-all duration-200"
        : "bg-[#121212] border border-white/15 rounded-none hover:border-white transition-all duration-200",
      modalClass: isLight
        ? "bg-white text-black border-2 border-black"
        : "bg-[#121212] text-white border-2 border-white",
      buttonClass: isLight
        ? "bg-black text-white rounded-none py-3.5 px-8 text-xs font-bold hover:bg-black/90 transition-all"
        : "bg-white text-black rounded-none py-3.5 px-8 text-xs font-bold hover:bg-[#eaeaea] transition-all",
      badgeClass: isLight
        ? "border border-black text-black px-2 py-0.5 text-[9px] font-mono font-bold bg-black/5"
        : "border border-white text-white px-2 py-0.5 text-[9px] font-mono font-bold bg-white/10",
      textColorClass: isLight ? "text-black" : "text-white",
      textMutedClass: isLight ? "text-zinc-600 font-mono" : "text-zinc-400 font-mono",
      priceClass: isLight ? "text-black font-bold font-mono" : "text-white font-bold font-mono",
      fontHeadline: "font-mono tracking-tighter",
      fontBody: "font-mono",
      containerClass: "max-w-7xl mx-auto px-4 sm:px-8",
      whatsappButtonClass: isLight
        ? "border border-black text-black text-xs font-bold py-3.5 hover:bg-black/5 transition-all text-center rounded-none"
        : "border border-white text-white text-xs font-bold py-3.5 hover:bg-white/5 transition-all text-center rounded-none",
      instagramButtonClass: isLight
        ? "bg-black text-white text-xs font-bold py-3.5 hover:bg-black/90 transition-all text-center rounded-none"
        : "bg-white text-black text-xs font-bold py-3.5 hover:bg-[#eaeaea] transition-all text-center rounded-none",
      logoWrapperClass: "w-9 h-9 rounded-full overflow-hidden bg-transparent border border-current flex items-center justify-center",
      inputClass: isLight
        ? "bg-white border border-black/30 text-black placeholder-gray-500 font-mono rounded-none px-4 py-2.5 focus:outline-none focus:border-black transition-colors"
        : "bg-black border border-white/30 text-white placeholder-gray-400 font-mono rounded-none px-4 py-2.5 focus:outline-none focus:border-white transition-colors",
      dividerClass: isLight ? "border-black/15" : "border-white/15",
      filterPillClass: isLight
        ? "px-4 py-1.5 text-xs font-mono border border-black/25 text-gray-700 hover:text-black hover:border-black transition-all bg-white"
        : "px-4 py-1.5 text-xs font-mono border border-white/25 text-gray-300 hover:text-white hover:border-white transition-all bg-black",
      filterPillActiveClass: isLight
        ? "px-4 py-1.5 text-xs font-mono bg-black text-white font-bold"
        : "px-4 py-1.5 text-xs font-mono bg-white text-black font-bold",
    };
  }

  // 5. Minimalist Editorial
  if (templateId === "minimalist_editorial") {
    const isDark = themeId === "editorial_dark";
    const isTan = themeId === "tan_canvas";

    return {
      isDark,
      accentColor: isDark ? "#c5a880" : "#1c1c1c",
      bodyClass: isDark
        ? "bg-[#111111] text-[#eaeaea]"
        : isTan
          ? "bg-[#e8dfd8] text-[#2b221a]"
          : "bg-[#faf8f5] text-[#1c1c1c]",
      navClass: isDark
        ? "bg-[#111111]/90 backdrop-blur-md border-b border-white/10"
        : "bg-[#faf8f5]/90 backdrop-blur-md border-b border-black/10",
      cardClass: isDark
        ? "bg-[#181818] border border-white/10 rounded-none transition-all duration-300 hover:border-white/30"
        : "bg-white border border-black/10 rounded-none transition-all duration-300 hover:border-black/30",
      modalClass: isDark
        ? "bg-[#181818] text-white border border-white/15"
        : "bg-[#faf8f5] text-[#1c1c1c] border border-black/15",
      buttonClass: isDark
        ? "bg-[#c5a880] text-black font-semibold rounded-none py-4 px-10 tracking-widest text-xs hover:opacity-90 transition-all"
        : "bg-[#1c1c1c] text-white font-semibold rounded-none py-4 px-10 tracking-widest text-xs hover:bg-black transition-all",
      badgeClass: "border-b border-current pb-0.5 text-[10px] tracking-widest italic font-serif",
      textColorClass: isDark ? "text-white" : "text-[#1c1c1c]",
      textMutedClass: isDark ? "text-zinc-400" : "text-zinc-600",
      priceClass: "font-serif text-xl italic font-normal",
      fontHeadline: "font-serif italic font-light tracking-wide",
      fontBody: "font-sans",
      containerClass: "max-w-5xl mx-auto px-4 sm:px-6",
      whatsappButtonClass: "border-b border-current py-2 tracking-widest text-xs font-semibold text-center hover:opacity-80 transition-all",
      instagramButtonClass: isDark
        ? "bg-[#c5a880] text-black tracking-widest text-xs font-semibold py-4 hover:opacity-90 transition-all text-center"
        : "bg-[#1c1c1c] text-white tracking-widest text-xs font-semibold py-4 hover:bg-black transition-all text-center",
      logoWrapperClass: "w-9 h-9 rounded-full overflow-hidden bg-transparent border border-current flex items-center justify-center",
      inputClass: isDark
        ? "bg-transparent border-b border-white/30 text-white placeholder-zinc-500 font-serif rounded-none px-0 py-2 focus:outline-none focus:border-[#c5a880] transition-colors"
        : "bg-transparent border-b border-black/30 text-black placeholder-zinc-500 font-serif rounded-none px-0 py-2 focus:outline-none focus:border-black transition-colors",
      dividerClass: isDark ? "border-white/10" : "border-black/10",
      filterPillClass: isDark
        ? "px-4 py-1.5 text-xs font-serif italic border-b border-white/20 text-zinc-400 hover:text-white hover:border-white/50 transition-all"
        : "px-4 py-1.5 text-xs font-serif italic border-b border-black/20 text-zinc-600 hover:text-black hover:border-black/50 transition-all",
      filterPillActiveClass: isDark
        ? "px-4 py-1.5 text-xs font-serif italic border-b-2 border-[#c5a880] text-[#c5a880] font-bold"
        : "px-4 py-1.5 text-xs font-serif italic border-b-2 border-black text-black font-bold",
    };
  }

  // 6. Neo-Brutalist
  if (templateId === "neo_brutalist") {
    const isConcrete = themeId === "raw_concrete";
    const isBlue = themeId === "brutalist_blue";

    return {
      isDark: isBlue,
      accentColor: isBlue ? "#ffe600" : "#0038ff",
      bodyClass: isConcrete
        ? "bg-[#e0e0e0] text-black"
        : isBlue
          ? "bg-[#0038ff] text-white"
          : "bg-[#ffe600] text-black",
      navClass: "bg-white text-black border-b-4 border-black",
      cardClass: "bg-white border-4 border-black shadow-[6px_6px_0px_#000000] hover:shadow-[10px_10px_0px_#000000] hover:-translate-x-1 hover:-translate-y-1 transition-all rounded-none overflow-hidden text-black",
      modalClass: "bg-white text-black border-4 border-black shadow-[8px_8px_0px_#000000]",
      buttonClass: "bg-[#0038ff] text-white border-4 border-black font-extrabold tracking-wide shadow-[4px_4px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_#000] rounded-none py-3.5 px-8 transition-all",
      badgeClass: "bg-white text-black border-2 border-black font-black text-[10px] px-2 py-0.5 rounded-none inline-block",
      textColorClass: isBlue ? "text-white" : "text-black",
      textMutedClass: isBlue ? "text-blue-100" : "text-zinc-700 font-bold",
      priceClass: "font-black text-xl text-black",
      fontHeadline: "font-sans tracking-tight font-black",
      fontBody: "font-sans font-bold",
      containerClass: "max-w-7xl mx-auto px-4 sm:px-6",
      whatsappButtonClass: "bg-white text-black border-4 border-black font-black py-3 hover:bg-zinc-100 transition-all shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] text-center",
      instagramButtonClass: "bg-[#ffe600] text-black border-4 border-black font-black py-3.5 hover:bg-[#ffd600] transition-all shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] text-center",
      logoWrapperClass: "w-9 h-9 rounded-none overflow-hidden bg-white border-2 border-black flex items-center justify-center text-black",
      inputClass: "bg-white border-2 border-black text-black placeholder-zinc-500 font-bold rounded-none px-4 py-2.5 focus:outline-none focus:border-[#0038ff] shadow-[2px_2px_0px_#000] transition-colors",
      dividerClass: isBlue ? "border-white/30" : "border-black/20",
      filterPillClass: "px-4 py-1.5 text-xs font-black border-2 border-black text-black bg-white hover:bg-[#ffe600] transition-all",
      filterPillActiveClass: "px-4 py-1.5 text-xs font-black border-2 border-black text-white bg-[#0038ff]",
    };
  }

  // 7. Immersive Glass
  if (templateId === "immersive_glass") {
    const isOcean = themeId === "ocean_glass";
    const isDark = true;

    return {
      isDark,
      accentColor: isOcean ? "#38bdf8" : "#c4c0ff",
      bodyClass: isOcean
        ? "bg-[#050a18] text-white"
        : "bg-[#131313] text-[#e5e2e1]",
      navClass: "bg-[#131313]/90 backdrop-blur-md border-b border-white/10",
      cardClass: "bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl hover:border-white/25 hover:bg-white/[0.07] transition-all",
      modalClass: "bg-[#1c1c1c] text-white border border-white/15 shadow-2xl",
      buttonClass: "bg-white text-black font-bold rounded-xl py-3.5 px-6 transition-all duration-200 hover:bg-zinc-200",
      badgeClass: "bg-white/10 border border-white/15 text-white rounded-full px-3 py-1 text-[10px] font-bold",
      textColorClass: "text-white",
      textMutedClass: "text-gray-400",
      priceClass: "text-white font-extrabold",
      fontHeadline: "font-sans tracking-tight",
      fontBody: "font-sans",
      containerClass: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
      whatsappButtonClass: "bg-[#25D366] text-white font-bold rounded-xl py-3.5 hover:opacity-90 transition-all text-center",
      instagramButtonClass: "bg-gradient-to-tr from-[#fdf497] via-[#fd5949] to-[#d6249f] text-white font-bold rounded-xl py-4 hover:opacity-90 transition-all text-center",
      logoWrapperClass: "w-9 h-9 rounded-full overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center",
      inputClass: "bg-white/10 border border-white/15 text-white placeholder-gray-400 rounded-xl px-4 py-2.5 focus:outline-none focus:border-white/40 transition-colors backdrop-blur-sm",
      dividerClass: "border-white/10",
      filterPillClass: "px-4 py-1.5 rounded-full text-xs font-semibold border border-white/15 text-gray-300 hover:border-white/30 hover:text-white transition-all backdrop-blur-sm bg-white/5",
      filterPillActiveClass: "px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-black backdrop-blur-sm shadow-sm",
    };
  }

  // 8. Luxury Boutique (SSENSE/Mytheresa-style)
  if (templateId === "luxury_boutique") {
    const isIvory = themeId === "ivory_gold" || !themeId;
    const isNight = themeId === "midnight_noir";
    const isRose = themeId === "blush_rose";
    const isDark = isNight;

    let accent = "#b8955a";
    if (isNight) accent = "#d4a96a";
    if (isRose) accent = "#c4748a";

    return {
      isDark,
      accentColor: accent,
      bodyClass: isNight
        ? "bg-[#0d0d0d] text-[#f5f0e8]"
        : isRose
          ? "bg-[#fdf6f0] text-[#2a1a1f]"
          : "bg-[#faf8f4] text-[#1a1714]",
      navClass: isNight
        ? "bg-[#0d0d0d]/95 backdrop-blur-sm border-b border-white/10"
        : isRose
          ? "bg-[#fdf6f0]/95 backdrop-blur-sm border-b border-[#2a1a1f]/10"
          : "bg-[#faf8f4]/95 backdrop-blur-sm border-b border-[#1a1714]/10",
      cardClass: isNight
        ? "bg-[#141414] border border-white/10 rounded-none transition-all duration-300 hover:border-[#d4a96a]/50"
        : isRose
          ? "bg-[#f7ece2] border border-[#2a1a1f]/10 rounded-none transition-all duration-300 hover:border-[#c4748a]/50"
          : "bg-[#f4efe8] border border-[#1a1714]/10 rounded-none transition-all duration-300 hover:border-[#b8955a]/50",
      modalClass: isNight
        ? "bg-[#141414] text-[#f5f0e8] border border-white/15"
        : isRose
          ? "bg-[#fdf6f0] text-[#2a1a1f] border border-[#2a1a1f]/15"
          : "bg-[#faf8f4] text-[#1a1714] border border-[#1a1714]/15",
      buttonClass: isNight
        ? "border border-[#d4a96a] text-[#d4a96a] font-light tracking-[0.2em] text-xs py-4 px-10 hover:bg-[#d4a96a] hover:text-black transition-all duration-300 rounded-none"
        : isRose
          ? "bg-[#2a1a1f] text-[#fdf6f0] font-light tracking-[0.2em] text-xs py-4 px-10 hover:bg-black transition-all duration-300 rounded-none"
          : "bg-[#1a1714] text-[#faf8f4] font-light tracking-[0.2em] text-xs py-4 px-10 hover:bg-black transition-all duration-300 rounded-none",
      badgeClass: isNight
        ? "text-[#d4a96a] border border-[#d4a96a]/40 bg-[#d4a96a]/10 text-[9px] tracking-[0.25em] font-light px-2.5 py-0.5"
        : isRose
          ? "text-[#c4748a] border border-[#c4748a]/40 bg-[#c4748a]/10 text-[9px] tracking-[0.25em] font-light px-2.5 py-0.5"
          : "text-[#b8955a] border border-[#b8955a]/40 bg-[#b8955a]/10 text-[9px] tracking-[0.25em] font-light px-2.5 py-0.5",
      textColorClass: isNight
        ? "text-[#f5f0e8]"
        : isRose
          ? "text-[#2a1a1f]"
          : "text-[#1a1714]",
      textMutedClass: isNight ? "text-zinc-400" : isRose ? "text-[#6e525a]" : "text-zinc-600",
      priceClass: isNight
        ? "text-[#f5f0e8] font-light text-base tracking-wide"
        : isRose
          ? "text-[#2a1a1f] font-light text-base tracking-wide"
          : "text-[#1a1714] font-light text-base tracking-wide",
      fontHeadline: "font-serif font-light tracking-wide",
      fontBody: "font-sans font-light",
      containerClass: "max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-16",
      whatsappButtonClass: isNight
        ? "border border-white/20 text-white font-light tracking-[0.2em] text-xs py-4 hover:border-white/40 transition-all text-center rounded-none"
        : "border border-black/20 text-black font-light tracking-[0.2em] text-xs py-4 hover:border-black/40 transition-all text-center rounded-none",
      instagramButtonClass: isNight
        ? "border border-[#d4a96a] text-[#d4a96a] font-light tracking-[0.2em] text-xs py-4 hover:bg-[#d4a96a]/10 transition-all text-center rounded-none"
        : isRose
          ? "bg-[#2a1a1f] text-[#fdf6f0] font-light tracking-[0.2em] text-xs py-4 hover:bg-black transition-all text-center rounded-none"
          : "bg-[#1a1714] text-[#faf8f4] font-light tracking-[0.2em] text-xs py-4 hover:bg-black transition-all text-center rounded-none",
      logoWrapperClass: "w-9 h-9 rounded-none overflow-hidden bg-transparent flex items-center justify-center border border-current",
      inputClass: isNight
        ? "bg-[#141414] border border-white/20 text-[#f5f0e8] placeholder-zinc-500 font-light rounded-none px-4 py-2.5 focus:outline-none focus:border-[#d4a96a] transition-colors"
        : isRose
          ? "bg-white border border-[#2a1a1f]/20 text-[#2a1a1f] placeholder-zinc-400 font-light rounded-none px-4 py-2.5 focus:outline-none focus:border-[#c4748a] transition-colors"
          : "bg-white border border-[#1a1714]/20 text-[#1a1714] placeholder-zinc-400 font-light rounded-none px-4 py-2.5 focus:outline-none focus:border-[#b8955a] transition-colors",
      dividerClass: isNight ? "border-white/10" : "border-black/10",
      filterPillClass: isNight
        ? "px-4 py-1.5 text-xs font-light tracking-[0.2em] text-zinc-400 hover:text-white transition-colors border border-white/10 rounded-none bg-[#141414]"
        : "px-4 py-1.5 text-xs font-light tracking-[0.2em] text-zinc-600 hover:text-black transition-colors border border-black/10 rounded-none bg-white",
      filterPillActiveClass: isNight
        ? "px-4 py-1.5 text-xs font-light tracking-[0.2em] text-black bg-[#d4a96a] border border-[#d4a96a] rounded-none font-medium"
        : isRose
          ? "px-4 py-1.5 text-xs font-light tracking-[0.2em] text-white bg-[#2a1a1f] border border-[#2a1a1f] rounded-none font-medium"
          : "px-4 py-1.5 text-xs font-light tracking-[0.2em] text-white bg-[#1a1714] border border-[#1a1714] rounded-none font-medium",
    };
  }

  // 9. Streetwear Bold (Supreme/Nike-style)
  if (templateId === "streetwear_bold") {
    const isRed = themeId === "fire_red" || !themeId;
    const isOrange = themeId === "raw_orange";
    const isPurple = themeId === "hype_purple";

    let accent = "#ff0000";
    if (isOrange) accent = "#ff5a00";
    if (isPurple) accent = "#7c3aed";

    return {
      isDark: true,
      accentColor: accent,
      bodyClass: "bg-[#0a0a0a] text-white",
      navClass: "bg-[#0a0a0a] border-b-2 border-white",
      cardClass: isRed
        ? "bg-[#111111] border-2 border-[#1f1f1f] rounded-none hover:border-[#ff0000]/40 transition-opacity hover:opacity-90 duration-200 group"
        : isOrange
          ? "bg-[#111111] border-2 border-[#1f1f1f] rounded-none hover:border-[#ff5a00]/40 transition-opacity hover:opacity-90 duration-200 group"
          : "bg-[#111111] border-2 border-[#1f1f1f] rounded-none hover:border-[#7c3aed]/40 transition-opacity hover:opacity-90 duration-200 group",
      modalClass: "bg-[#111111] text-white border-2 border-white",
      buttonClass: isRed
        ? "bg-[#ff0000] text-white font-black tracking-widest text-sm py-4 px-8 rounded-none hover:opacity-85 transition-opacity active:scale-95"
        : isOrange
          ? "bg-[#ff5a00] text-white font-black tracking-widest text-sm py-4 px-8 rounded-none hover:opacity-85 transition-opacity active:scale-95"
          : "bg-[#7c3aed] text-white font-black tracking-widest text-sm py-4 px-8 rounded-none hover:opacity-85 transition-opacity active:scale-95",
      badgeClass: isRed
        ? "bg-[#ff0000]/80 text-white font-black text-[9px] tracking-widest px-2 py-0.5 rounded-none"
        : isOrange
          ? "bg-[#ff5a00]/80 text-white font-black text-[9px] tracking-widest px-2 py-0.5 rounded-none"
          : "bg-[#7c3aed]/80 text-white font-black text-[9px] tracking-widest px-2 py-0.5 rounded-none",
      textColorClass: "text-white",
      textMutedClass: "text-zinc-400",
      priceClass: "text-white font-black text-lg",
      fontHeadline: "font-sans font-black tracking-tight",
      fontBody: "font-sans",
      containerClass: "max-w-screen-xl mx-auto px-4 sm:px-6",
      whatsappButtonClass: "bg-[#1f1f1f] text-white border-2 border-white/20 font-bold tracking-widest text-xs py-4 hover:bg-white hover:text-black transition-all text-center rounded-none",
      instagramButtonClass: isRed
        ? "bg-[#ff0000] text-white font-black tracking-widest text-xs py-4 hover:opacity-85 transition-opacity text-center rounded-none"
        : isOrange
          ? "bg-[#ff5a00] text-white font-black tracking-widest text-xs py-4 hover:opacity-85 transition-opacity text-center rounded-none"
          : "bg-[#7c3aed] text-white font-black tracking-widest text-xs py-4 hover:opacity-85 transition-opacity text-center rounded-none",
      logoWrapperClass: "w-9 h-9 rounded-none overflow-hidden bg-transparent border-2 border-white flex items-center justify-center",
      inputClass: isRed
        ? "bg-[#111111] border-2 border-[#1f1f1f] text-white placeholder-zinc-500 font-bold rounded-none px-4 py-2.5 focus:outline-none focus:border-white/60 transition-colors"
        : isOrange
          ? "bg-[#111111] border-2 border-[#1f1f1f] text-white placeholder-zinc-500 font-bold rounded-none px-4 py-2.5 focus:outline-none focus:border-white/60 transition-colors"
          : "bg-[#111111] border-2 border-[#1f1f1f] text-white placeholder-zinc-500 font-bold rounded-none px-4 py-2.5 focus:outline-none focus:border-white/60 transition-colors",
      dividerClass: "border-white/15",
      filterPillClass: isRed
        ? "px-4 py-1.5 text-xs font-black border-2 border-[#1f1f1f] text-zinc-400 hover:border-white/40 hover:text-white transition-opacity hover:opacity-80 bg-[#0a0a0a]"
        : isOrange
          ? "px-4 py-1.5 text-xs font-black border-2 border-[#1f1f1f] text-zinc-400 hover:border-white/40 hover:text-white transition-opacity hover:opacity-80 bg-[#0a0a0a]"
          : "px-4 py-1.5 text-xs font-black border-2 border-[#1f1f1f] text-zinc-400 hover:border-white/40 hover:text-white transition-opacity hover:opacity-80 bg-[#0a0a0a]",
      filterPillActiveClass: isRed
        ? "px-4 py-1.5 text-xs font-black border-2 border-[#ff0000]/60 text-white bg-[#ff0000]/20"
        : isOrange
          ? "px-4 py-1.5 text-xs font-black border-2 border-[#ff5a00]/60 text-white bg-[#ff5a00]/20"
          : "px-4 py-1.5 text-xs font-black border-2 border-[#7c3aed]/60 text-white bg-[#7c3aed]/20",
    };
  }

  // 10. Sunset Gradient (warm tropical vibes)
  if (templateId === "sunset_gradient") {
    const isTropical = themeId === "tropical_dawn" || !themeId;
    const isOcean = themeId === "ocean_breeze";

    let accent = "#f97316";
    if (isOcean) accent = "#0ea5e9";

    return {
      isDark: false,
      accentColor: accent,
      bodyClass: isTropical
        ? "bg-gradient-to-br from-[#fff7ed] via-[#fef3c7] to-[#fce7f3] text-[#1a0a00] min-h-screen"
        : isOcean
          ? "bg-gradient-to-br from-[#eff6ff] via-[#dbeafe] to-[#e0f2fe] text-[#0c1a2e] min-h-screen"
          : "bg-gradient-to-br from-[#fdf2f8] via-[#fce7f3] to-[#fff1f2] text-[#1a0018] min-h-screen",
      navClass: isTropical
        ? "bg-white/90 backdrop-blur-md border-b border-orange-200"
        : isOcean
          ? "bg-white/90 backdrop-blur-md border-b border-blue-200"
          : "bg-white/90 backdrop-blur-md border-b border-pink-200",
      cardClass: isTropical
        ? "bg-white border border-orange-100 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-300"
        : isOcean
          ? "bg-white border border-blue-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300"
          : "bg-white border border-pink-100 rounded-2xl shadow-sm hover:shadow-md hover:border-pink-300 transition-all duration-300",
      modalClass: isTropical
        ? "bg-white text-[#1a0a00] border border-orange-200 shadow-2xl"
        : isOcean
          ? "bg-white text-[#0c1a2e] border border-blue-200 shadow-2xl"
          : "bg-white text-[#1a0018] border border-pink-200 shadow-2xl",
      buttonClass: isTropical
        ? "bg-[#f97316] text-white font-bold rounded-full py-3.5 px-8 hover:opacity-90 hover:scale-[1.02] transition-all shadow-md shadow-[#f97316]/25"
        : isOcean
          ? "bg-[#0ea5e9] text-white font-bold rounded-full py-3.5 px-8 hover:opacity-90 hover:scale-[1.02] transition-all shadow-md shadow-[#0ea5e9]/25"
          : "bg-[#ec4899] text-white font-bold rounded-full py-3.5 px-8 hover:opacity-90 hover:scale-[1.02] transition-all shadow-md shadow-[#ec4899]/25",
      badgeClass: isTropical
        ? "bg-[#f97316]/10 border border-[#f97316]/40 text-[#f97316] rounded-full px-3 py-1 text-[10px] font-bold"
        : isOcean
          ? "bg-[#0ea5e9]/10 border border-[#0ea5e9]/40 text-[#0ea5e9] rounded-full px-3 py-1 text-[10px] font-bold"
          : "bg-[#ec4899]/10 border border-[#ec4899]/40 text-[#ec4899] rounded-full px-3 py-1 text-[10px] font-bold",
      textColorClass: isTropical
        ? "text-[#1a0a00]"
        : isOcean
          ? "text-[#0c1a2e]"
          : "text-[#1a0018]",
      textMutedClass: "text-zinc-600",
      priceClass: isTropical
        ? "text-[#f97316] font-bold text-base"
        : isOcean
          ? "text-[#0ea5e9] font-bold text-base"
          : "text-[#ec4899] font-bold text-base",
      fontHeadline: "font-sans font-bold tracking-tight",
      fontBody: "font-sans",
      containerClass: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
      whatsappButtonClass: "bg-[#25D366]/10 border border-[#25D366]/40 text-[#25D366] font-bold rounded-full py-3.5 hover:bg-[#25D366]/20 transition-all text-center",
      instagramButtonClass: "bg-gradient-to-tr from-[#fdf497] via-[#fd5949] to-[#d6249f] text-white font-bold rounded-full py-4 hover:opacity-90 transition-all text-center",
      logoWrapperClass: isTropical
        ? "w-9 h-9 rounded-full overflow-hidden border-2 border-[#f97316]/30 bg-white flex items-center justify-center shadow-sm"
        : isOcean
          ? "w-9 h-9 rounded-full overflow-hidden border-2 border-[#0ea5e9]/30 bg-white flex items-center justify-center shadow-sm"
          : "w-9 h-9 rounded-full overflow-hidden border-2 border-[#ec4899]/30 bg-white flex items-center justify-center shadow-sm",
      inputClass: isTropical
        ? "bg-white border border-[#f97316]/30 text-[#1a0a00] placeholder-zinc-500 rounded-full px-5 py-2.5 focus:outline-none focus:border-[#f97316] transition-colors shadow-sm"
        : isOcean
          ? "bg-white border border-[#0ea5e9]/30 text-[#0c1a2e] placeholder-zinc-500 rounded-full px-5 py-2.5 focus:outline-none focus:border-[#0ea5e9] transition-colors shadow-sm"
          : "bg-white border border-[#ec4899]/30 text-[#1a0018] placeholder-zinc-500 rounded-full px-5 py-2.5 focus:outline-none focus:border-[#ec4899] transition-colors shadow-sm",
      dividerClass: isTropical
        ? "border-[#f97316]/20"
        : isOcean
          ? "border-[#0ea5e9]/20"
          : "border-[#ec4899]/20",
      filterPillClass: isTropical
        ? "px-4 py-1.5 rounded-full text-xs font-semibold border border-[#f97316]/30 text-zinc-700 hover:border-[#f97316]/60 hover:text-[#f97316] transition-all bg-white"
        : isOcean
          ? "px-4 py-1.5 rounded-full text-xs font-semibold border border-[#0ea5e9]/30 text-zinc-700 hover:border-[#0ea5e9]/60 hover:text-[#0ea5e9] transition-all bg-white"
          : "px-4 py-1.5 rounded-full text-xs font-semibold border border-[#ec4899]/30 text-zinc-700 hover:border-[#ec4899]/60 hover:text-[#ec4899] transition-all bg-white",
      filterPillActiveClass: isTropical
        ? "px-4 py-1.5 rounded-full text-xs font-semibold bg-[#f97316] text-white shadow-sm"
        : isOcean
          ? "px-4 py-1.5 rounded-full text-xs font-semibold bg-[#0ea5e9] text-white shadow-sm"
          : "px-4 py-1.5 rounded-full text-xs font-semibold bg-[#ec4899] text-white shadow-sm",
    };
  }

  // Fallback / Default
  return {
    isDark: true,
    accentColor: "#c4c0ff",
    bodyClass: "bg-[#131313] text-[#e5e2e1]",
    navClass: "bg-[#131313]/90 backdrop-blur-md border-b border-white/10",
    cardClass: "bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl hover:border-white/25 hover:bg-white/[0.07] transition-all",
    modalClass: "bg-[#1c1c1c] text-white border border-white/15 shadow-2xl",
    buttonClass: "bg-white text-black hover:bg-[#eaeaea] font-bold rounded-xl py-3.5 px-6 transition-all",
    badgeClass: "bg-white/10 border border-white/15 text-white rounded-full px-3 py-1 text-[10px] font-bold",
    textColorClass: "text-white",
    textMutedClass: "text-gray-400",
    priceClass: "text-white font-extrabold",
    fontHeadline: "font-sans tracking-tight",
    fontBody: "font-sans",
    containerClass: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    whatsappButtonClass: "bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] font-bold rounded-xl py-3.5 text-center",
    instagramButtonClass: "bg-white text-black font-bold rounded-xl py-3.5 text-center",
    logoWrapperClass: "w-9 h-9 rounded-full overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center",
    inputClass: "bg-white/10 border border-white/15 text-white placeholder-gray-400 rounded-xl px-4 py-2.5 focus:outline-none focus:border-white/40 transition-colors",
    dividerClass: "border-white/10",
    filterPillClass: "px-4 py-1.5 rounded-full text-xs font-semibold border border-white/15 text-gray-300 hover:border-white/30 hover:text-white transition-all bg-white/5",
    filterPillActiveClass: "px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-black shadow-sm",
  };
}

function applyCustomStyleOverrides(
  styles: TemplateStyle,
  customSettings?: { corner_radius?: string; font_family?: string }
): TemplateStyle {
  if (!customSettings) return styles;

  const result = { ...styles };

  const radius = customSettings.corner_radius;
  if (radius) {
    const replaceRadius = (cls: string, targetRadius: string) =>
      cls.replace(/rounded-(none|xs|sm|md|lg|xl|2xl|3xl|full)/g, targetRadius);

    if (radius === "sharp") {
      result.cardClass = replaceRadius(result.cardClass, "rounded-none");
      result.buttonClass = replaceRadius(result.buttonClass, "rounded-none");
      result.inputClass = replaceRadius(result.inputClass, "rounded-none");
      result.modalClass = replaceRadius(result.modalClass, "rounded-none");
      result.whatsappButtonClass = replaceRadius(result.whatsappButtonClass, "rounded-none");
      result.instagramButtonClass = replaceRadius(result.instagramButtonClass, "rounded-none");
      result.filterPillClass = replaceRadius(result.filterPillClass, "rounded-none");
      result.filterPillActiveClass = replaceRadius(result.filterPillActiveClass, "rounded-none");
    } else if (radius === "subtle") {
      result.cardClass = replaceRadius(result.cardClass, "rounded-md");
      result.buttonClass = replaceRadius(result.buttonClass, "rounded-md");
      result.inputClass = replaceRadius(result.inputClass, "rounded-md");
      result.modalClass = replaceRadius(result.modalClass, "rounded-lg");
      result.whatsappButtonClass = replaceRadius(result.whatsappButtonClass, "rounded-md");
      result.instagramButtonClass = replaceRadius(result.instagramButtonClass, "rounded-md");
      result.filterPillClass = replaceRadius(result.filterPillClass, "rounded-md");
      result.filterPillActiveClass = replaceRadius(result.filterPillActiveClass, "rounded-md");
    } else if (radius === "pill") {
      result.cardClass = replaceRadius(result.cardClass, "rounded-3xl");
      result.buttonClass = replaceRadius(result.buttonClass, "rounded-full");
      result.inputClass = replaceRadius(result.inputClass, "rounded-full");
      result.modalClass = replaceRadius(result.modalClass, "rounded-3xl");
      result.whatsappButtonClass = replaceRadius(result.whatsappButtonClass, "rounded-full");
      result.instagramButtonClass = replaceRadius(result.instagramButtonClass, "rounded-full");
      result.filterPillClass = replaceRadius(result.filterPillClass, "rounded-full");
      result.filterPillActiveClass = replaceRadius(result.filterPillActiveClass, "rounded-full");
    } else if (radius === "rounded") {
      result.cardClass = replaceRadius(result.cardClass, "rounded-2xl");
      result.buttonClass = replaceRadius(result.buttonClass, "rounded-xl");
      result.inputClass = replaceRadius(result.inputClass, "rounded-xl");
      result.modalClass = replaceRadius(result.modalClass, "rounded-2xl");
    }
  }

  const font = customSettings.font_family;
  if (font) {
    if (font === "serif") {
      result.fontHeadline = "font-serif tracking-tight font-bold";
      result.fontBody = "font-serif";
    } else if (font === "merriweather") {
      result.fontHeadline = "font-serif font-semibold tracking-normal";
      result.fontBody = "font-serif";
    } else if (font === "grotesk") {
      result.fontHeadline = "font-mono tracking-tighter uppercase font-bold";
      result.fontBody = "font-mono";
    } else if (font === "fira") {
      result.fontHeadline = "font-mono tracking-tight font-semibold";
      result.fontBody = "font-mono";
    } else if (font === "jakarta") {
      result.fontHeadline = "font-sans font-extrabold tracking-tight";
      result.fontBody = "font-sans";
    } else if (font === "outfit") {
      result.fontHeadline = "font-sans font-black tracking-tight";
      result.fontBody = "font-sans font-medium";
    } else if (font === "urbanist") {
      result.fontHeadline = "font-sans font-bold tracking-wide";
      result.fontBody = "font-sans font-medium";
    } else if (font === "roboto") {
      result.fontHeadline = "font-sans font-semibold tracking-normal";
      result.fontBody = "font-sans";
    } else {
      result.fontHeadline = "font-sans tracking-tight font-bold";
      result.fontBody = "font-sans";
    }
  }

  return result;
}


