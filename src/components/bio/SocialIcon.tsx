"use client";

import React from "react";
import {
  SiInstagram,
  SiYoutube,
  SiTiktok,
  SiX,
  SiThreads,
  SiWhatsapp,
  SiTelegram,
  SiFacebook,
  SiSpotify,
  SiApplemusic,
  SiDiscord,
  SiGithub,
  SiTwitch,
  SiPinterest,
  SiSnapchat,
  SiReddit,
  SiMedium,
  SiPatreon,
  SiSubstack,
  SiKick,
  SiBluesky,
  SiBehance,
  SiDribbble,
  SiSoundcloud,
  SiSteam,
  SiGumroad,
  SiBuymeacoffee,
  SiKofi,
  SiNotion,
  SiCalendly,
  SiSignal,
  SiWechat,
  SiVimeo,
  SiOnlyfans,
  SiEtsy,
  SiShopify,
  SiPaypal,
  SiCashapp,
} from "react-icons/si";
import { FaLinkedin, FaAmazon } from "react-icons/fa6";
import {
  Globe,
  Mail,
  Phone,
  Link2,
  ShoppingBag,
  Music,
  Video,
  Sparkles,
  MessageCircle,
  FileText,
  Share2,
} from "lucide-react";

export interface SocialIconOption {
  id: string;
  name: string;
  category: "social" | "content" | "commerce" | "contact" | "other";
}

export const SOCIAL_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: SiInstagram,
  youtube: SiYoutube,
  tiktok: SiTiktok,
  twitter: SiX,
  x: SiX,
  threads: SiThreads,
  whatsapp: SiWhatsapp,
  telegram: SiTelegram,
  linkedin: FaLinkedin,
  facebook: SiFacebook,
  spotify: SiSpotify,
  applemusic: SiApplemusic,
  apple_music: SiApplemusic,
  discord: SiDiscord,
  github: SiGithub,
  twitch: SiTwitch,
  pinterest: SiPinterest,
  snapchat: SiSnapchat,
  reddit: SiReddit,
  medium: SiMedium,
  patreon: SiPatreon,
  substack: SiSubstack,
  kick: SiKick,
  bluesky: SiBluesky,
  behance: SiBehance,
  dribbble: SiDribbble,
  soundcloud: SiSoundcloud,
  steam: SiSteam,
  gumroad: SiGumroad,
  buymeacoffee: SiBuymeacoffee,
  kofi: SiKofi,
  notion: SiNotion,
  calendly: SiCalendly,
  signal: SiSignal,
  wechat: SiWechat,
  vimeo: SiVimeo,
  onlyfans: SiOnlyfans,
  amazon: FaAmazon,
  etsy: SiEtsy,
  shopify: SiShopify,
  paypal: SiPaypal,
  cashapp: SiCashapp,
  website: Globe,
  globe: Globe,
  email: Mail,
  mail: Mail,
  phone: Phone,
  link: Link2,
  link2: Link2,
  shop: ShoppingBag,
  shopping: ShoppingBag,
  music: Music,
  video: Video,
  sparkles: Sparkles,
  message: MessageCircle,
  newsletter: FileText,
  share: Share2,
};

export const POPULAR_SOCIAL_PLATFORMS = [
  { id: "instagram", name: "Instagram", placeholder: "https://instagram.com/username", icon: "instagram" },
  { id: "youtube", name: "YouTube", placeholder: "https://youtube.com/@channel", icon: "youtube" },
  { id: "tiktok", name: "TikTok", placeholder: "https://tiktok.com/@username", icon: "tiktok" },
  { id: "x", name: "X / Twitter", placeholder: "https://x.com/username", icon: "x" },
  { id: "threads", name: "Threads", placeholder: "https://threads.net/@username", icon: "threads" },
  { id: "whatsapp", name: "WhatsApp", placeholder: "+1234567890 or https://wa.me/...", icon: "whatsapp" },
  { id: "telegram", name: "Telegram", placeholder: "https://t.me/username", icon: "telegram" },
  { id: "linkedin", name: "LinkedIn", placeholder: "https://linkedin.com/in/username", icon: "linkedin" },
  { id: "facebook", name: "Facebook", placeholder: "https://facebook.com/page", icon: "facebook" },
  { id: "spotify", name: "Spotify", placeholder: "https://open.spotify.com/artist/...", icon: "spotify" },
  { id: "discord", name: "Discord", placeholder: "https://discord.gg/invite", icon: "discord" },
  { id: "github", name: "GitHub", placeholder: "https://github.com/username", icon: "github" },
  { id: "twitch", name: "Twitch", placeholder: "https://twitch.tv/username", icon: "twitch" },
  { id: "pinterest", name: "Pinterest", placeholder: "https://pinterest.com/username", icon: "pinterest" },
  { id: "snapchat", name: "Snapchat", placeholder: "https://snapchat.com/add/username", icon: "snapchat" },
  { id: "reddit", name: "Reddit", placeholder: "https://reddit.com/user/username", icon: "reddit" },
  { id: "website", name: "Website", placeholder: "https://yourwebsite.com", icon: "website" },
];

