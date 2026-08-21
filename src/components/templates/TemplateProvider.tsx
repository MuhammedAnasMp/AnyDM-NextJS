import React from "react";

export interface TemplateStyle {
  bodyClass: string;
  navClass: string;
  cardClass: string;
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

export function getTemplateStyles(templateId: string, themeId: string): TemplateStyle {
  // 1. Glass Monochrome
  if (templateId === "glass_monochrome") {
    const isLight = themeId === "light";
    const isFrosted = themeId === "frosted";
    const isDark = !isLight;

    return {
      isDark,
      accentColor: isLight ? "#605ca2" : isFrosted ? "#8fe3ff" : "#c4c0ff",
      bodyClass: isLight
        ? "bg-[#f5f5f5] text-[#131313]"
        : isFrosted
          ? "bg-[#0a1128] text-white"
          : "bg-[#131313] text-[#e5e2e1]",
      navClass: isLight
        ? "bg-white/80 backdrop-blur-md border-b border-black/10"
        : "bg-[#131313]/80 backdrop-blur-md border-b border-white/10",
      cardClass: isLight
        ? "bg-white/60 backdrop-blur-md border border-black/10 rounded-2xl shadow-sm hover:border-black/25 hover:shadow-md hover:bg-white/70 transition-all duration-300"
        : "bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl shadow-xl hover:border-white/25 hover:bg-white/[0.06] transition-all duration-300",
      buttonClass: isLight
        ? "bg-black text-white hover:bg-black/90 font-bold rounded-xl py-3.5 px-6 transition-all duration-200"
        : "bg-white text-black hover:bg-[#eaeaea] font-bold rounded-xl py-3.5 px-6 transition-all duration-200",
      badgeClass: isLight
        ? "bg-black/5 border border-black/10 text-black rounded-full px-3 py-1 text-[10px] uppercase font-bold"
        : "bg-white/5 border border-white/10 text-white rounded-full px-3 py-1 text-[10px] uppercase font-bold",
      textColorClass: isLight ? "text-black" : "text-white",
      textMutedClass: isLight ? "text-gray-500" : "text-gray-400",
      priceClass: isLight ? "text-black font-extrabold" : "text-white font-extrabold",
      fontHeadline: "font-sans tracking-tight",
      fontBody: "font-sans",
      containerClass: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
      whatsappButtonClass: "bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] font-bold rounded-xl py-3.5 hover:bg-[#25D366]/25 transition-all text-center",
      instagramButtonClass: "bg-gradient-to-tr from-[#fdf497] via-[#fd5949] to-[#d6249f] text-white font-bold rounded-xl py-4 hover:opacity-90 transition-all text-center",
      logoWrapperClass: "w-9 h-9 rounded-full overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center",
      inputClass: isLight
        ? "bg-black/5 border border-black/10 text-black placeholder-gray-400 rounded-xl px-4 py-2.5 focus:outline-none focus:border-black/30 transition-colors"
        : "bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-white/30 transition-colors",
      dividerClass: isLight ? "border-black/8" : "border-white/8",
      filterPillClass: isLight
        ? "px-4 py-1.5 rounded-full text-xs font-semibold border border-black/10 text-gray-600 hover:border-black/30 hover:text-black transition-all"
        : "px-4 py-1.5 rounded-full text-xs font-semibold border border-white/10 text-gray-400 hover:border-white/30 hover:text-white transition-all",
      filterPillActiveClass: isLight
        ? "px-4 py-1.5 rounded-full text-xs font-semibold bg-black text-white"
        : "px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-black",
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
        ? "bg-[#4A5D4E] text-white"
        : isWhite
          ? "bg-[#ffffff] text-[#111111]"
          : "bg-[#F9F7F2] text-[#2D362E]",
      navClass: isSage
        ? "bg-[#3d4f41]/90 backdrop-blur-xl border-b border-white/10"
        : "bg-[#F9F7F2]/90 backdrop-blur-xl border-b border-black/5",
      cardClass: isSage
        ? "bg-white/[0.06] border border-white/10 rounded-none transition-all duration-300 hover:bg-white/[0.10]"
        : "bg-[#F2EFE9] border border-[#C2C9C3]/40 rounded-none transition-all duration-300 hover:border-[#4A5D4E]/50",
      buttonClass: isSage
        ? "bg-white text-[#4A5D4E] font-bold tracking-widest uppercase rounded-none py-4 px-8 hover:bg-white/95 transition-all"
        : "bg-[#4A5D4E] text-white font-bold tracking-widest uppercase rounded-none py-4 px-8 hover:opacity-95 transition-all",
      badgeClass: isSage
        ? "border border-white/20 text-white rounded-none px-3 py-1 text-[10px] uppercase tracking-[0.2em]"
        : "border border-[#4A5D4E]/30 text-[#4A5D4E] rounded-none px-3 py-1 text-[10px] uppercase tracking-[0.2em]",
      textColorClass: isSage ? "text-white" : "text-[#2D362E]",
      textMutedClass: isSage ? "text-[#DCE3DE]/70" : "text-[#6A786C]",
      priceClass: isSage ? "text-white font-medium" : "text-[#4A5D4E] font-medium text-lg",
      fontHeadline: "font-serif italic font-bold",
      fontBody: "font-sans",
      containerClass: "max-w-screen-xl mx-auto px-4 sm:px-8 md:px-12",
      whatsappButtonClass: isSage
        ? "border border-white/20 text-white rounded-none py-4 hover:bg-white/5 transition-all text-center tracking-widest uppercase font-medium text-xs"
        : "border border-[#4A5D4E]/30 text-[#2D362E] rounded-none py-4 hover:bg-[#4A5D4E]/5 transition-all text-center tracking-widest uppercase font-medium text-xs",
      instagramButtonClass: isSage
        ? "border border-white/20 text-white rounded-none py-4 hover:bg-white/5 transition-all text-center tracking-widest uppercase font-medium text-xs"
        : "border border-[#E1306C]/30 text-[#2D362E] rounded-none py-4 hover:bg-[#E1306C]/5 transition-all text-center tracking-widest uppercase font-medium text-xs",
      logoWrapperClass: "w-9 h-9 rounded-full overflow-hidden bg-transparent border border-current flex items-center justify-center",
      inputClass: isSage
        ? "bg-white/5 border border-white/15 text-white placeholder-white/40 rounded-none px-4 py-2.5 focus:outline-none focus:border-white/40 transition-colors"
        : "bg-[#F2EFE9] border border-[#C2C9C3]/60 text-[#2D362E] placeholder-[#6A786C] rounded-none px-4 py-2.5 focus:outline-none focus:border-[#4A5D4E] transition-colors",
      dividerClass: isSage ? "border-white/10" : "border-[#C2C9C3]/30",
      filterPillClass: isSage
        ? "px-4 py-1.5 text-xs font-semibold border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-all tracking-wider uppercase"
        : "px-4 py-1.5 text-xs font-semibold border border-[#4A5D4E]/20 text-[#6A786C] hover:text-[#2D362E] hover:border-[#4A5D4E]/40 transition-all tracking-wider uppercase",
      filterPillActiveClass: isSage
        ? "px-4 py-1.5 text-xs font-semibold bg-white text-[#4A5D4E] tracking-wider uppercase"
        : "px-4 py-1.5 text-xs font-semibold bg-[#4A5D4E] text-white tracking-wider uppercase",
    };
  }

  // 3. Cyber Neon Dark
  if (templateId === "cyber_neon_dark") {
    const isSynth = themeId === "synthwave_sunset";
    const isMatrix = themeId === "matrix_green";
    const accent = isMatrix ? "#00ff00" : isSynth ? "#ff24e4" : "#00dbe9";

    return {
      isDark: true,
      accentColor: accent,
      bodyClass: isMatrix
        ? "bg-black text-[#00ff00]"
        : isSynth
          ? "bg-[#0d0e0f] text-[#fface8]"
          : "bg-[#121414] text-[#e2e2e2]",
      navClass: "bg-[#121414]/90 backdrop-blur-xl border-b border-[#3b494b]/50",
      cardClass: isMatrix
        ? "bg-black border border-[#00ff00]/40 rounded-none hover:border-[#00ff00] hover:shadow-[0_0_20px_rgba(0,255,0,0.25)] transition-all"
        : isSynth
          ? "bg-[#1e2020] border border-[#ff24e4]/40 rounded-none hover:border-[#ff24e4] hover:shadow-[0_0_20px_rgba(255,36,228,0.25)] transition-all"
          : "bg-[#1e2020] border border-[#00dbe9]/40 rounded-none hover:border-[#00f0ff] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all",
      buttonClass: isMatrix
        ? "bg-[#00ff00] text-black font-extrabold uppercase tracking-widest rounded-none py-4 px-8 hover:bg-black hover:text-[#00ff00] border border-[#00ff00] transition-all"
        : isSynth
          ? "bg-[#ff24e4] text-white font-extrabold uppercase tracking-widest rounded-none py-4 px-8 hover:bg-black border border-[#ff24e4] transition-all"
          : "bg-white text-black font-extrabold uppercase tracking-widest rounded-none py-4 px-8 hover:bg-black hover:text-white border border-white transition-all",
      badgeClass: "border border-current px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-mono font-bold",
      textColorClass: "text-white",
      textMutedClass: "text-zinc-500 font-mono",
      priceClass: isMatrix ? "text-[#00ff00] font-mono text-lg" : isSynth ? "text-[#ff24e4] font-mono text-lg" : "text-[#00f0ff] font-mono text-lg",
      fontHeadline: "font-sans uppercase tracking-widest font-black",
      fontBody: "font-mono",
      containerClass: "max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10",
      whatsappButtonClass: isMatrix
        ? "border border-[#00ff00]/40 text-[#00ff00] rounded-none py-4 hover:bg-[#00ff00]/10 transition-all font-mono uppercase tracking-widest text-center text-xs"
        : "border border-[#25D366]/40 text-white rounded-none py-4 hover:bg-[#25D366]/10 transition-all font-mono uppercase tracking-widest text-center text-xs",
      instagramButtonClass: isMatrix
        ? "border border-[#00ff00]/40 text-[#00ff00] rounded-none py-4 hover:bg-[#00ff00]/10 transition-all font-mono uppercase tracking-widest text-center text-xs"
        : "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white font-bold rounded-none py-4 hover:opacity-90 transition-all font-mono uppercase tracking-widest text-center text-xs",
      logoWrapperClass: "w-9 h-9 rounded-full overflow-hidden bg-transparent border border-zinc-700 flex items-center justify-center",
      inputClass: `bg-black border border-[${accent}]/30 text-white placeholder-zinc-600 font-mono rounded-none px-4 py-2.5 focus:outline-none focus:border-[${accent}] transition-colors`,
      dividerClass: `border-[${accent}]/20`,
      filterPillClass: `px-4 py-1.5 text-xs font-mono uppercase border border-[${accent}]/30 text-zinc-400 hover:text-[${accent}] hover:border-[${accent}] transition-all tracking-widest`,
      filterPillActiveClass: `px-4 py-1.5 text-xs font-mono uppercase border border-[${accent}] text-black bg-[${accent}] tracking-widest`,
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
          : "bg-black text-[#ededed]",
      navClass: isLight
        ? "bg-white border-b border-black/10"
        : "bg-black border-b border-white/10",
      cardClass: isLight
        ? "bg-transparent border border-black/10 rounded-none hover:border-black transition-all duration-200"
        : "bg-transparent border border-white/10 rounded-none hover:border-white transition-all duration-200",
      buttonClass: isLight
        ? "bg-black text-white rounded-none py-3.5 px-8 text-xs font-bold uppercase hover:bg-black/90 transition-all"
        : "bg-white text-black rounded-none py-3.5 px-8 text-xs font-bold uppercase hover:bg-[#eaeaea] transition-all",
      badgeClass: isLight
        ? "border border-black text-black px-2 py-0.5 text-[9px] uppercase font-mono"
        : "border border-white text-white px-2 py-0.5 text-[9px] uppercase font-mono",
      textColorClass: isLight ? "text-black" : "text-white",
      textMutedClass: "text-zinc-500 font-mono",
      priceClass: isLight ? "text-black font-bold font-mono" : "text-white font-bold font-mono",
      fontHeadline: "font-mono uppercase tracking-tighter",
      fontBody: "font-mono",
      containerClass: "max-w-7xl mx-auto px-4 sm:px-8",
      whatsappButtonClass: isLight
        ? "border border-black text-black text-xs font-bold uppercase py-3.5 hover:bg-black/5 transition-all text-center rounded-none"
        : "border border-white text-white text-xs font-bold uppercase py-3.5 hover:bg-white/5 transition-all text-center rounded-none",
      instagramButtonClass: isLight
        ? "bg-black text-white text-xs font-bold uppercase py-3.5 hover:bg-black/90 transition-all text-center rounded-none"
        : "bg-white text-black text-xs font-bold uppercase py-3.5 hover:bg-[#eaeaea] transition-all text-center rounded-none",
      logoWrapperClass: "w-9 h-9 rounded-full overflow-hidden bg-transparent border border-current flex items-center justify-center",
      inputClass: isLight
        ? "bg-transparent border border-black/20 text-black placeholder-gray-400 font-mono rounded-none px-4 py-2.5 focus:outline-none focus:border-black transition-colors"
        : "bg-transparent border border-white/20 text-white placeholder-gray-600 font-mono rounded-none px-4 py-2.5 focus:outline-none focus:border-white transition-colors",
      dividerClass: isLight ? "border-black/10" : "border-white/10",
      filterPillClass: isLight
        ? "px-4 py-1.5 text-xs font-mono uppercase border border-black/20 text-gray-500 hover:text-black hover:border-black transition-all"
        : "px-4 py-1.5 text-xs font-mono uppercase border border-white/20 text-gray-500 hover:text-white hover:border-white transition-all",
      filterPillActiveClass: isLight
        ? "px-4 py-1.5 text-xs font-mono uppercase bg-black text-white"
        : "px-4 py-1.5 text-xs font-mono uppercase bg-white text-black",
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
      navClass: "bg-transparent border-none",
      cardClass: "bg-transparent border-none rounded-none transition-opacity duration-300 hover:opacity-95",
      buttonClass: isDark
        ? "bg-[#c5a880] text-black font-semibold rounded-none py-4 px-10 tracking-widest text-xs uppercase hover:opacity-90 transition-all"
        : "bg-[#1c1c1c] text-white font-semibold rounded-none py-4 px-10 tracking-widest text-xs uppercase hover:bg-black transition-all",
      badgeClass: "border-b border-current pb-0.5 text-[10px] tracking-widest uppercase italic font-serif",
      textColorClass: isDark ? "text-white" : "text-[#1c1c1c]",
      textMutedClass: isDark ? "text-zinc-500" : "text-zinc-600",
      priceClass: "font-serif text-xl italic font-normal",
      fontHeadline: "font-serif italic font-light tracking-wide",
      fontBody: "font-sans",
      containerClass: "max-w-5xl mx-auto px-4 sm:px-6",
      whatsappButtonClass: "border-b border-current py-2 tracking-widest text-xs uppercase font-semibold text-center hover:opacity-80 transition-all",
      instagramButtonClass: isDark
        ? "bg-[#c5a880] text-black tracking-widest text-xs uppercase font-semibold py-4 hover:opacity-90 transition-all text-center"
        : "bg-[#1c1c1c] text-white tracking-widest text-xs uppercase font-semibold py-4 hover:bg-black transition-all text-center",
      logoWrapperClass: "w-9 h-9 rounded-full overflow-hidden bg-transparent border border-current flex items-center justify-center",
      inputClass: isDark
        ? "bg-transparent border-b border-white/20 text-white placeholder-zinc-600 font-serif rounded-none px-0 py-2 focus:outline-none focus:border-[#c5a880] transition-colors"
        : "bg-transparent border-b border-black/20 text-black placeholder-zinc-500 font-serif rounded-none px-0 py-2 focus:outline-none focus:border-black transition-colors",
      dividerClass: isDark ? "border-white/8" : "border-black/8",
      filterPillClass: isDark
        ? "px-4 py-1.5 text-xs font-serif italic border-b border-white/15 text-zinc-500 hover:text-white hover:border-white/40 transition-all"
        : "px-4 py-1.5 text-xs font-serif italic border-b border-black/15 text-zinc-500 hover:text-black hover:border-black/40 transition-all",
      filterPillActiveClass: isDark
        ? "px-4 py-1.5 text-xs font-serif italic border-b-2 border-[#c5a880] text-white"
        : "px-4 py-1.5 text-xs font-serif italic border-b-2 border-black text-black",
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
      navClass: "bg-white border-b-4 border-black",
      cardClass: "bg-white border-4 border-black shadow-[6px_6px_0px_#000000] hover:shadow-[10px_10px_0px_#000000] hover:-translate-x-1 hover:-translate-y-1 transition-all rounded-none overflow-hidden text-black",
      buttonClass: "bg-[#0038ff] text-white border-4 border-black font-extrabold uppercase tracking-wide shadow-[4px_4px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_#000] rounded-none py-3.5 px-8 transition-all",
      badgeClass: "bg-white text-black border-2 border-black font-black uppercase text-[10px] px-2 py-0.5 rounded-none inline-block",
      textColorClass: "text-black",
      textMutedClass: "text-zinc-600 font-bold",
      priceClass: "font-black text-xl text-black",
      fontHeadline: "font-sans uppercase tracking-tight font-black",
      fontBody: "font-sans font-bold",
      containerClass: "max-w-7xl mx-auto px-4 sm:px-6",
      whatsappButtonClass: "bg-white text-black border-4 border-black font-black uppercase py-3 hover:bg-zinc-100 transition-all shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] text-center",
      instagramButtonClass: "bg-[#ffe600] text-black border-4 border-black font-black uppercase py-3.5 hover:bg-[#ffd600] transition-all shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] text-center",
      logoWrapperClass: "w-9 h-9 rounded-none overflow-hidden bg-transparent border-2 border-black flex items-center justify-center",
      inputClass: "bg-white border-2 border-black text-black placeholder-zinc-400 font-bold rounded-none px-4 py-2.5 focus:outline-none focus:border-[#0038ff] shadow-[2px_2px_0px_#000] transition-colors",
      dividerClass: "border-black/20",
      filterPillClass: "px-4 py-1.5 text-xs font-black uppercase border-2 border-black text-black bg-white hover:bg-[#ffe600] transition-all",
      filterPillActiveClass: "px-4 py-1.5 text-xs font-black uppercase border-2 border-black text-white bg-[#0038ff]",
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
      navClass: "bg-transparent border-none",
      cardClass: "bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/[0.06] transition-all",
      buttonClass: "bg-white text-black font-bold rounded-xl py-3.5 px-6 transition-all duration-200",
      badgeClass: "bg-white/5 border border-white/10 text-white rounded-full px-3 py-1 text-[10px] uppercase font-bold",
      textColorClass: "text-white",
      textMutedClass: "text-gray-400",
      priceClass: "text-white font-extrabold",
      fontHeadline: "font-sans tracking-tight",
      fontBody: "font-sans",
      containerClass: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
      whatsappButtonClass: "bg-[#25D366] text-white font-bold rounded-xl py-3.5 hover:opacity-90 transition-all text-center",
      instagramButtonClass: "bg-gradient-to-tr from-[#fdf497] via-[#fd5949] to-[#d6249f] text-white font-bold rounded-xl py-4 hover:opacity-90 transition-all text-center",
      logoWrapperClass: "w-9 h-9 rounded-full overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center",
      inputClass: "bg-white/5 border border-white/15 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-white/30 transition-colors backdrop-blur-sm",
      dividerClass: "border-white/8",
      filterPillClass: "px-4 py-1.5 rounded-full text-xs font-semibold border border-white/10 text-gray-400 hover:border-white/25 hover:text-white transition-all backdrop-blur-sm",
      filterPillActiveClass: "px-4 py-1.5 rounded-full text-xs font-semibold bg-white/15 border border-white/20 text-white backdrop-blur-sm",
    };
  }

  // 8. NEW: Luxury Boutique (SSENSE/Mytheresa-style)
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
        ? "bg-[#0d0d0d]/95 backdrop-blur-sm border-b border-white/8"
        : isRose
          ? "bg-[#fdf6f0]/95 backdrop-blur-sm border-b border-[#2a1a1f]/8"
          : "bg-[#faf8f4]/95 backdrop-blur-sm border-b border-[#1a1714]/8",
      cardClass: "bg-transparent border-none rounded-none transition-all duration-500 hover:opacity-95 group",
      buttonClass: isNight
        ? "border border-[#d4a96a] text-[#d4a96a] font-light tracking-[0.2em] text-xs uppercase py-4 px-10 hover:bg-[#d4a96a] hover:text-black transition-all duration-300 rounded-none"
        : isRose
          ? "bg-[#2a1a1f] text-[#fdf6f0] font-light tracking-[0.2em] text-xs uppercase py-4 px-10 hover:bg-black transition-all duration-300 rounded-none"
          : "bg-[#1a1714] text-[#faf8f4] font-light tracking-[0.2em] text-xs uppercase py-4 px-10 hover:bg-black transition-all duration-300 rounded-none",
      badgeClass: isNight
        ? "text-[#d4a96a] text-[9px] tracking-[0.25em] uppercase font-light"
        : isRose
          ? "text-[#c4748a] text-[9px] tracking-[0.25em] uppercase font-light"
          : "text-[#b8955a] text-[9px] tracking-[0.25em] uppercase font-light",
      textColorClass: isNight
        ? "text-[#f5f0e8]"
        : isRose
          ? "text-[#2a1a1f]"
          : "text-[#1a1714]",
      textMutedClass: "text-zinc-500",
      priceClass: isNight
        ? "text-[#f5f0e8] font-light text-base tracking-wide"
        : isRose
          ? "text-[#2a1a1f] font-light text-base tracking-wide"
          : "text-[#1a1714] font-light text-base tracking-wide",
      fontHeadline: "font-serif font-light tracking-wide",
      fontBody: "font-sans font-light",
      containerClass: "max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-16",
      whatsappButtonClass: isNight
        ? "border border-white/15 text-white/80 font-light tracking-[0.2em] text-xs uppercase py-4 hover:border-white/30 transition-all text-center rounded-none"
        : "border border-black/15 text-black/70 font-light tracking-[0.2em] text-xs uppercase py-4 hover:border-black/30 transition-all text-center rounded-none",
      instagramButtonClass: isNight
        ? "border border-[#d4a96a]/30 text-[#d4a96a] font-light tracking-[0.2em] text-xs uppercase py-4 hover:bg-[#d4a96a]/10 transition-all text-center rounded-none"
        : isRose
          ? "bg-[#2a1a1f] text-[#fdf6f0] font-light tracking-[0.2em] text-xs uppercase py-4 hover:bg-black transition-all text-center rounded-none"
          : "bg-[#1a1714] text-[#faf8f4] font-light tracking-[0.2em] text-xs uppercase py-4 hover:bg-black transition-all text-center rounded-none",
      logoWrapperClass: "w-9 h-9 rounded-none overflow-hidden bg-transparent flex items-center justify-center",
      inputClass: isNight
        ? "bg-transparent border-b border-white/15 text-white placeholder-zinc-600 font-light rounded-none px-0 py-2.5 focus:outline-none focus:border-[#d4a96a] transition-colors"
        : isRose
          ? "bg-transparent border-b border-black/15 text-[#2a1a1f] placeholder-zinc-400 font-light rounded-none px-0 py-2.5 focus:outline-none focus:border-[#c4748a] transition-colors"
          : "bg-transparent border-b border-black/15 text-[#1a1714] placeholder-zinc-400 font-light rounded-none px-0 py-2.5 focus:outline-none focus:border-[#b8955a] transition-colors",
      dividerClass: isNight ? "border-white/8" : "border-black/8",
      filterPillClass: isNight
        ? "text-xs font-light tracking-[0.2em] uppercase text-zinc-500 hover:text-white transition-colors pb-0.5 border-b border-transparent hover:border-white/20"
        : "text-xs font-light tracking-[0.2em] uppercase text-zinc-400 hover:text-black transition-colors pb-0.5 border-b border-transparent hover:border-black/20",
      filterPillActiveClass: isNight
        ? "text-xs font-light tracking-[0.2em] uppercase text-[#d4a96a] pb-0.5 border-b border-[#d4a96a]"
        : isRose
          ? "text-xs font-light tracking-[0.2em] uppercase text-[#2a1a1f] pb-0.5 border-b border-[#2a1a1f]"
          : "text-xs font-light tracking-[0.2em] uppercase text-[#1a1714] pb-0.5 border-b border-[#1a1714]",
    };
  }

  // 9. NEW: Streetwear Bold (Supreme/Nike-style)
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
        ? "bg-[#111111] border-2 border-[#1f1f1f] rounded-none hover:border-[#ff0000] transition-all duration-200 group"
        : isOrange
          ? "bg-[#111111] border-2 border-[#1f1f1f] rounded-none hover:border-[#ff5a00] transition-all duration-200 group"
          : "bg-[#111111] border-2 border-[#1f1f1f] rounded-none hover:border-[#7c3aed] transition-all duration-200 group",
      buttonClass: isRed
        ? "bg-[#ff0000] text-white font-black uppercase tracking-widest text-sm py-4 px-8 rounded-none hover:brightness-110 transition-all active:scale-95"
        : isOrange
          ? "bg-[#ff5a00] text-white font-black uppercase tracking-widest text-sm py-4 px-8 rounded-none hover:brightness-110 transition-all active:scale-95"
          : "bg-[#7c3aed] text-white font-black uppercase tracking-widest text-sm py-4 px-8 rounded-none hover:brightness-110 transition-all active:scale-95",
      badgeClass: isRed
        ? "bg-[#ff0000] text-white font-black uppercase text-[9px] tracking-widest px-2 py-0.5 rounded-none"
        : isOrange
          ? "bg-[#ff5a00] text-white font-black uppercase text-[9px] tracking-widest px-2 py-0.5 rounded-none"
          : "bg-[#7c3aed] text-white font-black uppercase text-[9px] tracking-widest px-2 py-0.5 rounded-none",
      textColorClass: "text-white",
      textMutedClass: "text-zinc-500",
      priceClass: "text-white font-black text-lg",
      fontHeadline: "font-sans font-black uppercase tracking-tight",
      fontBody: "font-sans",
      containerClass: "max-w-screen-xl mx-auto px-4 sm:px-6",
      whatsappButtonClass: "bg-[#1f1f1f] text-white border-2 border-white/20 font-bold uppercase tracking-widest text-xs py-4 hover:bg-white hover:text-black transition-all text-center rounded-none",
      instagramButtonClass: isRed
        ? "bg-[#ff0000] text-white font-black uppercase tracking-widest text-xs py-4 hover:brightness-110 transition-all text-center rounded-none"
        : isOrange
          ? "bg-[#ff5a00] text-white font-black uppercase tracking-widest text-xs py-4 hover:brightness-110 transition-all text-center rounded-none"
          : "bg-[#7c3aed] text-white font-black uppercase tracking-widest text-xs py-4 hover:brightness-110 transition-all text-center rounded-none",
      logoWrapperClass: "w-9 h-9 rounded-none overflow-hidden bg-transparent border-2 border-white flex items-center justify-center",
      inputClass: isRed
        ? "bg-[#111111] border-2 border-[#1f1f1f] text-white placeholder-zinc-600 font-bold rounded-none px-4 py-2.5 focus:outline-none focus:border-[#ff0000] transition-colors"
        : isOrange
          ? "bg-[#111111] border-2 border-[#1f1f1f] text-white placeholder-zinc-600 font-bold rounded-none px-4 py-2.5 focus:outline-none focus:border-[#ff5a00] transition-colors"
          : "bg-[#111111] border-2 border-[#1f1f1f] text-white placeholder-zinc-600 font-bold rounded-none px-4 py-2.5 focus:outline-none focus:border-[#7c3aed] transition-colors",
      dividerClass: "border-white/10",
      filterPillClass: isRed
        ? "px-4 py-1.5 text-xs font-black uppercase border-2 border-[#1f1f1f] text-zinc-500 hover:border-[#ff0000] hover:text-[#ff0000] transition-all bg-[#0a0a0a]"
        : isOrange
          ? "px-4 py-1.5 text-xs font-black uppercase border-2 border-[#1f1f1f] text-zinc-500 hover:border-[#ff5a00] hover:text-[#ff5a00] transition-all bg-[#0a0a0a]"
          : "px-4 py-1.5 text-xs font-black uppercase border-2 border-[#1f1f1f] text-zinc-500 hover:border-[#7c3aed] hover:text-[#7c3aed] transition-all bg-[#0a0a0a]",
      filterPillActiveClass: isRed
        ? "px-4 py-1.5 text-xs font-black uppercase border-2 border-[#ff0000] text-[#ff0000] bg-[#0a0a0a]"
        : isOrange
          ? "px-4 py-1.5 text-xs font-black uppercase border-2 border-[#ff5a00] text-[#ff5a00] bg-[#0a0a0a]"
          : "px-4 py-1.5 text-xs font-black uppercase border-2 border-[#7c3aed] text-[#7c3aed] bg-[#0a0a0a]",
    };
  }

  // 10. NEW: Sunset Gradient (warm tropical vibes)
  if (templateId === "sunset_gradient") {
    const isTropical = themeId === "tropical_dawn" || !themeId;
    const isOcean = themeId === "ocean_breeze";
    const isBloom = themeId === "cherry_bloom";

    let accent = "#f97316";
    if (isOcean) accent = "#0ea5e9";
    if (isBloom) accent = "#ec4899";

    return {
      isDark: false,
      accentColor: accent,
      bodyClass: isTropical
        ? "bg-gradient-to-br from-[#fff7ed] via-[#fef3c7] to-[#fce7f3] text-[#1a0a00] min-h-screen"
        : isOcean
          ? "bg-gradient-to-br from-[#eff6ff] via-[#dbeafe] to-[#e0f2fe] text-[#0c1a2e] min-h-screen"
          : "bg-gradient-to-br from-[#fdf2f8] via-[#fce7f3] to-[#fff1f2] text-[#1a0018] min-h-screen",
      navClass: isTropical
        ? "bg-white/80 backdrop-blur-md border-b border-orange-100"
        : isOcean
          ? "bg-white/80 backdrop-blur-md border-b border-blue-100"
          : "bg-white/80 backdrop-blur-md border-b border-pink-100",
      cardClass: isTropical
        ? "bg-white/70 backdrop-blur-sm border border-orange-100 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300"
        : isOcean
          ? "bg-white/70 backdrop-blur-sm border border-blue-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300"
          : "bg-white/70 backdrop-blur-sm border border-pink-100 rounded-2xl shadow-sm hover:shadow-md hover:border-pink-200 transition-all duration-300",
      buttonClass: isTropical
        ? "bg-[#f97316] text-white font-bold rounded-full py-3.5 px-8 hover:opacity-90 hover:scale-[1.02] transition-all shadow-md shadow-[#f97316]/25"
        : isOcean
          ? "bg-[#0ea5e9] text-white font-bold rounded-full py-3.5 px-8 hover:opacity-90 hover:scale-[1.02] transition-all shadow-md shadow-[#0ea5e9]/25"
          : "bg-[#ec4899] text-white font-bold rounded-full py-3.5 px-8 hover:opacity-90 hover:scale-[1.02] transition-all shadow-md shadow-[#ec4899]/25",
      badgeClass: isTropical
        ? "bg-[#f97316]/10 border border-[#f97316]/30 text-[#f97316] rounded-full px-3 py-1 text-[10px] uppercase font-bold"
        : isOcean
          ? "bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 text-[#0ea5e9] rounded-full px-3 py-1 text-[10px] uppercase font-bold"
          : "bg-[#ec4899]/10 border border-[#ec4899]/30 text-[#ec4899] rounded-full px-3 py-1 text-[10px] uppercase font-bold",
      textColorClass: isTropical
        ? "text-[#1a0a00]"
        : isOcean
          ? "text-[#0c1a2e]"
          : "text-[#1a0018]",
      textMutedClass: "text-zinc-500",
      priceClass: isTropical
        ? "text-[#f97316] font-bold text-base"
        : isOcean
          ? "text-[#0ea5e9] font-bold text-base"
          : "text-[#ec4899] font-bold text-base",
      fontHeadline: "font-sans font-bold tracking-tight",
      fontBody: "font-sans",
      containerClass: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
      whatsappButtonClass: "bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-bold rounded-full py-3.5 hover:bg-[#25D366]/20 transition-all text-center",
      instagramButtonClass: "bg-gradient-to-tr from-[#fdf497] via-[#fd5949] to-[#d6249f] text-white font-bold rounded-full py-4 hover:opacity-90 transition-all text-center",
      logoWrapperClass: isTropical
        ? "w-9 h-9 rounded-full overflow-hidden border-2 border-[#f97316]/20 bg-white flex items-center justify-center shadow-sm"
        : isOcean
          ? "w-9 h-9 rounded-full overflow-hidden border-2 border-[#0ea5e9]/20 bg-white flex items-center justify-center shadow-sm"
          : "w-9 h-9 rounded-full overflow-hidden border-2 border-[#ec4899]/20 bg-white flex items-center justify-center shadow-sm",
      inputClass: isTropical
        ? "bg-white/70 backdrop-blur-sm border border-[#f97316]/20 text-[#1a0a00] placeholder-zinc-400 rounded-full px-5 py-2.5 focus:outline-none focus:border-[#f97316]/50 transition-colors shadow-sm"
        : isOcean
          ? "bg-white/70 backdrop-blur-sm border border-[#0ea5e9]/20 text-[#0c1a2e] placeholder-zinc-400 rounded-full px-5 py-2.5 focus:outline-none focus:border-[#0ea5e9]/50 transition-colors shadow-sm"
          : "bg-white/70 backdrop-blur-sm border border-[#ec4899]/20 text-[#1a0018] placeholder-zinc-400 rounded-full px-5 py-2.5 focus:outline-none focus:border-[#ec4899]/50 transition-colors shadow-sm",
      dividerClass: isTropical
        ? "border-[#f97316]/10"
        : isOcean
          ? "border-[#0ea5e9]/10"
          : "border-[#ec4899]/10",
      filterPillClass: isTropical
        ? "px-4 py-1.5 rounded-full text-xs font-semibold border border-[#f97316]/20 text-zinc-500 hover:border-[#f97316]/40 hover:text-[#f97316] transition-all bg-white/50"
        : isOcean
          ? "px-4 py-1.5 rounded-full text-xs font-semibold border border-[#0ea5e9]/20 text-zinc-500 hover:border-[#0ea5e9]/40 hover:text-[#0ea5e9] transition-all bg-white/50"
          : "px-4 py-1.5 rounded-full text-xs font-semibold border border-[#ec4899]/20 text-zinc-500 hover:border-[#ec4899]/40 hover:text-[#ec4899] transition-all bg-white/50",
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
    navClass: "bg-black/40 backdrop-blur-md border-b border-white/10",
    cardClass: "bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/[0.05] transition-all",
    buttonClass: "bg-white text-black hover:bg-[#eaeaea] font-bold rounded-xl py-3 px-6 transition-all",
    badgeClass: "bg-white/5 border border-white/10 text-white rounded-full px-3 py-1 text-[10px]",
    textColorClass: "text-white",
    textMutedClass: "text-gray-400",
    priceClass: "text-white font-extrabold",
    fontHeadline: "font-sans tracking-tight",
    fontBody: "font-sans",
    containerClass: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    whatsappButtonClass: "bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] font-bold rounded-xl py-3 text-center",
    instagramButtonClass: "bg-white text-black font-bold rounded-xl py-3.5 text-center",
    logoWrapperClass: "w-9 h-9 rounded-full overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center",
    inputClass: "bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-white/30 transition-colors",
    dividerClass: "border-white/8",
    filterPillClass: "px-4 py-1.5 rounded-full text-xs font-semibold border border-white/10 text-gray-400 hover:border-white/25 hover:text-white transition-all",
    filterPillActiveClass: "px-4 py-1.5 rounded-full text-xs font-semibold bg-white/15 border border-white/20 text-white",
  };
}
