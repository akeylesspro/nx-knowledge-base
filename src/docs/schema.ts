/* =========================================================
   NX-KNOWLEDGE-BASE-SCHEMA
   ========================================================= */


export type LanguageTag = "ts" | "tsx" | "js" | "jsx" | "vue" | "unknown";

export type FrameworkTag = "express" | "next" | "react" | "vue" | "node" | string;

export type DependencyKind = "runtime" | "dev" | "peer";

export type SymbolKind = "function" | "class" | "component" | "interface" | "type" | "enum" | "value" | "constant";

export type ConfidenceLevel = "low" | "medium" | "high";

/* =========================================================
      Root Document
      ========================================================= */

export interface KnowledgeBaseSchema {
    schema_version: string;
    doc_id: string;
    repo: RepoMetadata;
    file_name: string;
    source: SourceMetadata;

    summary: FileSummary;
    dependencies: FileDependencies;

    exports: FileExport[];
    symbols: FileSymbol[];

    swagger?: FileSwaggerSection;

    quality: FileQuality;
}

/* =========================================================
      Repo + Source
      ========================================================= */

export interface RepoMetadata {
    name: string;
    source_default_branch: string;
}

export interface SourceMetadata {
    file_path: string;
    commit_sha: string;
    generated_at_iso: string;

    language: LanguageTag;
    framework_tags: FrameworkTag[];

    link_to_github: string;
    link_to_nx_kb: string;
}

/* =========================================================
      Summary
      ========================================================= */

export interface FileSummary {
    purpose: string;
    problem_solved: string;
}

/* =========================================================
      Dependencies
      ========================================================= */

export interface FileDependencies {
    external: ExternalDependency[];
    internal: InternalDependency[];
}

export interface ExternalDependency {
    name: string;
    kind: DependencyKind;
    why_used: string;
}

export interface InternalDependency {
    import_path: string;
    resolved_file_path: string;
    why_used: string;

    link_to_nx_kb: string;
    link_to_github: string;
}

/* =========================================================
      Exports
      ========================================================= */

export interface FileExport {
    name: string;
    kind: SymbolKind;
    description_one_line: string;
    symbol_id: string;
}

/* =========================================================
      Symbols
      ========================================================= */

export interface FileSymbol {
    symbol_id: string;
    name: string;
    kind: SymbolKind;

    description_one_line: string;

    signature?: SymbolSignature;
    details: SymbolDetails;
    examples?: SymbolExamples;

    locations: SymbolLocation;
}

export interface SymbolSignature {
    params: SymbolParam[];
    returns: SymbolReturn;
}

export interface SymbolParam {
    name: string;
    type: string;
    required: boolean;
    description: string;
}

export interface SymbolReturn {
    type: string;
    description: string;
}

/* =========================================================
      Details
      ========================================================= */

export interface SymbolDetails {
    what_it_does: string;

    side_effects?: string[];

    error_cases?: {
        condition: string;
        behavior: string;
    }[];

    /**
     * Optional class-specific details
     */
    methods?: ClassMethodDoc[];

    /**
     * Optional component-specific details
     */
    rendered_ui_description?: string;
}

export interface ClassMethodDoc {
    name: string;
    description_one_line: string;
    signature: SymbolSignature;
}

/* =========================================================
      Examples
      ========================================================= */

export interface SymbolExamples {
    minimal_correct?: CodeExample;
    extensive_correct?: CodeExample;
    incorrect?: IncorrectExample;
}

export interface CodeExample {
    title: string;
    code: string;
}

export interface IncorrectExample extends CodeExample {
    why_incorrect: string;
}

/* =========================================================
      Locations
      ========================================================= */

export interface SymbolLocation {
    source_line_start: number;
    source_line_end: number;

    github_permalink: string;
    nx_kb_anchor: string;
}

/* =========================================================
      Swagger
      ========================================================= */

export interface FileSwaggerSection {
    covered_endpoints: SwaggerEndpointRef[];
}

export interface SwaggerEndpointRef {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";
    path: string;
    operation_id: string;
    confidence: ConfidenceLevel;
}

/* =========================================================
      Quality
      ========================================================= */

export interface FileQuality {
    generation_confidence: ConfidenceLevel;
    known_gaps?: string[];

    last_reviewed_by?: string;
    last_reviewed_at_iso?: string;
}
