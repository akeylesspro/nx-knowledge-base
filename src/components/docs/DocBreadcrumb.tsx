import Link from "next/link";
import { TranslatedText } from "@/components/i18n";

type DocBreadcrumbProps = {
    repoName: string;
    filePath?: string;
};

export const DocBreadcrumb = ({ repoName, filePath }: DocBreadcrumbProps) => {
    const parts = filePath ? filePath.split("/").filter(Boolean) : [];

    return (
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
            <Link href="/" className="hover:text-primary transition-colors">
                <i className="fa-solid fa-house text-xs" />
            </Link>

            <ChevronSeparator />

            <Link href="/repos" className="hover:text-primary transition-colors">
                <TranslatedText tKey="docs.repos" />
            </Link>

            <ChevronSeparator />

            <Link href={`/repos/${repoName}`} className="hover:text-primary transition-colors">
                {repoName}
            </Link>

            {parts.map((part, index) => {
                const isLast = index === parts.length - 1;
                const pathUpTo = parts.slice(0, index + 1).join("/");

                return (
                    <span key={pathUpTo} className="flex items-center gap-1.5">
                        <ChevronSeparator />
                        {isLast ? (
                            <span className="text-foreground font-medium">{part}</span>
                        ) : (
                            <Link href={`/repos/${repoName}/docs/${pathUpTo}`} className="hover:text-primary transition-colors">
                                {part}
                            </Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
};

const ChevronSeparator = () => <i className="fa-solid fa-chevron-right text-[8px] text-muted-foreground/50" />;
