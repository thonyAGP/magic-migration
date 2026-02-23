# Prompts de Migration par Phase - ADH Legacy vers Web

> **Objectif** : Prompts copy-pastables pour orchestrer chaque phase de completude
> fonctionnelle via Claude Code + SWARM multi-agents.
>
> **Projet** : Migration ADH Magic Unipaas vers React/TypeScript
> **Date creation** : 2026-02-11
> **Base** : Audit fonctionnel 370 regles, couverture ~50%, 8 themes identifies

---

## Comment utiliser ce document

### Prerequis

1. **Lire ce fichier** avant de lancer une phase
2. **Verifier l'etat courant** : `pnpm tsc --noEmit && pnpm build && pnpm test`
3. **Copier-coller** le prompt de la phase souhaitee dans Claude Code
4. **Activer le delegate mode** (`Shift+Tab`) pour que le lead orchestre sans coder
5. **Surveiller** la progression des agents (ne pas laisser tourner sans supervision)

### Workflow global

```
Phase 1 (T1+T2) ──→ Audit light ──→ Phase 2 (T3+T4) ──→ Audit light
     50%→65%                              65%→78%
         │                                    │
         v                                    v
Phase 3 (T5+T6+T7+T8) ──→ Audit light ──→ Phase 4 (Polish)
     78%→92%                                  92%→98%
```

### Lecons apprises (lots 0-7) - A RESPECTER DANS CHAQUE PHASE

| ID | Lecon | Impact |
|----|-------|--------|
| L1 | **vmForks pour tests WSL** : Vitest config doit avoir `pool: 'vmForks'` pour eviter les hangs sous WSL2 | Tests bloquent indefiniment sans ca |
| L2 | **erasableSyntaxOnly** : TypeScript 5.9+ avec `--erasableSyntaxOnly` interdit les enums TS natifs. Utiliser `as const` + type union a la place | Erreur build immediate |
| L3 | **5-6 fichiers max par agent** (OBS-001) | Timeout si plus de 10 fichiers |
| L4 | **Injecter types Wave 1 dans prompt Wave 2** (OBS-002) | Erreurs de typage sinon |
| L5 | **Composants = props only, JAMAIS import API direct** (OBS-005) | Bypass mock/API toggle |
| L6 | **Standard test minimum** (OBS-011) : Store = initial + actions + errors + reset. Composant = render + interactions + edge cases | Fausse couverture sinon |
| L7 | **Tailwind v4** : `@import "tailwindcss"`, `@theme {}` pour variables, PAS de tailwind.config.js | Syntax differente de v3 |
| L8 | **Zod v4** : API similaire a v3 mais ZodMiniError pour `.email()` etc. | Gestion erreurs differente |
| L9 | **Store async = toujours `set({ isLoading: true, error: null })`** avant le try | Erreur precedente reste sinon |
| L10 | **Audit post-lot SYSTEMATIQUE** (OBS-014) : `tsc + build + test` apres chaque lot/phase | Bugs cumules sinon |
| L11 | **React Router** : `<Link>` uniquement, JAMAIS `<a href>` | Full page reload sinon |
| L12 | **Enums** : Utiliser `as const` satisfies + type helper, PAS `enum` TS | Erreur erasableSyntaxOnly |

### Pattern Store (reference obligatoire)

```typescript
// Pattern OBLIGATOIRE pour chaque action async dans un store Zustand
import { useDataSourceStore } from './dataSourceStore';

const monAction = async (params: Params) => {
  const { isRealApi } = useDataSourceStore.getState();
  set({ isLoading: true, error: null }); // L9

  try {
    if (!isRealApi) {
      // Mode Mock : donnees realistes en memoire
      set({ data: MOCK_DATA, isLoading: false });
      return;
    }
    // Mode API : appel backend reel
    const response = await api.endpoint(params);
    set({ data: response.data.data, isLoading: false });
  } catch (e) {
    set({ error: (e as Error).message, isLoading: false });
  }
};
```

### Pattern Composant (reference obligatoire)

```typescript
// Composant = PROPS ONLY, jamais d'import API (L5)
// Pas d'enum TS natif (L2/L12), utiliser as const
interface MonComposantProps {
  data: DataType;
  onAction: (id: string) => void;
  isLoading?: boolean;
}

export function MonComposant({ data, onAction, isLoading }: MonComposantProps) {
  // Logique UI uniquement
  // Appels API = dans la page ou le store, passes via props
}
```

---

## PHASE 1 : Editions/Impressions (T1) + Transactions completes (T2)

### Objectif : 50% --> 65% couverture

<details>
<summary><strong>PROMPT PHASE 1 - Cliquer pour copier</strong></summary>

