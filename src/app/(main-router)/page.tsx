import { getAllRepos } from "@/lib/docs";
import { RepoCard } from "@/components/docs";
import { SearchInput } from "@/components/docs";
import { TranslatedText } from "@/components/i18n";

export default async function HomePage() {
    const repos = await getAllRepos();

    return (
        <div className="w-full h-full overflow-y-auto">
            <div className="max-w-5xl mx-auto py-12 px-6">
                {/* Hero */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-3"><TranslatedText tKey="app.title" /></h1>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                        <TranslatedText tKey="app.tagline" />
                    </p>
                    <SearchInput placeholderKey="app.search_placeholder" className="max-w-lg mx-auto" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-12">
                    <StatCard icon="fa-solid fa-cube" labelKey="app.repositories" value={repos.length} />
                    <StatCard icon="fa-solid fa-file-code" labelKey="app.documented_files" value={repos.reduce((sum, r) => sum + (r.file_count || 0), 0)} />
                    <StatCard icon="fa-solid fa-code" labelKey="app.symbols_count" value={repos.reduce((sum, r) => sum + (r.symbol_count || 0), 0)} />
                </div>

                {/* Repos */}
                <div>
                    <h2 className="text-xl font-semibold mb-4"><TranslatedText tKey="app.repositories" /></h2>
                    {repos.length === 0 ? (
                        <div className="text-center py-16 bg-card rounded-xl border border-border">
                            <i className="fa-solid fa-book-open text-4xl text-muted-foreground mb-4 block" />
                            <h3 className="text-lg font-medium mb-2"><TranslatedText tKey="app.no_repos_yet" /></h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                <TranslatedText tKey="app.no_repos_hint" />
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
                            <h3 className="text-sm font-medium"><TranslatedText tKey="app.api_access" /></h3>
                            <p className="text-xs text-muted-foreground"><TranslatedText tKey="app.api_access_desc" /></p>
                        </div>
                    </a>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:shadow-md transition-shadow">
                        <i className="fa-brands fa-github text-foreground" />
                        <div>
                            <h3 className="text-sm font-medium"><TranslatedText tKey="app.github" /></h3>
                            <p className="text-xs text-muted-foreground"><TranslatedText tKey="app.github_desc" /></p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}

type StatCardProps = {
    icon: string;
    labelKey: string;
    value: number;
};

const StatCard = ({ icon, labelKey, value }: StatCardProps) => (
    <div className="bg-card rounded-xl border border-border p-5 text-center">
        <i className={`${icon} text-2xl text-primary mb-2 block`} />
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground"><TranslatedText tKey={labelKey} /></p>
    </div>
);
