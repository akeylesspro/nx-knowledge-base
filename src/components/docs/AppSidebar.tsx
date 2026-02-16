import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { TranslatedText, LanguageSwitcher } from "@/components/i18n";
import { SearchInput } from "./SearchInput";
import { FileTree } from "./FileTree";
import type { FileTreeNode } from "@/lib/docs/types";
import type { RepoMeta } from "@/lib/docs/types";

type AppSidebarProps = {
    repos: RepoMeta[];
    fileTreeMap: Record<string, FileTreeNode[]>;
};

export const AppSidebar = ({ repos, fileTreeMap }: AppSidebarProps) => {
    return (
        <aside className="w-72 h-full bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
            {/* Logo / Title */}
            <div className="p-4 pb-3">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <i className="fa-solid fa-book text-primary-foreground text-sm" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-sidebar-foreground group-hover:text-sidebar-primary transition-colors">
                            <TranslatedText tKey="app.title" />
                        </h1>
                        <p className="text-[10px] text-muted-foreground">
                            <TranslatedText tKey="app.documentation_hub" />
                        </p>
                    </div>
                </Link>
            </div>

            {/* Search */}
            <div className="px-4 pb-3">
                <SearchInput placeholderKey="app.search_placeholder_short" />
            </div>

            <Separator />

            {/* Navigation */}
            <div className="flex-1 py-3 max-h-full overflow-y-auto overflow-x-hidden">
                <div className="px-3 space-y-1 mb-4">
                    <SidebarLink href="/" icon="fa-solid fa-house" labelKey="app.dashboard" />
                    <SidebarLink href="/repos" icon="fa-solid fa-folder-tree" labelKey="app.all_repos" />
                    <SidebarLink href="/search" icon="fa-solid fa-magnifying-glass" labelKey="app.search_nav" />
                </div>

                <Separator className="mx-3" />

                {/* Repos tree */}
                <div className="px-3 pt-3 ">
                    <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-2">
                        <TranslatedText tKey="app.repositories" />
                    </h3>
                    {repos.length === 0 ? (
                        <p className="text-xs text-muted-foreground px-2 italic">
                            <TranslatedText tKey="app.no_repos_sidebar" />
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {repos.map((repo) => (
                                <div key={repo.name}>
                                    <Link
                                        href={`/repos/${repo.name}`}
                                        className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium hover:text-primary transition-colors"
                                    >
                                        <i className="fa-solid fa-cube text-xs text-muted-foreground" />
                                        {repo.display_name}
                                    </Link>
                                    {fileTreeMap[repo.name] && fileTreeMap[repo.name].length > 0 && (
                                        <FileTree nodes={fileTreeMap[repo.name]} repoName={repo.name} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-sidebar-border">
                <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                    <a
                        href="/api/v1/repos"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors flex items-center gap-1"
                    >
                        <i className="fa-solid fa-plug text-[8px]" /> API
                    </a>
                    <LanguageSwitcher />
                </div>
            </div>
        </aside>
    );
};

type SidebarLinkProps = {
    href: string;
    icon: string;
    labelKey: string;
};

const SidebarLink = ({ href, icon, labelKey }: SidebarLinkProps) => {
    return (
        <Link
            href={href}
            className="flex items-center gap-2.5 px-2 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors"
        >
            <i className={`${icon} text-xs w-4 text-center text-muted-foreground`} />
            <TranslatedText tKey={labelKey} />
        </Link>
    );
};