```
Tu es le lead orchestrateur d'une equipe SWARM pour la Phase 1 de completude
fonctionnelle du projet ADH-Web (migration Magic Unipaas vers React).

## CONTEXTE PROJET

- **Stack** : React 19 + Vite 7 + TypeScript 5.9 + Tailwind v4 + Zustand + TanStack Table + Zod v4
- **Dossier** : /mnt/d/Projects/Lecteur_Magic/adh-web/
- **Port dev** : 3050, proxy /api -> :5287 (backend C#)
- **Etat actuel** : Lots 0-7 complets, audit fonctionnel termine
  - 229 fichiers source, 720 tests, build 1128KB, 0 erreurs TS/lint
  - Couverture fonctionnelle : ~50% (122 IMPL + 38 PARTIAL sur 282 regles frontend)
- **Objectif Phase 1** : Implementer les themes T1 (Editions) et T2 (Transactions completes) pour atteindre ~65%

## THEME T1 : EDITIONS / IMPRESSIONS (transversal)

Les editions sont un prerequis pour tous les autres themes. Actuellement, les
impressions sont en stub (PDF basique via jsPDF).

### Taches T1

| ID | Tache | Fichiers a creer/modifier | Priorite |
|----|-------|---------------------------|----------|
| T1.1 | Service d'impression unifie | `src/services/printer/printService.ts` - Factory pattern : PDF (jsPDF), ESC/POS (stub), preview HTML | P0 |
| T1.2 | Template ticket de caisse | `src/services/printer/templates/ticketCaisse.ts` - Lignes, MOP, totaux, header/footer village | P0 |
| T1.3 | Template extrait compte | `src/services/printer/templates/ticketExtrait.ts` - 6 formats (detail, resume, etc.) conformes a ExtraitFormatDialog | P1 |
| T1.4 | Template facture TVA | `src/services/printer/templates/ticketFacture.ts` - Identite client, lignes, ventilation TVA, mentions legales | P1 |
| T1.5 | Template garantie | `src/services/printer/templates/ticketGarantie.ts` - Depot, versement, retrait, restitution | P1 |
| T1.6 | Template session ouverture/fermeture | `src/services/printer/templates/ticketSession.ts` - Auto-print a l'ouverture et fermeture (IDE 121) | P0 |
| T1.7 | PrintPreview composant generique | `src/components/ui/PrintPreview.tsx` - Apercu avant impression, boutons imprimer/annuler | P1 |
| T1.8 | Integration impression dans pages existantes | Modifier ExtraitPage, GarantiePage, FacturePage, SeparationPage, FusionPage : ajouter bouton "Imprimer" wire au printService | P1 |

### Taches T2 : TRANSACTIONS COMPLETES

Les transactions (IDE 237/238) sont le coeur metier. Actuellement 40% implemente,
49% manquant. Les gaps critiques sont listes ci-dessous.

| ID | Tache | Fichiers a creer/modifier | Priorite |
|----|-------|---------------------------|----------|
| T2.1 | Type ANN (annulation) | `ArticleTypeSelector.tsx` : ajouter ANN avec icone RotateCcw + `TransactionForm.tsx` : flux annulation (reference transaction originale, inversion montants) | P0 |
| T2.2 | Bilaterale complete | `BilateraleDialog.tsx` : wire le schema existant, connecter au store, ajouter recherche compte via store (pas API directe) | P1 |
| T2.3 | Labels conditionnels | `TransactionForm.tsx` : "Date consommation" (VRL default) vs "Date debut sejour" (forfait) vs "Nb PAX" (TRF) - conditionnel selon ArticleType | P2 |
| T2.4 | Calcul forfait automatique | `ForfaitDialog.tsx` : calculer prixParJour * nbJours, afficher le total, pre-remplir le montant dans la ligne | P1 |
| T2.5 | Verification gratuite | Nouveau composant `GratuitConfirmDialog.tsx` : si montant = 0 ou article gratuit, confirmer avec motif (IDE 237.18 / tache 237.18) | P1 |
| T2.6 | Confirmation GiftPass V/C/D | `GiftPassConfirmDialog.tsx` : apres check GiftPass, branchement conditionnel selon resultat (V=valide, C=credit insuffisant, D=desactive) | P1 |
| T2.7 | Validation caracteres interdits | Nouveau helper `src/lib/validation/forbiddenChars.ts` : replicat de IDE 84 (CARACT_INTERDIT) - interdire dans noms, commentaires | P1 |
| T2.8 | Impression ticket transaction | Wire T1.2 dans TransactionPage : apres deversement reussi, imprimer automatiquement selon editionConfig (D3) | P0 |
| T2.9 | TRF (Transfert passager) | `TransferDialog.tsx` : destubber, implementer flux transfert avec selection chambre source/destination | P2 |
| T2.10 | PYR (Liberation chambre) | `LiberationDialog.tsx` : destubber, implementer flux liberation avec confirmation | P2 |
| T2.11 | Reference annulation | `AnnulationReferenceDialog.tsx` : saisie numero transaction a annuler, verification existence, chargement des lignes pour inversion | P0 |

## REGLES SWARM OBLIGATOIRES

1. **Ownership strict** : 1 agent = fichiers dedies, ZERO conflit
2. **5-6 fichiers max par agent** (pas plus de 10 incluant tests)
3. **Vagues sequentielles** : Wave 1 (types+services) bloque Wave 2 (composants+pages)
4. **Contexte Wave 2** : injecter les types crees par Wave 1 dans le prompt
5. **Shutdown progressif** : liberer agents termines
6. **Pas d'enum TS** : utiliser `as const` + type union (erasableSyntaxOnly)
7. **Composants = props only** : jamais d'import API dans components/
8. **Store async** : toujours `set({ isLoading: true, error: null })` avant try
9. **Tailwind v4** : `@import "tailwindcss"`, `@theme {}`, pas de tailwind.config.js
10. **Tests** : `pool: 'vmForks'` dans vitest.config pour WSL2

## REPARTITION SWARM PROPOSEE

### Wave 1 (parallele - fondations)

**Agent "print-service" (5 fichiers) :**
- `src/services/printer/printService.ts`
- `src/services/printer/types.ts`
- `src/services/printer/templates/ticketCaisse.ts`
- `src/services/printer/templates/ticketSession.ts`
- `src/services/printer/__tests__/printService.test.ts`

**Agent "templates" (5 fichiers) :**
- `src/services/printer/templates/ticketExtrait.ts`
- `src/services/printer/templates/ticketFacture.ts`
- `src/services/printer/templates/ticketGarantie.ts`
- `src/services/printer/templates/index.ts`
- `src/services/printer/templates/__tests__/templates.test.ts`

**Agent "transaction-types" (4 fichiers) :**
- `src/lib/validation/forbiddenChars.ts`
- `src/lib/validation/__tests__/forbiddenChars.test.ts`
- `src/types/annulation.ts` (types pour flux annulation)
- `src/types/__tests__/annulation.test.ts`

### Wave 2 (parallele - apres Wave 1)

**Agent "transaction-ui" (6 fichiers) :**
- Modifier `src/components/caisse/transaction/ArticleTypeSelector.tsx` (ajouter ANN)
- Modifier `src/components/caisse/transaction/ForfaitDialog.tsx` (calcul auto)
- Modifier `src/components/caisse/transaction/BilateraleDialog.tsx` (wire store)
- `src/components/caisse/transaction/AnnulationReferenceDialog.tsx`
- `src/components/caisse/transaction/GratuitConfirmDialog.tsx`
- `src/components/caisse/transaction/GiftPassConfirmDialog.tsx`

**Agent "pages-print" (6 fichiers) :**
- `src/components/ui/PrintPreview.tsx`
- Modifier `src/pages/TransactionPage.tsx` (wire impression post-deversement)
- Modifier `src/pages/ExtraitPage.tsx` (wire impression extrait)
- Modifier `src/pages/GarantiePage.tsx` (wire impression garantie)
- Modifier `src/pages/FacturePage.tsx` (wire impression facture)
- Modifier `src/pages/SeparationPage.tsx` + `FusionPage.tsx` (bouton imprimer)

### Wave 3 (sequentiel - wiring + verification)

**Agent "integration" (4 fichiers) :**
- Modifier `src/components/caisse/transaction/TransactionForm.tsx` (labels conditionnels T2.3, forbiddenChars T2.7)
- Tests integration transaction + impression
- Modifier `src/pages/SessionOuverturePage.tsx` + `SessionFermeturePage.tsx` (auto-print T1.6)
- Verification finale : `pnpm tsc --noEmit && pnpm build && pnpm test`

## VERIFICATION POST-PHASE

Apres tous les agents termines :
```bash
pnpm tsc --noEmit    # 0 erreurs TypeScript
pnpm build           # build reussi, taille < 1.5MB
pnpm test            # tous les tests passent
```

Objectif : ~65% couverture fonctionnelle (ajouter ~40 regles implementees).

## FICHIERS DE REFERENCE (patterns existants)

- Store mock/API : `src/stores/transactionStore.ts`
- Dialog modal : `src/components/ui/Dialog.tsx`
- DataGrid : `src/components/ui/DataGrid.tsx` (TanStack Table)
- Page multi-phases : `src/pages/SeparationPage.tsx`
- Print preview : `src/components/caisse/facture/FacturePreview.tsx`
- Schema Zod : `src/components/caisse/transaction/schemas-lot2.ts`
- Types existants : `src/types/transaction-lot2.ts`
- Fixtures mock : `src/fixtures/mock-transaction-catalogs.ts`

## LIVRABLES ATTENDUS

Pour chaque fichier cree/modifie :
1. Code source TypeScript (pas d'enum natif)
2. Tests unitaires (AAA pattern, describe/it, vi.mock pour deps)
3. Exports dans les fichiers index.ts correspondants
4. Import React Router <Link> (jamais <a href>)

Lance la creation de l'equipe SWARM avec 6 agents selon la repartition ci-dessus.
Active le delegate mode. Commence par Wave 1 (3 agents paralleles).
```

