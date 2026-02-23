/**
 * Generates TypeScript type definitions from a CodegenModel.
 * Follows adh-web pattern: interface for objects, type for unions, const as const for enums.
 */
import type { CodegenModel } from './codegen-model.js';
export declare const generateTypes: (model: CodegenModel) => string;
