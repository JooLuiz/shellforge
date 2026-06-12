import { useEffect } from "react";

import { siteMeta } from "../constants/siteMeta";

type PageMetaProps = {
  title: string;
  description?: string;
};

const PageMeta = ({ title, description }: PageMetaProps) => {
  useEffect(() => {
    document.title = `${title} | ${siteMeta.siteTitle}`;

    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", description);
      }
    }
  }, [title, description]);

  return null;
};

export default PageMeta;
