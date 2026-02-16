"use client";

import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { useSettingsStore } from "@/lib/store";
import { Button } from "../ui/button";

export const LanguageSwitcher = () => {
    const { t, i18n: i18nInstance } = useTranslation();
    const setCurrentLanguage = useSettingsStore.setCurrentLanguage();
    const currentLang = useSettingsStore.currentLanguage()

    const handleChange = (lang: "he" | "en") => {
        if (lang === currentLang) return;
        localStorage.setItem("lang", lang);
        setCurrentLanguage(lang);
        i18n.changeLanguage(lang);
    };

    return (
        <div className="flex items-center">
            <Button
                onClick={() => handleChange(currentLang === "he" ? "en" : "he")}
                className=""
            >
                {currentLang === "he" ? t("english", { lng: "en" }) : t("hebrew", { lng: "he" })}
            </Button>
        </div>
    );
};
