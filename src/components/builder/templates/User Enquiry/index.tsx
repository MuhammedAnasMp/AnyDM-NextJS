"use client";

import { Video, ShoppingBag } from 'lucide-react';
import { addDefaultFlowTemplate } from '@/store/slices/flowSlice';
import { useDispatch } from 'react-redux';
import { TemplateItem } from '../../TemplateItem';

export function ProductCarouselDM() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title="Product Carousel DM"
      desc="Triggered by comment"
      icon={ShoppingBag}
      templateId="3"
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'product_inquiry_comment', name: 'Product Carousel DM', templateId: '3' }))}
    />
  );
}

export function SpecificReelProductInquiry() {
  const dispatch = useDispatch();
  return (
    <TemplateItem
      title="Specific Reel Product Inquiry"
      desc='e.g. "shoes" tag link'
      icon={Video}
      templateId="19"
      onClick={() => dispatch(addDefaultFlowTemplate({ ruleType: 'product_inquiry_comment', name: 'Specific Reel Product Inquiry', templateId: '19' }))}
    />
  );
}

