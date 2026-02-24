# Exemple de Migration vers Logger Structuré

## Fichier: `src/server/action-server.ts`

### ❌ AVANT (console.log basique)

```typescript
export const startActionServer = async (config: ActionServerConfig): Promise<http.Server> => {
  const ctx: RouteContext = { projectDir: config.projectDir, dir: config.dir };
  let pipelineRunning = false;

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost`);
    const pathname = url.pathname;

    try {
      if (pathname === '/api/pipeline/stream' && req.method === 'GET') {
        if (pipelineRunning) {
          json(res, { error: 'Pipeline already running' }, 409);
          return;
        }
        pipelineRunning = true;
        try {
          await handlePipelineStream(ctx, url.searchParams, res);
        } finally {
          pipelineRunning = false;
        }
      }
      // ... autres routes
    } catch (err) {
      json(res, { error: String(err) }, 500);  // ← Perte d'information
    }
  });

  return new Promise(resolve => {
    server.listen(config.port, () => {
      console.log(`\n  Migration Factory Dashboard`);  // ← OK pour output utilisateur
      console.log(`  http://localhost:${config.port}\n`);
      resolve(server);
    });
  });
};
```

**Problèmes:**
- ❌ Aucun logging des requêtes entrantes
- ❌ Pas de trace de performance (temps de traitement)
- ❌ Erreurs non loggées (seulement renvoyées au client)
- ❌ Impossible de corréler les logs d'une même requête

---

### ✅ APRÈS (logger structuré + correlation)

```typescript
import { randomUUID } from 'node:crypto';
import { createLogger, logError, startTimer } from '../utils/logger.js';

export const startActionServer = async (config: ActionServerConfig): Promise<http.Server> => {
  const ctx: RouteContext = { projectDir: config.projectDir, dir: config.dir };
  let pipelineRunning = false;

  // Logger de base pour le serveur
  const serverLogger = createLogger({
    component: 'action-server',
    port: config.port,
    dir: config.dir,
  });

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost`);
    const pathname = url.pathname;

    // Correlation ID unique par requête
    const correlationId = randomUUID();
    const reqLogger = createLogger({
      component: 'action-server',
      correlationId,
      method: req.method,
      pathname,
      userAgent: req.headers['user-agent'],
    });

    // Timer pour mesurer la performance
    const endTimer = startTimer({ correlationId, pathname }, `HTTP ${req.method} ${pathname}`);

    reqLogger.info('Request received');

    try {
      if (pathname === '/api/pipeline/stream' && req.method === 'GET') {
        if (pipelineRunning) {
          reqLogger.warn({ reason: 'Pipeline already running' }, 'Request rejected');
          json(res, { error: 'Pipeline already running' }, 409);
          return;
        }

        pipelineRunning = true;
        reqLogger.info('Pipeline stream started');

        try {
          await handlePipelineStream(ctx, url.searchParams, res);
          reqLogger.info('Pipeline stream completed successfully');
        } finally {
          pipelineRunning = false;
          reqLogger.debug('Pipeline flag released');
        }
      }
      // ... autres routes

      endTimer(); // Log automatique du temps écoulé

    } catch (err) {
      // Logging structuré de l'erreur avec stack trace
      logError(
        { correlationId, pathname, method: req.method },
        err as Error,
        'Request failed'
      );

      // Toujours renvoyer au client (mais avec moins de détails)
      json(res, { error: 'Internal server error', correlationId }, 500);
    }
  });

  return new Promise(resolve => {
    server.listen(config.port, () => {
      // Console.log OK pour output utilisateur du CLI
      console.log(`\n  Migration Factory Dashboard`);
      console.log(`  http://localhost:${config.port}\n`);
      console.log(`  Project: ${config.projectDir}`);
      console.log(`  Dir: ${config.dir}`);
      console.log(`  Press Ctrl+C to stop\n`);

      // Logger structuré pour production monitoring
      serverLogger.info({
        port: config.port,
        projectDir: config.projectDir,
        dir: config.dir,
      }, 'Server started');

      resolve(server);
    });
  });
};
```

**Bénéfices:**
- ✅ Chaque requête a un `correlationId` unique
- ✅ Performance trackée automatiquement (temps de traitement)
- ✅ Erreurs loggées avec stack trace complète
- ✅ Logs structurés → faciles à parser en production
- ✅ Console.log conservés pour l'UX CLI

---

## Logs Générés (Exemple)

### En développement (pino-pretty)

```
[09:15:22] INFO (action-server): Server started
    port: 3070
    projectDir: "/projects/clubmed"
    dir: "ADH"

[09:15:25] INFO (action-server): Request received
    correlationId: "a1b2c3d4-..."
    method: "GET"
    pathname: "/api/pipeline/stream"

[09:15:25] INFO (action-server): HTTP GET /api/pipeline/stream started
    correlationId: "a1b2c3d4-..."

[09:15:28] INFO (action-server): Pipeline stream completed successfully
    correlationId: "a1b2c3d4-..."

[09:15:28] INFO (action-server): HTTP GET /api/pipeline/stream completed in 3127ms
    correlationId: "a1b2c3d4-..."
    elapsed: 3127
```

### En production (JSON)

```json
{"level":30,"time":1708858925000,"component":"action-server","correlationId":"a1b2c3d4-...","method":"GET","pathname":"/api/pipeline/stream","msg":"Request received"}
{"level":30,"time":1708858925100,"component":"action-server","correlationId":"a1b2c3d4-...","msg":"Pipeline stream started"}
{"level":30,"time":1708858928200,"component":"action-server","correlationId":"a1b2c3d4-...","elapsed":3127,"msg":"HTTP GET /api/pipeline/stream completed in 3127ms"}
```

**→ Facile à parser avec grep, jq, ou tools de monitoring (Datadog, CloudWatch, etc.)**

---

## Pattern: Quand Utiliser console.log vs logger

| Cas | Outil | Raison |
|-----|-------|--------|
| Message utilisateur CLI | `console.log` | UX, pas du monitoring |
| Opération interne | `logger.info()` | Traçabilité production |
| Erreur interne | `logError()` | Stack trace + context |
| Métriques perf | `startTimer()` | Monitoring automatique |
| Debug complexe | `logger.debug()` | Filtre par LOG_LEVEL |

---

## Next Steps

1. ✅ Migrer `action-server.ts`
2. Migrer `codegen-runner.ts` (génération de code)
3. Migrer `migrate-runner.ts` (pipeline 15 phases)
4. Migrer tous les autres fichiers src/
5. Ajouter tests avec mock logger
