import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/** Keeps the page language and the meta description in sync with the interface language. */
export function useDocumentLanguage() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const description = t("app.metaDescription");

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.append(meta);
    }
    meta.content = description;
  }, [description]);
}
