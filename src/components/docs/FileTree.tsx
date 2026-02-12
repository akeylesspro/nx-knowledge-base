"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FileTreeNode } from "@/lib/docs/types";
import { cn } from "@/lib/utils";

type FileTreeProps = {
    nodes: FileTreeNode[];
    repoName: string;
    depth?: number;
};

export const FileTree = ({ nodes, repoName, depth = 0 }: FileTreeProps) => {
    return (
        <div className="space-y-0.5">
            {nodes.map((node) => (
                <FileTreeItem key={node.path} node={node} repoName={repoName} depth={depth} />
            ))}
        </div>
    );
};

type FileTreeItemProps = {
    node: FileTreeNode;
    repoName: string;
    depth: number;
};

const FileTreeItem = ({ node, repoName, depth }: FileTreeItemProps) => {
    const [isOpen, setIsOpen] = useState(depth < 2);
    const pathname = usePathname();

    const docPath = `/repos/${repoName}/docs/${node.path}`;
    const isActive = pathname === docPath;

    if (node.type === "folder") {
        return (
            <div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 w-full text-left py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors text-sm cursor-pointer"
                    style={{ paddingLeft: `${depth * 12 + 8}px` }}
                >
                    <i className={cn("fa-solid text-[10px] text-muted-foreground transition-transform", isOpen ? "fa-chevron-down" : "fa-chevron-right")} />
                    <i className={cn("fa-solid text-xs", isOpen ? "fa-folder-open text-primary/70" : "fa-folder text-muted-foreground")} />
                    <span className="truncate">{node.name}</span>
                </button>
                {isOpen && node.children && <FileTree nodes={node.children} repoName={repoName} depth={depth + 1} />}
            </div>
        );
    }

    // File node
    const displayName = node.name.replace(/\.json$/, "");

    return (
        <Link
            href={docPath}
            className={cn("flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors text-sm", isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-muted-foreground hover:text-foreground")}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
            <i className="fa-solid fa-file-code text-xs" />
            <span className="truncate font-mono text-xs">{displayName}</span>
        </Link>
    );
};
