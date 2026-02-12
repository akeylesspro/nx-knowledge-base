import type { FileDependencies } from "@/types/schema";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type DependencyListProps = {
    dependencies: FileDependencies;
};

export const DependencyList = ({ dependencies }: DependencyListProps) => {
    const hasExternal = dependencies.external.length > 0;
    const hasInternal = dependencies.internal.length > 0;

    if (!hasExternal && !hasInternal) {
        return <p className="text-sm text-muted-foreground italic">No dependencies documented.</p>;
    }

    return (
        <div className="space-y-6">
            {/* External dependencies */}
            {hasExternal && (
                <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-cube text-muted-foreground text-xs" />
                        External Dependencies
                        <Badge variant="outline" className="text-[10px]">
                            {dependencies.external.length}
                        </Badge>
                    </h4>
                    <div className="space-y-2">
                        {dependencies.external.map((dep) => (
                            <div key={dep.name} className="flex items-start gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                <code className="font-mono text-primary shrink-0 mt-0.5">{dep.name}</code>
                                <Badge variant="outline" className="text-[10px] shrink-0">
                                    {dep.kind}
                                </Badge>
                                <span className="text-muted-foreground">{dep.why_used}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Internal dependencies */}
            {hasInternal && (
                <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-link text-muted-foreground text-xs" />
                        Internal Dependencies
                        <Badge variant="outline" className="text-[10px]">
                            {dependencies.internal.length}
                        </Badge>
                    </h4>
                    <div className="space-y-2">
                        {dependencies.internal.map((dep) => (
                            <div key={dep.import_path} className="flex items-start gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex flex-col gap-1 grow">
                                    <div className="flex items-center gap-2">
                                        <code className="font-mono text-primary">{dep.import_path}</code>
                                    </div>
                                    <p className="text-muted-foreground">{dep.why_used}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Link href={dep.link_to_nx_kb} className="text-xs text-primary hover:underline flex items-center gap-1">
                                        <i className="fa-solid fa-book text-[10px]" /> Docs
                                    </Link>
                                    <a href={dep.link_to_github} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                                        <i className="fa-brands fa-github text-[10px]" /> Source
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
