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
}

export function getTemplateStyles(templateId: string, themeId: string): TemplateStyle {
  // 1. Glass Monochrome (Stitch Screen: PDP: Glass Monochrome)
  if (templateId === "glass_monochrome") {
    const isLight = themeId === "light";
    const isFrosted = themeId === "frosted";
    
    return {
      bodyClass: isLight 
        ? "bg-[#f5f5f5] text-[#131313]" 
        : isFrosted 
          ? "bg-[#0a1128] text-white" 
          : "bg-[#131313] text-[#e5e2e1]",
      navClass: isLight 
        ? "bg-white/70 backdrop-blur-md border-b border-black/10" 
        : "bg-[#131313]/80 backdrop-blur-md border-b border-white/10",
      cardClass: isLight
        ? "bg-white/40 backdrop-blur-md border border-black/10 rounded-2xl shadow-sm hover:border-black/20 hover:bg-white/50 transition-all duration-300"
        : "bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl shadow-xl hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300",
      buttonClass: isLight
        ? "bg-black text-white hover:bg-black/90 font-bold rounded-xl py-3.5 px-6 transition-all duration-200"
        : "bg-white text-black hover:bg-[#eaeaea] font-bold rounded-xl py-3.5 px-6 transition-all duration-200",
      badgeClass: isLight
        ? "bg-black/5 border border-black/10 text-black rounded-full px-3 py-1 text-[10px] uppercase font-bold"
        : "bg-white/5 border border-white/10 text-white rounded-full px-3 py-1 text-[10px] uppercase font-bold",
      textColorClass: isLight ? "text-black" : "text-white",
      textMutedClass: isLight ? "text-gray-600" : "text-gray-400",
      priceClass: isLight ? "text-black font-extrabold" : "text-white font-extrabold",
      fontHeadline: "font-sans tracking-tight",
      fontBody: "font-sans",
      containerClass: "max-w-7xl mx-auto px-6",
      whatsappButtonClass: "bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] font-bold rounded-xl py-3.5 hover:bg-[#25D366]/25 transition-all text-center",
      instagramButtonClass: "bg-gradient-to-tr from-[#fdf497] via-[#fd5949] to-[#d6249f] text-white font-bold rounded-xl py-4 hover:opacity-90 transition-all text-center",
      logoWrapperClass: "w-8 h-8 rounded-full overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center"
    };
  }

  // 2. Organic Minimalist (Stitch Screen: PDP: Organic Minimalist Variation)
  // - Fonts: Playfair Display for headings, Inter for body
  // - Color palette: Cream background (#F9F7F2), sage green highlights (#4A5D4E), dark green text (#2D362E)
  // - Border radius: Zero round corners (0px / rounded-none)
  if (templateId === "organic_minimalist") {
    const isSage = themeId === "soft_sage";
    const isWhite = themeId === "pure_white";

    return {
      bodyClass: isSage 
        ? "bg-[#4A5D4E] text-white" 
        : isWhite 
          ? "bg-[#ffffff] text-[#111111]" 
          : "bg-[#F9F7F2] text-[#2D362E]",
      navClass: isSage
        ? "bg-[#4A5D4E]/80 backdrop-blur-xl border-b border-white/10"
        : "bg-[#F9F7F2]/80 backdrop-blur-xl border-b border-black/5",
      cardClass: isSage
        ? "bg-white/[0.04] border border-white/10 rounded-none transition-all duration-300 hover:bg-white/[0.07]"
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
      containerClass: "max-w-screen-2xl mx-auto px-8 md:px-16",
      whatsappButtonClass: isSage
        ? "border border-white/20 text-white rounded-none py-4 hover:bg-white/5 transition-all text-center tracking-widest uppercase font-medium text-xs"
        : "border border-[#4A5D4E]/30 text-[#2D362E] rounded-none py-4 hover:bg-[#4A5D4E]/5 transition-all text-center tracking-widest uppercase font-medium text-xs",
      instagramButtonClass: isSage
        ? "border border-white/20 text-white rounded-none py-4 hover:bg-white/5 transition-all text-center tracking-widest uppercase font-medium text-xs"
        : "border border-[#E1306C]/30 text-[#2D362E] rounded-none py-4 hover:bg-[#E1306C]/5 transition-all text-center tracking-widest uppercase font-medium text-xs",
      logoWrapperClass: "w-8 h-8 rounded-none overflow-hidden bg-transparent border border-current flex items-center justify-center"
    };
  }

  // 3. Cyber Neon Dark (Stitch Screen: PDP: Cyber-Neon Dark Variation)
  // - Fonts: Sora for headings, Inter for body, JetBrains Mono for codes/labels
  // - Colors: Black background (#121414), neon blue highlights (#00dbe9), neon pink/green accents
  // - Shape: Sharp corners, zero border radius (rounded-none / 0px)
  if (templateId === "cyber_neon_dark") {
    const isSynth = themeId === "synthwave_sunset";
    const isMatrix = themeId === "matrix_green";

    return {
      bodyClass: isMatrix 
        ? "bg-black text-[#00ff00]" 
        : isSynth 
          ? "bg-[#0d0e0f] text-[#fface8]" 
          : "bg-[#121414] text-[#e2e2e2]",
      navClass: "bg-[#121414]/90 backdrop-blur-xl border-b border-[#3b494b]/50",
      cardClass: isMatrix
        ? "bg-black border border-[#00ff00]/40 rounded-none hover:border-[#00ff00] hover:shadow-[0_0_15px_rgba(0,255,0,0.3)] transition-all"
        : isSynth
          ? "bg-[#1e2020] border border-[#ff24e4]/40 rounded-none hover:border-[#ff24e4] hover:shadow-[0_0_15px_rgba(255,36,228,0.3)] transition-all"
          : "bg-[#1e2020] border border-[#00dbe9]/40 rounded-none hover:border-[#00f0ff] hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all",
      buttonClass: isMatrix
        ? "bg-[#00ff00] text-black font-extrabold uppercase tracking-widest rounded-none py-4 px-8 hover:bg-black hover:text-[#00ff00] border border-[#00ff00] transition-all"
        : isSynth
          ? "bg-[#ff24e4] text-white font-extrabold uppercase tracking-widest rounded-none py-4 px-8 hover:bg-black border border-[#ff24e4] transition-all"
          : "bg-white text-black font-extrabold uppercase tracking-widest rounded-none py-4 px-8 hover:bg-black hover:text-white border border-white transition-all",
      badgeClass: "border border-current px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-mono font-bold",
      textColorClass: "text-white",
      textMutedClass: "text-zinc-500 font-mono",
      priceClass: isMatrix ? "text-[#00ff00] font-mono text-lg" : "text-[#00f0ff] font-mono text-lg",
      fontHeadline: "font-sans uppercase tracking-widest font-black",
      fontBody: "font-mono",
      containerClass: "max-w-screen-2xl mx-auto px-6 lg:px-12",
      whatsappButtonClass: isMatrix
        ? "border border-[#00ff00]/40 text-[#00ff00] rounded-none py-4 hover:bg-[#00ff00]/10 transition-all font-mono uppercase tracking-widest text-center text-xs"
        : "border border-[#25D366]/40 text-white rounded-none py-4 hover:bg-[#25D366]/10 transition-all font-mono uppercase tracking-widest text-center text-xs",
      instagramButtonClass: isMatrix
        ? "border border-[#00ff00]/40 text-[#00ff00] rounded-none py-4 hover:bg-[#00ff00]/10 transition-all font-mono uppercase tracking-widest text-center text-xs"
        : "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white font-bold rounded-none py-4 hover:opacity-90 transition-all font-mono uppercase tracking-widest text-center text-xs",
      logoWrapperClass: "w-8 h-8 rounded-none overflow-hidden bg-transparent border border-zinc-700 flex items-center justify-center"
    };
  }

  // 4. Monochrome Precision (clinical, sharp grids, absolute black and white)
  if (templateId === "monochrome_precision") {
    const isWhite = themeId === "paper_white";
    const isGray = themeId === "cool_gray";

    return {
      bodyClass: isWhite 
        ? "bg-white text-black" 
        : isGray 
          ? "bg-[#f8f9fa] text-black" 
          : "bg-black text-[#ededed]",
      navClass: isWhite
        ? "bg-white border-b border-black/10"
        : "bg-black border-b border-white/10",
      cardClass: isWhite
        ? "bg-transparent border border-black/10 rounded-none hover:border-black transition-all duration-200"
        : "bg-transparent border border-white/10 rounded-none hover:border-white transition-all duration-200",
      buttonClass: isWhite
        ? "bg-black text-white rounded-none py-3.5 px-8 text-xs font-bold uppercase hover:bg-black/90 transition-all"
        : "bg-white text-black rounded-none py-3.5 px-8 text-xs font-bold uppercase hover:bg-[#eaeaea] transition-all",
      badgeClass: isWhite
        ? "border border-black text-black px-2 py-0.5 text-[9px] uppercase font-mono"
        : "border border-white text-white px-2 py-0.5 text-[9px] uppercase font-mono",
      textColorClass: isWhite ? "text-black" : "text-white",
      textMutedClass: "text-zinc-500 font-mono",
      priceClass: isWhite ? "text-black font-bold font-mono" : "text-white font-bold font-mono",
      fontHeadline: "font-mono uppercase tracking-tighter",
      fontBody: "font-mono",
      containerClass: "max-w-7xl mx-auto px-8",
      whatsappButtonClass: isWhite 
        ? "border border-black text-black text-xs font-bold uppercase py-3.5 hover:bg-black/5 transition-all text-center rounded-none"
        : "border border-white text-white text-xs font-bold uppercase py-3.5 hover:bg-white/5 transition-all text-center rounded-none",
      instagramButtonClass: isWhite
        ? "bg-black text-white text-xs font-bold uppercase py-3.5 hover:bg-black/90 transition-all text-center rounded-none"
        : "bg-white text-black text-xs font-bold uppercase py-3.5 hover:bg-[#eaeaea] transition-all text-center rounded-none",
      logoWrapperClass: "w-8 h-8 rounded-none overflow-hidden bg-transparent border border-current flex items-center justify-center"
    };
  }

  // 5. Minimalist Editorial (high-end serif headings, spacious margins, large image detail layout)
  if (templateId === "minimalist_editorial") {
    const isDark = themeId === "editorial_dark";
    const isTan = themeId === "tan_canvas";

    return {
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
      containerClass: "max-w-5xl mx-auto px-6",
      whatsappButtonClass: "border-b border-current py-2 tracking-widest text-xs uppercase font-semibold text-center hover:opacity-80 transition-all",
      instagramButtonClass: isDark
        ? "bg-[#c5a880] text-black tracking-widest text-xs uppercase font-semibold py-4 hover:opacity-90 transition-all text-center"
        : "bg-[#1c1c1c] text-white tracking-widest text-xs uppercase font-semibold py-4 hover:bg-black transition-all text-center",
      logoWrapperClass: "w-8 h-8 rounded-none overflow-hidden bg-transparent border border-current flex items-center justify-center"
    };
  }

  // 6. Neo-Brutalist (thick black borders, heavy drop-shadows, Cobalt blue & concrete tones)
  if (templateId === "neo_brutalist") {
    const isConcrete = themeId === "raw_concrete";
    const isBlue = themeId === "brutalist_blue";

    return {
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
      containerClass: "max-w-7xl mx-auto px-6",
      whatsappButtonClass: "bg-white text-black border-4 border-black font-black uppercase py-3 hover:bg-zinc-100 transition-all shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] text-center",
      instagramButtonClass: "bg-[#ffe600] text-black border-4 border-black font-black uppercase py-3.5 hover:bg-[#ffd600] transition-all shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] text-center",
      logoWrapperClass: "w-8 h-8 rounded-none overflow-hidden bg-transparent border-2 border-black flex items-center justify-center"
    };
  }

  // 7. Immersive Glass (Stitch Screen: PDP: Immersive Glass Variant)
  // - Fonts: Inter
  // - Colors: Translucent frosted glass panel with background gradient glows
  // - Shape: Round xl corners
  if (templateId === "immersive_glass") {
    const isOcean = themeId === "ocean_glass";

    return {
      bodyClass: isOcean 
        ? "bg-[#050a18] text-white" 
        : "bg-[#131313] text-[#e5e2e1]",
      navClass: "bg-transparent border-none",
      cardClass: "bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/[0.05] transition-all",
      buttonClass: "bg-white text-black font-bold rounded-xl py-3.5 px-6 transition-all duration-200",
      badgeClass: "bg-white/5 border border-white/10 text-white rounded-full px-3 py-1 text-[10px] uppercase font-bold",
      textColorClass: "text-white",
      textMutedClass: "text-gray-400",
      priceClass: "text-white font-extrabold",
      fontHeadline: "font-sans tracking-tight",
      fontBody: "font-sans",
      containerClass: "max-w-full mx-auto px-0", // Needs full screen width for split layout
      whatsappButtonClass: "bg-[#25D366] text-white font-bold rounded-xl py-3.5 hover:opacity-90 transition-all text-center",
      instagramButtonClass: "bg-gradient-to-tr from-[#fdf497] via-[#fd5949] to-[#d6249f] text-white font-bold rounded-xl py-4 hover:opacity-90 transition-all text-center",
      logoWrapperClass: "w-8 h-8 rounded-full overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center"
    };
  }

  // Fallback to default
  return {
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
    containerClass: "max-w-7xl mx-auto px-6",
    whatsappButtonClass: "bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] font-bold rounded-xl py-3 text-center",
    instagramButtonClass: "bg-white text-black font-bold rounded-xl py-3.5 text-center",
    logoWrapperClass: "w-8 h-8 rounded-full overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center"
  };
}

