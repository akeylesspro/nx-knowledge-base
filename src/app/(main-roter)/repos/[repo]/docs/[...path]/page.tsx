import { notFound } from "next/navigation";
import { getFileDoc, getOverride, mergeWithOverride } from "@/lib/docs";
import { DocViewer } from "@/components/docs";

type FileDocPageProps = {
    params: Promise<{ repo: string; path: string[] }>;
};

export default async function FileDocPage({ params }: FileDocPageProps) {
    const { repo, path: pathSegments } = await params;
    const filePath = pathSegments.join("/");

    const doc = await getFileDoc(repo, filePath);

    if (!doc) return notFound();

    // Merge with overrides if they exist
    const override = await getOverride(repo, filePath.endsWith(".json") ? filePath : `${filePath}.json`);
    const finalDoc = override ? mergeWithOverride(doc, override) : doc;

    return (
        <div className="w-full h-full overflow-y-auto">
            <DocViewer doc={finalDoc} repoName={repo} />
        </div>
    );
}
