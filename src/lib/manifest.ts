import { AutomationTypeManifest, NodeFieldDefinition } from './types';

// Shared Field Definitions to avoid redundancy and keep configurations synchronized
const TRIGGER_FIELDS = (isDM: boolean, isStory: boolean = false): NodeFieldDefinition[] => [
  {
    name: 'target_mode', label: 'Target Mode', type: 'select', options: [
      { label: isStory ? 'Every Story' : (isDM ? 'Every DM Message' : 'Every Post / Reel'), value: 'every' },
      { label: isStory ? 'Selected Stories Only' : 'Selected Media Only', value: 'selected' }
    ]
  },
  { name: 'media_ids', label: isStory ? 'Selected Story IDs' : 'Selected Media', type: 'resource_picker', resourceType: isStory ? 'story' : 'media', dependsOn: { field: 'target_mode', value: 'selected' } },
  { name: 'detailed', label: 'Detailed Card View', type: 'switch', helperText: 'Display all configuration options on the canvas card' }
];

const CONDITION_FIELDS = (hasKeywords: boolean): NodeFieldDefinition[] => {
  const fields: NodeFieldDefinition[] = [
    {
      name: 'match_type', label: 'Keyword Match Type', type: 'select', options: [
        { label: 'Contains Any', value: 'contains' },
        { label: 'Exact Match', value: 'equals' },
        { label: 'Any Message', value: 'any' }
      ]
    }
  ];
  if (hasKeywords) {
    fields.push({ name: 'keywords', label: 'Keywords', type: 'keywords', dependsOn: { field: 'match_type', value: 'contains' } });
    fields.push({ name: 'keywords_equals', label: 'Keywords (Exact)', type: 'keywords', dependsOn: { field: 'match_type', value: 'equals' } });
  }
  fields.push({ name: 'follower_gate', label: 'Enable Follower Gate', type: 'switch', helperText: 'User must follow your page' });
  fields.push({ name: 'follower_gate_messages', label: 'Gate Block Messages', type: 'message_list', dependsOn: { field: 'follower_gate', value: true } });
  fields.push({ name: 'detailed', label: 'Detailed Card View', type: 'switch', helperText: 'Display all configuration options on the canvas card' });
  return fields;
};

const ACTION_FIELDS = (hasReplyComment: boolean): NodeFieldDefinition[] => [
  { name: 'messages', label: 'Messages List', type: 'message_list' },
  {
    name: 'dm_format', label: 'DM Format', type: 'select', options: [
      { label: 'Plain Text', value: 'text' },
      { label: 'Quick Reply Buttons', value: 'quick_reply' },
      { label: 'Carousel Template', value: 'generic_template' },
      { label: 'Button Template', value: 'button_template' },
      { label: 'Attachments', value: 'attachment' }
    ], dependsOn: { field: 'action_type', value: 'send_dm' }
  },
  { name: 'rate_limit_limit', label: 'Rate Limit Count', type: 'number', placeholder: '1' },
  { name: 'rate_limit_window_seconds', label: 'Rate Limit Window (Seconds)', type: 'number', placeholder: '86400' },
  { name: 'quick_reply_text', label: 'Quick Reply Text Header', type: 'text', placeholder: 'Pick size:', dependsOn: { field: 'dm_format', value: 'quick_reply' } },
  { name: 'quick_replies_titles', label: 'Quick Reply Pill Titles', type: 'keywords', placeholder: 'XS, S, M', dependsOn: { field: 'dm_format', value: 'quick_reply' } },
  { name: 'button_template_text', label: 'Button Header Text', type: 'text', placeholder: 'What do you want to do?', dependsOn: { field: 'dm_format', value: 'button_template' } },
  { name: 'button_template_buttons_json', label: 'Buttons list JSON', type: 'textarea', placeholder: '[{"type": "web_url", "title": "🛍️ Shop Now", "url": "https://..."}]', dependsOn: { field: 'dm_format', value: 'button_template' } },
  { name: 'generic_template_elements_json', label: 'Carousel Cards list JSON', type: 'textarea', placeholder: '[{"title": "Summer Bag", "subtitle": "Leather", "image_url": "https://..."}]', dependsOn: { field: 'dm_format', value: 'generic_template' } },
  { name: 'detailed', label: 'Detailed Card View', type: 'switch', helperText: 'Display all configuration options on the canvas card' }
];

