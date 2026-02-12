import type { FileSymbol } from "@/types/schema";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "./CodeBlock";

type FlexSymbol = FileSymbol & { id?: string; description?: string; line?: number };

type SymbolCardProps = {
    symbol: FlexSymbol;
    repoName: string;
    fileLinkToGithub?: string;
};

const kindColors: Record<string, string> = {
    function: "bg-blue-100 text-blue-800",
    class: "bg-purple-100 text-purple-800",
    component: "bg-green-100 text-green-800",
    interface: "bg-yellow-100 text-yellow-800",
    type: "bg-orange-100 text-orange-800",
    enum: "bg-pink-100 text-pink-800",
    value: "bg-gray-100 text-gray-800",
    constant: "bg-teal-100 text-teal-800",
};

export const SymbolCard = ({ symbol, fileLinkToGithub }: SymbolCardProps) => {
    const symbolId = symbol.symbol_id ?? symbol.id;
    const description = symbol.description_one_line ?? symbol.description ?? "";
    const githubPermalink = symbol.locations?.github_permalink ?? (fileLinkToGithub && symbol.line ? `${fileLinkToGithub}#L${symbol.line}` : undefined);
    const sideEffects = normalizeStringList(symbol.details?.side_effects);
    const errorCases = normalizeErrorCases(symbol.details?.error_cases);
    const whatItDoes = symbol.details?.what_it_does ?? symbol.details?.rendered_ui_description;

    return (
        <div id={symbolId} className="border border-border rounded-xl bg-card p-6 scroll-mt-24">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <Badge className={kindColors[symbol.kind] || "bg-gray-100 text-gray-800"}>{symbol.kind}</Badge>
                    <h3 className="text-lg font-semibold font-mono">{symbol.name}</h3>
                </div>
                {githubPermalink && (
                    <a href={githubPermalink} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                        <i className="fa-brands fa-github" /> View on GitHub
                    </a>
                )}
            </div>

            {description && <p className="text-muted-foreground mb-4">{description}</p>}

            {/* Signature */}
            {symbol.signature && (
                <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 text-foreground">Signature</h4>
                    {symbol.signature.params && symbol.signature.params.length > 0 && (
                        <div className="mb-3">
                            <h5 className="text-xs font-medium text-muted-foreground mb-1">Parameters</h5>
                            <div className="space-y-1">
                                {symbol.signature.params.map((param) => (
                                    <div key={param.name} className="flex items-start gap-2 text-sm pl-3">
                                        <code className="font-mono text-primary shrink-0">{param.name}</code>
                                        <span className="text-muted-foreground shrink-0">
                                            : <code className="font-mono">{param.type}</code>
                                        </span>
                                        {!param.required && <Badge variant="outline" className="text-[10px] px-1 py-0">optional</Badge>}
                                        <span className="text-muted-foreground">— {param.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {symbol.signature.returns && (
                        <div className="text-sm pl-3">
                            <span className="text-muted-foreground">Returns: </span>
                            <code className="font-mono text-primary">{symbol.signature.returns.type}</code>
                            <span className="text-muted-foreground"> — {symbol.signature.returns.description}</span>
                        </div>
                    )}
                </div>
            )}

            <Separator className="my-4" />

            {/* Details */}
            {whatItDoes && (
                <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 text-foreground">What it does</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{whatItDoes}</p>
                </div>
            )}

            {/* Side effects */}
            {sideEffects.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 text-foreground">Side Effects</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {sideEffects.map((effect, i) => (
                            <li key={i}>{effect}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Error cases */}
            {errorCases.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 text-foreground">Error Cases</h4>
                    <div className="space-y-2">
                        {errorCases.map((ec, i) => (
                            <div key={i} className="text-sm pl-3 border-l-2 border-destructive/30">
                                <p className="font-medium text-foreground">{ec.condition}</p>
                                <p className="text-muted-foreground">{ec.behavior}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Class methods */}
            {symbol.details?.methods && symbol.details.methods.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 text-foreground">Methods</h4>
                    <div className="space-y-3">
                        {symbol.details.methods.map((method) => (
                            <div key={method.name} className="pl-3 border-l-2 border-primary/30">
                                <code className="font-mono text-sm font-medium text-primary">{method.name}</code>
                                <p className="text-sm text-muted-foreground">{method.description_one_line}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rendered UI description */}
            {symbol.details?.rendered_ui_description && (
                <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 text-foreground">Rendered UI</h4>
                    <p className="text-sm text-muted-foreground">{symbol.details.rendered_ui_description}</p>
                </div>
            )}

            {/* Code examples */}
            {symbol.examples && (
                <>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-foreground">Examples</h4>
                        {symbol.examples.minimal_correct && <CodeBlock title={symbol.examples.minimal_correct.title} code={symbol.examples.minimal_correct.code} />}
                        {symbol.examples.extensive_correct && <CodeBlock title={symbol.examples.extensive_correct.title} code={symbol.examples.extensive_correct.code} />}
                        {symbol.examples.incorrect && <CodeBlock title={symbol.examples.incorrect.title} code={symbol.examples.incorrect.code} variant="incorrect" whyIncorrect={symbol.examples.incorrect.why_incorrect} />}
                    </div>
                </>
            )}

            {/* Source location */}
            {(symbol.locations || symbol.line != null) && (
                <div className="mt-4 pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                        {symbol.locations
                            ? `Lines ${symbol.locations.source_line_start}–${symbol.locations.source_line_end}`
                            : `Line ${symbol.line}`}
                    </p>
                </div>
            )}
        </div>
    );
};

const normalizeStringList = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }

    if (typeof value === "string" && value.trim().length > 0) {
        return [value];
    }

    if (value && typeof value === "object") {
        return Object.values(value)
            .filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }

    return [];
};

type ErrorCase = {
    condition: string;
    behavior: string;
};

const normalizeErrorCases = (value: unknown): ErrorCase[] => {
    if (Array.isArray(value)) {
        return value
            .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
            .map((item) => ({
                condition: typeof item.condition === "string" ? item.condition : "",
                behavior: typeof item.behavior === "string" ? item.behavior : "",
            }))
            .filter((item) => item.condition.length > 0 || item.behavior.length > 0);
    }

    if (value && typeof value === "object") {
        const asRecord = value as Record<string, unknown>;
        const condition = typeof asRecord.condition === "string" ? asRecord.condition : "";
        const behavior = typeof asRecord.behavior === "string" ? asRecord.behavior : "";

        if (condition.length > 0 || behavior.length > 0) {
            return [{ condition, behavior }];
        }
    }

    return [];
};
