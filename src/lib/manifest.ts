import { AutomationTypeManifest } from './types';

export const AUTOMATION_MANIFESTS: Record<string, AutomationTypeManifest> = {
  comment_automation: {
    ruleType: 'comment_automation',
    displayName: 'Comment Automation',
    category: 'Instagram',
    triggerEvent: 'comment_event',
    allowedNodes: ['trigger', 'condition', 'action', 'giveaway_config', 'reward'],
    nodeDefinitions: {
      trigger: [
        { name: 'target_mode', label: 'Target Mode', type: 'select', options: [{ label: 'Selected Posts/Reels', value: 'selected' }, { label: 'Every Post', value: 'every' }] },
        { name: 'media_ids', label: 'Selected Media', type: 'resource_picker', resourceType: 'media', dependsOn: { field: 'target_mode', value: 'selected' } },
        { name: 'deduplication', label: 'Deduplication (24h)', type: 'switch' }
      ],
      condition: [
        { name: 'match_type', label: 'Keyword Match Type', type: 'select', options: [{ label: 'Contains Any', value: 'contains' }, { label: 'Exact Match', value: 'equals' }, { label: 'Any Comment', value: 'any' }] },
        { name: 'keywords', label: 'Keywords', type: 'keywords', dependsOn: { field: 'match_type', value: 'contains' } },
        { name: 'follower_gate', label: 'Follower Gate', type: 'switch' }
      ],
      action: [
        { name: 'action_type', label: 'Action Type', type: 'select', options: [{ label: 'Reply to Comment', value: 'reply_comment' }, { label: 'Send Direct Message', value: 'send_dm' }] },
        { name: 'message_mode', label: 'Message Mode', type: 'select', options: [{ label: 'Random', value: 'random' }, { label: 'Fixed', value: 'fixed' }] },
        { name: 'messages', label: 'Messages', type: 'message_list' },
        { name: 'dm_format', label: 'DM Format', type: 'select', options: [{ label: 'Plain Text', value: 'text' }, { label: 'Generic Template', value: 'generic_template' }, { label: 'Button Template', value: 'button_template' }], dependsOn: { field: 'action_type', value: 'send_dm' } }
      ]
    }
  },
  dm_automation: {
    ruleType: 'dm_automation',
    displayName: 'DM Automation',
    category: 'Instagram',
    triggerEvent: 'dm_event',
    allowedNodes: ['trigger', 'condition', 'action'],
    nodeDefinitions: {
      trigger: [],
      condition: [
        { name: 'match_type', label: 'Keyword Match Type', type: 'select', options: [{ label: 'Contains', value: 'contains' }, { label: 'Any Message', value: 'any' }] },
        { name: 'keywords', label: 'Keywords', type: 'keywords', dependsOn: { field: 'match_type', value: 'contains' } }
      ],
      action: [
        { name: 'dm_format', label: 'Message Format', type: 'select', options: [{ label: 'Text', value: 'text' }, { label: 'Button Template', value: 'button_template' }] },
        { name: 'messages', label: 'Text Message', type: 'message_list' }
      ]
    }
  },
  giveaway_comment: {
    ruleType: 'giveaway_comment',
    displayName: 'Giveaway (Comment)',
    category: 'Giveaways',
    triggerEvent: 'comment_event',
    allowedNodes: ['trigger', 'condition', 'giveaway_config', 'reward'],
    nodeDefinitions: {
      trigger: [
        { name: 'target_mode', label: 'Target Mode', type: 'select', options: [{ label: 'Selected Posts', value: 'selected' }] },
        { name: 'media_ids', label: 'Select Post', type: 'resource_picker', resourceType: 'media' },
      ],
      condition: [
        { name: 'match_type', label: 'Require Keyword', type: 'select', options: [{ label: 'Yes', value: 'contains' }, { label: 'No (Any Comment)', value: 'any' }] },
        { name: 'keywords', label: 'Entry Keywords', type: 'keywords', dependsOn: { field: 'match_type', value: 'contains' } },
        { name: 'follower_gate', label: 'Require Follow', type: 'switch' }
      ],
      giveaway_config: [
        { name: 'selection_method', label: 'Selection Method', type: 'select', options: [{ label: 'Random', value: 'random' }, { label: 'AI Ranked', value: 'ai_ranked' }, { label: 'Most Engaged', value: 'most_engaged' }] },
        { name: 'winner_count', label: 'Number of Winners', type: 'number' },
        { name: 'finalize_at', label: 'Draw Date', type: 'datetime' }
      ],
      reward: [
        { name: 'reward_type', label: 'Reward Type', type: 'select', options: [{ label: 'Physical Prize', value: 'physical' }, { label: 'Discount/Coupon', value: 'discount' }] },
        { name: 'value', label: 'Reward Name / Value', type: 'text' },
        { name: 'quantity', label: 'Quantity', type: 'number' }
      ]
    }
  },
  product_inquiry_comment: {
    ruleType: 'product_inquiry_comment',
    displayName: 'Product Inquiry (Comment)',
    category: 'Ecommerce',
    triggerEvent: 'comment_event',
    allowedNodes: ['trigger', 'condition', 'action'],
    nodeDefinitions: {
      trigger: [
        { name: 'target_mode', label: 'Target Mode', type: 'select', options: [{ label: 'Selected Products/Reels', value: 'selected' }, { label: 'Every Post', value: 'every' }] },
        { name: 'media_ids', label: 'Selected Media', type: 'resource_picker', resourceType: 'media', dependsOn: { field: 'target_mode', value: 'selected' } },
      ],
      condition: [
        { name: 'match_type', label: 'Keyword Match Type', type: 'select', options: [{ label: 'Contains Any', value: 'contains' }] },
        { name: 'keywords', label: 'Keywords', type: 'keywords', dependsOn: { field: 'match_type', value: 'contains' } }
      ],
      action: [
        { name: 'action_type', label: 'Action Type', type: 'select', options: [{ label: 'Send Product Carousel', value: 'send_dm' }] },
      ]
    }
  },
  product_inquiry_story: {
    ruleType: 'product_inquiry_story',
    displayName: 'Product Inquiry (Story)',
    category: 'Ecommerce',
    triggerEvent: 'story_reply',
    allowedNodes: ['trigger', 'condition', 'action'],
    nodeDefinitions: {
      trigger: [
        { name: 'target_mode', label: 'Target Mode', type: 'select', options: [{ label: 'Selected Stories', value: 'selected' }, { label: 'Every Story', value: 'every' }] },
      ],
      condition: [
        { name: 'match_type', label: 'Keyword Match Type', type: 'select', options: [{ label: 'Contains Any', value: 'contains' }, { label: 'Any Reply', value: 'any' }] },
        { name: 'keywords', label: 'Keywords', type: 'keywords', dependsOn: { field: 'match_type', value: 'contains' } },
        { name: 'follower_gate', label: 'Require Follow', type: 'switch' }
      ],
      action: [
        { name: 'action_type', label: 'Action Type', type: 'select', options: [{ label: 'Send Product Carousel', value: 'send_dm' }] },
      ]
    }
  },
  product_inquiry_dm: {
    ruleType: 'product_inquiry_dm',
    displayName: 'Product Inquiry (DM)',
    category: 'Ecommerce',
    triggerEvent: 'dm_event',
    allowedNodes: ['trigger', 'condition', 'action'],
    nodeDefinitions: {
      trigger: [],
      condition: [
        { name: 'match_type', label: 'Keyword Match Type', type: 'select', options: [{ label: 'Contains', value: 'contains' }, { label: 'Any Message', value: 'any' }] },
        { name: 'keywords', label: 'Keywords', type: 'keywords', dependsOn: { field: 'match_type', value: 'contains' } }
      ],
      action: [
        { name: 'action_type', label: 'Action Type', type: 'select', options: [{ label: 'Send Product Carousel', value: 'send_dm' }] },
      ]
    }
  },
  story_automation: {
    ruleType: 'story_automation',
    displayName: 'Story Automation',
    category: 'Instagram',
    triggerEvent: 'story_reply',
    allowedNodes: ['trigger', 'condition', 'action'],
    nodeDefinitions: {
      trigger: [
        { name: 'target_mode', label: 'Target Mode', type: 'select', options: [{ label: 'Selected Stories', value: 'selected' }, { label: 'All Stories', value: 'every' }] }
      ],
      condition: [
        { name: 'match_type', label: 'Match Type', type: 'select', options: [{ label: 'Contains Any', value: 'contains' }, { label: 'Any Reply', value: 'any' }] },
      ],
      action: [
        { name: 'action_type', label: 'Action Type', type: 'select', options: [{ label: 'Send DM', value: 'send_dm' }] },
      ]
    }
  },
  giveaway_dm: {
    ruleType: 'giveaway_dm',
    displayName: 'Giveaway (DM)',
    category: 'Giveaways',
    triggerEvent: 'dm_event',
    allowedNodes: ['trigger', 'condition', 'giveaway_config', 'reward'],
    nodeDefinitions: {
      trigger: [],
      condition: [
        { name: 'match_type', label: 'Match Type', type: 'select', options: [{ label: 'Exact Match', value: 'equals' }, { label: 'Contains', value: 'contains' }] },
        { name: 'keywords', label: 'Entry Keywords', type: 'keywords' }
      ],
      giveaway_config: [
        { name: 'selection_method', label: 'Selection Method', type: 'select', options: [{ label: 'Random', value: 'random' }] },
        { name: 'winner_count', label: 'Number of Winners', type: 'number' },
      ],
      reward: [
        { name: 'reward_type', label: 'Reward Type', type: 'select', options: [{ label: 'Physical Prize', value: 'physical' }, { label: 'Discount/Coupon', value: 'discount' }] },
      ]
    }
  }
};
