/* =========================================================
   GET /api/v1/repos/:repo — Get repo metadata and file list
   ========================================================= */

import { NextResponse } from "next/server";
import { getRepoWithFiles } from "@/lib/docs";
import type { ApiResponse, RepoWithFiles } from "@/lib/docs";

type RouteParams = { params: Promise<{ repo: string }> };

export const GET = async (_request: Request, { params }: RouteParams): Promise<NextResponse<ApiResponse<RepoWithFiles>>> => {
    try {
        const { repo } = await params;
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

        return NextResponse.json({
            success: true,
            data: repoData,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to get repo data",
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
};
