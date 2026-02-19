/**
 * Pipeline status lifecycle management.
 * pending -> contracted -> enriched -> verified
 */

import { PipelineStatus } from './types.js';

const TRANSITIONS: Record<string, string[]> = {
  [PipelineStatus.PENDING]: [PipelineStatus.CONTRACTED],
  [PipelineStatus.CONTRACTED]: [PipelineStatus.ENRICHED, PipelineStatus.PENDING],
  [PipelineStatus.ENRICHED]: [PipelineStatus.VERIFIED, PipelineStatus.CONTRACTED],
  [PipelineStatus.VERIFIED]: [],
};

export const canTransition = (from: string, to: string): boolean =>
  (TRANSITIONS[from] ?? []).includes(to);

export const nextStatus = (current: string): string | null => {
  const options = TRANSITIONS[current] ?? [];
  return options[0] ?? null;
};

export const isTerminal = (status: string): boolean =>
  status === PipelineStatus.VERIFIED;

export const statusOrder = (status: string): number => {
  switch (status) {
    case PipelineStatus.PENDING: return 0;
    case PipelineStatus.CONTRACTED: return 1;
    case PipelineStatus.ENRICHED: return 2;
    case PipelineStatus.VERIFIED: return 3;
    default: return -1;
  }
};

export const isAtLeast = (status: string, minimum: string): boolean =>
  statusOrder(status) >= statusOrder(minimum);
