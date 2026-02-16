import React from "react";
import { DocBreadcrumb } from "./DocBreadcrumb";
import { TranslatedText } from "../i18n";
import { FileTreeNode } from "@/lib/docs";
import Link from "next/link";
import { Button } from "../ui/button";

type FolderViewerProps = {
    repo: string;
    filePath: string;
    treeNode: FileTreeNode;
};
export default function FolderViewer({ repo, filePath, treeNode }: FolderViewerProps) {
    return (
        <div className="w-full h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto py-8 px-6">
                <DocBreadcrumb repoName={repo} filePath={filePath} />
                <div className="mt-6 mb-6">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold mb-2">{treeNode.name}</h1>
                        <Link href={`/api/v1/docs/${repo}/${filePath}`} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="h-7 gap-1.5">
                                <i className="fa-solid fa-plug text-[10px]" />
                                <TranslatedText tKey="docs.api_request" />
                            </Button>
                        </Link>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        <TranslatedText tKey="app.folder_contents" /> <code className="font-mono">{filePath}</code>
                    </p>
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
                        <h3 className="text-base font-medium mb-2">
                            <TranslatedText tKey="app.folder_empty" />
                        </h3>
                    </div>
                )}
            </div>
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
            {isFolder && node.children ? (
                <span className="text-xs text-muted-foreground ml-auto">
                    <TranslatedText tKey="app.items_count" values={{ count: node.children.length }} />
                </span>
            ) : (
                <span className="ml-auto" />
            )}
            <i className="fa-solid fa-chevron-right text-[10px] text-muted-foreground/50" />
        </Link>
    );
};
