import Link from "next/link";
import { searchDocs } from "@/lib/docs";
import { SearchInput } from "@/components/docs";
import { Badge } from "@/components/ui/badge";
import { TranslatedText } from "@/components/i18n";
import type { SearchSymbolKind } from "@/lib/docs/types";

type SearchPageProps = {
    searchParams: Promise<{ q?: string; repo?: string; page?: string; kind?: string }>;
};

const KIND_TABS: { value: SearchSymbolKind | null; labelKey: string }[] = [
    { value: null, labelKey: "app.filter_all" },
    { value: "function", labelKey: "app.filter_functions" },
    { value: "class", labelKey: "app.filter_classes" },
    { value: "component", labelKey: "app.filter_components" },
];

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { q = "", repo, page = "1", kind } = await searchParams;
    const currentKind = kind && KIND_TABS.some((t) => t.value === kind) ? (kind as SearchSymbolKind) : undefined;
    const currentPage = parseInt(page) || 1;
    const limit = 20;
    const offset = (currentPage - 1) * limit;

    const { results, total } = q.trim().length >= 2 ? await searchDocs({ query: q, repo, kind: currentKind, limit, offset }) : { results: [], total: 0 };

    const totalPages = Math.ceil(total / limit);

    const buildSearchUrl = (overrides: { page?: number; kind?: SearchSymbolKind | null }) => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (repo) params.set("repo", repo);
        if (overrides.page) params.set("page", String(overrides.page));
        if (overrides.kind !== undefined && overrides.kind !== null) params.set("kind", overrides.kind);
        return `/search?${params.toString()}`;
    };

    return (
        <div className="w-full h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto py-8 px-6">
                <h1 className="text-2xl font-bold mb-6"><TranslatedText tKey="app.search_title" /></h1>

                <SearchInput defaultValue={q} repo={repo} kind={currentKind} showButton className="mb-6" />

                <p className="text-xs text-muted-foreground mb-4">
                    <TranslatedText tKey="app.search_tip" />
                </p>

                {q && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {KIND_TABS.map((tab) => {
                            const isActive = (tab.value === null && !currentKind) || tab.value === currentKind;
                            const href = tab.value === null ? buildSearchUrl({ kind: null }) : buildSearchUrl({ kind: tab.value });
                            return (
                                <Link key={tab.labelKey} href={href} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                                    <TranslatedText tKey={tab.labelKey} />
                                </Link>
                            );
                        })}
                    </div>
                )}

                {q && (
                    <p className="text-sm text-muted-foreground mb-6">
                        {total > 0 ? (
                            <>
                                <TranslatedText tKey="app.found_results" values={{ count: total, query: q }} />
                                {currentKind && (
                                    <>
                                        {" "}
                                        <TranslatedText tKey="app.found_in_kind" values={{ kind: currentKind }} /> <Badge variant="outline" className="capitalize">{currentKind}s</Badge>
                                    </>
                                )}
                                {repo && (
                                    <>
                                        {currentKind ? " · " : " "}
                                        <TranslatedText tKey="app.found_in_repo" /> <Badge variant="outline">{repo}</Badge>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <TranslatedText tKey="app.no_results" values={{ query: q }} />
                                {currentKind && <> <TranslatedText tKey="app.no_results_in_kind" values={{ kind: currentKind }} /></>}
                            </>
                        )}
                    </p>
                )}

                {/* Results */}
                {results.length > 0 && (
                    <div className="space-y-3">
                        {results.map((result, i) => (
                            <Link key={`${result.link}-${i}`} href={result.link} className="block p-4 bg-card rounded-xl border border-border hover:shadow-md transition-shadow">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-[10px]">
                                        {result.repo}
                                    </Badge>
                                    {result.symbolKind && (
                                        <Badge variant="default" className="text-[10px] capitalize">
                                            {result.symbolKind}
                                        </Badge>
                                    )}
                                    <Badge variant="secondary" className="text-[10px]">
                                        {result.matchType}
                                    </Badge>
                                    <code className="text-xs font-mono text-muted-foreground">{result.filePath}</code>
                                </div>
                                <p className="text-sm font-medium">{result.matchField.replace(/^(symbol|export|dep|file):/, "")}</p>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{result.matchText}</p>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        {currentPage > 1 && (
                            <Link href={buildSearchUrl({ page: currentPage - 1, kind: currentKind })} className="px-3 py-1.5 text-sm bg-card border border-border rounded-lg hover:bg-muted transition-colors">
                                <TranslatedText tKey="app.previous" />
                            </Link>
                        )}
                        <span className="text-sm text-muted-foreground">
                            <TranslatedText tKey="app.page_of" values={{ current: currentPage, total: totalPages }} />
                        </span>
                        {currentPage < totalPages && (
                            <Link href={buildSearchUrl({ page: currentPage + 1, kind: currentKind })} className="px-3 py-1.5 text-sm bg-card border border-border rounded-lg hover:bg-muted transition-colors">
                                <TranslatedText tKey="app.next" />
                            </Link>
                        )}
                    </div>
                )}

                {/* Empty state */}
                {!q && (
                    <div className="text-center py-16">
                        <i className="fa-solid fa-magnifying-glass text-4xl text-muted-foreground mb-4 block" />
                        <h3 className="text-lg font-medium mb-2"><TranslatedText tKey="app.search_empty_title" /></h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto"><TranslatedText tKey="app.search_empty_desc" /></p>
                    </div>
                )}
            </div>
        </div>
    );
}
