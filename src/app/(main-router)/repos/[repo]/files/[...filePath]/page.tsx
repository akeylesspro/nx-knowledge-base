import Link from "next/link";
import { notFound } from "next/navigation";
import { readRepoFileDoc } from "@/lib/kb";

export default async function RepoFileDocPage({
    params,
}: {
    params: Promise<{ repo: string; filePath: string[] }>;
}) {
    const resolved = await params;
    const doc = await readRepoFileDoc(resolved.repo, resolved.filePath);
    if (!doc) {
        notFound();
    }

    return (
        <div className="h-full w-full overflow-auto bg-muted p-6">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                        <h1 className="text-xl font-semibold text-card-foreground">{doc.file_name}</h1>
                        <Link href={doc.source.link_to_github} className="rounded-md border border-border px-3 py-1 text-sm hover:bg-accent" target="_blank">
                            Open in GitHub
                        </Link>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{doc.summary.purpose}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Problem solved: {doc.summary.problem_solved}</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">Exports</h2>
                    <ul className="mt-3 flex list-disc flex-col gap-1 pl-5 text-sm">
                        {doc.exports.map((entry) => (
                            <li key={`${entry.symbol_id}-${entry.name}`}>
                                <span className="font-semibold">{entry.name}</span> - {entry.description_one_line}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">Symbols</h2>
                    <div className="mt-3 flex flex-col gap-2">
                        {doc.symbols.map((symbol) => (
                            <div key={symbol.symbol_id} className="rounded-lg border border-border p-3">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold">{symbol.name}</p>
                                    <Link className="text-xs underline" href={`/repos/${resolved.repo}/symbols/${symbol.symbol_id}`}>
                                        symbol page
                                    </Link>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">{symbol.description_one_line}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
