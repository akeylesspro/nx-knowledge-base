import { notFound } from "next/navigation";
import Link from "next/link";
import { getRepoWithFiles, buildFileTree } from "@/lib/docs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DocBreadcrumb } from "@/components/docs";

type RepoPageProps = {
    params: Promise<{ repo: string }>;
};

export default async function RepoPage({ params }: RepoPageProps) {
    const { repo } = await params;
    const repoData = await getRepoWithFiles(repo);

    if (!repoData) return notFound();

    const { meta, docFiles } = repoData;
    const tree = buildFileTree(docFiles);

    return (
        <div className="w-full h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto py-8 px-6">
                <DocBreadcrumb repoName={repo} />

                {/* Header */}
                <div className="mt-6 mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold">{meta.display_name}</h1>
                        <Badge variant="outline">{meta.language}</Badge>
                        {meta.framework_tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    <p className="text-muted-foreground mb-4">{meta.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <a href={meta.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                            <i className="fa-brands fa-github" /> View on GitHub
                        </a>
                        <span className="flex items-center gap-1">
                            <i className="fa-solid fa-code-branch" /> {meta.default_branch}
                        </span>
                        {meta.last_synced_at && (
                            <span className="flex items-center gap-1">
                                <i className="fa-solid fa-clock" /> Last synced: {new Date(meta.last_synced_at).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-card rounded-xl border border-border p-4 text-center">
                        <p className="text-xl font-bold">{meta.file_count}</p>
                        <p className="text-xs text-muted-foreground">Documented Files</p>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-4 text-center">
                        <p className="text-xl font-bold">{meta.symbol_count}</p>
                        <p className="text-xs text-muted-foreground">Symbols</p>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-4 text-center">
                        <p className="text-xl font-bold">{docFiles.length}</p>
                        <p className="text-xs text-muted-foreground">Doc Files</p>
                    </div>
                </div>

                <Separator className="mb-8" />

                {/* File listing */}
                <h2 className="text-lg font-semibold mb-4">Documentation Files</h2>
                {docFiles.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-xl border border-border">
                        <i className="fa-solid fa-file-circle-question text-3xl text-muted-foreground mb-3 block" />
                        <h3 className="text-base font-medium mb-2">No documentation files yet</h3>
                        <p className="text-sm text-muted-foreground">The Sync Agent will generate documentation when code changes are pushed.</p>
                    </div>
                ) : (
                    <div className="bg-card rounded-xl border border-border divide-y divide-border">
                        {docFiles.map((filePath) => {
                            const displayName = filePath.replace(/\.json$/, "");
                            return (
                                <Link key={filePath} href={`/repos/${repo}/docs/${filePath}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                                    <i className="fa-solid fa-file-code text-sm text-muted-foreground" />
                                    <code className="font-mono text-sm text-foreground">{displayName}</code>
                                    <i className="fa-solid fa-chevron-right text-[10px] text-muted-foreground/50 ml-auto" />
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* API Docs link */}
                <div className="mt-8">
                    <Link href={`/repos/${repo}/api-docs`} className="inline-flex items-center gap-2 px-4 py-2.5 bg-card rounded-xl border border-border hover:shadow-md transition-shadow text-sm">
                        <i className="fa-solid fa-plug text-primary" />
                        <span>View API Documentation (Swagger)</span>
                        <i className="fa-solid fa-arrow-right text-xs text-muted-foreground" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
