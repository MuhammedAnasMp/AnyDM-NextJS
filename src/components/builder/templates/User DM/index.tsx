"use client";

import { Hand, Lock, Grid, Menu } from 'lucide-react';
import { addDefaultFlowTemplate } from '@/store/slices/flowSlice';
import { useDispatch } from 'react-redux';
import { TemplateItem } from '../../TemplateItem';

export function ButtonTemplate() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title="Button Template"
      desc="Menu Navigation in DM"
      icon={Menu}
      templateId="4"
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'dm_automation', name: 'Button Template', templateId: '4' }))}
    />
  );
}

export function DMCatalogCarousel() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title='DM "catalog" Carousel'
      desc="Multi-product Carousel"
      icon={Grid}
      templateId="8"
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'product_inquiry_dm', name: 'DM "catalog" Carousel', templateId: '8' }))}
    />
  );
}

export function DMEntryPrivateGiveaway() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title="DM-Entry Private Giveaway"
      desc="Send keyword to enter"
      icon={Lock}
      templateId="16"
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'giveaway_dm', name: 'DM-Entry Private Giveaway', templateId: '16' }))}
    />
  );
}

export function WelcomeAutoReply() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title="Welcome Auto Reply"
      desc="Any DM triggers welcome"
      icon={Hand}
      templateId="7"
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'dm_automation', name: 'Welcome Auto Reply', templateId: '7' }))}
    />
  );
}

export function IceBreakerReplyFlow() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title="Welcome Message Flow"
      desc="Reply to Icebreaker questions"
      icon={Hand}
      templateId="21"
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'dm_automation', name: 'Welcome Message Flow: SUPPORT', templateId: '21' }))}
    />
  );
}

export function PersistentMenuReplyFlow() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title="Persistent Menu Flow"
      desc="Reply to Persistent Menu buttons"
      icon={Menu}
      templateId="22"
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'dm_automation', name: 'Persistent Menu Flow: TALK_TO_SALES', templateId: '22' }))}
    />
  );
}

