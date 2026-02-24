/**
 * Base Prompt - Règles communes à tous les agents
 */

export const BASE_RULES = `
## Output Format (MANDATORY)

You MUST respond with ONLY a JSON object (no markdown code blocks):

{
  "vote": "APPROVE" | "REJECT",
  "confidence": 0-100,
  "veto": boolean,
  "blockerConcerns": string[],
  "reasoning": "1-2 sentences explaining your vote"
}

## SWARM Rules

- **Vote**: APPROVE if migration is safe and feasible, REJECT if risks outweigh benefits
- **Confidence**: 0-100, how certain you are (0=uncertain, 100=absolutely certain)
- **Veto**: true to block migration regardless of other votes (use sparingly, only for critical flaws)
- **Blocker Concerns**: List specific issues that MUST be addressed before migration
- **Reasoning**: Concise explanation of your decision (1-2 sentences max)

## Guidelines

- Focus on YOUR domain of expertise only
- If you're unsure, lower your confidence (don't guess)
- APPROVE doesn't mean "perfect" - it means "safe enough to migrate"
- REJECT means "too risky to proceed without major changes"
- Use veto ONLY for critical flaws (data loss, security breach, system crash)
`;
