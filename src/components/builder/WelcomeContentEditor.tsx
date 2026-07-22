'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store';
import { updateNodeData, setFlow } from '@/store/slices/flowSlice';
import {
    X, Plus, Trash2, Check, ChevronLeft, ChevronRight,
    MessageSquare, Info, Smartphone, Sliders, Menu as MenuIcon,
    AlertCircle, Edit2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/services/api.service';

// --- Types ---
type MenuItem = {
    type: "web_url" | "postback";
    title: string;
    url?: string;
    payload?: string;
};

type IceBreakerItem = {
    question: string;
    payload: string;
};

// --- Reusable high-fidelity Phone Preview Component ---
interface PhonePreviewProps {
    type: 'icebreakers' | 'persistent_menu';
    promptVal: string;
    itemsList: any[];
    composerInputDisabledVal: boolean;
    profilePic: string;
    username: string;
    websiteUrl: string;
    followersCount: string;
    postsCount: string;
    mutualsText: string;
    isStatic?: boolean;
    profile_urls?: string;
}

function PhonePreview({
    type,
    promptVal,
    itemsList,
    composerInputDisabledVal,
    profilePic,
    username,
    websiteUrl,
    followersCount,
    postsCount,
    mutualsText,
    isStatic = false,
    profile_urls = 'https://fastly.picsum.photos/id/163/100/100.jpg?hmac=9D295GBymPnQLD2d08k8kQEME1CLEWklEqzuOpz7V_s'
}: PhonePreviewProps) {
    const [animationStep, setAnimationStep] = React.useState<'list' | 'chat'>(isStatic ? 'chat' : 'list');

    // Auto-loop animation for both icebreakers and Menu Options tabs
    React.useEffect(() => {
        if (isStatic) return;

        let timer: NodeJS.Timeout;
        let interval: NodeJS.Timeout;

        const runCycle = () => {
            setAnimationStep('list');
            timer = setTimeout(() => {
                setAnimationStep('chat');
            }, 1800);
        };

        runCycle();
        interval = setInterval(runCycle, 9000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [type, itemsList, promptVal, isStatic]);




    return (
        <div className="w-[280px] h-[560px] rounded-[44px] border-[8px] border-[#2a2a2a] bg-black shadow-2xl relative flex flex-col overflow-hidden select-none outline outline-2 outline-[#393939] shrink-0 my-auto">
            {/* Notch / Dynamic Island */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-50 pointer-events-none" />

            {/* Inner Screen Content Wrapper */}
            <div
                className="h-full w-full flex flex-col pt-0 relative z-10 bg-black rounded-[36px] overflow-hidden"
                style={{ clipPath: 'inset(0 round 36px)' }}
            >
                {/* iOS Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-6 px-5 flex items-center justify-between text-[9px] font-semibold text-white z-50 pointer-events-none bg-transparent">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                        {/* Signal */}
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                            <path d="M2 22h20V2z" />
                        </svg>
                        {/* Wifi */}
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 20h.01M8.5 16.5a5 5 0 0 1 7 0M5.5 13.5a9 9 0 0 1 13 0M2.5 10.5a13 13 0 0 1 19 0" />
                        </svg>
                        {/* Battery */}
                        <div className="w-4 h-2 border border-white/80 rounded-2xs p-0.5 flex items-center">
                            <div className="h-full w-3/4 bg-white/90 rounded-[1px]" />
                        </div>
                    </div>
                </div>

                {type === 'icebreakers' && (
                    /* CHAT LIST SCREEN */
                    <div
                        className="absolute inset-0 bg-[#0e0e0e] flex flex-col z-40 transition-all duration-500 ease-out transform"
                        style={{
                            transform: animationStep === 'chat' ? 'translateX(-100%)' : 'translateX(0)',
                            opacity: animationStep === 'chat' ? 0 : 1,
                            pointerEvents: animationStep === 'chat' ? 'none' : 'auto'
                        }}
                    >
                        {/* Header */}
                        <div className="pt-8 h-18 px-4 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md">
                            <ChevronLeft className="w-5 h-5 text-white opacity-40" />
                            <span className="text-[10px] font-bold text-white tracking-tight">Messages</span>
                            <div className="w-5 h-5" />
                        </div>

                        {/* Search Bar */}
                        <div className="px-3.5 py-2">
                            <div className="bg-[#1c1b1b] rounded-lg px-3 py-1.5 flex items-center gap-2 text-zinc-500 border border-white/5">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span className="text-[9px] font-medium">Search</span>
                            </div>
                        </div>

                        {/* Chat List */}
                        <div className="flex-1 overflow-y-auto px-2 py-1">
                            {/* Chat Row (The single chat) */}
                            <div
                                onClick={() => setAnimationStep('chat')}
                                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer relative overflow-hidden group"
                            >
                                {/* Pulsing pointer indicator */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 bg-sky-500 rounded-full opacity-60 animate-ping pointer-events-none" />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-sky-500 rounded-full border-2 border-black pointer-events-none shadow" />

                                <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden shrink-0 relative">
                                    <img src={profilePic} className="w-full h-full object-cover" alt="" />
                                    {/* Green active dot */}
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
                                </div>

                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-white truncate block">
                                            {username}
                                        </span>
                                        <span className="text-[8px] text-zinc-500">now</span>
                                    </div>
                                    <p className="text-[9px] text-[#3797F0] font-bold truncate mt-0.5">
                                        Suggested: Tap to start chat
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Chat Interface */}
                <div className="flex-1 flex flex-col min-h-0 bg-black">
                    {/* Instagram App Header Mock */}
                    <div
                        className="pt-8 h-20 border-b border-white/5 px-4 flex items-center gap-3 bg-black/40 backdrop-blur-md shrink-0 rounded-t-[36px]"
                        style={{ clipPath: 'inset(0 round 36px 36px 0 0)' }}
                    >
                        <ChevronLeft
                            className="w-5 h-5 text-white shrink-0 cursor-pointer hover:opacity-80 active:scale-90 transition-all"
                            onClick={() => {
                                if (type === 'icebreakers') {
                                    setAnimationStep('list');
                                }
                            }}
                        />
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 overflow-hidden shrink-0">
                            <img
                                src={profilePic}
                                className="w-full h-full object-cover"
                                alt="Merchant"
                            />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <span className="text-[11px] font-bold text-white truncate leading-tight block">
                                {username}
                            </span>
                            <span className="text-[8px] text-zinc-400 font-medium leading-none block mt-0.5">Active now</span>
                        </div>
                        <div className="flex items-center gap-3 text-white shrink-0">
                            {/* Call icon */}
                            <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a12.035 12.035 0 01-7.108-7.108c-.155-.44.01-.928.387-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                            </svg>
                            {/* Video call icon */}
                            <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                            {/* Menu (3 horizontal lines) icon */}
                            <div className="relative">
                                <div
                                    className={` border p-0.5 ${type === "persistent_menu" && animationStep === "list"
                                        ? "border-red-500 animate-pulse"
                                        : "border-transparent"
                                        }`}
                                >
                                    <MenuIcon className="w-4 h-4 opacity-80" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {type === 'icebreakers' ? (
                        /* VIEW 1: Wellcome Message Mockup */
                        <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col items-center bg-black scrollbar-hide justify-between relative">
                            {/* Profile card with smooth fade-in/slide-up */}
                            <div
                                className="flex flex-col items-center text-center mt-3 shrink-0 transition-all duration-700 ease-out"
                                style={{
                                    transform: animationStep === 'chat' ? 'translateY(0)' : 'translateY(10px)',
                                    opacity: animationStep === 'chat' ? 1 : 0
                                }}
                            >
                                <div className="w-12 h-12 rounded-full p-[1px] bg-gradient-to-tr from-[#353535] to-[#2a2a2a] flex items-center justify-center">
                                    <img src={profilePic} className="w-full h-full rounded-full object-cover border-2 border-black" alt="" />
                                </div>
                                <div className="flex items-center gap-0.5 mt-1.5">
                                    <h2 className="text-[10px] font-bold text-white tracking-tight">{username}</h2>
                                    <span className="text-[8px] text-[#8FE3FF]">✓</span>
                                </div>
                                <div className="text-[8px] text-[#c4c7c8]/60 mt-0.5 flex gap-1 font-semibold">
                                    <span>{followersCount} followers</span>
                                    <span>•</span>
                                    <span>{postsCount} posts</span>
                                </div>
                                <p className="text-[9px] text-zinc-500 mt-1 max-w-[150px] leading-tight font-medium">{mutualsText}</p>
                                <button type="button" className="mt-2.5 py-1 px-3 bg-[#262626] hover:bg-[#323232] border border-white/10 text-[7px] font-bold rounded-lg text-[#e5e2e1] transition-colors">
                                    View Profile
                                </button>
                            </div>

                            {/* Invitation Prompt with stagger fade-in */}
                            <div
                                className="mt-auto mb-3 w-full text-center transition-all duration-700 ease-out"
                                style={{
                                    transitionDelay: '100ms',
                                    transform: animationStep === 'chat' ? 'translateY(0)' : 'translateY(10px)',
                                    opacity: animationStep === 'chat' ? 1 : 0
                                }}
                            >
                                <p className="text-[9px] text-zinc-500 leading-normal max-w-[170px] mx-auto font-medium">
                                    {promptVal || `Tap to send a question suggested by ${username}`}
                                </p>
                            </div>

                            {/* Suggested Questions with stagger fade-in */}
                            <div className="w-full flex flex-col items-center gap-1.5">
                                {itemsList.filter((ib: any) => ib.question && ib.question.trim() !== '').map((item: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="w-auto p-1.5 bg-[#2a2a2a] border border-white/5 hover:bg-[#323232] text-[10.5px] font-bold text-[#3797F0] text-center rounded-2xl truncate shadow-sm transition-all duration-500 ease-out"
                                        style={{
                                            transitionDelay: `${250 + idx * 150}ms`,
                                            transform: animationStep === 'chat' ? 'translateY(0)' : 'translateY(15px)',
                                            opacity: animationStep === 'chat' ? 1 : 0
                                        }}
                                    >
                                        {item.question}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* VIEW 2: Persistent Navigation Menu Mockup */
                        <div className="flex-1 flex flex-col justify-end bg-black/75 relative overflow-hidden">
                            {/* Back threads blur mock */}
                            <div className="absolute inset-x-0 top-0 bottom-36 p-4 flex flex-col items-center text-center opacity-5 select-none pointer-events-none filter blur-[1px]">
                                <div className="w-8 h-8 rounded-full bg-zinc-800 mb-2" />
                                <span className="text-[9px] font-bold text-white">{username}</span>
                                <span className="text-[8px] text-zinc-500 mt-0.5">{followersCount} followers</span>
                            </div>

                            {/* Simulated Chat History bubbles */}
                            <div className="absolute inset-x-0 top-6 bottom-16 p-4 flex flex-col space-y-3.5 overflow-y-auto scrollbar-hide">
                                <div className="flex-1" />
                                {/* Customer Message */}
                                <div className="self-start flex items-end gap-2 max-w-[85%]">
                                    <div className="w-5 h-5 rounded-full bg-zinc-800 shrink-0 overflow-hidden mb-0.5 border border-white/5">
                                        <img
                                            src={profile_urls}
                                            className="w-full h-full object-cover"
                                            alt=""
                                        />
                                    </div>
                                    <div className="bg-[#262626] border border-white/5 rounded-2xl rounded-bl-none px-3.5 py-2 text-[10px] text-zinc-200">
                                        Welcome to our store! 🛍️ The shortcuts menu will pop up from the bottom automatically.
                                    </div>
                                </div>
                                {/* Business Auto-reply */}
                                <div className="self-end max-w-[85%] bg-[#3797F0] border border-[#3797F0] rounded-2xl rounded-br-none px-3.5 py-2 text-[10px] text-white text-left shadow-sm">
                                    Give me my order updates
                                </div>
                            </div>

                            {/* Sliding options menu drawer (bottom to top) */}
                            <div
                                className={cn(
                                    "absolute inset-x-0 bottom-0 bg-[#1c1c1c] text-[#e5e2e1] rounded-t-2xl p-3 flex-col items-center shrink-0 z-20 border-t border-white/10 shadow-[0_-8px_24px_rgba(0,0,0,0.5)] transition-none",
                                    animationStep === 'chat' ? "flex" : "hidden"
                                )}
                            >
                                <div className="w-6 h-0.5 bg-zinc-700 rounded-full mb-1.5 shrink-0" />
                                <h3 className="text-[9px] font-bold text-white leading-none">More Options</h3>
                                <p className="text-[7px] text-zinc-500 font-medium mt-0.5">Custom shortcuts suggested by {username}</p>

                                <div className="w-full flex flex-col items-center gap-1.5 my-3">
                                    {itemsList.filter((item: any) => item.title && item.title.trim() !== '').map((item: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="w-auto p-1.5 px-3 bg-[#2a2a2a] border border-white/5 hover:bg-[#323232] text-[10.5px] font-bold text-[#3797F0] text-center rounded-2xl truncate shadow-sm transition-all"
                                        >
                                            {item.title}
                                        </div>
                                    ))}
                                </div>

                                <div className="w-full border-t border-white/5 pt-2 flex flex-col items-center text-center">
                                    <span className="text-[8px] font-bold text-[#e5e2e1]">Visit Website</span>
                                    <span className="text-[7px] text-zinc-500 font-medium mt-0.5">{websiteUrl}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Instagram Message Typing Section */}
                    <div className={cn(
                        "p-3.5 border-t border-white/5 bg-black shrink-0",
                        (type === 'persistent_menu' && animationStep === 'chat') ? "hidden" : "block"
                    )}>
                        <div className="flex items-center gap-2.5">
                            {/* Camera Button (Outside) */}
                            <div className="w-7 h-7 rounded-full bg-[#3797F0] flex items-center justify-center shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
                                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                            </div>
                            {/* Message input mock pill */}
                            <div className="flex-1 bg-[#1c1b1b] rounded-full px-3.5 py-1.5 flex items-center justify-between border border-white/5">
                                <span className="text-[11px] text-zinc-500 font-medium">
                                    {composerInputDisabledVal && type === 'persistent_menu' ? "Composer disabled" : "Message..."}
                                </span>
                                <div className="flex items-center gap-2.5 text-zinc-400 shrink-0">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V6a3 3 0 016 0v6.75a3 3 0 01-3 3z" /></svg>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" /></svg>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface DMContentEditorProps {
    nodeId?: string;
    onClose?: () => void;
    defaultTab?: 'icebreakers' | 'persistent_menu';
}

export default function DMContentEditor({ nodeId, onClose, defaultTab }: DMContentEditorProps) {
    const dispatch = useDispatch();
    const router = useRouter();
    const currentFlowId = useSelector((state: RootState) => state.flow.id);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // --- Dynamic Business Context Resolved from Redux Store ---
    const { user: appUser, instagramAccounts } = useSelector((state: RootState) => state.auth);
    const activeAccountId = appUser?.active_instagram_account_id;
    const activeAccount = React.useMemo(() => {
        if (!activeAccountId || !instagramAccounts) return null;
        return instagramAccounts.find((acc: any) => String(acc.id) === String(activeAccountId));
    }, [activeAccountId, instagramAccounts]);

    const username = activeAccount?.username || appUser?.username || 'Mailspot';
    const profilePic = activeAccount?.profile_picture_url || '';
    const websiteUrl = activeAccount?.website || 'www.mailspot.com';

    const followersCount = "54k";
    const postsCount = "879";
    const mutualsText = "You don't follow each other on Instagram";

    const node = useSelector((state: RootState) => state.flow.nodes.find(n => n.id === nodeId));

    // --- Core State (Active Saved Settings) ---
    const [welcomePrompt, setWelcomePrompt] = React.useState('Tap to send a question suggested by ' + username);
    const [iceBreakers, setIceBreakers] = React.useState<IceBreakerItem[]>([]);
    const [composerInputDisabled, setComposerInputDisabled] = React.useState(false);
    const [persistentMenuItems, setPersistentMenuItems] = React.useState<MenuItem[]>([]);
    const [orderTrackRetryLimit, setOrderTrackRetryLimit] = React.useState(3);

    // --- Temporary Form State (Inside Modal Overlay) ---
    const [tempWelcomePrompt, setTempWelcomePrompt] = React.useState('');
    const [tempIceBreakers, setTempIceBreakers] = React.useState<IceBreakerItem[]>([]);
    const [tempComposerInputDisabled, setTempComposerInputDisabled] = React.useState(false);
    const [tempPersistentMenuItems, setTempPersistentMenuItems] = React.useState<MenuItem[]>([]);
    const [tempOrderTrackRetryLimit, setTempOrderTrackRetryLimit] = React.useState(3);

    // --- View State ---
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [modalTab, setModalTab] = React.useState<'icebreakers' | 'persistent_menu'>(defaultTab || 'icebreakers');
    const [validationError, setValidationError] = React.useState<string | null>(null);
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [isSampleLoading, setIsSampleLoading] = React.useState({
        icebreakers: false,
        persistent_menu: false
    });
    const [isSavedOnInstagram, setIsSavedOnInstagram] = React.useState({
        icebreakers: false,
        persistent_menu: false
    });

    // Ref to hold current welcomePrompt for localStorage writes without being a dep
    const welcomePromptRef = React.useRef(welcomePrompt);
    React.useEffect(() => { welcomePromptRef.current = welcomePrompt; }, [welcomePrompt]);

    // --- Fetch Settings from Graph API (Cache Miss) ---
    const fetchSettingsFromAPI = React.useCallback(async () => {
        if (!activeAccountId) return;
        try {
            const [ibRes, pmRes] = await Promise.all([
                api.get(`/crm/messenger-profile/ice-breakers/?account_id=${activeAccountId}`),
                api.get(`/crm/messenger-profile/persistent-menu/?account_id=${activeAccountId}`)
            ]);

            const remoteIceBreakers = ibRes.data.ice_breakers || [];
            const remotePersistentMenu = pmRes.data.persistent_menu || [];

            let remoteComposerInputDisabled = false;
            let remoteMenuItems: MenuItem[] = [];
            if (remotePersistentMenu.length > 0) {
                remoteComposerInputDisabled = !!remotePersistentMenu[0].composer_input_disabled;
                remoteMenuItems = remotePersistentMenu[0].call_to_actions || [];
            }

            const hasIB = remoteIceBreakers.length > 0;
            const hasPM = remotePersistentMenu.length > 0;

            const remoteRetryLimit = pmRes.data.order_track_retry_limit || 3;
            setOrderTrackRetryLimit(remoteRetryLimit);
            setTempOrderTrackRetryLimit(remoteRetryLimit);

            setIsSavedOnInstagram({
                icebreakers: hasIB,
                persistent_menu: hasPM
            });

            if (hasIB) {
                setIceBreakers(remoteIceBreakers);
                setTempIceBreakers(remoteIceBreakers);
            } else {
                const sampleIB = [{ question: "How can I contact support?", payload: "SUPPORT" }];
                setIceBreakers(sampleIB);
                setTempIceBreakers(sampleIB);
            }

            if (hasPM) {
                setPersistentMenuItems(remoteMenuItems);
                setTempPersistentMenuItems(remoteMenuItems);
                setComposerInputDisabled(remoteComposerInputDisabled);
                setTempComposerInputDisabled(remoteComposerInputDisabled);
            } else {
                const sampleMenu: MenuItem[] = [{ type: 'postback', title: 'Talk to Sales', payload: 'TALK_TO_SALES' }];
                setPersistentMenuItems(sampleMenu);
                setTempPersistentMenuItems(sampleMenu);
                setComposerInputDisabled(false);
                setTempComposerInputDisabled(false);
            }

            // Write to localStorage cache (use ref to avoid stale closure without re-creating callback)
            const storageKey = `anydm_welcome_settings_${activeAccountId}`;
            const settingsData = {
                welcomePrompt: welcomePromptRef.current,
                iceBreakers: remoteIceBreakers,
                composerInputDisabled: remoteComposerInputDisabled,
                persistentMenuItems: remoteMenuItems,
                isSaved: {
                    icebreakers: hasIB,
                    persistent_menu: hasPM
                }
            };
            localStorage.setItem(storageKey, JSON.stringify(settingsData));
        } catch (e) {
            console.error("Failed to fetch settings from Graph API", e);
        }
    }, [activeAccountId]);

    const handleCreateSample = React.useCallback(async (type: 'icebreakers' | 'persistent_menu') => {
        if (!activeAccountId) return;
        setIsSampleLoading(prev => ({ ...prev, [type]: true }));
        try {
            if (type === 'icebreakers') {
                const sampleIB = [
                    { question: "How can I contact support?", payload: "SUPPORT" }
                ];
                setIceBreakers(sampleIB);
                setTempIceBreakers(sampleIB);
                setIsSavedOnInstagram(prev => ({ ...prev, icebreakers: true }));
            } else {
                const sampleMenu: MenuItem[] = [
                    { type: 'postback', title: 'Talk to Sales', payload: 'TALK_TO_SALES' }
                ];
                setPersistentMenuItems(sampleMenu);
                setTempPersistentMenuItems(sampleMenu);
                setComposerInputDisabled(false);
                setTempComposerInputDisabled(false);
                setIsSavedOnInstagram(prev => ({ ...prev, persistent_menu: true }));
            }

            // Sync localStorage cache
            const storageKey = `anydm_welcome_settings_${activeAccountId}`;
            const settingsData = {
                welcomePrompt: welcomePrompt,
                iceBreakers: type === 'icebreakers' ? [{ question: "How can I contact support?", payload: "SUPPORT" }] : iceBreakers,
                composerInputDisabled: type === 'persistent_menu' ? false : composerInputDisabled,
                persistentMenuItems: type === 'persistent_menu' ? [{ type: 'postback', title: 'Talk to Sales', payload: 'TALK_TO_SALES' }] : persistentMenuItems,
                isSaved: {
                    icebreakers: type === 'icebreakers' ? true : isSavedOnInstagram.icebreakers,
                    persistent_menu: type === 'persistent_menu' ? true : isSavedOnInstagram.persistent_menu
                }
            };
            localStorage.setItem(storageKey, JSON.stringify(settingsData));

            setSuccessMessage("Sample item created successfully!");
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (e: any) {
            console.error("Failed to create sample settings on Instagram", e);
            alert("Error creating sample: " + (e.response?.data?.error || e.message));
        } finally {
            setIsSampleLoading(prev => ({ ...prev, [type]: false }));
        }
    }, [activeAccountId, welcomePrompt, iceBreakers, persistentMenuItems, composerInputDisabled, isSavedOnInstagram]);

    const handleEditPayloadFlow = React.useCallback(async (payloadKey: string, type: 'icebreakers' | 'persistent_menu') => {
        try {
            const automationsRes = await api.get('/automations/');
            const automationsList = Array.isArray(automationsRes.data) ? automationsRes.data : [];

            const expectedName = type === 'icebreakers'
                ? "Welcome Message Flow"
                : "Persistent Menu Flow";

            const existingRule = automationsList.find((r: any) =>
                r.name === expectedName
            );

            if (existingRule) {
                router.push(`/dashboard/automations?id=${existingRule.id}`);
            } else {
                router.push(`/dashboard/automations?new_payload=${type}_flow&flow_type=${type}`);
            }
        } catch (e) {
            console.error("Error directing to flow builder:", e);
            router.push(`/dashboard/automations?new_payload=${type}_flow&flow_type=${type}`);
        }
    }, [router]);

    // --- Sync State from Node Load or LocalStorage ---
    React.useEffect(() => {
        if (!mounted) return;

        // Clean default states - no hardcoded placeholders
        let activeWelcomePrompt = 'Tap to send a question suggested by ' + username;
        let activeIceBreakers: IceBreakerItem[] = [];
        let activeComposerInputDisabled = false;
        let activePersistentMenuItems: MenuItem[] = [];

        if (!node) {
            const storageKey = `anydm_welcome_settings_${activeAccountId || 'default'}`;
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    activeWelcomePrompt = parsed.welcomePrompt || activeWelcomePrompt;
                    activeIceBreakers = parsed.iceBreakers || activeIceBreakers;
                    activeComposerInputDisabled = !!parsed.composerInputDisabled;
                    activePersistentMenuItems = parsed.persistentMenuItems || activePersistentMenuItems;
                    if (parsed.isSaved) {
                        setIsSavedOnInstagram(parsed.isSaved);
                    }
                } catch (e) {
                    console.error("Error parsing saved welcome settings", e);
                }
            }

            // Set initial state from cache (or defaults)
            setWelcomePrompt(activeWelcomePrompt);
            setIceBreakers(activeIceBreakers);
            setComposerInputDisabled(activeComposerInputDisabled);
            setPersistentMenuItems(activePersistentMenuItems);

            setTempWelcomePrompt(activeWelcomePrompt);
            setTempIceBreakers(activeIceBreakers);
            setTempComposerInputDisabled(activeComposerInputDisabled);
            setTempPersistentMenuItems(activePersistentMenuItems);

            // Fetch fresh configuration from Instagram Graph API
            if (activeAccountId) {
                fetchSettingsFromAPI();
            }
        } else {
            if (node.type === 'trigger') {
                if (node.data?.is_icebreaker_trigger) {
                    activeWelcomePrompt = node.data?.welcome_prompt || 'Tap to send a question suggested by ' + username;
                    activeIceBreakers = node.data?.icebreakers || [];
                } else if (node.data?.is_menu_trigger) {
                    activeComposerInputDisabled = !!node.data?.composer_input_disabled;
                    activePersistentMenuItems = node.data?.persistent_menu_items || [];
                }
            } else {
                // Load welcome prompt / quick replies context from React Flow node
                activeWelcomePrompt = node.data?.quick_reply_text || 'Tap to send a question suggested by ' + username;
                const titles = node.data?.quick_replies_titles || [];
                if (titles.length > 0) {
                    activeIceBreakers = titles.map((title: string) => ({
                        question: title,
                        payload: generateCleanPayloadKey(title)
                    }));
                }
                activeComposerInputDisabled = !!node.data?.composer_input_disabled;
                const btnsJson = node.data?.button_template_buttons_json;
                if (typeof btnsJson === 'string' && btnsJson.trim()) {
                    try { activePersistentMenuItems = JSON.parse(btnsJson); } catch (e) { console.error(e); }
                } else if (Array.isArray(btnsJson)) {
                    activePersistentMenuItems = btnsJson;
                }
            }

            setWelcomePrompt(activeWelcomePrompt);
            setIceBreakers(activeIceBreakers);
            setComposerInputDisabled(activeComposerInputDisabled);
            setPersistentMenuItems(activePersistentMenuItems);

            setTempWelcomePrompt(activeWelcomePrompt);
            setTempIceBreakers(activeIceBreakers);
            setTempComposerInputDisabled(activeComposerInputDisabled);
            setTempPersistentMenuItems(activePersistentMenuItems);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [node, mounted, activeAccountId, username, websiteUrl]);

    // Sync with URL query parameter on mount/load
    React.useEffect(() => {
        if (mounted && !nodeId && typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const openTab = params.get('open');
            if (openTab === 'icebreakers' || openTab === 'persistent_menu') {
                setModalTab(openTab);
                setIsEditModalOpen(true);
            }
        }
    }, [mounted, nodeId, welcomePrompt, iceBreakers, persistentMenuItems, composerInputDisabled]);

    // Force modal open when embedded via React Flow node context
    React.useEffect(() => {
        if (nodeId) {
            setIsEditModalOpen(true);
            if (node?.type === 'trigger') {
                if (node.data?.is_menu_trigger) {
                    setModalTab('persistent_menu');
                } else {
                    setModalTab('icebreakers');
                }
            } else {
                if (node?.data?.dm_format === 'button_template') {
                    setModalTab('persistent_menu');
                } else {
                    setModalTab('icebreakers');
                }
            }
        }
    }, [nodeId, node]);

    // --- Quiet Trigger Key Generator Utility ---
    function generateCleanPayloadKey(title: string): string {
        return title
            .toUpperCase()
            .trim()
            .replace(/[^A-Z0-9\s]/g, '') // Keep alphanumeric items only
            .replace(/\s+/g, '_');       // Format space delimiters to underscore
    }

    // --- Open Modal Action ---
    const openEditModal = (tab: 'icebreakers' | 'persistent_menu') => {
        setTempWelcomePrompt(welcomePrompt);
        setTempIceBreakers(JSON.parse(JSON.stringify(iceBreakers)));
        setTempComposerInputDisabled(composerInputDisabled);
        setTempPersistentMenuItems(JSON.parse(JSON.stringify(persistentMenuItems)));
        setModalTab(tab);
        setValidationError(null);
        setIsEditModalOpen(true);

        // Update URL query parameters to show the open mode
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('open', tab);
            window.history.pushState({}, '', url.toString());
        }
    };

    const onCloseModal = () => {
        setIsEditModalOpen(false);
        if (nodeId && onClose) {
            onClose();
        }

        // Remove URL query parameter when modal closes
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('open');
            window.history.pushState({}, '', url.toString());
        }
    };

    // --- Icebreakers Array Actions ---
    const handleAddIcebreaker = () => {
        if (tempIceBreakers.length >= 4) {
            setValidationError("Instagram standard profiles support a maximum of 4 icebreaker suggestions.");
            return;
        }
        setTempIceBreakers([...tempIceBreakers, { question: '', payload: '' }]);
        setValidationError(null);
    };

    const handleUpdateIcebreakerQuestion = (idx: number, value: string) => {
        const updated = tempIceBreakers.map((item, i) => {
            if (i === idx) {
                return {
                    ...item,
                    question: value,
                    payload: generateCleanPayloadKey(value)
                };
            }
            return item;
        });
        setTempIceBreakers(updated);
    };

    const handleRemoveIcebreaker = (idx: number) => {
        setTempIceBreakers(tempIceBreakers.filter((_, i) => i !== idx));
    };

    // --- Menu Options Array Actions ---
    const handleAddMenuItem = () => {
        if (tempPersistentMenuItems.length >= 3) {
            setValidationError("Instagram Menu Optionss support a maximum of 3 call-to-action buttons.");
            return;
        }
        setTempPersistentMenuItems([...tempPersistentMenuItems, { type: 'postback', title: '', payload: '' }]);
        setValidationError(null);
    };

    const handleUpdateMenuItemTitle = (idx: number, value: string) => {
        const updated = tempPersistentMenuItems.map((item, i) => {
            if (i === idx) {
                const isTrackOrder = item.type === 'postback' && item.payload === 'TRACK_ORDER';
                return {
                    ...item,
                    title: value,
                    payload: isTrackOrder ? 'TRACK_ORDER' : (item.type === 'postback' ? generateCleanPayloadKey(value) : item.payload)
                };
            }
            return item;
        });
        setTempPersistentMenuItems(updated);
    };

    const handleUpdateMenuItemType = (idx: number, value: 'postback' | 'web_url' | 'track_order' | any) => {
        const updated = tempPersistentMenuItems.map((item, i) => {
            if (i === idx) {
                if (value === 'track_order') {
                    return {
                        ...item,
                        type: 'postback' as const,
                        payload: 'TRACK_ORDER',
                        title: item.title || 'Track Order',
                        url: undefined
                    };
                } else if (value === 'web_url') {
                    return {
                        ...item,
                        type: 'web_url' as const,
                        payload: undefined,
                        url: item.url || 'https://'
                    };
                } else {
                    const cleanTitle = item.title || 'Option';
                    return {
                        ...item,
                        type: value,
                        url: undefined,
                        payload: generateCleanPayloadKey(cleanTitle === 'Track Order' ? 'Option' : cleanTitle)
                    };
                }
            }
            return item;
        });
        setTempPersistentMenuItems(updated);
    };

    const handleUpdateMenuItemUrl = (idx: number, value: string) => {
        const updated = tempPersistentMenuItems.map((item, i) => {
            if (i === idx) {
                return {
                    ...item,
                    url: value
                };
            }
            return item;
        });
        setTempPersistentMenuItems(updated);
    };

    const handleRemoveMenuItem = (idx: number) => {
        setTempPersistentMenuItems(tempPersistentMenuItems.filter((_, i) => i !== idx));
    };

    // --- Save / Validate Actions ---
    const handleSave = async () => {
        setValidationError(null);
        setSuccessMessage(null);
        setIsSaving(true);

        try {
            let nextIB = iceBreakers;
            let nextPM = persistentMenuItems;
            let nextComposer = composerInputDisabled;

            if (modalTab === 'icebreakers') {
                if (tempIceBreakers.length === 0 || tempIceBreakers.some(i => !i.question.trim())) {
                    setValidationError("Please fill out the question suggestions text for all active Icebreakers.");
                    setIsSaving(false);
                    return;
                }

                // Commit temporary state to main state
                setWelcomePrompt(tempWelcomePrompt);
                setIceBreakers(tempIceBreakers);
                nextIB = tempIceBreakers;

                setIsSavedOnInstagram(prev => ({ ...prev, icebreakers: true }));

                // Redux save (if inside Flow Builder node context)
                if (nodeId) {
                    if (node?.type === 'trigger') {
                        dispatch(updateNodeData({ id: nodeId, key: 'welcome_prompt', value: tempWelcomePrompt }));
                        dispatch(updateNodeData({ id: nodeId, key: 'icebreakers', value: tempIceBreakers }));
                    } else {
                        dispatch(updateNodeData({ id: nodeId, key: 'dm_format', value: 'quick_reply' }));
                        dispatch(updateNodeData({ id: nodeId, key: 'quick_reply_text', value: tempWelcomePrompt }));
                        dispatch(updateNodeData({ id: nodeId, key: 'quick_replies_titles', value: tempIceBreakers.map(i => i.question) }));
                        dispatch(updateNodeData({ id: nodeId, key: 'messages', value: [tempWelcomePrompt] }));
                    }
                }
            } else {
                if (tempPersistentMenuItems.length === 0 || tempPersistentMenuItems.some(m => !m.title.trim())) {
                    setValidationError("Please complete label titles for all Navigation Drawer buttons.");
                    setIsSaving(false);
                    return;
                }
                const invalidMenu = tempPersistentMenuItems.some(m =>
                    (m.type === 'web_url' && (!m.url || m.url === 'https://' || m.url.trim() === ''))
                );
                if (invalidMenu) {
                    setValidationError("Please configure valid web redirection links.");
                    setIsSaving(false);
                    return;
                }

                // Commit temporary state to main state
                setComposerInputDisabled(tempComposerInputDisabled);
                setPersistentMenuItems(tempPersistentMenuItems);
                setOrderTrackRetryLimit(tempOrderTrackRetryLimit);
                nextPM = tempPersistentMenuItems;
                nextComposer = tempComposerInputDisabled;

                setIsSavedOnInstagram(prev => ({ ...prev, persistent_menu: true }));

                // Redux save (if inside Flow Builder node context)
                if (nodeId) {
                    if (node?.type === 'trigger') {
                        dispatch(updateNodeData({ id: nodeId, key: 'composer_input_disabled', value: tempComposerInputDisabled }));
                        dispatch(updateNodeData({ id: nodeId, key: 'persistent_menu_items', value: tempPersistentMenuItems }));
                    } else {
                        dispatch(updateNodeData({ id: nodeId, key: 'dm_format', value: 'button_template' }));
                        dispatch(updateNodeData({ id: nodeId, key: 'composer_input_disabled', value: tempComposerInputDisabled }));
                        dispatch(updateNodeData({ id: nodeId, key: 'button_template_text', value: 'Navigation Menu' }));
                        dispatch(updateNodeData({ id: nodeId, key: 'button_template_buttons_json', value: JSON.stringify(tempPersistentMenuItems) }));
                        dispatch(updateNodeData({ id: nodeId, key: 'messages', value: ['Navigation Drawer Active'] }));
                    }
                }
            }

            // Persistent save (if standalone)
            if (!nodeId) {
                const storageKey = `anydm_welcome_settings_${activeAccountId || 'default'}`;
                const settingsData = {
                    welcomePrompt: modalTab === 'icebreakers' ? tempWelcomePrompt : welcomePrompt,
                    iceBreakers: nextIB,
                    composerInputDisabled: nextComposer,
                    persistentMenuItems: nextPM,
                    order_track_retry_limit: tempOrderTrackRetryLimit,
                    isSaved: {
                        icebreakers: modalTab === 'icebreakers' ? true : isSavedOnInstagram.icebreakers,
                        persistent_menu: modalTab === 'persistent_menu' ? true : isSavedOnInstagram.persistent_menu
                    }
                };
                localStorage.setItem(storageKey, JSON.stringify(settingsData));

                setSuccessMessage("Settings saved successfully!");
                setTimeout(() => {
                    setSuccessMessage(null);
                }, 3000);
            }

            // Close Modal
            setIsEditModalOpen(false);
            if (nodeId && onClose) {
                onClose();
            }
        } catch (err: any) {
            const errMsg = err.response?.data?.error || err.message || "Failed to update configuration on Instagram.";
            setValidationError(errMsg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setValidationError(null);
        setSuccessMessage(null);
        setIsDeleting(true);

        try {
            // 1. Delete setting from Instagram profile API if activeAccountId is available
            if (activeAccountId) {
                try {
                    if (modalTab === 'icebreakers') {
                        await api.delete(`/crm/messenger-profile/ice-breakers/?account_id=${activeAccountId}`);
                    } else {
                        await api.delete(`/crm/messenger-profile/persistent-menu/?account_id=${activeAccountId}`);
                    }
                } catch (e) {
                    console.error("Error deleting from Instagram API:", e);
                }
            }

            // 2. Delete automation record from database if integer ID exists
            const searchParamsId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null;
            const targetFlowId = currentFlowId || searchParamsId;
            const isIntegerId = targetFlowId && /^\d+$/.test(String(targetFlowId));
            if (isIntegerId) {
                try {
                    await api.delete(`/automations/${targetFlowId}/`);
                } catch (e) {
                    // Quietly ignore if draft rule was not persisted in DB
                }
            }

            // 3. Reset local storage cache
            const storageKey = `anydm_welcome_settings_${activeAccountId || 'default'}`;
            const cached = localStorage.getItem(storageKey);
            let prevSaved = { icebreakers: false, persistent_menu: false };
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (parsed.isSaved) prevSaved = parsed.isSaved;
                } catch (e) { }
            }

            const settingsData = {
                welcomePrompt: "Tap to send a question suggested by us",
                iceBreakers: modalTab === 'icebreakers' ? [] : iceBreakers,
                composerInputDisabled: modalTab === 'persistent_menu' ? false : composerInputDisabled,
                persistentMenuItems: modalTab === 'persistent_menu' ? [] : persistentMenuItems,
                isSaved: {
                    icebreakers: modalTab === 'icebreakers' ? false : prevSaved.icebreakers,
                    persistent_menu: modalTab === 'persistent_menu' ? false : prevSaved.persistent_menu
                }
            };
            localStorage.setItem(storageKey, JSON.stringify(settingsData));

            // 4. Update component local states
            if (modalTab === 'icebreakers') {
                setIceBreakers([]);
                setTempIceBreakers([]);
                setIsSavedOnInstagram(prev => ({ ...prev, icebreakers: false }));
            } else {
                setPersistentMenuItems([]);
                setTempPersistentMenuItems([]);
                setIsSavedOnInstagram(prev => ({ ...prev, persistent_menu: false }));
            }

            // 5. Clear Redux flow canvas state
            dispatch(setFlow({
                id: '',
                name: 'New Flow',
                nodes: [],
                edges: [],
                selectedNodeId: null,
                mediaPicker: null
            }));

            // 6. Close Modal / Drawer
            setIsEditModalOpen(false);
            if (onClose) {
                onClose();
            }

            // 7. Redirect to dashboard automations listing page
            router.push('/dashboard/automation');
        } catch (err: any) {
            const errMsg = err.response?.data?.error || err.message || "Failed to delete flow.";
            setValidationError(errMsg);
        } finally {
            setIsDeleting(false);
        }
    };



    // --- Modal Configuration Panel Layout ---
    const renderModalContent = () => {
        return (
            <div className="w-full max-w-4xl h-[90vh] lg:h-[85vh] max-h-[820px] lg:max-h-[780px] bg-[#131313] border border-[#444748] rounded-xl overflow-y-auto lg:overflow-hidden flex flex-col shadow-[0_24px_48px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200 text-[#e5e2e1] relative z-10 font-sans">
                {/* Modal Subheader for validation errors */}
                {validationError && (
                    <div className="px-6 py-2.5 bg-[#93000a]/10 border-b border-[#93000a] flex items-center gap-2 text-red-400 text-xs font-semibold animate-in slide-in-from-top-1 duration-150 shrink-0">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{validationError}</span>
                    </div>
                )}

                {/* Modal Workspace Columns */}
                <div className="flex-1 flex flex-col lg:flex-row lg:min-h-0">
                    {/* LEFT COLUMN: Simulated Device */}
                    <div className="lg:w-[360px] bg-black/25 p-6 flex flex-col items-center border-b lg:border-b-0 lg:border-r border-white/10 shrink-0 justify-center py-8 lg:py-6 lg:overflow-y-auto lg:min-h-0">

                        {modalTab === 'icebreakers' ? (
                            <PhonePreview
                                type="icebreakers"
                                promptVal={tempWelcomePrompt}
                                itemsList={tempIceBreakers}
                                composerInputDisabledVal={tempComposerInputDisabled}
                                profilePic={profilePic}
                                username={username}
                                websiteUrl={websiteUrl}
                                followersCount={followersCount}
                                postsCount={postsCount}
                                mutualsText={mutualsText}
                                isStatic={true}
                                profile_urls={activeAccount.profile_picture_url}
                            />
                        ) : (
                            <PhonePreview
                                type="persistent_menu"
                                promptVal={tempWelcomePrompt}
                                itemsList={tempPersistentMenuItems}
                                composerInputDisabledVal={tempComposerInputDisabled}
                                profilePic={profilePic}
                                username={username}
                                websiteUrl={websiteUrl}
                                followersCount={followersCount}
                                postsCount={postsCount}
                                mutualsText={mutualsText}
                                isStatic={true}
                                profile_urls={activeAccount.profile_picture_url}
                            />
                        )}
                    </div>

                    {/* RIGHT COLUMN: Configuration Form Area */}
                    <div className="flex-1 flex flex-col p-6 lg:p-8 bg-[#131313] lg:min-h-0">
                        {/* Editor Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-[#444748] shrink-0">
                            <div>
                                <h3 className="text-sm font-semibold text-white">
                                    {modalTab === 'icebreakers' ? "Configure Wellcome Message" : "Configure Menu Options"}
                                </h3>
                                <p className="text-[11px] text-zinc-500 mt-0.5">
                                    {modalTab === 'icebreakers'
                                        ? "Set up suggested question shortcuts shown to new chat users."
                                        : "Set up persistent shortcuts at the bottom of the user's inbox."}
                                </p>
                            </div>
                        </div>

                        {/* Form Inputs Scroll Area */}
                        <div className="flex-1 overflow-y-visible lg:overflow-y-auto py-6 space-y-5 custom-scrollbar lg:min-h-0">
                            {modalTab === 'icebreakers' ? (
                                /* TAB PANEL 1: Icebreakers Configuration */
                                <div className="space-y-5 animate-fadeIn">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-zinc-400 tracking-wider block">Title / Any small description</label>
                                        <input
                                            type="text"
                                            value={tempWelcomePrompt}
                                            onChange={(e) => setTempWelcomePrompt(e.target.value)}
                                            placeholder="e.g., Tap to send a question suggested by Mailspot"
                                            className="w-full bg-[#0e0e0e] border border-[#444748] rounded-md px-3.5 py-2 text-xs text-white outline-none focus:border-zinc-300 font-medium"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            {/* <h3 className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Suggested Questions ({tempIceBreakers.length}/4)</h3> */}
                                            {tempIceBreakers.length < 4 && (
                                                <button
                                                    type="button"
                                                    onClick={handleAddIcebreaker}
                                                    className="py-1 px-2.5 bg-white/5 hover:bg-white/10 border border-[#444748] text-[10px] font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer text-white"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Add Question
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            {tempIceBreakers.map((ib, idx) => (
                                                <div key={idx} className="flex gap-2 bg-[#0e0e0e] border border-[#444748] p-3 rounded-md items-center animate-fadeIn">
                                                    <span className="text-xs font-bold text-zinc-550 w-5 text-center">{idx + 1}</span>
                                                    <input
                                                        type="text"
                                                        value={ib.question}
                                                        onChange={(e) => handleUpdateIcebreakerQuestion(idx, e.target.value)}
                                                        placeholder="Ask a question..."
                                                        maxLength={80}
                                                        className="flex-1 bg-[#131313] border border-[#444748] rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-zinc-300 font-medium"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveIcebreaker(idx)}
                                                        className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* TAB PANEL 2: Menu Options Configuration */
                                <div className="space-y-5 animate-fadeIn">
                                    <div className="flex items-center justify-between bg-[#0e0e0e] border border-[#444748] rounded-md p-3.5">
                                        <div>
                                            <h4 className="text-xs font-semibold text-white">Disable Composer Input Box</h4>
                                            <p className="text-[10px] text-zinc-500 mt-1">Force direct navigation shortcuts, locking traditional keyboard entry.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setTempComposerInputDisabled(!tempComposerInputDisabled)}
                                            className={cn(
                                                "w-9 h-5 rounded-full relative transition-all duration-200 shrink-0",
                                                tempComposerInputDisabled ? "bg-white" : "bg-white/10"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute top-[2px] w-3.5 h-3.5 rounded-full shadow transition-all duration-200",
                                                tempComposerInputDisabled ? "left-[18px] bg-[#131313]" : "left-[2px] bg-white"
                                            )} />
                                        </button>
                                    </div>


                                    <div className="space-y-3 pt-2">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Navigation Menu Buttons ({tempPersistentMenuItems.length}/3)</h3>
                                            {tempPersistentMenuItems.length < 3 && (
                                                <button
                                                    type="button"
                                                    onClick={handleAddMenuItem}
                                                    className="py-1 px-2.5 bg-white/5 hover:bg-white/10 border border-[#444748] text-[10px] font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer text-white"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Add Option
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            {tempPersistentMenuItems.map((item, idx) => (
                                                <div key={idx} className="flex gap-3 bg-[#0e0e0e] border border-[#444748] p-4 rounded-md items-start relative animate-fadeIn">
                                                    <span className="text-[10px] font-bold text-zinc-500 w-4 text-center mt-2.5">{idx + 1}</span>

                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-semibold text-zinc-405 block">
                                                                Button is for
                                                            </label>

                                                            <select
                                                                value={
                                                                    item.type === "web_url"
                                                                        ? "web_url"
                                                                        : item.payload === "TRACK_ORDER"
                                                                            ? "track_order"
                                                                            : "postback"
                                                                }
                                                                onChange={(e) => handleUpdateMenuItemType(idx, e.target.value)}
                                                                className="w-full rounded-md bg-[#131313] border border-[#444748] px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-[#5f6368] cursor-pointer"
                                                            >
                                                                <option value="postback">Message Follow-up</option>
                                                                <option value="web_url">Open Link</option>
                                                                <option
                                                                    value="track_order"
                                                                    disabled={
                                                                        tempPersistentMenuItems.some(
                                                                            (menuItem, i) =>
                                                                                i !== idx &&
                                                                                menuItem.type === "postback" &&
                                                                                menuItem.payload === "TRACK_ORDER"
                                                                        )
                                                                    }
                                                                >
                                                                    Track Orders
                                                                </option>
                                                            </select>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <span className="text-[10px] font-semibold text-zinc-405 block mb-1">Button Title</span>
                                                            <input
                                                                type="text"
                                                                value={item.title}
                                                                onChange={(e) => handleUpdateMenuItemTitle(idx, e.target.value)}
                                                                placeholder="e.g., Shop Now"
                                                                maxLength={20}
                                                                className="w-full bg-[#131313] border border-[#444748] rounded-md px-3 py-1 text-xs text-white outline-none focus:border-zinc-300 font-medium"
                                                            />
                                                        </div>

                                                        {item.type === 'web_url' && (
                                                            <div className="space-y-1 md:col-span-2">
                                                                <span className="text-[10px] font-semibold text-zinc-405 block mb-1">
                                                                    Destination URL
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    value={item.url || ''}
                                                                    onChange={(e) => handleUpdateMenuItemUrl(idx, e.target.value)}
                                                                    placeholder="https://..."
                                                                    className="w-full bg-[#131313] border border-[#444748] rounded-md px-3 py-1 text-xs text-white outline-none focus:border-zinc-300 font-medium"
                                                                />
                                                            </div>
                                                        )}
                                                        {item.type === 'postback' && item.payload === 'TRACK_ORDER' && (
                                                            <div className="space-y-1 md:col-span-2 bg-[#4f46e5]/10 border border-[#4f46e5]/20 rounded-md p-2.5 text-[10px] text-indigo-300 font-semibold mt-1">
                                                                Using order number users can track the orders
                                                            </div>
                                                        )}
                                                        {item.type === 'postback' && item.payload !== 'TRACK_ORDER' && (
                                                            <div className="space-y-1 md:col-span-2 bg-[#4f46e5]/10 border border-[#4f46e5]/20 rounded-md p-2.5 text-[10px] text-indigo-300 font-semibold mt-1">
                                                                You can for continue the chat with add flow
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMenuItem(idx)}
                                                        className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer mt-5"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}


                                        </div>
                                    </div>


                                    {tempPersistentMenuItems
                                        .filter(item => item.payload === 'TRACK_ORDER')
                                        .slice(0, 1)
                                        .map((item, idx) => (


                                            <div key={idx} className="flex items-center justify-between bg-[#0e0e0e] border border-[#444748] rounded-md p-3.5">
                                                <div>
                                                    <h4 className="text-xs font-semibold text-white">Order ID Retry Limit</h4>
                                                    <p className="text-[10px] text-zinc-500 mt-1">Number of attempts before order tracking is automatically cancelled.</p>
                                                </div>
                                                <select
                                                    value={tempOrderTrackRetryLimit}
                                                    onChange={(e) => setTempOrderTrackRetryLimit(Number(e.target.value))}
                                                    className="bg-[#131313] border border-[#444748] rounded-md px-2.5 py-1.5 text-xs text-white outline-none focus:border-zinc-300 font-semibold cursor-pointer"
                                                >
                                                    <option value={1}>1 Attempt</option>
                                                    <option value={2}>2 Attempts</option>
                                                    <option value={3}>3 Attempts</option>
                                                    <option value={4}>4 Attempts</option>
                                                    <option value={5}>5 Attempts</option>
                                                </select>
                                            </div>

                                        ))}



                                </div>
                            )}
                        </div>

                        {/* Footer actions inside Modal */}
                        <div className="pt-4 border-t border-[#444748] flex items-center justify-end shrink-0 gap-2">
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting || isSaving}
                                className="mr-auto px-4 py-1.5 border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-semibold rounded transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    modalTab === 'icebreakers' ? "Delete Message Flow" : "Delete Menu Flow"
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={onCloseModal}
                                disabled={isSaving || isDeleting}
                                className="px-4 py-1.5 border border-[#444748] hover:bg-[#202020] text-xs font-semibold rounded transition-colors cursor-pointer text-white disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving || isDeleting}
                                className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (!mounted) return null;

    // Render direct flow edit overlay if nodeId is defined
    if (nodeId) {
        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#131313]/40 backdrop-blur-md overflow-hidden font-sans">
                {renderModalContent()}
            </div>,
            document.body
        );
    }

    // Otherwise, render full dual preview dashboard layout
    return (
        <div className="space-y-6 font-sans text-[#e5e2e1] select-none">
            {/* Page Header */}
            {/* <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Welcome Experience</h1>
                    <p className="text-sm text-zinc-400 mt-1">Manage what users see when they open your Instagram Direct Chat for the first time.</p>
                </div>
                {successMessage && (
                    <div className="glass-pane px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/30 animate-pulse">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}
            </div> */}

            {/* Simulated Dual Previews */}
            <div className={defaultTab ? "flex flex-col" : "grid grid-cols-1 lg:grid-cols-2 gap-8"}>
                {/* 1. Icebreakers preview */}
                {(!defaultTab || defaultTab === 'icebreakers') && (
                    <div className="flex justify-center items-center w-full py-2">
                        <PhonePreview
                            type="icebreakers"
                            promptVal={welcomePrompt}
                            itemsList={iceBreakers}
                            composerInputDisabledVal={composerInputDisabled}
                            profilePic={profilePic}
                            username={username}
                            websiteUrl={websiteUrl}
                            followersCount={followersCount}
                            postsCount={postsCount}
                            mutualsText={mutualsText}
                            profile_urls={activeAccount.profile_picture_url}
                        />
                    </div>
                )}

                {/* 2. Menu Options preview */}
                {(!defaultTab || defaultTab === 'persistent_menu') && (
                    <div className="flex justify-center items-center w-full py-2">
                        <PhonePreview
                            type="persistent_menu"
                            promptVal={welcomePrompt}
                            itemsList={persistentMenuItems}
                            composerInputDisabledVal={composerInputDisabled}
                            profilePic={profilePic}
                            username={username}
                            websiteUrl={websiteUrl}
                            followersCount={followersCount}
                            postsCount={postsCount}
                            mutualsText={mutualsText}
                            profile_urls={activeAccount.profile_picture_url}
                        />
                    </div>
                )}
            </div>

            {/* Portal for Edit Modal Popup */}
            {isEditModalOpen && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#131313]/40 backdrop-blur-md overflow-hidden font-sans">
                    {renderModalContent()}
                </div>,
                document.body
            )}
        </div>
    );
}