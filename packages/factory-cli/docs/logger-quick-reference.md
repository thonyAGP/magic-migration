# Logger Quick Reference

## Import

```typescript
import { logger, createLogger, logError, startTimer } from '../utils/logger.js';
import { withCorrelation, createBatchLogger } from '../core/correlation.js';
```

---

## Patterns d'Utilisation

### 1. Logger Simple (contexte statique)

```typescript
const log = createLogger({ component: 'pipeline', phase: 'extract' });

log.debug('Starting extraction');
log.info('Program extracted successfully');
log.warn({ programId: 237 }, 'Program has gaps');
log.error({ err: error }, 'Extraction failed');
```

### 2. Logger avec Correlation ID (opération complète)

```typescript
await withCorrelation(async (correlationId) => {
  const log = createLogger({ correlationId, phase: 'extract' });

  log.info({ programId: 237 }, 'Starting extraction');
  // ... do work ...
  log.info({ programId: 237 }, 'Extraction completed');
});
```

### 3. Timer de Performance

```typescript
const endTimer = startTimer(
  { correlationId, programId: 237 },
  'Extract program 237'
);

// ... do work ...

endTimer(); // Logs: "Extract program 237 completed in 1234ms"
```

### 4. Logger pour Batch Processing

```typescript
const batchLogger = createBatchLogger(correlationId, {
  batchId: 'B2',
  batchSize: 25,
});

for (const program of programs) {
  const itemLog = batchLogger.forItem(program.id);
  itemLog.info('Processing program');

  // ... process program ...

  itemLog.info({ status: 'completed' }, 'Program processed');
}
```

### 5. Error Logging avec Stack Trace

```typescript
try {
  await processProg ram(237);
} catch (error) {
  logError(
    { correlationId, programId: 237, phase: 'extract' },
    error as Error,
    'Failed to process program'
  );
  throw error; // re-throw si nécessaire
}
```

---

## Niveaux de Log

| Niveau | Quand Utiliser | Exemple |
|--------|----------------|---------|
| `debug` | Détails techniques (désactivé en prod) | Variable values, flow details |
| `info` | Opérations importantes | "Program extracted", "Batch started" |
| `warn` | Situations anormales mais gérables | "Program has gaps", "Retry attempt 2/3" |
| `error` | Erreurs nécessitant attention | "Extraction failed", "API error" |

**Config:**
```bash
# Development
LOG_LEVEL=debug pnpm dev

# Production
LOG_LEVEL=info pnpm start
```

---

## Redaction Automatique

Ces champs sont **automatiquement masqués** dans les logs:

- `password`, `pwd`
- `token`, `accessToken`, `refreshToken`
- `secret`, `apiKey`, `anthropicApiKey`
- `creditCard`, `cvv`

```typescript
// Exemple: les champs sensibles sont automatiquement masqués
log.info({
  username: 'john',
  apiKey: 'sk-1234567890'  // ← redacted field
}, 'User logged in');

// Output: {"username":"john","msg":"User logged in"}
// apiKey supprimé automatiquement par pino
```

---

## Output Format

### Development (pino-pretty)

```
[09:15:22] INFO (pipeline/extract): Program extracted successfully
    correlationId: "a1b2c3d4-..."
    programId: 237
    elapsed: 1234
```

### Production (JSON)

```json
{"level":30,"time":1708858925000,"component":"pipeline","phase":"extract","correlationId":"a1b2c3d4-...","programId":237,"elapsed":1234,"msg":"Program extracted successfully"}
```

---

## Testing (Mock Logger)

```typescript
// tests/setup.ts
import { vi } from 'vitest';

vi.mock('../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
  logError: vi.fn(),
  startTimer: vi.fn(() => vi.fn()),
}));
```

---

## Best Practices

### ✅ DO

```typescript
// Contexte structuré
log.info({ programId: 237, phase: 'extract' }, 'Processing started');

// Message clair et actionnable
log.error({ programId: 237, reason: 'file_not_found' }, 'Failed to read program spec');

// Correlation ID pour tracer bout-en-bout
await withCorrelation(async (correlationId) => {
  // ... toute l'opération ...
});
```

### ❌ DON'T

```typescript
// Message vague
log.info('Processing');

// String interpolation (use structured fields)
log.info(`Processing program ${programId}`);

// Logger dans une boucle serrée (10000x/sec)
for (let i = 0; i < 10000; i++) {
  log.debug(`Iteration ${i}`); // ❌ SPAM
}

// Secrets en clair
log.info(`API key: ${apiKey}`); // ❌ Leak
```

---

## Querying Logs

### Grep par Correlation ID

```bash
cat logs.json | grep "a1b2c3d4" | jq
```

### Filtrer par niveau

```bash
cat logs.json | jq 'select(.level >= 50)' # Errors only
```

### Statistiques de performance

```bash
cat logs.json | jq 'select(.elapsed) | .elapsed' | awk '{sum+=$1; n++} END {print sum/n}'
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `info` (prod) / `debug` (dev) | Minimum log level |
| `NODE_ENV` | `development` | Switches between pretty/JSON |

```bash
# Development verbose
LOG_LEVEL=debug NODE_ENV=development pnpm dev

# Production JSON logs
LOG_LEVEL=info NODE_ENV=production pnpm start
```
