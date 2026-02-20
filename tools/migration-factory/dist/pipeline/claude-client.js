/**
 * Claude API client wrapper: testable, mockable factory.
 * v4: auto-enrichment of migration contracts via Claude API.
 */
import Anthropic from '@anthropic-ai/sdk';
export const createClaudeClient = (config = {}) => {
    const apiKey = config.apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!apiKey)
        throw new Error('ANTHROPIC_API_KEY required (env or --api-key)');
    const client = new Anthropic({ apiKey });
    const model = config.model ?? 'claude-haiku-4-5-20251001';
    const maxTokens = config.maxTokens ?? 2048;
    return {
        async classify(systemPrompt, userPrompt) {
            const response = await client.messages.create({
                model,
                max_tokens: maxTokens,
                system: systemPrompt,
                messages: [{ role: 'user', content: userPrompt }],
            });
            const text = response.content
                .filter((b) => b.type === 'text')
                .map(b => b.text)
                .join('');
            // Extract JSON from response (may be wrapped in ```json blocks)
            const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/);
            const jsonStr = jsonMatch?.[1]?.trim() ?? text.trim();
            const parsed = JSON.parse(jsonStr);
            return {
                items: parsed.items ?? [],
                reasoning: parsed.reasoning ?? '',
                inputTokens: response.usage.input_tokens,
                outputTokens: response.usage.output_tokens,
            };
        },
    };
};
//# sourceMappingURL=claude-client.js.map