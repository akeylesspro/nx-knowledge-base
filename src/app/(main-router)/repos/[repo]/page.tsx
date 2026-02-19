import { notFound } from "next/navigation";
import Link from "next/link";
import { getRepoWithFiles, buildFileTree } from "@/lib/docs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TranslatedText } from "@/components/i18n";
import { DocBreadcrumb } from "@/components/docs";
import type { FileTreeNode } from "@/lib/docs/types";

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
                        <a
                            href={meta.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                            <i className="fa-brands fa-github" /> <TranslatedText tKey="app.view_on_github" />
                        </a>
                        <span className="flex items-center gap-1">
                            <i className="fa-solid fa-code-branch" /> {meta.default_branch}
                        </span>
                        {meta.last_synced_at && (
                            <span className="flex items-center gap-1">
                                <i className="fa-solid fa-clock" /> <TranslatedText tKey="app.last_synced" />:{" "}
                                {new Date(meta.last_synced_at).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-card rounded-xl border border-border p-4 text-center">
                        <p className="text-xl font-bold">{meta.file_count ?? docFiles.length}</p>
                        <p className="text-xs text-muted-foreground">
                            <TranslatedText tKey="app.documented_files_label" />
                        </p>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-4 text-center">
                        <p className="text-xl font-bold">{meta.symbol_count ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">
                            <TranslatedText tKey="app.symbols_label" />
                        </p>
                    </div>
                </div>

                {/* Repository story */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-3">Repository Story</h2>
                    <div className="bg-card rounded-xl border border-border p-4">
                        <p className="text-sm text-muted-foreground leading-6 whitespace-pre-wrap">{meta.story}</p>
                    </div>
                </div>

                {/* Capabilities */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-3">Capabilities</h2>
                    {meta.capabilities.length === 0 ? (
                        <div className="bg-card rounded-xl border border-border p-4 text-sm text-muted-foreground">
                            No capabilities documented yet.
                        </div>
                    ) : (
                        <ul className="bg-card rounded-xl border border-border divide-y divide-border">
                            {meta.capabilities.map((capability) => (
                                <li key={capability} className="px-4 py-3 text-sm text-foreground flex items-start gap-2">
                                    <i className="fa-solid fa-check text-primary mt-0.5" />
                                    <span>{capability}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <Separator className="mb-8" />

                {/* File listing */}
                <h2 className="text-lg font-semibold mb-4">
                    <TranslatedText tKey="app.doc_files_title" />
                </h2>
                {docFiles.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-xl border border-border">
                        <i className="fa-solid fa-file-circle-question text-3xl text-muted-foreground mb-3 block" />
                        <h3 className="text-base font-medium mb-2">
                            <TranslatedText tKey="app.no_doc_files" />
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            <TranslatedText tKey="app.no_doc_files_hint" />
                        </p>
                    </div>
                ) : (
                    <div className="bg-card rounded-xl border border-border divide-y divide-border">
                        {tree.map((node) => (
                            <RepoTreeRow key={node.path} node={node} repoName={repo} />
                        ))}
                    </div>
                )}

                {/* API Docs link */}
                <div className="mt-8">
                    <Link
                        href={`/repos/${repo}/api-docs`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-card rounded-xl border border-border hover:shadow-md transition-shadow text-sm"
                    >
                        <i className="fa-solid fa-plug text-primary" />
                        <span>
                            <TranslatedText tKey="app.view_api_docs" />
                        </span>
                        <i className="fa-solid fa-arrow-right text-xs text-muted-foreground" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

type RepoTreeRowProps = {
    node: FileTreeNode;
    repoName: string;
};

const RepoTreeRow = ({ node, repoName }: RepoTreeRowProps) => {
    const isFolder = node.type === "folder";
    const href = isFolder ? `/repos/${repoName}/docs/${node.path}` : `/repos/${repoName}/docs/${node.path}`;
    const displayName = isFolder ? node.name : node.name.replace(/\.json$/, "");
    const iconClassName = isFolder ? "fa-solid fa-folder text-sm text-primary/70" : "fa-solid fa-file-code text-sm text-muted-foreground";

    return (
        <Link href={href} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
            <i className={iconClassName} />
            <code className="font-mono text-sm text-foreground">{displayName}</code>
            {isFolder && node.children ? (
                <span className="text-xs text-muted-foreground ml-auto">
                    <TranslatedText tKey="app.items_count" values={{ count: node.children.length }} />
                </span>
            ) : null}
            <i className="fa-solid fa-chevron-right text-[10px] text-muted-foreground/50" />
        </Link>
    );
};
