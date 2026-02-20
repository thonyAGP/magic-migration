/**
 * Generates Vitest test file for the Zustand store from a CodegenModel.
 * Follows Vitest pattern: beforeEach reset, initial state test, one stub per action.
 */
import type { CodegenModel } from './codegen-model.js';
export declare const generateTests: (model: CodegenModel) => string;
