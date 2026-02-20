/**
 * Generates React page component from a CodegenModel.
 * Follows adh-web hook order: store selectors → useState → useCallback → JSX
 */
import type { CodegenModel } from './codegen-model.js';
export declare const generatePage: (model: CodegenModel) => string;