const GIVEAWAY_FIELDS: NodeFieldDefinition[] = [
  {
    name: 'selection_method', label: 'Draw Selection Method', type: 'select', options: [
      { label: 'Classic Random Draw', value: 'random' },
      { label: 'AI Ranked Best Comment', value: 'ai_ranked' },
      { label: 'Most Engaged Fan Wins', value: 'most_engaged' },
      { label: 'First Come First Serve', value: 'first_come_first_serve' },
      { label: 'Weighted Random (Hybrid)', value: 'weighted_random' },
      { label: 'Comment Marathon (Activity)', value: 'most_comment_activity' }
    ]
  },
  { name: 'winner_count', label: 'Number of Winners', type: 'number', placeholder: '1' },
  { name: 'evaluation_window_seconds', label: 'Evaluation Time Window (Secs)', type: 'number', placeholder: '604800' },
  { name: 'finalize_at', label: 'Final Draw Date & Time', type: 'datetime' },
  { name: 'data_snapshot_at', label: 'Data Snapshot Date & Time', type: 'datetime' },
  { name: 're_evaluation_allowed', label: 'Allow Re-Evaluation', type: 'switch' },
  { name: 're_evaluation_max', label: 'Max Re-evaluation Draws', type: 'number', dependsOn: { field: 're_evaluation_allowed', value: true } },
  { name: 'anti_fraud_enabled', label: 'Enable Anti-Fraud Filters', type: 'switch' },
  { name: 'min_account_age_days', label: 'Min Account Age (Days)', type: 'number', dependsOn: { field: 'anti_fraud_enabled', value: true } },
  { name: 'min_followers', label: 'Min Followers Required', type: 'number', dependsOn: { field: 'anti_fraud_enabled', value: true } },
  { name: 'block_duplicate_ips', label: 'Block Duplicate IPs', type: 'switch', dependsOn: { field: 'anti_fraud_enabled', value: true } },
  { name: 'block_private_accounts', label: 'Block Private Accounts', type: 'switch', dependsOn: { field: 'anti_fraud_enabled', value: true } },
  { name: 'gamification_enabled', label: 'Enable Gamification', type: 'switch' },
  { name: 'spin_wheel_enabled', label: 'Enable Spin Wheel', type: 'switch', dependsOn: { field: 'gamification_enabled', value: true } },
  { name: 'spin_wheel_base_url', label: 'Spin Wheel Base URL', type: 'text', placeholder: 'https://...', dependsOn: { field: 'spin_wheel_enabled', value: true } },
  { name: 'spin_wheel_single_use', label: 'Single Use URL mode', type: 'switch', dependsOn: { field: 'spin_wheel_enabled', value: true } },
  {
    name: 'spin_wheel_url_mode', label: 'URL Format Mode', type: 'select', dependsOn: { field: 'spin_wheel_enabled', value: true }, options: [
      { label: 'Signed Token', value: 'signed_token' },
      { label: 'Plaintext', value: 'plaintext' }
    ]
  },
  { name: 'spin_token_expiry_hours', label: 'Spin Token Expiry (Hours)', type: 'number', placeholder: '48', dependsOn: { field: 'spin_wheel_enabled', value: true } },
  { name: 'ai_model', label: 'AI Model Version', type: 'text', placeholder: 'engagement_ranker_v1', dependsOn: { field: 'selection_method', value: 'ai_ranked' } },
  { name: 'ai_factors', label: 'AI Factors Evaluated', type: 'keywords', placeholder: 'comment_relevance', dependsOn: { field: 'selection_method', value: 'ai_ranked' } },
  { name: 'scoring_weights_json', label: 'Scoring Weights JSON', type: 'textarea', placeholder: '{"engagement": 0.5, "replies": 0.2}', dependsOn: { field: 'selection_method', value: 'most_engaged' } },
  { name: 'reward_delivery_methods', label: 'Reward Delivery channels', type: 'keywords', placeholder: 'direct_dm' },
  { name: 'winner_messages', label: 'Winner Message Templates', type: 'message_list' },
  { name: 'detailed', label: 'Detailed Card View', type: 'switch', helperText: 'Display all configuration options on the canvas card' }
];

