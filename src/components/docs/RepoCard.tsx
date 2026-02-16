"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import type { RepoMeta } from "@/lib/docs/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

type RepoCardProps = {
    repo: RepoMeta;
};

export const RepoCard = ({ repo }: RepoCardProps) => {
    const { t } = useTranslation();
    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/repos/${repo.name}`);
    };

    return (
        <Card
            className="hover:shadow-lg transition-shadow cursor-pointer h-full"
            onClick={handleCardClick}
        >
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{repo.display_name}</CardTitle>
                    <a
                        href={repo.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <i className="fa-brands fa-github text-lg" />
                    </a>
                </div>
                <CardDescription>{repo.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{repo.language}</Badge>
                    {repo.framework_tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                            {tag}
                        </Badge>
                    ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {repo.file_count != null && (
                        <span className="flex items-center gap-1">
                            <i className="fa-solid fa-file-code" />
                            {t("app.files_count", { count: repo.file_count })}
                        </span>
                    )}
                    {repo.symbol_count != null && (
                        <span className="flex items-center gap-1">
                            <i className="fa-solid fa-code" />
                            {t("app.symbols_count_label", { count: repo.symbol_count })}
                        </span>
                    )}
                    {repo.last_synced_at && (
                        <span className="flex items-center gap-1">
                            <i className="fa-solid fa-clock" />
                            {new Date(repo.last_synced_at).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
