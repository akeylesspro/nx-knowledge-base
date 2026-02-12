import Link from "next/link";
import { listRepos } from "@/lib/kb";

export default async function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const repos = await listRepos();

    return (
        <div className="h-screen w-full bg-background">
            <div className="flex h-full">
                <aside className="h-full w-80 border-r border-border bg-card p-4">
                    <Link href="/docs" className="block rounded-md px-3 py-2 text-sm font-semibold hover:bg-accent">
                        Documentation Home
                    </Link>
                    <div className="mt-4">
                        <p className="px-3 text-xs uppercase text-muted-foreground">Repositories</p>
                        <div className="mt-2 flex flex-col gap-1">
                            {repos.map((repo) => (
                                <Link key={repo} href={`/repos/${repo}`} className="rounded-md px-3 py-2 text-sm hover:bg-accent">
                                    {repo}
                                </Link>
                            ))}
                        </div>
                    </div>
                </aside>
                <main className="relative flex grow">{children}</main>
            </div>
        </div>
    );
}
