
import Link from "next/link";

export default async function Home() {
    return (
        <div className="h-full w-full bg-background p-8">
            <div className="mx-auto flex h-full max-w-4xl flex-col items-start justify-center gap-5">
                <h1 className="text-4xl font-bold text-foreground">NX-KNOWLEDGE-BASE</h1>
                <p className="max-w-2xl text-muted-foreground">
                    Central repository for generated file documentation, symbol-level references, OpenAPI coverage, and AI-ready endpoints.
                </p>
                <Link href="/docs" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90">
                    Open documentation hub
                </Link>
            </div>
        </div>
    );
}
