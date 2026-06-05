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

  // Build the Rule object
  const rulePayload: any = {
    name: flow.name,
    rule_type: ruleType,
    _trigger_event_derived: triggerEvent,
    status: 'active',
    priority: 50,
    stop_on_match: true,
    target: {
      mode: triggerNode.data.target_mode || 'every',
      media_ids: triggerNode.data.media_ids || [],
      media_type: ruleType.includes('story') ? 'story' : (ruleType.includes('dm') ? null : 'reel_or_post'),
    },
    condition: {
      match_type: conditionNode?.data.match_type || 'any',
      keywords: conditionNode?.data.keywords || [],
    },
    deduplication: {
      enabled: triggerNode.data.deduplication === true,
      window_seconds: 86400,
      unique_per: ['user_id', ruleType.includes('dm') ? 'rule_id' : 'media_id']
    },
    follower_gate: {
      enabled: conditionNode?.data.follower_gate === true,
      messages: conditionNode?.data.follower_gate ? ['Follow us first!'] : []
    },
    schedule: { start_at: null, end_at: null }
  };

  const payload: any = {
    _case: flow.name,
    campaign_id: null,
    rule: rulePayload,
    actions: [],
  };

  // Build Actions
  if (actionNodes.length > 0) {
    actionNodes.forEach((an, index) => {
      payload.actions.push({
        order: index + 1,
        action_type: an.data.action_type || 'reply_comment',
        message_mode: an.data.message_mode || 'fixed',
        messages: an.data.messages || [],
        dm_format: an.data.dm_format || 'text',
        // placeholder for templates if present
        button_template_payload: an.data.dm_format === 'button_template' ? { text: 'Placeholder', buttons: [] } : undefined,
        rate_limit: { scope: 'user', limit: 1, window_seconds: 86400 }
      });
    });
  }

  // Build Giveaway config if present
  if (giveawayNode) {
    payload.giveaway_config = {
      selection_method: giveawayNode.data.selection_method || 'random',
      winner_count: giveawayNode.data.winner_count || 1,
      finalize_at: giveawayNode.data.finalize_at || null,
      anti_fraud_enabled: true,
      reward_delivery_methods: ["direct_dm"]
    };

    // find reward connected to giveaway
    const rewardEdge = flow.edges.find(e => e.source === giveawayNode!.id);
    if (rewardEdge) {
      const rewardNode = flow.nodes.find(n => n.id === rewardEdge.target && n.type === 'reward');
      if (rewardNode) {
        payload.reward_pool = [{
          reward_id: `r_${Date.now()}`,
          reward_type: rewardNode.data.reward_type || 'physical',
          value: rewardNode.data.value || 'Reward',
          quantity: rewardNode.data.quantity || 1
        }];
      }
    }
  }

  return payload;
}
