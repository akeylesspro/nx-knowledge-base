import { getAllRepos } from "@/lib/docs";
import { RepoCard } from "@/components/docs";
import { SearchInput } from "@/components/docs";

export default async function HomePage() {
    const repos = await getAllRepos();

    return (
        <div className="w-full h-full overflow-y-auto">
            <div className="max-w-5xl mx-auto py-12 px-6">
                {/* Hero */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-3">NX-KNOWLEDGE-BASE</h1>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Central documentation hub for all repositories. Browse, search, and explore code documentation for humans and AI agents.
                    </p>
                    <SearchInput placeholder="Search across all documentation..." className="max-w-lg mx-auto" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-12">
                    <StatCard icon="fa-solid fa-cube" label="Repositories" value={repos.length} />
                    <StatCard icon="fa-solid fa-file-code" label="Documented Files" value={repos.reduce((sum, r) => sum + (r.file_count || 0), 0)} />
                    <StatCard icon="fa-solid fa-code" label="Symbols" value={repos.reduce((sum, r) => sum + (r.symbol_count || 0), 0)} />
                </div>

                {/* Repos */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Repositories</h2>
                    {repos.length === 0 ? (
                        <div className="text-center py-16 bg-card rounded-xl border border-border">
                            <i className="fa-solid fa-book-open text-4xl text-muted-foreground mb-4 block" />
                            <h3 className="text-lg font-medium mb-2">No repositories yet</h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                Create a folder under <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">repos/</code> with a <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">meta.json</code> file to get
                                started.
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

                {/* Quick Links */}
                <div className="mt-12 grid grid-cols-2 gap-4">
                    <a href="/api/v1/repos" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:shadow-md transition-shadow">
                        <i className="fa-solid fa-plug text-primary" />
                        <div>
                            <h3 className="text-sm font-medium">API Access</h3>
                            <p className="text-xs text-muted-foreground">REST API for AI agents and integrations</p>
                        </div>
                    </a>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:shadow-md transition-shadow">
                        <i className="fa-brands fa-github text-foreground" />
                        <div>
                            <h3 className="text-sm font-medium">GitHub</h3>
                            <p className="text-xs text-muted-foreground">View source repositories on GitHub</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}

type StatCardProps = {
    icon: string;
    label: string;
    value: number;
};

const StatCard = ({ icon, label, value }: StatCardProps) => (
    <div className="bg-card rounded-xl border border-border p-5 text-center">
        <i className={`${icon} text-2xl text-primary mb-2 block`} />
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
    </div>
);