</details>

---

## PHASE 2 : Gestion Caisse (T3) + Sessions enrichies (T4)

### Objectif : 65% --> 78% couverture

<details>
<summary><strong>PROMPT PHASE 2 - Cliquer pour copier</strong></summary>

```
Tu es le lead orchestrateur d'une equipe SWARM pour la Phase 2 de completude
fonctionnelle du projet ADH-Web (migration Magic Unipaas vers React).

## CONTEXTE PROJET

- **Stack** : React 19 + Vite 7 + TypeScript 5.9 + Tailwind v4 + Zustand + TanStack Table + Zod v4
- **Dossier** : /mnt/d/Projects/Lecteur_Magic/adh-web/
- **Port dev** : 3050, proxy /api -> :5287 (backend C#)
- **Etat actuel** : Phase 1 terminee (T1 Editions + T2 Transactions)
  - Couverture fonctionnelle : ~65%
  - Service d'impression unifie, templates ticket operationnels
  - Transactions : ANN, bilaterale, calcul forfait, caracteres interdits implementes
- **Objectif Phase 2** : Implementer T3 (Gestion Caisse) et T4 (Sessions enrichies) pour atteindre ~78%

## THEME T3 : GESTION CAISSE (IDE 121 - Gestion_Caisse_142)

Actuellement 33% couverture. Les 3 operations d'approvisionnement et le controle
multi-postes sont les plus gros gaps.

### Taches T3

| ID | Tache | Fichiers a creer/modifier | Priorite |
|----|-------|---------------------------|----------|
| T3.1 | Approvisionnement coffre | Nouvelle page `src/pages/ApproCoffrePage.tsx` + store `src/stores/approCaisseStore.ts` : saisie montant, devise, motif, validation manager | P0 |
| T3.2 | Approvisionnement produits | Page `src/pages/ApproProduitsPage.tsx` : selection produits depuis catalogue, quantites, valorisation | P0 |
| T3.3 | Remise en coffre | Page `src/pages/RemiseCoffrePage.tsx` : inverse de T3.1, saisie montant a remettre, justification | P0 |
| T3.4 | Coffre2 (multi-postes) | Composant `src/components/caisse/session/CoffreControl.tsx` : detection sessions concurrentes via WebSocket, alerte si meme coffre utilise par 2 postes | P0 |
| T3.5 | Date comptable | Composant `src/components/caisse/session/DateComptableValidator.tsx` : verification que la date comptable correspond a la journee en cours, alerte si ecart | P0 |
| T3.6 | Tableau 6 colonnes fermeture | Modifier `src/pages/SessionFermeturePage.tsx` : ajouter recap Cash/Cartes/Cheques/Produits/OD/Devises avec totaux par colonne | P1 |
| T3.7 | Multi-devises denomination | Modifier `src/components/caisse/denomination/DenominationGrid.tsx` : ajouter selecteur devise (pas seulement devise principale), comptage par devise | P1 |
| T3.8 | Menu caisse complet | Modifier `src/components/caisse/CaisseMenuGrid.tsx` : mapper les 21 icones d'action (actuellement 7 sur 21), ajouter les nouvelles routes appro/remise | P1 |
| T3.9 | Comptage intermediaire | Nouvelle page `src/pages/ComptagePage.tsx` : comptage sans fermeture, sauvegarde etat, comparaison avec attendu | P2 |

### Taches T4 : SESSIONS ENRICHIES

Actuellement 58% couverture. Les principaux gaps sont l'impression auto, les
verifications de securite, et le workflow complet.

| ID | Tache | Fichiers a creer/modifier | Priorite |
|----|-------|---------------------------|----------|
| T4.1 | Ticket auto ouverture | Modifier `src/pages/SessionOuverturePage.tsx` : apres openSession reussi, appel automatique printService.printTicketSession('ouverture', data) | P0 |
| T4.2 | Ticket auto fermeture | Modifier `src/pages/SessionFermeturePage.tsx` : apres closeSession reussi, impression automatique du recap | P0 |
| T4.3 | Pre-check reseau/cloture | Nouveau service `src/services/api/precheck.ts` : verification etat reseau + cloture comptable avant toute operation sensible (vente, separation, fusion) | P0 |
| T4.4 | Verrou session concurrent | Modifier `src/stores/sessionStore.ts` : avant ouverture, verifier qu'aucune autre session n'est ouverte sur ce poste (via API) | P1 |
| T4.5 | Historique enrichi | Modifier `src/pages/SessionHistoriquePage.tsx` : ajouter colonnes devises (fond caisse par devise), ecarts par devise, filtre par date | P1 |
| T4.6 | Reimpression enrichie | Modifier `src/pages/ReimpressionPage.tsx` : buildTicketData avec lignes de transaction (actuellement vide), filtre par type operation | P1 |
| T4.7 | Validation Zod ouverture/fermeture | Modifier `src/components/caisse/session/schemas.ts` : utiliser les schemas existants dans SessionOuverturePage et SessionFermeturePage (actuellement non utilises) | P2 |

## REGLES SWARM OBLIGATOIRES

1. **Ownership strict** : 1 agent = fichiers dedies, ZERO conflit
2. **5-6 fichiers max par agent** (pas plus de 10 incluant tests)
3. **Vagues sequentielles** : Wave 1 (stores+services) bloque Wave 2 (pages+composants)
4. **Contexte Wave 2** : injecter les types crees par Wave 1 dans le prompt
5. **Shutdown progressif** : liberer agents termines
6. **Pas d'enum TS** : utiliser `as const` + type union (erasableSyntaxOnly)
7. **Composants = props only** : jamais d'import API dans components/
8. **Store async** : toujours `set({ isLoading: true, error: null })` avant try
9. **Tailwind v4** : `@import "tailwindcss"`, `@theme {}`, pas de tailwind.config.js
10. **Tests** : `pool: 'vmForks'` dans vitest.config pour WSL2

## REPARTITION SWARM PROPOSEE

### Wave 1 (parallele - fondations)

**Agent "appro-store" (5 fichiers) :**
- `src/stores/approCaisseStore.ts` (store unifie appro coffre + produits + remise)
- `src/stores/__tests__/approCaisseStore.test.ts`
- `src/types/appro.ts` (ApproOperation, RemiseData, ProduitsData)
- `src/services/api/endpoints-appro.ts` (3 endpoints)
- `src/services/api/types-appro.ts` (request/response)

**Agent "precheck-service" (4 fichiers) :**
- `src/services/api/precheck.ts` (preCheckReseau, preCheckCloture, preCheckSession)
- `src/services/api/__tests__/precheck.test.ts`
- `src/types/precheck.ts` (PreCheckResult, ConcurrencyInfo)
- Modifier `src/stores/sessionStore.ts` (ajouter checkConcurrency, loadConfig)

### Wave 2 (parallele - pages et composants)

**Agent "appro-pages" (6 fichiers) :**
- `src/pages/ApproCoffrePage.tsx`
- `src/pages/ApproProduitsPage.tsx`
- `src/pages/RemiseCoffrePage.tsx`
- `src/pages/ComptagePage.tsx`
- Tests pour les 4 pages

**Agent "session-enrichi" (6 fichiers) :**
- Modifier `src/pages/SessionOuverturePage.tsx` (T4.1 ticket auto + T4.3 precheck)
- Modifier `src/pages/SessionFermeturePage.tsx` (T4.2 ticket auto + T3.6 tableau 6 colonnes)
- Modifier `src/pages/SessionHistoriquePage.tsx` (T4.5 colonnes devises)
- Modifier `src/pages/ReimpressionPage.tsx` (T4.6 lignes transaction)
- `src/components/caisse/session/CoffreControl.tsx` (T3.4)
- `src/components/caisse/session/DateComptableValidator.tsx` (T3.5)

**Agent "menu-denomination" (4 fichiers) :**
- Modifier `src/components/caisse/CaisseMenuGrid.tsx` (T3.8 : 21 icones)
- Modifier `src/components/caisse/denomination/DenominationGrid.tsx` (T3.7 multi-devises)
- Modifier `src/components/caisse/session/schemas.ts` (T4.7 validation Zod)
- Tests pour les modifications

### Wave 3 (sequentiel - wiring)

**Agent "integration" :**
- Modifier `src/App.tsx` (ajouter routes /caisse/appro-coffre, /caisse/appro-produits, /caisse/remise-coffre, /caisse/comptage)
- Wire precheck dans TransactionPage, SeparationPage, FusionPage
- Verification finale : `pnpm tsc --noEmit && pnpm build && pnpm test`

## VERIFICATION POST-PHASE

```bash
pnpm tsc --noEmit    # 0 erreurs TypeScript
pnpm build           # build reussi, taille < 1.8MB
pnpm test            # tous les tests passent
```

Objectif : ~78% couverture fonctionnelle.

## FICHIERS DE REFERENCE (patterns existants)

- Store mock/API : `src/stores/transactionStore.ts`, `src/stores/caisseStore.ts`
- Print service : `src/services/printer/printService.ts` (cree en Phase 1)
- Templates : `src/services/printer/templates/` (crees en Phase 1)
- Page session : `src/pages/SessionOuverturePage.tsx`
- DenominationGrid : `src/components/caisse/denomination/DenominationGrid.tsx`
- Menu : `src/components/caisse/CaisseMenuGrid.tsx`
- Fixtures : `src/fixtures/mock-transaction-catalogs.ts`

Lance la creation de l'equipe SWARM avec 6 agents selon la repartition ci-dessus.
Active le delegate mode. Commence par Wave 1 (2 agents paralleles).
```

