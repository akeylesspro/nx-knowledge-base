import Link from "next/link";
import type { KnowledgeBaseSchema } from "@/types/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TranslatedText } from "@/components/i18n";
import { SymbolCard } from "./SymbolCard";
import { DependencyList } from "./DependencyList";
import { ExportsList } from "./ExportsList";
import { DocBreadcrumb } from "./DocBreadcrumb";

type DocViewerProps = {
    doc: KnowledgeBaseSchema;
    repoName: string;
};

const confidenceColors: Record<string, string> = {
    high: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-red-100 text-red-800",
};

export const DocViewer = ({ doc, repoName }: DocViewerProps) => {
    return (
        <div className="max-w-4xl mx-auto py-8 px-6 space-y-8">
            {/* Breadcrumb */}
            <DocBreadcrumb repoName={repoName} filePath={doc.source.file_path} />

            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">{doc.file_name}</h1>
                    <Badge className={confidenceColors[doc.quality.generation_confidence]}>{doc.quality.generation_confidence} <TranslatedText tKey="docs.confidence" /></Badge>
                    <Badge variant="outline">{doc.source.language}</Badge>
                    {doc.source.framework_tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                            {tag}
                        </Badge>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-4 flex-wrap">
                    <span>
                        {doc.source.file_path} · <TranslatedText tKey="docs.generated_from_commit" />{" "}
                        <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{doc.source.commit_sha.slice(0, 7)}</code>
                    </span>
                    <Link href={`/api/v1/docs/${repoName}/${doc.source.file_path}`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="h-7 gap-1.5">
                            <i className="fa-solid fa-plug text-[10px]" />
                            <TranslatedText tKey="docs.api_request" />
                        </Button>
                    </Link>
                </p>
            </div>

            {/* Summary */}
            <section>
                <h2 className="text-lg font-semibold mb-3"><TranslatedText tKey="docs.summary" /></h2>
                <div className="bg-card rounded-xl border border-border p-5 space-y-3">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1"><TranslatedText tKey="docs.purpose" /></h3>
                        <p className="text-foreground">{doc.summary.purpose}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1"><TranslatedText tKey="docs.problem_solved" /></h3>
                        <p className="text-foreground">{doc.summary.problem_solved}</p>
                    </div>
                </div>
            </section>

            <Separator />

            {/* Exports */}
            <section >
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <TranslatedText tKey="docs.exports" />
                    <Badge variant="outline">{doc.exports.length}</Badge>
                </h2>
                <ExportsList exports={doc.exports} />
            </section>

            <Separator />

            {/* Dependencies */}
            <section>
                <h2 className="text-lg font-semibold mb-3"><TranslatedText tKey="docs.dependencies" /></h2>
                <DependencyList dependencies={doc.dependencies} />
            </section>

            <Separator />

            {/* Symbols */}
            <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TranslatedText tKey="docs.symbols" />
                    <Badge variant="outline">{doc.symbols.length}</Badge>
                </h2>
                <div className="space-y-6">
                    {doc.symbols.map((symbol, index) => (
                        <SymbolCard
                            key={symbol.symbol_id ?? (symbol as { id?: string }).id ?? `symbol-${index}`}
                            symbol={symbol}
                            repoName={repoName}
                            fileLinkToGithub={doc.source.link_to_github}
                        />
                    ))}
                </div>
            </section>

            {/* Swagger/API Endpoints */}
            {doc.swagger && doc.swagger.covered_endpoints.length > 0 && (
                <>
                    <Separator />
                    <section>
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <TranslatedText tKey="docs.api_endpoints" />
                            <Badge variant="outline">{doc.swagger.covered_endpoints.length}</Badge>
                        </h2>
                        <div className="space-y-2">
                            {doc.swagger.covered_endpoints.map((endpoint) => (
                                <div key={`${endpoint.method}-${endpoint.path}`} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                                    <Badge className={getMethodColor(endpoint.method)}>{endpoint.method}</Badge>
                                    <code className="font-mono text-sm">{endpoint.path}</code>
                                    <span className="text-sm text-muted-foreground ml-auto">{endpoint.operation_id}</span>
                                    <Badge className={confidenceColors[endpoint.confidence]} variant="outline">
                                        {endpoint.confidence}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}

            {/* Quality / Gaps */}
            {doc.quality.known_gaps && doc.quality.known_gaps.length > 0 && (
                <>
                    <Separator />
                    <section>
                        <h2 className="text-lg font-semibold mb-3"><TranslatedText tKey="docs.known_gaps" /></h2>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {doc.quality.known_gaps.map((gap, i) => (
                                <li key={i}>{gap}</li>
                            ))}
                        </ul>
                    </section>
                </>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>
                    <TranslatedText tKey="docs.generated" /> {new Date(doc.source.generated_at_iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    {doc.quality.last_reviewed_by && <> · <TranslatedText tKey="docs.reviewed_by" /> {doc.quality.last_reviewed_by}</>}
                </span>
                <div className="flex gap-3">
                    <a href={doc.source.link_to_github} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                        <i className="fa-brands fa-github" /> <TranslatedText tKey="docs.open_on_github" />
                    </a>
                </div>
            </div>
        </div>
    );
};

const getMethodColor = (method: string): string => {
    const colors: Record<string, string> = {
        GET: "bg-green-100 text-green-800",
        POST: "bg-blue-100 text-blue-800",
        PUT: "bg-orange-100 text-orange-800",
        PATCH: "bg-yellow-100 text-yellow-800",
        DELETE: "bg-red-100 text-red-800",
        OPTIONS: "bg-gray-100 text-gray-800",
        HEAD: "bg-gray-100 text-gray-800",
    };
    return colors[method] || "bg-gray-100 text-gray-800";
};
