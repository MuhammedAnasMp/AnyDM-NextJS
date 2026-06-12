"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function InboxPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [showChatOnMobile, setShowChatOnMobile] = useState(true);

  const conversations = [
    {
      name: "Jordan Lee",
      time: "2m ago",
      text: "Can we adjust the automation flow for our next launch?",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxYVMrzh_WbCH1SbSjCdclTsByYW8Slg1PBUwC2G-Kl-3SAH2aJ1QLnlci4D-MtELxjSYch3PqjLX09QJzWa9PmBl7KIQ_pty6NBwVXzS1kmFODZCUkDO7xQrPhvuLCqu8STZdhcGWBuitJxktUeo1Ayt5O9Nh1ckVLaf8fc1sWyOHgUlYf7AxkOH20fKKayBRyij8X9YleEvrxPmgvkWTmi66duuOS1BWTGXI5DWGd156q9OV44yCg5UV6HkareHTafflmzv-2u8",
      badge: 98,
      status: "AI Draft Ready",
      isAi: true,
      active: true
    },
    {
      name: "Morgan Wright",
      time: "1h ago",
      text: "Thanks for the update!",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDI9-2br4j6VGspTjQENCQgYuZeRWisRRJ3EZQ7aBD4MMd1np-_azyyNEO0hK_hzJyOFeZPu0AFA6WR7gOHpXLedVZHYEdmWmab1z5KRr_4PPHVWfv6xVXmxTZaJgSdt6andYX53uoUJEEw4foxiGLKGDzGKBtUxkD4lOY3arqbLTrbY1ZBgXfTc5kGQABD-9Gddc0-FpNb695z8SHiv7HJxSg9X49QSNQ-MitaHuh-NQOKsJcwlyJv5gcGNkQlewcoDsn67hFivWg",
      badge: 42
    },
    {
      name: "Casey Smith",
      time: "3h ago",
      text: "I need help with my subscription tier.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDa0YnQVxv16oI0kS_r72gPOwIqWJfZIGbmr0X9soLEcjH9FU6mM1DiwCRMRDkIalIdaaGmz4X-TZbbKSC1fC0Y7wc0S2TtPpBHCCo7TKTvhunuMQTgLBzLM8qi6bNRtvpwQg-p2vAqtgudYwGpp-XrWvCrLtyGMospbnfCXyGNPEDU0J5OBXh6EVx9-WMOanXiWHBANwsIF66wny9RgB2I6jS-YYA1HhSQeYvSPj-zapIYhmmsx8GByrUtSO8A1teuDJKR2waaFjs",
      badge: 81,
      status: "Manual Needed"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex overflow-hidden -mx-4 md:-mx-8 -my-4 md:-my-8 h-[calc(100vh-112px)]"
    >
      {/* Left Pane: Conversation List */}
      <section
        className={`w-full lg:w-[340px] border-r border-white/10 flex flex-col bg-[#131313]/60 backdrop-blur-sm shrink-0
          ${showChatOnMobile ? "hidden lg:flex" : "flex"}`}
      >
        {/* Filter Tabs */}
        <div className="p-4 flex gap-2 overflow-x-auto border-b border-white/5 no-scrollbar">
          {["All", "Unread", "Automation", "Manual"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all duration-200 shrink-0 ${activeFilter === f
                  ? "bg-white text-black"
                  : "bg-white/5 text-on-surface-variant border border-white/5 hover:bg-white/10"
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Conversation list scroll area */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {conversations.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setShowChatOnMobile(true)}
              className={`p-4 flex gap-3 cursor-pointer transition-all duration-200 ${item.active
                  ? "bg-white/5 border-l-4 border-white"
                  : "hover:bg-white/[0.03]"
                }`}
            >
              <div className="relative shrink-0">
                <img className="w-10 h-10 rounded-full border border-white/10" src={item.avatar} alt={item.name} />
                {item.badge && (
                  <span className="absolute -bottom-1 -right-1 bg-white text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-[#131313]">
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className="font-semibold text-xs text-white truncate">{item.name}</h3>
                  <span className="text-[9px] text-on-surface-variant">{item.time}</span>
                </div>
                <p className="text-on-surface-variant text-[11px] truncate">{item.text}</p>
                {item.status && (
                  <div className="flex gap-1 items-center mt-2">
                    <span className="material-symbols-outlined text-[12px] text-[#c4c0ff]">
                      {item.isAi ? "smart_toy" : "person"}
                    </span>
                    <span className="text-[9px] text-[#c4c0ff] uppercase font-bold tracking-wider">{item.status}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Center Pane: Chat Conversation View */}
      <section
        className={`flex-grow flex flex-col bg-[#131313]/20 relative overflow-hidden
          ${showChatOnMobile ? "flex" : "hidden lg:flex"}`}
      >
        {/* Chat Header */}
        <div className="px-4 md:px-6 py-4 border-b border-white/10 flex items-center justify-between bg-surface/20 shrink-0">
          <div className="flex items-center gap-3">
            {/* Back Button (Mobile Only) */}
            <button
              onClick={() => setShowChatOnMobile(false)}
              className="lg:hidden p-1 rounded-lg text-on-surface-variant hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>

            <div className="relative">
              <img
                alt="Jordan Lee"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxYVMrzh_WbCH1SbSjCdclTsByYW8Slg1PBUwC2G-Kl-3SAH2aJ1QLnlci4D-MtELxjSYch3PqjLX09QJzWa9PmBl7KIQ_pty6NBwVXzS1kmFODZCUkDO7xQrPhvuLCqu8STZdhcGWBuitJxktUeo1Ayt5O9Nh1ckVLaf8fc1sWyOHgUlYf7AxkOH20fKKayBRyij8X9YleEvrxPmgvkWTmi66duuOS1BWTGXI5DWGd156q9OV44yCg5UV6HkareHTafflmzv-2u8"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#131313]"></span>
            </div>
            <div>
              <h2 className="text-xs md:text-sm font-bold text-white leading-tight">Jordan Lee</h2>
              <p className="text-[9px] md:text-[10px] text-[#c4c0ff] font-bold flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[10px] md:text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                <span>AI Automation Active</span>
              </p>
            </div>
          </div>
          <div className="flex gap-1 md:gap-2">
            <button className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors text-on-surface-variant hover:text-white">
              <span className="material-symbols-outlined text-base md:text-lg">call</span>
            </button>
            <button className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors text-on-surface-variant hover:text-white">
              <span className="material-symbols-outlined text-base md:text-lg">videocam</span>
            </button>
            <button className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors text-on-surface-variant hover:text-white">
              <span className="material-symbols-outlined text-base md:text-lg">more_vert</span>
            </button>
          </div>
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <div className="flex justify-center my-4">
            <span className="text-[9px] uppercase tracking-widest text-on-surface-variant/40 font-bold bg-white/5 px-3 py-1 rounded-full border border-white/5">
              Today
            </span>
          </div>

          {/* User message */}
          <div className="flex gap-3 max-w-[85%] sm:max-w-[80%]">
            <img
              alt="Jordan"
              className="w-7 h-7 md:w-8 h-8 rounded-full shrink-0 self-end border border-white/10"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxYVMrzh_WbCH1SbSjCdclTsByYW8Slg1PBUwC2G-Kl-3SAH2aJ1QLnlci4D-MtELxjSYch3PqjLX09QJzWa9PmBl7KIQ_pty6NBwVXzS1kmFODZCUkDO7xQrPhvuLCqu8STZdhcGWBuitJxktUeo1Ayt5O9Nh1ckVLaf8fc1sWyOHgUlYf7AxkOH20fKKayBRyij8X9YleEvrxPmgvkWTmi66duuOS1BWTGXI5DWGd156q9OV44yCg5UV6HkareHTafflmzv-2u8"
            />
            <div className="glass-pane p-3.5 rounded-2xl rounded-bl-none text-xs text-[#e5e2e1] leading-relaxed">
              Hi! I saw the new pricing structure. Can we adjust the automation flow for our next launch to reflect these tiers?
            </div>
          </div>

          {/* AI suggested response */}
          <div className="flex flex-col items-end gap-2">
            <div className="bg-[#c4c0ff]/5 border border-[#c4c0ff]/20 backdrop-blur-xl p-3.5 rounded-2xl rounded-br-none max-w-[85%] sm:max-w-[80%] relative overflow-hidden group">
              <div className="flex items-center gap-1.5 mb-2 text-[#c4c0ff]">
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                <span className="text-[9px] uppercase font-bold tracking-wider">Drafted by AnyDM AI</span>
              </div>
              <p className="text-xs text-white/90 leading-relaxed">
                Absolutely, Jordan! I can help reconfigure the triggers to match the new Basic, Pro, and Enterprise tiers. Would you like me to draft a new workflow schema for your review first?
              </p>
            </div>
            <div className="flex gap-2">
              <button className="bg-white text-black font-semibold text-[10px] px-3.5 py-2 rounded-full hover:scale-105 active:scale-95 transition-all">
                Send Suggestion
              </button>
              <button className="bg-white/5 border border-white/10 text-on-surface-variant hover:text-white font-semibold text-[10px] px-3.5 py-2 rounded-full hover:bg-white/10 transition-colors">
                Edit Draft
              </button>
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-surface/40 backdrop-blur-xl border-t border-white/10 shrink-0">
          <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
            {["bolt Quick Templates", "schedule Schedule Reply", "attach_file Attach"].map((lbl, idx) => {
              const parts = lbl.split(" ");
              return (
                <button key={idx} className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-on-surface-variant hover:border-white/30 transition-all font-semibold">
                  <span className="material-symbols-outlined text-xs">{parts[0]}</span>
                  <span>{parts.slice(1).join(" ")}</span>
                </button>
              );
            })}
          </div>
          <div className="glass-pane p-1 rounded-xl flex items-center gap-2 border-white/20">
            <button className="p-1.5 md:p-2 text-on-surface-variant hover:text-white transition-colors">
              <span className="material-symbols-outlined text-base md:text-lg">sentiment_satisfied</span>
            </button>
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-white placeholder-white/20 outline-none"
              placeholder="Type a message or '/' for commands..."
              type="text"
            />
            <button className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center hover:scale-95 transition-transform shrink-0">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </button>
          </div>
        </div>
      </section>

      {/* Right Pane: Contextual Information (Desktop Only) */}
      <section className="w-72 border-l border-white/10 bg-[#131313]/20 hidden xl:flex flex-col p-6 gap-6 overflow-y-auto shrink-0">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full border border-white/10 p-1">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4lxX09SgWsm0gdwTNPsY4o7DTQhFTSjxRas1oFIgi0GxkwkInX3PypDYDjSAySK4SnWWJQ5VRKUoLFb-BqGHqjX8ROOFI2OSE-rG7JSoS7g0M1gMW6ikqUJOBlQfbfHbW51PuSRgl77uRBGmurfBwwxFYg0Ux4y2UsrqQTun2d_CSpYyZAv3MSV6DuBa4M7e1sfrURFSEgONEf_rmh5nge6dbDh_38FPDVrWiFOi1E0ORTVfFrcci9QiAuP6PabAqGETiaPoyX34"
                alt="Sarah Jenkins"
                className="w-full h-full rounded-full object-cover shadow-2xl"
              />
            </div>
          </div>
          <h3 className="text-sm font-bold text-white">Sarah Jenkins</h3>
          <p className="text-[10px] text-on-surface-variant mt-0.5">@sarah_creates</p>
          <div className="flex gap-1.5 flex-wrap justify-center mt-3">
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">VIP Client</span>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Tech Savvy</span>
          </div>
        </div>

        <div className="space-y-3 border-t border-white/5 pt-4">
          <h4 className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-widest pb-1 border-b border-white/5">
            Recent Browsing
          </h4>
          <div className="space-y-3">
            {[
              { name: "Nova Speaker", time: "12m ago", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkvay7NipgPldYUSQ8CeHLnZO8K1tb3hmp6rUtzI8kGRJK8vfx7io9h5htNQ3ORNIcUBtfccpxkFuhsBzz68TbMVw2dLqwWPkNTd2bUyTdYxn8uB1CRwqUTnsFe9O0UQTARnKsQ_XA_2oglTTUY8L-Ly69FH3u5BSqSOsqcXFdOD7b3MSohXUUHlyC1yI0IUcBD9yxTbmb_62u9x15FsWThjLBMWRWHSapiCEOh85KXfEynYQ5y79tQ1G3p_OC3xxcidgyLSUSf4w" },
              { name: "Aura Headphones", time: "1m ago", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCVv_lT4no0wbHIzALbF7gBj_o60j4sUuNf8yJvdXeihQoNeqdrh2xsqBHsWwEwR0XE0tXUQuSPjDBViyoWb2JfsacE_nY5e9zguxhlxI3nGIuqB8Ceo74HOjuKzvWVRIH3tKFeh61I1qbWSlJJaxZgjlHHnX6LmszcYPuVAHiratqz8tTgeTgJo4kVE8vkydGzTevuSmi4MKpoz-Fs8a3qVJrUucMRSNULiFWylDBhori5smccGiOYOV-wVmearzsKTJMBsiG_yE" }
            ].map((prod, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0">
                  <img src={prod.img} className="w-full h-full object-cover" alt={prod.name} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white font-medium truncate">{prod.name}</p>
                  <p className="text-[9px] text-on-surface-variant/60 mt-0.5">{prod.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 border-t border-white/5 pt-4">
          <h4 className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-widest pb-1 border-b border-white/5 mb-2">
            Shared Files
          </h4>
          <div className="space-y-2">
            {[
              { name: "Project_Specs.pdf", icon: "description" },
              { name: "Desk_Layout.png", icon: "image" }
            ].map((f, i) => (
              <div key={i} className="flex gap-2 items-center p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-on-surface-variant hover:text-white transition-colors">
                <span className="material-symbols-outlined text-base">{f.icon}</span>
                <span className="text-xs truncate">{f.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
