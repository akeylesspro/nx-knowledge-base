"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

type SearchInputProps = {
    defaultValue?: string;
    placeholder?: string;
    className?: string;
};

export const SearchInput = ({ defaultValue = "", placeholder = "Search documentation...", className }: SearchInputProps) => {
    const router = useRouter();
    const [value, setValue] = useState(defaultValue);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (!value.trim()) return;
            router.push(`/search?q=${encodeURIComponent(value.trim())}`);
        },
        [value, router]
    );

    return (
        <form onSubmit={handleSubmit} className={className}>
            <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
                <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} className="pl-10 bg-card" />
            </div>
        </form>
    );
};
