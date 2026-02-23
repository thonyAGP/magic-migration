/**
 * Generates Zustand store from a CodegenModel.
 * Follows adh-web pattern: create<T>()((set, get) => ({...}))
 */
import type { CodegenModel } from './codegen-model.js';
export declare const generateStore: (model: CodegenModel) => string;
