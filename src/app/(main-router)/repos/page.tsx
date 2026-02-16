import { getAllRepos } from "@/lib/docs";
import { RepoCard } from "@/components/docs";
import { TranslatedText } from "@/components/i18n";

export default async function ReposPage() {
    const repos = await getAllRepos();

    return (
        <div className="w-full h-full overflow-y-auto">
            <div className="max-w-5xl mx-auto py-8 px-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-2"><TranslatedText tKey="app.all_repos" /></h1>
                    <p className="text-muted-foreground"><TranslatedText tKey="app.all_repos_desc" /></p>
                </div>

                {repos.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-xl border border-border">
                        <i className="fa-solid fa-cube text-4xl text-muted-foreground mb-4 block" />
                        <h3 className="text-lg font-medium mb-2"><TranslatedText tKey="app.no_repos_documented" /></h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            <TranslatedText tKey="app.no_repos_documented_hint" />
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
