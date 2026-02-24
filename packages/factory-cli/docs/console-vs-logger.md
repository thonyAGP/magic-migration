# Console.log vs Logger - Guide de Décision

> Quand utiliser `console.log` vs `logger` dans Factory CLI

---

## Règle Fondamentale

| Outil | Usage | Environnement |
|-------|-------|---------------|
| **console.log** | Output utilisateur CLI | Toujours visible |
| **logger** | Tracing interne / debugging | Contrôlé par LOG_LEVEL |

---

## ✅ GARDER console.log

### 1. **Résultats de Commandes CLI**

```typescript
// cli.ts - Affichage résultats pour l'utilisateur
console.log(`Graph analysis complete:`);
console.log(`  Programs: ${graph.programs.length}`);
console.log(`  Max level: ${resolved.maxLevel}`);
```

**Pourquoi**: L'utilisateur DOIT voir le résultat de sa commande.

### 2. **Bannières et Messages de Démarrage**

```typescript
// action-server.ts - Banner de démarrage
console.log(`\n  Migration Factory Dashboard`);
console.log(`  http://localhost:${config.port}\n`);
console.log(`  Press Ctrl+C to stop\n`);
```

**Pourquoi**: L'utilisateur a besoin de savoir que le serveur est démarré et comment y accéder.

### 3. **Messages de Succès/Confirmation**

```typescript
// cli.ts - Confirmation d'action
console.log(`✅ Contract generated: ${outFile}`);
console.log(`📊 Coverage: ${coverage}%`);
```

**Pourquoi**: Feedback immédiat à l'utilisateur.

### 4. **Progress Indicators (stdout)**

```typescript
// Affichage progression pour l'utilisateur
console.log(`Processing batch 2/5...`);
```

**Pourquoi**: L'utilisateur veut voir la progression.

---

## ✅ AJOUTER logger

### 1. **Opérations Internes HTTP**

```typescript
// action-server.ts - Tracer les requêtes
const reqLogger = createLogger({
  correlationId,
  method: req.method,
  pathname,
  userAgent: req.headers['user-agent'],
});

reqLogger.info('Request received');
// ... traitement ...
reqLogger.info({ elapsed }, 'Request completed');
```

**Pourquoi**: Debugging production, analyse de performance, correlation.

### 2. **Génération de Code**

```typescript
// codegen-runner.ts - Tracer chaque fichier généré
const log = createLogger({ correlationId, programId });

log.info({ file: 'Page.tsx' }, 'Generating page component');
log.info({ file: 'api.ts', linesGenerated: 150 }, 'Generated API client');
```

**Pourquoi**: Savoir exactement ce qui a été généré, détecter les erreurs.

### 3. **Erreurs Internes**

```typescript
try {
  await processProgram(237);
} catch (error) {
  // Logger structuré avec stack trace
  logError({ correlationId, programId: 237 }, error as Error, 'Failed to process');

  // Console.error pour l'utilisateur (message simple)
  console.error(`❌ Failed to process program 237`);

  throw error;
}
```

**Pourquoi**: Logger a la stack trace complète, console.error a un message humain.

### 4. **Métriques de Performance**

```typescript
const endTimer = startTimer({ programId: 237 }, 'Contract generation');
// ... work ...
endTimer(); // Logs: elapsed time automatiquement
```

**Pourquoi**: Analyser les performances en production.

### 5. **Décisions et Branches Critiques**

```typescript
if (contract.overall.status === PipelineStatus.ENRICHED) {
  log.info({ programId, status: 'enriched' }, 'Program ready for verification');
} else {
  log.warn({ programId, status: contract.overall.status }, 'Program not ready for verification');
}
```

**Pourquoi**: Comprendre le flow d'exécution en production.

---

## Pattern Hybride (Recommandé)

### CLI Command avec Logging Interne

```typescript
// cli.ts - Command handler
case 'generate': {
  // Console.log pour UX utilisateur
  console.log(`Generating code for program ${programId}...`);

  // Logger pour tracing interne
  await withCorrelation(async (correlationId) => {
    const log = createLogger({ correlationId, command: 'generate', programId });

    log.info('Generation started');

    try {
      const result = await runCodegen(config);

      log.info({ filesGenerated: result.files.length }, 'Generation completed');

      // Console.log pour résultat utilisateur
      console.log(`✅ Generated ${result.files.length} files`);

    } catch (error) {
      logError({ correlationId, programId }, error as Error, 'Generation failed');

      // Console.error pour message utilisateur
      console.error(`❌ Generation failed: ${error.message}`);
      process.exit(1);
    }
  });

  break;
}
```

**Résultat**:
- Utilisateur voit: messages clairs et actionables
- Production logs: trace complète avec correlation IDs

---

## Checklist de Décision

Avant d'écrire un log, demande-toi:

| Question | console.log | logger |
|----------|-------------|--------|
| L'utilisateur DOIT-il voir ce message? | ✅ | ❌ |
| Est-ce un résultat de commande CLI? | ✅ | ❌ |
| Est-ce pour debugger en production? | ❌ | ✅ |
| A-t-on besoin de filtrer par LOG_LEVEL? | ❌ | ✅ |
| A-t-on besoin de correlation IDs? | ❌ | ✅ |
| Est-ce une métrique de performance? | ❌ | ✅ |
| L'utilisateur peut-il agir dessus? | ✅ | ❌ |

---

## Anti-Patterns

### ❌ BAD: Logger pour output CLI

```typescript
// BAD - L'utilisateur ne verra rien si LOG_LEVEL=error
logger.info('Contract generated successfully');
```

### ✅ GOOD: Console pour output CLI + Logger pour tracing

```typescript
// GOOD - Utilisateur voit toujours le résultat
console.log('✅ Contract generated successfully');

