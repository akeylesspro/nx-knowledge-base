import Link from "next/link";
import { notFound } from "next/navigation";
import { listRepoDocPreviews, listRepos } from "@/lib/kb";

const toFileRoute = (repo: string, sourcePath: string) => `/repos/${repo}/files/${sourcePath}`;

export default async function RepoHomePage({
    params,
}: {
    params: Promise<{ repo: string }>;
}) {
    const { repo } = await params;
    const repos = await listRepos();
    if (!repos.includes(repo)) {
        notFound();
    }

    const previews = await listRepoDocPreviews(repo);

    return (
        <div className="h-full w-full overflow-auto bg-muted p-6">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <h1 className="text-2xl font-semibold">{repo}</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Repository documentation home.</p>
                        </div>
                        <Link href={`/repos/${repo}/openapi`} className="rounded-md border border-border px-3 py-1 text-sm hover:bg-accent">
                            OpenAPI
                        </Link>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                        Total documented files: <span className="font-semibold text-foreground">{previews.length}</span>
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">All documentation files</h2>
                    {previews.length === 0 ? (
                        <p className="mt-3 text-sm text-muted-foreground">No documentation files were generated yet.</p>
                    ) : (
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                            {previews.map((preview) => (
                                <div key={preview.doc_path} className="rounded-lg border border-border p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <Link className="text-sm font-semibold underline" href={toFileRoute(repo, preview.source_file_path)}>
                                            {preview.source_file_path}
                                        </Link>
                                        <span className="rounded-md border border-border px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                                            {preview.language}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground">{preview.purpose}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{preview.problem_solved}</p>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        <span className="rounded-md bg-accent px-2 py-0.5 text-[10px]">
                                            exports: {preview.exports_count}
                                        </span>
                                        <span className="rounded-md bg-accent px-2 py-0.5 text-[10px]">
                                            symbols: {preview.symbols_count}
                                        </span>
                                        {preview.framework_tags.slice(0, 2).map((tag) => (
                                            <span key={`${preview.doc_path}-${tag}`} className="rounded-md border border-border px-2 py-0.5 text-[10px]">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
