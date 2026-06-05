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
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'dm_automation', name: 'Welcome Auto Reply', templateId: '7' }))}
    />
  );
}
