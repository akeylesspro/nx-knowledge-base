import Link from "next/link";
import { notFound } from "next/navigation";
import { findRepoSymbol } from "@/lib/kb";

export default async function RepoSymbolPage({
    params,
}: {
    params: Promise<{ repo: string; symbolId: string }>;
}) {
    const resolved = await params;
    const symbolResult = await findRepoSymbol(resolved.repo, resolved.symbolId);
    if (!symbolResult) {
        notFound();
    }

    const { symbol, doc } = symbolResult;

    return (
        <div className="h-full w-full overflow-auto bg-muted p-6">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h1 className="text-2xl font-semibold">{symbol.name}</h1>
                    <p className="mt-2 text-sm text-muted-foreground">{symbol.description_one_line}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-md border border-border px-2 py-1">{symbol.kind}</span>
                        <span className="rounded-md border border-border px-2 py-1">file: {doc.file_name}</span>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">Details</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{symbol.details.what_it_does}</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">Deep Links</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <Link className="rounded-md border border-border px-3 py-1 text-sm hover:bg-accent" href={symbol.locations.github_permalink} target="_blank">
                            GitHub permalink
                        </Link>
                        <Link className="rounded-md border border-border px-3 py-1 text-sm hover:bg-accent" href={doc.source.link_to_nx_kb}>
                            File in NX-KB
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
