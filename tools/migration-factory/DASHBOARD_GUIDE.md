# SPECMAP Migration Dashboard - Guide Utilisateur

## Demarrage

```bash
# Depuis la racine du projet
cd D:\Projects\Lecteur_Magic
npx tsx tools/migration-factory/src/cli.ts serve --port 3070

# Ouvrir http://localhost:3070
```

Le badge **CONNECTED** (vert) confirme que le serveur est actif.

---

## Vue d'ensemble

Le dashboard comporte 2 onglets :
- **Vue Globale** : statistiques multi-projets (29 projets)
- **ADH** (ou autre projet actif) : actions de migration

### Barre d'actions (onglet projet)

```
[CONNECTED] [Batch ▼] [Preflight] [Run Pipeline] [Verify] [Gaps] [Calibrate] [Generate Code] [Heuristic ▼] [ ] Dry Run
```

---

## Workflow de migration complet

Le processus de migration d'un module suit **5 etapes sequentielles** :

```
Etape 1: Preflight     → Valide que le batch est pret
Etape 2: Run Pipeline   → Execute le pipeline SPECMAP (extraction, mapping, contrats)
Etape 3: Verify         → Verifie les contrats generes
Etape 4: Gaps           → Identifie les lacunes restantes
Etape 5: Generate Code  → Genere le code React/TypeScript
```

### Estimation de temps par etape

| Etape | Duree estimee (B1 = 8 progs) | Duree estimee (batch ~25 progs) |
|-------|------------------------------|----------------------------------|
| Preflight | < 2 secondes | < 5 secondes |
| Run Pipeline | 30s - 2 min | 2 - 10 min |
| Verify | < 5 secondes | < 10 secondes |
| Gaps | < 2 secondes | < 5 secondes |
| Generate Code (heuristic) | < 10 secondes | < 30 secondes |
| Generate Code (Claude API) | ~5s/prog = 40s | ~5s/prog = 2 min |
| Generate Code (Claude CLI) | ~10s/prog = 80s | ~10s/prog = 4 min |

---

## Boutons - Detail de chaque action

### 1. Selection du batch

**Dropdown "Select batch..."** - Obligatoire avant toute action.

Liste les batches configures avec leur avancement :
```
B1 - Ouverture Session (8 progs, 8/8 verified)
```

### 2. Preflight

**Quoi** : Verifie que le batch selectionne est pret a etre traite.

**Quand l'utiliser** : Avant "Run Pipeline" pour la premiere fois.

**Ce qui se passe** :
1. Clic sur le bouton
2. Le panneau d'actions s'ouvre
3. Affiche les checks de pre-requis (contrats presents, gaps acceptables)
4. Liste les programmes du batch avec leur statut

**Resultat attendu** : Un resume avec nombre de programmes prets vs non prets.

**Duree** : Instantane (< 2s)

---

### 3. Run Pipeline

**Quoi** : Execute le pipeline complet SPECMAP pour chaque programme du batch.

```
EXTRACT → MAP → GAP → CONTRACT → ENRICH → VERIFY
```

**Quand l'utiliser** : Pour traiter un batch pour la premiere fois (statut pending → verified).

**Ce qui se passe** :
1. Clic sur le bouton
2. Le panneau d'actions s'ouvre avec une **barre de progression**
3. Affiche en temps reel (SSE streaming) chaque programme traite
4. A la fin : resume avec compteurs (verified, contracted, errors)
5. La page se recharge automatiquement apres 2 secondes

**Resultat attendu** : Les programmes passent de `pending` a `contracted` puis `verified`.

**Duree** : 30s a 10 min selon la taille du batch.

**Options** :
- **Dry Run** : cocher pour simuler sans modifier les fichiers
- **Enrich** : choisir le mode d'enrichissement des contrats

---

### 4. Verify

**Quoi** : Verifie automatiquement tous les contrats en statut IMPL → VERIFIED.

**Quand l'utiliser** : Apres avoir rempli manuellement les contrats ou apres un pipeline.

**Ce qui se passe** :
1. Clic sur le bouton
2. Parcourt tous les contrats du batch
3. Verifie que chaque item est IMPL ou N/A
4. Passe les contrats valides en statut VERIFIED

**Resultat attendu** : Nombre de contrats verifies / non prets / deja verifies.

**Duree** : Instantane (< 5s)

---

### 5. Gaps

**Quoi** : Genere un rapport des lacunes restantes dans les contrats.

