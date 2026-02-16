/* =========================================================
   GET /api/v1/docs/:repo/:path — Get file documentation JSON or folder listing
   ========================================================= */

import { NextResponse } from "next/server";
import { getFileDoc, getOverride, mergeWithOverride, getRepoWithFiles, buildFileTree, getTreeNodeAtPath } from "@/lib/docs";
import type { ApiResponse } from "@/lib/docs";
import type { FileTreeNode } from "@/lib/docs";
import { KnowledgeBaseSchema } from "@/types/schema";

type RouteParams = { params: Promise<{ repo: string; path: string[] }> };

type DocsApiResponse = ApiResponse<KnowledgeBaseSchema | FileTreeNode>;

export const GET = async (_request: Request, { params }: RouteParams): Promise<NextResponse<DocsApiResponse>> => {
    try {
        const { repo, path: pathSegments } = await params;
        const filePath = pathSegments.join("/");

        // Try file doc first
        const doc = await getFileDoc(repo, filePath);

        if (doc) {
            const override = await getOverride(repo, filePath.endsWith(".json") ? filePath : `${filePath}.json`);
            const finalDoc = override ? mergeWithOverride(doc, override) : doc;
            return NextResponse.json({
                success: true,
                data: finalDoc,
                timestamp: new Date().toISOString(),
            });
        }

        // Not a file — try folder listing (same logic as UI)
        const repoData = await getRepoWithFiles(repo);
        if (!repoData) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Repository "${repo}" not found`,
                    timestamp: new Date().toISOString(),
                },
                { status: 404 }
            );
        }

        const tree = buildFileTree(repoData.docFiles);
        const treeNode = getTreeNodeAtPath(tree, filePath);

        if (!treeNode || treeNode.type !== "folder") {
            return NextResponse.json(
                {
                    success: false,
                    error: `Documentation not found for "${repo}/${filePath}"`,
                    timestamp: new Date().toISOString(),
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: treeNode,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to get file documentation",
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
};
