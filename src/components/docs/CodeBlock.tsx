"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { TranslatedText } from "@/components/i18n";

type CodeBlockProps = {
    code: string;
    title?: string;
    language?: string;
    variant?: "default" | "incorrect";
    whyIncorrect?: string;
};

export const CodeBlock = ({ code, title, language = "typescript", variant = "default", whyIncorrect }: CodeBlockProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{direction: "ltr"}} className={cn("rounded-lg border overflow-hidden", variant === "incorrect" ? "border-destructive/50" : "border-border")}>
            {title && (
                <div className={cn("px-4 py-2 text-sm font-medium flex items-center justify-between", variant === "incorrect" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground")}>
                    <span className="flex items-center gap-2">
                        {variant === "incorrect" && <i className="fa-solid fa-triangle-exclamation text-xs" />}
                        {title}
                    </span>
                    <button onClick={handleCopy} className="text-xs hover:text-foreground transition-colors cursor-pointer">
                        {copied ? (
                            <span className="flex items-center gap-1">
                                <i className="fa-solid fa-check" /> <TranslatedText tKey="docs.copied" />
                            </span>
                        ) : (
                            <span className="flex items-center gap-1">
                                <i className="fa-regular fa-copy" /> <TranslatedText tKey="docs.copy" />
                            </span>
                        )}
                    </button>
                </div>
            )}
            <pre className="p-4 overflow-x-auto bg-card text-sm leading-relaxed">
                <code className={`language-${language}`}>{code}</code>
            </pre>
            {whyIncorrect && (
                <div className="px-4 py-2 bg-destructive/5 border-t border-destructive/20 text-sm text-destructive">
                    <strong><TranslatedText tKey="docs.why_incorrect" />:</strong> {whyIncorrect}
                </div>
            )}
        </div>
    );
};
