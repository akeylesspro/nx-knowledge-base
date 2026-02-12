/* =========================================================
   GET /api/v1/search — Search documentation
   Query params: q (required), repo (optional), limit, offset
   ========================================================= */

import { NextRequest, NextResponse } from "next/server";
import { searchDocs } from "@/lib/docs";
import type { PaginatedResponse, SearchResult } from "@/lib/docs";

export const GET = async (request: NextRequest): Promise<NextResponse<PaginatedResponse<SearchResult>>> => {
    try {
        const { searchParams } = request.nextUrl;
        const query = searchParams.get("q") || "";
        const repo = searchParams.get("repo") || undefined;
        const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
        const offset = parseInt(searchParams.get("offset") || "0");

        if (!query || query.trim().length < 2) {
            return NextResponse.json({
                success: false,
                error: "Query parameter 'q' must be at least 2 characters",
                data: [],
                total: 0,
                limit,
                offset,
                timestamp: new Date().toISOString(),
            });
        }

        const { results, total } = await searchDocs({ query, repo, limit, offset });

        return NextResponse.json({
            success: true,
            data: results,
            total,
            limit,
            offset,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Search failed",
                data: [],
                total: 0,
                limit: 20,
                offset: 0,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
};
