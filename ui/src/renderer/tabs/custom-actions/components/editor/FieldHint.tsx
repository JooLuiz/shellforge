interface FieldHintProps {
  hint?: string;
  example?: string;
}

export function FieldHint({ hint, example }: FieldHintProps): JSX.Element | null {
  if (!hint && !example) return null;
  return (
    <span className="field-hint-block">
      {hint && <span className="field-hint">{hint}</span>}
      {example && <code className="field-example">e.g. {example}</code>}
    </span>
  );
}
