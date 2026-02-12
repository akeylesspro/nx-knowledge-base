import { notFound } from "next/navigation";
import { readRepoOpenApi } from "@/lib/kb";

export default async function RepoOpenApiPage({
    params,
}: {
    params: Promise<{ repo: string }>;
}) {
    const resolved = await params;
    const openApi = await readRepoOpenApi(resolved.repo);
    if (!openApi) {
        notFound();
    }

    return (
        <div className="h-full w-full overflow-auto bg-muted p-6">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h1 className="text-2xl font-semibold">{resolved.repo} OpenAPI</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Generated from route patterns and synced into NX-KB.</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <pre className="overflow-auto rounded-md bg-background p-3 text-xs">{JSON.stringify(openApi, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
}
