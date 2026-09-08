import { useTranslation as useI18nNextTranslation } from "react-i18next";

/**
 * A wrapper around react-i18next's `useTranslation` hook with care_token_display_fe
 * namespace pre-configured.
 */
export const useTranslation = () => {
  return useI18nNextTranslation("care_token_display_fe");
};
