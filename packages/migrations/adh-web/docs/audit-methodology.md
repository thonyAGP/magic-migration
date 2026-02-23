# Methodologie Audit Migration Magic → React

> Document permanent. A consulter avant chaque audit et integration backend.

## Quand lancer un audit

| Moment | Type | Objectif |
|--------|------|----------|
| Apres chaque lot | Quick audit | Verifier wiring lot |
| Avant integration backend | Full audit | Valider mock/API toggle |
| Avant mise en production | Final audit | Zero regression |

## Checklist par composant

Pour chaque composant interactif, verifier :

- [ ] **Inputs** : `value` + `onChange` wires a un state ou store
- [ ] **Selects/Combobox** : options chargees depuis store ou props
- [ ] **Boutons** : handlers presents et actifs (`onClick`)
- [ ] **Submit** : appelle une action du store (pas d'import API direct)
- [ ] **Store toggle** : `isRealApi` verifie dans chaque action async
- [ ] **Mock data** : realiste, couvrant les cas nominaux
- [ ] **Loading** : indicateur visible (`isLoading`, spinner, disabled)
- [ ] **Error** : message affiche, store.error consomme
- [ ] **Validation Zod** : schema present + messages FR
- [ ] **Navigation** : `<Link>` React Router (jamais `<a href>`)

## Checklist par page

Pour chaque page, verifier :

- [ ] **Route** : declaree dans App.tsx avec ProtectedRoute
- [ ] **Sidebar** : item present avec icone et label
- [ ] **Store** : importe depuis `@/stores`, pas d'import API direct
- [ ] **useEffect/init** : charge les donnees au montage si necessaire
- [ ] **Cleanup** : reset store au unmount si pertinent
- [ ] **URL params** : extraits via useParams si applicable
- [ ] **Retour menu** : bouton/lien vers /caisse/menu

## Checklist par store

Pour chaque store Zustand async, verifier :

- [ ] **import dataSourceStore** : `useDataSourceStore.getState()`
- [ ] **branch mock** : `if (!isRealApi)` avec mock data
- [ ] **branch API** : `try/catch` autour de l'appel API
- [ ] **loading state** : `set({ isLoading: true })` avant, `false` apres
- [ ] **error state** : `set({ error: message })` dans catch
- [ ] **reset** : fonction reset() remet l'initial state
- [ ] **types** : State + Actions interfaces separees

## Capitalisation des erreurs

Pour chaque erreur trouvee, documenter dans `migration-kb.md` :

| Champ | Description |
|-------|-------------|
| # | Identifiant unique (A1, N2, F3...) |
| Erreur | Description concise |
| Fichier | Fichier source concerne |
| Impact | Consequence pour l'utilisateur |
| Cause racine | Pourquoi l'erreur s'est produite |
| Prevention | Regle/checklist pour eviter a l'avenir |

## Categories d'erreurs

| Prefixe | Categorie |
|---------|-----------|
| A | Architecture / Patterns |
| N | Navigation / Routing |
| F | Formulaires / Saisie |
| M | Mock Data |
| T | Types / Schemas |
| L | Loading / Error States |

## Lessons Learned (Audit 2026-02-10)

### Patterns d'erreurs les plus frequents

| Pattern | Frequence | Impact | Prevention |
|---------|-----------|--------|------------|
| Composant importe API directement | 4 composants (A2,A3,A8,A9) | Bypass mock/API toggle | Regle SWARM: composants ne doivent JAMAIS importer depuis `services/api/` |
| Props mismatch page ↔ composant | 2 pages (A10,A11) | Composant ne recoit pas les bonnes props | Verifier types.ts du composant AVANT de wirer dans la page |
| Action store manquante | 2 cas (A5 noop, A6 no loadConfig) | Feature silencieusement cassee | Checklist post-lot: chaque page doit appeler au moins 1 action store |
| Native `<select>` au lieu de design system | 9 composants (F1-F10) | Incoherence UX | Grep `<select` dans les sources apres chaque lot |
| Donnees hardcodees dans composant | 3 cas (F4,F5,F11) | Non synchronise avec backend | Donnees dynamiques doivent venir du store |

### Recommandations pour les prochains lots

1. **Template SWARM enrichi** : Ajouter un check "composant n'importe rien de `services/api/`" dans les instructions agents
2. **Grep automatique post-build** : `grep -r "from.*services/api" src/components/` doit retourner vide
3. **Props contract** : Lire `types.ts` du composant cible AVANT d'ecrire le wiring dans la page
4. **Store completeness** : Chaque page doit avoir au minimum : loadData au mount, error display, loading indicator
5. **Design system enforcement** : Zero tolerance pour `<select>`, `<input>`, `<textarea>` natifs dans les composants

### Metriques audit

| Metrique | Lots 0-2 | Lots 3-4 | Lots 5-7 | Total |
|----------|----------|----------|----------|-------|
| Fichiers audites | 30 | 30 | 42 | 102 |
| PASS | 103 | 105 | 128 | 336 |
| FAIL | 13 | 14 | 16 | 43 |
| Critiques | 3 | 2 | 4 | 9 |
| Moyens | 6 | 4 | 5 | 15 |
| Mineurs | 4 | 8 | 7 | 19 |

## Integration workflow

1. Ce fichier est consulte au debut de chaque session migration
2. La KB (`migration-kb.md`) est enrichie a chaque audit
3. Les regles de prevention sont integrees dans les templates SWARM
4. Les checks deviennent des regles de lint custom si recurrents
