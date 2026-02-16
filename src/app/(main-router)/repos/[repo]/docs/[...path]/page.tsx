import { notFound } from "next/navigation";
import { getFileDoc, getOverride, mergeWithOverride, getRepoWithFiles, buildFileTree, getTreeNodeAtPath } from "@/lib/docs";
import { DocViewer, DocBreadcrumb } from "@/components/docs";
import { TranslatedText } from "@/components/i18n";
import type { FileTreeNode } from "@/lib/docs";
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
    const treeNode = getTreeNodeAtPath(tree, filePath);

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
