"use client";

import React, { useState, useEffect } from "react";
import { Topbar } from "@/components/builder/Topbar";
import { LeftSidebar } from "@/components/builder/LeftSidebar";
import { Canvas } from "@/components/builder/Canvas";
import { RightSidebar } from "@/components/builder/RightSidebar";
import { InstagramMediaPicker } from "@/components/builder/InstagramMediaPicker";
import DMContentEditor from "@/components/builder/DMContentEditor";
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

  useEffect(() => {
    if (flowId) {
      const loadFlow = async () => {
        try {
          const res = await api.get(`/automations/${flowId}/`);
          if (res.data && res.data.visual_data) {
            dispatch(setFlow({
              id: res.data.id,
              name: res.data.name,
              nodes: res.data.visual_data.nodes || [],
              edges: res.data.visual_data.edges || [],
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
      dispatch(setFlow({
        id: `node-f-${Date.now()}`,
        name: 'New Automation Flow',
        nodes: [],
        edges: [],
        selectedNodeId: null,
        mediaPicker: null
      }));
    }
  }, [flowId, dispatch]);

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
      }
    } else {
      lastAutoOpenedNodeIdRef.current = null;
    }
  }, [selectedNodeId, selectedNode?.id, selectedNode?.type, selectedNode?.data?.action_type, selectedNode?.ruleType]);

  useEffect(() => {
    const handleOpenEditor = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.nodeId) {
        setActiveEditNodeId(customEvent.detail.nodeId);
      }
    };
    window.addEventListener('open-dm-format-editor', handleOpenEditor);
    return () => window.removeEventListener('open-dm-format-editor', handleOpenEditor);
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
        {activeEditNodeId && (
          <DMContentEditor
            nodeId={activeEditNodeId}
            onClose={() => {
              setActiveEditNodeId(null);
              dispatch(selectNode(null));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

