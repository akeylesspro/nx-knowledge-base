import { getAllRepos } from "@/lib/docs";
import { RepoCard } from "@/components/docs";

export default async function ReposPage() {
    const repos = await getAllRepos();

    return (
        <div className="w-full h-full overflow-y-auto">
            <div className="max-w-5xl mx-auto py-8 px-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-2">All Repositories</h1>
                    <p className="text-muted-foreground">Browse documented repositories and their code documentation.</p>
                </div>

                {repos.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-xl border border-border">
                        <i className="fa-solid fa-cube text-4xl text-muted-foreground mb-4 block" />
                        <h3 className="text-lg font-medium mb-2">No repositories documented yet</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            Add repository documentation by creating a folder under <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">repos/</code> with the repo name and a{" "}
                            <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">meta.json</code> file.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {repos.map((repo) => (
                            <RepoCard key={repo.name} repo={repo} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
