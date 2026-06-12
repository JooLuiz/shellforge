import PrettyIcons from "js-pretty-icons";
import { memo } from "react";
import {
  Handle,
  Position,
  type NodeProps,
  type NodeTypes,
} from "reactflow";
import type {
  BlockGroupNodeData,
  InsertFlowNodeData,
  StepFlowNodeData,
} from "../../types";
import { IFELSE_LANE_KEYS, TRYCATCH_LANE_KEYS } from "../../utils/flowLayout";
import { formatActionTypeLabel } from "../../utils/formatActionTypeLabel";

const HIDDEN_HANDLE_STYLE = {
  width: "8px",
  height: "8px",
  opacity: 0,
  border: 0,
  background: "transparent",
  pointerEvents: "none",
} as const;

function StepFlowNode({ data }: NodeProps<StepFlowNodeData>): JSX.Element {
  const hasSummary = data.summary.trim().length > 0;
  const severityClassName =
    data.validationSeverity === "error"
      ? " custom-flow-step-node--error"
      : data.validationSeverity === "warning"
        ? " custom-flow-step-node--warning"
        : "";

  return (
    <div
      className={`custom-flow-step-node${hasSummary ? "" : " custom-flow-step-node--compact"}${severityClassName}`}
      role="presentation"
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        style={HIDDEN_HANDLE_STYLE}
      />
      <div className="custom-flow-step-title">{data.title}</div>
      {hasSummary ? <div className="custom-flow-step-summary">{data.summary}</div> : null}
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
      <PrettyIcons
        icon="plus"
        width={16}
        height={16}
        color="currentColor"
        className="custom-flow-insert-icon"
        aria-hidden
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        style={HIDDEN_HANDLE_STYLE}
      />
    </div>
  );
}

function BlockGroupNode({ data }: NodeProps<BlockGroupNodeData>): JSX.Element {
  const isTryCatch = data.actionKey === "tryCatch";
  const isIfElse = data.actionKey === "ifElse";
  const laneKeys = isTryCatch
    ? TRYCATCH_LANE_KEYS
    : isIfElse
      ? IFELSE_LANE_KEYS
      : null;
  const severityClassName =
    data.validationSeverity === "error"
      ? " custom-flow-block-group-node--error"
      : data.validationSeverity === "warning"
        ? " custom-flow-block-group-node--warning"
        : "";

  return (
    <div
      className={`custom-flow-block-group-node${severityClassName}`}
      role="presentation"
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        style={HIDDEN_HANDLE_STYLE}
      />

      <div className="custom-flow-block-group-header">
        <span className="custom-flow-block-group-title">
          {formatActionTypeLabel(data.actionKey)}
        </span>
        {laneKeys !== null && (
          <div className="custom-flow-block-group-lanes">
            {laneKeys.map((laneKey) => (
              <span key={laneKey} className="custom-flow-block-lane-label">
                {laneKey}
              </span>
            ))}
          </div>
        )}
      </div>

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
  blockGroupNode: memo(BlockGroupNode),
};
