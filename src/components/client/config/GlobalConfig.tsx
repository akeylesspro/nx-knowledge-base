"use client";
import { useSafeEffect } from "akeyless-client-commons/hooks";
import i18n from "@/i18n";
import { AppLoader, QaBadge } from "../";
import { Version } from "akeyless-client-commons/components";
import packageJson from "../../../../package.json";
import { useSettingsStore } from "@/lib/store";
export function GlobalConfig() {
    useInitTranslation();
    return (
        <>
            <Version version={packageJson.version} className="bottom-1 right-1 fixed" />
            <QaBadge />
        </>
    );
}

export const TranslationWarper = ({ children }: { children: React.ReactNode }) => {
    const isTranslationInitialized = useSettingsStore.isTranslationInitialized();
    return isTranslationInitialized ? <>{children}</> : <AppLoader />;
};

const useInitTranslation = () => {
    const setIsTranslationInitialized = useSettingsStore.setIsTranslationInitialized();

    useSafeEffect(() => {
        const storedLang = localStorage?.getItem("lang") || "he";
        if (!i18n.isInitialized) {
            const handleInitialized = () => {
                setIsTranslationInitialized(true);
                i18n.off("initialized", handleInitialized);
                i18n.changeLanguage(storedLang);
            };
            i18n.on("initialized", handleInitialized);
        } else {
            i18n.changeLanguage(storedLang);
        }
    }, []);
};
