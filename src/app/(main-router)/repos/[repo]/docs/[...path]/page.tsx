import { notFound } from "next/navigation";
import Link from "next/link";
import { getFileDoc, getOverride, mergeWithOverride, getRepoWithFiles, buildFileTree } from "@/lib/docs";
import { DocViewer, DocBreadcrumb } from "@/components/docs";
import type { FileTreeNode } from "@/lib/docs/types";

type FileDocPageProps = {
    params: Promise<{ repo: string; path: string[] }>;
};

export default async function FileDocPage({ params }: FileDocPageProps) {
    const { repo, path: pathSegments } = await params;
    const filePath = pathSegments.join("/");
    const repoData = await getRepoWithFiles(repo);

    if (!repoData) return notFound();

    const tree = buildFileTree(repoData.docFiles);
    const treeNode = findNodeByPath(tree, filePath);

    if (treeNode?.type === "folder") {
        return (
            <div className="w-full h-full overflow-y-auto">
                <div className="max-w-4xl mx-auto py-8 px-6">
                    <DocBreadcrumb repoName={repo} filePath={filePath} />
                    <div className="mt-6 mb-6">
                        <h1 className="text-2xl font-bold mb-2">{treeNode.name}</h1>
                        <p className="text-sm text-muted-foreground">Folder contents for <code className="font-mono">{filePath}</code></p>
                    </div>

                    {treeNode.children && treeNode.children.length > 0 ? (
                        <div className="bg-card rounded-xl border border-border divide-y divide-border">
                            {treeNode.children.map((childNode) => (
                                <FolderTreeRow key={childNode.path} node={childNode} repoName={repo} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-card rounded-xl border border-border">
                            <i className="fa-solid fa-folder-open text-3xl text-muted-foreground mb-3 block" />
                            <h3 className="text-base font-medium mb-2">This folder is empty</h3>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const doc = await getFileDoc(repo, filePath);

    if (!doc) return notFound();

    // Merge with overrides if they exist
    const override = await getOverride(repo, filePath.endsWith(".json") ? filePath : `${filePath}.json`);
    const finalDoc = override ? mergeWithOverride(doc, override) : doc;

    return (
        <div className="w-full h-full overflow-y-auto">
            <DocViewer doc={finalDoc} repoName={repo} />
        </div>
    );
}

type FolderTreeRowProps = {
    node: FileTreeNode;
    repoName: string;
};

const FolderTreeRow = ({ node, repoName }: FolderTreeRowProps) => {
    const isFolder = node.type === "folder";
    const displayName = isFolder ? node.name : node.name.replace(/\.json$/, "");

    return (
        <Link href={`/repos/${repoName}/docs/${node.path}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
            <i className={isFolder ? "fa-solid fa-folder text-sm text-primary/70" : "fa-solid fa-file-code text-sm text-muted-foreground"} />
            <code className="font-mono text-sm text-foreground">{displayName}</code>
            {isFolder && node.children ? <span className="text-xs text-muted-foreground ml-auto">{node.children.length} items</span> : <span className="ml-auto" />}
            <i className="fa-solid fa-chevron-right text-[10px] text-muted-foreground/50" />
        </Link>
    );
};

const findNodeByPath = (nodes: FileTreeNode[], targetPath: string): FileTreeNode | null => {
    for (const node of nodes) {
        if (node.path === targetPath) {
            return node;
        }

        if (!node.children) {
            continue;
        }

        const nestedNode = findNodeByPath(node.children, targetPath);
        if (nestedNode) {
            return nestedNode;
        }
    }

    return null;
};
