import { useState } from "react";

import { useTranslation } from "../i18n";

type CopyButtonProps = {
  value: string;
  label: string;
};

const CopyButton = ({ value, label }: CopyButtonProps) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      className="copy-button"
      onClick={handleCopy}
      aria-label={`Copy ${label}`}
    >
      {copied ? t.common.copied : t.common.copy}
    </button>
  );
};

export default CopyButton;