**Quand l'utiliser** : Pour voir ce qu'il reste a implementer apres un pipeline.

**Ce qui se passe** :
1. Clic sur le bouton
2. Analyse tous les contrats du repertoire
3. Affiche par contrat : items MISSING, PARTIAL, pourcentage completion

**Resultat attendu** : Tableau detaille des gaps par programme.

**Duree** : Instantane (< 2s)

---

### 6. Calibrate

**Quoi** : Recalibre le modele d'estimation (heures/point) a partir des contrats verifies.

**Quand l'utiliser** : Apres avoir termine un batch (tous contrats verified).

**Ce qui se passe** :
1. Clic sur le bouton
2. Calcule le ratio heures/point reel vs estime
3. Met a jour le modele de calibration

**Resultat attendu** : Ancien h/pt → Nouveau h/pt, precision en %.

**Duree** : Instantane (< 1s)

---

### 7. Generate Code

**Quoi** : Genere des scaffolds React/TypeScript a partir des contrats verifies.

**Quand l'utiliser** : Apres que tous les contrats du batch soient VERIFIED.

**Ce qui se passe** :
1. Clic sur le bouton
2. **Popup** demande le repertoire de sortie (ex: `D:/Temp/codegen-v9`)
3. Le panneau d'actions s'ouvre avec progression SSE
4. Affiche en temps reel chaque programme genere avec le nombre de fichiers
5. A la fin : resume total (fichiers ecrits, skipped)

**5 fichiers generes par programme** :
| Fichier | Contenu |
|---------|---------|
| `types/{domain}.ts` | Interfaces TypeScript (State, Entities, Actions) |
| `stores/{domain}Store.ts` | Store Zustand avec actions et initial state |
| `pages/{Domain}Page.tsx` | Page React avec layout et handlers |
| `services/api/{domain}Api.ts` | Service API avec endpoints |
| `__tests__/{domain}Store.test.ts` | Tests Vitest pour le store |

**Resultat attendu** : N programmes × 5 fichiers = total fichiers ecrits.

**Duree** : 5-30s (heuristic) ou 1-5 min (Claude).

---

### Options communes

#### Mode Dry Run (checkbox)

Quand coche, les operations sont simulees :
- **Pipeline** : calcule mais ne modifie pas les fichiers tracker
- **Verify** : compte les changements sans les appliquer
- **Calibrate** : calcule sans sauvegarder
- **Generate** : calcule sans ecrire les fichiers

#### Mode Enrichissement (dropdown)

| Mode | Description | Cout | Quand l'utiliser |
|------|-------------|------|------------------|
| **No enrich** | Scaffolds bruts (types `unknown`, pas de defaults) | $0 | Tests rapides |
| **Heuristic** | Inference deterministe depuis les noms de variables | $0 | **Recommande** - bon ratio qualite/cout |
| **Claude API** | IA via API Anthropic (necessite ANTHROPIC_API_KEY) | ~$0.03/prog | Enrichissement maximal, CI/CD |
| **Claude CLI** | IA via `claude` CLI locale | $0 (abonnement) | Enrichissement local, pas de cle API |

---

## Diagramme de flux

```
                    ┌─────────────┐
                    │ Select Batch │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Preflight  │ ← Verifier pre-requis
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Run Pipeline│ ← Pipeline SPECMAP complet
                    │  (streaming)│   EXTRACT→MAP→GAP→CONTRACT
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Verify    │ ← IMPL items → VERIFIED
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐    │     ┌──────▼──────┐
       │    Gaps     │    │     │  Calibrate  │
       │ (optionnel) │    │     │ (optionnel) │
       └─────────────┘    │     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │Generate Code│ ← Scaffolds React/TS
                    │  (streaming)│   + enrichissement
                    └─────────────┘
```

---

## Depannage

| Probleme | Cause | Solution |
|----------|-------|----------|
| Badge "OFFLINE" | Serveur non demarre | Lancer `npx tsx ... serve` |
| Boutons gris/desactives | Pas de connexion serveur | Verifier le serveur |
| "No batch selected" | Dropdown vide | Verifier que le tracker.json existe |
| Port 3070 deja utilise | Processus precedent actif | `Stop-Process` ou changer le port |
| Pas de contrats | Repertoire migration vide | Lancer le pipeline d'abord |
| Generate trop rapide | Mode dry-run actif | Decocher "Dry Run" |
