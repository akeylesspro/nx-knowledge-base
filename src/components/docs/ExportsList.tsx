import type { FileExport } from "@/types/schema";
import { Badge } from "@/components/ui/badge";

type ExportsListProps = {
    exports: FileExport[];
};

const kindIcons: Record<string, string> = {
    function: "fa-solid fa-code",
    class: "fa-solid fa-cube",
    component: "fa-solid fa-puzzle-piece",
    interface: "fa-solid fa-shapes",
    type: "fa-solid fa-t",
    enum: "fa-solid fa-list-ol",
    value: "fa-solid fa-equals",
    constant: "fa-solid fa-lock",
};

export const ExportsList = ({ exports }: ExportsListProps) => {
    if (exports.length === 0) {
        return <p className="text-sm text-muted-foreground italic">No exports documented.</p>;
    }

    return (
        <div className="space-y-2">
            {exports.map((exp, index) => (
                <a key={getExportKey(exp, index)} href={`#${exp.symbol_id}`} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                    <i className={`${kindIcons[exp.kind] || "fa-solid fa-circle"} text-xs text-muted-foreground group-hover:text-primary transition-colors`} />
                    <code className="font-mono text-sm text-primary group-hover:underline">{exp.name}</code>
                    <Badge variant="outline" className="text-[10px]">
                        {exp.kind}
                    </Badge>
                    <span className="text-sm text-muted-foreground truncate">{exp.description_one_line}</span>
                </a>
            ))}
        </div>
    );
};

const getExportKey = (exp: FileExport, index: number): string => {
    return `${exp.symbol_id}-${exp.name}-${exp.kind}-${index}`;
};
