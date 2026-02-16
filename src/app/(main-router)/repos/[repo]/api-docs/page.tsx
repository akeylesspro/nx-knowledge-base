import { notFound } from "next/navigation";
import { getRepoMeta } from "@/lib/docs";
import { DocBreadcrumb } from "@/components/docs";
import { Badge } from "@/components/ui/badge";
import { TranslatedText } from "@/components/i18n";
import fs from "fs/promises";
import path from "path";

type ApiDocsPageProps = {
    params: Promise<{ repo: string }>;
};

type OpenApiSpec = {
    openapi: string;
    info: { title: string; version: string; description?: string };
    paths: Record<string, Record<string, { summary?: string; description?: string; operationId?: string; tags?: string[] }>>;
};

export default async function ApiDocsPage({ params }: ApiDocsPageProps) {
    const { repo } = await params;
    const meta = await getRepoMeta(repo);

    if (!meta) return notFound();

    // Try to load OpenAPI spec
    let spec: OpenApiSpec | null = null;
    try {
        const specPath = path.join(process.cwd(), "repos", repo, "openapi", "openapi.json");
        const raw = await fs.readFile(specPath, "utf-8");
        spec = JSON.parse(raw) as OpenApiSpec;
    } catch {
        spec = null;
    }

    return (
        <div className="w-full h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto py-8 px-6">
                <DocBreadcrumb repoName={repo} filePath="api-docs" />

                <div className="mt-6 mb-8">
                    <h1 className="text-2xl font-bold mb-2"><TranslatedText tKey="app.api_docs_title" /></h1>
                    <p className="text-muted-foreground">{meta.display_name} — <TranslatedText tKey="app.api_docs_openapi" /></p>
                </div>

                {!spec ? (
                    <div className="text-center py-16 bg-card rounded-xl border border-border">
                        <i className="fa-solid fa-plug text-4xl text-muted-foreground mb-4 block" />
                        <h3 className="text-lg font-medium mb-2"><TranslatedText tKey="app.no_api_spec" /></h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            <TranslatedText tKey="app.no_api_spec_hint" />
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Spec info */}
                        <div className="bg-card rounded-xl border border-border p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-lg font-semibold">{spec.info.title}</h2>
                                <Badge variant="outline">v{spec.info.version}</Badge>
                                <Badge variant="secondary">OpenAPI {spec.openapi}</Badge>
                            </div>
                            {spec.info.description && <p className="text-sm text-muted-foreground">{spec.info.description}</p>}
                        </div>

                        {/* Endpoints */}
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold"><TranslatedText tKey="app.endpoints" /></h2>
                            {Object.entries(spec.paths).map(([pathStr, methods]) =>
                                Object.entries(methods).map(([method, details]) => (
                                    <div key={`${method}-${pathStr}`} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                                        <Badge className={getMethodColor(method.toUpperCase())}>{method.toUpperCase()}</Badge>
                                        <div className="grow">
                                            <code className="font-mono text-sm font-medium">{pathStr}</code>
                                            {details.summary && <p className="text-sm text-muted-foreground mt-1">{details.summary}</p>}
                                            {details.tags && (
                                                <div className="flex gap-1 mt-2">
                                                    {details.tags.map((tag) => (
                                                        <Badge key={tag} variant="outline" className="text-[10px]">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const getMethodColor = (method: string): string => {
    const colors: Record<string, string> = {
        GET: "bg-green-100 text-green-800",
        POST: "bg-blue-100 text-blue-800",
        PUT: "bg-orange-100 text-orange-800",
        PATCH: "bg-yellow-100 text-yellow-800",
        DELETE: "bg-red-100 text-red-800",
    };
    return colors[method] || "bg-gray-100 text-gray-800";
};