</details>

---

## PHASE 3 : Sep/Fusion (T5) + Extrait/Garantie/Facture (T6) + Club Med Pass (T7) + Data Catching (T8)

### Objectif : 78% --> 92% couverture

<details>
<summary><strong>PROMPT PHASE 3 - Cliquer pour copier</strong></summary>

```
Tu es le lead orchestrateur d'une equipe SWARM pour la Phase 3 de completude
fonctionnelle du projet ADH-Web (migration Magic Unipaas vers React).

## CONTEXTE PROJET

- **Stack** : React 19 + Vite 7 + TypeScript 5.9 + Tailwind v4 + Zustand + TanStack Table + Zod v4
- **Dossier** : /mnt/d/Projects/Lecteur_Magic/adh-web/
- **Port dev** : 3050, proxy /api -> :5287 (backend C#)
- **Etat actuel** : Phases 1-2 terminees
  - Couverture fonctionnelle : ~78%
  - Editions/impressions operationnels (T1)
  - Transactions completes avec ANN, bilaterale, forfait (T2)
  - Gestion caisse : appro coffre/produits/remise, precheck (T3)
  - Sessions : tickets auto, precheck, multi-devises (T4)
- **Objectif Phase 3** : Implementer T5+T6+T7+T8 pour atteindre ~92%

## THEME T5 : SEPARATION / FUSION (IDE 27+28)

Actuellement 27% couverture, le theme le plus faible. Le flux de base (recherche,
preview, execution) existe mais les controles de securite et ecrans intermediaires
sont absents.

### Taches T5

| ID | Tache | Fichiers a creer/modifier | Priorite |
|----|-------|---------------------------|----------|
| T5.1 | Pre-check cloture/reseau (separation) | Modifier `src/pages/SeparationPage.tsx` : appeler preCheckService avant de lancer la separation. Si cloture en cours ou reseau down -> bloquer avec message | P0 |
| T5.2 | Pre-check cloture/reseau (fusion) | Modifier `src/pages/FusionPage.tsx` : idem T5.1 | P0 |
| T5.3 | Ecran filiations (separation) | Nouveau composant `src/components/caisse/separation/FiliationTree.tsx` : arbre hierarchique du compte (tache 27.3.2 de la spec) montrant parent/enfants/filiations | P1 |
| T5.4 | Ecran choix garantie (fusion) | Nouveau composant `src/components/caisse/fusion/GarantieChoiceDialog.tsx` : quand 2 comptes ont des garanties, choisir laquelle conserver (tache 28.3.9) | P1 |
| T5.5 | Listing garanties fusion | Nouveau composant `src/components/caisse/fusion/FusionGarantieList.tsx` : afficher les garanties des 2 comptes avant fusion (taches 28.3.7/28.3.8) | P1 |
| T5.6 | Reprise operation | Modifier `src/stores/separationStore.ts` et `fusionStore.ts` : gerer les etats RETRY/DONE/PASSED, permettre de relancer une operation echouee | P1 |
| T5.7 | Blocage comptes concurrent | Modifier `src/stores/separationStore.ts` et `fusionStore.ts` : bloquer les comptes source/destination pendant l'operation (taches 28.3.1.2/28.3.1.3) | P1 |
| T5.8 | Impression resultat | Modifier `SeparationPage.tsx` et `FusionPage.tsx` : ajouter bouton "Imprimer" dans les ResultDialogs, wire au printService | P2 |

## THEME T6 : EXTRAIT / GARANTIE / FACTURE (IDE 69+111+97)

Actuellement 41% couverture. Les ecrans existent mais manquent de profondeur.

### Taches T6

| ID | Tache | Fichiers a creer/modifier | Priorite |
|----|-------|---------------------------|----------|
| T6.1 | Zoom listing extrait | Nouveau composant `src/components/caisse/extrait/ExtraitDetailDialog.tsx` : detail d'une transaction selectionnee dans la grille (ecran 69.3.2) | P1 |
| T6.2 | Coloration lignes extrait | Modifier `src/components/caisse/extrait/ExtraitTransactionGrid.tsx` : coloration rouge (annule), orange (en attente), vert (valide) selon statut | P1 |
| T6.3 | Colonnes manquantes extrait | Modifier `ExtraitTransactionGrid.tsx` : ajouter Heure, Libelle supplementaire, Nb articles | P2 |
| T6.4 | Dialog A/D/M/R/Q garantie | Nouveau composant `src/components/caisse/garantie/GarantieActionDialog.tsx` : 5 actions (Ajout depot, Depot supplementaire, Modification, Restitution, Quitter) - actuellement seulement 3 presentes | P1 |
| T6.5 | Impression garantie | Modifier `src/pages/GarantiePage.tsx` : bouton impression pour depot, versement, retrait, wire au printService (template deja cree en T1.5) | P1 |
| T6.6 | Section hebergement facture | Nouveau composant `src/components/caisse/facture/FactureHebergementSection.tsx` : saisie sejours (dates, chambre, nb nuits, tarif) pour tache 97.3 | P1 |
| T6.7 | Identite client facture | Modifier `src/components/caisse/facture/FactureForm.tsx` : ajouter 6 champs (nom, adresse, CP, ville, pays, telephone) + checkboxes "Sans Nom" / "Sans Adresse" | P1 |
| T6.8 | Email envoi (extrait+facture+garantie) | Nouveau service `src/services/email/emailService.ts` : envoi par email du document genere (PDF), avec dialog de saisie email | P2 |
| T6.9 | Email dialog | Nouveau composant `src/components/ui/EmailSendDialog.tsx` : saisie email destinataire, preview, envoi | P2 |

## THEME T7 : CLUB MED PASS (IDE 77)

Actuellement 47% couverture. Les operations de gestion sont le principal gap.

### Taches T7

| ID | Tache | Fichiers a creer/modifier | Priorite |
|----|-------|---------------------------|----------|
| T7.1 | Creation pass | Nouveau composant `src/components/caisse/clubmedpass/PassCreationForm.tsx` : formulaire creation avec holder, montant initial, date expiration | P1 |
| T7.2 | Opposition pass | Nouveau composant `src/components/caisse/clubmedpass/PassOppositionDialog.tsx` : bloquer un pass avec motif | P1 |
| T7.3 | Suppression pass | Nouveau composant `src/components/caisse/clubmedpass/PassDeleteDialog.tsx` : supprimer avec confirmation | P1 |
| T7.4 | Affilies pass | Nouveau composant `src/components/caisse/clubmedpass/PassAffiliateList.tsx` : liste affilies, ajout/suppression | P2 |
| T7.5 | Store CMP enrichi | Modifier `src/stores/clubmedPassStore.ts` : ajouter actions createPass, oppositionPass, deletePass, loadAffiliates, addAffiliate, removeAffiliate | P1 |
| T7.6 | Schemas CMP | Modifier `src/components/caisse/clubmedpass/schemas.ts` : ajouter passCreationSchema, passOppositionSchema | P1 |

## THEME T8 : DATA CATCHING (IDE 7)

Actuellement 50% couverture. Le flux checkout et le multilingue sont les gaps.

### Taches T8

| ID | Tache | Fichiers a creer/modifier | Priorite |
|----|-------|---------------------------|----------|
| T8.1 | Checkout accept/decline | Nouveau composant `src/components/caisse/datacatch/DataCatchCheckout.tsx` : ecran depart client avec accept/decline, changement statut, feedback | P1 |
| T8.2 | Checkout flow | Modifier `src/pages/DataCatchPage.tsx` : ajouter step "checkout" dans le wizard, transition depuis review | P1 |
| T8.3 | Store datacatch checkout | Modifier `src/stores/datacatchStore.ts` : ajouter actions acceptCheckout, declineCheckout, updateStatus | P1 |
| T8.4 | Multilingue DataCatch | Nouveau fichier `src/lib/i18n/datacatch-translations.ts` : traductions FR/EN/ES/DE/IT/PT pour tous les labels du wizard DataCatch | P2 |
| T8.5 | Composant langue selector | Nouveau composant `src/components/caisse/datacatch/LanguageSelector.tsx` : selection langue en debut de wizard, persiste dans la session | P2 |
| T8.6 | Schemas datacatch enrichis | Modifier `src/components/caisse/datacatch/schemas.ts` : ajouter checkoutSchema, nationalite enum, genre enum (as const) | P2 |
| T8.7 | DataCatch stats | Nouveau composant `src/components/caisse/datacatch/DataCatchStats.tsx` : stats de completion (nb captures / objectif jour) | P2 |

## REGLES SWARM OBLIGATOIRES

1. **Ownership strict** : 1 agent = fichiers dedies, ZERO conflit
2. **5-6 fichiers max par agent** (pas plus de 10 incluant tests)
3. **Vagues sequentielles** : Wave 1 (stores+types) bloque Wave 2 (composants+pages)
4. **Contexte Wave 2** : injecter les types crees par Wave 1 dans le prompt
5. **Shutdown progressif** : liberer agents termines
6. **Pas d'enum TS** : utiliser `as const` + type union (erasableSyntaxOnly)
7. **Composants = props only** : jamais d'import API dans components/
8. **Store async** : toujours `set({ isLoading: true, error: null })` avant try
9. **Tailwind v4** : `@import "tailwindcss"`, `@theme {}`, pas de tailwind.config.js
10. **Tests** : `pool: 'vmForks'` dans vitest.config pour WSL2

## REPARTITION SWARM PROPOSEE

### Wave 1 (parallele - stores et types)

**Agent "sep-fusion-store" (5 fichiers) :**
- Modifier `src/stores/separationStore.ts` (T5.6 retry + T5.7 blocage)
- Modifier `src/stores/fusionStore.ts` (T5.6 retry + T5.7 blocage)
- `src/types/filiation.ts` (arbre filiations)
- `src/services/api/endpoints-filiation.ts`
- Tests stores

**Agent "cmp-datacatch-store" (5 fichiers) :**
- Modifier `src/stores/clubmedPassStore.ts` (T7.5 : 6 nouvelles actions)
- Modifier `src/stores/datacatchStore.ts` (T8.3 : checkout actions)
- `src/lib/i18n/datacatch-translations.ts` (T8.4)
- Modifier `src/components/caisse/clubmedpass/schemas.ts` (T7.6)
- Modifier `src/components/caisse/datacatch/schemas.ts` (T8.6)

**Agent "email-service" (4 fichiers) :**
- `src/services/email/emailService.ts` (T6.8)
- `src/services/email/types.ts`
- `src/services/email/__tests__/emailService.test.ts`
- `src/components/ui/EmailSendDialog.tsx` (T6.9)

### Wave 2 (parallele - composants)

**Agent "sep-fusion-ui" (6 fichiers) :**
- `src/components/caisse/separation/FiliationTree.tsx` (T5.3)
- `src/components/caisse/fusion/GarantieChoiceDialog.tsx` (T5.4)
- `src/components/caisse/fusion/FusionGarantieList.tsx` (T5.5)
- Modifier `src/pages/SeparationPage.tsx` (T5.1 precheck + T5.8 impression)
- Modifier `src/pages/FusionPage.tsx` (T5.2 precheck + T5.8 impression)
- Tests

**Agent "extrait-garantie-ui" (6 fichiers) :**
- `src/components/caisse/extrait/ExtraitDetailDialog.tsx` (T6.1)
- Modifier `src/components/caisse/extrait/ExtraitTransactionGrid.tsx` (T6.2+T6.3)
- `src/components/caisse/garantie/GarantieActionDialog.tsx` (T6.4)
- Modifier `src/pages/GarantiePage.tsx` (T6.5 impression)
- `src/components/caisse/facture/FactureHebergementSection.tsx` (T6.6)
- Modifier `src/components/caisse/facture/FactureForm.tsx` (T6.7 identite)

**Agent "cmp-datacatch-ui" (6 fichiers) :**
- `src/components/caisse/clubmedpass/PassCreationForm.tsx` (T7.1)
- `src/components/caisse/clubmedpass/PassOppositionDialog.tsx` (T7.2)
- `src/components/caisse/clubmedpass/PassDeleteDialog.tsx` (T7.3)
- `src/components/caisse/datacatch/DataCatchCheckout.tsx` (T8.1)
- `src/components/caisse/datacatch/LanguageSelector.tsx` (T8.5)
- Modifier `src/pages/DataCatchPage.tsx` (T8.2 step checkout)

### Wave 3 (sequentiel - wiring + polish)

**Agent "integration" :**
- `src/components/caisse/clubmedpass/PassAffiliateList.tsx` (T7.4)
- `src/components/caisse/datacatch/DataCatchStats.tsx` (T8.7)
- Modifier `src/pages/PassPage.tsx` (wire nouvelles actions CMP)
- Verification finale : `pnpm tsc --noEmit && pnpm build && pnpm test`

## VERIFICATION POST-PHASE

```bash
pnpm tsc --noEmit    # 0 erreurs TypeScript
pnpm build           # build reussi, taille < 2MB
pnpm test            # tous les tests passent
```

Objectif : ~92% couverture fonctionnelle.

## FICHIERS DE REFERENCE (patterns existants)

- Store separation : `src/stores/separationStore.ts`
- Store fusion : `src/stores/fusionStore.ts`
- Store CMP : `src/stores/clubmedPassStore.ts`
- Store datacatch : `src/stores/datacatchStore.ts`
- Print service : `src/services/printer/printService.ts`
- Page multi-phases : `src/pages/SeparationPage.tsx`
- Wizard : `src/pages/DataCatchPage.tsx`
- Dialog : `src/components/ui/Dialog.tsx`
- DataGrid : `src/components/ui/DataGrid.tsx`
- Precheck : `src/services/api/precheck.ts` (cree en Phase 2)

Lance la creation de l'equipe SWARM avec 8 agents selon la repartition ci-dessus.
Active le delegate mode. Commence par Wave 1 (3 agents paralleles).
```

