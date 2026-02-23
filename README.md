# Magic Migration

Plateforme de migration d'applications Magic Unipaas v12.03 vers des technologies modernes.

**Monorepo Turborepo** | **29 projets Magic** | **4 043 programmes**

## Structure

```
magic-migration/
├── packages/
│   ├── parser/                  # @magic-migration/parser - Parser expressions Magic
│   ├── factory-cli/             # @magic-migration/factory - CLI migration (15 commandes)
│   ├── specmap-dashboard/       # @magic-migration/dashboard - Dashboard Vercel
│   └── migrations/
│       └── adh-web/             # @magic-migration/adh-web - React 19 + Vite 7
│
├── services/
│   ├── caisse-api/              # API REST C# .NET 8 (125 endpoints, 527 tests)
│   └── mcp-server/              # MCP Server (97 outils Magic)
│
├── tools/                       # Scripts PowerShell, KB, pipelines
├── openspec/                    # Specs, domains JSON, tickets, patterns
├── docs/                        # Documentation, screenshots
└── skills/                      # Skills Claude Code (Magic analysis)
```

## Packages

### @magic-migration/parser
Parser TypeScript pour expressions Magic Unipaas avec generation de code (TS, C#, Python). 200 fonctions mappees.

### @magic-migration/factory
CLI de migration avec 15 commandes : pipeline SPECMAP, code generation, enrichissement IA, dashboard interactif.

```bash
cd packages/factory-cli && pnpm build
node dist/cli.js serve --port 3070 --dir ADH
```

### @magic-migration/adh-web
Application web React 19 migree depuis le module ADH (Adherents/Caisse). Stack: Vite 7, TypeScript 5.9, Tailwind v4, Zustand.

```bash
cd packages/migrations/adh-web && pnpm dev
```

### @magic-migration/dashboard
Dashboard HTML multi-projet deploye sur Vercel : https://specmap-dashboard.vercel.app

## Services

### Caisse API (.NET 8)
API REST CQRS pour la gestion de caisse. 125 endpoints, 527 tests unitaires.

```bash
cd services/caisse-api/src/Caisse.Api && dotnet run
```
Swagger: http://localhost:5287/swagger

## Etat migration ADH

| Batch | Domaine | Status |
|-------|---------|--------|
| B1 | Ouverture session (8 progs) | 100% VERIFIED |
| B2 | Caisse (17 progs) | En cours |
| B3-B18 | General, Impression, Compte... | Pending |

## Scripts

```bash
pnpm build        # Build tous les packages
pnpm test         # Tests tous les packages
pnpm dev          # Dev mode (factory + adh-web)
```

## Licence

Proprietaire - Usage interne uniquement.
