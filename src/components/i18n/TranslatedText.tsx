"use client";

import { useTranslation } from "react-i18next";

type TranslatedTextProps = {
    tKey: string;
    values?: Record<string, string | number>;
    fallback?: string;
};

export const TranslatedText = ({ tKey, values, fallback }: TranslatedTextProps) => {
    const { t } = useTranslation();
    return <>{t(tKey, { ...values, defaultValue: fallback })}</>;
};
