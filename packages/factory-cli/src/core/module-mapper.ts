/**
 * Functional Module Mapper
 *
 * Defines functional modules for Scenario B (Essential Modules - 66 programs).
 * Maps existing batches to logical business modules for phased migration.
 *
 * Based on: ADH_COVERAGE_ANALYSIS.md + SWARM verdict 2026-03-06
 */

import type { FunctionalModule, Tracker, PipelineStatus } from './types.js';

/**
 * Module definitions for Scenario B (6 modules, 66 programs, 29 weeks).
 */
export const SCENARIO_B_MODULES: FunctionalModule[] = [
  {
    id: 'MOD_DIVERS',
    name: 'Divers + Utils',
    description: 'Programmes utilitaires partagés (langue, droits, timestamps)',
    batches: ['B3', 'B4'], // General 1/2 + 2/2
    programs: [42, 43, 44, 45, 46, 47, 48], // IDE 42-48
    domain: 'Utilitaires',
    priority: 1,
    wave: 0,
    dependencies: [],
    estimatedHours: 8,
  },
  {
    id: 'MOD_SESSIONS',
    name: 'Sessions/Caisse',
    description: 'Gestion sessions caisse + ouverture/fermeture',
    batches: ['B1', 'B2'], // Ouverture + Caisse
    programs: [116, 121, 122, 131, 137, 138], // IDE 116-155 subset (6 core programs)
    domain: 'Caisse',
    priority: 2,
    wave: 1,
    dependencies: ['MOD_DIVERS'],
    estimatedHours: 30,
  },
  {
    id: 'MOD_VENTES',
    name: 'Ventes',
    description: 'Transactions ventes + historique + Gift Pass',
    batches: ['B9'], // Ventes
    programs: [229, 233, 234, 235, 236, 237, 238, 239, 240, 241, 243, 244, 247, 248, 249, 250, 251], // IDE 229-251
    domain: 'Ventes',
    priority: 3,
    wave: 2,
    dependencies: ['MOD_SESSIONS'],
    estimatedHours: 45,
  },
  {
    id: 'MOD_EXTRAIT',
    name: 'Extrait Compte',
    description: 'Extraits de compte avec filtres (nom, date, cumul, service) et impression',
    batches: ['B6'], // Compte
    programs: [69, 70, 71, 72, 73, 74, 76], // IDE 69-76 (7 programs)
    domain: 'Extrait',
    priority: 3,
    wave: 2, // Parallel with Ventes
    dependencies: ['MOD_SESSIONS'],
    estimatedHours: 20,
  },
  {
    id: 'MOD_CHANGE_GARANTIES',
    name: 'Change + Garanties',
    description: 'Change devise + Garanties compte',
    batches: ['B7', 'B13'], // Change + Garantie
    programs: [20, 21, 22, 23, 24, 25, 111, 112, 107, 108], // IDE 20-25 + 111-114
    domain: 'Change',
    priority: 4,
    wave: 3,
    dependencies: ['MOD_SESSIONS'],
    estimatedHours: 25,
  },
  {
    id: 'MOD_ECO_FACTURES',
    name: 'Easy Check-Out + Factures',
    description: 'Easy Check-Out + Factures TVA',
    batches: ['B15', 'B16'], // Easy Check-Out + Factures
    programs: [53, 54, 64, 65, 89, 90, 97], // IDE 53-67 + 89-97 subset
    domain: 'Check-Out',
    priority: 5,
    wave: 4,
    dependencies: ['MOD_SESSIONS', 'MOD_VENTES'],
    estimatedHours: 25,
  },
];

/**
 * Load functional modules (Scenario B definitions).
 */
export const loadModules = (): FunctionalModule[] => {
  return SCENARIO_B_MODULES;
};

/**
 * Get module by ID.
 */
export const getModule = (moduleId: string): FunctionalModule | undefined => {
  return SCENARIO_B_MODULES.find((m) => m.id === moduleId);
};

/**
 * Compute module status from tracker.
 * Status = aggregate of all batches in module.
 */
export const computeModuleStatus = (module: FunctionalModule, tracker: Tracker): PipelineStatus => {
  const batchStatuses = module.batches
    .map((batchId) => tracker.batches.find((b) => b.id === batchId)?.status)
    .filter((s): s is PipelineStatus => s !== undefined);

  if (batchStatuses.length === 0) return 'pending';

  // All verified → module verified
  if (batchStatuses.every((s) => s === 'verified')) return 'verified';

  // Any enriched → module enriched
  if (batchStatuses.some((s) => s === 'enriched')) return 'enriched';

  // Any contracted → module contracted
  if (batchStatuses.some((s) => s === 'contracted')) return 'contracted';

  return 'pending';
};

/**
 * Get all modules in a specific wave.
 */
export const getModulesByWave = (wave: number): FunctionalModule[] => {
  return SCENARIO_B_MODULES.filter((m) => m.wave === wave);
};

/**
 * Get unsatisfied dependencies for a module.
 */
export const getUnsatisfiedDependencies = (
  module: FunctionalModule,
  tracker: Tracker,
): string[] => {
  return module.dependencies.filter((depId) => {
    const dep = getModule(depId);
    if (!dep) return false;
    const status = computeModuleStatus(dep, tracker);
    return status !== 'verified';
  });
};
