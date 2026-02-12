/* =========================================================
   GET /api/v1/repos — List all documented repositories
   ========================================================= */

import { NextResponse } from "next/server";
import { getAllRepos } from "@/lib/docs";
import type { ApiResponse, RepoMeta } from "@/lib/docs";

export const GET = async (): Promise<NextResponse<ApiResponse<RepoMeta[]>>> => {
    try {
        const repos = await getAllRepos();

        return NextResponse.json({
            success: true,
            data: repos,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to list repos",
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
};
