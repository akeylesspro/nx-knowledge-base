/* =========================================================
   GET /api/v1/repos/:repo/meta — Get repository meta.json
   ========================================================= */

import { NextResponse } from "next/server";
import { getRepoMeta } from "@/lib/docs";
import type { ApiResponse, RepoMeta } from "@/lib/docs";

type RouteParams = { params: Promise<{ repo: string }> };

export const GET = async (_request: Request, { params }: RouteParams): Promise<NextResponse<ApiResponse<RepoMeta>>> => {
    try {
        const { repo } = await params;
        const repoMeta = await getRepoMeta(repo);

        if (!repoMeta) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Repository "${repo}" meta.json not found or invalid`,
                    timestamp: new Date().toISOString(),
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: repoMeta,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to get repository metadata",
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
};
