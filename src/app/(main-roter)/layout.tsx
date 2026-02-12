import { getAllRepos, getDocFilePaths, buildFileTree } from "@/lib/docs";
import { AppSidebar } from "@/components/docs";
import type { FileTreeNode } from "@/lib/docs/types";

export default async function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const repos = await getAllRepos();

    // Build file tree for each repo
    const fileTreeMap: Record<string, FileTreeNode[]> = {};
    for (const repo of repos) {
        const filePaths = await getDocFilePaths(repo.name);
        fileTreeMap[repo.name] = buildFileTree(filePaths);
    }

    return (
        <div className="_full flex h-screen">
            <AppSidebar repos={repos} fileTreeMap={fileTreeMap} />
            <div className="grow flex children_container relative overflow-hidden">{children}</div>
        </div>
    );
}
