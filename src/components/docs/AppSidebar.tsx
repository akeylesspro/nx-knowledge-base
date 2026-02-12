import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
        <aside className="w-80 h-full bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
            {/* Logo / Title */}
            <div className="p-4 pb-3">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <i className="fa-solid fa-book text-primary-foreground text-sm" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-sidebar-foreground group-hover:text-sidebar-primary transition-colors">NX-KNOWLEDGE-BASE</h1>
                        <p className="text-[10px] text-muted-foreground">Documentation Hub</p>
                    </div>
                </Link>
            </div>

            {/* Search */}
            <div className="px-4 pb-3">
                <SearchInput placeholder="Search docs..." />
            </div>

            <Separator />

            {/* Navigation */}
            <ScrollArea className="flex-1 py-3">
                <div className="px-3 space-y-1 mb-4">
                    <SidebarLink href="/" icon="fa-solid fa-house" label="Dashboard" />
                    <SidebarLink href="/repos" icon="fa-solid fa-folder-tree" label="All Repositories" />
                    <SidebarLink href="/search" icon="fa-solid fa-magnifying-glass" label="Search" />
                </div>

                <Separator className="mx-3" />

                {/* Repos tree */}
                <div className="px-3 pt-3">
                    <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-2">Repositories</h3>
                    {repos.length === 0 ? (
                        <p className="text-xs text-muted-foreground px-2 italic">No repositories yet</p>
                    ) : (
                        <div className="space-y-3">
                            {repos.map((repo) => (
                                <div key={repo.name}>
                                    <Link href={`/repos/${repo.name}`} className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium hover:text-primary transition-colors">
                                        <i className="fa-solid fa-cube text-xs text-muted-foreground" />
                                        {repo.display_name}
                                    </Link>
                                    {fileTreeMap[repo.name] && fileTreeMap[repo.name].length > 0 && <FileTree nodes={fileTreeMap[repo.name]} repoName={repo.name} />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t border-sidebar-border">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>NX-KB v1.0.0</span>
                    <a href="/api/v1/repos" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                        <i className="fa-solid fa-plug text-[8px]" /> API
                    </a>
                </div>
            </div>
        </aside>
    );
};

type SidebarLinkProps = {
    href: string;
    icon: string;
    label: string;
};

const SidebarLink = ({ href, icon, label }: SidebarLinkProps) => {
    return (
        <Link href={href} className="flex items-center gap-2.5 px-2 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors">
            <i className={`${icon} text-xs w-4 text-center text-muted-foreground`} />
            {label}
        </Link>
    );
};
