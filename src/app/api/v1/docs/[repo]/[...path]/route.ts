/* =========================================================
   GET /api/v1/docs/:repo/:path — Get file documentation JSON
   ========================================================= */

import { NextResponse } from "next/server";
import { getFileDoc, getOverride, mergeWithOverride } from "@/lib/docs";
import type { ApiResponse } from "@/lib/docs";
import { KnowledgeBaseSchema } from "@/types/schema";


type RouteParams = { params: Promise<{ repo: string; path: string[] }> };

export const GET = async (_request: Request, { params }: RouteParams): Promise<NextResponse<ApiResponse<KnowledgeBaseSchema>>> => {
    try {
        const { repo, path: pathSegments } = await params;
        const filePath = pathSegments.join("/");

        const doc = await getFileDoc(repo, filePath);

        if (!doc) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Documentation not found for "${repo}/${filePath}"`,
                    timestamp: new Date().toISOString(),
                },
                { status: 404 }
            );
        }

        // Check for overrides and merge if exists
        const override = await getOverride(repo, filePath.endsWith(".json") ? filePath : `${filePath}.json`);
        const finalDoc = override ? mergeWithOverride(doc, override) : doc;

        return NextResponse.json({
            success: true,
            data: finalDoc,
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
