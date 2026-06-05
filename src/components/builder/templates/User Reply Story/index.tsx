"use client";

import { History, ShoppingBag } from 'lucide-react';
import { addDefaultFlowTemplate } from '@/store/slices/flowSlice';
import { useDispatch } from 'react-redux';
import { TemplateItem } from '../../TemplateItem';

export function StoryReplyPlainDM() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title="Story Reply → Plain DM"
      desc="Flash Sale Link"
      icon={History}
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'story_automation', name: 'Story Reply → Plain DM', templateId: '5' }))}
    />
  );
}

export function StoryReplyProductCarousel() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title="Story Reply Product Carousel"
      desc="With Follower Gate"
      icon={ShoppingBag}
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'product_inquiry_story', name: 'Story Reply Product Carousel', templateId: '6' }))}
    />
  );
}
