/**
 * SWARM Configuration Loader
 *
 * Loads and validates SWARM configuration from YAML file
 */

import { readFileSync, existsSync } from 'node:fs';
import { parse as parseYAML } from 'yaml';
import type { SwarmConfig, AgentRole } from './types.js';
import { DEFAULT_SWARM_CONFIG, AgentRoles } from './types.js';

/**
 * Agent-specific configuration
 */
export interface AgentConfig {
  enabled: boolean;
  weight: number;
  model: 'haiku' | 'sonnet' | 'opus';
}

/**
 * Full SWARM configuration from YAML
 */
export interface SwarmConfigYAML {
  enabled?: boolean;
  complexityThreshold?: number;
  consensusStandardThreshold?: number;
  consensusCriticalThreshold?: number;

  agents?: {
    [key in AgentRole]?: AgentConfig;
  };

  iterations?: {
    maxRounds?: number;
    stagnationThreshold?: number;
    roundTimeout?: number;
    totalTimeout?: number;
  };

  doubleVote?: {
    enabled?: boolean;
    expressionThreshold?: number;
    criticalKeywords?: string[];
  };
}

/**
 * Load SWARM configuration from YAML file
 *
 * @param configPath - Path to .swarm.config.yaml file
 * @returns Validated SWARM configuration
 */
export function loadSwarmConfig(configPath: string = '.swarm.config.yaml'): SwarmConfig {
  // Use defaults if file doesn't exist
  if (!existsSync(configPath)) {
    console.warn(
      `[SWARM] Config file ${configPath} not found, using defaults`,
    );
    return DEFAULT_SWARM_CONFIG;
  }

  try {
    // Read and parse YAML
    const yamlContent = readFileSync(configPath, 'utf-8');
    const yamlConfig = parseYAML(yamlContent) as SwarmConfigYAML;

    // Merge with defaults
    const config: SwarmConfig = {
      enabled: yamlConfig.enabled ?? DEFAULT_SWARM_CONFIG.enabled,
      complexityThreshold:
        yamlConfig.complexityThreshold ?? DEFAULT_SWARM_CONFIG.complexityThreshold,
      consensusThresholdStandard:
        yamlConfig.consensusStandardThreshold ??
        DEFAULT_SWARM_CONFIG.consensusThresholdStandard,
      consensusThresholdCritical:
        yamlConfig.consensusCriticalThreshold ??
        DEFAULT_SWARM_CONFIG.consensusThresholdCritical,
      doubleVoteEnabled:
        yamlConfig.doubleVote?.enabled ?? DEFAULT_SWARM_CONFIG.doubleVoteEnabled,
      model: DEFAULT_SWARM_CONFIG.model, // Will be overridden per-agent
      maxConcurrentAgents: DEFAULT_SWARM_CONFIG.maxConcurrentAgents,
      enableVisualization: DEFAULT_SWARM_CONFIG.enableVisualization,
      maxRounds: DEFAULT_SWARM_CONFIG.maxRounds,
    };

    // Validate
    const validation = validateSwarmConfig(config, yamlConfig);
    if (!validation.valid) {
      console.error('[SWARM] Config validation errors:', validation.errors);
      throw new Error(`Invalid SWARM config: ${validation.errors.join(', ')}`);
    }

    return config;
  } catch (error) {
    console.error('[SWARM] Failed to load config:', error);
    console.warn('[SWARM] Falling back to defaults');
    return DEFAULT_SWARM_CONFIG;
  }
}

/**
 * Validate SWARM configuration
 */
