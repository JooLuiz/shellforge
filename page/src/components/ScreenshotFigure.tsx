import { useState } from "react";

import { useTranslation } from "../i18n";

type ScreenshotFigureProps = {
  src: string;
  alt: string;
  caption?: string;
};

const ScreenshotFigure = ({ src, alt, caption }: ScreenshotFigureProps) => {
  const { t } = useTranslation();
  const [hasError, setHasError] = useState(false);

  return (
    <figure className="screenshot-figure">
      {hasError ? (
        <div className="screenshot-placeholder" role="img" aria-label={alt}>
          <p>{t.common.screenshotPlaceholder}</p>
          <code>{src}</code>
        </div>
      ) : (
        <img src={src} alt={alt} loading="lazy" onError={() => setHasError(true)} />
      )}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
};

export default ScreenshotFigure;
