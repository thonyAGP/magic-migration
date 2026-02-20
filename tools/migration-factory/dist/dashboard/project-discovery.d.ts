/**
 * Project discovery utilities: find active migration projects and read registry.
 * Extracted from cli.ts for reuse by both CLI and action server.
 */
/**
 * Resolve the codebase directory for a project.
 * Priority: registry.codebaseDir → convention {name}-web/src → projectDir fallback.
 */
export declare const resolveCodebaseDir: (projectDir: string, projectName: string, registry: RegistryEntry[]) => string;
export interface RegistryEntry {
    name: string;
    programs: number;
    description: string;
    codebaseDir?: string;
}
export declare const discoverProjects: (migrationDir: string) => string[];
export declare const readProjectRegistry: (migrationDir: string) => RegistryEntry[];