// Logger pour production debugging
log.info({ programId: 237, duration: 1234 }, 'Contract generation completed');
```

### ❌ BAD: Console.log pour erreurs internes

```typescript
// BAD - Pas de stack trace, pas de contexte
console.log('Error processing program');
```

### ✅ GOOD: Logger pour erreurs internes

```typescript
// GOOD - Stack trace + contexte complet
logError({ correlationId, programId: 237 }, error, 'Failed to process program');

// Console.error pour message utilisateur
console.error('❌ Program processing failed. Check logs for details.');
```

---

## Exemples Complets

### Exemple 1: CLI Command avec Logging

```typescript
case 'pipeline': {
  const batchId = getArg('batch');

  // UX: confirmation de démarrage
  console.log(`\n🚀 Starting pipeline for batch ${batchId}...\n`);

  // Logging interne avec correlation
  await withCorrelation(async (correlationId) => {
    const log = createLogger({ correlationId, command: 'pipeline', batchId });

    log.info('Pipeline run started');
    const endTimer = startTimer({ correlationId }, 'Pipeline run');

    try {
      const result = await runBatchPipeline(config);

      endTimer(); // Log elapsed time
      log.info({
        programsProcessed: result.steps.length,
        status: result.status
      }, 'Pipeline completed');

      // UX: résultats pour l'utilisateur
      console.log(`\n✅ Pipeline completed`);
      console.log(`   Programs processed: ${result.steps.length}`);
      console.log(`   Status: ${result.status}`);

    } catch (error) {
      logError({ correlationId, batchId }, error as Error, 'Pipeline failed');

      // UX: erreur utilisateur
      console.error(`\n❌ Pipeline failed: ${error.message}`);
      console.error(`   Check logs for details (correlation ID: ${correlationId})`);
      process.exit(1);
    }
  });

  break;
}
```

### Exemple 2: HTTP Server avec Logging

```typescript
const server = http.createServer(async (req, res) => {
  const correlationId = randomUUID();
  const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;

  // Logger pour tracer la requête
  const reqLogger = createLogger({ correlationId, method: req.method, pathname });
  const endTimer = startTimer({ correlationId }, `HTTP ${req.method} ${pathname}`);

  reqLogger.info({
    userAgent: req.headers['user-agent'],
    ip: req.socket.remoteAddress
  }, 'Request received');

  try {
    // ... handle request ...

    reqLogger.info({ statusCode: res.statusCode }, 'Request completed');
    endTimer();

  } catch (error) {
    logError({ correlationId, pathname }, error as Error, 'Request failed');
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal server error', correlationId }));
  }
});

// UX: Banner de démarrage (console.log OK)
server.listen(port, () => {
  console.log(`\n  Migration Factory Dashboard`);
  console.log(`  http://localhost:${port}\n`);
});
```

---

## Résumé

**Console.log** = Interface utilisateur (toujours visible)
**Logger** = Tracing interne (production debugging)

**Les deux sont complémentaires, pas exclusifs !**
