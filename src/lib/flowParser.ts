import { FlowState, FlowNode } from './types';
import { AUTOMATION_MANIFESTS } from './manifest';

export function serializeFlowToDatabase(flow: FlowState): any {
  // 1. Find the trigger node
  const triggerNode = flow.nodes.find(n => n.type === 'trigger');
  if (!triggerNode) return null;

  const ruleType = triggerNode.ruleType || 'comment_automation';
  const manifest = AUTOMATION_MANIFESTS[ruleType];
  const triggerEvent = manifest?.triggerEvent || 'comment_event';

  // 2. Find condition node connected to trigger
  let conditionNode: FlowNode | undefined;
  const triggerOutEdge = flow.edges.find(e => e.source === triggerNode.id);
  if (triggerOutEdge) {
    conditionNode = flow.nodes.find(n => n.id === triggerOutEdge.target && n.type === 'condition');
  }

  // 3. Find target nodes (Action or Giveaway config)
  let actionNodes: FlowNode[] = [];
  let giveawayNode: FlowNode | undefined;
  
  if (conditionNode) {
    const conditionOutEdges = flow.edges.filter(e => e.source === conditionNode!.id);
    for (const edge of conditionOutEdges) {
      const targetNode = flow.nodes.find(n => n.id === edge.target);
      if (targetNode?.type === 'action') {
        actionNodes.push(targetNode);
      } else if (targetNode?.type === 'giveaway_config') {
        giveawayNode = targetNode;
      }
    }
  }

  // Handle unique_per array formatting
  let uniquePer = triggerNode.data.deduplication_unique_per;
  if (typeof uniquePer === 'string') {
    uniquePer = (uniquePer as string).split(',').map(s => s.trim()).filter(Boolean);
  }
  if (!uniquePer || !Array.isArray(uniquePer)) {
    uniquePer = ['user_id', ruleType.includes('dm') ? 'rule_id' : 'media_id'];
  }

  // Build the Rule object
  const rulePayload: any = {
    name: flow.name,
    rule_type: ruleType,
    _trigger_event_derived: triggerEvent,
    status: triggerNode.data.status || 'active',
    priority: Number(triggerNode.data.priority ?? 50),
    stop_on_match: triggerNode.data.stop_on_match !== false,
    target: {
      mode: triggerNode.data.target_mode || triggerNode.data.target?.mode || 'every',
      media_ids: triggerNode.data.media_ids || triggerNode.data.target?.media_ids || [],
      media_type: triggerNode.data.target_media_type || triggerNode.data.target?.media_type || (ruleType.includes('story') ? 'story' : (ruleType.includes('dm') ? null : 'reel_or_post')),
    },
    condition: {
      match_type: conditionNode?.data.match_type || 'any',
      keywords: conditionNode?.data.keywords || conditionNode?.data.keywords_equals || []
    },
    deduplication: {
      enabled: triggerNode.data.deduplication !== false,
      window_seconds: Number(triggerNode.data.deduplication_window_seconds ?? 86400),
      unique_per: uniquePer
    },
    follower_gate: {
      enabled: conditionNode?.data.follower_gate === true,
      messages: conditionNode?.data.follower_gate_messages || (conditionNode?.data.gate_msgs) || []
    },
    schedule: { 
      start_at: null, 
      end_at: null 
    }
  };

  const campaignId = triggerNode.data.campaign_id || flow.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `campaign-${flow.id}`;

  const payload: any = {
    _case: flow.name,
    campaign_id: campaignId,
    campaign: {
      name: flow.name + " Campaign",
      campaign_id: campaignId,
      status: 'active',
      timezone: triggerNode.data.timezone || 'UTC',
      global_rate_limit: triggerNode.data.global_rate_limit_limit ? {
        scope: 'global',
        limit: Number(triggerNode.data.global_rate_limit_limit),
        window_seconds: Number(triggerNode.data.global_rate_limit_window_seconds ?? 86400)
      } : {},
      start_at: triggerNode.data.start_at || null,
      end_at: triggerNode.data.end_at || null
    },
    rule: rulePayload,
    actions: [],
  };

  // Build Actions
  if (actionNodes.length > 0) {
    // Sort action nodes based on position (vertical coordinate first, then horizontal coordinate)
    actionNodes.sort((a, b) => a.position.y - b.position.y);
    
    actionNodes.forEach((an, index) => {
      const actionItem: any = {
        order: index + 1,
        action_type: an.data.action_type || 'reply_comment',
        message_mode: an.data.message_mode || 'random',
        messages: an.data.messages || [],
        rate_limit: {
          scope: an.data.rate_limit_scope || an.data.rate_limit?.scope || 'user',
          limit: Number(an.data.rate_limit_limit ?? an.data.rate_limit?.limit ?? 1),
          window_seconds: Number(an.data.rate_limit_window_seconds ?? an.data.rate_limit?.window_seconds ?? 86400)
        },
        on_fail: {
          retry: Number(an.data.retry ?? an.data.on_fail?.retry ?? 2),
          retry_delay_seconds: Number(an.data.retry_delay_seconds ?? an.data.on_fail?.retry_delay_seconds ?? 30),
          fallback_action: an.data.fallback_action && an.data.fallback_action !== 'None' ? an.data.fallback_action : null,
          fallback_messages: an.data.fallback_messages || []
        }
      };

      if (actionItem.action_type === 'send_dm') {
        const format = an.data.dm_format || 'text';
        actionItem.dm_format = format;

        if (format === 'quick_reply') {
          const titles = an.data.quick_replies_titles || [];
          const quick_replies = titles.map((title: string) => ({
            content_type: 'text',
            title: title,
            payload: `SELECT_${title.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`
          }));
          actionItem.quick_reply_payload = {
            quick_reply_text: an.data.quick_reply_text || 'Pick your option:',
            quick_replies
          };
        } else if (format === 'button_template') {
          let buttons = [];
          if (typeof an.data.button_template_buttons_json === 'string') {
            try {
              buttons = JSON.parse(an.data.button_template_buttons_json);
            } catch (e) {
              console.warn("Invalid buttons JSON in action", an.id);
            }
          } else if (Array.isArray(an.data.button_template_buttons_json)) {
            buttons = an.data.button_template_buttons_json;
          } else if (an.data.button_template_payload?.buttons) {
            buttons = an.data.button_template_payload.buttons;
          }
          actionItem.button_template_payload = {
            text: an.data.button_template_text || 'What would you like to do?',
            buttons
          };
        } else if (format === 'generic_template') {
          let elements = [];
          if (typeof an.data.generic_template_elements_json === 'string') {
            try {
              elements = JSON.parse(an.data.generic_template_elements_json);
            } catch (e) {
              console.warn("Invalid generic template JSON in action", an.id);
            }
          } else if (Array.isArray(an.data.generic_template_elements_json)) {
            elements = an.data.generic_template_elements_json;
          } else if (an.data.generic_template_payload?.elements) {
            elements = an.data.generic_template_payload.elements;
          }
          actionItem.generic_template_payload = { elements };
        } else if (format === 'attachment') {
          actionItem.attachments = an.data.attachments || [];
        }

        if (an.data.url_allowlist) {
          actionItem.url_allowlist = an.data.url_allowlist;
        }
        if (an.data.linked_product_id) {
          actionItem.linked_product_id = Number(an.data.linked_product_id);
        }
      }

      payload.actions.push(actionItem);
    });
  }

  // Build Giveaway config if present
  if (giveawayNode) {
    let scoringWeights = {};
    if (typeof giveawayNode.data.scoring_weights_json === 'string' && giveawayNode.data.scoring_weights_json.trim()) {
      try {
        scoringWeights = JSON.parse(giveawayNode.data.scoring_weights_json);
      } catch (e) {
        console.warn("Invalid scoring weights JSON");
      }
    } else if (giveawayNode.data.scoring_weights_json) {
      scoringWeights = giveawayNode.data.scoring_weights_json;
    } else if (giveawayNode.data.weights) {
      scoringWeights = giveawayNode.data.weights;
    }

    let antiFraudFilters = giveawayNode.data.anti_fraud_filters || {};
    if (giveawayNode.data.anti_fraud) {
      antiFraudFilters = {
        min_account_age_days: Number(giveawayNode.data.anti_fraud.age_days ?? 30),
        min_followers: Number(giveawayNode.data.anti_fraud.followers ?? 0),
        block_duplicate_ips: giveawayNode.data.anti_fraud.block_duplicate_ips === true
      };
    } else {
      antiFraudFilters = {
        min_account_age_days: Number(giveawayNode.data.min_account_age_days ?? 30),
        min_followers: Number(giveawayNode.data.min_followers ?? 0),
        block_duplicate_ips: giveawayNode.data.block_duplicate_ips === true,
        block_private_accounts: giveawayNode.data.block_private_accounts === true
      };
    }

    payload.giveaway_config = {
      selection_method: giveawayNode.data.selection_method || giveawayNode.data.method || 'random',
      winner_count: Number(giveawayNode.data.winner_count ?? giveawayNode.data.winners ?? 1),
      evaluation_window_seconds: Number(giveawayNode.data.evaluation_window_seconds ?? 604800),
      finalize_at: giveawayNode.data.finalize_at || null,
      data_snapshot_at: giveawayNode.data.data_snapshot_at || null,
      re_evaluation_allowed: giveawayNode.data.re_evaluation_allowed === true,
      re_evaluation_max: Number(giveawayNode.data.re_evaluation_max ?? 0),
      anti_fraud_enabled: giveawayNode.data.anti_fraud_enabled !== false,
      anti_fraud_filters: antiFraudFilters,
      gamification_enabled: giveawayNode.data.gamification_enabled === true || !!giveawayNode.data.gamification?.enabled,
      spin_wheel_enabled: giveawayNode.data.spin_wheel_enabled === true || !!giveawayNode.data.gamification?.spinWheel,
      reward_delivery_methods: giveawayNode.data.reward_delivery_methods || giveawayNode.data.delivery || ["direct_dm"]
    };

    if (payload.giveaway_config.spin_wheel_enabled) {
      payload.giveaway_config.spin_wheel_base_url = giveawayNode.data.spin_wheel_base_url || giveawayNode.data.gamification?.baseUrl || null;
      payload.giveaway_config.spin_wheel_single_use = giveawayNode.data.spin_wheel_single_use !== false;
      payload.giveaway_config.spin_wheel_url_mode = giveawayNode.data.spin_wheel_url_mode || giveawayNode.data.gamification?.urlMode || 'signed_token';
      payload.giveaway_config.spin_token_expiry_hours = Number(giveawayNode.data.spin_token_expiry_hours ?? giveawayNode.data.gamification?.expiryHours ?? 48);
    }

    if (Object.keys(scoringWeights).length > 0) {
      payload.giveaway_config.scoring_weights = scoringWeights;
    }

    if (giveawayNode.data.ai_model) {
      payload.giveaway_config.ai_model = giveawayNode.data.ai_model;
    }
    if (giveawayNode.data.ai_factors) {
      payload.giveaway_config.ai_factors = giveawayNode.data.ai_factors;
    }

    // find all rewards connected to giveaway
    const rewardEdges = flow.edges.filter(e => e.source === giveawayNode!.id);
    payload.reward_pool = [];
    rewardEdges.forEach(edge => {
      const rewardNode = flow.nodes.find(n => n.id === edge.target && n.type === 'reward');
      if (rewardNode) {
        payload.reward_pool.push({
          reward_id: rewardNode.data.reward_id || rewardNode.data.id || `r_${Math.random().toString(36).substring(2, 9)}`,
          reward_type: rewardNode.data.reward_type || rewardNode.data.type || 'physical',
          value: rewardNode.data.value || rewardNode.data.val || 'Reward',
          quantity: Number(rewardNode.data.quantity ?? rewardNode.data.qty ?? 1)
        });
      }
    });

    // winner actions from winner message
    const winnerMsgs = giveawayNode.data.winner_messages || giveawayNode.data.winnerActions?.[0]?.msgs;
    if (winnerMsgs && winnerMsgs.length > 0) {
      payload.winner_actions = [{
        action_type: 'send_dm',
        dm_format: 'text',
        messages: winnerMsgs,
        on_fail: {
          retry: 3,
          retry_delay_seconds: 300,
          fallback_action: null,
          fallback_messages: []
        }
      }];
    }
  }

  return payload;
}
