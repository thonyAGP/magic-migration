/**
 * Project-level effort estimator.
 * Aggregates individual program scores into project estimation.
 */
import { scoreProgram, DEFAULT_ESTIMATION_CONFIG } from './complexity-scorer.js';
export const estimateProject = (input) => {
    const { programs, contracts, programStatuses, maxLevel = 8, config = DEFAULT_ESTIMATION_CONFIG, } = input;
    const estimations = programs.map(p => {
        const contract = contracts.get(p.id);
        const score = scoreProgram({
            program: p,
            contract,
            maxLevel,
        }, config);
        return {
            id: p.id,
            name: p.name,
            score,
            status: programStatuses.get(p.id) ?? 'pending',
        };
    });
    // Sort by score descending for top-N retrieval
    estimations.sort((a, b) => b.score.normalizedScore - a.score.normalizedScore);
    const totalEstimatedHours = estimations.reduce((sum, e) => sum + e.score.estimatedHours, 0);
    const totalScore = estimations.reduce((sum, e) => sum + e.score.normalizedScore, 0);
    const avgComplexityScore = estimations.length > 0
        ? Math.round(totalScore / estimations.length)
        : 0;
    const gradeDistribution = { S: 0, A: 0, B: 0, C: 0, D: 0 };
    for (const e of estimations) {
        gradeDistribution[e.score.grade] = (gradeDistribution[e.score.grade] ?? 0) + 1;
    }
    return {
        programs: estimations,
        totalEstimatedHours: Math.round(totalEstimatedHours * 10) / 10,
        avgComplexityScore,
        gradeDistribution,
        calibration: config,
    };
};
/**
 * Compute remaining hours (programs not yet verified).
 */
export const computeRemainingHours = (estimation) => {
    return Math.round(estimation.programs
        .filter(p => p.status !== 'verified')
        .reduce((sum, p) => sum + p.score.estimatedHours, 0) * 10) / 10;
};
//# sourceMappingURL=effort-estimator.js.map