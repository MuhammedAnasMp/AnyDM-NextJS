"use client";

import { 
  Brain, Gift, TrendingUp, Zap, Lock, 
  MousePointerClick, MessageSquare, PieChart, 
  Trophy, Timer, Star 
} from 'lucide-react';
import { addDefaultFlowTemplate } from '@/store/slices/flowSlice';
import { useDispatch } from 'react-redux';
import { TemplateItem } from '../../TemplateItem';

export function AIRankedBestComment() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title="AI-Ranked Best Comment"
      desc="AI evaluated winner"
      icon={Brain}
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'giveaway_comment', name: 'AI-Ranked Best Comment', templateId: '12' }))}
    />
  );
}

export function ClassicRandomGiveaway() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title="Classic Random Giveaway"
      desc="Random winner from comments"
      icon={Gift}
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'giveaway_comment', name: 'Classic Random Giveaway', templateId: '10' }))}
    />
  );
}

export function CommentMarathon() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title="Comment Marathon"
      desc="Most active wins"
      icon={TrendingUp}
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'giveaway_comment', name: 'Comment Marathon', templateId: '20' }))}
    />
  );
}

export function FlashGiveaway() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title="Flash Giveaway"
      desc="First commenter wins"
      icon={Zap}
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'giveaway_comment', name: 'Flash Giveaway', templateId: '13' }))}
    />
  );
}

export function FollowersOnlyDiscountCode() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title="Followers-Only Discount Code"
      desc="Follower gate for comments"
      icon={Lock}
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'comment_automation', name: 'Followers-Only Discount Code', templateId: '9' }))}
    />
  );
}

export function MostEngagedFanWins() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title="Most Engaged Fan Wins"
      desc="Engagement ranking"
      icon={TrendingUp}
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'giveaway_comment', name: 'Most Engaged Fan Wins', templateId: '11' }))}
    />
  );
}

export function QuickReplyPills() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title="Quick Reply Pills"
      desc="Size Picker"
      icon={MousePointerClick}
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'comment_automation', name: 'Quick Reply Pills', templateId: '2' }))}
    />
  );
}

export function ReplyAndPlainTextDM() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title="Reply + Plain Text DM"
      desc="Comment → Reply + DM"
      icon={MessageSquare}
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'comment_automation', name: 'Reply + Plain Text DM', templateId: '1' }))}
    />
  );
}

export function SpinWheelGamification() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title="Spin Wheel Gamification"
      desc="Everyone gets a spin code"
      icon={PieChart}
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'giveaway_comment', name: 'Spin Wheel Gamification', templateId: '15' }))}
    />
  );
}

export function Top3MultiWinner() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title="Top 3 Multi-Winner"
      desc="Ranked campaign"
      icon={Trophy}
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'giveaway_comment', name: 'Top 3 Multi-Winner', templateId: '14' }))}
    />
  );
}

export function TwoHourFlashSale() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title="2-Hour Flash Sale"
      desc="Time limited commenting"
      icon={Timer}
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'comment_automation', name: '2-Hour Flash Sale', templateId: '18' }))}
    />
  );
}

export function WeightedHybridRandom() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title="Weighted Hybrid Random"
      desc="Score-influenced draw"
      icon={Star}
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'giveaway_comment', name: 'Weighted Hybrid Random', templateId: '17' }))}
    />
  );
}
