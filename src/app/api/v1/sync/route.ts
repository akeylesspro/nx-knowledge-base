/* =========================================================
   POST /api/v1/sync — Webhook endpoint for Sync Agent
   Receives sync payloads from GitHub Actions
   ========================================================= */

import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, SyncPayload } from "@/lib/docs";

/** Shared secret for webhook authentication (set in env) */
const SYNC_SECRET = process.env.SYNC_WEBHOOK_SECRET || "";

export const POST = async (request: NextRequest): Promise<NextResponse<ApiResponse<{ received: boolean }>>> => {
    try {
        // Verify webhook secret
        const authHeader = request.headers.get("x-sync-secret") || request.headers.get("authorization");

        if (SYNC_SECRET && authHeader !== `Bearer ${SYNC_SECRET}` && authHeader !== SYNC_SECRET) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized: invalid sync secret",
                    timestamp: new Date().toISOString(),
                },
                { status: 401 }
            );
        }

        const payload = (await request.json()) as SyncPayload;

        // Validate payload structure
        if (!payload.repo || !payload.commit_sha || !payload.files || !Array.isArray(payload.files)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid payload: missing required fields (repo, commit_sha, files)",
                    timestamp: new Date().toISOString(),
                },
                { status: 400 }
            );
        }

        // Log the sync request (in production, this would trigger the Sync Agent)
        console.log(`[Sync] Received payload for repo: ${payload.repo}, commit: ${payload.commit_sha}, files: ${payload.files.length}`);

        // In production, this would:
        // 1. Queue the sync job
        // 2. Trigger the Sync Agent via GitHub Actions workflow_dispatch
        // 3. Return a job ID for tracking

        return NextResponse.json({
            success: true,
            data: { received: true },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Sync webhook failed",
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
};
