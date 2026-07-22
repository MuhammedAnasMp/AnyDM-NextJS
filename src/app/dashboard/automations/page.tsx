"use client";

import React, { useState, useEffect } from "react";
import { Topbar } from "@/components/builder/Topbar";
import { LeftSidebar } from "@/components/builder/LeftSidebar";
import { Canvas } from "@/components/builder/Canvas";
import { RightSidebar } from "@/components/builder/RightSidebar";
import { InstagramMediaPicker } from "@/components/builder/InstagramMediaPicker";
import DMContentEditor from "@/components/builder/DMContentEditor";
import WelcomeContentEditor from "@/components/builder/WelcomeContentEditor";
import ConditionContentEditor from "@/components/builder/ConditionContentEditor";
import TriggerContentEditor from "@/components/builder/TriggerContentEditor";
import { AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { closeMediaPicker, updateNodeData, selectNode, setFlow } from "@/store/slices/flowSlice";
import { useSearchParams } from "next/navigation";
import api from "@/lib/services/api.service";

export default function BuilderPage() {
  const dispatch = useDispatch();
  const [showPreview, setShowPreview] = useState(true);
  const searchParams = useSearchParams();
  const flowId = searchParams.get('id');

  useEffect(() => {
    const saved = localStorage.getItem("showPreview");
    if (saved !== null) {
      setShowPreview(saved === "true");
    }
  }, []);

  const appUser = useSelector((state: RootState) => state.auth.user);
  const activeAccountId = appUser?.active_instagram_account_id;

  useEffect(() => {
    if (flowId) {
      const loadFlow = async () => {
        try {
          const res = await api.get(`/automations/${flowId}/`);
          if (res.data && res.data.visual_data) {
            let name = res.data.name;
            let nodesList = res.data.visual_data.nodes || [];
            let edgesList = res.data.visual_data.edges || [];

            // ... (existing sanitization and welcome flow sync logic below)
            // Sanitize nodes list: if any action node has configured data, set is_placeholder to false
            nodesList = nodesList.map((node: any) => {
              if (node.type === 'action') {
                const d = node.data || {};
                const hasConfiguredData =
                  (d.messages && d.messages.length > 0) ||
                  (d.dm_format && d.dm_format !== 'text') ||
                  (d.quick_replies_titles && d.quick_replies_titles.length > 0) ||
                  (d.button_template_buttons_json && String(d.button_template_buttons_json).trim() !== '') ||
                  (d.generic_template_elements_json && String(d.generic_template_elements_json).trim() !== '') ||
                  (d.action_type && d.action_type !== 'send_dm');
                if (hasConfiguredData) {
                  return {
                    ...node,
                    data: {
                      ...d,
                      is_placeholder: false
                    }
                  };
                }
              }
              return node;
            });

            // Check if it's a welcome profile flow that needs synchronization
            const isIcebreakers = name === "Welcome Message Flow";
            const isMenu = name === "Persistent Menu Flow";

            if ((isIcebreakers || isMenu) && activeAccountId) {
              let welcomePromptVal = "Tap to send a question suggested by us";
              let iceBreakersList: any[] = [];
              let persistentMenuList: any[] = [];
              let composerDisabled = false;

              // 1. Try Cache
              const cacheKey = `anydm_welcome_settings_${activeAccountId}`;
              const cached = localStorage.getItem(cacheKey);
              if (cached) {
                try {
                  const data = JSON.parse(cached);
                  welcomePromptVal = data.welcomePrompt || welcomePromptVal;
                  iceBreakersList = data.iceBreakers || [];
                  persistentMenuList = data.persistentMenuItems || [];
                  composerDisabled = data.composerInputDisabled || false;
                } catch (e) {
                  console.error("Error parsing cached welcome settings:", e);
                }
              }

              // 2. Fetch from APIs as fallback
              if (isIcebreakers && iceBreakersList.length === 0) {
                try {
                  const apiRes = await api.get(`/crm/messenger-profile/ice-breakers/?account_id=${activeAccountId}`);
                  if (apiRes.data && Array.isArray(apiRes.data.ice_breakers)) {
                    iceBreakersList = apiRes.data.ice_breakers;
                  }
                } catch (e) {
                  console.error("Error fetching icebreakers from API:", e);
                }
              } else if (isMenu && persistentMenuList.length === 0) {
                try {
                  const apiRes = await api.get(`/crm/messenger-profile/persistent-menu/?account_id=${activeAccountId}`);
                  if (apiRes.data && Array.isArray(apiRes.data.persistent_menu)) {
                    const menu = apiRes.data.persistent_menu[0] || {};
                    persistentMenuList = menu.call_to_actions || [];
                    composerDisabled = menu.composer_input_disabled || false;
                  }
                } catch (e) {
                  console.error("Error fetching persistent menu from API:", e);
                }
              }

              // If nodesList is empty (newly created automation), auto-generate trigger node
              if (nodesList.length === 0) {
                const triggerId = `node-t-${Date.now()}`;
                const triggerData: any = isIcebreakers
                  ? { is_icebreaker_trigger: true, welcome_prompt: welcomePromptVal, icebreakers: iceBreakersList }
                  : { is_menu_trigger: true, composer_input_disabled: composerDisabled, persistent_menu_items: persistentMenuList };
                nodesList = [{ id: triggerId, type: 'trigger', position: { x: 100, y: 200 }, data: triggerData, ruleType: 'dm_automation' }];

                const activeEvents = isIcebreakers
                  ? iceBreakersList.filter((ib: any) => ib.question && ib.payload).map((ib: any) => ({ payload: ib.payload, label: ib.question }))
                  : persistentMenuList.filter((item: any) => item.type === 'postback' && item.title && item.payload).map((item: any) => ({ payload: item.payload, label: item.title }));

                activeEvents.forEach((ae: any, idx: number) => {
                  const actionId = `node-a-${Date.now()}-${idx}`;
                  nodesList.push({
                    id: actionId,
                    type: 'action',
                    position: { x: 600, y: 50 + idx * 250 },
                    ruleType: 'dm_automation',
                    data: {
                      action_type: 'send_dm',
                      dm_format: 'text',
                      message_mode: 'fixed',
                      messages: [`Hello! Customize this reply for: "${ae.label}"`],
                      parent_event: ae.payload,
                      parent_label: ae.label
                    }
                  });
                  edgesList.push({
                    id: `edge-${Date.now()}-${idx}`,
                    source: triggerId,
                    target: actionId,
                    label: ae.label
                  });
                });
              } else {
                // Update the trigger node data in-place
                nodesList = nodesList.map((n: any) => {
                  if (n.type === 'trigger') {
                    if (isIcebreakers) {
                      return { ...n, ruleType: 'dm_automation', data: { ...n.data, is_icebreaker_trigger: true, welcome_prompt: welcomePromptVal, icebreakers: iceBreakersList } };
                    } else {
                      return { ...n, ruleType: 'dm_automation', data: { ...n.data, is_menu_trigger: true, composer_input_disabled: composerDisabled, persistent_menu_items: persistentMenuList } };
                    }
                  }
                  return n;
                });
              }
            }

            dispatch(setFlow({
              id: res.data.id,
              name: res.data.name,
              nodes: nodesList,
              edges: edgesList,
              selectedNodeId: null,
              mediaPicker: null
            }));
          } else if (res.data) {
            // Automation exists but has no visual_data yet (newly created)
            // Dispatch with empty nodes so Canvas screenshotFlow doesn't hijack
            dispatch(setFlow({
              id: res.data.id,
              name: res.data.name,
              nodes: [],
              edges: [],
              selectedNodeId: null,
              mediaPicker: null
            }));
          }
        } catch (err) {
          console.error("Error loading automation:", err);
        }
      };
      loadFlow();
    } else {
      const newPayload = searchParams.get('new_payload');
      const flowType = searchParams.get('flow_type');
      if (newPayload && flowType && activeAccountId) {
        const initializeWelcomeFlow = async () => {
          let welcomePromptVal = "Tap to send a question suggested by us";
          let iceBreakersList: any[] = [];
          let persistentMenuList: any[] = [];
          let composerDisabled = false;

          // 1. Try Local Cache first
          const cacheKey = `anydm_welcome_settings_${activeAccountId}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            try {
              const data = JSON.parse(cached);
              welcomePromptVal = data.welcomePrompt || welcomePromptVal;
              iceBreakersList = data.iceBreakers || [];
              persistentMenuList = data.persistentMenuItems || [];
              composerDisabled = data.composerInputDisabled || false;
            } catch (e) {
              console.error("Error parsing cached welcome settings:", e);
            }
          }

          // 2. Fall back to fetch from APIs if cache was empty
          if (flowType === 'icebreakers' && iceBreakersList.length === 0) {
            try {
              const res = await api.get(`/crm/messenger-profile/ice-breakers/?account_id=${activeAccountId}`);
              if (res.data && Array.isArray(res.data.ice_breakers)) {
                iceBreakersList = res.data.ice_breakers;
              }
            } catch (e) {
              console.error("Error fetching icebreakers from API:", e);
            }
          } else if (flowType === 'persistent_menu' && persistentMenuList.length === 0) {
            try {
              const res = await api.get(`/crm/messenger-profile/persistent-menu/?account_id=${activeAccountId}`);
              if (res.data && Array.isArray(res.data.persistent_menu)) {
                const menu = res.data.persistent_menu[0] || {};
                persistentMenuList = menu.call_to_actions || [];
                composerDisabled = menu.composer_input_disabled || false;
              }
            } catch (e) {
              console.error("Error fetching persistent menu from API:", e);
            }
          }

          // Build trigger node, action nodes, and labeled edges
          const triggerId = `node-t-${Date.now()}`;
          const nodesList: any[] = [];
          const edgesList: any[] = [];

          if (flowType === 'icebreakers') {
            nodesList.push({
              id: triggerId,
              type: 'trigger',
              position: { x: 100, y: 150 },
              ruleType: 'dm_automation',
              data: {
                is_icebreaker_trigger: true,
                welcome_prompt: welcomePromptVal,
                icebreakers: iceBreakersList
              }
            });

            // Create action reply node for each question that has a postback payload
            iceBreakersList.forEach((ib, idx) => {
              if (ib.question && ib.payload) {
                const actionId = `node-a-${Date.now()}-${idx}`;
                nodesList.push({
                  id: actionId,
                  type: 'action',
                  position: { x: 600, y: 50 + idx * 250 },
                  ruleType: 'dm_automation',
                  data: {
                    action_type: 'send_dm',
                    is_placeholder: true,
                    parent_event: ib.payload,
                    parent_label: ib.question
                  }
                });
                edgesList.push({
                  id: `edge-${Date.now()}-${idx}`,
                  source: triggerId,
                  target: actionId,
                  label: ib.question
                });
              }
            });
          } else {
            // persistent_menu
            nodesList.push({
              id: triggerId,
              type: 'trigger',
              position: { x: 100, y: 150 },
              ruleType: 'dm_automation',
              data: {
                is_menu_trigger: true,
                composer_input_disabled: composerDisabled,
                persistent_menu_items: persistentMenuList
              }
            });

            // Create action reply node for each postback button option
            let actionIdx = 0;
            persistentMenuList.forEach((item, idx) => {
              if (item.type === 'postback' && item.title && item.payload) {
                if (item.payload === 'TRACK_ORDER') {
                  const promptId = `${triggerId}-track-prompt`;
                  const inputId = `${triggerId}-track-input`;
                  const responseId = `${triggerId}-track-response`;

                  nodesList.push({
                    id: promptId,
                    type: 'action',
                    position: { x: 550, y: 450 + actionIdx * 250 },
                    ruleType: 'dm_automation',
                    data: {
                      action_type: 'send_dm',
                      dm_format: 'text',
                      messages: ["Please reply with your Order ID to track your order. 📦"],
                      parent_event: 'TRACK_ORDER',
                      parent_label: item.title,
                      is_track_prompt: true
                    }
                  });

                  nodesList.push({
                    id: inputId,
                    type: 'action',
                    position: { x: 900, y: 450 + actionIdx * 250 },
                    ruleType: 'dm_automation',
                    data: {
                      action_type: 'send_dm',
                      dm_format: 'text',
                      messages: ["Customer replies with Order ID"],
                      parent_event: 'TRACK_ORDER',
                      parent_label: item.title,
                      is_track_input: true
                    }
                  });

                  nodesList.push({
                    id: responseId,
                    type: 'action',
                    position: { x: 1250, y: 450 + actionIdx * 250 },
                    ruleType: 'dm_automation',
                    data: {
                      action_type: 'send_dm',
                      dm_format: 'text',
                      messages: ["Returns Live status details"],
                      parent_event: 'TRACK_ORDER',
                      parent_label: item.title,
                      is_track_response: true
                    }
                  });

                  edgesList.push({
                    id: `edge-${triggerId}-prompt`,
                    source: triggerId,
                    target: promptId,
                    label: item.title
                  });

                  edgesList.push({
                    id: `edge-prompt-input-${actionIdx}`,
                    source: promptId,
                    target: inputId,
                    label: "Awaiting DM"
                  });

                  edgesList.push({
                    id: `edge-input-response-${actionIdx}`,
                    source: inputId,
                    target: responseId,
                    label: "Send Response"
                  });
                } else {
                  const actionId = `node-a-${Date.now()}-${idx}`;
                  nodesList.push({
                    id: actionId,
                    type: 'action',
                    position: { x: 600, y: 50 + actionIdx * 250 },
                    ruleType: 'dm_automation',
                    data: {
                      action_type: 'send_dm',
                      is_placeholder: true,
                      parent_event: item.payload,
                      parent_label: item.title
                    }
                  });
                  edgesList.push({
                    id: `edge-${Date.now()}-${idx}`,
                    source: triggerId,
                    target: actionId,
                    label: item.title
                  });
                }
                actionIdx++;
              }
            });
          }

          dispatch(setFlow({
            id: `node-f-${Date.now()}`,
            name: flowType === 'icebreakers' ? "Welcome Message Flow" : "Persistent Menu Flow",
            nodes: nodesList,
            edges: edgesList,
            selectedNodeId: null,
            mediaPicker: null
          }));
        };

        initializeWelcomeFlow();
      } else if (searchParams.get('welcome')) {
        // Do nothing. Keep the client-side template flow that was just initialized/dispatched in Redux by Canvas.tsx
      } else {
        dispatch(setFlow({
          id: `node-f-${Date.now()}`,
          name: 'New Flow',
          nodes: [],
          edges: [],
          selectedNodeId: null,
          mediaPicker: null
        }));
      }
    }
  }, [flowId, dispatch, searchParams, activeAccountId]);

  const handleTogglePreview = () => {
    const nextVal = !showPreview;
    setShowPreview(nextVal);
    localStorage.setItem("showPreview", String(nextVal));
  };



  const [activeEditNodeId, setActiveEditNodeId] = useState<string | null>(null);
  const selectedNodeId = useSelector((state: RootState) => state.flow.selectedNodeId);
  const mediaPicker = useSelector((state: RootState) => state.flow.mediaPicker);
  const nodes = useSelector((state: RootState) => state.flow.nodes);

  const mediaPickerOpen = mediaPicker?.isOpen || false;
  const mediaPickerNodeId = mediaPicker?.nodeId || "";
  const mediaPickerFieldKey = mediaPicker?.fieldKey || "";
  const mediaPickerResourceType = mediaPicker?.resourceType || "media";

  const targetNode = nodes.find(n => n.id === mediaPickerNodeId);
  const selectedIds = targetNode?.data[mediaPickerFieldKey] || [];
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const lastAutoOpenedNodeIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (selectedNodeId) {
      if (selectedNode?.type === 'action' && selectedNode?.data?.action_type === 'send_dm') {
        const isEcommerceTemplate = !!(selectedNode.ruleType && selectedNode.ruleType.includes('product_inquiry'));
        if (isEcommerceTemplate && lastAutoOpenedNodeIdRef.current !== selectedNodeId) {
          lastAutoOpenedNodeIdRef.current = selectedNodeId;
          setActiveEditNodeId(selectedNodeId);
        }
      } else if (selectedNode?.type === 'trigger' && (selectedNode.data?.is_icebreaker_trigger || selectedNode.data?.is_menu_trigger)) {
        if (lastAutoOpenedNodeIdRef.current !== selectedNodeId) {
          lastAutoOpenedNodeIdRef.current = selectedNodeId;
          setActiveEditNodeId(selectedNodeId);
        }
      }
    } else {
      lastAutoOpenedNodeIdRef.current = null;
    }
  }, [selectedNodeId, selectedNode?.id, selectedNode?.type, selectedNode?.data?.action_type, selectedNode?.ruleType, selectedNode?.data?.is_icebreaker_trigger, selectedNode?.data?.is_menu_trigger]);

  useEffect(() => {
    const handleOpenEditor = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.nodeId) {
        setActiveEditNodeId(customEvent.detail.nodeId);
      }
    };
    window.addEventListener('open-dm-format-editor', handleOpenEditor);
    window.addEventListener('open-trigger-editor', handleOpenEditor);
    return () => {
      window.removeEventListener('open-dm-format-editor', handleOpenEditor);
      window.removeEventListener('open-trigger-editor', handleOpenEditor);
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative z-10">
      <Topbar
        onTogglePreview={handleTogglePreview}
        showPreview={showPreview}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <LeftSidebar />
        <Canvas />
        <AnimatePresence>
          {selectedNodeId && <RightSidebar />}
        </AnimatePresence>
      </div>

      <InstagramMediaPicker
        open={mediaPickerOpen}
        onClose={() => dispatch(closeMediaPicker())}
        onSelect={(ids, details) => {
          if (mediaPickerNodeId && mediaPickerFieldKey) {
            dispatch(updateNodeData({ id: mediaPickerNodeId, key: mediaPickerFieldKey, value: ids }));
            dispatch(updateNodeData({ id: mediaPickerNodeId, key: `${mediaPickerFieldKey}_details`, value: details }));
          }
        }}
        selectedIds={selectedIds}
        resourceType={mediaPickerResourceType}
      />

      <AnimatePresence>
        {activeEditNodeId && (() => {
          const activeEditNode = nodes.find(n => n.id === activeEditNodeId);
          const isActiveEditTrigger = activeEditNode?.type === 'trigger' && (activeEditNode.data?.is_icebreaker_trigger || activeEditNode.data?.is_menu_trigger);

          if (isActiveEditTrigger) {
            return (
              <WelcomeContentEditor
                nodeId={activeEditNodeId}
                onClose={() => {
                  setActiveEditNodeId(null);
                  dispatch(selectNode(null));
                }}
              />
            );
          }

          if (activeEditNode?.type === 'trigger') {
            return (
              <TriggerContentEditor
                nodeId={activeEditNodeId}
                onClose={() => {
                  setActiveEditNodeId(null);
                  dispatch(selectNode(null));
                }}
              />
            );
          }

          if (activeEditNode?.type === 'condition') {
            return (
              <ConditionContentEditor
                nodeId={activeEditNodeId}
                onClose={() => {
                  setActiveEditNodeId(null);
                  dispatch(selectNode(null));
                }}
              />
            );
          }

          return (
            <DMContentEditor
              nodeId={activeEditNodeId}
              onClose={() => {
                setActiveEditNodeId(null);
                dispatch(selectNode(null));
              }}
            />
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

