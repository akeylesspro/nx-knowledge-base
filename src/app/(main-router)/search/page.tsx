import Link from "next/link";
import { searchDocs } from "@/lib/docs";
import { SearchInput } from "@/components/docs";
import { Badge } from "@/components/ui/badge";

type SearchPageProps = {
    searchParams: Promise<{ q?: string; repo?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { q = "", repo, page = "1" } = await searchParams;
    const currentPage = parseInt(page) || 1;
    const limit = 20;
    const offset = (currentPage - 1) * limit;

    const { results, total } = q.trim().length >= 2 ? await searchDocs({ query: q, repo, limit, offset }) : { results: [], total: 0 };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="w-full h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto py-8 px-6">
                <h1 className="text-2xl font-bold mb-6">Search Documentation</h1>

                <SearchInput defaultValue={q} className="mb-6" />

                {q && (
                    <p className="text-sm text-muted-foreground mb-6">
                        {total > 0 ? (
                            <>
                                Found <strong>{total}</strong> results for &quot;{q}&quot;
                                {repo && (
                                    <>
                                        {" "}
                                        in <Badge variant="outline">{repo}</Badge>
                                    </>
                                )}
                            </>
                        ) : (
                            <>No results found for &quot;{q}&quot;</>
                        )}
                    </p>
                )}

                {/* Results */}
                {results.length > 0 && (
                    <div className="space-y-3">
                        {results.map((result, i) => (
                            <Link key={`${result.link}-${i}`} href={result.link} className="block p-4 bg-card rounded-xl border border-border hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-[10px]">
                                        {result.repo}
                                    </Badge>
                                    <Badge variant="secondary" className="text-[10px]">
                                        {result.matchType}
                                    </Badge>
                                    <code className="text-xs font-mono text-muted-foreground">{result.filePath}</code>
                                </div>
                                <p className="text-sm font-medium">{result.matchField.replace(/^(symbol|export|dep):/, "")}</p>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{result.matchText}</p>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        {currentPage > 1 && (
                            <Link href={`/search?q=${encodeURIComponent(q)}&page=${currentPage - 1}${repo ? `&repo=${repo}` : ""}`} className="px-3 py-1.5 text-sm bg-card border border-border rounded-lg hover:bg-muted transition-colors">
                                Previous
                            </Link>
                        )}
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        {currentPage < totalPages && (
                            <Link href={`/search?q=${encodeURIComponent(q)}&page=${currentPage + 1}${repo ? `&repo=${repo}` : ""}`} className="px-3 py-1.5 text-sm bg-card border border-border rounded-lg hover:bg-muted transition-colors">
                                Next
                            </Link>
                        )}
                    </div>
                )}

                {/* Empty state */}
                {!q && (
                    <div className="text-center py-16">
                        <i className="fa-solid fa-magnifying-glass text-4xl text-muted-foreground mb-4 block" />
                        <h3 className="text-lg font-medium mb-2">Search the knowledge base</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">Search across all repositories for functions, components, types, dependencies, and more.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
