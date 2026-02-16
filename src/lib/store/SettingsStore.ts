"use client";
import { create } from "zustand";
import { createSelectors, setState, socketServiceInstance } from "akeyless-client-commons/helpers";
import { isBrowser } from "@/lib/helpers/global";
import { SetState } from "akeyless-client-commons/types";

interface SettingsStoreType {
    currentLanguage: "he" | "en";
    setCurrentLanguage: SetState<"he" | "en">;
    isRtl: boolean;
    direction: "ltr" | "rtl";
    setDirection: (updater?: any) => void;
    isTranslationInitialized: boolean;
    setIsTranslationInitialized: SetState<boolean>;
}

const initialDirection = (): "ltr" | "rtl" => {
    const lang = isBrowser() ? (localStorage.getItem("lang") as "he" | "en" | null) : null;
    if (lang) {
        return lang == "he" ? "rtl" : "ltr";
    }

    return "rtl";
};
const initialLang = (): "he" | "en" => {
    const lang = isBrowser() ? (localStorage.getItem("lang") as "he" | "en" | null) : null;
    if (lang) {
        return lang;
    }
    return "he";
};
const initialIsRtl = (): boolean => {
    const lang = isBrowser() ? (localStorage.getItem("lang") as "he" | "en" | null) : null;
    if (lang) {
        return lang == "he" ? true : false;
    }

    return true;
};

export const SettingsStoreBase = create<SettingsStoreType>((set, get) => ({
    currentLanguage: initialLang(),
    setCurrentLanguage: (updater) => setState(updater, set, "currentLanguage"),
    isRtl: initialIsRtl(),
    direction: initialDirection(),
    isTranslationInitialized: false,
    setIsTranslationInitialized: (updater) => setState(updater, set, "isTranslationInitialized"),
    setDirection: (updater) =>
        set((state) => {
            const newDirection = typeof updater === "function" ? updater(state.direction) : updater;
            return {
                direction: newDirection,
                currentLanguage: newDirection === "rtl" ? "he" : "en",
                isRtl: newDirection === "rtl",
            };
        }),
}));

export const useSettingsStore = createSelectors<SettingsStoreType>(SettingsStoreBase);
