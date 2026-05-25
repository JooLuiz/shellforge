import { memo } from "react";
import {
  Handle,
  Position,
  type NodeProps,
  type NodeTypes,
} from "reactflow";

export interface StepFlowNodeData {
  title: string;
  summary: string;
}

export interface InsertFlowNodeData {
  ariaLabel: string;
}

const HIDDEN_HANDLE_STYLE = {
  width: "8px",
  height: "8px",
  opacity: 0,
  border: 0,
  background: "transparent",
  pointerEvents: "none",
} as const;

function StepFlowNode({ data }: NodeProps<StepFlowNodeData>): JSX.Element {
  return (
    <div className="custom-flow-step-node" role="presentation">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        style={HIDDEN_HANDLE_STYLE}
      />
      <div className="custom-flow-step-title">{data.title}</div>
      <div className="custom-flow-step-summary">{data.summary}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        style={HIDDEN_HANDLE_STYLE}
      />
    </div>
  );
}

function InsertFlowNode({ data }: NodeProps<InsertFlowNodeData>): JSX.Element {
  return (
    <div className="custom-flow-insert-node" role="presentation" aria-label={data.ariaLabel}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        style={HIDDEN_HANDLE_STYLE}
      />
      <svg
        viewBox="0 0 16 16"
        className="custom-flow-insert-icon"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      </svg>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        style={HIDDEN_HANDLE_STYLE}
      />
    </div>
  );
}

export const customActionFlowNodeTypes: NodeTypes = {
  stepNode: memo(StepFlowNode),
  insertNode: memo(InsertFlowNode),
};
