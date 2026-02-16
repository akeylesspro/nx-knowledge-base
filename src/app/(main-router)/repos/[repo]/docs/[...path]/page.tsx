import { notFound } from "next/navigation";
import Link from "next/link";
import { getFileDoc, getOverride, mergeWithOverride, getRepoWithFiles, buildFileTree } from "@/lib/docs";
import { DocViewer, DocBreadcrumb } from "@/components/docs";
import { TranslatedText } from "@/components/i18n";
import type { FileTreeNode } from "@/lib/docs/types";
import FolderViewer from "@/components/docs/FolderViewer";

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
        return <FolderViewer repo={repo} filePath={filePath} treeNode={treeNode} />;
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
