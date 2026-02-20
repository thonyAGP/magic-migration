/**
 * Generates API client module from a CodegenModel.
 * Follows adh-web pattern: import apiClient, export typed methods.
 */
import type { CodegenModel } from './codegen-model.js';
export declare const generateApi: (model: CodegenModel) => string;
