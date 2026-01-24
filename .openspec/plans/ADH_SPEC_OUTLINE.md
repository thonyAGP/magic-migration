# Cahier des Charges de Conception - Projet ADH
## Magic Unipaas → Migration Moderne

**Version**: 1.0 DRAFT
**Estimation**: ~100 pages
**Source**: Knowledge Base SQLite + Analyse XML

---

## PARTIE 1 : VUE D'ENSEMBLE (15 pages)

### 1.1 Introduction (3 pages)
- Contexte du projet ADH (Adherents/Caisse)
- Objectifs de la documentation
- Méthodologie d'analyse (KB + XML parsing)
- Conventions de ce document

### 1.2 Architecture Globale (6 pages)
- Diagramme des 28 dossiers ADH
- Structure hiérarchique des 350 programmes
- Dépendances vers REF.ecf (tables partagées)
- Dépendances vers ADH.ecf (30 programmes partagés)
- Schéma d'architecture haut niveau (Mermaid)

### 1.3 Statistiques du Projet (6 pages)
- Répartition programmes par dossier
- Complexité moyenne (tâches/programme, lignes/tâche)
- Tables les plus utilisées (TOP 20)
- Programmes les plus appelés (TOP 20)
- Métriques de couplage

---

## PARTIE 2 : MODULES FONCTIONNELS (35 pages)

### 2.1 Gestion de Caisse (10 pages)
**Source**: ADH IDE 121-135, 162, 294

- Flux principal : Main → Menu → Caisse
- Sous-modules :
  - Ouverture session (ADH IDE 122, 294)
  - Gestion coffre (ADH IDE 163, 197, 233-235)
  - Fermeture session (ADH IDE 131)
- Diagramme de séquence
- Tables impliquées : caisse_session, caisse_session_detail, caisse_parametres
- Améliorations proposées

### 2.2 Ventes et Gift Pass (6 pages)
**Source**: ADH IDE 229-250

- Gift Pass (ADH IDE 237)
- Resort Credit (ADH IDE 250)
- Historique ventes (ADH IDE 238)
- Tables : ccventes, ccpartyp, resort_credit
- Diagramme de flux
- Simplifications possibles

### 2.3 Extrait de Compte (5 pages)
**Source**: ADH IDE 69-76

- EXTRAIT_COMPTE (ADH IDE 69)
- Variantes : par nom, date, cumul, service
- Tables : operations_dat, cafil048_dat
- Diagramme de données
- Points d'amélioration

### 2.4 Garanties et Dépôts (4 pages)
**Source**: ADH IDE 111-114

- Gestion garanties (ADH IDE 111)
- Tables : depot_garantie, cafil069_dat
- Workflow dépôt/retrait
- Recommandations

### 2.5 Change et Devises (4 pages)
**Source**: ADH IDE 20-25

- Calcul équivalent devise
- Tables : taux_change, cafil028_dat
- Logique UNI/BI directionnelle
- Simplifications

### 2.6 Téléphone (3 pages)
**Source**: ADH IDE 202-220

- Open/Close lignes
- Table : pi_dat
- États : O/F/B
- Modernisation proposée

### 2.7 Easy Check-Out (3 pages)
**Source**: ADH IDE 53-67

- Workflow ECO
- 3 sous-fonctions : solde, edition, extrait
- Intégration avec facturation

---

## PARTIE 3 : MODÈLE DE DONNÉES (20 pages)

### 3.1 Tables Principales (10 pages)
Pour chaque table majeure :
- Nom logique / physique / public
- Colonnes avec types
- Clés primaires / étrangères
- Programmes qui l'utilisent (READ/WRITE/MODIFY/DELETE)
- Volumes estimés

**Tables couvertes** :
1. caisse_session
2. caisse_session_detail
3. operations_dat
4. cafil048_dat (services)
5. ccventes
6. ccpartyp
7. depot_garantie
8. taux_change
9. pi_dat
10. ezcard

### 3.2 Diagramme Entité-Relation (5 pages)
- ERD complet ADH (Mermaid)
- Relations entre tables
- Cardinalités

### 3.3 Dictionnaire de Données (5 pages)
- Liste alphabétique des champs critiques
- Type, format, contraintes
- Usage dans les programmes

---

## PARTIE 4 : CALL GRAPH ET DÉPENDANCES (15 pages)

### 4.1 Graphe d'Appels Global (5 pages)
- Diagramme des appels entre programmes (simplifié)
- Identification des hubs (programmes les plus appelés)
- Identification des feuilles (programmes terminaux)
- Cycles détectés

### 4.2 Matrices de Dépendances (5 pages)
- Matrice programme × programme
- Matrice programme × table
- Matrice table × programme (inverse)
- Identification des couplages forts

### 4.3 Points d'Entrée (5 pages)
- MainProgram (ADH IDE 1)
- Programmes appelés depuis ECF externe
- Programmes batch/planifiés
- API publiques

---

## PARTIE 5 : ANALYSE ET RECOMMANDATIONS (15 pages)

### 5.1 Code Mort et Obsolète (5 pages)
- Programmes jamais appelés
- Tâches désactivées (Disabled=1)
- Expressions mortes (non référencées)
- Recommandation de nettoyage

### 5.2 Complexité et Refactoring (5 pages)
- Programmes trop longs (> 20 tâches)
- Tâches trop complexes (> 100 lignes logique)
- Duplication de code détectée
- Propositions de factorisation

### 5.3 Modernisation (5 pages)
- Patterns obsolètes Magic → équivalents modernes
- Variables globales → injection de dépendances
- Procédures stockées → ORM
- Forms MDI → SPA moderne
- Roadmap de migration recommandée

---

## ANNEXES

### A. Glossaire Magic (2 pages)
### B. Liste complète des 350 programmes ADH (5 pages)
### C. Scripts SQL de migration (référence)
### D. Mapping expressions Magic → C#/TypeScript

---

## GÉNÉRATION AUTOMATIQUE

Ce document sera généré par :

1. **Indexation KB** : `magic_kb_reindex` pour peupler SQLite
2. **Requêtes KB** :
   - `magic_kb_stats` pour statistiques
   - `magic_kb_table_usage` pour chaque table
   - `magic_kb_callers/callees` pour call graph
   - `magic_kb_search` pour recherches textuelles
3. **Parsing XML** : Pour détails non indexés
4. **Génération Mermaid** : Diagrammes automatiques
5. **Assemblage** : Script PowerShell final

---

## PRÉREQUIS

1. ✅ Knowledge Base implémentée (5 phases)
2. ⏳ Indexation initiale (~60 secondes)
3. ⏳ Génération document (~30 minutes avec validation)

---

*Document généré automatiquement depuis Magic Knowledge Base*
*Projet Lecteur_Magic - Migration ADH*