export function validateSwarmConfig(
  config: SwarmConfig,
  yamlConfig?: SwarmConfigYAML,
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate complexity threshold
  if (config.complexityThreshold < 0 || config.complexityThreshold > 100) {
    errors.push('complexityThreshold must be between 0 and 100');
  }

  // Validate consensus thresholds
  if (
    config.consensusThresholdStandard < 50 ||
    config.consensusThresholdStandard > 100
  ) {
    errors.push('consensusStandardThreshold must be between 50 and 100');
  }

  if (
    config.consensusThresholdCritical < 50 ||
    config.consensusThresholdCritical > 100
  ) {
    errors.push('consensusCriticalThreshold must be between 50 and 100');
  }

  if (config.consensusThresholdCritical < config.consensusThresholdStandard) {
    errors.push(
      'consensusCriticalThreshold must be >= consensusStandardThreshold',
    );
  }

  // Validate agent configs
  if (yamlConfig?.agents) {
    for (const [agentKey, agentConfig] of Object.entries(yamlConfig.agents)) {
      // Validate agent name
      if (!Object.values(AgentRoles).includes(agentKey as AgentRole)) {
        errors.push(`Unknown agent: ${agentKey}`);
        continue;
      }

      // Validate weight
      if (agentConfig.weight < 0 || agentConfig.weight > 5) {
        errors.push(`${agentKey}.weight must be between 0 and 5`);
      }

      // Validate model
      if (!['haiku', 'sonnet', 'opus'].includes(agentConfig.model)) {
        errors.push(
          `${agentKey}.model must be one of: haiku, sonnet, opus`,
        );
      }
    }
  }

  // Validate iterations
  if (yamlConfig?.iterations) {
    if (
      yamlConfig.iterations.maxRounds !== undefined &&
      (yamlConfig.iterations.maxRounds < 1 || yamlConfig.iterations.maxRounds > 10)
    ) {
      errors.push('iterations.maxRounds must be between 1 and 10');
    }

    if (
      yamlConfig.iterations.stagnationThreshold !== undefined &&
      (yamlConfig.iterations.stagnationThreshold < 1 ||
        yamlConfig.iterations.stagnationThreshold > 5)
    ) {
      errors.push('iterations.stagnationThreshold must be between 1 and 5');
    }
  }

  // Warnings
  if (config.complexityThreshold < 30) {
    warnings.push(
      'complexityThreshold < 30 may activate SWARM too often for simple programs',
    );
  }

  if (config.consensusThresholdStandard < 60) {
    warnings.push('consensusStandardThreshold < 60 may accept low-quality migrations');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get agent-specific configuration
 */
export function getAgentConfig(
  agent: AgentRole,
  yamlConfig?: SwarmConfigYAML,
): AgentConfig {
  const defaults: Record<AgentRole, AgentConfig> = {
    architect: { enabled: true, weight: 2.0, model: 'opus' },
    analyst: { enabled: true, weight: 2.0, model: 'sonnet' },
    developer: { enabled: true, weight: 1.0, model: 'haiku' },
    tester: { enabled: true, weight: 1.5, model: 'sonnet' },
    reviewer: { enabled: true, weight: 1.5, model: 'opus' },
    documentor: { enabled: true, weight: 0.5, model: 'haiku' },
  };

  const defaultConfig = defaults[agent];

  if (!yamlConfig?.agents || !yamlConfig.agents[agent]) {
    return defaultConfig;
  }

  const agentConfig = yamlConfig.agents[agent]!;

  return {
    enabled: agentConfig.enabled ?? defaultConfig.enabled,
    weight: agentConfig.weight ?? defaultConfig.weight,
    model: agentConfig.model ?? defaultConfig.model,
  };
}

/**
 * Get all enabled agents
 */
export function getEnabledAgents(yamlConfig?: SwarmConfigYAML): AgentRole[] {
  const allAgents: AgentRole[] = [
    AgentRoles.ARCHITECT,
    AgentRoles.ANALYST,
    AgentRoles.DEVELOPER,
    AgentRoles.TESTER,
    AgentRoles.REVIEWER,
    AgentRoles.DOCUMENTOR,
  ];

  return allAgents.filter((agent) => {
    const config = getAgentConfig(agent, yamlConfig);
    return config.enabled;
  });
}

/**
 * Export default config as YAML template
 */
export function generateDefaultConfigYAML(): string {
  return `# SWARM Configuration
# Generated: ${new Date().toISOString()}

# Enable/disable SWARM system
enabled: false  # Opt-in explicitly

# Complexity score threshold to activate SWARM (0-100)
complexityThreshold: 50

# Consensus thresholds (%)
consensusStandardThreshold: 70   # For standard programs
consensusCriticalThreshold: 80   # For critical programs

# Agent configuration
agents:
  architect:
    enabled: true
    weight: 2.0      # High influence (strategic decisions)
    model: opus      # Premium model for architecture

  analyst:
    enabled: true
    weight: 2.0      # High influence (correctness critical)
    model: sonnet    # Balanced model for business logic

  developer:
    enabled: true
    weight: 1.0      # Standard influence
    model: haiku     # Fast model for code review

  tester:
    enabled: true
    weight: 1.5      # Quality gate
    model: sonnet    # Balanced for comprehensive testing

  reviewer:
    enabled: true
    weight: 1.5      # Security/performance critical
    model: opus      # Premium for security review

  documentor:
    enabled: true
    weight: 0.5      # Non-blocking
    model: haiku     # Fast for documentation

# Iteration strategy
iterations:
  maxRounds: 10              # Maximum voting rounds (1-10)
  stagnationThreshold: 2     # Consecutive unchanged rounds to detect stagnation
  roundTimeout: 120          # Timeout per round (seconds)
  totalTimeout: 3600         # Total session timeout (seconds)

# Double vote configuration
doubleVote:
  enabled: true
  expressionThreshold: 30    # Trigger for programs with 30+ expressions
  criticalKeywords:
    - payment
    - security
    - compliance
    - GDPR
    - PCI-DSS
    - encryption
    - audit
    - authentication
    - authorization

# Note: This config can be modified via web interface
# Direct file edits may be overwritten by UI changes
`;
}
