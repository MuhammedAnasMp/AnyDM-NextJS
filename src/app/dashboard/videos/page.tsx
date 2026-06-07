"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoCard {
  id: number;
  title: string;
  channel: string;
  verified: boolean;
  views: string;
  time: string;
  duration: string;
  thumbnail: string;
  avatar: string;
  category: string;
}

export default function VideosPage() {
  const categories = [
    "All",
    "Automation",
    "Tutorials",
    "E-commerce",
    "Case Studies",
    "Productivity",
    "AI & ML",
    "Design Systems"
  ];

  const [activeCategory, setActiveCategory] = useState("All");
  const [isPlayingHero, setIsPlayingHero] = useState(false);

  const allVideos: VideoCard[] = [
    {
      id: 1,
      title: "Mastering AnyDM Automation Pipelines",
      channel: "DevX Academy",
      verified: true,
      views: "85K views",
      time: "4 days ago",
      duration: "12:45",
      thumbnail: "https://lh3.googleusercontent.com/aida-public/AB6AXuDiBRZrmdP-hkQxAHv8SKoY9-dbOLhoWcPX5Vc5AE7fxIOTzTPvjScQWZY_PcfwC2StIka1j1QDZDMGRjs7Vw8DOb0rqR8pW297JAY5SbQRZJOb9Idcl1q-WxnKog5WgnGPJCHLysFR5t7AnYWH-nBqql67OG8kkpZkh8GTYljAhguV0nMAwpPxYyl4ACFnat-LMtA62oe2cKoV_lhaYfRaGwwiK-LPuIk7WCEKV0_17mXx_9FGeE2hxmrSJpGecPPkQxedreH1-yQ",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6O-VSEUS4UUXwBKy5J3UY5k9r_m2oBFtyGz7fc941Rlior5sLhTsjFD3oGJF4bGnCPxCuWYlQ4w6lVJnvmmOPY1dduRWNi88iQRM2vGMzATkY3nYYy6U1UESv8-_FBm_nyn__7FY6shIr2sdlqoqobDqNZArRttLVEI_KrJeUsOXNL2tWgZpg_70vOIYOxL_mbFsQIokLN50_aanI9ue0RlZzX8clfH_UNkyJdRMQBTnPlxIVcMpAkwi-Pn9is9BZ65bT_HzFs30",
      category: "Automation"
    },
    {
      id: 2,
      title: "The Future of Glassmorphism in UI Design",
      channel: "Design Vision",
      verified: true,
      views: "120K views",
      time: "1 week ago",
      duration: "08:22",
      thumbnail: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBrxUvRg7g8ZsKHzTSKIR2R8rOkBo8Nd18GX_HM2rAFrmzi82IdiEM_r8qkkoGznS45fvjYD_PWAilW97WN09Sc4HHMnKB4XXPwNiZdNxBttH_KvYuAIfulhO49QzzB81d3XJHNqcF0eDMtpD44Gt0kNEiGwahNQrvTKf3g_JSYzPt63X5Q3W7nXmwmHUWTZ9RT4017hQwEq53h5F7Z7Osv9QfzKn1j1moPhp1_ZCLFQ3kvBJ9hh7eb0GQUTYyAvqFvT2S0AVR7Jk",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3BuCdxyeTpcpojEMGyrsMB35Tny5B00LwATIijhmMl9lxC6obuJHYnvbn_y37QUco_0ZdNyuf4J2TeWVSGy2sLfIAS1w-uzXHb7NpGVNLwCHoDceU3jq4iSlgnQZvgRm8LLE_gnqHa3QciqoKO1PCqkmRkKNDFshEIxy2kzKVrYcpdv66h8nBp-UWLd7OdUn33IU8Gg5z_UFUymYVh7J9Ls4x6GQu0m2-xpAvmwFNH_IzZzfQ8-iSb72qG0df54Le9idKcgB_PUw",
      category: "Design Systems"
    },
    {
      id: 3,
      title: "Minimalist Architecture: Building for Clarity",
      channel: "ArchiTech",
      verified: true,
      views: "42K views",
      time: "2 days ago",
      duration: "15:10",
      thumbnail: "https://lh3.googleusercontent.com/aida-public/AB6AXuAAOhbGqbq-lxYNgu867IdO0DNaqEt1wL-bPwEl342me3bpp0CerLn-6F4RiSjGBJlDwnVP8Kw2mAJgx1i5wKS-WcPkYRIv34PI2-Z6Jdw7rLnOZiGyO1Mn4wFePJaX3g57GOjbiwT7AGguxjg8u0M88VquXWviwRlNozifGnopSLAsz4kUQLDyHs-gZquP8C49vNO1xk4hNisqHWpXzLGJeB5_xnmSmQCWkg_rgD6wMccDEe2hO0gwXHNAyoz4_MVXVqcwTeo4z0I",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkkDsQJh086Lzh43YnOsCIVoV-eHMl0H_mga3EaGXPg0W1taTc3U2zoBnO8HGeYHJirv9ComaY4KRC22Kj6g0jYpBqTDD1Szi53Lnj9Msj0Z_1fqyyX8HR4BjG3ZUAD-FFWtBy35Jg1u412RcqqApkaE12YfoJgylGkfBw8FXEhQTG4Ml7KlZLV1czvd9-NT1SLjMuImbXB12F-swK-Rf8t6X3q8cxB6ABacMbSooN316WZ7fss1YXax5lX_Xn3vE-k6NaoI6q32E",
      category: "Case Studies"
    },
    {
      id: 4,
      title: "Physics of Impact: Cinematic Slow Motion",
      channel: "Science Lab",
      verified: true,
      views: "1.1M views",
      time: "1 month ago",
      duration: "05:58",
      thumbnail: "https://lh3.googleusercontent.com/aida-public/AB6AXuDboAVlP1WhnPJaNqb1gnlPNYch4JndWZXflRRvU6lsfdUakSiQ72-fsEebI6Pe5jBrXH3NhLs9AqIxMojXfrjw6EhBeIKEF-TfRIMRJJjEM3Fov6jtGHYXLFD6A58pJMEhGVD6jd2okTNLMwbQCnOmUrLFIAmZX5TKv3gCQjWNGvdZDqPNKDncUHYNVie0UPNHnxnddCRg1rzmDHJpvh8FvsN6rAAo6z39ZYXZy3TKTCVBPK4aYysxEssdTxR0OTMW7OyNh5PZLmE",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCbtTAn8naaqbnujFFQMT615CoYSKyicHC1MMtHl3dyFRW7Cjxu9UHn4JaXOzCX7lPdfqrn3fCaTIxHGGsbpFXSqC4mre_ejBBJaWGXJhEJ9ZKkZU2wtoYn9waKUnue5S_a-mAT6MSRejraHxSWiFfREwSIUhYflwR7rUVcX-4jj_Ht0_3QHa94cqqwVaPxedrbd8pGu5eFPpMQOybdkhXlNzm1rhUNLpxUzK1kesOhD09wF6W3VXYP7osGkgvKSl62K0LkrJ0vVcE",
      category: "Tutorials"
    },
    {
      id: 5,
      title: "Urban Evolution: Megacities of 2050",
      channel: "Future Now",
      verified: true,
      views: "310K views",
      time: "3 weeks ago",
      duration: "22:00",
      thumbnail: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6yQMm8rKubc72loWk5BORPae3CBLb02dnAM5jWGZn66zJnno5MedqMx1l2YuvOmqNL_Do7HK2FWNdC75wMEnKJI2E_mW5ii9hWm3K-L6g2IF98r4pjDvbNO72p9682QXPOBUL33ZoVjB4G1cpyC39_idS_6hZvUAfDbZqvCQhCff383iWTKe_HDSpA6M-HqJ_npfCPQR9_g9fFS75f04AQottN3yENhi3FhzDHKE9HLKb6b2rhaXkxm7KryI7gbVaprtMQiezqf0",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNODD_9BoWUVH3OP3zWOqZ6RAV5zKZPtHT3HV8aKeigS7MQ39oRir8Dq-O8Lh6fzkyHm5AEC52u9996m5-IkwXNXMybYJArCZxWx-gLL7jnffup9CuJvilUdElRT7zcndA9it6s074Tr-gh68jvUV0FkYs0e4NzfVTV3GSGeFG1eOcGOEEc4t0vzRZLry52vYWmPuSQLG2wJKT3hfOaF3fvx3FmTuk_xnfcHo6OPITDDFwSA5hH0rh9IkILxz0RbYGV6kl02dYY98",
      category: "AI & ML"
    },
    {
      id: 6,
      title: "The Art of Chronometry: AnyDM Heritage",
      channel: "Precision Crafts",
      verified: true,
      views: "15K views",
      time: "5 hours ago",
      duration: "11:12",
      thumbnail: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0FefCk2mjlnx3GDXUQdGTU01mvrKXPSvXKTEaCzjCE7x6wEmFOEmowCE_M1r1fw2e5QYbnHZFrkW9wzJO0q-UK1G-STwILgvot9HQAuBY6wlGsC3Po7zn4rEJf0XDWEcQi8LoBsHuXASX2Qav7OBNI3mdSZfwfE-9GrA-ohAGY9CMUOlIMmKl71WxXaOJQ8aNNzjuUQB_DaN5XLSN_UhwpS54OY86uQxfP1Hm0RbWHR8gpIRvE2YMeFhESmZSVqJh_eVqNF-83d8",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKviVxMppXVmOY5UK1qtqSKI99hDPgn470IxEHP-yUI95u-ZMfsk4XKMAxf7LIMCkKi2uvsBl9qQFN0DUw9WEEd-KaqVrTHb2KcAVJMDh_yZYw88JxgbcevYjWBfShcCLB8dfRO0inv8Qr_ywgX_3_r6UcFNZo_kZ36dgnuKuRrK3g5xJaBhfeA0SzxfZKVd8i1WWIkmj8YZ41UlKeXxfm27RMpCdkziPHpaPQnKI6-9u38B4lC5WZqyzobJEH03F7UjvYsh-y8_M",
      category: "E-commerce"
    }
  ];

  const filteredVideos =
    activeCategory === "All"
      ? allVideos
      : allVideos.filter((video) => video.category === activeCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Hero Featured Video */}
      <section className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden group shadow-2xl border border-white/5 bg-black">
        {isPlayingHero ? (
          <div className="absolute inset-0 w-full h-full">
            <iframe
              className="w-full h-full border-0"
              src="https://www.youtube.com/embed/oeqC1crTsVs?si=EBo_tiWkxgVrR6BR&autoplay=1"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
            {/* Close video button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlayingHero(false);
              }}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 border border-white/10 transition-colors flex items-center justify-center cursor-pointer z-10"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        ) : (
          <div className="w-full h-full cursor-pointer relative" onClick={() => setIsPlayingHero(true)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="AnyDM Video Platform Thumbnail"
              src="https://img.youtube.com/vi/oeqC1crTsVs/maxresdefault.jpg"
              onError={(e) => {
                // Fallback to the beautiful Aura design banner if maxresdefault doesn't load or isn't available
                (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/aida-public/AB6AXuCIuRasFIRlCaSeQT0PShzPMAL_ZBnxS9rOs1Sx7tn1iI652XoMvLZq1INeL5SGYDL4fH28Ujv8Bf_1bNdfRmR1m2F9G63ZZTrwICmjmNYdW2iYTagh2urJDK1pSFl5201UoCJajJL5dM48thhPio31CqZGL_bRuLXRh5T9Vt3kw-T0ty_AXTXRf3YcJl1MpL_M1gKAXmuzUMqLeBmCU6zkmBooR5cBVz_Vbq1pPzz25MIF4__ri0YrQ3BKN5SE2SP8-1_NDU3aoPc";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent flex flex-col justify-end p-8 md:p-12">
              <div className="max-w-2xl space-y-3 md:space-y-4">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 w-fit">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                    Featured
                  </span>
                </div>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-none">
                  Aura: Redefining Sound Design for 2024
                </h1>
                <p className="text-on-surface-variant font-medium text-xs md:text-sm lg:text-base max-w-lg">
                  Discover the intersection of artificial intelligence and acoustic precision in our most ambitious product yet.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPlayingHero(true);
                    }}
                    className="bg-white hover:bg-neutral-200 text-black flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs md:text-sm transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 duration-200 cursor-pointer"
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_arrow
                    </span>
                    Watch Now
                  </button>
                  <div className="text-on-surface-variant flex items-center gap-1.5 text-xs md:text-sm">
                    <span className="material-symbols-outlined text-sm md:text-base">visibility</span>
                    <span>2.4M views</span>
                    <span className="mx-1">•</span>
                    <span>2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Progress bar teaser */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
              <div className="h-full bg-white w-1/3 shadow-[0_0_10px_#ffffff]"></div>
            </div>
          </div>
        )}
      </section>

      {/* Category Chips */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                isActive
                  ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  : "glass-pane text-on-surface-variant hover:bg-white/10 border-white/5"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Video Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
            {activeCategory === "All" ? "Recommended for You" : `${activeCategory} Videos`}
          </h2>
          <button className="text-xs font-semibold text-on-surface-variant hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
            View All{" "}
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredVideos.map((video) => (
              <motion.div
                key={video.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group cursor-pointer flex flex-col space-y-3"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={video.title}
                    src={video.thumbnail}
                  />
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/5">
                    {video.duration}
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-white text-5xl transform scale-90 group-hover:scale-100 transition-transform duration-200"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      play_circle
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="w-full h-full object-cover" alt={video.channel} src={video.avatar} />
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <h3 className="text-white font-semibold text-sm line-clamp-2 leading-snug group-hover:text-white/80 transition-colors">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-1 text-on-surface-variant text-xs">
                      <span className="truncate">{video.channel}</span>
                      {video.verified && (
                        <span
                          className="material-symbols-outlined text-[13px] text-white flex-shrink-0"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          verified
                        </span>
                      )}
                    </div>
                    <div className="text-on-surface-variant text-[11px]">
                      {video.views} • {video.time}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredVideos.length === 0 && (
          <div className="glass-pane p-12 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 border border-white/5">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">video_library</span>
            <h3 className="text-white font-bold text-sm">No videos found</h3>
            <p className="text-xs text-on-surface-variant max-w-xs">
              We couldn't find any videos under the "{activeCategory}" category.
            </p>
          </div>
        )}
      </section>
    </motion.div>
  );
}
