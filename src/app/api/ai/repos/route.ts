import { NextResponse } from "next/server";
import { listRepos, readSearchIndex } from "@/lib/kb";

export async function GET() {
    const [repos, searchIndex] = await Promise.all([listRepos(), readSearchIndex()]);
    return NextResponse.json({
        repos,
        search_generated_at_iso: searchIndex.generated_at_iso,
        search_entries: searchIndex.entries.length,
    });
}
