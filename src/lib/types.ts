export type NodeType = 'trigger' | 'condition' | 'action' | 'giveaway_config' | 'reward';

export interface NodeFieldDefinition {
  name: string;
  label: string;
  type: 'select' | 'text' | 'keywords' | 'switch' | 'number' | 'datetime' | 'resource_picker' | 'message_list' | 'textarea';
  resourceType?: 'media' | 'story' | 'products' | 'templates' | 'campaigns' | 'giveaways' | 'discount_codes';
  options?: { label: string; value: string | number | boolean }[];
  validation?: { required?: boolean; min?: number; max?: number };
  dependsOn?: { field: string; value: any };
  placeholder?: string;
  helperText?: string;
}

export interface AutomationTypeManifest {
  ruleType: string;
  displayName: string;
  category: 'Instagram' | 'Giveaways' | 'Ecommerce' | 'Support';
  triggerEvent: string;
  allowedNodes: NodeType[];
  nodeDefinitions: Partial<Record<NodeType, NodeFieldDefinition[]>>;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: Record<string, any>;
  ruleType?: string; // Links back to the specific Manifest
  templateId?: string; // Links back to the specific template case
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
}

export interface FlowState {
  id: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedNodeId: string | null;
  selectedNodeRect?: { top: number; left: number; width: number; height: number } | null;
  mediaPicker?: {
    isOpen: boolean;
    nodeId: string;
    fieldKey: string;
    resourceType: 'media' | 'story';
  } | null;
  past?: { name: string; nodes: FlowNode[]; edges: FlowEdge[] }[];
  future?: { name: string; nodes: FlowNode[]; edges: FlowEdge[] }[];
  lastEdit?: { id: string; key: string } | null;
}
