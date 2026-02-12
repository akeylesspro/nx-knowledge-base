import { NextResponse } from "next/server";
import { findRepoSymbol } from "@/lib/kb";

export async function GET(
    _request: Request,
    context: { params: Promise<{ repo: string; symbolId: string }> },
) {
    const params = await context.params;
    const result = await findRepoSymbol(params.repo, params.symbolId);
    if (!result) {
        return NextResponse.json({ error: "Symbol not found" }, { status: 404 });
    }
    return NextResponse.json(result);
}
