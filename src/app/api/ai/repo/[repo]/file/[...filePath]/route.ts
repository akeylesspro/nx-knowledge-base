import { NextResponse } from "next/server";
import { readRepoFileDoc } from "@/lib/kb";

export async function GET(
    _request: Request,
    context: { params: Promise<{ repo: string; filePath: string[] }> },
) {
    const params = await context.params;
    const doc = await readRepoFileDoc(params.repo, params.filePath);
    if (!doc) {
        return NextResponse.json({ error: "File doc not found" }, { status: 404 });
    }
    return NextResponse.json(doc);
}
