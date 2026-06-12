export const IF_ELSE_OPERATORS = ["eq", "gt", "gte", "lt", "lte", "exists"] as const;

export type IfElseOperator = (typeof IF_ELSE_OPERATORS)[number];

export const IF_ELSE_OPERATOR_LABELS: Record<IfElseOperator, string> = {
  eq: "Equals to",
  gt: "Greater than",
  gte: "Greater or equals to",
  lt: "Less than",
  lte: "Less or equal to",
  exists: "Exists",
};

export function isIfElseOperator(value: string): value is IfElseOperator {
  return (IF_ELSE_OPERATORS as readonly string[]).includes(value);
}