const REWARD_FIELDS: NodeFieldDefinition[] = [
  {
    name: 'reward_type', label: 'Reward Type', type: 'select', options: [
      { label: 'Discount Code', value: 'discount' },
      { label: 'Physical Prize', value: 'physical' },
      { label: 'Mystery Box', value: 'mystery' },
      { label: 'Digital Download', value: 'digital' },
      { label: 'Custom Reward', value: 'custom' }
    ]
  },
  { name: 'value', label: 'Reward Name / Value', type: 'text', placeholder: 'e.g. Save 20%, iPhone 15 Pro' },
  { name: 'quantity', label: 'Quantity Available', type: 'number', placeholder: '1' },
  { name: 'detailed', label: 'Detailed Card View', type: 'switch', helperText: 'Display all configuration options on the canvas card' }
];

export const AUTOMATION_MANIFESTS: Record<string, AutomationTypeManifest> = {
  comment_automation: {
    ruleType: 'comment_automation',
    displayName: 'Comment Automation',
    category: 'Instagram',
    triggerEvent: 'comment_event',
    allowedNodes: ['trigger', 'condition', 'action', 'giveaway_config', 'reward'],
    nodeDefinitions: {
      trigger: TRIGGER_FIELDS(false, false),
      condition: CONDITION_FIELDS(true),
      action: ACTION_FIELDS(true)
    }
  },
  dm_automation: {
    ruleType: 'dm_automation',
    displayName: 'DM Automation',
    category: 'Instagram',
    triggerEvent: 'dm_event',
    allowedNodes: ['trigger', 'condition', 'action'],
    nodeDefinitions: {
      trigger: TRIGGER_FIELDS(true, false),
      condition: CONDITION_FIELDS(true),
      action: ACTION_FIELDS(false)
    }
  },
  giveaway_comment: {
    ruleType: 'giveaway_comment',
    displayName: 'Giveaway (Comment)',
    category: 'Giveaways',
    triggerEvent: 'comment_event',
    allowedNodes: ['trigger', 'condition', 'giveaway_config', 'reward'],
    nodeDefinitions: {
      trigger: TRIGGER_FIELDS(false, false),
      condition: CONDITION_FIELDS(true),
      giveaway_config: GIVEAWAY_FIELDS,
      reward: REWARD_FIELDS
    }
  },
  product_inquiry_comment: {
    ruleType: 'product_inquiry_comment',
    displayName: 'Product Inquiry (Comment)',
    category: 'Ecommerce',
    triggerEvent: 'comment_event',
    allowedNodes: ['trigger', 'condition', 'action'],
    nodeDefinitions: {
      trigger: TRIGGER_FIELDS(false, false),
      condition: CONDITION_FIELDS(true),
      action: ACTION_FIELDS(true)
    }
  },
  product_inquiry_story: {
    ruleType: 'product_inquiry_story',
    displayName: 'Product Inquiry (Story)',
    category: 'Ecommerce',
    triggerEvent: 'story_reply',
    allowedNodes: ['trigger', 'condition', 'action'],
    nodeDefinitions: {
      trigger: TRIGGER_FIELDS(false, true),
      condition: CONDITION_FIELDS(true),
      action: ACTION_FIELDS(true)
    }
  },
  product_inquiry_dm: {
    ruleType: 'product_inquiry_dm',
    displayName: 'Product Inquiry (DM)',
    category: 'Ecommerce',
    triggerEvent: 'dm_event',
    allowedNodes: ['trigger', 'condition', 'action'],
    nodeDefinitions: {
      trigger: TRIGGER_FIELDS(true, false),
      condition: CONDITION_FIELDS(true),
      action: ACTION_FIELDS(false)
    }
  },
  story_automation: {
    ruleType: 'story_automation',
    displayName: 'Story Automation',
    category: 'Instagram',
    triggerEvent: 'story_reply',
    allowedNodes: ['trigger', 'condition', 'action'],
    nodeDefinitions: {
      trigger: TRIGGER_FIELDS(false, true),
      condition: CONDITION_FIELDS(true),
      action: ACTION_FIELDS(true)
    }
  },
  giveaway_dm: {
    ruleType: 'giveaway_dm',
    displayName: 'Giveaway (DM)',
    category: 'Giveaways',
    triggerEvent: 'dm_event',
    allowedNodes: ['trigger', 'condition', 'giveaway_config', 'reward'],
    nodeDefinitions: {
      trigger: TRIGGER_FIELDS(true, false),
      condition: CONDITION_FIELDS(true),
      giveaway_config: GIVEAWAY_FIELDS,
      reward: REWARD_FIELDS
    }
  }
};