export const ALL_CUSTOM_ICONS: { id: string; name: string; category: string }[] = [
  { id: "instagram", name: "Instagram", category: "Social" },
  { id: "youtube", name: "YouTube", category: "Social" },
  { id: "tiktok", name: "TikTok", category: "Social" },
  { id: "x", name: "X / Twitter", category: "Social" },
  { id: "threads", name: "Threads", category: "Social" },
  { id: "whatsapp", name: "WhatsApp", category: "Chat" },
  { id: "telegram", name: "Telegram", category: "Chat" },
  { id: "discord", name: "Discord", category: "Chat" },
  { id: "signal", name: "Signal", category: "Chat" },
  { id: "wechat", name: "WeChat", category: "Chat" },
  { id: "linkedin", name: "LinkedIn", category: "Professional" },
  { id: "github", name: "GitHub", category: "Professional" },
  { id: "notion", name: "Notion", category: "Professional" },
  { id: "calendly", name: "Calendly", category: "Professional" },
  { id: "facebook", name: "Facebook", category: "Social" },
  { id: "pinterest", name: "Pinterest", category: "Social" },
  { id: "snapchat", name: "Snapchat", category: "Social" },
  { id: "reddit", name: "Reddit", category: "Social" },
  { id: "bluesky", name: "Bluesky", category: "Social" },
  { id: "twitch", name: "Twitch", category: "Streaming" },
  { id: "kick", name: "Kick", category: "Streaming" },
  { id: "vimeo", name: "Vimeo", category: "Streaming" },
  { id: "spotify", name: "Spotify", category: "Audio" },
  { id: "applemusic", name: "Apple Music", category: "Audio" },
  { id: "soundcloud", name: "SoundCloud", category: "Audio" },
  { id: "patreon", name: "Patreon", category: "Creator" },
  { id: "buymeacoffee", name: "Buy Me a Coffee", category: "Creator" },
  { id: "kofi", name: "Ko-fi", category: "Creator" },
  { id: "substack", name: "Substack", category: "Creator" },
  { id: "medium", name: "Medium", category: "Creator" },
  { id: "onlyfans", name: "OnlyFans", category: "Creator" },
  { id: "gumroad", name: "Gumroad", category: "Commerce" },
  { id: "shopify", name: "Shopify", category: "Commerce" },
  { id: "amazon", name: "Amazon", category: "Commerce" },
  { id: "etsy", name: "Etsy", category: "Commerce" },
  { id: "paypal", name: "PayPal", category: "Commerce" },
  { id: "cashapp", name: "Cash App", category: "Commerce" },
  { id: "behance", name: "Behance", category: "Design" },
  { id: "dribbble", name: "Dribbble", category: "Design" },
  { id: "steam", name: "Steam", category: "Gaming" },
  { id: "website", name: "Website", category: "General" },
  { id: "email", name: "Email", category: "General" },
  { id: "phone", name: "Phone", category: "General" },
  { id: "link", name: "Custom Link", category: "General" },
  { id: "shop", name: "Store", category: "General" },
  { id: "music", name: "Music", category: "General" },
  { id: "video", name: "Video", category: "General" },
  { id: "sparkles", name: "Special / Promo", category: "General" },
];

export interface SocialIconProps {
  platformOrIcon?: string;
  className?: string;
  fallback?: React.ReactNode;
}

export const SocialIcon: React.FC<SocialIconProps> = ({
  platformOrIcon,
  className = "w-4 h-4",
  fallback,
}) => {
  const normalizedKey = (platformOrIcon || "").toLowerCase().trim();
  const IconComponent = SOCIAL_ICON_MAP[normalizedKey];

  if (IconComponent) {
    return <IconComponent className={className} />;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <Globe className={className} />;
};

export default SocialIcon;
