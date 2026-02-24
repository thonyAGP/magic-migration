/**
 * SWARM System - Multi-agent collaborative migration
 *
 * Public API exports
 */

// Core types
export type {
  AgentRole,
  AgentVote,
  AgentAnalysis,
  AgentConcern,
  VoteValue,
  ConcernSeverityLevel,
  ConsensusResult,
  ComplexityIndicators,
  ComplexityScore,
  SwarmSession,
  SwarmConfig,
  DoubleVoteSession,
} from './types.js';

export {
  AgentRoles,
  AgentWeights,
  VoteValues,
  VoteNumericValues,
  ConcernSeverity,
  ConsensusThresholds,
  DEFAULT_SWARM_CONFIG,
} from './types.js';

// Complexity calculator
export {
  calculateComplexity,
  formatComplexityReport,
} from './complexity-calculator.js';

// Voting system
export {
  calculateConsensus,
  formatConsensusReport,
  validateVote,
  calculateAgreement,
  findDissenters,
} from './voting/consensus-engine.js';

export { createVoteCollector, VoteCollector } from './voting/vote-collector.js';

export {
  executeDoubleVote,
  formatDoubleVoteReport,
  compareVoteRounds,
  validateDoubleVoteSession,
  type DoubleVoteResult,
} from './voting/double-vote.js';

// Agents
export {
  BaseAgent,
  type AgentConfig,
  type AnalysisContext,
  type AgentFactory,
} from './agents/base-agent.js';

// Orchestrator
export {
  SwarmOrchestrator,
  createSwarmOrchestrator,
  type SwarmResult,
} from './orchestrator.js';