export const TEMPLATE_OVERRIDES: Record<string, {
  hiddenFields?: Record<string, string[]>;
  readOnlyFields?: Record<string, string[]>;
}> = {
  // Case 1: Comment → Reply + Plain Text DM
  "1": {
    hiddenFields: {
      trigger: [],
      condition: ["follower_gate", "follower_gate_messages"],
      action: ["action_type", "message_mode", "dm_format", "url_allowlist", "linked_product_id", "retry", "rate_limit_scope", "rate_limit_limit", "rate_limit_window_seconds", "retry_delay_seconds", "fallback_action", "fallback_messages"]
    }
  },
  // Case 2: Comment → Quick Reply Size Picker
  "2": {
    hiddenFields: {
      condition: ["follower_gate", "follower_gate_messages"],
      action: ["action_type", "message_mode", "dm_format", "url_allowlist", "linked_product_id", "button_template_text", "button_template_buttons_json", "generic_template_elements_json", "retry", "rate_limit_scope", "rate_limit_limit", "rate_limit_window_seconds", "retry_delay_seconds", "fallback_action", "fallback_messages"]
    }
  },
  // Case 3: Comment → Product Carousel DM
  "3": {
    hiddenFields: {
      condition: ["follower_gate", "follower_gate_messages"],
      action: ["action_type", "message_mode", "dm_format", "quick_reply_text", "quick_replies_titles", "button_template_text", "button_template_buttons_json", "retry", "rate_limit_scope", "rate_limit_limit", "rate_limit_window_seconds", "retry_delay_seconds", "fallback_action", "fallback_messages"]
    }
  },
  // Case 4: DM → Button Template (welcome menu)
  "4": {
    hiddenFields: {
      trigger: ["target_mode", "media_ids"],
      condition: ["follower_gate", "follower_gate_messages"],
      action: ["action_type", "message_mode", "dm_format", "quick_reply_text", "quick_replies_titles", "generic_template_elements_json", "linked_product_id", "retry", "rate_limit_scope", "rate_limit_limit", "rate_limit_window_seconds", "retry_delay_seconds", "fallback_action", "fallback_messages"]
    }
  },
  // Case 5: Story Reply → Plain DM (flash sale)
  "5": {
    hiddenFields: {
      condition: ["follower_gate", "follower_gate_messages"],
      action: ["action_type", "message_mode", "dm_format", "quick_reply_text", "quick_replies_titles", "button_template_text", "button_template_buttons_json", "generic_template_elements_json", "linked_product_id", "retry", "rate_limit_scope", "rate_limit_limit", "rate_limit_window_seconds", "retry_delay_seconds", "fallback_action", "fallback_messages"]
    }
  },
  // Case 6: Story Reply → Product Carousel (follower gate)
  "6": {
    hiddenFields: {
      condition: ["match_type", "keywords", "keywords_equals"],
      action: ["action_type", "message_mode", "dm_format", "quick_reply_text", "quick_replies_titles", "button_template_text", "button_template_buttons_json", "retry", "rate_limit_scope", "rate_limit_limit", "rate_limit_window_seconds", "retry_delay_seconds", "fallback_action", "fallback_messages"]
    }
  },
  // Case 7: Any DM → Welcome Auto Reply
  "7": {
    hiddenFields: {
      trigger: ["target_mode", "media_ids"],
      condition: ["match_type", "keywords", "keywords_equals", "follower_gate", "follower_gate_messages"],
      action: ["action_type", "message_mode", "dm_format", "quick_reply_text", "quick_replies_titles", "button_template_text", "button_template_buttons_json", "generic_template_elements_json", "linked_product_id", "retry", "rate_limit_scope", "rate_limit_limit", "rate_limit_window_seconds", "retry_delay_seconds", "fallback_action", "fallback_messages"]
    }
  },
  // Case 8: DM "catalog" → Multi-product Carousel
  "8": {
    hiddenFields: {
      trigger: ["target_mode", "media_ids"],
      condition: ["follower_gate", "follower_gate_messages"],
      action: ["action_type", "message_mode", "dm_format", "quick_reply_text", "quick_replies_titles", "button_template_text", "button_template_buttons_json", "linked_product_id", "retry", "rate_limit_scope", "rate_limit_limit", "rate_limit_window_seconds", "retry_delay_seconds", "fallback_action", "fallback_messages"]
    }
  },
  // Case 9: Followers-Only Discount Code
  "9": {
    hiddenFields: {
      action: ["action_type", "message_mode", "dm_format", "quick_reply_text", "quick_replies_titles", "button_template_text", "button_template_buttons_json", "generic_template_elements_json", "linked_product_id", "retry", "rate_limit_scope", "rate_limit_limit", "rate_limit_window_seconds", "retry_delay_seconds", "fallback_action", "fallback_messages"]
    }
  },
  // Case 10: Giveaway — Classic Random Winner
  "10": {
    hiddenFields: {
      giveaway_config: ["selection_method", "scoring_weights_json", "ai_model", "ai_factors", "gamification_enabled", "spin_wheel_enabled", "spin_wheel_base_url", "spin_wheel_single_use", "spin_wheel_url_mode", "spin_token_expiry_hours"],
      action: ["action_type", "message_mode", "dm_format", "quick_reply_text", "quick_replies_titles", "button_template_text", "button_template_buttons_json", "generic_template_elements_json", "linked_product_id", "retry", "rate_limit_scope", "rate_limit_limit", "rate_limit_window_seconds", "retry_delay_seconds", "fallback_action", "fallback_messages"]
    }
  },
  // Case 11: Giveaway — Most Engaged Fan Wins
  "11": {
    hiddenFields: {
      condition: ["match_type", "keywords", "keywords_equals"],
      giveaway_config: ["selection_method", "ai_model", "ai_factors", "gamification_enabled", "spin_wheel_enabled", "spin_wheel_base_url", "spin_wheel_single_use", "spin_wheel_url_mode", "spin_token_expiry_hours"],
      action: ["action_type", "message_mode", "dm_format", "quick_reply_text", "quick_replies_titles", "button_template_text", "button_template_buttons_json", "generic_template_elements_json", "linked_product_id", "retry", "rate_limit_scope", "rate_limit_limit", "rate_limit_window_seconds", "retry_delay_seconds", "fallback_action", "fallback_messages"]
    }
  },
  // Case 12: Giveaway — AI Ranked Best Comment Wins
  "12": {
    hiddenFields: {
      condition: ["match_type", "keywords", "keywords_equals"],
      giveaway_config: ["selection_method", "scoring_weights_json", "gamification_enabled", "spin_wheel_enabled", "spin_wheel_base_url", "spin_wheel_single_use", "spin_wheel_url_mode", "spin_token_expiry_hours"],
      action: ["action_type", "message_mode", "dm_format", "quick_reply_text", "quick_replies_titles", "button_template_text", "button_template_buttons_json", "generic_template_elements_json", "linked_product_id", "retry", "rate_limit_scope", "rate_limit_limit", "rate_limit_window_seconds", "retry_delay_seconds", "fallback_action", "fallback_messages"]
    }
  },
  // Case 13: Flash Giveaway — First Commenter
  "13": {
    hiddenFields: {
      giveaway_config: ["selection_method", "scoring_weights_json", "ai_model", "ai_factors", "gamification_enabled", "spin_wheel_enabled", "spin_wheel_base_url", "spin_wheel_single_use", "spin_wheel_url_mode", "spin_token_expiry_hours"],
      action: ["action_type", "message_mode", "dm_format", "quick_reply_text", "quick_replies_titles", "button_template_text", "button_template_buttons_json", "generic_template_elements_json", "linked_product_id", "retry", "rate_limit_scope", "rate_limit_limit", "rate_limit_window_seconds", "retry_delay_seconds", "fallback_action", "fallback_messages"]
    }
  },
  // Case 14: Top 3 Multi-Winner Campaign
  "14": {
    hiddenFields: {
      condition: ["match_type", "keywords", "keywords_equals"],
      giveaway_config: ["selection_method", "scoring_weights_json", "gamification_enabled", "spin_wheel_enabled", "spin_wheel_base_url", "spin_wheel_single_use", "spin_wheel_url_mode", "spin_token_expiry_hours"],
      action: ["action_type", "message_mode", "dm_format", "quick_reply_text", "quick_replies_titles", "button_template_text", "button_template_buttons_json", "generic_template_elements_json", "linked_product_id", "retry", "rate_limit_scope", "rate_limit_limit", "rate_limit_window_seconds", "retry_delay_seconds", "fallback_action", "fallback_messages"]
    }
  },
  // Case 15: Spin Wheel Gamification
  "15": {
    hiddenFields: {
      giveaway_config: ["selection_method", "scoring_weights_json", "ai_model", "ai_factors"],
      action: ["action_type", "message_mode", "dm_format", "quick_reply_text", "quick_replies_titles", "button_template_text", "button_template_buttons_json", "generic_template_elements_json", "linked_product_id", "retry", "rate_limit_scope", "rate_limit_limit", "rate_limit_window_seconds", "retry_delay_seconds", "fallback_action", "fallback_messages"]
    }
  },
  // Case 16: DM Entry Private Giveaway
  "16": {
    hiddenFields: {
      trigger: ["target_mode", "media_ids"],
      giveaway_config: ["selection_method", "scoring_weights_json", "ai_model", "ai_factors", "gamification_enabled", "spin_wheel_enabled", "spin_wheel_base_url", "spin_wheel_single_use", "spin_wheel_url_mode", "spin_token_expiry_hours"],
      action: ["action_type", "message_mode", "dm_format", "quick_reply_text", "quick_replies_titles", "button_template_text", "button_template_buttons_json", "generic_template_elements_json", "linked_product_id", "retry", "rate_limit_scope", "rate_limit_limit", "rate_limit_window_seconds", "retry_delay_seconds", "fallback_action", "fallback_messages"]
    }
  },
  // Case 17: Weighted Hybrid Random
  "17": {
    hiddenFields: {
      condition: ["match_type", "keywords", "keywords_equals"],
      giveaway_config: ["selection_method", "ai_model", "ai_factors", "gamification_enabled", "spin_wheel_enabled", "spin_wheel_base_url", "spin_wheel_single_use", "spin_wheel_url_mode", "spin_token_expiry_hours"],
      action: ["action_type", "message_mode", "dm_format", "quick_reply_text", "quick_replies_titles", "button_template_text", "button_template_buttons_json", "generic_template_elements_json", "linked_product_id", "retry", "rate_limit_scope", "rate_limit_limit", "rate_limit_window_seconds", "retry_delay_seconds", "fallback_action", "fallback_messages"]
    }
  },
  // Case 18: 2-Hour Flash Sale Automation
  "18": {
    hiddenFields: {
      action: ["action_type", "message_mode", "dm_format", "quick_reply_text", "quick_replies_titles", "generic_template_elements_json", "linked_product_id", "retry", "rate_limit_scope", "rate_limit_limit", "rate_limit_window_seconds", "retry_delay_seconds", "fallback_action", "fallback_messages"]
    }
  },
  // Case 19: Specific Reel Product Inquiry (shoes)
  "19": {
    hiddenFields: {
      condition: ["follower_gate", "follower_gate_messages"],
      action: ["action_type", "message_mode", "dm_format", "quick_reply_text", "quick_replies_titles", "button_template_text", "button_template_buttons_json", "retry", "rate_limit_scope", "rate_limit_limit", "rate_limit_window_seconds", "retry_delay_seconds", "fallback_action", "fallback_messages"]
    }
  },
  // Case 20: Comment Marathon — Most Active Wins
  "20": {
    hiddenFields: {
      condition: ["match_type", "keywords", "keywords_equals"],
      giveaway_config: ["selection_method", "ai_model", "ai_factors", "gamification_enabled", "spin_wheel_enabled", "spin_wheel_base_url", "spin_wheel_single_use", "spin_wheel_url_mode", "spin_token_expiry_hours"],
      action: ["action_type", "message_mode", "dm_format", "quick_reply_text", "quick_replies_titles", "button_template_text", "button_template_buttons_json", "generic_template_elements_json", "linked_product_id", "retry", "rate_limit_scope", "rate_limit_limit", "rate_limit_window_seconds", "retry_delay_seconds", "fallback_action", "fallback_messages"]
    }
  }
};
