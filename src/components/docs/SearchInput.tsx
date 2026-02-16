"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";

import type { SearchSymbolKind } from "@/lib/docs/types";

type SearchInputProps = {
    defaultValue?: string;
    placeholder?: string;
    /** Translation key for placeholder (overrides placeholder when set) */
    placeholderKey?: string;
    className?: string;
    /** When on search page: preserve repo filter in URL */
    repo?: string;
    /** When on search page: preserve kind filter in URL */
    kind?: SearchSymbolKind;
    /** Show explicit Search button (useful on search page) */
    showButton?: boolean;
};

export const SearchInput = ({ defaultValue = "", placeholder, placeholderKey, className, repo, kind, showButton = false }: SearchInputProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const resolvedPlaceholder = placeholderKey ? t(placeholderKey) : (placeholder ?? t("app.search_placeholder"));
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue]);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (!value.trim()) return;
            const params = new URLSearchParams({ q: value.trim() });
            if (repo) params.set("repo", repo);
            if (kind) params.set("kind", kind);
            router.push(`/search?${params.toString()}`);
        },
        [value, repo, kind, router]
    );

    return (
        <form onSubmit={handleSubmit} className={className}>
            <div className={`relative ${showButton ? "flex gap-2" : ""}`}>
                <div className="relative flex-1">
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
                    <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={resolvedPlaceholder} className="pl-10 bg-card" />
                </div>
                {showButton && (
                    <button type="submit" className=" cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shrink-0">
                        {t("app.search_button")}
                    </button>
                )}
            </div>
        </form>
    );
};
