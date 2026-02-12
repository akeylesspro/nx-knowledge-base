import Link from "next/link";
import { listRepoDocPreviews, listRepos, readSearchIndex } from "@/lib/kb";

export default async function Home() {
    const repos = await listRepos();
    const searchIndex = await readSearchIndex();
    const repoEntries = await Promise.all(
        repos.map(async (repo) => {
            const previews = await listRepoDocPreviews(repo, 4);
            return {
                repo,
                previews,
            };
        }),
    );

    return (
        <div className="w-full h-full overflow-auto bg-muted p-6">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h1 className="text-2xl font-semibold text-card-foreground">NX Knowledge Base</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Generated documentation and OpenAPI references for all connected repositories.
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Search entries: <span className="font-semibold text-foreground">{searchIndex.entries.length}</span>
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {repoEntries.map(({ repo, previews }) => (
                        <div key={repo} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                            <h2 className="text-lg font-semibold text-card-foreground">{repo}</h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                File previews shown: <span className="font-semibold text-foreground">{previews.length}</span>
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Link className="rounded-md border border-border px-3 py-1 text-sm hover:bg-accent" href={`/repos/${repo}`}>
                                    Repo home
                                </Link>
                                <Link className="rounded-md border border-border px-3 py-1 text-sm hover:bg-accent" href={`/repos/${repo}/openapi`}>
                                    OpenAPI
                                </Link>
                            </div>
                            {previews.length > 0 && (
                                <div className="mt-4 flex flex-col gap-2">
                                    {previews.map((preview) => (
                                        <div key={preview.doc_path} className="rounded-md border border-border p-2">
                                            <Link
                                                className="text-xs font-semibold underline hover:text-foreground"
                                                href={`/repos/${repo}/files/${preview.source_file_path}`}
                                            >
                                                {preview.source_file_path}
                                            </Link>
                                            <p className="mt-1 text-[11px] text-muted-foreground">{preview.purpose}</p>
                                            <div className="mt-1 flex gap-1 text-[10px] text-muted-foreground">
                                                <span>exports: {preview.exports_count}</span>
                                                <span>|</span>
                                                <span>symbols: {preview.symbols_count}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <Link className="mt-1 text-xs font-semibold underline" href={`/repos/${repo}`}>
                                        View full repository content
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