</details>

---

## PHASE 4 : Polish + P2/P3 restants

### Objectif : 92% --> 98% couverture

<details>
<summary><strong>PROMPT PHASE 4 - Cliquer pour copier</strong></summary>

```
Tu es le lead orchestrateur d'une equipe SWARM pour la Phase 4 (finale) de
completude fonctionnelle du projet ADH-Web (migration Magic Unipaas vers React).

## CONTEXTE PROJET

- **Stack** : React 19 + Vite 7 + TypeScript 5.9 + Tailwind v4 + Zustand + TanStack Table + Zod v4
- **Dossier** : /mnt/d/Projects/Lecteur_Magic/adh-web/
- **Port dev** : 3050, proxy /api -> :5287 (backend C#)
- **Etat actuel** : Phases 1-3 terminees
  - Couverture fonctionnelle : ~92%
  - Editions, transactions, gestion caisse, sessions, sep/fusion, extrait/garantie/facture, CMP, datacatch : tous operationnels
- **Objectif Phase 4** : Polish, corriger les derniers gaps P2/P3, atteindre ~98%

## TACHES PHASE 4 - POLISH & COMPLETUDE FINALE

### Bloc A : Uniformisation Design System

| ID | Tache | Fichiers a modifier | Priorite |
|----|-------|---------------------|----------|
| P4.1 | Remplacer tous les `<select>` natifs par `<Select>` du design system | ChangeOperationForm, GarantieDepotForm, FactureLigneGrid, VRLIdentityDialog, TPERecoveryDialog, ReimpressionPage, ForfaitDialog, PersonalInfoForm, PreferencesForm | P2 |
| P4.2 | Remplacer `<input>` et `<textarea>` natifs par composants du design system | GarantieVersementDialog, autres dialogs | P2 |
| P4.3 | Reset dialog state a la reouverture | VRLIdentityDialog, ForfaitDialog, autres dialogs : ajouter `useEffect` sur `open` pour reset state | P2 |

### Bloc B : Donnees dynamiques

| ID | Tache | Fichiers a modifier | Priorite |
|----|-------|---------------------|----------|
| P4.4 | Devises dynamiques | GarantieDepotForm : charger devises depuis store au lieu de DEVISES hardcode | P2 |
| P4.5 | MOP dynamiques | ChangeOperationForm : charger MOP depuis store au lieu de hardcode | P2 |
| P4.6 | Comptes dynamiques | TransactionForm + BilateraleDialog : charger MOCK_COMPTES depuis store, supprimer hardcode | P2 |

### Bloc C : UX / Feedback

| ID | Tache | Fichiers a modifier | Priorite |
|----|-------|---------------------|----------|
| P4.7 | LoginPage reelle | `src/App.tsx` inline LoginPage : ajouter vrais champs username/password, loading state, error display | P1 |
| P4.8 | ErrorBoundary par section | Ajouter ErrorBoundary dans chaque page principale (pas juste global) | P2 |
| P4.9 | Dashboard double-load fix | DashboardStats + DashboardChart : supprimer les useEffect internes qui appellent loadStats/loadDailyActivity (page le fait deja) | P3 |
| P4.10 | Sidebar complete | Modifier `src/components/layout/Sidebar.tsx` : lister les 21+ routes au lieu de 7, grouper par section | P1 |

### Bloc D : Corrections store

| ID | Tache | Fichiers a modifier | Priorite |
|----|-------|---------------------|----------|
| P4.11 | changeStore.loadOperations error clear | `src/stores/changeStore.ts` : ajouter `error: null` dans le set initial de loadOperations | P3 |
| P4.12 | factureStore.createFacture mock fix | `src/stores/factureStore.ts` : mock createFacture devrait retourner une facture vide (sans lignes pre-existantes) | P3 |
| P4.13 | SessionFermeturePage devises mock | Ajouter devises mock avec fondCaisse + totalEncaissements (actuellement `devises: []`) | P2 |

### Bloc E : Tests et qualite

| ID | Tache | Fichiers a creer/modifier | Priorite |
|----|-------|---------------------------|----------|
| P4.14 | Tests E2E workflow | `src/__tests__/e2e/workflow-complet.test.ts` : test du workflow complet ouverture -> vente -> fermeture en mock | P1 |
| P4.15 | Stories Storybook (atoms) | Creer stories pour les composants UI critiques : Button, Input, Select, Dialog, Badge, DataGrid | P3 |
| P4.16 | Couverture stores uniform | Verifier que chaque store a : initial state + chaque action success/error + reset | P2 |

### Bloc F : Accessibilite et i18n

| ID | Tache | Fichiers a creer/modifier | Priorite |
|----|-------|---------------------------|----------|
| P4.17 | Aria labels manquants | Audit aria-label/aria-describedby sur tous les formulaires | P3 |
| P4.18 | Keyboard navigation | Verifier tab order sur toutes les pages, focus trap dans dialogs | P3 |
| P4.19 | Messages Zod uniformes | Verifier que TOUS les messages de validation Zod sont en francais | P3 |

## REGLES SWARM OBLIGATOIRES

1. **Ownership strict** : 1 agent = fichiers dedies, ZERO conflit
2. **5-6 fichiers max par agent** (pas plus de 10 incluant tests)
3. **Pas d'enum TS** : utiliser `as const` + type union (erasableSyntaxOnly)
4. **Composants = props only** : jamais d'import API dans components/
5. **Store async** : toujours `set({ isLoading: true, error: null })` avant try
6. **Tests** : `pool: 'vmForks'` dans vitest.config pour WSL2
7. **React Router** : `<Link>` uniquement, jamais `<a href>`

## REPARTITION SWARM PROPOSEE

### Wave 1 (parallele)

**Agent "design-system" (6 fichiers) :**
- Bloc A complet : P4.1 (9 fichiers a modifier pour remplacer <select> natifs)
  Regrouper par batch : forms de transaction (3) + forms autres (3) + dialogs (3)
  ATTENTION : max 6 fichiers, faire les 6 plus impactants

**Agent "donnees-dynamiques" (5 fichiers) :**
- P4.4 GarantieDepotForm (devises)
- P4.5 ChangeOperationForm (MOP)
- P4.6 TransactionForm + BilateraleDialog (comptes)
- P4.13 SessionFermeturePage (devises mock)
- Tests pour les modifications

**Agent "login-sidebar" (4 fichiers) :**
- P4.7 LoginPage reelle (App.tsx)
- P4.10 Sidebar complete
- P4.8 ErrorBoundary : ajouter dans 3-4 pages critiques
- Tests

**Agent "store-fixes" (5 fichiers) :**
- P4.11 changeStore error clear
- P4.12 factureStore mock fix
- P4.9 Dashboard double-load
- P4.3 Dialog state reset (VRLIdentityDialog, ForfaitDialog)
- Tests

### Wave 2 (parallele)

**Agent "tests-e2e" (3 fichiers) :**
- P4.14 Test workflow complet
- P4.16 Audit couverture stores (ajouter tests manquants)
- P4.19 Verifier messages Zod

**Agent "a11y-polish" (4 fichiers) :**
- P4.17 Aria labels
- P4.18 Keyboard navigation / focus trap
- P4.2 Input/textarea natifs restants
- P4.15 Stories Storybook (optionnel)

## VERIFICATION POST-PHASE (FINALE)

```bash
pnpm tsc --noEmit    # 0 erreurs TypeScript
pnpm build           # build reussi, taille < 2MB
pnpm test            # TOUS les tests passent
pnpm lint            # 0 warnings
```

### Audit final de completude

Apres Phase 4, re-executer l'audit fonctionnel complet (4 agents paralleles)
pour verifier la couverture finale. Objectif : >95% couverture regles frontend.

## FICHIERS DE REFERENCE

- Design system : `src/components/ui/Select.tsx`, `Input.tsx`, `Dialog.tsx`
- Sidebar : `src/components/layout/Sidebar.tsx`
- Login : `src/App.tsx` (LoginPage inline)
- Stores : `src/stores/*.ts`
- KB erreurs : `docs/migration-kb.md`
- Rapport audit : `docs/RAPPORT_AUDIT_FONCTIONNEL_2026-02-10.md`

Lance la creation de l'equipe SWARM avec 6 agents selon la repartition ci-dessus.
Active le delegate mode. Commence par Wave 1 (4 agents paralleles).
```

</details>

---

## TEMPLATE GENERIQUE : Migration Legacy vers Web

Ce template est adaptable a tout projet de migration legacy (Magic, Delphi, VB6,
WinForms, COBOL, etc.) vers une application web moderne.

<details>
<summary><strong>TEMPLATE - Cliquer pour copier et adapter</strong></summary>

```
Tu es le lead orchestrateur d'une equipe SWARM pour la Phase [N] de completude
fonctionnelle du projet [NOM_PROJET] (migration [TECHNO_LEGACY] vers [TECHNO_WEB]).

## CONTEXTE PROJET

- **Stack** : [Framework UI] + [Build tool] + [Langage] + [CSS] + [State] + [Grilles] + [Validation]
- **Dossier** : [CHEMIN_ABSOLU]
- **Port dev** : [PORT], proxy /api -> :[PORT_BACKEND] (backend [TECHNO_BACKEND])
- **Etat actuel** :
  - Phase(s) precedente(s) terminee(s) : [LISTE]
  - Couverture fonctionnelle : ~[XX]%
  - [Decrire brievement ce qui est deja implementee]
- **Objectif Phase [N]** : Implementer [THEMES] pour atteindre ~[YY]%

## THEMES A IMPLEMENTER

### Theme [A] : [NOM_THEME] ([REF_SPEC])

Actuellement [XX]% couverture. [Description du gap principal].

| ID | Tache | Fichiers a creer/modifier | Priorite |
|----|-------|---------------------------|----------|
| T[A].1 | [Description] | [Fichiers] | P[0-3] |
| T[A].2 | [Description] | [Fichiers] | P[0-3] |
| ... | ... | ... | ... |

### Theme [B] : [NOM_THEME] ([REF_SPEC])

[Repeter pour chaque theme]

## REGLES SWARM OBLIGATOIRES

1. **Ownership strict** : 1 agent = fichiers dedies, ZERO conflit
2. **5-6 fichiers max par agent** (pas plus de 10 incluant tests)
3. **Vagues sequentielles** : Wave 1 (fondations) bloque Wave 2 (UI)
4. **Contexte Wave 2** : injecter les types crees par Wave 1 dans le prompt
5. **Shutdown progressif** : liberer agents termines
6. **[CONTRAINTE_SPECIFIQUE_STACK_1]** : [detail]
7. **[CONTRAINTE_SPECIFIQUE_STACK_2]** : [detail]
8. **Composants = props only** : jamais d'import service/API dans components/
9. **Tests** : [PATTERN_TEST_SPECIFIQUE]
10. **[CONTRAINTE_SPECIFIQUE_ENV]** : [detail]

## REPARTITION SWARM PROPOSEE

### Wave 1 (parallele - fondations)

**Agent "[ROLE_1]" ([N] fichiers) :**
- [Liste fichiers avec responsabilite]

**Agent "[ROLE_2]" ([N] fichiers) :**
- [Liste fichiers avec responsabilite]

### Wave 2 (parallele - UI)

**Agent "[ROLE_3]" ([N] fichiers) :**
- [Liste fichiers avec responsabilite]

**Agent "[ROLE_4]" ([N] fichiers) :**
- [Liste fichiers avec responsabilite]

### Wave 3 (sequentiel - wiring)

**Agent "[ROLE_5]" :**
- Integration routes/menu
- Wire composants dans pages
- Verification finale

## VERIFICATION POST-PHASE

```bash
[COMMANDE_TYPECHECK]    # 0 erreurs
[COMMANDE_BUILD]        # build reussi
[COMMANDE_TEST]         # tous tests passent
[COMMANDE_LINT]         # 0 warnings
```

Objectif : ~[YY]% couverture fonctionnelle.

## FICHIERS DE REFERENCE (patterns existants)

- [Pattern 1] : `[chemin_fichier_reference]`
- [Pattern 2] : `[chemin_fichier_reference]`
- [Pattern N] : `[chemin_fichier_reference]`

## LECONS APPRISES (a adapter a votre projet)

| ID | Lecon | Impact |
|----|-------|--------|
| L1 | [Contrainte specifique de votre env] | [Consequence si ignore] |
| L2 | [Pattern obligatoire] | [Consequence si ignore] |
| ... | ... | ... |

## ANTI-PATTERNS A EVITER

| Interdit | Alternative |
|----------|-------------|
| 2 agents sur le meme fichier | Ownership strict par fichier |
| Import service/API dans composant | Props-driven, API dans page/store |
| Wave 2 sans attendre Wave 1 | Dependances strictes entre waves |
| Agent avec > 10 fichiers | Decouper en 2 agents |
| Pas de verification post-phase | tsc + build + test systematique |
| Enum natif TypeScript (si erasableSyntaxOnly) | as const + type union |
| <a href> au lieu de <Link> (React) | React Router Link |
| Store sans mock fallback | Dual-mode mock/API obligatoire |

Lance la creation de l'equipe SWARM avec [N] agents selon la repartition ci-dessus.
Active le delegate mode. Commence par Wave 1 ([N] agents paralleles).
```

</details>

---

## Annexe : Checklist de lancement par phase

Avant de lancer chaque phase, verifier :

- [ ] `pnpm tsc --noEmit` passe (0 erreurs)
- [ ] `pnpm build` reussi
- [ ] `pnpm test` passe (tous les tests)
- [ ] Etat git propre (`git stash` si necessaire)
- [ ] MEMORY.md a jour avec l'etat courant
- [ ] Delegate mode active (`Shift+Tab`)
- [ ] Terminal tmux avec suffisamment de panes pour les agents

## Annexe : Metriques de progression

| Phase | Fichiers | Tests | Build | Couverture | Themes |
|:-----:|:--------:|:-----:|:-----:|:----------:|--------|
| Base (Lots 0-7) | 229 | 720 | 1128KB | ~50% | - |
| Phase 1 | ~265 | ~820 | ~1.3MB | ~65% | T1+T2 |
| Phase 2 | ~300 | ~920 | ~1.5MB | ~78% | T3+T4 |
| Phase 3 | ~350 | ~1050 | ~1.8MB | ~92% | T5+T6+T7+T8 |
| Phase 4 | ~375 | ~1100 | ~2.0MB | ~98% | Polish |

## Annexe : Observations d'amelioration (resume OBS-001 a OBS-018)

| Prio | ID | Probleme | Solution |
|------|----|----------|----------|
| HAUTE | OBS-001 | Agent timeout sur taches trop larges | Max 5-6 fichiers par agent |
| HAUTE | OBS-002 | Contexte insuffisant Wave 2 | Injecter types Wave 1 |
| HAUTE | OBS-005 | Import API dans composants | Regle lint: composants = props only |
| HAUTE | OBS-011 | Couverture test heterogene | Standard minimum par type fichier |
| HAUTE | OBS-013 | Pas de template prompt SWARM | CE DOCUMENT |
| HAUTE | OBS-014 | Audit post-lot pas systematise | tsc+build+test apres chaque phase |
| MOY | OBS-003 | Pas de retry automatique | Wrapper SWARM avec retry |
| MOY | OBS-006 | Mock fallback non standardise | Utility withMockFallback centralisee |
| MOY | OBS-008 | Pas d'ErrorBoundary par section | Phase 4 P4.8 |
| MOY | OBS-015 | Rapport adhoc | Template rapport migration |
| MOY | OBS-018 | Specs OpenSpec pas MAJ | MAJ systematique post-lot |
| BASSE | OBS-004 | Shutdown non automatise | Manuel OK |
| BASSE | OBS-007 | ESC/POS reste stub | WebUSB quand materiel dispo |
| BASSE | OBS-010 | Pas de Storybook stories | Phase 4 P4.15 |
| BASSE | OBS-016 | Pas de tracking temps agents | Logger timestamps |
| BASSE | OBS-017 | KB migration trop longue | Decouper en sections |
